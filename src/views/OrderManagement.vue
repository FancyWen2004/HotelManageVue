<template>
  <div class="order-management">
    <div class="page-header">
      <h1>订单管理</h1>
    </div>

    <div class="content-wrapper">
      <!-- 左侧导航栏 -->
      <aside class="sidebar">
        <nav class="nav-menu">
          <router-link to="/order/room" class="nav-item" :class="{ active: $route.path === '/order/room' }">
            <el-icon>
              <House />
            </el-icon>
            <span>房间订单</span>
          </router-link>

          <router-link to="/order/product" class="nav-item" :class="{ active: $route.path === '/order/product' }">
            <el-icon>
              <ShoppingBag />
            </el-icon>
            <span>商品订单</span>
          </router-link>
        </nav>
      </aside>

      <!-- 右侧内容区域 -->
      <main class="main-content">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup>
import { House, ShoppingBag } from '@element-plus/icons-vue'
</script>

<style scoped>
.order-management {
  padding: 20px;
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.page-header {
  margin-bottom: 20px;
}

.page-header h1 {
  font-size: 24px;
  color: #333;
  margin: 0;
}

.content-wrapper {
  display: flex;
  flex: 1;
  gap: 20px;
}

.sidebar {
  width: 200px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 20px 0;
}

.nav-menu {
  display: flex;
  flex-direction: column;
}

.nav-item {
  display: flex;
  align-items: center;
  padding: 12px 20px;
  color: #606266;
  text-decoration: none;
  transition: all 0.3s;
  border-left: 3px solid transparent;
}

.nav-item:hover {
  background-color: #f5f7fa;
  color: #409eff;
}

.nav-item.active {
  background-color: #ecf5ff;
  color: #409eff;
  border-left-color: #409eff;
}

.nav-item .el-icon {
  margin-right: 8px;
  font-size: 16px;
}

.nav-item span {
  font-size: 14px;
  font-weight: 500;
}

.main-content {
  flex: 1;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

/* 响应式布局 */
@media (max-width: 768px) {
  .content-wrapper {
    flex-direction: column;
  }

  .sidebar {
    width: 100%;
  }

  .nav-menu {
    flex-direction: row;
    overflow-x: auto;
  }

  .nav-item {
    white-space: nowrap;
    border-left: none;
    border-bottom: 3px solid transparent;
  }

  .nav-item.active {
    border-left: none;
    border-bottom-color: #409eff;
  }
}
</style>