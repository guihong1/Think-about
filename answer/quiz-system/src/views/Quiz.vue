<template>
  <div class="max-w-4xl mx-auto space-y-6">
    <!-- 页面标题 -->
    <div class="text-center">
      <h1 class="text-3xl font-bold text-gray-900 mb-4">
        开始答题
      </h1>
      <p class="text-lg text-gray-600">
        选择题库和配置，开始您的学习之旅
      </p>
    </div>

    <!-- 答题配置 -->
    <div v-if="!currentQuiz" class="card">
      <h2 class="text-xl font-semibold text-gray-900 mb-6">答题配置</h2>
      
      <!-- 选择题库 -->
      <div class="mb-6">
        <label class="block text-sm font-medium text-gray-700 mb-2">选择题库</label>
        <VirtualBankSelector
          :question-banks="questionStore.questionBanks"
          :selected-bank-id="selectedBankId"
          :selected-bank-name="selectedBankName"
          @select-bank="selectBank"
          @export-bank="exportBankToWord"
          @delete-bank="deleteBankWithConfirm"
        />
      </div>

      <!-- 题库信息 -->
      <div v-if="selectedBank" class="mb-6 p-4 bg-blue-50 rounded-lg">
        <h3 class="font-medium text-blue-900 mb-2">{{ selectedBank.name }}</h3>
        <p class="text-blue-700 text-sm mb-2">{{ selectedBank.description || '暂无描述' }}</p>
        <div class="flex flex-wrap gap-2">
          <span 
            v-for="type in availableTypes" 
            :key="type"
            class="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
          >
            {{ type }}
          </span>
        </div>
      </div>

      <!-- 题型选择 -->
      <div v-if="selectedBank" class="mb-6">
        <label class="block text-sm font-medium text-gray-700 mb-2">选择题型（可多选）</label>
        <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
          <label 
            v-for="type in availableTypes" 
            :key="type"
            class="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
            :class="selectedTypes.includes(type) ? 'border-primary-500 bg-primary-50' : 'border-gray-300'"
          >
            <input 
              type="checkbox" 
              :value="type" 
              v-model="selectedTypes"
              class="mr-2 text-primary-600 focus:ring-primary-500"
            >
            <span class="text-sm font-medium text-gray-700">{{ type }}</span>
          </label>
        </div>
      </div>

      <!-- 题目数量 -->
      <div v-if="selectedBank" class="mb-6">
        <label class="block text-sm font-medium text-gray-700 mb-2">
          题目数量 (最多 {{ maxQuestions }} 题)
        </label>
        <input 
          v-model.number="questionCount" 
          type="range" 
          :min="1" 
          :max="maxQuestions"
          class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        >
        <div class="flex justify-between text-sm text-gray-600 mt-1">
          <span>1</span>
          <span class="font-medium text-primary-600">{{ questionCount }}</span>
          <span>{{ maxQuestions }}</span>
        </div>
      </div>

      <!-- 答题模式 -->
      <div v-if="selectedBank" class="mb-6">
        <label class="block text-sm font-medium text-gray-700 mb-2">答题模式</label>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label class="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50"
                 :class="quizMode === 'practice' ? 'border-primary-500 bg-primary-50' : 'border-gray-300'">
            <input type="radio" value="practice" v-model="quizMode" class="mr-3 text-primary-600">
            <div>
              <h3 class="font-medium text-gray-900">练习模式</h3>
              <p class="text-sm text-gray-600">可以随时查看答案和提示</p>
            </div>
          </label>
          <label class="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50"
                 :class="quizMode === 'exam' ? 'border-primary-500 bg-primary-50' : 'border-gray-300'">
            <input type="radio" value="exam" v-model="quizMode" class="mr-3 text-primary-600">
            <div>
              <h3 class="font-medium text-gray-900">考试模式</h3>
              <p class="text-sm text-gray-600">完成后统一评分和反馈</p>
            </div>
          </label>
        </div>
      </div>

      <!-- 开始答题按钮 -->
      <div v-if="selectedBank" class="flex justify-center">
        <button 
          @click="startQuiz" 
          :disabled="!canStartQuiz"
          class="btn-primary px-8 py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          开始答题
        </button>
      </div>
    </div>

    <!-- 答题界面 -->
    <div v-if="currentQuiz" class="space-y-6">
      <!-- 答题进度 -->
      <div class="card">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-semibold text-gray-900">{{ currentQuiz.bankName }}</h2>
          <div class="text-sm text-gray-600">
            {{ currentQuestionIndex + 1 }} / {{ currentQuiz.questions.length }}
          </div>
        </div>
        <div class="w-full bg-gray-200 rounded-full h-2">
          <div 
            class="bg-primary-600 h-2 rounded-full transition-all duration-300"
            :style="{ width: `${((currentQuestionIndex + 1) / currentQuiz.questions.length) * 100}%` }"
          ></div>
        </div>
      </div>

      <!-- 当前题目 -->
      <div class="card">
        <div class="flex items-start justify-between mb-4">
          <h3 class="text-lg font-medium text-gray-900">
            第 {{ currentQuestionIndex + 1 }} 题
          </h3>
          <span class="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
            {{ currentQuestion.type }}
          </span>
        </div>
        
        <div class="mb-6">
          <p class="text-lg text-gray-800 leading-relaxed">
            {{ currentQuestion.question }}
          </p>
        </div>

        <!-- 答案输入 -->
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 mb-2">您的答案</label>
          
          <!-- 选择题 -->
          <div v-if="currentQuestion.type === 'choice'" class="space-y-3">
            <label 
              v-for="(option, index) in currentQuestion.options" 
              :key="index"
              class="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
              :class="currentAnswer === getOptionValue(option) ? 'border-primary-500 bg-primary-50' : 'border-gray-300'"
            >
              <input 
                type="radio" 
                :value="getOptionValue(option)" 
                v-model="currentAnswer"
                class="mr-3 text-primary-600 focus:ring-primary-500"
              >
              <span class="text-gray-800">{{ option }}</span>
            </label>
          </div>
          
          <!-- 判断题 -->
          <div v-else-if="currentQuestion.type === 'judge'" class="grid grid-cols-2 gap-4">
            <label 
              class="flex items-center justify-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
              :class="currentAnswer === '正确' ? 'border-green-500 bg-green-50' : 'border-gray-300'"
            >
              <input 
                type="radio" 
                value="正确" 
                v-model="currentAnswer"
                class="mr-3 text-green-600 focus:ring-green-500"
              >
              <span class="text-lg font-medium text-green-700">✓ 正确</span>
            </label>
            <label 
              class="flex items-center justify-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
              :class="currentAnswer === '错误' ? 'border-red-500 bg-red-50' : 'border-gray-300'"
            >
              <input 
                type="radio" 
                value="错误" 
                v-model="currentAnswer"
                class="mr-3 text-red-600 focus:ring-red-500"
              >
              <span class="text-lg font-medium text-red-700">✗ 错误</span>
            </label>
          </div>
          
          <!-- 填空题 -->
          <div v-else-if="currentQuestion.type === 'fill'">
            <input 
              v-model="currentAnswer"
              type="text"
              placeholder="请输入答案..."
              class="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
          </div>
          
          <!-- 问答题 -->
          <div v-else>
            <textarea 
              v-model="currentAnswer"
              placeholder="请输入您的答案..."
              class="w-full h-32 p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
            ></textarea>
          </div>
        </div>

        <!-- 练习模式下的标准答案 -->
        <div v-if="quizMode === 'practice' && showAnswer" class="mb-6 p-4 bg-green-50 rounded-lg">
          <h4 class="font-medium text-green-900 mb-2">参考答案</h4>
          <p class="text-green-800">{{ currentQuestion.answer }}</p>
        </div>

        <!-- 操作按钮 -->
        <div class="flex justify-between">
          <div class="space-x-4">
            <button 
              @click="exitQuiz"
              class="btn-secondary bg-red-100 text-red-700 hover:bg-red-200"
            >
              退出答题
            </button>
            <button 
              v-if="currentQuestionIndex > 0" 
              @click="previousQuestion"
              class="btn-secondary"
            >
              上一题
            </button>
            <button 
              v-if="quizMode === 'practice'" 
              @click="toggleAnswer"
              class="btn-secondary"
            >
              {{ showAnswer ? '隐藏答案' : '查看答案' }}
            </button>
          </div>
          
          <div class="space-x-4">
            <button 
              v-if="currentQuestionIndex < currentQuiz.questions.length - 1" 
              @click="nextQuestion"
              class="btn-primary"
            >
              下一题
            </button>
            <button 
              v-else
              @click="finishQuiz"
              :disabled="isEvaluating"
              class="btn-primary bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="!isEvaluating">完成答题</span>
              <span v-else class="flex items-center">
                <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                评估中...
              </span>
            </button>
          </div>
        </div>
      </div>

      <!-- 题目导航 -->
      <div class="card">
        <h3 class="text-lg font-medium text-gray-900 mb-4">题目导航</h3>
        <div class="grid grid-cols-5 md:grid-cols-10 gap-2">
          <button 
            v-for="(question, index) in currentQuiz.questions" 
            :key="index"
            @click="goToQuestion(index)"
            class="w-10 h-10 rounded-lg text-sm font-medium transition-colors duration-200"
            :class="getQuestionButtonClass(index)"
          >
            {{ index + 1 }}
          </button>
        </div>
        <div class="flex items-center justify-center space-x-6 mt-4 text-sm text-gray-600">
          <div class="flex items-center">
            <div class="w-4 h-4 bg-primary-600 rounded mr-2"></div>
            <span>当前题目</span>
          </div>
          <div class="flex items-center">
            <div class="w-4 h-4 bg-green-500 rounded mr-2"></div>
            <span>已作答</span>
          </div>
          <div class="flex items-center">
            <div class="w-4 h-4 bg-gray-300 rounded mr-2"></div>
            <span>未作答</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 没有题库提示 -->
    <div v-if="questionStore.questionBanks.length === 0" class="card text-center">
      <svg class="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
      </svg>
      <h3 class="text-lg font-medium text-gray-900 mb-2">暂无题库</h3>
      <p class="text-gray-600 mb-4">请先导入题库后再开始答题</p>
      <router-link to="/import" class="btn-primary">
        去导入题库
      </router-link>
    </div>

    <!-- 评估进度弹窗 -->
    <div v-if="isEvaluating" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-8 max-w-md w-full mx-4 text-center">
        <div class="mb-6">
          <div class="w-16 h-16 mx-auto mb-4 relative">
            <svg class="w-16 h-16 text-primary-600 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <h3 class="text-xl font-semibold text-gray-900 mb-2">正在评估答题结果</h3>
          <p class="text-gray-600 mb-4">AI正在分析您的答案，请稍候...</p>
        </div>
        
        <!-- 进度条 -->
        <div class="mb-4">
          <div class="flex justify-between text-sm text-gray-600 mb-2">
            <span>评估进度</span>
            <span>{{ Math.round(evaluationProgress) }}%</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div 
              class="bg-primary-600 h-2 rounded-full transition-all duration-500 ease-out"
              :style="{ width: `${evaluationProgress}%` }"
            ></div>
          </div>
        </div>
        
        <!-- 评估阶段提示 -->
        <div class="text-sm text-gray-500">
          <p v-if="evaluationProgress < 30">正在分析题目内容...</p>
          <p v-else-if="evaluationProgress < 60">正在评估答案准确性...</p>
          <p v-else-if="evaluationProgress < 90">正在生成详细反馈...</p>
          <p v-else>即将完成评估...</p>
        </div>
        
        <!-- 温馨提示 -->
        <div class="mt-6 p-3 bg-blue-50 rounded-lg">
          <p class="text-xs text-blue-700">
            💡 评估时间取决于题目数量和AI服务响应速度，通常需要10-30秒
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuestionStore, useAIStore } from '../store'
import VirtualBankSelector from '../components/VirtualBankSelector.vue'

