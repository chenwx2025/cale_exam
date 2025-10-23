# 中医考试系统 - 统一设计系统

## 🎨 设计原则

### 核心价值观
- **专业可靠**：医学教育平台的严谨性和专业性
- **清晰易用**：信息层次清晰，操作流畅直观
- **现代活力**：渐变色彩和动效带来现代感和学习动力
- **一致性**：所有页面遵循统一的视觉语言

---

## 🌈 颜色系统

### 主色调
```css
/* 蓝色系 - 用于CALE考试和主要操作 */
--primary-blue-50: rgb(239, 246, 255)
--primary-blue-100: rgb(219, 234, 254)
--primary-blue-500: rgb(59, 130, 246)
--primary-blue-600: rgb(37, 99, 235)
--primary-blue-700: rgb(29, 78, 216)

/* 紫色系 - 用于NCCAOM考试和强调 */
--primary-purple-50: rgb(250, 245, 255)
--primary-purple-100: rgb(243, 232, 255)
--primary-purple-500: rgb(168, 85, 247)
--primary-purple-600: rgb(147, 51, 234)
--primary-purple-700: rgb(126, 34, 206)

/* 靛蓝色 - 用于深度和层次 */
--primary-indigo-500: rgb(99, 102, 241)
--primary-indigo-600: rgb(79, 70, 229)
--primary-indigo-700: rgb(67, 56, 202)
```

### 功能色
```css
/* 成功 - 绿色 */
--success-50: rgb(240, 253, 244)
--success-500: rgb(34, 197, 94)
--success-600: rgb(22, 163, 74)

/* 警告 - 黄色/橙色 */
--warning-50: rgb(255, 251, 235)
--warning-500: rgb(245, 158, 11)
--warning-600: rgb(217, 119, 6)

/* 错误 - 红色 */
--error-50: rgb(254, 242, 242)
--error-500: rgb(239, 68, 68)
--error-600: rgb(220, 38, 38)

/* 中性色 - 灰色 */
--gray-50: rgb(249, 250, 251)
--gray-100: rgb(243, 244, 246)
--gray-200: rgb(229, 231, 235)
--gray-300: rgb(209, 213, 219)
--gray-600: rgb(75, 85, 99)
--gray-700: rgb(55, 65, 81)
--gray-900: rgb(17, 24, 39)
```

### 渐变组合
```css
/* 主要渐变 */
bg-gradient-to-r from-blue-600 to-indigo-600  /* 主按钮、标题卡片 */
bg-gradient-to-r from-blue-500 to-blue-700     /* CALE考试标识 */
bg-gradient-to-r from-purple-500 to-purple-700 /* NCCAOM考试标识 */
bg-gradient-to-br from-blue-50 via-white to-indigo-50  /* 页面背景 */
bg-gradient-to-br from-blue-50 via-white to-purple-50  /* 知识点页面背景 */

/* 功能渐变 */
bg-gradient-to-r from-green-500 to-green-600   /* 成功/掌握 */
bg-gradient-to-r from-red-500 to-orange-500    /* 错误/警告 */
bg-gradient-to-r from-purple-600 to-pink-600   /* 特殊功能 */
```

---

## 📐 布局系统

### 容器宽度
```css
max-w-6xl    /* 首页Hero区域，居中内容 */
max-w-7xl    /* Dashboard主要内容区 */
max-w-[1920px]  /* 知识点页面，超宽内容 */
```

### 间距系统
```css
/* 页面级间距 */
px-4 py-8    /* 小屏默认padding */
px-6 py-8    /* 中屏padding */

/* 内容块间距 */
space-y-4    /* 紧凑列表 */
space-y-6    /* 标准间距 */
space-y-8    /* 宽松间距 */

/* 网格间距 */
gap-4        /* 紧凑网格 */
gap-6        /* 标准网格 */
gap-8        /* 宽松网格 */
```

### 响应式网格
```css
/* 2列布局 */
grid md:grid-cols-2 gap-6

/* 3列布局 */
grid md:grid-cols-2 lg:grid-cols-3 gap-6

/* Dashboard布局 */
grid lg:grid-cols-3 gap-6  /* 左2右1 */
lg:col-span-2              /* 主内容区 */

/* 知识点页面 */
grid lg:grid-cols-5 gap-8  /* 左1右4 */
lg:col-span-4              /* 内容区 */
```

---

## 🔲 卡片组件

