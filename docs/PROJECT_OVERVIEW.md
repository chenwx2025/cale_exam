# Cale 加州中医考试系统 - 项目概览

## 项目简介

这是一个功能完整的在线考试准备平台，专为加州中医执照考试（Cale）设计。系统实现了考试大纲浏览、复习计划制定、模拟考试等核心功能，特别注重互动性和用户体验。

## 核心特色

### 1. 强互动性的答题体验
每道题目都会：
- 显示所属的考试大纲分类（如：中医基础理论、针灸学等）
- 标注难度级别（简单、中等、困难）
- 提交后立即显示对错，并给出详细解析
- 关联知识点，帮助用户了解题目在整个知识体系中的位置

### 2. 简单易用的题目管理
管理员只需：
1. 准备一个 Excel 或 CSV 文件
2. 在管理后台上传
3. 系统自动解析并导入所有题目

后端会自动处理：
- 文件解析（支持 Excel 和 CSV）
- 数据验证
- 分类匹配
- 错误报告

### 3. 完整的学习路径

```
首页 → 查看考试大纲 → 选择分类练习 → 答题并查看解析 → 创建学习计划 → 模拟考试
```

## 技术架构

### 前端技术栈
```
Nuxt 3 (Vue 3)
  ├── Tailwind CSS (样式)
  ├── TypeScript (类型安全)
  └── Pinia (状态管理)
```

### 后端技术栈
```
Nuxt Server API
  ├── Prisma ORM (数据库)
  ├── SQLite (默认数据库)
  └── XLSX (Excel 解析)
```

### 数据库设计

**核心表结构：**

1. **Category (分类表)**
   - 支持多级分类（parent-child 关系）
   - 三种类型：organization（组织）、content（内容）、review（复习）
   - 每个分类有唯一代码（用于 Excel 导入）

2. **Question (题目表)**
   - 关联到分类
   - 支持多种题型（选择题、判断题等）
   - 难度分级（easy、medium、hard）
   - 包含题目、选项、答案、解析

3. **User (用户表)**
   - 用户信息
   - 关联答题记录和学习计划

4. **UserAnswer (答题记录)**
   - 记录用户的每次答题
   - 统计正确率
   - 记录答题时间

5. **StudyPlan (学习计划)**
   - 自定义学习计划
   - 计划项目管理

## 文件结构

```
cale_exam/
├── components/
│   └── QuestionCard.vue          # 题目卡片组件（核心互动组件）
├── layouts/
│   └── default.vue                # 默认布局（导航栏+页脚）
├── pages/
│   ├── index.vue                  # 首页
│   ├── outline.vue                # 考试大纲（三个 Tab）
│   ├── practice.vue               # 练习页面（互动答题）
│   ├── exam.vue                   # 模拟考试（计时、答题卡）
│   ├── study-plan.vue             # 复习计划
│   └── admin.vue                  # 管理后台（上传题目、管理分类）
├── server/
│   ├── api/
│   │   ├── categories/            # 分类 API
│   │   │   ├── index.get.ts      # 获取所有分类
│   │   │   └── index.post.ts     # 创建分类
│   │   ├── questions/             # 题目 API
│   │   │   ├── index.get.ts      # 获取题目列表
│   │   │   └── [id].get.ts       # 获取单个题目
│   │   ├── upload/                # 上传 API
│   │   │   └── questions.post.ts # Excel/CSV 批量导入
│   │   └── users/                 # 用户 API
│   │       ├── answers.post.ts   # 提交答案
│   │       └── [userId]/stats.get.ts # 用户统计
│   └── utils/
│       └── prisma.ts              # Prisma 客户端单例
├── prisma/
│   ├── schema.prisma              # 数据库架构定义
│   └── seed.ts                    # 示例数据脚本
└── nuxt.config.ts                 # Nuxt 配置
```

## API 路由说明

### 分类相关
- `GET /api/categories?type=content` - 获取指定类型的分类
- `POST /api/categories` - 创建新分类

