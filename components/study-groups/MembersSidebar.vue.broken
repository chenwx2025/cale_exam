<template>
  <div class="space-y-6">
    <!-- Join Requests Card (for admins/moderators) -->
    <JoinRequestsCard
      v-if="canManage"
      :group-id="groupId"
      @request-processed="loadMembers"
    />

    <!-- Check-in Card -->
    <div class="bg-white rounded-xl shadow-md p-6">
      <h3 class="text-lg font-semibold text-gray-800 mb-4">📅 每日打卡</h3>

      <div v-if="checkInLoading" class="text-center py-4">
        <div class="inline-block animate-spin rounded-full h-6 w-6 border-3 border-blue-500 border-t-transparent"></div>
      </div>

      <div v-else>
        <!-- Check-in Status -->
        <div v-if="todayCheckIn" class="text-center py-4">
          <div class="text-4xl mb-2">✅</div>
          <p class="text-green-600 font-medium">今日已打卡</p>
          <p class="text-sm text-gray-500 mt-1">连续打卡 {{ checkInStats.currentStreak }} 天</p>
        </div>

        <div v-else class="text-center py-4">
          <button
            @click="doCheckIn"
            :disabled="checkingIn"
            class="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
          >
            {{ checkingIn ? '打卡中...' : '立即打卡' }}
          </button>
        </div>

        <!-- Check-in Stats -->
        <div class="mt-4 grid grid-cols-2 gap-3">
          <div class="bg-blue-50 rounded-lg p-3 text-center">
            <div class="text-2xl font-bold text-blue-600">{{ checkInStats.currentStreak }}</div>
            <div class="text-xs text-gray-600 mt-1">连续天数</div>
          </div>
          <div class="bg-purple-50 rounded-lg p-3 text-center">
            <div class="text-2xl font-bold text-purple-600">{{ checkInStats.totalCheckIns }}</div>
            <div class="text-xs text-gray-600 mt-1">累计打卡</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Daily Question Card -->
    <div class="bg-white rounded-xl shadow-md p-6">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-semibold text-gray-800">📝 每日一题</h3>
        <button
          v-if="canManage"
          @click="showSettingsModal = true"
          class="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
          title="每日一题设置"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
          </svg>
        </button>
      </div>

      <div v-if="dailyQuestionLoading" class="text-center py-4">
        <div class="inline-block animate-spin rounded-full h-6 w-6 border-3 border-blue-500 border-t-transparent"></div>
      </div>

      <div v-else-if="dailyQuestion" class="space-y-3">
        <div class="text-sm text-gray-700">
          <div class="font-medium mb-2">{{ dailyQuestion.question?.questionText }}</div>
          <div class="text-xs text-gray-500">{{ dailyQuestion.question?.domain }}</div>
        </div>

        <div v-if="dailyQuestion.hasAnswered" class="text-center py-2">
          <div class="text-green-600 font-medium">✓ 已完成</div>
        </div>

        <button
          v-else
          @click="goToQuestion"
          class="w-full px-4 py-2 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-lg hover:from-green-600 hover:to-blue-700 transition-all font-medium text-sm"
        >
          开始答题
        </button>
      </div>

      <div v-else class="text-center py-4 text-gray-500 text-sm">
        暂无今日题目
      </div>
    </div>

    <!-- Members Card -->
    <div class="bg-white rounded-xl shadow-md p-6 overflow-visible">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-semibold text-gray-800">成员 ({{ members.length }})</h3>
        <button
          v-if="canManage"
          @click="$emit('invite-member')"
          class="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          title="邀请成员"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
          </svg>
        </button>
      </div>

      <!-- Loading -->
      <div v-if="loadingMembers" class="text-center py-4">
        <div class="inline-block animate-spin rounded-full h-6 w-6 border-3 border-blue-500 border-t-transparent"></div>
      </div>

      <!-- Members List -->
      <div v-else class="space-y-3 max-h-96 overflow-y-auto overflow-x-visible">
        <div
          v-for="member in members"
          :key="member.id"
          class="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors"
        >
          <div
            class="flex items-center gap-3 flex-1 min-w-0 cursor-pointer"
            @click="viewMemberProfile(member)"
          >
            <div class="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
              {{ member.user.name?.charAt(0) || member.user.email.charAt(0) }}
            </div>
            <div class="min-w-0 flex-1">
              <div class="font-medium text-gray-900 truncate">
                {{ member.user.name || member.user.email }}
              </div>
              <div class="text-xs text-gray-500">
                {{ formatRole(member.role) }}
              </div>
            </div>
          </div>

          <!-- Actions Dropdown -->
          <div v-if="canManageMember(member)" class="relative" @click.stop>
            <button
              :ref="el => memberButtonRefs[member.id] = el"
              @click="toggleMemberMenu(member.id)"
              class="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
              title="管理成员"
            >
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Leave Group Button -->
      <div v-if="!isOwner" class="mt-4 pt-4 border-t border-gray-200">
        <button
          @click="$emit('leave-group')"
          class="w-full px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
        >
          退出小组
        </button>
      </div>
    </div>

    <!-- Dropdown Menus (Rendered outside scroll container using Teleport) -->
    <Teleport to="body">
      <template v-for="member in members" :key="`menu-${member.id}`">
        <div
          v-if="activeMemberMenu === member.id && canManageMember(member)"
          :style="getMenuPosition(member.id)"
          class="fixed w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-1"
          style="z-index: 9999;"
          @click.stop
        >
          <!-- Change Role -->
          <div v-if="canChangeRole(member)" class="px-3 py-2 text-xs text-gray-500 font-medium">
            更改角色
          </div>
          <button
            v-if="canChangeRole(member) && member.role !== 'admin'"
            @click="changeRole(member.id, 'admin')"
            class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
          >
            设为管理员
          </button>
          <button
            v-if="canChangeRole(member) && member.role !== 'moderator'"
            @click="changeRole(member.id, 'moderator')"
            class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
          >
            设为版主
          </button>
          <button
            v-if="canChangeRole(member) && member.role !== 'member'"
            @click="changeRole(member.id, 'member')"
            class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
          >
            设为普通成员
          </button>

          <!-- Remove Member -->
          <div v-if="canChangeRole(member)" class="border-t border-gray-200 my-1"></div>
          <button
            v-if="canRemoveMember(member)"
            @click="removeMember(member.id)"
            class="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
          >
            移除成员
          </button>
        </div>
      </template>
    </Teleport>

    <!-- Daily Question Settings Modal -->
    <DailyQuestionSettingsModal
      :show="showSettingsModal"
      :group-id="groupId"
      :exam-type="examType"
      @close="showSettingsModal = false"
      @saved="onSettingsSaved"
    />
  </div>
