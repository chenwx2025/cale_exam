<template>
  <div class="share-card-container">
    <!-- 分享卡片预览 -->
    <div
      ref="cardRef"
      :class="['share-card', `share-card-${type}`]"
      :style="cardStyle"
    >
      <!-- 背景渐变 -->
      <div class="card-bg-gradient"></div>

      <!-- 头部 -->
      <div class="card-header">
        <div class="card-logo">
          <div class="logo-icon">🎓</div>
          <div class="logo-text">
            <div class="app-name">CALE考试系统</div>
            <div class="exam-type">{{ examTypeText }}</div>
          </div>
        </div>
        <div class="card-date">{{ formattedDate }}</div>
      </div>

      <!-- 主内容 -->
      <div class="card-content">
        <!-- 成就分享 -->
        <div v-if="type === 'achievement'" class="achievement-content">
          <div class="achievement-icon">{{ achievementIcon }}</div>
          <h2 class="achievement-title">{{ title }}</h2>
          <p class="achievement-desc">{{ description }}</p>
          <div class="achievement-stats">
            <div v-for="stat in stats" :key="stat.label" class="stat-item">
              <div class="stat-value">{{ stat.value }}</div>
              <div class="stat-label">{{ stat.label }}</div>
            </div>
          </div>
        </div>

        <!-- 考试成绩分享 -->
        <div v-else-if="type === 'exam'" class="exam-content">
          <div class="exam-header">
            <h2 class="exam-title">{{ title }}</h2>
            <div class="exam-mode">{{ examMode }}</div>
          </div>

          <div class="score-display">
            <div class="score-circle" :class="scoreClass">
              <div class="score-value">{{ score }}%</div>
              <div class="score-label">{{ passed ? '通过' : '未通过' }}</div>
            </div>
          </div>

          <div class="exam-stats">
            <div class="stat-row">
              <span class="stat-label">答对题数</span>
              <span class="stat-value">{{ correctCount }} / {{ totalQuestions }}</span>
            </div>
            <div class="stat-row">
              <span class="stat-label">用时</span>
              <span class="stat-value">{{ timeSpentFormatted }}</span>
            </div>
            <div class="stat-row">
              <span class="stat-label">正确率</span>
              <span class="stat-value">{{ accuracy }}%</span>
            </div>
          </div>
        </div>

        <!-- 里程碑分享 -->
        <div v-else-if="type === 'milestone'" class="milestone-content">
          <div class="milestone-icon">🏆</div>
          <h2 class="milestone-title">{{ title }}</h2>
          <p class="milestone-desc">{{ description }}</p>
          <div class="milestone-stats">
            <div v-for="stat in stats" :key="stat.label" class="stat-item">
              <div class="stat-value">{{ stat.value }}</div>
              <div class="stat-label">{{ stat.label }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 底部 -->
      <div class="card-footer">
        <div class="user-info">
          <div class="user-avatar">{{ userInitial }}</div>
          <div class="user-name">{{ userName }}</div>
        </div>
        <div class="share-tip">扫码查看详情</div>
      </div>

      <!-- 装饰元素 -->
      <div class="decoration-dots"></div>
    </div>

    <!-- 分享操作按钮 -->
    <div v-if="showActions" class="share-actions">
      <button @click="downloadImage" class="action-btn download-btn">
        <span class="btn-icon">📥</span>
        <span>保存图片</span>
      </button>
      <button @click="copyLink" class="action-btn copy-btn">
        <span class="btn-icon">🔗</span>
        <span>复制链接</span>
      </button>
      <button @click="shareToSocial" class="action-btn share-btn">
        <span class="btn-icon">📤</span>
        <span>分享</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import html2canvas from 'html2canvas'

interface ShareCardProps {
  type: 'achievement' | 'exam' | 'milestone'
  title: string
  description?: string
  examType?: 'cale' | 'nccaom'
  userName?: string

  // 成就/里程碑数据
  achievementIcon?: string
  stats?: Array<{ label: string; value: string | number }>

  // 考试成绩数据
  score?: number
  passed?: boolean
  correctCount?: number
  totalQuestions?: number
  timeSpent?: number
  examMode?: string

  // 其他
  date?: Date | string
  showActions?: boolean
  shareId?: string
}

const props = withDefaults(defineProps<ShareCardProps>(), {
  examType: 'cale',
  userName: '匿名用户',
  achievementIcon: '🎉',
  showActions: true,
  stats: () => [],
  date: () => new Date()
})

const emit = defineEmits<{
  download: [blob: Blob]
  share: [shareId: string]
}>()

const cardRef = ref<HTMLElement | null>(null)
const isGenerating = ref(false)

// 计算属性
const examTypeText = computed(() => {
  return props.examType === 'cale' ? 'California Acupuncture' : 'NCCAOM'
})

const formattedDate = computed(() => {
  const date = new Date(props.date)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
})

const userInitial = computed(() => {
  return props.userName?.charAt(0).toUpperCase() || 'U'
})

const scoreClass = computed(() => {
  if (!props.score) return ''
  if (props.score >= 85) return 'score-excellent'
  if (props.score >= 75) return 'score-good'
  if (props.score >= 60) return 'score-pass'
  return 'score-fail'
})

const accuracy = computed(() => {
  if (!props.correctCount || !props.totalQuestions) return 0
  return Math.round((props.correctCount / props.totalQuestions) * 100)
})

const timeSpentFormatted = computed(() => {
  if (!props.timeSpent) return '0分钟'
  const minutes = Math.floor(props.timeSpent / 60)
  const seconds = props.timeSpent % 60
  if (minutes > 0) {
    return `${minutes}分${seconds}秒`
  }
  return `${seconds}秒`
})

const cardStyle = computed(() => {
  const gradients = {
    achievement: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    exam: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    milestone: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
  }
  return {
    '--card-gradient': gradients[props.type]
  }
})

// 生成图片
const generateImage = async (): Promise<Blob | null> => {
  if (!cardRef.value || isGenerating.value) return null

  isGenerating.value = true

  try {
    const canvas = await html2canvas(cardRef.value, {
      scale: 2,
      backgroundColor: '#ffffff',
      logging: false,
      useCORS: true
    })

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob)
      }, 'image/png')
    })
  } catch (error) {
    console.error('Failed to generate image:', error)
    return null
  } finally {
    isGenerating.value = false
  }
}

