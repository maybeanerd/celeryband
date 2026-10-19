// Import API response type from server API
import type { ConfigurationResponse } from '~/server/api/configuration.get';

export async function useServerConfiguration () {
  const { data: config } = await useFetch<ConfigurationResponse>('/api/configuration', {
    lazy: true,
  });

  return {
    config,
  };
}