### 题目相关
- `GET /api/questions?categoryId=xxx&difficulty=medium&limit=10` - 获取题目
- `GET /api/questions/:id` - 获取单个题目详情

### 上传相关
- `POST /api/upload/questions` - 批量上传题目（multipart/form-data）

### 用户相关
- `POST /api/users/answers` - 提交答题记录
- `GET /api/users/:userId/stats` - 获取用户统计

## 使用流程

### 管理员流程

1. **创建分类**
   - 访问管理后台
   - 填写分类名称、代码、类型
   - 提交创建

2. **上传题目**
   - 准备 Excel 文件（或下载模板）
   - 在管理后台上传
   - 查看导入结果

### 用户流程

1. **浏览大纲**
   - 访问"考试大纲"页面
   - 查看三个部分的分类
   - 了解各分类的题目数量

2. **开始练习**
   - 点击某个分类
   - 进入互动答题页面
   - 查看题目、选择答案、提交
   - 查看解析和知识点关联

3. **模拟考试**
   - 配置考试（题目数、难度、范围）
   - 开始计时考试
   - 使用答题卡快速导航
   - 提交后查看成绩和统计

4. **制定计划**
   - 创建学习计划
   - 设置学习目标
   - 跟踪学习进度

## 数据流示例

### 答题流程

```
用户点击选项
  ↓
组件记录选择（selectedAnswer）
  ↓
用户点击"提交答案"
  ↓
组件计算是否正确（对比 correctAnswer）
  ↓
emit 事件到父组件，包含：
  - userAnswer: 用户的答案
  - isCorrect: 是否正确
  - timeSpent: 答题时间
  ↓
父组件记录答案
  ↓
（可选）发送到后端保存
  ↓
组件显示解析和知识点关联
```

### Excel 导入流程

```
用户上传 Excel 文件
  ↓
后端接收 multipart/form-data
  ↓
使用 XLSX 库解析 Excel
  ↓
转换为 JSON 数组
  ↓
遍历每一行：
  - 验证必填字段
  - 根据 categoryCode 查找分类
  - 创建题目记录
  ↓
返回结果统计：
  - success: 成功数量
  - failed: 失败数量
  - errors: 错误详情数组
```

## 扩展建议

### 短期扩展（1-2周）
1. 用户登录注册系统
2. 错题本功能
3. 学习进度图表
4. 移动端响应式优化

### 中期扩展（1-2月）
1. 多用户隔离
2. 学习小组和排行榜
3. 导出学习报告
4. 题目收藏功能

### 长期扩展（3-6月）
1. AI 智能推荐
2. 个性化学习路径
3. 视频讲解集成
4. PWA 离线学习

## 部署建议

### 简单部署（适合个人使用）
1. 使用 Vercel 或 Netlify
2. 数据库使用 Vercel Postgres 或 Neon
3. 一键部署

### 生产部署（适合团队）
1. 前后端：使用 Docker 容器化
2. 数据库：PostgreSQL + Redis 缓存
3. CDN：静态资源加速
4. 监控：日志和性能监控

## 性能优化

1. **前端优化**
   - 懒加载组件
   - 图片优化
   - 缓存策略

2. **后端优化**
   - Prisma 查询优化
   - API 响应缓存
   - 数据库索引

3. **数据库优化**
   - 已添加的索引：
     - Category: type, parentId
     - Question: categoryId, difficulty
     - UserAnswer: userId, questionId

## 安全建议

1. 添加用户认证（JWT 或 Session）
2. API 速率限制
3. 输入验证和清理
4. CSRF 保护
5. SQL 注入防护（Prisma 自动处理）

## 总结

这个项目提供了一个完整的在线考试系统框架，特别注重：
- **互动性**：每个操作都有即时反馈
- **易用性**：管理员上传简单，用户学习方便
- **可扩展性**：清晰的架构，便于添加新功能
- **类型安全**：TypeScript + Prisma 确保代码质量

希望这个系统能帮助您顺利通过 Cale 考试！
