<template>
  <div class="emoji-picker" ref="pickerRef">
    <!-- 触发按钮 -->
    <button
      type="button"
      @click="togglePicker"
      class="emoji-trigger-btn px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
      :title="title"
    >
      😊 表情
    </button>

    <!-- 表情选择器面板 -->
    <transition name="emoji-fade">
      <div
        v-if="showPicker"
        class="emoji-panel absolute z-50 mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden"
        :style="panelStyle"
      >
        <!-- 分类标签 -->
        <div class="emoji-tabs flex border-b border-gray-200 bg-gray-50">
          <button
            v-for="category in categories"
            :key="category.name"
            @click="activeCategory = category.name"
            :class="[
              'flex-1 px-3 py-2 text-sm font-medium transition-colors',
              activeCategory === category.name
                ? 'bg-white text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            ]"
            type="button"
          >
            {{ category.icon }}
          </button>
        </div>

        <!-- 表情列表 -->
        <div class="emoji-grid p-3" style="max-height: 280px; overflow-y: auto;">
          <div class="grid grid-cols-8 gap-1">
            <button
              v-for="emoji in currentEmojis"
              :key="emoji"
              @click="selectEmoji(emoji)"
              class="emoji-item w-10 h-10 flex items-center justify-center text-2xl hover:bg-gray-100 rounded transition-colors"
              type="button"
              :title="emoji"
            >
              {{ emoji }}
            </button>
          </div>
          <div v-if="currentEmojis.length === 0" class="text-center text-gray-400 py-8">
            暂无表情
          </div>
        </div>

        <!-- 常用表情 -->
        <div v-if="recentEmojis.length > 0" class="border-t border-gray-200 p-3 bg-gray-50">
          <div class="text-xs text-gray-500 mb-2">最近使用</div>
          <div class="flex gap-1 flex-wrap">
            <button
              v-for="emoji in recentEmojis"
              :key="'recent-' + emoji"
              @click="selectEmoji(emoji)"
              class="emoji-item w-8 h-8 flex items-center justify-center text-xl hover:bg-gray-200 rounded transition-colors"
              type="button"
            >
              {{ emoji }}
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
const props = defineProps({
  title: {
    type: String,
    default: '插入表情'
  },
  position: {
    type: String,
    default: 'bottom', // 'bottom' or 'top'
    validator: (value) => ['bottom', 'top'].includes(value)
  }
});

const emit = defineEmits(['select']);

const pickerRef = ref(null);
const showPicker = ref(false);
const activeCategory = ref('smileys');
const recentEmojis = ref([]);

// 表情分类
const categories = [
  {
    name: 'smileys',
    icon: '😊',
    label: '笑脸'
  },
  {
    name: 'gestures',
    icon: '👍',
    label: '手势'
  },
  {
    name: 'objects',
    icon: '📚',
    label: '物品'
  },
  {
    name: 'symbols',
    icon: '❤️',
    label: '符号'
  },
  {
    name: 'flags',
    icon: '🎌',
    label: '旗帜'
  }
];

