# 考试配置架构说明

## 📁 目录结构

```
server/exam-configs/
├── index.ts                    # 统一入口，导出 ExamConfigFactory
├── cale/                       # CALE 考试配置
│   ├── index.ts                # CALE 主配置导出
│   ├── mock-exam-config.ts     # CALE 模拟考试配置
│   ├── question-generator.ts   # CALE 题目生成逻辑
│   └── scoring-rules.ts        # CALE 评分规则
└── nccaom/                     # NCCAOM 考试配置
    ├── index.ts                # NCCAOM 主配置导出
    ├── mock-exam-config.ts     # NCCAOM 模拟考试配置
    ├── question-generator.ts   # NCCAOM 题目生成逻辑
    └── scoring-rules.ts        # NCCAOM 评分规则
```

## 🎯 设计理念

### 1. **按考试类型隔离**
- 每个考试类型（CALE、NCCAOM）有独立的目录
- 不同考试的逻辑完全隔离，互不影响
- 便于维护和扩展新的考试类型

### 2. **配置与逻辑分离**
- `mock-exam-config.ts`: 纯配置数据（题目数、时长、分布等）
- `question-generator.ts`: 题目生成逻辑
- `scoring-rules.ts`: 评分计算逻辑

### 3. **工厂模式**
- `ExamConfigFactory` 统一管理所有考试配置
- 通过工厂获取配置，无需硬编码判断

## 📝 使用示例

### 在 API 中使用

```typescript
import { ExamConfigFactory } from '../../exam-configs'

export default defineEventHandler(async (event) => {
  const { examType } = await readBody(event)  // 'cale' or 'nccaom'

  // 获取该考试类型的配置
  const config = ExamConfigFactory.getConfig(examType)

  // 生成题目
  const { questionIds, breakdown } = await config.questionGenerator.generateQuestions(
    config.mockExamConfig
  )

  // 创建考试...
})
```

### 计算分数

```typescript
import { ExamConfigFactory } from '../../exam-configs'

export default defineEventHandler(async (event) => {
  const { examType, answers } = await readBody(event)

  // 获取评分规则
  const config = ExamConfigFactory.getConfig(examType)

  // 计算分数
  const result = config.scoringRules.calculateScore(answers)

  return {
    totalScore: result.totalScore,
    passed: result.breakdown.passed,
    breakdown: result.breakdown
  }
})
```

## 🔧 添加新考试类型

### 步骤 1: 创建配置目录
```bash
mkdir server/exam-configs/new-exam
```

### 步骤 2: 创建配置文件
1. `mock-exam-config.ts` - 定义考试配置
2. `question-generator.ts` - 实现 `QuestionGenerator` 接口
3. `scoring-rules.ts` - 实现 `ScoringRules` 接口
4. `index.ts` - 导出配置提供者

### 步骤 3: 注册到工厂
在 `server/exam-configs/index.ts` 中添加：
```typescript
import { newExamConfig } from './new-exam'

const examConfigRegistry = {
  cale: caleExamConfig,
  nccaom: nccaomExamConfig,
  newexam: newExamConfig  // 添加新考试
}
```

## 📊 CALE vs NCCAOM 差异

### CALE
- **题目数**: 200 道
- **时长**: 300 分钟 (5小时)
- **分布**: 5个Domain，按百分比分布
- **及格**: 70% (140/200)
- **评分**: 简单对错，每题1分
- **题目选择**: 完全随机

### NCCAOM
- **题目数**: 100 道 (APL模块)
- **时长**: 120 分钟 (2小时)
- **分布**: 4个Module，按百分比分布
- **及格**: 70分
- **评分**: 标准分 300-800，及格线500
- **题目选择**: 按难度分层 (简单30%、中等40%、困难30%)

## 🚀 优势

1. **可扩展性**: 轻松添加新考试类型
2. **可维护性**: 每个考试的逻辑独立，修改互不影响
3. **可测试性**: 每个模块可独立测试
4. **类型安全**: TypeScript 接口保证类型正确
5. **代码复用**: 通用逻辑（如题目选择算法）可提取为工具函数

## 📚 相关文件

- `types/exam-configs.ts` - 类型定义
- `server/api/exam/create-mock-v2.post.ts` - 使用新架构的API示例
- `server/utils/exam-factory.ts` - 工厂方法（可选）
- `composables/exam-specific/` - 前端考试特定逻辑（可选）
