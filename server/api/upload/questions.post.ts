import prisma from '~/server/utils/prisma'
import ExcelJS from 'exceljs'
import Papa from 'papaparse'

export default defineEventHandler(async (event) => {
  const formData = await readMultipartFormData(event)

  if (!formData || formData.length === 0) {
    throw createError({
      statusCode: 400,
      message: '请上传文件'
    })
  }

  const file = formData[0]
  const buffer = file.data
  const fileName = file.filename || ''

  try {
    let data: any[] = []

    // 根据文件类型选择解析方式
    if (fileName.endsWith('.json')) {
      // 解析 JSON 文件
      const text = buffer.toString('utf-8')
      const parsed = JSON.parse(text)

      // JSON 可以是对象数组或包含 questions 字段的对象
      if (Array.isArray(parsed)) {
        data = parsed
      } else if (parsed.questions && Array.isArray(parsed.questions)) {
        data = parsed.questions
      } else {
        throw new Error('JSON 格式错误：应为数组或包含 questions 数组的对象')
      }
    } else if (fileName.endsWith('.csv')) {
      // 解析 CSV 文件
      const text = buffer.toString('utf-8')
      const parsed = Papa.parse(text, {
        header: true,
        skipEmptyLines: true
      })
      data = parsed.data
    } else {
      // 解析 Excel 文件 (.xlsx, .xls)
      const workbook = new ExcelJS.Workbook()
      await workbook.xlsx.load(buffer)
      const worksheet = workbook.worksheets[0]

      if (!worksheet) {
        throw new Error('Excel 文件中没有工作表')
      }

      // 获取表头
      const headers: string[] = []
      const headerRow = worksheet.getRow(1)
      headerRow.eachCell((cell, colNumber) => {
        headers[colNumber - 1] = String(cell.value)
      })

      // 转换为 JSON
      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return // 跳过表头

        const rowData: any = {}
        row.eachCell((cell, colNumber) => {
          const header = headers[colNumber - 1]
          if (header) {
            rowData[header] = cell.value
          }
        })

        if (Object.keys(rowData).length > 0) {
          data.push(rowData)
        }
      })
    }

    if (data.length === 0) {
      throw createError({
        statusCode: 400,
        message: '文件中没有数据'
      })
    }

    // 批量创建题目
    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[]
    }

    for (let i = 0; i < data.length; i++) {
      const row = data[i]

      try {
        // 验证必填字段
        if (!row.question || !row.categoryCode || !row.correctAnswer) {
          results.failed++
          results.errors.push(`第 ${i + 2} 行：缺少必填字段（question, categoryCode, correctAnswer）`)
          continue
        }

        // 查找分类（需要同时匹配 code 和 examType）
        const examType = row.examType || 'cale'
        const category = await prisma.category.findFirst({
          where: {
            code: row.categoryCode,
            examType: examType
          }
        })

        if (!category) {
          results.failed++
          results.errors.push(`第 ${i + 2} 行：找不到分类代码 "${row.categoryCode}" (examType: ${examType})`)
          continue
        }

        // 处理选项（如果是选择题）
        let options = null
        if (row.options) {
          if (typeof row.options === 'string') {
            options = row.options
          } else {
            options = JSON.stringify(row.options)
          }
        }

        // 处理标签
        let tags = null
        if (row.tags) {
          if (typeof row.tags === 'string') {
            tags = row.tags
          } else {
            tags = JSON.stringify(row.tags)
          }
        }

        // 创建题目
        await prisma.question.create({
          data: {
            examType: examType,
            type: row.type || 'multiple_choice',
            question: row.question,
            options,
            correctAnswer: String(row.correctAnswer),
            explanation: row.explanation || null,
            difficulty: row.difficulty || 'medium',
            categoryId: category.id,
            tags,
            source: row.source || null
          }
        })

        results.success++
      } catch (error: any) {
        results.failed++
        results.errors.push(`第 ${i + 2} 行：${error.message}`)
      }
    }

    return {
      message: `导入完成：成功 ${results.success} 条，失败 ${results.failed} 条`,
      results
    }
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      message: `文件解析失败：${error.message}`
    })
  }
})
