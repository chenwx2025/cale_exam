# CALE/NCCAOM 考试系统重新设计方案

## 📋 目录
1. [系统概述](#系统概述)
2. [核心功能需求](#核心功能需求)
3. [系统架构设计](#系统架构设计)
4. [数据库设计](#数据库设计)
5. [认证与授权系统](#认证与授权系统)
6. [用户角色与权限](#用户角色与权限)
7. [数据隔离策略](#数据隔离策略)
8. [API设计](#api设计)
9. [前端页面流程](#前端页面流程)
10. [实施路线图](#实施路线图)

---

## 系统概述

### 系统定位
一个支持多考试类型（CALE、NCCAOM等）的在线学习与考试平台，提供完整的用户认证、题库管理、学习计划、模拟考试等功能。

### 核心特性
- ✅ 多用户系统，每个用户独立数据空间
- ✅ 多考试类型支持（CALE、NCCAOM等）
- ✅ 角色权限管理（管理员、普通用户）
- ✅ 完整的认证授权体系
- ✅ 用户间数据完全隔离
- ✅ 管理员统一管理题库
- ✅ 用户自主生成学习计划和考试

---

## 核心功能需求

### 1. 用户系统
| 功能 | 说明 | 优先级 |
|------|------|--------|
| 用户注册 | 邮箱+密码注册，邮箱验证 | P0 |
| 用户登录 | 邮箱+密码登录，JWT Token | P0 |
| 找回密码 | 邮箱验证码重置密码 | P1 |
| 个人信息 | 修改昵称、头像、密码 | P1 |
| 考试订阅 | 用户选择订阅的考试类型 | P0 |

### 2. 管理员系统
| 功能 | 说明 | 优先级 |
|------|------|--------|
| 管理员登录 | 独立的管理员认证 | P0 |
| 题库管理 | CRUD题目，支持批量导入 | P0 |
| 用户管理 | 查看用户列表，停用/启用用户 | P1 |
| 数据统计 | 用户数量、题目数量、活跃度 | P2 |
| 考试类型管理 | 添加/编辑考试类型和大纲 | P1 |

### 3. 题库系统
| 功能 | 说明 | 优先级 |
|------|------|--------|
| 题库浏览 | 按考试类型、领域、难度筛选 | P0 |
| 题目详情 | 查看题目、答案、解析 | P0 |
| 题目搜索 | 关键词搜索题目内容 | P1 |

### 4. 学习计划
| 功能 | 说明 | 优先级 |
|------|------|--------|
| 创建计划 | 用户自定义学习计划 | P0 |
| 题目选择 | 从题库选择题目加入计划 | P0 |
| 进度跟踪 | 记录学习进度和完成状态 | P0 |
| 计划管理 | 编辑、删除、暂停计划 | P1 |

### 5. 模拟考试
| 功能 | 说明 | 优先级 |
|------|------|--------|
| 创建考试 | 手动配置或一键生成 | P0 |
| 全真模拟 | 按官方标准生成考试 | P0 |
| 考试答题 | 计时、标记、提交 | P0 |
| 成绩报告 | 分数、错题分析、知识点分析 | P0 |
| 考试历史 | 查看历史考试记录 | P1 |

### 6. 错题本
| 功能 | 说明 | 优先级 |
|------|------|--------|
| 自动收集 | 答错题目自动加入错题本 | P0 |
| 错题练习 | 针对错题重新练习 | P0 |
| 掌握度跟踪 | 记录重复练习情况 | P1 |

---

## 系统架构设计

### 技术栈
```
前端: Nuxt 3 + Vue 3 + TypeScript + TailwindCSS
后端: Nuxt Server API (Nitro)
数据库: SQLite (开发) / PostgreSQL (生产)
ORM: Prisma
认证: JWT + bcrypt
状态管理: Pinia
```

### 架构层次

```
┌─────────────────────────────────────────────┐
│           前端层 (Nuxt 3 Pages)             │
│  - 用户界面                                  │
│  - 管理员界面                                │
│  - 公共组件库                                │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│          中间件层 (Middleware)               │
│  - 身份验证中间件                            │
│  - 权限检查中间件                            │
│  - 日志记录中间件                            │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│         API层 (Server API Routes)           │
│  - 认证API (/api/auth/*)                    │
│  - 用户API (/api/user/*)                    │
│  - 题库API (/api/questions/*)               │
│  - 考试API (/api/exams/*)                   │
│  - 管理API (/api/admin/*)                   │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│         业务逻辑层 (Services)                │
│  - AuthService (认证服务)                   │
│  - UserService (用户服务)                   │
│  - QuestionService (题目服务)               │
│  - ExamService (考试服务)                   │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│         数据访问层 (Prisma ORM)              │
│  - User Model                               │
│  - Question Model                           │
│  - Exam Model                               │
│  - StudyPlan Model                          │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│              数据库层                        │
│  SQLite / PostgreSQL                        │
└─────────────────────────────────────────────┘
```

---

## 数据库设计

### 核心表结构变更

#### 1. User 表（用户表）增强

```prisma
model User {
  id                String          @id @default(cuid())
  email             String          @unique
  password          String          // bcrypt 加密
  name              String
  nickname          String?         // 昵称
  avatar            String?         // 头像URL
  role              String          @default("user") // user | admin
  emailVerified     Boolean         @default(false)
  emailVerifyToken  String?
  resetPasswordToken String?
  resetPasswordExpires DateTime?

  // 订阅的考试类型
  subscribedExams   UserExamSubscription[]

  // 用户状态
  status            String          @default("active") // active | suspended | deleted
  lastLoginAt       DateTime?
  loginCount        Int             @default(0)

  createdAt         DateTime        @default(now())
  updatedAt         DateTime        @updatedAt

  // 关联数据
  userAnswers       UserAnswer[]
  studyPlans        StudyPlan[]
  exams             Exam[]
  wrongQuestions    WrongQuestion[]
  studySessions     StudySession[]
}
```

#### 2. UserExamSubscription 表（用户考试订阅）

```prisma
model UserExamSubscription {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  examType    String   // cale | nccaom
  isActive    Boolean  @default(true)
  subscribedAt DateTime @default(now())
  expiresAt   DateTime? // 订阅过期时间（如果是付费订阅）

  @@unique([userId, examType])
  @@index([userId])
  @@index([examType])
}
```

#### 3. Question 表（题目表）保持现有结构
- 所有题目由管理员统一管理
- 通过 `examType` 字段区分不同考试
- 通过 `categoryId` 关联到具体领域

#### 4. StudyPlan 表（学习计划）已有 userId
- 保持现有结构
- 确保所有查询都基于 `userId` 过滤

#### 5. Exam 表（考试记录）已有 userId
- 保持现有结构
- 确保所有查询都基于 `userId` 过滤

### 新增表

#### 6. AdminLog 表（管理员操作日志）

```prisma
model AdminLog {
  id          String   @id @default(cuid())
  adminId     String   // 管理员用户ID
  action      String   // 操作类型: create_question, update_question, delete_question, etc.
  targetType  String   // 操作对象类型: question, user, category, etc.
  targetId    String?  // 操作对象ID
  details     String?  // 操作详情 JSON
  ipAddress   String?
  userAgent   String?
  createdAt   DateTime @default(now())

  @@index([adminId])
  @@index([action])
  @@index([createdAt])
}
```

#### 7. SystemSettings 表（系统设置）

```prisma
model SystemSettings {
  id          String   @id @default(cuid())
  key         String   @unique
  value       String   // JSON 格式
  description String?
  category    String   // auth, exam, notification, etc.
  updatedAt   DateTime @updatedAt
  updatedBy   String?  // 更新者用户ID
}
```

---

## 认证与授权系统

### JWT Token 设计

#### Access Token (短期令牌)
```typescript
{
  userId: string
  email: string
  role: string        // user | admin
  subscribedExams: string[] // ['cale', 'nccaom']
  exp: number         // 过期时间: 2小时
}
```

#### Refresh Token (长期令牌)
```typescript
{
  userId: string
  tokenVersion: number  // 用于撤销所有token
  exp: number          // 过期时间: 7天
}
```

### 认证流程

#### 1. 用户注册流程
```
用户填写表单
    ↓
验证邮箱格式、密码强度
    ↓
检查邮箱是否已存在
    ↓
bcrypt 加密密码
    ↓
创建用户记录（emailVerified=false）
    ↓
发送验证邮件
    ↓
返回注册成功（提示验证邮箱）
```

#### 2. 邮箱验证流程
```
用户点击邮件链接
    ↓
验证 token 有效性
    ↓
更新 emailVerified=true
    ↓
自动登录（生成JWT）
```

#### 3. 用户登录流程
```
用户输入邮箱密码
    ↓
查找用户记录
    ↓
bcrypt 验证密码
    ↓
检查 emailVerified
    ↓
检查用户状态（是否停用）
    ↓
生成 Access Token + Refresh Token
    ↓
更新 lastLoginAt、loginCount
    ↓
返回 tokens + 用户信息
```

#### 4. Token 刷新流程
```
Access Token 即将过期
    ↓
前端使用 Refresh Token 请求刷新
    ↓
验证 Refresh Token
    ↓
检查用户状态
    ↓
生成新的 Access Token
    ↓
返回新 token
```

---

## 用户角色与权限

### 角色定义

| 角色 | 权限范围 | 说明 |
|------|----------|------|
| **admin** | 全部系统管理权限 | 管理题库、用户、系统设置 |
| **user** | 个人学习数据权限 | 学习计划、考试记录、错题本 |

### 权限矩阵

| 功能模块 | Admin | User |
|---------|-------|------|
| 查看题库 | ✅ | ✅ |
| 创建/编辑/删除题目 | ✅ | ❌ |
| 批量导入题目 | ✅ | ❌ |
| 查看所有用户数据 | ✅ | ❌ |
| 管理用户状态 | ✅ | ❌ |
| 创建学习计划 | ✅ | ✅（仅自己） |
| 创建模拟考试 | ✅ | ✅（仅自己） |
| 查看考试记录 | ✅（所有） | ✅（仅自己） |
| 删除题目集 | ✅（所有） | ✅（仅自己） |
| 修改系统设置 | ✅ | ❌ |

---

## 数据隔离策略

### 1. 数据库层隔离

#### Row-Level Security (行级安全)
所有涉及用户数据的查询，必须包含 `userId` 过滤：

```typescript
// ✅ 正确 - 基于 userId 过滤
const studyPlans = await prisma.studyPlan.findMany({
  where: {
    userId: currentUser.id,
    examType: 'cale'
  }
})

// ❌ 错误 - 没有 userId 过滤，可能泄露其他用户数据
const studyPlans = await prisma.studyPlan.findMany({
  where: {
    examType: 'cale'
  }
})
```

### 2. API 层隔离

#### 中间件验证
每个需要认证的 API 都通过中间件提取并验证用户身份：

```typescript
// server/middleware/auth.ts
export default defineEventHandler(async (event) => {
  const token = getHeader(event, 'authorization')?.replace('Bearer ', '')

  if (!token) {
    throw createError({ statusCode: 401, message: '未登录' })
  }

  const decoded = verifyJWT(token)
  event.context.user = decoded  // 注入用户信息
})
```

#### API 实现示例
```typescript
// server/api/study-plans/list.get.ts
export default defineEventHandler(async (event) => {
  const user = event.context.user  // 从上下文获取当前用户

  if (!user) {
    throw createError({ statusCode: 401, message: '未登录' })
  }

  // 自动基于 userId 过滤
  const studyPlans = await prisma.studyPlan.findMany({
    where: {
      userId: user.userId,  // 只返回当前用户的数据
      examType: getQuery(event).examType
    }
  })

  return { studyPlans }
})
```

### 3. 前端层隔离

#### 状态管理
```typescript
// stores/auth.ts
export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: null,
    subscribedExams: []
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    isAdmin: (state) => state.user?.role === 'admin',
    canAccessExam: (state) => (examType: string) => {
      return state.subscribedExams.includes(examType)
    }
  }
})
```

#### 路由守卫
```typescript
// middleware/auth.global.ts
export default defineNuxtRouteMiddleware((to, from) => {
  const authStore = useAuthStore()

  // 需要登录的页面
  if (to.path.startsWith('/exam') || to.path.startsWith('/study-plan')) {
    if (!authStore.isAuthenticated) {
      return navigateTo('/login')
    }
  }

  // 管理员页面
  if (to.path.startsWith('/admin')) {
    if (!authStore.isAdmin) {
      return navigateTo('/')
    }
  }

  // 考试类型订阅检查
  const examType = to.query.examType || to.params.examType
  if (examType && !authStore.canAccessExam(examType)) {
    return navigateTo('/subscribe')
  }
})
```

---

## API设计

### 认证相关 API

#### POST /api/auth/register
注册新用户

**请求体:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "name": "张三"
}
```

**响应:**
```json
{
  "success": true,
  "message": "注册成功，请查收验证邮件",
  "userId": "cuid..."
}
```

#### POST /api/auth/login
用户登录

**请求体:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**响应:**
```json
{
  "success": true,
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc...",
  "user": {
    "id": "cuid...",
    "email": "user@example.com",
    "name": "张三",
    "role": "user",
    "subscribedExams": ["cale"]
  }
}
```

#### POST /api/auth/refresh
刷新 Token

**请求体:**
```json
{
  "refreshToken": "eyJhbGc..."
}
```

**响应:**
```json
{
  "success": true,
  "accessToken": "eyJhbGc..."
}
```

#### POST /api/auth/logout
登出

**请求头:**
```
Authorization: Bearer <token>
```

**响应:**
```json
{
  "success": true,
  "message": "登出成功"
}
```

#### GET /api/auth/verify-email?token=xxx
验证邮箱

**响应:**
```json
{
  "success": true,
  "message": "邮箱验证成功",
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc..."
}
```

---

### 用户相关 API

#### GET /api/user/profile
获取当前用户信息

**请求头:**
```
Authorization: Bearer <token>
```

**响应:**
```json
{
  "user": {
    "id": "cuid...",
    "email": "user@example.com",
    "name": "张三",
    "nickname": "小张",
    "avatar": "https://...",
    "role": "user",
    "subscribedExams": [
      {
        "examType": "cale",
        "isActive": true,
        "subscribedAt": "2025-10-20T..."
      }
    ],
    "createdAt": "2025-10-01T...",
    "lastLoginAt": "2025-10-20T..."
  }
}
```

#### PUT /api/user/profile
更新用户信息

**请求体:**
```json
{
  "name": "张三",
  "nickname": "小张",
  "avatar": "https://..."
}
```

#### POST /api/user/change-password
修改密码

**请求体:**
```json
{
  "oldPassword": "OldPass123!",
  "newPassword": "NewPass123!"
}
```

#### POST /api/user/subscribe-exam
订阅考试类型

**请求体:**
```json
{
  "examType": "nccaom"
}
```

**响应:**
```json
{
  "success": true,
  "message": "订阅成功",
  "subscription": {
    "examType": "nccaom",
    "subscribedAt": "2025-10-20T..."
  }
}
```

---

### 题库相关 API（需要认证）

#### GET /api/questions/list
获取题目列表（带分页）

**查询参数:**
```
?examType=cale&categoryId=xxx&difficulty=medium&page=1&pageSize=20
```

**响应:**
```json
{
  "questions": [...],
  "total": 596,
  "page": 1,
  "pageSize": 20,
  "totalPages": 30
}
```

#### GET /api/questions/:id
获取题目详情

**响应:**
```json
{
  "question": {
    "id": "cuid...",
    "examType": "cale",
    "type": "multiple_choice",
    "question": "题目内容...",
    "options": ["A. 选项1", "B. 选项2", ...],
    "correctAnswer": "A",
    "explanation": "解析...",
    "difficulty": "medium",
    "category": {
      "name": "评估与诊断",
      "code": "DOMAIN_1_ASSESSMENT"
    }
  }
}
```

---

### 学习计划 API（需要认证 + userId 隔离）

#### GET /api/study-plans/list
获取当前用户的学习计划列表

**查询参数:**
```
?examType=cale
```

**响应:**
```json
{
  "studyPlans": [
    {
      "id": "cuid...",
      "name": "30天冲刺计划",
      "examType": "cale",
      "startDate": "2025-10-20",
      "endDate": "2025-11-20",
      "isActive": true,
      "progress": 35,
      "totalItems": 200,
      "completedItems": 70
    }
  ]
}
```

#### POST /api/study-plans/create
创建学习计划

**请求体:**
```json
{
  "name": "30天冲刺计划",
  "examType": "cale",
  "startDate": "2025-10-20",
  "endDate": "2025-11-20",
  "questionIds": ["q1", "q2", "q3", ...]
}
```

---

### 考试相关 API（需要认证 + userId 隔离）

#### GET /api/exams/list
获取当前用户的考试列表

**查询参数:**
```
?examType=cale&mode=mock
```

#### POST /api/exams/create
创建考试（保持现有接口）

#### POST /api/exams/create-mock
一键生成全真模拟考试（保持现有接口）

#### DELETE /api/exams/delete
删除考试（添加 userId 验证）

**请求体:**
```json
{
  "examIds": ["exam1", "exam2"]
}
```

**权限检查:**
```typescript
// 确保用户只能删除自己的考试
const exams = await prisma.exam.findMany({
  where: {
    id: { in: examIds },
    userId: currentUser.userId  // 关键：验证所有权
  }
})

if (exams.length !== examIds.length) {
  throw createError({ statusCode: 403, message: '无权删除他人的考试' })
}
```

---

### 管理员 API（需要 admin 角色）

#### POST /api/admin/login
管理员登录

**请求体:**
```json
{
  "email": "admin@example.com",
  "password": "AdminPass123!"
}
```

#### GET /api/admin/users
获取用户列表

**查询参数:**
```
?page=1&pageSize=20&status=active&search=张三
```

**响应:**
```json
{
  "users": [
    {
      "id": "cuid...",
      "email": "user@example.com",
      "name": "张三",
      "role": "user",
      "status": "active",
      "subscribedExams": ["cale"],
      "loginCount": 25,
      "lastLoginAt": "2025-10-20T...",
      "createdAt": "2025-10-01T..."
    }
  ],
  "total": 150,
  "page": 1,
  "pageSize": 20
}
```

#### PUT /api/admin/users/:id/status
更新用户状态

**请求体:**
```json
{
  "status": "suspended"  // active | suspended
}
```

#### POST /api/admin/questions/create
创建题目（保持现有接口，添加日志）

#### POST /api/admin/questions/batch-import
批量导入题目

**请求体:**
```json
{
  "examType": "cale",
  "questions": [
    {
      "question": "题目内容...",
      "options": ["A. 选项1", "B. 选项2"],
      "correctAnswer": "A",
      "explanation": "解析...",
      "difficulty": "medium",
      "categoryCode": "DOMAIN_1_ASSESSMENT"
    }
  ]
}
```

#### GET /api/admin/stats
系统统计数据

**响应:**
```json
{
  "stats": {
    "totalUsers": 150,
    "activeUsers": 120,
    "totalQuestions": {
      "cale": 596,
      "nccaom": 0
    },
    "totalExams": 1250,
    "totalStudyPlans": 350
  }
}
```

---

## 前端页面流程

### 1. 认证流程页面

#### 页面路由设计
```
/login              - 登录页
/register           - 注册页
/verify-email       - 邮箱验证页
/forgot-password    - 忘记密码页
/reset-password     - 重置密码页
```

#### 登录页 (/login)
```
┌─────────────────────────────────────┐
│         CALE/NCCAOM 学习平台        │
├─────────────────────────────────────┤
│  邮箱: [________________]            │
│  密码: [________________]            │
│                                     │
│  [记住我] [忘记密码?]                │
│                                     │
│  [ 登 录 ]                          │
│                                     │
│  还没有账号？[立即注册]              │
└─────────────────────────────────────┘
```

#### 注册页 (/register)
```
┌─────────────────────────────────────┐
│            创建新账号                │
├─────────────────────────────────────┤
│  姓名: [________________]            │
│  邮箱: [________________]            │
│  密码: [________________]            │
│  确认密码: [________________]        │
│                                     │
│  选择考试类型:                       │
│  □ CALE (加州针灸执照考试)           │
│  □ NCCAOM (全国中医认证考试)         │
│                                     │
│  [ 注 册 ]                          │
│                                     │
│  已有账号？[立即登录]                │
└─────────────────────────────────────┘
```

### 2. 主页面流程

#### 登录后首页 (/)
```
┌─────────────────────────────────────────────────┐
│ [Logo] CALE/NCCAOM 学习平台    [张三] [退出]    │
├─────────────────────────────────────────────────┤
│                                                 │
│  欢迎回来，张三！                                │
│                                                 │
│  选择您要学习的考试类型：                         │
│                                                 │
│  ┌──────────────┐  ┌──────────────┐            │
│  │   CALE 考试  │  │  NCCAOM 考试 │            │
│  │  加州针灸执照 │  │  全国中医认证 │            │
│  │              │  │              │            │
│  │ [进入学习]   │  │ [订阅解锁]   │            │
│  └──────────────┘  └──────────────┘            │
│                                                 │
│  我的学习数据:                                   │
│  - 学习天数: 25天                                │
│  - 完成题目: 350/596                            │
│  - 模拟考试: 5次                                 │
│  - 平均分数: 78%                                 │
└─────────────────────────────────────────────────┘
```

#### 选择考试后 - 考试主页 (/exam?type=cale)
```
┌─────────────────────────────────────────────────┐
│ [返回首页] CALE 考试   [学习计划] [题库] [个人]  │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌──────────────────────────────────┐          │
│  │  📚 学习计划                      │          │
│  │  创建个性化学习计划，系统跟踪进度  │          │
│  │  [创建学习计划] [查看我的计划]     │          │
│  └──────────────────────────────────┘          │
│                                                 │
│  ┌──────────────────────────────────┐          │
│  │  ⚡ 一键生成全真模拟考试           │          │
│  │  200题 · 300分钟 · 按官方比例分配  │          │
│  │  [立即生成]                        │          │
│  └──────────────────────────────────┘          │
│                                                 │
│  ┌──────────────────────────────────┐          │
│  │  ✏️ 自定义模拟考试                 │          │
│  │  自由选择题目数量、难度、领域       │          │
│  │  [手动配置]                        │          │
│  └──────────────────────────────────┘          │
│                                                 │
│  ┌──────────────────────────────────┐          │
│  │  📝 我的题目集                     │          │
│  │  查看已生成的学习题目和考试记录     │          │
│  │  [查看列表]                        │          │
│  └──────────────────────────────────┘          │
│                                                 │
│  ┌──────────────────────────────────┐          │
│  │  ❌ 错题本                         │          │
│  │  针对性复习答错的题目               │          │
│  │  [查看错题]                        │          │
│  └──────────────────────────────────┘          │
└─────────────────────────────────────────────────┘
```

### 3. 管理员页面流程

#### 管理员登录 (/admin/login)
```
┌─────────────────────────────────────┐
│         管理员登录                   │
├─────────────────────────────────────┤
│  邮箱: [________________]            │
│  密码: [________________]            │
│                                     │
│  [ 登 录 ]                          │
└─────────────────────────────────────┘
```

#### 管理员控制台 (/admin/dashboard)
```
┌─────────────────────────────────────────────────┐
│ [Logo] 管理员控制台        [管理员] [退出]       │
├─────────────────────────────────────────────────┤
│ [仪表盘] [题库管理] [用户管理] [系统设置]        │
├─────────────────────────────────────────────────┤
│                                                 │
│  系统概览                                        │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐          │
│  │ 用户总数 │ │ 题目总数 │ │ 活跃用户 │          │
│  │  150    │ │  596    │ │  120    │          │
│  └─────────┘ └─────────┘ └─────────┘          │
│                                                 │
│  最近用户活动                                    │
│  - 张三 完成了 CALE 模拟考试 (30分钟前)          │
│  - 李四 创建了新的学习计划 (1小时前)             │
│  - 王五 注册了新账号 (2小时前)                   │
└─────────────────────────────────────────────────┘
```

#### 题库管理页 (/admin/questions)
```
┌─────────────────────────────────────────────────┐
│ 题库管理                                         │
├─────────────────────────────────────────────────┤
│ 考试类型: [CALE ▼]  领域: [全部 ▼]              │
│ 搜索: [___________]  [+ 新建题目] [批量导入]    │
├─────────────────────────────────────────────────┤
│ □ | ID | 题目内容 | 领域 | 难度 | 操作           │
│ □ | 1  | 根据中医... | D1 | 中等 | [编辑][删除] │
│ □ | 2  | 患者出现... | D2 | 困难 | [编辑][删除] │
│ ...                                             │
├─────────────────────────────────────────────────┤
│ 已选择 0 项  [批量删除]       第1页/共30页 >    │
└─────────────────────────────────────────────────┘
```

#### 用户管理页 (/admin/users)
```
┌─────────────────────────────────────────────────┐
│ 用户管理                                         │
├─────────────────────────────────────────────────┤
│ 搜索: [___________]  状态: [全部 ▼]             │
├─────────────────────────────────────────────────┤
│ ID | 姓名 | 邮箱 | 订阅考试 | 状态 | 操作        │
│ 1  | 张三 | z@..| CALE    | 活跃 | [停用][编辑]│
│ 2  | 李四 | l@..| CALE,NC | 活跃 | [停用][编辑]│
│ ...                                             │
├─────────────────────────────────────────────────┤
│                         第1页/共8页 >           │
└─────────────────────────────────────────────────┘
```

---

## 实施路线图

### Phase 1: 基础认证系统 (Week 1-2)

#### 1.1 数据库迁移
- [x] 增强 User 表结构
- [ ] 创建 UserExamSubscription 表
- [ ] 创建 AdminLog 表
- [ ] 创建 SystemSettings 表
- [ ] 运行 Prisma 迁移

#### 1.2 后端认证 API
- [ ] 实现 JWT 工具函数 (sign, verify, refresh)
- [ ] 实现 bcrypt 密码加密工具
- [ ] 创建 /api/auth/register
- [ ] 创建 /api/auth/login
- [ ] 创建 /api/auth/refresh
- [ ] 创建 /api/auth/logout
- [ ] 创建认证中间件 (server/middleware/auth.ts)

#### 1.3 前端认证页面
- [ ] 创建 Pinia auth store
- [ ] 创建登录页 (/login)
- [ ] 创建注册页 (/register)
- [ ] 创建全局路由守卫 (middleware/auth.global.ts)
- [ ] 实现 Token 自动刷新机制

**测试检查点:**
- [x] 用户可以注册新账号
- [ ] 用户可以登录并获得 JWT token
- [ ] Token 过期后自动刷新
- [ ] 未登录用户访问受保护页面会跳转到登录页

---

### Phase 2: 用户系统与权限 (Week 3)

#### 2.1 用户个人中心
- [ ] 创建 /api/user/profile (GET/PUT)
- [ ] 创建 /api/user/change-password
- [ ] 创建 /api/user/subscribe-exam
- [ ] 创建个人信息页 (/user/profile)
- [ ] 创建考试订阅页 (/user/subscriptions)

#### 2.2 权限控制中间件
- [ ] 创建 requireAuth 中间件
- [ ] 创建 requireAdmin 中间件
- [ ] 创建 requireExamSubscription 中间件

#### 2.3 数据隔离改造
- [ ] 改造所有 StudyPlan API（添加 userId 过滤）
- [ ] 改造所有 Exam API（添加 userId 过滤）
- [ ] 改造所有 UserAnswer API（添加 userId 过滤）
- [ ] 改造所有 WrongQuestion API（添加 userId 过滤）

**测试检查点:**
- [ ] 用户只能看到自己的学习计划
- [ ] 用户只能删除自己的考试记录
- [ ] 用户无法访问其他用户的数据
- [ ] 未订阅的考试类型无法访问

---

### Phase 3: 多考试类型支持 (Week 4)

#### 3.1 首页与考试选择
- [ ] 创建新的首页 (/)，展示已订阅考试
- [ ] 创建考试选择流程
- [ ] 改造 ExamSelector 组件（基于用户订阅）

#### 3.2 考试类型路由
- [ ] 重构路由结构：
  ```
  /                          - 首页（选择考试类型）
  /exam/cale                 - CALE 考试主页
  /exam/cale/study-plans     - CALE 学习计划
  /exam/cale/question-sets   - CALE 题目集
  /exam/nccaom               - NCCAOM 考试主页
  /exam/nccaom/study-plans   - NCCAOM 学习计划
  ```

#### 3.3 数据展示过滤
- [ ] 所有页面添加 examType 过滤
- [ ] 添加考试类型切换组件

**测试检查点:**
- [ ] 用户可以订阅多个考试类型
- [ ] CALE 和 NCCAOM 数据完全隔离
- [ ] 切换考试类型时数据正确切换

---

### Phase 4: 管理员系统 (Week 5-6)

#### 4.1 管理员认证
- [ ] 创建 /api/admin/login
- [ ] 创建管理员登录页 (/admin/login)
- [ ] 创建管理员路由守卫

#### 4.2 管理员控制台
- [ ] 创建管理员仪表盘 (/admin/dashboard)
- [ ] 实现系统统计 API (/api/admin/stats)
- [ ] 创建用户管理页 (/admin/users)
- [ ] 实现用户管理 API (list, update status)

#### 4.3 题库管理增强
- [ ] 改造题库管理页（管理员专属）
- [ ] 实现批量导入 API (/api/admin/questions/batch-import)
- [ ] 实现操作日志记录

**测试检查点:**
- [ ] 管理员可以查看所有用户
- [ ] 管理员可以停用/启用用户
- [ ] 管理员可以批量导入题目
- [ ] 所有管理操作都有日志记录

---

### Phase 5: 邮件与高级功能 (Week 7)

#### 5.1 邮件系统
- [ ] 集成邮件服务 (nodemailer / SendGrid)
- [ ] 实现邮箱验证功能
- [ ] 实现忘记密码功能
- [ ] 创建邮件模板

#### 5.2 高级功能
- [ ] 实现错题本智能推荐
- [ ] 实现学习进度数据可视化
- [ ] 实现成绩报告详细分析

---

### Phase 6: 测试与优化 (Week 8)

#### 6.1 测试
- [ ] 单元测试（核心业务逻辑）
- [ ] 集成测试（API 测试）
- [ ] E2E 测试（关键用户流程）

#### 6.2 性能优化
- [ ] 数据库查询优化（添加索引）
- [ ] API 响应缓存
- [ ] 前端代码分割和懒加载

#### 6.3 安全加固
- [ ] SQL 注入防护（Prisma 自动处理）
- [ ] XSS 防护
- [ ] CSRF 防护
- [ ] Rate Limiting（API 限流）

---

## 数据迁移策略

### 现有数据处理

#### 1. User 表迁移
```sql
-- 将现有 demo-user 转换为真实用户
UPDATE User
SET
  email = 'demo@example.com',
  password = '<bcrypt_hash>',
  role = 'user',
  emailVerified = true
WHERE id = 'demo-user';

-- 或者创建新的测试用户，删除 demo-user
INSERT INTO User (...) VALUES (...);
```

#### 2. 关联数据处理
```sql
-- 所有考试记录、学习计划等已经关联了 userId
-- 只需要确保 userId 指向有效的用户即可
SELECT COUNT(*) FROM Exam WHERE userId NOT IN (SELECT id FROM User);
SELECT COUNT(*) FROM StudyPlan WHERE userId NOT IN (SELECT id FROM User);
```

#### 3. 订阅数据创建
```sql
-- 为现有用户创建考试订阅记录
INSERT INTO UserExamSubscription (userId, examType, isActive)
SELECT id, 'cale', true
FROM User
WHERE role = 'user';
```

---

## 安全最佳实践

### 1. 密码安全
- ✅ bcrypt 加密，salt rounds >= 10
- ✅ 密码强度要求：至少8位，包含大小写字母和数字
- ✅ 禁止常见弱密码

### 2. Token 安全
- ✅ Access Token 短期有效（2小时）
- ✅ Refresh Token 长期有效（7天）
- ✅ Token 存储在 httpOnly cookie（可选）
- ✅ 实现 Token 黑名单机制（登出时）

### 3. API 安全
- ✅ 所有敏感 API 需要认证
- ✅ 实现 Rate Limiting 防止暴力破解
- ✅ 输入验证和消毒
- ✅ CORS 配置

### 4. 数据安全
- ✅ 严格的 userId 过滤，防止越权访问
- ✅ 敏感信息不在前端暴露
- ✅ 定期数据库备份

---

## 部署建议

### 开发环境
```bash
# 使用 SQLite
DATABASE_URL="file:./dev.db"
JWT_SECRET="dev-secret-key"
JWT_REFRESH_SECRET="dev-refresh-secret-key"
```

### 生产环境
```bash
# 使用 PostgreSQL
DATABASE_URL="postgresql://user:password@host:5432/dbname"
JWT_SECRET="<strong-random-secret>"
JWT_REFRESH_SECRET="<strong-random-secret>"
NODE_ENV="production"

# 邮件服务
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"

# 管理员账号
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="<strong-password>"
```

---

## 总结

这个设计方案提供了：

1. **完整的用户认证系统** - 注册、登录、邮箱验证、密码重置
2. **严格的权限控制** - 基于角色的访问控制（RBAC）
3. **多租户数据隔离** - 用户之间数据完全隔离
4. **多考试类型支持** - CALE、NCCAOM 等多种考试
5. **管理员系统** - 统一管理题库和用户
6. **可扩展架构** - 清晰的分层架构，易于维护和扩展

### 核心原则

- 🔐 **安全第一**: JWT + bcrypt + 数据隔离
- 👥 **用户体验**: 简洁的注册登录流程
- 🎯 **权限清晰**: Admin vs User 明确分工
- 📊 **数据隔离**: 每个用户独立数据空间
- 🔄 **可扩展**: 支持添加更多考试类型

---

## 下一步行动

建议按照实施路线图的顺序执行：

1. **立即开始**: Phase 1 - 基础认证系统
2. **优先级**: 用户认证 > 权限控制 > 数据隔离 > 管理员系统
3. **迭代开发**: 每完成一个 Phase 进行测试验证
4. **持续优化**: 根据实际使用情况调整

需要我开始实施第一阶段（基础认证系统）吗？
