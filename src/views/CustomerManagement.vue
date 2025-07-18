<template>
  <div class="customer-management">
    <div class="page-header">
      <h1>客户管理</h1>
    </div>

    <!-- 查询条件区域 -->
    <div class="search-section">
      <el-form :model="searchForm" class="search-form">
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="入住日期范围">
              <el-date-picker v-model="searchForm.dateRange" type="daterange" start-placeholder="入住日期"
                end-placeholder="退房日期" value-format="YYYY-MM-DD" size="default" style="width: 100%" clearable />
            </el-form-item>
          </el-col>

          <el-col :span="6">
            <el-form-item label="客户信息">
              <el-input v-model="searchForm.searchText" placeholder="请输入客户姓名" size="default" style="width: 100%"
                clearable />
            </el-form-item>
          </el-col>

          <el-col :span="10">
            <el-form-item class="button-group">
              <el-button type="primary" @click="handleSearch" :loading="loading">查询</el-button>
              <el-button @click="handleReset" :loading="loading">重置</el-button>
              <el-button @click="refreshData">刷新</el-button>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </div>

    <!-- 表格展示 -->
    <div class="table-section">
      <el-table :data="tableData" border style="width: 100%" v-loading="loading" stripe empty-text="暂无数据">
        <el-table-column prop="customerName" label="客户姓名" min-width="120"></el-table-column>
        <el-table-column prop="idCard" label="身份证" min-width="120"></el-table-column>
        <el-table-column prop="roomNumber" label="房间号" min-width="100"></el-table-column>
        <el-table-column prop="checkinDate" label="入住日期" min-width="120">
          <template #default="scope">
            {{ formatDate(scope.row.checkinDate) }}
          </template>
        </el-table-column>
        <el-table-column prop="checkoutDate" label="退房日期" min-width="120">
          <template #default="scope">
            {{ formatDate(scope.row.checkoutDate) }}
          </template>
        </el-table-column>
        <el-table-column prop="night" label="住宿天数" min-width="100">
          <template #default="scope">
            {{ scope.row.night }}晚
          </template>
        </el-table-column>
        <el-table-column prop="orderAmount" label="订单金额（元）" min-width="130">
          <template #default="scope">
            ¥{{ scope.row.orderAmount }}
          </template>
        </el-table-column>
        <el-table-column prop="source" label="预订来源" min-width="100"></el-table-column>
      </el-table>

      <!-- 分页区域容器 -->
      <div class="pagination-wrapper">
        <el-pagination v-model:current-page="pagination.current" v-model:page-size="pagination.size"
          :page-sizes="[10, 20, 50, 100]" :total="pagination.total" layout="total, sizes, prev, pager, next"
          @size-change="handleSizeChange" @current-change="handleCurrentChange" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { queryPageCustomer } from '../api/customer.js'
import { ElMessage } from 'element-plus'

// 搜索表单
const searchForm = reactive({
  dateRange: [], // 起止日期
  searchText: '', // 搜索文本
})

// 表格数据
const tableData = ref([])
const loading = ref(false)

// 分页信息
const pagination = reactive({
  current: 1,
  size: 10,
  total: 0
})

// 获取表格数据
const getTableData = async () => {
  loading.value = true
  try {
    // 构建查询参数
    const params = {
      pageNum: pagination.current,
      pageSize: pagination.size
    }

    // 添加日期范围查询
    if (searchForm.dateRange && searchForm.dateRange.length === 2) {
      params.checkinDate = searchForm.dateRange[0]
      params.checkoutDate = searchForm.dateRange[1]
    }

    // 姓名模糊搜索
    if (searchForm.searchText && searchForm.searchText.trim()) {
      params.customerName = searchForm.searchText.trim();
    }

    // 调用API
    const result = await queryPageCustomer(params)
    // 处理返回数据
    tableData.value = result.records || []
    pagination.total = result.total || 0
  } catch (error) {
    console.error('获取客户数据失败:', error)
    ElMessage.error(error.message || '获取客户数据失败')
    tableData.value = []
    pagination.total = 0
  } finally {
    loading.value = false
  }
}

// 处理搜索
const handleSearch = () => {
  pagination.current = 1
  getTableData()
}

// 处理重置
const handleReset = () => {
  Object.keys(searchForm).forEach(key => {
    if (Array.isArray(searchForm[key])) {
      searchForm[key] = []
    } else {
      searchForm[key] = ''
    }
  })
  pagination.current = 1
  getTableData()
}

// 刷新数据
const refreshData = () => {
  getTableData()
}

// 处理每页条数变化
const handleSizeChange = (size) => {
  pagination.size = size
  pagination.current = 1
  getTableData()
}

// 处理页码变化
const handleCurrentChange = (current) => {
  pagination.current = current
  getTableData()
}

// 格式化日期
const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  // 如果是 YYYY-MM-DD 格式，直接返回
  if (typeof dateStr === 'string' && dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
    return dateStr
  }
  // 其他格式尝试转换
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN')
}

// 组件挂载时获取数据
onMounted(() => {
  getTableData()
})
</script>

<style scoped>
.customer-management {
  padding: 20px;
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