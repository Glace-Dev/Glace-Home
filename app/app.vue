<template>
  <UApp>
    <div class="relative h-screen w-screen">
      <NuxtPage />
    </div>
  </UApp>
</template>

<script setup lang="ts">
import userConfig from '../config'

useSeoMeta({
  title: userConfig.site?.name || 'glace的个人主页',
  description: userConfig.site?.description || '',
  ogTitle: userConfig.site?.name || 'glace的个人主页',
  ogDescription: userConfig.site?.description || '',
  ogImage: userConfig.site?.ogImage || '/home.webp',
  twitterCard: 'summary_large_image'
})
</script>
