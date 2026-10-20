<template>
  <div class="min-h-screen w-full overflow-x-hidden bg-img">
    <!-- 遮罩层 -->
    <div class="fixed inset-0 vignette-overlay backdrop-saturate-150 z-0" />
    <UContainer
      class="min-h-screen mx-auto flex flex-col pt-3 relative"
    >
      <!-- 页眉 -->
      <div class="w-full">
        <AppHeader />
      </div>
      <UMain
        class="flex-1 grid grid-cols-1 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] items-center gap-x-10 xl:gap-x-14 2xl:gap-x-16 px-4 min-h-0"
      >
        <!-- 左侧：PerBoard -->
        <div
          class="mt-4 flex min-h-40 min-w-0 items-center justify-center sm:mt-0 lg:h-full"
        >
          <PersonCard />
        </div>

        <!-- 右侧：CardsBoard -->
        <div
          class="flex h-full min-w-0 items-center justify-center overflow-hidden"
        >
          <CardsBoard />
        </div>
      </UMain>
    </UContainer>
  </div>
</template>

<script setup lang="ts">
import * as ThumbHash from '../../public/js/thumbhash'

onMounted(async () => {
  const el = document.querySelector('.bg-img') as HTMLElement
  if (!el) return

  const isDesktop = window.innerWidth >= 768
  const ORIGINAL_URL = isDesktop
    ? '/bg.jpg'
    : 'https://fastly.jsdelivr.net/gh/PuppetRuler/drawing-board@main/images/1726620907142bg.jpg'

  /* ========== 1. 生成 ThumbHash 占位图 ========== */

  const image = new Image()
  image.crossOrigin = 'Anonymous'
  image.src = ORIGINAL_URL

  try {
    await new Promise((resolve, reject) => {
      image.onload = resolve
      image.onerror = reject // 捕获加载失败
    })

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (ctx) {
      const scale = 100 / Math.max(image.width, image.height)
      canvas.width = Math.round(image.width * scale)
      canvas.height = Math.round(image.height * scale)
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height)
      const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const binaryThumbHash = ThumbHash.rgbaToThumbHash(
        pixels.width,
        pixels.height,
        pixels.data
      )
      const placeholderURL = ThumbHash.thumbHashToDataURL(binaryThumbHash)

      el.style.setProperty('--bg-placeholder', `url(${placeholderURL})`)
    }
  } catch (e) {
    console.error('ThumbHash 生成失败:', e)
  }

  /* ========== 2. 写入占位背景（模糊层） ========== */

  const img = new Image()
  img.src = ORIGINAL_URL

  const finishLoading = () => {
    el.style.setProperty('--bg-img', `url(${ORIGINAL_URL})`)
    el.classList.add('loaded')
  }

  if (img.complete) {
    finishLoading()
  } else {
    img.onload = finishLoading
    img.onerror = finishLoading // 避免卡死在模糊状态
  }
})
</script>

<style scoped lang="scss">
.bg-img {
  position: relative;
  overflow: hidden;
  --bg-blur-opacity: 1;
  --bg-clear-opacity: 0;

  &::before {
    content: "";
    position: absolute;
    inset: 0;
    background-image: var(--bg-img-blur);
    background-size: cover;
    background-position: center;
    filter: blur(20px);
    transform: scale(1.1);
    opacity: var(--bg-blur-opacity);
    transition: opacity 0.5s ease;
    z-index: -2;
  }

  &::after {
    content: "";
    position: absolute;
    inset: 0;
    background-image: var(--bg-img);
    background-size: cover;
    background-position: center;
    opacity: var(--bg-clear-opacity);
    transition: opacity 0.5s ease;
    z-index: -1;
  }

  &.loaded {
    --bg-blur-opacity: 0;
    --bg-clear-opacity: 1;
  }
}

.vignette-overlay {
  pointer-events: none;
  position: fixed;
  inset: 0;
  background-image: radial-gradient(ellipse at center, rgba(var(--bg-gradient-home), 0.25) 0%, rgba(var(--bg-gradient-home), 0.85) 150%);
  transition: background 300ms ease;

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
}

.dark .vignette-overlay {
  --bg-gradient-home: 20, 20, 20;
}
</style>
