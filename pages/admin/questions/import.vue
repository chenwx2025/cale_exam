<template>
  <div class="p-6">
    <!-- 页面标题 -->
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900">批量导入题目</h1>
      <p class="mt-1 text-sm text-gray-600">支持 CSV 和 JSON 格式的批量导入</p>
    </div>

    <!-- 步骤指示器 -->
    <div class="mb-6 flex items-center justify-center gap-4">
      <div
        v-for="(step, index) in steps"
        :key="index"
        class="flex items-center gap-2"
      >
        <div
          :class="[
            'flex h-10 w-10 items-center justify-center rounded-full font-semibold',
            currentStep >= index
              ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
              : 'bg-gray-200 text-gray-600'
          ]"
        >
          {{ index + 1 }}
        </div>
        <span
          :class="[
            'text-sm font-medium',
            currentStep >= index ? 'text-gray-900' : 'text-gray-500'
          ]"
        >
          {{ step }}
        </span>
        <div
          v-if="index < steps.length - 1"
          :class="[
            'ml-4 h-0.5 w-16',
            currentStep > index ? 'bg-blue-600' : 'bg-gray-200'
          ]"
        ></div>
      </div>
    </div>

    <!-- 步骤 1: 下载模板 -->
    <div v-if="currentStep === 0" class="rounded-lg bg-white p-6 shadow-sm">
      <h2 class="mb-4 text-lg font-semibold text-gray-900">步骤 1: 下载模板文件</h2>
      <p class="mb-4 text-gray-600">选择您想要使用的文件格式，下载模板文件：</p>

      <div class="grid gap-4 md:grid-cols-2">
        <!-- JSON 模板 -->
        <div class="rounded-lg border-2 border-purple-200 bg-purple-50 p-6">
          <div class="mb-3 flex items-center gap-2">
            <span class="text-2xl">📄</span>
            <h3 class="text-lg font-semibold text-purple-900">JSON 格式（推荐）</h3>
          </div>
          <p class="mb-4 text-sm text-purple-700">
            结构化数据，易于编辑，支持复杂字段（数组、对象）
          </p>
          <button
            @click="downloadTemplate('json')"
            class="w-full rounded-lg bg-purple-600 px-4 py-2 text-white hover:bg-purple-700"
          >
            下载 JSON 模板
          </button>
        </div>

        <!-- CSV 模板 -->
        <div class="rounded-lg border-2 border-blue-200 bg-blue-50 p-6">
          <div class="mb-3 flex items-center gap-2">
            <span class="text-2xl">📊</span>
            <h3 class="text-lg font-semibold text-blue-900">CSV 格式</h3>
          </div>
          <p class="mb-4 text-sm text-blue-700">
            表格数据，可用 Excel 编辑，适合批量处理
          </p>
          <button
            @click="downloadTemplate('csv')"
            class="w-full rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            下载 CSV 模板
          </button>
        </div>
      </div>

      <div class="mt-6 rounded-lg bg-yellow-50 p-4">
        <h4 class="mb-2 font-semibold text-yellow-900">💡 字段说明：</h4>
        <ul class="space-y-1 text-sm text-yellow-800">
          <li><strong>question</strong> (必填): 题目内容</li>
          <li><strong>categoryCode</strong> (必填): 分类代码（如 TCM_BASIC）</li>
          <li><strong>correctAnswer</strong> (必填): 正确答案</li>
          <li><strong>examType</strong> (选填): cale 或 nccaom，默认 cale</li>
          <li><strong>options</strong> (选填): 选项数组（JSON 格式）</li>
          <li><strong>explanation</strong> (选填): 答案解析</li>
          <li><strong>difficulty</strong> (选填): easy/medium/hard，默认 medium</li>
          <li><strong>type</strong> (选填): multiple_choice/true_false，默认 multiple_choice</li>
        </ul>
      </div>

      <div class="mt-6 flex justify-end">
        <button
          @click="currentStep = 1"
          class="rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-2 text-white hover:from-blue-700 hover:to-purple-700"
        >
          下一步 →
        </button>
      </div>
    </div>

    <!-- 步骤 2: 上传文件 -->
    <div v-if="currentStep === 1" class="rounded-lg bg-white p-6 shadow-sm">
      <h2 class="mb-4 text-lg font-semibold text-gray-900">步骤 2: 上传填好的文件</h2>

      <div
        @dragover.prevent
        @drop.prevent="handleFileDrop"
        :class="[
          'rounded-lg border-2 border-dashed p-12 text-center transition-colors',
          isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50'
        ]"
        @dragenter="isDragging = true"
        @dragleave="isDragging = false"
      >
        <div class="mb-4 text-6xl">📁</div>
        <p class="mb-2 text-lg font-medium text-gray-900">拖拽文件到此处，或</p>
        <input
          ref="fileInput"
          type="file"
          accept=".json,.csv"
          @change="handleFileSelect"
          class="hidden"
        />
        <button
          @click="$refs.fileInput.click()"
          class="rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700"
        >
          选择文件
        </button>
        <p class="mt-3 text-sm text-gray-500">支持 JSON 和 CSV 格式</p>
      </div>

      <div v-if="selectedFile" class="mt-4 rounded-lg bg-green-50 p-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <span class="text-2xl">✅</span>
            <div>
              <p class="font-medium text-green-900">{{ selectedFile.name }}</p>
              <p class="text-sm text-green-700">{{ formatFileSize(selectedFile.size) }}</p>
            </div>
          </div>
          <button
            @click="selectedFile = null; parsedData = null"
            class="text-red-600 hover:text-red-700"
          >
            ✕
          </button>
        </div>
      </div>

      <div class="mt-6 flex justify-between">
        <button
          @click="currentStep = 0"
          class="rounded-lg border border-gray-300 px-6 py-2 text-gray-700 hover:bg-gray-50"
        >
          ← 上一步
        </button>
        <button
          @click="parseFile"
          :disabled="!selectedFile || parsing"
          class="rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-2 text-white hover:from-blue-700 hover:to-purple-700 disabled:opacity-50"
        >
          {{ parsing ? '解析中...' : '解析并预览 →' }}
        </button>
      </div>
    </div>

    <!-- 步骤 3: 预览和确认 -->
    <div v-if="currentStep === 2" class="rounded-lg bg-white p-6 shadow-sm">
      <h2 class="mb-4 text-lg font-semibold text-gray-900">步骤 3: 预览数据并确认导入</h2>

      <div v-if="parsedData" class="mb-4 rounded-lg bg-blue-50 p-4">
        <p class="text-blue-900">
          共解析到 <strong>{{ parsedData.length }}</strong> 条题目数据
        </p>
      </div>

      <div v-if="parsedData && parsedData.length > 0" class="mb-4 overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-gray-100">
            <tr>
              <th class="px-4 py-2 text-left">#</th>
              <th class="px-4 py-2 text-left">题目</th>
              <th class="px-4 py-2 text-left">分类</th>
              <th class="px-4 py-2 text-left">考试</th>
              <th class="px-4 py-2 text-left">难度</th>
              <th class="px-4 py-2 text-left">正确答案</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(item, index) in parsedData.slice(0, 10)"
              :key="index"
              class="border-b"
            >
              <td class="px-4 py-2">{{ index + 1 }}</td>
              <td class="px-4 py-2">{{ item.question?.substring(0, 50) }}...</td>
              <td class="px-4 py-2">{{ item.categoryCode }}</td>
              <td class="px-4 py-2">{{ item.examType || 'cale' }}</td>
              <td class="px-4 py-2">{{ item.difficulty || 'medium' }}</td>
              <td class="px-4 py-2">{{ item.correctAnswer?.substring(0, 30) }}</td>
            </tr>
          </tbody>
        </table>
        <p v-if="parsedData.length > 10" class="mt-2 text-center text-sm text-gray-500">
          仅显示前 10 条，共 {{ parsedData.length }} 条
        </p>
      </div>

      <div class="mt-6 flex justify-between">
        <button
          @click="currentStep = 1"
          class="rounded-lg border border-gray-300 px-6 py-2 text-gray-700 hover:bg-gray-50"
        >
          ← 上一步
        </button>
        <button
          @click="importData"
          :disabled="importing || !parsedData || parsedData.length === 0"
          class="rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-2 text-white hover:from-blue-700 hover:to-purple-700 disabled:opacity-50"
        >
          {{ importing ? '导入中...' : '确认导入' }}
        </button>
      </div>
    </div>

    <!-- 步骤 4: 导入结果 -->
    <div v-if="currentStep === 3" class="rounded-lg bg-white p-6 shadow-sm">
      <h2 class="mb-4 text-lg font-semibold text-gray-900">导入完成！</h2>

      <div v-if="importResult" class="space-y-4">
        <!-- 统计卡片 -->
        <div class="grid gap-4 md:grid-cols-3">
          <div class="rounded-lg bg-blue-50 p-4">
            <p class="text-sm text-blue-700">总数</p>
            <p class="text-2xl font-bold text-blue-900">{{ importResult.total }}</p>
          </div>
          <div class="rounded-lg bg-green-50 p-4">
            <p class="text-sm text-green-700">成功</p>
            <p class="text-2xl font-bold text-green-900">{{ importResult.success }}</p>
          </div>
          <div class="rounded-lg bg-red-50 p-4">
            <p class="text-sm text-red-700">失败</p>
            <p class="text-2xl font-bold text-red-900">{{ importResult.failed }}</p>
          </div>
        </div>

        <!-- 错误列表 -->
        <div v-if="importResult.errors && importResult.errors.length > 0" class="mt-4">
          <h3 class="mb-2 font-semibold text-red-900">失败的记录：</h3>
          <div class="max-h-64 overflow-y-auto rounded-lg bg-red-50 p-4">
            <div
              v-for="(error, index) in importResult.errors"
              :key="index"
              class="mb-2 border-b border-red-200 pb-2 last:border-0"
            >
              <p class="text-sm font-medium text-red-900">第 {{ error.row }} 行</p>
              <p class="text-sm text-red-700">题目: {{ error.question }}</p>
              <p class="text-sm text-red-600">错误: {{ error.error }}</p>
            </div>
          </div>
        </div>
      </div>

      <div class="mt-6 flex justify-center gap-4">
        <button
          @click="resetImport"
          class="rounded-lg border border-gray-300 px-6 py-2 text-gray-700 hover:bg-gray-50"
        >
          重新导入
        </button>
        <NuxtLink
          to="/admin/questions"
          class="rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-2 text-white hover:from-blue-700 hover:to-purple-700"
        >
          查看题目列表
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

