<template>
  <div class="w-full max-w-6xl mx-auto sm:pt-8">
    <div class="flex items-center space-x-2 mb-6 text-zinc-800 dark:text-white/90 transition-colors duration-300">
      <UIcon name="i-heroicons-link" class="w-6 h-6 rotate-45" />
      <h2 class="text-xl font-medium tracking-wider">网站列表</h2>
    </div>

    <div
      ref="scrollContainer"
      class="flex overflow-x-auto snap-x snap-mandatory scroll-smooth no-scrollbar touch-pan-y"
      :class="{ 'dragging': isDragging }"
      @scroll="handleScroll"
      @pointerdown="onPointerDown"
      @pointermove="onPointerMove"
      @pointerup="onPointerUp"
      @pointercancel="onPointerUp"
    >
      <div
  v-for="(page, pIndex) in pages"
  :key="pIndex"
  class="min-w-full grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-6 snap-center overflow-hidden"
>
        <div
          v-for="item in page"
          :key="item.name"
          class="relative border-none"
        >
          <component
            :is="item.enable ? 'a' : 'div'"
            v-bind="getLinkProps(item)"
            @click="handleLinkClick"
          >
            <UCard
              :disabled="!item.enable"
              :class="[
                'group h-32 text-center transition-all duration-300 rounded-2xl bg-background/50 backdrop-blur-sm border-b border-black ring-0 shadow-[inset_2px_2px_2px_0_rgba(0,0,0,0.2),2px_2px_2px_0_rgba(255,255,255,0.2)] dark:shadow-[inset_2px_2px_2px_0_rgba(255,255,255,0.2),2px_2px_2px_0_rgba(0,0,0,0.2)]',
                item.enable ? 'available cursor-pointer transform hover:-translate-y-1 hover:-translate-x-1' : 'card-unavailable cursor-not-allowed'
              ]"
              :ui="{
                root: 'relative overflow-hidden',
                body: 'flex flex-col items-center justify-center gap-2'
              }"
            >
              <div
                v-if="!item.enable"
                class="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none"
              >
                <div class="absolute -top-[50%] -right-[50%] w-full h-full bg-linear-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-2xl" />
              </div>

              <UIcon
                :name="item.icon"
                class="w-10 h-10 transition-colors duration-300 text-zinc-800 dark:text-white"
              />
              <span class="text-xl font-normal tracking-widest transition-colors duration-300 text-zinc-800 dark:text-white/90">
                {{ item.name }}
              </span>

              <div
                v-if="!item.enable"
                class="card-badge absolute top-3 right-3 text-xs rounded-full px-2 py-0.5 bg-zinc-800/10 dark:bg-white/10 text-zinc-800/80 dark:text-white/80 opacity-0 transition-opacity duration-200 pointer-events-none"
              >
                暂不可用
              </div>
            </UCard>
          </component>
        </div>
      </div>
    </div>

    <div class="flex justify-center items-center space-x-3 pt-4">
      <button
        v-for="(_, idx) in pages"
        :key="idx"
        class="h-1.5 rounded-full transition-all duration-300"
        :class="activeIndex === idx ? 'w-8 bg-zinc-800 dark:bg-white' : 'w-4 bg-zinc-800/20 dark:bg-white/20'"
        aria-label="pageIndex"
        @click="scrollToPage(idx)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * 1. 类型定义
 */
interface LinkItem {
  name: string
  icon: string
  url?: string
  enable: boolean
}

/**
 * 2. 静态配置 (建议在生产环境中放入 defineAppConfig 或 content)
 */
const ALL_LINKS: LinkItem[] = [
  { name: '博客', icon: 'i-heroicons-rss-20-solid', url: 'https://blog.glace.top', enable: true },
  { name: '网址集', icon: 'i-heroicons-book-open-20-solid', url: 'https://res.glace.top', enable: true },
  { name: '网盘', icon: 'i-heroicons-cloud-20-solid', url: '', enable: false },
  { name: '音乐', icon: 'i-heroicons-musical-note-20-solid', url: '', enable: false },
  { name: '起始页', icon: 'i-heroicons-home-modern-20-solid', url: '', enable: false },
  { name: '今日热榜', icon: 'i-heroicons-fire-20-solid', url: '', enable: false },
  { name: '更多内容', icon: 'i-heroicons-ellipsis-horizontal', url: '', enable: false },
  { name: '设置', icon: 'i-heroicons-cog-6-tooth', url: '', enable: false },
  { name: '反馈', icon: 'i-heroicons-chat-bubble-left-right', url: '', enable: false }
]

