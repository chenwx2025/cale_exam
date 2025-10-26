# Vercel 部署限制分析与解决方案

## 🔍 功能分析总结

经过全面代码分析，您的应用有 **3 个功能** 在 Vercel 上有限制，但都有解决方案！

---

## ⚠️ 受限功能清单

### 1. 定时任务（Cron Jobs）❌ → ✅ 有解决方案

**当前实现**:
- 📍 位置：`server/plugins/scheduler.ts` 和 `server/utils/scheduler.ts`
- 📍 使用：`node-cron` 库

**3 个定时任务**:
```typescript
// 1. 每分钟检查学习提醒
cron.schedule('* * * * *', async () => {
  await sendBatchStudyReminders()
})

// 2. 每天早上 9 点发送考试提醒
cron.schedule('0 9 * * *', async () => {
  await sendExamReminders()
})

// 3. 每天午夜生成学习小组每日一题
cron.schedule('0 0 * * *', async () => {
  await generateDailyQuestionsForAllGroups()
})
```

**Vercel 限制**:
- ❌ Vercel Serverless 函数是**无状态**的
- ❌ 每次请求启动，执行完关闭
- ❌ **不支持持续运行的 cron 任务**
- ❌ `node-cron` 依赖持续运行的进程

**影响**:
- ❌ 学习提醒不会自动发送
- ❌ 考试提醒不会自动发送
- ❌ 每日一题不会自动生成

**✅ 解决方案（3 个选择）**:

#### 方案 A: Vercel Cron Jobs（推荐）⭐

Vercel 提供内置的 Cron Jobs 功能（**付费功能，Pro 计划 $20/月**）。

**配置文件 `vercel.json`**:
```json
{
  "crons": [
    {
      "path": "/api/cron/study-reminders",
      "schedule": "* * * * *"
    },
    {
      "path": "/api/cron/exam-reminders",
      "schedule": "0 9 * * *"
    },
    {
      "path": "/api/cron/daily-questions",
      "schedule": "0 0 * * *"
    }
  ]
}
```

**需要创建的 API 端点**:
- `server/api/cron/study-reminders.ts`
- `server/api/cron/exam-reminders.ts`
- `server/api/cron/daily-questions.ts`

**成本**: $20/月（Vercel Pro 计划）

---

#### 方案 B: 使用免费的外部 Cron 服务（推荐 - 免费）⭐⭐⭐

使用免费服务定时调用您的 API。

**推荐服务**:
1. **cron-job.org**（免费，无限任务）
2. **EasyCron**（免费层：每小时 1 次）
3. **GitHub Actions**（完全免费）

**实施步骤（以 cron-job.org 为例）**:

1. **创建 API 端点（带密钥保护）**:

```typescript
// server/api/cron/study-reminders.ts
export default defineEventHandler(async (event) => {
  // 验证 cron 密钥
  const cronSecret = getHeader(event, 'x-cron-secret')
  if (cronSecret !== process.env.CRON_SECRET) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }

  await sendBatchStudyReminders()
  return { success: true }
})
```

2. **在 cron-job.org 设置**:
   - URL: `https://cale-exam.vercel.app/api/cron/study-reminders`
   - 频率: 每分钟
   - Headers: `x-cron-secret: your-random-secret`

3. **添加环境变量**:
```bash
vercel env add CRON_SECRET production
# 输入一个随机字符串
```

**成本**: $0/月

---

#### 方案 C: GitHub Actions（完全免费，推荐）⭐⭐

使用 GitHub Actions 定时触发。

**创建文件 `.github/workflows/cron-jobs.yml`**:
```yaml
name: Cron Jobs

on:
  schedule:
    # 每分钟执行学习提醒
    - cron: '* * * * *'
    # 每天早上 9 点执行考试提醒（UTC 时间，需要转换）
    - cron: '0 1 * * *'  # UTC 1:00 = 北京时间 9:00
    # 每天午夜生成每日一题（UTC 时间）
    - cron: '0 16 * * *'  # UTC 16:00 = 北京时间 0:00

jobs:
  study-reminders:
    runs-on: ubuntu-latest
    if: github.event.schedule == '* * * * *'
    steps:
      - name: Trigger Study Reminders
        run: |
          curl -X POST https://cale-exam.vercel.app/api/cron/study-reminders \
            -H "x-cron-secret: ${{ secrets.CRON_SECRET }}"

  exam-reminders:
    runs-on: ubuntu-latest
    if: github.event.schedule == '0 1 * * *'
    steps:
      - name: Trigger Exam Reminders
        run: |
          curl -X POST https://cale-exam.vercel.app/api/cron/exam-reminders \
            -H "x-cron-secret: ${{ secrets.CRON_SECRET }}"

  daily-questions:
    runs-on: ubuntu-latest
    if: github.event.schedule == '0 16 * * *'
    steps:
      - name: Trigger Daily Questions
        run: |
          curl -X POST https://cale-exam.vercel.app/api/cron/daily-questions \
            -H "x-cron-secret: ${{ secrets.CRON_SECRET }}"
```

