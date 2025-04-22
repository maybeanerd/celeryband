export async function usePublicServerInformation () {
  const { data: serverInfo } = await useFetch<{
    acceptedDomain: string;
  }>('/api/public/serverinfo', {
    lazy: true,
  });

  return {
    serverInfo,
  };
}