const router = useRouter()
const questionStore = useQuestionStore()

// 响应式数据
const selectedBankId = ref('')
const selectedTypes = ref([])
const questionCount = ref(10)
const quizMode = ref('practice')
const currentQuestionIndex = ref(0)
const currentAnswer = ref('')
const showAnswer = ref(false)
const isEvaluating = ref(false)
const evaluationProgress = ref(0)

// 计算属性
const selectedBank = computed(() => {
  return questionStore.questionBanks.find(bank => bank.id === selectedBankId.value)
})

const selectedBankName = computed(() => {
  if (!selectedBankId.value) return ''
  const bank = selectedBank.value
  return bank ? `${bank.name} (${bank.questions.length} 题)` : ''
})

const availableTypes = computed(() => {
  if (!selectedBank.value) return []
  const types = new Set()
  selectedBank.value.questions.forEach(q => types.add(q.type))
  return Array.from(types)
})

const maxQuestions = computed(() => {
  if (!selectedBank.value) return 0
  let questions = selectedBank.value.questions
  if (selectedTypes.value.length > 0) {
    questions = questions.filter(q => selectedTypes.value.includes(q.type))
  }
  return questions.length
})

const canStartQuiz = computed(() => {
  return selectedBankId.value && questionCount.value > 0 && maxQuestions.value > 0
})

