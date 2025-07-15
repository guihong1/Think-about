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
}

// 创建单例实例
const aiService = new AIService()

export default aiService

// 导出AI配置供UI使用
export { AI_CONFIGS }