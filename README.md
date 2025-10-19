# 中医考试系统

一个完整的在线考试准备平台，支持多种中医执照考试。

## 🎓 支持的考试类型

- **Cale** - 加州中医执照考试（California Acupuncture Licensing Examination）
- **NCCAOM** - 全国中医针灸认证考试（National Certification Commission for Acupuncture and Oriental Medicine）

用户可以在系统中自由切换不同的考试类型，每种考试都有独立的考试大纲、题库和复习计划。

## 功能特点

### 1. 多考试系统 ⭐ NEW
- 支持 Cale 和 NCCAOM 两种考试
- 一键切换考试类型
- 每种考试拥有独立的数据和内容
- 学习进度和历史分开管理

### 2. 考试大纲
- 三大部分分类：组织部分、内容部分、复习部分
- 多级分类管理，支持主分类和子分类
- 实时显示每个分类的题目数量

### 3. 复习计划
- 创建个性化学习计划
- 设置学习目标和时间表
- 按分类选择重点复习内容
- 支持为不同考试创建独立计划

### 4. 模拟考试（全方位自定义）
- **灵活配置**：
  - 按具体分类多选（如：只考针灸学+中药学）
  - 自定义考试时长（30/45/60/90/120分钟）
  - 题目数量自由设置（5-200题）
  - 难度等级选择（简单/中等/困难）
- **互动答题**：
  - 实时显示题目所属分类
  - 即时反馈对错
  - 详细答案解析
  - 知识点关联
- **考试辅助**：
  - 倒计时功能
  - 答题卡快速导航
  - 成绩统计分析

### 5. 题目管理（后端自动处理）
- **多格式支持**：支持 Excel、CSV、JSON 三种格式批量导入
- **智能解析**：后端自动处理，上传即可
- **错误处理**：详细的导入结果反馈
- **分类管理**：创建和管理考试分类，支持为不同考试创建分类
- **考试类型标记**：上传数据时可指定考试类型（默认 Cale）

## 技术栈

**前端**：Nuxt 3 + Tailwind CSS + TypeScript + Pinia（状态管理）
**后端**：Nuxt Server API + Prisma ORM + ExcelJS + PapaParse
**数据库**：SQLite（可切换到 PostgreSQL）
**状态管理**：Pinia（用于考试类型切换和状态持久化）

> 📌 **安全性**：项目使用 ExcelJS 和 PapaParse 代替 xlsx，避免已知的安全漏洞。详见 [SECURITY.md](docs/SECURITY.md)

## 快速开始

### 1. 安装依赖
```bash
npm install
```

### 2. 初始化数据库
```bash
# 创建数据库
npm run db:push

# 填充示例数据（可选）
npm run db:seed
```

### 3. 启动开发服务器
```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000)

### 4. 访问管理后台
访问 [http://localhost:3000/admin](http://localhost:3000/admin) 来：
- 创建分类
- 批量上传题目
- 查看系统统计

## 题目上传格式

支持三种格式：**Excel (.xlsx/.xls)**、**CSV (.csv)**、**JSON (.json)**

### JSON 格式（推荐，高效）

```json
[
  {
    "question": "阴阳的基本概念是什么？",
    "categoryCode": "TCM_BASIC",
    "examType": "cale",
    "correctAnswer": "A. 对立统一",
    "options": ["A. 对立统一", "B. 完全独立"],
    "explanation": "阴阳是对立统一的两个方面",
    "difficulty": "easy",
    "type": "multiple_choice"
  }
]
```

### Excel/CSV 格式

创建包含以下列的文件：

- **question**（必填）：题目内容
- **categoryCode**（必填）：分类代码
- **examType**（选填）：考试类型 cale/nccaom（默认 cale）
- **correctAnswer**（必填）：正确答案
- **options**（选填）：选项（JSON 格式）
- **explanation**（选填）：答案解析
- **difficulty**（选填）：难度 easy/medium/hard
- **type**（选填）：题型 multiple_choice

💡 可在管理后台下载模板（支持 CSV 和 JSON 格式）

## 常用命令

```bash
npm run dev          # 启动开发服务器
npm run build        # 构建生产版本
npm run db:push      # 同步数据库
npm run db:studio    # 打开数据库管理界面
npm run db:seed      # 填充示例数据
```

## 项目特色

1. **互动性强**：每道题都会显示所属分类、难度，答题后立即给出反馈和解析
2. **上传简单**：只需准备 Excel 文件，后端自动处理所有解析工作
3. **全栈一体**：Nuxt 3 全栈方案，部署简单
4. **类型安全**：TypeScript + Prisma 提供完整的类型支持

## 📚 文档

- [快速开始指南](docs/QUICK_START.md) - 详细的安装和使用说明
- [项目技术概览](docs/PROJECT_OVERVIEW.md) - 架构设计和技术细节
- [安全性说明](docs/SECURITY.md) - 安全最佳实践和更新日志
- [更新日志](docs/CHANGELOG.md) - 版本历史和功能更新

祝您考试顺利！
