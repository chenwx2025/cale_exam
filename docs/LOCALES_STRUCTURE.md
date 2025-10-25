# 翻译文件位置说明

## 当前工作配置

### 文件位置
翻译文件位于项目**根目录**下：
```
cale_exam/
├── locales/          ← 翻译文件在这里（正在使用）
│   ├── zh.json      ← 中文翻译
│   └── en.json      ← 英文翻译
└── i18n/
    └── locales/      ← 备份位置（您在 IDE 中打开的是这里）
        ├── zh.json
        └── en.json
```

### 配置
```typescript
// nuxt.config.ts
i18n: {
  locales: [
    { code: 'zh', file: 'zh.json' },
    { code: 'en', file: 'en.json' }
  ],
  lazy: true,
  langDir: 'locales',  // 指向根目录的 locales/
  defaultLocale: 'zh'
}
```

## 为什么使用根目录的 locales/?

经过测试发现，@nuxtjs/i18n v10.1.1 在处理 `langDir` 时会进行路径拼接：
- 如果设置 `langDir: 'i18n/locales'`，实际会查找 `/i18n/i18n/locales/` ❌
- 如果设置 `langDir: 'locales'`，正确查找 `/locales/` ✅

## 如果要编辑翻译

**请编辑根目录的文件**：
- `/locales/zh.json` ← 编辑这个
- `/locales/en.json` ← 编辑这个

而不是：
- `/i18n/locales/zh.json` ← 这只是备份
- `/i18n/locales/en.json` ← 这只是备份

## 快速验证

运行以下命令验证翻译是否正常：
```bash
npm run dev
# 访问 http://localhost:3001/
# 应该看到中文界面：中医考试学习系统、海量题库等
```
