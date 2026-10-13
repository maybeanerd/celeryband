export interface DepartmentOption {
  name: string;
  roles: string[];
  roleSeniorityLevels: Record<string, string[]>;
}

export interface ServerConfiguration {
  currency: string;
  acceptedDomain: string;
  departments: DepartmentOption[];
}

export async function useServerConfiguration () {
  const { data: config } = await useFetch<ServerConfiguration>('/api/configuration', {
    lazy: true,
  });

  return {
    config,
  };
}
