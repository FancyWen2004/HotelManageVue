<template>
  <div class="room-order">
    <!-- 查询条件区域 -->
    <div class="search-section">
      <el-form :model="searchForm" class="search-form">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-form-item label="房型类型">
              <el-select v-model="searchForm.roomType" placeholder="请选择房型" clearable style="width: 100%">
                <el-option label="全部房型" value="" />
                <el-option v-for="roomType in roomTypes" :key="roomType.id" :label="roomType.typeName"
                  :value="roomType.id" />
              </el-select>
            </el-form-item>
          </el-col>

          <el-col :span="6">
            <el-form-item label="预订状态">
              <el-select v-model="searchForm.orderStatus" placeholder="请选择状态" clearable style="width: 100%">
                <el-option label="待支付" value="0" />
                <el-option label="待入住" value="1" />
                <el-option label="已入住" value="2" />
                <el-option label="已完成" value="3" />
                <el-option label="退订" value="4" />
              </el-select>
            </el-form-item>
          </el-col>

          <el-col :span="6">
            <el-form-item label="房间号">
              <el-input v-model="searchForm.roomNumber" placeholder="请输入房间号" clearable />
            </el-form-item>
          </el-col>

          <el-col :span="6">
            <el-form-item label="预订日期">
              <el-date-picker v-model="searchForm.orderDate" type="date" placeholder="请选择预订日期" clearable
                value-format="YYYY-MM-DD" size="default" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="6">
            <el-form-item label="预订人姓名">
              <el-input v-model="searchForm.customerName" placeholder="请输入预订人姓名" clearable />
            </el-form-item>
          </el-col>

          <el-col :span="6">
            <el-form-item label="预订人电话">
              <el-input v-model="searchForm.customerPhone" placeholder="请输入预订人电话" clearable />
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item class="button-group">
              <el-button type="primary" @click="handleSearch">查询</el-button>
              <el-button @click="handleReset">重置</el-button>
              <el-button @click="refreshData">刷新</el-button>
              <el-button @click="handleExportExcel">导出</el-button>
              <el-button @click="account" type="success">记账</el-button>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </div>

    <!-- 订单列表 -->
    <div class="table-section">
      <el-table :data="orderList" v-loading="loading" stripe border style="width: 100%" empty-text="暂无数据">
        <el-table-column prop="orderSn" label="订单编号" min-width="120" show-overflow-tooltip />
        <el-table-column prop="roomNumber" label="房间号" min-width="80" />
        <el-table-column prop="customerName" label="预订人" min-width="100" />
        <el-table-column prop="customerPhone" label="电话" min-width="120" />
        <el-table-column prop="checkinDate" label="入住日期" min-width="110">
          <template #default="scope">
            {{ formatDate(scope.row.checkinDate) }}
          </template>
        </el-table-column>
        <el-table-column prop="checkoutDate" label="离店日期" width="110">
          <template #default="scope">
            {{ formatDate(scope.row.checkoutDate) }}
          </template>
        </el-table-column>
        <el-table-column prop="nights" label="天数" min-width="80" />
        <el-table-column prop="channel" label="预订渠道" min-width="100" />
        <el-table-column prop="isBreakfast" label="早餐" min-width="80" />
        <el-table-column prop="orderStatus" label="预订状态" min-width="100">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.orderStatus)">
              {{ getStatusText(scope.row.orderStatus) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="roomType" label="房型" width="100" />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="scope">
            <el-button v-if="scope.row.orderStatus === 0 || scope.row.orderStatus === 1" type="success" size="small"
                       @click="handleStatusChange(scope.row, '2')">
              入住
            </el-button>
            <el-button v-if="scope.row.orderStatus === 0 || scope.row.orderStatus === 1 || scope.row.orderStatus === 2"
              type="danger" size="small" @click="handleStatusChange(scope.row, '4')">
              退订
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination v-model:current-page="pagination.current" v-model:page-size="pagination.size"
          :page-sizes="[10, 20, 50]" :total="pagination.total" layout="total, sizes, prev, pager, next"
          @size-change="handleSizeChange" @current-change="handleCurrentChange" />
      </div>
    </div>

    <!-- 房间订单记账对话框 -->
    <el-dialog v-model="addDialogVisible" title="添加房间订单" width="700px">
      <el-form :model="addForm" ref="addFormRef" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="客户姓名">
              <el-input v-model="addForm.customerName" placeholder="请输入客户姓名" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="手机号">
              <el-input v-model="addForm.phone" placeholder="请输入手机号" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="身份证号">
              <el-input v-model="addForm.idCard" placeholder="请输入身份证号" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="客户ID">
              <el-input v-model="addForm.customerId" placeholder="请输入客户ID" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="房间类型ID">
              <el-input v-model="addForm.roomTypeId" placeholder="请输入房间类型ID" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="房间号">
              <el-input v-model="addForm.roomNumber" placeholder="请输入房间号" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="入住日期">
              <el-date-picker v-model="addForm.checkinDate" type="date" placeholder="请选择入住日期" style="width: 100%"
                value-format="YYYY-MM-DD" @change="calculateNights" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="退房日期">
              <el-date-picker v-model="addForm.checkoutDate" type="date" placeholder="请选择退房日期" style="width: 100%"
                value-format="YYYY-MM-DD" @change="calculateNights" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="入住天数">
              <el-input-number v-model="addForm.nights" :min="1" placeholder="天数" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="渠道">
              <el-input v-model="addForm.channel" placeholder="请输入渠道" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="早餐">
              <el-select v-model="addForm.breakfast" placeholder="请选择" >
                <el-option :value="0" label="0-无早餐" />
                <el-option :value="1" label="1-含早餐" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="订单状态">
              <el-input v-model="addForm.orderStatus" :min="0" :max="3" placeholder="0-待入住 1-已入住 2-已退房 3-已取消"
                style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="订单金额">
              <el-input v-model="addForm.amount" :precision="2" :min="0" placeholder="金额" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="支付方式">
              <el-input v-model="addForm.paymentMethod" placeholder="请输入支付方式" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>

      <template #footer>
        <el-space>
          <el-button @click="addDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleAddRoomOrder" :loading="addLoading">确定</el-button>
        </el-space>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { queryOrderInfo, updateOrderStatus, exportExcel, addRoomOrder } from '../../api/order.js'
import { getAllRoomTypes } from '../../api/room.js'
import dayjs from "dayjs";

// 搜索表单
const searchForm = reactive({
  roomType: '',
  orderStatus: '',
  roomNumber: '',
  orderDate: '',
  customerName: '',
  customerPhone: ''
})

// 订单列表数据
const orderList = ref([])
const loading = ref(false)
const roomTypes = ref([])

// 分页信息
const pagination = reactive({
  current: 1,
  size: 10,
  total: 0
})

// 获取房型列表
const fetchRoomTypes = async () => {
  try {
    const response = await getAllRoomTypes()
    roomTypes.value = response || []
  } catch (error) {
    console.error('获取房型失败:', error)
    roomTypes.value = []
  }
}

// 获取订单列表
const getOrderList = async () => {
  loading.value = true
  try {
    const params = {
      pageNum: pagination.current,
      pageSize: pagination.size
    }
    // 只添加有值的参数
    if (searchForm.roomType) params.roomType = searchForm.roomType
    if (searchForm.orderStatus) params.orderStatus = searchForm.orderStatus
    if (searchForm.roomNumber) params.roomNumber = searchForm.roomNumber
    if (searchForm.orderDate) params.orderDate = searchForm.orderDate
    if (searchForm.customerName) params.customerName = searchForm.customerName
    if (searchForm.customerPhone) params.customerPhone = searchForm.customerPhone
    const response = await queryOrderInfo(params)
    const responseData = response
    if (responseData?.records && Array.isArray(responseData.records)) {
      orderList.value = responseData.records
      pagination.total = responseData.total || 0
      pagination.current = responseData.current || 1
      pagination.size = responseData.size || 10
    } else {
      orderList.value = []
      pagination.total = 0
      ElMessage.info('暂无订单数据')
    }
  } catch (error) {
    console.error('请求失败详细信息:', error)
    ElMessage.error(error.message || '网络请求失败，请检查网络连接')
    orderList.value = []
    pagination.total = 0
  } finally {
    loading.value = false
  }
}

// 状态修改
const handleStatusChange = async (row, newStatus) => {
  const statusText = newStatus !== '4' ? '入住' : '退订'

  try {
    await ElMessageBox.confirm(
      `确定要将订单 ${row.orderSn} 状态修改为${statusText}吗？`,
      '确认操作',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    const response = await updateOrderStatus(row.orderSn, newStatus)
    ElMessage.success(`${statusText}操作成功`)
    getOrderList()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('状态修改失败:', error)
      ElMessage.error(error.message || `${statusText}操作失败`)
    }
  }
}

// 格式化日期
const formatDate = (dateStr) => {
  if (!dateStr) return ''
  try {
    if (dateStr instanceof Date) {
      return dateStr.toISOString().split('T')[0]
    }
    if (typeof dateStr === 'string') {
      if (dateStr.includes('T')) {
        return dateStr.split('T')[0]
      }
      if (dateStr.includes(' ')) {
        return dateStr.split(' ')[0]
      }
      return dateStr
    }
    return ''
  } catch (error) {
    console.error('日期格式化错误:', error, '原始数据:', dateStr)
    return ''
  }
}

// 搜索
const handleSearch = () => {
  pagination.current = 1
  getOrderList()
}

// 重置
const handleReset = () => {
  Object.keys(searchForm).forEach(key => {
    searchForm[key] = ''
  })
  pagination.current = 1
  getOrderList()
}

// 刷新数据
const refreshData = () => {
  getOrderList()
}

// 分页大小改变
const handleSizeChange = (size) => {
  pagination.size = size
  pagination.current = 1
  getOrderList()
}

// 当前页改变
const handleCurrentChange = (current) => {
  pagination.current = current
  getOrderList()
}

// 获取状态类型
const getStatusType = (status) => {
  const statusMap = {
    1: 'info',
    2: 'warning',
    3: 'success',
    4: 'danger'
  }
  return statusMap[status] || 'info'
}

// 获取状态文本
const getStatusText = (status) => {
  const statusMap = {
    0: '待支付',
    1: '待入住',
    2: '已入住',
    3: '已完成',
    4: '退订'
  }
  return statusMap[status] || '未知状态'
}

// 导出Excel
const handleExportExcel = async () => {
  try {
    const response = await exportExcel({
      pageNum: pagination.current,
      pageSize: pagination.size,
      roomType: searchForm.roomType || undefined,
      orderStatus: searchForm.orderStatus || undefined,
      roomNumber: searchForm.roomNumber || undefined,
      orderDate: searchForm.orderDate || undefined,
      customerName: searchForm.customerName || undefined,
      customerPhone: searchForm.customerPhone || undefined,
    })

    // 创建blob对象
    const blob = new Blob([response], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    })

    // 创建下载链接
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url

    // 设置文件名
    const randomNumber = Math.floor(Math.random() * 10000)
    link.download = `房间订单${randomNumber}.xlsx`

    // 触发下载
    document.body.appendChild(link)
    link.click()

    // 清理
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)

    ElMessage.success('导出成功')
    await getOrderList()
  } catch (e) {
    console.error('导出失败:', e)
    ElMessage.error('导出失败')
  }
}