const steps = ['下载模板', '上传文件', '预览确认', '导入完成']
const currentStep = ref(0)
const selectedFile = ref<File | null>(null)
const parsedData = ref<any[] | null>(null)
const importResult = ref<any>(null)
const parsing = ref(false)
const importing = ref(false)
const isDragging = ref(false)

// 下载模板
const downloadTemplate = (format: string) => {
  window.open(`/api/admin/questions/template?format=${format}`, '_blank')
}

// 文件拖放
const handleFileDrop = (e: DragEvent) => {
  isDragging.value = false
  const files = e.dataTransfer?.files
  if (files && files.length > 0) {
    selectedFile.value = files[0]
  }
}

// 文件选择
const handleFileSelect = (e: Event) => {
  const target = e.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    selectedFile.value = target.files[0]
  }
}

// 格式化文件大小
const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
}

// 解析文件
const parseFile = async () => {
  if (!selectedFile.value) return

  parsing.value = true
  try {
    const text = await selectedFile.value.text()
    const fileName = selectedFile.value.name.toLowerCase()

    if (fileName.endsWith('.json')) {
      parsedData.value = JSON.parse(text)
    } else if (fileName.endsWith('.csv')) {
      parsedData.value = parseCSV(text)
    } else {
      throw new Error('不支持的文件格式')
    }

    currentStep.value = 2
  } catch (error: any) {
    alert('文件解析失败: ' + error.message)
  } finally {
    parsing.value = false
  }
}

// 简单的 CSV 解析器
const parseCSV = (text: string) => {
  const lines = text.split('\n').filter(line => line.trim())
  if (lines.length < 2) return []

  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''))
  const data = []

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''))
    const obj: any = {}

    headers.forEach((header, index) => {
      let value = values[index] || ''

      // 尝试解析 JSON 字符串
      if (value.startsWith('[') || value.startsWith('{')) {
        try {
          obj[header] = JSON.parse(value)
        } catch {
          obj[header] = value
        }
      } else {
        obj[header] = value
      }
    })

    data.push(obj)
  }

  return data
}

// 导入数据
const importData = async () => {
  if (!parsedData.value) return

  importing.value = true
  try {
    const { data } = await $fetch('/api/admin/questions/import', {
      method: 'POST',
      body: { questions: parsedData.value }
    })

    importResult.value = data
    currentStep.value = 3
  } catch (error: any) {
    console.error('Import failed:', error)
    alert('导入失败: ' + (error.data?.message || error.message))
  } finally {
    importing.value = false
  }
}

// 重置导入
const resetImport = () => {
  currentStep.value = 0
  selectedFile.value = null
  parsedData.value = null
  importResult.value = null
}
</script>
