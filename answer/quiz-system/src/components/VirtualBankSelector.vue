<template>
  <div class="relative">
    <div 
      @click="toggleDropdown"
      class="input-field cursor-pointer flex items-center justify-between"
    >
      <span class="text-gray-900">
        {{ selectedBankName || '请选择题库' }}
      </span>
      <svg 
        class="w-5 h-5 text-gray-400 transition-transform duration-200"
        :class="{ 'rotate-180': showDropdown }"
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
      </svg>
    </div>
    
    <!-- 虚拟滚动下拉选项 -->
    <div 
      v-if="showDropdown" 
      class="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg"
      @click.stop
    >
      <!-- 搜索框 -->
      <div v-if="searchable" class="p-2 border-b border-gray-200">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="搜索题库..."
          class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          @click.stop
        >
      </div>
      
      <!-- 默认选项 -->
      <div 
        @click="selectBank('')"
        class="px-4 py-2 hover:bg-gray-100 cursor-pointer text-gray-500 border-b border-gray-100"
      >
        请选择题库
      </div>
      
      <!-- 虚拟滚动列表 -->
      <VirtualList
        :items="filteredBanks"
        :item-height="60"
        :container-height="Math.min(300, filteredBanks.length * 60)"
        :overscan="3"
        class="max-h-60"
      >
        <template #default="{ item: bank, index }">
          <div 
            class="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center justify-between group transition-colors duration-150"
            :class="{
              'bg-blue-50 border-l-4 border-blue-500': selectedBankId === bank.id
            }"
          >
            <div 
              @click="selectBank(bank.id)"
              class="flex-1 min-w-0"
            >
              <div class="flex items-center space-x-2">
                <span class="font-medium text-gray-900 truncate">
                  {{ bank.name }}
                </span>
                <span class="text-sm text-gray-500 flex-shrink-0">
                  ({{ bank.questions.length }} 题)
                </span>
              </div>
              <div v-if="bank.description" class="text-xs text-gray-600 truncate mt-1">
                {{ bank.description }}
              </div>
            </div>
            
            <!-- 操作按钮 -->
            <div class="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <button 
                @click.stop="$emit('export-bank', bank)"
                class="text-blue-500 hover:text-blue-700 p-1 rounded hover:bg-blue-100"
                title="导出为Word"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
              </button>
              <button 
                @click.stop="$emit('delete-bank', bank)"
                class="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-100"
                title="删除题库"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                </svg>
              </button>
            </div>
          </div>
        </template>
        
        <template #empty>
          <div class="flex flex-col items-center justify-center py-8 text-gray-500">
            <svg class="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
            <p class="text-sm">{{ searchQuery ? '未找到匹配的题库' : '暂无题库' }}</p>
          </div>
        </template>
      </VirtualList>
      
      <!-- 统计信息 -->
      <div v-if="filteredBanks.length > 0" class="px-4 py-2 bg-gray-50 border-t border-gray-200 text-xs text-gray-600">
        显示 {{ filteredBanks.length }} 个题库
        <span v-if="searchQuery">（已筛选）</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import VirtualList from './VirtualList.vue'

// Props
const props = defineProps({
  questionBanks: {
    type: Array,
    required: true,
    default: () => []
  },
  selectedBankId: {
    type: [String, Number],
    default: null
  },
  selectedBankName: {
    type: String,
    default: ''
  },
  searchable: {
    type: Boolean,
    default: true
  }
})

// Emits
const emit = defineEmits([
  'select-bank',
  'export-bank',
  'delete-bank',
  'toggle-dropdown'
])

// 响应式数据
const showDropdown = ref(false)
const searchQuery = ref('')

// 计算属性
const filteredBanks = computed(() => {
  if (!searchQuery.value.trim()) {
    return props.questionBanks
  }
  
  const query = searchQuery.value.toLowerCase().trim()
  return props.questionBanks.filter(bank => 
    bank.name.toLowerCase().includes(query) ||
    (bank.description && bank.description.toLowerCase().includes(query))
  )
})

// 方法
const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value
  emit('toggle-dropdown', showDropdown.value)
  
  if (showDropdown.value) {
    // 打开时清空搜索
    searchQuery.value = ''
    // 聚焦搜索框
    nextTick(() => {
      const searchInput = document.querySelector('input[placeholder="搜索题库..."]')
      if (searchInput && props.searchable) {
        searchInput.focus()
      }
    })
  }
}

const selectBank = (bankId) => {
  emit('select-bank', bankId)
  showDropdown.value = false
}

// 点击外部关闭下拉框
const handleClickOutside = (event) => {
  const dropdown = event.target.closest('.relative')
  if (!dropdown) {
    showDropdown.value = false
  }
}

// 监听点击外部事件
watch(showDropdown, (newValue) => {
  if (newValue) {
    document.addEventListener('click', handleClickOutside)
  } else {
    document.removeEventListener('click', handleClickOutside)
  }
})

// 组件卸载时清理事件监听
import { onUnmounted } from 'vue'
onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
/* 下拉动画 */
.relative > div:last-child {
  animation: slideDown 0.2s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 选中状态样式 */
.bg-blue-50 {
  background-color: #eff6ff;
}

/* 响应式优化 */
@media (max-width: 640px) {
  .relative > div:last-child {
    left: -1rem;
    right: -1rem;
    width: calc(100vw - 2rem);
  }
}
</style>