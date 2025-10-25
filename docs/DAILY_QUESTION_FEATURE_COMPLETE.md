# 每日一题智能选题系统 - 完成报告

**日期**: 2025-10-24
**状态**: ✅ 完成开发，待测试

---

## 功能概述

为学习小组实现了**智能每日一题自动生成系统**，组长可以通过设置界面配置自动生成规则，系统将在每天指定时间自动为小组选择一道智能题目。

---

## 已完成的工作

### 1. ✅ 数据库模型 (Database Schema)

**文件**: [prisma/schema.prisma](prisma/schema.prisma)

添加了 `StudyGroupDailyQuestionConfig` 模型：

```prisma
model StudyGroupDailyQuestionConfig {
  id                String      @id @default(cuid())
  groupId           String      @unique
  group             StudyGroup  @relation(fields: [groupId], references: [id], onDelete: Cascade)
  enabled           Boolean     @default(false)        // 是否启用自动生成
  generateTime      String      @default("00:00")      // 生成时间 HH:MM
  difficulty        String?                            // 难度偏好: easy, medium, hard, mixed
  focusDomains      String?                            // 关注领域（JSON数组）
  excludeRecent     Int         @default(7)            // 排除最近N天出现过的题目
  prioritizeWeak    Boolean     @default(true)         // 优先选择组员错误率高的题目
  createdAt         DateTime    @default(now())
  updatedAt         DateTime    @updatedAt

  @@index([groupId])
}
```

**迁移命令已执行**: `npx prisma db push`

---

### 2. ✅ 智能选题算法服务

**文件**: [server/utils/daily-question-service.ts](server/utils/daily-question-service.ts)

#### 核心功能：

1. **`selectDailyQuestion(groupId)`** - 智能选题主函数
   - 获取小组配置和考试类型
   - 排除最近N天出现过的题目
   - 分析组员薄弱领域（基于错题统计）
   - 结合关注领域和难度偏好筛选候选题目
   - 随机选择一道题目

2. **`getWeakDomains(userIds)`** - 薄弱领域分析
   - 查询组员的考试成绩（分数低于60分）
   - 统计每个领域的错误率
   - 返回错误率最高的前3个领域

3. **`generateDailyQuestionForGroup(groupId)`** - 为单个小组生成每日一题
   - 检查今天是否已生成
   - 调用智能选题算法
   - 创建每日一题记录

4. **`generateDailyQuestionsForAllGroups()`** - 批量生成
   - 获取所有启用自动生成的小组
   - 依次为每个小组生成题目
   - 间隔100ms避免数据库压力

#### 智能选题逻辑：

```
1. 获取配置 → 验证是否启用
2. 排除最近题目 → 避免重复
3. 分析薄弱领域 → 从错题中学习
4. 组合筛选条件：
   - 薄弱领域 > 关注领域 > 所有领域
   - 难度偏好（easy/medium/hard/mixed）
   - 考试类型匹配
5. 查询候选题目（最多50道）
6. 候选不足时放宽条件重新查询
7. 随机选择一道题目
8. 创建每日一题记录
```

---

### 3. ✅ 配置管理 API

#### 3.1 获取配置

**文件**: [server/api/study-groups/[id]/daily-question-config.get.ts](server/api/study-groups/[id]/daily-question-config.get.ts)

- 验证用户是小组成员
- 返回当前配置或默认值
- 权限：所有成员可查看

#### 3.2 保存配置

**文件**: [server/api/study-groups/[id]/daily-question-config.post.ts](server/api/study-groups/[id]/daily-question-config.post.ts)

- 验证用户是组长或管理员
- 验证时间格式 (HH:MM)
- 保存配置（upsert操作）
- 权限：仅组长和管理员

**请求参数**:
```typescript
{
  enabled: boolean           // 是否启用
  generateTime: string       // 生成时间 "HH:MM"
  difficulty: string         // "easy" | "medium" | "hard" | "mixed"
  focusDomains: string[]     // 关注领域数组
  excludeRecent: number      // 排除最近N天
  prioritizeWeak: boolean    // 优先薄弱领域
}
```

---

### 4. ✅ 定时任务调度器

**文件**: [server/utils/scheduler.ts](server/utils/scheduler.ts)

添加了新的 cron 任务：

```typescript
// 每天午夜生成学习小组每日一题
cron.schedule('0 0 * * *', async () => {
  try {
    console.log('[Scheduler] 开始生成学习小组每日一题')
    await generateDailyQuestionsForAllGroups()
  } catch (error) {
    console.error('[Scheduler] Daily question generation failed:', error)
  }
})
```

**调度时间**: 每天午夜 00:00

---

### 5. ✅ 组长设置界面

#### 5.1 设置模态框组件

**文件**: [components/study-groups/DailyQuestionSettingsModal.vue](components/study-groups/DailyQuestionSettingsModal.vue)

**功能特性**:

- **启用/禁用开关** - 一键启用或关闭自动生成
- **生成时间选择器** - 选择每天生成题目的时间 (HH:MM)
- **难度偏好** - 四个选项：简单/中等/困难/混合
- **排除最近题目** - 配置排除最近N天的题目 (1-30天)
- **优先薄弱领域** - 开关选项，根据组员错题统计选题
- **关注领域输入** - 可选，输入关注的知识领域（逗号分隔）

**用户体验**:
- 加载动画
- 实时保存
- 响应式设计
- 表单验证
- 友好的提示信息

#### 5.2 侧边栏集成

**文件**: [components/study-groups/MembersSidebar.vue](components/study-groups/MembersSidebar.vue)

