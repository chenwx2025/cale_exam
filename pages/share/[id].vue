<template>
  <div class="share-page">
    <!-- 加载中 -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>加载分享内容中...</p>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="error-container">
      <div class="error-icon">⚠️</div>
      <h2>{{ error }}</h2>
      <p>该分享可能已过期或不存在</p>
      <NuxtLink to="/" class="back-home-btn">返回首页</NuxtLink>
    </div>

    <!-- 分享内容 -->
    <div v-else-if="share" class="share-content">
      <!-- 页面头部 -->
      <div class="page-header">
        <NuxtLink to="/" class="logo-link">
          <div class="logo">🎓 CALE考试系统</div>
        </NuxtLink>
        <div class="header-actions">
          <span class="view-count">👁️ {{ share.viewCount }} 次浏览</span>
        </div>
      </div>

      <!-- 成就分享卡片 -->
      <ShareCard
        v-if="share.type === 'achievement'"
        type="achievement"
        :title="share.title"
        :description="share.description"
        :exam-type="shareContent.examType"
        :user-name="shareContent.userName"
        :achievement-icon="shareContent.achievementIcon"
        :stats="shareContent.stats"
        :date="share.createdAt"
        :share-id="share.id"
        :show-actions="true"
      />

      <!-- 考试成绩分享卡片 -->
      <ShareCard
        v-else-if="share.type === 'exam'"
        type="exam"
        :title="shareContent.examTitle"
        :exam-type="shareContent.examType"
        :user-name="shareContent.userName"
        :score="shareContent.score"
        :passed="shareContent.passed"
        :correct-count="shareContent.correctCount"
        :total-questions="shareContent.totalQuestions"
        :time-spent="shareContent.timeSpent"
        :exam-mode="shareContent.examMode"
        :date="share.createdAt"
        :share-id="share.id"
        :show-actions="true"
      />

      <!-- 里程碑分享卡片 -->
      <ShareCard
        v-else-if="share.type === 'milestone'"
        type="milestone"
        :title="share.title"
        :description="share.description"
        :exam-type="shareContent.examType"
        :user-name="shareContent.userName"
        :stats="shareContent.stats"
        :date="share.createdAt"
        :share-id="share.id"
        :show-actions="true"
      />

      <!-- 分享信息 -->
      <div class="share-info">
        <div class="info-item">
          <span class="info-label">分享时间</span>
          <span class="info-value">{{ formattedDate }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">分享类型</span>
          <span class="info-value">{{ shareTypeText }}</span>
        </div>
      </div>

      <!-- 行动号召 -->
      <div class="cta-section">
        <h3>开始你的学习之旅</h3>
        <p>加入 CALE 考试系统，高效备考，轻松通过考试</p>
        <div class="cta-actions">
          <NuxtLink to="/register" class="cta-btn primary">立即注册</NuxtLink>
          <NuxtLink to="/login" class="cta-btn secondary">登录</NuxtLink>
        </div>
      </div>

      <!-- 页面底部 -->
      <div class="page-footer">
        <p>&copy; 2025 CALE考试系统. All rights reserved.</p>
        <div class="footer-links">
          <NuxtLink to="/about">关于我们</NuxtLink>
          <NuxtLink to="/privacy">隐私政策</NuxtLink>
          <NuxtLink to="/terms">服务条款</NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const shareId = route.params.id as string

const loading = ref(true)
const error = ref('')
const share = ref<any>(null)
const shareContent = ref<any>({})

// 获取分享内容
const fetchShare = async () => {
  try {
    loading.value = true
    error.value = ''

    const response = await $fetch(`/api/share/${shareId}`)

    if (response.success) {
      share.value = response.share
      shareContent.value = response.share.content
    }
  } catch (err: any) {
    console.error('Failed to fetch share:', err)

    if (err.statusCode === 404) {
      error.value = '分享不存在'
    } else if (err.statusCode === 410) {
      error.value = '分享已过期'
    } else if (err.statusCode === 403) {
      error.value = '该分享为私密分享'
    } else {
      error.value = '加载失败'
    }
  } finally {
    loading.value = false
  }
}

// 格式化日期
const formattedDate = computed(() => {
  if (!share.value) return ''
  const date = new Date(share.value.createdAt)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
})

// 分享类型文本
const shareTypeText = computed(() => {
  if (!share.value) return ''
  const typeTexts: Record<string, string> = {
    achievement: '学习成就',
    exam: '考试成绩',
    milestone: '学习里程碑'
  }
  return typeTexts[share.value.type] || share.value.type
})

// SEO Meta Tags
useHead(() => {
  if (!share.value) {
    return {
      title: 'CALE考试系统 - 分享',
      meta: [
        { name: 'description', content: 'CALE/NCCAOM考试学习平台' }
      ]
    }
  }

  const config = useRuntimeConfig()
  const appUrl = config.public.appUrl || 'http://localhost:3000'
  const shareUrl = `${appUrl}/share/${shareId}`

  return {
    title: `${share.value.title} - CALE考试系统`,
    meta: [
      { name: 'description', content: share.value.description || share.value.title },

      // Open Graph
      { property: 'og:type', content: 'website' },
      { property: 'og:url', content: shareUrl },
      { property: 'og:title', content: share.value.title },
      { property: 'og:description', content: share.value.description || share.value.title },
      { property: 'og:site_name', content: 'CALE考试系统' },

      // Twitter Card
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:url', content: shareUrl },
      { name: 'twitter:title', content: share.value.title },
      { name: 'twitter:description', content: share.value.description || share.value.title }
    ]
  }
})

// 页面加载时获取分享内容
onMounted(() => {
  fetchShare()
})
</script>

<style scoped>
.share-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem 1rem;
}

