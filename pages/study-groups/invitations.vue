<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8">
    <div class="max-w-5xl mx-auto px-4">
      <!-- Header -->
      <div class="mb-8">
        <div class="flex items-center gap-4 mb-4">
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

        <h1 class="text-4xl font-bold text-gray-900 mb-2">小组邀请</h1>
        <p class="text-gray-600">查看并响应您收到的学习小组邀请</p>
      </div>

      <!-- Filter Tabs -->
      <div class="flex gap-2 mb-6">
        <button
          @click="statusFilter = 'pending'"
          class="px-4 py-2 rounded-lg font-medium transition-all"
          :class="statusFilter === 'pending' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'"
        >
          待处理 {{ pendingCount > 0 ? `(${pendingCount})` : '' }}
        </button>
        <button
          @click="statusFilter = 'accepted'"
          class="px-4 py-2 rounded-lg font-medium transition-all"
          :class="statusFilter === 'accepted' ? 'bg-green-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'"
        >
          已接受
        </button>
        <button
          @click="statusFilter = 'rejected'"
          class="px-4 py-2 rounded-lg font-medium transition-all"
          :class="statusFilter === 'rejected' ? 'bg-red-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'"
        >
          已拒绝
        </button>
        <button
          @click="statusFilter = 'expired'"
          class="px-4 py-2 rounded-lg font-medium transition-all"
          :class="statusFilter === 'expired' ? 'bg-gray-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'"
        >
          已过期
        </button>
        <button
          @click="statusFilter = 'all'"
          class="px-4 py-2 rounded-lg font-medium transition-all"
          :class="statusFilter === 'all' ? 'bg-purple-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'"
        >
          全部
        </button>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-12">
        <div class="inline-block w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p class="mt-4 text-gray-600">加载中...</p>
      </div>

      <!-- Invitations List -->
      <div v-else-if="filteredInvitations.length > 0" class="space-y-4">
        <div
          v-for="invitation in filteredInvitations"
          :key="invitation.id"
          class="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
        >
          <div class="flex items-start justify-between gap-4">
            <!-- Left Side: Group & Inviter Info -->
            <div class="flex-1">
              <!-- Group Info -->
              <div class="flex items-start gap-4 mb-4">
                <div class="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
                  {{ invitation.group.name[0].toUpperCase() }}
                </div>
                <div class="flex-1">
                  <h3 class="text-xl font-bold text-gray-900 mb-1">{{ invitation.group.name }}</h3>
                  <p class="text-gray-600 text-sm mb-2">{{ invitation.group.description || '暂无描述' }}</p>

                  <div class="flex items-center gap-3 text-sm text-gray-600">
                    <span
                      class="px-2 py-1 text-xs font-semibold rounded-full"
                      :class="{
                        'bg-blue-100 text-blue-700': invitation.group.examType === 'cale',
                        'bg-green-100 text-green-700': invitation.group.examType === 'nccaom'
                      }"
                    >
                      {{ invitation.group.examType === 'cale' ? 'CALE' : 'NCCAOM' }}
                    </span>
                    <span>{{ invitation.group.memberCount }}/{{ invitation.group.maxMembers }} 成员</span>
                    <span v-if="!invitation.group.isPublic" class="text-xs">🔒 私密小组</span>
                  </div>
                </div>
              </div>

              <!-- Inviter Info -->
              <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div class="w-10 h-10 bg-gradient-to-br from-indigo-500 to-pink-600 rounded-full flex items-center justify-center text-white font-bold">
                  {{ (invitation.inviter.name || invitation.inviter.email)[0].toUpperCase() }}
                </div>
                <div>
                  <p class="text-sm text-gray-600">邀请人:</p>
                  <p class="font-semibold text-gray-900">{{ invitation.inviter.name || invitation.inviter.email }}</p>
                </div>
              </div>

              <!-- Invitation Message -->
              <div v-if="invitation.message" class="mt-3 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                <p class="text-sm text-gray-700">💬 {{ invitation.message }}</p>
              </div>

              <!-- Timestamp -->
              <div class="mt-3 flex items-center gap-4 text-xs text-gray-500">
                <span>邀请时间: {{ formatDate(invitation.createdAt) }}</span>
                <span v-if="invitation.status === 'pending'">
                  过期时间: {{ formatDate(invitation.expiresAt) }}
                </span>
              </div>
            </div>

            <!-- Right Side: Action Buttons or Status -->
            <div class="flex flex-col items-end gap-2 min-w-[140px]">
              <!-- Pending Status - Show Action Buttons -->
              <template v-if="invitation.status === 'pending'">
                <button
                  @click="respondToInvitation(invitation.id, 'accept')"
                  :disabled="responding"
                  class="w-full px-6 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {{ responding ? '处理中...' : '接受' }}
                </button>
                <button
                  @click="respondToInvitation(invitation.id, 'reject')"
                  :disabled="responding"
                  class="w-full px-6 py-3 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {{ responding ? '处理中...' : '拒绝' }}
                </button>
              </template>

              <!-- Accepted Status -->
              <div
                v-else-if="invitation.status === 'accepted'"
                class="px-4 py-2 bg-green-100 text-green-700 font-semibold rounded-lg text-center"
              >
                ✓ 已接受
              </div>

              <!-- Rejected Status -->
              <div
                v-else-if="invitation.status === 'rejected'"
                class="px-4 py-2 bg-red-100 text-red-700 font-semibold rounded-lg text-center"
              >
                ✗ 已拒绝
              </div>

              <!-- Expired Status -->
              <div
                v-else-if="invitation.status === 'expired'"
                class="px-4 py-2 bg-gray-100 text-gray-700 font-semibold rounded-lg text-center"
              >
                ⏰ 已过期
              </div>

              <!-- Go to Group Button (for accepted invitations) -->
              <NuxtLink
                v-if="invitation.status === 'accepted'"
                :to="`/study-groups/${invitation.group.id}`"
                class="w-full px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors text-center text-sm"
              >
                进入小组
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="bg-white rounded-xl shadow-md p-12 text-center">
        <svg class="w-24 h-24 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/>
        </svg>
        <h3 class="text-2xl font-bold text-gray-900 mb-2">暂无邀请</h3>
        <p class="text-gray-600 mb-6">{{ getEmptyMessage() }}</p>
        <NuxtLink
          to="/study-groups"
          class="inline-block px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
        >
          浏览学习小组
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '~/stores/auth'

