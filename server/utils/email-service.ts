import nodemailer from 'nodemailer'
import type { Transporter } from 'nodemailer'

/**
 * 邮件服务
 * 提供统一的邮件发送接口
 */

// 邮件配置
const config = {
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
  },
}

// 发件人信息
const FROM = {
  name: process.env.SMTP_FROM_NAME || 'CALE考试系统',
  email: process.env.SMTP_FROM_EMAIL || 'noreply@cale-exam.com',
}

// 应用配置
const APP_URL = process.env.APP_URL || 'http://localhost:3000'
const APP_NAME = process.env.APP_NAME || 'CALE考试系统'

// 创建邮件传输器（懒加载）
let transporter: Transporter | null = null

function getTransporter(): Transporter {
  if (!transporter) {
    transporter = nodemailer.createTransporter(config)
  }
  return transporter
}

/**
 * 发送邮件的基础函数
 */
export async function sendEmail({
  to,
  subject,
  html,
  text,
}: {
  to: string
  subject: string
  html: string
  text?: string
}) {
  try {
    // 检查是否配置了SMTP
    if (!config.auth.user || !config.auth.pass) {
      console.warn('[Email] SMTP not configured, skipping email send')
      console.log('[Email] Would send:', { to, subject })
      return {
        success: false,
        message: 'SMTP not configured',
      }
    }

    const mailOptions = {
      from: `"${FROM.name}" <${FROM.email}>`,
      to,
      subject,
      html,
      text: text || stripHtml(html), // 自动生成纯文本版本
    }

    const info = await getTransporter().sendMail(mailOptions)

    console.log('[Email] Sent successfully:', {
      to,
      subject,
      messageId: info.messageId,
    })

    return {
      success: true,
      messageId: info.messageId,
    }
  } catch (error) {
    console.error('[Email] Failed to send:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * 发送验证邮箱邮件
 */
export async function sendVerificationEmail(
  to: string,
  verificationToken: string
) {
  const verificationUrl = `${APP_URL}/verify-email?token=${verificationToken}`

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>验证您的邮箱</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .container {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 10px;
      padding: 40px;
      color: white;
    }
    .content {
      background: white;
      color: #333;
      border-radius: 8px;
      padding: 30px;
      margin-top: 20px;
    }
    .button {
      display: inline-block;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 12px 30px;
      text-decoration: none;
      border-radius: 6px;
      font-weight: bold;
      margin: 20px 0;
    }
    .footer {
      text-align: center;
      color: #ccc;
      font-size: 12px;
      margin-top: 30px;
    }
    .token {
      background: #f5f5f5;
      padding: 10px;
      border-radius: 4px;
      font-family: monospace;
      word-break: break-all;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>欢迎加入${APP_NAME}！</h1>
    <p>感谢您注册我们的学习平台。</p>
  </div>

  <div class="content">
    <h2>验证您的邮箱</h2>
    <p>您好！</p>
    <p>请点击下面的按钮来验证您的邮箱地址：</p>

    <a href="${verificationUrl}" class="button">验证邮箱</a>

    <p>或者复制以下链接到浏览器：</p>
    <div class="token">${verificationUrl}</div>

    <p><strong>注意：</strong>此链接将在 24 小时后过期。</p>

    <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">

    <p style="color: #666; font-size: 14px;">
      如果您没有注册${APP_NAME}账户，请忽略此邮件。
    </p>
  </div>

  <div class="footer">
    <p>&copy; 2025 ${APP_NAME}. All rights reserved.</p>
  </div>
</body>
</html>
  `

  return sendEmail({
    to,
    subject: `验证您的${APP_NAME}账户`,
    html,
  })
}

/**
 * 发送密码重置邮件
 */
export async function sendPasswordResetEmail(
  to: string,
  resetToken: string
) {
  const resetUrl = `${APP_URL}/reset-password?token=${resetToken}`

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>重置您的密码</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .container {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 10px;
      padding: 40px;
      color: white;
    }
    .content {
      background: white;
      color: #333;
      border-radius: 8px;
      padding: 30px;
      margin-top: 20px;
    }
    .button {
      display: inline-block;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 12px 30px;
      text-decoration: none;
      border-radius: 6px;
      font-weight: bold;
      margin: 20px 0;
    }
    .warning {
      background: #fff3cd;
      border-left: 4px solid #ffc107;
      padding: 12px;
      margin: 20px 0;
    }
    .footer {
      text-align: center;
      color: #ccc;
      font-size: 12px;
      margin-top: 30px;
    }
    .token {
      background: #f5f5f5;
      padding: 10px;
      border-radius: 4px;
      font-family: monospace;
      word-break: break-all;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>重置密码</h1>
    <p>我们收到了您的密码重置请求。</p>
  </div>

  <div class="content">
    <h2>设置新密码</h2>
    <p>您好！</p>
    <p>请点击下面的按钮来重置您的密码：</p>

    <a href="${resetUrl}" class="button">重置密码</a>

    <p>或者复制以下链接到浏览器：</p>
    <div class="token">${resetUrl}</div>

    <div class="warning">
      <strong>⚠️ 重要提示：</strong>
      <ul style="margin: 5px 0; padding-left: 20px;">
        <li>此链接将在 1 小时后过期</li>
        <li>链接只能使用一次</li>
        <li>重置密码后，您需要使用新密码重新登录</li>
      </ul>
    </div>

    <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">

    <p style="color: #666; font-size: 14px;">
      <strong>如果您没有请求重置密码，</strong>请忽略此邮件，您的账户仍然是安全的。
    </p>
  </div>

  <div class="footer">
    <p>&copy; 2025 ${APP_NAME}. All rights reserved.</p>
  </div>
</body>
</html>
  `

  return sendEmail({
    to,
    subject: `重置您的${APP_NAME}密码`,
    html,
  })
}

/**
 * 发送欢迎邮件
 */
export async function sendWelcomeEmail(to: string, username: string) {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>欢迎加入${APP_NAME}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .container {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 10px;
      padding: 40px;
      color: white;
      text-align: center;
    }
    .content {
      background: white;
      color: #333;
      border-radius: 8px;
      padding: 30px;
      margin-top: 20px;
    }
    .button {
      display: inline-block;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 12px 30px;
      text-decoration: none;
      border-radius: 6px;
      font-weight: bold;
      margin: 20px 0;
    }
    .features {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin: 30px 0;
    }
    .feature {
      text-align: center;
      padding: 15px;
      background: #f9f9f9;
      border-radius: 8px;
    }
    .feature-icon {
      font-size: 32px;
      margin-bottom: 10px;
    }
    .footer {
      text-align: center;
      color: #ccc;
      font-size: 12px;
      margin-top: 30px;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>🎉 欢迎加入${APP_NAME}！</h1>
    <p>您的学习之旅从这里开始</p>
  </div>

  <div class="content">
    <h2>您好，${username}！</h2>
    <p>感谢您注册${APP_NAME}。我们很高兴能够陪伴您的考试准备之旅！</p>

    <div class="features">
      <div class="feature">
        <div class="feature-icon">📚</div>
        <h3>海量题库</h3>
        <p>覆盖所有考点</p>
      </div>
      <div class="feature">
        <div class="feature-icon">🎯</div>
        <h3>模拟考试</h3>
        <p>真实考试体验</p>
      </div>
      <div class="feature">
        <div class="feature-icon">📊</div>
        <h3>学习统计</h3>
        <p>追踪学习进度</p>
      </div>
      <div class="feature">
        <div class="feature-icon">🔔</div>
        <h3>智能提醒</h3>
        <p>保持学习习惯</p>
      </div>
    </div>

    <a href="${APP_URL}" class="button">开始学习</a>

    <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">

    <h3>💡 快速开始</h3>
    <ol style="text-align: left;">
      <li>完善您的个人信息</li>
      <li>选择您要准备的考试类型</li>
      <li>创建学习计划</li>
      <li>开始练习题目</li>
      <li>参加模拟考试</li>
    </ol>

    <p style="color: #666; font-size: 14px; margin-top: 30px;">
      如有任何问题，请随时联系我们的支持团队。祝您学习愉快，考试顺利！
    </p>
  </div>

  <div class="footer">
    <p>&copy; 2025 ${APP_NAME}. All rights reserved.</p>
  </div>
</body>
</html>
  `

  return sendEmail({
    to,
    subject: `欢迎加入${APP_NAME} - 开启您的学习之旅`,
    html,
  })
}

/**
 * 发送学习提醒邮件
 */
export async function sendStudyReminderEmail(
  to: string,
  username: string,
  reminderMessage: string
) {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>学习提醒</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .container {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 10px;
      padding: 40px;
      color: white;
      text-align: center;
    }
    .content {
      background: white;
      color: #333;
      border-radius: 8px;
      padding: 30px;
      margin-top: 20px;
    }
    .button {
      display: inline-block;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 12px 30px;
      text-decoration: none;
      border-radius: 6px;
      font-weight: bold;
      margin: 20px 0;
    }
    .reminder-box {
      background: #e3f2fd;
      border-left: 4px solid #2196f3;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .footer {
      text-align: center;
      color: #ccc;
      font-size: 12px;
      margin-top: 30px;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>📚 学习提醒</h1>
    <p>该学习啦！</p>
  </div>

  <div class="content">
    <h2>您好，${username}！</h2>

    <div class="reminder-box">
      <p style="margin: 0; font-size: 16px;">
        ${reminderMessage}
      </p>
    </div>

    <p>坚持每天学习，您将会看到明显的进步！</p>

    <a href="${APP_URL}/practice" class="button">开始学习</a>

    <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">

    <p style="color: #666; font-size: 12px;">
      不想再收到学习提醒？<a href="${APP_URL}/notifications/settings" style="color: #667eea;">管理提醒设置</a>
    </p>
  </div>

  <div class="footer">
    <p>&copy; 2025 ${APP_NAME}. All rights reserved.</p>
  </div>
</body>
</html>
  `

  return sendEmail({
    to,
    subject: `📚 ${APP_NAME} - 学习提醒`,
    html,
  })
}

/**
 * 辅助函数：从HTML中提取纯文本
 */
function stripHtml(html: string): string {
  return html
    .replace(/<style[^>]*>.*<\/style>/gm, '')
    .replace(/<script[^>]*>.*<\/script>/gm, '')
    .replace(/<[^>]+>/gm, '')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * 测试邮件配置
 */
export async function testEmailConfig(): Promise<boolean> {
  try {
    if (!config.auth.user || !config.auth.pass) {
      console.warn('[Email] SMTP not configured')
      return false
    }

    await getTransporter().verify()
    console.log('[Email] Configuration is valid')
    return true
  } catch (error) {
    console.error('[Email] Configuration test failed:', error)
    return false
  }
}
