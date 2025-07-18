import { createRouter, createWebHistory } from 'vue-router'
import Layout from '../components/Layout.vue'
import RoomStatus from '../views/RoomStatus.vue'
import OrderManagement from '../views/OrderManagement.vue'
import CustomerManagement from '../views/CustomerManagement.vue'
import DataAnalysis from '../views/DataAnalysis.vue'
import Settings from '../views/Settings.vue'
import RoomList from '../views/RoomList.vue'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue')
  },
  {
    path: '/',
    component: Layout,
    redirect: '/room-status',
    meta: { requiresAuth: true },
    children: [
      {
        path: '/room-status',
        name: 'RoomStatus',
        component: RoomStatus,
        meta: { title: '房态管理', requiresAuth: true }
      },
      {
        path: '/order',
        name: 'OrderManagement',
        component: OrderManagement,
        meta: { title: '订单管理', requiresAuth: true },
        // 子路由,有房间订单和商品订单
        children: [
          {
            path: '',
            redirect: '/order/room'
          },
          {
            path: 'room',
            name: 'RoomOrder',
            component: () => import('../views/Order/RoomOrder.vue'),
            meta: { title: '房间订单', requiresAuth: true }
          },
          {
            path: 'product',
            name: 'ProductOrder',
            component: () => import('../views/Order/ProductOrder.vue'),
            meta: { title: '商品订单', requiresAuth: true }
          }
        ]
      },
      {
        path: '/customer',
        name: 'CustomerManagement',
        component: CustomerManagement,
        meta: { title: '客户管理', requiresAuth: true }
      },
      {
        path: '/data',
        name: 'DataAnalysis',
        component: DataAnalysis,
        meta: { title: '数据分析', requiresAuth: true }
      },
      {
        path: '/settings',
        name: 'Settings',
        component: Settings,
        meta: { title: '系统设置', requiresAuth: true }
      },
      {
        path: '/settings/rooms/:roomTypeId',
        name: 'RoomList',
        component: RoomList,
        meta: { title: '房间列表', requiresAuth: true }
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    redirect: '/login'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫 - 检查登录状态
// router.beforeEach((to, from, next) => {
//   // 检查是否需要认证
//   if (to.matched.some(record => record.meta.requiresAuth)) {
//     // 检查是否已登录,检查localStorage中的token或其他登录标识
//     const isLoggedIn = localStorage.getItem('userToken') || sessionStorage.getItem('userToken')

//     if (!isLoggedIn) {
//       // 未登录，重定向到登录页
//       next('/login')
//     } else {
//       // 已登录，允许访问
//       next()
//     }
//   } else {
//     // 不需要认证的页面，直接访问
//     next()
//   }
// })

// 统一的路由守卫
router.beforeEach((to, from, next) => {
  // 检查是否已登录
  const userToken = localStorage.getItem('userToken') || sessionStorage.getItem('userToken')
  const isLoggedIn = userToken && userToken !== 'null' && userToken !== 'undefined'
  
  console.log('路由守卫检查:', {
    to: to.path,
    userToken,
    isLoggedIn
  })
  
  // 如果访问根路径，重定向处理
  if (to.path === '/') {
    if (isLoggedIn) {
      next('/room-status')
    } else {
      next('/login')
    }
    return
  }
  
  // 检查是否需要认证
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!isLoggedIn) {
      // 未登录，重定向到登录页
      console.log('未登录，重定向到登录页')
      next('/login')
    } else {
      // 已登录，允许访问
      console.log('已登录，允许访问')
      next()
    }
  } else {
    // 不需要认证的页面，直接访问
    next()
  }
})

export default router