### 标准卡片
```html
<div class="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all p-6">
  <!-- 内容 -->
</div>
```

### 交互卡片（可点击）
```html
<div class="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-1">
  <!-- 内容 -->
</div>
```

### 渐变头部卡片
```html
<div class="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg p-8 text-white">
  <!-- 头部内容 -->
</div>
```

### 信息卡片（带左边框）
```html
<div class="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500">
  <!-- 信息内容 -->
</div>
```

---

## 🔘 按钮系统

### 主要按钮
```html
<!-- 大型主要操作 -->
<button class="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all transform hover:-translate-y-0.5">
  立即开始
</button>

<!-- 标准主要操作 -->
<button class="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl">
  开始练习
</button>
```

### 次要按钮
```html
<!-- 白底蓝边 -->
<button class="px-8 py-3 bg-white text-blue-600 border-2 border-blue-600 rounded-xl font-semibold hover:bg-blue-50 transition-colors">
  登录账号
</button>

<!-- 灰底 -->
<button class="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all shadow-sm hover:shadow-md">
  返回
</button>
```

### 功能按钮
```html
<!-- 成功/完成 -->
<button class="px-4 py-3 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-all">
  ✓ 已掌握
</button>

<!-- 警告/错误 -->
<button class="px-4 py-3 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-all">
  查看错题
</button>

<!-- 特殊功能 -->
<button class="px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all">
  卡片复习
</button>
```

### 小按钮
```html
<button class="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors">
  全部展开
</button>
```

---

## 📊 数据展示

### 统计卡片
```html
<div class="p-4 bg-blue-50 rounded-xl">
  <div class="flex items-center justify-between mb-1">
    <span class="text-sm text-gray-600">学习计划</span>
    <span class="text-lg font-bold text-blue-600">5</span>
  </div>
  <div class="text-xs text-gray-500">个活跃计划</div>
</div>
```

### 进度条
```html
<!-- 简单进度条 -->
<div class="bg-gray-200 rounded-full h-2">
  <div class="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500" style="width: 75%"></div>
</div>

<!-- 复杂进度条（正确+错误） -->
<div class="relative bg-gray-200 rounded-full h-6 overflow-hidden">
  <div class="absolute inset-y-0 left-0 bg-gradient-to-r from-green-400 to-green-600 rounded-full" style="width: 60%"></div>
  <div class="absolute inset-y-0 bg-gradient-to-r from-red-400 to-red-600 rounded-full" style="left: 60%; width: 20%"></div>
</div>
```

### 徽章（Badge）
```html
<!-- 难度徽章 -->
<span class="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700">简单</span>
<span class="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-700">中等</span>
<span class="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-700">困难</span>

<!-- 状态徽章 -->
<span class="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-semibold">CALE</span>
```

---

## 🎯 图标系统

### 图标容器
```html
<!-- 大型图标（Hero、功能卡片） -->
<div class="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
  <svg class="w-7 h-7 text-white">...</svg>
</div>

<!-- 中型图标（快速入口） -->
<div class="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
  <svg class="w-5 h-5 text-purple-600">...</svg>
</div>

<!-- 小型图标（列表项） -->
<div class="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 text-white rounded-full flex items-center justify-center font-bold shadow-md">
  1
</div>
```

### 图标颜色
- **主要操作**：蓝色系（blue-500, blue-600）
- **成功/掌握**：绿色系（green-500, green-600）
- **学习计划**：绿色或紫色
- **统计分析**：橙色或紫色
- **时间/历史**：靛蓝色
- **错误/警告**：红色或橙色

---

## 🔤 字体系统

### 标题
```css
text-5xl font-bold text-gray-900  /* 主标题（Hero） */
text-4xl font-bold text-gray-900  /* 一级标题 */
text-3xl font-bold text-gray-900  /* 二级标题 */
text-2xl font-bold text-gray-900  /* 三级标题 */
text-xl font-bold text-gray-900   /* 四级标题 */
text-lg font-bold text-gray-900   /* 小标题 */
```

### 正文
```css
text-xl text-gray-600             /* 大型说明文字 */
text-base text-gray-700           /* 正文 */
text-sm text-gray-600             /* 小号正文 */
text-xs text-gray-500             /* 辅助信息 */
```

### 特殊文字
```css
font-semibold                     /* 半粗体，用于重要信息 */
font-bold                         /* 粗体，用于标题和数字 */
text-white                        /* 白色文字，渐变背景上使用 */
text-blue-600                     /* 蓝色文字，链接和强调 */
```

