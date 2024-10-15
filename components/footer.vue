<template>
  <div class="text-center text-xs border-t-[1px] border-gray-700 p-2">
    version:
    <CustomLink :url="getLinkToTag(version)">
      {{ version }}
    </CustomLink>
    <br>
    built on
    {{ buildDate.toLocaleDateString('de-DE') }}
    (<CustomLink :url="getLinkToCommit(commitHash)">
      {{ commitHash }}
    </CustomLink>)
  </div>
</template>

<script setup lang="ts">
import { getLinkToCommit, getLinkToTag } from '~/utils/gitHubRepo';

const runtimeConfig = useRuntimeConfig();

const { commitHash, version } = runtimeConfig.public;
const buildDate = new Date(runtimeConfig.public.buildDate);
</script>
