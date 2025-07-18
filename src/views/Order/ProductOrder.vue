<template>
  <div class="product-order">
    <div class="page-header">
      <h2>商品订单管理</h2>
    </div>

    <!-- 查询条件区域 -->
    <div class="search-section">
      <el-form :model="searchForm" class="search-form">
        <el-row :gutter="20">
          <el-col :span="5">
            <el-form-item label="商品名称">
              <el-input v-model="searchForm.productName" placeholder="请输入商品名称" clearable style="width: 200px" />
            </el-form-item>
          </el-col>

          <el-col :span="6">
            <el-form-item label="订单状态">
              <el-select v-model="searchForm.orderStatus" placeholder="请选择状态" clearable style="width: 100%">
                <el-option label="待支付" value="0" />
                <el-option label="已支付" value="1" />
                <el-option label="已取消" value="2" />
              </el-select>
            </el-form-item>
          </el-col>

          <el-col :span="6">
            <el-form-item label="下单日期">
              <el-date-picker v-model="searchForm.orderDate" type="date" placeholder="请选择下单日期" clearable
                value-format="YYYY-MM-DD" size="default" style="width: 100%" />
            </el-form-item>
          </el-col>

          <el-col :span="7">
            <el-form-item class="button-group">
              <el-button type="primary" @click="handleSearch">查询</el-button>
              <el-button @click="handleReset">重置</el-button>
              <el-button @click="refreshData">刷新</el-button>
              <el-button @click="handleExportExcel">导出</el-button>
              <el-button type="success" @click="account">记账</el-button>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </div>

    <!-- 商品订单列表 -->
    <div class="table-section">
      <el-table :data="orderList" v-loading="loading" stripe border style="width: 100%" empty-text="暂无数据">
        <el-table-column prop="orderSn" label="订单编号" min-width="120" show-overflow-tooltip />
        <el-table-column prop="productName" label="商品名称" min-width="120" />
        <el-table-column prop="quantity" label="数量" min-width="80" />
        <el-table-column prop="price" label="单价" min-width="100">
          <template #default="scope">
            ¥{{ scope.row.price }}
          </template>
        </el-table-column>
        <el-table-column prop="totalAmount" label="总金额" min-width="100">
          <template #default="scope">
            ¥{{ scope.row.totalAmount }}
          </template>
        </el-table-column>
        <el-table-column prop="customerName" label="客户姓名" min-width="100" />
        <el-table-column prop="orderDate" label="下单日期" min-width="110">
          <template #default="scope">
            {{ formatDate(scope.row.orderDate) }}
          </template>
        </el-table-column>
        <el-table-column prop="orderStatus" label="订单状态" min-width="100">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.orderStatus)">
              {{ getStatusText(scope.row.orderStatus) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="scope">
            <!-- 待支付状态(0)：显示确认支付和取消订单 -->
            <template v-if="scope.row.orderStatus === 0">
              <el-button type="success" size="small" style="width: 40px" @click="handleStatusChange(scope.row, 1)">
                确认
              </el-button>
              <el-button type="danger" size="small" style="width: 40px" @click="handleStatusChange(scope.row, 2)">
                取消
              </el-button>
            </template>
            <!-- 已支付状态(1)：只显示取消订单 -->
            <template v-if="scope.row.orderStatus === 1">
              <el-button type="danger" size="small" style="width: 40px" @click="handleStatusChange(scope.row, 2)">
                取消
              </el-button>
            </template>
            <el-button type="primary" size="small" style="width: 40px"
              @click="handleDeleteProductOrder(scope.row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination v-model:current-page="pagination.current" v-model:page-size="pagination.size"
          :page-sizes="[10, 20, 50, 100]" :total="pagination.total" layout="total, sizes, prev, pager, next"
          @size-change="handleSizeChange" @current-change="handleCurrentChange" />
      </div>
    </div>

    <!-- 记账对话框 -->
    <el-dialog v-model="addDialogVisible" title="添加商品订单" width="600px">
      <el-form :model="addForm" ref="addFormRef" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="顾客姓名" prop="name">
              <el-input v-model="addForm.name" placeholder="请输入顾客姓名" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="手机号" prop="phone">
              <el-input v-model="addForm.phone" placeholder="请输入手机号" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="身份证号" prop="idCard">
              <el-input v-model="addForm.idCard" placeholder="请输入身份证号" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="顾客ID" prop="customerId">
              <el-input v-model="addForm.customerId" placeholder="请输入顾客ID" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="商品" prop="productId">
              <el-select v-model="addForm.productId" placeholder="请选择商品" style="width: 100%">
                <el-option :value="1" label="矿泉水" />
                <el-option :value="2" label="泡面" />
                <el-option :value="3" label="红牛" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="购买数量" prop="quantity">
              <el-input-number v-model="addForm.quantity" :min="1" placeholder="请输入购买数量" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="订单状态" prop="status">
              <el-select v-model="addForm.status" placeholder="请选择订单状态" style="width: 100%">
                <el-option label="全部状态" />
                <el-option label="待支付" :value="0" />
                <el-option label="已支付" :value="1" />
                <el-option label="已取消" :value="2" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="下单日期" prop="orderDate">
              <el-date-picker v-model="addForm.orderDate" type="datetime" placeholder="请选择下单日期" style="width: 100%"
                value-format="YYYY-MM-DD HH:mm:ss" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>

      <template #footer>
        <el-space>
          <el-button @click="addDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleAddOrder" :loading="addLoading">确定</el-button>
        </el-space>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { queryProductOrderInfo, updateProductOrderStatus, addProductOrder } from '../../api/order.js'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import { exportProductOrderExcel } from '../../api/order.js'
import { deleteProductOrder } from '../../api/order.js'

dayjs.locale('zh-cn')   // 启用中文

// 搜索表单
const searchForm = reactive({
  productName: '',
  orderStatus: '',
  orderDate: ''
})

// 商品订单数据
const orderList = ref([])
const loading = ref(false)

// 分页信息
const pagination = reactive({
  current: 1,
  size: 10,
  total: 0
})

// 根据id删除商品订单
const handleDeleteProductOrder = async (id) => {
  try {
    await deleteProductOrder(id)
    ElMessage.success('商品订单删除成功')
    getOrderList() // 删除成功后刷新数据
  } catch (error) {
    ElMessage.error('商品订单删除失败')
  }
}

// 获取订单列表
const getOrderList = async () => {
  loading.value = true
  try {
    const params = {
      OrderTime: searchForm.orderDate || undefined,
      productName: searchForm.productName || undefined,
      status: searchForm.orderStatus !== '' ? parseInt(searchForm.orderStatus) : undefined,
      pageNum: pagination.current,
      pageSize: pagination.size
    }
    const response = await queryProductOrderInfo(params)
    // 由于响应拦截器返回的是 response.data.data，所以 response 就是分页数据对象
    if (response && Array.isArray(response.records)) {
      const { records, total, current, size } = response
      // 处理订单数据并计算总金额
      orderList.value = records.map(item => {
        const quantity = item.quantity || 1
        const price = parseFloat(item.price) || 0
        const totalAmount = (price * quantity).toFixed(2)
        return {
          id: item.id, // 保存原始ID，用于API调用
          orderSn: `${item.id}`, // 生成订单编号用于显示
          productName: item.productName,
          quantity: quantity,
          price: price.toFixed(2),
          totalAmount: totalAmount,
          customerName: item.customerName,
          orderDate: dayjs(item.orderDate).format('YYYY-MM-DD HH:mm:ss'),
          orderStatus: parseInt(item.status)
        }
      })
      // 更新分页信息（后端已经处理了状态过滤，不需要前端再过滤）
      pagination.total = total
      pagination.current = current
      pagination.size = size
      // ElMessage.success('商品订单数据加载成功')
    } else {
      orderList.value = []
      pagination.total = 0
    }
  } catch (error) {
    console.error('请求失败:', error)
    ElMessage.error('获取商品订单数据失败')
    orderList.value = []
    pagination.total = 0
  } finally {
    loading.value = false
  }
}

// 状态修改
const handleStatusChange = async (row, newStatus) => {
  const statusMap = {
    1: '已支付',
    2: '已取消'
  }
  const statusText = statusMap[newStatus]
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
    // 调用后端API修改状态
    await updateProductOrderStatus(row.id, newStatus)
    ElMessage.success(`${statusText}操作成功`)
    // 重新加载当前页数据以确保数据一致性
    getOrderList()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('状态修改失败:', error)
      ElMessage.error(`${statusText}操作失败：${error.message || '未知错误'}`)
    }
  }
}

