# CALE/NCCAOM 考试系统 - 快速启动指南

## 🚀 快速开始

### 1. 安装依赖
```bash
npm install
```

### 2. 初始化数据库
```bash
# 同步数据库模型
npx prisma db push

# (可选) 查看数据库
npx prisma studio
```

### 3. 创建管理员账号
```bash
# 运行脚本创建管理员
npx tsx scripts/create-admin.ts
```

### 4. 启动开发服务器
```bash
npm run dev
```

访问: `http://localhost:3000`

---

## 📂 主要页面路径

### 用户端
- `/` - 首页 (选择考试类型)
- `/login` - 登录
- `/register` - 注册
- `/outline` - 考试大纲
- `/practice` - 练习题目
- `/wrong-questions` - 错题本
- `/study-plan` - 创建学习计划
- `/study-plans` - 我的学习计划
- `/stats` - 学习统计
- `/exam/config` - 配置新考试
- `/exam/question-sets` - 题目集列表
- `/notifications` - 消息中心
- `/notifications/settings` - 提醒设置
- `/user/profile` - 个人中心

### 管理后台
- `/admin` - 管理首页
- `/admin/users` - 用户管理
- `/admin/questions` - 题目管理
- `/admin/questions/import` - 批量导入
- `/admin/categories` - 分类管理
- `/admin/analytics` - 数据分析

---

## 🔑 默认账号

### 管理员账号
运行 `npx tsx scripts/create-admin.ts` 后会创建:
- 邮箱: `admin@example.com`
- 密码: `Admin123!`

### 测试用户
可以通过注册页面创建测试账号

---

## 📊 核心功能使用

### 1. 学习流程
```
注册登录 → 选择考试类型 → 查看大纲 → 创建学习计划 → 开始练习 → 查看统计
```

### 2. 错题本
- 答错的题目自动加入错题本
- 可以针对性复习错题
- 支持移除已掌握的题目

### 3. 学习提醒
1. 访问 `/notifications/settings`
2. 开启"学习提醒"
3. 设置提醒时间 (如 19:00)
4. 选择提醒日期 (工作日/每天/自定义)
5. 设置每日目标 (学习时长、答题数量)
6. 保存设置

系统会在设定时间自动发送提醒

### 4. 模拟考试
1. 访问 `/exam/config`
2. 选择考试类型和分类
3. 设置题目数量和难度
4. 开始考试
5. 查看成绩和解析

### 5. 管理后台

#### 添加题目
1. 登录管理员账号
2. 访问 `/admin/questions`
3. 点击"添加题目"
4. 填写题目信息
5. 保存

#### 批量导入
1. 访问 `/admin/questions/import`
2. 下载模板 (CSV 或 JSON)
3. 填写题目数据
4. 上传文件
5. 预览并导入

#### 分类管理
1. 访问 `/admin/categories`
2. 可以创建主分类和子分类
3. 支持树形结构展示
4. 删除前会检查依赖

#### 数据分析
访问 `/admin/analytics` 查看:
- 用户增长趋势
- 每日活跃用户
- 题目难度分布
- 分类答题统计
- 考试通过率
- 每日考试数量
- 订阅统计

---

## 🔧 环境配置

### 环境变量 (.env)
```env
# JWT 密钥 (生产环境必须更改)
JWT_SECRET=your-super-secret-key-change-this-in-production
JWT_REFRESH_SECRET=your-refresh-secret-key

# 数据库
DATABASE_URL=file:./prisma/dev.db

# 邮件配置 (可选)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-password
FROM_EMAIL=noreply@cale-exam.com
FROM_NAME=CALE考试系统
```

---

## 📦 数据库管理

### 查看数据库
```bash
npx prisma studio
```

### 重置数据库
```bash
# 删除数据库文件
rm prisma/dev.db

# 重新创建
npx prisma db push

# 重新创建管理员
npx tsx scripts/create-admin.ts
```

