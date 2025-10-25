<template>
  <div class="markdown-editor">
    <!-- 编辑器工具栏 -->
    <div class="toolbar bg-gray-50 border border-gray-300 rounded-t-lg px-4 py-2 flex items-center gap-2 flex-wrap">
      <button
        v-for="tool in tools"
        :key="tool.name"
        @click="insertMarkdown(tool)"
        :title="tool.title"
        class="toolbar-btn px-3 py-1.5 bg-white border border-gray-300 rounded hover:bg-gray-100 transition-colors text-sm font-medium"
        type="button"
      >
        {{ tool.icon }} {{ tool.label }}
      </button>

      <!-- 表情包选择器 -->
      <EmojiPicker @select="insertEmoji" title="插入表情" />

      <div class="flex-1"></div>

      <!-- 编辑/预览切换 -->
      <div class="flex bg-white border border-gray-300 rounded overflow-hidden">
        <button
          @click="mode = 'edit'"
          :class="[
            'px-3 py-1.5 text-sm font-medium transition-colors',
            mode === 'edit' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
          ]"
        >
          ✏️ 编辑
        </button>
        <button
          @click="mode = 'preview'"
          :class="[
            'px-3 py-1.5 text-sm font-medium transition-colors',
            mode === 'preview' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
          ]"
        >
          👁️ 预览
        </button>
        <button
          @click="mode = 'split'"
          :class="[
            'px-3 py-1.5 text-sm font-medium transition-colors',
            mode === 'split' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
          ]"
        >
          ⚡ 分屏
        </button>
      </div>
    </div>

    <!-- 编辑器区域 -->
    <div class="editor-container border-x border-b border-gray-300 rounded-b-lg overflow-hidden bg-white">
      <div :class="[
        'flex',
        mode === 'split' ? 'divide-x divide-gray-300' : ''
      ]">
        <!-- 编辑区 -->
        <div
          v-show="mode === 'edit' || mode === 'split'"
          :class="[
            'editor-pane relative',
            mode === 'split' ? 'w-1/2' : 'w-full'
          ]"
        >
          <textarea
            ref="textareaRef"
            v-model="localValue"
            @input="handleInput"
            @keydown="handleKeydown"
            @blur="handleBlur"
            :placeholder="placeholder"
            :rows="rows"
            class="w-full px-4 py-3 focus:outline-none resize-none font-mono text-sm"
            style="min-height: 300px;"
          ></textarea>

          <!-- @mention autocomplete dropdown -->
          <div
            v-if="showMentionDropdown"
            class="mention-dropdown"
            :style="dropdownStyle"
          >
            <!-- 加载中状态 -->
            <div v-if="groupMembers.length === 0" class="mention-item">
              <div class="flex items-center gap-2 text-gray-500">
                <div class="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <span class="text-sm">加载成员中...</span>
              </div>
            </div>
            <!-- 成员列表 -->
            <div
              v-else-if="filteredMembers.length > 0"
              v-for="(member, index) in filteredMembers"
              :key="member.id"
              @mousedown.prevent="selectMention(member)"
              :class="[
                'mention-item',
                { 'mention-item-active': index === selectedMentionIndex }
              ]"
            >
              <div class="flex items-center gap-2">
                <div class="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
                  {{ member.displayName.charAt(0) }}
                </div>
                <div>
                  <div class="font-medium text-sm">{{ member.displayName }}</div>
                  <div class="text-xs text-gray-500">@{{ member.username }}</div>
                </div>
              </div>
            </div>
            <!-- 无匹配结果 -->
            <div v-else class="mention-item">
              <div class="text-sm text-gray-500">未找到匹配的成员</div>
            </div>
          </div>
        </div>

        <!-- 预览区 -->
        <div
          v-show="mode === 'preview' || mode === 'split'"
          :class="[
            'preview-pane overflow-y-auto bg-gray-50',
            mode === 'split' ? 'w-1/2' : 'w-full'
          ]"
          style="min-height: 300px; max-height: 600px;"
        >
          <div
            v-if="localValue.trim()"
            class="markdown-preview px-4 py-3 prose prose-sm max-w-none"
            v-html="renderedMarkdown"
          ></div>
          <div v-else class="px-4 py-3 text-gray-400 italic">
            预览区域将在这里显示...
          </div>
        </div>
      </div>
    </div>

    <!-- Markdown 语法提示 -->
    <details class="mt-2 text-xs text-gray-600">
      <summary class="cursor-pointer hover:text-gray-900">📖 Markdown语法帮助</summary>
      <div class="mt-2 p-3 bg-gray-50 rounded border border-gray-200">
        <div class="grid grid-cols-2 gap-2">
          <div><code># 标题</code> - 一级标题</div>
          <div><code>## 标题</code> - 二级标题</div>
          <div><code>**粗体**</code> - <strong>粗体</strong></div>
          <div><code>*斜体*</code> - <em>斜体</em></div>
          <div><code>[链接](url)</code> - 超链接</div>
          <div><code>![图片](url)</code> - 图片</div>
          <div><code>`代码`</code> - 行内代码</div>
          <div><code>```代码块```</code> - 代码块</div>
          <div><code>- 列表</code> - 无序列表</div>
          <div><code>1. 列表</code> - 有序列表</div>
          <div><code>> 引用</code> - 引用文本</div>
          <div><code>---</code> - 分隔线</div>
        </div>
      </div>
    </details>
  </div>
