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
 * 1. 类型定义与配置
 */
interface LinkItem {
  name: string
  icon: string
  url?: string
  enable: boolean
}
import userConfig from '../../config'

const ALL_LINKS: LinkItem[] = (userConfig.links || []) as LinkItem[]

/**
 * 2. 响应式状态
 */
const scrollContainer = ref<HTMLElement | null>(null)
const activeIndex = ref(0)
const isDragging = ref(false) // 只有真正滑动时才为 true
const isMobile = ref(false)

// 内部逻辑变量 (非响应式)
let isPressed = false      // 鼠标/手指是否按下
let startX = 0             // 按下时的坐标
let startScrollLeft = 0    // 按下时的滚动位置
let lastSamples: { x: number; t: number }[] = []

/**
 * 3. 基础功能逻辑
 */
const updateBreakpoint = () => {
  if (import.meta.client) isMobile.value = window.innerWidth < 640
}

const pages = computed(() => {
  const chunkSize = isMobile.value ? 4 : 6
  const result: LinkItem[][] = []
  for (let i = 0; i < ALL_LINKS.length; i += chunkSize) {
    result.push(ALL_LINKS.slice(i, i + chunkSize))
  }
  return result
})

const scrollToPage = (index: number) => {
  const el = scrollContainer.value
  if (!el) return
  el.scrollTo({
    left: index * el.clientWidth,
    behavior: 'smooth'
  })
}

const handleScroll = (e: Event) => {
  const el = e.target as HTMLElement
  // 仅在非拖拽状态下（如点击页码点）同步索引
  if (!isPressed) {
    activeIndex.value = Math.round(el.scrollLeft / el.clientWidth)
  }
}

/**
 * 4. 核心交互逻辑 (拖拽与点击兼容)
 */
const onPointerDown = (e: PointerEvent) => {
  // 只响应主键（左键）
  if (e.button !== 0) return
  const el = scrollContainer.value
  if (!el) return

  isPressed = true
  isDragging.value = false // 初始重置
  startX = e.clientX
  startScrollLeft = el.scrollLeft
  lastSamples = [{ x: e.clientX, t: performance.now() }]
}

const onPointerMove = (e: PointerEvent) => {
  if (!isPressed) return

  const dx = e.clientX - startX
  
  // 阈值判定：移动超过 10px 才确认为“拖拽”
  if (!isDragging.value && Math.abs(dx) > 10) {
    isDragging.value = true
    // 确认为拖拽后，接管指针，防止触发子元素的 click 和系统默认行为
    scrollContainer.value?.setPointerCapture(e.pointerId)
  }

  if (isDragging.value && scrollContainer.value) {
    scrollContainer.value.scrollLeft = startScrollLeft - dx
    
    // 记录样本用于惯性计算
    lastSamples.push({ x: e.clientX, t: performance.now() })
    if (lastSamples.length > 6) lastSamples.shift()
  }
}

const onPointerUp = (e: PointerEvent) => {
  if (!isPressed) return
  const el = scrollContainer.value
  
  if (isDragging.value && el) {
    // 计算惯性终点
    const last = lastSamples[lastSamples.length - 1]
    const first = lastSamples[0]
    const dt = Math.max(1, last!.t - first!.t)
    const velocity = (last!.x - first!.x) / dt
    const momentum = velocity * 200 // 惯性系数

    const targetPage = Math.round((el.scrollLeft - momentum) / el.clientWidth)
    const clamped = Math.max(0, Math.min(pages.value.length - 1, targetPage))
    scrollToPage(clamped)
    activeIndex.value = clamped
    
    try { el.releasePointerCapture(e.pointerId) } catch {}
  }

  // 延迟重置 isDragging，确保 handleLinkClick 能拿到正确的状态
  isPressed = false
  setTimeout(() => {
    isDragging.value = false
  }, 0)
}

const handleLinkClick = (item: LinkItem, e: MouseEvent) => {
  // 如果当前是拖拽结束后的那一刻，拦截跳转
  if (isDragging.value) {
    e.preventDefault()
    e.stopPropagation()
    return
  }
  
  // 逻辑处理：如果不允许跳转，拦截默认行为
  if (!item.enable || !item.url) {
    e.preventDefault()
  }
}

const getLinkProps = (item: LinkItem) => {
  if (!item.enable || !item.url) return { role: 'button' }
  return {
    href: item.url,
    target: '_blank',
    rel: 'noopener noreferrer'
  }
}

/**
 * 5. 生命周期
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
  overscroll-behavior-x: contain ; // 确保在移动端不会触发浏览器的回弹

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