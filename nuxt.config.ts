import gitCommitInfo from 'git-commit-info';
import packageJson from './package.json';

// When built in GitHub Actions, the commit hash is available in the environment, and gitCommitInfo won't find it.
const commitHash = gitCommitInfo().shortHash ?? process.env.COMMIT_HASH;

const { version } = packageJson; // TODO get version from git tag during container build

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: [
    '@nuxt/image',
    '@nuxtjs/i18n',
    '@vite-pwa/nuxt',
    '@nuxt/ui',
    'nuxt-auth-utils',
    'nuxt-cron'],
  pwa: {},

  css: ['~/assets/main.css'],

  ssr: false,

  nitro: {
    prerender: {
      crawlLinks: false,
      routes: [],
    },
  },

  build: {},
  vite: {},

  app: {
    head: {
      title: 'CeleryBand',
      meta: [
        { name: 'description', content: 'An open source platform that brings transparency to workplace compensation' },
      ],
      link: [
        { rel: 'icon', href: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🥬</text></svg>' },
      ],
    },
  },

  runtimeConfig: {
    public: {
      commitHash,
      version,
      buildDate: new Date().toISOString(),
    },
  },

  cron: {
    runOnInit: true,
    jobsDir: 'cron',
  },

  compatibilityDate: '2024-10-15',

});