</template>

<script setup>
import DailyQuestionSettingsModal from './DailyQuestionSettingsModal.vue'
import JoinRequestsCard from './JoinRequestsCard.vue'

const props = defineProps({
  groupId: {
    type: String,
    required: true
  },
  userRole: {
    type: String,
    default: 'member'
  },
  examType: {
    type: String,
    default: 'cale'
  }
})

const emit = defineEmits(['invite-member', 'leave-group', 'members-updated'])

const authStore = useAuthStore()
const router = useRouter()
const members = ref([])
const loadingMembers = ref(false)
const activeMemberMenu = ref(null)
const currentUser = computed(() => authStore.user)
const memberButtonRefs = ref({})

// Check-in state
const checkInLoading = ref(false)
const checkingIn = ref(false)
const todayCheckIn = ref(null)
const checkInStats = ref({
  currentStreak: 0,
  longestStreak: 0,
  totalCheckIns: 0
})

// Daily question state
const dailyQuestionLoading = ref(false)
const dailyQuestion = ref(null)

// Settings modal state
const showSettingsModal = ref(false)

// Computed
const isOwner = computed(() => {
  console.log('[MembersSidebar] isOwner check, userRole:', props.userRole)
  return props.userRole === 'owner'
})
const isAdmin = computed(() => {
  console.log('[MembersSidebar] isAdmin check, userRole:', props.userRole)
  return props.userRole === 'owner' || props.userRole === 'admin'
})
const canManage = computed(() => {
  const result = isOwner.value || isAdmin.value
  console.log('[MembersSidebar] canManage check, userRole:', props.userRole, 'result:', result)
  return result
})

