<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8">
    <div class="max-w-7xl mx-auto px-4">
      <!-- Loading State -->
      <div v-if="loading" class="text-center py-20">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
        <p class="mt-4 text-gray-600">加载小组信息中...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="text-center py-20">
        <div class="text-6xl mb-4">😢</div>
        <p class="text-xl text-gray-600 mb-4">{{ error }}</p>
        <button
          @click="$router.back()"
          class="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          返回
        </button>
      </div>

      <!-- Group Content -->
      <div v-else-if="group">
        <!-- Back Button -->
        <button
          @click="$router.push('/study-groups')"
          class="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
          </svg>
          返回小组列表
        </button>

        <!-- Group Header -->
        <div class="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <div class="flex items-start justify-between mb-4">
            <div class="flex-1">
              <div class="flex items-center gap-3 mb-2">
                <h1 class="text-3xl font-bold text-gray-800">{{ group.name }}</h1>
                <span
                  :class="[
                    'px-3 py-1 rounded-full text-xs font-semibold',
                    group.isPublic ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                  ]"
                >
                  {{ group.isPublic ? '公开' : '私密' }}
                </span>
                <span class="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                  {{ group.examType === 'cale' ? 'CALE' : 'NCCAOM' }}
                </span>
              </div>
              <p v-if="group.description" class="text-gray-600 mb-4">{{ group.description }}</p>
              <div class="flex items-center gap-6 text-sm text-gray-500">
                <span>创建者: {{ group.createdBy?.name || group.createdBy?.email }}</span>
                <span>成员: {{ members.length }} / {{ group.maxMembers }}</span>
                <span>创建于: {{ formatDate(group.createdAt) }}</span>
              </div>
            </div>
          </div>

          <!-- Join Button (for non-members) -->
          <div v-if="!group.isMember" class="mt-6 pt-6 border-t border-gray-200">
            <button
              @click="joinGroup"
              :disabled="isJoining"
              class="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-lg font-semibold"
            >
              {{ isJoining ? '加入中...' : '加入小组' }}
            </button>
          </div>
        </div>

        <!-- Member Content -->
        <div v-if="group.isMember" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Main Content (Left) -->
          <div class="lg:col-span-2 space-y-6">
            <!-- Tab Navigation -->
            <div class="bg-white rounded-xl shadow-md p-2 flex gap-2">
              <button
                @click="activeTab = 'discussions'"
                :class="[
                  'flex-1 px-4 py-3 rounded-lg font-medium transition-all',
                  activeTab === 'discussions'
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-100'
                ]"
              >
                💬 讨论
              </button>
              <button
                @click="activeTab = 'challenges'"
                :class="[
                  'flex-1 px-4 py-3 rounded-lg font-medium transition-all',
                  activeTab === 'challenges'
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-100'
                ]"
              >
                🏆 挑战
              </button>
            </div>

            <!-- Discussions Tab -->
            <DiscussionsTab
              v-if="activeTab === 'discussions'"
              :group-id="groupId"
            />

            <!-- Challenges Tab -->
            <ChallengesTab
              v-if="activeTab === 'challenges'"
              :group-id="groupId"
              :can-manage="canManage"
              @create-challenge="showCreateChallengeModal = true"
              ref="challengesTabRef"
            />
          </div>

          <!-- Sidebar (Right) -->
          <div class="lg:col-span-1">
            <MembersSidebar
              :group-id="groupId"
              :user-role="userRole"
              :exam-type="group.examType"
              @invite-member="showInviteMemberModal = true"
              @leave-group="leaveGroup"
              @members-updated="handleMembersUpdated"
              ref="membersSidebarRef"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Create Challenge Modal -->
    <CreateChallengeModal
      :show="showCreateChallengeModal"
      :group-id="groupId"
      :exam-type="group?.examType || 'cale'"
      @close="showCreateChallengeModal = false"
      @created="handleChallengeCreated"
    />

    <!-- Invite Member Modal -->
    <InviteMemberModal
      :show="showInviteMemberModal"
      :group-id="groupId"
      @close="showInviteMemberModal = false"
      @invited="handleMemberInvited"
    />
  </div>
</template>

<script setup>
import DiscussionsTab from '~/components/study-groups/DiscussionsTab.vue'
import ChallengesTab from '~/components/study-groups/ChallengesTab.vue'
import MembersSidebar from '~/components/study-groups/MembersSidebar.vue'
import CreateChallengeModal from '~/components/study-groups/CreateChallengeModal.vue'
import InviteMemberModal from '~/components/study-groups/InviteMemberModal.vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const groupId = route.params.id
const group = ref(null)
const members = ref([])
const loading = ref(true)
const error = ref(null)
const activeTab = ref('discussions')
const isJoining = ref(false)
const showCreateChallengeModal = ref(false)
const showInviteMemberModal = ref(false)

