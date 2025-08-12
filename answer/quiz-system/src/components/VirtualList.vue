<template>
  <div 
    ref="containerRef"
    class="virtual-list-container"
    :style="{ height: containerHeight + 'px' }"
    @scroll="handleScroll"
  >
    <!-- 总高度占位符 -->
    <div 
      class="virtual-list-spacer"
      :style="{ height: totalHeight + 'px' }"
    >
      <!-- 可见项目容器 -->
      <div 
        class="virtual-list-items"
        :style="{ transform: `translateY(${offsetY}px)` }"
      >
        <div
          v-for="{ item, index, key } in visibleItems"
          :key="key"
          class="virtual-list-item"
          :data-index="index"
          :style="itemStyle(item, index)"
        >
          <slot 
            :item="item" 
            :index="index"
            :isScrolling="isScrolling"
          >
            <!-- 默认渲染 -->
            <div class="p-4 border-b border-gray-200">
              {{ item }}
            </div>
          </slot>
        </div>
      </div>
    </div>
    
    <!-- 滚动指示器 -->
    <div 
      v-if="showScrollIndicator && items.length > 0"
      class="virtual-list-indicator"
    >
      <div class="text-xs text-gray-500">
        {{ visibleRange.start + 1 }}-{{ Math.min(visibleRange.end, items.length) }} / {{ items.length }}
      </div>
    </div>
    
    <!-- 加载状态 -->
    <div 
      v-if="loading"
      class="virtual-list-loading"
    >
      <div class="flex items-center justify-center py-4">
        <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        <span class="ml-2 text-gray-600">加载中...</span>
      </div>
    </div>
    
    <!-- 空状态 -->
    <div 
      v-if="!loading && items.length === 0"
      class="virtual-list-empty"
    >
      <slot name="empty">
        <div class="flex flex-col items-center justify-center py-12 text-gray-500">
          <svg class="w-12 h-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m13-8l-4 4m0 0l-4-4m4 4V3"></path>
          </svg>
          <p class="text-lg font-medium mb-2">暂无数据</p>
          <p class="text-sm">列表为空</p>
        </div>
      </slot>
    </div>
  </div>
</template>

<script setup>
import { computed, toRefs } from 'vue'
import { useVirtualList } from '@/composables/useVirtualList'

// Props定义
const props = defineProps({
  // 数据源
  items: {
    type: Array,
    required: true,
    default: () => []
  },
  // 项目高度（固定高度模式）
  itemHeight: {
    type: Number,
    default: 80
  },
  // 容器高度
  containerHeight: {
    type: Number,
    default: 400
  },
  // 预渲染项目数量
  overscan: {
    type: Number,
    default: 5
  },
  // 动态高度计算函数
  getItemHeight: {
    type: Function,
    default: null
  },
  // 是否显示滚动指示器
  showScrollIndicator: {
    type: Boolean,
    default: false
  },
  // 加载状态
  loading: {
    type: Boolean,
    default: false
  },
  // 自定义项目样式
  itemClass: {
    type: [String, Function],
    default: ''
  }
})

// Emits定义
const emit = defineEmits([
  'scroll',
  'item-click',
  'reach-bottom',
  'reach-top'
])

// 使用虚拟滚动
const {
  containerRef,
  scrollTop,
  isScrolling,
  totalHeight,
  visibleRange,
  visibleItems,
  offsetY,
  handleScroll: originalHandleScroll,
  scrollToItem,
  scrollToTop,
  scrollToBottom
} = useVirtualList(toRefs(props).items, {
  itemHeight: props.itemHeight,
  containerHeight: props.containerHeight,
  overscan: props.overscan,
  getItemHeight: props.getItemHeight
})

// 增强的滚动处理
const handleScroll = (event) => {
  originalHandleScroll(event)
  
  // 触发自定义滚动事件
  emit('scroll', {
    scrollTop: scrollTop.value,
    isScrolling: isScrolling.value,
    visibleRange: visibleRange.value
  })
  
  // 检测是否到达底部
  const { scrollTop: currentScrollTop, scrollHeight, clientHeight } = event.target
  if (currentScrollTop + clientHeight >= scrollHeight - 10) {
    emit('reach-bottom')
  }
  
  // 检测是否到达顶部
  if (currentScrollTop <= 10) {
    emit('reach-top')
  }
}

// 项目样式计算
const itemStyle = (item, index) => {
  const baseStyle = {
    height: props.getItemHeight ? `${props.getItemHeight(item, index)}px` : `${props.itemHeight}px`
  }
  
  return baseStyle
}

// 项目点击处理
const handleItemClick = (item, index, event) => {
  emit('item-click', { item, index, event })
}

// 暴露方法给父组件
defineExpose({
  scrollToItem,
  scrollToTop,
  scrollToBottom,
  containerRef
})
</script>

<style scoped>
.virtual-list-container {
  @apply relative overflow-auto;
  scrollbar-width: thin;
  scrollbar-color: #cbd5e0 #f7fafc;
}

.virtual-list-container::-webkit-scrollbar {
  width: 6px;
}

.virtual-list-container::-webkit-scrollbar-track {
  @apply bg-gray-100 rounded;
}

.virtual-list-container::-webkit-scrollbar-thumb {
  @apply bg-gray-400 rounded;
}

.virtual-list-container::-webkit-scrollbar-thumb:hover {
  @apply bg-gray-500;
}

.virtual-list-spacer {
  @apply relative;
}

.virtual-list-items {
  @apply absolute top-0 left-0 right-0;
}

.virtual-list-item {
  @apply relative;
}

.virtual-list-indicator {
  @apply absolute top-2 right-2 bg-white bg-opacity-90 px-2 py-1 rounded shadow-sm;
}

.virtual-list-loading {
  @apply absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center;
}

.virtual-list-empty {
  @apply absolute inset-0 flex items-center justify-center;
}

/* 滚动时的优化 */
.virtual-list-item {
  contain: layout style paint;
}

/* 平滑滚动 */
.virtual-list-container {
  scroll-behavior: smooth;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .virtual-list-indicator {
    @apply text-xs;
  }
}
</style>