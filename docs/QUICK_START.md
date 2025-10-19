# 快速启动指南

## 第一步：安装依赖

```bash
npm install
```

## 第二步：初始化数据库

```bash
# 创建数据库和表结构
npm run db:push

# 填充示例数据（包含示例分类和题目）
npm run db:seed
```

## 第三步：启动开发服务器

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000)

## 主要功能页面

### 1. 首页
- 地址：`http://localhost:3000`
- 功能：查看整体介绍，快速导航到各个功能

### 2. 考试大纲
- 地址：`http://localhost:3000/outline`
- 功能：
  - 查看三大类考试内容（组织、内容、复习）
  - 点击分类查看子分类
  - 点击"开始学习"进入练习

### 3. 练习页面（互动答题）
- 地址：`http://localhost:3000/practice?category=xxx`
- 功能：
  - **显示题目所属分类**：每道题都会显示它属于哪个考试大纲分类
  - **实时反馈**：提交答案后立即显示对错
  - **详细解析**：查看答案解析和知识点关联
  - 上一题/下一题导航
  - 本次练习统计

### 4. 模拟考试
- 地址：`http://localhost:3000/exam`
- 功能：
  - 配置考试（题目数量、难度、范围）
  - 计时考试
  - 答题卡快速导航
  - 考试结果统计

### 5. 复习计划
- 地址：`http://localhost:3000/study-plan`
- 功能：
  - 创建个性化学习计划
  - 设置学习目标
  - 选择重点分类

### 6. 管理后台
- 地址：`http://localhost:3000/admin`
- 功能：
  - **上传题目**（支持 Excel/CSV/JSON 三种格式）
  - 创建和管理分类
  - 查看系统统计

## 如何上传题目

系统支持三种文件格式：**Excel (.xlsx/.xls)**、**CSV (.csv)** 和 **JSON (.json)**

### 方法 1：使用模板（推荐）

1. 访问管理后台：`http://localhost:3000/admin`
2. 点击"下载 CSV 模板"或"下载 JSON 模板"
3. 填写题目数据
4. 上传文件

### 方法 2：手动创建 Excel/CSV

创建包含以下列的 Excel 或 CSV 文件：

| question | categoryCode | correctAnswer | options | explanation | difficulty | type |
|----------|--------------|---------------|---------|-------------|------------|------|
| 阴阳的概念？ | TCM_BASIC | A. 对立统一 | ["A. 对立统一", "B. 完全独立"] | 阴阳是对立统一的 | easy | multiple_choice |

### 方法 3：使用 JSON 格式（高效推荐）

JSON 格式更加结构化，适合大量题目导入：

```json
[
  {
    "question": "中医理论中，阴阳的基本概念是什么？",
    "categoryCode": "TCM_BASIC",
    "correctAnswer": "A. 阴阳是对立统一的两个方面",
    "options": [
      "A. 阴阳是对立统一的两个方面",
      "B. 阴阳是完全独立的概念"
    ],
    "explanation": "阴阳学说认为，阴阳是对立统一的两个方面。",
    "difficulty": "easy",
    "type": "multiple_choice"
  }
]
```

也可以使用对象格式：

```json
{
  "questions": [
    { ... },
    { ... }
  ]
}
```

### 字段说明

**必填字段：**
- `question`：题目内容
- `categoryCode`：分类代码（必须先在管理后台创建分类）
- `correctAnswer`：正确答案

**选填字段：**
- `options`：选项（JSON 数组格式或字符串）
- `explanation`：答案解析
- `difficulty`：难度（easy/medium/hard，默认 medium）
- `type`：题型（默认 multiple_choice）
- `tags`：标签（JSON 数组或字符串）
- `source`：题目来源

## 示例分类代码

运行 `npm run db:seed` 后，会自动创建以下分类：

### 组织部分
- `EXAM_INFO` - 考试基本信息
- `EXAM_RULES` - 考试规则与要求

### 内容部分
- `TCM_BASIC` - 中医基础理论
- `TCM_DIAG` - 中医诊断学
- `HERB` - 中药学
- `FORMULA` - 方剂学
- `ACU` - 针灸学
- `TCM_INTERNAL` - 中医内科学
- `TCM_SURGERY` - 中医外科学

### 复习部分
- `MOCK_EXAM` - 模拟试题
- `KEY_POINTS` - 重点知识点
- `COMMON_MISTAKES` - 易错题解析

## 常见问题

### Q: 如何查看数据库内容？
```bash
npm run db:studio
```
这会打开 Prisma Studio，可以可视化查看和编辑数据库。

### Q: 上传题目失败怎么办？
检查错误信息，常见原因：
1. 分类代码不存在（需要先在管理后台创建分类）
2. 缺少必填字段（question、categoryCode、correctAnswer）
3. Excel 格式错误

### Q: 如何重置数据库？
```bash
# 删除数据库文件
rm prisma/dev.db

# 重新创建数据库
npm run db:push

# 填充示例数据
npm run db:seed
```

### Q: 如何添加新的分类？
1. 访问管理后台：`http://localhost:3000/admin`
2. 在"管理分类"区域填写表单
3. 提交创建

### Q: 为什么答题后看不到解析？
确保题目数据中包含 `explanation` 字段。示例题目都有解析。

## 下一步

现在您可以：
1. 创建自己的分类
2. 上传自己的题目
3. 开始练习和考试
4. 根据需要自定义功能

祝学习愉快！
