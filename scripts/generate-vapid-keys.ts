/**
 * 生成 VAPID 密钥对
 * 用于 Web Push 通知
 *
 * 运行: npx tsx scripts/generate-vapid-keys.ts
 */

import webpush from 'web-push'

console.log('🔐 生成 VAPID 密钥对...\n')

const vapidKeys = webpush.generateVAPIDKeys()

console.log('✅ VAPID 密钥生成成功！\n')
console.log('请将以下内容添加到 .env 文件中：\n')
console.log('========================================')
console.log(`VAPID_PUBLIC_KEY="${vapidKeys.publicKey}"`)
console.log(`VAPID_PRIVATE_KEY="${vapidKeys.privateKey}"`)
console.log(`VAPID_SUBJECT="mailto:admin@cale-exam.com"`)
console.log('========================================\n')
console.log('⚠️  注意：请妥善保管私钥，不要提交到版本控制系统！\n')
