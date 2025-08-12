import { ref, computed, nextTick, onMounted, onUnmounted } from 'vue'

/**
 * 虚拟滚动 Composable
 * 用于优化大数据量列表的渲染性能
 * @param {Ref} items - 数据源
 * @param {Object} options - 配置选项
 * @returns {Object} 虚拟滚动相关的响应式数据和方法
 */
export function useVirtualList(items, options = {}) {
  const {
    itemHeight = 80, // 每项的高度
    containerHeight = 400, // 容器高度
    overscan = 5, // 预渲染的额外项目数量
    getItemHeight = null // 动态高度函数
  } = options

  // 响应式数据
  const containerRef = ref(null)
  const scrollTop = ref(0)
  const isScrolling = ref(false)
  const scrollingTimer = ref(null)

  // 计算属性
  const totalHeight = computed(() => {
    if (getItemHeight) {
      // 动态高度计算
      return items.value.reduce((total, item, index) => {
        return total + getItemHeight(item, index)
      }, 0)
    }
    return items.value.length * itemHeight
  })

  const visibleRange = computed(() => {
    if (!items.value.length) return { start: 0, end: 0 }

    let start, end

    if (getItemHeight) {
      // 动态高度的可见范围计算
      start = 0
      let accumulatedHeight = 0
      
      for (let i = 0; i < items.value.length; i++) {
        const height = getItemHeight(items.value[i], i)
        if (accumulatedHeight + height > scrollTop.value) {
          start = Math.max(0, i - overscan)
          break
        }
        accumulatedHeight += height
      }

      end = start
      accumulatedHeight = 0
      for (let i = start; i < items.value.length; i++) {
        const height = getItemHeight(items.value[i], i)
        accumulatedHeight += height
        if (accumulatedHeight > containerHeight) {
          end = Math.min(items.value.length, i + overscan + 1)
          break
        }
      }
      end = end || items.value.length
    } else {
      // 固定高度的可见范围计算
      start = Math.floor(scrollTop.value / itemHeight)
      end = Math.min(
        items.value.length,
        Math.ceil((scrollTop.value + containerHeight) / itemHeight)
      )
      
      // 添加预渲染项目
      start = Math.max(0, start - overscan)
      end = Math.min(items.value.length, end + overscan)
    }

    return { start, end }
  })

  const visibleItems = computed(() => {
    const { start, end } = visibleRange.value
    return items.value.slice(start, end).map((item, index) => ({
      item,
      index: start + index,
      key: `${start + index}-${item.id || index}`
    }))
  })

  const offsetY = computed(() => {
    const { start } = visibleRange.value
    if (getItemHeight) {
      // 动态高度的偏移计算
      let offset = 0
      for (let i = 0; i < start; i++) {
        offset += getItemHeight(items.value[i], i)
      }
      return offset
    }
    return start * itemHeight
  })

  // 滚动处理
  const handleScroll = (event) => {
    const newScrollTop = event.target.scrollTop
    scrollTop.value = newScrollTop
    
    // 滚动状态管理
    isScrolling.value = true
    if (scrollingTimer.value) {
      clearTimeout(scrollingTimer.value)
    }
    scrollingTimer.value = setTimeout(() => {
      isScrolling.value = false
    }, 150)
  }

  // 滚动到指定项目
  const scrollToItem = (index) => {
    if (!containerRef.value) return
    
    let targetScrollTop
    if (getItemHeight) {
      targetScrollTop = 0
      for (let i = 0; i < index; i++) {
        targetScrollTop += getItemHeight(items.value[i], i)
      }
    } else {
      targetScrollTop = index * itemHeight
    }
    
    containerRef.value.scrollTop = targetScrollTop
  }

  // 滚动到顶部
  const scrollToTop = () => {
    if (containerRef.value) {
      containerRef.value.scrollTop = 0
    }
  }

  // 滚动到底部
  const scrollToBottom = () => {
    if (containerRef.value) {
      containerRef.value.scrollTop = totalHeight.value
    }
  }

  // 获取项目位置信息
  const getItemOffset = (index) => {
    if (getItemHeight) {
      let offset = 0
      for (let i = 0; i < index; i++) {
        offset += getItemHeight(items.value[i], i)
      }
      return offset
    }
    return index * itemHeight
  }

  // 清理定时器
  onUnmounted(() => {
    if (scrollingTimer.value) {
      clearTimeout(scrollingTimer.value)
    }
  })

  return {
    // 响应式数据
    containerRef,
    scrollTop,
    isScrolling,
    
    // 计算属性
    totalHeight,
    visibleRange,
    visibleItems,
    offsetY,
    
    // 方法
    handleScroll,
    scrollToItem,
    scrollToTop,
    scrollToBottom,
    getItemOffset
  }
}

/**
 * 虚拟滚动列表组件的辅助函数
 * 用于处理动态高度的情况
 */
export function createDynamicHeightCalculator() {
  const heightCache = new Map()
  
  const getItemHeight = (item, index, defaultHeight = 80) => {
    const key = item.id || index
    if (heightCache.has(key)) {
      return heightCache.get(key)
    }
    return defaultHeight
  }
  
  const setItemHeight = (item, index, height) => {
    const key = item.id || index
    heightCache.set(key, height)
  }
  
  const clearCache = () => {
    heightCache.clear()
  }
  
  return {
    getItemHeight,
    setItemHeight,
    clearCache
  }
}