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

      <!-- 测试连接结果 -->
      <div v-if="testResult" class="mt-6 p-4 rounded-lg border" :class="{
        'bg-green-50 border-green-200': testResult.success,
        'bg-red-50 border-red-200': !testResult.success
      }">
        <div class="flex items-start">
          <div class="flex-shrink-0">
            <svg v-if="testResult.success" class="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
            <svg v-else class="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3 flex-1">
            <h3 class="text-sm font-medium" :class="{
              'text-green-800': testResult.success,
              'text-red-800': !testResult.success
            }">
              {{ testResult.message }}
            </h3>
            <div class="mt-2 text-sm" :class="{
              'text-green-700': testResult.success,
              'text-red-700': !testResult.success
            }">
              <div class="space-y-1">
                <p><span class="font-medium">提供商:</span> {{ testResult.details.provider }}</p>
                <p><span class="font-medium">模型:</span> {{ testResult.details.model }}</p>
                <p v-if="testResult.details.latency"><span class="font-medium">延迟:</span> {{ testResult.details.latency }}</p>
                <p v-if="testResult.details.status"><span class="font-medium">状态:</span> {{ testResult.details.status }}</p>
                <p v-if="testResult.details.response"><span class="font-medium">响应:</span> {{ testResult.details.response }}</p>
                <p v-if="testResult.details.error" class="text-red-600"><span class="font-medium">错误:</span> {{ testResult.details.error }}</p>
                <p v-if="testResult.details.suggestion" class="font-medium text-blue-600">💡 {{ testResult.details.suggestion }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="flex justify-end space-x-4 mt-6">
        <button 
          @click="testConnection"
          :disabled="(currentProvider !== 'mock' && !apiKey) || isTestingConnection"
          class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          <svg v-if="isTestingConnection" class="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {{ isTestingConnection ? '测试中...' : '测试连接' }}
        </button>
        <button 
          @click="saveConfig"
          :disabled="isSaving"
          class="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          <svg v-if="isSaving" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {{ isSaving ? '保存中...' : '保存配置' }}
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
import aiService from '../services/aiService'

const aiStore = useAIStore()
const aiConfigs = AI_CONFIGS

// 响应式数据
const currentProvider = ref('mock')
const apiKey = ref('')
const customBaseURL = ref('')
const isTestingConnection = ref(false)
const testResult = ref(null)
const isSaving = ref(false)

// 选择AI提供商
const selectProvider = (provider) => {
  currentProvider.value = provider
  // 清空测试结果
  testResult.value = null
  
  // 清空API密钥和自定义地址
  if (provider === 'mock') {
    apiKey.value = ''
    customBaseURL.value = ''
  } else if (provider === 'qwen') {
    // 通义千问已有预配置的API密钥
    apiKey.value = aiConfigs.qwen.headers.Authorization.replace('Bearer ', '')
  } else {
    // 其他提供商清空密钥
    apiKey.value = ''
    customBaseURL.value = ''
  }
}

// 测试连接
const testConnection = async () => {
  if (isTestingConnection.value) return
  
  isTestingConnection.value = true
  testResult.value = null
  
  try {
    // 临时更新aiService配置进行测试
    const tempConfig = {
      provider: currentProvider.value,
      apiKey: apiKey.value,
      customBaseURL: customBaseURL.value
    }
    
    // 保存当前配置
    const originalConfig = { ...aiService.config }
    
    // 应用测试配置
    aiService.updateConfig(tempConfig)
    
    // 执行连接测试
    const result = await aiService.testConnection()
    
    // 恢复原配置
    aiService.updateConfig(originalConfig)
    
    testResult.value = result
    
  } catch (error) {
    testResult.value = {
      success: false,
      message: '连接测试异常',
      details: {
        error: error.message,
        suggestion: '请检查网络连接和配置信息'
      }
    }
  } finally {
    isTestingConnection.value = false
  }
}

// 保存配置
const saveConfig = async () => {
  if (isSaving.value) return
  
  isSaving.value = true
  
  try {
    const config = {
      provider: currentProvider.value,
      apiKey: apiKey.value,
      customBaseURL: customBaseURL.value
    }
    
    await aiStore.updateConfig(config)
    
    // 显示成功消息
    showMessage('配置保存成功！', 'success')
    
  } catch (error) {
    showMessage('配置保存失败：' + error.message, 'error')
  } finally {
    isSaving.value = false
  }
}

// 显示消息
const showMessage = (message, type = 'info') => {
  // 这里可以集成更好的消息提示组件
  if (type === 'success') {
    alert('✅ ' + message)
  } else if (type === 'error') {
    alert('❌ ' + message)
  } else {
    alert('ℹ️ ' + message)
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