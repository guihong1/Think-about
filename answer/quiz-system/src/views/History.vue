<template>
  <div class="max-w-6xl mx-auto space-y-6">
    <!-- 页面标题 -->
    <div class="text-center">
      <h1 class="text-3xl font-bold text-gray-900 mb-4">
        答题历史
      </h1>
      <p class="text-lg text-gray-600">
        查看您的答题记录和进步轨迹
      </p>
    </div>

    <!-- 统计概览 -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div class="card text-center">
        <div class="text-3xl font-bold text-blue-600 mb-2">{{ totalQuizzes }}</div>
        <div class="text-gray-600">总答题次数</div>
      </div>
      <div class="card text-center">
        <div class="text-3xl font-bold text-green-600 mb-2">{{ averageScore }}%</div>
        <div class="text-gray-600">平均分数</div>
      </div>
      <div class="card text-center">
        <div class="text-3xl font-bold text-purple-600 mb-2">{{ totalQuestions }}</div>
        <div class="text-gray-600">累计答题数</div>
      </div>
      <div class="card text-center">
        <div class="text-3xl font-bold text-orange-600 mb-2">{{ totalTime }}</div>
        <div class="text-gray-600">累计用时</div>
      </div>
    </div>

    <!-- 筛选和排序 -->
    <div class="card">
      <div class="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div class="flex flex-wrap gap-4">
          <!-- 题库筛选 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">题库筛选</label>
            <select v-model="filterBank" class="input-field w-48">
              <option value="">全部题库</option>
              <option v-for="bank in availableBanks" :key="bank" :value="bank">
                {{ bank }}
              </option>
            </select>
          </div>
          
          <!-- 分数筛选 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">分数筛选</label>
            <select v-model="filterScore" class="input-field w-32">
              <option value="">全部</option>
              <option value="90">90分以上</option>
              <option value="80">80-89分</option>
              <option value="70">70-79分</option>
              <option value="60">60-69分</option>
              <option value="0">60分以下</option>
            </select>
          </div>
        </div>
        
        <div class="flex items-center space-x-4">
          <!-- 排序 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">排序方式</label>
            <select v-model="sortBy" class="input-field w-32">
              <option value="date">按时间</option>
              <option value="score">按分数</option>
              <option value="bank">按题库</option>
            </select>
          </div>
          
          <!-- 清空历史 -->
          <button 
            @click="clearHistory"
            class="btn-secondary mt-6"
            :disabled="filteredHistory.length === 0"
          >
            清空历史
          </button>
        </div>
      </div>
    </div>

    <!-- 历史记录列表 -->
    <div v-if="filteredHistory.length > 0" class="space-y-4">
      <div 
        v-for="quiz in paginatedHistory" 
        :key="quiz.id"
        class="card hover:shadow-lg transition-shadow duration-200"
      >
        <div class="flex items-center justify-between">
          <div class="flex-1">
            <div class="flex items-center space-x-4 mb-2">
              <h3 class="text-lg font-semibold text-gray-900">{{ quiz.bankName }}</h3>
              <span class="px-3 py-1 rounded-full text-sm font-medium"
                    :class="getScoreBadgeClass(quiz.score)">
                {{ quiz.score }} 分
              </span>
              <span class="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                {{ quiz.mode === 'practice' ? '练习模式' : '考试模式' }}
              </span>
            </div>
            
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
              <div>
                <span class="font-medium">题目数量：</span>
                {{ quiz.questions.length }}
              </div>
              <div>
                <span class="font-medium">作答数量：</span>
                {{ Object.keys(quiz.answers).length }}
              </div>
              <div>
                <span class="font-medium">用时：</span>
                {{ getQuizDuration(quiz) }}
              </div>
              <div>
                <span class="font-medium">答题时间：</span>
                {{ formatDate(quiz.endTime) }}
              </div>
            </div>
          </div>
          
          <div class="flex items-center space-x-2 ml-4">
            <button 
              @click="viewResult(quiz)"
              class="btn-primary text-sm px-3 py-1"
            >
              查看详情
            </button>
            <button 
              @click="deleteQuiz(quiz.id)"
              class="btn-secondary text-sm px-3 py-1 text-red-600 hover:bg-red-50"
            >
              删除
            </button>
          </div>
        </div>
        
        <!-- 展开的详细信息 -->
        <div v-if="expandedQuiz === quiz.id" class="mt-4 pt-4 border-t border-gray-200">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- 分数分布 -->
            <div>
              <h4 class="font-medium text-gray-900 mb-3">题目得分分布</h4>
              <div class="space-y-2">
                <div v-for="(evaluation, index) in getQuestionEvaluations(quiz)" :key="index"
                     class="flex items-center justify-between text-sm">
                  <span class="text-gray-600">第 {{ index + 1 }} 题</span>
                  <span class="font-medium" :class="getScoreTextClass(evaluation.score)">
                    {{ evaluation.score }} 分
                  </span>
                </div>
              </div>
            </div>
            
            <!-- AI总体评价 -->
            <div v-if="quiz.aiEvaluation?.overallFeedback">
              <h4 class="font-medium text-gray-900 mb-3">AI 总体评价</h4>
              <div class="bg-blue-50 p-3 rounded-lg">
                <p class="text-blue-900 text-sm">{{ quiz.aiEvaluation.overallFeedback }}</p>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 展开/收起按钮 -->
        <div class="mt-4 text-center">
          <button 
            @click="toggleExpand(quiz.id)"
            class="text-primary-600 hover:text-primary-700 text-sm font-medium"
          >
            {{ expandedQuiz === quiz.id ? '收起详情' : '展开详情' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 分页 -->
    <div v-if="totalPages > 1" class="flex justify-center">
      <nav class="flex items-center space-x-2">
        <button 
          @click="currentPage = Math.max(1, currentPage - 1)"
          :disabled="currentPage === 1"
          class="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          上一页
        </button>
        
        <span class="px-3 py-2 text-sm font-medium text-gray-700">
          第 {{ currentPage }} 页，共 {{ totalPages }} 页
        </span>
        
        <button 
          @click="currentPage = Math.min(totalPages, currentPage + 1)"
          :disabled="currentPage === totalPages"
          class="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          下一页
        </button>
      </nav>
    </div>

    <!-- 空状态 -->
    <div v-if="questionStore.quizHistory.length === 0" class="card text-center">
      <svg class="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
      </svg>
      <h3 class="text-lg font-medium text-gray-900 mb-2">暂无答题记录</h3>
      <p class="text-gray-600 mb-4">开始您的第一次答题吧！</p>
      <router-link to="/quiz" class="btn-primary">
        开始答题
      </router-link>
    </div>

    <!-- 筛选后无结果 -->
    <div v-else-if="filteredHistory.length === 0" class="card text-center">
      <svg class="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
      </svg>
      <h3 class="text-lg font-medium text-gray-900 mb-2">没有找到匹配的记录</h3>
      <p class="text-gray-600 mb-4">请尝试调整筛选条件</p>
      <button @click="clearFilters" class="btn-primary">
        清除筛选
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useQuestionStore } from '../store'

const router = useRouter()
const questionStore = useQuestionStore()

// 响应式数据
const filterBank = ref('')
const filterScore = ref('')
const sortBy = ref('date')
const currentPage = ref(1)
const pageSize = ref(10)
const expandedQuiz = ref(null)

// 计算属性
const totalQuizzes = computed(() => questionStore.quizHistory.length)

const averageScore = computed(() => {
  if (questionStore.quizHistory.length === 0) return 0
  const total = questionStore.quizHistory.reduce((sum, quiz) => sum + quiz.score, 0)
  return Math.round(total / questionStore.quizHistory.length)
})

const totalQuestions = computed(() => {
  return questionStore.quizHistory.reduce((total, quiz) => total + quiz.questions.length, 0)
})

const totalTime = computed(() => {
  const totalMinutes = questionStore.quizHistory.reduce((total, quiz) => {
    const duration = getQuizDurationInMinutes(quiz)
    return total + duration
  }, 0)
  
  if (totalMinutes < 60) return `${totalMinutes} 分钟`
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  return `${hours} 小时 ${minutes} 分钟`
})

const availableBanks = computed(() => {
  const banks = new Set()
  questionStore.quizHistory.forEach(quiz => banks.add(quiz.bankName))
  return Array.from(banks)
})

const filteredHistory = computed(() => {
  let history = [...questionStore.quizHistory]
  
  // 题库筛选
  if (filterBank.value) {
    history = history.filter(quiz => quiz.bankName === filterBank.value)
  }
  
  // 分数筛选
  if (filterScore.value) {
    const score = parseInt(filterScore.value)
    if (score === 0) {
      history = history.filter(quiz => quiz.score < 60)
    } else {
      history = history.filter(quiz => {
        if (score === 90) return quiz.score >= 90
        if (score === 80) return quiz.score >= 80 && quiz.score < 90
        if (score === 70) return quiz.score >= 70 && quiz.score < 80
        if (score === 60) return quiz.score >= 60 && quiz.score < 70
        return false
      })
    }
  }
  
  // 排序
  history.sort((a, b) => {
    switch (sortBy.value) {
      case 'score':
        return b.score - a.score
      case 'bank':
        return a.bankName.localeCompare(b.bankName)
      case 'date':
      default:
        return new Date(b.endTime) - new Date(a.endTime)
    }
  })
  
  return history
})

const totalPages = computed(() => {
  return Math.ceil(filteredHistory.value.length / pageSize.value)
})

const paginatedHistory = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredHistory.value.slice(start, end)
})

