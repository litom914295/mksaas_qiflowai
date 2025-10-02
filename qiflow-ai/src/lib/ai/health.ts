import type { ProviderClient } from './types';

export const checkProviders = async (clients: ProviderClient[]) => {
  const results = await Promise.all(
    clients.map(async c => ({ name: c.name, healthy: await c.isHealthy() }))
  );
  return results;
};


