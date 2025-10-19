<template>
  <div>
    <!-- 考试选择器 -->
    <ExamSelector :showDescription="false" class="mb-6" />

    <h1 class="text-3xl font-bold mb-6">{{ examStore.currentExam.name }} 考试大纲</h1>

    <!-- 考试概览卡片 -->
    <div v-if="examInfo" class="mb-8 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-lg overflow-hidden">
      <div class="p-8">
        <div class="flex items-start justify-between mb-6">
          <div>
            <h2 class="text-2xl font-bold text-gray-800 mb-2">{{ examInfo.fullName }}</h2>
            <p class="text-lg text-gray-600">{{ examInfo.nameEn }}</p>
          </div>
          <div class="text-right">
            <div class="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-full font-semibold">
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              及格分数: {{ examInfo.passingScore }}%
            </div>
          </div>
        </div>

        <!-- 考试基本信息网格 -->
        <div class="grid md:grid-cols-4 gap-4 mb-6">
          <div class="bg-white rounded-xl p-4 shadow-sm">
            <div class="flex items-center text-blue-600 mb-2">
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <span class="text-sm font-semibold">考试时长</span>
            </div>
            <div class="text-2xl font-bold text-gray-800">{{ examInfo.duration }} <span class="text-sm text-gray-600">分钟</span></div>
          </div>

          <div class="bg-white rounded-xl p-4 shadow-sm">
            <div class="flex items-center text-green-600 mb-2">
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              <span class="text-sm font-semibold">总题数</span>
            </div>
            <div class="text-2xl font-bold text-gray-800">{{ examInfo.totalQuestions }} <span class="text-sm text-gray-600">题</span></div>
          </div>

          <div class="bg-white rounded-xl p-4 shadow-sm">
            <div class="flex items-center text-purple-600 mb-2">
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <span class="text-sm font-semibold">考试费用</span>
            </div>
            <div class="text-2xl font-bold text-gray-800">{{ examInfo.examFee }}</div>
          </div>

          <div class="bg-white rounded-xl p-4 shadow-sm">
            <div class="flex items-center text-orange-600 mb-2">
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
              </svg>
              <span class="text-sm font-semibold">考试形式</span>
            </div>
            <div class="text-lg font-bold text-gray-800">{{ examInfo.examFormat }}</div>
          </div>
        </div>

        <!-- 考试内容概述 -->
        <div class="bg-white rounded-xl p-6 mb-4">
          <h3 class="font-bold text-lg mb-3 text-gray-800">考试内容概述</h3>
          <div class="text-gray-700 whitespace-pre-line leading-relaxed">{{ examInfo.contentOverview }}</div>
        </div>

        <!-- 展开更多信息 -->
        <button
          @click="showMoreInfo = !showMoreInfo"
          class="w-full flex items-center justify-center gap-2 py-3 text-blue-600 font-semibold hover:bg-blue-50 rounded-xl transition-colors"
        >
          <span>{{ showMoreInfo ? '收起' : '查看更多信息' }}</span>
          <svg
            class="w-5 h-5 transition-transform"
            :class="{ 'rotate-180': showMoreInfo }"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        </button>

        <!-- 更多详细信息（可折叠） -->
        <div v-if="showMoreInfo" class="mt-4 space-y-4 animate-fade-in">
          <div class="bg-white rounded-xl p-6">
            <h3 class="font-bold text-lg mb-3 text-gray-800 flex items-center">
              <svg class="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              备考建议
            </h3>
            <div class="text-gray-700 whitespace-pre-line leading-relaxed">{{ examInfo.preparationTips }}</div>
          </div>

          <div class="grid md:grid-cols-2 gap-4">
            <div class="bg-white rounded-xl p-6">
              <h3 class="font-bold text-lg mb-3 text-gray-800">重考政策</h3>
              <p class="text-gray-700">{{ examInfo.retakePolicy }}</p>
            </div>

            <div class="bg-white rounded-xl p-6">
              <h3 class="font-bold text-lg mb-3 text-gray-800">证书有效期</h3>
              <p class="text-gray-700">{{ examInfo.validityPeriod }}</p>
            </div>
          </div>

          <div class="bg-white rounded-xl p-6" v-if="examInfo.officialWebsite">
            <h3 class="font-bold text-lg mb-3 text-gray-800">官方网站</h3>
            <a :href="examInfo.officialWebsite" target="_blank" class="text-blue-600 hover:underline">
              {{ examInfo.officialWebsite }}
            </a>
          </div>
        </div>
      </div>
    </div>

    <!-- PSI 考试规则和须知（仅CALE考试显示） -->
    <div v-if="currentExamType === 'cale'" class="mb-8">
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
        <h2 class="text-2xl font-bold">PSI 考试规则和须知</h2>
        <!-- PDF下载按钮 -->
        <a
          href="/documents/cale-exam-bulletin-psi.pdf"
          download="CALE考试手册-PSI.pdf"
          class="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg shadow-lg hover:from-blue-700 hover:to-blue-800 transform hover:scale-105 transition-all duration-200"
        >
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
          下载完整考试手册 (PDF)
        </a>
      </div>
      <!-- 考试预约说明 -->
      <div class="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border-l-4 border-blue-500">
        <div class="flex items-start">
          <svg class="w-6 h-6 text-blue-600 mr-3 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path>
          </svg>
          <div>
            <h3 class="text-lg font-bold text-gray-800 mb-2">预约前须知</h3>
            <p class="text-gray-700 leading-relaxed">
              收到加州针灸局（Acupuncture Board）的考试资格通知后，您可以通过<strong>线上</strong>或<strong>电话</strong>两种方式预约考试。建议优先选择线上预约，可24小时随时操作。
            </p>
          </div>
        </div>
      </div>

      <div class="grid md:grid-cols-2 gap-4">
        <!-- 线上预约 -->
        <div class="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
          <div class="flex items-center mb-4">
            <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
              <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
              </svg>
            </div>
            <div>
              <h3 class="text-lg font-bold text-gray-800">线上预约</h3>
              <span class="text-xs text-blue-600 font-semibold">推荐 • 24小时可用</span>
            </div>
          </div>

          <div class="mb-4">
            <a
              href="https://test-takers.psiexams.com/caacupuncture"
              target="_blank"
              class="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors mb-3"
            >
              <div class="flex items-center justify-center">
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                </svg>
                访问 PSI 官网预约
              </div>
            </a>
          </div>

          <div class="space-y-3 text-sm">
            <div class="flex items-start">
              <div class="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-xs mr-3 mt-0.5">1</div>
              <p class="text-gray-700">访问 PSI 官网，线上填写《考试报名表》</p>
            </div>
            <div class="flex items-start">
              <div class="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-xs mr-3 mt-0.5">2</div>
              <p class="text-gray-700">提交信息后，系统将显示可预约的考试日期</p>
            </div>
            <div class="flex items-start">
              <div class="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-xs mr-3 mt-0.5">3</div>
              <p class="text-gray-700">选择合适的考试日期和地点，完成报名</p>
            </div>
            <div class="flex items-start">
              <div class="flex-shrink-0 w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center font-bold text-xs mr-3 mt-0.5">✓</div>
              <p class="text-gray-700">报名成功后，您将收到<strong class="text-green-600">可追溯的确认代码</strong></p>
            </div>
          </div>
        </div>

        <!-- 电话预约 -->
        <div class="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
          <div class="flex items-center mb-4">
            <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
              <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
              </svg>
            </div>
            <h3 class="text-lg font-bold text-gray-800">电话预约</h3>
          </div>

          <div class="space-y-4">
            <!-- 客服电话 -->
            <div class="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
              <div class="flex items-center justify-between mb-2">
                <span class="text-sm font-semibold text-gray-700">客服电话</span>
                <span class="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">语音服务</span>
              </div>
              <a href="tel:8773926422" class="text-2xl font-bold text-green-600 hover:text-green-700">(877) 392-6422</a>
            </div>

            <!-- 失聪者专线 -->
            <div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div class="flex items-center justify-between mb-2">
                <span class="text-sm font-semibold text-gray-700">失聪者专线 (TDD)</span>
                <span class="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-full">文字服务</span>
              </div>
              <a href="tel:8007352929" class="text-xl font-bold text-gray-700 hover:text-gray-800">(800) 735-2929</a>
            </div>

            <!-- 服务时间 -->
            <div class="text-sm space-y-2">
              <div class="flex items-center text-gray-700">
                <svg class="w-5 h-5 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <span><strong>周一至周五：</strong>上午 4:30 - 下午 7:00</span>
              </div>
              <div class="flex items-center text-gray-700">
                <svg class="w-5 h-5 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <span><strong>周六至周日：</strong>上午 8:00 - 下午 2:00</span>
              </div>
              <p class="text-xs text-gray-500 ml-7">（太平洋时间 PT）</p>
            </div>
          </div>
        </div>

        <!-- 取消或重新预约 -->
        <div class="md:col-span-2 bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow border-l-4 border-orange-400">
          <div class="flex items-start">
            <div class="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
              <svg class="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
              </svg>
            </div>
            <div class="flex-1">
              <h3 class="text-lg font-bold text-gray-800 mb-3">取消或重新预约考试</h3>

              <div class="grid md:grid-cols-2 gap-4 mb-4">
                <div class="bg-green-50 rounded-lg p-4 border border-green-200">
                  <div class="flex items-center mb-2">
                    <svg class="w-5 h-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                    </svg>
                    <span class="font-bold text-green-700">免费取消条件</span>
                  </div>
                  <p class="text-sm text-gray-700">
                    在预定考试日期<strong class="text-green-700">前2天</strong>取消，不扣除考试费用
                  </p>
                  <div class="mt-2 p-2 bg-white rounded text-xs text-gray-600">
                    <strong>示例：</strong>预约周一上午9点考试，需在<span class="text-green-700 font-bold">周六上午9点前</span>取消
                  </div>
                </div>

                <div class="bg-red-50 rounded-lg p-4 border border-red-200">
                  <div class="flex items-center mb-2">
                    <svg class="w-5 h-5 text-red-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clip-rule="evenodd"></path>
                    </svg>
                    <span class="font-bold text-red-700">费用丧失情况</span>
                  </div>
                  <p class="text-sm text-gray-700">
                    未在规定时间内取消，或<strong class="text-red-700">通过语音邮件/电子邮件</strong>取消，费用将被扣除
                  </p>
                </div>
              </div>

              <div class="bg-yellow-50 rounded-lg p-4 border border-yellow-300">
                <div class="flex items-start">
                  <svg class="w-5 h-5 text-yellow-600 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path>
                  </svg>
                  <div class="flex-1">
                    <p class="font-bold text-yellow-800 mb-2">重要提醒</p>
                    <ul class="text-sm text-gray-700 space-y-1">
                      <li class="flex items-start">
                        <span class="mr-2">•</span>
                        <span><strong>不接受</strong>语音邮件或电子邮件形式的取消通知</span>
                      </li>
                      <li class="flex items-start">
                        <span class="mr-2">•</span>
                        <span>必须通过 <strong class="text-blue-600">PSI 官网</strong> 或 <strong class="text-green-600">致电 PSI 客服代表</strong> 直接办理</span>
                      </li>
                      <li class="flex items-start">
                        <span class="mr-2">•</span>
                        <span>取消电话：<a href="tel:8773926422" class="text-blue-600 hover:underline font-semibold">(877) 392-6422</a></span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 考试当天须知 -->
        <div class="md:col-span-2 bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
          <div class="bg-gradient-to-r from-green-600 to-emerald-600 p-6 text-white">
            <div class="flex items-center">
              <div class="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mr-4">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <div>
                <h3 class="text-xl font-bold">考试当天须知</h3>
                <p class="text-green-100 text-sm">Test Day Requirements & Security Procedures</p>
              </div>
            </div>
          </div>

          <div class="p-6">
            <!-- 关键提醒 -->
            <div class="mb-6 bg-red-50 rounded-lg p-5 border-l-4 border-red-500">
              <div class="flex items-start">
                <svg class="w-6 h-6 text-red-600 mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
                </svg>
                <div>
                  <h4 class="font-bold text-red-900 mb-2">⚠️ 严格执行规定</h4>
                  <ul class="text-sm text-red-800 space-y-1">
                    <li>• 必须<strong>提前30分钟</strong>到达考场进行登记、身份验证</li>
                    <li>• <strong class="text-red-600">迟到者将无法进入考场，费用丧失</strong></li>
                    <li>• 未携带有效身份证件者无法参加考试</li>
                    <li>• 携带违禁物品将导致考试成绩作废</li>
                  </ul>
                </div>
              </div>
            </div>

            <div class="grid md:grid-cols-2 gap-6">
              <!-- 身份证件要求 -->
              <div>
                <h4 class="font-bold text-gray-800 mb-4 flex items-center">
                  <svg class="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"></path>
                  </svg>
                  有效身份证件（必须携带）
                </h4>

                <div class="bg-blue-50 rounded-lg p-4 mb-4 border border-blue-200">
                  <p class="text-sm text-blue-900 mb-3">
                    <strong>必须包含近期照片，不接受过期或临时证件</strong>
                  </p>
                  <div class="grid grid-cols-2 gap-2 text-sm">
                    <div class="flex items-center text-blue-800">
                      <svg class="w-4 h-4 mr-1.5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                      </svg>
                      含照片驾驶证
                    </div>
                    <div class="flex items-center text-blue-800">
                      <svg class="w-4 h-4 mr-1.5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                      </svg>
                      州民身份证
                    </div>
                    <div class="flex items-center text-blue-800">
                      <svg class="w-4 h-4 mr-1.5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                      </svg>
                      美国军方ID
                    </div>
                    <div class="flex items-center text-blue-800">
                      <svg class="w-4 h-4 mr-1.5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                      </svg>
                      美国护照本/卡
                    </div>
                    <div class="flex items-center text-blue-800">
                      <svg class="w-4 h-4 mr-1.5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                      </svg>
                      绿卡
                    </div>
                    <div class="flex items-center text-blue-800">
                      <svg class="w-4 h-4 mr-1.5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                      </svg>
                      入籍证书
                    </div>
                    <div class="flex items-center text-blue-800 col-span-2">
                      <svg class="w-4 h-4 mr-1.5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                      </svg>
                      美国政府发行的EAD卡
                    </div>
                  </div>
                </div>

                <div class="bg-yellow-50 rounded-lg p-4 border border-yellow-300">
                  <h5 class="font-bold text-yellow-900 mb-2 flex items-center text-sm">
                    <svg class="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path>
                    </svg>
                    重要提醒
                  </h5>
                  <ul class="text-xs text-yellow-800 space-y-1">
                    <li>• 照片必须与本人相符，证件姓名必须与报名表一致</li>
                    <li>• 如最近更改姓名，需提前联系PSI确认</li>
                    <li>• 如无法提供所需证件，须提前<strong>3周</strong>致电 (916) 515-5200</li>
                    <li>• 未提供有效证件将被视为错过预约，<strong class="text-red-700">费用丧失</strong></li>
                  </ul>
                </div>
              </div>

              <!-- 安全检查流程 -->
              <div>
                <h4 class="font-bold text-gray-800 mb-4 flex items-center">
                  <svg class="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                  </svg>
                  安全检查流程
                </h4>

                <div class="space-y-3 mb-4">
                  <div class="bg-purple-50 rounded-lg p-4 border-l-4 border-purple-500">
                    <div class="flex items-start">
                      <div class="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-sm mr-3">1</div>
                      <div class="flex-1">
                        <h5 class="font-bold text-purple-900 mb-1">指纹采集</h5>
                        <p class="text-sm text-purple-800">报到时采集拇指指纹，进出考场、使用洗手间后返回均需验证匹配</p>
                      </div>
                    </div>
                  </div>

                  <div class="bg-purple-50 rounded-lg p-4 border-l-4 border-purple-500">
                    <div class="flex items-start">
                      <div class="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-sm mr-3">2</div>
                      <div class="flex-1">
                        <h5 class="font-bold text-purple-900 mb-1">清空口袋</h5>
                        <p class="text-sm text-purple-800">登记时询问是否持有违禁物品，要求清空所有口袋接受检查</p>
                      </div>
                    </div>
                  </div>

                  <div class="bg-purple-50 rounded-lg p-4 border-l-4 border-purple-500">
                    <div class="flex items-start">
                      <div class="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-sm mr-3">3</div>
                      <div class="flex-1">
                        <h5 class="font-bold text-purple-900 mb-1">签署安全协议</h5>
                        <p class="text-sm text-purple-800">进入考场前必须签署保安协议，承诺遵守所有考试规定</p>
                      </div>
                    </div>
                  </div>

                  <div class="bg-purple-50 rounded-lg p-4 border-l-4 border-purple-500">
                    <div class="flex items-start">
                      <div class="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-sm mr-3">4</div>
                      <div class="flex-1">
                        <h5 class="font-bold text-purple-900 mb-1">全程录像监控</h5>
                        <p class="text-sm text-purple-800">考场全程录像，禁止与其他考生交流，违规将面临法律诉讼</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <h5 class="font-bold text-gray-800 mb-2 text-sm">其他注意事项</h5>
                  <ul class="text-xs text-gray-700 space-y-1.5">
                    <li class="flex items-start">
                      <span class="mr-2">•</span>
                      <span>允许单层衣物（轻质衬衫、毛衣、无口袋套头衫），外套需寄存</span>
                    </li>
                    <li class="flex items-start">
                      <span class="mr-2">•</span>
                      <span>考场提供计时器，不允许携带手表或计时装置</span>
                    </li>
                    <li class="flex items-start">
                      <span class="mr-2">•</span>
                      <span>一次仅一人可使用洗手间，超过5分钟将被检查</span>
                    </li>
                    <li class="flex items-start">
                      <span class="mr-2">•</span>
                      <span>考试期间不得离开大楼，考场提供草稿纸和参考资料</span>
                    </li>
                    <li class="flex items-start">
                      <span class="mr-2">•</span>
                      <span>处方药需装在标有姓名的容器内，报到时接受检查</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 考试地点和指引 -->
        <div class="md:col-span-2 bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
          <div class="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
            <div class="flex items-center justify-between">
              <div class="flex items-center">
                <div class="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mr-4">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  </svg>
                </div>
                <div>
                  <h3 class="text-xl font-bold">PSI Irvine 考试中心</h3>
                  <p class="text-indigo-100 text-sm">California Acupuncture Licensing Examination</p>
                </div>
              </div>
              <div class="flex gap-2">
                <a
                  href="https://www.google.com/maps/search/?api=1&query=8+Corporate+Park+Suite+200+Irvine+CA+92606"
                  target="_blank"
                  class="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"></path>
                  </svg>
                  Google地图
                </a>
              </div>
            </div>
          </div>

          <div class="p-6">
            <div class="grid md:grid-cols-2 gap-6">
              <!-- 地址信息 -->
              <div>
                <h4 class="font-bold text-gray-800 mb-4 flex items-center">
                  <svg class="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                  </svg>
                  考场地址
                </h4>
                <div class="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div class="flex items-start">
                    <svg class="w-5 h-5 text-indigo-600 mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"></path>
                    </svg>
                    <div>
                      <p class="font-bold text-gray-800 text-lg">8 Corporate Park, Suite 200</p>
                      <p class="text-gray-600">Irvine, CA 92606</p>
                    </div>
                  </div>
                  <div class="flex items-center pt-3 border-t border-gray-200">
                    <svg class="w-5 h-5 text-indigo-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                    </svg>
                    <a href="tel:9494189653" class="text-indigo-600 hover:text-indigo-700 font-semibold">(949) 418-9653</a>
                  </div>
                </div>

                <!-- 到达后指引 -->
                <div class="mt-4 bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <h5 class="font-bold text-blue-900 mb-2 flex items-center">
                    <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path>
                    </svg>
                    停车后指引
                  </h5>
                  <ol class="text-sm text-gray-700 space-y-1.5">
                    <li class="flex items-start">
                      <span class="font-bold text-blue-600 mr-2">1.</span>
                      <span>从前门进入大楼</span>
                    </li>
                    <li class="flex items-start">
                      <span class="font-bold text-blue-600 mr-2">2.</span>
                      <span>乘坐电梯到<strong class="text-blue-700">2楼</strong></span>
                    </li>
                    <li class="flex items-start">
                      <span class="font-bold text-blue-600 mr-2">3.</span>
                      <span>考试中心位于 <strong class="text-blue-700">Suite 200</strong></span>
                    </li>
                  </ol>
                </div>
              </div>

              <!-- 驾车指引 -->
              <div>
                <h4 class="font-bold text-gray-800 mb-4 flex items-center">
                  <svg class="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  驾车指引
                </h4>

                <!-- 从 I-405 南行 -->
                <div class="mb-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border-l-4 border-green-500">
                  <div class="flex items-center mb-3">
                    <div class="bg-green-600 text-white text-xs font-bold px-2 py-1 rounded mr-2">I-405 S</div>
                    <h5 class="font-bold text-gray-800">从 I-405 南行</h5>
                  </div>
                  <ol class="text-sm text-gray-700 space-y-2">
                    <li class="flex items-start">
                      <span class="font-bold text-green-600 mr-2 flex-shrink-0">1.</span>
                      <span>使用<strong>右侧第2车道</strong>，从 <strong>Exit 7</strong> 驶出至 Jamboree Rd</span>
                    </li>
                    <li class="flex items-start">
                      <span class="font-bold text-green-600 mr-2 flex-shrink-0">2.</span>
                      <span>使用<strong>左侧2车道</strong>左转进入 Jamboree Rd，行驶约1.5英里</span>
                    </li>
                    <li class="flex items-start">
                      <span class="font-bold text-green-600 mr-2 flex-shrink-0">3.</span>
                      <span><strong>右转</strong>进入 Beckman Ave</span>
                    </li>
                    <li class="flex items-start">
                      <span class="font-bold text-green-600 mr-2 flex-shrink-0">4.</span>
                      <span>第一个路口<strong>右转</strong>进入 Corporate Park</span>
                    </li>
                    <li class="flex items-start">
                      <span class="font-bold text-green-600 mr-2 flex-shrink-0">5.</span>
                      <span><strong class="text-green-700">8 Corporate Park 是右侧第二栋建筑</strong></span>
                    </li>
                  </ol>
                </div>

                <!-- 从 I-5 南行 -->
                <div class="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border-l-4 border-blue-500">
                  <div class="flex items-center mb-3">
                    <div class="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded mr-2">I-5 S</div>
                    <h5 class="font-bold text-gray-800">从 I-5 南行</h5>
                  </div>
                  <ol class="text-sm text-gray-700 space-y-2">
                    <li class="flex items-start">
                      <span class="font-bold text-blue-600 mr-2 flex-shrink-0">1.</span>
                      <span>从 <strong>Exit 100</strong> 驶出至 Jamboree Rd</span>
                    </li>
                    <li class="flex items-start">
                      <span class="font-bold text-blue-600 mr-2 flex-shrink-0">2.</span>
                      <span>使用<strong>右侧第2车道</strong>右转进入 Jamboree Rd</span>
                    </li>
                    <li class="flex items-start">
                      <span class="font-bold text-blue-600 mr-2 flex-shrink-0">3.</span>
                      <span>上匝道后在分岔路口<strong>保持左侧</strong>继续沿 Jamboree Rd 行驶约2.2英里</span>
                    </li>
                    <li class="flex items-start">
                      <span class="font-bold text-blue-600 mr-2 flex-shrink-0">4.</span>
                      <span><strong>左转</strong>进入 Beckman Ave</span>
                    </li>
                    <li class="flex items-start">
                      <span class="font-bold text-blue-600 mr-2 flex-shrink-0">5.</span>
                      <span>第一个路口<strong>右转</strong>进入 Corporate Park</span>
                    </li>
                    <li class="flex items-start">
                      <span class="font-bold text-blue-600 mr-2 flex-shrink-0">6.</span>
                      <span><strong class="text-blue-700">8 Corporate Park 是右侧第二栋建筑</strong></span>
                    </li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 禁带物品 -->
        <div class="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
          <div class="flex items-center mb-4">
            <div class="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mr-4">
              <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"></path>
              </svg>
            </div>
            <h3 class="text-lg font-bold text-gray-800">禁止携带物品</h3>
          </div>
          <ul class="space-y-2 text-gray-700 text-sm">
            <li class="flex items-start">
              <svg class="w-5 h-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clip-rule="evenodd"></path>
              </svg>
              <span>手机、电子设备、计算器</span>
            </li>
            <li class="flex items-start">
              <svg class="w-5 h-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clip-rule="evenodd"></path>
              </svg>
              <span>书籍、笔记、学习材料</span>
            </li>
            <li class="flex items-start">
              <svg class="w-5 h-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clip-rule="evenodd"></path>
              </svg>
              <span>食品饮料（包括水）</span>
            </li>
            <li class="flex items-start">
              <svg class="w-5 h-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clip-rule="evenodd"></path>
              </svg>
              <span>钱包、背包、外套（需寄存）</span>
            </li>
          </ul>
        </div>

        <!-- 考场纪律 -->
        <div class="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
          <div class="flex items-center mb-4">
            <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
              <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
              </svg>
            </div>
            <h3 class="text-lg font-bold text-gray-800">考场安全规定</h3>
          </div>
          <ul class="space-y-2 text-gray-700 text-sm">
            <li class="flex items-start">
              <svg class="w-5 h-5 text-purple-500 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path>
              </svg>
              <span>报到时采集拇指指纹，进出考场均需验证</span>
            </li>
            <li class="flex items-start">
              <svg class="w-5 h-5 text-purple-500 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path>
              </svg>
              <span>考场全程录像监控</span>
            </li>
            <li class="flex items-start">
              <svg class="w-5 h-5 text-purple-500 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path>
              </svg>
              <span>禁止与其他考生交流</span>
            </li>
            <li class="flex items-start">
              <svg class="w-5 h-5 text-purple-500 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1 a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path>
              </svg>
              <span>违规将导致考试取消，可能面临法律诉讼</span>
            </li>
          </ul>
        </div>
      </div>

      <!-- 重要提示 -->
      <div class="mt-6 bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-r-xl">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-6 w-6 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
            </svg>
          </div>
          <div class="ml-3">
            <h3 class="text-lg font-semibold text-yellow-800 mb-2">重要法律声明</h3>
            <div class="text-sm text-yellow-700 space-y-2">
              <p><strong>加州Business & Professions Code第123条规定：</strong></p>
              <p>违反或试图违反任何考试规定的行为均属轻罪，包括但不限于：</p>
              <ul class="list-disc list-inside space-y-1 ml-4">
                <li>侵犯考试材料安全、未经许可复制考试内容</li>
                <li>未经许可携带或使用任何学习材料、书籍、设备</li>
                <li>在考试期间与其他考生交流或抄袭</li>
                <li>冒充他人或让他人冒充自己参加考试</li>
              </ul>
              <p class="font-semibold">违规者将承担损害赔偿（最高$10,000）和诉讼费，并可能无法获得执照。</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 分类统计概览 -->
    <div v-if="contentCategories.length > 0" class="mb-8 bg-white rounded-xl shadow-md p-6">
      <h2 class="text-xl font-bold mb-4">考试内容分布</h2>
      <div class="space-y-3">
        <div v-for="category in contentCategories" :key="category.id" class="flex items-center">
          <div class="flex-1">
            <div class="flex items-center justify-between mb-1">
              <span class="font-semibold text-gray-800">{{ category.name }}</span>
              <div class="flex items-center gap-3">
                <span v-if="category.weight" class="text-sm font-semibold text-blue-600">{{ category.weight }}%</span>
                <span v-if="category.questionCount" class="text-sm text-gray-600">预计 {{ category.questionCount }} 题</span>
                <span class="text-sm text-gray-600">实际 {{ category._count?.questions || 0 }} 题</span>
              </div>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2.5">
              <div
                class="bg-gradient-to-r from-blue-500 to-blue-600 h-2.5 rounded-full transition-all"
                :style="{ width: category.weight ? `${category.weight}%` : '5%' }"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Tab 切换 -->
    <div class="mb-6">
      <div class="flex border-b border-gray-200">
        <button
          v-for="tab in tabs"
          :key="tab.value"
          @click="activeTab = tab.value"
          class="pb-4 px-6 font-semibold transition-colors relative"
          :class="activeTab === tab.value
            ? 'text-blue-600'
            : 'text-gray-600 hover:text-gray-900'"
        >
          <span>{{ tab.label }}</span>
          <span v-if="getCategoryCount(tab.value)" class="ml-2 text-sm">
            ({{ getCategoryCount(tab.value) }})
          </span>
          <div
            v-if="activeTab === tab.value"
            class="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
          ></div>
        </button>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="pending || loadingExamInfo" class="text-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      <p class="mt-4 text-gray-600">加载中...</p>
    </div>

    <!-- 分类列表 -->
    <div v-else class="space-y-4">
      <div
        v-for="category in filteredCategories"
        :key="category.id"
        class="bg-white rounded-xl shadow-md hover:shadow-lg transition-all"
      >
        <div
          class="p-6 cursor-pointer"
          @click="toggleCategory(category.id)"
        >
          <div class="flex justify-between items-start">
            <div class="flex-1">
              <div class="flex items-center gap-3 mb-2">
                <span
                  class="px-3 py-1 rounded-full text-sm font-semibold"
                  :class="getTypeColor(category.type)"
                >
                  {{ category.code }}
                </span>
                <h3 class="text-xl font-bold text-gray-800">{{ category.name }}</h3>
                <span v-if="category.weight" class="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                  占比 {{ category.weight }}%
                </span>
              </div>

              <p v-if="category.description" class="text-gray-600 mb-2">
                {{ category.description }}
              </p>

              <div v-if="category.detailedInfo" class="text-sm text-gray-500 mb-2">
                {{ category.detailedInfo }}
              </div>

              <!-- 题目统计 -->
              <div class="flex items-center gap-4 text-sm">
                <span class="flex items-center text-gray-600">
                  <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
                  实际题库: {{ category._count?.questions || 0 }} 题
                </span>
                <span v-if="category.questionCount" class="flex items-center text-blue-600">
                  <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  预计考试: {{ category.questionCount }} 题
                </span>
              </div>
            </div>

            <svg
              class="w-6 h-6 text-gray-400 transition-transform flex-shrink-0 ml-4"
              :class="{ 'rotate-180': expandedCategories.has(category.id) }"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </div>
        </div>

        <!-- 展开的详细内容 -->
        <div v-if="expandedCategories.has(category.id)" class="border-t border-gray-100 p-6 bg-gray-50">
          <!-- 重点知识点 -->
          <div v-if="category.keyPoints" class="mb-6">
            <h4 class="font-bold text-gray-800 mb-3 flex items-center">
              <svg class="w-5 h-5 mr-2 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
              </svg>
              重点知识点
            </h4>
            <ul class="space-y-2">
              <li
                v-for="(point, index) in parseKeyPoints(category.keyPoints)"
                :key="index"
                class="flex items-start text-gray-700"
              >
                <svg class="w-5 h-5 mr-2 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                </svg>
                <span>{{ point }}</span>
              </li>
            </ul>
          </div>

          <!-- 学习建议 -->
          <div v-if="category.studyTips" class="mb-6">
            <h4 class="font-bold text-gray-800 mb-3 flex items-center">
              <svg class="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
              </svg>
              学习建议
            </h4>
            <p class="text-gray-700 bg-blue-50 p-4 rounded-lg">{{ category.studyTips }}</p>
          </div>

          <!-- 子分类 -->
          <div v-if="category.children && category.children.length > 0" class="mb-4">
            <h4 class="font-bold text-gray-800 mb-3">子分类</h4>
            <div class="grid md:grid-cols-2 gap-3">
              <div
                v-for="child in category.children"
                :key="child.id"
                class="bg-white rounded-lg p-4 hover:bg-gray-100 transition-colors cursor-pointer border border-gray-200"
                @click.stop="goToQuestions(child.id)"
              >
                <div class="flex justify-between items-center">
                  <div>
                    <span class="font-semibold text-gray-800">{{ child.name }}</span>
                    <span class="ml-2 text-sm text-gray-600">{{ child._count?.questions || 0 }} 道题</span>
                  </div>
                  <button class="text-blue-600 hover:text-blue-700 font-semibold text-sm">
                    开始学习 →
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- 开始学习按钮 -->
          <div v-if="category._count?.questions > 0">
            <button
              @click.stop="goToQuestions(category.id)"
              class="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <span>开始学习 ({{ category._count.questions }} 道题)</span>
            </button>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="filteredCategories.length === 0" class="text-center py-12 bg-white rounded-xl">
        <svg class="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
        </svg>
        <p class="text-gray-600 text-lg">暂无分类数据</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const examStore = useExamStore()
