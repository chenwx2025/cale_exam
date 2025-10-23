<template>
  <div class="complete-outline-section">
    <!-- Header -->
    <div class="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-t-2xl p-8 text-white shadow-2xl">
      <div class="flex items-center justify-between mb-4">
        <div>
          <div class="flex items-center gap-4 mb-2">
            <h2 class="text-3xl font-bold">{{ language === 'zh' ? 'TABLE 27 - 官方考试大纲：CALE' : 'TABLE 27 - EXAMINATION OUTLINE: CALE' }}</h2>
            <span class="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-semibold">
              {{ language === 'zh' ? 'PSI 官方文档' : 'Official PSI Document' }}
            </span>
          </div>
          <p class="text-blue-100 text-lg">
            {{ language === 'zh' ? '完整考试大纲，包含任务与知识点详解' : 'Complete Content Outline with Tasks & Knowledge Statements' }}
          </p>
        </div>

        <!-- Language Toggle Button -->
        <div class="flex-shrink-0">
          <button
            @click="toggleLanguage"
            class="flex items-center gap-2 px-6 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg transition-all transform hover:scale-105 border-2 border-white/30"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"></path>
            </svg>
            <span class="font-semibold">{{ language === 'zh' ? '中文' : 'English' }}</span>
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path>
            </svg>
          </button>
        </div>
      </div>

      <!-- Domain Summary Cards -->
      <div class="grid grid-cols-5 gap-3 mt-6">
        <button
          v-for="(domain, key) in allDomains"
          :key="key"
          @click="activeDomain = key as string"
          class="bg-white/10 backdrop-blur-sm hover:bg-white/20 rounded-lg p-4 transition-all transform hover:scale-105"
          :class="{ 'bg-white/30 ring-2 ring-white': activeDomain === key }"
        >
          <div class="text-center">
            <div class="text-2xl font-bold mb-1">{{ domain.percentage }}%</div>
            <div class="text-xs font-semibold opacity-90">{{ getDomainNumber(key as string) }}</div>
            <div class="text-xs opacity-80 mt-1 line-clamp-2">
              {{ language === 'zh' && domain.titleZh ? domain.titleZh : domain.title }}
            </div>
          </div>
        </button>
      </div>
    </div>

    <!-- Domain Content -->
    <div class="bg-white rounded-b-2xl shadow-2xl overflow-hidden">
      <!-- Domain Header -->
      <div class="bg-gradient-to-r from-indigo-50 to-purple-50 px-8 py-6 border-b-2 border-indigo-200">
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <div class="flex items-center gap-4 mb-3">
              <span class="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold">
                {{ getDomainNumber(activeDomain) }}
              </span>
              <h3 class="text-2xl font-bold text-gray-900">
                {{ language === 'zh' && currentDomain.titleZh ? currentDomain.titleZh : currentDomain.title }}
              </h3>
              <span class="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full text-lg font-bold">
                {{ currentDomain.percentage }}%
              </span>
            </div>
            <p class="text-gray-700 leading-relaxed">
              {{ language === 'zh' && currentDomain.descriptionZh ? currentDomain.descriptionZh : currentDomain.description }}
            </p>
          </div>
        </div>
      </div>

      <!-- Subareas -->
      <div class="divide-y-2 divide-gray-200">
        <div
          v-for="(subarea, subareaIndex) in currentDomain.subareas"
          :key="subarea.id"
          class="border-b-2 border-gray-300 last:border-b-0"
        >
          <!-- Subarea Header (Clickable) -->
          <button
            @click="toggleSubarea(activeDomain + '-' + subarea.id)"
            class="w-full bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 px-8 py-5 transition-colors text-left"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-4 flex-1">
                <span class="px-3 py-1 bg-gray-600 text-white rounded-md text-xs font-bold uppercase">
                  {{ language === 'zh' ? '子领域' : 'Subarea' }}
                </span>
                <h4 class="text-lg font-bold text-gray-900">
                  {{ language === 'zh' && subarea.nameZh ? subarea.nameZh : subarea.name }}
                </h4>
                <span class="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-sm font-semibold">
                  {{ subarea.percentage }}%
                </span>
                <span class="text-sm text-gray-600">
                  {{ subarea.tasks.length }} {{ language === 'zh' ? '个任务' : 'Tasks' }}
                </span>
              </div>
              <svg
                class="w-6 h-6 text-gray-500 transition-transform"
                :class="{ 'rotate-180': expandedSubareas.has(activeDomain + '-' + subarea.id) }"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </div>
          </button>

          <!-- Subarea Content (Collapsible) -->
          <div
            v-if="expandedSubareas.has(activeDomain + '-' + subarea.id)"
            class="bg-white"
          >
            <!-- Tasks Table -->
            <div class="overflow-x-auto">
              <table class="w-full">
                <thead class="bg-gradient-to-r from-gray-100 to-gray-200 border-b-2 border-gray-400 sticky top-0 z-10">
                  <tr>
                    <th class="px-6 py-4 text-left text-xs font-bold text-gray-800 uppercase tracking-wider w-20">
                      {{ language === 'zh' ? '任务' : 'Task' }}
                    </th>
                    <th class="px-6 py-4 text-left text-xs font-bold text-gray-800 uppercase tracking-wider w-2/5">
                      {{ language === 'zh' ? '描述' : 'Description' }}
                    </th>
                    <th class="px-6 py-4 text-left text-xs font-bold text-gray-800 uppercase tracking-wider w-16">
                      {{ language === 'zh' ? '知识点#' : 'K#' }}
                    </th>
                    <th class="px-6 py-4 text-left text-xs font-bold text-gray-800 uppercase tracking-wider">
                      {{ language === 'zh' ? '相关知识要求' : 'Associated Knowledge Statement' }}
                    </th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <template v-for="(task, taskIndex) in subarea.tasks" :key="task.id">
                    <tr
                      v-for="(ks, ksIndex) in task.knowledgeStatements"
                      :key="`${task.id}-${ks.id}`"
                      class="hover:bg-indigo-50 transition-colors"
                      :class="{ 'bg-gray-50': taskIndex % 2 === 1 }"
                    >
                      <!-- Task ID -->
                      <td
                        v-if="ksIndex === 0"
                        :rowspan="task.knowledgeStatements.length"
                        class="px-6 py-4 text-center text-sm font-bold text-gray-900 align-top border-r-2 border-gray-300 bg-gray-100"
                      >
                        <div class="flex items-center justify-center">
                          <span class="px-3 py-1 bg-blue-600 text-white rounded-md">{{ task.id }}</span>
                        </div>
                      </td>
                      <!-- Task Description -->
                      <td
                        v-if="ksIndex === 0"
                        :rowspan="task.knowledgeStatements.length"
                        class="px-6 py-4 text-sm text-gray-800 align-top border-r-2 border-gray-300"
                      >
                        <span class="font-medium">
                          {{ language === 'zh' && task.descriptionZh ? task.descriptionZh : task.description }}
                        </span>
                      </td>
                      <!-- Knowledge Statement ID -->
                      <td class="px-6 py-4 text-center text-sm font-bold text-indigo-700 align-top border-r-2 border-gray-300">
                        <span class="px-2 py-1 bg-indigo-100 rounded">{{ ks.id }}</span>
                      </td>
                      <!-- Knowledge Statement Text -->
                      <td class="px-6 py-4 text-sm text-gray-700 align-top leading-relaxed">
                        {{ language === 'zh' && ks.textZh ? ks.textZh : ks.text }}
                      </td>
                    </tr>
                  </template>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Summary Footer -->
    <div class="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border-l-4 border-blue-500">
      <div class="flex items-start">
        <svg class="w-6 h-6 text-blue-600 mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path>
        </svg>
        <div class="flex-1">
          <p class="font-semibold text-blue-900 mb-2">
            {{ language === 'zh' ? '官方考试大纲' : 'Official Examination Outline' }}
          </p>
          <div class="text-sm text-blue-800 space-y-1">
            <p v-if="language === 'zh'">
              • 这是 PSI CALE 官方考试手册中完整的 TABLE 27
            </p>
            <p v-else>
              • This is the complete TABLE 27 from the official PSI CALE Examination Bulletin
            </p>
            <p v-if="language === 'zh'">
              • 总覆盖率：{{ totalPercentage }}%，包含 {{ totalDomains }} 个领域、{{ totalSubareas }} 个子领域和 {{ totalTasks }} 个任务
            </p>
            <p v-else>
              • Total Coverage: {{ totalPercentage }}% across {{ totalDomains }} domains, {{ totalSubareas }} subareas, and {{ totalTasks }} tasks
            </p>
            <p v-if="language === 'zh'">
              • 点击每个子领域以展开查看详细的任务和知识点要求
            </p>
            <p v-else>
              • Click on each subarea to expand and view detailed tasks and knowledge statements
            </p>
            <p v-if="language === 'zh'">
              • 使用顶部的领域卡片在不同内容区域之间切换
            </p>
            <p v-else>
              • Use the domain cards at the top to navigate between different content areas
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface KnowledgeStatement {
  id: string
  text: string
  textZh?: string
}