/* 加载状态 */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  color: white;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-container p {
  margin-top: 1rem;
  font-size: 1rem;
}

/* 错误状态 */
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  color: white;
  text-align: center;
}

.error-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.error-container h2 {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.error-container p {
  font-size: 1rem;
  margin-bottom: 2rem;
  opacity: 0.9;
}

.back-home-btn {
  padding: 0.75rem 2rem;
  background: white;
  color: #667eea;
  border-radius: 12px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s ease;
}

.back-home-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

/* 分享内容 */
.share-content {
  max-width: 800px;
  margin: 0 auto;
}

/* 页面头部 */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  backdrop-filter: blur(10px);
}

.logo-link {
  text-decoration: none;
}

.logo {
  font-size: 1.25rem;
  font-weight: 700;
  color: white;
}

.header-actions {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.view-count {
  color: white;
  font-size: 0.875rem;
  opacity: 0.9;
}

/* 分享信息 */
.share-info {
  display: flex;
  gap: 2rem;
  justify-content: center;
  margin: 2rem 0;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  backdrop-filter: blur(10px);
}

.info-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.info-label {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.8);
}

.info-value {
  font-size: 1rem;
  font-weight: 600;
  color: white;
}

/* CTA区域 */
.cta-section {
  margin: 3rem 0;
  padding: 2rem;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  text-align: center;
}

.cta-section h3 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1a202c;
  margin-bottom: 0.5rem;
}

.cta-section p {
  font-size: 1rem;
  color: #4a5568;
  margin-bottom: 1.5rem;
}

.cta-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.cta-btn {
  padding: 0.75rem 2rem;
  border-radius: 12px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s ease;
}

.cta-btn.primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.cta-btn.primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.cta-btn.secondary {
  background: white;
  color: #667eea;
  border: 2px solid #667eea;
}

.cta-btn.secondary:hover {
  background: #f7fafc;
}

/* 页面底部 */
.page-footer {
  margin-top: 3rem;
  padding: 2rem 1rem;
  text-align: center;
  color: rgba(255, 255, 255, 0.8);
  border-top: 1px solid rgba(255, 255, 255, 0.2);
}

.page-footer p {
  margin-bottom: 1rem;
  font-size: 0.875rem;
}

.footer-links {
  display: flex;
  gap: 1.5rem;
  justify-content: center;
}

.footer-links a {
  color: rgba(255, 255, 255, 0.9);
  text-decoration: none;
  font-size: 0.875rem;
  transition: color 0.3s ease;
}

.footer-links a:hover {
  color: white;
}

/* 响应式 */
@media (max-width: 768px) {
  .share-page {
    padding: 1rem 0.5rem;
  }

  .page-header {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }

  .share-info {
    flex-direction: column;
    gap: 1rem;
  }

  .cta-actions {
    flex-direction: column;
  }

  .cta-btn {
    width: 100%;
  }

  .footer-links {
    flex-direction: column;
    gap: 0.75rem;
  }
}
</style>
