/**
 * PM2 生产环境配置文件
 * 用于在 VPS/云服务器上运行应用
 *
 * 使用方法:
 * - 启动: pm2 start ecosystem.config.js --env production
 * - 重启: pm2 restart cale-exam
 * - 停止: pm2 stop cale-exam
 * - 查看日志: pm2 logs cale-exam
 * - 监控: pm2 monit
 */

module.exports = {
  apps: [{
    name: 'cale-exam',
    script: '.output/server/index.mjs',

    // 实例配置
    instances: 'max',  // 使用所有CPU核心
    exec_mode: 'cluster',  // 集群模式

    // 环境变量
    env_production: {
      NODE_ENV: 'production',
      PORT: 3001
    },

    // 日志配置
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,

    // 自动重启配置
    autorestart: true,
    max_restarts: 10,
    min_uptime: '10s',
    max_memory_restart: '500M',

    // 监控配置
    watch: false,  // 生产环境不建议启用watch

    // 优雅关闭
    kill_timeout: 5000,
    wait_ready: true,
    listen_timeout: 10000,

    // Cron 重启（可选 - 每天凌晨4点重启）
    // cron_restart: '0 4 * * *',

    // 错误处理
    exp_backoff_restart_delay: 100
  }]
}