interface Task {
  id: string
  description: string
  descriptionZh?: string
  knowledgeStatements: KnowledgeStatement[]
}

interface Subarea {
  id: string
  name: string
  nameZh?: string
  percentage: number
  tasks: Task[]
}

interface Domain {
  code: string
  title: string
  titleZh?: string
  percentage: number
  description: string
  descriptionZh?: string
  subareas: Subarea[]
}

interface AllDomains {
  [key: string]: Domain
}

const props = defineProps<{
  allDomains: AllDomains
}>()

const activeDomain = ref('domain1')
const expandedSubareas = ref(new Set<string>())
const language = ref<'en' | 'zh'>('en')

const toggleLanguage = () => {
  language.value = language.value === 'en' ? 'zh' : 'en'
}

const currentDomain = computed(() => props.allDomains[activeDomain.value])

const totalPercentage = computed(() => {
  return Object.values(props.allDomains).reduce((sum, domain) => sum + domain.percentage, 0)
})

const totalDomains = computed(() => Object.keys(props.allDomains).length)

const totalSubareas = computed(() => {
  return Object.values(props.allDomains).reduce((sum, domain) => sum + domain.subareas.length, 0)
})

const totalTasks = computed(() => {
  return Object.values(props.allDomains).reduce((sum, domain) => {
    return sum + domain.subareas.reduce((subSum, subarea) => subSum + subarea.tasks.length, 0)
  }, 0)
})

const getDomainNumber = (key: string) => {
  const match = key.match(/\d+/)
  return match ? `DOMAIN ${match[0]}` : key.toUpperCase()
}

const toggleSubarea = (subareaKey: string) => {
  if (expandedSubareas.value.has(subareaKey)) {
    expandedSubareas.value.delete(subareaKey)
  } else {
    expandedSubareas.value.add(subareaKey)
  }
}

// Auto-expand first subarea of current domain when domain changes
watch(activeDomain, (newDomain) => {
  const domain = props.allDomains[newDomain]
  if (domain && domain.subareas.length > 0) {
    const firstSubareaKey = newDomain + '-' + domain.subareas[0].id
    expandedSubareas.value.add(firstSubareaKey)
  }
}, { immediate: true })
</script>

<style scoped>
table {
  border-collapse: separate;
  border-spacing: 0;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
