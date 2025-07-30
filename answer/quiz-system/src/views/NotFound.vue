<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
    <div class="max-w-md w-full text-center">
      <!-- 404 图标 -->
      <div class="mb-8">
        <div class="text-8xl font-bold text-indigo-600 mb-4">404</div>
        <div class="w-24 h-1 bg-indigo-600 mx-auto rounded-full"></div>
      </div>
      
      <!-- 错误信息 -->
      <div class="mb-8">
        <h1 class="text-2xl font-bold text-gray-800 mb-4">页面未找到</h1>
        <p class="text-gray-600 leading-relaxed">
          抱歉，您访问的页面不存在或已被移动。
          <br>
          请检查URL是否正确，或返回首页继续使用。
        </p>
      </div>
      
      <!-- 操作按钮 -->
      <div class="space-y-4">
        <button 
          @click="goHome"
          class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
          </svg>
          <span>返回首页</span>
        </button>
        
        <button 
          @click="goBack"
          class="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
          </svg>
          <span>返回上页</span>
        </button>
      </div>
      
      <!-- 建议链接 -->
      <div class="mt-8 pt-6 border-t border-gray-200">
        <p class="text-sm text-gray-500 mb-4">您可能想要访问：</p>
        <div class="flex flex-wrap justify-center gap-2">
          <router-link 
            to="/"
            class="text-indigo-600 hover:text-indigo-800 text-sm font-medium px-3 py-1 rounded-full bg-indigo-50 hover:bg-indigo-100 transition-colors duration-200"
          >
            首页
          </router-link>
          <router-link 
            to="/import"
            class="text-indigo-600 hover:text-indigo-800 text-sm font-medium px-3 py-1 rounded-full bg-indigo-50 hover:bg-indigo-100 transition-colors duration-200"
          >
            导入题库
          </router-link>
          <router-link 
            to="/history"
            class="text-indigo-600 hover:text-indigo-800 text-sm font-medium px-3 py-1 rounded-full bg-indigo-50 hover:bg-indigo-100 transition-colors duration-200"
          >
            答题历史
          </router-link>
          <router-link 
            to="/settings"
            class="text-indigo-600 hover:text-indigo-800 text-sm font-medium px-3 py-1 rounded-full bg-indigo-50 hover:bg-indigo-100 transition-colors duration-200"
          >
            系统设置
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

// 返回首页
const goHome = () => {
  router.push('/')
}

// 返回上一页
const goBack = () => {
  // 如果有历史记录则返回，否则跳转到首页
  if (window.history.length > 1) {
    router.go(-1)
  } else {
    router.push('/')
  }
}
</script>

<style scoped>
/* 添加一些动画效果 */
.fade-in {
  animation: fadeIn 0.5s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>