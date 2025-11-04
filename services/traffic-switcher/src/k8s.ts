import {
  KubeConfig,
  NetworkingV1Api,
  type V1Ingress,
} from '@kubernetes/client-node';

export const k8s = (() => {
  const kc = new KubeConfig();
  try {
    kc.loadFromCluster();
  } catch {
    kc.loadFromDefault();
  }
  return kc.makeApiClient(NetworkingV1Api);
})();

export async function readCanaryWeight(args: {
  api: NetworkingV1Api;
  namespace: string;
  ingress: string;
}): Promise<number> {
  const { api, namespace, ingress } = args;
  const res = await api.readNamespacedIngress(ingress, namespace);
  const ing: V1Ingress = res.body;
  const ann = ing.metadata?.annotations || {};
  const weight = Number(
    ann['nginx.ingress.kubernetes.io/canary-weight'] || '0'
  );
  return Number.isFinite(weight) ? weight : 0;
}

export async function patchCanaryWeight(args: {
  api: NetworkingV1Api;
  namespace: string;
  ingress: string;
  weight: number;
}): Promise<void> {
  const { api, namespace, ingress, weight } = args;
  const body = {
    metadata: {
      annotations: {
        'nginx.ingress.kubernetes.io/canary': 'true',
        'nginx.ingress.kubernetes.io/canary-weight': String(weight),
      },
    },
  };
  await api.patchNamespacedIngress(
    ingress,
    namespace,
    body as any,
    undefined,
    undefined,
    undefined,
    undefined,
    {
      headers: { 'Content-Type': 'application/merge-patch+json' },
    } as any
  );
}
