<template>
  <div class="max-w-6xl mx-auto space-y-6">
    <!-- 页面标题 -->
    <div class="text-center">
      <h1 class="text-3xl font-bold text-gray-900 mb-4">
        答题结果
      </h1>
      <p class="text-lg text-gray-600">
        AI智能评估结果和详细反馈
      </p>
    </div>

    <div v-if="result" class="space-y-6">
      <!-- 总体评分 -->
      <div class="card">
        <div class="text-center">
          <div class="mb-6">
            <div class="inline-flex items-center justify-center w-24 h-24 rounded-full mb-4"
                 :class="getScoreCircleClass(result.score)">
              <span class="text-3xl font-bold text-white">{{ result.score }}</span>
            </div>
            <h2 class="text-2xl font-bold text-gray-900 mb-2">总分：{{ result.score }} 分</h2>
            <p class="text-lg" :class="getScoreTextClass(result.score)">
              {{ getScoreLevel(result.score) }}
            </p>
          </div>
          
          <!-- 答题统计 -->
          <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
            <div class="text-center">
              <div class="text-2xl font-bold text-blue-600">{{ result.questions.length }}</div>
              <div class="text-gray-600">总题数</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-green-600">{{ answeredCount }}</div>
              <div class="text-gray-600">已作答</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-orange-600">{{ unansweredCount }}</div>
              <div class="text-gray-600">未作答</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-purple-600">{{ duration }}</div>
              <div class="text-gray-600">用时</div>
            </div>
          </div>
        </div>
      </div>

      <!-- AI总体反馈 -->
      <div v-if="result.aiEvaluation?.overallFeedback" class="card">
        <h3 class="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <svg class="w-6 h-6 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
          </svg>
          AI 总体评价
        </h3>
        <div class="bg-blue-50 p-4 rounded-lg">
          <p class="text-blue-900">{{ result.aiEvaluation.overallFeedback }}</p>
        </div>
      </div>

      <!-- 详细题目分析 -->
      <div class="card">
        <h3 class="text-xl font-semibold text-gray-900 mb-6 flex items-center">
          <svg class="w-6 h-6 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          详细分析
        </h3>
        
        <!-- 筛选选项 -->
        <div class="mb-6">
          <div class="flex flex-wrap gap-2">
            <button 
              @click="filterType = 'all'"
              class="px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
              :class="filterType === 'all' ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'"
            >
              全部 ({{ result.questions.length }})
            </button>
            <button 
              @click="filterType = 'answered'"
              class="px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
              :class="filterType === 'answered' ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'"
            >
              已作答 ({{ answeredCount }})
            </button>
            <button 
              @click="filterType = 'unanswered'"
              class="px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
              :class="filterType === 'unanswered' ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'"
            >
              未作答 ({{ unansweredCount }})
            </button>
          </div>
        </div>

        <!-- 题目列表 -->
        <div class="space-y-6">
          <div 
            v-for="(question, index) in filteredQuestions" 
            :key="index"
            class="border border-gray-200 rounded-lg p-6"
          >
            <div class="flex items-start justify-between mb-4">
              <h4 class="text-lg font-medium text-gray-900">
                第 {{ question.originalIndex + 1 }} 题
              </h4>
              <div class="flex items-center space-x-2">
                <span class="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                  {{ question.type }}
                </span>
                <span 
                  v-if="getQuestionEvaluation(question.originalIndex)"
                  class="px-2 py-1 text-xs rounded-full"
                  :class="getScoreBadgeClass(getQuestionEvaluation(question.originalIndex).score)"
                >
                  {{ getQuestionEvaluation(question.originalIndex).score }} 分
                </span>
              </div>
            </div>
            
            <!-- 问题 -->
            <div class="mb-4">
              <h5 class="font-medium text-gray-700 mb-2">问题：</h5>
              <p class="text-gray-800">{{ question.question }}</p>
            </div>
            
            <!-- 标准答案 -->
            <div class="mb-4">
              <h5 class="font-medium text-gray-700 mb-2">标准答案：</h5>
              <div class="bg-green-50 p-3 rounded-lg">
                <p class="text-green-800">{{ question.answer }}</p>
              </div>
            </div>
            
            <!-- 用户答案 -->
            <div class="mb-4">
              <h5 class="font-medium text-gray-700 mb-2">您的答案：</h5>
              <div class="p-3 rounded-lg" :class="getUserAnswerClass(question.originalIndex)">
                <p :class="getUserAnswerTextClass(question.originalIndex)">
                  {{ getUserAnswer(question.originalIndex) || '未作答' }}
                </p>
              </div>
            </div>
            
            <!-- AI评估 -->
            <div v-if="getQuestionEvaluation(question.originalIndex)" class="space-y-3">
              <div>
                <h5 class="font-medium text-gray-700 mb-2">AI 反馈：</h5>
                <div class="bg-blue-50 p-3 rounded-lg">
                  <p class="text-blue-900">{{ getQuestionEvaluation(question.originalIndex).feedback }}</p>
                </div>
              </div>
              
              <div v-if="getQuestionEvaluation(question.originalIndex).suggestions?.length > 0">
                <h5 class="font-medium text-gray-700 mb-2">改进建议：</h5>
                <ul class="bg-yellow-50 p-3 rounded-lg space-y-1">
                  <li 
                    v-for="suggestion in getQuestionEvaluation(question.originalIndex).suggestions" 
                    :key="suggestion"
                    class="text-yellow-800 text-sm flex items-start"
                  >
                    <span class="text-yellow-600 mr-2">•</span>
                    {{ suggestion }}
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="flex justify-center space-x-4">
        <router-link to="/quiz" class="btn-primary">
          再次答题
        </router-link>
        <router-link to="/history" class="btn-secondary">
          查看历史
        </router-link>
        <router-link to="/" class="btn-secondary">
          返回首页
        </router-link>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-else class="card text-center">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
      <p class="text-gray-600">正在加载结果...</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useQuestionStore } from '../store'