// 组件挂载时获取数据
onMounted(async () => {
  await fetchRoomTypes()
  getOrderList()
})

// 添加记账相关的变量
const addDialogVisible = ref(false)
const addLoading = ref(false)
const addFormRef = ref(null)

// 添加订单表单
const addForm = reactive({
  customerName: '',
  phone: '',
  idCard: '',
  customerId: null,
  roomTypeId: null,
  roomNumber: '',
  checkinDate: '',
  checkoutDate: '',
  nights: 1,
  channel: '',
  breakfast: 0,
  orderStatus: 0,
  amount: 0,
  paymentMethod: ''
})

// 添加记账按钮点击事件
const account = () => {
  addDialogVisible.value = true
  // 重置表单
  Object.keys(addForm).forEach(key => {
    if (typeof addForm[key] === 'string') {
      addForm[key] = ''
    } else if (typeof addForm[key] === 'number') {
      addForm[key] = key === 'nights' ? 1 : 0
    }
  })
}

// 计算入住天数
const calculateNights = () => {
  if (addForm.checkinDate && addForm.checkoutDate) {
    const checkin = new Date(addForm.checkinDate)
    const checkout = new Date(addForm.checkoutDate)
    const timeDiff = checkout.getTime() - checkin.getTime()
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24))
    if (daysDiff > 0) {
      addForm.nights = daysDiff
    }
  }
}