const challengesTabRef = ref(null)
const membersSidebarRef = ref(null)

// Computed - use authStore.user directly instead of currentUser ref
const userRole = computed(() => {
  console.log('[Study Group Detail] userRole 计算中...')
  console.log('[Study Group Detail] - group:', group.value ? 'exists' : 'null')
  console.log('[Study Group Detail] - authStore.user:', authStore.user ? authStore.user.id : 'null')
  console.log('[Study Group Detail] - members count:', members.value.length)

  if (!group.value || !authStore.user) {
    console.log('[Study Group Detail] - 返回默认值 member (group或authStore.user为空)')
    return 'member'
  }

  const membership = members.value.find(m => m.user.id === authStore.user.id)
  console.log('[Study Group Detail] - 找到的membership:', membership)
  console.log('[Study Group Detail] - 最终返回的role:', membership?.role || 'member')

  return membership?.role || 'member'
})

const canManage = computed(() => {
  return userRole.value === 'owner' || userRole.value === 'admin'
})

// Load data
onMounted(async () => {
  // Ensure auth store is initialized first
  await authStore.init()
  console.log('[Study Group Detail] Auth store initialized, token:', authStore.accessToken ? 'exists' : 'missing')
  console.log('[Study Group Detail] Auth store user:', authStore.user ? authStore.user.id : 'null')

  await loadGroup()
})

// Load group
async function loadGroup() {
  loading.value = true
  error.value = null

  try {
    console.log('[Study Group Detail] 开始加载小组:', groupId)
    console.log('[Study Group Detail] 使用的token:', authStore.accessToken ? authStore.accessToken.substring(0, 30) + '...' : 'no token')

    const response = await $fetch(`/api/study-groups/${groupId}`, {
      headers: authStore.getAuthHeader()
    })
    console.log('[Study Group Detail] 小组数据加载成功:', response)

    if (response.data) {
      group.value = response.data
    } else {
      console.error('[Study Group Detail] 响应数据格式错误:', response)
      error.value = '数据格式错误'
    }
  } catch (err) {
    console.error('[Study Group Detail] 加载小组失败:', err)

    // Check for authentication error
    if (err.statusCode === 401) {
      error.value = '请先登录后查看小组详情'
      // Redirect to login after a short delay
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    } else if (err.statusCode === 404) {
      error.value = '小组不存在或已被删除'
    } else if (err.data?.message) {
      error.value = err.data.message
    } else {
      error.value = '加载小组信息失败'
    }
  } finally {
    loading.value = false
    console.log('[Study Group Detail] 加载完成，loading:', loading.value, 'error:', error.value)
  }
}

// Join group
async function joinGroup() {
  if (isJoining.value) return

  isJoining.value = true
  try {
    const { error: joinError } = await useFetch(`/api/study-groups/${groupId}/join`, {
      method: 'POST'
    })

    if (joinError.value) {
      console.error('加入小组失败:', joinError.value)
      alert('加入小组失败：' + (joinError.value.data?.message || joinError.value.message))
    } else {
      await loadGroup()
    }
  } catch (err) {
    console.error('加入小组异常:', err)
    alert('加入小组失败')
  } finally {
    isJoining.value = false
  }
}

// Leave group
async function leaveGroup() {
  if (!confirm('确定要退出这个小组吗？')) return

  try {
    const { error: leaveError } = await useFetch(`/api/study-groups/${groupId}/leave`, {
      method: 'POST'
    })

    if (leaveError.value) {
      console.error('退出小组失败:', leaveError.value)
      alert('退出小组失败：' + (leaveError.value.data?.message || leaveError.value.message))
    } else {
      router.push('/study-groups')
    }
  } catch (err) {
    console.error('退出小组异常:', err)
    alert('退出小组失败')
  }
}

// Handle members updated
function handleMembersUpdated(updatedMembers) {
  console.log('[Study Group Detail] handleMembersUpdated 被调用，成员数量:', updatedMembers.length)
  members.value = updatedMembers
  console.log('[Study Group Detail] members.value 已更新，当前数量:', members.value.length)
}

// Handle challenge created
function handleChallengeCreated() {
  // Reload challenges
  if (challengesTabRef.value) {
    challengesTabRef.value.loadChallenges()
  }
}

// Handle member invited
function handleMemberInvited() {
  alert('邀请已发送！')
}

// Format date
function formatDate(dateString) {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}
</script>
