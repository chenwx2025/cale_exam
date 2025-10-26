# 发布前检查清单 🚀

## ✅ 1. 构建状态
- **构建成功**: `npm run build` 完成，无错误
- **警告**: 有重复导入警告，不影响功能

## 🔧 2. 必须修复的问题

### A. 移除调试日志
**位置**: `pages/study-plans/index.vue` 第 172, 179, 182 行

```typescript
// 需要删除这些 console.log
console.log('[Study Plans] onActivated - refreshing data')
console.log('[Study Plans] Route changed:', { newPath, oldPath })
console.log('[Study Plans] Refreshing data after route change')
```

### B. 环境变量配置
生产环境必须设置：
```bash
DATABASE_URL="postgresql://..."
JWT_SECRET="your-secret"
JWT_REFRESH_SECRET="your-refresh-secret"
OPENAI_API_KEY="sk-..."
NODE_ENV="production"
```

## 🔍 3. 数据库准备

```bash
# 生成 Prisma Client
npx prisma generate

# 执行数据库迁移
npx prisma migrate deploy

# 或推送 schema
npx prisma db push
```

## 🔒 4. 安全检查

- [ ] 所有密钥存储在环境变量中 ✅
- [ ] 没有硬编码的密码 ✅
- [ ] API 端点有认证保护 ✅

## 📊 5. 性能检查

- [ ] Bundle 大小合理 (84KB gzipped) ✅
- [ ] 图片已优化 
- [ ] 数据库查询已优化 ✅

## 🧪 6. 功能测试

核心功能：
- [ ] 用户登录/注册
- [ ] 学习计划创建（测试即时显示）
- [ ] 答题功能
- [ ] 学习小组
- [ ] 笔记功能

## 📝 7. 部署步骤

```bash
# 1. 构建
npm run build

# 2. 启动（使用 PM2）
pm2 start .output/server/index.mjs --name cale-exam

# 3. 查看日志
pm2 logs cale-exam
```

## ⚠️ 8. 已知问题

1. **学习计划即时显示**: 添加了调试日志待测试，测试后需删除
2. **重复导入警告**: 不影响功能，可后续优化

## 🎯 9. 发布后监控

前 24 小时检查：
- 错误日志
- 响应时间
- 用户反馈
- 服务器资源

## 🔄 10. 回滚计划

```bash
# 备份当前版本
cp -r .output .output.backup

# 如需回滚
pm2 stop cale-exam
mv .output.backup .output
pm2 restart cale-exam
```

---

**立即执行**: 移除 `pages/study-plans/index.vue` 中的调试日志！