// 处理添加房间订单
const handleAddRoomOrder = async () => {
  // 表单验证
  if (!addForm.customerName) {
    ElMessage.error('请输入客户姓名')
    return
  }
  if (!addForm.phone) {
    ElMessage.error('请输入手机号')
    return
  }
  if (!addForm.roomNumber) {
    ElMessage.error('请输入房间号')
    return
  }
  if (!addForm.checkinDate) {
    ElMessage.error('请选择入住日期')
    return
  }
  if (!addForm.checkoutDate) {
    ElMessage.error('请选择退房日期')
    return
  }

  addLoading.value = true
  try {
    // 构造请求数据，匹配后端RoomOrderDto
    const orderData = {
      customerName: addForm.customerName,
      phone: addForm.phone,
      idCard: addForm.idCard,
      customerId: addForm.customerId,
      roomTypeId: addForm.roomTypeId,
      roomNumber: addForm.roomNumber,
      checkinDate: dayjs(addForm.checkinDate).format('YYYY-MM-DD HH:mm:ss'),
      checkoutDate: dayjs(addForm.checkoutDate).format('YYYY-MM-DD HH:mm:ss'),
      nights: addForm.nights,
      channel: addForm.channel,
      breakfast: addForm.breakfast,
      orderStatus: addForm.orderStatus,
      amount: addForm.amount,
      paymentMethod: addForm.paymentMethod
    }

    await addRoomOrder(orderData)
    ElMessage.success('房间订单添加成功')
    addDialogVisible.value = false
    // 刷新订单列表
    getOrderList()
  } catch (error) {
    console.error('添加房间订单失败:', error)
    ElMessage.error(error.message || '添加房间订单失败')
  } finally {
    addLoading.value = false
  }
}
</script>

<style scoped>
.room-order {
  padding: 20px;
}

.search-section {
  background: white;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.search-form {
  margin: 0;
}

.table-section {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.pagination-wrapper {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.el-table .el-table__header-wrapper th {
  background-color: #f5f7fa;
  color: #606266;
  font-weight: 600;
}

.button-group {
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

@media (max-width: 1200px) {
  .search-form .el-col {
    margin-bottom: 10px;
  }
}
</style>