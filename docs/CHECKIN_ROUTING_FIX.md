# 打卡功能路由冲突修复

## 问题诊断过程

### 症状
- 点击打卡按钮返回 HTML 而不是 JSON
- 其他 API 功能正常工作
- Token 验证成功但打卡失败

### 根本原因
**Nuxt 路由文件结构冲突**

之前的错误结构：
```
server/api/study-groups/[id]/
├── check-in/              ← 文件夹
│   └── stats.get.ts
├── check-in.get.ts        ← 文件（与文件夹冲突！）
└── check-in.post.ts       ← 文件（与文件夹冲突！）
```

在 Nuxt 的文件路由系统中：
- 文件夹优先级高于同名文件
- 当访问 `/api/study-groups/[id]/check-in` 时
- 系统匹配到文件夹 `check-in/` 而不是文件 `check-in.post.ts`
- 导致找不到 POST 处理器，返回 HTML 错误页

## 解决方案

### 修复后的正确结构
```
server/api/study-groups/[id]/check-in/
├── index.get.ts     ← GET  /api/study-groups/[id]/check-in
├── index.post.ts    ← POST /api/study-groups/[id]/check-in
└── stats.get.ts     ← GET  /api/study-groups/[id]/check-in/stats
```

### 执行的操作
```bash
cd server/api/study-groups/[id]
mv check-in.get.ts check-in/index.get.ts
mv check-in.post.ts check-in/index.post.ts
```

## 测试步骤

1. 刷新浏览器（Cmd+R 或 F5）
2. 进入学习小组页面
3. 点击 "🔥 打卡" 标签
4. 点击 "🔥 打卡" 按钮

## 预期结果

✅ 打卡成功
✅ 显示打卡时间
✅ 统计数据更新（连续天数、累计天数、出勤率）
✅ 周历显示今天已打卡
✅ 排行榜更新

## 技术说明

### Nuxt 文件路由规则
- `folder/index.*.ts` → 匹配 `/folder`
- `folder.*.ts` → 也匹配 `/folder`
- 当两者同时存在时，文件夹优先
- 应避免同名文件和文件夹同时存在

### 为什么其他功能正常？
- GET 请求可能从缓存返回
- 或者 GET 文件先被移动，没有冲突
- POST 请求不缓存，直接暴露了路由问题

## 日期
2025-10-24

## 状态
✅ 已修复 - 等待测试确认
