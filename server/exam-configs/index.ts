import type { ExamType, ExamConfigProvider } from '../../types/exam-configs'
import { caleExamConfig } from './cale'
import { nccaomExamConfig } from './nccaom'

/**
 * 考试配置注册表
 * 集中管理所有考试类型的配置
 */
const examConfigRegistry: Record<ExamType, ExamConfigProvider> = {
  cale: caleExamConfig,
  nccaom: nccaomExamConfig
}

/**
 * 考试配置工厂
 * 根据考试类型获取对应的配置提供者
 */
export class ExamConfigFactory {
  /**
   * 获取指定考试类型的配置
   */
  static getConfig(examType: ExamType): ExamConfigProvider {
    const config = examConfigRegistry[examType]

    if (!config) {
      throw new Error(`Unsupported exam type: ${examType}`)
    }

    return config
  }

  /**
   * 获取所有支持的考试类型
   */
  static getSupportedExamTypes(): ExamType[] {
    return Object.keys(examConfigRegistry) as ExamType[]
  }

  /**
   * 检查是否支持某个考试类型
   */
  static isSupported(examType: string): examType is ExamType {
    return examType in examConfigRegistry
  }
}

// 便捷导出
export { caleExamConfig } from './cale'
export { nccaomExamConfig } from './nccaom'
export type { ExamType, ExamConfigProvider } from '../../types/exam-configs'
