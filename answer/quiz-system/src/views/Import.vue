<template>
  <div class="max-w-4xl mx-auto space-y-8">
    <!-- 页面标题 -->
    <div class="text-center">
      <h1 class="text-3xl font-bold text-gray-900 mb-4">
        AI智能题库生成
      </h1>
      <p class="text-lg text-gray-600">
        上传学习资料，AI将自动为您生成个性化题库
      </p>
    </div>

    <!-- 步骤指示器 -->
    <div class="flex items-center justify-center space-x-4 mb-8">
      <div class="flex items-center">
        <div class="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
             :class="currentStep >= 1 ? 'bg-primary-600' : 'bg-gray-300'">
          1
        </div>
        <span class="ml-2 text-sm font-medium" :class="currentStep >= 1 ? 'text-primary-600' : 'text-gray-500'">
          上传资料
        </span>
      </div>
      <div class="w-16 h-0.5" :class="currentStep >= 2 ? 'bg-primary-600' : 'bg-gray-300'"></div>
      <div class="flex items-center">
        <div class="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
             :class="currentStep >= 2 ? 'bg-primary-600' : 'bg-gray-300'">
          2
        </div>
        <span class="ml-2 text-sm font-medium" :class="currentStep >= 2 ? 'text-primary-600' : 'text-gray-500'">
          设置参数
        </span>
      </div>
      <div class="w-16 h-0.5" :class="currentStep >= 3 ? 'bg-primary-600' : 'bg-gray-300'"></div>
      <div class="flex items-center">
        <div class="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
             :class="currentStep >= 3 ? 'bg-primary-600' : 'bg-gray-300'">
          3
        </div>
        <span class="ml-2 text-sm font-medium" :class="currentStep >= 3 ? 'text-primary-600' : 'text-gray-500'">
          生成题库
        </span>
      </div>
      
      <!-- 状态指示器 -->
      <div v-if="importStore.hasTempState && !showRestoreDialog" class="ml-6 flex items-center text-sm text-green-600">
        <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
        </svg>
        <span>进度已保存</span>
      </div>
    </div>

    <!-- 步骤1: 文件上传 -->
    <div v-if="currentStep === 1" class="card">
      <h2 class="text-xl font-semibold text-gray-900 mb-4">上传学习资料</h2>
      <!-- @dragover.prevent：防止浏览器默认行为（否则拖进来的文件不会触发 drop）。
           @dragenter.prevent：用户拖进区域时高亮。
           @drop="handleFileDrop"：当用户释放鼠标，执行处理函数。 -->
      <div 
        @drop="handleFileDrop"
        @dragover.prevent
        @dragenter.prevent
        class="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary-400 transition-colors duration-200"
        :class="{ 'border-primary-400 bg-primary-50': isDragging }"
      >
        <svg class="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
        </svg>
        <p class="text-lg text-gray-600 mb-2">拖拽文件到这里或</p>
        <label class="btn-primary cursor-pointer">
          选择文件
          <input 
            type="file" 
            accept=".txt,.doc,.docx,.pdf" 
            @change="handleFileSelect" 
            class="hidden"
          >
        </label>
        <p class="text-sm text-gray-500 mt-2">支持 TXT、Word、PDF 格式文件</p>
      </div>
      
      <!-- 已上传文件列表 -->
      <div v-if="uploadedFiles.length > 0" class="mt-6">
        <h3 class="text-lg font-medium text-gray-900 mb-3">已上传文件</h3>
        <div class="space-y-2">
          <div v-for="(file, index) in uploadedFiles" :key="index" 
               class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div class="flex items-center">
              <svg class="w-5 h-5 text-gray-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              <span class="text-sm font-medium text-gray-900">{{ file.name }}</span>
              <span class="text-xs text-gray-500 ml-2">({{ formatFileSize(file.size) }})</span>
            </div>
            <button @click="removeFile(index)" class="text-red-500 hover:text-red-700">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        </div>
        <div class="mt-4 flex justify-end">
          <button @click="nextStep" class="btn-primary" :disabled="uploadedFiles.length === 0">
            下一步
          </button>
        </div>
      </div>
    </div>

    <!-- 步骤2: 参数设置 -->
    <div v-if="currentStep === 2" class="card">
      <h2 class="text-xl font-semibold text-gray-900 mb-6">设置生成参数</h2>
      
      <!-- 题库基本信息 -->
      <div class="mb-6">
        <h3 class="text-lg font-medium text-gray-900 mb-4">题库信息</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">题库名称</label>
            <input 
              v-model="bankName"
              type="text" 
              placeholder="请输入题库名称"
              class="input-field"
            >
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">题库描述</label>
            <input 
              v-model="bankDescription"
              type="text" 
              placeholder="请输入题库描述（可选）"
              class="input-field"
            >
          </div>
        </div>
      </div>

      <!-- 题目类型选择 -->
      <div class="mb-6">
        <h3 class="text-lg font-medium text-gray-900 mb-4">题目类型</h3>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
          <label v-for="type in questionTypes" :key="type.value" 
                 class="flex items-center p-3 border rounded-lg cursor-pointer transition-colors"
                 :class="selectedTypes.includes(type.value) ? 'border-primary-500 bg-primary-50' : 'border-gray-300 hover:border-gray-400'">
            <input 
              type="checkbox" 
              :value="type.value" 
              v-model="selectedTypes"
              class="sr-only"
            >
            <div class="flex items-center">
              <div class="w-4 h-4 border-2 rounded mr-3 flex items-center justify-center"
                   :class="selectedTypes.includes(type.value) ? 'border-primary-500 bg-primary-500' : 'border-gray-300'">
                <svg v-if="selectedTypes.includes(type.value)" class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                </svg>
              </div>
              <span class="text-sm font-medium">{{ type.label }}</span>
            </div>
          </label>
        </div>
      </div>

      <!-- 题目数量设置 -->
      <div class="mb-6">
        <h3 class="text-lg font-medium text-gray-900 mb-4">题目数量</h3>
        <div class="space-y-4">
          <div v-for="type in selectedTypes" :key="type" class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span class="text-sm font-medium text-gray-700">{{ getTypeLabel(type) }}</span>
            <div class="flex items-center space-x-3">
              <button @click="decreaseCount(type)" class="w-8 h-8 rounded-full bg-white border border-gray-300 flex items-center justify-center hover:bg-gray-50">
                <svg class="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"></path>
                </svg>
              </button>
              <span class="w-12 text-center font-medium">{{ questionCounts[type] || 5 }}</span>
              <button @click="increaseCount(type)" class="w-8 h-8 rounded-full bg-white border border-gray-300 flex items-center justify-center hover:bg-gray-50">
                <svg class="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
        <div class="mt-3 text-sm text-gray-600">
          总计: {{ totalQuestions }} 道题目
        </div>
      </div>

      <!-- 难度设置 -->
      <div class="mb-6">
        <h3 class="text-lg font-medium text-gray-900 mb-4">难度分布</h3>
        <div class="grid grid-cols-3 gap-4">
          <div class="text-center">
            <label class="block text-sm font-medium text-gray-700 mb-2">简单</label>
            <input 
              v-model.number="difficulty.easy"
              type="range" 
              min="0" 
              max="100" 
              class="w-full"
            >
            <span class="text-sm text-gray-600">{{ difficulty.easy }}%</span>
          </div>
          <div class="text-center">
            <label class="block text-sm font-medium text-gray-700 mb-2">中等</label>
            <input 
              v-model.number="difficulty.medium"
              type="range" 
              min="0" 
              max="100" 
              class="w-full"
            >
            <span class="text-sm text-gray-600">{{ difficulty.medium }}%</span>
          </div>
          <div class="text-center">
            <label class="block text-sm font-medium text-gray-700 mb-2">困难</label>
            <input 
              v-model.number="difficulty.hard"
              type="range" 
              min="0" 
              max="100" 
              class="w-full"
            >
            <span class="text-sm text-gray-600">{{ difficulty.hard }}%</span>
          </div>
        </div>
        <div class="mt-2 text-sm text-gray-500">
          注意：三个难度的百分比总和应为100%
        </div>
      </div>

      <!-- 导航按钮 -->
      <div class="flex justify-between">
        <button @click="prevStep" class="btn-secondary">
          上一步
        </button>
        <button @click="generateQuestions" class="btn-primary" 
                :disabled="selectedTypes.length === 0 || !bankName.trim()">
          生成题库
        </button>
      </div>
    </div>

    <!-- 步骤3: 生成题库 -->
    <div v-if="currentStep === 3" class="space-y-6">
      <!-- 生成进度 -->
      <div v-if="isGenerating" class="card">
        <div class="text-center py-8">
          <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
          <h3 class="text-lg font-medium text-gray-900 mb-2">AI正在生成题库...</h3>
          <p class="text-gray-600 mb-4">{{ generationProgress }}</p>
          <button @click="cancelGeneration" class="btn-secondary">
            取消生成
          </button>
        </div>
      </div>

      <!-- 生成结果预览 -->
      <div v-if="generatedQuestions.length > 0 && !isGenerating" class="card">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-semibold text-gray-900">题库预览</h2>
          <div class="text-sm text-gray-600">
            共生成 <span class="font-semibold text-primary-600">{{ generatedQuestions.length }}</span> 道题目
          </div>
        </div>
        
        <!-- 题目列表 -->
        <div class="space-y-4 max-h-96 overflow-y-auto">
          <div 
            v-for="(question, index) in generatedQuestions" 
            :key="index"
            class="bg-gray-50 p-4 rounded-lg"
          >
            <div class="flex items-start justify-between mb-3">
              <h3 class="font-medium text-gray-900">题目 {{ index + 1 }}</h3>
              <div class="flex items-center space-x-2">
                <span class="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                  {{ question.type }}
                </span>
                <span class="px-2 py-1 text-xs rounded-full"
                      :class="getDifficultyClass(question.difficulty)">
                  {{ getDifficultyLabel(question.difficulty) }}
                </span>
                <button @click="editQuestion(index)" class="text-primary-600 hover:text-primary-800">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                  </svg>
                </button>
              </div>
            </div>
            
            <!-- 编辑模式 -->
            <div v-if="editingIndex === index" class="space-y-3">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">问题</label>
                <textarea 
                  v-model="editForm.question"
                  class="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  rows="2"
                ></textarea>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">答案</label>
                <textarea 
                  v-model="editForm.answer"
                  class="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  rows="2"
                ></textarea>
              </div>
              <div class="flex items-center space-x-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">类型</label>
                  <select v-model="editForm.type" class="border border-gray-300 rounded px-2 py-1 text-sm">
                    <option v-for="type in questionTypes" :key="type.value" :value="type.value">
                      {{ type.label }}
                    </option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">难度</label>
                  <select v-model="editForm.difficulty" class="border border-gray-300 rounded px-2 py-1 text-sm">
                    <option value="easy">简单</option>
                    <option value="medium">中等</option>
                    <option value="hard">困难</option>
                  </select>
                </div>
              </div>
              <div class="flex justify-end space-x-2">
                <button @click="editingIndex = -1" class="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300">
                  取消
                </button>
                <button @click="saveQuestion(index)" class="px-3 py-1 text-sm bg-primary-600 text-white rounded hover:bg-primary-700">
                  保存
                </button>
              </div>
            </div>
            
            <!-- 预览模式 -->
            <div v-else>
              <p class="text-gray-700 mb-2"><strong>问题：</strong>{{ question.question }}</p>
              <p class="text-gray-700"><strong>答案：</strong>{{ question.answer }}</p>
            </div>
          </div>
        </div>
        
        <!-- 操作按钮 -->
        <div class="mt-6 flex justify-between">
          <div class="flex space-x-2">
            <button @click="regenerateQuestions" class="btn-secondary">
              重新生成
            </button>
            <button @click="addQuestion" class="btn-secondary">
              添加题目
            </button>
          </div>
          <div class="flex space-x-2">
            <button @click="prevStep" class="btn-secondary">
              上一步
            </button>
            <button @click="importQuestions" class="btn-primary">
              导入题库
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 成功提示 -->
    <div v-if="showSuccess" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 max-w-md mx-4">
        <div class="flex items-center mb-4">
          <svg class="w-8 h-8 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <h3 class="text-lg font-semibold text-gray-900">导入成功！</h3>
        </div>
        <p class="text-gray-600 mb-4">题库已成功导入，您可以开始答题了。</p>
        <div class="flex justify-end space-x-4">
          <button @click="continueImport" class="btn-secondary">
          继续导入
          </button>
          <router-link to="/quiz" class="btn-primary">
            开始答题
          </router-link>
        </div>
      </div>
    </div>

    <!-- 状态恢复对话框 -->
    <div v-if="showRestoreDialog" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-8 max-w-md w-full mx-4">
        <div class="text-center">
          <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
            </svg>
          </div>
          <h3 class="text-lg font-medium text-gray-900 mb-2">发现未完成的题库生成</h3>
          <p class="text-gray-600 mb-6">检测到您之前有未完成的题库生成流程，是否要恢复之前的进度？</p>
          <div class="flex space-x-3">
            <button @click="rejectRestore" class="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors">
              重新开始
            </button>
            <button @click="confirmRestore" class="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
              恢复进度
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, onBeforeUnmount } from 'vue'
import { useQuestionStore, useAIStore, useImportStore } from '../store'
import aiService from '../services/aiService'
import generationService from '../services/generationService'