// 格式化日期
const formatDate = (dateStr) => {
  if (!dateStr) return ''
  if (dateStr instanceof Date) {
    return dateStr.toISOString().split('T')[0]
  }
  if (typeof dateStr === 'string') {
    return dateStr.split('T')[0]
  }
  return dateStr
}

// 搜索
const handleSearch = () => {
  pagination.current = 1 // 搜索时重置到第一页
  getOrderList()
}

// 重置
const handleReset = () => {
  Object.keys(searchForm).forEach(key => {
    searchForm[key] = ''
  })
  pagination.current = 1 // 重置时回到第一页
}

// 刷新数据
const refreshData = () => {
  getOrderList() // 保持当前页码
}

// 分页大小改变
const handleSizeChange = (size) => {
  pagination.size = size
  pagination.current = 1 // 改变页面大小时回到第一页
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
    0: 'warning',  // 待支付
    1: 'success',  // 已支付
    2: 'danger'    // 已取消
  }
  return statusMap[status] || 'info'
}

// 获取状态文本
const getStatusText = (status) => {
  const statusMap = {
    0: '待支付',
    1: '已支付',
    2: '已取消'
  }
  return statusMap[status] || '未知状态'
}

// 导出Excel
const handleExportExcel = async () => {
  try {
    const response = await exportProductOrderExcel({
      pageNum: pagination.current,
      pageSize: pagination.size,
      orderTime: searchForm.orderDate || undefined,
      productName: searchForm.productName || undefined,
      status: searchForm.orderStatus || undefined,
    })
    // 检查响应是否为有效的blob数据
    if (!response || response.size === 0) {
      ElMessage.error('导出数据为空')
      return
    }
    // 检查是否为错误响应（通常错误响应会是JSON格式）
    if (response.type === 'application/json') {
      const text = await response.text()
      const errorData = JSON.parse(text)
      ElMessage.error(errorData.message || '导出失败')
      return
    }
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
    link.download = `商品订单${randomNumber}.xlsx`
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
    ElMessage.error('导出失败: ' + (e.message || '未知错误'))
  }
}

