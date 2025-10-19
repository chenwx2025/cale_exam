<template>
  <div class="min-h-screen bg-gray-50">
    <!-- 导航栏 -->
    <nav class="bg-white shadow-md">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <NuxtLink to="/" class="text-2xl font-bold text-blue-600">
              Cale 加州中医考试系统
            </NuxtLink>
          </div>

          <div class="flex items-center space-x-4">
            <NuxtLink
              to="/outline"
              class="px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors"
              active-class="bg-blue-100 text-blue-700"
            >
              考试大纲
            </NuxtLink>
            <NuxtLink
              to="/study-plan"
              class="px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors"
              active-class="bg-blue-100 text-blue-700"
            >
              复习计划
            </NuxtLink>
            <NuxtLink
              to="/exam"
              class="px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors"
              active-class="bg-blue-100 text-blue-700"
            >
              模拟考试
            </NuxtLink>
            <NuxtLink
              to="/admin"
              class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              管理后台
            </NuxtLink>
          </div>
        </div>
      </div>
    </nav>

    <!-- 主内容区域 -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <slot />
    </main>

    <!-- 页脚 -->
    <footer class="bg-white border-t mt-12">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <p class="text-center text-gray-600">
          © 2025 Cale 加州中医考试系统 - 祝您考试顺利！
        </p>
      </div>
    </footer>
  </div>
</template>