const activeTab = ref('content') // 默认显示内容部分
const expandedCategories = ref(new Set<string>())
const showMoreInfo = ref(false)

const tabs = [
  { label: 'a. 考试组织部分', value: 'organization' },
  { label: 'b. 考试内容部分', value: 'content' },
  { label: 'c. 考试复习部分', value: 'review' }
]

// 创建响应式引用来避免 Pinia store 序列化问题
const currentExamType = computed(() => examStore.currentExamType)

// 获取考试信息
const { data: examInfo, pending: loadingExamInfo, refresh: refreshExamInfo } = await useFetch(
  () => `/api/exam-info/${currentExamType.value}`,
  {
    key: () => `exam-info-${currentExamType.value}`
  }
)

// 获取所有分类（根据当前选择的考试类型）
const { data: categories, pending, refresh: refreshCategories } = await useFetch('/api/categories', {
  key: () => `categories-${currentExamType.value}`,
  query: computed(() => ({ examType: currentExamType.value }))
})

// 当考试类型改变时，重新获取数据
watch(currentExamType, () => {
  refreshExamInfo()
  refreshCategories()
  expandedCategories.value.clear()
  showMoreInfo.value = false
})

const filteredCategories = computed(() => {
  if (!categories.value) return []
  return categories.value
    .filter((c: any) => c.type === activeTab.value && !c.parentId)
    .sort((a: any, b: any) => a.order - b.order)
})

// 只显示内容部分的分类用于统计
const contentCategories = computed(() => {
  if (!categories.value) return []
  return categories.value
    .filter((c: any) => c.type === 'content' && !c.parentId)
    .sort((a: any, b: any) => a.order - b.order)
})

const getCategoryCount = (type: string) => {
  if (!categories.value) return 0
  return categories.value.filter((c: any) => c.type === type && !c.parentId).length
}

const toggleCategory = (id: string) => {
  if (expandedCategories.value.has(id)) {
    expandedCategories.value.delete(id)
  } else {
    expandedCategories.value.add(id)
  }
}

const goToQuestions = (categoryId: string) => {
  navigateTo(`/practice?category=${categoryId}`)
}

const getTypeColor = (type: string) => {
  const colors: Record<string, string> = {
    organization: 'bg-blue-100 text-blue-700',
    content: 'bg-green-100 text-green-700',
    review: 'bg-purple-100 text-purple-700'
  }
  return colors[type] || 'bg-gray-100 text-gray-700'
}

const parseKeyPoints = (keyPointsJson: string) => {
  try {
    return JSON.parse(keyPointsJson)
  } catch {
    return []
  }
}
</script>

<style scoped>
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fadeIn 0.3s ease-out;
}
</style>
