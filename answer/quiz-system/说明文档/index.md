## 状态管理模块（Pinia Store）

这个模块是整个答题系统的核心状态管理中心，使用Pinia作为状态管理库，负责管理题库数据、答题会话、AI配置等全局状态。文件中定义了两个主要的store：`useQuestionStore`（题库管理）和`useAIStore`（AI服务管理）。

### 技术栈说明

使用Pinia作为Vue 3的官方状态管理库，相比Vuex具有更好的TypeScript支持、更简洁的API和更好的开发体验。两个store都配置了持久化存储，确保数据在页面刷新后不会丢失。

## useQuestionStore - 题库管理Store

这是系统的主要数据管理中心，负责处理所有与题库、答题相关的状态和操作。

### State 状态数据

#### 核心数据结构
- **questionBanks**：题库数组，存储所有导入的题库数据
  - 每个题库包含：id、name、description、questions、createdAt
- **currentBank**：当前选中的题库对象，用于答题和管理
- **currentQuiz**：当前答题会话对象，包含答题进度和答案
- **quizHistory**：答题历史记录数组，存储所有完成的答题结果

### Getters 计算属性

#### bankNames
返回所有题库的名称数组，用于题库选择下拉框等UI组件。
实现逻辑：`state.questionBanks.map(bank => bank.name)`

#### currentBankQuestionCount
获取当前选中题库的题目总数，用于统计显示。
实现逻辑：检查currentBank是否存在，存在则返回questions.length，否则返回0。

#### currentBankTypes
获取当前题库支持的所有题型，用于题型筛选功能。
实现逻辑：
1. 遍历当前题库的所有题目
2. 使用Set去重收集所有题型
3. 转换为数组返回

### Actions 操作方法

#### addQuestionBank(bank)
添加新题库到系统中，这是导入功能的核心方法。

**参数处理**：
- bank：包含name、description、questions的题库对象

**处理逻辑**：
1. 生成唯一ID（使用时间戳）
2. 补充默认描述（如果没有提供）
3. 添加创建时间戳
4. 推入questionBanks数组

**数据结构**：
```javascript
{
  id: Date.now(),
  name: bank.name,
  description: bank.description || '',
  questions: bank.questions,
  createdAt: new Date().toISOString()
}
```

#### selectBank(bankId)
选择指定的题库作为当前操作对象。

**实现逻辑**：
通过bankId在questionBanks数组中查找对应的题库，设置为currentBank。
这个方法是答题流程的第一步，必须先选择题库才能开始答题。

#### startQuiz(config)
开始答题会话，这是答题流程的核心方法。

**参数配置**：
- questionCount：题目数量
- questionTypes：题型筛选数组
- mode：答题模式（practice/exam等）

**处理流程**：
1. **前置检查**：验证currentBank是否存在，不存在则返回null
2. **题目筛选**：根据questionTypes过滤可用题目
3. **随机选择**：使用洗牌算法随机排序，然后截取指定数量的题目
4. **创建会话**：生成currentQuiz对象

**会话对象结构**：
```javascript
{
  id: Date.now(),
  bankId: this.currentBank.id,
  bankName: this.currentBank.name,
  questions: selectedQuestions,
  answers: {},
  startTime: new Date().toISOString(),
  mode: mode || 'practice'
}
```

#### saveAnswer(questionIndex, answer)
保存用户对指定题目的答案。

**参数说明**：
- questionIndex：题目在当前答题会话中的索引
- answer：用户的答案内容

**存储结构**：
答案存储在currentQuiz.answers对象中，以题目索引为键：
```javascript
{
  answer: answer,
  timestamp: new Date().toISOString()
}
```

这种设计允许追踪每个答案的提交时间，为后续分析提供数据支持。

#### finishQuiz(aiEvaluation)
完成答题会话并保存到历史记录。

**参数说明**：
- aiEvaluation：AI评估结果对象

