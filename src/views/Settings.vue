<template>
  <div class="settings-container">
    <div class="page-header">
      <h1>房型设置</h1>
    </div>
    <main class="main-content">
      <div class="room-list" v-loading="loading">
        <el-row :gutter="20">
          <el-col :span="8" v-for="room in rooms" :key="room.id">
            <el-card class="room-card" shadow="hover">
              <template #header>
                <div class="card-header">
                  <span class="room-title">{{ room.typeName }}</span>
                </div>
              </template>

              <div class="room-image">
                <el-image :src="room.img" :alt="room.typeName" fit="cover" style="width: 100%; height: 200px;" />
              </div>

              <div class="room-details">
                <el-descriptions :column="1" size="small">
                  <el-descriptions-item label="房间数量">{{ room.totalRooms }}间</el-descriptions-item>
                  <el-descriptions-item label="房型描述">{{ room.description }}</el-descriptions-item>
                </el-descriptions>
              </div>

              <div class="room-actions">
                <el-space>
                  <el-button type="text" @click="viewRoomList(room)">
                    查看房间列表
                  </el-button>
                  <el-button type="primary" size="small" @click.stop="editRoom(room)">
                    编辑
                  </el-button>
                </el-space>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>
    </main>

    <!-- 编辑房型对话框 -->
    <el-dialog v-model="editDialogVisible" title="编辑房型" width="500px">
      <el-form :model="editForm" :rules="rules" ref="editFormRef" label-width="80px">
        <el-form-item label="房型名称" prop="typeName">
          <el-input v-model="editForm.typeName" placeholder="请输入房型名称" />
        </el-form-item>
        <el-form-item label="房型描述" prop="description">
          <el-input v-model="editForm.description" type="textarea" :rows="3" placeholder="请输入房型描述" />
        </el-form-item>
        <el-form-item label="房型图片">
          <div class="upload-section">
            <!-- 显示当前图片 -->
            <div v-if="editForm.img" class="current-image">
              <el-text size="small" type="info">当前图片：</el-text>
              <el-image :src="editForm.img" alt="当前房型图片" style="width: 150px; height: 150px; margin-top: 8px;"
                fit="cover" />
            </div>

            <!-- 上传新图片 -->
            <div class="upload-area" style="margin-top: 16px;">
              <el-text size="small" type="info">上传新图片：</el-text>
              <el-upload class="upload-demo" :before-upload="beforeUpload" :http-request="handleUpload"
                :show-file-list="false" accept="image/*" style="margin-top: 8px;">
                <el-button type="primary">选择图片</el-button>
              </el-upload>
              <div v-if="uploadedImageUrl && uploadedImageUrl !== editForm.img" style="margin-top: 16px;">
                <el-text size="small" type="info">新上传的图片：</el-text>
                <el-image :src="uploadedImageUrl" alt="新上传的图片" style="width: 150px; height: 150px; margin-top: 8px;"
                  fit="cover" />
              </div>
            </div>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-space>
          <el-button @click="editDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveRoomType" :loading="saveLoading">保存</el-button>
        </el-space>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { getAllRoomTypesWithRoomCount, getAllRoomTypes, updateRoomType, uploadFile } from '../api/room.js';
import { ElMessage, ElMessageBox } from 'element-plus';

const rooms = ref([]);
const loading = ref(false);
const router = useRouter();

// 编辑相关状态
const editDialogVisible = ref(false);
// 编辑相关状态
const editForm = ref({
  id: null,
  typeName: '',
  description: '',
  img: ''
});

// 表单验证规则
const rules = {
  typeName: [
    { required: true, message: '请输入房型名称', trigger: 'blur' }
  ],
  description: [
    { required: true, message: '请输入房型描述', trigger: 'blur' }
  ]
};

