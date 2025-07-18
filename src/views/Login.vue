<template>
  <div class="login-container">
    <!-- 左侧图片区域 -->
    <div class="login-left">
      <div class="image-container">
        <img src="../assets/face.jpg" alt="酒店管理系统" class="login-image" />
      </div>
    </div>

    <!-- 右侧登录表单区域 -->
    <div class="login-right">
      <div class="login-box">
        <div class="login-header">
          <h2 class="login-title">用户登录</h2>
          <p class="login-subtitle">欢迎回来，请登录您的账户</p>
        </div>

        <el-form ref="loginFormRef" :model="loginForm" :rules="loginRules" class="login-form"
          @submit.prevent="handleLogin">
          <!-- 手机号输入 -->
          <el-form-item prop="phone">
            <el-input v-model="loginForm.phone" placeholder="请输入手机号" prefix-icon="Phone" size="large" clearable
              class="form-input" />
          </el-form-item>

          <!-- 密码输入 -->
          <el-form-item prop="password">
            <el-input v-model="loginForm.password" type="password" placeholder="请输入密码" prefix-icon="Lock" size="large"
              show-password clearable class="form-input" />
          </el-form-item>

          <!-- 验证码输入 -->
          <el-form-item prop="captcha">
            <div class="captcha-container">
              <el-input v-model="loginForm.captcha" placeholder="请输入验证码" prefix-icon="Picture" size="large" clearable
                class="captcha-input" />
              <div class="captcha-image" @click="refreshCaptcha">
                <img v-if="captchaUrl" :src="captchaUrl" alt="验证码" class="captcha-img" />
                <div v-else class="captcha-placeholder">
                  点击获取验证码
                </div>
              </div>
            </div>
          </el-form-item>

          <!-- 登录按钮 -->
          <el-form-item>
            <el-button type="primary" size="large" class="login-button" :loading="loading" @click="handleLogin">
              登录
            </el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getLoginCode, login } from '../api/user.js'
import { useRouter } from 'vue-router'

const router = useRouter()

// 表单引用
const loginFormRef = ref()

// 加载状态
const loading = ref(false)

// 验证码相关
const captchaKey = ref('')
const captchaUrl = ref('')

// 表单数据
const loginForm = reactive({
  phone: '',
  password: '',
  captcha: ''
})

// 表单验证规则
const loginRules = {
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    {
      pattern: /^1[3-9]\d{9}$/,
      message: '请输入正确的手机号格式',
      trigger: 'blur'
    }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ],
  captcha: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { min: 4, max: 6, message: '验证码长度为4-6位', trigger: 'blur' }
  ]
}

// 生成随机key
const generateKey = () => {
  return Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
}

// 获取验证码
const getCaptcha = async () => {
  try {
    captchaKey.value = generateKey()
    const response = await getLoginCode(captchaKey.value)
    // 使用response，因为拦截器已经返回了blob数据
    const blob = new Blob([response], { type: 'image/png' })
    captchaUrl.value = URL.createObjectURL(blob)
  } catch (error) {
    console.error('获取验证码失败:', error)
    ElMessage.error('获取验证码失败，请重试')
  }
}

// 处理登录
const handleLogin = async () => {
  if (!loginFormRef.value) return

  try {
    // 表单验证
    await loginFormRef.value.validate()
    if (!captchaKey.value) {
      ElMessage.error('请先获取验证码')
      return
    }
    loading.value = true
    // 构建用户数据
    const userDto = {
      phone: loginForm.phone,
      password: loginForm.password
    }
    // 调用登录接口，传递userDto、key和checkCode
    const response = await login(userDto, captchaKey.value, loginForm.captcha)
    // 登录成功 - 保存登录状态和用户信息
    localStorage.setItem('userToken', response.token || 'logged_in')
    // 保存用户信息
    const userInfo = {
      phone: loginForm.phone,
      name: response.name || response.username || loginForm.phone,
      username: response.username || loginForm.phone,
      ...response // 保存后端返回的其他用户信息
    }
    // 保存用户信息到本地存储
    localStorage.setItem('userInfo', JSON.stringify(userInfo))
    ElMessage.success('登录成功')
    // 跳转到主页
    await router.push('/room-status')
  } catch (error) {
    console.error('登录失败:', error)
    ElMessage.error(error.message || '登录失败')
    // 登录失败后刷新验证码
    refreshCaptcha()
  } finally {
    loading.value = false
  }
}

