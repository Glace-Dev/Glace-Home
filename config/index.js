export default {
    // 网站SEO配置
    site: {
        title: "glace's Home",
        url: 'https://glace.top',
        name: 'glace的主页',
        description:
            'glace的主页,集成了博客,网盘,联系方式等,更多功能正在开发中...欢迎各位朋友一起交流学习！',
        ogImage: '/home.webp' // SEO展示的图片
    },

    // 个人名称和职业信息
    profile: {
        name: 'glace',
        occupation: 'Developer'
    },

    // 社交链接和联系方式
    social: {
        githubProfile: 'https://github.com/Glace-Dev',
        githubUsername: 'Glace-Dev',
        telegram: 'https://t.me/sixty_three',
        email: 'ziyelixiang@gmail.com'
    },

    // Aplayer音乐播放器配置
    musicConfig: {
        id: '14353620803',
        server: 'netease', // 音乐平台，具体请参考Aplayer文档
        type: 'playlist',
        enable: true
    },

    // 页面中的快捷链接{名称，heroicons图标，链接地址，是否启用}
    links: [
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
};

// 图片等相关资源可以放在public目录下，可以直接修改