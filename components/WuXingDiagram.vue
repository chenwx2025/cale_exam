<template>
  <div class="wuxing-diagram-container bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg p-8 border-2 border-orange-300">
    <h4 class="font-semibold text-orange-900 mb-6 flex items-center gap-2 justify-center">
      <span>🔄</span>
      <span>五行生克关系图</span>
    </h4>

    <div class="bg-white rounded-lg p-8 shadow-inner">
      <!-- Interactive Diagram -->
      <div class="relative w-full flex justify-center items-center" style="height: 650px;">
        <!-- Center Circle with 土 -->
        <div class="absolute inset-0 flex justify-center items-center" style="z-index: 5;">
          <div
            class="element-node earth"
            :class="{ 'active': activeElement === 'earth' }"
            @mouseenter="activeElement = 'earth'"
            @mouseleave="activeElement = null"
          >
            <div class="element-content bg-gradient-to-br from-yellow-600 to-yellow-700 text-white">
              <div class="text-3xl">⛰️</div>
              <div class="font-bold text-lg">土</div>
              <div class="text-xs mt-1">脾·胃</div>
            </div>
          </div>
        </div>

        <!-- Container for positioning -->
        <div class="relative w-full h-full max-w-4xl mx-auto">
          <!-- Five Elements positioned in traditional orientation -->
          <!-- Fire (Top - 南) -->
          <div
            class="element-node fire absolute"
            :class="{ 'active': activeElement === 'fire' }"
            @mouseenter="activeElement = 'fire'"
            @mouseleave="activeElement = null"
            style="top: 3%; left: 50%; transform: translate(-50%, 0);"
          >
            <div class="element-content bg-gradient-to-br from-red-500 to-red-600 text-white">
              <div class="text-3xl">🔥</div>
              <div class="font-bold text-lg">火</div>
              <div class="text-xs mt-1">心·小肠</div>
            </div>
          </div>

          <!-- Wood (Left - 东) -->
          <div
            class="element-node wood absolute"
            :class="{ 'active': activeElement === 'wood' }"
            @mouseenter="activeElement = 'wood'"
            @mouseleave="activeElement = null"
            style="top: 50%; left: 8%; transform: translate(0, -50%);"
          >
            <div class="element-content bg-gradient-to-br from-green-500 to-green-600 text-white">
              <div class="text-3xl">🌳</div>
              <div class="font-bold text-lg">木</div>
              <div class="text-xs mt-1">肝·胆</div>
            </div>
          </div>

          <!-- Metal (Right - 西) -->
          <div
            class="element-node metal absolute"
            :class="{ 'active': activeElement === 'metal' }"
            @mouseenter="activeElement = 'metal'"
            @mouseleave="activeElement = null"
            style="top: 50%; right: 8%; transform: translate(0, -50%);"
          >
            <div class="element-content bg-gradient-to-br from-gray-400 to-gray-500 text-white">
              <div class="text-3xl">⚪</div>
              <div class="font-bold text-lg">金</div>
              <div class="text-xs mt-1">肺·大肠</div>
            </div>
          </div>

          <!-- Water (Bottom - 北) -->
          <div
            class="element-node water absolute"
            :class="{ 'active': activeElement === 'water' }"
            @mouseenter="activeElement = 'water'"
            @mouseleave="activeElement = null"
            style="bottom: 3%; left: 50%; transform: translate(-50%, 0);"
          >
            <div class="element-content bg-gradient-to-br from-blue-600 to-blue-700 text-white">
              <div class="text-3xl">💧</div>
              <div class="font-bold text-lg">水</div>
              <div class="text-xs mt-1">肾·膀胱</div>
            </div>
          </div>

          <!-- SVG for relationship lines -->
          <svg class="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 800 650" preserveAspectRatio="xMidYMid meet" style="z-index: 1;">
            <!-- Generation Cycle (相生) - Green arrows forming outer circle -->
            <defs>
              <marker id="arrowGreen" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
                <path d="M0,0 L0,6 L9,3 z" fill="#22c55e" />
              </marker>
              <marker id="arrowRed" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
                <path d="M0,0 L0,6 L9,3 z" fill="#ef4444" />
              </marker>
            </defs>

            <!-- 相生关系 (Generation) - Outer pentagon -->
            <g :class="{ 'opacity-30': activeElement && !isGenerating(activeElement) }">
              <!-- Wood → Fire (左 → 上) -->
              <path d="M 150 325 Q 250 150 380 80" stroke="#22c55e" stroke-width="3" fill="none" marker-end="url(#arrowGreen)"
                    :class="{ 'highlight-line': activeElement === 'wood' }" />
              <text x="240" y="180" class="relationship-label" fill="#22c55e">木生火</text>

              <!-- Fire → Earth (上 → 中) -->
              <path d="M 400 120 Q 400 230 400 280" stroke="#22c55e" stroke-width="3" fill="none" marker-end="url(#arrowGreen)"
                    :class="{ 'highlight-line': activeElement === 'fire' }" />
              <text x="410" y="200" class="relationship-label" fill="#22c55e">火生土</text>

              <!-- Earth → Metal (中 → 右) -->
              <path d="M 450 325 Q 550 325 600 325" stroke="#22c55e" stroke-width="3" fill="none" marker-end="url(#arrowGreen)"
                    :class="{ 'highlight-line': activeElement === 'earth' }" />
              <text x="500" y="315" class="relationship-label" fill="#22c55e">土生金</text>

              <!-- Metal → Water (右 → 下) -->
              <path d="M 650 370 Q 550 500 420 570" stroke="#22c55e" stroke-width="3" fill="none" marker-end="url(#arrowGreen)"
                    :class="{ 'highlight-line': activeElement === 'metal' }" />
              <text x="530" y="490" class="relationship-label" fill="#22c55e">金生水</text>

              <!-- Water → Wood (下 → 左) -->
              <path d="M 380 570 Q 250 500 150 370" stroke="#22c55e" stroke-width="3" fill="none" marker-end="url(#arrowGreen)"
                    :class="{ 'highlight-line': activeElement === 'water' }" />
              <text x="240" y="490" class="relationship-label" fill="#22c55e">水生木</text>
            </g>

            <!-- 相克关系 (Restriction) - Inner star -->
            <g :class="{ 'opacity-30': activeElement && !isRestricting(activeElement) }">
              <!-- Wood → Earth (左 → 中) -->
              <path d="M 200 325 L 350 325" stroke="#ef4444" stroke-width="2.5" fill="none" marker-end="url(#arrowRed)" stroke-dasharray="6,4"
                    :class="{ 'highlight-line': activeElement === 'wood' }" />
              <text x="250" y="315" class="relationship-label" fill="#ef4444">木克土</text>

              <!-- Earth → Water (中 → 下) -->
              <path d="M 400 370 L 400 520" stroke="#ef4444" stroke-width="2.5" fill="none" marker-end="url(#arrowRed)" stroke-dasharray="6,4"
                    :class="{ 'highlight-line': activeElement === 'earth' }" />
              <text x="410" y="450" class="relationship-label" fill="#ef4444">土克水</text>

              <!-- Water → Fire (下 → 上) -->
              <path d="M 400 520 L 400 130" stroke="#ef4444" stroke-width="2.5" fill="none" marker-end="url(#arrowRed)" stroke-dasharray="6,4"
                    :class="{ 'highlight-line': activeElement === 'water' }" />
              <text x="320" y="330" class="relationship-label" fill="#ef4444">水克火</text>

              <!-- Fire → Metal (上 → 右) -->
              <path d="M 440 100 L 600 300" stroke="#ef4444" stroke-width="2.5" fill="none" marker-end="url(#arrowRed)" stroke-dasharray="6,4"
                    :class="{ 'highlight-line': activeElement === 'fire' }" />
              <text x="520" y="190" class="relationship-label" fill="#ef4444">火克金</text>

              <!-- Metal → Wood (右 → 左) -->
              <path d="M 600 350 L 200 350" stroke="#ef4444" stroke-width="2.5" fill="none" marker-end="url(#arrowRed)" stroke-dasharray="6,4"
                    :class="{ 'highlight-line': activeElement === 'metal' }" />
              <text x="380" y="380" class="relationship-label" fill="#ef4444">金克木</text>
            </g>
          </svg>
        </div>
      </div>

      <!-- Legend -->
      <div class="mt-8 pt-6 border-t-2 border-gray-200 flex justify-center gap-8">
        <div class="flex items-center gap-2">
          <div class="w-12 h-1 bg-green-500 rounded"></div>
          <span class="text-sm font-semibold text-gray-700">相生关系（促进）</span>
        </div>
        <div class="flex items-center gap-2">
          <div class="w-12 h-1 bg-red-500 rounded" style="background-image: repeating-linear-gradient(90deg, #ef4444 0, #ef4444 5px, transparent 5px, transparent 10px);"></div>
          <span class="text-sm font-semibold text-gray-700">相克关系（制约）</span>
        </div>
      </div>

      <!-- Relationship Details (shown when hovering) -->
      <div v-if="activeElement" class="mt-6 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border-2 border-indigo-200 animate-fadeIn">
        <div class="text-center">
          <div class="text-lg font-bold text-indigo-900 mb-3">
            {{ getElementName(activeElement) }} 的关系
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div class="bg-green-50 p-3 rounded border-l-4 border-green-500">
              <div class="font-semibold text-green-800 mb-1">🌱 相生关系</div>
              <div class="text-green-700">{{ getGenerationRelation(activeElement) }}</div>
            </div>
            <div class="bg-red-50 p-3 rounded border-l-4 border-red-500">
              <div class="font-semibold text-red-800 mb-1">⚔️ 相克关系</div>
              <div class="text-red-700">{{ getRestrictionRelation(activeElement) }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Explanation -->
      <div class="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="text-center text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
          <p class="font-semibold text-blue-900 mb-1">💡 交互提示</p>
          <p>将鼠标悬停在五行元素上，查看其生克关系</p>
        </div>
        <div class="text-center text-sm text-gray-600 bg-purple-50 p-3 rounded-lg">
          <p class="font-semibold text-purple-900 mb-1">🧭 五行方位</p>
          <p>木-东 · 火-南 · 土-中 · 金-西 · 水-北</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const activeElement = ref<string | null>(null)

const getElementName = (element: string) => {
  const names: Record<string, string> = {
    wood: '木（肝胆）',
    fire: '火（心小肠）',
    earth: '土（脾胃）',
    metal: '金（肺大肠）',
    water: '水（肾膀胱）'
  }
  return names[element] || ''
}

const getGenerationRelation = (element: string) => {
  const relations: Record<string, string> = {
    wood: '水生木（肾精滋养肝木）→ 木生火（肝血济心火）',
    fire: '木生火（肝血济心火）→ 火生土（心阳温脾土）',
    earth: '火生土（心阳温脾土）→ 土生金（脾化气血养肺）',
    metal: '土生金（脾化气血养肺）→ 金生水（肺气助肾水）',
    water: '金生水（肺气助肾水）→ 水生木（肾精滋肝木）'
  }
  return relations[element] || ''
}

const getRestrictionRelation = (element: string) => {
  const relations: Record<string, string> = {
    wood: '金克木（肺气制肝木）→ 木克土（肝疏泄调脾土）',
    fire: '水克火（肾阴制心火）→ 火克金（心火制肺金）',
    earth: '木克土（肝疏泄调脾土）→ 土克水（脾运化制肾水）',
    metal: '火克金（心火制肺金）→ 金克木（肺气制肝木）',
    water: '土克水（脾运化制肾水）→ 水克火（肾阴制心火）'
  }
  return relations[element] || ''
}

const isGenerating = (element: string | null) => {
  if (!element) return false
  return ['wood', 'fire', 'earth', 'metal', 'water'].includes(element)
}

const isRestricting = (element: string | null) => {
  if (!element) return false
  return ['wood', 'fire', 'earth', 'metal', 'water'].includes(element)
}
</script>

<style scoped>
.element-node {
  transition: all 0.3s ease;
  z-index: 10;
}

.element-content {
  width: 110px;
  height: 110px;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
  cursor: pointer;
  border: 3px solid rgba(255, 255, 255, 0.3);
}

.element-node:hover .element-content,
.element-node.active .element-content {
  transform: scale(1.15);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
  z-index: 20;
}

.relationship-label {
  font-size: 13px;
  font-weight: 700;
  pointer-events: none;
  text-shadow: 1px 1px 2px rgba(255, 255, 255, 0.8);
}

.highlight-line {
  stroke-width: 5 !important;
  opacity: 1 !important;
  filter: drop-shadow(0 0 8px currentColor);
  animation: pulse-line 1.5s ease-in-out infinite;
}

@keyframes pulse-line {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
}

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

.animate-fadeIn {
  animation: fadeIn 0.3s ease-out;
}
</style>
