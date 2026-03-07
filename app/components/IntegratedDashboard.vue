<template>
  <div class="w-full max-w-135 mx-auto group/dashboard">
    <UCard
      :ui="{
        root: 'relative overflow-hidden bg-background/50 backdrop-blur-sm dark:shadow-[inset_2px_2px_2px_0_rgba(255,255,255,0.2),2px_2px_2px_0_rgba(0,0,0,0.2)] shadow-[inset_2px_2px_2px_0_rgba(0,0,0,0.2),2px_2px_2px_0_rgba(255,255,255,0.2)] ring-0',
        body: 'p-0!'
      }"
      class="rounded-2xl border-b border-black dark:border-black shadow-lg"
    >
      <div class="px-6 py-10 sm:pt-4 sm:pb-0 flex flex-col sm:flex-row justify-between items-center select-none gap-6 sm:gap-0">
        <div class="flex flex-col sm:flex-row items-center gap-4 overflow-hidden">
          <p class="text-[11px] sm:text-[10px] text-(--text-color) font-bold tracking-widest truncate uppercase text-center sm:text-left">
            {{ playerData.name }} <span class="mx-1 opacity-50">•</span>
            {{ playerData.artist }}
          </p>
          <div
            class="flex items-center gap-6 sm:gap-2 opacity-100 sm:opacity-0 group-hover/dashboard:opacity-100 transition-all duration-500"
          >
            <UButton
              icon="i-heroicons-backward-16-solid"
              variant="ghost"
              size="sm"
              color="neutral"
              class="sm:size-xs p-1 sm:p-0.5 hover:text-white"
              @click="player?.skipBack()"
            />
            <UButton
              :icon="playState ? 'i-heroicons-pause-16-solid' : 'i-heroicons-play-16-solid'"
              variant="ghost"
              size="sm"
              color="neutral"
              class="sm:size-xs p-1 sm:p-0.5 hover:text-white"
              @click="player?.toggle()"
            />
            <UButton
              icon="i-heroicons-forward-16-solid"
              variant="ghost"
              size="sm"
              color="neutral"
              class="sm:size-xs p-1 sm:p-0.5 hover:text-white"
              @click="player?.skipForward()"
            />
          </div>
        </div>
        <div class="hidden sm:flex items-center gap-1.5 opacity-60">
          <span class="text-[8px] font-bold tracking-[0.2em] uppercase">Aplayer</span>
          <UIcon
            name="i-heroicons-musical-note-16-solid"
            class="text-[10px]"
          />
        </div>
      </div>

      <div class="flex flex-col sm:flex-row px-6 pb-12 sm:pb-6 pt-4 items-center sm:items-stretch justify-between gap-y-12 sm:gap-12">
        <div class="flex-1 flex flex-col items-center sm:items-start justify-between min-w-0 sm:min-h-25 w-full">
          <div class="relative flex items-center py-2 w-full justify-center sm:justify-start">
            <div class="hidden sm:block absolute left-0 w-px h-full bg-linear-to-b from-white/30 to-transparent" />
            <transition
              name="lyric-fade"
              mode="out-in"
            >
              <p
                :key="currentLyric"
                class="sm:pl-4 text-[12px] sm:text-[11px] text-[#47FFE7] font-serif italic tracking-widest leading-relaxed text-center sm:text-left"
              >
                {{ currentLyric || "纯音乐，请欣赏" }}
              </p>
            </transition>
          </div>

          <div class="flex items-center justify-center sm:justify-start gap-5 mt-8 sm:mt-6 w-full">
            <UIcon
              :name="weather.icon"
              class="text-3xl sm:text-2xl text-amber-200/80 drop-shadow-[0_0_10px_rgba(252,211,77,0.4)]"
            />
            <div class="flex flex-col items-center sm:items-start">
              <div class="flex items-baseline gap-2">
                <span class="text-3xl sm:text-2xl font-light text-white/90">{{ weather.temp }}°</span>
                <span class="text-[10px] sm:text-[9px] text-white/20 uppercase tracking-[0.2em]">
                  {{ weather.description }} / {{ weather.city }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div class="shrink-0 flex flex-col justify-end items-center sm:items-end gap-4 sm:gap-2 pb-1 w-full sm:w-auto pt-8 sm:pt-0 border-t border-white/5 sm:border-0">
          <div class="grid grid-cols-12 gap-2 sm:gap-1.5 px-0.5">
            <template v-if="contributionData.length > 0">
              <div
                v-for="(day, index) in contributionData"
                :key="index"
                :title="`${day.date}: ${day.contributionCount} commits`"
                :class="[
                  'w-3 h-3 sm:w-2.5 sm:h-2.5 rounded-[2px] transition-all duration-700 hover:scale-125 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]',
                  getLevelClass(day.contributionLevel)
                ]"
              />
            </template>
            <template v-else>
              <div
                v-for="i in 48"
                :key="i"
                class="w-3 h-3 sm:w-2.5 sm:h-2.5 rounded-[2px] bg-white/5 animate-pulse"
              />
            </template>
          </div>
          <p class="text-[9px] sm:text-[8px] text-(--text-color) font-mono tracking-widest uppercase mt-1 opacity-70">
            {{ githubUsername }} • {{ contributionData.reduce((acc, cur) => acc + (cur.contributionCount || 0), 0) }} Pushes in 48D
          </p>
        </div>
      </div>
    </UCard>

    <div
      ref="playerDom"
      class="hidden"
    />
  </div>
