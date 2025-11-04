export interface FailoverOptions {
  label?: string;
  logger?: Pick<Console, 'info' | 'warn' | 'error'>;
}

export const withProviderFailover = async <T>(
  primary: () => Promise<T>,
  fallbacks: Array<() => Promise<T>> = [],
  options: FailoverOptions = {}
): Promise<T> => {
  const { label = 'provider', logger = console } = options;

  try {
    return await primary();
  } catch (error) {
    logger.warn?.(`[Failover] ${label} primary provider failed`, error);

    for (const [index, fallback] of fallbacks.entries()) {
      try {
        logger.info?.(
          `[Failover] switching to fallback #${index + 1} for ${label}`
        );
        return await fallback();
      } catch (fallbackError) {
        logger.error?.(
          `[Failover] fallback #${index + 1} for ${label} failed`,
          fallbackError
        );
      }
    }

    throw error instanceof Error
      ? error
      : new Error('[Failover] All providers failed with unknown error');
  }
};
