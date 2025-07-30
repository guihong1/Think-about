import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: () => import('../views/Home.vue')
    },
    {
      path: '/import',
      name: 'Import',
      component: () => import('../views/Import.vue')
    },
    {
      path: '/quiz',
      name: 'Quiz',
      component: () => import('../views/Quiz.vue')
    },
    {
      path: '/quiz/result',
      name: 'QuizResult',
      component: () => import('../views/QuizResult.vue')
    },
    {
      path: '/history',
      name: 'History',
      component: () => import('../views/History.vue')
    },
    {
      path: '/settings',
      name: 'Settings',
      component: () => import('../views/Settings.vue')
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: () => import('../views/NotFound.vue')
    }
  ]
})

export default router