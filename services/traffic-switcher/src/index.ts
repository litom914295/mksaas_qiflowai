import Fastify from 'fastify';
import pino from 'pino';
import { Counter, Gauge, collectDefaultMetrics, register } from 'prom-client';
import { z } from 'zod';
import { k8s, patchCanaryWeight, readCanaryWeight } from './k8s';

const log = pino({ level: process.env.LOG_LEVEL || 'info' });
const app = Fastify({ logger: log });

const NAMESPACE = process.env.NAMESPACE || 'qiflowai';
const CANARY_INGRESS_NAME =
  process.env.CANARY_INGRESS_NAME || 'qiflowai-ingress-canary';
const DEFAULT_HOST = process.env.DEFAULT_HOST || 'your-domain.com';
const PORT = Number(process.env.PORT || 8080);

// Metrics
collectDefaultMetrics({ register });
const switchEvents = new Counter({
  name: 'traffic_switch_events_total',
  help: 'Number of traffic switch operations performed',
  labelNames: ['host', 'outcome'] as const,
});
const currentWeight = new Gauge({
  name: 'traffic_switch_weight',
  help: 'Current canary traffic weight (0-100)',
  labelNames: ['host'] as const,
});

const SwitchBody = z.object({
  host: z.string().optional(),
  canary_weight: z.number().int().min(0).max(100),
  dry_run: z.boolean().optional().default(false),
});

app.get('/healthz', async () => ({ status: 'ok' }));

app.get('/metrics', async (_req, reply) => {
  const body = await register.metrics();
  reply.header('Content-Type', register.contentType);
  reply.send(body);
});

app.get('/status', async (req, reply) => {
  const host = (req.query as any).host ?? DEFAULT_HOST;
  try {
    const w = await readCanaryWeight({
      api: k8s,
      namespace: NAMESPACE,
      ingress: CANARY_INGRESS_NAME,
    });
    currentWeight.labels(host).set(w);
    return reply.send({
      host,
      namespace: NAMESPACE,
      canary_ingress: CANARY_INGRESS_NAME,
      canary_weight: w,
    });
  } catch (e: any) {
    req.log.error({ err: e }, 'read status failed');
    return reply.code(500).send({ error: String(e?.message || e) });
  }
});

app.post('/switch', async (req, reply) => {
  const parsed = SwitchBody.safeParse(req.body);
  if (!parsed.success) return reply.code(400).send(parsed.error);
  const { host = DEFAULT_HOST, canary_weight, dry_run } = parsed.data;

  try {
    if (!dry_run) {
      await patchCanaryWeight({
        api: k8s,
        namespace: NAMESPACE,
        ingress: CANARY_INGRESS_NAME,
        weight: canary_weight,
      });
      currentWeight.labels(host).set(canary_weight);
      switchEvents.labels({ host, outcome: 'success' }).inc();
    }
    return reply.send({
      host,
      canary_weight,
      dry_run: !!dry_run,
      status: 'ok',
    });
  } catch (e: any) {
    switchEvents.labels({ host, outcome: 'error' }).inc();
    req.log.error({ err: e }, 'switch failed');
    return reply.code(500).send({ error: String(e?.message || e) });
  }
});

app
  .listen({ host: '0.0.0.0', port: PORT })
  .then(() => {
    log.info({ port: PORT }, 'traffic-switcher started');
  })
  .catch((err) => {
    log.error({ err }, 'failed to start');
    process.exit(1);
  });
