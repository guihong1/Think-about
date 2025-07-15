import { defineStore } from 'pinia'

// 题库管理store
export const useQuestionStore = defineStore('questions', {
  state: () => ({
    // 题库数据
    questionBanks: [],
    // 当前选中的题库
    currentBank: null,
    // 当前答题会话
    currentQuiz: null,
    // 答题历史
    quizHistory: []
  }),
  
  getters: {
    // 获取所有题库名称
    bankNames: (state) => state.questionBanks.map(bank => bank.name),
    
    // 获取当前题库的题目数量
    currentBankQuestionCount: (state) => {
      return state.currentBank ? state.currentBank.questions.length : 0
    },
    
    // 获取当前题库支持的题型
    currentBankTypes: (state) => {
      if (!state.currentBank) return []
      const types = new Set()
      state.currentBank.questions.forEach(q => types.add(q.type))
      return Array.from(types)
    }
  },
  
  actions: {
    // 添加题库
    addQuestionBank(bank) {
      this.questionBanks.push({
        id: Date.now(),
        name: bank.name,
        description: bank.description || '',
        questions: bank.questions,
        createdAt: new Date().toISOString()
      })
    },
    
    // 选择题库
    selectBank(bankId) {
      this.currentBank = this.questionBanks.find(bank => bank.id === bankId)
    },
    
    // 开始答题
    startQuiz(config) {
      if (!this.currentBank) return null
      
      const { questionCount, questionTypes, mode } = config
      let availableQuestions = this.currentBank.questions
      
      // 按题型筛选
      if (questionTypes && questionTypes.length > 0) {
        availableQuestions = availableQuestions.filter(q => questionTypes.includes(q.type))
      }
      
      // 随机选择题目
      const shuffled = [...availableQuestions].sort(() => 0.5 - Math.random())
      const selectedQuestions = shuffled.slice(0, Math.min(questionCount, shuffled.length))
      
      this.currentQuiz = {
        id: Date.now(),
        bankId: this.currentBank.id,
        bankName: this.currentBank.name,
        questions: selectedQuestions,
        answers: {},
        startTime: new Date().toISOString(),
        mode: mode || 'practice'
      }
      
      return this.currentQuiz
    },
    
    // 保存答案
    saveAnswer(questionIndex, answer) {
      if (this.currentQuiz) {
        this.currentQuiz.answers[questionIndex] = {
          answer: answer,
          timestamp: new Date().toISOString()
        }
      }
    },
    
    // 完成答题
    finishQuiz(aiEvaluation) {
      if (!this.currentQuiz) return null
      
      const result = {
        ...this.currentQuiz,
        endTime: new Date().toISOString(),
        aiEvaluation: aiEvaluation,
        score: aiEvaluation?.overallScore || 0
      }
      
      this.quizHistory.unshift(result)
      this.currentQuiz = null
      
      return result
    },
    
    // 删除题库
    deleteBank(bankId) {
      this.questionBanks = this.questionBanks.filter(bank => bank.id !== bankId)
      if (this.currentBank && this.currentBank.id === bankId) {
        this.currentBank = null
      }
    }
  },
  
  // 持久化存储
  persist: {
    key: 'quiz-system-store',
    storage: localStorage
  }
})

// AI服务store
export const useAIStore = defineStore('ai', {
  state: () => ({
    // AI配置
    config: {
      provider: 'mock', // 默认使用模拟AI
      apiKey: '',
      customBaseURL: ''
    },
    // 评估历史
    evaluationHistory: []
  }),
  
  actions: {
    // 更新AI配置
    async updateConfig(newConfig) {
      this.config = { ...this.config, ...newConfig }
      // 同步更新AI服务配置
      const { default: aiService } = await import('../services/aiService')
      aiService.updateConfig(this.config)
    },
    
    // AI评估答案
    async evaluateAnswers(questions, answers) {
      try {
        // 导入AI服务
        const { default: aiService } = await import('../services/aiService')
        
        // 更新AI服务配置
        aiService.updateConfig(this.config)
        
        // 调用AI评估
        const evaluation = await aiService.evaluateAnswers(questions, answers)
        
        this.evaluationHistory.unshift(evaluation)
        return evaluation
      } catch (error) {
        console.error('AI评估失败:', error)
        throw error
      }
    }
  },
  
  persist: {
    key: 'quiz-ai-store',
    storage: localStorage
  }
})