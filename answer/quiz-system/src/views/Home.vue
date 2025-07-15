<template>
  <div class="space-y-8">
    <!-- 欢迎区域 -->
    <div class="text-center">
      <h1 class="text-4xl font-bold text-gray-900 mb-4">
        智能答题系统
      </h1>
      <p class="text-xl text-gray-600 max-w-2xl mx-auto">
        导入您的学习资料，通过AI智能评估提升学习效果
      </p>
    </div>

    <!-- 功能卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <!-- 导入题库 -->
      <div class="card hover:shadow-lg transition-shadow duration-200">
        <div class="flex items-center mb-4">
          <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
            <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
            </svg>
          </div>
          <h3 class="text-lg font-semibold text-gray-900">导入题库</h3>
        </div>
        <p class="text-gray-600 mb-4">
          支持文本文件导入，自动解析问题和答案
        </p>
        <router-link to="/import" class="btn-primary inline-block">
          开始导入
        </router-link>
      </div>

      <!-- 开始答题 -->
      <div class="card hover:shadow-lg transition-shadow duration-200">
        <div class="flex items-center mb-4">
          <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
            <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <h3 class="text-lg font-semibold text-gray-900">开始答题</h3>
        </div>
        <p class="text-gray-600 mb-4">
          选择题库和题型，开始智能答题训练
        </p>
        <router-link 
          to="/quiz" 
          class="btn-primary inline-block"
          :class="{ 'opacity-50 cursor-not-allowed': questionStore.questionBanks.length === 0 }"
        >
          开始答题
        </router-link>
      </div>

      <!-- 答题记录 -->
      <div class="card hover:shadow-lg transition-shadow duration-200">
        <div class="flex items-center mb-4">
          <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
            <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
            </svg>
          </div>
          <h3 class="text-lg font-semibold text-gray-900">答题记录</h3>
        </div>
        <p class="text-gray-600 mb-4">
          查看历史答题记录和AI评估结果
        </p>
        <router-link to="/history" class="btn-primary inline-block">
          查看记录
        </router-link>
      </div>
    </div>

    <!-- 统计信息 -->
    <div class="bg-white rounded-lg shadow-md border border-gray-200 p-6">
      <h2 class="text-2xl font-bold text-gray-900 mb-6">系统概览</h2>
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div class="text-center">
          <div class="text-3xl font-bold text-blue-600 mb-2">
            {{ questionStore.questionBanks.length }}
          </div>
          <div class="text-gray-600">题库数量</div>
        </div>
        <div class="text-center">
          <div class="text-3xl font-bold text-green-600 mb-2">
            {{ totalQuestions }}
          </div>
          <div class="text-gray-600">总题目数</div>
        </div>
        <div class="text-center">
          <div class="text-3xl font-bold text-purple-600 mb-2">
            {{ questionStore.quizHistory.length }}
          </div>
          <div class="text-gray-600">答题次数</div>
        </div>
        <div class="text-center">
          <div class="text-3xl font-bold text-orange-600 mb-2">
            {{ averageScore }}%
          </div>
          <div class="text-gray-600">平均分数</div>
        </div>
      </div>
    </div>

    <!-- 最近答题记录 -->
    <div v-if="questionStore.quizHistory.length > 0" class="bg-white rounded-lg shadow-md border border-gray-200 p-6">
      <h2 class="text-2xl font-bold text-gray-900 mb-6">最近答题</h2>
      <div class="space-y-4">
        <div 
          v-for="quiz in recentQuizzes" 
          :key="quiz.id"
          class="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
        >
          <div>
            <h3 class="font-medium text-gray-900">{{ quiz.bankName }}</h3>
            <p class="text-sm text-gray-600">
              {{ quiz.questions.length }} 道题 • {{ formatDate(quiz.endTime) }}
            </p>
          </div>
          <div class="text-right">
            <div class="text-lg font-bold" :class="getScoreColor(quiz.score)">
              {{ quiz.score }}分
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useQuestionStore } from '../store'

const questionStore = useQuestionStore()

// 计算总题目数
const totalQuestions = computed(() => {
  return questionStore.questionBanks.reduce((total, bank) => {
    return total + bank.questions.length
  }, 0)
})

// 计算平均分数
const averageScore = computed(() => {
  if (questionStore.quizHistory.length === 0) return 0
  const total = questionStore.quizHistory.reduce((sum, quiz) => sum + quiz.score, 0)
  return Math.round(total / questionStore.quizHistory.length)
})

// 最近的答题记录
const recentQuizzes = computed(() => {
  return questionStore.quizHistory.slice(0, 5)
})

// 格式化日期
const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 根据分数获取颜色
const getScoreColor = (score) => {
  if (score >= 90) return 'text-green-600'
  if (score >= 70) return 'text-blue-600'
  if (score >= 60) return 'text-yellow-600'
  return 'text-red-600'
}
</script>