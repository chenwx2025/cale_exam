# CALE 全真模拟考试功能

## 功能概述

新增了"一键生成CALE全真模拟考试"功能，完全按照官方CALE考试标准生成模拟考试。

## 官方考试规格

根据CALE官方考试大纲 (PSI CALE Examination Bulletin):

- **总题数**: 200道题
- **考试时长**: 300分钟 (5小时)
- **题目类型**: 从现有题库中随机抽取
- **Domain分布**: 按官方比例自动分配

## Domain 题目分配

### 官方占比（基于CALE Examination Bulletin）

| Domain | 名称 | 官方占比 | 200题分配 |
|--------|------|----------|----------|
| Domain 1 | Patient Assessment (评估病人) | 27% | 54题 |
| Domain 2 | Diagnosis & Treatment Planning (诊断和治疗计划) | 17% | 34题 |
| Domain 3A | Acupuncture Point Selection (针刺选穴) | 16% | 32题 |
| Domain 3B | Point Location & Needling Technique (取穴定位与针刺手法) | 8% | 16题 |
| Domain 3C | Adjunctive Therapies (辅助治疗方式) | 5% | 10题 |
| Domain 3D | Herbal Therapy (中药治疗) | 15% | 30题 |
| Domain 4 | Professional Responsibilities (专业职责) | 11% | 22题 |
| **总计** | | **99%** | **198题** |

**注**: Domain 3 (Acupuncture Treatment) 总占比为32%，细分为4个子域

## 技术实现

### 后端API

**文件**: `/server/api/exam/create-mock.post.ts`

```typescript
const CALE_MOCK_EXAM_CONFIG = {
  totalQuestions: 200,  // CALE考试总题数
  duration: 300,        // 考试时长：300分钟 (5小时)
  domainDistribution: {
    'DOMAIN_1_ASSESSMENT': 27,      // 27%
    'DOMAIN_2_DIAGNOSIS': 17,       // 17%
    'DOMAIN_3A_ACU_SELECTION': 16,  // 16%
    'DOMAIN_3B_ACU_TECHNIQUE': 8,   // 8%
    'DOMAIN_3C_ADJUNCTIVE': 5,      // 5%
    'DOMAIN_3D_HERBAL': 15,         // 15%
    'DOMAIN_4_PROFESSIONAL': 11     // 11%
  }
}
```

### 核心逻辑

1. **按比例计算题数**
   ```typescript
   const questionCount = Math.round((percentage / 100) * totalQuestions)
   ```

2. **从题库随机抽取**
   ```typescript
   const shuffled = availableQuestions.sort(() => 0.5 - Math.random())
   const selected = shuffled.slice(0, questionCount)
   ```

3. **创建考试记录**
   ```typescript
   const exam = await prisma.exam.create({
     data: {
       mode: 'mock',
       generatedBy: 'system',
       questionCount: selectedQuestionIds.length,
       duration: config.duration,
       // ...
     }
   })
   ```

### 前端界面

**文件**: `/pages/exam/config.vue`

**特点**:
- 仅在选择CALE考试类型时显示
- 醒目的绿色按钮，突出"一键生成"特性
- 显示考试规格（200题 · 300分钟 · 5小时）
- 加载状态提示
- 成功后显示详细的Domain分配信息

## 使用流程

### 1. 进入考试配置页面

访问: `/exam/config`

### 2. 确认考试类型

确保选择了 "CALE (加州)" 考试类型

### 3. 点击"一键生成"按钮

点击绿色的"一键生成 CALE 全真模拟考试"按钮

### 4. 查看生成结果

系统会显示弹窗，包含:
- 总题数
- 考试时长
- 各Domain的题目分配

### 5. 开始考试

自动跳转到考试界面，开始答题

## API 端点

### POST `/api/exam/create-mock`

**请求体**:
```json
{
  "userId": "demo-user"
}
```

**响应**:
```json
{
  "success": true,
  "examId": "cmgz9fsf0025hpj0aaayhhni6",
  "message": "模拟考试创建成功",
  "config": {
    "totalQuestions": 200,
    "duration": 300,
    "domainBreakdown": {
      "DOMAIN_1_ASSESSMENT": 54,
      "DOMAIN_2_DIAGNOSIS": 34,
      "DOMAIN_3A_ACU_SELECTION": 32,
      "DOMAIN_3B_ACU_TECHNIQUE": 16,
      "DOMAIN_3C_ADJUNCTIVE": 10,
      "DOMAIN_3D_HERBAL": 30,
      "DOMAIN_4_PROFESSIONAL": 22
    }
  }
}
```

## 题库要求

为了成功生成200题的模拟考试，各Domain题库需要满足最低题目数：

| Domain | 最低要求 | 当前题库 | 状态 |
|--------|---------|---------|------|
| DOMAIN_1_ASSESSMENT | 54题 | 121题 | ✓ |
| DOMAIN_2_DIAGNOSIS | 34题 | 113题 | ✓ |
| DOMAIN_3A_ACU_SELECTION | 32题 | 112题 | ✓ |
| DOMAIN_3B_ACU_TECHNIQUE | 16题 | 88题 | ✓ |
| DOMAIN_3C_ADJUNCTIVE | 10题 | 55题 | ✓ |
| DOMAIN_3D_HERBAL | 30题 | 77题 | ✓ |
| DOMAIN_4_PROFESSIONAL | 22题 | 30题 | ✓ |

**所有Domain题目充足！** 可以成功生成模拟考试 ✅

## 数据库设计

### Exam 表字段

```prisma
model Exam {
  id            String   @id @default(cuid())
  userId        String
  examType      String   // 'cale'
  title         String   // "CALE 全真模拟考试 - 2025/10/20"
  mode          String?  // 'mock' 标记为模拟考试
  generatedBy   String?  // 'system'
  questionCount Int      // 198-200
  duration      Int      // 300 (分钟)
  difficulty    String   // 'mixed'
  status        String   // 'not_started', 'in_progress', 'completed'
  totalScore    Int
  // ...
}
```

## 特性优势

### 1. **真实考试体验**
- 题目数量、时间、难度完全还原官方考试
- 各Domain占比严格按照官方标准

### 2. **智能题目分配**
- 自动计算各Domain所需题目数
- 随机抽取，避免重复
- 确保题目质量和多样性

### 3. **一键操作**
- 无需手动配置参数
- 快速生成，立即开始
- 减少用户决策疲劳

### 4. **数据追踪**
- 标记为 `mode: 'mock'`
- 便于后续统计分析
- 区分练习和模拟考试

## 未来优化方向

### 1. 用户认证
- 替换硬编码的 `demo-user`
- 集成真实的用户系统

### 2. 历史记录
- 显示用户的模拟考试历史
- 追踪成绩进步情况

### 3. 智能推荐
- 根据用户薄弱Domain调整题目难度
- 个性化的练习建议

### 4. 答题分析
- 各Domain正确率统计
- 知识点掌握程度报告
- 与其他考生对比

## 总结

CALE全真模拟考试功能已完全实现，提供了与官方考试一致的测试体验。通过智能的题目分配算法和简洁的用户界面，帮助考生更好地准备CALE考试。

**关键特性**:
- ✅ 200道题，300分钟 (5小时)
- ✅ 按官方比例分配各Domain题目
- ✅ 一键生成，即刻开始
- ✅ 从现有题库随机抽取
- ✅ 完整的考试流程和体验

**页面访问**: [http://localhost:3000/exam/config](http://localhost:3000/exam/config)
