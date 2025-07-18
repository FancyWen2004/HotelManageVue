<template>
  <div class="room-status">
    <div class="page-header">
      <h1>房态管理</h1>
      <div class="header-actions">
        <button @click="refreshData" class="refresh-btn">刷新</button>
      </div>
    </div>

    <div class="content-wrapper">
      <!-- 左侧面板 -->
      <aside class="sidebar">
        <!-- 日期选择器 -->
        <div class="date-section">
          <h3>日期选择</h3>
          <el-date-picker v-model="selectedDate" type="date" placeholder="选择日期" format="YYYY年MM月DD日"
            value-format="YYYY-MM-DD" @change="onDateChange" class="date-picker" size="default" style="width: 240px" />

          <!-- 快速日期选择 -->
          <div class="quick-date">
            <h4>快速选择</h4>
            <div class="quick-buttons">
              <el-button @click="selectToday" size="small" class="quick-btn">今天</el-button>
              <el-button @click="selectTomorrow" size="small" class="quick-btn">明天</el-button>
              <el-button @click="selectWeekend" size="small" class="quick-btn">本周末</el-button>
            </div>
          </div>
        </div>

        <!-- 房型选择 -->
        <div class="room-type-section">
          <h3>房型筛选</h3>
          <el-select v-model="selectedRoomType" @change="onRoomTypeChange" placeholder="选择房型" class="room-type-select"
            clearable>
            <el-option label="全部房型" value=""></el-option>
            <el-option v-for="roomType in roomTypes" :key="roomType.id" :label="roomType.typeName"
              :value="roomType.id"></el-option>
          </el-select>
        </div>

        <!-- 房间状态统计 -->
        <div class="status-summary">
          <h3>房态统计</h3>
          <div class="status-list">
            <div v-for="(status, key) in statusMap" :key="key" class="status-item">
              <div class="status-info">
                <div class="status-indicator" :style="{ backgroundColor: status.color }"></div>
                <span class="status-text">{{ status.text }}</span>
              </div>
              <div class="status-count">{{ getStatusCount(key) }}</div>
            </div>
          </div>
        </div>
      </aside>

      <!-- 主要内容区域 -->
      <main class="content">
        <!-- 当前选择的日期显示 -->
        <div class="selected-date-info">
          <div class="date-header">
            <span class="date-title">{{ formatSelectedDate(selectedDate) }} 房态信息</span>
          </div>
        </div>

        <div class="room-grid" v-if="!loading">
          <el-card v-for="room in roomStatusData" :key="room.roomId" class="room-card"
            :class="getRoomStatusClass(room.roomStatus)" shadow="hover" @click="showRoomDetail(room)">
            <div class="room-number">{{ room.roomNumber }}</div>
            <el-tag :type="getStatusTagType(room.roomStatus)" class="room-status-tag" size="small">
              {{ statusMap[room.roomStatus]?.text || '未知' }}
            </el-tag>
            <div v-if="room.customerName" class="customer-info">
              <div class="customer-name">
                <el-icon>
                  <User />
                </el-icon>
                {{ room.customerName }}
              </div>
              <div class="check-time">
                <div class="checkin">
                  <el-icon>
                    <Clock />
                  </el-icon>
                  入住: {{ formatTime(room.checkinDate) }}
                </div>
                <div class="checkout">
                  <el-icon>
                    <Clock />
                  </el-icon>
                  退房: {{ formatTime(room.checkoutDate) }}
                </div>
              </div>
            </div>
            <div v-else class="empty-room">
              <el-icon>
                <House />
              </el-icon>
              空房
            </div>
          </el-card>
        </div>
        <!-- 空状态 -->
        <div v-if="!loading && roomStatusData.length === 0" class="empty-state">
          <el-empty description="暂无房间数据">
            <el-button type="primary" @click="refreshData">刷新数据</el-button>
          </el-empty>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getAllRoomTypes, getSaleStatusInOneDay } from '../api/room.js'
import { User, Clock, House } from '@element-plus/icons-vue'

