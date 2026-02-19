<template>
  <UHeader
    class="rounded-full dark:shadow-[inset_0_2px_2px_0_rgba(255,255,255,0.1)] shadow-[inset_0_2px_2px_0_rgba(0,0,0,0.1)] mx-4"
    :toggle="{
      class: 'hidden'
    }"
  >
    <template #left>
      <div class="flex items-center gap-3">
        <UAvatar
          class="h-10 w-auto"
          alt="logo"
          size="3xl"
          src="/favicon.ico"
        />
        <h1
          class="text-xl sm:text-3xl pl-2 font-bold tracking-wide transition-all duration-300 font-['Allura'] bg-clip-text text-transparent bg-linear-to-br from-zinc-900 via-zinc-700 to-zinc-400 dark:from-white dark:via-white/80 dark:to-white/20"
        >
          glace's Home
        </h1>
      </div>
    </template>
    <template #right>
      <UButton
        icon="i-simple-icons-github"
        aria-label="GitHub"
        to="https://github.com/PuppetRuler"
        target="_blank"
        variant="ghost"
        color="neutral"
        class="hover:bg-white/10"
      />
      <ColorModeButton aria-label="changeThemeColor" />
    </template>
  </UHeader>
</template>

<script setup lang="ts"></script>

<style lang="scss">
button[aria-aria-label="Open menu"] {
  display: none;
}
</style>
