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

    <!-- 虚拟滚动历史记录列表 -->
    <VirtualHistoryList
      :history-records="transformedHistoryRecords"
      @clear-history="clearHistory"
      @view-record="viewResult"
      @restart-quiz="restartQuiz"
      @delete-record="deleteQuiz"
      @review-wrong-questions="reviewWrongQuestions"
      @clear-filters="clearFilters"
    />


  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useQuestionStore } from '../store'
import VirtualHistoryList from '../components/VirtualHistoryList.vue'

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

// 转换历史记录数据格式以适配VirtualHistoryList组件
const transformedHistoryRecords = computed(() => {
  return questionStore.quizHistory.map(quiz => ({
    id: quiz.id,
    bankName: quiz.bankName,
    score: quiz.score,
    mode: quiz.mode,
    totalQuestions: quiz.questions.length,
    answeredQuestions: Object.keys(quiz.answers).length,
    correctAnswers: quiz.aiEvaluation?.questionEvaluations?.filter(e => e.score >= 80).length || 0,
    duration: getQuizDurationInMinutes(quiz) * 60, // 转换为秒
    date: quiz.endTime,
    wrongQuestions: quiz.aiEvaluation?.questionEvaluations?.filter(e => e.score < 80) || [],
    ...quiz // 保留原始数据
  }))
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

const deleteQuiz = (record) => {
  if (confirm('确定要删除这条答题记录吗？')) {
    const index = questionStore.quizHistory.findIndex(quiz => quiz.id === record.id)
    if (index !== -1) {
      questionStore.quizHistory.splice(index, 1)
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

// VirtualHistoryList组件的事件处理方法
const restartQuiz = (record) => {
  // 重新开始相同配置的测试
  router.push({
    name: 'Quiz',
    query: {
      bankId: record.bankId,
      mode: record.mode,
      questionCount: record.totalQuestions
    }
  })
}

const reviewWrongQuestions = (record) => {
  // 查看错题详情
  router.push({
    name: 'QuizResult',
    params: { resultId: record.id },
    query: { showWrongOnly: 'true' }
  })
}
</script>