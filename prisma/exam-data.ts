// 考试详细信息数据
// ========================================
// 数据验证状态 (Data Verification Status)
// ========================================
//
// ✅ 已官方确认 (Officially Confirmed):
//    - CALE Domain 1 (Patient Assessment): 31%
//    - 来源: CA Acupuncture Board NCCAOM Audit Document
//    - https://www.acupuncture.ca.gov/pubs_forms/nccaom_audit.pdf
//
// ⚠️  未官方确认 (Not Officially Confirmed):
//    - Domain 2-5 的占比为估算值，基于历史数据和行业经验
//    - 强烈建议参考官方2021年职业分析报告进行核实
//    - 官方报告: https://www.acupuncture.ca.gov/about_us/materials/2021_occanalysis.pdf
//
// 📅 最后验证日期: 2025-10-19
// 🔄 验证方式: 通过官方网站文档和多渠道搜索验证
// ========================================

// CALE 官方考试大纲详细任务分解 (Official Examination Outline - Table 27)
// 来源: PSI CALE Examination Bulletin
// 数据说明: 基于官方考试手册，包含所有5个Domain的完整任务分解
export const caleOfficialOutline = {
  domain1: {
    code: 'DOMAIN_1_ASSESSMENT',
    title: 'Patient assessment',
    percentage: 27,
    description: 'This area assesses the practitioner\'s knowledge of assessing patient\'s chief complaint and underlying health conditions using TCM and Western medicine assessment methods, referring the patient to another health care provider if indicated, and identifying and responding to patient emergency situations.',
    subareas: [
      {
        id: 'D101',
        name: 'Patient assessment using Traditional Chinese medicine methods',
        percentage: 18,
        tasks: [
          {
            id: 'T1',
            description: 'Identify patient\'s chief complaint.',
            knowledgeStatements: [
              { id: 'K1', text: 'Knowledge of interview techniques for obtaining information about patient health.' },
              { id: 'K2', text: 'Knowledge of observational techniques for obtaining information about patient health.' },
              { id: 'K3', text: 'Knowledge of listening and smelling techniques for obtaining information about patient health.' },
              { id: 'K4', text: 'Knowledge of palpation examination methods and techniques.' }
            ]
          },
          {
            id: 'T2',
            description: 'Collect information about family health history.',
            knowledgeStatements: [
              { id: 'K1', text: 'Knowledge of interview techniques for obtaining information about patient health.' },
              { id: 'K5', text: 'Knowledge of effects of patient and family health history on current health status.' }
            ]
          },
          {
            id: 'T3',
            description: 'Collect information about patient health history.',
            knowledgeStatements: [
              { id: 'K1', text: 'Knowledge of interview techniques for obtaining information about patient health.' },
              { id: 'K5', text: 'Knowledge of effects of patient and family health history on current health status.' }
            ]
          },
          {
            id: 'T4',
            description: 'Identify supplements and herbs that the patient is taking.',
            knowledgeStatements: [
              { id: 'K1', text: 'Knowledge of interview techniques for obtaining information about patient health.' },
              { id: 'K6', text: 'Knowledge of signs and symptoms associated with use of supplements and herbs.' },
              { id: 'K83', text: 'Knowledge of interactions between commonly used supplements, herbs, foods, and Western medications.' },
              { id: 'K84', text: 'Knowledge of actions and side effects of commonly used supplements.' }
            ]
          },
          {
            id: 'T5',
            description: 'Identify signs and symptoms associated with use of supplements and herbs.',
            knowledgeStatements: [
              { id: 'K1', text: 'Knowledge of interview techniques for obtaining information about patient health.' },
              { id: 'K2', text: 'Knowledge of observational techniques for obtaining information about patient health.' },
              { id: 'K6', text: 'Knowledge of signs and symptoms associated with use of supplements and herbs.' },
              { id: 'K83', text: 'Knowledge of interactions between commonly used supplements, herbs, foods, and Western medications.' },
              { id: 'K84', text: 'Knowledge of actions and side effects of commonly used supplements.' }
            ]
          },
          {
            id: 'T6',
            description: 'Assess emotional health to inform pattern differentiation.',
            knowledgeStatements: [
              { id: 'K1', text: 'Knowledge of interview techniques for obtaining information about patient health.' },
              { id: 'K2', text: 'Knowledge of observational techniques for obtaining information about patient health.' },
              { id: 'K10', text: 'Knowledge of clinical manifestations of Shen.' },
              { id: 'K13', text: 'Knowledge of signs and symptoms of psychosocial dysfunction associated with disharmony patterns.' },
              { id: 'K14', text: 'Knowledge of emotions associated with disharmony patterns.' }
            ]
          },
          {
            id: 'T7',
            description: 'Evaluate level and quality of Qi to inform pattern differentiation.',
            knowledgeStatements: [
              { id: 'K2', text: 'Knowledge of observational techniques for obtaining information about patient health.' },
              { id: 'K8', text: 'Knowledge of clinical indicators of the level and quality of Qi.' },
              { id: 'K26', text: 'Knowledge of respiratory signs and symptoms associated with disharmony patterns.' },
              { id: 'K29', text: 'Knowledge of cardiovascular signs and symptoms associated with disharmony patterns.' },
              { id: 'K37', text: 'Knowledge of the relationship between quality and strength of voice and patterns of disharmony.' },
              { id: 'K40', text: 'Knowledge of radial pulse characteristics associated with patterns of disharmony.' }
            ]
          },
          {
            id: 'T8',
            description: 'Assess Shen to inform pattern differentiation.',
            knowledgeStatements: [
              { id: 'K2', text: 'Knowledge of observational techniques for obtaining information about patient health.' },
              { id: 'K7', text: 'Knowledge of clinical indicators of the level and quality of Blood.' },
              { id: 'K9', text: 'Knowledge of clinical indicators of Essence.' },
              { id: 'K10', text: 'Knowledge of clinical manifestations of Shen.' },
              { id: 'K12', text: 'Knowledge of the associations between patient physical characteristics and disharmony patterns.' },
              { id: 'K13', text: 'Knowledge of signs and symptoms of psychosocial dysfunction associated with disharmony patterns.' },
              { id: 'K14', text: 'Knowledge of emotions associated with disharmony patterns.' },
              { id: 'K30', text: 'Knowledge of skin characteristics and conditions associated with disharmony patterns.' },
              { id: 'K37', text: 'Knowledge of the relationship between quality and strength of voice and patterns of disharmony.' }
            ]
          },
          {
            id: 'T9',
            description: 'Assess patient physical characteristics to inform pattern differentiation.',
            knowledgeStatements: [
              { id: 'K2', text: 'Knowledge of observational techniques for obtaining information about patient health.' },
              { id: 'K3', text: 'Knowledge of listening and smelling techniques for obtaining information about patient health.' },
              { id: 'K4', text: 'Knowledge of palpation examination methods and techniques.' },
              { id: 'K7', text: 'Knowledge of clinical manifestations of Shen.' },
              { id: 'K9', text: 'Knowledge of clinical indicators of the level and quality of Blood.' },
              { id: 'K12', text: 'Knowledge of the associations between patient physical characteristics and disharmony patterns.' }
            ]
          },
          {
            id: 'T10',
            description: 'Identify external factors (e.g., stress, pollutants, noise, climate) influencing health.',
            knowledgeStatements: [
              { id: 'K1', text: 'Knowledge of interview techniques for obtaining information about patient health.' },
              { id: 'K15', text: 'Knowledge of external factors (e.g., stress, pollutants, noise, climate) that affect health.' }
            ]
          },
          {
            id: 'T11',
            description: 'Identify lifestyle factors influencing health.',
            knowledgeStatements: [
              { id: 'K1', text: 'Knowledge of interview techniques for obtaining information about patient health.' },
              { id: 'K16', text: 'Knowledge of effects of lifestyle factors on health.' }
            ]
          },
          {
            id: 'T12',
            description: 'Identify patient sleep patterns to inform pattern differentiation.',
            knowledgeStatements: [
              { id: 'K1', text: 'Knowledge of interview techniques for obtaining information about patient health.' },
              { id: 'K7', text: 'Knowledge of clinical indicators of the level and quality of Blood.' },
              { id: 'K9', text: 'Knowledge of clinical indicators of Essence.' },
              { id: 'K17', text: 'Knowledge of sleep patterns indicating health imbalance.' }
            ]
          },
          {
            id: 'T13',
            description: 'Identify dietary habits to inform pattern differentiation.',
            knowledgeStatements: [
              { id: 'K1', text: 'Knowledge of interview techniques for obtaining information about patient health.' },
              { id: 'K18', text: 'Knowledge of effects of dietary habits and nutrition on health and wellness.' }
            ]
          },
          {
            id: 'T14',
            description: 'Identify food and drink flavor preferences, cravings, and aversions to inform pattern differentiation.',
            knowledgeStatements: [
              { id: 'K1', text: 'Knowledge of interview techniques for obtaining information about patient health.' },
              { id: 'K19', text: 'Knowledge of food and drink flavor preferences, cravings, and aversions associated with disharmony patterns.' },
              { id: 'K20', text: 'Knowledge of food and drink temperature preferences and aversions associated with disharmony patterns.' }
            ]
          },
          {
            id: 'T15',
            description: 'Identify preferences and aversions related to temperature of food and drinks to inform pattern differentiation.',
            knowledgeStatements: [
              { id: 'K1', text: 'Knowledge of interview techniques for obtaining information about patient health.' },
              { id: 'K20', text: 'Knowledge of food and drink temperature preferences and aversions associated with disharmony patterns.' }
            ]
          },
          {
            id: 'T16',
            description: 'Assess thirst and fluid intake to inform pattern differentiation.',
            knowledgeStatements: [
              { id: 'K1', text: 'Knowledge of interview techniques for obtaining information about patient health.' },
              { id: 'K21', text: 'Knowledge of thirst characteristics associated with patterns of disharmony.' },
              { id: 'K22', text: 'Knowledge of relationship between fluid intake and disharmony patterns.' }
            ]
          },
          {
            id: 'T17',
            description: 'Identify gastrointestinal signs and symptoms (e.g., characteristics of bowel movements, pain) indicating health imbalance.',
            knowledgeStatements: [
              { id: 'K1', text: 'Knowledge of interview techniques for obtaining information about patient health.' },
              { id: 'K2', text: 'Knowledge of observational techniques for obtaining information about patient health.' },
              { id: 'K3', text: 'Knowledge of listening and smelling techniques for obtaining information about patient health.' },
              { id: 'K4', text: 'Knowledge of palpation examination methods and techniques.' },
              { id: 'K18', text: 'Knowledge of effects of dietary habits and nutrition on health and wellness.' },
              { id: 'K23', text: 'Knowledge of gastrointestinal signs and symptoms associated with disharmony patterns.' }
            ]
          },
          {
            id: 'T18',
            description: 'Identify genitourinary signs and symptoms indicating health imbalance.',
            knowledgeStatements: [
              { id: 'K1', text: 'Knowledge of interview techniques for obtaining information about patient health.' },
              { id: 'K24', text: 'Knowledge of genitourinary signs and symptoms associated with disharmony patterns.' },
              { id: 'K27', text: 'Knowledge of mucus characteristics in relation to disharmony patterns.' },
              { id: 'K28', text: 'Knowledge of phlegm characteristics in relation to disharmony patterns.' }
            ]
          },
          {
            id: 'T19',
            description: 'Identify signs and symptoms of gynecological and reproductive systems indicating health imbalance.',
            knowledgeStatements: [
              { id: 'K1', text: 'Knowledge of interview techniques for obtaining information about patient health.' },
              { id: 'K25', text: 'Knowledge of signs and symptoms of gynecological and reproductive functioning associated with disharmony patterns.' },
              { id: 'K27', text: 'Knowledge of mucus characteristics in relation to disharmony patterns.' },
              { id: 'K28', text: 'Knowledge of phlegm characteristics in relation to disharmony patterns.' }
            ]
          },
          {
            id: 'T20',
            description: 'Identify respiratory signs and symptoms indicating health imbalance.',
            knowledgeStatements: [
              { id: 'K1', text: 'Knowledge of interview techniques for obtaining information about patient health.' },
              { id: 'K2', text: 'Knowledge of observational techniques for obtaining information about patient health.' },
              { id: 'K3', text: 'Knowledge of listening and smelling techniques for obtaining information about patient health.' },
              { id: 'K11', text: 'Knowledge of clinical manifestations of Body Fluids.' },
              { id: 'K26', text: 'Knowledge of respiratory signs and symptoms associated with disharmony patterns.' },
              { id: 'K27', text: 'Knowledge of mucus characteristics in relation to disharmony patterns.' },
              { id: 'K28', text: 'Knowledge of phlegm characteristics in relation to disharmony patterns.' }
            ]
          },
          {
            id: 'T21',
            description: 'Identify mucus characteristics to inform pattern differentiation.',
            knowledgeStatements: [
              { id: 'K1', text: 'Knowledge of interview techniques for obtaining information about patient health.' },
              { id: 'K2', text: 'Knowledge of observational techniques for obtaining information about patient health.' },
              { id: 'K11', text: 'Knowledge of clinical manifestations of Body Fluids.' },
              { id: 'K27', text: 'Knowledge of mucus characteristics in relation to disharmony patterns.' }
            ]
          },
          {
            id: 'T22',
            description: 'Identify phlegm characteristics to inform pattern differentiation.',
            knowledgeStatements: [
              { id: 'K1', text: 'Knowledge of interview techniques for obtaining information about patient health.' },
              { id: 'K2', text: 'Knowledge of observational techniques for obtaining information about patient health.' },
              { id: 'K11', text: 'Knowledge of clinical manifestations of Body Fluids.' },
              { id: 'K28', text: 'Knowledge of phlegm characteristics in relation to disharmony patterns.' }
            ]
          },
          {
            id: 'T23',
            description: 'Identify cardiovascular signs and symptoms indicating health imbalance.',
            knowledgeStatements: [
              { id: 'K1', text: 'Knowledge of interview techniques for obtaining information about patient health.' },
              { id: 'K2', text: 'Knowledge of observational techniques for obtaining information about patient health.' },
              { id: 'K3', text: 'Knowledge of listening and smelling techniques for obtaining information about patient health.' },
              { id: 'K29', text: 'Knowledge of cardiovascular signs and symptoms associated with disharmony patterns.' }
            ]
          },
          {
            id: 'T24',
            description: 'Identify skin conditions and characteristics indicating health imbalance.',
            knowledgeStatements: [
              { id: 'K1', text: 'Knowledge of interview techniques for obtaining information about patient health.' },
              { id: 'K2', text: 'Knowledge of observational techniques for obtaining information about patient health.' },
              { id: 'K11', text: 'Knowledge of clinical manifestations of Body Fluids.' },
              { id: 'K30', text: 'Knowledge of skin characteristics and conditions associated with disharmony patterns.' }
            ]
          },
          {
            id: 'T25',
            description: 'Assess fever and chills to inform pattern differentiation.',
            knowledgeStatements: [
              { id: 'K1', text: 'Knowledge of interview techniques for obtaining information about patient health.' },
              { id: 'K2', text: 'Knowledge of observational techniques for obtaining information about patient health.' },
              { id: 'K30', text: 'Knowledge of skin characteristics and conditions associated with disharmony patterns.' },
              { id: 'K31', text: 'Knowledge of fever and chills associated with disharmony patterns.' },
              { id: 'K32', text: 'Knowledge of patient\'s sensations of heat and cold associated with health imbalance.' },
              { id: 'K33', text: 'Knowledge of conditions associated with abnormal localized temperature upon palpation.' },
              { id: 'K34', text: 'Knowledge of abnormal perspiration associated with disharmony patterns.' }
            ]
          },
          {
            id: 'T26',
            description: 'Identify patient perspiration patterns to inform pattern differentiation.',
            knowledgeStatements: [
              { id: 'K1', text: 'Knowledge of interview techniques for obtaining information about patient health.' },
              { id: 'K2', text: 'Knowledge of observational techniques for obtaining information about patient health.' },
              { id: 'K11', text: 'Knowledge of clinical manifestations of Body Fluids.' },
              { id: 'K34', text: 'Knowledge of abnormal perspiration associated with disharmony patterns.' }
            ]
          },
          {
            id: 'T27',
            description: 'Identify ocular and visual signs and symptoms indicating health imbalance.',
            knowledgeStatements: [
              { id: 'K1', text: 'Knowledge of interview techniques for obtaining information about patient health.' },
              { id: 'K2', text: 'Knowledge of observational techniques for obtaining information about patient health.' },
              { id: 'K35', text: 'Knowledge of ocular signs and symptoms associated with disharmony patterns.' }
            ]
          },
          {
            id: 'T28',
            description: 'Identify auditory signs and symptoms indicating health imbalance.',
            knowledgeStatements: [
              { id: 'K1', text: 'Knowledge of interview techniques for obtaining information about patient health.' },
              { id: 'K2', text: 'Knowledge of observational techniques for obtaining information about patient health.' },
              { id: 'K36', text: 'Knowledge of auditory signs and symptoms associated with disharmony patterns.' }
            ]
          },
          {
            id: 'T29',
            description: 'Assess patient sounds, voice quality, and vocal strength to inform pattern differentiation.',
            knowledgeStatements: [
              { id: 'K3', text: 'Knowledge of listening and smelling techniques for obtaining information about patient health.' },
              { id: 'K37', text: 'Knowledge of the relationship between quality and strength of voice and patterns of disharmony.' }
            ]
          },
          {
            id: 'T30',
            description: 'Assess level, nature, locations, and frequency of pain to inform pattern differentiation.',
            knowledgeStatements: [
              { id: 'K1', text: 'Knowledge of interview techniques for obtaining information about patient health.' },
              { id: 'K2', text: 'Knowledge of observational techniques for obtaining information about patient health.' },
              { id: 'K4', text: 'Knowledge of palpation examination methods and techniques.' },
              { id: 'K38', text: 'Knowledge of methods and procedures for assessing pain.' }
            ]
          },
          {
            id: 'T31',
            description: 'Assess patient tongue body and coating to inform pattern differentiation.',
            knowledgeStatements: [
              { id: 'K2', text: 'Knowledge of observational techniques for obtaining information about patient health.' },
              { id: 'K3', text: 'Knowledge of listening and smelling techniques for obtaining information about patient health.' },
              { id: 'K39', text: 'Knowledge of tongue characteristics associated with disharmony patterns.' }
            ]
          },
          {
            id: 'T32',
            description: 'Assess patient pulse to inform pattern differentiation.',
            knowledgeStatements: [
              { id: 'K4', text: 'Knowledge of palpation examination methods and techniques.' }
            ]
          },
          {
            id: 'T33',
            description: 'Palpate areas of body or channels to inform pattern differentiation.',
            knowledgeStatements: [
              { id: 'K40', text: 'Knowledge of radial pulse characteristics associated with patterns of disharmony.' },
              { id: 'K41', text: 'Knowledge of methods for obtaining pulse information from various locations on the body.' }
            ]
          },
          {
            id: 'T34',
            description: 'Assess patient odors to inform pattern differentiation.',
            knowledgeStatements: [
              { id: 'K3', text: 'Knowledge of listening and smelling techniques for obtaining information about patient health.' }
            ]
          }
        ]
      },
      {
        id: 'D102',
        name: 'Patient assessment using Western medicine methods',
        percentage: 7,
        tasks: [
          {
            id: 'T57',
            description: 'Identify pharmaceuticals that the patient is taking.',
            knowledgeStatements: [
              { id: 'K1', text: 'Knowledge of interview techniques for obtaining information about patient health.' },
              { id: 'K82', text: 'Knowledge of the classification, clinical indications, contraindications, and side effects of commonly prescribed Western medications.' }
            ]
          },
          {
            id: 'T58',
            description: 'Identify signs and symptoms associated with the use of pharmaceuticals.',
            knowledgeStatements: [
              { id: 'K1', text: 'Knowledge of interview techniques for obtaining information about patient health.' },
              { id: 'K82', text: 'Knowledge of the classification, clinical indications, contraindications, and side effects of commonly prescribed Western medications.' },
              { id: 'K83', text: 'Knowledge of interactions between commonly used supplements, herbs, foods, and Western medications.' },
              { id: 'K84', text: 'Knowledge of actions and side effects of commonly used supplements.' }
            ]
          },
          {
            id: 'T59',
            description: 'Perform biomedical physical examination (e.g. observation, auscultation, palpation, vital signs) on patients to determine present health condition.',
            knowledgeStatements: [
              { id: 'K71', text: 'Knowledge of biomedical physical examination methods and techniques (e.g. observation, auscultation, palpation, vital signs).' },
              { id: 'K72', text: 'Knowledge of human anatomy, physiology, and pathology.' },
              { id: 'K73', text: 'Knowledge of procedures for obtaining vital signs.' },
              { id: 'K74', text: 'Knowledge of normal range of vital signs.' },
              { id: 'K75', text: 'Knowledge of methods and procedures for assessing neuromusculoskeletal function and integrity.' },
              { id: 'K76', text: 'Knowledge of pathways and functions of cranial nerves for determination of neurological pathology.' },
              { id: 'K77', text: 'Knowledge of dermatome technique for assessment of neuromuscular pathology.' },
              { id: 'K78', text: 'Knowledge of neuromusculoskeletal conditions.' },
              { id: 'K79', text: 'Knowledge of patient genetics and heredity associated with symptom development.' }
            ]
          },
          {
            id: 'T60',
            description: 'Perform neurological examination (e.g., sensation, strength) on patients to determine health condition.',
            knowledgeStatements: [
              { id: 'K71', text: 'Knowledge of biomedical physical examination methods and techniques (e.g. observation, auscultation, palpation, vital signs).' },
              { id: 'K72', text: 'Knowledge of human anatomy, physiology, and pathology.' },
              { id: 'K73', text: 'Knowledge of procedures for obtaining vital signs.' },
              { id: 'K74', text: 'Knowledge of normal range of vital signs.' },
              { id: 'K75', text: 'Knowledge of methods and procedures for assessing neuromusculoskeletal function and integrity.' },
              { id: 'K76', text: 'Knowledge of pathways and functions of cranial nerves for determination of neurological pathology.' },
              { id: 'K77', text: 'Knowledge of dermatome technique for assessment of neuromuscular pathology.' },
              { id: 'K78', text: 'Knowledge of neuromusculoskeletal conditions.' },
              { id: 'K79', text: 'Knowledge of patient genetics and heredity associated with symptom development.' }
            ]
          },
          {
            id: 'T61',
            description: 'Perform orthopedic examination on patients to determine health condition.',
            knowledgeStatements: [
              { id: 'K71', text: 'Knowledge of biomedical physical examination methods and techniques (e.g. observation, auscultation, palpation, vital signs).' },
              { id: 'K72', text: 'Knowledge of human anatomy, physiology, and pathology.' },
              { id: 'K75', text: 'Knowledge of methods and procedures for assessing neuromusculoskeletal function and integrity.' },
              { id: 'K77', text: 'Knowledge of dermatome technique for assessment of neuromuscular pathology.' },
              { id: 'K78', text: 'Knowledge of neuromusculoskeletal conditions.' },
              { id: 'K79', text: 'Knowledge of patient genetics and heredity associated with symptom development.' }
            ]
          },
          {
            id: 'T62',
            description: 'Order diagnostic tests to determine health condition.',
            knowledgeStatements: [
              { id: 'K80', text: 'Knowledge of clinical significance of common diagnostic and laboratory tests used for diagnostic and treatment purposes.' },
              { id: 'K81', text: 'Knowledge of common Western medical conditions, terminology, and definitions.' },
              { id: 'K82', text: 'Knowledge of the classification, clinical indications, contraindications, and side effects of commonly prescribed Western medications.' }
            ]
          },
          {
            id: 'T63',
            description: 'Review patient diagnostic reports to gather additional information regarding patient complaint.',
            knowledgeStatements: [
              { id: 'K72', text: 'Knowledge of human anatomy, physiology, and pathology.' },
              { id: 'K74', text: 'Knowledge of normal range of vital signs.' },
              { id: 'K78', text: 'Knowledge of neuromusculoskeletal conditions.' },
              { id: 'K80', text: 'Knowledge of clinical significance of common diagnostic and laboratory tests used for diagnostic and treatment purposes.' },
              { id: 'K81', text: 'Knowledge of common Western medical conditions, terminology, and definitions.' },
              { id: 'K82', text: 'Knowledge of the classification, clinical indications, contraindications, and side effects of commonly prescribed Western medications.' },
              { id: 'K83', text: 'Knowledge of interactions between commonly used supplements, herbs, foods, and Western medications.' },
              { id: 'K84', text: 'Knowledge of actions and side effects of commonly used supplements.' }
            ]
          }
        ]
      },
      {
        id: 'D103',
        name: 'Referrals and emergency management',
        percentage: 2,
        tasks: [
          {
            id: 'T55',
            description: 'Refer client to other health care providers based on assessment findings.',
            knowledgeStatements: [
              { id: 'K67', text: 'Knowledge of clinical conditions that require patient referral to other health care providers.' },
              { id: 'K68', text: 'Knowledge of signs and symptoms of emergency conditions.' }
            ]
          },
          {
            id: 'T56',
            description: 'Identify signs and symptoms that require emergency management.',
            knowledgeStatements: [
              { id: 'K68', text: 'Knowledge of signs and symptoms of emergency conditions.' },
              { id: 'K69', text: 'Knowledge of methods for administering cardiopulmonary resuscitation.' },
              { id: 'K70', text: 'Knowledge of methods for providing first aid treatment.' }
            ]
          }
        ]
      }
    ]
  },

  domain2: {
    code: 'DOMAIN_2_DIAGNOSIS',
    title: 'Diagnostic impression and treatment planning',
    percentage: 17,
    description: 'This area assesses the practitioner\'s knowledge of formulating a TCM diagnostic impression and developing an appropriate treatment plan based on patient assessment findings.',
    subareas: [
      {
        id: 'D201',
        name: 'Diagnosis',
        percentage: 11,
        tasks: [
          {
            id: 'T35',
            description: 'Evaluate patient data to determine whether additional information is needed.',
            knowledgeStatements: [
              { id: 'K43', text: 'Knowledge of methods for integrating assessment information to develop a differential diagnosis.' },
              { id: 'K44', text: 'Knowledge of methods for integrating tongue and pulse characteristics to identify disharmony patterns.' },
              { id: 'K47', text: 'Knowledge of clinical indicators associated with disease of the channels.' }
            ]
          },
          {
            id: 'T36',
            description: 'Interpret and integrate assessment findings (e.g., pulse, tongue, history, channel, diagnostic test results) to inform pattern differentiation.',
            knowledgeStatements: [
              { id: 'K43', text: 'Knowledge of methods for integrating assessment information to develop a differential diagnosis.' },
              { id: 'K44', text: 'Knowledge of methods for integrating tongue and pulse characteristics to identify disharmony patterns.' },
              { id: 'K45', text: 'Knowledge of the relationship between the Organs and channels in disease progression and transformation.' },
              { id: 'K46', text: 'Knowledge of the relationship between the Zang Fu and vital substances (i.e., the Liver stores the Blood).' },
              { id: 'K47', text: 'Knowledge of clinical indicators associated with disease of the channels.' },
              { id: 'K48', text: 'Knowledge of the functions, distribution, and clinical significance of the channels.' }
            ]
          },
          {
            id: 'T37',
            description: 'Identify primary disharmony patterns by prioritizing patient signs and symptoms.',
            knowledgeStatements: [
              { id: 'K50', text: 'Knowledge of methods for prioritizing indicators of disharmony to develop a differential diagnosis.' }
            ]
          },
          {
            id: 'T38',
            description: 'Identify phase of pathogen progression.',
            knowledgeStatements: [
              { id: 'K42', text: 'Knowledge of disease progression from superficial to deep levels of the human body.' },
              { id: 'K43', text: 'Knowledge of methods for integrating assessment information to develop a differential diagnosis.' },
              { id: 'K44', text: 'Knowledge of methods for integrating tongue and pulse characteristics to identify disharmony patterns.' },
              { id: 'K45', text: 'Knowledge of the relationship between the Organs and channels in disease progression and transformation.' }
            ]
          },
          {
            id: 'T39',
            description: 'Identify affected channels.',
            knowledgeStatements: [
              { id: 'K43', text: 'Knowledge of methods for integrating assessment information to develop a differential diagnosis.' },
              { id: 'K44', text: 'Knowledge of methods for integrating tongue and pulse characteristics to identify disharmony patterns.' },
              { id: 'K45', text: 'Knowledge of the relationship between the Organs and channels in disease progression and transformation.' },
              { id: 'K47', text: 'Knowledge of clinical indicators associated with disease of the channels.' },
              { id: 'K48', text: 'Knowledge of the functions, distribution, and clinical significance of the channels.' },
              { id: 'K53', text: 'Knowledge of the functions of and the relationship between the Zang Fu and the channels.' }
            ]
          },
          {
            id: 'T40',
            description: 'Identify Root and Branch condition.',
            knowledgeStatements: [
              { id: 'K42', text: 'Knowledge of disease progression from superficial to deep levels of the human body.' },
              { id: 'K43', text: 'Knowledge of methods for integrating assessment information to develop a differential diagnosis.' },
              { id: 'K44', text: 'Knowledge of methods for integrating tongue and pulse characteristics to identify disharmony patterns.' },
              { id: 'K45', text: 'Knowledge of the relationship between the Organs and channels in disease progression and transformation.' },
              { id: 'K49', text: 'Knowledge of principles for treating root versus branch disharmony patterns.' }
            ]
          },
          {
            id: 'T41',
            description: 'Identify Five Element disharmony patterns.',
            knowledgeStatements: [
              { id: 'K43', text: 'Knowledge of methods for integrating assessment information to develop a differential diagnosis.' },
              { id: 'K44', text: 'Knowledge of methods for integrating tongue and pulse characteristics to identify disharmony patterns.' },
              { id: 'K52', text: 'Knowledge of the interrelationships of the Five Elements and clinical indications of disharmony.' },
              { id: 'K54', text: 'Knowledge of the Five Elements theory and pattern differentiation methods.' }
            ]
          },
          {
            id: 'T42',
            description: 'Identify Zang Fu disharmony patterns.',
            knowledgeStatements: [
              { id: 'K42', text: 'Knowledge of disease progression from superficial to deep levels of the human body.' },
              { id: 'K43', text: 'Knowledge of methods for integrating assessment information to develop a differential diagnosis.' },
              { id: 'K44', text: 'Knowledge of methods for integrating tongue and pulse characteristics to identify disharmony patterns.' },
              { id: 'K46', text: 'Knowledge of the relationship between the Zang Fu and vital substances (i.e., the Liver stores the Blood).' },
              { id: 'K53', text: 'Knowledge of the functions of and the relationship between the Zang Fu and the channels.' },
              { id: 'K59', text: 'Knowledge of the clinical indications associated with Zang Fu disharmonies.' },
              { id: 'K60', text: 'Knowledge of methods for identifying simultaneous Zang Fu disharmonies.' }
            ]
          },
          {
            id: 'T43',
            description: 'Identify Eight Principles categorization.',
            knowledgeStatements: [
              { id: 'K42', text: 'Knowledge of disease progression from superficial to deep levels of the human body.' },
              { id: 'K43', text: 'Knowledge of methods for integrating assessment information to develop a differential diagnosis.' },
              { id: 'K44', text: 'Knowledge of methods for integrating tongue and pulse characteristics to identify disharmony patterns.' },
              { id: 'K55', text: 'Knowledge of the Eight Principles theory and pattern differentiation methods.' }
            ]
          },
          {
            id: 'T44',
            description: 'Identify disharmony pattern using Six Stages (i.e., Shang Han Lun) of differentiation.',
            knowledgeStatements: [
              { id: 'K42', text: 'Knowledge of disease progression from superficial to deep levels of the human body.' },
              { id: 'K43', text: 'Knowledge of methods for integrating assessment information to develop a differential diagnosis.' },
              { id: 'K44', text: 'Knowledge of methods for integrating tongue and pulse characteristics to identify disharmony patterns.' },
              { id: 'K57', text: 'Knowledge of the Six Stages (Shang Han Lun) theory and pattern differentiation methods.' }
            ]
          },
          {
            id: 'T45',
            description: 'Identify disharmony pattern using Four Levels (i.e., Wei, Qi, Ying, and Xue) of differentiation.',
            knowledgeStatements: [
              { id: 'K42', text: 'Knowledge of disease progression from superficial to deep levels of the human body.' },
              { id: 'K43', text: 'Knowledge of methods for integrating assessment information to develop a differential diagnosis.' },
              { id: 'K44', text: 'Knowledge of methods for integrating tongue and pulse characteristics to identify disharmony patterns.' },
              { id: 'K58', text: 'Knowledge of the Four Levels theory and pattern differentiation methods.' }
            ]
          },
          {
            id: 'T46',
            description: 'Identify disharmony pattern using Triple Burner (i.e., San Jiao) differentiation.',
            knowledgeStatements: [
              { id: 'K42', text: 'Knowledge of disease progression from superficial to deep levels of the human body.' },
              { id: 'K43', text: 'Knowledge of methods for integrating assessment information to develop a differential diagnosis.' },
              { id: 'K44', text: 'Knowledge of methods for integrating tongue and pulse characteristics to identify disharmony patterns.' },
              { id: 'K56', text: 'Knowledge of the Triple Burner theory and pattern differentiation methods.' }
            ]
          },
          {
            id: 'T47',
            description: 'Develop a differential diagnosis list for identified disharmony patterns.',
            knowledgeStatements: [
              { id: 'K50', text: 'Knowledge of methods for prioritizing indicators of disharmony to develop a differential diagnosis.' },
              { id: 'K52', text: 'Knowledge of the interrelationships of the Five Elements and clinical indications of disharmony.' },
              { id: 'K53', text: 'Knowledge of the functions of and the relationship between the Zang Fu and the channels.' },
              { id: 'K54', text: 'Knowledge of the Five Elements theory and pattern differentiation methods.' },
              { id: 'K55', text: 'Knowledge of the Eight Principles theory and pattern differentiation methods.' },
              { id: 'K56', text: 'Knowledge of the Triple Burner theory and pattern differentiation methods.' },
              { id: 'K57', text: 'Knowledge of the Six Stages (Shang Han Lun) theory and pattern differentiation methods.' },
              { id: 'K58', text: 'Knowledge of the Four Levels theory and pattern differentiation methods.' },
              { id: 'K59', text: 'Knowledge of the clinical indications associated with Zang Fu disharmonies.' },
              { id: 'K60', text: 'Knowledge of methods for identifying simultaneous Zang Fu disharmonies.' },
              { id: 'K61', text: 'Knowledge of functions and disharmonies associated with Vital Substances.' }
            ]
          }
        ]
      },
      {
        id: 'D202',
        name: 'Treatment planning',
        percentage: 6,
        tasks: [
          {
            id: 'T48',
            description: 'Develop treatment principles (e.g., tonify, sedate, harmonize) for patients.',
            knowledgeStatements: [
              { id: 'K62', text: 'Knowledge of development of treatment principles based on different theories of pattern differentiation.' },
              { id: 'K65', text: 'Knowledge of the association between stimulation techniques and treatment principles.' }
            ]
          },
          {
            id: 'T49',
            description: 'Develop treatment plans by applying treatment principle (e.g., tonify, sedate, harmonize).',
            knowledgeStatements: [
              { id: 'K63', text: 'Knowledge of the effectiveness of combining treatment strategies in developing a treatment plan.' },
              { id: 'K64', text: 'Knowledge of treatment strategies for using tonification and sedation points.' },
              { id: 'K65', text: 'Knowledge of the association between stimulation techniques and treatment principles.' }
            ]
          },
          {
            id: 'T50',
            description: 'Prioritize treatment principles and management of presenting problems.',
            knowledgeStatements: [
              { id: 'K65', text: 'Knowledge of the association between stimulation techniques and treatment principles.' }
            ]
          },
          {
            id: 'T51',
            description: 'Evaluate patient progress during follow-up visit to determine adjustments to treatment plans.',
            knowledgeStatements: [
              { id: 'K66', text: 'Knowledge of methods for evaluating patient progress.' }
            ]
          },
          {
            id: 'T52',
            description: 'Develop a differential diagnosis list for identified disharmony patterns.',
            knowledgeStatements: [
              { id: 'K62', text: 'Knowledge of development of treatment principles based on different theories of pattern differentiation.' }
            ]
          },
          {
            id: 'T53',
            description: 'Identify a measurable metric for assessing treatment efficacy (e.g., outcome measures, questionnaires).',
            knowledgeStatements: [
              { id: 'K63', text: 'Knowledge of the effectiveness of combining treatment strategies in developing a treatment plan.' },
              { id: 'K64', text: 'Knowledge of treatment strategies for using tonification and sedation points.' },
              { id: 'K65', text: 'Knowledge of the association between stimulation techniques and treatment principles.' },
              { id: 'K66', text: 'Knowledge of methods for evaluating patient progress.' }
            ]
          }
        ]
      },
      {
        id: 'D203',
        name: 'Communication with patients and other health care providers',
        percentage: 1,
        tasks: [
          {
            id: 'T54',
            description: 'Collaborate with primary physicians and other health care providers to identify the most effective treatment for patients.',
            knowledgeStatements: [
              { id: 'K85', text: 'Knowledge of the relationship between Western disease diagnoses and Traditional Chinese Medicine patterns.' }
            ]
          },
          {
            id: 'T64',
            description: 'Translate Traditional Chinese Medicine diagnostic concepts into common Western terminology for patients and health care providers.',
            knowledgeStatements: [
              { id: 'K86', text: 'Knowledge of Western medical diagnoses and physiological processes involved with disease progression.' }
            ]
          },
          {
            id: 'T65',
            description: 'Educate patients regarding differences between Traditional Chinese Medicine and Western medicine.',
            knowledgeStatements: [
              { id: 'K87', text: 'Knowledge of techniques to communicate assessment findings, diagnoses, and treatment plans to patients or other health care providers.' }
            ]
          },
          {
            id: 'T66',
            description: 'Communicate assessment findings and diagnosis to patients.',
            knowledgeStatements: [
              { id: 'K87', text: 'Knowledge of techniques to communicate assessment findings, diagnoses, and treatment plans to patients or other health care providers.' }
            ]
          },
          {
            id: 'T67',
            description: 'Communicate with patients about treatment plan and possible outcomes.',
            knowledgeStatements: [
              { id: 'K87', text: 'Knowledge of techniques to communicate assessment findings, diagnoses, and treatment plans to patients or other health care providers.' }
            ]
          },
          {
            id: 'T68',
            description: 'Explain treatment procedures to patients before starting treatment.',
            knowledgeStatements: [
              { id: 'K87', text: 'Knowledge of techniques to communicate assessment findings, diagnoses, and treatment plans to patients or other health care providers.' }
            ]
          }
        ]
      }
    ]
  },

  domain3: {
    code: 'DOMAIN_3_ACUPUNCTURE',
    title: 'Acupuncture treatment',
    percentage: 32,
    description: 'This area assesses the practitioner\'s knowledge of selecting appropriate acupuncture points and techniques, locating points accurately, and applying various acupuncture and adjunctive therapy methods.',
    subareas: [
      {
        id: 'D301',
        name: 'Acupuncture point selection',
        percentage: 16,
        tasks: [
          {
            id: 'T69',
            description: 'Develop a point prescription based on treatment principles.',
            knowledgeStatements: [
              { id: 'K88', text: 'Knowledge of the clinical actions and indications of points.' },
              { id: 'K89', text: 'Knowledge of the interrelationships between points, channels, and internal Organs.' },
              { id: 'K90', text: 'Knowledge of principles for combining distal and proximal points.' },
              { id: 'K91', text: 'Knowledge of principles for choosing local points.' },
              { id: 'K92', text: 'Knowledge of principles for combining points from different channels.' },
              { id: 'K93', text: 'Knowledge of principles for choosing points according to channel theory.' },
              { id: 'K94', text: 'Knowledge of treatment modification based on patient response to treatment.' },
              { id: 'K96', text: 'Knowledge of clinical significance of the sequence in which needles are inserted.' },
              { id: 'K97', text: 'Knowledge of therapeutic effects of needling points on the opposite side of the body from the location of the condition.' },
              { id: 'K98', text: 'Knowledge of the principles for balancing the points on the upper part of the body with those of the lower part.' },
              { id: 'K99', text: 'Knowledge of principles for choosing points on the front and back to regulate internal Organs.' },
              { id: 'K100', text: 'Knowledge of principles for choosing points in the center to treat conditions occurring on extremities.' },
              { id: 'K101', text: 'Knowledge of principles for choosing points on the extremities to treat conditions occurring in the center.' },
              { id: 'K201', text: 'Knowledge of principles for selecting sedation and tonification points.' }
            ]
          },
          {
            id: 'T70',
            description: 'Select distal and/or proximal points.',
            knowledgeStatements: [
              { id: 'K88', text: 'Knowledge of the clinical actions and indications of points.' },
              { id: 'K89', text: 'Knowledge of the interrelationships between points, channels, and internal Organs.' },
              { id: 'K90', text: 'Knowledge of principles for combining distal and proximal points.' },
              { id: 'K91', text: 'Knowledge of principles for choosing local points.' },
              { id: 'K92', text: 'Knowledge of principles for combining points from different channels.' },
              { id: 'K93', text: 'Knowledge of principles for choosing points according to channel theory.' },
              { id: 'K97', text: 'Knowledge of therapeutic effects of needling points on the opposite side of the body from the location of the condition.' },
              { id: 'K98', text: 'Knowledge of the principles for balancing the points on the upper part of the body with those of the lower part.' }
            ]
          },
          {
            id: 'T71',
            description: 'Select local points along the affected Meridian.',
            knowledgeStatements: [
              { id: 'K88', text: 'Knowledge of the clinical actions and indications of points.' },
              { id: 'K89', text: 'Knowledge of the interrelationships between points, channels, and internal Organs.' },
              { id: 'K91', text: 'Knowledge of principles for choosing local points.' },
              { id: 'K92', text: 'Knowledge of principles for combining points from different channels.' },
              { id: 'K93', text: 'Knowledge of principles for choosing points according to channel theory.' },
              { id: 'K102', text: 'Knowledge of the therapeutic use of Ashi points.' }
            ]
          },
          {
            id: 'T72',
            description: 'Select points from different channels to treat Root and Branch.',
            knowledgeStatements: [
              { id: 'K88', text: 'Knowledge of the clinical actions and indications of points.' },
              { id: 'K89', text: 'Knowledge of the interrelationships between points, channels, and internal Organs.' },
              { id: 'K90', text: 'Knowledge of principles for combining distal and proximal points.' },
              { id: 'K92', text: 'Knowledge of principles for combining points from different channels.' },
              { id: 'K93', text: 'Knowledge of principles for choosing points according to channel theory.' },
              { id: 'K98', text: 'Knowledge of the principles for balancing the points on the upper part of the body with those of the lower part.' }
            ]
          },
          {
            id: 'T73',
            description: 'Select points on patient\'s body using mirroring methods (e.g., elbow-for-knee).',
            knowledgeStatements: [
              { id: 'K88', text: 'Knowledge of the clinical actions and indications of points.' },
              { id: 'K89', text: 'Knowledge of the interrelationships between points, channels, and internal Organs.' },
              { id: 'K90', text: 'Knowledge of principles for combining distal and proximal points.' },
              { id: 'K92', text: 'Knowledge of principles for combining points from different channels.' },
              { id: 'K93', text: 'Knowledge of principles for choosing points according to channel theory.' },
              { id: 'K96', text: 'Knowledge of clinical significance of the sequence in which needles are inserted.' },
              { id: 'K97', text: 'Knowledge of therapeutic effects of needling points on the opposite side of the body from the location of the condition.' },
              { id: 'K98', text: 'Knowledge of the principles for balancing the points on the upper part of the body with those of the lower part.' },
              { id: 'K99', text: 'Knowledge of principles for choosing points on the front and back to regulate internal Organs.' },
              { id: 'K100', text: 'Knowledge of principles for choosing points in the center to treat conditions occurring on extremities.' },
              { id: 'K101', text: 'Knowledge of principles for choosing points on the extremities to treat conditions occurring in the center.' }
            ]
          },
          {
            id: 'T75',
            description: 'Select points on patients to balance point distribution (e.g., right and left, above and below).',
            knowledgeStatements: [
              { id: 'K88', text: 'Knowledge of the clinical actions and indications of points.' },
              { id: 'K89', text: 'Knowledge of the interrelationships between points, channels, and internal Organs.' },
              { id: 'K90', text: 'Knowledge of principles for combining distal and proximal points.' },
              { id: 'K91', text: 'Knowledge of principles for choosing local points.' },
              { id: 'K92', text: 'Knowledge of principles for combining points from different channels.' },
              { id: 'K97', text: 'Knowledge of therapeutic effects of needling points on the opposite side of the body from the location of the condition.' },
              { id: 'K98', text: 'Knowledge of the principles for balancing the points on the upper part of the body with those of the lower part.' },
              { id: 'K99', text: 'Knowledge of principles for choosing points on the front and back to regulate internal Organs.' },
              { id: 'K118', text: 'Knowledge of principles for choosing Mother and Son points (Four Needle Technique).' }
            ]
          },
          {
            id: 'T76',
            description: 'Select points from Yin and Yang channels to balance treatment prescription for patients.',
            knowledgeStatements: [
              { id: 'K88', text: 'Knowledge of the clinical actions and indications of points.' },
              { id: 'K89', text: 'Knowledge of the interrelationships between points, channels, and internal Organs.' },
              { id: 'K92', text: 'Knowledge of principles for combining points from different channels.' },
              { id: 'K93', text: 'Knowledge of principles for choosing points according to channel theory.' },
              { id: 'K97', text: 'Knowledge of therapeutic effects of needling points on the opposite side of the body from the location of the condition.' },
              { id: 'K98', text: 'Knowledge of the principles for balancing the points on the upper part of the body with those of the lower part.' },
              { id: 'K99', text: 'Knowledge of principles for choosing points on the front and back to regulate internal Organs.' },
              { id: 'K104', text: 'Knowledge of principles for choosing Front-Mu points in treatment.' },
              { id: 'K105', text: 'Knowledge of principles for choosing Back-Shu points in treatment.' }
            ]
          },
          {
            id: 'T77',
            description: 'Select points on patient extremities to treat conditions occurring in the center.',
            knowledgeStatements: [
              { id: 'K88', text: 'Knowledge of the clinical actions and indications of points.' },
              { id: 'K89', text: 'Knowledge of the interrelationships between points, channels, and internal Organs.' },
              { id: 'K90', text: 'Knowledge of principles for combining distal and proximal points.' },
              { id: 'K101', text: 'Knowledge of principles for choosing points on the extremities to treat conditions occurring in the center.' }
            ]
          },
          {
            id: 'T78',
            description: 'Select points on patient that are centrally located to treat conditions occurring in the extremities.',
            knowledgeStatements: [
              { id: 'K88', text: 'Knowledge of the clinical actions and indications of points.' },
              { id: 'K89', text: 'Knowledge of the interrelationships between points, channels, and internal Organs.' },
              { id: 'K100', text: 'Knowledge of principles for choosing points in the center to treat conditions occurring on extremities.' }
            ]
          },
          {
            id: 'T79',
            description: 'Select Ashi points on patients.',
            knowledgeStatements: [
              { id: 'K88', text: 'Knowledge of the clinical actions and indications of points.' },
              { id: 'K89', text: 'Knowledge of the interrelationships between points, channels, and internal Organs.' },
              { id: 'K91', text: 'Knowledge of principles for choosing local points.' },
              { id: 'K102', text: 'Knowledge of the therapeutic use of Ashi points.' },
              { id: 'K103', text: 'Knowledge of the therapeutic use of points along the Muscle channels.' }
            ]
          },
          {
            id: 'T80',
            description: 'Select points along the Muscle channels.',
            knowledgeStatements: [
              { id: 'K88', text: 'Knowledge of the clinical actions and indications of points.' },
              { id: 'K89', text: 'Knowledge of the interrelationships between points, channels, and internal Organs.' },
              { id: 'K103', text: 'Knowledge of the therapeutic use of points along the Muscle channels.' }
            ]
          },
          {
            id: 'T81',
            description: 'Select Front-Mu points on patients.',
            knowledgeStatements: [
              { id: 'K88', text: 'Knowledge of the clinical actions and indications of points.' },
              { id: 'K89', text: 'Knowledge of the interrelationships between points, channels, and internal Organs.' },
              { id: 'K104', text: 'Knowledge of principles for choosing Front-Mu points in treatment.' },
              { id: 'K106', text: 'Knowledge of principles for combining Front-Mu points and Back-Shu points to balance treatment.' }
            ]
          },
          {
            id: 'T82',
            description: 'Select Back-Shu points on patients.',
            knowledgeStatements: [
              { id: 'K88', text: 'Knowledge of the clinical actions and indications of points.' },
              { id: 'K89', text: 'Knowledge of the interrelationships between points, channels, and internal Organs.' },
              { id: 'K93', text: 'Knowledge of principles for choosing points according to channel theory.' },
              { id: 'K105', text: 'Knowledge of principles for choosing Back-Shu points in treatment.' },
              { id: 'K106', text: 'Knowledge of principles for combining Front-Mu points and Back-Shu points to balance treatment.' }
            ]
          },
          {
            id: 'T83',
            description: 'Select He-Sea points on patients to connect channels with respective Fu Organs.',
            knowledgeStatements: [
              { id: 'K88', text: 'Knowledge of the clinical actions and indications of points.' },
              { id: 'K89', text: 'Knowledge of the interrelationships between points, channels, and internal Organs.' },
              { id: 'K107', text: 'Knowledge of principles for choosing He-Sea points.' }
            ]
          },
          {
            id: 'T84',
            description: 'Select Five Shu (Five-Transporting) points on patients.',
            knowledgeStatements: [
              { id: 'K88', text: 'Knowledge of the clinical actions and indications of points.' },
              { id: 'K89', text: 'Knowledge of the interrelationships between points, channels, and internal Organs.' },
              { id: 'K104', text: 'Knowledge of principles for choosing Front-Mu points in treatment.' },
              { id: 'K105', text: 'Knowledge of principles for choosing Back-Shu points in treatment.' },
              { id: 'K106', text: 'Knowledge of principles for combining Front-Mu points and Back-Shu points to balance treatment.' },
              { id: 'K107', text: 'Knowledge of principles for choosing He-Sea points.' },
              { id: 'K108', text: 'Knowledge of principles for choosing Five Shu (Five-Transporting) points.' }
            ]
          },
          {
            id: 'T85',
            description: 'Select Confluent points of the Eight Extraordinary channels on patients.',
            knowledgeStatements: [
              { id: 'K88', text: 'Knowledge of the clinical actions and indications of points.' },
              { id: 'K89', text: 'Knowledge of the interrelationships between points, channels, and internal Organs.' },
              { id: 'K109', text: 'Knowledge of principles for choosing Confluent points of the Eight Extraordinary channels.' }
            ]
          },
          {
            id: 'T86',
            description: 'Select Extra points on patients.',
            knowledgeStatements: [
              { id: 'K88', text: 'Knowledge of the clinical actions and indications of points.' },
              { id: 'K89', text: 'Knowledge of the interrelationships between points, channels, and internal Organs.' },
              { id: 'K110', text: 'Knowledge of principles for choosing Extra points.' }
            ]
          },
          {
            id: 'T87',
            description: 'Select Intersecting or Crossing points on patients.',
            knowledgeStatements: [
              { id: 'K88', text: 'Knowledge of the clinical actions and indications of points.' },
              { id: 'K89', text: 'Knowledge of the interrelationships between points, channels, and internal Organs.' },
              { id: 'K111', text: 'Knowledge of principles for choosing Intersecting or Crossing points of channels.' }
            ]
          },
          {
            id: 'T88',
            description: 'Select Luo-Connecting points on patients.',
            knowledgeStatements: [
              { id: 'K88', text: 'Knowledge of the clinical actions and indications of points.' },
              { id: 'K89', text: 'Knowledge of the interrelationships between points, channels, and internal Organs.' },
              { id: 'K112', text: 'Knowledge of principles for choosing Luo-Connecting points.' }
            ]
          },
          {
            id: 'T89',
            description: 'Select Yuan-Source points on patients.',
            knowledgeStatements: [
              { id: 'K88', text: 'Knowledge of the clinical actions and indications of points.' },
              { id: 'K89', text: 'Knowledge of the interrelationships between points, channels, and internal Organs.' },
              { id: 'K113', text: 'Knowledge of principles for choosing Yuan-Source points.' }
            ]
          },
          {
            id: 'T90',
            description: 'Select Xi-Cleft points on patients to treat acute conditions of the related channel or corresponding Organs.',
            knowledgeStatements: [
              { id: 'K88', text: 'Knowledge of the clinical actions and indications of points.' },
              { id: 'K89', text: 'Knowledge of the interrelationships between points, channels, and internal Organs.' },
              { id: 'K114', text: 'Knowledge of principles for choosing Xi-Cleft points.' }
            ]
          },
          {
            id: 'T91',
            description: 'Select Eight Influential points on patients.',
            knowledgeStatements: [
              { id: 'K88', text: 'Knowledge of the clinical actions and indications of points.' },
              { id: 'K89', text: 'Knowledge of the interrelationships between points, channels, and internal Organs.' },
              { id: 'K117', text: 'Knowledge of principles for choosing Eight Influential points.' }
            ]
          },
          {
            id: 'T92',
            description: 'Select points to treat muscle or joint mechanism dysfunction.',
            knowledgeStatements: [
              { id: 'K88', text: 'Knowledge of the clinical actions and indications of points.' },
              { id: 'K89', text: 'Knowledge of the interrelationships between points, channels, and internal Organs.' },
              { id: 'K102', text: 'Knowledge of the therapeutic use of Ashi points.' },
              { id: 'K103', text: 'Knowledge of the therapeutic use of points along the Muscle channels.' },
              { id: 'K120', text: 'Knowledge of auricular point selection principles.' },
              { id: 'K121', text: 'Knowledge of dermatome map for point selection.' },
              { id: 'K123', text: 'Knowledge of principles and indications for selecting motor points.' },
              { id: 'K124', text: 'Knowledge of principles and indications for selecting trigger points.' }
            ]
          },
          {
            id: 'T93',
            description: 'Select points to treat a radiculopathy based on dermatome map.',
            knowledgeStatements: [
              { id: 'K88', text: 'Knowledge of the clinical actions and indications of points.' },
              { id: 'K89', text: 'Knowledge of the interrelationships between points, channels, and internal Organs.' },
              { id: 'K121', text: 'Knowledge of dermatome map for point selection.' }
            ]
          },
          {
            id: 'T94',
            description: 'Select scalp points on patients.',
            knowledgeStatements: [
              { id: 'K88', text: 'Knowledge of the clinical actions and indications of points.' },
              { id: 'K89', text: 'Knowledge of the interrelationships between points, channels, and internal Organs.' },
              { id: 'K119', text: 'Knowledge of scalp point selection principles.' }
            ]
          },
          {
            id: 'T95',
            description: 'Select auricular points on patients.',
            knowledgeStatements: [
              { id: 'K88', text: 'Knowledge of the clinical actions and indications of points.' },
              { id: 'K89', text: 'Knowledge of the interrelationships between points, channels, and internal Organs.' },
              { id: 'K120', text: 'Knowledge of auricular point selection principles.' }
            ]
          },
          {
            id: 'T96',
            description: 'Select points according to the Five Elements theory.',
            knowledgeStatements: [
              { id: 'K88', text: 'Knowledge of the clinical actions and indications of points.' },
              { id: 'K89', text: 'Knowledge of the interrelationships between points, channels, and internal Organs.' },
              { id: 'K122', text: 'Knowledge of point selection using the Five Elements theory.' }
            ]
          },
          {
            id: 'T97',
            description: 'Select trigger points on patients.',
            knowledgeStatements: [
              { id: 'K88', text: 'Knowledge of the clinical actions and indications of points.' },
              { id: 'K89', text: 'Knowledge of the interrelationships between points, channels, and internal Organs.' },
              { id: 'K124', text: 'Knowledge of principles and indications for selecting trigger points.' }
            ]
          },
          {
            id: 'T98',
            description: 'Select motor points on patients.',
            knowledgeStatements: [
              { id: 'K88', text: 'Knowledge of the clinical actions and indications of points.' },
              { id: 'K89', text: 'Knowledge of the interrelationships between points, channels, and internal Organs.' },
              { id: 'K123', text: 'Knowledge of principles and indications for selecting motor points.' }
            ]
          }
        ]
      },
      {
        id: 'D302',
        name: 'Acupuncture point location and needling techniques',
        percentage: 8,
        tasks: [
          {
            id: 'T99',
            description: 'Locate points for needle insertion on patient by using anatomical landmarks and proportional measurements.',
            knowledgeStatements: [
              { id: 'K125', text: 'Knowledge of anatomical landmarks and proportional measurements used in point location.' },
              { id: 'K129', text: 'Knowledge of patient positions for locating and needling acupuncture points.' }
            ]
          },
          {
            id: 'T100',
            description: 'Select needle length and gauge according to treatment area, patient characteristics, and patient diagnosis.',
            knowledgeStatements: [
              { id: 'K126', text: 'Knowledge of needle manipulation techniques.' },
              { id: 'K130', text: 'Knowledge of recommended needling depths and angles.' },
              { id: 'K135', text: 'Knowledge of principles for selecting needles.' }
            ]
          },
          {
            id: 'T101',
            description: 'Identify needle retention time for patients to achieve optimal treatment effects.',
            knowledgeStatements: [
              { id: 'K127', text: 'Knowledge of needle retention methods for patterns of disharmony.' },
              { id: 'K128', text: 'Knowledge of the impact of patient constitution and condition on duration of needle retention.' },
              { id: 'K134', text: 'Knowledge of potential side effects of acupuncture treatment.' }
            ]
          },
          {
            id: 'T102',
            description: 'Select needle length and gauge according to treatment area, patient characteristics, and patient diagnosis.',
            knowledgeStatements: [
              { id: 'K126', text: 'Knowledge of needle manipulation techniques.' },
              { id: 'K129', text: 'Knowledge of patient positions for locating and needling acupuncture points.' }
            ]
          },
          {
            id: 'T103',
            description: 'Insert needle within standard depth range to stimulate point on patients.',
            knowledgeStatements: [
              { id: 'K115', text: 'Knowledge of the therapeutic use of tonification and sedation techniques.' },
              { id: 'K130', text: 'Knowledge of recommended needling depths and angles.' },
              { id: 'K133', text: 'Knowledge of points and patient conditions that require needling with caution.' },
              { id: 'K135', text: 'Knowledge of principles for selecting needles.' }
            ]
          },
          {
            id: 'T104',
            description: 'Insert needle using recommended insertion angle.',
            knowledgeStatements: [
              { id: 'K130', text: 'Knowledge of recommended needling depths and angles.' }
            ]
          },
          {
            id: 'T105',
            description: 'Manipulate needle to produce therapeutic effect in patients.',
            knowledgeStatements: [
              { id: 'K115', text: 'Knowledge of the therapeutic use of tonification and sedation techniques.' },
              { id: 'K126', text: 'Knowledge of needle manipulation techniques.' }
            ]
          },
          {
            id: 'T106',
            description: 'Identify contraindications for needling by evaluating patient condition to avoid injury and complications.',
            knowledgeStatements: [
              { id: 'K126', text: 'Knowledge of needle manipulation techniques.' },
              { id: 'K128', text: 'Knowledge of the impact of patient constitution and condition on duration of needle retention.' },
              { id: 'K130', text: 'Knowledge of recommended needling depths and angles.' },
              { id: 'K132', text: 'Knowledge of points and patient conditions that are contraindicated for needling.' },
              { id: 'K134', text: 'Knowledge of potential side effects of acupuncture treatment.' }
            ]
          },
          {
            id: 'T107',
            description: 'Identify points that require needling with caution (e.g., points located near arteries) to avoid complications.',
            knowledgeStatements: [
              { id: 'K130', text: 'Knowledge of recommended needling depths and angles.' },
              { id: 'K133', text: 'Knowledge of points and patient conditions that require needling with caution.' },
              { id: 'K134', text: 'Knowledge of potential side effects of acupuncture treatment.' }
            ]
          },
          {
            id: 'T108',
            description: 'Monitor patients before, during, and after treatment for adverse reactions and comfort level.',
            knowledgeStatements: [
              { id: 'K130', text: 'Knowledge of recommended needling depths and angles.' },
              { id: 'K131', text: 'Knowledge of signs and symptoms of patient distress.' },
              { id: 'K132', text: 'Knowledge of points and patient conditions that are contraindicated for needling.' },
              { id: 'K133', text: 'Knowledge of points and patient conditions that require needling with caution.' },
              { id: 'K134', text: 'Knowledge of potential side effects of acupuncture treatment.' },
              { id: 'K135', text: 'Knowledge of principles for selecting needles.' }
            ]
          }
        ]
      },
      {
        id: 'D303',
        name: 'Adjunct treatment modalities',
        percentage: 5,
        tasks: [
          {
            id: 'T109',
            description: 'Apply moxibustion techniques on patients to treat indicated conditions.',
            knowledgeStatements: [
              { id: 'K136', text: 'Knowledge of moxibustion (i.e., direct and indirect) techniques.' },
              { id: 'K137', text: 'Knowledge of indications, contraindications, and side effects of moxibustion.' }
            ]
          },
          {
            id: 'T112',
            description: 'Perform electrotherapy (e.g., electroacupuncture, electrostimulation, TENS) on patients to enhance effectiveness of treatment for select conditions.',
            knowledgeStatements: [
              { id: 'K142', text: 'Knowledge of electrotherapy techniques.' },
              { id: 'K143', text: 'Knowledge of indications, contraindications, and side effects of electrotherapy.' }
            ]
          },
          {
            id: 'T113',
            description: 'Perform cupping techniques on patients to treat indicated conditions.',
            knowledgeStatements: [
              { id: 'K144', text: 'Knowledge of cupping techniques.' },
              { id: 'K145', text: 'Knowledge of indications, contraindications, and side effects of cupping.' }
            ]
          },
          {
            id: 'T114',
            description: 'Perform Gua Sha techniques to treat indicated conditions.',
            knowledgeStatements: [
              { id: 'K146', text: 'Knowledge of Gua Sha techniques.' },
              { id: 'K147', text: 'Knowledge of indications, contraindications, and side effects of Gua Sha.' }
            ]
          },
          {
            id: 'T115',
            description: 'Perform manual therapy (e.g., Tui Na, acupressure) on patients to treat indicated conditions.',
            knowledgeStatements: [
              { id: 'K148', text: 'Knowledge of manual therapy techniques.' },
              { id: 'K149', text: 'Knowledge of indications, contraindications, and side effects of manual therapy.' }
            ]
          },
          {
            id: 'T116',
            description: 'Perform heat therapy (e.g., infrared light, heat pad) to treat indicated conditions.',
            knowledgeStatements: [
              { id: 'K150', text: 'Knowledge of heat therapy techniques.' },
              { id: 'K151', text: 'Knowledge of indications, contraindications, and side effects of heat therapy.' }
            ]
          },
          {
            id: 'T117',
            description: 'Apply ear seeds to treat indicated conditions.',
            knowledgeStatements: [
              { id: 'K152', text: 'Knowledge of the application of ear seeds.' },
              { id: 'K153', text: 'Knowledge of indications, contraindications, and side effects of ear seeds application.' }
            ]
          },
          {
            id: 'T120',
            description: 'Educate patients regarding therapeutic exercises to treat indicated conditions.',
            knowledgeStatements: [
              { id: 'K158', text: 'Knowledge of lifestyle changes and stress reduction techniques that improve health condition.' },
              { id: 'K159', text: 'Knowledge of therapeutic exercises to support patient treatment goals.' }
            ]
          },
          {
            id: 'T121',
            description: 'Educate patients regarding diet and nutrition to support treatment.',
            knowledgeStatements: [
              { id: 'K160', text: 'Knowledge of dietary modifications to support patient treatment goals.' }
            ]
          },
          {
            id: 'T122',
            description: 'Educate patients regarding lifestyle changes (e.g., Qi Gong exercise, ergonomics, meditation) to improve health condition.',
            knowledgeStatements: [
              { id: 'K158', text: 'Knowledge of lifestyle changes and stress reduction techniques that improve health condition.' }
            ]
          }
        ]
      }
    ]
  },

  domain4: {
    code: 'DOMAIN_4_HERBAL',
    title: 'Herbal therapy',
    percentage: 15,
    description: 'This area assesses the practitioner\'s knowledge of selecting and prescribing appropriate Chinese herbal formulas and individual herbs for patient conditions.',
    subareas: [
      {
        id: 'D304',
        name: 'Herbal therapy',
        percentage: 15,
        tasks: [
          {
            id: 'T123',
            description: 'Select or develop herbal formulas for patients based on treatment principle (e.g., tonify, sedate, harmonize).',
            knowledgeStatements: [
              { id: 'K161', text: 'Knowledge of therapeutic uses, indications, contraindications, and side effects of herbs and herbal formulas.' },
              { id: 'K162', text: 'Knowledge of categories of herbs and herbal formulas.' },
              { id: 'K163', text: 'Knowledge of the effects of herbs and herbal formulas on channels and Organs.' },
              { id: 'K164', text: 'Knowledge of modifications of herbal formulas.' },
              { id: 'K165', text: 'Knowledge of the synergistic and antagonist relationships of ingredients in herbal formulas.' },
              { id: 'K166', text: 'Knowledge of the hierarchical principles governing herbal formulas.' },
              { id: 'K167', text: 'Knowledge of the association between therapeutic effects of points and herbal therapy.' },
              { id: 'K168', text: 'Knowledge of interactions between herbal therapies, supplements, and Western medications.' },
              { id: 'K169', text: 'Knowledge of cautions and contraindications related to herbs and herbal formulas.' },
              { id: 'K170', text: 'Knowledge of interactions between diet and herbal therapies.' },
              { id: 'K171', text: 'Knowledge of effective dosages of herbs and herbal supplements.' },
              { id: 'K172', text: 'Knowledge of the principles and guidelines for herbal formula preparation.' },
              { id: 'K173', text: 'Knowledge of the relationships between herbal formulas and treatment principles.' },
              { id: 'K174', text: 'Knowledge of herbs and combinations of herbs that are toxic or produce undesired side effects.' }
            ]
          },
          {
            id: 'T124',
            description: 'Select or develop herbal formula based on patient constitution.',
            knowledgeStatements: [
              { id: 'K161', text: 'Knowledge of therapeutic uses, indications, contraindications, and side effects of herbs and herbal formulas.' },
              { id: 'K162', text: 'Knowledge of categories of herbs and herbal formulas.' },
              { id: 'K163', text: 'Knowledge of the effects of herbs and herbal formulas on channels and Organs.' },
              { id: 'K164', text: 'Knowledge of modifications of herbal formulas.' },
              { id: 'K165', text: 'Knowledge of the synergistic and antagonist relationships of ingredients in herbal formulas.' },
              { id: 'K166', text: 'Knowledge of the hierarchical principles governing herbal formulas.' },
              { id: 'K167', text: 'Knowledge of the association between therapeutic effects of points and herbal therapy.' },
              { id: 'K168', text: 'Knowledge of interactions between herbal therapies, supplements, and Western medications.' },
              { id: 'K169', text: 'Knowledge of cautions and contraindications related to herbs and herbal formulas.' },
              { id: 'K170', text: 'Knowledge of interactions between diet and herbal therapies.' },
              { id: 'K171', text: 'Knowledge of effective dosages of herbs and herbal supplements.' },
              { id: 'K172', text: 'Knowledge of the principles and guidelines for herbal formula preparation.' },
              { id: 'K173', text: 'Knowledge of the relationships between herbal formulas and treatment principles.' },
              { id: 'K174', text: 'Knowledge of herbs and combinations of herbs that are toxic or produce undesired side effects.' }
            ]
          },
          {
            id: 'T125',
            description: 'Select or develop herbal therapies that complement patient acupuncture treatments.',
            knowledgeStatements: [
              { id: 'K161', text: 'Knowledge of therapeutic uses, indications, contraindications, and side effects of herbs and herbal formulas.' },
              { id: 'K162', text: 'Knowledge of categories of herbs and herbal formulas.' },
              { id: 'K163', text: 'Knowledge of the effects of herbs and herbal formulas on channels and Organs.' },
              { id: 'K164', text: 'Knowledge of modifications of herbal formulas.' },
              { id: 'K165', text: 'Knowledge of the synergistic and antagonist relationships of ingredients in herbal formulas.' },
              { id: 'K166', text: 'Knowledge of the hierarchical principles governing herbal formulas.' },
              { id: 'K167', text: 'Knowledge of the association between therapeutic effects of points and herbal therapy.' },
              { id: 'K168', text: 'Knowledge of interactions between herbal therapies, supplements, and Western medications.' },
              { id: 'K169', text: 'Knowledge of cautions and contraindications related to herbs and herbal formulas.' },
              { id: 'K170', text: 'Knowledge of interactions between diet and herbal therapies.' },
              { id: 'K171', text: 'Knowledge of effective dosages of herbs and herbal supplements.' },
              { id: 'K172', text: 'Knowledge of the principles and guidelines for herbal formula preparation.' },
              { id: 'K173', text: 'Knowledge of the relationships between herbal formulas and treatment principles.' },
              { id: 'K174', text: 'Knowledge of herbs and combinations of herbs that are toxic or produce undesired side effects.' },
              { id: 'K175', text: 'Knowledge of methods for modifying herbal formulas to treat changes in patient condition.' },
              { id: 'K176', text: 'Knowledge of the effects of processing on efficacy and toxicity of herbs.' },
              { id: 'K177', text: 'Knowledge of forms (e.g., raw, granules, pill) used for administering herbs.' },
              { id: 'K178', text: 'Knowledge of herbal formula recommendations based upon patient constitution.' }
            ]
          },
          {
            id: 'T126',
            description: 'Instruct patients on use of herbs (e.g., dosage, cooking, application) to produce intended therapeutic effect.',
            knowledgeStatements: [
              { id: 'K161', text: 'Knowledge of therapeutic uses, indications, contraindications, and side effects of herbs and herbal formulas.' },
              { id: 'K167', text: 'Knowledge of the association between therapeutic effects of points and herbal therapy.' },
              { id: 'K171', text: 'Knowledge of effective dosages of herbs and herbal supplements.' },
              { id: 'K172', text: 'Knowledge of the principles and guidelines for herbal formula preparation.' },
              { id: 'K173', text: 'Knowledge of the relationships between herbal formulas and treatment principles.' },
              { id: 'K176', text: 'Knowledge of the effects of processing on efficacy and toxicity of herbs.' },
              { id: 'K178', text: 'Knowledge of herbal formula recommendations based upon patient constitution.' }
            ]
          },
          {
            id: 'T127',
            description: 'Identify herbal therapy with similar or complementary action to Western medications.',
            knowledgeStatements: [
              { id: 'K161', text: 'Knowledge of therapeutic uses, indications, contraindications, and side effects of herbs and herbal formulas.' },
              { id: 'K162', text: 'Knowledge of categories of herbs and herbal formulas.' },
              { id: 'K163', text: 'Knowledge of the effects of herbs and herbal formulas on channels and Organs.' },
              { id: 'K168', text: 'Knowledge of interactions between herbal therapies, supplements, and Western medications.' }
            ]
          },
          {
            id: 'T128',
            description: 'Identify herbal therapy contraindications for the patient.',
            knowledgeStatements: [
              { id: 'K161', text: 'Knowledge of therapeutic uses, indications, contraindications, and side effects of herbs and herbal formulas.' },
              { id: 'K168', text: 'Knowledge of interactions between herbal therapies, supplements, and Western medications.' },
              { id: 'K169', text: 'Knowledge of cautions and contraindications related to herbs and herbal formulas.' },
              { id: 'K170', text: 'Knowledge of interactions between diet and herbal therapies.' },
              { id: 'K171', text: 'Knowledge of effective dosages of herbs and herbal supplements.' },
              { id: 'K173', text: 'Knowledge of the relationships between herbal formulas and treatment principles.' }
            ]
          },
          {
            id: 'T129',
            description: 'Identify contraindications for herbs when combined with Western medications to avoid adverse interactions.',
            knowledgeStatements: [
              { id: 'K161', text: 'Knowledge of therapeutic uses, indications, contraindications, and side effects of herbs and herbal formulas.' },
              { id: 'K168', text: 'Knowledge of interactions between herbal therapies, supplements, and Western medications.' },
              { id: 'K169', text: 'Knowledge of cautions and contraindications related to herbs and herbal formulas.' }
            ]
          },
          {
            id: 'T130',
            description: 'Monitor and evaluate patient response to herbal therapy.',
            knowledgeStatements: [
              { id: 'K169', text: 'Knowledge of cautions and contraindications related to herbs and herbal formulas.' },
              { id: 'K174', text: 'Knowledge of herbs and combinations of herbs that are toxic or produce undesired side effects.' },
              { id: 'K175', text: 'Knowledge of methods for modifying herbal formulas to treat changes in patient condition.' },
              { id: 'K178', text: 'Knowledge of herbal formula recommendations based upon patient constitution.' }
            ]
          },
          {
            id: 'T131',
            description: 'Monitor effects of herbs when combined with Western medications to determine interactions.',
            knowledgeStatements: [
              { id: 'K168', text: 'Knowledge of interactions between herbal therapies, supplements, and Western medications.' },
              { id: 'K169', text: 'Knowledge of cautions and contraindications related to herbs and herbal formulas.' }
            ]
          },
          {
            id: 'T132',
            description: 'Determine effective dosage of herbal therapy by evaluating patient condition.',
            knowledgeStatements: [
              { id: 'K171', text: 'Knowledge of effective dosages of herbs and herbal supplements.' },
              { id: 'K175', text: 'Knowledge of methods for modifying herbal formulas to treat changes in patient condition.' },
              { id: 'K176', text: 'Knowledge of the effects of processing on efficacy and toxicity of herbs.' },
              { id: 'K178', text: 'Knowledge of herbal formula recommendations based upon patient constitution.' }
            ]
          },
          {
            id: 'T133',
            description: 'Modify herbal prescription for patients based on patient response to herbal therapy.',
            knowledgeStatements: [
              { id: 'K162', text: 'Knowledge of categories of herbs and herbal formulas.' },
              { id: 'K163', text: 'Knowledge of the effects of herbs and herbal formulas on channels and Organs.' },
              { id: 'K164', text: 'Knowledge of modifications of herbal formulas.' },
              { id: 'K165', text: 'Knowledge of the synergistic and antagonist relationships of ingredients in herbal formulas.' },
              { id: 'K166', text: 'Knowledge of the hierarchical principles governing herbal formulas.' },
              { id: 'K169', text: 'Knowledge of cautions and contraindications related to herbs and herbal formulas.' },
              { id: 'K172', text: 'Knowledge of the principles and guidelines for herbal formula preparation.' },
              { id: 'K173', text: 'Knowledge of the relationships between herbal formulas and treatment principles.' },
              { id: 'K174', text: 'Knowledge of herbs and combinations of herbs that are toxic or produce undesired side effects.' },
              { id: 'K175', text: 'Knowledge of methods for modifying herbal formulas to treat changes in patient condition.' },
              { id: 'K177', text: 'Knowledge of forms (e.g., raw, granules, pill) used for administering herbs.' },
              { id: 'K178', text: 'Knowledge of herbal formula recommendations based upon patient constitution.' }
            ]
          },
          {
            id: 'T134',
            description: 'Identify type of herbal therapy indicated for the patient (e.g., powder, granular, raw herb, decoction, patent).',
            knowledgeStatements: [
              { id: 'K177', text: 'Knowledge of forms (e.g., raw, granules, pill) used for administering herbs.' },
              { id: 'K178', text: 'Knowledge of herbal formula recommendations based upon patient constitution.' }
            ]
          },
          {
            id: 'T135',
            description: 'Inspect raw herbs for authenticity and purity (e.g., appearance, taste, smell, texture).',
            knowledgeStatements: [
              { id: 'K179', text: 'Knowledge of methods for ensuring authenticity and purity of raw herbs.' }
            ]
          },
          {
            id: 'T136',
            description: 'Obtain certificate of authenticity for herbs from the manufacturer.',
            knowledgeStatements: []
          },
          {
            id: 'T137',
            description: 'Label packaging containing herbal prescriptions following legal guidelines for supplements.',
            knowledgeStatements: [
              { id: 'K179', text: 'Knowledge of methods for ensuring authenticity and purity of raw herbs.' },
              { id: 'K180', text: 'Knowledge of requirements for labeling of containers used for storing or dispensing of herbal preparations.' }
            ]
          },
          {
            id: 'T138',
            description: 'Provide information about the herbal therapy prescriptions to patients.',
            knowledgeStatements: [
              { id: 'K161', text: 'Knowledge of therapeutic uses, indications, contraindications, and side effects of herbs and herbal formulas.' },
              { id: 'K172', text: 'Knowledge of the principles and guidelines for herbal formula preparation.' },
              { id: 'K177', text: 'Knowledge of forms (e.g., raw, granules, pill) used for administering herbs.' },
              { id: 'K178', text: 'Knowledge of herbal formula recommendations based upon patient constitution.' },
              { id: 'K179', text: 'Knowledge of methods for ensuring authenticity and purity of raw herbs.' }
            ]
          },
          {
            id: 'T139',
            description: 'Prepare raw herbs following safety guidelines.',
            knowledgeStatements: [
              { id: 'K161', text: 'Knowledge of therapeutic uses, indications, contraindications, and side effects of herbs and herbal formulas.' },
              { id: 'K162', text: 'Knowledge of categories of herbs and herbal formulas.' },
              { id: 'K176', text: 'Knowledge of the effects of processing on efficacy and toxicity of herbs.' },
              { id: 'K179', text: 'Knowledge of methods for ensuring authenticity and purity of raw herbs.' },
              { id: 'K180', text: 'Knowledge of requirements for labeling of containers used for storing or dispensing of herbal preparations.' }
            ]
          }
        ]
      }
    ]
  },

  domain5: {
    code: 'DOMAIN_5_PROFESSIONAL',
    title: 'California regulations, public health, and professional development',
    percentage: 11,
    description: 'This area assesses the practitioner\'s knowledge of California laws and regulations governing acupuncture practice, public health and safety requirements, professional ethics, and scope of practice.',
    subareas: [
      {
        id: 'D401',
        name: 'Records, confidentiality, mandated reporting, and informed consent',
        percentage: 3,
        tasks: [
          {
            id: 'T140',
            description: 'Document assessment, treatment, and patient response to treatment in accordance with legal and professional standards.',
            knowledgeStatements: [
              { id: 'K181', text: 'Knowledge of legal requirements and professional standards pertaining to documentation of assessment, treatment, and patient response.' },
              { id: 'K182', text: 'Knowledge of professional standards for writing medical records and reports.' },
              { id: 'K183', text: 'Knowledge of legal requirements pertaining to maintenance and retention of patient records.' }
            ]
          },
          {
            id: 'T141',
            description: 'Maintain patient records in accordance with legal requirements.',
            knowledgeStatements: [
              { id: 'K182', text: 'Knowledge of professional standards for writing medical records and reports.' },
              { id: 'K183', text: 'Knowledge of legal requirements pertaining to maintenance and retention of patient records.' }
            ]
          },
          {
            id: 'T142',
            description: 'Maintain patient privacy and confidentiality in accordance with legal requirements.',
            knowledgeStatements: [
              { id: 'K184', text: 'Knowledge of legal requirements pertaining to confidentiality of patient information (i.e., HIPAA).' },
              { id: 'K185', text: 'Knowledge of legal requirements pertaining to disclosure of patient information.' },
              { id: 'K186', text: 'Knowledge of legal requirements pertaining to reporting of child, elder, and dependent adult abuse and neglect.' },
              { id: 'K187', text: 'Knowledge of legal requirements pertaining to reporting of communicable disease.' }
            ]
          },
          {
            id: 'T143',
            description: 'Identify and report cases of known or suspected abuse and neglect.',
            knowledgeStatements: [
              { id: 'K186', text: 'Knowledge of legal requirements pertaining to reporting of child, elder, and dependent adult abuse and neglect.' },
              { id: 'K188', text: 'Knowledge of indicators of child, elder, and dependent adult abuse and neglect.' }
            ]
          },
          {
            id: 'T144',
            description: 'Identify and report cases of communicable disease.',
            knowledgeStatements: [
              { id: 'K187', text: 'Knowledge of legal requirements pertaining to reporting of communicable disease.' }
            ]
          },
          {
            id: 'T145',
            description: 'Obtain informed consent for treatment in accordance with legal and ethical guidelines.',
            knowledgeStatements: [
              { id: 'K189', text: 'Knowledge of legal and ethical requirements pertaining to informed consent.' }
            ]
          },
          {
            id: 'T146',
            description: 'Assess patient capacity to make health care decisions.',
            knowledgeStatements: [
              { id: 'K190', text: 'Knowledge of methods to assess patient capacity to make health care decisions.' }
            ]
          }
        ]
      },
      {
        id: 'D402',
        name: 'Infection control and environmental safety',
        percentage: 4,
        tasks: [
          {
            id: 'T147',
            description: 'Implement standard procedures to prevent disease transmission and minimize risk of infection.',
            knowledgeStatements: [
              { id: 'K191', text: 'Knowledge of infection control guidelines.' },
              { id: 'K192', text: 'Knowledge of the risks of infectious diseases in the practitioner and patient environment.' },
              { id: 'K193', text: 'Knowledge of standards and procedures for the Clean Needle Technique.' },
              { id: 'K194', text: 'Knowledge of legal requirements for maintaining clinical environments in accordance with OSHA requirements and clinical standards.' }
            ]
          },
          {
            id: 'T148',
            description: 'Implement measures to safely perform acupuncture and adjunct treatments on patients.',
            knowledgeStatements: [
              { id: 'K191', text: 'Knowledge of infection control guidelines.' },
              { id: 'K192', text: 'Knowledge of the risks of infectious diseases in the practitioner and patient environment.' },
              { id: 'K193', text: 'Knowledge of standards and procedures for the Clean Needle Technique.' }
            ]
          },
          {
            id: 'T149',
            description: 'Practice clean needle techniques.',
            knowledgeStatements: [
              { id: 'K193', text: 'Knowledge of standards and procedures for the Clean Needle Technique.' }
            ]
          },
          {
            id: 'T150',
            description: 'Maintain a clinical environment that adheres to OSHA requirements and clinical standards.',
            knowledgeStatements: [
              { id: 'K194', text: 'Knowledge of legal requirements for maintaining clinical environments in accordance with OSHA requirements and clinical standards.' }
            ]
          },
          {
            id: 'T151',
            description: 'Dispose of needles, contaminated material, and containers in accordance with Cal/OSHA guidelines.',
            knowledgeStatements: [
              { id: 'K195', text: 'Knowledge of methods for isolating used needles.' },
              { id: 'K196', text: 'Knowledge of legal requirements for disposal of contaminated materials' }
            ]
          }
        ]
      },
      {
        id: 'D403',
        name: 'Professional conduct and ethics',
        percentage: 4,
        tasks: [
          {
            id: 'T152',
            description: 'Recognize situations and behaviors that may impair ability to practice safely and competently.',
            knowledgeStatements: [
              { id: 'K197', text: 'Knowledge of methods to assess patient capacity to make health care decisions.' }
            ]
          },
          {
            id: 'T153',
            description: 'Comply with the acupuncturist legal scope of practice.',
            knowledgeStatements: [
              { id: 'K198', text: 'Knowledge of laws and regulations pertaining to unprofessional conduct for California-licensed acupuncturists.' }
            ]
          },
          {
            id: 'T154',
            description: 'Develop advertisements regarding services provided in accordance with legal guidelines.',
            knowledgeStatements: [
              { id: 'K199', text: 'Knowledge of legal requirements pertaining to advertisement and dissemination of information about professional qualifications and services.' }
            ]
          },
          {
            id: 'T155',
            description: 'Recognize situations and behaviors that constitute unprofessional conduct.',
            knowledgeStatements: [
              { id: 'K198', text: 'Knowledge of laws and regulations pertaining to unprofessional conduct for California-licensed acupuncturists.' }
            ]
          },
          {
            id: 'T156',
            description: 'Recognize and evaluate potential conflict of interest situations for impact on patients or therapeutic process.',
            knowledgeStatements: [
              { id: 'K200', text: 'Knowledge of ethical and professional standards for licensed acupuncturists.' }
            ]
          },
          {
            id: 'T157',
            description: 'Establish and maintain professional boundaries.',
            knowledgeStatements: []
          },
          {
            id: 'T158',
            description: 'Safeguard patient rights to dignity.',
            knowledgeStatements: []
          }
        ]
      }
    ]
  }
}

