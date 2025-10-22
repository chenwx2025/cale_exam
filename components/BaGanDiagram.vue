<template>
  <div class="bagan-diagram-container bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg p-6 border-2 border-amber-300">
    <h4 class="font-semibold text-amber-900 mb-4 flex items-center gap-2">
      <span>📊</span>
      <span>八纲辨证体系图</span>
    </h4>

    <div class="bg-white rounded-lg p-6 shadow-inner">
      <!-- 标题说明 -->
      <div class="text-center mb-6">
        <div class="inline-block bg-gradient-to-r from-amber-600 to-orange-600 text-white px-6 py-3 rounded-xl shadow-lg">
          <div class="text-xl font-bold">八纲辨证</div>
          <div class="text-sm mt-1 opacity-90">阴阳统领表里寒热虚实</div>
        </div>
      </div>

      <!-- 主要内容区域 -->
      <div class="space-y-6">
        <!-- 表里辨证 -->
        <div class="bagan-category">
          <div class="category-header bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-3 rounded-t-lg">
            <h5 class="font-bold text-lg">表里辨证</h5>
            <p class="text-sm opacity-90">外邪入侵，皮肤/肌肉/经络</p>
          </div>
          <div class="category-body bg-blue-50 p-4 rounded-b-lg border-2 border-blue-200">
            <div class="grid grid-cols-2 gap-4">
              <!-- 表证 -->
              <div class="subcategory bg-white p-3 rounded-lg border border-blue-300">
                <div class="font-bold text-blue-900 mb-2 pb-2 border-b border-blue-200">表证</div>

                <div class="space-y-2 text-sm">
                  <div class="symptom-item">
                    <div class="font-semibold text-blue-800">起病急</div>
                    <div class="text-gray-700">恶寒、发热、身痛、项强、脉浮</div>
                  </div>

                  <div class="symptom-item">
                    <div class="font-semibold text-blue-800">表寒</div>
                    <div class="text-gray-700">恶寒重、发热轻或不发热、无汗、口不渴、苔薄白、脉浮紧</div>
                  </div>

                  <div class="symptom-item">
                    <div class="font-semibold text-blue-800">表热</div>
                    <div class="text-gray-700">恶寒轻发热重、微汗、口渴、苔薄白或薄黄、脉浮数</div>
                  </div>

                  <div class="symptom-item">
                    <div class="font-semibold text-blue-800">表实</div>
                    <div class="text-gray-700">无汗、身痛重、脉浮紧</div>
                  </div>

                  <div class="symptom-item">
                    <div class="font-semibold text-blue-800">表虚</div>
                    <div class="text-gray-700">汗多、身痛轻、脉浮缓</div>
                  </div>
                </div>
              </div>

              <!-- 里证 -->
              <div class="subcategory bg-white p-3 rounded-lg border border-blue-300">
                <div class="font-bold text-blue-900 mb-2 pb-2 border-b border-blue-200">里证</div>

                <div class="space-y-2 text-sm">
                  <div class="symptom-item">
                    <div class="font-semibold text-blue-800">起病缓</div>
                    <div class="text-gray-700">单一发节、疼痛重、喜暖</div>
                  </div>

                  <div class="symptom-item">
                    <div class="font-semibold text-blue-800">风病</div>
                    <div class="text-gray-700">肢体关节痛、游走不定</div>
                  </div>

                  <div class="symptom-item">
                    <div class="font-semibold text-blue-800">湿病</div>
                    <div class="text-gray-700">关节肿胀、肢体重着</div>
                  </div>

                  <div class="symptom-item">
                    <div class="font-semibold text-blue-800">热病</div>
                    <div class="text-gray-700">关节红肿热痛</div>
                  </div>

                  <div class="symptom-item mt-3 pt-2 border-t border-blue-200">
                    <div class="font-semibold text-blue-800">病位深浅</div>
                    <div class="text-gray-700">• 表邪不解，内传入里<br>• 外邪直入<br>• 情志内伤，饮食劳倦，直接伤于里</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 寒热辨证 -->
        <div class="bagan-category">
          <div class="category-header bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-3 rounded-t-lg">
            <h5 class="font-bold text-lg">寒热辨证</h5>
            <p class="text-sm opacity-90">病在经络脏腑/骨髓/气血、脉沉失调、气血紊乱</p>
          </div>
          <div class="category-body bg-red-50 p-4 rounded-b-lg border-2 border-red-200">
            <div class="grid grid-cols-2 gap-4">
              <!-- 寒证 -->
              <div class="subcategory bg-white p-3 rounded-lg border border-red-300">
                <div class="font-bold text-red-900 mb-2 pb-2 border-b border-red-200">寒证</div>

                <div class="space-y-2 text-sm">
                  <div class="symptom-item">
                    <div class="font-semibold text-red-800">实寒（阳虚则寒）</div>
                    <div class="text-gray-700">恶寒、肢冷、口不渴喜热饮、面白、腹痛拒按、大便溏薄、小便清长、苔白色、苔薄白、脉沉迟而弱</div>
                  </div>

                  <div class="symptom-item mt-3 pt-2 border-t border-red-200">
                    <div class="text-gray-600 text-sm">
                      <div class="font-semibold mb-1">外寒直中</div>
                      <div>• 胃：胃脘痛、呕吐</div>
                      <div>• 肠：腹痛、腹泻</div>
                      <div>• 胞宫：痛经</div>
                    </div>
                  </div>

                  <div class="symptom-item mt-2">
                    <div class="font-semibold text-red-800">虚寒群经</div>
                    <div class="text-gray-700">恩寒肢冷、面色苍白、腹痛喜按、口不渴、倦怠、小便清长、苔薄白色、苔白、脉沉迟而弱</div>
                  </div>
                </div>
              </div>

              <!-- 热证 -->
              <div class="subcategory bg-white p-3 rounded-lg border border-red-300">
                <div class="font-bold text-red-900 mb-2 pb-2 border-b border-red-200">热证</div>

                <div class="space-y-2 text-sm">
                  <div class="symptom-item">
                    <div class="font-semibold text-red-800">实热（阳盛则热）</div>
                    <div class="text-gray-700">发热口渴、面红目赤、大便秘结、小便短赤、舌红、苔黄、脉数而实</div>
                  </div>

                  <div class="symptom-item mt-3 pt-2 border-t border-red-200">
                    <div class="text-gray-600 text-sm space-y-1">
                      <div><span class="font-semibold">体内阳气过盛：</span>过食辛辣，肝热、肺热</div>
                      <div><span class="font-semibold">情志因素：</span>郁久化热，肝热、心热</div>
                      <div><span class="font-semibold">外邪化热传里：</span>（寒/暑/燥）高热、大汗、口渴</div>
                    </div>
                  </div>

                  <div class="symptom-item mt-2">
                    <div class="font-semibold text-red-800">虚热（阴虚则热）</div>
                    <div class="text-gray-700">午后发热、或有潮热、口干、夜晚咽喉干燥、盗汗、五心烦热、大便干燥、小便短赤、舌红无苔、脉浮细而数</div>
                  </div>

                  <div class="symptom-item mt-2 pt-2 border-t border-red-200">
                    <div class="text-gray-600 text-sm space-y-1">
                      <div><span class="font-semibold">真寒假热：</span>阴寒内盛、通阻子外（内有真寒而外现假热）</div>
                      <div><span class="font-semibold">真热假寒：</span>内热过盛、阳气被郁不能外达（内有真热而外现假寒）</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 虚实辨证 -->
        <div class="bagan-category">
          <div class="category-header bg-gradient-to-r from-purple-500 to-purple-600 text-white px-4 py-3 rounded-t-lg">
            <h5 class="font-bold text-lg">虚实辨证</h5>
            <p class="text-sm opacity-90">感受外邪所致的病证</p>
          </div>
          <div class="category-body bg-purple-50 p-4 rounded-b-lg border-2 border-purple-200">
            <div class="grid grid-cols-2 gap-4">
              <!-- 实证 -->
              <div class="subcategory bg-white p-3 rounded-lg border border-purple-300">
                <div class="font-bold text-purple-900 mb-2 pb-2 border-b border-purple-200">实证</div>

                <div class="space-y-2 text-sm">
                  <div class="symptom-item">
                    <div class="font-semibold text-purple-800">脏腑功能失调（微饮/水湿/痰饮）</div>
                  </div>

                  <div class="symptom-item mt-2">
                    <div class="font-semibold text-purple-800">气滞证</div>
                  </div>

                  <div class="symptom-item">
                    <div class="font-semibold text-purple-800">气虚（脾/胃/心/肺/肾气虚）</div>
                    <div class="text-gray-700">面白、声低、自汗、动则气短、倦怠、纳呆气短、倦怠、纳呆、脉虚</div>
                  </div>

                  <div class="symptom-item">
                    <div class="font-semibold text-purple-800">阳虚（脾/肾/心/肺/胃阳虚）</div>
                    <div class="text-gray-700">面色苍白、畏寒、肢冷、口不渴或渴热饮、便溏、尿频色淡、舌淡或淡迟</div>
                  </div>
                </div>
              </div>

              <!-- 虚证 -->
              <div class="subcategory bg-white p-3 rounded-lg border border-purple-300">
                <div class="font-bold text-purple-900 mb-2 pb-2 border-b border-purple-200">虚证</div>

                <div class="space-y-2 text-sm">
                  <div class="symptom-item">
                    <div class="font-semibold text-purple-800">血虚（心/肝血虚）</div>
                    <div class="text-gray-700">面色苍白、唇淡、目眩、头发干枯、失眠、健忘、纳呆、脉麻、月经量少或经闭、舌淡或淡、脉细或迟</div>
                  </div>

                  <div class="symptom-item">
                    <div class="font-semibold text-purple-800">阴虚（肾/肺/心/肝/胃阴虚）</div>
                    <div class="text-gray-700">午后低热或潮热、五心烦热、夜晚咽喉干燥、盗汗、消瘦、舌红无苔、脉浮细</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 阴阳辨证 -->
        <div class="bagan-category">
          <div class="category-header bg-gradient-to-r from-indigo-500 to-indigo-600 text-white px-4 py-3 rounded-t-lg">
            <h5 class="font-bold text-lg">阴阳辨证</h5>
            <p class="text-sm opacity-90">八纲辨证总纲</p>
          </div>
          <div class="category-body bg-indigo-50 p-4 rounded-b-lg border-2 border-indigo-200">
            <div class="grid grid-cols-2 gap-4">
              <!-- 阳虚 -->
              <div class="subcategory bg-white p-3 rounded-lg border border-indigo-300">
                <div class="font-bold text-indigo-900 mb-2 pb-2 border-b border-indigo-200">阳 亡阳</div>

                <div class="space-y-2 text-sm text-gray-700">
                  <div>汗出量多、皮肤灼热、肢冷、口渴喜少量冷饮、尿闭、便秘、舌短、光红而干、脉浮而数</div>
                </div>
              </div>

              <!-- 阴虚 -->
              <div class="subcategory bg-white p-3 rounded-lg border border-indigo-300">
                <div class="font-bold text-indigo-900 mb-2 pb-2 border-b border-indigo-200">阴 亡阴</div>

                <div class="space-y-2 text-sm text-gray-700">
                  <div>汗出量多如油、呼吸微弱、口不渴、尿频量多、或尿失禁、便溏或大便失禁、舌短淡胖而湿、脉沉微</div>
                </div>
              </div>
            </div>

            <!-- 辨证要点 -->
            <div class="mt-4 pt-4 border-t-2 border-dashed border-indigo-300">
              <div class="bg-gradient-to-r from-indigo-100 to-blue-100 rounded-lg p-4">
                <h6 class="font-bold text-indigo-900 mb-2">💡 八纲辨证核心要点</h6>
                <div class="grid grid-cols-2 gap-2 text-sm text-gray-700">
                  <div>• <span class="font-semibold">阴阳</span> - 总纲，统领表里寒热虚实</div>
                  <div>• <span class="font-semibold">表里</span> - 辨病位深浅（外感/内伤）</div>
                  <div>• <span class="font-semibold">寒热</span> - 辨病性（寒性/热性）</div>
                  <div>• <span class="font-semibold">虚实</span> - 辨邪正盛衰（正虚/邪实）</div>
                </div>
                <div class="mt-3 pt-3 border-t border-indigo-200 text-sm text-gray-600">
                  <div class="font-semibold mb-1">辨证关系：</div>
                  <div>阳证 = 表证 + 热证 + 实证 | 阴证 = 里证 + 寒证 + 虚证</div>
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
.bagan-diagram-container {
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

.bagan-category {
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

.subcategory {
  transition: all 0.2s ease;
}

.subcategory:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.symptom-item {
  transition: all 0.2s ease;
  padding: 4px;
  border-radius: 4px;
}

.symptom-item:hover {
  background-color: rgba(0, 0, 0, 0.02);
  transform: translateX(3px);
}

.category-header {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.category-body {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}
</style>
