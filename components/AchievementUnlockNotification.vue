<template>
  <Teleport to="body">
    <div class="fixed inset-0 z-50 pointer-events-none flex items-end justify-center p-4 sm:p-6">
      <TransitionGroup name="achievement" tag="div" class="space-y-4 w-full max-w-sm">
        <div
          v-for="achievement in achievements"
          :key="achievement.id"
          class="pointer-events-auto bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 rounded-2xl shadow-2xl overflow-hidden transform"
        >
          <!-- 顶部闪光效果 -->
          <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20 animate-shimmer"></div>

          <!-- 内容区 -->
          <div class="relative p-6">
            <!-- 关闭按钮 -->
            <button
              @click="removeAchievement(achievement.id)"
              class="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>

            <!-- 标题 -->
            <div class="flex items-center gap-3 mb-4">
              <div class="flex-shrink-0 w-12 h-12 rounded-full bg-white/20 flex items-center justify-center animate-bounce-slow">
                <span class="text-3xl">🎉</span>
              </div>
              <div class="flex-1">
                <h3 class="text-white font-bold text-lg">成就解锁！</h3>
                <p class="text-amber-100 text-sm">恭喜您获得新成就</p>
              </div>
            </div>

            <!-- 成就信息 -->
            <div class="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-4">
              <div class="flex items-start gap-4">
                <!-- 成就图标 -->
                <div class="flex-shrink-0">
                  <div class="w-16 h-16 rounded-xl bg-gradient-to-br from-white/30 to-white/10 flex items-center justify-center text-4xl">
                    {{ achievement.icon }}
                  </div>
                  <!-- 稀有度标识 -->
                  <div
                    v-if="achievement.rarity !== 'common'"
                    class="mt-2 text-center"
                  >
                    <span
                      class="text-xs font-bold px-2 py-1 rounded-full"
                      :class="{
                        'bg-purple-500 text-white': achievement.rarity === 'legendary',
                        'bg-pink-500 text-white': achievement.rarity === 'epic',
                        'bg-blue-400 text-white': achievement.rarity === 'rare'
                      }"
                    >
                      {{ getRarityText(achievement.rarity) }}
                    </span>
                  </div>
                </div>

                <!-- 成就详情 -->
                <div class="flex-1 min-w-0">
                  <h4 class="text-white font-bold text-lg mb-1">{{ achievement.name }}</h4>
                  <p class="text-amber-100 text-sm mb-3">{{ achievement.description }}</p>

                  <!-- 积分奖励 -->
                  <div class="flex items-center gap-2">
                    <span class="text-yellow-300 text-xl">⭐</span>
                    <span class="text-white font-bold">+{{ achievement.points }}</span>
                    <span class="text-amber-100 text-sm">积分</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- 进度条 -->
            <div class="h-1 bg-white/20 rounded-full overflow-hidden">
              <div class="h-full bg-white rounded-full animate-progress" :style="{ animationDuration: `${autoCloseDuration}ms` }"></div>
            </div>
          </div>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Achievement {
  id: string
  code: string
  name: string
  description: string
  icon: string
  rarity: string
  points: number
}

const achievements = ref<Achievement[]>([])
const autoCloseDuration = 5000 // 5秒后自动关闭

const getRarityText = (rarity: string) => {
  const rarityMap: Record<string, string> = {
    legendary: '传说',
    epic: '史诗',
    rare: '稀有'
  }
  return rarityMap[rarity] || ''
}

const showAchievement = (achievement: Achievement) => {
  achievements.value.push(achievement)

  // 自动关闭
  setTimeout(() => {
    removeAchievement(achievement.id)
  }, autoCloseDuration)
}

const removeAchievement = (id: string) => {
  const index = achievements.value.findIndex(a => a.id === id)
  if (index > -1) {
    achievements.value.splice(index, 1)
  }
}

// 暴露方法给父组件
defineExpose({
  showAchievement
})
</script>

<style scoped>
/* 进入/离开动画 */
.achievement-enter-active {
  animation: slideInUp 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.achievement-leave-active {
  animation: slideOutDown 0.3s cubic-bezier(0.4, 0, 1, 1);
}

@keyframes slideInUp {
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes slideOutDown {
  from {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
  to {
    transform: translateY(20px) scale(0.95);
    opacity: 0;
  }
}

/* 闪光动画 */
@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

.animate-shimmer {
  animation: shimmer 2s infinite;
}

/* 缓慢弹跳 */
@keyframes bounce-slow {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.animate-bounce-slow {
  animation: bounce-slow 2s infinite;
}

/* 进度条动画 */
@keyframes progress {
  from {
    width: 100%;
  }
  to {
    width: 0%;
  }
}

.animate-progress {
  animation: progress linear;
}
</style>
