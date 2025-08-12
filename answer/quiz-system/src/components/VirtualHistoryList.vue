<template>
  <div class="space-y-4">
    <!-- 筛选和排序控制栏 -->
    <div class="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-gray-50 p-4 rounded-lg">
      <!-- 搜索框 -->
      <div class="flex-1 min-w-0">
        <div class="relative">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="搜索题库名称、模式..."
            class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
          <svg class="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
        </div>
      </div>
      
      <!-- 筛选器 -->
      <div class="flex flex-wrap gap-2">
        <!-- 模式筛选 -->
        <select 
          v-model="filterMode"
          class="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        >
          <option value="">全部模式</option>
          <option value="practice">练习模式</option>
          <option value="exam">考试模式</option>
        </select>
        
        <!-- 分数筛选 -->
        <select 
          v-model="filterScore"
          class="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        >
          <option value="">全部分数</option>
          <option value="excellent">优秀 (≥90)</option>
          <option value="good">良好 (80-89)</option>
          <option value="average">一般 (60-79)</option>
          <option value="poor">较差 (<60)</option>
        </select>
        
        <!-- 排序 -->
        <select 
          v-model="sortBy"
          class="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        >
          <option value="date-desc">时间 ↓</option>
          <option value="date-asc">时间 ↑</option>
          <option value="score-desc">分数 ↓</option>
          <option value="score-asc">分数 ↑</option>
          <option value="duration-desc">用时 ↓</option>
          <option value="duration-asc">用时 ↑</option>
        </select>
      </div>
      
      <!-- 清空历史按钮 -->
      <button 
        v-if="historyRecords.length > 0"
        @click="$emit('clear-history')"
        class="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors duration-200 text-sm whitespace-nowrap"
      >
        清空历史
      </button>
    </div>
    
    <!-- 统计信息 -->
    <div v-if="filteredRecords.length > 0" class="text-sm text-gray-600">
      显示 {{ filteredRecords.length }} 条记录
      <span v-if="searchQuery || filterMode || filterScore">（已筛选）</span>
      / 共 {{ historyRecords.length }} 条
    </div>
    
    <!-- 虚拟滚动历史记录列表 -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200">
      <VirtualList
        :items="filteredRecords"
        :item-height="120"
        :container-height="Math.min(600, filteredRecords.length * 120)"
        :overscan="5"
        :dynamic-height="true"
        class="min-h-[200px]"
      >
        <template #default="{ item: record, index }">
          <div 
            class="p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors duration-150 cursor-pointer"
            :class="{ 'border-b-0': index === filteredRecords.length - 1 }"
            @click="$emit('view-record', record)"
          >
            <div class="flex items-start justify-between">
              <!-- 主要信息 -->
              <div class="flex-1 min-w-0">
                <div class="flex items-center space-x-3 mb-2">
                  <!-- 题库名称 -->
                  <h3 class="font-semibold text-gray-900 truncate">
                    {{ record.bankName }}
                  </h3>
                  
                  <!-- 模式标签 -->
                  <span 
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                    :class="{
                      'bg-blue-100 text-blue-800': record.mode === 'practice',
                      'bg-purple-100 text-purple-800': record.mode === 'exam'
                    }"
                  >
                    {{ record.mode === 'practice' ? '练习' : '考试' }}
                  </span>
                  
                  <!-- 分数标签 -->
                  <span 
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                    :class="getScoreClass(record.score)"
                  >
                    {{ record.score }}分
                  </span>
                </div>
                
                <!-- 详细信息 -->
                <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm text-gray-600">
                  <div class="flex items-center space-x-1">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                    <span>{{ record.answeredQuestions }}/{{ record.totalQuestions }} 题</span>
                  </div>
                  
                  <div class="flex items-center space-x-1">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <span>{{ formatDuration(record.duration) }}</span>
                  </div>
                  
                  <div class="flex items-center space-x-1">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <span>正确率 {{ Math.round((record.correctAnswers / record.totalQuestions) * 100) }}%</span>
                  </div>
                  
                  <div class="flex items-center space-x-1">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4h3a1 1 0 011 1v1a1 1 0 01-1 1H5a1 1 0 01-1-1V8a1 1 0 011-1h3z"></path>
                    </svg>
                    <span>{{ formatDate(record.date) }}</span>
                  </div>
                </div>
                
                <!-- 错题统计 -->
                <div v-if="record.wrongQuestions && record.wrongQuestions.length > 0" class="mt-2">
                  <div class="flex items-center space-x-2 text-xs text-red-600">
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                    </svg>
                    <span>错题 {{ record.wrongQuestions.length }} 道</span>
                    <button 
                      @click.stop="$emit('review-wrong-questions', record)"
                      class="text-red-600 hover:text-red-800 underline"
                    >
                      查看错题
                    </button>
                  </div>
                </div>
              </div>
              
              <!-- 操作按钮 -->
              <div class="flex flex-col space-y-2 ml-4">
                <button 
                  @click.stop="$emit('restart-quiz', record)"
                  class="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors duration-200"
                >
                  重新测试
                </button>
                <button 
                  @click.stop="$emit('delete-record', record)"
                  class="px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition-colors duration-200"
                >
                  删除记录
                </button>
              </div>
            </div>
          </div>
        </template>
        
        <template #empty>
          <div class="flex flex-col items-center justify-center py-12 text-gray-500">
            <!-- 根据是否有筛选条件显示不同图标 -->
            <svg v-if="searchQuery || filterMode || filterScore" class="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
            <svg v-else class="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
            </svg>
            
            <h3 class="text-lg font-medium text-gray-900 mb-2">
              {{ searchQuery || filterMode || filterScore ? '没有找到匹配的记录' : '暂无答题记录' }}
            </h3>
            
            <p class="text-gray-600 mb-4 text-center max-w-sm">
              {{ searchQuery || filterMode || filterScore ? '请尝试调整筛选条件' : '开始您的第一次答题吧！' }}
            </p>
            
            <!-- 根据情况显示不同按钮 -->
            <button v-if="searchQuery || filterMode || filterScore" @click="clearAllFilters" class="btn-primary">
              清除筛选
            </button>
            <router-link v-else to="/quiz" class="btn-primary">
              开始答题
            </router-link>
          </div>
        </template>
        
        <template #loading>
          <div class="flex items-center justify-center py-8">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span class="ml-2 text-gray-600">加载中...</span>
          </div>
        </template>
      </VirtualList>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { RouterLink } from 'vue-router'