export const examInfoData = {
  cale: {
    examType: 'cale',
    name: 'CALE',
    nameEn: 'California Acupuncture Licensing Examination',
    fullName: '加州针灸执照考试',
    description: '加州针灸执照考试（CALE）是获得加州针灸执照的必要步骤，由PSI公司管理，考核申请者在针灸和东方医学方面的知识和技能。',
    duration: 300, // 5小时（官方规定）
    totalQuestions: 200, // 175道计分题 + 25道预测试题
    passingScore: 75, // 百分比
    examFee: '$450',
    examFormat: '计算机化考试（CBT - Computer-Based Testing）',
    retakePolicy: '如未通过，须联系针灸局重新申请考试',
    validityPeriod: '通过考试后可申请加州针灸执照（需定期更新）',
    officialWebsite: 'https://www.acupuncture.ca.gov',
    contentOverview: `加州针灸执照考试由PSI公司管理，基于官方2021年职业分析报告 (2021 Occupational Analysis)，包含5个主要内容领域：

**领域1：评估病人 (Patient Assessment) - 31%** ✓官方确认
• 应用中医方法评估病人（望闻问切、舌脉诊）
• 应用西医方法评估病人（生命体征、体格检查）
• 识别需要转介和急诊处理的情况
• 参考官方脉诊术语表（Appendix C）

**领域2：诊断印象和治疗计划 (Diagnostic Impression & Treatment Planning)**
• 运用中医理论进行辨证诊断
• 制定个性化治疗计划
• 与病人和其他医疗服务提供者有效沟通

**领域3：针灸治疗 (Acupuncture Treatment)**
• 针刺选穴 - 参考Appendix D
• 取穴定位与针刺手法 - 参考Appendix D
• 辅助治疗方式：拔罐、刮痧、艾灸、推拿等

**领域4：中药治疗 (Herbal Therapy) - 11%**
• 中药性味归经、功效主治
• 方剂应用 - 参考Appendix E（中药）和F（方剂）

**领域5：加州法规、公共卫生与安全 (CA Regulations, Public Health & Safety) - 9%**
• 病历记录、保密制度、强制报告、知情同意
• 感染控制、环境安全、无菌操作
• 专业行为准则和医德规范
• 加州针灸法规（Business & Professions Code）

**注**: 除Domain 1 (31%)已官方确认外，其他领域占比基于历史数据估算

**考试特点：**
• 200道多选题（175道计分题 + 25道预测试题）
• 5小时考试时间
• 提供中文版本考试
• 考场提供参考附录（脉诊术语、穴位定位、中药、方剂）`,
    preparationTips: `**官方备考建议：**

**1. 考试准备**
• 仔细阅读PSI考生手册，了解所有考试规则
• 熟悉考试大纲（Appendix A）中的4个内容领域
• 查看试题样本（Appendix B）了解题型
• 学习附录中的参考表（脉诊、穴位、中药、方剂）

**2. 考试预约**
• 在收到考试资格通知后，及时通过PSI网站或电话预约
• 选择方便的考试地点和时间
• 至少提前30分钟到达考场

**3. 考试当天**
• 携带有效身份证件（带照片）
• 不得携带任何学习材料、电子设备、食品饮料
• 考场会提供草稿纸和参考资料
• 严格遵守考场纪律和安全规定

**4. 学习策略**
• 系统学习四大内容领域的知识
• 重点掌握中医诊断和针灸治疗
• 了解加州针灸法规和职业道德要求
• 多做模拟题，熟悉计算机答题界面
• 合理分配时间，确保完成所有题目

**5. 安全与法规**
• 熟悉加州Business & Professions Code第123条
• 了解针灸执业范围和限制
• 掌握感染控制和安全操作规程
• 理解patient privacy和HIPAA要求`
  },
  nccaom: {
    examType: 'nccaom',
    name: 'NCCAOM',
    nameEn: 'National Certification Commission for Acupuncture and Oriental Medicine',
    fullName: '美国国家中医针灸认证委员会考试',
    description: 'NCCAOM认证是美国中医针灸领域最权威的专业认证，获得认证是在大多数州执业的前提条件。',
    duration: 180, // 3小时
    totalQuestions: 140,
    passingScore: 70,
    examFee: '$550',
    examFormat: '计算机化考试（机考）',
    retakePolicy: '未通过者可在60天后重考，每年最多重考4次',
    validityPeriod: '4年（需通过继续教育维持认证）',
    officialWebsite: 'https://www.nccaom.org',
    contentOverview: `NCCAOM认证考试涵盖以下模块：
• 针灸基础（Foundations of Oriental Medicine）
• 针灸穴位定位（Acupuncture Point Location）
• 生物医学（Biomedicine）
• 中医临床诊断（OM Pattern Diagnosis）
• 针刺技术（Acupuncture Techniques）
• 中药学（Chinese Herbology）
• 安全与职业道德`,
    preparationTips: `备考建议：
1. 分模块学习，每个模块单独准备
2. 重点掌握穴位定位，这是独立考试模块
3. 熟悉西医基础知识，生物医学占比较大
4. 学习标准化的诊断流程和辨证方法
5. 了解NCCAOM的考试风格和题型特点
6. 参加官方推荐的培训课程和模拟考试`
  }
}