definePageMeta({
  middleware: 'auth'
})

const router = useRouter()
const authStore = useAuthStore()

// Data
const invitations = ref<any[]>([])
const loading = ref(true)
const statusFilter = ref('pending')
const responding = ref(false)

// Computed
const filteredInvitations = computed(() => {
  if (statusFilter.value === 'all') return invitations.value
  return invitations.value.filter(inv => inv.status === statusFilter.value)
})

const pendingCount = computed(() => {
  return invitations.value.filter(inv => inv.status === 'pending').length
})

// Load invitations
const loadInvitations = async () => {
  try {
    loading.value = true
    const response = await $fetch('/api/study-groups/invitations', {
      method: 'GET',
      headers: authStore.getAuthHeader() as HeadersInit,
      query: { status: 'all' }
    }) as any

    if (response.success) {
      invitations.value = response.data
    }
  } catch (error: any) {
    console.error('加载邀请列表失败:', error)
    alert('加载邀请列表失败: ' + (error.data?.message || error.message))
  } finally {
    loading.value = false
  }
}

// Respond to invitation
const respondToInvitation = async (invitationId: string, action: 'accept' | 'reject') => {
  const actionText = action === 'accept' ? '接受' : '拒绝'
  if (!confirm(`确定要${actionText}这个邀请吗？`)) return

  try {
    responding.value = true
    const response = await $fetch(`/api/study-groups/invitations/${invitationId}/respond`, {
      method: 'POST',
      headers: authStore.getAuthHeader() as HeadersInit,
      body: { action }
    }) as any

    if (response.success) {
      alert(response.message)

      // If accepted, optionally redirect to the group
      if (action === 'accept' && response.data?.groupId) {
        if (confirm('是否现在前往该小组？')) {
          router.push(`/study-groups/${response.data.groupId}`)
          return
        }
      }

      // Reload invitations
      await loadInvitations()
    }
  } catch (error: any) {
    console.error('响应邀请失败:', error)
    alert('响应邀请失败: ' + (error.data?.message || error.message))
  } finally {
    responding.value = false
  }
}

// Format date
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (days === 0) return '今天'
  if (days === 1) return '昨天'
  if (days === -1) return '明天'
  if (days < 0) return `${Math.abs(days)} 天后`
  if (days < 7) return `${days} 天前`
  return date.toLocaleDateString('zh-CN')
}

// Get empty message based on filter
const getEmptyMessage = () => {
  switch (statusFilter.value) {
    case 'pending':
      return '您目前没有待处理的邀请'
    case 'accepted':
      return '您还没有接受过任何邀请'
    case 'rejected':
      return '您还没有拒绝过任何邀请'
    case 'expired':
      return '没有已过期的邀请'
    default:
      return '您还没有收到任何邀请'
  }
}

// Load on mount
onMounted(() => {
  loadInvitations()
})
</script>
