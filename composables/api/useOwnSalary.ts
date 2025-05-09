import type { SalarySchema } from '~/server/db/schemas/Salary.schema';

export async function useOwnSalary ({ lazy = false }: { lazy?: boolean } = {}) {
  const { data } = await useFetch<SalarySchema>('/api/salary', {
    lazy,
  });

  return data;
}