**处理流程**：
1. **前置检查**：验证currentQuiz是否存在
2. **结果构建**：合并答题数据和AI评估结果
3. **历史保存**：将结果添加到quizHistory数组开头（最新的在前）
4. **会话清理**：清空currentQuiz
5. **返回结果**：返回完整的答题结果对象

**结果对象结构**：
```javascript
{
  ...this.currentQuiz,
  endTime: new Date().toISOString(),
  aiEvaluation: aiEvaluation,
  score: aiEvaluation?.overallScore || 0
}
```

#### deleteBank(bankId)
删除指定的题库。

**处理逻辑**：
1. 从questionBanks数组中过滤掉指定ID的题库
2. 如果删除的是当前选中的题库，将currentBank设置为null

这个方法确保了数据的一致性，避免引用已删除的题库。

### 持久化配置

使用Pinia的persist插件实现数据持久化：
```javascript
persist: {
  key: 'quiz-system-store',
  storage: localStorage
}
```

这确保了用户的题库数据和答题历史在浏览器关闭后仍然保留。

## useAIStore - AI服务管理Store

这个store专门负责管理AI相关的配置和评估功能。

### State 状态数据

#### config - AI配置对象
存储AI服务的配置信息：
- **provider**：AI提供商（'mock'、'openai'、'qianwen'等）
- **apiKey**：API密钥
- **customBaseURL**：自定义API基础URL

默认使用'mock'模式，便于开发和测试。

#### evaluationHistory
存储AI评估的历史记录，用于分析和回顾。

### Actions 操作方法

#### updateConfig(newConfig)
更新AI配置的异步方法。

**处理流程**：
1. **配置合并**：使用展开运算符合并新配置到现有配置
2. **服务同步**：动态导入aiService模块
3. **配置更新**：调用aiService.updateConfig同步配置

**异步导入的优势**：
使用动态导入避免循环依赖问题，只在需要时加载AI服务模块。

#### evaluateAnswers(questions, answers)
执行AI评估的核心方法。

**参数说明**：
- questions：题目数组
- answers：用户答案对象

**处理流程**：
1. **服务导入**：动态导入aiService模块
2. **配置同步**：确保AI服务使用最新配置
3. **评估调用**：调用aiService.evaluateAnswers进行评估
4. **历史保存**：将评估结果保存到evaluationHistory
5. **错误处理**：捕获并重新抛出错误，便于上层处理

**错误处理机制**：
```javascript
try {
  // 评估逻辑
} catch (error) {
  console.error('AI评估失败:', error)
  throw error
}
```

### 持久化配置

使用独立的存储键：
```javascript
persist: {
  key: 'quiz-ai-store',
  storage: localStorage
}
```

将AI配置与题库数据分开存储，便于管理和维护。

## 设计模式和最佳实践

### 1. 单一职责原则
- useQuestionStore专注于题库和答题管理
- useAIStore专注于AI服务配置和评估

### 2. 数据不可变性
使用展开运算符和数组方法确保状态更新的不可变性：
```javascript
this.config = { ...this.config, ...newConfig }
this.questionBanks = this.questionBanks.filter(bank => bank.id !== bankId)
```

### 3. 错误处理
在关键操作中添加前置检查和错误处理，提高系统稳定性。

### 4. 时间戳管理
统一使用ISO字符串格式记录时间，便于排序和显示。

### 5. 动态导入
使用动态导入避免循环依赖，提高模块加载性能。

## 数据流向图

```
用户操作 → Actions → State 更新 → Getters 计算 → 组件响应
    ↓
持久化存储 ← localStorage ← Persist 插件
```

## 扩展建议

1. **类型安全**：添加TypeScript类型定义
2. **数据验证**：在Actions中添加参数验证
3. **性能优化**：对大量数据使用分页或虚拟滚动
4. **缓存策略**：为AI评估结果添加缓存机制
5. **状态重置**：添加重置store状态的方法

*这个状态管理模块是整个答题系统的数据中枢，通过合理的设计和持久化机制，确保了用户数据的安全性和系统的稳定性。*