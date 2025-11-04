import crypto from 'node:crypto';

export function stableHash(input: unknown): string {
  const json = JSON.stringify(input, Object.keys(input as any).sort());
  return crypto.createHash('sha256').update(json).digest('hex');
}