import VirtualList from './VirtualList.vue'

// Props
const props = defineProps({
  historyRecords: {
    type: Array,
    required: true,
    default: () => []
  }
})

// Emits
const emit = defineEmits([
  'clear-history',
  'view-record',
  'restart-quiz',
  'delete-record',
  'review-wrong-questions',
  'clear-filters'
])

// 响应式数据
const searchQuery = ref('')
const filterMode = ref('')
const filterScore = ref('')
const sortBy = ref('date-desc')

// 计算属性 - 筛选和排序后的记录
const filteredRecords = computed(() => {
  let records = [...props.historyRecords]
  
  // 搜索筛选
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase().trim()
    records = records.filter(record => 
      record.bankName.toLowerCase().includes(query) ||
      record.mode.toLowerCase().includes(query)
    )
  }
  
  // 模式筛选
  if (filterMode.value) {
    records = records.filter(record => record.mode === filterMode.value)
  }
  
  // 分数筛选
  if (filterScore.value) {
    records = records.filter(record => {
      const score = record.score
      switch (filterScore.value) {
        case 'excellent': return score >= 90
        case 'good': return score >= 80 && score < 90
        case 'average': return score >= 60 && score < 80
        case 'poor': return score < 60
        default: return true
      }
    })
  }
  
  // 排序
  records.sort((a, b) => {
    switch (sortBy.value) {
      case 'date-desc':
        return new Date(b.date) - new Date(a.date)
      case 'date-asc':
        return new Date(a.date) - new Date(b.date)
      case 'score-desc':
        return b.score - a.score
      case 'score-asc':
        return a.score - b.score
      case 'duration-desc':
        return b.duration - a.duration
      case 'duration-asc':
        return a.duration - b.duration
      default:
        return 0
    }
  })
  
  return records
})

// 工具方法
const getScoreClass = (score) => {
  if (score >= 90) return 'bg-green-100 text-green-800'
  if (score >= 80) return 'bg-blue-100 text-blue-800'
  if (score >= 60) return 'bg-yellow-100 text-yellow-800'
  return 'bg-red-100 text-red-800'
}

const formatDuration = (seconds) => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = Math.abs(now - date)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays === 1) {
    return '今天'
  } else if (diffDays === 2) {
    return '昨天'
  } else if (diffDays <= 7) {
    return `${diffDays - 1}天前`
  } else {
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }
}

// 清除所有筛选条件
const clearAllFilters = () => {
  searchQuery.value = ''
  filterMode.value = ''
  filterScore.value = ''
  sortBy.value = 'date'
  emit('clear-filters')
}

// 监听筛选条件变化，重置到顶部
watch([searchQuery, filterMode, filterScore, sortBy], () => {
  // 可以在这里添加滚动到顶部的逻辑
})
</script>

<style scoped>
/* 动画效果 */
.transition-colors {
  transition-property: color, background-color, border-color;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

/* 响应式优化 */
@media (max-width: 640px) {
  .grid-cols-2 {
    grid-template-columns: repeat(1, minmax(0, 1fr));
  }
  
  .sm\:grid-cols-4 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

/* 滚动条样式 */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>