const questionStore = useQuestionStore()
const aiStore = useAIStore()
const importStore = useImportStore()

// 响应式数据
const currentStep = ref(importStore.currentStep || 1)
const isDragging = ref(false)
const uploadedFiles = ref(importStore.uploadedFiles || [])
const bankName = ref(importStore.bankName || '')
const bankDescription = ref(importStore.bankDescription || '')
const showSuccess = ref(false)
const generatedQuestions = ref(importStore.generatedQuestions || [])

// 使用store中的生成状态
const isGenerating = computed(() => importStore.generationState.isGenerating)
const generationProgress = computed(() => importStore.generationState.progress)
const editingIndex = ref(-1)
const editForm=ref(null)
const showRestoreDialog = ref(false)
const isInitialized = ref(false)

// 题目类型配置
const questionTypes = ref([
  { value: 'choice', label: '选择题' },
  { value: 'fill', label: '填空题' },
  { value: 'essay', label: '问答题' },
  { value: 'judge', label: '判断题' }
])

// 选中的题目类型
const selectedTypes = ref(importStore.selectedTypes || ['choice'])

// 题目数量配置
const questionCounts = ref(importStore.questionCounts || {
  choice: 5,
  fill: 3,
  essay: 2,
  judge: 3
})

// 难度分布
const difficulty = ref(importStore.difficulty || {
  easy: 40,
  medium: 40,
  hard: 20
})

