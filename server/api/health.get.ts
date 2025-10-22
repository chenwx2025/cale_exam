/**
 * 健康检查 API
 * 用于容器健康检查和监控
 */

import prisma from '../utils/prisma'

export default defineEventHandler(async (event) => {
  try {
    // 检查数据库连接
    await prisma.$queryRaw`SELECT 1`

    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0',
      services: {
        database: 'connected',
        application: 'running'
      }
    }
  } catch (error: any) {
    // 返回503状态码表示服务不健康
    setResponseStatus(event, 503)

    return {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message,
      services: {
        database: 'disconnected',
        application: 'running'
      }
    }
  }
})
