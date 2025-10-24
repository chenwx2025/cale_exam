<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8">
    <div class="max-w-3xl mx-auto px-4">
      <!-- Back Button -->
      <div class="mb-6">
        <NuxtLink
          to="/study-groups"
          class="inline-flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-white rounded-lg transition-all group shadow-sm"
        >
          <svg class="w-5 h-5 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
          </svg>
          <span class="font-medium">返回小组列表</span>
        </NuxtLink>
      </div>

      <!-- Create Form -->
      <div class="bg-white rounded-2xl shadow-xl p-8">
        <div class="text-center mb-8">
          <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl mb-4 shadow-lg">
            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
            </svg>
          </div>
          <h1 class="text-3xl font-bold text-gray-900 mb-2">创建学习小组</h1>
          <p class="text-gray-600">建立你的学习社区，与同学一起备考</p>
        </div>

        <form @submit.prevent="createGroup" class="space-y-6">
          <!-- Group Name -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              小组名称 <span class="text-red-500">*</span>
            </label>
            <input
              v-model="formData.name"
              type="text"
              required
              maxlength="50"
              placeholder="例如：CALE 2024 备考群"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p class="mt-1 text-sm text-gray-500">{{ formData.name.length }}/50 字符</p>
          </div>

          <!-- Description -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              小组简介
            </label>
            <textarea
              v-model="formData.description"
              rows="4"
              maxlength="500"
              placeholder="介绍一下这个小组的目标和氛围..."
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            ></textarea>
            <p class="mt-1 text-sm text-gray-500">{{ formData.description.length }}/500 字符</p>
          </div>

          <!-- Exam Type (hidden, auto set to CALE) -->
          <div class="p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <div class="flex-1">
                <p class="font-semibold text-blue-900">CALE 考试小组</p>
                <p class="text-sm text-blue-700">此小组自动关联到 CALE（加州针灸执照考试）</p>
              </div>
            </div>
          </div>

          <!-- Max Members -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              最大成员数
            </label>
            <select
              v-model="formData.maxMembers"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option :value="20">20 人</option>
              <option :value="30">30 人</option>
              <option :value="50" selected>50 人</option>
              <option :value="100">100 人</option>
              <option :value="200">200 人</option>
            </select>
          </div>

          <!-- Privacy Setting -->
          <div>
            <label class="flex items-start gap-3 p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
              <input
                v-model="formData.isPrivate"
                type="checkbox"
                class="mt-1 w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <div class="flex-1">
                <p class="font-semibold text-gray-900 mb-1">设为私密小组</p>
                <p class="text-sm text-gray-600">
                  私密小组的讨论内容只有成员可见，但小组本身在列表中可见
                </p>
              </div>
            </label>
          </div>

          <!-- Require Approval Setting -->
          <div>
            <label class="flex items-start gap-3 p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
              <input
                v-model="formData.requireApproval"
                type="checkbox"
                class="mt-1 w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <div class="flex-1">
                <p class="font-semibold text-gray-900 mb-1">需要审批加入</p>
                <p class="text-sm text-gray-600">
                  启用后，用户申请加入时需要等待管理员或组长审批才能加入小组
                </p>
              </div>
            </label>
          </div>

          <!-- Submit Buttons -->
          <div class="flex gap-4 pt-4">
            <button
              type="button"
              @click="router.push('/study-groups')"
              class="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              :disabled="creating || !formData.name.trim()"
              class="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ creating ? '创建中...' : '创建小组' }}
            </button>
          </div>
        </form>
      </div>

      <!-- Tips -->
      <div class="mt-6 bg-blue-50 rounded-xl p-6 border border-blue-200">
        <h3 class="font-semibold text-blue-900 mb-3 flex items-center gap-2">
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>
          </svg>
          创建小组提示
        </h3>
        <ul class="space-y-2 text-sm text-blue-800">
          <li class="flex items-start gap-2">
            <span class="text-blue-600 mt-1">•</span>
            <span>选择一个清晰明确的小组名称，让其他用户容易理解小组的目的</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-blue-600 mt-1">•</span>
            <span>在简介中说明小组的学习目标、活动频率和氛围</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-blue-600 mt-1">•</span>
            <span>创建小组后，你将自动成为组长，可以管理小组成员和内容</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-blue-600 mt-1">•</span>
            <span>鼓励成员积极参与讨论，分享学习资源和经验</span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ['exam-access' as any],
  layout: 'exam'
})

const router = useRouter()
const authStore = useAuthStore()

// Form data
const formData = ref({
  name: '',
  description: '',
  examType: 'cale',
  maxMembers: 50,
  isPrivate: false,
  requireApproval: false
})

const creating = ref(false)

// Create group
const createGroup = async () => {
  if (!formData.value.name.trim()) {
    alert('请输入小组名称')
    return
  }

  try {
    creating.value = true
    const response = await $fetch('/api/study-groups', {
      method: 'POST',
      headers: authStore.getAuthHeader() as HeadersInit,
      body: formData.value
    }) as any

    if (response.success) {
      alert('学习小组创建成功！')
      router.push(`/study-groups/${response.data.id}`)
    }
  } catch (error: any) {
    console.error('创建小组失败:', error)
    alert('创建小组失败: ' + (error.data?.message || error.message))
  } finally {
    creating.value = false
  }
}
</script>
