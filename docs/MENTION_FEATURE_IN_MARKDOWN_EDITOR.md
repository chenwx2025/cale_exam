# @ 提及功能集成到 MarkdownEditor

## 问题

用户反馈："@" 在回复中不工作 - 快速回复表单使用的是 `MarkdownEditor` 组件，该组件没有 @ 提及成员的功能。

## 解决方案

将 @ 提及功能从 `MentionTextarea` 组件集成到 `MarkdownEditor` 组件中，使其支持在 Markdown 编辑的同时进行 @ 提及。

## 修改内容

### 1. 修改 `components/MarkdownEditor.vue`

#### 新增 Props
```vue
groupId: {
  type: String,
  default: null
}
```

#### 新增状态变量
```javascript
// @ 提及功能相关状态
const showMentionDropdown = ref(false);
const mentionQuery = ref('');
const mentionStartPos = ref(0);
const selectedMentionIndex = ref(0);
const groupMembers = ref([]);
const dropdownStyle = ref({});
```

#### 新增功能函数

1. **加载小组成员** - `loadGroupMembers()`
   - 从 `/api/study-groups/{groupId}/members` 获取成员列表
   - 格式化成员数据（displayName, username, email）

2. **过滤成员列表** - `filteredMembers` (computed)
   - 根据 `mentionQuery` 过滤成员
   - 支持按 displayName、username、email 搜索
   - 限制显示最多 5 个成员

3. **更新下拉框位置** - `updateDropdownPosition()`
   - 根据光标位置计算下拉框显示位置
   - 基于行高和padding计算垂直位置

4. **选择提及** - `selectMention(member)`
   - 将 @query 替换为 @username 或 @"displayName"
   - 如果用户名包含空格，使用引号包裹
   - 将光标移到插入文本后

5. **处理失焦** - `handleBlur()`
   - 延迟 200ms 关闭下拉框，允许点击下拉项

#### 修改 `handleInput` 函数
增加 @ 符号检测逻辑：
```javascript
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
      updateDropdownPosition();
      return;
    }
  }
}
```

#### 修改 `handleKeydown` 函数
增加提及下拉框的键盘导航：
```javascript
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
```

#### 新增 UI 元素
在编辑器文本框下方添加提及下拉框：
```vue
<!-- @mention autocomplete dropdown -->
<div
  v-if="showMentionDropdown && filteredMembers.length > 0"
  class="mention-dropdown"
  :style="dropdownStyle"
>
  <div
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
</div>
```

#### 新增样式
```css
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
```

#### 组件挂载时加载成员
```javascript
onMounted(() => {
  if (props.groupId) {
    loadGroupMembers();
  }
});
```

### 2. 修改 `pages/study-groups/[id]/posts/[postId].vue`

更新快速回复表单中的 `MarkdownEditor` 组件：
```vue
<MarkdownEditor
  ref="replyEditorRef"
  v-model="replyContent"
  :rows="8"
  :group-id="groupId"
  placeholder="写下你的回复... 支持Markdown格式编辑，输入 @ 可以提及小组成员"
/>
```

更新提示文字：
```vue
<span class="mr-4">💡 支持Markdown格式 | @ 提及成员 | Ctrl+B 粗体 | Ctrl+I 斜体</span>
```

## 功能特性

1. **智能触发**：只在输入 @ 且前面是空格、换行或行首时触发
2. **实时搜索**：根据输入内容过滤成员列表
3. **键盘导航**：
   - 上下箭头键：选择成员
   - Enter 键：确认选择
   - Esc 键：关闭下拉框
4. **鼠标操作**：点击成员即可选择
5. **自动完成**：选择后自动插入 @username 并添加空格
6. **带空格用户名处理**：自动用引号包裹包含空格的用户名
7. **可选功能**：只有传入 `groupId` prop 时才启用提及功能

## 用户体验改进

- 在 Markdown 编辑器中保持所有原有功能（工具栏、预览、快捷键等）
- 无缝集成 @ 提及功能，不影响正常的 Markdown 编辑
- 提示文字明确告知用户可以使用 @ 提及成员
- 下拉框样式与整体设计保持一致

## 状态

✅ **完成** - @ 提及功能已成功集成到 MarkdownEditor 组件中

## 日期

2025-10-25
