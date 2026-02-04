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
    path: '/forget-password',
    name: 'ForgetPassword',
    component: () => import('@/views/ForgetPassword.vue'),
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
      }
    ]
  },
  {
    path: '/settings',
    component: () => import('@/views/settings/SettingsLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        redirect: 'profile'
      },
      {
        path: 'profile',
        name: 'SettingsProfile',
        component: () => import('@/views/settings/ProfileSettings.vue'),
        meta: { title: 'Account Information' }
      },
      {
        path: 'security',
        name: 'SettingsSecurity',
        component: () => import('@/views/settings/SettingsPlaceholder.vue'),
        meta: { title: 'Password & Security' }
      },
      {
        path: 'libraries',
        name: 'SettingsLibraries',
        component: () => import('@/views/settings/SettingsPlaceholder.vue'),
        meta: { title: 'Libraries' }
      },
      {
        path: 'pages',
        name: 'SettingsPages',
        component: () => import('@/views/settings/SettingsPlaceholder.vue'),
        meta: { title: 'Pages' }
      },
      {
        path: 'archived',
        name: 'SettingsArchived',
        component: () => import('@/views/settings/SettingsPlaceholder.vue'),
        meta: { title: 'Archived' }
      },
      {
        path: 'assets',
        name: 'SettingsAssets',
        component: () => import('@/views/settings/ImageResources.vue'),
        meta: { title: 'Image Resources' }
      },
      {
        path: 'templates',
        name: 'SettingsTemplates',
        component: () => import('@/views/settings/SettingsPlaceholder.vue'),
        meta: { title: 'Templates' }
      },
      {
        path: 'site-info',
        name: 'SettingsSiteInfo',
        component: () => import('@/views/settings/SiteInfoSettings.vue'),
        meta: { title: 'Site Information' }
      },
      {
        path: 'smtp',
        name: 'SettingsSmtp',
        component: () => import('@/views/settings/SmtpSettings.vue'),
        meta: { title: 'SMTP Configuration' }
      },
      {
        path: 'access',
        name: 'SettingsAccess',
        component: () => import('@/views/settings/SettingsPlaceholder.vue'),
        meta: { title: 'Access Configuration' }
      },
      {
        path: 'users',
        name: 'SettingsUsers',
        component: () => import('@/views/settings/UserManagement.vue'),
        meta: { title: 'User Management' }
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
    // Only fetch profile for routes that require auth
    // Skip profile fetch for public routes to avoid unnecessary 401 redirects
    if (requiresAuth && !userStore.user) {
      const result = await userStore.fetchProfile()
      if (!result.success) {
        // Token invalid, redirect to login
        next({ name: 'Login', query: { redirect: to.fullPath } })
        return
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