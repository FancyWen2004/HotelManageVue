<template>
  <div class="room-list-container">
    <div class="page-header">
      <div class="header-left">
        <el-button @click="goBack" type="default" class="back-btn">
          <el-icon>
            <ArrowLeft />
          </el-icon>
          返回房型设置
        </el-button>
        <h1>{{ roomTypeName }} - 房间列表</h1>
      </div>
    </div>

    <!-- 房间展示区域 -->
    <div class="rooms-section">
      <div class="rooms-grid" v-loading="loading">
        <div v-for="room in rooms" :key="room.id" class="room-item">
          <div class="room-number">{{ room.roomNumber }}</div>
        </div>
        <!-- 新增按钮-->
        <div class="room-item add-room">
          <el-button type="primary" @click="openAddRoom" size="large">新增房间</el-button>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="!loading && rooms.length === 0" class="empty-state">
        <el-empty description="暂无房间数据" />
      </div>
    </div>
  </div>

  <!-- 新增房间弹出框 -->
  <el-dialog v-model="dialogVisible" title="新增房间" width="400px">
    <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
      <el-form-item label="房间号" prop="roomNumber">
        <el-input v-model="form.roomNumber" placeholder="请输入房间号" />
      </el-form-item>
      <el-form-item label="房间状态" prop="status">
        <el-radio-group v-model="form.status">
          <el-radio label="0">脏房</el-radio>
          <el-radio label="1">未预定</el-radio>
          <el-radio label="2">已预订</el-radio>
          <el-radio label="3">已入住</el-radio>
          <el-radio label="4">锁房</el-radio>
        </el-radio-group>
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleAddRoom">保存</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getAllRoomNumbersByRoomTypeId, addRoom } from '../api/room.js';
import { ElMessage } from 'element-plus';
import { ArrowLeft } from '@element-plus/icons-vue';

const route = useRoute();
const router = useRouter();
const rooms = ref([]);
const loading = ref(false);

// 从路由参数获取房型信息
const roomTypeId = computed(() => route.params.roomTypeId);
const roomTypeName = computed(() => route.query.typeName || '未知房型');

// 获取房间列表数据
const fetchRooms = async () => {
  if (!roomTypeId.value) {
    ElMessage.error('房型ID不能为空');
    return;
  }

  loading.value = true;
  try {
    const data = await getAllRoomNumbersByRoomTypeId(roomTypeId.value);
    rooms.value = data || [];
    console.log('房间数据:', data);
  } catch (error) {
    console.error('获取房间数据失败:', error);
    ElMessage.error(error.message || '获取房间数据失败');
    rooms.value = [];
  } finally {
    loading.value = false;
  }
};

// 返回上一页
const goBack = () => {
  router.push('/settings');
};

// 组件挂载时获取数据
onMounted(() => {
  fetchRooms();
});

// 弹出框相关数据
const dialogVisible = ref(false)
const formRef = ref()

// 表单数据
const form = ref({
  roomNumber: '',
  status: '1', // 默认空闲状态
  roomTypeId: '', // 当前房型ID
  hotelId: 1 // 根据实际情况设置酒店ID
})

// 表单验证规则
const rules = {
  roomNumber: [
    { required: true, message: '请输入房间号', trigger: 'blur' },
    { min: 1, max: 20, message: '房间号长度在 1 到 20 个字符', trigger: 'blur' }
  ],
  status: [
    { required: true, message: '请选择房间状态', trigger: 'change' }
  ]
}

// 打开新增房间弹出框
const openAddRoom = () => {
  // 重置表单
  form.value = {
    roomNumber: '',
    status: '1',
    roomTypeId: roomTypeId.value,
    hotelId: 1
  }
  dialogVisible.value = true
}

// 处理新增房间
const handleAddRoom = async () => {
  if (!formRef.value) return
  
  try {
    // 表单验证
    await formRef.value.validate()
    // 调用API新增房间
    await addRoom(form.value)
    ElMessage.success('房间添加成功')
    dialogVisible.value = false
    // 刷新房间列表
    await fetchRooms()
  } catch (error) {
    console.error('添加房间失败:', error)
    ElMessage.error(error.message || '添加房间失败')
  }
}
</script>

<style scoped>
.room-list-container {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  border-radius: 8px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 15px;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 5px;
  color: #409eff;
  font-size: 14px;
}

.back-btn:hover {
  color: #66b1ff;
}

.page-header h1 {
  font-size: 24px;
  color: #333;
  margin: 0;
}

.rooms-section {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.rooms-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 15px;
}

.room-item {
  background: #f8f9fa;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  transition: all 0.3s ease;
  cursor: pointer;
  min-height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.room-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-color: #409eff;
  background: #ecf5ff;
}

.room-number {
  font-size: 20px;
  font-weight: bold;
  color: #333;
}

.empty-state {
  text-align: center;
  padding: 60px 0;
}
</style>