<template>
  <div class="space-y-6">
    <!-- Join Requests Card (for admins/moderators) -->
    <JoinRequestsCard
      v-if="canManage"
      :group-id="groupId"
      @request-processed="loadMembers"
    />

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

  </div>
</template>

<script setup>
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
  },
  initialMembers: {
    type: Array,
    default: () => []
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

  // Use initial members if provided, otherwise load from API
  if (props.initialMembers && props.initialMembers.length > 0) {
    console.log('[MembersSidebar] 使用初始成员数据，数量:', props.initialMembers.length)
    members.value = props.initialMembers
  } else {
    console.log('[MembersSidebar] 没有初始成员数据，从API加载')
    await loadMembers()
  }

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
    const response = await $fetch(`/api/study-groups/${props.groupId}/members`, {
      headers: authStore.getAuthHeader()
    })
    console.log('[MembersSidebar] API响应:', response)
    if (response && response.data) {
      members.value = response.data || []
      console.log('[MembersSidebar] 加载到成员数量:', members.value.length)
      emit('members-updated', members.value)
    } else {
      console.error('[MembersSidebar] 响应格式错误:', response)
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
