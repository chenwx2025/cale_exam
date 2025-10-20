# Phase 4: 管理员系统 - 实施计划

## 目标
构建一个完整的管理员后台系统，用于管理用户、题目、考试配置和系统监控。

---

## 📋 核心功能模块

### 1. 管理员认证和权限 (Priority: High)
- [ ] 在 User model 中添加 `role` 字段（user, admin）
- [ ] 数据库迁移：添加 role 字段
- [ ] 创建 `requireAdmin()` 中间件
- [ ] 创建管理员登录页面
- [ ] 修改 authStore 支持 role 信息

### 2. 管理员导航和布局 (Priority: High)
- [ ] 创建管理员布局组件 `layouts/admin.vue`
- [ ] 创建管理员侧边栏导航
- [ ] 创建管理员顶部导航栏
- [ ] 添加权限检查（非管理员重定向）

### 3. 用户管理 (Priority: High)
- [ ] 用户列表页面 `/admin/users`
- [ ] 用户详情查看
- [ ] 用户订阅管理（添加/移除考试订阅）
- [ ] 用户状态管理（启用/禁用）
- [ ] 用户统计查看
- [ ] API: GET /api/admin/users - 获取用户列表
- [ ] API: GET /api/admin/users/:id - 获取用户详情
- [ ] API: PUT /api/admin/users/:id - 更新用户信息
- [ ] API: POST /api/admin/users/:id/subscriptions - 管理订阅

### 4. 题目管理 (Priority: High)
- [ ] 题目列表页面 `/admin/questions`
- [ ] 题目创建页面
- [ ] 题目编辑页面
- [ ] 题目删除功能
- [ ] 批量导入题目（CSV/JSON）
- [ ] 题目分类管理
- [ ] API: GET /api/admin/questions - 获取题目列表
- [ ] API: POST /api/admin/questions - 创建题目
- [ ] API: PUT /api/admin/questions/:id - 更新题目
- [ ] API: DELETE /api/admin/questions/:id - 删除题目
- [ ] API: POST /api/admin/questions/import - 批量导入

### 5. 分类管理 (Priority: Medium)
- [ ] 分类列表页面 `/admin/categories`
- [ ] 分类创建/编辑
- [ ] 分类删除（检查是否有关联题目）
- [ ] API: GET /api/admin/categories - 获取分类列表
- [ ] API: POST /api/admin/categories - 创建分类
- [ ] API: PUT /api/admin/categories/:id - 更新分类
- [ ] API: DELETE /api/admin/categories/:id - 删除分类

### 6. 系统仪表盘 (Priority: Medium)
- [ ] 管理员首页 `/admin/dashboard`
- [ ] 总体统计卡片（用户数、题目数、考试数）
- [ ] 最近注册用户
- [ ] 最活跃用户
- [ ] 题目统计（按考试类型、难度）
- [ ] 系统使用趋势图表
- [ ] API: GET /api/admin/stats - 获取管理员统计数据

### 7. 考试配置管理 (Priority: Low)
- [ ] 考试类型配置页面
- [ ] 考试大纲编辑
- [ ] 题目分布配置
- [ ] 难度权重配置

### 8. 系统日志和监控 (Priority: Low)
- [ ] 用户活动日志
- [ ] 系统错误日志
- [ ] API 访问日志
- [ ] 性能监控

---

## 🗂️ 文件结构

```
cale_exam/
├── prisma/
│   └── schema.prisma (添加 role 字段)
├── server/
│   ├── api/
│   │   └── admin/
│   │       ├── users/
│   │       │   ├── index.get.ts (用户列表)
│   │       │   ├── [id].get.ts (用户详情)
│   │       │   ├── [id].put.ts (更新用户)
│   │       │   └── [id]/
│   │       │       └── subscriptions.post.ts (管理订阅)
│   │       ├── questions/
│   │       │   ├── index.get.ts (题目列表)
│   │       │   ├── index.post.ts (创建题目)
│   │       │   ├── [id].get.ts (题目详情)
│   │       │   ├── [id].put.ts (更新题目)
│   │       │   ├── [id].delete.ts (删除题目)
│   │       │   └── import.post.ts (批量导入)
│   │       ├── categories/
│   │       │   ├── index.get.ts
│   │       │   ├── index.post.ts
│   │       │   ├── [id].put.ts
│   │       │   └── [id].delete.ts
│   │       └── stats.get.ts (管理员统计)
│   └── utils/
│       └── admin-helpers.ts (requireAdmin 中间件)
├── pages/
│   └── admin/
│       ├── index.vue (管理员首页/仪表盘)
│       ├── users/
│       │   ├── index.vue (用户列表)
│       │   └── [id].vue (用户详情)
│       ├── questions/
│       │   ├── index.vue (题目列表)
│       │   ├── create.vue (创建题目)
│       │   └── [id]/
│       │       └── edit.vue (编辑题目)
│       └── categories/
│           └── index.vue (分类管理)
├── layouts/
│   └── admin.vue (管理员布局)
└── components/
    └── admin/
        ├── Sidebar.vue (侧边栏)
        ├── TopNav.vue (顶部导航)
        ├── UserTable.vue (用户表格)
        ├── QuestionTable.vue (题目表格)
        ├── QuestionForm.vue (题目表单)
        └── StatsCard.vue (统计卡片)
```

---

## 🎨 UI/UX 设计