// 获取今天的日期字符串
const getTodayDateString = () => {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// 响应式数据
const roomTypes = ref([])
const selectedRoomType = ref('')
const selectedDate = ref(getTodayDateString()) // 使用字符串格式
const roomStatusData = ref([])
const loading = ref(false)

const statusMap = {
  0: { text: '脏房', color: '#FECACA', bgColor: '#FEF2F2' },      // 浅红色系
  1: { text: '干净未预定', color: '#9AE6B4', bgColor: '#FAFDFB' }, // 浅绿色系
  2: { text: '已预定', color: '#FBD38D', bgColor: '#FFF8F0' },     // 浅橙色系
  3: { text: '已入住', color: '#90CDF4', bgColor: '#EDF7FA' },     // 浅蓝色系
  4: { text: '锁房', color: '#C4B5FD', bgColor: '#FAF5FF' }        // 浅紫色系
}

// 获取房型列表
const fetchRoomTypes = async () => {
  try {
    const response = await getAllRoomTypes()
    roomTypes.value = response || []
    console.log('房型数据:', roomTypes.value)
  } catch (error) {
    console.error('获取房型失败:', error)
    roomTypes.value = []
  }
}

// 获取房间状态数据
const fetchRoomStatus = async () => {
  if (!selectedDate.value) return

  loading.value = true
  try {
    if (selectedRoomType.value) {
      // 查询指定房型
      const response = await getSaleStatusInOneDay(selectedDate.value, selectedRoomType.value)
      roomStatusData.value = response || []
    } else {
      // 查询全部房型
      if (roomTypes.value.length === 0) {
        console.warn('房型数据未加载，无法查询全部房型')
        roomStatusData.value = []
        return
      }
      const allRoomStatusData = []
      for (const roomType of roomTypes.value) {
        try {
          const response = await getSaleStatusInOneDay(selectedDate.value, roomType.id)
          if (response && response.length > 0) {
            allRoomStatusData.push(...response)
          }
        } catch (error) {
          console.error(`获取房型 ${roomType.typeName} 的房间状态失败:`, error)
        }
      }
      roomStatusData.value = allRoomStatusData
    }
    console.log('房间状态数据:', roomStatusData.value)
  } catch (error) {
    console.error('获取房间状态失败:', error)
    roomStatusData.value = []
  } finally {
    loading.value = false
  }
}

// 房型改变时重新获取数据
const onRoomTypeChange = () => {
  fetchRoomStatus()
}

// 日期改变时重新获取数据
const onDateChange = (date) => {
  selectedDate.value = date
  fetchRoomStatus()
}

// 刷新数据
const refreshData = () => {
  selectedDate.value = getTodayDateString()
  fetchRoomStatus()
}

// 获取房间状态样式类
const getRoomStatusClass = (status) => {
  return `room-status-${status}`
}

// 获取状态标签类型
const getStatusTagType = (status) => {
  const typeMap = {
    0: 'danger',   // 脏房
    1: 'success',  // 干净未预定
    2: 'warning',  // 已预定
    3: 'primary',  // 已入住
    4: 'info'      // 锁房
  }
  return typeMap[status] || 'info'
}

// 获取状态数量统计
const getStatusCount = (statusKey) => {
  return roomStatusData.value.filter(room => room.roomStatus === statusKey).length
}

const formatTime = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${month}/${day}`
}

const formatSelectedDate = (dateStr) => {
  if (!dateStr) return ''
  const [year, month, day] = dateStr.split('-')
  return `${year}年${month}月${day}日`
}

// 显示房间详情
const showRoomDetail = (room) => {
  console.log('房间详情:', room)
}

// 快速日期选择
const selectToday = () => {
  selectedDate.value = getTodayDateString()
  fetchRoomStatus()
}

const selectTomorrow = () => {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const year = tomorrow.getFullYear()
  const month = String(tomorrow.getMonth() + 1).padStart(2, '0')
  const day = String(tomorrow.getDate()).padStart(2, '0')
  selectedDate.value = `${year}-${month}-${day}`
  fetchRoomStatus()
}

const selectWeekend = () => {
  const now = new Date()
  const dayOfWeek = now.getDay()
  const daysUntilSaturday = 6 - dayOfWeek
  const saturday = new Date()
  saturday.setDate(now.getDate() + daysUntilSaturday)
  const year = saturday.getFullYear()
  const month = String(saturday.getMonth() + 1).padStart(2, '0')
  const day = String(saturday.getDate()).padStart(2, '0')
  selectedDate.value = `${year}-${month}-${day}`
  fetchRoomStatus()
}

// 组件挂载时获取数据
onMounted(async () => {
  await fetchRoomTypes()
  if (roomTypes.value.length > 0) {
    await fetchRoomStatus()
  }
})
</script>

<style scoped>
.room-status {
  padding: 20px;
  height: 100%;
  background-color: #f5f7fa;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  border-radius: 8px;
}

.page-header h1 {
  margin: 0;
  font-size: 24px;
  color: #303133;
  font-weight: 600;
}

.refresh-btn {
  padding: 10px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
}

.refresh-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.content-wrapper {
  display: flex;
  gap: 20px;
  height: calc(100vh - 140px);
}

.sidebar {
  width: 280px;
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  height: 100%;
  /* 改为100%，与右侧内容区域保持一致 */
  max-height: calc(100vh - 180px);
  overflow-y: auto;
  display: flex;
  /* 添加flex布局 */
  flex-direction: column;
  /* 垂直排列 */
}

.date-section,
.room-type-section,
.status-summary {
  margin-bottom: 24px;
  flex: 1;
  /* 让房态统计区域占据剩余空间 */
  display: flex;
  flex-direction: column;
}

.status-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
  /* 让状态列表占据剩余空间 */
}

.date-section h3,
.room-type-section h3,
.status-summary h3 {
  margin: 0 0 12px 0;
  font-size: 14px;
  color: #303133;
  font-weight: 600;
  border-bottom: 1px solid #e4e7ed;
  padding-bottom: 6px;
}

.date-picker {
  width: 100%;
  margin-bottom: 12px;
}

.quick-date h4 {
  margin: 12px 0 8px 0;
  font-size: 12px;
  color: #606266;
}

.quick-buttons {
  display: flex;
  flex-direction: column;
  gap: 6px;
  align-items: stretch;
}

.quick-btn {
  width: 100% !important;
  height: 28px !important;
  font-size: 12px !important;
  text-align: center;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  border-radius: 4px;
  margin: 0 !important;
  /* 移除Element Plus默认margin */
  padding: 0 8px !important;
  /* 统一内边距 */
  box-sizing: border-box;
}

/* 确保按钮内的文字完全居中 */
.quick-btn span {
  width: 100%;
  text-align: center;
  line-height: 1;
}

.room-type-select {
  width: 100%;
  margin-bottom: 8px;
}

.room-count {
  text-align: center;
}

/* 优化房态统计样式 */
.status-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.status-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: #fafbfc;
  border-radius: 6px;
  border: 1px solid #e4e7ed;
  transition: all 0.3s;
}

.status-item:hover {
  background: #f0f2f5;
  border-color: #c0c4cc;
}

.status-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-indicator {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

.status-text {
  font-size: 13px;
  color: #303133;
  font-weight: 500;
}

.status-count {
  font-size: 14px;
  font-weight: bold;
  color: #409eff;
  background: #ecf5ff;
  padding: 2px 8px;
  border-radius: 12px;
  min-width: 24px;
  text-align: center;
}

.content {
  flex: 1;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.selected-date-info {
  padding: 16px 20px;
  border-bottom: 1px solid #e4e7ed;
  background: #fafafa;
}

.date-header {
  display: flex;
  align-items: center;
  height: 56px;
  /* 保持与el-page-header相同的高度 */
}

.date-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.room-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  /* 固定5列 */
  gap: 2px;
  /* 统一行间距和列间距 */
  padding: 20px 20px 0 20px;
  /* 减少底部padding为0 */
  overflow-y: auto;
  flex: 1;
}

.room-card {
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  height: 140px;
  /* 增加高度从120px到140px */
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 12px;
  box-sizing: border-box;
}

.customer-info {
  font-size: 12px;
  /* 增加字体大小从11px到12px */
  line-height: 1.4;
  /* 增加行高 */
}

.check-time {
  color: black;
  margin-top: 4px;
  /* 增加上边距 */
}

.checkin,
.checkout {
  margin-bottom: 4px;
  /* 增加底部边距从3px到4px */
  display: flex;
  align-items: center;
  gap: 4px;
  /* 增加图标和文字间距 */
  white-space: nowrap;
  /* 防止文字换行 */
  overflow: hidden;
  /* 隐藏溢出内容 */
  text-overflow: ellipsis;
  /* 显示省略号 */
}

.empty-room {
  font-size: 12px;
  color: #c0c4cc;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

/* 房间状态样式*/
.room-status-0 {
  background: linear-gradient(135deg, #FECACA, #ec7a7a);
  color: white;
}

.room-status-1 {
  background: linear-gradient(135deg, #9AE6B4, #8ef8b1);
  color: white;
}

.room-status-2 {
  background: linear-gradient(135deg, #FBD38D, #ED8936);
  color: white;
}

.room-status-3 {
  background: linear-gradient(135deg, #90CDF4, #4299E1);
  color: white;
}

.room-status-4 {
  background: linear-gradient(135deg, #C4B5FD, #9F7AEA);
  color: white;
}

.loading {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-state {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
}
</style>