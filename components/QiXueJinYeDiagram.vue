<template>
  <div class="qixue-diagram-container bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-6 border-2 border-blue-300">
    <h4 class="font-semibold text-blue-900 mb-4 flex items-center gap-2">
      <span>📊</span>
      <span>气血津液精神理论体系图</span>
    </h4>

    <div class="bg-white rounded-lg p-6 shadow-inner">
      <!-- 主布局：左侧导航 + 右侧内容 -->
      <div class="grid grid-cols-12 gap-6">
        <!-- 左侧：中医基础知识点导航 -->
        <div class="col-span-3">
          <div class="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 rounded-2xl shadow-xl overflow-hidden sticky top-4">
            <!-- 导航标题 -->
            <div class="bg-white/10 backdrop-blur-sm px-4 py-3 border-b border-white/20">
              <h3 class="text-white font-bold text-sm flex items-center gap-2">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"/>
                </svg>
                <span>理论导航</span>
              </h3>
            </div>

            <!-- 导航列表 -->
            <div class="p-3 space-y-2">
              <!-- 气 -->
              <button
                class="nav-item group w-full"
                :class="{'active': activeSection === 'qi'}"
                @click="activeSection = 'qi'"
              >
                <div class="flex items-center gap-3 p-3 rounded-xl transition-all duration-300"
                  :class="activeSection === 'qi'
                    ? 'bg-white text-indigo-700 shadow-lg transform scale-105'
                    : 'bg-white/10 text-white hover:bg-white/20'"
                >
                  <div class="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg transition-all"
                    :class="activeSection === 'qi'
                      ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-md'
                      : 'bg-white/20 text-amber-200 group-hover:bg-white/30'"
                  >
                    气
                  </div>
                  <div class="flex-1 text-left">
                    <div class="font-bold text-sm mb-0.5">气的理论</div>
                    <div class="text-xs opacity-75">构成人体的物质基础</div>
                  </div>
                  <svg v-if="activeSection === 'qi'" class="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                  </svg>
                </div>
              </button>

              <!-- 血 -->
              <button
                class="nav-item group w-full"
                :class="{'active': activeSection === 'xue'}"
                @click="activeSection = 'xue'"
              >
                <div class="flex items-center gap-3 p-3 rounded-xl transition-all duration-300"
                  :class="activeSection === 'xue'
                    ? 'bg-white text-indigo-700 shadow-lg transform scale-105'
                    : 'bg-white/10 text-white hover:bg-white/20'"
                >
                  <div class="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg transition-all"
                    :class="activeSection === 'xue'
                      ? 'bg-gradient-to-br from-red-500 to-pink-500 text-white shadow-md'
                      : 'bg-white/20 text-red-200 group-hover:bg-white/30'"
                  >
                    血
                  </div>
                  <div class="flex-1 text-left">
                    <div class="font-bold text-sm mb-0.5">血的理论</div>
                    <div class="text-xs opacity-75">气血相依的关系</div>
                  </div>
                  <svg v-if="activeSection === 'xue'" class="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                  </svg>
                </div>
              </button>

              <!-- 津液 -->
              <button
                class="nav-item group w-full"
                :class="{'active': activeSection === 'jinye'}"
                @click="activeSection = 'jinye'"
              >
                <div class="flex items-center gap-3 p-3 rounded-xl transition-all duration-300"
                  :class="activeSection === 'jinye'
                    ? 'bg-white text-indigo-700 shadow-lg transform scale-105'
                    : 'bg-white/10 text-white hover:bg-white/20'"
                >
                  <div class="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg transition-all"
                    :class="activeSection === 'jinye'
                      ? 'bg-gradient-to-br from-cyan-500 to-blue-500 text-white shadow-md'
                      : 'bg-white/20 text-cyan-200 group-hover:bg-white/30'"
                  >
                    津液
                  </div>
                  <div class="flex-1 text-left">
                    <div class="font-bold text-sm mb-0.5">津液理论</div>
                    <div class="text-xs opacity-75">津与液的分类功能</div>
                  </div>
                  <svg v-if="activeSection === 'jinye'" class="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                  </svg>
                </div>
              </button>

              <!-- 精 -->
              <button
                class="nav-item group w-full"
                :class="{'active': activeSection === 'jing'}"
                @click="activeSection = 'jing'"
              >
                <div class="flex items-center gap-3 p-3 rounded-xl transition-all duration-300"
                  :class="activeSection === 'jing'
                    ? 'bg-white text-indigo-700 shadow-lg transform scale-105'
                    : 'bg-white/10 text-white hover:bg-white/20'"
                >
                  <div class="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg transition-all"
                    :class="activeSection === 'jing'
                      ? 'bg-gradient-to-br from-indigo-500 to-purple-500 text-white shadow-md'
                      : 'bg-white/20 text-indigo-200 group-hover:bg-white/30'"
                  >
                    精
                  </div>
                  <div class="flex-1 text-left">
                    <div class="font-bold text-sm mb-0.5">精的理论</div>
                    <div class="text-xs opacity-75">精气神的关系</div>
                  </div>
                  <svg v-if="activeSection === 'jing'" class="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                  </svg>
                </div>
              </button>
            </div>

            <!-- 底部提示 -->
            <div class="bg-white/5 backdrop-blur-sm px-4 py-2 border-t border-white/10">
              <div class="text-xs text-white/70 text-center">
                点击查看详细内容
              </div>
            </div>
          </div>
        </div>

        <!-- 右侧：详细内容 -->
        <div class="col-span-9 space-y-4">
          <!-- 气的理论 -->
          <div v-if="activeSection === 'qi'" class="content-section">
            <div class="section-header bg-gradient-to-r from-amber-500 to-amber-600 text-white px-4 py-3 rounded-t-lg">
              <h5 class="font-bold text-lg">气 - 构成人体的物质基础</h5>
            </div>
            <div class="section-body bg-amber-50 p-4 rounded-b-lg border-2 border-amber-200">
              <div class="space-y-4">
                <!-- 气的生成 -->
                <div class="qi-section">
                  <h6 class="font-bold text-amber-900 mb-2">气的生成与分类</h6>
                  <div class="space-y-2 text-sm">
                    <div class="bg-white p-3 rounded border-l-4 border-amber-500">
                      <div class="font-semibold text-amber-800 mb-1">原气（元气）</div>
                      <div class="text-gray-700">肾精在生而来，又称赖大水谷精微的滋养与充养。原气包括元阴、元阳</div>
                    </div>

                    <div class="bg-white p-3 rounded border-l-4 border-amber-500">
                      <div class="font-semibold text-amber-800 mb-1">谷气</div>
                      <div class="text-gray-700">从脾至心，在肺至与司呼吸的功能：内呼吸与引呼吸之间气，生成宗气；从肠至心，營养脑与周身经纬六腑，营养能向與同身经纬</div>
                    </div>

                    <div class="grid grid-cols-2 gap-2">
                      <div class="bg-white p-3 rounded border-l-4 border-red-500">
                        <div class="font-semibold text-red-800 mb-1">营气</div>
                        <div class="text-gray-700">
                          <div><span class="text-red-600">阳中之阴</span> 行于脉中，经血脉与循行</div>
                          <div class="text-xs mt-1">平衡：责五脏统六腑，营养能向與同身经纬</div>
                        </div>
                      </div>

                      <div class="bg-white p-3 rounded border-l-4 border-blue-500">
                        <div class="font-semibold text-blue-800 mb-1">卫气</div>
                        <div class="text-gray-700">
                          <div><span class="text-blue-600">阳中之阳</span> 行于脉外，经血脉与循行</div>
                          <div class="text-xs mt-1">卫汗孔开合，温润皮毛，调节体温，温煦脏肌</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- 气的功能 -->
                <div class="qi-section bg-gradient-to-r from-amber-100 to-orange-100 p-3 rounded-lg">
                  <h6 class="font-bold text-amber-900 mb-2">气的功能</h6>
                  <div class="grid grid-cols-3 gap-2 text-sm">
                    <div class="text-gray-700">• <span class="font-semibold">推动</span> - 推动血液、津液运行</div>
                    <div class="text-gray-700">• <span class="font-semibold">温煦</span> - 维持体温</div>
                    <div class="text-gray-700">• <span class="font-semibold">防御</span> - 抵御外邪</div>
                    <div class="text-gray-700">• <span class="font-semibold">固摄</span> - 固摄血液、津液</div>
                    <div class="text-gray-700">• <span class="font-semibold">气化</span> - 物质转化</div>
                    <div class="text-gray-700">• <span class="font-semibold">营养</span> - 营养全身</div>
                  </div>
                </div>

                <!-- 气的运行 -->
                <div class="qi-section">
                  <h6 class="font-bold text-amber-900 mb-2">气的运行</h6>
                  <div class="text-sm text-gray-700">
                    <div class="mb-2"><span class="font-semibold">气的运行：</span>升降是纵向，出入是横向。宗气上出息道，下走气街，散于胸腹</div>
                    <div class="bg-white p-2 rounded border border-amber-300">
                      营气与血同行于十二经，环周不休，卫气属于周身，分布于胸腹
                    </div>
                  </div>
                </div>

                <!-- 中气和经气 -->
                <div class="qi-section grid grid-cols-2 gap-2 text-sm">
                  <div class="bg-white p-3 rounded border-l-4 border-purple-500">
                    <div class="font-semibold text-purple-800 mb-1">中气</div>
                    <div class="text-gray-700">
                      <div>脾胃的真气，脾胃沦化，升阳清阳</div>
                      <div class="text-xs mt-1">正气 卫气+营气+营精<br/>经气 原气+宗气+营气+卫气，即真气（又称"正气"）</div>
                    </div>
                  </div>

                  <div class="bg-white p-3 rounded border-l-4 border-indigo-500">
                    <div class="font-semibold text-indigo-800 mb-1">气的功能总结</div>
                    <div class="text-gray-700 text-xs space-y-1">
                      <div>• 气能生津、行津、摄津</div>
                      <div>• 津能载气</div>
                      <div>• 气为血之帅，血为气之母</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 血的理论 -->
          <div v-if="activeSection === 'xue'" class="content-section">
            <div class="section-header bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-3 rounded-t-lg">
              <h5 class="font-bold text-lg">血的理论</h5>
            </div>
            <div class="section-body bg-red-50 p-4 rounded-b-lg border-2 border-red-200">
              <div class="space-y-3">
                <div class="blood-item bg-white p-3 rounded-lg border-l-4 border-red-500">
                  <div class="font-semibold text-red-800 mb-2">气为血之帅，血为气之母</div>
                  <div class="text-sm text-gray-700 space-y-1">
                    <div>• 气能生血（心气为真气）气能行血（心气推动）</div>
                    <div>• 血能载气，血能养气</div>
                  </div>
                </div>

                <div class="blood-item bg-white p-3 rounded-lg border-l-4 border-red-500">
                  <div class="font-semibold text-red-800 mb-2">气为血之帅</div>
                  <div class="text-sm text-gray-700 space-y-1">
                    <div>1. 气能生血（心气为真气）</div>
                    <div>2. 气能行血（心气推动）</div>
                    <div>3. 气能摄血（脾气统血）</div>
                  </div>
                </div>

                <div class="blood-item bg-white p-3 rounded-lg border-l-4 border-blue-500">
                  <div class="font-semibold text-blue-800 mb-2">血为气之母</div>
                  <div class="text-sm text-gray-700 space-y-1">
                    <div>• 血能载气</div>
                    <div>• 血能养气</div>
                  </div>
                </div>

                <div class="bg-gradient-to-r from-red-100 to-pink-100 p-3 rounded-lg">
                  <div class="font-bold text-red-900 mb-2">血的生成与循行</div>
                  <div class="text-sm text-gray-700">
                    血为血之母一血能生气，血能载气
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 津液理论 -->
          <div v-if="activeSection === 'jinye'" class="content-section">
            <div class="section-header bg-gradient-to-r from-cyan-500 to-cyan-600 text-white px-4 py-3 rounded-t-lg">
              <h5 class="font-bold text-lg">津液理论</h5>
            </div>
            <div class="section-body bg-cyan-50 p-4 rounded-b-lg border-2 border-cyan-200">
              <div class="space-y-3">
                <div class="jinye-type bg-white p-3 rounded-lg border-l-4 border-cyan-500">
                  <div class="font-semibold text-cyan-800 mb-2">津（份为清）清稀</div>
                  <div class="text-sm text-gray-700">
                    <div class="mb-1">流动性大</div>
                    <div>与卫气同行于体表，受脾、肺、肾所主</div>
                  </div>
                </div>

                <div class="jinye-type bg-white p-3 rounded-lg border-l-4 border-blue-500">
                  <div class="font-semibold text-blue-800 mb-2">液（脏液为重）浓稠</div>
                  <div class="text-sm text-gray-700">
                    <div class="mb-1">流动性小</div>
                    <div>与营气同行于体内，受脾、肺、肾所主</div>
                  </div>
                </div>

                <div class="bg-gradient-to-r from-cyan-100 to-blue-100 p-3 rounded-lg">
                  <div class="font-bold text-cyan-900 mb-2">津液的功能</div>
                  <div class="grid grid-cols-2 gap-2 text-sm text-gray-700">
                    <div class="function-item">
                      <div class="font-semibold mb-1">津（份为清）清稀（津液）清稀</div>
                      <div>滋润、流动性大、与卫气同行于体表，受脾、肺所主</div>
                    </div>
                    <div class="function-item">
                      <div class="font-semibold mb-1">液（脏液为重）浓稠（津液为重）浓稠</div>
                      <div>濡养关节，脊椎，胶，骨，髓，润滑五脏六孔窍</div>
                    </div>
                  </div>
                </div>

                <div class="relationship-box bg-white p-3 rounded-lg border-2 border-dashed border-cyan-400">
                  <div class="font-bold text-cyan-900 mb-2">精—精与气为神之物质基础</div>
                  <div class="text-sm text-gray-700">
                    一精与气为神之物质基础
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 精的理论 -->
          <div v-if="activeSection === 'jing'" class="content-section">
            <div class="section-header bg-gradient-to-r from-indigo-500 to-indigo-600 text-white px-4 py-3 rounded-t-lg">
              <h5 class="font-bold text-lg">精的理论</h5>
            </div>
            <div class="section-body bg-indigo-50 p-4 rounded-b-lg border-2 border-indigo-200">
              <div class="space-y-3">
                <div class="jing-item bg-white p-3 rounded-lg border-l-4 border-indigo-500">
                  <div class="font-semibold text-indigo-800 mb-2">精的概念</div>
                  <div class="text-sm text-gray-700">
                    <div class="mb-2">• 先天之精 - 禀受于父母，藏于肾中</div>
                    <div class="mb-2">• 后天之精 - 水谷精微，由脾胃化生</div>
                    <div>• 脏腑之精 - 各脏腑的精微物质</div>
                  </div>
                </div>

                <div class="jing-item bg-white p-3 rounded-lg border-l-4 border-purple-500">
                  <div class="font-semibold text-purple-800 mb-2">神的概念</div>
                  <div class="text-sm text-gray-700">
                    <div class="mb-2">• 广义之神 - 人体生命活动的总称</div>
                    <div class="mb-2">• 狭义之神 - 精神、意识、思维活动</div>
                    <div class="mb-1"><span class="font-semibold text-green-600">得神</span> - 精神饱满，意识清楚，反应灵敏</div>
                    <div><span class="font-semibold text-red-600">失神</span> - 精神萎靡，意识模糊，反应迟钝</div>
                  </div>
                </div>

                <div class="bg-gradient-to-r from-indigo-100 to-purple-100 p-4 rounded-lg">
                  <div class="font-bold text-indigo-900 mb-3">精气神关系</div>
                  <div class="space-y-2 text-sm text-gray-700">
                    <div class="flex items-center gap-2">
                      <span class="font-semibold text-indigo-700">精</span>
                      <span>→</span>
                      <span class="font-semibold text-purple-700">气</span>
                      <span>→</span>
                      <span class="font-semibold text-pink-700">神</span>
                    </div>
                    <div class="bg-white p-2 rounded border border-indigo-300">
                      精化气，气化神。精气充足则神旺，精气亏虚则神衰。
                    </div>
                  </div>
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
import { ref } from 'vue'

const activeSection = ref('qi')
</script>

<style scoped>
.qixue-diagram-container {
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

.nav-item {
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.nav-item:active {
  transform: scale(0.98);
}

.content-section {
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

.concept-item,
.qi-section,
.blood-item,
.jinye-type,
.jing-item {
  transition: all 0.2s ease;
}

.concept-item:hover,
.qi-section:hover,
.blood-item:hover,
.jinye-type:hover,
.jing-item:hover {
  transform: translateX(3px);
}

.concept-title {
  font-weight: 600;
  color: #7c3aed;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
}

.concept-content {
  padding-left: 1rem;
  font-size: 0.875rem;
  color: #374151;
}

.treatment-box {
  transition: all 0.2s ease;
}

.treatment-box:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.section-header {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.section-body {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}
</style>