### 配色方案
- **主色**: 深蓝色 (#1e40af) - 专业、权威
- **次色**: 紫色 (#7c3aed) - 创新、现代
- **成功**: 绿色 (#059669)
- **警告**: 橙色 (#ea580c)
- **错误**: 红色 (#dc2626)

### 布局结构
```
┌─────────────────────────────────────────┐
│  顶部导航栏 (Logo, 搜索, 用户菜单)      │
├──────┬──────────────────────────────────┤
│      │                                  │
│ 侧   │  主内容区                         │
│ 边   │  ┌────────────────────────────┐  │
│ 栏   │  │  面包屑导航                 │  │
│      │  ├────────────────────────────┤  │
│ 仪   │  │                            │  │
│ 表   │  │  页面内容                   │  │
│ 盘   │  │                            │  │
│ 用   │  │                            │  │
│ 户   │  │                            │  │
│ 题   │  │                            │  │
│ 目   │  │                            │  │
│ ...  │  └────────────────────────────┘  │
│      │                                  │
└──────┴──────────────────────────────────┘
```

---

## 🔐 权限系统设计

### Role 枚举
- `USER`: 普通用户
- `ADMIN`: 管理员

### 权限检查流程
```typescript
// 后端中间件
export function requireAdmin(event: H3Event) {
  const currentUser = requireAuth(event)

  if (currentUser.role !== 'ADMIN') {
    throw createError({
      statusCode: 403,
      message: 'Forbidden: Admin access required'
    })
  }

  return currentUser
}

// 前端路由守卫
middleware/admin.ts
export default defineNuxtRouteMiddleware((to, from) => {
  const authStore = useAuthStore()

  if (!authStore.isAdmin) {
    return navigateTo('/')
  }
})
```

---

## 📊 数据库变更

### User Model 更新
```prisma
model User {
  id                String   @id @default(uuid())
  email             String   @unique
  username          String   @unique
  password          String
  role              Role     @default(USER)  // 新增
  subscribedExams   String[] // 保持不变
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  // 关系保持不变
  studyPlans        StudyPlan[]
  exams             Exam[]
  userAnswers       UserAnswer[]
  wrongQuestions    WrongQuestion[]
}

enum Role {
  USER
  ADMIN
}
```

---

## 🔄 实施顺序

### Sprint 1: 基础架构 (核心)
1. ✅ 数据库迁移 - 添加 role 字段
2. ✅ 创建 requireAdmin 中间件
3. ✅ 创建管理员布局
4. ✅ 创建管理员仪表盘首页
5. ✅ 更新 authStore 支持 role

### Sprint 2: 用户管理 (高优先级)
1. ✅ 用户列表 API
2. ✅ 用户列表页面
3. ✅ 用户详情 API
4. ✅ 用户详情页面
5. ✅ 订阅管理功能

### Sprint 3: 题目管理 (高优先级)
1. ✅ 题目列表 API
2. ✅ 题目列表页面
3. ✅ 题目创建 API + 页面
4. ✅ 题目编辑 API + 页面
5. ✅ 题目删除 API

### Sprint 4: 高级功能 (中优先级)
1. ✅ 批量导入题目
2. ✅ 分类管理
3. ✅ 统计图表
4. ✅ 搜索和过滤

---

## 📝 API 端点设计

### 用户管理 APIs
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /api/admin/users | 获取用户列表（分页、搜索） | Admin |
| GET | /api/admin/users/:id | 获取用户详情 | Admin |
| PUT | /api/admin/users/:id | 更新用户信息 | Admin |
| POST | /api/admin/users/:id/subscriptions | 管理用户订阅 | Admin |
| PUT | /api/admin/users/:id/status | 启用/禁用用户 | Admin |

### 题目管理 APIs
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /api/admin/questions | 获取题目列表 | Admin |
| GET | /api/admin/questions/:id | 获取题目详情 | Admin |
| POST | /api/admin/questions | 创建题目 | Admin |
| PUT | /api/admin/questions/:id | 更新题目 | Admin |
| DELETE | /api/admin/questions/:id | 删除题目 | Admin |
| POST | /api/admin/questions/import | 批量导入题目 | Admin |

### 分类管理 APIs
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /api/admin/categories | 获取分类列表 | Admin |
| POST | /api/admin/categories | 创建分类 | Admin |
| PUT | /api/admin/categories/:id | 更新分类 | Admin |
| DELETE | /api/admin/categories/:id | 删除分类 | Admin |

### 统计 APIs
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /api/admin/stats | 获取管理员统计数据 | Admin |

---

## 🎯 成功标准

Phase 4 完成标准：
- [ ] 管理员可以登录并访问管理后台
- [ ] 管理员可以查看和管理所有用户
- [ ] 管理员可以为用户添加/移除考试订阅
- [ ] 管理员可以创建、编辑、删除题目
- [ ] 管理员可以批量导入题目
- [ ] 管理员可以管理分类
- [ ] 管理员可以查看系统统计数据
- [ ] 所有管理员功能都有权限保护
- [ ] UI 美观、响应式、易用

---

## 📦 技术栈

- **前端**: Nuxt 3 + Vue 3 + TypeScript + Tailwind CSS
- **后端**: Nuxt Server API + Prisma
- **认证**: JWT (复用现有系统)
- **权限**: Role-based access control (RBAC)
- **UI组件**: Headless UI / Radix Vue (可选)
- **图表**: Chart.js / ECharts (可选)

---

**Phase 4 开始时间**: 2025-10-20
**预计完成时间**: TBD
**当前状态**: Planning ✍️
