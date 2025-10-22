<template>
  <div class="pulse-diagram-container bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-6 border-2 border-blue-300">
    <h4 class="font-semibold text-blue-900 mb-4 flex items-center gap-2">
      <span>📊</span>
      <span>脉象分类图谱</span>
    </h4>

    <div class="bg-white rounded-lg p-6 shadow-inner">
      <!-- 标题说明 -->
      <div class="text-center mb-6">
        <div class="inline-block bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-xl shadow-lg">
          <div class="text-xl font-bold">州考17种脉</div>
          <div class="text-xs mt-1 opacity-90">常见脉象分类</div>
        </div>
      </div>

      <!-- 主要内容区域 -->
      <div class="grid grid-cols-2 gap-8">
        <!-- 左侧：迟脉类、数脉类、虚脉类 -->
        <div class="space-y-6">
          <!-- 迟脉类 -->
          <div class="pulse-category">
            <div class="category-header bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-t-lg">
              <h5 class="font-bold text-lg">迟脉类</h5>
              <p class="text-xs opacity-90">一息不足四至</p>
            </div>
            <div class="category-body bg-blue-50 p-4 rounded-b-lg border-2 border-blue-200">
              <div class="pulse-item mb-3">
                <div class="font-semibold text-blue-900 mb-1">迟脉</div>
                <div class="text-sm text-gray-700">
                  <div>• 特征：一息不足四至，迟而有力为实，迟而无力为虚</div>
                  <div class="mt-1 text-blue-700">→ 主病：寒证</div>
                </div>
              </div>
              <div class="pulse-item mb-3">
                <div class="font-semibold text-blue-900 mb-1">涩脉</div>
                <div class="text-sm text-gray-700">
                  <div>• 特征：往来艰涩，大汗后造津液损伤</div>
                  <div>• 津伤、精亏、气滞、血瘀、血虚</div>
                  <div class="mt-1 text-blue-700">→ 主病：血瘀、精血亏少</div>
                </div>
              </div>
              <div class="pulse-item">
                <div class="font-semibold text-blue-900 mb-1">缓脉</div>
                <div class="text-sm text-gray-700">
                  <div>• 特征：脉来缓慢而未至极致</div>
                  <div>• 寒证、心气/心阳虚</div>
                  <div class="mt-1 text-blue-700">→ 主病：湿证、脾虚</div>
                </div>
              </div>
            </div>
          </div>

          <!-- 数脉类 -->
          <div class="pulse-category">
            <div class="category-header bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-t-lg">
              <h5 class="font-bold text-lg">数脉类</h5>
              <p class="text-xs opacity-90">一息五至以上</p>
            </div>
            <div class="category-body bg-red-50 p-4 rounded-b-lg border-2 border-red-200">
              <div class="pulse-item mb-3">
                <div class="font-semibold text-red-900 mb-1">数脉</div>
                <div class="text-sm text-gray-700">
                  <div>• 特征：脉来急数较平常定数</div>
                  <div class="mt-1 text-red-700">→ 主病：热证</div>
                </div>
              </div>
              <div class="pulse-item">
                <div class="font-semibold text-red-900 mb-1">促脉</div>
                <div class="text-sm text-gray-700">
                  <div>• 特征：阳盛实热而烦闷，心气虚或心火</div>
                  <div class="mt-1 text-red-700">→ 主病：阳热亢盛、气血痰食停滞</div>
                </div>
              </div>
            </div>
          </div>

          <!-- 虚脉类 -->
          <div class="pulse-category">
            <div class="category-header bg-gradient-to-r from-gray-500 to-gray-600 text-white px-4 py-2 rounded-t-lg">
              <h5 class="font-bold text-lg">虚脉类</h5>
              <p class="text-xs opacity-90">应指无力</p>
            </div>
            <div class="category-body bg-gray-50 p-4 rounded-b-lg border-2 border-gray-200">
              <div class="pulse-item mb-3">
                <div class="font-semibold text-gray-900 mb-1">虚脉</div>
                <div class="text-sm text-gray-700">
                  <div>• 特征：三部按摸重都无力，为无力脉象而空虚</div>
                  <div class="mt-1 text-gray-700">→ 主病：气虚</div>
                </div>
              </div>
              <div class="pulse-item mb-3">
                <div class="font-semibold text-gray-900 mb-1">细脉</div>
                <div class="text-sm text-gray-700">
                  <div>• 特征：脉细如丝，应指明显，主血虚、内湿虚寒</div>
                  <div class="mt-1 text-gray-700">→ 主病：气血两虚</div>
                </div>
              </div>
              <div class="pulse-item">
                <div class="font-semibold text-gray-900 mb-1">代脉</div>
                <div class="text-sm text-gray-700">
                  <div>• 特征：代至而止，止有定数</div>
                  <div>• 至多气阴极虚弱；如因下泻内涵停，为痨症</div>
                  <div>• 严重心脏病</div>
                  <div class="mt-1 text-gray-700">→ 主病：脏气衰微</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 右侧：浮脉类、沉脉类、实脉类 -->
        <div class="space-y-6">
          <!-- 浮脉类 -->
          <div class="pulse-category">
            <div class="category-header bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-t-lg">
              <h5 class="font-bold text-lg">浮脉类</h5>
              <p class="text-xs opacity-90">轻取即得</p>
            </div>
            <div class="category-body bg-green-50 p-4 rounded-b-lg border-2 border-green-200">
              <div class="pulse-item mb-3">
                <div class="font-semibold text-green-900 mb-1">浮脉</div>
                <div class="text-sm text-gray-700">
                  <div>• 特征：举之有力，按之不足，脉位浅表</div>
                  <div class="mt-1 text-green-700">→ 主病：表证（浮紧为风寒、浮数为风热）</div>
                </div>
              </div>
              <div class="pulse-item mb-3">
                <div class="font-semibold text-green-900 mb-1">洪脉</div>
                <div class="text-sm text-gray-700">
                  <div>• 特征：浮大有力，来盛去衰，脉形阔大、脉力较强</div>
                  <div>• 阳证气分热盛</div>
                  <div class="mt-1 text-green-700">→ 主病：阳虚骨热、脉洪虚虚</div>
                </div>
              </div>
              <div class="pulse-item">
                <div class="font-semibold text-green-900 mb-1">濡脉</div>
                <div class="text-sm text-gray-700">
                  <div>• 特征：脉细而软，应指无力，迟滞气分热盛</div>
                  <div class="mt-1 text-green-700">→ 主病：虚证、湿证</div>
                </div>
              </div>
            </div>
          </div>

          <!-- 沉脉类 -->
          <div class="pulse-category">
            <div class="category-header bg-gradient-to-r from-purple-500 to-purple-600 text-white px-4 py-2 rounded-t-lg">
              <h5 class="font-bold text-lg">沉脉类</h5>
              <p class="text-xs opacity-90">重按始得</p>
            </div>
            <div class="category-body bg-purple-50 p-4 rounded-b-lg border-2 border-purple-200">
              <div class="pulse-item mb-3">
                <div class="font-semibold text-purple-900 mb-1">沉脉</div>
                <div class="text-sm text-gray-700">
                  <div>• 特征：轻取不应，重按始得，脉位较深</div>
                  <div class="mt-1 text-purple-700">→ 主病：里证（沉细为气虚、沉数为里热、里寒）</div>
                </div>
              </div>
              <div class="pulse-item mb-3">
                <div class="font-semibold text-purple-900 mb-1">弱脉</div>
                <div class="text-sm text-gray-700">
                  <div>• 特征：极软而沉，但按之不绝，气血两虚、阳虚</div>
                  <div>• 三部按摸紧按有力，脉象实/涩/长，突跃为实证</div>
                  <div class="mt-1 text-purple-700">→ 主病：阴虚疾病</div>
                </div>
              </div>
            </div>
          </div>

          <!-- 实脉类 -->
          <div class="pulse-category">
            <div class="category-header bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-2 rounded-t-lg">
              <h5 class="font-bold text-lg">实脉类</h5>
              <p class="text-xs opacity-90">应指有力</p>
            </div>
            <div class="category-body bg-orange-50 p-4 rounded-b-lg border-2 border-orange-200">
              <div class="pulse-item mb-3">
                <div class="font-semibold text-orange-900 mb-1">滑脉</div>
                <div class="text-sm text-gray-700">
                  <div>• 特征：往来流利如珠，如珠走盘</div>
                  <div>• 往来流利，如珠走盘，应指圆滑，紧张度高</div>
                  <div class="mt-1 text-orange-700">→ 主病：痰饮、食积、实热</div>
                </div>
              </div>
              <div class="pulse-item mb-3">
                <div class="font-semibold text-orange-900 mb-1">弦脉</div>
                <div class="text-sm text-gray-700">
                  <div>• 特征：端直以长，如按琴弦（肝胆病、痛、痰饮）</div>
                  <div class="mt-1 text-orange-700">→ 主病：肝胆病、疼痛、痰饮</div>
                </div>
              </div>
              <div class="pulse-item">
                <div class="font-semibold text-orange-900 mb-1">紧脉</div>
                <div class="text-sm text-gray-700">
                  <div>• 特征：紧张有力，状如转索（肝胆兼弦、痰饮实热）</div>
                  <div class="mt-1 text-orange-700">→ 主病：寒证、痛证</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 底部说明 -->
      <div class="mt-6 pt-4 border-t-2 border-dashed border-gray-300">
        <div class="bg-gradient-to-r from-indigo-100 to-purple-100 rounded-lg p-4">
          <h6 class="font-bold text-indigo-900 mb-2">💡 脉诊要诀</h6>
          <div class="grid grid-cols-2 gap-2 text-sm text-gray-700">
            <div>• <span class="font-semibold">浮脉主表</span> - 表证、虚阳外越</div>
            <div>• <span class="font-semibold">沉脉主里</span> - 里证、阳虚内陷</div>
            <div>• <span class="font-semibold">迟脉主寒</span> - 寒证、阳气不足</div>
            <div>• <span class="font-semibold">数脉主热</span> - 热证、阴虚阳亢</div>
            <div>• <span class="font-semibold">虚脉主虚</span> - 气血不足、脏腑虚弱</div>
            <div>• <span class="font-semibold">实脉主实</span> - 邪气盛实、气血痰食</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
.pulse-diagram-container {
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

.pulse-category {
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

.pulse-item {
  transition: all 0.2s ease;
}

.pulse-item:hover {
  transform: translateX(5px);
  background-color: rgba(255, 255, 255, 0.5);
  padding: 8px;
  border-radius: 4px;
}

.category-header {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.category-body {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}
</style>
