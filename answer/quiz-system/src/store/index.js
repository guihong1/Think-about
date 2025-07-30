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

// 题目生成临时状态store
export const useImportStore = defineStore('import', {
  state: () => ({
    // 当前步骤
    currentStep: 1,
    // 上传的文件
    uploadedFiles: [],
    // 题库基本信息
    bankName: '',
    bankDescription: '',
    // 选中的题目类型
    selectedTypes: ['choice'],
    // 题目数量配置
    questionCounts: {
      choice: 5,
      fill: 3,
      essay: 2,
      judge: 3
    },
    // 难度分布
    difficulty: {
      easy: 40,
      medium: 40,
      hard: 20
    },
    // 生成的题目
    generatedQuestions: [],
    // 是否有临时状态
    hasTempState: false,
    // 生成状态管理
    generationState: {
      isGenerating: false,
      progress: '',
      startTime: null,
      generationId: null
    }
  }),
  
  actions: {
    // 保存临时状态
    saveTempState(state) {
      this.currentStep = state.currentStep || 1
      this.uploadedFiles = state.uploadedFiles || []
      this.bankName = state.bankName || ''
      this.bankDescription = state.bankDescription || ''
      this.selectedTypes = state.selectedTypes || ['choice']
      this.questionCounts = state.questionCounts || {
        choice: 5,
        fill: 3,
        essay: 2,
        judge: 3
      }
      this.difficulty = state.difficulty || {
        easy: 40,
        medium: 40,
        hard: 20
      }
      this.generatedQuestions = state.generatedQuestions || []
      
      // 保存生成状态（如果提供）
      if (state.generationState) {
        this.generationState = { ...state.generationState }
      }
      
      // 只有在真正有有效数据时才标记为有临时状态
      this.hasTempState = this.hasValidTempData()
    },
    
    // 清空临时状态
    clearTempState() {
      this.currentStep = 1
      this.uploadedFiles = []
      this.bankName = ''
      this.bankDescription = ''
      this.selectedTypes = ['choice']
      this.questionCounts = {
        choice: 5,
        fill: 3,
        essay: 2,
        judge: 3
      }
      this.difficulty = {
        easy: 40,
        medium: 40,
        hard: 20
      }
      this.generatedQuestions = []
      this.hasTempState = false
      // 重置生成状态
      this.generationState = {
        isGenerating: false,
        progress: '',
        startTime: null,
        generationId: null
      }
    },
    
    // 获取当前状态
    getCurrentState() {
      return {
        currentStep: this.currentStep,
        uploadedFiles: this.uploadedFiles,
        bankName: this.bankName,
        bankDescription: this.bankDescription,
        selectedTypes: this.selectedTypes,
        questionCounts: this.questionCounts,
        difficulty: this.difficulty,
        generatedQuestions: this.generatedQuestions
      }
    },
    
    // 检查是否有有效的临时数据
    hasValidTempData() {
      // 如果有上传的文件，或者有自定义的题库名称，或者步骤不是1，或者有生成的题目，则认为有有效数据
      return this.uploadedFiles.length > 0 || 
             this.bankName.trim() !== '' || 
             this.currentStep > 1 || 
             this.generatedQuestions.length > 0
    },
    
    // 开始生成
    startGeneration(config) {
      const generationId = Date.now().toString()
      this.generationState = {
        isGenerating: true,
        progress: '正在分析上传的资料...',
        startTime: new Date().toISOString(),
        generationId: generationId
      }
      return generationId
    },
    
    // 更新生成进度
    updateGenerationProgress(progress) {
      if (this.generationState.isGenerating) {
        this.generationState.progress = progress
      }
    },
    
    // 完成生成
    completeGeneration(questions) {
      this.generatedQuestions = questions || []
      this.generationState = {
        isGenerating: false,
        progress: '题目生成完成！',
        startTime: null,
        generationId: null
      }
    },
    
    // 生成失败
    failGeneration(error) {
      this.generationState = {
        isGenerating: false,
        progress: `生成失败：${error}`,
        startTime: null,
        generationId: null
      }
    }
  },
  
  persist: {
    key: 'quiz-import-store',
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