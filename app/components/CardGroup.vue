<template>
  <div class="w-full max-w-6xl mx-auto sm:pt-8">
    <div
      class="flex items-center space-x-2 mb-6 text-zinc-800 dark:text-white/90 transition-colors duration-300"
    >
      <UIcon
        name="i-heroicons-link"
        class="w-6 h-6 rotate-45"
      />
      <h2 class="text-xl font-medium tracking-wider">
        网站列表
      </h2>
    </div>

    <div
      ref="scrollContainer"
      class="flex overflow-x-auto snap-x snap-mandatory scroll-smooth no-scrollbar"
      @scroll="handleScroll"
    >
      <div
        v-for="(page, pIndex) in pages"
        :key="pIndex"
        class="min-w-full grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-6 snap-center"
      >
        <div
          v-for="item in page"
          :key="item.name"
          class="relative border-none"
        >
          <component
            :is="item.enable ? 'a' : 'div'"
            v-bind="item.enable ? { href: item.url, target: '_blank', rel: 'noopener noreferrer', class: 'no-underline' } : {}"
          >
            <UCard
              :disabled="!item.enable"
              :class="item.enable
                ? 'group available h-32 cursor-pointer transition-all duration-300 rounded-2xl bg-background/50 backdrop-blur-sm dark:shadow-[inset_2px_2px_2px_0_rgba(255,255,255,0.2),2px_2px_2px_0_rgba(0,0,0,0.2)] shadow-[inset_2px_2px_2px_0_rgba(0,0,0,0.2),2px_2px_2px_0_rgba(255,255,255,0.2)] border-b border-black ring-0 transform hover:-translate-y-1 hover:-translate-x-1 text-center'
                : 'group card-unavailable relative h-32 cursor-not-allowed transition-all duration-300 rounded-2xl bg-background/50 backdrop-blur-sm dark:shadow-[inset_2px_2px_2px_0_rgba(255,255,255,0.2),2px_2px_2px_0_rgba(0,0,0,0.2)] shadow-[inset_2px_2px_2px_0_rgba(0,0,0,0.2),2px_2px_2px_0_rgba(255,255,255,0.2)] border-b border-black ring-0 text-center'"
              :ui="{
                root: 'relative overflow-hidden',
                body: 'flex flex-col items-center justify-center gap-2 '
              }"
            >
              <div
                v-if="!item.enable"
                class="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none"
              >
                <div
                  class="absolute -top-[50%] -right-[50%] w-full h-full bg-linear-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-2xl"
                />
              </div>

              <UIcon
                :name="item.icon"
                class="w-10 h-10 transition-colors duration-300 text-zinc-800 dark:text-white"
              />
              <span
                class="text-xl font-normal tracking-widest transition-colors duration-300 text-zinc-800 dark:text-white/90"
              >
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
// 链接配置接口
interface LinkItem {
  name: string
  icon: string
  url?: string
  enable: boolean
}

// 统一管理所有链接配置
const allLinks: LinkItem[] = [
  {
    name: '博客',
    icon: 'i-heroicons-rss-20-solid',
    url: 'https://blog.glace.top',
    enable: true
  },
  {
    name: '网址集',
    icon: 'i-heroicons-book-open-20-solid',
    url: 'https://res.glace.top',
    enable: true
  },
  {
    name: '网盘',
    icon: 'i-heroicons-cloud-20-solid',
    url: '',
    enable: false
  },
  {
    name: '音乐',
    icon: 'i-heroicons-musical-note-20-solid',
    url: '',
    enable: false
  },
  {
    name: '起始页',
    icon: 'i-heroicons-home-modern-20-solid',
    url: '',
    enable: false
  },
  {
    name: '今日热榜',
    icon: 'i-heroicons-fire-20-solid',
    url: '',
    enable: false
  },
  {
    name: '更多内容',
    icon: 'i-heroicons-ellipsis-horizontal',
    url: '',
    enable: false
  },
  {
    name: '设置',
    icon: 'i-heroicons-cog-6-tooth',
    url: '',
    enable: false
  },
  {
    name: '反馈',
    icon: 'i-heroicons-chat-bubble-left-right',
    url: '',
    enable: false
  }
]