</template>

<script setup>
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import hljs from 'highlight.js/lib/core';
import javascript from 'highlight.js/lib/languages/javascript';
import python from 'highlight.js/lib/languages/python';
import java from 'highlight.js/lib/languages/java';
import xml from 'highlight.js/lib/languages/xml';
import css from 'highlight.js/lib/languages/css';
import sql from 'highlight.js/lib/languages/sql';

// 注册常用语言
hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('python', python);
hljs.registerLanguage('java', java);
hljs.registerLanguage('html', xml);
hljs.registerLanguage('xml', xml);
hljs.registerLanguage('css', css);
hljs.registerLanguage('sql', sql);

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: '支持Markdown格式，开始编写内容...'
  },
  rows: {
    type: Number,
    default: 10
  },
  groupId: {
    type: String,
    default: null
  }
});

const emit = defineEmits(['update:modelValue']);

const authStore = useAuthStore();
const textareaRef = ref(null);
const localValue = ref(props.modelValue);
const mode = ref('split'); // 'edit', 'preview', 'split'

// @ 提及功能相关状态
const showMentionDropdown = ref(false);
const mentionQuery = ref('');
const mentionStartPos = ref(0);
const selectedMentionIndex = ref(0);
const groupMembers = ref([]);
const dropdownStyle = ref({});

// console.log('[MarkdownEditor] 组件初始化, groupId:', props.groupId);

// 配置marked
marked.setOptions({
  highlight: function(code, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(code, { language: lang }).value;
      } catch (err) {
        console.error('Highlight error:', err);
      }
    }
    return code;
  },
  breaks: true,
  gfm: true
});

// 工具栏按钮
const tools = [
  { name: 'bold', icon: '𝐁', label: '粗体', syntax: '**', title: '粗体 (Ctrl+B)' },
  { name: 'italic', icon: '𝐼', label: '斜体', syntax: '*', title: '斜体 (Ctrl+I)' },
  { name: 'heading', icon: 'H', label: '标题', syntax: '## ', before: true, title: '标题' },
  { name: 'link', icon: '🔗', label: '链接', syntax: '[文字](url)', title: '链接 (Ctrl+K)' },
  { name: 'image', icon: '🖼️', label: '图片', syntax: '![描述](url)', title: '图片' },
  { name: 'code', icon: '<>', label: '代码', syntax: '`', title: '代码 (Ctrl+E)' },
  { name: 'codeblock', icon: '{ }', label: '代码块', syntax: '\n```\n代码\n```\n', title: '代码块' },
  { name: 'quote', icon: '❝', label: '引用', syntax: '> ', before: true, title: '引用' },
  { name: 'ul', icon: '•', label: '列表', syntax: '- ', before: true, title: '无序列表' },
  { name: 'ol', icon: '1.', label: '编号', syntax: '1. ', before: true, title: '有序列表' },
  { name: 'hr', icon: '—', label: '分隔', syntax: '\n---\n', title: '分隔线' },
];

// 监听外部值变化
watch(() => props.modelValue, (newVal) => {
  if (newVal !== localValue.value) {
    localValue.value = newVal;
  }
});

// 监听本地值变化，触发emit
watch(localValue, (newVal) => {
  emit('update:modelValue', newVal);
});

