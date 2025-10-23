<template>
  <transition name="achievement-modal">
    <div
      v-if="show && currentAchievement"
      class="fixed inset-0 z-50 flex items-center justify-center p-4"
      @click="close"
    >
      <!-- 背景遮罩 -->
      <div class="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>

      <!-- 成就卡片 -->
      <div
        class="relative z-10 max-w-md w-full"
        @click.stop
      >
        <!-- 闪光效果 -->
        <div class="absolute inset-0 animate-pulse-slow">
          <div
            class="absolute inset-0 rounded-2xl blur-xl opacity-75"
            :class="rarityGlowClass"
          ></div>
        </div>

        <!-- 卡片主体 -->
        <div
          class="relative bg-white rounded-2xl shadow-2xl overflow-hidden"
          :class="rarityBorderClass"
        >
          <!-- 顶部装饰 -->
          <div
            class="h-32 relative overflow-hidden"
            :class="rarityBgClass"
          >
            <div class="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
            <div class="absolute inset-0 flex items-center justify-center">
              <div class="text-8xl animate-bounce-slow">
                {{ currentAchievement.icon }}
              </div>
            </div>
            <!-- 星星装饰 -->
            <div class="absolute top-4 left-4 text-yellow-300 animate-twinkle" style="animation-delay: 0s">✨</div>
            <div class="absolute top-6 right-6 text-yellow-300 animate-twinkle" style="animation-delay: 0.3s">✨</div>
            <div class="absolute bottom-6 left-6 text-yellow-300 animate-twinkle" style="animation-delay: 0.6s">✨</div>
          </div>

          <!-- 内容区域 -->
          <div class="p-6">
            <!-- 稀有度标签 -->
            <div class="flex justify-center mb-3">
              <span
                class="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
                :class="rarityLabelClass"
              >
                {{ rarityLabel }}
              </span>
            </div>

            <!-- 标题 -->
            <h3 class="text-2xl font-bold text-center mb-2 text-gray-900">
              🎉 成就解锁！
            </h3>

            <!-- 成就名称 -->
            <h4 class="text-xl font-bold text-center mb-3" :class="rarityTextClass">
              {{ currentAchievement.name }}
            </h4>

            <!-- 描述 -->
            <p class="text-center text-gray-600 mb-4">
              {{ currentAchievement.description }}
            </p>

            <!-- 积分奖励 -->
            <div class="flex items-center justify-center gap-2 mb-6">
              <div class="flex items-center gap-1 bg-amber-100 px-4 py-2 rounded-full">
                <span class="text-2xl">⭐</span>
                <span class="text-lg font-bold text-amber-600">
                  +{{ currentAchievement.points }}
                </span>
                <span class="text-sm text-amber-600">积分</span>
              </div>
            </div>

            <!-- 按钮 -->
            <div class="flex gap-3">
              <button
                @click="close"
                class="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
              >
                继续学习
              </button>
              <button
                @click="viewAllAchievements"
                class="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl"
              >
                查看全部
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

interface Achievement {
  id: string
  code: string
  name: string
  nameEn: string
  description: string
  descriptionEn: string
  category: string
  icon: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  points: number
}

const router = useRouter()
const show = ref(false)
const currentAchievement = ref<Achievement | null>(null)
const achievementQueue = ref<Achievement[]>([])

// 稀有度样式
const rarityGlowClass = computed(() => {
  const rarity = currentAchievement.value?.rarity
  switch (rarity) {
    case 'legendary':
      return 'bg-gradient-to-r from-amber-400 to-yellow-500'
    case 'epic':
      return 'bg-gradient-to-r from-purple-500 to-pink-500'
    case 'rare':
      return 'bg-gradient-to-r from-blue-500 to-cyan-500'
    default:
      return 'bg-gradient-to-r from-gray-400 to-gray-500'
  }
})

const rarityBorderClass = computed(() => {
  const rarity = currentAchievement.value?.rarity
  switch (rarity) {
    case 'legendary':
      return 'border-4 border-amber-400'
    case 'epic':
      return 'border-4 border-purple-400'
    case 'rare':
      return 'border-4 border-blue-400'
    default:
      return 'border-2 border-gray-300'
  }
})

const rarityBgClass = computed(() => {
  const rarity = currentAchievement.value?.rarity
  switch (rarity) {
    case 'legendary':
      return 'bg-gradient-to-br from-amber-400 to-yellow-500'
    case 'epic':
      return 'bg-gradient-to-br from-purple-500 to-pink-500'
    case 'rare':
      return 'bg-gradient-to-br from-blue-500 to-cyan-500'
    default:
      return 'bg-gradient-to-br from-gray-400 to-gray-500'
  }
})

const rarityLabelClass = computed(() => {
  const rarity = currentAchievement.value?.rarity
  switch (rarity) {
    case 'legendary':
      return 'bg-amber-100 text-amber-700 border-2 border-amber-400'
    case 'epic':
      return 'bg-purple-100 text-purple-700 border-2 border-purple-400'
    case 'rare':
      return 'bg-blue-100 text-blue-700 border-2 border-blue-400'
    default:
      return 'bg-gray-100 text-gray-700 border-2 border-gray-400'
  }
})

const rarityTextClass = computed(() => {
  const rarity = currentAchievement.value?.rarity
  switch (rarity) {
    case 'legendary':
      return 'text-amber-600'
    case 'epic':
      return 'text-purple-600'
    case 'rare':
      return 'text-blue-600'
    default:
      return 'text-gray-700'
  }
})

const rarityLabel = computed(() => {
  const rarity = currentAchievement.value?.rarity
  switch (rarity) {
    case 'legendary':
      return '传说'
    case 'epic':
      return '史诗'
    case 'rare':
      return '稀有'
    default:
      return '普通'
  }
})

// 显示成就
const showAchievement = (achievement: Achievement) => {
  achievementQueue.value.push(achievement)
  if (!show.value) {
    displayNext()
  }
}

// 显示下一个成就
const displayNext = () => {
  if (achievementQueue.value.length === 0) {
    show.value = false
    currentAchievement.value = null
    return
  }

  currentAchievement.value = achievementQueue.value.shift() || null
  show.value = true
}

// 关闭弹窗
const close = () => {
  show.value = false
  // 延迟显示下一个
  setTimeout(() => {
    displayNext()
  }, 300)
}

// 查看全部成就
const viewAllAchievements = () => {
  show.value = false
  achievementQueue.value = []
  router.push('/achievements')
}

// 暴露方法给父组件
defineExpose({
  showAchievement
})
</script>

<style scoped>
/* 弹窗动画 */
.achievement-modal-enter-active,
.achievement-modal-leave-active {
  transition: all 0.3s ease;
}

.achievement-modal-enter-from,
.achievement-modal-leave-to {
  opacity: 0;
  transform: scale(0.9);
}

/* 慢速弹跳动画 */
@keyframes bounce-slow {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.animate-bounce-slow {
  animation: bounce-slow 2s ease-in-out infinite;
}

/* 慢速脉冲动画 */
@keyframes pulse-slow {
  0%, 100% {
    opacity: 0.5;
  }
  50% {
    opacity: 1;
  }
}

.animate-pulse-slow {
  animation: pulse-slow 3s ease-in-out infinite;
}

/* 闪烁动画 */
@keyframes twinkle {
  0%, 100% {
    opacity: 0.3;
    transform: scale(0.8);
  }
  50% {
    opacity: 1;
    transform: scale(1.2);
  }
}

.animate-twinkle {
  animation: twinkle 2s ease-in-out infinite;
}
</style>