**GitHub Secrets 设置**:
- 仓库 > Settings > Secrets and variables > Actions
- 添加 `CRON_SECRET`

**成本**: $0/月

---

### 2. 文件上传（本地存储）⚠️ → ✅ 需要修改

**当前实现**:
- 📍 位置：`server/api/study-groups/[groupId]/resources/index.post.ts`
- 📍 使用：`formidable` + 本地文件系统（`fs.writeFile`）

**代码**:
```typescript
const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'resources')
fs.mkdirSync(uploadDir, { recursive: true })
```

**Vercel 限制**:
- ⚠️ Vercel 文件系统是**只读**的（除了 `/tmp` 目录）
- ⚠️ `/tmp` 目录在函数执行后会被清空
- ⚠️ **无法持久化存储用户上传的文件**

**影响**:
- ❌ 学习资源上传功能无法使用
- ❌ 用户上传的文件会丢失

**✅ 解决方案（3 个选择）**:

#### 方案 A: Vercel Blob Storage（推荐）⭐

Vercel 官方文件存储服务。

**优点**:
- ✅ 与 Vercel 深度集成
- ✅ 全球 CDN 加速
- ✅ 简单易用

**免费额度**:
- 1 GB 存储
- 100 GB 带宽/月

**价格**（超出免费额度）:
- $0.15/GB 存储/月
- $0.30/GB 带宽

**实施**:

1. **安装依赖**:
```bash
npm install @vercel/blob
```

2. **修改上传代码**:
```typescript
import { put } from '@vercel/blob'

async function handleFileUpload(event: any, userId: string, groupId: string) {
  const form = formidable({ maxFileSize: 100 * 1024 * 1024 })
  const [fields, files] = await form.parse(event.node.req)

  const file = files.file?.[0]
  if (!file) {
    throw createError({ statusCode: 400, message: '未找到文件' })
  }

  // 上传到 Vercel Blob
  const blob = await put(file.originalFilename || 'file', file.filepath, {
    access: 'public',
    token: process.env.BLOB_READ_WRITE_TOKEN,
  })

  // 保存到数据库
  const resource = await prisma.studyResource.create({
    data: {
      title: fields.title?.[0] || file.originalFilename,
      fileUrl: blob.url,  // Vercel Blob URL
      fileType: FILE_TYPE_MAP[file.mimetype || ''] || 'other',
      fileSize: file.size,
      studyGroupId: groupId,
      uploadedById: userId,
    }
  })

  return resource
}
```

3. **添加环境变量**:
```bash
vercel env add BLOB_READ_WRITE_TOKEN production
```

---

#### 方案 B: Supabase Storage（推荐 - 免费）⭐⭐⭐

使用 Supabase（您已经在用）的免费存储。

**免费额度**:
- 1 GB 存储
- 2 GB 带宽/月

**实施**:

1. **安装依赖**:
```bash
npm install @supabase/supabase-js
```

2. **修改上传代码**:
```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

async function handleFileUpload(event: any, userId: string, groupId: string) {
  const form = formidable({ maxFileSize: 100 * 1024 * 1024 })
  const [fields, files] = await form.parse(event.node.req)

  const file = files.file?.[0]
  if (!file) {
    throw createError({ statusCode: 400, message: '未找到文件' })
  }

  // 读取文件
  const fileBuffer = fs.readFileSync(file.filepath)

  // 上传到 Supabase Storage
  const fileName = `${Date.now()}-${file.originalFilename}`
  const { data, error } = await supabase.storage
    .from('study-resources')
    .upload(`${groupId}/${fileName}`, fileBuffer, {
      contentType: file.mimetype,
      upsert: false
    })

  if (error) throw error

  // 获取公开 URL
  const { data: { publicUrl } } = supabase.storage
    .from('study-resources')
    .getPublicUrl(data.path)

  // 保存到数据库
  const resource = await prisma.studyResource.create({
    data: {
      title: fields.title?.[0] || file.originalFilename,
      fileUrl: publicUrl,
      fileType: FILE_TYPE_MAP[file.mimetype || ''] || 'other',
      fileSize: file.size,
      studyGroupId: groupId,
      uploadedById: userId,
    }
  })

  return resource
}
```

