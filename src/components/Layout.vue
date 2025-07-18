<template>
  <div class="layout">
    <!-- 头部导航 -->
    <header class="header">
      <div class="logo">
        <span>🏨</span>
        携程酒店管理系统
      </div>
      <nav class="nav">
        <router-link 
          v-for="item in navItems" 
          :key="item.path"
          :to="item.path"
          class="nav-item"
          :class="{ active: $route.path === item.path }"
        >
          {{ item.title }}
        </router-link>
      </nav>
      <div class="user-info">
        <span>{{ userName || '管理员' }}</span>
        <button class="logout-btn" @click="handleLogout">退出</button>
      </div>
    </header>

    <!-- 主要内容区域 -->
    <main class="main-content">
      <router-view />
    </main>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'

const router = useRouter()
const userName = ref('')

const navItems = ref([
  { path: '/room-status', title: '房态' },
  { path: '/order', title: '订单' },
  { path: '/customer', title: '客户' },
  { path: '/data', title: '统计' },
  { path: '/settings', title: '设置' }
])

// 获取用户信息
const getUserInfo = () => {
  try {
    // 从localStorage获取用户信息
    const userInfo = localStorage.getItem('userInfo')
    console.log('从localStorage获取的userInfo:', userInfo) // 调试信息
    if (userInfo) {
      const user = JSON.parse(userInfo)
      console.log('解析后的用户信息:', user) // 调试信息
      if (user.phone === "13333333333") {
        userName.value = '管理员'
      } else if (user.phone) {
        // 使用正则表达式替换中间四位数字为 *
        userName.value = user.phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
      } else {
        userName.value = '个人信息有误'
      }
      console.log('设置的用户名:', userName.value) // 调试信息
    }
  } catch (error) {
    console.error('获取用户信息失败:', error)
    userName.value = '个人信息有误'
  }
}

// 处理登出
const handleLogout = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要退出登录吗？',
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
    
    // 清除本地存储的用户信息和token
    localStorage.removeItem('userToken')
    localStorage.removeItem('userInfo')
    sessionStorage.removeItem('userToken')
    sessionStorage.removeItem('userInfo')
    ElMessage.success('退出成功')
    // 跳转到登录页
    await router.push('/login')
  } catch (error) {
    // 用户取消登出
    console.log('用户取消登出')
  }
}

// 组件挂载时获取用户信息
onMounted(() => {
  getUserInfo()
})
</script>

<style scoped>
.layout {
  min-height: 100vh;
  background-color: #f0f2f5;
}

.header {
  background-color: #20b2aa;
  color: white;
  padding: 0 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 60px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.logo {
  font-size: 18px;
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: 8px;
}

.logo span {
  font-size: 24px;
}

.nav {
  display: flex;
  gap: 30px;
}

.nav-item {
  padding: 8px 16px;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  transition: all 0.3s;
}

.nav-item:hover,
.nav-item.active {
  background-color: rgba(255, 255, 255, 0.2);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logout-btn {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.logout-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.main-content {
  min-height: calc(100vh - 60px);
}
</style>