<template>
  <div class="wuxing-classification-container bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-6 border-2 border-green-300">
    <h4 class="font-semibold text-green-900 mb-4 flex items-center gap-2">
      <span>🌿</span>
      <span>五行归类体系图</span>
    </h4>

    <div class="bg-white rounded-lg p-6 shadow-inner">
      <!-- Five Elements Classification Grid -->
      <div class="grid grid-cols-5 gap-3 text-sm">
        <!-- 木 -->
        <div class="wuxing-col bg-gradient-to-br from-green-100 to-green-200 p-3 rounded-lg border border-green-400">
          <div class="font-bold text-green-800 text-center mb-2 text-base">木 曲直 肝</div>
          <div class="space-y-1 text-gray-700">
            <div><span class="text-orange-600">肝中之阴</span> 后核 风轮 黑睛 泪 筋 气强 脾 表 辛 鱼</div>
          </div>
        </div>

        <!-- 火 -->
        <div class="wuxing-col bg-gradient-to-br from-red-100 to-red-200 p-3 rounded-lg border border-red-400">
          <div class="font-bold text-red-800 text-center mb-2 text-base">火 炎上 心</div>
          <div class="space-y-1 text-gray-700">
            <div><span class="text-orange-600">阳中之阳</span> 上焦 血轮 白角 汗 胸 气续 焦 豆 舌 鸟</div>
          </div>
        </div>

        <!-- 土 -->
        <div class="wuxing-col bg-gradient-to-br from-yellow-100 to-yellow-200 p-3 rounded-lg border border-yellow-400">
          <div class="font-bold text-yellow-800 text-center mb-2 text-base">土 稼穑 脾</div>
          <div class="space-y-1 text-gray-700">
            <div><span class="text-orange-600">阴中之至阴</span> 肉轮 白角 目洒 涎 肉 气续 焦 稻 牛 人</div>
          </div>
        </div>

        <!-- 金 -->
        <div class="wuxing-col bg-gradient-to-br from-gray-100 to-gray-200 p-3 rounded-lg border border-gray-400">
          <div class="font-bold text-gray-800 text-center mb-2 text-base">金 从革 肺</div>
          <div class="space-y-1 text-gray-700">
            <div><span class="text-orange-600">阳中之阴</span> 下焦 气轮 白角 涕 骨 气强 脾 下 咸 麻 狗 哺</div>
          </div>
        </div>

        <!-- 水 -->
        <div class="wuxing-col bg-gradient-to-br from-blue-100 to-blue-200 p-3 rounded-lg border border-blue-400">
          <div class="font-bold text-blue-800 text-center mb-2 text-base">水 润下 肾</div>
          <div class="space-y-1 text-gray-700">
            <div><span class="text-orange-600">阴中之阴</span> 前后 水轮 瞳仁 唾 膻 下乱 腰 穗 贝</div>
          </div>
        </div>
      </div>

      <!-- Formula Explanation -->
      <div class="mt-4 pt-4 border-t-2 border-dashed border-green-400">
        <div class="bg-green-100 rounded-lg p-3 text-sm text-gray-700">
          <div class="font-bold mb-2">五行关系公式：</div>
          <div class="space-y-1">
            <div>清气 + 谷气 = 宗气 + 原气 = 真气（=宗气 + 原气）又称经气，是经络功能的基础</div>
            <div class="text-red-600 font-semibold">营气与卫气来源于清气 + 谷气</div>
          </div>
        </div>
      </div>

      <!-- Detailed Correspondences -->
      <div class="mt-6 bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg p-4 border-2 border-green-300">
        <div class="font-bold text-green-900 mb-3 text-center text-lg">五行归类要点总结</div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-700">
          <div class="bg-white p-3 rounded-lg border-l-4 border-green-500">
            <span class="font-semibold text-green-700">木：</span>主升发，属肝胆，在体为筋，在窍为目，在志为怒，在液为泪
          </div>
          <div class="bg-white p-3 rounded-lg border-l-4 border-red-500">
            <span class="font-semibold text-red-700">火：</span>主温煦，属心小肠，在体为脉，在窍为舌，在志为喜，在液为汗
          </div>
          <div class="bg-white p-3 rounded-lg border-l-4 border-yellow-600">
            <span class="font-semibold text-yellow-700">土：</span>主运化，属脾胃，在体为肉，在窍为口，在志为思，在液为涎
          </div>
          <div class="bg-white p-3 rounded-lg border-l-4 border-gray-500">
            <span class="font-semibold text-gray-700">金：</span>主肃降，属肺大肠，在体为皮毛，在窍为鼻，在志为悲，在液为涕
          </div>
          <div class="bg-white p-3 rounded-lg border-l-4 border-blue-500">
            <span class="font-semibold text-blue-700">水：</span>主藏精，属肾膀胱，在体为骨，在窍为耳及二阴，在志为恐，在液为唾
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
.wuxing-classification-container {
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

.wuxing-col {
  transition: all 0.2s ease;
}

.wuxing-col:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}
</style>
