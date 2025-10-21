import type { MockExamConfig } from '../../../types/exam-configs'

/**
 * NCCAOM 官方模拟考试配置
 * 基于 NCCAOM 官方标准
 *
 * 注意：NCCAOM 有多个不同的考试模块：
 * - Foundations of Oriental Medicine (FOM)
 * - Acupuncture with Point Location (APL)
 * - Chinese Herbology (CH)
 * - Biomedicine (BM)
 *
 * 这里以 Acupuncture with Point Location 为例
 */
export const NCCAAOMockExamConfig: MockExamConfig = {
  examType: 'nccaom',
  totalQuestions: 100,  // NCCAOM APL: 100道题
  duration: 120,        // 考试时长：120分钟 (2小时)
  passingScore: 70,     // 及格分数：70/100

  // NCCAOM APL 模块分布（示例）
  domainDistribution: {
    'MODULE_1_POINT_LOCATION': 40,       // 穴位定位 (40%)
    'MODULE_2_POINT_FUNCTIONS': 25,      // 穴位功能 (25%)
    'MODULE_3_TREATMENT': 20,            // 治疗原则 (20%)
    'MODULE_4_SAFETY': 15                // 安全与禁忌 (15%)
  },

  metadata: {
    // NCCAOM 特定的元数据
    officialName: 'NCCAOM Acupuncture with Point Location Examination',
    module: 'APL',  // Acupuncture with Point Location
    version: '2024',
    language: ['English'],

    // 考试说明
    instructions: {
      timeLimit: '2 hours (120 minutes)',
      breakTime: 'Optional 10-minute break',
      examFormat: 'Computer-based',
      questionTypes: ['Multiple Choice'],
      allowedMaterials: 'None - closed book examination',
      calculator: 'Not provided - not needed'
    },

    // Module 详细说明
    moduleDetails: {
      'MODULE_1_POINT_LOCATION': {
        name: 'Acupuncture Point Location',
        description: 'Accurate location of acupuncture points',
        weight: '40%'
      },
      'MODULE_2_POINT_FUNCTIONS': {
        name: 'Point Functions & Indications',
        description: 'Functions, actions, and clinical applications',
        weight: '25%'
      },
      'MODULE_3_TREATMENT': {
        name: 'Treatment Principles',
        description: 'Point selection and treatment strategies',
        weight: '20%'
      },
      'MODULE_4_SAFETY': {
        name: 'Safety & Contraindications',
        description: 'Safety precautions and contraindications',
        weight: '15%'
      }
    },

    // NCCAOM 特殊要求
    specialRequirements: {
      identificationRequired: true,
      arrivalTime: '30 minutes before exam',
      electronicDevicesProhibited: true,
      dresscode: 'Professional attire recommended'
    }
  }
}
