export type DepartmentOption = {
  name: string;
  label: string;
  roles: {
    id: string;
    label: string;
  }[];
  roleSeniorityLevels: Record<string, string[]>;
};

export type ServerConfiguration = {
  currency: string;
  acceptedDomain: string;
  departments: DepartmentOption[];
  roles: Record<string, {
    label: string;
    seniorityLevels: string[];
  }>;
};

export async function useServerConfiguration () {
  const { data: config } = await useFetch<ServerConfiguration>('/api/configuration', {
    lazy: true,
  });

  return {
    config,
  };
}
