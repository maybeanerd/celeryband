export async function useServerConfiguration () {
  const { data: config } = await useFetch<{
    roles: Array<string>;
    seniorityLevels: Array<string>;
    departments: Array<string>;
    currency: string;
  }>('/api/configuration', {
    lazy: true,
  });

  return {
    config,
  };
}
