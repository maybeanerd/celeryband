export async function useSalaryStatistics () {
  const { data: statistics } = await useFetch<unknown>('/api/salary/statistics', {
    lazy: true,
  });

  return {
    statistics,
  };
}