const currentQuiz = computed(() => questionStore.currentQuiz)

const currentQuestion = computed(() => {
  if (!currentQuiz.value) return null
  return currentQuiz.value.questions[currentQuestionIndex.value]
})

// 监听当前题目变化，加载已保存的答案
watch([currentQuestionIndex, currentQuiz], () => {
  if (currentQuiz.value) {
    const savedAnswer = currentQuiz.value.answers[currentQuestionIndex.value]
    currentAnswer.value = savedAnswer ? savedAnswer.answer : ''
    showAnswer.value = false
  }
})

// 监听答案变化，自动保存
watch(currentAnswer, (newAnswer) => {
  if (currentQuiz.value) {
    questionStore.saveAnswer(currentQuestionIndex.value, newAnswer)
  }
})

// 方法

const selectBank = (bankId) => {
  selectedBankId.value = bankId
  if (bankId && selectedBank.value) {
    questionStore.selectBank(selectedBankId.value)
    selectedTypes.value = [...availableTypes.value] // 默认选择所有题型
    questionCount.value = Math.min(10, maxQuestions.value)
  } else {
    selectedTypes.value = []
    questionCount.value = 10
  }
}

const onBankChange = () => {
  if (selectedBank.value) {
    questionStore.selectBank(selectedBankId.value)
    selectedTypes.value = [...availableTypes.value] // 默认选择所有题型
    questionCount.value = Math.min(10, maxQuestions.value)
  }
}

