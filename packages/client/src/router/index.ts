import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useUserStore } from '@/stores/user'

// Route definitions
const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { requiresGuest: true }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/Register.vue'),
    meta: { requiresGuest: true }
  },
  {
    path: '/',
    component: () => import('@/layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        redirect: '/home'
      },
      {
        path: 'home',
        name: 'Home',
        component: () => import('@/views/Home.vue')
      },
      {
        path: 'library/:id?',
        name: 'Library',
        component: () => import('@/views/page/PageContent.vue')
      },
      {
        path: 'page/:id',
        name: 'Page',
        component: () => import('@/views/page/PageContent.vue')
      },
      {
        path: 'editor-test',
        name: 'EditorTest',
        component: () => import('@/views/EditorTest.vue')
      }
    ]
  },
  {
    path: '/public',
    component: () => import('@/layouts/PublicLayout.vue'),
    children: [
      {
        path: 'pages/:slug',
        name: 'PublicPage',
        component: () => import('@/views/public/PublicPage.vue')
      },
      {
        path: 'libraries/:slug',
        name: 'PublicLibrary',
        component: () => import('@/views/public/PublicPage.vue')
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFound.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation guards
router.beforeEach(async (to, _from, next) => {
  const userStore = useUserStore()
  
  // Check if authentication is required
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const requiresGuest = to.matched.some(record => record.meta.requiresGuest)
  
  // If user is authenticated
  if (userStore.isAuthenticated) {
    // Try to fetch profile if we don't have user data
    if (!userStore.user) {
      const result = await userStore.fetchProfile()
      if (!result.success) {
        // Token invalid, redirect to login
        if (requiresAuth) {
          next({ name: 'Login', query: { redirect: to.fullPath } })
          return
        }
      }
    }
    
    // If trying to access guest-only pages, redirect to home
    if (requiresGuest) {
      next({ name: 'Home' })
      return
    }
    
    next()
    return
  }
  
  // If user is not authenticated
  if (requiresAuth) {
    // Redirect to login with return URL
    next({ name: 'Login', query: { redirect: to.fullPath } })
    return
  }
  
  next()
})

export default router