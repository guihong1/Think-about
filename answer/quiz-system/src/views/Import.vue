<template>
  <div class="max-w-4xl mx-auto space-y-8">
    <!-- 页面标题 -->
    <div class="text-center">
      <h1 class="text-3xl font-bold text-gray-900 mb-4">
        导入题库
      </h1>
      <p class="text-lg text-gray-600">
        支持多种格式的文本文件导入，系统会自动解析问题和答案
      </p>
    </div>

    <!-- 导入方式选择 -->
    <div class="card">
      <h2 class="text-xl font-semibold text-gray-900 mb-4">选择导入方式</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button 
          @click="importMethod = 'file'"
          class="p-4 border-2 rounded-lg transition-colors duration-200"
          :class="importMethod === 'file' ? 'border-primary-500 bg-primary-50' : 'border-gray-300 hover:border-gray-400'"
        >
          <div class="flex items-center">
            <svg class="w-8 h-8 text-primary-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
            <div class="text-left">
              <h3 class="font-medium text-gray-900">文件上传</h3>
              <p class="text-sm text-gray-600">上传文本文件(.txt)</p>
            </div>
          </div>
        </button>
        
        <button 
          @click="importMethod = 'text'"
          class="p-4 border-2 rounded-lg transition-colors duration-200"
          :class="importMethod === 'text' ? 'border-primary-500 bg-primary-50' : 'border-gray-300 hover:border-gray-400'"
        >
          <div class="flex items-center">
            <svg class="w-8 h-8 text-primary-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
            </svg>
            <div class="text-left">
              <h3 class="font-medium text-gray-900">直接输入</h3>
              <p class="text-sm text-gray-600">在文本框中直接输入</p>
            </div>
          </div>
        </button>
      </div>
    </div>

    <!-- 格式说明 -->
    <div class="card">
      <h2 class="text-xl font-semibold text-gray-900 mb-4">支持的格式</h2>
      <div class="space-y-4">
        <div class="bg-gray-50 p-4 rounded-lg">
          <h3 class="font-medium text-gray-900 mb-2">标准格式（推荐）</h3>
          <pre class="text-sm text-gray-700 whitespace-pre-wrap">Q: 这里是问题内容？
A: 这里是答案内容
Type: 选择题

Q: 另一个问题？
A: 另一个答案
Type: 简答题</pre>
        </div>
        
        <div class="bg-gray-50 p-4 rounded-lg">
          <h3 class="font-medium text-gray-900 mb-2">简化格式</h3>
          <pre class="text-sm text-gray-700 whitespace-pre-wrap">问题1：这里是问题内容？
答案1：这里是答案内容

问题2：另一个问题？
答案2：另一个答案</pre>
        </div>
      </div>
    </div>

    <!-- 文件上传区域 -->
    <div v-if="importMethod === 'file'" class="card">
      <h2 class="text-xl font-semibold text-gray-900 mb-4">上传文件</h2>
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
            accept=".txt" 
            @change="handleFileSelect" 
            class="hidden"
          >
        </label>
        <p class="text-sm text-gray-500 mt-2">支持 .txt 格式文件</p>
      </div>
    </div>

    <!-- 文本输入区域 -->
    <div v-if="importMethod === 'text'" class="card">
      <h2 class="text-xl font-semibold text-gray-900 mb-4">输入题库内容</h2>
      <textarea 
        v-model="textContent"
        placeholder="请按照上述格式输入题库内容..."
        class="w-full h-64 p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
      ></textarea>
    </div>

    <!-- 题库信息 -->
    <div v-if="importMethod" class="card">
      <h2 class="text-xl font-semibold text-gray-900 mb-4">题库信息</h2>
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

    <!-- 预览和导入 -->
    <div v-if="parsedQuestions.length > 0" class="card">
      <h2 class="text-xl font-semibold text-gray-900 mb-4">预览解析结果</h2>
      <div class="mb-4">
        <p class="text-gray-600">共解析到 <span class="font-semibold text-primary-600">{{ parsedQuestions.length }}</span> 道题目</p>
      </div>
      
      <!-- 题目预览 -->
      <div class="space-y-4 max-h-96 overflow-y-auto">
        <div 
          v-for="(question, index) in parsedQuestions.slice(0, 5)" 
          :key="index"
          class="bg-gray-50 p-4 rounded-lg"
        >
          <div class="flex items-start justify-between mb-2">
            <h3 class="font-medium text-gray-900">题目 {{ index + 1 }}</h3>
            <span class="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
              {{ question.type || '未分类' }}
            </span>
          </div>
          <p class="text-gray-700 mb-2"><strong>问题：</strong>{{ question.question }}</p>
          <p class="text-gray-700"><strong>答案：</strong>{{ question.answer }}</p>
        </div>
        
        <div v-if="parsedQuestions.length > 5" class="text-center text-gray-500">
          还有 {{ parsedQuestions.length - 5 }} 道题目未显示...
        </div>
      </div>
      
      <!-- 导入按钮 -->
      <div class="mt-6 flex justify-end space-x-4">
        <button @click="clearData" class="btn-secondary">
          清空重新导入
        </button>
        <button 
          @click="importQuestions" 
          :disabled="!bankName.trim()"
          class="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          导入题库
        </button>
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
          <button @click="showSuccess = false" class="btn-secondary">
            继续导入
          </button>
          <router-link to="/quiz" class="btn-primary">
            开始答题
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useQuestionStore } from '../store'