3. **在 Supabase Dashboard 创建 Bucket**:
   - Storage > Create Bucket
   - Name: `study-resources`
   - Public: Yes

4. **添加环境变量**:
```bash
vercel env add SUPABASE_URL production
vercel env add SUPABASE_SERVICE_KEY production
```

**成本**: $0/月（免费层足够）

---

#### 方案 C: AWS S3 或 Cloudflare R2

**AWS S3**:
- 免费层：5 GB 存储，20,000 GET 请求/月
- 价格：$0.023/GB/月

**Cloudflare R2**（推荐）:
- 免费层：10 GB 存储，1000 万次读取/月
- 无出站流量费用！

---

### 3. 长时间运行的函数 ⚠️ → ✅ 通常没问题

**Vercel 限制**:
- ⚠️ 免费层：10 秒函数执行超时
- ⚠️ Pro 层：60 秒函数执行超时
- ⚠️ Enterprise 层：900 秒（15 分钟）

**您的应用**:
检查代码后，大部分 API 调用都很快（< 5 秒），包括：
- ✅ 数据库查询
- ✅ AI 问题生成（通常 2-5 秒）
- ✅ 用户认证
- ✅ 文件上传（如果文件不是特别大）

**可能的风险**:
- ⚠️ 批量生成大量 AI 问题（可能超过 10 秒）
- ⚠️ 大文件上传（> 50MB）

**✅ 解决方案**:

1. **优化 AI 生成**:
   - 限制单次生成数量
   - 分批处理

2. **大文件上传**:
   - 使用客户端直传到 Supabase/S3
   - 服务端只记录元数据

3. **如果确实需要长时间任务**:
   - 升级到 Vercel Pro（$20/月，60 秒超时）

---

## ✅ 完全支持的功能

以下功能在 Vercel 上**完美运行**，无需修改：

1. ✅ **SSR 渲染** - Vercel 原生支持 Nuxt SSR
2. ✅ **数据库操作** - Prisma + PostgreSQL（Supabase）
3. ✅ **用户认证** - JWT 认证
4. ✅ **API 路由** - 所有 REST API
5. ✅ **实时功能** - WebSocket（需要使用 Vercel 的实现）
6. ✅ **图片优化** - Nuxt Image + Vercel 自动优化
7. ✅ **静态资源** - CDN 加速
8. ✅ **环境变量** - 完全支持
9. ✅ **邮件发送** - SMTP（如果配置了）
10. ✅ **OpenAI API 调用** - 完全支持
11. ✅ **所有业务逻辑** - 学习计划、小组、笔记、讨论等

---

## 📋 部署前需要做的修改

### 必须修改（否则功能无法使用）:

#### 1. 文件上传 - 改用 Supabase Storage

**优先级**: 🔴 高（如果使用资源库功能）

**工作量**: 2-3 小时

**步骤**:
1. 创建 Supabase Storage Bucket
2. 安装 `@supabase/supabase-js`
3. 修改 `server/api/study-groups/[groupId]/resources/index.post.ts`
4. 添加环境变量
5. 测试上传功能

#### 2. 定时任务 - 改用外部 Cron

**优先级**: 🟡 中（不影响核心功能，但提醒和每日一题不会自动触发）

**工作量**: 1-2 小时

**步骤**:
1. 创建 3 个 cron API 端点
2. 注册 cron-job.org 或配置 GitHub Actions
3. 添加 CRON_SECRET 环境变量
4. 测试触发

---

## 🎯 推荐的实施方案

### 方案 1: 最小修改（推荐先部署）⭐

**目标**: 先部署核心功能，资源上传暂时禁用

**步骤**:
1. ✅ 直接部署到 Vercel（不修改代码）
2. ✅ 暂时禁用资源上传功能（前端隐藏按钮）
3. ✅ 定时任务暂时不执行（手动触发）
4. ✅ 测试其他所有功能

