<template>
  <div class="text-center text-xs border-t-[1px] border-gray-700 p-2">
    <p class="mb-2">
      built on {{ buildDate.toLocaleDateString('de-DE') }} ·
      <CustomLink :url="getLinkToTag(version)">
        {{ version }}
      </CustomLink> ·
      <CustomLink :url="getLinkToCommit(commitHash)">
        {{ commitHash }}
      </CustomLink>
    </p>
    <p v-if="disclaimer">
      {{ disclaimer }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { getLinkToCommit, getLinkToTag } from '~/utils/gitHubRepo';

const runtimeConfig = useRuntimeConfig();

const { commitHash, version, disclaimer } = runtimeConfig.public;
const buildDate = new Date(runtimeConfig.public.buildDate);
</script>