</template>

<script setup lang="ts">
// 全局状态接入
const playState = usePlayState()
const playerShow = usePlayerShow()
const playerVolume = usePlayerVolume()
const playerData = usePlayerData()

import userConfig from '../../config'

// 本地渲染状态
const currentLyric = ref('已准备好音乐ヾ(≧▽≦*)o')
const playerDom = ref<HTMLElement | null>(null)
const player = ref<any>(null) // APlayer 实例

// 歌曲配置（来自 config）
const musicConfig = userConfig.musicConfig || { id: '', server: 'netease', type: 'playlist', enable: false }

// --- 获取音乐列表 ---
const getMusicList = async (
  id: string,
  server = userConfig.musicConfig?.server || 'netease',
  type = userConfig.musicConfig?.type || 'playlist'
) => {
  const result = await fetch(
    `https://metingjsapi.vercel.app/api?server=${server}&type=${type}&id=${id}`
  )
  const list = await result.json()
  return list.map((song: any) => ({
    ...song,
    cover: song.pic
  }))
}

// --- 初始化 APlayer ---
const initAPlayer = async (list: any[]) => {
  if (!import.meta.client || !list.length) return

  try {
    const module = await import('aplayer')
    const APlayer = module.default

    player.value = new APlayer({
      container: playerDom.value,
      volume: playerVolume.value,
      lrcType: 3,
      order: 'random',
      audio: list
    })

    // APlayer 事件监听
    player.value.on('play', () => (playState.value = true))
    player.value.on('pause', () => (playState.value = false))

    // 歌词提取与元数据同步
    player.value.on('timeupdate', () => {
      // 1. 抓取歌词
      const lrcActive = playerDom.value?.querySelector(
        '.aplayer-lrc-current'
      ) as HTMLElement
      if (lrcActive && lrcActive.innerText !== currentLyric.value) {
        currentLyric.value = lrcActive.innerText
      }

      // 2. 检查并同步歌曲名
      const current = player.value.list.audios[player.value.list.index]
      if (current && current.name !== playerData.value.name) {
        playerData.value = {
          name: current.name,
          artist: current.artist
        }
        // 更新系统媒体控制
        initMediaSession(current.name, current.artist)
      }
    })

    // 初次同步
    const initSong = player.value.list.audios[player.value.list.index]
    playerData.value = { name: initSong.name, artist: initSong.artist }
  } catch (error) {
    console.error('APlayer 挂载失败', error)
  }
}

// --- 初始化系统媒体控制 ---
const initMediaSession = (title: string, artist: string) => {
  if ('mediaSession' in navigator) {
    navigator.mediaSession.metadata = new MediaMetadata({ title, artist })
    navigator.mediaSession.setActionHandler('play', () => player.value?.play())
    navigator.mediaSession.setActionHandler('pause', () =>
      player.value?.pause()
    )
    navigator.mediaSession.setActionHandler('previoustrack', () =>
      player.value?.skipBack()
    )
    navigator.mediaSession.setActionHandler('nexttrack', () =>
      player.value?.skipForward()
    )
  }
}

// --- 加载流程 ---
const loadMusicData = async () => {
  try {
    const musicList = await getMusicList(
      musicConfig.id,
      musicConfig.server,
      musicConfig.type
    )

    // 腾讯音乐修复逻辑
    if (musicList[1]?.url === '') {
      const midArr = JSON.parse(
        decodeURIComponent(musicList[0].url.split('data=')[1])
      ).req_0.param.songmid
      musicList.forEach((song: any, index: number) => {
        song.url = `https://meting.qjqq.cn/?server=tencent&type=url&id=${midArr[index]}`
      })
    }

    await initAPlayer(musicList)
  } catch (e) {
    currentLyric.value = '列表加载失败，请检查网络或API接口'
  }
}

// --- 生命周期与监听 ---
watch(playerVolume, val => player.value?.volume(val, true))

// --- 贡献图逻辑 ---
const githubUsername = userConfig.social?.githubUsername || 'Glace-Dev'
const contributionData = ref<any[]>([])

