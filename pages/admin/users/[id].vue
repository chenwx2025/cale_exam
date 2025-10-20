<template>
  <div>
    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>

    <div v-else-if="user">
      <!-- 返回按钮 -->
      <NuxtLink to="/admin/users" class="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6">
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        返回用户列表
      </NuxtLink>

      <!-- 用户基本信息 -->
      <div class="bg-white rounded-xl shadow-md p-6 mb-6">
        <div class="flex items-start justify-between mb-6">
          <div class="flex items-center gap-4">
            <div class="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
              {{ user.name.charAt(0).toUpperCase() }}
            </div>
            <div>
              <h1 class="text-3xl font-bold text-gray-900">{{ user.name }}</h1>
              <p class="text-gray-600 mt-1">{{ user.email }}</p>
              <div class="flex gap-2 mt-2">
                <span :class="['px-3 py-1 rounded-full text-xs font-semibold', user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700']">
                  {{ user.role === 'admin' ? '管理员' : '用户' }}
                </span>
                <span :class="['px-3 py-1 rounded-full text-xs font-semibold', getStatusClass(user.status)]">
                  {{ getStatusText(user.status) }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- 编辑表单 -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 pt-6 border-t">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">姓名</label>
            <input v-model="editForm.name" type="text" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">角色</label>
            <select v-model="editForm.role" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
              <option value="user">普通用户</option>
              <option value="admin">管理员</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">状态</label>
            <select v-model="editForm.status" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
              <option value="active">活跃</option>
              <option value="suspended">已停用</option>
            </select>
          </div>
          <div class="flex items-end">
            <button @click="updateUser" :disabled="updating" class="w-full px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
              {{ updating ? '保存中...' : '保存更改' }}
            </button>
          </div>
        </div>
      </div>

      <!-- 订阅管理 -->
      <div class="bg-white rounded-xl shadow-md p-6 mb-6">
        <h2 class="text-xl font-bold text-gray-900 mb-4">订阅管理</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div v-for="examType in ['cale', 'nccaom']" :key="examType" class="border-2 border-gray-200 rounded-lg p-4">
            <div class="flex items-center justify-between mb-2">
              <span class="font-medium text-gray-900">{{ examType.toUpperCase() }}</span>
              <span v-if="hasSubscription(examType)" class="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">已订阅</span>
              <span v-else class="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-semibold">未订阅</span>
            </div>
            <button v-if="hasSubscription(examType)" @click="manageSubscription(examType, 'remove')" class="w-full mt-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200">移除订阅</button>
            <button v-else @click="manageSubscription(examType, 'add')" class="w-full mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">添加订阅</button>
          </div>
        </div>
      </div>

      <!-- 统计数据 -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div class="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
          <div class="text-3xl font-bold">{{ user.stats.answers.total }}</div>
          <div class="text-sm text-blue-100 mt-2">总答题数</div>
          <div class="text-xs text-blue-100 mt-1">正确率: {{ user.stats.answers.accuracy }}%</div>
        </div>
        <div class="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
          <div class="text-3xl font-bold">{{ user.stats.exams.total }}</div>
          <div class="text-sm text-green-100 mt-2">考试次数</div>
        </div>
        <div class="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
          <div class="text-3xl font-bold">{{ user.stats.studyPlans.total }}</div>
          <div class="text-sm text-purple-100 mt-2">学习计划</div>
        </div>
        <div class="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white">
          <div class="text-3xl font-bold">{{ user.stats.wrongQuestions.total }}</div>
          <div class="text-sm text-orange-100 mt-2">错题数</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'admin',
  layout: 'admin'
})

const authStore = useAuthStore()
const route = useRoute()
const userId = route.params.id as string

const loading = ref(true)
const updating = ref(false)
const user = ref<any>(null)
const editForm = ref({ name: '', role: 'user', status: 'active' })

const loadUser = async () => {
  loading.value = true
  try {
    const response = await $fetch(`/api/admin/users/${userId}`, {
      headers: authStore.getAuthHeader()
    })
    if (response.success) {
      user.value = response.data
      editForm.value = { name: user.value.name, role: user.value.role, status: user.value.status }
    }
  } catch (error) {
    console.error('Failed to load user:', error)
  } finally {
    loading.value = false
  }
}

const updateUser = async () => {
  updating.value = true
  try {
    const response = await $fetch(`/api/admin/users/${userId}`, {
      method: 'PUT',
      headers: authStore.getAuthHeader(),
      body: editForm.value
    })
    if (response.success) {
      user.value = { ...user.value, ...editForm.value }
      alert('用户信息已更新')
    }
  } catch (error) {
    console.error('Failed to update user:', error)
    alert('更新失败')
  } finally {
    updating.value = false
  }
}

const hasSubscription = (examType: string) => {
  return user.value?.subscribedExams?.some((s: any) => s.examType === examType && s.isActive)
}

const manageSubscription = async (examType: string, action: string) => {
  try {
    const response = await $fetch(`/api/admin/users/${userId}/subscriptions`, {
      method: 'POST',
      headers: authStore.getAuthHeader(),
      body: { examType, action }
    })
    if (response.success) {
      await loadUser()
      alert(`订阅已${action === 'add' ? '添加' : '移除'}`)
    }
  } catch (error) {
    console.error('Failed to manage subscription:', error)
    alert('操作失败')
  }
}

const getStatusClass = (status: string) => {
  const classes: Record<string, string> = {
    active: 'bg-green-100 text-green-700',
    suspended: 'bg-yellow-100 text-yellow-700',
    deleted: 'bg-red-100 text-red-700'
  }
  return classes[status] || 'bg-gray-100 text-gray-700'
}

const getStatusText = (status: string) => {
  const texts: Record<string, string> = {
    active: '活跃',
    suspended: '已停用',
    deleted: '已删除'
  }
  return texts[status] || status
}

onMounted(() => {
  loadUser()
})
</script>