// 计算属性
const totalQuestions = computed(() => {
  return selectedTypes.value.reduce((total, type) => {
    return total + (questionCounts.value[type] || 0)
  }, 0)
})

// 处理文件拖拽
const handleFileDrop = (e) => {
  e.preventDefault()
  isDragging.value = false
  const files = Array.from(e.dataTransfer.files)
  addFiles(files)
}

// 处理文件选择
const handleFileSelect = (e) => {
  const files = Array.from(e.target.files)
  addFiles(files)
  e.target.value = '' // 清空input，允许重复选择同一文件
}

// 添加文件
const addFiles = (files) => {
  const validFiles = files.filter(file => {
    const extension = file.name.toLowerCase().split('.').pop()
    return ['txt', 'doc', 'docx', 'pdf'].includes(extension)
  })
  
  if (validFiles.length !== files.length) {
    alert('只支持 TXT、Word、PDF 格式的文件')
  }
  
  uploadedFiles.value.push(...validFiles)
  
  // 自动设置题库名称
  if (!bankName.value && validFiles.length > 0) {
    bankName.value = validFiles[0].name.replace(/\.[^/.]+$/, '')
  }
}

// 移除文件
const removeFile = (index) => {
  uploadedFiles.value.splice(index, 1)
}

// 格式化文件大小
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 获取题目类型标签
const getTypeLabel = (value) => {
  const type = questionTypes.value.find(t => t.value === value)
  return type ? type.label : value
}