// 渲染Markdown
const renderedMarkdown = computed(() => {
  if (!localValue.value) return '';

  try {
    const html = marked.parse(localValue.value);
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: [
        'p', 'br', 'strong', 'em', 'u', 'strike', 'code', 'pre',
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'ul', 'ol', 'li',
        'blockquote',
        'a', 'img',
        'table', 'thead', 'tbody', 'tr', 'th', 'td',
        'hr',
        'div', 'span'
      ],
      ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class', 'target', 'rel']
    });
  } catch (error) {
    console.error('Markdown parsing error:', error);
    return '<p class="text-red-500">Markdown解析错误</p>';
  }
});

// 插入Markdown语法
const insertMarkdown = (tool) => {
  if (!textareaRef.value) return;

  const textarea = textareaRef.value;
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const selectedText = localValue.value.substring(start, end);

  let newText = '';
  let cursorOffset = 0;

  if (tool.before) {
    // 在行首插入（如标题、列表等）
    const lineStart = localValue.value.lastIndexOf('\n', start - 1) + 1;
    newText = localValue.value.substring(0, lineStart) +
              tool.syntax +
              localValue.value.substring(lineStart);
    cursorOffset = lineStart + tool.syntax.length;
  } else if (tool.name === 'link') {
    newText = localValue.value.substring(0, start) +
              `[${selectedText || '链接文字'}](url)` +
              localValue.value.substring(end);
    cursorOffset = start + (selectedText ? selectedText.length + 3 : 1);
  } else if (tool.name === 'image') {
    newText = localValue.value.substring(0, start) +
              `![${selectedText || '图片描述'}](url)` +
              localValue.value.substring(end);
    cursorOffset = start + (selectedText ? selectedText.length + 4 : 1);
  } else if (tool.name === 'codeblock' || tool.name === 'hr') {
    newText = localValue.value.substring(0, start) +
              tool.syntax +
              localValue.value.substring(end);
    cursorOffset = start + (tool.name === 'codeblock' ? 4 : 5);
  } else {
    // 包裹选中文本（如粗体、斜体等）
    newText = localValue.value.substring(0, start) +
              tool.syntax +
              (selectedText || '文字') +
              tool.syntax +
              localValue.value.substring(end);
    cursorOffset = start + tool.syntax.length + (selectedText ? selectedText.length : 2);
  }

  localValue.value = newText;

  nextTick(() => {
    textarea.focus();
    textarea.setSelectionRange(cursorOffset, cursorOffset);
  });
};

// 插入表情
const insertEmoji = (emoji) => {
  if (!textareaRef.value) return;

  const textarea = textareaRef.value;
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;

  // 在光标位置插入表情
  localValue.value = localValue.value.substring(0, start) +
                     emoji +
                     localValue.value.substring(end);

  // 设置光标位置到表情后面
  nextTick(() => {
    const newPosition = start + emoji.length;
    textarea.focus();
    textarea.setSelectionRange(newPosition, newPosition);
  });
};

// 加载小组成员
const loadGroupMembers = async () => {
  if (!props.groupId) {
    return;
  }

  try {
    const response = await $fetch(`/api/study-group-members?groupId=${props.groupId}`, {
      headers: authStore.getAuthHeader()
    });

    if (response && response.data) {
      groupMembers.value = response.data.map(member => ({
        id: member.user.id,
        displayName: member.user.nickname || member.user.name || member.user.email.split('@')[0],
        username: member.user.name || member.user.email.split('@')[0],
        email: member.user.email
      }));
    }
  } catch (error) {
    console.error('[MarkdownEditor] 加载小组成员失败:', error);
  }
};

// 过滤成员列表
const filteredMembers = computed(() => {
  if (!mentionQuery.value) {
    return groupMembers.value.slice(0, 5);
  }
  const query = mentionQuery.value.toLowerCase();
  return groupMembers.value.filter(member =>
    member.displayName.toLowerCase().includes(query) ||
    member.username.toLowerCase().includes(query) ||
    member.email.toLowerCase().includes(query)
  ).slice(0, 5);
});

// 更新下拉框位置
const updateDropdownPosition = () => {
  if (!textareaRef.value) return;

  const textarea = textareaRef.value;
  const lineHeight = parseInt(getComputedStyle(textarea).lineHeight);
  const paddingTop = parseInt(getComputedStyle(textarea).paddingTop);

  // 简单计算：基于光标位置估算行数
  const textBeforeCursor = localValue.value.substring(0, mentionStartPos.value);
  const lines = textBeforeCursor.split('\n').length;

  dropdownStyle.value = {
    top: `${paddingTop + (lines) * lineHeight}px`,
    left: '10px'
  };
};