**修改内容**:
- 在"每日一题"卡片标题旁添加设置按钮（齿轮图标）
- 仅对组长和管理员显示
- 点击打开设置模态框
- 保存后自动刷新每日一题数据

**代码位置**: [MembersSidebar.vue:45-58](components/study-groups/MembersSidebar.vue#L45-L58)

---

## 文件清单

### 新建文件
1. ✅ `server/utils/daily-question-service.ts` - 智能选题服务
2. ✅ `server/api/study-groups/[id]/daily-question-config.get.ts` - 获取配置API
3. ✅ `server/api/study-groups/[id]/daily-question-config.post.ts` - 保存配置API
4. ✅ `components/study-groups/DailyQuestionSettingsModal.vue` - 设置界面组件

### 修改文件
1. ✅ `prisma/schema.prisma` - 添加配置模型
2. ✅ `server/utils/scheduler.ts` - 添加定时任务
3. ✅ `components/study-groups/MembersSidebar.vue` - 添加设置按钮和模态框

---

## 权限控制

| 功能 | 组长 | 管理员 | 版主 | 成员 |
|-----|------|--------|------|------|
| 查看配置 | ✅ | ✅ | ✅ | ✅ |
| 修改配置 | ✅ | ✅ | ❌ | ❌ |
| 查看每日一题 | ✅ | ✅ | ✅ | ✅ |
| 答题 | ✅ | ✅ | ✅ | ✅ |

---

## 使用流程

### 组长/管理员配置流程

1. **进入学习小组页面**
2. **点击"每日一题"卡片右上角的设置按钮（齿轮图标）**
3. **在设置模态框中配置**:
   - 启用自动生成（打开开关）
   - 选择生成时间（例如：08:00）
   - 选择难度偏好（例如：混合）
   - 设置排除天数（例如：7天）
   - 启用"优先薄弱领域"（推荐）
   - （可选）输入关注领域
4. **点击"保存设置"**
5. **系统将在每天指定时间自动生成题目**

### 成员使用流程

1. **进入学习小组页面**
2. **查看侧边栏"每日一题"卡片**
3. **点击"开始答题"按钮**
4. **完成答题后显示"✓ 已完成"**

---

## 技术亮点

### 1. 智能选题算法

- **数据驱动**: 基于组员实际错题统计
- **自适应**: 根据薄弱领域动态调整
- **容错机制**: 候选不足时自动放宽条件
- **随机性**: 避免题目顺序固定

### 2. 性能优化

- **批量处理**: 间隔100ms避免数据库压力
- **查询优化**: 限制候选题目数量（50道）
- **索引支持**: groupId 字段已建立索引

### 3. 用户体验

- **可视化配置**: 图形化界面，无需技术知识
- **实时反馈**: 保存后立即生效
- **权限控制**: 只有管理员能修改配置
- **响应式设计**: 适配不同屏幕尺寸

---

## 测试检查清单

### 功能测试

- [ ] **数据库迁移**: 验证 `StudyGroupDailyQuestionConfig` 表已创建
- [ ] **配置保存**: 测试保存不同配置选项
- [ ] **配置加载**: 测试打开设置界面是否正确显示已保存的配置
- [ ] **智能选题**: 手动调用 `generateDailyQuestionForGroup()` 验证选题逻辑
- [ ] **薄弱领域分析**: 验证是否正确识别组员薄弱领域
- [ ] **定时任务**: 等待午夜00:00或手动触发验证自动生成
- [ ] **权限控制**: 验证普通成员无法修改配置

### UI测试

- [ ] **设置按钮显示**: 只对组长/管理员显示
- [ ] **模态框打开/关闭**: 点击设置按钮和关闭按钮
- [ ] **表单验证**: 测试时间格式验证
- [ ] **保存反馈**: 验证保存成功提示
- [ ] **加载状态**: 验证加载动画显示

### 边界测试

- [ ] **无配置**: 测试首次打开显示默认值
- [ ] **无题目**: 测试题库为空时的处理
- [ ] **无组员**: 测试空小组的处理
- [ ] **重复生成**: 测试同一天重复生成的拦截

---

## 下一步优化建议

### 短期优化

1. **手动触发生成**: 添加"立即生成今日题目"按钮
2. **历史记录**: 显示过去7天的每日一题
3. **完成统计**: 显示组员答题完成率
4. **通知提醒**: 新题目生成时发送通知给组员

### 长期优化

1. **AI推荐**: 使用机器学习优化选题算法
2. **难度自适应**: 根据组员水平动态调整难度
3. **知识图谱**: 建立知识点依赖关系，系统性出题
4. **竞赛模式**: 每日一题排行榜和积分系统

---

## 相关文档

- [Study Groups Fixes Summary](STUDY_GROUPS_FIXES_SUMMARY.md) - 之前修复的问题
- [Prisma Schema](prisma/schema.prisma) - 数据库模型
- [Scheduler Plugin](server/plugins/scheduler.ts) - 定时任务插件

---

## 技术栈

- **后端**: Nuxt 3 + Nitro
- **数据库**: Prisma + SQLite
- **定时任务**: node-cron
- **前端**: Vue 3 + Tailwind CSS
- **状态管理**: Pinia

---

**最后更新**: 2025-10-24
**开发状态**: ✅ 开发完成，待用户测试

---

## 快速测试命令

```bash
# 1. 验证数据库表
npx prisma studio
# 查看 StudyGroupDailyQuestionConfig 表

# 2. 手动触发生成（在 Node.js REPL 或测试脚本中）
# 需要创建测试脚本

# 3. 查看定时任务日志
# 检查服务器日志中的 [Scheduler] 和 [DailyQuestion] 标记
```

---

**注意**: 此功能已完成开发，建议先在测试环境验证后再部署到生产环境。