// Cale 详细分类数据 - 基于官方2021年职业分析报告 (2021 Occupational Analysis)
export const caleCategories = [
  // Domain 1: 評估病人 (Patient Assessment) - 31% (官方确认)
  {
    name: '評估病人',
    nameEn: 'Patient Assessment',
    code: 'DOMAIN_1_ASSESSMENT',
    type: 'content',
    description: '病史采集、問診、舌脈診、體格檢查、辨識西醫檢查結果、輔助診斷',
    detailedInfo: '官方Domain 1：运用中医和西医方法评估患者主诉和健康状况，识别需要转诊的情况',
    weight: 31, // 官方确认：31% (来源: CA Acupuncture Board NCCAOM Audit)
    questionCount: 54, // 175 * 0.31 ≈ 54
    keyPoints: JSON.stringify([
      '【中医评估方法】',
      '• 望诊：观察神、色、形、态、舌象',
      '• 闻诊：听声音、嗅气味',
      '• 问诊：主诉、现病史、既往史、家族史、十问歌',
      '• 切诊：脉诊（浮沉迟数等28种脉象）',
      '',
      '【西医评估方法】',
      '• 生命体征测量（血压、脉搏、呼吸、体温）',
      '• 体格检查基础',
      '• 实验室检查结果解读',
      '• 影像学检查基本认识',
      '',
      '【转诊与急诊】',
      '• 识别需要转诊的情况',
      '• 急诊处理原则',
      '• 与其他医疗服务提供者的沟通'
    ]),
    studyTips: '此领域占比最大(31%)，重点掌握四诊合参、舌脉诊断。熟悉官方提供的脉诊术语参考表(Appendix C)。了解何时需要转诊至西医。',
    order: 1
  },

  // Domain 2: 診斷和治療計劃 (Diagnostic Impression & Treatment Planning) - 约17% (⚠️ 未官方确认)
  {
    name: '診斷和治療計劃',
    nameEn: 'Diagnostic Impression and Treatment Planning',
    code: 'DOMAIN_2_DIAGNOSIS',
    type: 'content',
    description: '辨證論治、確定病因病機、制定治療目標與計劃、轉診與病人教育',
    detailedInfo: '官方Domain 2：根据评估结果进行中医诊断，制定治疗方案，并在必要时修改计划',
    weight: 17, // ⚠️ 估算值，需参考官方2021年职业分析报告核实
    questionCount: 30, // 175 * 0.17 ≈ 30
    keyPoints: JSON.stringify([
      '【中医诊断】',
      '• 八纲辨证（表里、寒热、虚实、阴阳）',
      '• 脏腑辨证',
      '• 六经辨证',
      '• 卫气营血辨证',
      '• 三焦辨证',
      '• 经络辨证',
      '',
      '【治疗计划】',
      '• 确定治疗原则和治法',
      '• 设定治疗目标',
      '• 制定治疗频率和疗程',
      '• 评估治疗效果',
      '• 根据病情变化调整治疗方案',
      '',
      '【沟通与教育】',
      '• 与患者沟通诊断结果',
      '• 患者教育（生活方式、饮食建议等）',
      '• 与其他医疗服务提供者协作'
    ]),
    studyTips: '理解中医辨证思维，能够根据症状体征进行准确辨证。熟悉常见病证的治疗原则。',
    order: 2
  },

  // Domain 3: 針灸治療 (Acupuncture Treatment) - 子域占比 (⚠️ 未官方确认，估算值)
  {
    name: '治療 - 針刺選穴',
    nameEn: 'Acupuncture Treatment - Point Selection',
    code: 'DOMAIN_3A_ACU_SELECTION',
    type: 'content',
    description: '根据辨证结果选择合适的穴位进行针灸治疗',
    detailedInfo: '官方Domain 3 (Acupuncture Treatment) 子领域：针刺选穴的原则和方法',
    weight: 10, // ⚠️ 估算值，需官方核实
    questionCount: 18,
    keyPoints: JSON.stringify([
      '• 循经取穴原则',
      '• 局部取穴与远端取穴',
      '• 对症取穴',
      '• 特定穴的应用（五输穴、原穴、络穴、郄穴、背俞穴、募穴、八会穴等）',
      '• 常见病症的配穴方法',
      '• 针灸处方原则'
    ]),
    studyTips: '理解选穴原理，不是死记硬背。熟悉特定穴的临床应用。',
    order: 3
  },
  {
    name: '治療 - 取穴定位與針刺手法',
    nameEn: 'Acupuncture Treatment - Point Location & Technique',
    code: 'DOMAIN_3B_ACU_TECHNIQUE',
    type: 'content',
    description: '穴位精确定位、针刺深度方向、针刺手法',
    detailedInfo: '官方Domain 3 (Acupuncture Treatment) 子领域：穴位定位和针刺技术',
    weight: 15, // ⚠️ 估算值，需官方核实
    questionCount: 26,
    keyPoints: JSON.stringify([
      '【穴位定位】',
      '• 骨度分寸定位法',
      '• 体表标志定位法',
      '• 手指同身寸定位法',
      '• 十四经穴定位（重点：常用穴位）',
      '• 经外奇穴定位',
      '• 参考官方穴位参考表(Appendix D)',
      '',
      '【针刺手法】',
      '• 提插法、捻转法',
      '• 烧山火、透天凉',
      '• 针刺深度和方向',
      '• 得气的表现和意义',
      '• 滞针、弯针、断针等异常情况处理',
      '',
      '【针刺安全】',
      '• 危险穴位和禁忌',
      '• 特殊部位针刺注意事项',
      '• 晕针的预防和处理'
    ]),
    studyTips: '穴位定位是高频考点！建议在人体模型上反复练习。熟记官方Appendix D的穴位术语。注意针刺安全和禁忌。',
    order: 4
  },
  {
    name: '治療 - 輔助治療方式',
    nameEn: 'Acupuncture Treatment - Adjunctive Therapies',
    code: 'DOMAIN_3C_ADJUNCTIVE',
    type: 'content',
    description: '艾灸、拔罐、刮痧、耳針、頭針、電針等辅助疗法',
    detailedInfo: '官方Domain 3 (Acupuncture Treatment) 子领域：针灸辅助治疗方法',
    weight: 7, // ⚠️ 估算值，需官方核实
    questionCount: 12,
    keyPoints: JSON.stringify([
      '【艾灸】',
      '• 艾条灸、艾柱灸、温针灸',
      '• 隔姜灸、隔蒜灸、隔盐灸',
      '• 艾灸的适应症和禁忌症',
      '',
      '【拔罐】',
      '• 留罐、走罐、闪罐',
      '• 拔罐的适应症和注意事项',
      '',
      '【其他疗法】',
      '• 刮痧疗法',
      '• 耳针疗法',
      '• 头针疗法',
      '• 电针疗法',
      '• 穴位注射（需了解加州法规限制）',
      '• 推拿手法基础'
    ]),
    studyTips: '了解各种辅助疗法的适应症和禁忌症。特别注意加州法规对某些疗法的限制。',
    order: 5
  },
  {
    name: '治療 - 中藥治療',
    nameEn: 'Herbal Therapy',
    code: 'DOMAIN_4_HERBAL',
    type: 'content',
    description: '中药性味归经、功效主治、方剂应用',
    detailedInfo: '官方Domain 4 (Herbal Therapy)：中药治疗',
    weight: 11, // ⚠️ 估算值，需参考官方2021年职业分析报告核实
    questionCount: 19, // 175 * 0.11 ≈ 19
    keyPoints: JSON.stringify([
      '【中药学基础】',
      '• 中药四气五味',
      '• 升降浮沉',
      '• 归经理论',
      '• 配伍禁忌（十八反、十九畏）',
      '• 妊娠禁忌药',
      '• 参考官方中药目录(Appendix E)',
      '',
      '【常用中药】',
      '• 解表药、清热药、泻下药',
      '• 祛风湿药、化湿药、利水渗湿药',
      '• 温里药、理气药、消食药',
      '• 止血药、活血化瘀药',
      '• 化痰止咳平喘药',
      '• 安神药、平肝息风药',
      '• 补益药',
      '',
      '【方剂学】',
      '• 方剂组成原则（君臣佐使）',
      '• 经典方剂的组成、功效、主治',
      '• 参考官方方剂目录(Appendix F)',
      '• 方剂的加减应用',
      '',
      '【用药安全】',
      '• 有毒中药的使用',
      '• 中西药相互作用',
      '• 特殊人群用药（孕妇、儿童、老年人）'
    ]),
    studyTips: '中药部分约占11%，重点掌握官方Appendix E和F中列出的中药和方剂。注意中药安全性和配伍禁忌。',
    order: 6
  },

  // Domain 5: CA法規、公共衛生與安全 (CA Regulations, Public Health & Safety) - 约9% (⚠️ 未官方确认)
  {
    name: '專業職責',
    nameEn: 'CA Regulations, Public Health & Safety',
    code: 'DOMAIN_5_PROFESSIONAL',
    type: 'content',
    description: '感染控制、加州針灸法規、倫理與病歷管理、職業安全與公共衛生',
    detailedInfo: '官方Domain 5 (CA Regulations, Public Health & Safety)：法律、道德、安全标准和专业行为',
    weight: 9, // ⚠️ 估算值，需参考官方2021年职业分析报告核实
    questionCount: 16, // 175 * 0.09 ≈ 16
    keyPoints: JSON.stringify([
      '【感染控制】',
      '• 针具消毒灭菌标准',
      '• 清洁针（Clean Needle Technique - CNT）',
      '• 标准预防措施',
      '• 医疗废弃物处理',
      '• OSHA血源性病原体标准',
      '',
      '【加州针灸法规】',
      '• Business & Professions Code相关条款',
      '• 针灸师执业范围',
      '• 执照更新要求',
      '• 继续教育要求',
      '• 禁止事项',
      '• 违规处罚',
      '',
      '【医疗记录管理】',
      '• 病历记录要求',
      '• HIPAA隐私保护',
      '• 知情同意（Informed Consent）',
      '• 强制报告义务（虐待、传染病等）',
      '• 病历保存期限',
      '',
      '【职业道德】',
      '• 医患关系界限',
      '• 专业行为准则',
      '• 利益冲突',
      '• 保密义务',
      '',
      '【环境安全】',
      '• 诊所安全标准',
      '• 紧急情况处理',
      '• ADA无障碍要求'
    ]),
    studyTips: '熟读California Business & Professions Code第123条（考试安全规定）。了解加州针灸师的执业范围和限制。重点掌握感染控制和Clean Needle Technique。',
    order: 7
  },

  // 考试复习部分（辅助分类，不计入官方5大领域）
  {
    name: '模拟试题',
    code: 'MOCK_EXAM',
    type: 'review',
    description: '历年真题及模拟题',
    detailedInfo: '通过大量练习提高答题速度和准确率',
    weight: 0,
    keyPoints: JSON.stringify([
      '熟悉考试题型和难度',
      '掌握答题技巧',
      '提高时间管理能力（5小时完成200题）',
      '查漏补缺，找出薄弱环节',
      '参考官方Appendix B的试题样本'
    ]),
    studyTips: '每周至少完成2-3套完整的模拟考试，严格按照考试时间进行。重点练习Appendix C-F中的参考表应用。',
    order: 8
  },
  {
    name: '重点知识点',
    code: 'KEY_POINTS',
    type: 'review',
    description: '高频考点梳理',
    detailedInfo: '总结归纳考试中的高频知识点',
    weight: 0,
    keyPoints: JSON.stringify([
      '各领域核心概念',
      '易混淆知识点对比',
      '记忆口诀和技巧',
      '官方参考表速查（脉诊、穴位、中药、方剂）'
    ]),
    studyTips: '制作思维导图和记忆卡片，每天复习核心知识点。重点关注占比最大的Domain 1和Domain 3。',
    order: 9
  },
  {
    name: '易错题解析',
    code: 'COMMON_MISTAKES',
    type: 'review',
    description: '常见易错题目及详解',
    detailedInfo: '避免重复犯错，提高正确率',
    weight: 0,
    keyPoints: JSON.stringify([
      '分析错误原因',
      '掌握正确的思路',
      '建立错题本',
      '定期回顾易错点',
      '注意中英文术语对照'
    ]),
    studyTips: '每次练习后及时整理错题，分析错误原因，定期回顾。特别注意穴位定位和脉诊术语的准确性。',
    order: 10
  }
]

