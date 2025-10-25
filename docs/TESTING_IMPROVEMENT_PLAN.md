# 测试改善计划

## 当前状态分析

### 问题
- ❌ **无测试文件**: 项目中没有任何测试代码
- ❌ **无测试框架**: package.json 中没有测试相关依赖
- ❌ **无测试脚本**: 没有配置测试运行命令
- ❌ **无CI/CD集成**: 没有自动化测试流程
- ⚠️  **测试覆盖率**: 0% (FINAL_PROJECT_STATUS.md 中标记为 3/10)

### 影响
- 无法保证代码质量
- 重构和新功能开发风险高
- 上线前缺少自动化验证
- 团队协作缺少质量门槛

## 测试改善目标

### 短期目标 (1-2天)
- ✅ 安装并配置测试框架
- ✅ 实现核心工具函数测试 (覆盖率 > 80%)
- ✅ 实现关键API端点测试 (至少20个核心端点)
- ✅ 配置测试覆盖率报告

### 中期目标 (3-5天)
- 📋 实现所有API端点测试
- 📋 实现核心Vue组件测试
- 📋 实现E2E测试 (关键用户流程)
- 📋 集成到CI/CD流程

### 长期目标
- 📋 达到整体测试覆盖率 > 70%
- 📋 所有新功能要求配套测试
- 📋 建立测试驱动开发(TDD)流程

## 测试技术栈选择

### 1. Vitest (推荐 ⭐)
**用途**: 单元测试和集成测试

**优势**:
- ✅ 与 Vite/Nuxt 3 完美集成
- ✅ 快速执行
- ✅ 兼容 Jest API
- ✅ 内置代码覆盖率
- ✅ TypeScript 原生支持

**安装**:
```bash
npm install -D vitest @vitest/ui @vitest/coverage-v8
```

### 2. @vue/test-utils
**用途**: Vue 组件测试

**优势**:
- ✅ Vue 3 官方测试工具
- ✅ 完整的组件挂载和交互API
- ✅ 支持 Composition API

**安装**:
```bash
npm install -D @vue/test-utils
```

### 3. @nuxt/test-utils
**用途**: Nuxt 特定功能测试

**优势**:
- ✅ Nuxt 官方测试工具
- ✅ 支持服务端渲染测试
- ✅ 内置测试环境设置

**安装**:
```bash
npm install -D @nuxt/test-utils
```

### 4. Playwright (可选)
**用途**: E2E 端到端测试

**优势**:
- ✅ 跨浏览器测试
- ✅ 真实用户场景模拟
- ✅ 强大的选择器和断言

**安装**:
```bash
npm install -D @playwright/test
```

### 5. Supertest
**用途**: HTTP API 测试

**优势**:
- ✅ 简洁的 API 测试语法
- ✅ 不需要启动真实服务器
- ✅ 与 Vitest 配合良好

**安装**:
```bash
npm install -D supertest @types/supertest
```

## 测试目录结构

```
cale_exam/
├── tests/
│   ├── unit/                      # 单元测试
│   │   ├── utils/                 # 工具函数测试
│   │   │   ├── auth.test.ts
│   │   │   ├── achievement-service.test.ts
│   │   │   └── exam-utils.test.ts
│   │   └── composables/           # Composables 测试
│   │       └── useAuth.test.ts
│   │
│   ├── integration/               # 集成测试
│   │   ├── api/                   # API 端点测试
│   │   │   ├── auth.test.ts
│   │   │   ├── questions.test.ts
│   │   │   ├── study-groups.test.ts
│   │   │   └── user.test.ts
│   │   └── database/              # 数据库集成测试
│   │       └── prisma.test.ts
│   │
│   ├── component/                 # 组件测试
│   │   ├── QuestionCard.test.ts
│   │   ├── StudyGroupCheckIn.test.ts
│   │   └── ExamResults.test.ts
│   │
│   ├── e2e/                       # E2E 测试
│   │   ├── auth-flow.spec.ts
│   │   ├── exam-taking.spec.ts
│   │   └── study-groups.spec.ts
│   │
│   ├── fixtures/                  # 测试数据
│   │   ├── users.ts
│   │   ├── questions.ts
│   │   └── study-groups.ts
│   │
│   └── helpers/                   # 测试辅助函数
│       ├── test-db.ts            # 测试数据库设置
│       ├── auth-helpers.ts       # 认证辅助
│       └── mock-data.ts          # Mock 数据生成
│
├── vitest.config.ts              # Vitest 配置
├── playwright.config.ts          # Playwright 配置 (可选)
└── coverage/                     # 覆盖率报告 (自动生成)
```

## 优先测试的功能模块

### 🔴 高优先级 (核心业务逻辑)

#### 1. 认证系统
- `server/utils/auth.ts` - JWT 生成和验证
- `server/api/auth/login.post.ts` - 登录
- `server/api/auth/register.post.ts` - 注册
- `server/api/auth/refresh.post.ts` - Token 刷新
- `stores/auth.ts` - 认证状态管理