// 下载图片
const downloadImage = async () => {
  const blob = await generateImage()
  if (!blob) {
    alert('生成图片失败，请重试')
    return
  }

  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${props.title}-${Date.now()}.png`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)

  emit('download', blob)
}

// 复制链接
const copyLink = async () => {
  if (!props.shareId) {
    alert('分享链接生成中，请稍候...')
    return
  }

  const config = useRuntimeConfig()
  const appUrl = config.public.appUrl || window.location.origin
  const shareUrl = `${appUrl}/share/${props.shareId}`

  try {
    await navigator.clipboard.writeText(shareUrl)
    alert('链接已复制到剪贴板！')
  } catch (error) {
    // 降级方案
    const textArea = document.createElement('textarea')
    textArea.value = shareUrl
    document.body.appendChild(textArea)
    textArea.select()
    document.execCommand('copy')
    document.body.removeChild(textArea)
    alert('链接已复制到剪贴板！')
  }
}

// 分享到社交媒体
const shareToSocial = async () => {
  if (!props.shareId) {
    alert('正在生成分享链接...')
    emit('share', '')
    return
  }

  const config = useRuntimeConfig()
  const appUrl = config.public.appUrl || window.location.origin
  const shareUrl = `${appUrl}/share/${props.shareId}`
  const shareText = `${props.title} - ${props.description || 'CALE考试系统'}`

  // 检查是否支持 Web Share API
  if (navigator.share) {
    try {
      await navigator.share({
        title: props.title,
        text: shareText,
        url: shareUrl
      })
    } catch (error) {
      console.log('Share cancelled or failed:', error)
    }
  } else {
    // 显示分享选项
    showShareOptions(shareUrl, shareText)
  }
}

// 显示分享选项
const showShareOptions = (url: string, text: string) => {
  const options = [
    {
      name: '微信',
      action: () => {
        alert('请使用微信扫一扫功能分享此链接')
      }
    },
    {
      name: 'Twitter',
      action: () => {
        window.open(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
          '_blank'
        )
      }
    },
    {
      name: 'Facebook',
      action: () => {
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
          '_blank'
        )
      }
    }
  ]

  // 简单的选项显示（实际项目中可以用更好的UI）
  const choice = confirm('选择分享平台:\n1. 微信\n2. Twitter\n3. Facebook\n\n点击确定复制链接')
  if (choice) {
    copyLink()
  }
}

// 暴露方法给父组件
defineExpose({
  generateImage,
  downloadImage
})
</script>

<style scoped>
.share-card-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  align-items: center;
}

/* 卡片样式 */
.share-card {
  position: relative;
  width: 600px;
  min-height: 400px;
  background: white;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  padding: 2rem;
  display: flex;
  flex-direction: column;
}

.card-bg-gradient {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 200px;
  background: var(--card-gradient);
  opacity: 0.1;
  z-index: 0;
}

/* 头部 */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  position: relative;
  z-index: 1;
  margin-bottom: 2rem;
}

.card-logo {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.logo-icon {
  font-size: 2rem;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--card-gradient);
  border-radius: 12px;
}

.logo-text {
  display: flex;
  flex-direction: column;
}

.app-name {
  font-size: 1.1rem;
  font-weight: 700;
  color: #1a202c;
}

.exam-type {
  font-size: 0.75rem;
  color: #718096;
  margin-top: 2px;
}

.card-date {
  font-size: 0.875rem;
  color: #718096;
}

/* 主内容区 */
.card-content {
  flex: 1;
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

/* 成就内容 */
.achievement-content {
  text-align: center;
}

.achievement-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.achievement-title {
  font-size: 2rem;
  font-weight: 700;
  color: #1a202c;
  margin-bottom: 0.5rem;
}

.achievement-desc {
  font-size: 1rem;
  color: #4a5568;
  margin-bottom: 2rem;
}

.achievement-stats {
  display: flex;
  justify-content: center;
  gap: 3rem;
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  background: var(--card-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 0.5rem;
}

.stat-label {
  font-size: 0.875rem;
  color: #718096;
}

/* 考试内容 */
.exam-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.exam-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.exam-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1a202c;
}

.exam-mode {
  font-size: 0.875rem;
  color: #718096;
  padding: 0.25rem 0.75rem;
  background: #f7fafc;
  border-radius: 12px;
}

.score-display {
  display: flex;
  justify-content: center;
  margin: 1rem 0;
}

.score-circle {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 8px solid;
  transition: all 0.3s ease;
}

.score-excellent {
  border-color: #48bb78;
  background: #f0fff4;
}

.score-good {
  border-color: #4299e1;
  background: #ebf8ff;
}

.score-pass {
  border-color: #ed8936;
  background: #fffaf0;
}

.score-fail {
  border-color: #f56565;
  background: #fff5f5;
}

.score-value {
  font-size: 2.5rem;
  font-weight: 700;
  color: #1a202c;
}

.score-label {
  font-size: 0.875rem;
  font-weight: 600;
  margin-top: 0.25rem;
}

.exam-stats {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  background: #f7fafc;
  padding: 1rem 1.5rem;
  border-radius: 12px;
}

.stat-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.875rem;
}

.stat-row .stat-label {
  color: #718096;
}

.stat-row .stat-value {
  color: #1a202c;
  font-weight: 600;
}

/* 里程碑内容 */
.milestone-content {
  text-align: center;
}

.milestone-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.milestone-title {
  font-size: 2rem;
  font-weight: 700;
  color: #1a202c;
  margin-bottom: 0.5rem;
}

.milestone-desc {
  font-size: 1rem;
  color: #4a5568;
  margin-bottom: 2rem;
}

.milestone-stats {
  display: flex;
  justify-content: center;
  gap: 3rem;
}

/* 底部 */
.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  z-index: 1;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e2e8f0;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--card-gradient);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.125rem;
}

.user-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: #1a202c;
}

.share-tip {
  font-size: 0.75rem;
  color: #a0aec0;
}

/* 装饰元素 */
.decoration-dots {
  position: absolute;
  top: 50%;
  right: 2rem;
  width: 80px;
  height: 80px;
  background: var(--card-gradient);
  opacity: 0.05;
  border-radius: 50%;
  z-index: 0;
}

/* 分享操作按钮 */
.share-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.download-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.download-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.copy-btn {
  background: #f7fafc;
  color: #2d3748;
  border: 2px solid #e2e8f0;
}

.copy-btn:hover {
  background: #edf2f7;
  border-color: #cbd5e0;
}

.share-btn {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
}

.share-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(79, 172, 254, 0.4);
}

.btn-icon {
  font-size: 1.125rem;
}

/* 响应式 */
@media (max-width: 768px) {
  .share-card {
    width: 100%;
    max-width: 500px;
    padding: 1.5rem;
  }

  .achievement-stats,
  .milestone-stats {
    gap: 2rem;
  }

  .share-actions {
    flex-direction: column;
    width: 100%;
  }

  .action-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