---

## 🎭 动画和过渡

### 标准过渡
```css
transition-all                    /* 所有属性过渡 */
transition-colors                 /* 仅颜色过渡 */
transition-transform              /* 仅变换过渡 */
transition-shadow                 /* 仅阴影过渡 */
```

### 悬停效果
```css
hover:shadow-xl                   /* 卡片悬停 */
hover:-translate-y-1              /* 卡片悬停上移 */
hover:-translate-y-0.5            /* 按钮悬停微上移 */
hover:scale-110                   /* 图标悬停放大 */
hover:bg-gray-50                  /* 列表项悬停 */
```

### 加载动画
```css
animate-spin                      /* 旋转加载器 */
animate-pulse                     /* 脉动效果 */
```

---

## 📱 响应式断点

```css
sm:  640px   /* 小屏幕（手机横屏） */
md:  768px   /* 中屏幕（平板） */
lg:  1024px  /* 大屏幕（桌面） */
xl:  1280px  /* 超大屏 */
2xl: 1536px  /* 超超大屏 */
```

### 常用响应式模式
```html
<!-- 移动端隐藏，桌面显示 -->
<div class="hidden md:block">...</div>

<!-- 移动端显示，桌面隐藏 -->
<div class="block md:hidden">...</div>

<!-- 响应式网格 -->
<div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">...</div>

<!-- 响应式文字 -->
<h1 class="text-3xl md:text-4xl lg:text-5xl">...</h1>
```

---

## 🎨 特殊组件样式

### 考试类型标识
```html
<!-- CALE -->
<div class="bg-gradient-to-r from-blue-500 to-blue-700 text-white p-6 rounded-2xl">
  <h2>CALE 加州中医执照考试</h2>
</div>

<!-- NCCAOM -->
<div class="bg-gradient-to-r from-purple-500 to-purple-700 text-white p-6 rounded-2xl">
  <h2>NCCAOM 全国中医针灸认证</h2>
</div>
```

### 通知铃铛
```html
<div class="relative">
  <svg class="w-6 h-6 text-gray-600">...</svg>
  <span class="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">3</span>
</div>
```

### 用户头像
```html
<div class="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold shadow-md">
  A
</div>
```

---

## ✅ 设计检查清单

使用此清单确保所有页面符合设计系统：

- [ ] 使用统一的渐变背景（`from-blue-50 via-white to-indigo-50`）
- [ ] 卡片使用 `rounded-2xl` 和 `shadow-lg`
- [ ] 主按钮使用渐变背景和悬停效果
- [ ] 标题使用正确的字体大小和粗细
- [ ] 图标容器有圆角和阴影
- [ ] 所有交互元素有过渡动画
- [ ] 颜色符合CALE（蓝色）/NCCAOM（紫色）区分
- [ ] 响应式布局在所有断点正常工作
- [ ] 徽章和标签使用正确的背景色
- [ ] 间距使用标准的 spacing scale

---

## 📦 常用组件模板

### Feature Card（功能卡片）
```html
<div class="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
  <div class="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
    <svg class="w-7 h-7 text-blue-600">...</svg>
  </div>
  <h3 class="text-xl font-bold text-gray-900 mb-2">功能标题</h3>
  <p class="text-gray-600">功能描述文字</p>
</div>
```

### Action Card（操作卡片）
```html
<NuxtLink to="/path" class="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-1">
  <div class="flex items-start justify-between mb-4">
    <div class="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
      <svg class="w-7 h-7 text-white">...</svg>
    </div>
    <svg class="w-6 h-6 text-gray-400 group-hover:text-blue-600 transition-colors">→</svg>
  </div>
  <h3 class="text-xl font-bold text-gray-900 mb-2">操作标题</h3>
  <p class="text-gray-600 text-sm">操作说明</p>
</NuxtLink>
```

### Quick Link（快速链接）
```html
<NuxtLink to="/path" class="flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors group">
  <div class="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
    <svg class="w-5 h-5 text-purple-600">...</svg>
  </div>
  <div>
    <div class="font-semibold text-gray-900">链接标题</div>
    <div class="text-xs text-gray-500">说明文字</div>
  </div>
</NuxtLink>
```

---

**版本**：1.0
**更新日期**：2025-10-22
**维护者**：开发团队

使用此设计系统可确保整个应用的视觉一致性和用户体验质量。
