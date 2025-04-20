import type { Statistics } from '~/server/api/salary/statistics/index.get';

export async function useSalaryStatistics () {
  const { data } = await useFetch<Statistics>('/api/salary/statistics', {
    lazy: true,
  });

  return data;
}