// Load members on mount
onMounted(async () => {
  await authStore.init()
  await Promise.all([
    loadMembers(),
    loadCheckInStatus(),
    loadDailyQuestion()
  ])

  // Close dropdown when clicking outside
  document.addEventListener('click', closeAllMenus)
})

onUnmounted(() => {
  document.removeEventListener('click', closeAllMenus)
})

// Load members
async function loadMembers() {
  loadingMembers.value = true
  try {
    console.log('[MembersSidebar] 开始加载成员, groupId:', props.groupId)
    const { data, error } = await useFetch(`/api/study-groups/${props.groupId}/members`, {
      headers: authStore.getAuthHeader()
    })
    if (error.value) {
      console.error('[MembersSidebar] 加载成员失败:', error.value)
    } else if (data.value) {
      members.value = data.value.data || []
      console.log('[MembersSidebar] 加载到成员数量:', members.value.length)
      emit('members-updated', members.value)
    }
  } catch (err) {
    console.error('[MembersSidebar] 加载成员异常:', err)
  } finally {
    loadingMembers.value = false
  }
}

// Toggle member menu
function toggleMemberMenu(memberId) {
  console.log('[MembersSidebar] toggleMemberMenu 被调用, memberId:', memberId)
  console.log('[MembersSidebar] 当前 activeMemberMenu:', activeMemberMenu.value)
  activeMemberMenu.value = activeMemberMenu.value === memberId ? null : memberId
  console.log('[MembersSidebar] 更新后 activeMemberMenu:', activeMemberMenu.value)
}

// View member profile
function viewMemberProfile(member) {
  console.log('[MembersSidebar] 点击查看成员资料:', member.user.name)
  // TODO: 未来可以跳转到成员资料页
  // router.push(`/profile/${member.user.id}`)
  alert(`查看成员: ${member.user.name || member.user.email}\n角色: ${formatRole(member.role)}`)
}

// Get menu position for Teleport dropdown
function getMenuPosition(memberId) {
  const buttonEl = memberButtonRefs.value[memberId]
  if (!buttonEl) return { top: '0px', left: '0px' }

  const rect = buttonEl.getBoundingClientRect()
  return {
    top: `${rect.bottom + 8}px`,  // 8px below the button
    left: `${rect.right - 192}px`  // 192px is menu width (w-48 = 12rem = 192px)
  }
}

// Close all menus
function closeAllMenus() {
  activeMemberMenu.value = null
}

// Check if can manage member
function canManageMember(member) {
  console.log('[MembersSidebar] canManageMember check for:', member.user.name)
  console.log('[MembersSidebar] - currentUser:', currentUser.value)
  console.log('[MembersSidebar] - canManage:', canManage.value)
  console.log('[MembersSidebar] - member.user.id:', member.user.id)
  console.log('[MembersSidebar] - currentUser.id:', currentUser.value?.id)

  if (!currentUser.value) {
    console.log('[MembersSidebar] - 返回 false: 没有 currentUser')
    return false
  }
  if (member.user.id === currentUser.value.id) {
    console.log('[MembersSidebar] - 返回 false: 是当前用户自己')
    return false
  }
  console.log('[MembersSidebar] - 返回 canManage.value:', canManage.value)
  return canManage.value
}

// Check if can change role
function canChangeRole(member) {
  if (props.userRole === 'owner') return member.role !== 'owner'
  if (props.userRole === 'admin') return member.role === 'member' || member.role === 'moderator'
  return false
}

// Check if can remove member
function canRemoveMember(member) {
  if (props.userRole === 'owner') return member.role !== 'owner'
  if (props.userRole === 'admin') return member.role !== 'owner' && member.role !== 'admin'
  if (props.userRole === 'moderator') return member.role === 'member'
  return false
}

// Change role
async function changeRole(memberId, newRole) {
  try {
    const { error } = await useFetch(`/api/study-groups/${props.groupId}/members/${memberId}/role`, {
      method: 'POST',
      body: { role: newRole }
    })

    if (error.value) {
      console.error('更改角色失败:', error.value)
      alert('更改角色失败')
    } else {
      await loadMembers()
      activeMemberMenu.value = null
    }
  } catch (err) {
    console.error('更改角色异常:', err)
    alert('更改角色失败')
  }
}