/**
 * 3. 响应式状态 & 引用
 */
const scrollContainer = ref<HTMLElement | null>(null)
const activeIndex = ref(0)
const isDragging = ref(false)

// 拖拽逻辑相关私有变量
let startX = 0
let startScrollLeft = 0
let dragDistance = 0
let lastSamples: { x: number; t: number }[] = []

/**
 * 4. 屏幕适配 (Nuxt 方式优化)
 * 使用 VueUse 的 useBreakpoints (Nuxt UI 已内置) 或简单的响应式监听
 */
const isMobile = ref(false)
const updateBreakpoint = () => {
  if (import.meta.client) {
    isMobile.value = window.innerWidth < 640
  }
}

/**
 * 5. 计算属性
 */
const pages = computed(() => {
  const chunkSize = isMobile.value ? 4 : 6
  const result: LinkItem[][] = []
  for (let i = 0; i < ALL_LINKS.length; i += chunkSize) {
    result.push(ALL_LINKS.slice(i, i + chunkSize))
  }
  return result
})

/**
 * 6. 辅助函数
 */
const getLinkProps = (item: LinkItem) => {
  if (!item.enable) return {}
  return {
    href: item.url,
    target: '_blank',
    rel: 'noopener noreferrer',
    class: 'no-underline'
  }
}

const scrollToPage = (index: number) => {
  const el = scrollContainer.value
  if (el) {
    el.scrollTo({
      left: index * el.clientWidth,
      behavior: 'smooth'
    })
  }
}

/**
 * 7. 事件处理逻辑
 */
const handleScroll = (e: Event) => {
  const el = e.target as HTMLElement
  activeIndex.value = Math.round(el.scrollLeft / el.clientWidth)
}

const handleLinkClick = (e: MouseEvent) => {
  // 拖拽阈值判断，防止误触
  if (dragDistance > 10) {
    e.preventDefault()
    e.stopPropagation()
  }
}

// 拖拽逻辑封装
const onPointerDown = (e: PointerEvent) => {
  const el = scrollContainer.value
  if (!el) return
  
  isDragging.value = true
  dragDistance = 0
  startX = e.clientX
  startScrollLeft = el.scrollLeft
  lastSamples = [{ x: e.clientX, t: performance.now() }]
  
  try { el.setPointerCapture(e.pointerId) } catch {}
}

const onPointerMove = (e: PointerEvent) => {
  if (!isDragging.value || !scrollContainer.value) return
  
  const dx = e.clientX - startX
  dragDistance = Math.abs(dx)
  scrollContainer.value.scrollLeft = startScrollLeft - dx
  
  lastSamples.push({ x: e.clientX, t: performance.now() })
  if (lastSamples.length > 6) lastSamples.shift()
}

const onPointerUp = (e: PointerEvent) => {
  const el = scrollContainer.value
  if (!el || !isDragging.value) return

  // 惯性计算
  const last = lastSamples[lastSamples.length - 1] || { x: startX, t: performance.now() }
  const first = lastSamples[0] || last
  const dt = Math.max(1, last.t - first.t)
  const scrollV = -(last.x - first.x) / dt
  const momentum = scrollV * 300

  const targetPage = Math.round((el.scrollLeft + momentum) / el.clientWidth)
  const clamped = Math.max(0, Math.min(pages.value.length - 1, targetPage))

  scrollToPage(clamped)
  
  isDragging.value = false
  try { el.releasePointerCapture(e.pointerId) } catch {}
}

/**
 * 8. 生命周期
 */
onMounted(() => {
  updateBreakpoint()
  window.addEventListener('resize', updateBreakpoint)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateBreakpoint)
})
</script>

<style scoped lang="scss">
.no-scrollbar{
  -ms-overflow-style: none;
  scrollbar-width: none;
  // 确保在移动端不会触发浏览器的回弹，交给我们的逻辑处理
  overscroll-behavior-x: contain ;

  &::-webkit-scrollbar{
    display: none;
  }
}
.dragging{
  cursor: grabbing !important;
  user-select: none;
  scroll-snap-type: none; // 拖拽时暂时关闭 snap 以保证顺滑
}
.card-unavailable{
  .card-badge{
    opacity: 0;
  }
  .w-10, span{
    transition: color 0.2s, opacity 0.2s;
  }
  &:hover{
    .card-badge{
      opacity: 1;
    }
    .w-10, span{
      color: rgba(255, 255, 255, 0.4) !important;
      opacity: 0.6;
    }
  }
}
</style>