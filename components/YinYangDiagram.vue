<template>
  <div class="yinyang-diagram-container bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg p-6 border-2 border-purple-300">
    <h4 class="font-semibold text-purple-900 mb-4 flex items-center gap-2">
      <span>☯️</span>
      <span>阴阳学说理论体系图</span>
    </h4>

    <div class="bg-white rounded-lg p-6 shadow-inner">
      <div class="space-y-4">
        <!-- 阴阳对立 -->
        <div class="yinyang-section">
          <div class="section-header bg-gradient-to-r from-purple-500 to-purple-600 text-white px-4 py-3 rounded-t-lg">
            <h5 class="font-bold text-lg">阴阳对立</h5>
          </div>
          <div class="section-body bg-purple-50 p-4 rounded-b-lg border-2 border-purple-200">
            <div class="grid grid-cols-2 gap-4">
              <div class="concept-box bg-white p-4 rounded-lg border-l-4 border-red-500">
                <div class="font-semibold text-red-700 mb-2">病理：阴盛则阳病，阴虚则热</div>
                <div class="text-sm text-gray-700">
                  阴阳失衡导致疾病产生，阴盛则寒，阳盛则热
                </div>
              </div>
              <div class="concept-box bg-white p-4 rounded-lg border-l-4 border-blue-500">
                <div class="font-semibold text-blue-700 mb-2">治则：热者寒之，寒者热之</div>
                <div class="text-sm text-gray-700">
                  寒凉药治热证，温热药治寒证，以平为期
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 阴阳互根 -->
        <div class="yinyang-section">
          <div class="section-header bg-gradient-to-r from-indigo-500 to-indigo-600 text-white px-4 py-3 rounded-t-lg">
            <h5 class="font-bold text-lg">阴阳互根（阴在内...）</h5>
          </div>
          <div class="section-body bg-indigo-50 p-4 rounded-b-lg border-2 border-indigo-200">
            <div class="grid grid-cols-2 gap-4">
              <div class="concept-box bg-white p-4 rounded-lg border-l-4 border-indigo-500">
                <div class="font-semibold text-indigo-700 mb-2">病理：阴阳互根，阴损及阳</div>
                <div class="text-sm text-gray-700">
                  阴阳相互依存，阴虚可导致阳虚，阳虚亦可导致阴虚
                </div>
              </div>
              <div class="concept-box bg-white p-4 rounded-lg border-l-4 border-indigo-500">
                <div class="font-semibold text-indigo-700 mb-2">治则：阴中求阳，阳中求阴</div>
                <div class="text-sm text-gray-700">
                  治阳虚配阴药，治阴虚配阳药，阴阳互补
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 阴阳消长 -->
        <div class="yinyang-section">
          <div class="section-header bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-3 rounded-t-lg">
            <h5 class="font-bold text-lg">阴阳消长</h5>
          </div>
          <div class="section-body bg-blue-50 p-4 rounded-b-lg border-2 border-blue-200">
            <div class="bg-white p-4 rounded-lg border-l-4 border-blue-500">
              <div class="font-semibold text-blue-800 mb-2">阴虚则寒，阳虚则热</div>
              <div class="text-sm text-gray-700 space-y-2">
                <div>• 阴阳此消彼长，维持动态平衡</div>
                <div>• 阴盛则阳病，阳盛则阴病</div>
                <div>• 阴虚则内热，阳虚则外寒</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 阴阳转化 -->
        <div class="yinyang-section">
          <div class="section-header bg-gradient-to-r from-pink-500 to-pink-600 text-white px-4 py-3 rounded-t-lg">
            <h5 class="font-bold text-lg">阴阳转化</h5>
          </div>
          <div class="section-body bg-pink-50 p-4 rounded-b-lg border-2 border-pink-200">
            <div class="space-y-3">
              <div class="bg-white p-4 rounded-lg border-l-4 border-pink-500">
                <div class="font-semibold text-pink-800 mb-2">一热极生寒，重阴必阳</div>
                <div class="text-sm text-gray-700">
                  阴阳在一定条件下可以相互转化
                </div>
              </div>

              <div class="bg-white p-4 rounded-lg">
                <div class="text-sm text-gray-700 space-y-2">
                  <div class="mb-2 font-semibold text-gray-800">转化条件示例：</div>
                  <div>• <span class="font-semibold">白天变黑夜</span> - 阳转阴的自然现象</div>
                  <div>• <span class="font-semibold">过劳而废</span> - 阳盛转阴虚</div>
                  <div>• <span class="font-semibold">兴奋过度致郁</span> - 阳极转阴</div>
                  <div>• <span class="font-semibold">外寒入里化热</span> - 寒邪入里转化为热</div>
                  <div>• <span class="font-semibold">热盛伤阴</span> - 阳亢致阴虚</div>
                  <div>• <span class="font-semibold">高热大汗突然四肢厥冷</span> - 阳脱，阳极转阴（亡阳证）</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 治疗原则 -->
        <div class="yinyang-section">
          <div class="section-header bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-3 rounded-t-lg">
            <h5 class="font-bold text-lg">治疗原则</h5>
          </div>
          <div class="section-body bg-green-50 p-4 rounded-b-lg border-2 border-green-200">
            <div class="space-y-3">
              <div class="bg-gradient-to-r from-green-100 to-emerald-100 p-4 rounded-lg border-2 border-green-400">
                <div class="font-bold text-green-900 mb-3 text-lg">阴平阳秘，精神乃治</div>
                <div class="text-sm text-gray-700 space-y-2">
                  <div>• <span class="font-semibold">动极者镇之以静</span> - 阳亢用滋阴法</div>
                  <div>• <span class="font-semibold">寒极者温之以热</span> - 阴寒用温阳法</div>
                </div>
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div class="bg-white p-3 rounded-lg border-l-4 border-green-500">
                  <div class="font-semibold text-green-800 mb-2">阴虚治法</div>
                  <div class="text-sm text-gray-700">
                    白虎汤、六味地黄丸（三补三泻）
                  </div>
                </div>

                <div class="bg-white p-3 rounded-lg border-l-4 border-green-500">
                  <div class="font-semibold text-green-800 mb-2">配穴原则</div>
                  <div class="text-sm text-gray-700">
                    背俞穴治脏病，募穴治腑病
                  </div>
                </div>
              </div>

              <div class="bg-white p-4 rounded-lg border-2 border-dashed border-green-400">
                <div class="font-semibold text-green-900 mb-2">气血关系</div>
                <div class="text-sm text-gray-700 space-y-1">
                  <div>• 气虚致血虚，血虚无气</div>
                  <div>• 大出血致气虚无元气</div>
                  <div>• 夜不眠，夜不眠（谁也离不开谁，他好我也好）</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 核心要点总结 -->
        <div class="mt-6 bg-gradient-to-r from-purple-100 to-indigo-100 rounded-lg p-4 border-2 border-purple-300">
          <div class="flex items-start gap-3">
            <div class="text-3xl">☯️</div>
            <div class="flex-1">
              <div class="font-bold text-purple-900 mb-2 text-lg">阴阳学说核心要点</div>
              <div class="grid grid-cols-2 gap-3 text-sm text-gray-700">
                <div class="bg-white p-3 rounded-lg">
                  <span class="font-semibold text-purple-700">对立统一：</span>阴阳互相制约、互相依存
                </div>
                <div class="bg-white p-3 rounded-lg">
                  <span class="font-semibold text-purple-700">互根互用：</span>阴阳相互依存、相互资生
                </div>
                <div class="bg-white p-3 rounded-lg">
                  <span class="font-semibold text-purple-700">消长平衡：</span>阴阳此消彼长、维持平衡
                </div>
                <div class="bg-white p-3 rounded-lg">
                  <span class="font-semibold text-purple-700">相互转化：</span>阴阳在一定条件下可以转化
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
.yinyang-diagram-container {
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

.yinyang-section {
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

.concept-box {
  transition: all 0.2s ease;
}

.concept-box:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.section-header {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.section-body {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}
</style>