// 刷新验证码
const refreshCaptcha = () => {
  getCaptcha()
}

// 组件挂载时获取验证码
onMounted(() => {
  getCaptcha()
})
</script>

<style scoped>
.login-container {
  display: flex;
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

/* 左侧图片区域 */
.login-left {
  flex: 1;
  position: relative;
  background: linear-gradient(135deg, #9AE6B4 0%, #68D391 50%, #48BB78 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.image-container {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-image {
  width: 80%;
  max-width: 500px;
  height: auto;
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  object-fit: cover;
}

/* 右侧登录表单区域 */
.login-right {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  background: white;
}

.login-box {
  width: 100%;
  max-width: 420px;
  padding: 50px 40px;
  background: white;
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  border: 1px solid #e4e7ed;
}

.login-header {
  text-align: center;
  margin-bottom: 40px;
}

.login-title {
  font-size: 28px;
  font-weight: 700;
  color: #2d3748;
  margin: 0 0 10px 0;
  background: linear-gradient(135deg, #48BB78, #38A169);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.login-subtitle {
  font-size: 14px;
  color: #718096;
  margin: 0;
  font-weight: 400;
}

.login-form {
  width: 100%;
}

.form-input {
  margin-bottom: 8px;
}

.captcha-container {
  display: flex;
  gap: 12px;
  align-items: center;
}

.captcha-input {
  flex: 1;
}

.captcha-image {
  width: 120px;
  height: 40px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f7fafc;
  transition: all 0.3s ease;
  overflow: hidden;
}

.captcha-image:hover {
  border-color: #48BB78;
  box-shadow: 0 0 0 3px rgba(72, 187, 120, 0.1);
}

.captcha-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.captcha-placeholder {
  font-size: 12px;
  color: #a0aec0;
  text-align: center;
  line-height: 1.2;
  padding: 0 8px;
}

.login-button {
  width: 100%;
  height: 48px;
  margin-top: 20px;
  background: linear-gradient(135deg, #48BB78 0%, #38A169 100%);
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(72, 187, 120, 0.3);
}

.login-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(72, 187, 120, 0.4);
  background: linear-gradient(135deg, #38A169 0%, #2F855A 100%);
}

.login-button:active {
  transform: translateY(0);
}

/* Element Plus 样式覆盖 */
:deep(.el-form-item) {
  margin-bottom: 24px;
}

:deep(.el-input__wrapper) {
  border-radius: 12px;
  border: 2px solid #e2e8f0;
  box-shadow: none;
  transition: all 0.3s ease;
  padding: 12px 16px;
}

:deep(.el-input__wrapper:hover) {
  border-color: #9AE6B4;
}

:deep(.el-input__wrapper.is-focus) {
  border-color: #48BB78;
  box-shadow: 0 0 0 3px rgba(72, 187, 120, 0.1);
}

:deep(.el-input__inner) {
  font-size: 15px;
  color: #2d3748;
}

:deep(.el-input__prefix) {
  color: #68D391;
}

:deep(.el-form-item__error) {
  color: #e53e3e;
  font-size: 12px;
  margin-top: 4px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .login-container {
    flex-direction: column;
  }

  .login-left {
    min-height: 40vh;
  }

  .login-right {
    padding: 20px;
  }

  .login-box {
    padding: 30px 20px;
  }

  .system-title {
    font-size: 24px;
  }

  .image-overlay {
    bottom: 30px;
    padding: 20px 30px;
  }
}

@media (max-width: 480px) {
  .login-left {
    min-height: 30vh;
  }

  .login-image {
    width: 90%;
  }

  .captcha-container {
    flex-direction: column;
    gap: 8px;
  }

  .captcha-image {
    width: 100%;
    height: 45px;
  }
}
</style>