const questionStore = useQuestionStore()

// 响应式数据
const importMethod = ref('')
const textContent = ref('')
const bankName = ref('')
const bankDescription = ref('')
const parsedQuestions = ref([])
const isDragging = ref(false)
const showSuccess = ref(false)

// 监听文本内容变化，自动解析
watch(textContent, (newContent) => {
  if (newContent.trim()) {
    parseQuestions(newContent)
  } else {
    parsedQuestions.value = []
  }
})

// 处理文件拖拽
const handleFileDrop = (e) => {
  e.preventDefault()
  isDragging.value = false
  const files = e.dataTransfer.files
  if (files.length > 0) {
    readFile(files[0])
  }
}

// 处理文件选择
const handleFileSelect = (e) => {
  const files = e.target.files
  if (files.length > 0) {
    readFile(files[0])
  }
}

// 读取文件内容
const readFile = (file) => {
  if (!file.name.endsWith('.txt')) {
    alert('请选择 .txt 格式的文件')
    return
  }
  
  const reader = new FileReader()
  reader.onload = (e) => {
    textContent.value = e.target.result
    if (!bankName.value) {
      bankName.value = file.name.replace('.txt', '')
    }
  }
  reader.readAsText(file, 'UTF-8')
}

// 解析题目
const parseQuestions = (content) => {
  const questions = []
  
  // 标准格式解析 (Q: ... A: ... Type: ...)
  const standardPattern = /Q:\s*(.+?)\s*A:\s*(.+?)(?:\s*Type:\s*(.+?))?(?=\s*Q:|$)/gs
  let match
  
  while ((match = standardPattern.exec(content)) !== null) {
    questions.push({
      question: match[1].trim(),
      answer: match[2].trim(),
      type: match[3] ? match[3].trim() : '未分类'
    })
  }
  
  // 如果标准格式没有匹配到，尝试简化格式
  if (questions.length === 0) {
    const simplePattern = /(?:问题\d*[：:]|\d+[.、]|Q\d*[：:])\s*(.+?)\s*(?:答案\d*[：:]|A\d*[：:])\s*(.+?)(?=(?:问题\d*[：:]|\d+[.、]|Q\d*[：:])|$)/gs
    
    while ((match = simplePattern.exec(content)) !== null) {
      questions.push({
        question: match[1].trim(),
        answer: match[2].trim(),
        type: '未分类'
      })
    }
  }
  
  // 如果还是没有匹配到，尝试按行分割的简单格式
  if (questions.length === 0) {
    const lines = content.split('\n').filter(line => line.trim())
    for (let i = 0; i < lines.length - 1; i += 2) {
      if (lines[i] && lines[i + 1]) {
        questions.push({
          question: lines[i].trim(),
          answer: lines[i + 1].trim(),
          type: '未分类'
        })
      }
    }
  }
  
  parsedQuestions.value = questions
}

// 导入题库
const importQuestions = () => {
  if (!bankName.value.trim()) {
    alert('请输入题库名称')
    return
  }
  
  if (parsedQuestions.value.length === 0) {
    alert('没有解析到有效的题目')
    return
  }
  
  questionStore.addQuestionBank({
    name: bankName.value.trim(),
    description: bankDescription.value.trim(),
    questions: parsedQuestions.value
  })
  
  showSuccess.value = true
}

// 清空数据
const clearData = () => {
  textContent.value = ''
  bankName.value = ''
  bankDescription.value = ''
  parsedQuestions.value = []
  importMethod.value = ''
}
</script>