const getLevelClass = (level: string) => {
  const levels: Record<string, string> = {
    NONE: 'bg-white/5', // 无贡献
    FIRST_QUARTILE: 'bg-emerald-800/60', // 低
    SECOND_QUARTILE: 'bg-emerald-600/70', // 中
    THIRD_QUARTILE: 'bg-emerald-400/80', // 中高
    FOURTH_QUARTILE: 'bg-emerald-300' // 高
  }
  return levels[level] || 'bg-white/5'
}

const fetchContributions = async () => {
  try {
    const res = await fetch(
      `https://github-contributions-api.deno.dev/${githubUsername}.json`
    )
    const data = await res.json()

    if (data.contributions) {
      const allDays = data.contributions.flat()
      contributionData.value = allDays.slice(-48)
    }
  } catch (e) {
    console.error('GitHub 数据加载失败', e)
  }
}

// --- 天气逻辑 ---
const weather = ref({
  temp: 0,
  description: '加载中',
  city: '定位中',
  icon: 'i-heroicons-sun-20-solid'
})

// 1. 天气映射：支持昼夜图标切换
const weatherMap: Record<number, { text: string, dayIcon: string, nightIcon: string }> = {
  0: { text: '晴朗', dayIcon: 'i-heroicons-sun-20-solid', nightIcon: 'i-heroicons-moon-20-solid' },
  1: { text: '晴间多云', dayIcon: 'i-heroicons-sun-20-solid', nightIcon: 'i-heroicons-moon-20-solid' },
  2: { text: '多云', dayIcon: 'i-heroicons-cloud-20-solid', nightIcon: 'i-heroicons-cloud-20-solid' },
  3: { text: '阴天', dayIcon: 'i-heroicons-cloud-20-solid', nightIcon: 'i-heroicons-cloud-20-solid' },
  45: { text: '雾', dayIcon: 'i-heroicons-variable-20-solid', nightIcon: 'i-heroicons-variable-20-solid' },
  61: { text: '小雨', dayIcon: 'i-heroicons-cloud-rain-20-solid', nightIcon: 'i-heroicons-cloud-rain-20-solid' },
  95: { text: '雷阵雨', dayIcon: 'i-heroicons-bolt-20-solid', nightIcon: 'i-heroicons-bolt-20-solid' }
}

const fetchWeather = async () => {
  try {
    // 定位 API — 优先使用 ipapi.co，失败回退到 ipwho.is
    let lat = 0
    let lon = 0
    try {
      const providers = [
        'https://ipapi.co/json/',
        'https://ipwho.is/json'
      ]
      let geoData: any = null

      for (const url of providers) {
        try {
          const res = await fetch(url)
          if (!res.ok) continue
          const data = await res.json()
          const maybeLat = data.latitude ?? data.lat ?? null
          const maybeLon = data.longitude ?? data.lon ?? data.long ?? null
          if (maybeLat != null && maybeLon != null) {
            geoData = data
            lat = parseFloat(maybeLat)
            lon = parseFloat(maybeLon)
            weather.value.city = data.city || data.region || '未知'
            break
          }
        } catch (e) {
          // 尝试下一个提供者
          continue
        }
      }

      if (!geoData) {
        throw new Error('无法从定位服务获取坐标')
      }
    } catch (err) {
      console.warn('[Geo Service Warning]:', err)
      weather.value.city = '未知'
      throw err
    }

    // 天气 API
    const weatherRes = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`
    )
    const data = await weatherRes.json()

    if (data.current_weather) {
      const { temperature, weathercode, is_day } = data.current_weather

      // 根据 code 获取基础信息
      const condition = weatherMap[weathercode] || { text: '未知', dayIcon: 'i-heroicons-sun-20-solid', nightIcon: 'i-heroicons-moon-20-solid' }

      // 根据昼夜状态切换图标
      weather.value.temp = Math.round(temperature)
      weather.value.description = condition.text
      weather.value.icon = is_day === 1 ? condition.dayIcon : condition.nightIcon
    }
  } catch (error) {
    console.error('[Weather Service Error]:', error)
    weather.value.description = '离线模式'
  }
}

onMounted(() => {
  if (playerShow.value && musicConfig.enable) {
    loadMusicData()
  }
  fetchContributions() // 获取 GitHub 数据
  fetchWeather() // 获取实时天气
})

onBeforeUnmount(() => {
  player.value?.destroy()
})
</script>

<style scoped lang="scss">
.lyric-fade-enter-active,
.lyric-fade-leave-active {
  transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.lyric-fade-enter-from {
  opacity: 0;
  transform: translateY(8px);
  filter: blur(4px);
}

.lyric-fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
  filter: blur(4px);
}
</style>