// 组件挂载时获取数据
onMounted(() => {
  getOrderList()
})

// 记账对话框相关
const addDialogVisible = ref(false)
const addLoading = ref(false)
const addFormRef = ref()

// 添加订单表单
const addForm = reactive({
  customerId: null,
  productId: null,
  quantity: 1,
  status: 0,
  name: '',
  phone: '',
  idCard: '',
  orderDate: ''
})

// 打开添加对话框
const openAddDialog = () => {
  // 重置表单
  Object.keys(addForm).forEach(key => {
    if (key === 'quantity') {
      addForm[key] = 1
    } else if (key === 'status') {
      addForm[key] = 0
    } else if (key === 'orderDate') {
      addForm[key] = dayjs().format('YYYY-MM-DD HH:mm:ss')
    } else {
      addForm[key] = key.includes('Id') ? null : ''
    }
  })
  addDialogVisible.value = true
}

// 添加订单
const handleAddOrder = async () => {
  if (!addFormRef.value) return
  try {
    await addFormRef.value.validate()
    addLoading.value = true
    // 准备提交数据
    const submitData = {
      ...addForm,
      orderDate: dayjs(new Date(addForm.orderDate)).format('YYYY-MM-DD HH:mm:ss')
    }
    await addProductOrder(submitData)
    ElMessage.success('添加商品订单成功')
    addDialogVisible.value = false
    // 刷新列表
    getOrderList()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('添加订单失败:', error)
      ElMessage.error(error.message || '添加订单失败')
    }
  } finally {
    addLoading.value = false
  }
}

// 记账按钮点击事件
const account = () => {
  openAddDialog()
}
</script>

<style scoped>
.product-order {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.page-header h2 {
  font-size: 20px;
  color: #333;
  margin: 0;
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

@media (max-width: 1200px) {}

.product-order {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.page-header h2 {
  font-size: 20px;
  color: #333;
  margin: 0;
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

@media (max-width: 1200px) {}
</style>

<style scoped>
.product-order {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.page-header h2 {
  font-size: 20px;
  color: #333;
  margin: 0;
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

}
</style>