# 考试配置架构文档

## 📋 概述

为了更好地管理不同考试类型（CALE 和 NCCAOM）的不同题目生成机制和评分规则，我们采用了**按考试类型分目录**的架构设计。

## 🎯 为什么需要这个架构？

### 问题
- CALE 和 NCCAOM 有不同的考试规则
- CALE: 200题，5小时，按Domain分布，简单评分
- NCCAOM: 100题，2小时，按Module分布，标准分评分，按难度分层
- 硬编码在单个文件中难以维护和扩展

### 解决方案
✅ **按考试类型隔离**：每个考试有独立的配置目录
✅ **配置与逻辑分离**：配置、生成、评分分别管理
✅ **工厂模式**：统一接口，动态获取配置
✅ **类型安全**：TypeScript 接口保证正确性

## 📁 新的文件组织结构

```
cale_exam/
├── types/
│   └── exam-configs.ts                 # 📝 类型定义
│
├── server/
│   ├── exam-configs/                   # ⭐ 核心：考试配置目录
│   │   ├── README.md                   # 架构说明
│   │   ├── index.ts                    # 工厂入口
│   │   │
│   │   ├── cale/                       # 🔵 CALE 配置
│   │   │   ├── index.ts                # CALE 主导出
│   │   │   ├── mock-exam-config.ts     # 考试配置（200题，5小时）
│   │   │   ├── question-generator.ts   # 题目生成（随机抽取）
│   │   │   └── scoring-rules.ts        # 评分规则（简单对错）
│   │   │
│   │   └── nccaom/                     # 🟣 NCCAOM 配置
│   │       ├── index.ts                # NCCAOM 主导出
│   │       ├── mock-exam-config.ts     # 考试配置（100题，2小时）
│   │       ├── question-generator.ts   # 题目生成（按难度分层）
│   │       └── scoring-rules.ts        # 评分规则（标准分300-800）
│   │
│   └── api/
│       └── exam/
│           ├── create-mock.post.ts     # ❌ 旧版 API（硬编码）
│           └── create-mock-v2.post.ts  # ✅ 新版 API（使用工厂）
│
└── composables/
    └── exam-specific/                  # 🎨 前端考试特定逻辑（可选）
        ├── useCaleExam.ts
        └── useNccaomExam.ts
```

## 🔧 核心组件

### 1. 类型定义 (`types/exam-configs.ts`)

```typescript
export interface MockExamConfig {
  examType: ExamType
  totalQuestions: number
  duration: number
  domainDistribution: Record<string, number>
  passingScore?: number
  metadata?: Record<string, any>
}

export interface QuestionGenerator {
  generateQuestions(config: MockExamConfig): Promise<{
    questionIds: string[]
    breakdown: Record<string, number>
  }>
}

export interface ScoringRules {
  calculateScore(answers: any[]): {
    totalScore: number
    correctCount: number
    wrongCount: number
    breakdown: Record<string, any>
  }
}
```

### 2. 工厂模式 (`server/exam-configs/index.ts`)

```typescript
export class ExamConfigFactory {
  static getConfig(examType: ExamType): ExamConfigProvider {
    const config = examConfigRegistry[examType]
    if (!config) {
      throw new Error(`Unsupported exam type: ${examType}`)
    }
    return config
  }

  static getSupportedExamTypes(): ExamType[] {
    return ['cale', 'nccaom']
  }
}
```

### 3. 考试特定配置

#### CALE 配置示例
```typescript
// server/exam-configs/cale/mock-exam-config.ts
export const CALEMockExamConfig: MockExamConfig = {
  examType: 'cale',
  totalQuestions: 200,
  duration: 300,
  domainDistribution: {
    'DOMAIN_1_ASSESSMENT': 27,
    'DOMAIN_2_DIAGNOSIS': 17,
    // ... 其他 domains
  }
}

// server/exam-configs/cale/question-generator.ts
export class CALEQuestionGenerator implements QuestionGenerator {
  async generateQuestions(config) {
    // CALE 特定：完全随机抽取
    // ...
  }
}
```

