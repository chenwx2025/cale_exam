<template>
  <div class="official-outline-section">
    <!-- 标题 -->
    <div class="mb-6">
      <div class="flex items-center justify-between mb-2">
        <h3 class="text-2xl font-bold text-gray-800">官方考试大纲详细分解</h3>
        <span class="px-4 py-2 bg-blue-600 text-white rounded-full text-sm font-semibold">TABLE 27 - Official</span>
      </div>
      <p class="text-gray-600">来源: PSI CALE Examination Bulletin</p>
    </div>

    <!-- Domain Header -->
    <div class="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-t-xl">
      <div class="flex items-center justify-between">
        <div>
          <h4 class="text-xl font-bold mb-1">01. Patient assessment ({{ domain.percentage }}%)</h4>
          <p class="text-blue-100 text-sm">This area assesses the practitioner's knowledge of assessing patient's chief complaint and underlying health conditions using TCM and Western medicine assessment methods, referring the patient to another health care provider if indicated, and identifying and responding to patient emergency situations.</p>
        </div>
      </div>
    </div>

    <!-- Subareas Table -->
    <div class="bg-white rounded-b-xl shadow-lg overflow-hidden border-x border-b border-gray-200">
      <div v-for="(subarea, subareaIndex) in domain.subareas" :key="subarea.id" class="border-b-2 border-gray-300 last:border-b-0">
        <!-- Subarea Header -->
        <div class="bg-gradient-to-r from-indigo-50 to-blue-50 px-6 py-4 border-b-2 border-indigo-200">
          <div class="flex items-center justify-between">
            <div class="flex-1">
              <div class="flex items-center gap-3">
                <span class="px-3 py-1 bg-indigo-600 text-white rounded-full text-xs font-bold">Subarea</span>
                <h5 class="text-lg font-bold text-gray-900">{{ subarea.name }}</h5>
                <span class="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-semibold">{{ subarea.percentage }}%</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Tasks Table -->
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-100 border-b-2 border-gray-300">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider w-5">Task</th>
                <th class="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider w-2/5">Description</th>
                <th class="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider w-5">K#</th>
                <th class="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Associated Knowledge Statement</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <template v-for="(task, taskIndex) in subarea.tasks" :key="task.id">
                <tr
                  v-for="(ks, ksIndex) in task.knowledgeStatements"
                  :key="`${task.id}-${ks.id}`"
                  class="hover:bg-blue-50 transition-colors"
                  :class="{ 'bg-gray-50': taskIndex % 2 === 1 }"
                >
                  <!-- Task ID - only show on first row -->
                  <td
                    v-if="ksIndex === 0"
                    :rowspan="task.knowledgeStatements.length"
                    class="px-6 py-4 text-sm font-bold text-gray-900 align-top border-r border-gray-200"
                  >
                    {{ task.id }}
                  </td>
                  <!-- Task Description - only show on first row -->
                  <td
                    v-if="ksIndex === 0"
                    :rowspan="task.knowledgeStatements.length"
                    class="px-6 py-4 text-sm text-gray-800 align-top border-r border-gray-200"
                  >
                    {{ task.description }}
                  </td>
                  <!-- Knowledge Statement ID -->
                  <td class="px-6 py-4 text-sm font-semibold text-blue-700 align-top border-r border-gray-200">
                    {{ ks.id }}
                  </td>
                  <!-- Knowledge Statement Text -->
                  <td class="px-6 py-4 text-sm text-gray-700 align-top">
                    {{ ks.text }}
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Note -->
    <div class="mt-4 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
      <div class="flex">
        <svg class="w-5 h-5 text-yellow-600 mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path>
        </svg>
        <div class="text-sm text-yellow-800">
          <p class="font-semibold mb-1">数据说明</p>
          <p>此表格展示了官方PSI考试手册中的Domain 1详细任务分解。表格中的百分比(27%)与我们系统中使用的31%略有差异，这可能是由于不同年份的职业分析报告或数据来源差异。建议以最新官方文档为准。</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface KnowledgeStatement {
  id: string
  text: string
}

interface Task {
  id: string
  description: string
  knowledgeStatements: KnowledgeStatement[]
}

interface Subarea {
  id: string
  name: string
  percentage: number
  tasks: Task[]
}

interface Domain {
  code: string
  title: string
  percentage: number
  subareas: Subarea[]
}

const props = defineProps<{
  domain: Domain
}>()
</script>

<style scoped>
table {
  border-collapse: separate;
  border-spacing: 0;
}

thead th {
  position: sticky;
  top: 0;
  background: rgb(243 244 246);
  z-index: 10;
}

tbody tr:hover {
  box-shadow: inset 0 0 0 1px rgba(59, 130, 246, 0.3);
}
</style>