// 选择提及
const selectMention = (member) => {
  if (!textareaRef.value) return;

  const textarea = textareaRef.value;
  const cursorPos = textarea.selectionStart;

  // 替换@xxx为@username
  const textBefore = localValue.value.substring(0, mentionStartPos.value);
  const textAfter = localValue.value.substring(cursorPos);

  const mentionText = member.displayName.includes(' ')
    ? `@"${member.displayName}" `
    : `@${member.username} `;

  localValue.value = textBefore + mentionText + textAfter;

  // 关闭下拉框
  showMentionDropdown.value = false;
  mentionQuery.value = '';

  // 将光标移到插入文本后
  nextTick(() => {
    const newCursorPos = mentionStartPos.value + mentionText.length;
    textarea.setSelectionRange(newCursorPos, newCursorPos);
    textarea.focus();
  });
};

// 处理失焦
const handleBlur = () => {
  // 延迟关闭，允许点击下拉项
  setTimeout(() => {
    showMentionDropdown.value = false;
  }, 200);
};

// 处理输入
const handleInput = (event) => {
  localValue.value = event.target.value;

  // 如果没有 groupId，不启用提及功能
  if (!props.groupId) {
    return;
  }

  const value = event.target.value;
  const cursorPos = event.target.selectionStart;

  // 检查是否输入了 @
  const textBeforeCursor = value.substring(0, cursorPos);
  const lastAtIndex = textBeforeCursor.lastIndexOf('@');

  if (lastAtIndex !== -1) {
    // 检查@之前是否是空格或开头
    const charBeforeAt = lastAtIndex > 0 ? textBeforeCursor[lastAtIndex - 1] : ' ';
    if (charBeforeAt === ' ' || charBeforeAt === '\n' || lastAtIndex === 0) {
      // 提取@后面的查询字符串
      const queryAfterAt = textBeforeCursor.substring(lastAtIndex + 1);

      // 检查@后面是否有空格或换行（如果有，不显示下拉）
      if (!queryAfterAt.includes(' ') && !queryAfterAt.includes('\n')) {
        showMentionDropdown.value = true;
        mentionQuery.value = queryAfterAt;
        mentionStartPos.value = lastAtIndex;
        selectedMentionIndex.value = 0;

        // 计算下拉框位置
        updateDropdownPosition();
        return;
      }
    }
  }

  // 关闭下拉框
  showMentionDropdown.value = false;
  mentionQuery.value = '';
};

// 处理快捷键
const handleKeydown = (event) => {
  // 处理提及下拉框的键盘事件
  if (showMentionDropdown.value) {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      selectedMentionIndex.value = Math.min(selectedMentionIndex.value + 1, filteredMembers.value.length - 1);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      selectedMentionIndex.value = Math.max(selectedMentionIndex.value - 1, 0);
    } else if (event.key === 'Enter' && filteredMembers.value.length > 0) {
      event.preventDefault();
      selectMention(filteredMembers.value[selectedMentionIndex.value]);
      return;
    } else if (event.key === 'Escape') {
      event.preventDefault();
      showMentionDropdown.value = false;
      return;
    }
  }

  if (event.ctrlKey || event.metaKey) {
    switch (event.key.toLowerCase()) {
      case 'b':
        event.preventDefault();
        insertMarkdown(tools.find(t => t.name === 'bold'));
        break;
      case 'i':
        event.preventDefault();
        insertMarkdown(tools.find(t => t.name === 'italic'));
        break;
      case 'k':
        event.preventDefault();
        insertMarkdown(tools.find(t => t.name === 'link'));
        break;
      case 'e':
        event.preventDefault();
        insertMarkdown(tools.find(t => t.name === 'code'));
        break;
    }
  }

  // Tab键插入空格
  if (event.key === 'Tab') {
    event.preventDefault();
    const textarea = event.target;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    localValue.value = localValue.value.substring(0, start) +
                      '  ' +
                      localValue.value.substring(end);

    nextTick(() => {
      textarea.setSelectionRange(start + 2, start + 2);
    });
  }
};