// 增加题目数量
const increaseCount = (type) => {
  questionCounts.value[type] = (questionCounts.value[type] || 0) + 1
}

// 减少题目数量
const decreaseCount = (type) => {
  if (questionCounts.value[type] > 1) {
    questionCounts.value[type]--
  }
}

// 获取难度样式
const getDifficultyClass = (difficulty) => {
  const classes = {
    easy: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    hard: 'bg-red-100 text-red-800'
  }
  return classes[difficulty] || 'bg-gray-100 text-gray-800'
}

// 获取难度标签
const getDifficultyLabel = (difficulty) => {
  const labels = {
    easy: '简单',
    medium: '中等',
    hard: '困难'
  }
  return labels[difficulty] || difficulty
}

// 步骤导航
const nextStep = () => {
  if (currentStep.value < 3) {
    currentStep.value++
  }
}

const prevStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--
  }
}

// 生成题库
const generateQuestions = async () => {
  if (uploadedFiles.value.length === 0) {
    alert('请先上传学习资料')
    return
  }
  
  currentStep.value = 3
  
  try {
    // 准备题目配置
    const questionConfig = {
      selectedTypes: selectedTypes.value,
      questionCounts: questionCounts.value,
      difficulty: difficulty.value
    }
    
    // 使用生成服务开始后台生成
    const generationId = await generationService.startGeneration(
      uploadedFiles.value,
      questionConfig
    )
    
    console.log('生成任务已启动，ID:', generationId)
    
  } catch (error) {
    console.error('启动生成任务失败:', error)
    alert(`启动生成任务失败：${error.message}`)
  }
}



