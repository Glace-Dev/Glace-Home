import userConfig from './config'

export default defineNuxtConfig({
  modules: ['@nuxt/eslint','@nuxt/ui', '@nuxtjs/sitemap', '@nuxtjs/robots'],
  ssr: true,
  app: {
    head: {
      htmlAttrs: { lang: 'zh-CN' },
      title: userConfig.site?.title || 'glace\'s Home',
      link: [
        { rel: 'icon', type: 'image/png', href: '/favicon.ico' },
        { rel: 'apple-touch-icon', href: '/favicon.ico' }
      ]
    }
  },
  css: ['~/assets/css/main.css'],
  site: {
    url: userConfig.site?.url || 'https://glace.top',
    name: userConfig.site?.name || 'glace的主页',
    description: userConfig.site?.description || 'glace的主页,集成了博客,网盘,联系方式等,更多功能正在开发中...欢迎各位朋友一起交流学习！'
  },
  ui: {
    fonts: false
  },
  routeRules: {
    '/': { prerender: true, isr: 3600 * 24 * 7 }
  },
  compatibilityDate: '2026-02-15'
})
