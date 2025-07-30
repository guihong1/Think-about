// AI服务模块 - 支持多种免费大模型API

/**
 * AI服务配置
 */


const AI_CONFIGS = {
  // OpenAI兼容接口（可以使用免费的代理服务）
  openai: {
    name: 'OpenAI',
    baseURL: 'https://api.openai.com/v1',
    model: 'gpt-3.5-turbo',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer {API_KEY}'
    }
  },
  
  // 阿里云通义千问（提供免费额度）
  qwen: {
    name: '通义千问',
    baseURL: '/api/qwen',
    model: 'qwen-plus',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${import.meta.env.VITE_API_KEY}`
    }
  },
  
  // 百度文心一言（提供免费额度）
  ernie: {
    name: '文心一言',
    baseURL: 'https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop',
    model: 'ernie-bot-turbo',
    headers: {
      'Content-Type': 'application/json'
    }
  },
  
  // 智谱AI（提供免费额度）
  zhipu: {
    name: '智谱AI',
    baseURL: 'https://open.bigmodel.cn/api/paas/v4',
    model: 'glm-4-flash',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer {API_KEY}'
    }
  },
  
  // 本地模拟（用于测试）
  mock: {
    name: '模拟AI',
    baseURL: '',
    model: 'mock',
    headers: {}
  }
}

/**
 * AI服务类
 */
class AIService {
  constructor() {
    this.config = {
      provider: 'mock', // 默认使用模拟AI
      apiKey: '',
      customBaseURL: ''
    }
  }
  
  /**
   * 更新AI配置
   */
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig }
  }
  
  /**
   * 获取当前AI配置
   */
  getCurrentConfig() {
    const providerConfig = AI_CONFIGS[this.config.provider]
    if (!providerConfig) {
      throw new Error(`不支持的AI提供商: ${this.config.provider}`)
    }
    
    return {
      ...providerConfig,
      baseURL: this.config.customBaseURL || providerConfig.baseURL,
      apiKey: this.config.apiKey
    }
  }
  
  /**
   * 构建评估提示词
   */
  buildEvaluationPrompt(questions, answers) {
    const questionAnswerPairs = questions.map((question, index) => {
      const userAnswer = answers[index]?.answer || '未作答'
      return `
题目${index}（第${index + 1}题）：
问题：${question.question}
标准答案：${question.answer}
用户答案：${userAnswer}
题型：${question.type}
`
    }).join('\n')
    
    return `你是一个专业的教育评估AI助手。请对以下答题情况进行详细评估：

${questionAnswerPairs}

请按照以下JSON格式返回评估结果：
{
  "overallScore": 85,
  "overallFeedback": "整体表现良好，对基础概念掌握较好...",
  "questionEvaluations": [
    {
      "questionIndex": 0,
      "score": 90,
      "feedback": "第1题回答准确，表达清晰...",
      "suggestions": ["可以进一步补充...", "建议加强..."]
    },
    {
      "questionIndex": 1,
      "score": 80,
      "feedback": "第2题回答基本正确...",
      "suggestions": ["注意细节...", "可以更深入..."]
    }
  ]
}

评估要求：
1. questionIndex必须从0开始，对应题目0、题目1、题目2...
2. 每道题给出0-100分的评分
3. 提供具体的反馈意见
4. 给出改进建议
5. 计算总体分数（所有题目的平均分）
6. 提供整体学习建议
7. 必须返回有效的JSON格式
8. questionEvaluations数组的长度必须等于题目数量

请确保评估客观、公正、有建设性。`
  }
  
  /**
   * 调用AI API进行评估
   */
  async callAI(prompt) {
    const config = this.getCurrentConfig()
    
    // 模拟AI响应（用于测试）
    if (this.config.provider === 'mock') {
      return this.getMockResponse(prompt)
    }
    
    try {
      let requestBody
      let endpoint
      
      // 根据不同的AI提供商构建请求
      switch (this.config.provider) {
        case 'openai':
        case 'zhipu':
          endpoint = `${config.baseURL}/chat/completions`
          requestBody = {
            model: config.model,
            messages: [
              {
                role: 'user',
                content: prompt
              }
            ],
            temperature: 0.7,
            max_tokens: 2000
          }
          break
          
        case 'qwen':
          endpoint = config.baseURL
          requestBody = {
            model: config.model,
            messages: [
              {
                role: 'user',
                content: prompt
              }
            ],
            temperature: 0.7,
            max_tokens: 2000
          }
          break
          
        case 'ernie':
          endpoint = `${config.baseURL}/chat/completions?access_token=${config.apiKey}`
          requestBody = {
            messages: [
              {
                role: 'user',
                content: prompt
              }
            ],
            temperature: 0.7,
            max_output_tokens: 2000
          }
          break
          
        default:
          throw new Error(`不支持的AI提供商: ${this.config.provider}`)
      }
      
      // 构建请求头
      const headers = { ...config.headers }
      if (headers.Authorization && config.apiKey) {
        headers.Authorization = headers.Authorization.replace('{API_KEY}', config.apiKey)
      }
      
      // 发送请求
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(requestBody)
      })
      
      if (!response.ok) {
        throw new Error(`AI API请求失败: ${response.status} ${response.statusText}`)
      }
      
      const data = await response.json()
      
      // 解析响应
      let content
      switch (this.config.provider) {
        case 'openai':
        case 'zhipu':
          content = data.choices?.[0]?.message?.content
          break
        case 'qwen':
          content = data.choices?.[0]?.message?.content
          break
        case 'ernie':
          content = data.result
          break
      }
      
      if (!content) {
        throw new Error('AI响应格式错误')
      }
      
      return content
      
    } catch (error) {
      console.error('AI API调用失败:', error)
      throw new Error(`AI评估失败: ${error.message}`)
    }
  }
  
  /**
   * 模拟AI响应（用于测试和演示）
   */
  getMockResponse(prompt) {
    // 从提示词中提取题目数量
    const questionMatches = prompt.match(/题目\d+（第\d+题）：/g)
    const questionCount = questionMatches ? questionMatches.length : 1
    
    // 生成模拟评估结果
    const questionEvaluations = Array.from({ length: questionCount }, (_, index) => {
      const score = Math.floor(Math.random() * 40) + 60 // 60-100分
      return {
        questionIndex: index,
        score: score,
        feedback: `第${index + 1}题回答${score >= 80 ? '较好' : score >= 70 ? '一般' : '需要改进'}。${this.getRandomFeedback()}`,
        suggestions: this.getRandomSuggestions()
      }
    })
    
    const overallScore = Math.round(
      questionEvaluations.reduce((sum, evaluation) => sum + evaluation.score, 0) / questionCount
    )
    
    const mockResponse = {
      overallScore: overallScore,
      overallFeedback: this.getOverallFeedback(overallScore),
      questionEvaluations: questionEvaluations
    }
    
    return JSON.stringify(mockResponse)
  }
  
  /**
   * 获取随机反馈
   */
  getRandomFeedback() {
    const feedbacks = [
      '回答思路清晰，逻辑性强。',
      '基本概念掌握较好，但可以更深入。',
      '表达准确，但缺少一些关键要点。',
      '理解正确，建议补充更多细节。',
      '回答完整，展现了良好的理解能力。',
      '概念理解有偏差，需要进一步学习。'
    ]
    return feedbacks[Math.floor(Math.random() * feedbacks.length)]
  }
  
  /**
   * 获取随机建议
   */
  getRandomSuggestions() {
    const suggestions = [
      '建议多阅读相关资料，加深理解',
      '可以通过实例来巩固概念',
      '注意答题的逻辑结构',
      '建议补充更多细节说明',
      '可以从不同角度思考问题',
      '注意关键词的准确使用'
    ]
    
    // 随机选择1-3个建议
    const count = Math.floor(Math.random() * 3) + 1
    const shuffled = [...suggestions].sort(() => 0.5 - Math.random())
    return shuffled.slice(0, count)
  }
  
  /**
   * 获取整体反馈
   */
  getOverallFeedback(score) {
    if (score >= 90) {
      return '优秀！您对知识点的掌握非常扎实，回答准确且完整。继续保持这种学习状态，可以尝试更有挑战性的题目。'
    } else if (score >= 80) {
      return '良好！您的基础知识掌握较好，大部分问题回答正确。建议在细节方面多加注意，提高答题的准确性。'
    } else if (score >= 70) {
      return '中等。您对基本概念有一定理解，但在某些方面还需要加强。建议多做练习，巩固薄弱环节。'
    } else if (score >= 60) {
      return '及格。您的基础还需要进一步夯实，建议系统性地复习相关知识点，多做练习题。'
    } else {
      return '需要加强。建议重新学习相关知识点，可以寻求老师或同学的帮助，制定系统的学习计划。'
    }
  }
  
  /**
   * 解析AI响应为JSON
   */
  parseAIResponse(response) {
    try {
      // 尝试直接解析JSON
      return JSON.parse(response)
    } catch (error) {
      // 如果直接解析失败，尝试提取JSON部分
      const jsonMatch = response.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        try {
          return JSON.parse(jsonMatch[0])
        } catch (e) {
          console.error('JSON解析失败:', e)
        }
      }
      
      // 如果都失败了，返回默认结果
      console.error('AI响应解析失败，使用默认结果')
      return {
        overallScore: 70,
        overallFeedback: 'AI评估暂时不可用，这是一个默认评分。',
        questionEvaluations: []
      }
    }
  }
  
  /**
   * 测试AI连接
   */
  async testConnection() {
    const config = this.getCurrentConfig()
    
    // 模拟AI测试
    if (this.config.provider === 'mock') {
      // 模拟网络延迟
      await new Promise(resolve => setTimeout(resolve, 1000))
      return {
        success: true,
        message: '模拟AI连接测试成功！',
        details: {
          provider: config.name,
          model: config.model,
          latency: '1000ms',
          status: '正常'
        }
      }
    }
    
    try {
      const startTime = Date.now()
      let requestBody
      let endpoint
      
      // 构建测试请求
      const testPrompt = '你好，这是一个连接测试。请简单回复"连接成功"。'
      
      switch (this.config.provider) {
        case 'openai':
        case 'zhipu':
          endpoint = `${config.baseURL}/chat/completions`
          requestBody = {
            model: config.model,
            messages: [{ role: 'user', content: testPrompt }],
            max_tokens: 50,
            temperature: 0.1
          }
          break
          
        case 'qwen':
          endpoint = config.baseURL
          requestBody = {
            model: config.model,
            messages: [{ role: 'user', content: testPrompt }],
            max_tokens: 50,
            temperature: 0.1
          }
          break
          
        case 'ernie':
          endpoint = `${config.baseURL}/chat/completions?access_token=${config.apiKey}`
          requestBody = {
            messages: [{ role: 'user', content: testPrompt }],
            max_output_tokens: 50,
            temperature: 0.1
          }
          break
          
        default:
          throw new Error(`不支持的AI提供商: ${this.config.provider}`)
      }
      
      // 构建请求头
      const headers = { ...config.headers }
      if (headers.Authorization && config.apiKey) {
        headers.Authorization = headers.Authorization.replace('{API_KEY}', config.apiKey)
      }
      
      // 发送测试请求
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(requestBody)
      })
      
      const latency = Date.now() - startTime
      
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`HTTP ${response.status}: ${response.statusText}\n${errorText}`)
      }
      
      const data = await response.json()
      
      // 验证响应格式
      let content
      switch (this.config.provider) {
        case 'openai':
        case 'zhipu':
          content = data.choices?.[0]?.message?.content
          break
        case 'qwen':
          content = data.choices?.[0]?.message?.content
          break
        case 'ernie':
          content = data.result
          break
      }
      
      if (!content) {
        throw new Error('AI响应格式异常，未找到有效内容')
      }
      
      return {
        success: true,
        message: 'AI连接测试成功！',
        details: {
          provider: config.name,
          model: config.model,
          latency: `${latency}ms`,
          status: '正常',
          response: content.substring(0, 100) + (content.length > 100 ? '...' : '')
        }
      }
      
    } catch (error) {
      console.error('AI连接测试失败:', error)
      
      // 分析错误类型
      let errorType = '未知错误'
      let suggestion = '请检查网络连接和配置信息'
      
      if (error.message.includes('401')) {
        errorType = 'API密钥错误'
        suggestion = '请检查API密钥是否正确'
      } else if (error.message.includes('403')) {
        errorType = '权限不足'
        suggestion = '请检查API密钥权限或账户余额'
      } else if (error.message.includes('404')) {
        errorType = 'API地址错误'
        suggestion = '请检查API地址是否正确'
      } else if (error.message.includes('429')) {
        errorType = '请求频率限制'
        suggestion = '请稍后再试，或检查API配额'
      } else if (error.message.includes('500')) {
        errorType = '服务器错误'
        suggestion = 'AI服务暂时不可用，请稍后再试'
      } else if (error.message.includes('NetworkError') || error.message.includes('fetch')) {
        errorType = '网络连接错误'
        suggestion = '请检查网络连接'
      }
      
      return {
        success: false,
        message: `连接测试失败: ${errorType}`,
        details: {
          provider: config.name,
          model: config.model,
          error: error.message,
          suggestion: suggestion
        }
      }
    }
  }

  /**
   * 主要的评估方法
   */
  async evaluateAnswers(questions, answers) {
    try {
      const prompt = this.buildEvaluationPrompt(questions, answers)
      const response = await this.callAI(prompt)
      const evaluation = this.parseAIResponse(response)
      
      // 验证评估结果的完整性
      if (!evaluation.overallScore) {
        evaluation.overallScore = 70
      }
      if (!evaluation.overallFeedback) {
        evaluation.overallFeedback = 'AI评估完成。'
      }
      if (!evaluation.questionEvaluations) {
        evaluation.questionEvaluations = []
      }
      
      return {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        ...evaluation
      }
    } catch (error) {
      console.error('AI评估失败:', error)
      throw error
    }
  }

  /**
   * 提取文档内容
   */
 async extractDocumentContent(files) {
  const contents = []
  const maxFileSize = 10 * 1024 * 1024 // 10MB限制
  
  for (const file of files) {
    try {
      // 检查文件大小
      if (file.size > maxFileSize) {
        console.warn(`文件 ${file.name} 过大 (${(file.size / 1024 / 1024).toFixed(2)}MB)，跳过处理`)
        continue
      }
      
      const extension = file.name.toLowerCase().split('.').pop()
      let content = ''
      
      switch (extension) {
        case 'txt':
          content = await this.readTextFile(file)
          break
        case 'doc':
        case 'docx':
          content = await this.readWordFile(file)
          break
        case 'pdf':
          content = await this.readPdfFile(file)
          break
        default:
          console.warn(`不支持的文件格式: ${extension}`)
          continue
      }
      
      // 只有当内容不为空且不是错误信息时才添加
      if (content && content.trim() && !content.startsWith('Word文件解析失败') && !content.startsWith('PDF文件解析失败')) {
        contents.push({
          filename: file.name,
          content: content.trim(),
          size: file.size,
          type: extension
        })
      } else {
        console.warn(`文件 ${file.name} 解析结果为空或失败`)
      }
    } catch (error) {
      console.error(`读取文件 ${file.name} 失败:`, error)
    }
  }
  
  return contents
}

  /**
   * 读取文本文件
   */
  async readTextFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => resolve(e.target.result)
      reader.onerror = (e) => reject(e)
      reader.readAsText(file, 'UTF-8')
    })
  }

  /**
 * 读取Word文件
 */
async readWordFile(file) {
  try {
    // 动态导入mammoth库
    const mammoth = await import('mammoth')
    
    // 将文件转换为ArrayBuffer
    const arrayBuffer = await file.arrayBuffer()
    
    // 解析Word文档，提取纯文本
    const result = await mammoth.extractRawText({ arrayBuffer })
    
    // 检查是否有警告信息
    if (result.messages && result.messages.length > 0) {
      console.warn('Word解析警告:', result.messages)
    }
    
    return result.value || ''
  } catch (error) {
    console.error('Word文件解析失败:', error)
    // 返回错误信息而不是抛出异常，保持原有的错误处理逻辑
    return `Word文件解析失败: ${error.message}`
  }
}

/**
* 读取PDF文件（简化版，实际需要专门的库）
*/

async readPdfFile(file) {

// 这里是简化实现，实际应用中需要使用pdf.js等库

console.warn('PDF文件解析功能需要额外的库支持')

return `PDF文件内容提取功能开发中... 文件名: ${file.name}`

}
  /**
   * 构建题目生成提示词
   */
  buildQuestionGenerationPrompt(documentContents, questionConfig) {
    const { selectedTypes, questionCounts, difficulty } = questionConfig
    
    const typeRequests = selectedTypes.map(type => {
      const typeLabels = {
        choice: '选择题',
        fill: '填空题',
        essay: '问答题',
        judge: '判断题'
      }
      return `${typeLabels[type] || type}: ${questionCounts[type]}道`
    }).join('，')
    
    const documentText = documentContents.map(doc => 
      `文件：${doc.filename}\n内容：${doc.content}`
    ).join('\n\n')
    
    return `你是一个专业的教育题目生成AI助手。请根据以下学习资料生成高质量的题库：

学习资料：
${documentText}

生成要求：
1. 题目类型和数量：${typeRequests}
2. 难度分布：简单${difficulty.easy}%，中等${difficulty.medium}%，困难${difficulty.hard}%
3. 题目必须基于提供的学习资料内容
4. 确保题目质量高，覆盖资料的核心知识点
5. 选择题需要提供4个选项（A、B、C、D）
6. 填空题用___表示空白处
7. 问答题要求答案详细完整
8. 判断题答案为"正确"或"错误"

请按照以下JSON格式返回生成的题目：
{
  "questions": [
    {
      "question": "题目内容",
      "answer": "标准答案",
      "type": "choice|fill|essay|judge",
      "difficulty": "easy|medium|hard",
      "options": ["A. 选项1", "B. 选项2", "C. 选项3", "D. 选项4"] // 仅选择题需要
    }
  ]
}

注意：
- 必须返回有效的JSON格式
- questions数组长度必须等于要求的题目总数
- 每道题目都要有完整的信息
- 难度分布要符合要求的百分比`
  }

  /**
   * 生成题目
   */
  async generateQuestions(files, questionConfig) {
    try {
      // 提取文档内容
      const documentContents = await this.extractDocumentContent(files)
      
      if (documentContents.length === 0) {
        throw new Error('无法提取文档内容')
      }
      
      // 构建生成提示词
      const prompt = this.buildQuestionGenerationPrompt(documentContents, questionConfig)
      
      // 调用AI生成题目
      const response = await this.callAI(prompt)
      const result = this.parseQuestionGenerationResponse(response)
      
      return result.questions || []
    } catch (error) {
      console.error('题目生成失败:', error)
      throw error
    }
  }

  /**
   * 解析题目生成响应
   */
  parseQuestionGenerationResponse(response) {
    try {
      // 尝试直接解析JSON
      return JSON.parse(response)
    } catch (error) {
      // 如果直接解析失败，尝试提取JSON部分
      const jsonMatch = response.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        try {
          return JSON.parse(jsonMatch[0])
        } catch (e) {
          console.error('JSON解析失败:', e)
        }
      }
      
      // 如果都失败了，返回空结果
      console.error('题目生成响应解析失败')
      return { questions: [] }
    }
  }

  /**
   * 生成模拟题目（用于测试）
   */
  generateMockQuestions(questionConfig) {
    const { selectedTypes, questionCounts, difficulty } = questionConfig
    const questions = []
    
    selectedTypes.forEach(type => {
      const count = questionCounts[type] || 0
      for (let i = 0; i < count; i++) {
        const difficultyLevel = this.getDifficultyForIndex(i, count, difficulty)
        questions.push(this.createMockQuestion(type, difficultyLevel, i + 1))
      }
    })
    
    return questions
  }

  /**
   * 根据索引分配难度
   */
  getDifficultyForIndex(index, total, difficultyConfig) {
    const ratio = index / total
    if (ratio < difficultyConfig.easy / 100) return 'easy'
    if (ratio < (difficultyConfig.easy + difficultyConfig.medium) / 100) return 'medium'
    return 'hard'
  }

  /**
   * 创建模拟题目
   */
  createMockQuestion(type, difficulty, index) {
    const typeLabels = {
      choice: '选择题',
      fill: '填空题',
      essay: '问答题',
      judge: '判断题'
    }
    
    const difficultyLabels = {
      easy: '简单',
      medium: '中等',
      hard: '困难'
    }
    
    const question = {
      question: `这是一道${difficultyLabels[difficulty]}的${typeLabels[type]}示例 ${index}`,
      type: type,
      difficulty: difficulty
    }
    
    // 根据题型设置不同的答案和选项
    switch (type) {
      case 'choice':
        question.options = [
          'A. 第一个选项',
          'B. 第二个选项',
          'C. 第三个选项',
          'D. 第四个选项'
        ]
        question.answer = 'A' // 选择题答案为选项字母
        break
        
      case 'judge':
        question.answer = Math.random() > 0.5 ? '正确' : '错误'
        break
        
      case 'fill':
        question.question = `请填空：这是一道${difficultyLabels[difficulty]}的填空题，空白处应该填入___。`
        question.answer = '答案'
        break
        
      case 'essay':
      default:
        question.answer = `这是一道${difficultyLabels[difficulty]}问答题的详细答案内容。答案应该包含关键要点和详细解释。`
        break
    }
    
    return question
  }
}

// 创建单例实例
const aiService = new AIService()

export default aiService

// 导出AI配置供UI使用
export { AI_CONFIGS }