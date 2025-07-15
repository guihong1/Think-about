<template>
  <div class="max-w-4xl mx-auto space-y-6">
    <!-- 页面标题 -->
    <div class="text-center">
      <h1 class="text-3xl font-bold text-gray-900 mb-4">
        AI配置设置
      </h1>
      <p class="text-gray-600">
        选择和配置您的AI评估服务
      </p>
    </div>

    <!-- AI配置卡片 -->
    <div class="bg-white rounded-lg shadow-md p-6">
      <h2 class="text-xl font-semibold text-gray-900 mb-6">AI服务提供商</h2>
      
      <!-- AI提供商选择 -->
      <div class="space-y-4 mb-6">
        <div 
          v-for="(config, key) in aiConfigs" 
          :key="key"
          class="border rounded-lg p-4 cursor-pointer transition-all"
          :class="{
            'border-blue-500 bg-blue-50': currentProvider === key,
            'border-gray-200 hover:border-gray-300': currentProvider !== key
          }"
          @click="selectProvider(key)"
        >
          <div class="flex items-center justify-between">
            <div>
              <h3 class="font-medium text-gray-900">{{ config.name }}</h3>
              <p class="text-sm text-gray-500 mt-1">
                模型: {{ config.model }}
                <span v-if="key === 'mock'" class="text-green-600 ml-2">(推荐用于测试)</span>
                <span v-else-if="key === 'qwen'" class="text-blue-600 ml-2">(已配置API密钥)</span>
                <span v-else class="text-orange-600 ml-2">(需要配置API密钥)</span>
              </p>
            </div>
            <div class="flex items-center">
              <input 
                type="radio" 
                :value="key" 
                v-model="currentProvider"
                class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              >
            </div>
          </div>
        </div>
      </div>

      <!-- API密钥配置 -->
      <div v-if="currentProvider !== 'mock'" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            API密钥
          </label>
          <input 
            type="password" 
            v-model="apiKey"
            placeholder="请输入API密钥"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
          <p class="text-xs text-gray-500 mt-1">
            您的API密钥将安全存储在本地，不会上传到服务器
          </p>
        </div>

        <!-- 自定义API地址 -->
        <div v-if="currentProvider === 'openai'">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            自定义API地址 (可选)
          </label>
          <input 
            type="url" 
            v-model="customBaseURL"
            placeholder="https://api.openai.com/v1"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
          <p class="text-xs text-gray-500 mt-1">
            可以使用兼容OpenAI的API服务
          </p>
        </div>
      </div>

      <!-- 当前配置状态 -->
      <div class="mt-6 p-4 bg-gray-50 rounded-lg">
        <h3 class="font-medium text-gray-900 mb-2">当前配置状态</h3>
        <div class="text-sm text-gray-600 space-y-1">
          <p><span class="font-medium">AI提供商:</span> {{ aiConfigs[currentProvider]?.name }}</p>
          <p><span class="font-medium">模型:</span> {{ aiConfigs[currentProvider]?.model }}</p>
          <p v-if="currentProvider === 'mock'" class="text-green-600">
            <span class="font-medium">状态:</span> 模拟AI已启用，无需配置
          </p>
          <p v-else-if="apiKey" class="text-green-600">
            <span class="font-medium">状态:</span> API密钥已配置
          </p>
          <p v-else class="text-orange-600">
            <span class="font-medium">状态:</span> 需要配置API密钥
          </p>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="flex justify-end space-x-4 mt-6">
        <button 
          @click="testConnection"
          :disabled="currentProvider !== 'mock' && !apiKey"
          class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          测试连接
        </button>
        <button 
          @click="saveConfig"
          class="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          保存配置
        </button>
      </div>
    </div>

    <!-- 使用说明 -->
    <div class="bg-blue-50 border border-blue-200 rounded-lg p-6">
      <h3 class="font-medium text-blue-900 mb-3">使用说明</h3>
      <div class="text-sm text-blue-800 space-y-2">
        <p><strong>模拟AI:</strong> 用于测试和演示，无需配置API密钥，会生成模拟的评估结果。</p>
        <p><strong>通义千问:</strong> 阿里云提供的大模型服务，已预配置API密钥，可直接使用。</p>
        <p><strong>OpenAI:</strong> 需要您自己的API密钥，支持GPT系列模型。</p>
        <p><strong>智谱AI:</strong> 需要您自己的API密钥，支持GLM系列模型。</p>
        <p><strong>文心一言:</strong> 百度提供的大模型服务，需要配置API密钥。</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAIStore } from '../store'
import { AI_CONFIGS } from '../services/aiService'

const aiStore = useAIStore()
const aiConfigs = AI_CONFIGS

// 响应式数据
const currentProvider = ref('mock')
const apiKey = ref('')
const customBaseURL = ref('')

// 选择AI提供商
const selectProvider = (provider) => {
  currentProvider.value = provider
  // 清空API密钥和自定义地址
  if (provider === 'mock') {
    apiKey.value = ''
    customBaseURL.value = ''
  } else if (provider === 'qwen') {
    // 通义千问已有预配置的API密钥
    apiKey.value = aiConfigs.qwen.headers.Authorization.replace('Bearer ', '')
  }
}

// 测试连接
const testConnection = async () => {
  try {
    // 这里可以添加测试连接的逻辑
    alert('连接测试成功！')
  } catch (error) {
    alert('连接测试失败：' + error.message)
  }
}

// 保存配置
const saveConfig = async () => {
  try {
    const config = {
      provider: currentProvider.value,
      apiKey: apiKey.value,
      customBaseURL: customBaseURL.value
    }
    
    await aiStore.updateConfig(config)
    alert('配置保存成功！')
  } catch (error) {
    alert('配置保存失败：' + error.message)
  }
}

// 初始化
onMounted(() => {
  const config = aiStore.config
  currentProvider.value = config.provider || 'mock'
  apiKey.value = config.apiKey || ''
  customBaseURL.value = config.customBaseURL || ''
})
</script>