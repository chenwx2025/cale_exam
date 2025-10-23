// This file documents all remaining Chinese text replacements needed
// Use this as reference for manual replacements

const replacements = [
  // ID Requirements Reminder
  { line: ~417, old: "重要提醒", new: "$t('outline.testDay.idRequirements.reminder.title')" },
  { old: "照片必须与本人相符，证件姓名必须与报名表一致", new: "$t('outline.testDay.idRequirements.reminder.photoMatch')" },
  { old: "如最近更改姓名，需提前联系PSI确认", new: "$t('outline.testDay.idRequirements.reminder.nameChange')" },
  { old: "如无法提供所需证件，须提前<strong>3周</strong>致电 (916) 515-5200", new: "$t('outline.testDay.idRequirements.reminder.noId3Weeks')" },
  { old: "未提供有效证件将被视为错过预约，<strong class=\"text-red-700\">费用丧失</strong>", new: "$t('outline.testDay.idRequirements.reminder.missedAppointment')" },

  // Security Procedures
  { old: "安全检查流程", new: "$t('outline.testDay.securityProcedures.title')" },
  { old: "指纹采集", new: "$t('outline.testDay.securityProcedures.fingerprint.title')" },
  { old: "报到时采集拇指指纹，进出考场、使用洗手间后返回均需验证匹配", new: "$t('outline.testDay.securityProcedures.fingerprint.description')" },
  { old: "清空口袋", new: "$t('outline.testDay.securityProcedures.emptyPockets.title')" },
  { old: "登记时询问是否持有违禁物品，要求清空所有口袋接受检查", new: "$t('outline.testDay.securityProcedures.emptyPockets.description')" },
  { old: "签署安全协议", new: "$t('outline.testDay.securityProcedures.signAgreement.title')" },
  { old: "进入考场前必须签署保安协议，承诺遵守所有考试规定", new: "$t('outline.testDay.securityProcedures.signAgreement.description')" },
  { old: "全程录像监控", new: "$t('outline.testDay.securityProcedures.videoMonitoring.title')" },
  { old: "考场全程录像，禁止与其他考生交流，违规将面临法律诉讼", new: "$t('outline.testDay.securityProcedures.videoMonitoring.description')" },

  // Other Notes
  { old: "其他注意事项", new: "$t('outline.testDay.securityProcedures.otherNotes.title')" },

  // Location
  { old: "PSI Irvine 考试中心", new: "$t('outline.location.title')" },
  { old: "Google地图", new: "$t('outline.location.googleMaps')" },
  { old: "考场地址", new: "$t('outline.location.address.title')" },
  { old: "停车后指引", new: "$t('outline.location.afterParking.title')" },
  { old: "驾车指引", new: "$t('outline.location.directions.title')" },

  // Prohibited Items
  { old: "禁止携带物品", new: "$t('outline.prohibited.title')" },
  { old: "手机、电子设备、计算器", new: "$t('outline.prohibited.electronics')" },
  { old: "书籍、笔记、学习材料", new: "$t('outline.prohibited.books')" },
  { old: "食品饮料（包括水）", new: "$t('outline.prohibited.foodDrink')" },
  { old: "钱包、背包、外套（需寄存）", new: "$t('outline.prohibited.bags')" },

  // Exam Rules
  { old: "考场安全规定", new: "$t('outline.examRules.title')" },

  // Legal Notice
  { old: "重要法律声明", new: "$t('outline.legalNotice.title')" },
  { old: "加州Business & Professions Code第123条规定：", new: "$t('outline.legalNotice.lawReference')" },
  { old: "违反或试图违反任何考试规定的行为均属轻罪，包括但不限于：", new: "$t('outline.legalNotice.description')" },

  // Categories
  { old: "考试内容分布", new: "$t('outline.categories.distribution')" },
  { old: "占比", new: "$t('outline.categories.weight')" },
  { old: "实际题库:", new: "$t('outline.categories.details.actualQuestionBank')" },
  { old: "预计考试:", new: "$t('outline.categories.details.estimatedExam')" },
  { old: "重点知识点", new: "$t('outline.categories.details.keyPoints')" },
  { old: "学习建议", new: "$t('outline.categories.details.studyTips')" },
  { old: "子分类", new: "$t('outline.categories.details.subCategories')" },
  { old: "开始学习", new: "$t('outline.categories.details.startLearning')" },

  // Tabs
  { old: "a. 考试组织部分", new: "$t('outline.categories.tabs.organization')" },
  { old: "b. 考试内容部分", new: "$t('outline.categories.tabs.content')" },
  { old: "c. 考试复习部分", new: "$t('outline.categories.tabs.review')" },

  // Loading & No Data
  { old: "加载中...", new: "$t('outline.loading')" },
  { old: "暂无分类数据", new: "$t('outline.noData')" }
];

console.log(`Total replacements needed: ${replacements.length}`);