// 编辑题目
const editQuestion = (index) => {
  editingIndex.value = index
  const original = generatedQuestions.value[index];
  editForm.value = {
    question: original.question,
    answer: original.answer,
    type: original.type,
    difficulty: original.difficulty
  };
}

// 保存题目
const saveQuestion = (index) => {
  if(editForm.value)
{
  generatedQuestions.value[index] = {...editForm.value}
}
  editingIndex.value = -1
  editForm.value = null
  // 这里可以添加验证逻辑
}

// 添加新题目
const addQuestion = () => {
  generatedQuestions.value.push({
    question: '新题目',
    answer: '新答案',
    type: selectedTypes.value[0] || 'choice',
    difficulty: 'medium'
  })
}

// 重新生成题库
const regenerateQuestions = () => {
  generateQuestions()
}

// 取消生成
const cancelGeneration = () => {
  if (importStore.generationState.generationId) {
    generationService.cancelGeneration(importStore.generationState.generationId)
    console.log('已取消生成任务')
  }
  // 返回到参数设置页面
  currentStep.value = 2
  // 清空已生成的题目
  generatedQuestions.value = []
}

// 导入题库
const importQuestions = () => {
  if (!bankName.value.trim()) {
    alert('请输入题库名称')
    return
  }
  
  if (generatedQuestions.value.length === 0) {
    alert('没有生成的题目')
    return
  }
  
  try {
    questionStore.addQuestionBank({
      name: bankName.value.trim(),
      description: bankDescription.value.trim(),
      questions: generatedQuestions.value
    })
    
    // 清空临时状态
    importStore.clearTempState()
    
    showSuccess.value = true
    
    // 3秒后自动关闭成功提示
    setTimeout(() => {
      showSuccess.value = false
      clearData()
    }, 3000)
  } catch (error) {
    console.error('导入题库失败:', error)
    alert('导入题库失败，请重试')
  }
}

