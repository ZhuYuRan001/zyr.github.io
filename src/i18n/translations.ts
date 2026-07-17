export const translations = {
  // Layout
  "site.title": {
    zh: "ZYR | 像素探险博客",
    en: "ZYR | Pixel Quest Blog",
  },
  "site.description": {
    zh: "一个复古 8-bit RPG 风格的个人博客，关于前端、设计和生活。",
    en: "A retro 8-bit RPG style personal blog about frontend, design, and life.",
  },

  // Header
  "nav.home": { zh: "Home", en: "Home" },
  "nav.blog": { zh: "Blog", en: "Blog" },
  "nav.projects": { zh: "Projects", en: "Projects" },
  "nav.about": { zh: "About", en: "About" },
  "nav.rss": { zh: "RSS", en: "RSS" },
  "mobile.menu": { zh: "MENU", en: "MENU" },

  // Footer
  "footer.madeWith": { zh: "Made with", en: "Made with" },
  "footer.pressStart": { zh: "按 Start 继续...", en: "Press Start" },

  // Homepage
  "home.greeting": { zh: "你好！欢迎回来！", en: "Hello! Welcome back!" },
  "home.prompt": {
    zh: "你想探索些什么呢？",
    en: "What would you like to explore?",
  },

  // Blog list
  "blog.title": { zh: "Blog", en: "Blog" },
  "blog.description": {
    zh: "关于前端、设计和生活的所有文章。",
    en: "All articles about frontend, design, and life.",
  },
  "blog.search": { zh: "搜索...", en: "Search..." },
  "blog.all": { zh: "全部", en: "All" },
  "blog.noData": { zh: "没有数据", en: "NO DATA" },
  "blog.noArticles": {
    zh: "还没有文章，稍后再来看看吧！",
    en: "There are no articles yet. Check back later!",
  },
  "blog.readingTime": {
    zh: "分钟阅读",
    en: "min read",
  },
  "blog.questLog": { zh: "任务日志", en: "QUEST LOG" },

  // About page
  "about.title": { zh: "状态", en: "STATUS" },
  "about.name": { zh: "姓名", en: "NAME" },
  "about.class": { zh: "职业", en: "CLASS" },
  "about.frontendEngineer": { zh: "前端工程师", en: "Frontend Engineer" },
  "about.lv": { zh: "等级", en: "LV" },
  "about.exp": { zh: "经验值", en: "EXP" },
  "about.bio": { zh: "简介", en: "BIO" },
  "about.bioText": {
    zh: "一名热爱构建美观、易用的 Web 体验的前端工程师。我享受在设计工程的交汇处工作。不写代码的时候，我可能在看书、拍照，或探索像素艺术。",
    en: "A frontend engineer passionate about building beautiful, accessible web experiences. I love working at the intersection of design and engineering. When I'm not coding, you'll find me reading, taking photos, or exploring pixel art.",
  },
  "about.questLog": { zh: "任务日志", en: "QUEST LOG" },
  "about.seniorFrontend": {
    zh: "高级前端工程师",
    en: "Senior Frontend Engineer",
  },
  "about.frontend": { zh: "前端工程师", en: "Frontend Engineer" },
  "about.equipment": { zh: "装备", en: "EQUIPMENT" },
  "about.items": { zh: "道具", en: "ITEMS" },
  "about.contact": {
    zh: "通过 GitHub 或 Email 联系我。",
    en: "Send a message via GitHub or Email.",
  },
  "about.continue": {
    zh: "按 A 键继续...",
    en: "Press A to continue...",
  },

  // Projects page
  "projects.title": { zh: "Projects", en: "Projects" },
  "projects.description": {
    zh: "我做过的项目。",
    en: "Projects I've worked on.",
  },
  "projects.inventory": { zh: "物品栏", en: "INVENTORY" },
  "projects.inventoryDesc": {
    zh: "旅途中收集的装备和道具。",
    en: "Equipment & Items collected on the journey.",
  },
  "projects.empty": { zh: "空的", en: "EMPTY" },
  "projects.emptyDesc": {
    zh: "物品栏是空的。",
    en: "No items in inventory yet.",
  },
  "projects.item": { zh: "道具", en: "ITEM" },
  "projects.itemDetail": { zh: "道具详情", en: "ITEM DETAIL" },
  "projects.github": { zh: "GitHub", en: "GitHub" },
  "projects.liveDemo": { zh: "在线演示", en: "Live Demo" },

  // Language switcher
  "lang.switch": { zh: "EN", en: "中文" },
  "lang.label": { zh: "切换到英文", en: "Switch to Chinese" },
} as const;

export type Locale = "zh" | "en";
export type TranslationKey = keyof typeof translations;
