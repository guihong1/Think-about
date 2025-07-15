<template>
  <div id="app" class="min-h-screen bg-gray-50">
    <!-- 导航栏 -->
    <nav class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <router-link to="/" class="text-xl font-bold text-primary-600">
              智能答题系统
            </router-link>
          </div>
          <div class="flex items-center space-x-4">
            <router-link 
              to="/" 
              class="text-gray-600 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
              :class="{ 'text-primary-600 bg-primary-50': $route.path === '/' }"
            >
              首页
            </router-link>
            <router-link 
              to="/import" 
              class="text-gray-600 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
              :class="{ 'text-primary-600 bg-primary-50': $route.path === '/import' }"
            >
              导入题库
            </router-link>
            <router-link 
              to="/quiz" 
              class="text-gray-600 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
              :class="{ 'text-primary-600 bg-primary-50': $route.path === '/quiz' }"
            >
              开始答题
            </router-link>
            <router-link 
              to="/history" 
              class="text-gray-600 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
              :class="{ 'text-primary-600 bg-primary-50': $route.path === '/history' }"
            >
              答题记录
            </router-link>
            <router-link 
              to="/settings" 
              class="text-gray-600 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
              :class="{ 'text-primary-600 bg-primary-50': $route.path === '/settings' }"
            >
              AI设置
            </router-link>
          </div>
        </div>
      </div>
    </nav>

    <!-- 主内容区域 -->
    <main class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <router-view />
    </main>
  </div>
</template>

<script setup>
// 这里可以添加全局逻辑
</script>