// 继续导入（关闭成功提示并重置）
const continueImport = () => {
  showSuccess.value = false
  clearData()
}

// 清空数据
const clearData = (clearStore = true) => {
  currentStep.value = 1
  uploadedFiles.value = []
  bankName.value = ''
  bankDescription.value = ''
  generatedQuestions.value = []
  selectedTypes.value = ['choice']
  questionCounts.value = { choice: 5, fill: 3, essay: 2, judge: 3 }
  difficulty.value = { easy: 40, medium: 40, hard: 20 }
  
  // 清空store中的临时状态
  if (clearStore) {
    importStore.clearTempState()
  }
}

// 保存当前状态到store
const saveCurrentState = () => {
  importStore.saveTempState({
    currentStep: currentStep.value,
    uploadedFiles: uploadedFiles.value,
    bankName: bankName.value,
    bankDescription: bankDescription.value,
    selectedTypes: selectedTypes.value,
    questionCounts: questionCounts.value,
    difficulty: difficulty.value,
    generatedQuestions: generatedQuestions.value,
    generationState: importStore.generationState
  })
}

// 从store恢复状态
const restoreState = () => {
  if (importStore.hasTempState) {
    currentStep.value = importStore.currentStep
    uploadedFiles.value = importStore.uploadedFiles
    bankName.value = importStore.bankName
    bankDescription.value = importStore.bankDescription
    selectedTypes.value = importStore.selectedTypes
    questionCounts.value = importStore.questionCounts
    difficulty.value = importStore.difficulty
    generatedQuestions.value = importStore.generatedQuestions
  }
}

// 确认恢复状态
const confirmRestore = () => {
  restoreState()
  showRestoreDialog.value = false
  // 恢复完成后开始自动保存
  isInitialized.value = true
}

// 拒绝恢复状态
const rejectRestore = () => {
  importStore.clearTempState()
  showRestoreDialog.value = false
  // 重置组件状态，但不重复清理store
  clearData(false)
  // 重新开始后开始自动保存
  isInitialized.value = true
}

// 组件挂载时检查是否有临时状态
onMounted(() => {
  // 重新检查是否有有效的临时状态
  const hasValidTemp = importStore.hasValidTempData()
  importStore.hasTempState = hasValidTemp
  
  // 检查是否有正在进行的生成任务
  if (importStore.generationState.isGenerating) {
    console.log('检测到正在进行的生成任务，恢复生成状态')
    currentStep.value = 3
    // 同步生成的题目
    generatedQuestions.value = importStore.generatedQuestions
  }
  
  if (hasValidTemp) {
    showRestoreDialog.value = true
    // 等待用户选择，不立即设置初始化标志
  } else {
    // 如果没有临时状态，确保组件状态是初始状态
    clearData(false)
    // 标记组件已初始化，开始自动保存
    isInitialized.value = true
  }
})

// 监听状态变化，自动保存
watch([currentStep, uploadedFiles, bankName, bankDescription, selectedTypes, questionCounts, difficulty, generatedQuestions], () => {
  if (isInitialized.value) {
    saveCurrentState()
  }
}, { deep: true })

// 监听store中的生成结果变化
watch(() => importStore.generatedQuestions, (newQuestions) => {
  generatedQuestions.value = newQuestions
}, { deep: true })

// 监听生成状态变化，检查是否需要恢复生成状态
watch(() => importStore.generationState.isGenerating, (isGenerating) => {
  if (isGenerating && currentStep.value < 3) {
    // 如果有生成任务在进行且当前不在第三步，自动跳转到第三步
    currentStep.value = 3
  }
})

// 组件卸载前保存状态
onBeforeUnmount(() => {
  saveCurrentState()
})
</script>