#### 2. 题库系统
- `server/api/questions/index.get.ts` - 获取题目
- `server/api/questions/submit.post.ts` - 提交答案
- `server/api/questions/generate.post.ts` - AI 生成题目
- `server/utils/exam-utils.ts` - 考试逻辑

#### 3. 学习小组
- `server/api/study-groups/[id]/posts.{get,post}.ts` - 帖子CRUD
- `server/api/study-group-check-in.{get,post}.ts` - 打卡功能
- `server/api/study-groups/[id]/members.ts` - 成员管理

#### 4. 成就系统
- `server/utils/achievement-service.ts` - 成就计算
- `server/api/achievements/index.get.ts` - 获取成就

### 🟡 中优先级 (重要功能)

#### 5. 用户数据
- `server/api/user/progress.get.ts` - 学习进度
- `server/api/user/stats.get.ts` - 统计数据
- `server/api/user/bookmarks.get.ts` - 收藏管理

#### 6. 笔记系统
- `server/api/study-groups/[groupId]/notes/` - 笔记CRUD
- `server/api/personal-notes/` - 个人笔记

#### 7. 资源库
- `server/api/study-groups/[id]/resources/` - 资源管理

### 🟢 低优先级 (辅助功能)

#### 8. 通知系统
- `server/api/notifications/` - 通知管理

#### 9. 搜索功能
- `server/api/study-groups/[id]/posts/search.get.ts`

## 测试实现步骤

### Phase 1: 环境搭建 (Day 1)

1. **安装依赖**
```bash
npm install -D vitest @vitest/ui @vitest/coverage-v8 \
  @vue/test-utils @nuxt/test-utils \
  supertest @types/supertest \
  happy-dom
```

2. **创建配置文件**
- `vitest.config.ts`
- 更新 `package.json` 添加测试脚本

3. **设置测试环境**
- 配置测试数据库
- 创建测试辅助函数

### Phase 2: 工具函数测试 (Day 1)

**目标**: 覆盖率 > 80%

实现测试:
- `tests/unit/utils/auth.test.ts`
- `tests/unit/utils/achievement-service.test.ts`
- `tests/unit/utils/mention-parser.test.ts`

### Phase 3: API 集成测试 (Day 2)

**目标**: 至少 20 个核心端点

实现测试:
- 认证 API (5个)
- 题库 API (5个)
- 学习小组 API (7个)
- 用户数据 API (3个)

### Phase 4: 组件测试 (Day 3)

**目标**: 核心组件覆盖

实现测试:
- `QuestionCard.vue`
- `StudyGroupCheckIn.vue`
- `MarkdownEditor.vue`
- `PollDisplay.vue`

### Phase 5: E2E 测试 (可选, Day 4-5)

**目标**: 关键用户流程

实现测试:
- 用户注册登录流程
- 做题和提交答案流程
- 小组讨论和打卡流程

## 测试覆盖率目标

### 按模块

| 模块 | 当前覆盖率 | 目标覆盖率 | 优先级 |
|-----|----------|----------|--------|
| 工具函数 (utils/) | 0% | 80%+ | 🔴 高 |
| API 端点 (server/api/) | 0% | 70%+ | 🔴 高 |
| Stores (stores/) | 0% | 60%+ | 🟡 中 |
| 组件 (components/) | 0% | 50%+ | 🟡 中 |
| 页面 (pages/) | 0% | 30%+ | 🟢 低 |

### 整体目标

- **Phase 1 完成后**: 30%+ 整体覆盖率
- **Phase 2 完成后**: 50%+ 整体覆盖率
- **Phase 3 完成后**: 70%+ 整体覆盖率

## 成功指标

### 定量指标
- ✅ 至少 100 个测试用例
- ✅ 工具函数覆盖率 > 80%
- ✅ API 覆盖率 > 70%
- ✅ 整体覆盖率 > 50%
- ✅ 所有测试通过时间 < 30秒

### 定性指标
- ✅ 每个核心功能都有测试
- ✅ 关键bug都有回归测试
- ✅ 测试文档完整
- ✅ 团队成员能轻松运行测试

## 维护策略

### 测试规范
1. **新功能必须带测试**: PR 合并前需要测试覆盖
2. **Bug 修复需要测试**: 防止回归
3. **定期审查**: 每月检查测试质量
4. **保持测试快速**: 单元测试 < 10秒, 集成测试 < 30秒

### CI/CD 集成
```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test
      - run: npm run test:coverage
      - uses: codecov/codecov-action@v3  # 上传覆盖率报告
```

## 下一步行动

### 立即执行 (今天)
1. ✅ 安装测试框架依赖
2. ✅ 创建 vitest.config.ts
3. ✅ 实现第一个测试 (auth.test.ts)
4. ✅ 配置覆盖率报告
5. ✅ 更新 package.json 脚本

### 本周完成
- 📋 完成所有工具函数测试
- 📋 完成 20+ API 端点测试
- 📋 达到 30%+ 整体覆盖率
- 📋 创建测试文档

### 下周目标
- 📋 实现组件测试
- 📋 达到 50%+ 整体覆盖率
- 📋 集成 CI/CD

---

**创建时间**: 2025-10-24
**状态**: 📋 待执行
**负责人**: 开发团队
**预计完成**: 5-7天
