import { requireAdmin } from '../../../utils/auth-helpers'

export default defineEventHandler(async (event) => {
  requireAdmin(event)

  const query = getQuery(event)
  const format = query.format as string || 'json'

  if (format === 'csv') {
    // CSV 模板
    const csvContent = `question,categoryCode,examType,correctAnswer,options,explanation,difficulty,type
"阴阳的基本概念是什么？","TCM_BASIC","cale","A. 对立统一","[""A. 对立统一"",""B. 完全独立"",""C. 互不相关"",""D. 单一存在""]","阴阳是中医理论的基本概念，代表事物的对立统一关系。","easy","multiple_choice"
"五行相生的顺序是？","TCM_BASIC","cale","木生火","[""木生火"",""火生木"",""金生水"",""水生金""]","五行相生：木生火，火生土，土生金，金生水，水生木。","medium","multiple_choice"`

    setHeader(event, 'Content-Type', 'text/csv; charset=utf-8')
    setHeader(event, 'Content-Disposition', 'attachment; filename="questions-template.csv"')

    return csvContent
  } else {
    // JSON 模板
    const jsonTemplate = [
      {
        question: "阴阳的基本概念是什么？",
        categoryCode: "TCM_BASIC",
        examType: "cale",
        correctAnswer: "A. 对立统一",
        options: ["A. 对立统一", "B. 完全独立", "C. 互不相关", "D. 单一存在"],
        explanation: "阴阳是中医理论的基本概念，代表事物的对立统一关系。",
        difficulty: "easy",
        type: "multiple_choice",
        tags: ["中医基础", "阴阳理论"],
        source: "中医基础理论教材"
      },
      {
        question: "五行相生的顺序是？",
        categoryCode: "TCM_BASIC",
        examType: "cale",
        correctAnswer: "木生火",
        options: ["木生火", "火生木", "金生水", "水生金"],
        explanation: "五行相生：木生火，火生土，土生金，金生水，水生木。",
        difficulty: "medium",
        type: "multiple_choice"
      }
    ]

    setHeader(event, 'Content-Type', 'application/json; charset=utf-8')
    setHeader(event, 'Content-Disposition', 'attachment; filename="questions-template.json"')

    return jsonTemplate
  }
})
