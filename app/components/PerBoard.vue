<template>
  <div class="w-full mx-auto">
    <UCard
      :ui="{
        root: 'relative overflow-hidden bg-background/50 backdrop-blur-sm dark:shadow-[inset_2px_2px_2px_0_rgba(255,255,255,0.2),2px_2px_2px_0_rgba(0,0,0,0.2)] shadow-[inset_2_2px_2px_0_rgba(0,0,0,0.2),2px_2px_2px_0_rgba(255,255,255,0.2)] ring-0',
        body: 'p-0! sm:aspect-9/5 flex flex-col sm:flex-row'
      }"
      class="rounded-2xl border-b border-black shadow-2xl"
    >
      <div class="w-full sm:w-50 relative flex items-center justify-center overflow-hidden border-b sm:border-b-0 sm:border-r border-white/5 py-8 sm:py-0">
        <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div
            v-for="i in 3"
            :key="i"
            class="absolute rounded-full border border-white/10 animate-water-ripple"
            :style="{
              width: '90px',
              height: '90px',
              animationDelay: `${i * 1.5}s`
            }"
          />
        </div>

        <div class="relative">
          <div class="absolute inset-0 bg-white/10 blur-2xl scale-125 rounded-full" />
          <UAvatar
            src="/favicon.ico"
            alt="avatar"
            class="w-24 h-24 sm:w-28 sm:h-28 rounded-full ring-2 ring-white/40 shadow-2xl object-cover relative"
          />
        </div>
      </div>

      <div class="flex-1 flex flex-col p-6 sm:p-8 items-center justify-between bg-white/1 gap-6 sm:gap-0">
        <div class="flex flex-col items-center">
          <h1 class="font-['Allura'] text-4xl sm:text-5xl text-white drop-shadow-[0_2px_10px_rgba(255,255,255,0.3)]">
            {{ displayName }}
          </h1>
          <div class="flex items-center gap-4 mt-2">
            <span class="h-px w-6 bg-white/60" />
            <p class="text-[10px] tracking-[0.6em] font-light uppercase italic">
              {{ occupation }}
            </p>
            <span class="h-px w-6 bg-white/60" />
          </div>
        </div>

        <div class="w-full text-center">
          <p class="text-[11px] text-(--text-color) font-serif italic leading-relaxed tracking-[0.15em] mx-auto max-w-60">
            "时间如水，流过指尖的唯有此间清晨"
          </p>
        </div>

        <div class="flex w-full justify-around items-center px-4">
          <UButton
            v-for="link in socialLinks"
            :key="link.icon"
            :aria-label="link.icon"
            :icon="link.icon"
            variant="ghost"
            class="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 text-white/40 hover:text-white ring-1 ring-white/10 transition-all duration-300 shadow-sm"
            :to="link.url"
            target="_blank"
          />
        </div>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import userConfig from '../../config'

const socialLinks = [
  { icon: 'i-simple-icons-github', url: userConfig.social?.githubProfile || '' },
  { icon: 'i-ph-paper-plane-tilt-bold', url: userConfig.social?.telegram || '' },
  { icon: 'i-heroicons-envelope-20-solid', url: userConfig.social?.email ? `mailto:${userConfig.social.email}` : '' }
]

const displayName = userConfig.profile?.name || 'glace'
const occupation = userConfig.profile?.occupation || 'Developer'
</script>

<style scoped lang="scss">
/* 涟漪动画保持 */
@keyframes water-ripple {
  0% {
    transform: scale(1);
    opacity: 0.8;
  }
  100% {
    transform: scale(4.2);
    opacity: 0;
  }
}

.animate-water-ripple {
  animation: water-ripple 5s cubic-bezier(0.25, 0.1, 0.25, 1) infinite;
}

h1 {
  -webkit-font-smoothing: antialiased;
}
</style>
