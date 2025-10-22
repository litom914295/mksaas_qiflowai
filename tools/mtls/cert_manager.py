#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
mTLS 证书管理与监控工具
- 生成根CA与签发服务/客户端证书
- 证书到期检查与Prometheus指标导出
- 证书轮换（可选更新Kubernetes Secret）

依赖：cryptography, prometheus-client, kubernetes
"""
import argparse
import base64
import datetime as dt
import os
import sys
import time
from typing import List, Optional, Tuple

from cryptography import x509
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import rsa
from cryptography.x509.oid import NameOID, ExtendedKeyUsageOID

try:
    from prometheus_client import Gauge, Counter, start_http_server
except Exception:  # pragma: no cover
    Gauge = Counter = start_http_server = None  # type: ignore

# 可选：Kubernetes API
try:
    from kubernetes import client as k8s_client, config as k8s_config
except Exception:  # pragma: no cover
    k8s_client = k8s_config = None  # type: ignore

X509_EXPIRES = None
ROTATION_FAILS = None


def _now_utc() -> dt.datetime:
    return dt.datetime.utcnow().replace(tzinfo=dt.timezone.utc)


def load_or_create_ca(ca_key_path: str, ca_cert_path: str, days: int = 3650) -> Tuple[bytes, bytes]:
    if os.path.exists(ca_key_path) and os.path.exists(ca_cert_path):
        with open(ca_key_path, 'rb') as f:
            key_pem = f.read()
        with open(ca_cert_path, 'rb') as f:
            cert_pem = f.read()
        return key_pem, cert_pem

    # 生成新的CA
    key = rsa.generate_private_key(public_exponent=65537, key_size=4096)
    subject = issuer = x509.Name([
        x509.NameAttribute(NameOID.COUNTRY_NAME, u"CN"),
        x509.NameAttribute(NameOID.ORGANIZATION_NAME, u"mksaas-ca"),
        x509.NameAttribute(NameOID.COMMON_NAME, u"mksaas Root CA"),
    ])
    cert = (
        x509.CertificateBuilder()
        .subject_name(subject)
        .issuer_name(issuer)
        .public_key(key.public_key())
        .serial_number(x509.random_serial_number())
        .not_valid_before(_now_utc() - dt.timedelta(minutes=5))
        .not_valid_after(_now_utc() + dt.timedelta(days=days))
        .add_extension(x509.BasicConstraints(ca=True, path_length=None), critical=True)
        .add_extension(x509.KeyUsage(digital_signature=True, key_cert_sign=True, key_encipherment=True,
                                     content_commitment=False, data_encipherment=False, key_agreement=True,
                                     encipher_only=False, decipher_only=False, crl_sign=True), critical=True)
        .sign(key, hashes.SHA256())
    )

    key_pem = key.private_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PrivateFormat.TraditionalOpenSSL,
        encryption_algorithm=serialization.NoEncryption(),
    )
    cert_pem = cert.public_bytes(serialization.Encoding.PEM)

    os.makedirs(os.path.dirname(ca_key_path) or '.', exist_ok=True)
    with open(ca_key_path, 'wb') as f:
        f.write(key_pem)
    with open(ca_cert_path, 'wb') as f:
        f.write(cert_pem)

    return key_pem, cert_pem


def issue_cert(
    ca_key_pem: bytes,
    ca_cert_pem: bytes,
    cn: str,
    san_dns: Optional[List[str]] = None,
    is_client: bool = False,
    days: int = 365,
) -> Tuple[bytes, bytes]:
    ca_key = serialization.load_pem_private_key(ca_key_pem, password=None)
    ca_cert = x509.load_pem_x509_certificate(ca_cert_pem)

    key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
    name = x509.Name([x509.NameAttribute(NameOID.COMMON_NAME, cn)])
    builder = (
        x509.CertificateBuilder()
        .subject_name(name)
        .issuer_name(ca_cert.subject)
        .public_key(key.public_key())
        .serial_number(x509.random_serial_number())
        .not_valid_before(_now_utc() - dt.timedelta(minutes=5))
        .not_valid_after(_now_utc() + dt.timedelta(days=days))
        .add_extension(x509.BasicConstraints(ca=False, path_length=None), critical=True)
        .add_extension(
            x509.KeyUsage(
                digital_signature=True,
                key_encipherment=True,
                key_cert_sign=False,
                content_commitment=False,
                data_encipherment=False,
                key_agreement=True,
                encipher_only=False,
                decipher_only=False,
                crl_sign=False,
            ),
            critical=True,
        )
    )

    eku = [ExtendedKeyUsageOID.CLIENT_AUTH] if is_client else [ExtendedKeyUsageOID.SERVER_AUTH]
    builder = builder.add_extension(x509.ExtendedKeyUsage(eku), critical=False)

    if san_dns:
        builder = builder.add_extension(
            x509.SubjectAlternativeName([x509.DNSName(x) for x in san_dns]),
            critical=False,
        )

    cert = builder.sign(private_key=serialization.load_pem_private_key(ca_key_pem, password=None), algorithm=hashes.SHA256())

    key_pem = key.private_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PrivateFormat.TraditionalOpenSSL,
        encryption_algorithm=serialization.NoEncryption(),
    )
    cert_pem = cert.public_bytes(serialization.Encoding.PEM)
    return key_pem, cert_pem


def parse_not_after_seconds(cert_pem: bytes) -> float:
    cert = x509.load_pem_x509_certificate(cert_pem)
    delta = cert.not_valid_after.replace(tzinfo=dt.timezone.utc) - _now_utc()
    return max(0.0, delta.total_seconds())


# --- Kubernetes helpers ---

def k8s_init():  # pragma: no cover
    global k8s_client, k8s_config
    if k8s_config is None:
        raise RuntimeError('kubernetes dependency is not available')
    try:
        k8s_config.load_incluster_config()
    except Exception:
        k8s_config.load_kube_config()
    return k8s_client.CoreV1Api()


def k8s_get_tls_crt(api, namespace: str, secret_name: str) -> Optional[bytes]:  # pragma: no cover
    sec = api.read_namespaced_secret(secret_name, namespace)
    if not sec or not sec.data or 'tls.crt' not in sec.data:
        return None
    return base64.b64decode(sec.data['tls.crt'])


def k8s_update_tls_secret(api, namespace: str, secret_name: str, tls_crt_pem: bytes, tls_key_pem: bytes):  # pragma: no cover
    b64_crt = base64.b64encode(tls_crt_pem).decode('ascii')
    b64_key = base64.b64encode(tls_key_pem).decode('ascii')
    body = {
        'data': {
            'tls.crt': b64_crt,
            'tls.key': b64_key,
        }
    }
    api.patch_namespaced_secret(name=secret_name, namespace=namespace, body=body)


# --- Exporter ---

def run_exporter(port: int, files: List[str], k8s_targets: List[str]):  # pragma: no cover
    global X509_EXPIRES, ROTATION_FAILS
    if Gauge is None:
        print('prometheus_client 未安装，无法启动exporter', file=sys.stderr)
        sys.exit(2)

    X509_EXPIRES = Gauge('x509_cert_expires_in_seconds', 'Seconds until X509 certificate expiration', ['name', 'source'])
    ROTATION_FAILS = Counter('mtls_cert_rotation_failures_total', 'Total certificate rotation failures')

    api = None
    if k8s_targets:
        api = k8s_init()

    def tick():
        # file targets
        for p in files:
            try:
                with open(p, 'rb') as f:
                    crt = f.read()
                left = parse_not_after_seconds(crt)
                X509_EXPIRES.labels(name=os.path.basename(p), source='file').set(left)
            except Exception as e:
                # 将过期设为0暴露问题
                X509_EXPIRES.labels(name=os.path.basename(p), source='file').set(0)
        # k8s targets ns/name
        for item in k8s_targets:
            try:
                ns, name = item.split('/', 1)
                crt = k8s_get_tls_crt(api, ns, name)
                if crt:
                    left = parse_not_after_seconds(crt)
                    X509_EXPIRES.labels(name=f'{ns}/{name}', source='k8s').set(left)
                else:
                    X509_EXPIRES.labels(name=f'{ns}/{name}', source='k8s').set(0)
            except Exception:
                X509_EXPIRES.labels(name=item, source='k8s').set(0)

    start_http_server(port)
    while True:
        tick()
        time.sleep(30)


# --- CLI ---

def main():
    parser = argparse.ArgumentParser(description='mTLS 证书管理工具')
    sub = parser.add_subparsers(dest='cmd', required=True)

    p_init = sub.add_parser('init-ca')
    p_init.add_argument('--ca-key', default='secrets/ca/ca.key')
    p_init.add_argument('--ca-crt', default='secrets/ca/ca.crt')
    p_init.add_argument('--days', type=int, default=3650)

    p_issue = sub.add_parser('issue')
    p_issue.add_argument('--ca-key', default='secrets/ca/ca.key')
    p_issue.add_argument('--ca-crt', default='secrets/ca/ca.crt')
    p_issue.add_argument('--cn', required=True)
    p_issue.add_argument('--san', action='append', default=[])
    p_issue.add_argument('--client', action='store_true')
    p_issue.add_argument('--days', type=int, default=365)
    p_issue.add_argument('--out-key', required=True)
    p_issue.add_argument('--out-crt', required=True)

    p_check = sub.add_parser('check')
    p_check.add_argument('--crt', required=True)

    p_export = sub.add_parser('exporter')
    p_export.add_argument('--port', type=int, default=9101)
    p_export.add_argument('--files', nargs='*', default=[])
    p_export.add_argument('--k8s-secrets', nargs='*', default=[], help='格式: ns/name')

    p_rotate = sub.add_parser('rotate')
    p_rotate.add_argument('--ca-key', default='secrets/ca/ca.key')
    p_rotate.add_argument('--ca-crt', default='secrets/ca/ca.crt')
    p_rotate.add_argument('--cn', required=True)
    p_rotate.add_argument('--san', action='append', default=[])
    p_rotate.add_argument('--client', action='store_true')
    p_rotate.add_argument('--days', type=int, default=365)
    p_rotate.add_argument('--threshold-days', type=int, default=14)
    # 本地输出或K8s Secret更新（二选一）
    p_rotate.add_argument('--out-key')
    p_rotate.add_argument('--out-crt')
    p_rotate.add_argument('--k8s-namespace')
    p_rotate.add_argument('--k8s-secret')

    args = parser.parse_args()

    if args.cmd == 'init-ca':
        load_or_create_ca(args.ca_key, args.ca_crt, args.days)
        print(f'CA 已初始化: {args.ca_key}, {args.ca_crt}')
        return

    if args.cmd == 'issue':
        ca_key_pem, ca_crt_pem = load_or_create_ca(args.ca_key, args.ca_crt)
        key_pem, crt_pem = issue_cert(ca_key_pem, ca_crt_pem, args.cn, args.san, args.client, args.days)
        os.makedirs(os.path.dirname(args.out_key) or '.', exist_ok=True)
        with open(args.out_key, 'wb') as f:
            f.write(key_pem)
        with open(args.out_crt, 'wb') as f:
            f.write(crt_pem)
        left = parse_not_after_seconds(crt_pem)
        print(f'已签发证书 CN={args.cn}, 剩余秒数={int(left)}')
        return

    if args.cmd == 'check':
        with open(args.crt, 'rb') as f:
            crt = f.read()
        left = parse_not_after_seconds(crt)
        print(int(left))
        return

    if args.cmd == 'exporter':  # pragma: no cover
        run_exporter(args.port, args.files, args.k8s_secrets)
        return

    if args.cmd == 'rotate':
        ca_key_pem, ca_crt_pem = load_or_create_ca(args.ca_key, args.ca_crt)
        # 读取现有证书（本地或K8s）以判断是否需要轮换
        current_crt_pem = None
        if args.out_crt and os.path.exists(args.out_crt):
            with open(args.out_crt, 'rb') as f:
                current_crt_pem = f.read()
        elif args.k8s_namespace and args.k8s_secret:
            if k8s_client is None:
                print('缺少kubernetes依赖，无法读取K8s Secret', file=sys.stderr)
            else:
                api = k8s_init()
                current_crt_pem = k8s_get_tls_crt(api, args.k8s_namespace, args.k8s_secret)
        else:
            print('未指定现有证书位置，跳过轮换判断，仅重新签发', file=sys.stderr)

        need_rotate = True
        if current_crt_pem:
            left = parse_not_after_seconds(current_crt_pem)
            need_rotate = left <= args.threshold_days * 86400

        if not need_rotate:
            print('证书剩余有效期充足，跳过轮换')
            return

        key_pem, crt_pem = issue_cert(ca_key_pem, ca_crt_pem, args.cn, args.san, args.client, args.days)

        if args.k8s_namespace and args.k8s_secret:
            if k8s_client is None:
                print('缺少kubernetes依赖，无法更新K8s Secret', file=sys.stderr)
                if ROTATION_FAILS:
                    ROTATION_FAILS.inc()
                sys.exit(1)
            api = k8s_init()
            k8s_update_tls_secret(api, args.k8s_namespace, args.k8s_secret, crt_pem, key_pem)
            print(f'已更新 K8s Secret {args.k8s_namespace}/{args.k8s_secret}')
        elif args.out_key and args.out_crt:
            os.makedirs(os.path.dirname(args.out_key) or '.', exist_ok=True)
            with open(args.out_key, 'wb') as f:
                f.write(key_pem)
            with open(args.out_crt, 'wb') as f:
                f.write(crt_pem)
            print(f'已写入本地证书 {args.out_crt}')
        else:
            print('未提供输出目标，证书已签发但未保存', file=sys.stderr)
        return


if __name__ == '__main__':
    main()