const startQuiz = () => {
  const config = {
    questionCount: questionCount.value,
    questionTypes: selectedTypes.value.length > 0 ? selectedTypes.value : null,
    mode: quizMode.value
  }
  
  const quiz = questionStore.startQuiz(config)
  if (quiz) {
    currentQuestionIndex.value = 0
    currentAnswer.value = ''
    showAnswer.value = false
  }
}

const nextQuestion = () => {
  if (currentQuestionIndex.value < currentQuiz.value.questions.length - 1) {
    currentQuestionIndex.value++
  }
}

const previousQuestion = () => {
  if (currentQuestionIndex.value > 0) {
    currentQuestionIndex.value--
  }
}

const goToQuestion = (index) => {
  currentQuestionIndex.value = index
}

const toggleAnswer = () => {
  showAnswer.value = !showAnswer.value
}

const getQuestionButtonClass = (index) => {
  if (index === currentQuestionIndex.value) {
    return 'bg-primary-600 text-white'
  }
  if (currentQuiz.value.answers[index]) {
    return 'bg-green-500 text-white'
  }
  return 'bg-gray-300 text-gray-700 hover:bg-gray-400'
}

// 提取选择题选项的值（去掉A. B. C. D.前缀）
const getOptionValue = (option) => {
  if (typeof option === 'string') {
    // 如果选项格式是 "A. 选项内容"，提取选项字母
    const match = option.match(/^([A-D])\.\s*(.+)$/)
    if (match) {
      return match[1] // 返回选项字母 A, B, C, D
    }
  }
  return option
}

const exitQuiz = () => {
  const confirmed = confirm('确定要退出当前答题吗？未保存的答案将会丢失。')
  if (confirmed) {
    // 清除当前答题状态
    questionStore.currentQuiz = null
    // 重置相关状态
    selectedBankId.value = ''
    selectedTypes.value = []
    currentQuestionIndex.value = 0
    currentAnswer.value = ''
    showAnswer.value = false
  }
}