// 暴露focus方法供父组件调用
const focus = () => {
  if (textareaRef.value) {
    textareaRef.value.focus();
    // 将光标移到文本末尾
    const length = localValue.value.length;
    textareaRef.value.setSelectionRange(length, length);
  }
};

// 暴露scrollIntoView方法供父组件调用
const scrollIntoView = (options = { behavior: 'smooth', block: 'center' }) => {
  if (textareaRef.value) {
    textareaRef.value.scrollIntoView(options);
  }
};

defineExpose({
  focus,
  scrollIntoView
});

// 监听 groupId 变化，重新加载成员
watch(() => props.groupId, (newGroupId, oldGroupId) => {
  if (newGroupId && newGroupId !== oldGroupId) {
    loadGroupMembers();
  }
});

// 组件挂载时加载成员
onMounted(async () => {
  if (props.groupId) {
    await loadGroupMembers();
  }
});
</script>

<style scoped>
.markdown-editor {
  width: 100%;
}

.toolbar-btn {
  user-select: none;
}

/* @ 提及下拉框样式 */
.mention-dropdown {
  position: absolute;
  z-index: 1000;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  max-width: 300px;
  max-height: 200px;
  overflow-y: auto;
}

.mention-item {
  padding: 0.75rem;
  cursor: pointer;
  transition: background-color 0.15s;
}

.mention-item:hover,
.mention-item-active {
  background-color: #f3f4f6;
}

.mention-item:not(:last-child) {
  border-bottom: 1px solid #f3f4f6;
}

/* Markdown预览样式 */
.markdown-preview {
  line-height: 1.8;
}

.markdown-preview :deep(h1) {
  font-size: 1.875rem;
  font-weight: 700;
  margin-top: 1.5rem;
  margin-bottom: 1rem;
  border-bottom: 2px solid #e5e7eb;
  padding-bottom: 0.5rem;
}

.markdown-preview :deep(h2) {
  font-size: 1.5rem;
  font-weight: 700;
  margin-top: 1.25rem;
  margin-bottom: 0.75rem;
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 0.25rem;
}

.markdown-preview :deep(h3) {
  font-size: 1.25rem;
  font-weight: 600;
  margin-top: 1rem;
  margin-bottom: 0.5rem;
}

.markdown-preview :deep(p) {
  margin-bottom: 1rem;
}

.markdown-preview :deep(strong) {
  font-weight: 700;
  color: #1f2937;
}

.markdown-preview :deep(em) {
  font-style: italic;
}

.markdown-preview :deep(code) {
  background-color: #f3f4f6;
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
  font-family: ui-monospace, monospace;
  font-size: 0.875em;
  color: #dc2626;
}

.markdown-preview :deep(pre) {
  background-color: #1f2937;
  color: #f9fafb;
  padding: 1rem;
  border-radius: 0.5rem;
  overflow-x: auto;
  margin: 1rem 0;
}

.markdown-preview :deep(pre code) {
  background: none;
  padding: 0;
  color: inherit;
  font-size: 0.875rem;
  line-height: 1.7;
}

.markdown-preview :deep(blockquote) {
  border-left: 4px solid #3b82f6;
  padding-left: 1rem;
  margin: 1rem 0;
  color: #6b7280;
  font-style: italic;
}

.markdown-preview :deep(ul),
.markdown-preview :deep(ol) {
  margin-left: 1.5rem;
  margin-bottom: 1rem;
}

.markdown-preview :deep(li) {
  margin-bottom: 0.25rem;
}

.markdown-preview :deep(a) {
  color: #3b82f6;
  text-decoration: underline;
}

.markdown-preview :deep(a:hover) {
  color: #2563eb;
}

.markdown-preview :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: 0.5rem;
  margin: 1rem 0;
}

.markdown-preview :deep(hr) {
  border: none;
  border-top: 2px solid #e5e7eb;
  margin: 1.5rem 0;
}

.markdown-preview :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 1rem 0;
}

.markdown-preview :deep(th),
.markdown-preview :deep(td) {
  border: 1px solid #e5e7eb;
  padding: 0.5rem;
  text-align: left;
}

.markdown-preview :deep(th) {
  background-color: #f9fafb;
  font-weight: 600;
}
</style>

<style>
/* Highlight.js 代码高亮样式 */
@import 'highlight.js/styles/github-dark.css';
</style>
