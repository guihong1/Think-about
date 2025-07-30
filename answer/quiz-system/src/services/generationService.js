import aiService from './aiService'
import { useImportStore, useAIStore } from '../store'

class GenerationService {
  constructor() {
    this.activeGenerations = new Map() // 存储活跃的生成任务
  }

  // 开始生成题库
  async startGeneration(uploadedFiles, questionConfig) {
    const importStore = useImportStore()
    const aiStore = useAIStore()
    
    // 检查是否已有生成任务在进行
    if (importStore.generationState.isGenerating) {
      console.log('已有生成任务在进行中')
      return importStore.generationState.generationId
    }
    
    // 开始新的生成任务
    const generationId = importStore.startGeneration(questionConfig)
    
    // 创建生成任务
    const generationTask = this.createGenerationTask(
      generationId,
      uploadedFiles,
      questionConfig,
      aiStore.config
    )
    
    // 存储任务引用
    this.activeGenerations.set(generationId, generationTask)
    
    // 开始执行任务（不等待完成）
    this.executeGeneration(generationTask)
    
    return generationId
  }
  
  // 创建生成任务
  createGenerationTask(generationId, uploadedFiles, questionConfig, aiConfig) {
    return {
      id: generationId,
      uploadedFiles,
      questionConfig,
      aiConfig,
      startTime: Date.now(),
      cancelled: false
    }
  }
  
  // 执行生成任务
  async executeGeneration(task) {
    const importStore = useImportStore()
    
    try {
      // 检查任务是否被取消
      if (task.cancelled) {
        return
      }
      
      // 更新进度：提取文档内容
      importStore.updateGenerationProgress('正在提取文档内容...')
      await this.delay(500)
      
      if (task.cancelled) return
      
      // 检查AI配置
      if (task.aiConfig.provider === 'mock') {
        // 使用模拟生成
        importStore.updateGenerationProgress('正在生成题目（模拟模式）...')
        await this.delay(1500)
        
        if (task.cancelled) return
        
        const questions = aiService.generateMockQuestions(task.questionConfig)
        importStore.completeGeneration(questions)
      } else {
        // 使用真实AI生成
        importStore.updateGenerationProgress('正在调用AI生成题目...')
        
        // 更新AI服务配置
        aiService.updateConfig(task.aiConfig)
        
        if (task.cancelled) return
        
        // 调用AI生成题目
        const questions = await aiService.generateQuestions(
          task.uploadedFiles,
          task.questionConfig
        )
        
        if (task.cancelled) return
        
        if (questions.length === 0) {
          throw new Error('AI未能生成任何题目，请检查文档内容或重试')
        }
        
        importStore.completeGeneration(questions)
      }
      
      // 任务完成，从活跃任务中移除
      this.activeGenerations.delete(task.id)
      
    } catch (error) {
      console.error('生成题库失败:', error)
      importStore.failGeneration(error.message)
      
      // 任务失败，从活跃任务中移除
      this.activeGenerations.delete(task.id)
    }
  }
  
  // 取消生成任务
  cancelGeneration(generationId) {
    const task = this.activeGenerations.get(generationId)
    if (task) {
      task.cancelled = true
      this.activeGenerations.delete(generationId)
      
      const importStore = useImportStore()
      importStore.failGeneration('用户取消生成')
    }
  }
  
  // 获取生成状态
  getGenerationStatus(generationId) {
    const importStore = useImportStore()
    return {
      isGenerating: importStore.generationState.isGenerating,
      progress: importStore.generationState.progress,
      generationId: importStore.generationState.generationId,
      hasActiveTask: this.activeGenerations.has(generationId)
    }
  }
  
  // 检查是否有活跃的生成任务
  hasActiveGeneration() {
    const importStore = useImportStore()
    return importStore.generationState.isGenerating || this.activeGenerations.size > 0
  }
  
  // 延迟函数
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
  
  // 清理所有任务
  cleanup() {
    for (const [id, task] of this.activeGenerations) {
      task.cancelled = true
    }
    this.activeGenerations.clear()
  }
}

// 创建单例实例
const generationService = new GenerationService()

// 页面卸载时清理任务
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    generationService.cleanup()
  })
}

export default generationService