// 方法
const getQuizDuration = (quiz) => {
  const minutes = getQuizDurationInMinutes(quiz)
  return `${minutes} 分钟`
}

const getQuizDurationInMinutes = (quiz) => {
  if (!quiz.startTime || !quiz.endTime) return 0
  const start = new Date(quiz.startTime)
  const end = new Date(quiz.endTime)
  return Math.floor((end - start) / 1000 / 60)
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getScoreBadgeClass = (score) => {
  if (score >= 90) return 'bg-green-100 text-green-800'
  if (score >= 80) return 'bg-blue-100 text-blue-800'
  if (score >= 70) return 'bg-yellow-100 text-yellow-800'
  if (score >= 60) return 'bg-orange-100 text-orange-800'
  return 'bg-red-100 text-red-800'
}

const getScoreTextClass = (score) => {
  if (score >= 90) return 'text-green-600'
  if (score >= 80) return 'text-blue-600'
  if (score >= 70) return 'text-yellow-600'
  if (score >= 60) return 'text-orange-600'
  return 'text-red-600'
}

const getQuestionEvaluations = (quiz) => {
  if (!quiz.aiEvaluation?.questionEvaluations) return []
  return quiz.aiEvaluation.questionEvaluations
}

const viewResult = (quiz) => {
  router.push({
    name: 'QuizResult',
    params: { resultId: quiz.id }
  })
}

const deleteQuiz = (quizId) => {
  if (confirm('确定要删除这条答题记录吗？')) {
    const index = questionStore.quizHistory.findIndex(quiz => quiz.id === quizId)
    if (index !== -1) {
      questionStore.quizHistory.splice(index, 1)
    }
    
    // 如果当前页没有数据了，回到上一页
    if (paginatedHistory.value.length === 0 && currentPage.value > 1) {
      currentPage.value--
    }
  }
}

const clearHistory = () => {
  if (confirm('确定要清空所有答题记录吗？此操作不可恢复。')) {
    questionStore.quizHistory.splice(0)
    currentPage.value = 1
  }
}

const clearFilters = () => {
  filterBank.value = ''
  filterScore.value = ''
  sortBy.value = 'date'
  currentPage.value = 1
}

const toggleExpand = (quizId) => {
  expandedQuiz.value = expandedQuiz.value === quizId ? null : quizId
}
</script>