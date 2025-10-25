# 题目生成指南

## 当前进度（已验证）

截至目前，题库实际有 **262题**，目标是达到 **500+题**。

### 各Domain当前状态（实际统计）：

| Domain | 当前题数 | 建议目标 | 还需补充 |
|--------|---------|---------|---------|
| Domain 1 (评估病人) | 60 | 70 | 10题 |
| Domain 2 (诊断和治疗计划) | 51 | 80 | 29题 |
| Domain 3A (针刺选穴) | 60 | 80 | 20题 |
| Domain 3B (取穴定位与针刺手法) | 17 | 80 | 63题 |
| Domain 3C (辅助治疗方式) | 27 | 70 | 43题 |
| Domain 3D (中药治疗) | 34 | 70 | 36题 |
| Domain 4 (专业职责) | 13 | 70 | 57题 |
| **总计** | **262** | **520** | **258题** |

要达到500+题目，总共需要再补充约 **238-260题**。

## 题目生成工具

### 1. 使用去重检测脚本

所有生成脚本都包含智能去重功能：
- 基于题目内容的相似度检测
- 自动跳过重复题目
- 85%以上相似度视为重复

### 2. 题目质量要求

每道题目必须包含：
- **question**: 题目内容（清晰、专业）
- **options**: 4个选项（A/B/C/D）
- **correctAnswer**: 正确答案（A/B/C/D）
- **explanation**: 详细解析（说明为什么选这个答案）
- **difficulty**: 难度（easy/medium/hard）

### 3. 题目类型

#### Domain 2 (诊断和治疗计划) 题目示例：
```typescript
{
  question: '患者出现\"但寒不热、四肢厥冷、下利清谷、脉微欲绝\"，应诊断为？',
  options: [
    'A. 少阴寒化证',
    'B. 太阳表寒证',
    'C. 阳明腑实证',
    'D. 厥阴寒热错杂证'
  ],
  correctAnswer: 'A',
  explanation: '\"但寒不热、四肢厥冷、下利清谷、脉微欲绝\"是少阴寒化证的典型表现。',
  difficulty: 'medium'
}
```

#### Domain 3B (取穴定位与针刺手法) 题目示例：
```typescript
{
  question: '百会穴的定位方法是？',
  options: [
    'A. 两耳尖连线与头部正中线的交点',
    'B. 前发际正中直上5寸',
    'C. 后发际正中直上7寸',
    'D. 头顶最高点'
  ],
  correctAnswer: 'A',
  explanation: '百会穴位于两耳尖连线与头部正中线的交点，或前发际正中直上5寸处。',
  difficulty: 'easy'
}
```

#### Domain 3C (辅助治疗方式) 题目示例：
```typescript
{
  question: '拔罐疗法的禁忌症不包括？',
  options: [
    'A. 高热抽搐',
    'B. 皮肤过敏、溃疡',
    'C. 妊娠期腹部、腰骶部',
    'D. 慢性腰痛'
  ],
  correctAnswer: 'D',
  explanation: '慢性腰痛是拔罐疗法的适应症，不是禁忌症。高热抽搐、皮肤溃疡、孕妇腹腰部都是禁忌症。',
  difficulty: 'medium'
}
```

#### Domain 3D (中药治疗) 题目示例：
```typescript
{
  question: '六味地黄丸的主要功效是？',
  options: [
    'A. 滋补肾阴',
    'B. 温补肾阳',
    'C. 健脾益气',
    'D. 养心安神'
  ],
  correctAnswer: 'A',
  explanation: '六味地黄丸由熟地黄、山茱萸、山药、泽泻、茯苓、牡丹皮组成，主要功效是滋补肾阴。',
  difficulty: 'easy'
}
```

#### Domain 4 (专业职责) 题目示例：
```typescript
{
  question: '针灸师在治疗过程中发现患者出现晕针，正确的处理方法是？',
  options: [
    'A. 立即停止针刺，让患者平卧，给予温水',
    'B. 继续针刺完成治疗',
    'C. 让患者自行休息',
    'D. 增加针刺强度'
  ],
  correctAnswer: 'A',
  explanation: '晕针时应立即停针，让患者平卧，松解衣扣，给予温水，必要时针刺人中、素髎等急救穴位。',
  difficulty: 'easy'
}
```

## 如何继续添加题目

### 方法一：使用现有脚本添加

1. 编辑 `prisma/add-quality-questions.ts`
2. 在 `allQuestions` 数组中添加新题目
3. 运行：`npx tsx prisma/add-quality-questions.ts`

### 方法二：创建新的批量导入文件

创建类似 `prisma/add-domain-X-questions.ts` 的文件，参考现有脚本的结构。

### 方法三：通过管理后台手动添加

1. 访问 http://localhost:3001/admin
2. 进入"题目管理"
3. 逐个添加题目（适合少量高质量题目）

## 题目来源建议

1. **官方考试大纲**：基于CALE官方大纲内容
2. **经典教材**：《中医基础理论》、《针灸学》等
3. **临床案例**：基于真实临床情况改编
4. **历年真题**：参考往年考试题目（改写避免版权问题）
5. **AI辅助**：使用AI生成初稿，人工审核修改

## 质量控制清单

添加题目前请检查：

- [ ] 题目内容准确，符合中医理论
- [ ] 4个选项设计合理，干扰项有效
- [ ] 正确答案明确无争议
- [ ] 解析清晰，说明充分
- [ ] 难度设置适当
- [ ] 语言专业规范
- [ ] 没有与现有题目重复

## 进度追踪

建议使用以下命令查看当前进度：

```bash
sqlite3 prisma/dev.db "SELECT c.code, c.name, COUNT(q.id) as count FROM Category c LEFT JOIN Question q ON c.id = q.categoryId WHERE c.examType = 'cale' AND c.type = 'content' GROUP BY c.id ORDER BY c.code;"
```

## 下一步计划

1. ✅ Domain 1 已完成（60题）
2. ✅ Domain 3A 已完成（60题）
3. 🔄 Domain 2 补充9题达到60题
4. 🔄 Domain 3B 补充43题达到60题
5. 🔄 Domain 3C 补充33题达到60题
6. 🔄 Domain 3D 补充26题达到60题
7. 🔄 Domain 4 补充47题达到60题

完成以上后，总题数将达到 **420题**。

如需达到500+题，建议：
- 每个Domain再增加10-20题
- 重点补充薄弱Domain（3B、4）
- 增加不同难度级别的题目分布

---

**注意**：所有新增题目都会经过自动去重检测，确保题库质量。
