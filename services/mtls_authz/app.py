from fastapi import FastAPI, Request, Response
from fastapi.responses import PlainTextResponse
import os
import time
import re
from typing import Set

app = FastAPI(title="mTLS AuthZ", version="1.0.0")

REVOKE_PATH = os.getenv("REVOKED_FILE", "/etc/mtls/revoked_serials.txt")
_last_load = 0.0
_cache: Set[str] = set()
_reload_interval = int(os.getenv("RELOAD_SECONDS", "30"))

_dn_cn = re.compile(r"CN=([^,]+)")

def _load():
    global _last_load, _cache
    now = time.time()
    if now - _last_load < _reload_interval:
        return
    try:
        with open(REVOKE_PATH, "r", encoding="utf-8") as f:
            _cache = {line.strip() for line in f if line.strip() and not line.startswith('#')}
    except Exception:
        _cache = set()
    _last_load = now

@app.get("/healthz")
async def health():
    return PlainTextResponse("ok")

@app.get("/authorize")
async def authorize(req: Request):
    _load()
    serial = req.headers.get("x-ssl-client-serial", "").strip()
    verify = req.headers.get("x-ssl-client-verify", "").upper()
    dn = req.headers.get("x-ssl-client-s-dn", "")

    if verify != "SUCCESS" or not serial:
        return PlainTextResponse("forbidden", status_code=403)

    if serial in _cache:
        return PlainTextResponse("revoked", status_code=403)

    m = _dn_cn.search(dn)
    cn = m.group(1) if m else "unknown"
    resp = Response(status_code=200)
    resp.headers["X-Authz-User"] = cn
    resp.headers["X-Authz-Serial"] = serial
    return resp
