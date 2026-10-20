import { serverConfiguration } from '~/server/config/server';

export default defineEventHandler(() => {
  return {
    acceptedDomain: serverConfiguration.acceptedDomain,
    disclaimer: serverConfiguration.disclaimer,
  };
});
