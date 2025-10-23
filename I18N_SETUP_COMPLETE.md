# i18n 国际化配置完成

## 完成内容

### 1. 翻译文件
- ✅ `/locales/zh.json` - 中文翻译（250+ 键）
- ✅ `/locales/en.json` - 英文翻译（250+ 键）

### 2. 配置文件
- ✅ `nuxt.config.ts` - i18n 模块配置
  - 使用 lazy loading 加载翻译文件
  - 配置语言切换 cookie 持久化
  - 设置默认语言为中文（zh）

### 3. 已更新的页面
- ✅ `pages/index.vue` - 首页使用 $t() 函数
- ✅ `pages/dashboard.vue` - 学习中心使用 $t() 函数
- ✅ `pages/achievements.vue` - 成就页面使用 $t() 函数
- ✅ `layouts/default.vue` - 布局文件已包含语言切换器

### 4. 功能验证
- ✅ 中文翻译正确显示
- ✅ 英文翻译正确显示
- ✅ 语言切换功能正常工作
- ✅ Cookie 持久化正常

## 技术要点

### 最终配置
```typescript
// nuxt.config.ts
i18n: {
  locales: [
    { code: 'zh', iso: 'zh-CN', name: '中文', file: 'zh.json' },
    { code: 'en', iso: 'en-US', name: 'English', file: 'en.json' }
  ],
  lazy: true,
  langDir: 'locales',
  defaultLocale: 'zh',
  strategy: 'no_prefix',
  detectBrowserLanguage: {
    useCookie: true,
    cookieKey: 'i18n_locale',
    fallbackLocale: 'zh'
  }
}
```

### 关键发现
- @nuxtjs/i18n v10.1.1 使用 lazy loading 时，`langDir` 应指向项目根目录的相对路径
- 翻译文件必须放在项目根目录的 `locales/` 文件夹（不能嵌套在 `i18n/locales/`）
- 使用 JSON 格式而非 TypeScript 格式可以避免导入问题

## 测试结果

### 中文测试
```bash
curl -s http://localhost:3001/ | grep -oE "中医考试学习系统|海量题库"
```
输出：中医考试学习系统、海量题库 ✅

### 英文测试
```bash
curl -s -H "Cookie: i18n_locale=en" http://localhost:3001/ | grep -oE "TCM Exam|Extensive Question"
```
输出：TCM Exam Learning System、Extensive Question Bank ✅

## 下一步
所有 i18n 基础功能已完成并验证通过。如需添加更多页面的翻译，只需：
1. 在 `locales/zh.json` 和 `locales/en.json` 中添加翻译键
2. 在页面中使用 `$t('your.key')` 或 `t('your.key')`