### 数据库备份
```bash
# 备份
cp prisma/dev.db prisma/dev.db.backup

# 恢复
cp prisma/dev.db.backup prisma/dev.db
```

---

## 🧪 测试数据

### 创建测试题目
可以通过管理后台批量导入功能导入测试数据。

#### CSV 格式示例
```csv
categoryCode,question,difficulty,questionType,explanation,options,correctAnswer,examType
ACU-101,针灸的基本理论是什么？,medium,single,针灸是基于经络理论的传统中医疗法。,"A. 经络理论|B. 脏腑理论|C. 阴阳理论|D. 五行理论",A,CALE
```

#### JSON 格式示例
```json
{
  "examType": "CALE",
  "questions": [
    {
      "categoryCode": "ACU-101",
      "question": "针灸的基本理论是什么？",
      "difficulty": "medium",
      "questionType": "single",
      "explanation": "针灸是基于经络理论的传统中医疗法。",
      "options": [
        { "label": "A", "content": "经络理论", "isCorrect": true },
        { "label": "B", "content": "脏腑理论", "isCorrect": false }
      ]
    }
  ]
}
```

---

## 🎯 常见任务

### 修改管理员密码
1. 登录管理员账号
2. 访问 `/user/profile`
3. 点击"修改密码"

### 忘记密码
1. 点击登录页面的"忘记密码"
2. 输入邮箱地址
3. 开发环境下会在控制台显示重置链接
4. 点击链接设置新密码

### 查看学习统计
1. 登录后访问 `/stats`
2. 查看学习时长、答题数量、正确率等
3. 查看分类掌握情况

### 配置学习提醒
1. 访问 `/notifications/settings`
2. 设置提醒时间和频率
3. 设置每日学习目标
4. 保存配置

---

## 🚀 生产部署

### 构建生产版本
```bash
npm run build
```

### 启动生产服务器
```bash
npm run start
```

### 使用 PM2 (推荐)
```bash
# 安装 PM2
npm install -g pm2

# 启动应用
pm2 start npm --name "cale-exam" -- start

# 查看状态
pm2 status

# 查看日志
pm2 logs cale-exam

# 重启
pm2 restart cale-exam
```

### Docker 部署
```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npx prisma generate
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
```

---

## 🔍 故障排除

### 数据库连接错误
```bash
# 检查数据库文件是否存在
ls -la prisma/dev.db

# 重新推送模型
npx prisma db push
```

### node-cron 未运行
检查服务器启动日志是否显示:
```
[Scheduler] ✅ Notification scheduler started successfully
```

### 通知未发送
1. 检查用户通知设置是否开启
2. 检查提醒时间是否正确
3. 查看服务器日志

### JWT 错误
确保 `.env` 文件中设置了:
```
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret
```

---

## 📚 开发文档

- `README.md` - 项目说明
- `PROJECT_COMPLETION_SUMMARY.md` - 完整项目总结
- `LEARNING_REMINDER_COMPLETE.md` - 学习提醒系统文档
- `PASSWORD_RESET_EMAIL_VERIFICATION_COMPLETE.md` - 认证功能文档
- `PHASE4_COMPLETE_100.md` - Phase 4 完成报告

---

## 💡 技术栈

- **前端**: Nuxt 3 + Vue 3 + TypeScript + Tailwind CSS
- **后端**: Nitro + Prisma + SQLite
- **认证**: JWT + bcrypt
- **定时任务**: node-cron
- **图表**: Chart.js

---

## 🎉 开始使用

```bash
# 克隆项目
git clone <repository-url>
cd cale_exam

# 安装依赖
npm install

# 初始化数据库
npx prisma db push

# 创建管理员
npx tsx scripts/create-admin.ts

# 启动开发服务器
npm run dev

# 访问应用
open http://localhost:3000
```

---

## 📞 获取帮助

如果遇到问题:
1. 查看文档目录中的相关文档
2. 检查服务器日志
3. 查看浏览器控制台
4. 提交 Issue 到项目仓库

---

**祝您使用愉快！Good luck with your exam preparation! 🎓**
