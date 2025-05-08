import type { SalarySchema } from '~/server/db/schemas/Salary.schema';

export async function useOwnSalary () {
  const { data } = await useFetch<SalarySchema>('/api/salary', {
    lazy: false,
  });

  return data;
}