// 表情数据
const emojis = {
  smileys: [
    '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂',
    '🙂', '🙃', '😉', '😊', '😇', '🥰', '😍', '🤩',
    '😘', '😗', '😚', '😙', '😋', '😛', '😜', '🤪',
    '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '🤐', '🤨',
    '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥',
    '😌', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕',
    '🤢', '🤮', '🤧', '🥵', '🥶', '😵', '🤯', '🤠',
    '🥳', '😎', '🤓', '🧐', '😕', '😟', '🙁', '😮',
    '😯', '😲', '😳', '🥺', '😦', '😧', '😨', '😰',
    '😥', '😢', '😭', '😱', '😖', '😣', '😞', '😓',
    '😩', '😫', '🥱', '😤', '😡', '😠', '🤬', '😈',
    '👿', '💀', '💩', '🤡', '👻', '👽', '👾', '🤖'
  ],
  gestures: [
    '👋', '🤚', '🖐', '✋', '🖖', '👌', '🤏', '✌️',
    '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕',
    '👇', '☝️', '👍', '👎', '✊', '👊', '🤛', '🤜',
    '👏', '🙌', '👐', '🤲', '🤝', '🙏', '✍️', '💅',
    '🤳', '💪', '🦾', '🦿', '🦵', '🦶', '👂', '🦻',
    '👃', '🧠', '🦷', '🦴', '👀', '👁', '👅', '👄'
  ],
  objects: [
    '📚', '📖', '📝', '📄', '📃', '📑', '📊', '📈',
    '📉', '📇', '📌', '📍', '📎', '📏', '📐', '✂️',
    '🖊', '🖋', '✒️', '🖌', '🖍', '📝', '✏️', '🔍',
    '🔎', '🔒', '🔓', '🔐', '🔑', '🗝', '🔨', '⚒',
    '🛠', '⚙️', '🔧', '🔩', '⚡', '🔥', '💧', '💦',
    '🌟', '⭐', '💫', '✨', '☀️', '🌙', '⛅', '🌈',
    '💻', '⌨️', '🖥', '🖨', '🖱', '💾', '💿', '📱',
    '📞', '☎️', '📟', '📠', '📺', '📻', '🎙', '🎚'
  ],
  symbols: [
    '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍',
    '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖',
    '💘', '💝', '💟', '☮️', '✝️', '☪️', '🕉', '☸️',
    '✡️', '🔯', '🕎', '☯️', '☦️', '🛐', '⛎', '♈',
    '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐',
    '♑', '♒', '♓', '🆔', '⚛️', '🉑', '☢️', '☣️',
    '📴', '📳', '🈶', '🈚', '🈸', '🈺', '🈷️', '✴️',
    '🆚', '💮', '🉐', '㊙️', '㊗️', '🈴', '🈵', '🈹'
  ],
  flags: [
    '🎌', '🏁', '🚩', '🏳️', '🏴', '🏳️‍🌈', '🏳️‍⚧️', '🇦🇨',
    '🇦🇩', '🇦🇪', '🇦🇫', '🇦🇬', '🇦🇮', '🇦🇱', '🇦🇲', '🇦🇴',
    '🇦🇶', '🇦🇷', '🇦🇸', '🇦🇹', '🇦🇺', '🇦🇼', '🇦🇽', '🇦🇿',
    '🇧🇦', '🇧🇧', '🇧🇩', '🇧🇪', '🇧🇫', '🇧🇬', '🇧🇭', '🇧🇮',
    '🇧🇯', '🇧🇱', '🇧🇲', '🇧🇳', '🇧🇴', '🇧🇶', '🇧🇷', '🇧🇸',
    '🇧🇹', '🇧🇻', '🇧🇼', '🇧🇾', '🇧🇿', '🇨🇦', '🇨🇨', '🇨🇩',
    '🇨🇫', '🇨🇬', '🇨🇭', '🇨🇮', '🇨🇰', '🇨🇱', '🇨🇲', '🇨🇳',
    '🇨🇴', '🇨🇵', '🇨🇷', '🇨🇺', '🇨🇻', '🇨🇼', '🇨🇽', '🇨🇾'
  ]
};

// 当前分类的表情
const currentEmojis = computed(() => {
  return emojis[activeCategory.value] || [];
});

// 面板位置样式
const panelStyle = computed(() => {
  if (props.position === 'top') {
    return {
      bottom: '100%',
      marginBottom: '0.5rem'
    };
  }
  return {};
});

// 切换显示
const togglePicker = () => {
  showPicker.value = !showPicker.value;
};

// 选择表情
const selectEmoji = (emoji) => {
  emit('select', emoji);

  // 添加到最近使用
  addToRecent(emoji);

  // 关闭选择器
  showPicker.value = false;
};

// 添加到最近使用
const addToRecent = (emoji) => {
  // 移除已存在的
  recentEmojis.value = recentEmojis.value.filter(e => e !== emoji);

  // 添加到开头
  recentEmojis.value.unshift(emoji);

  // 限制数量
  if (recentEmojis.value.length > 16) {
    recentEmojis.value = recentEmojis.value.slice(0, 16);
  }

  // 保存到 localStorage
  if (process.client) {
    try {
      localStorage.setItem('recent-emojis', JSON.stringify(recentEmojis.value));
    } catch (error) {
      console.error('保存常用表情失败:', error);
    }
  }
};

// 点击外部关闭
const handleClickOutside = (event) => {
  if (pickerRef.value && !pickerRef.value.contains(event.target)) {
    showPicker.value = false;
  }
};

// 组件挂载时加载最近使用
onMounted(() => {
  if (process.client) {
    try {
      const saved = localStorage.getItem('recent-emojis');
      if (saved) {
        recentEmojis.value = JSON.parse(saved);
      }
    } catch (error) {
      console.error('加载常用表情失败:', error);
    }
  }

  // 添加点击外部事件监听
  document.addEventListener('click', handleClickOutside);
});

// 组件卸载时移除监听
onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped>
.emoji-picker {
  position: relative;
  display: inline-block;
}

.emoji-trigger-btn {
  font-size: 0.875rem;
  user-select: none;
}

.emoji-panel {
  width: 350px;
  max-width: 90vw;
}

.emoji-item {
  cursor: pointer;
  user-select: none;
}

.emoji-item:active {
  transform: scale(0.9);
}

/* 滚动条样式 */
.emoji-grid::-webkit-scrollbar {
  width: 6px;
}

.emoji-grid::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.emoji-grid::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 3px;
}

.emoji-grid::-webkit-scrollbar-thumb:hover {
  background: #555;
}

/* 动画 */
.emoji-fade-enter-active,
.emoji-fade-leave-active {
  transition: all 0.2s ease;
}

.emoji-fade-enter-from,
.emoji-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
