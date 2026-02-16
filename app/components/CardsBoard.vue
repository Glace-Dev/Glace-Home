<template>
  <div class="grid grid-cols-1 grid-rows-5 w-full h-full sm:pt-10">
    <div class="row-span-1 hidden sm:block">
      <UCard
        :ui="{
          root: 'bg-background/50 backdrop-blur-sm min-h-5 transition-all ring-0',
          body: 'w-full h-full sm:py-2'
        }"
        class="rounded-full dark:shadow-[inset_0_2px_2px_0_rgba(255,255,255,0.1)] shadow-[inset_0_2px_2px_0_rgba(0,0,0,0.1)] h-1/2 w-full flex items-center border-b border-black mt-8"
      >
        <div class="flex w-full h-full items-center">
          <div class="flex-1 grid grid-cols-4 h-full items-center gap-2">
            <!-- 图标 -->
            <UIcon
              name="i-heroicons-clock"
              class="h-[2em] w-[2em] col-span-1 -translate-x-2.5"
            />
            <!-- 时间 -->
            <div class="col-span-3 flex justify-center ml-2">
              <span class="font-['Inter'] text-xl font-medium tracking-tight">
                {{ currentTime }}
              </span>
            </div>
          </div>
          <div
            class="ml-4 rounded-full shadow-[inset_0_0_10px_rgba(0,0,0,0.5)] flex-4 flex h-full items-center justify-center"
          >
            <div class="flex items-center justify-center w-full">
              <Transition
                name="fade"
                mode="out-in"
              >
                <USkeleton
                  v-if="!sentence"
                  key="skeleton"
                  class="skeleton h-4 w-48 rounded-md opacity-50"
                />

                <p
                  v-else
                  key="content"
                  class="font-['Allura'] text-[1.1em] font-bold text-center w-full translate-y-1 text-zinc-800/90 dark:text-white/90 transition-colors duration-300"
                >
                  {{ sentence }}
                </p>
              </Transition>
            </div>
          </div>
        </div>
      </UCard>
    </div>
    <div class="row-span-4 h-full w-full">
      <CardGroup />
    </div>
  </div>
</template>

<script setup lang="ts">
const sentence = ref('')

// 实时时钟（精确到秒）
const currentTime = ref('')
function updateTime() {
  const d = new Date()
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  const ss = String(d.getSeconds()).padStart(2, '0')
  currentTime.value = `${hh}:${mm}:${ss}`
}
let timerId: number | undefined

const API_URL = 'https://v1.hitokoto.cn/?c=a&max_length=16'

interface HitokotoResponse {
  hitokoto: string
  from: string
}

// server: false 确保该请求仅在客户端发起，不会阻塞 SSR
// lazy: true 允许组件先挂载，数据异步加载
const {
  data
} = await useFetch<HitokotoResponse>(API_URL, {
  server: false,
  lazy: true,
  transform: (res) => {
    // 直接在 transform 中清洗数据，这样 data.value 拿到的就是干净的
    return {
      ...res,
      hitokoto: res.hitokoto.replace(/[，。！？；：、.,!?;:]+$/, '')
    }
  }
})

watch(
  data,
  (newData) => {
    // 此时 newData 的类型被推导为 HitokotoResponse | undefined
    if (newData?.hitokoto) {
      sentence.value = newData.hitokoto
    }
  },
  { immediate: true }
)

onMounted(() => {
  // 启动实时时钟
  updateTime()
  timerId = window.setInterval(updateTime, 1000)
})

onUnmounted(() => {
  if (timerId !== undefined) clearInterval(timerId)
})
</script>

<style scoped lang="scss">
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

.skeleton {
  background: linear-gradient(90deg, rgba(0, 0, 0, 0.06) 25%, rgba(0, 0, 0, 0.02) 37%, rgba(0, 0, 0, 0.06) 63%);
  background-size: 400% 100%;
  animation: shimmer 1.2s ease-in-out infinite;
  border-radius: inherit;
}

@keyframes shimmer {
  0% {
    background-position: 100% 0;
  }
  100% {
    background-position: -100% 0;
  }
}
</style>