**优点**:
- 最快上线（15 分钟）
- 大部分功能可用
- 可以先让用户使用

**缺点**:
- 资源库功能不可用
- 提醒功能不自动

---

### 方案 2: 完整功能（推荐长期使用）⭐⭐⭐

**目标**: 修改代码，所有功能完美运行

**步骤**:
1. ✅ 集成 Supabase Storage（文件上传）
2. ✅ 配置 GitHub Actions（定时任务）
3. ✅ 部署到 Vercel
4. ✅ 测试所有功能

**工作量**: 3-5 小时

**成本**: $0/月（全部使用免费服务）

---

### 方案 3: 付费方案（最简单）

**使用 Vercel Pro**:
- Cron Jobs 内置支持
- 60 秒函数超时
- 更多资源

**成本**: $20/月

**但仍需要**:
- 修改文件上传（使用 Vercel Blob 或 Supabase Storage）

---

## 📊 对比表格

| 功能 | 当前实现 | Vercel 免费层 | 需要修改？ | 推荐方案 |
|------|---------|--------------|-----------|---------|
| SSR 渲染 | Nuxt SSR | ✅ 完美支持 | ❌ 不需要 | - |
| 数据库 | Prisma + PostgreSQL | ✅ 完美支持 | ❌ 不需要 | - |
| 用户认证 | JWT | ✅ 完美支持 | ❌ 不需要 | - |
| API 路由 | Nuxt API | ✅ 完美支持 | ❌ 不需要 | - |
| 文件上传 | 本地文件系统 | ❌ 不支持 | ✅ 必须修改 | Supabase Storage |
| 定时任务 | node-cron | ❌ 不支持 | ✅ 建议修改 | GitHub Actions |
| AI 生成 | OpenAI API | ✅ 完美支持 | ❌ 不需要 | - |
| 邮件发送 | SMTP | ✅ 完美支持 | ❌ 不需要 | - |
| 静态资源 | public/ | ✅ CDN 加速 | ❌ 不需要 | - |

---

## 💡 我的建议

### 立即行动（今天）:

1. **先部署基础版本**:
   ```bash
   vercel login
   vercel
   ```

2. **配置环境变量**（不包括文件上传）:
   - DATABASE_URL
   - JWT_SECRET
   - JWT_REFRESH_SECRET
   - OPENAI_API_KEY
   - NODE_ENV

3. **测试核心功能**:
   - ✅ 用户注册/登录
   - ✅ 学习计划
   - ✅ 学习小组
   - ✅ 讨论区
   - ✅ 笔记功能

### 接下来 1-2 天:

4. **添加 Supabase Storage**（如果需要资源库功能）
5. **配置 GitHub Actions**（如果需要自动提醒）

### 总时间:
- 基础部署：**15 分钟**
- 完整功能：**4-6 小时**

---

## ❓ 常见问题

### Q1: 不修改代码直接部署会怎样？

**A**: 大部分功能正常，只有：
- ❌ 资源上传会报错（500 错误）
- ❌ 定时提醒不会自动发送
- ❌ 每日一题不会自动生成

### Q2: 修改代码工作量大吗？

**A**: 不大
- 文件上传：2-3 小时
- 定时任务：1-2 小时
- 总计：**3-5 小时**

### Q3: 成本会增加吗？

**A**: 不会！推荐的方案都是免费的：
- Vercel: $0/月
- Supabase: $0/月（免费层）
- GitHub Actions: $0/月
- **总计**: $0/月（除了 OpenAI API）

### Q4: 可以部分功能先上线吗？

**A**: 可以！
- 先部署核心功能（不需要修改）
- 资源上传功能暂时禁用
- 定时任务手动触发
- 以后再慢慢完善

---

## 📚 下一步

**告诉我您的选择**:
1. **立即部署基础版本**（不修改代码，15 分钟）
2. **修改后部署完整版本**（3-5 小时工作量）
3. **需要我帮您修改代码**（我可以帮您实现）

**我可以帮您**:
- 创建 Supabase Storage 集成代码
- 创建 GitHub Actions 配置
- 创建 Cron API 端点
- 提供完整的迁移指南

---

**创建日期**: 2025-10-25
**状态**: 分析完成
**建议**: 先部署基础版本，再逐步完善
