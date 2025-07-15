import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Import from '../views/Import.vue'
import Quiz from '../views/Quiz.vue'
import History from '../views/History.vue'
import QuizResult from '../views/QuizResult.vue'
import Settings from '../views/Settings.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: Home
    },
    {
      path: '/import',
      name: 'Import',
      component: Import
    },
    {
      path: '/quiz',
      name: 'Quiz',
      component: Quiz
    },
    {
      path: '/quiz/result',
      name: 'QuizResult',
      component: QuizResult
    },
    {
      path: '/history',
      name: 'History',
      component: History
    },
    {
      path: '/settings',
      name: 'Settings',
      component: Settings
    }
  ]
})

export default router