const scrollContainer = ref<HTMLElement | null>(null)
const activeIndex = ref(0)
const isMobile = ref(false)

// 数组分块函数
function chunkArray<T>(arr: T[], size: number): T[][] {
  const result: T[][] = []
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size))
  }
  return result
}

// 自动计算分页内容
const pages = computed(() => {
  const chunkSize = isMobile.value ? 4 : 6
  return chunkArray(allLinks, chunkSize)
})

// 更新响应式断点
const updateBreakpoint = () => {
  if (typeof window !== 'undefined') {
    isMobile.value = window.matchMedia('(max-width: 639px)').matches
  }
}

// 处理滚动监听
const handleScroll = (event: Event) => {
  const el = event.target as HTMLElement
  activeIndex.value = Math.round(el.scrollLeft / el.clientWidth)
}

// 点击指示器跳转
const scrollToPage = (index: number) => {
  if (scrollContainer.value) {
    scrollContainer.value.scrollTo({
      left: index * scrollContainer.value.clientWidth,
      behavior: 'smooth'
    })
  }
}

// 拖拽翻页逻辑
let isDown = false
let startX = 0
let startScrollLeft = 0
let lastSamples: Array<{ x: number, t: number }> = []

const onPointerDown = (e: PointerEvent) => {
  const el = scrollContainer.value
  if (!el) return
  const target = e.target as HTMLElement | null
  if (target?.closest('a,button,input,[role="button"]')) return

  isDown = true
  try {
    el.setPointerCapture(e.pointerId)
  } catch {}
  startX = e.clientX
  startScrollLeft = el.scrollLeft
  lastSamples = [{ x: e.clientX, t: performance.now() }]
  el.classList.add('dragging')
}

const onPointerMove = (e: PointerEvent) => {
  if (!isDown || !scrollContainer.value) return
  const dx = e.clientX - startX
  scrollContainer.value.scrollLeft = startScrollLeft - dx
  lastSamples.push({ x: e.clientX, t: performance.now() })
  if (lastSamples.length > 6) lastSamples.shift()
}

const endDrag = (e?: PointerEvent) => {
  const el = scrollContainer.value
  if (!el || !isDown) return

  const last = lastSamples[lastSamples.length - 1] || {
    x: startX,
    t: performance.now()
  }
  const first = lastSamples[0] || last
  const dt = Math.max(1, last.t - first.t)
  const scrollV = -(last.x - first.x) / dt
  const momentum = scrollV * 300

  const pageW = el.clientWidth
  const targetPage = Math.round((el.scrollLeft + momentum) / pageW)
  const clamped = Math.max(0, Math.min(pages.value.length - 1, targetPage))

  el.scrollTo({ left: clamped * pageW, behavior: 'smooth' })
  isDown = false
  try {
    if (e) el.releasePointerCapture(e.pointerId)
  } catch {}
  el.classList.remove('dragging')
}

onMounted(() => {
  updateBreakpoint()
  window.addEventListener('resize', updateBreakpoint)

  const el = scrollContainer.value
  if (el) {
    el.addEventListener('pointerdown', onPointerDown)
    el.addEventListener('pointermove', onPointerMove)
    el.addEventListener('pointerup', endDrag)
    el.addEventListener('pointercancel', endDrag)
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', updateBreakpoint)
})
</script>

<style scoped lang="sass">
.no-scrollbar
  -ms-overflow-style: none
  scrollbar-width: none
  touch-action: pan-y

  &::-webkit-scrollbar
    display: none

.dragging
  cursor: grabbing !important
  user-select: none
  -webkit-user-select: none
  -ms-user-select: none

.card-unavailable
  .card-badge
    opacity: 0

  .w-10, span
    transition: color 0.2s, opacity 0.2s

  &:hover
    .card-badge
      opacity: 1

    .w-10, span
      color: rgba(255, 255, 255, 0.4) !important
      opacity: 0.6
</style>