const route = useRoute()
const questionStore = useQuestionStore()

// 响应式数据
const filterType = ref('all')
const result = ref(null)

// 计算属性
const answeredCount = computed(() => {
  if (!result.value) return 0
  return Object.keys(result.value.answers).length
})

const unansweredCount = computed(() => {
  if (!result.value) return 0
  return result.value.questions.length - answeredCount.value
})

const duration = computed(() => {
  if (!result.value || !result.value.startTime || !result.value.endTime) return '未知'
  const start = new Date(result.value.startTime)
  const end = new Date(result.value.endTime)
  const diff = Math.floor((end - start) / 1000 / 60) // 分钟
  return `${diff} 分钟`
})

const filteredQuestions = computed(() => {
  if (!result.value) return []
  
  let questions = result.value.questions.map((q, index) => ({
    ...q,
    originalIndex: index
  }))
  
  if (filterType.value === 'answered') {
    questions = questions.filter(q => result.value.answers[q.originalIndex])
  } else if (filterType.value === 'unanswered') {
    questions = questions.filter(q => !result.value.answers[q.originalIndex])
  }
  
  return questions
})

// 方法
const getUserAnswer = (index) => {
  return result.value.answers[index]?.answer || ''
}

const getQuestionEvaluation = (index) => {
    if (!result.value.aiEvaluation?.questionEvaluations) return null
    return result.value.aiEvaluation.questionEvaluations.find(evaluation => evaluation.questionIndex === index)
  }

const getScoreLevel = (score) => {
  if (score >= 90) return '优秀'
  if (score >= 80) return '良好'
  if (score >= 70) return '中等'
  if (score >= 60) return '及格'
  return '需要加强'
}

const getScoreCircleClass = (score) => {
  if (score >= 90) return 'bg-green-500'
  if (score >= 80) return 'bg-blue-500'
  if (score >= 70) return 'bg-yellow-500'
  if (score >= 60) return 'bg-orange-500'
  return 'bg-red-500'
}

const getScoreTextClass = (score) => {
  if (score >= 90) return 'text-green-600'
  if (score >= 80) return 'text-blue-600'
  if (score >= 70) return 'text-yellow-600'
  if (score >= 60) return 'text-orange-600'
  return 'text-red-600'
}

const getScoreBadgeClass = (score) => {
  if (score >= 90) return 'bg-green-100 text-green-800'
  if (score >= 80) return 'bg-blue-100 text-blue-800'
  if (score >= 70) return 'bg-yellow-100 text-yellow-800'
  if (score >= 60) return 'bg-orange-100 text-orange-800'
  return 'bg-red-100 text-red-800'
}

const getUserAnswerClass = (index) => {
  const hasAnswer = result.value.answers[index]
  if (!hasAnswer) return 'bg-gray-100'
  
  const evaluation = getQuestionEvaluation(index)
  if (!evaluation) return 'bg-gray-100'
  
  if (evaluation.score >= 80) return 'bg-green-50'
  if (evaluation.score >= 60) return 'bg-yellow-50'
  return 'bg-red-50'
}

const getUserAnswerTextClass = (index) => {
  const hasAnswer = result.value.answers[index]
  if (!hasAnswer) return 'text-gray-500'
  
  const evaluation = getQuestionEvaluation(index)
  if (!evaluation) return 'text-gray-800'
  
  if (evaluation.score >= 80) return 'text-green-800'
  if (evaluation.score >= 60) return 'text-yellow-800'
  return 'text-red-800'
}

// 生命周期
onMounted(() => {
  // 从路由参数或store中获取结果
  const resultId = route.params.resultId
  if (resultId) {
    result.value = questionStore.quizHistory.find(h => h.id == resultId)
  } else {
    // 如果没有指定ID，获取最新的结果
    result.value = questionStore.quizHistory[0]
  }
  
  if (!result.value) {
    // 如果没有找到结果，跳转到首页
    router.push('/')
  }
})
</script>