// 编辑房型
const editRoom = async (room) => {
  try {
    // 获取完整的房型信息用于回显
    const allRoomTypes = await getAllRoomTypes();
    const roomDetail = allRoomTypes.find(r => r.id === room.id);

    if (roomDetail) {
      editForm.value = {
        id: roomDetail.id,
        typeName: roomDetail.typeName,
        description: roomDetail.description,
        img: roomDetail.img
      };
      // 重置上传的图片URL，显示原始图片
      uploadedImageUrl.value = roomDetail.img;
    }

    editDialogVisible.value = true;
  } catch (error) {
    console.error('获取房型详情失败:', error);
    ElMessage.error('获取房型详情失败');
  }
};
const editFormRef = ref();
const saveLoading = ref(false);
const uploadedImageUrl = ref('');


// 获取房型数据
const fetchRoomTypes = async () => {
  loading.value = true;
  try {
    const data = await getAllRoomTypesWithRoomCount();
    rooms.value = data || [];
    console.log('房型数据:', data);
  } catch (error) {
    console.error('获取房型数据失败:', error);
    ElMessage.error(error.message || '获取房型数据失败');
    rooms.value = [];
  } finally {
    loading.value = false;
  }
};

// 查看房间列表
const viewRoomList = (room) => {
  router.push({
    path: `/settings/rooms/${room.id}`,
    query: {
      typeName: room.typeName
    }
  });
};

// 文件上传前验证
const beforeUpload = (file) => {
  const isImage = file.type.startsWith('image/');
  const isLt2M = file.size / 1024 / 1024 < 2;

  if (!isImage) {
    ElMessage.error('只能上传图片文件!');
    return false;
  }
  if (!isLt2M) {
    ElMessage.error('上传图片大小不能超过 2MB!');
    return false;
  }
  return true;
};

// 自定义上传
const handleUpload = async (options) => {
  try {
    const response = await uploadFile(options.file);
    uploadedImageUrl.value = response;
    editForm.value.img = response;
    ElMessage.success('图片上传成功');
  } catch (error) {
    console.error('图片上传失败:', error);
    ElMessage.error('图片上传失败');
  }
};

// 保存房型信息
const saveRoomType = async () => {
  if (!editFormRef.value) return;
  try {
    await editFormRef.value.validate();
    saveLoading.value = true;
    // 确保使用最新上传的图片URL
    const roomTypeData = {
      ...editForm.value,
      img: uploadedImageUrl.value || editForm.value.img
    };
    roomTypeData.hotel_id = 1; // 假设酒店ID为1
    console.log('准备保存的房型数据:', roomTypeData); // 添加调试信息
    await updateRoomType(roomTypeData);
    // ElMessage.success('房型信息更新成功');
    editDialogVisible.value = false;
    // 重新获取数据
    await fetchRoomTypes();
  } catch (error) {
    console.error('保存失败:', error);
    ElMessage.error(error.message || '保存失败');
  } finally {
    saveLoading.value = false;
  }
};

// 组件挂载时获取数据
onMounted(() => {
  fetchRoomTypes();
});
</script>

<style scoped>
.settings-container {
  padding: 20px;
  background: #f5f7fa;
  min-height: 100vh;
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
.main-content {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.room-list {
  width: 100%;
}

.room-card {
  margin-bottom: 20px;
  border-radius: 8px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.room-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.room-image {
  margin-bottom: 16px;
  border-radius: 4px;
  overflow: hidden;
}

.room-details {
  margin-bottom: 16px;
}

.room-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid #ebeef5;
}

.upload-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.current-image,
.upload-area {
  display: flex;
  flex-direction: column;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .room-list :deep(.el-col) {
    width: 50% !important;
    flex: 0 0 50% !important;
    max-width: 50% !important;
  }
}

@media (max-width: 768px) {
  .room-list :deep(.el-col) {
    width: 100% !important;
    flex: 0 0 100% !important;
    max-width: 100% !important;
  }

  .settings-container {
    padding: 10px;
  }
}
</style>
