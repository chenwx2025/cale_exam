<template>
  <div class="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-12 px-4">
    <div class="max-w-4xl mx-auto">
      <!-- Header -->
      <div class="text-center mb-8">
        <div class="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-2xl mb-4 shadow-lg">
          <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
          </svg>
        </div>
        <h1 class="text-3xl font-bold text-gray-900 mb-2">个人中心</h1>
        <p class="text-gray-600">管理您的个人信息和账户设置</p>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        <p class="mt-4 text-gray-600">加载中...</p>
      </div>

      <!-- Profile Content -->
      <div v-else-if="profile" class="space-y-6">
        <!-- User Statistics -->
        <div class="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
          <h2 class="text-xl font-bold text-gray-900 mb-4">账户统计</h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="bg-blue-50 rounded-xl p-4 border border-blue-200">
              <div class="flex items-center gap-3">
                <div class="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                  <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                  </svg>
                </div>
                <div>
                  <p class="text-sm text-blue-700">学习计划</p>
                  <p class="text-2xl font-bold text-blue-900">{{ profile.stats.studyPlans }}</p>
                </div>
              </div>
            </div>

            <div class="bg-green-50 rounded-xl p-4 border border-green-200">
              <div class="flex items-center gap-3">
                <div class="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center">
                  <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                  </svg>
                </div>
                <div>
                  <p class="text-sm text-green-700">已完成考试</p>
                  <p class="text-2xl font-bold text-green-900">{{ profile.stats.exams }}</p>
                </div>
              </div>
            </div>

            <div class="bg-orange-50 rounded-xl p-4 border border-orange-200">
              <div class="flex items-center gap-3">
                <div class="w-12 h-12 bg-orange-600 rounded-xl flex items-center justify-center">
                  <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                  </svg>
                </div>
                <div>
                  <p class="text-sm text-orange-700">错题收藏</p>
                  <p class="text-2xl font-bold text-orange-900">{{ profile.stats.wrongQuestions }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Personal Information -->
        <div class="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-xl font-bold text-gray-900">个人信息</h2>
            <button
              v-if="!editingProfile"
              @click="startEditProfile"
              class="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              编辑资料
            </button>
          </div>

          <div v-if="!editingProfile" class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-600 mb-1">姓名</label>
                <p class="text-gray-900">{{ profile.name || '未设置' }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-600 mb-1">昵称</label>
                <p class="text-gray-900">{{ profile.nickname || '未设置' }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-600 mb-1">邮箱</label>
                <p class="text-gray-900">{{ profile.email }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-600 mb-1">角色</label>
                <p class="text-gray-900">
                  <span v-if="profile.role === 'admin'" class="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-semibold">管理员</span>
                  <span v-else class="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">普通用户</span>
                </p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-600 mb-1">账户状态</label>
                <p class="text-gray-900">
                  <span v-if="profile.status === 'active'" class="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">正常</span>
                  <span v-else-if="profile.status === 'suspended'" class="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-semibold">已暂停</span>
                  <span v-else class="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-semibold">{{ profile.status }}</span>
                </p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-600 mb-1">登录次数</label>
                <p class="text-gray-900">{{ profile.loginCount }} 次</p>
              </div>
            </div>
          </div>

          <!-- Edit Profile Form -->
          <form v-else @submit.prevent="saveProfile" class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">姓名</label>
                <input
                  v-model="profileForm.name"
                  type="text"
                  required
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">昵称</label>
                <input
                  v-model="profileForm.nickname"
                  type="text"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>

            <div v-if="profileError" class="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
              {{ profileError }}
            </div>

            <div v-if="profileSuccess" class="bg-green-50 border border-green-200 rounded-lg p-3 text-green-700 text-sm">
              {{ profileSuccess }}
            </div>

            <div class="flex gap-3">
              <button
                type="submit"
                :disabled="savingProfile"
                class="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {{ savingProfile ? '保存中...' : '保存' }}
              </button>
              <button
                type="button"
                @click="cancelEditProfile"
                class="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                取消
              </button>
            </div>
          </form>
        </div>

        <!-- Exam Subscriptions -->
        <div class="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
          <h2 class="text-xl font-bold text-gray-900 mb-4">考试订阅</h2>

          <div class="space-y-3 mb-4">
            <div v-for="sub in profile.subscribedExams" :key="sub.examType" class="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                  <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                  </svg>
                </div>
                <div>
                  <p class="font-semibold text-gray-900">{{ sub.examType.toUpperCase() }}</p>
                  <p class="text-sm text-gray-600">订阅时间: {{ new Date(sub.subscribedAt).toLocaleDateString('zh-CN') }}</p>
                </div>
              </div>
              <span class="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">已订阅</span>
            </div>
          </div>

          <!-- Add Subscription -->
          <div v-if="availableExamTypes.length > 0" class="border-t pt-4">
            <h3 class="text-sm font-semibold text-gray-700 mb-3">添加新的考试订阅</h3>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="examType in availableExamTypes"
                :key="examType"
                @click="subscribeExam(examType)"
                :disabled="subscribing"
                class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                订阅 {{ examType.toUpperCase() }}
              </button>
            </div>
          </div>

          <div v-if="subscriptionError" class="mt-3 bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
            {{ subscriptionError }}
          </div>

          <div v-if="subscriptionSuccess" class="mt-3 bg-green-50 border border-green-200 rounded-lg p-3 text-green-700 text-sm">
            {{ subscriptionSuccess }}
          </div>
        </div>

        <!-- Change Password -->
        <div class="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-xl font-bold text-gray-900">修改密码</h2>
            <button
              v-if="!changingPassword"
              @click="startChangePassword"
              class="px-4 py-2 text-sm bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              修改密码
            </button>
          </div>

          <form v-if="changingPassword" @submit.prevent="changePassword" class="space-y-4">
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">当前密码</label>
              <input
                v-model="passwordForm.oldPassword"
                type="password"
                required
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">新密码</label>
              <input
                v-model="passwordForm.newPassword"
                type="password"
                required
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
              <p class="mt-1 text-xs text-gray-500">至少8位，包含大小写字母和数字</p>
            </div>

            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">确认新密码</label>
              <input
                v-model="passwordForm.confirmPassword"
                type="password"
                required
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            <div v-if="passwordError" class="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
              {{ passwordError }}
            </div>

            <div v-if="passwordSuccess" class="bg-green-50 border border-green-200 rounded-lg p-3 text-green-700 text-sm">
              {{ passwordSuccess }}
            </div>

            <div class="flex gap-3">
              <button
                type="submit"
                :disabled="savingPassword"
                class="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {{ savingPassword ? '修改中...' : '确认修改' }}
              </button>
              <button
                type="button"
                @click="cancelChangePassword"
                class="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                取消
              </button>
            </div>
          </form>

          <p v-else class="text-sm text-gray-600">
            为了账户安全，建议定期更换密码
          </p>
        </div>
      </div>

      <!-- Back Button -->
      <div class="mt-6 text-center">
        <NuxtLink
          to="/"
          class="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
          </svg>
          返回首页
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const authStore = useAuthStore()

// Profile data
const profile = ref<any>(null)
const loading = ref(true)

// Edit profile
const editingProfile = ref(false)
const savingProfile = ref(false)
const profileForm = ref({
  name: '',
  nickname: ''
})
const profileError = ref('')
const profileSuccess = ref('')

// Change password
const changingPassword = ref(false)
const savingPassword = ref(false)
const passwordForm = ref({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})
const passwordError = ref('')
const passwordSuccess = ref('')

// Exam subscriptions
const subscribing = ref(false)
const subscriptionError = ref('')
const subscriptionSuccess = ref('')

// Available exam types (not yet subscribed)
const availableExamTypes = computed(() => {
  if (!profile.value) return []
  const subscribed = profile.value.subscribedExams.map((s: any) => s.examType)
  const allTypes = ['cale', 'nccaom']
  return allTypes.filter(type => !subscribed.includes(type))
})

// Fetch profile on mount
onMounted(async () => {
  await fetchProfile()
})

// Fetch profile
const fetchProfile = async () => {
  loading.value = true
  try {
    const response = await $fetch('/api/user/profile', {
      headers: authStore.getAuthHeader()
    })

    if (response.success) {
      profile.value = response.user
    }
  } catch (error: any) {
    console.error('Fetch profile error:', error)
    alert('获取用户信息失败: ' + (error.data?.message || '未知错误'))
  } finally {
    loading.value = false
  }
}

// Edit profile
const startEditProfile = () => {
  profileForm.value.name = profile.value.name || ''
  profileForm.value.nickname = profile.value.nickname || ''
  editingProfile.value = true
  profileError.value = ''
  profileSuccess.value = ''
}

const cancelEditProfile = () => {
  editingProfile.value = false
  profileError.value = ''
  profileSuccess.value = ''
}

const saveProfile = async () => {
  savingProfile.value = true
  profileError.value = ''
  profileSuccess.value = ''

  try {
    const response = await $fetch('/api/user/profile', {
      method: 'PUT',
      headers: authStore.getAuthHeader(),
      body: {
        name: profileForm.value.name,
        nickname: profileForm.value.nickname
      }
    })

    if (response.success) {
      profileSuccess.value = '个人信息更新成功'
      profile.value.name = response.user.name
      profile.value.nickname = response.user.nickname

      // Update auth store user info
      if (authStore.user) {
        authStore.user.name = response.user.name
      }

      setTimeout(() => {
        editingProfile.value = false
        profileSuccess.value = ''
      }, 2000)
    }
  } catch (error: any) {
    console.error('Save profile error:', error)
    profileError.value = error.data?.message || '更新失败，请稍后重试'
  } finally {
    savingProfile.value = false
  }
}

// Change password
const startChangePassword = () => {
  passwordForm.value = {
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  }
  changingPassword.value = true
  passwordError.value = ''
  passwordSuccess.value = ''
}

const cancelChangePassword = () => {
  changingPassword.value = false
  passwordError.value = ''
  passwordSuccess.value = ''
}

const changePassword = async () => {
  passwordError.value = ''
  passwordSuccess.value = ''

  // Validate passwords match
  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    passwordError.value = '两次输入的新密码不一致'
    return
  }

  // Validate password strength
  if (passwordForm.value.newPassword.length < 8) {
    passwordError.value = '密码至少需要8个字符'
    return
  }

  if (!/[a-z]/.test(passwordForm.value.newPassword)) {
    passwordError.value = '密码必须包含小写字母'
    return
  }

  if (!/[A-Z]/.test(passwordForm.value.newPassword)) {
    passwordError.value = '密码必须包含大写字母'
    return
  }

  if (!/[0-9]/.test(passwordForm.value.newPassword)) {
    passwordError.value = '密码必须包含数字'
    return
  }

  savingPassword.value = true

  try {
    const response = await $fetch('/api/user/change-password', {
      method: 'POST',
      headers: authStore.getAuthHeader(),
      body: {
        oldPassword: passwordForm.value.oldPassword,
        newPassword: passwordForm.value.newPassword
      }
    })

    if (response.success) {
      passwordSuccess.value = '密码修改成功！'

      setTimeout(() => {
        changingPassword.value = false
        passwordSuccess.value = ''
      }, 2000)
    }
  } catch (error: any) {
    console.error('Change password error:', error)
    passwordError.value = error.data?.message || '密码修改失败，请稍后重试'
  } finally {
    savingPassword.value = false
  }
}

// Subscribe to exam
const subscribeExam = async (examType: string) => {
  subscribing.value = true
  subscriptionError.value = ''
  subscriptionSuccess.value = ''

  try {
    const response = await $fetch('/api/user/subscribe-exam', {
      method: 'POST',
      headers: authStore.getAuthHeader(),
      body: { examType }
    })

    if (response.success) {
      subscriptionSuccess.value = `成功订阅 ${examType.toUpperCase()} 考试！`

      // Refresh profile to show new subscription
      await fetchProfile()

      // Update auth store
      if (authStore.user && !authStore.user.subscribedExams.includes(examType)) {
        authStore.user.subscribedExams.push(examType)
      }

      setTimeout(() => {
        subscriptionSuccess.value = ''
      }, 3000)
    }
  } catch (error: any) {
    console.error('Subscribe exam error:', error)
    subscriptionError.value = error.data?.message || '订阅失败，请稍后重试'
  } finally {
    subscribing.value = false
  }
}
</script>