// NCCAOM 详细分类数据
export const nccaomCategories = [
  // a. 考试组织部分
  {
    name: '考试基本信息',
    code: 'EXAM_INFO',
    type: 'organization',
    description: 'NCCAOM考试注册、费用、考试形式等基本信息',
    detailedInfo: '了解NCCAOM认证体系和考试安排',
    weight: 0,
    keyPoints: JSON.stringify([
      'NCCAOM认证的重要性和价值',
      '考试模块划分（可单独报考）',
      '考试注册流程',
      '考试费用明细',
      '考试预约和改期政策'
    ]),
    studyTips: '访问NCCAOM官网了解最新信息，规划好考试顺序和时间安排',
    order: 1
  },
  {
    name: '考试规则与要求',
    code: 'EXAM_RULES',
    type: 'organization',
    description: 'NCCAOM考试规则、评分标准、认证维护要求',
    detailedInfo: '遵守考试规则，了解认证维护要求',
    weight: 0,
    keyPoints: JSON.stringify([
      '各模块及格标准',
      '考试时间分配',
      '违规处理规定',
      'PDA学分要求（继续教育）',
      '认证更新周期'
    ]),
    studyTips: '了解PDA学分系统，提前规划继续教育课程',
    order: 2
  },

  // b. 考试内容部分（按NCCAOM模块划分）
  {
    name: '针灸基础理论',
    code: 'TCM_BASIC',
    type: 'content',
    description: 'Foundations of Oriental Medicine - 中医基础理论',
    detailedInfo: '考试占比约20%，涵盖中医基础理论体系',
    questionCount: 28,
    weight: 20,
    keyPoints: JSON.stringify([
      '阴阳五行理论及应用',
      '脏腑生理和病理',
      '气血津液精神',
      '经络系统',
      '病因病机',
      '五运六气'
    ]),
    studyTips: 'NCCAOM更注重理论的系统性，建议使用官方推荐教材学习',
    order: 1
  },
  {
    name: '中医诊断学',
    code: 'TCM_DIAG',
    type: 'content',
    description: 'Pattern Diagnosis - 辨证诊断',
    detailedInfo: '考试占比约18%，重点是辨证论治',
    questionCount: 25,
    weight: 18,
    keyPoints: JSON.stringify([
      '四诊方法',
      '八纲辨证',
      '脏腑辨证',
      '六经辨证',
      '卫气营血辨证',
      '三焦辨证',
      '证候的鉴别'
    ]),
    studyTips: '多做案例分析题，提高综合辨证能力',
    order: 2
  },
  {
    name: '穴位定位',
    code: 'POINT_LOCATION',
    type: 'content',
    description: 'Acupuncture Point Location - 针灸穴位定位（独立模块）',
    detailedInfo: '独立考试模块，占比100%（如单独报考）',
    questionCount: 30,
    weight: 21,
    keyPoints: JSON.stringify([
      '十四经穴的精确定位',
      '常用奇穴定位',
      '骨度分寸法',
      '体表标志定位',
      '简便取穴法',
      '特定穴的归类'
    ]),
    studyTips: '这是独立考试模块，需要非常精确的定位知识。建议使用NCCAOM官方推荐的穴位定位手册',
    order: 3
  },
  {
    name: '中药学',
    code: 'HERB',
    type: 'content',
    description: 'Chinese Herbology - 中药学',
    detailedInfo: '考试占比约17%，需掌握300味以上中药',
    questionCount: 24,
    weight: 17,
    keyPoints: JSON.stringify([
      '中药分类和功效',
      '药性理论（四气五味）',
      '配伍关系',
      '用药禁忌',
      '特殊药物的用法用量',
      '中药安全性',
      '方剂学基础'
    ]),
    studyTips: 'NCCAOM对中药安全性考察较多，注意妊娠禁忌和药物相互作用',
    order: 4
  },
  {
    name: '针灸治疗',
    code: 'ACU',
    type: 'content',
    description: 'Acupuncture Techniques & Treatment - 针灸技术与治疗',
    detailedInfo: '考试占比约15%，侧重临床应用',
    questionCount: 21,
    weight: 15,
    keyPoints: JSON.stringify([
      '针刺手法和得气',
      '特殊针法（头针、耳针等）',
      '灸法应用',
      '针灸处方原则',
      '常见病的针灸治疗',
      '针灸安全和消毒',
      '针灸不良反应处理'
    ]),
    studyTips: '注重临床应用和安全操作，了解针灸在美国的法规要求',
    order: 5
  },
  {
    name: '生物医学',
    code: 'BIOMEDICINE',
    type: 'content',
    description: 'Biomedicine - 生物医学基础',
    detailedInfo: '考试占比约9%，包括解剖、生理、病理等',
    questionCount: 12,
    weight: 9,
    keyPoints: JSON.stringify([
      '人体解剖学基础',
      '生理学要点',
      '病理学概念',
      '常见疾病的西医诊断',
      '实验室检查解读',
      '急救基础知识',
      '转诊指征'
    ]),
    studyTips: 'NCCAOM要求针灸师具备基本的生物医学知识，了解何时需要转诊',
    order: 6
  },

  // c. 考试复习部分
  {
    name: '模拟试题',
    code: 'MOCK_EXAM',
    type: 'review',
    description: 'NCCAOM官方模拟题和练习题',
    detailedInfo: '使用官方Study Guide和Practice Exams',
    keyPoints: JSON.stringify([
      '熟悉NCCAOM题型风格',
      '掌握多选题答题技巧',
      '练习案例分析题',
      '提高英文阅读速度'
    ]),
    studyTips: '强烈建议购买NCCAOM官方Study Guide，题型和难度最接近真题',
    order: 1
  },
  {
    name: '重点知识点',
    code: 'KEY_POINTS',
    type: 'review',
    description: 'NCCAOM考试高频考点',
    detailedInfo: '基于真题分析总结的核心知识点',
    keyPoints: JSON.stringify([
      '各模块核心概念',
      '中英文术语对照',
      '临床案例分析要点',
      'NCCAOM特色考点'
    ]),
    studyTips: '重点掌握NCCAOM与其他考试的不同之处',
    order: 2
  },
  {
    name: '易错题解析',
    code: 'COMMON_MISTAKES',
    type: 'review',
    description: 'NCCAOM考试常见错误分析',
    detailedInfo: '分析常见失分点，提高通过率',
    keyPoints: JSON.stringify([
      '术语理解误区',
      '辨证思路错误',
      '穴位定位偏差',
      '多选题陷阱'
    ]),
    studyTips: '注意中英文表达的差异，避免因语言问题失分',
    order: 3
  }
]