// Remove member
async function removeMember(memberId) {
  if (!confirm('确定要移除这个成员吗？')) return

  try {
    const { error } = await useFetch(`/api/study-groups/${props.groupId}/members/${memberId}/remove`, {
      method: 'POST'
    })

    if (error.value) {
      console.error('移除成员失败:', error.value)
      alert('移除成员失败')
    } else {
      await loadMembers()
      activeMemberMenu.value = null
    }
  } catch (err) {
    console.error('移除成员异常:', err)
    alert('移除成员失败')
  }
}

// Load check-in status
async function loadCheckInStatus() {
  console.log('[MembersSidebar] 开始加载打卡状态')
  checkInLoading.value = true
  try {
    const [statusRes, statsRes] = await Promise.all([
      $fetch(`/api/study-groups/${props.groupId}/check-in`, {
        headers: authStore.getAuthHeader()
      }),
      $fetch(`/api/study-groups/${props.groupId}/check-in/stats?period=7`, {
        headers: authStore.getAuthHeader()
      })
    ])

    console.log('[MembersSidebar] 状态响应:', statusRes)
    console.log('[MembersSidebar] 统计响应:', statsRes)

    if (statusRes && statusRes.data) {
      todayCheckIn.value = statusRes.data.todayCheckIn
      console.log('[MembersSidebar] 设置 todayCheckIn =', todayCheckIn.value)
    }

    if (statsRes && statsRes.data) {
      checkInStats.value = statsRes.data
      console.log('[MembersSidebar] 设置 checkInStats =', checkInStats.value)
    }
  } catch (err) {
    console.error('[MembersSidebar] 加载打卡状态失败:', err)
  } finally {
    checkInLoading.value = false
    console.log('[MembersSidebar] 打卡状态加载完成')
  }
}

// Do check-in
async function doCheckIn() {
  console.log('[MembersSidebar] doCheckIn 被调用')
  console.log('[MembersSidebar] groupId:', props.groupId)
  console.log('[MembersSidebar] checkingIn 状态:', checkingIn.value)

  checkingIn.value = true
  console.log('[MembersSidebar] 设置 checkingIn = true')

  try {
    const url = `/api/study-groups/${props.groupId}/check-in`
    console.log('[MembersSidebar] 准备发送 POST 请求到:', url)
    console.log('[MembersSidebar] Headers:', authStore.getAuthHeader())

    const response = await $fetch(url, {
      method: 'POST',
      headers: authStore.getAuthHeader(),
      body: {} // 发送空对象作为body
    })

    console.log('[MembersSidebar] 收到响应:', response)

    if (response && response.success) {
      console.log('[MembersSidebar] 打卡成功，重新加载状态')
      await loadCheckInStatus()
    } else {
      console.log('[MembersSidebar] 响应不成功:', response)
    }
  } catch (err) {
    console.error('[MembersSidebar] 打卡失败:', err)
    console.error('[MembersSidebar] 错误详情:', err.data)
    alert('打卡失败: ' + (err.data?.message || err.message))
  } finally {
    checkingIn.value = false
    console.log('[MembersSidebar] 设置 checkingIn = false')
  }
}

// Load daily question
async function loadDailyQuestion() {
  dailyQuestionLoading.value = true
  try {
    const response = await $fetch(`/api/study-groups/${props.groupId}/daily-question`, {
      headers: authStore.getAuthHeader()
    })

    if (response && response.data) {
      dailyQuestion.value = response.data
    }
  } catch (err) {
    console.error('[MembersSidebar] 加载每日一题失败:', err)
  } finally {
    dailyQuestionLoading.value = false
  }
}

// Go to question
function goToQuestion() {
  if (dailyQuestion.value && dailyQuestion.value.question) {
    router.push(`/questions/${dailyQuestion.value.question.id}`)
  }
}

// Handle settings saved
async function onSettingsSaved() {
  console.log('[MembersSidebar] 每日一题设置已保存，重新加载每日一题')
  await loadDailyQuestion()
}

// Format role
function formatRole(role) {
  const roles = {
    'owner': '组长',
    'admin': '管理员',
    'moderator': '版主',
    'member': '成员'
  }
  return roles[role] || role
}

// Expose methods for parent
defineExpose({
  loadMembers
})
</script>
