<template>
  <transition name="modal">
    <div v-if="show && achievement" class="fixed inset-0 z-50 flex items-center justify-center p-4" @click.self="close">
      <div class="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>

      <div class="relative z-10 bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
        <!-- Close button -->
        <button
          @click="close"
          class="absolute top-4 right-4 w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors z-10"
        >
          <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>

        <!-- Header -->
        <div class="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-4">
          <h3 class="text-xl font-bold">分享成就</h3>
          <p class="text-sm text-purple-100">向朋友展示你的学习成果</p>
        </div>

        <!-- Achievement preview card -->
        <div class="p-6">
          <div
            id="achievement-card"
            class="achievement-share-card rounded-xl p-6 relative overflow-hidden"
            :class="getCardClass(achievement.rarity)"
          >
            <!-- Background decoration -->
            <div class="absolute top-0 right-0 opacity-10">
              <svg class="w-32 h-32" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="currentColor" />
              </svg>
            </div>

            <!-- Content -->
            <div class="relative z-10">
              <!-- Logo/Branding -->
              <div class="text-center mb-4">
                <div class="inline-block bg-white/80 px-4 py-2 rounded-lg shadow-sm">
                  <p class="text-xs font-bold text-gray-700">CALE考试系统</p>
                </div>
              </div>

              <!-- Achievement icon -->
              <div class="text-center mb-4">
                <div class="inline-block text-7xl">{{ achievement.icon }}</div>
              </div>

              <!-- Rarity badge -->
              <div class="text-center mb-3">
                <span class="px-3 py-1 rounded-full text-xs font-bold" :class="getRarityBadgeClass(achievement.rarity)">
                  {{ getRarityLabel(achievement.rarity) }}
                </span>
              </div>

              <!-- Achievement name -->
              <h4 class="text-2xl font-bold text-center mb-2" :class="getTextClass(achievement.rarity)">
                {{ achievement.name }}
              </h4>

              <!-- Description -->
              <p class="text-center text-sm mb-4" :class="getDescClass(achievement.rarity)">
                {{ achievement.description }}
              </p>

              <!-- Points -->
              <div class="flex items-center justify-center gap-2 bg-white/80 px-4 py-2 rounded-lg mx-auto w-fit">
                <span class="text-2xl">⭐</span>
                <span class="text-lg font-bold text-amber-600">+{{ achievement.points }}</span>
              </div>

              <!-- Date -->
              <div class="text-center mt-4">
                <p class="text-xs opacity-75">解锁于 {{ formatShareDate(achievement.unlockedAt) }}</p>
              </div>
            </div>
          </div>

          <!-- Share buttons -->
          <div class="mt-6 space-y-3">
            <!-- Copy image button -->
            <button
              @click="downloadImage"
              class="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
              </svg>
              下载图片
            </button>

            <!-- Copy text button -->
            <button
              @click="copyText"
              class="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"/>
              </svg>
              复制文字
            </button>
          </div>

          <!-- Success message -->
          <transition name="fade">
            <div v-if="showSuccess" class="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p class="text-sm text-green-700 text-center">{{ successMessage }}</p>
            </div>
          </transition>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import html2canvas from 'html2canvas'

interface Achievement {
  id: string
  code: string
  name: string
  description: string
  icon: string
  rarity: string
  points: number
  unlockedAt?: string | null
}

const show = ref(false)
const achievement = ref<Achievement | null>(null)
const showSuccess = ref(false)
const successMessage = ref('')

const showShareModal = (ach: Achievement) => {
  achievement.value = ach
  show.value = true
}

const close = () => {
  show.value = false
  setTimeout(() => {
    achievement.value = null
    showSuccess.value = false
  }, 300)
}

const getCardClass = (rarity: string) => {
  const classes = {
    'legendary': 'bg-gradient-to-br from-amber-200 via-yellow-100 to-amber-200',
    'epic': 'bg-gradient-to-br from-purple-200 via-pink-100 to-purple-200',
    'rare': 'bg-gradient-to-br from-blue-200 via-indigo-100 to-blue-200',
    'common': 'bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200'
  }
  return classes[rarity as keyof typeof classes] || classes.common
}

const getTextClass = (rarity: string) => {
  const classes = {
    'legendary': 'text-amber-900',
    'epic': 'text-purple-900',
    'rare': 'text-blue-900',
    'common': 'text-gray-900'
  }
  return classes[rarity as keyof typeof classes] || classes.common
}

const getDescClass = (rarity: string) => {
  const classes = {
    'legendary': 'text-amber-700',
    'epic': 'text-purple-700',
    'rare': 'text-blue-700',
    'common': 'text-gray-700'
  }
  return classes[rarity as keyof typeof classes] || classes.common
}

const getRarityBadgeClass = (rarity: string) => {
  const classes = {
    'legendary': 'bg-gradient-to-r from-amber-500 to-yellow-600 text-white',
    'epic': 'bg-gradient-to-r from-purple-600 to-pink-700 text-white',
    'rare': 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white',
    'common': 'bg-gray-600 text-white'
  }
  return classes[rarity as keyof typeof classes] || classes.common
}

const getRarityLabel = (rarity: string) => {
  const labels = {
    'legendary': '传说',
    'epic': '史诗',
    'rare': '稀有',
    'common': '普通'
  }
  return labels[rarity as keyof typeof labels] || '普通'
}

const formatShareDate = (date: string | null) => {
  if (!date) return ''
  const d = new Date(date)
  const year = d.getFullYear()
  const month = (d.getMonth() + 1).toString().padStart(2, '0')
  const day = d.getDate().toString().padStart(2, '0')
  return `${year}年${month}月${day}日`
}

const downloadImage = async () => {
  try {
    const element = document.getElementById('achievement-card')
    if (!element) return

    const canvas = await html2canvas(element, {
      scale: 2,
      backgroundColor: null,
      logging: false
    })

    const link = document.createElement('a')
    link.download = `成就-${achievement.value?.name || 'achievement'}.png`
    link.href = canvas.toDataURL()
    link.click()

    showSuccessMessage('图片已保存！')
  } catch (error) {
    console.error('生成图片失败:', error)
    showSuccessMessage('生成图片失败，请重试')
  }
}

const copyText = async () => {
  if (!achievement.value) return

  const text = `🏆 我在CALE考试系统解锁了「${achievement.value.name}」成就！\n\n${achievement.value.description}\n\n获得 ${achievement.value.points} 积分 ⭐\n解锁于 ${formatShareDate(achievement.value.unlockedAt)}`

  try {
    await navigator.clipboard.writeText(text)
    showSuccessMessage('文字已复制到剪贴板！')
  } catch (error) {
    console.error('复制失败:', error)
    showSuccessMessage('复制失败，请重试')
  }
}

const showSuccessMessage = (message: string) => {
  successMessage.value = message
  showSuccess.value = true
  setTimeout(() => {
    showSuccess.value = false
  }, 3000)
}

defineExpose({
  showShareModal
})
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .relative,
.modal-leave-active .relative {
  transition: transform 0.3s ease;
}

.modal-enter-from .relative,
.modal-leave-to .relative {
  transform: scale(0.9);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.achievement-share-card {
  min-height: 400px;
}
</style>