#### NCCAOM 配置示例
```typescript
// server/exam-configs/nccaom/mock-exam-config.ts
export const NCCAAOMockExamConfig: MockExamConfig = {
  examType: 'nccaom',
  totalQuestions: 100,
  duration: 120,
  domainDistribution: {
    'MODULE_1_POINT_LOCATION': 40,
    'MODULE_2_POINT_FUNCTIONS': 25,
    // ... 其他 modules
  }
}

// server/exam-configs/nccaom/question-generator.ts
export class NCCAAOMQuestionGenerator implements QuestionGenerator {
  async generateQuestions(config) {
    // NCCAOM 特定：按难度分层（简单30%、中等40%、困难30%）
    // ...
  }
}
```

## 💡 使用方法

### 在 API 中使用

```typescript
import { ExamConfigFactory } from '../../exam-configs'

export default defineEventHandler(async (event) => {
  const { examType } = await readBody(event)

  // ✅ 使用工厂获取配置（自动选择 CALE 或 NCCAOM）
  const config = ExamConfigFactory.getConfig(examType)

  // 生成题目
  const { questionIds } = await config.questionGenerator.generateQuestions(
    config.mockExamConfig
  )

  // 创建考试...
})
```

### 计算分数

```typescript
const config = ExamConfigFactory.getConfig(examType)
const result = config.scoringRules.calculateScore(answers)

// CALE: { totalScore: 150, passed: true, percentage: 75 }
// NCCAOM: { totalScore: 75, passed: true, scaledScore: 550 }
```

## 🔄 迁移路径

### 现有代码迁移
1. ✅ 旧 API 继续工作：`create-mock.post.ts`
2. ✅ 新 API 使用新架构：`create-mock-v2.post.ts`
3. ✅ 逐步迁移其他 API 到新架构

### 推荐做法
- 新功能：直接使用 `ExamConfigFactory`
- 现有功能：逐步迁移到新架构
- 混合使用：两种方式可以共存

## 📊 CALE vs NCCAOM 对比

| 特性 | CALE | NCCAOM |
|------|------|--------|
| 题目数 | 200 | 100 |
| 时长 | 300分钟 (5小时) | 120分钟 (2小时) |
| 组织方式 | 5个 Domains | 4个 Modules |
| 及格线 | 70% (140/200) | 70分 |
| 评分方式 | 简单对错 (1分/题) | 标准分 (300-800) |
| 题目选择 | 完全随机 | 按难度分层 |
| 难度分布 | 无 | 简单30%/中等40%/困难30% |

## 🚀 扩展新考试类型

### 步骤 1: 创建配置目录
```bash
mkdir -p server/exam-configs/new-exam
```

### 步骤 2: 创建配置文件
```typescript
// server/exam-configs/new-exam/index.ts
export const newExamConfig: ExamConfigProvider = {
  examType: 'newexam',
  mockExamConfig: { /* ... */ },
  questionGenerator: new NewExamQuestionGenerator(),
  scoringRules: new NewExamScoringRules()
}
```

### 步骤 3: 注册到工厂
```typescript
// server/exam-configs/index.ts
const examConfigRegistry = {
  cale: caleExamConfig,
  nccaom: nccaomExamConfig,
  newexam: newExamConfig  // ✅ 添加新考试
}
```

## ✅ 优势总结

1. **✅ 隔离性**: 修改 CALE 不影响 NCCAOM，反之亦然
2. **✅ 可扩展**: 添加新考试类型只需创建新目录
3. **✅ 可维护**: 配置、逻辑、评分清晰分离
4. **✅ 类型安全**: TypeScript 接口确保正确性
5. **✅ 可测试**: 每个模块可独立单元测试
6. **✅ 灵活性**: 每个考试可以有完全不同的逻辑

## 📚 相关文件清单

- ✅ `types/exam-configs.ts` - 类型定义
- ✅ `server/exam-configs/index.ts` - 工厂入口
- ✅ `server/exam-configs/cale/*` - CALE 配置
- ✅ `server/exam-configs/nccaom/*` - NCCAOM 配置
- ✅ `server/exam-configs/README.md` - 详细说明
- ✅ `server/api/exam/create-mock-v2.post.ts` - 新版 API 示例

## 🎓 总结

这个架构让我们能够：
- 🎯 为每个考试类型定制不同的逻辑
- 📦 保持代码组织清晰和模块化
- 🔧 轻松添加新的考试类型
- 🧪 独立测试每个考试的逻辑
- 🚀 提高代码可维护性和可扩展性

现在，CALE 和 NCCAOM 的所有逻辑都分别管理在各自的目录中，互不干扰！
