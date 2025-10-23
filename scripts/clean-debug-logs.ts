/**
 * 清理项目中的调试日志和DEBUG语句
 *
 * 此脚本会：
 * 1. 查找所有Vue和TypeScript文件
 * 2. 移除或注释掉console.log/console.debug语句
 * 3. 移除DEBUG注释和日志
 * 4. 生成清理报告
 *
 * 运行方法：
 * npx tsx scripts/clean-debug-logs.ts [--dry-run]
 */

import * as fs from 'fs'
import * as path from 'path'
import { glob } from 'glob'

const DRY_RUN = process.argv.includes('--dry-run')

interface CleanStats {
  filesProcessed: number
  filesModified: number
  console_logs_removed: number
  debug_comments_removed: number
}

const stats: CleanStats = {
  filesProcessed: 0,
  filesModified: 0,
  console_logs_removed: 0,
  debug_comments_removed: 0
}

// 要清理的模式
const patterns = {
  // console.log、console.debug等（保留console.error和console.warn）
  consoleLogs: /^\s*console\.(log|debug)\([^)]*\)\s*$/gm,

  // DEBUG注释
  debugComments: /^\s*\/\/\s*DEBUG:.*$/gm,

  // console.log在代码行中（更复杂的匹配）
  inlineConsoleLogs: /console\.(log|debug)\([^)]*\);?\s*/g
}

async function cleanFile(filePath: string): Promise<boolean> {
  try {
    const content = fs.readFileSync(filePath, 'utf-8')
    let modified = content
    let changed = false

    let removedInFile = 0

    // 1. 移除独立行的console.log
    const consoleLogsMatch = modified.match(patterns.consoleLogs)
    if (consoleLogsMatch) {
      removedInFile += consoleLogsMatch.length
      modified = modified.replace(patterns.consoleLogs, '')
      changed = true
    }

    // 2. 移除DEBUG注释
    const debugCommentsMatch = modified.match(patterns.debugComments)
    if (debugCommentsMatch) {
      stats.debug_comments_removed += debugCommentsMatch.length
      modified = modified.replace(patterns.debugComments, '')
      changed = true
    }

    // 3. 移除行内的console.log（但保留console.error和console.warn）
    const inlineLogsMatch = modified.match(patterns.inlineConsoleLogs)
    if (inlineLogsMatch) {
      removedInFile += inlineLogsMatch.length
      modified = modified.replace(patterns.inlineConsoleLogs, '')
      changed = true
    }

    stats.console_logs_removed += removedInFile

    if (changed) {
      if (!DRY_RUN) {
        // 移除多余的空行（连续3个以上空行变成2个）
        modified = modified.replace(/\n{4,}/g, '\n\n\n')
        fs.writeFileSync(filePath, modified, 'utf-8')
      }

      stats.filesModified++

      if (removedInFile > 0) {
        console.log(`✨ ${filePath}: 移除了 ${removedInFile} 个调试日志`)
      }

      return true
    }

    return false
  } catch (error: any) {
    console.error(`❌ 处理文件失败 ${filePath}:`, error.message)
    return false
  }
}

async function main() {
  console.log('🧹 开始清理调试日志...\n')

  if (DRY_RUN) {
    console.log('🔍 模拟运行模式 (--dry-run) - 不会修改文件\n')
  }

  // 查找所有Vue和TypeScript文件
  const files = await glob('**/*.{vue,ts}', {
    ignore: [
      'node_modules/**',
      'dist/**',
      '.nuxt/**',
      '.output/**',
      'scripts/clean-debug-logs.ts' // 忽略这个脚本本身
    ],
    cwd: process.cwd()
  })

  console.log(`📂 找到 ${files.length} 个文件\n`)

  // 处理每个文件
  for (const file of files) {
    stats.filesProcessed++
    await cleanFile(file)

    // 每100个文件显示进度
    if (stats.filesProcessed % 100 === 0) {
      console.log(`   进度: ${stats.filesProcessed}/${files.length} 文件...`)
    }
  }

  // 输出统计
  console.log('\n' + '='.repeat(60))
  console.log('📊 清理统计')
  console.log('='.repeat(60))
  console.log(`✅ 处理文件数: ${stats.filesProcessed}`)
  console.log(`📝 修改文件数: ${stats.filesModified}`)
  console.log(`🗑️  移除 console.log: ${stats.console_logs_removed} 个`)
  console.log(`🗑️  移除 DEBUG 注释: ${stats.debug_comments_removed} 个`)
  console.log('='.repeat(60))

  if (DRY_RUN) {
    console.log('\n💡 这是模拟运行，实际文件未被修改')
    console.log('💡 移除 --dry-run 参数以实际清理文件')
  } else {
    console.log('\n✨ 清理完成！')
  }
}

main().catch(console.error)