const exportBankToWord = async (bank) => {
  try {
    // 动态导入docx库
    const { Document, Packer, Paragraph, TextRun, HeadingLevel } = await import('docx')
    
    // 创建文档内容
    const children = []
    
    // 添加标题
    children.push(
      new Paragraph({
        text: bank.name,
        heading: HeadingLevel.TITLE,
      })
    )
    
    // 添加题库信息
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `题库描述：${bank.description || '暂无描述'}`,
            break: 1,
          }),
          new TextRun({
            text: `题目总数：${bank.questions.length} 题`,
            break: 1,
          }),
          new TextRun({
            text: `导出时间：${new Date().toLocaleString()}`,
            break: 2,
          }),
        ],
      })
    )
    
    // 添加题目
    bank.questions.forEach((question, index) => {
      // 题目标题
      children.push(
        new Paragraph({
          text: `第${index + 1}题 [${question.type}]`,
          heading: HeadingLevel.HEADING_2,
        })
      )
      
      // 题目内容
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `题目：${question.question}`,
              break: 1,
            }),
          ],
        })
      )
      
      // 选择题选项
      if (question.type === 'choice' && question.options) {
        question.options.forEach((option, optionIndex) => {
          children.push(
            new Paragraph({
              text: `${String.fromCharCode(65 + optionIndex)}. ${option}`,
            })
          )
        })
      }
      
      // 答案
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `答案：${question.answer}`,
              bold: true,
              break: 1,
            }),
          ],
        })
      )
      
      // 解析（如果有）
      if (question.explanation) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `解析：${question.explanation}`,
                break: 1,
              }),
            ],
          })
        )
      }
      
      // 添加分隔线
      children.push(
        new Paragraph({
          text: '————————————————————————————————————————',
          break: 1,
        })
      )
    })
    
    // 创建文档
    const doc = new Document({
      sections: [
        {
          properties: {},
          children: children,
        },
      ],
    })
    
    // 生成并下载文件
    const blob = await Packer.toBlob(doc)
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${bank.name}_题库.docx`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    
    alert(`题库「${bank.name}」已成功导出为Word文档`)
  } catch (error) {
    console.error('导出Word文档失败:', error)
    alert('导出失败，请稍后重试')
  }
}

const deleteBankWithConfirm = (bank) => {
  const confirmed = confirm(`确定要删除题库「${bank.name}」吗？\n\n此操作不可撤销，题库中的所有题目都将被永久删除。`)
  if (confirmed) {
    // 如果删除的是当前选中的题库，需要重置状态
    if (selectedBankId.value === bank.id) {
      selectedBankId.value = ''
      selectedTypes.value = []
      questionStore.currentBank = null
    }
    
    // 删除题库
    questionStore.deleteBank(bank.id)
    
    // 显示删除成功提示
    alert(`题库「${bank.name}」已成功删除`)
  }
}

const finishQuiz = async () => {
  if (!currentQuiz.value) return
  
  // 确认是否完成
  const unansweredCount = currentQuiz.value.questions.length - Object.keys(currentQuiz.value.answers).length
  if (unansweredCount > 0) {
    const confirmed = confirm(`还有 ${unansweredCount} 道题未作答，确定要完成答题吗？`)
    if (!confirmed) return
  }
  
  // 显示评估进度弹窗
  isEvaluating.value = true
  evaluationProgress.value = 0
  
  try {
    // 模拟进度更新
    const progressInterval = setInterval(() => {
      if (evaluationProgress.value < 90) {
        evaluationProgress.value += Math.random() * 15
      }
    }, 500)
    
    // 这里会调用AI评估
    const aiStore = useAIStore()
    const evaluation = await aiStore.evaluateAnswers(
      currentQuiz.value.questions,
      currentQuiz.value.answers
    )
    
    // 清除进度定时器
    clearInterval(progressInterval)
    evaluationProgress.value = 100
    
    // 短暂延迟显示完成状态
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // 完成答题并保存结果
    const result = questionStore.finishQuiz(evaluation)
    
    // 隐藏评估弹窗
    isEvaluating.value = false
    
    // 跳转到结果页面
    router.push({
      name: 'QuizResult',
      params: { resultId: result.id }
    })
  } catch (error) {
    console.error('答题完成失败:', error)
    isEvaluating.value = false
    alert('评估过程中出现错误，请稍后重试')
  }
}
</script>