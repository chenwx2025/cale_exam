<template>
  <div class="mind-map-container bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg p-6 border-2 border-indigo-300">
    <h4 class="font-semibold text-indigo-900 mb-4 flex items-center gap-2">
      <span>🧠</span>
      <span>思维导图</span>
    </h4>

    <div class="bg-white rounded-lg p-6 shadow-inner">
      <!-- 中心节点 -->
      <div class="flex justify-center mb-8">
        <div class="central-node bg-gradient-to-br from-blue-500 to-purple-600 text-white px-8 py-4 rounded-2xl shadow-xl text-center">
          <div class="text-2xl font-bold">{{ title }}</div>
          <div v-if="subtitle" class="text-sm mt-1 opacity-90">{{ subtitle }}</div>
        </div>
      </div>

      <!-- 主要分支 -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div
          v-for="(branch, index) in branches"
          :key="index"
          class="branch-container"
        >
          <!-- 分支标题 -->
          <div
            class="branch-title bg-gradient-to-r text-white px-4 py-3 rounded-lg shadow-md mb-3 cursor-pointer hover:shadow-lg transition-all"
            :class="getBranchColor(index)"
            @click="toggleBranch(index)"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="text-xl">{{ branch.icon }}</span>
                <span class="font-bold">{{ branch.title }}</span>
              </div>
              <span class="text-sm">{{ expandedBranches.has(index) ? '▼' : '▶' }}</span>
            </div>
          </div>

          <!-- 分支内容 -->
          <div v-if="expandedBranches.has(index)" class="branch-content ml-4 space-y-2">
            <div
              v-for="(item, idx) in branch.items"
              :key="idx"
              class="sub-node bg-gray-50 hover:bg-gray-100 px-3 py-2 rounded border-l-4 transition-all"
              :class="getItemBorderColor(index)"
            >
              <div class="font-semibold text-sm text-gray-800">{{ item.title }}</div>
              <div v-if="item.description" class="text-xs text-gray-600 mt-1">{{ item.description }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 关联关系 -->
      <div v-if="connections && connections.length > 0" class="mt-6 pt-6 border-t-2 border-dashed border-gray-300">
        <div class="text-center text-sm font-semibold text-gray-700 mb-3">🔗 相互关系</div>
        <div class="flex flex-wrap justify-center gap-3">
          <div
            v-for="(conn, index) in connections"
            :key="index"
            class="connection-badge bg-gradient-to-r from-pink-500 to-rose-500 text-white px-4 py-2 rounded-full text-xs font-semibold shadow-md"
          >
            {{ conn }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface MindMapItem {
  title: string
  description?: string
}

interface MindMapBranch {
  icon: string
  title: string
  items: MindMapItem[]
}

interface Props {
  title: string
  subtitle?: string
  branches: MindMapBranch[]
  connections?: string[]
}

const props = defineProps<Props>()

// 初始化时展开所有分支
const expandedBranches = ref(new Set<number>())

// 调试输出
onMounted(() => {
  console.log('[MindMap] 组件挂载 - title:', props.title)
  console.log('[MindMap] branches数量:', props.branches?.length)

  // 默认展开所有分支
  if (props.branches) {
    for (let i = 0; i < props.branches.length; i++) {
      expandedBranches.value.add(i)
    }
    console.log('[MindMap] 已展开所有分支:', expandedBranches.value.size)
  }

  if (props.branches && props.branches.length > 0) {
    const firstBranch = props.branches[0]
    console.log('[MindMap] 第一个分支:', firstBranch.title)
    console.log('[MindMap] 第一个分支的items:', firstBranch.items)
    if (firstBranch.items && firstBranch.items.length > 0) {
      console.log('[MindMap] 第一个item:', firstBranch.items[0])
      console.log('[MindMap] 第一个item.title:', firstBranch.items[0]?.title)
    }
  }
})

const toggleBranch = (index: number) => {
  if (expandedBranches.value.has(index)) {
    expandedBranches.value.delete(index)
  } else {
    expandedBranches.value.add(index)
  }
}

const getBranchColor = (index: number) => {
  const colors = [
    'from-blue-500 to-blue-600',
    'from-green-500 to-green-600',
    'from-orange-500 to-orange-600',
    'from-purple-500 to-purple-600',
    'from-pink-500 to-pink-600',
    'from-teal-500 to-teal-600',
  ]
  return colors[index % colors.length]
}

const getItemBorderColor = (index: number) => {
  const colors = [
    'border-blue-400',
    'border-green-400',
    'border-orange-400',
    'border-purple-400',
    'border-pink-400',
    'border-teal-400',
  ]
  return colors[index % colors.length]
}
</script>

<style scoped>
.central-node {
  min-width: 200px;
  animation: pulse-slow 3s ease-in-out infinite;
}

@keyframes pulse-slow {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

.branch-container {
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.sub-node {
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
</style>
