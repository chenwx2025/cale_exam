import type { MockExamConfig } from '../../../types/exam-configs'

/**
 * CALE 官方模拟考试配置
 * 基于 CALE Examination Bulletin 官方标准
 */
export const CALEMockExamConfig: MockExamConfig = {
  examType: 'cale',
  totalQuestions: 200,  // CALE考试总题数：200道
  duration: 300,        // 考试时长：300分钟 (5小时)
  passingScore: 140,    // 及格分数：70% (140/200)

  // 官方Domain占比 (基于CALE Examination Bulletin)
  domainDistribution: {
    'DOMAIN_1_ASSESSMENT': 27,      // Domain 1: Patient Assessment (27%)
    'DOMAIN_2_DIAGNOSIS': 17,       // Domain 2: Diagnosis & Treatment Planning (17%)

    // Domain 3 (32%) 分为4个子域
    'DOMAIN_3A_ACU_SELECTION': 16,  // Domain 3A: Point Selection (约一半)
    'DOMAIN_3B_ACU_TECHNIQUE': 8,   // Domain 3B: Needling Technique (约1/4)
    'DOMAIN_3C_ADJUNCTIVE': 5,      // Domain 3C: Adjunctive Therapies (约15%)
    'DOMAIN_3D_HERBAL': 3,          // Domain 3D: (补充到32%)

    'DOMAIN_4_HERBAL': 15,          // Domain 4: Herbal Therapy (15%)
    'DOMAIN_5_PROFESSIONAL': 12     // Domain 5: Professional Development (12%)
  },

  metadata: {
    // CALE 特定的元数据
    officialName: 'California Acupuncture Licensing Examination',
    version: '2024',
    blueprintVersion: 'October 2023',
    language: ['English', 'Chinese'],

    // 考试说明
    instructions: {
      timeLimit: '5 hours (300 minutes)',
      breakTime: 'No scheduled breaks',
      examFormat: 'Computer-based',
      questionTypes: ['Multiple Choice'],
      allowedMaterials: 'None - closed book examination',
      calculator: 'On-screen calculator provided'
    },

    // Domain 详细说明
    domainDetails: {
      'DOMAIN_1_ASSESSMENT': {
        name: 'Patient Assessment',
        description: 'TCM diagnosis, pulse, tongue, questioning',
        weight: '27%'
      },
      'DOMAIN_2_DIAGNOSIS': {
        name: 'Diagnosis & Treatment Planning',
        description: 'Pattern differentiation and treatment strategy',
        weight: '17%'
      },
      'DOMAIN_3A_ACU_SELECTION': {
        name: 'Acupuncture Point Selection',
        description: 'Point location, functions, and combinations',
        weight: '16%'
      },
      'DOMAIN_3B_ACU_TECHNIQUE': {
        name: 'Needling Technique',
        description: 'Insertion methods, manipulation, safety',
        weight: '8%'
      },
      'DOMAIN_3C_ADJUNCTIVE': {
        name: 'Adjunctive Therapies',
        description: 'Moxibustion, cupping, gua sha, etc.',
        weight: '5%'
      },
      'DOMAIN_4_HERBAL': {
        name: 'Chinese Herbal Medicine',
        description: 'Herb properties, formulas, dosage',
        weight: '15%'
      },
      'DOMAIN_5_PROFESSIONAL': {
        name: 'Professional Development & Ethics',
        description: 'Ethics, laws, practice management',
        weight: '12%'
      }
    }
  }
}
