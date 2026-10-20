export async function usePublicServerInformation () {
  const { data: serverInfo } = await useFetch<{
    acceptedDomain: string;
    disclaimer: string | null;
  }>('/api/public/serverinfo', {
    lazy: true,
  });

  return {
    serverInfo,
  };
}
