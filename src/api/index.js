import axios from 'axios'

// 创建 axios 实例
const api = axios.create({
  baseURL: 'http://localhost:8080',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
api.interceptors.request.use(
  config => {
    // 在发送请求之前：记录请求信息
    console.log('发送请求:', config.method?.toUpperCase(), config.url, config.params || config.data)
    return config
  },
  error => {
    console.error('请求错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
api.interceptors.response.use(
  response => {
    // 对于blob类型的响应，直接返回data
    if (response.config.responseType === 'blob') {
      return response.data;
    }
    // 检查后端返回的 Result 结构
    if (response.data && typeof response.data === 'object') {
      // 如果有 code 字段，说明是 Result 包装格式
      if ('code' in response.data) {
        if (response.data.code === 200) {
          // 成功时返回 data 字段
          return response.data.data
        } else {
          // 业务错误
          const error = new Error(response.data.msg || '请求失败')
          error.code = response.data.code
          return Promise.reject(error)
        }
      }
    }
    
    // 如果不是 Result 格式，直接返回
    return response.data
  },
  error => {
    console.error('响应错误:', error)
    
    // 处理 HTTP 错误状态码
    if (error.response) {
      const { status, data } = error.response
      let message = '请求失败'
      
      switch (status) {
        case 400:
          message = '请求参数错误'
          break
        case 401:
          message = '未授权访问'
          break
        case 403:
          message = '禁止访问'
          break
        case 404:
          message = '请求的资源不存在'
          break
        case 500:
          message = '服务器内部错误'
          break
        default:
          message = data?.msg || data?.message || `请求失败 (${status})`
      }
      
      const apiError = new Error(message)
      apiError.status = status
      apiError.response = error.response
      return Promise.reject(apiError)
    } else if (error.request) {
      // 设置弹出错误的弹出时间
      const timeout = 3000
      return Promise.reject(new Error('网络错误，请检查网络连接'))
    } else {
      return Promise.reject(new Error('请求配置错误'))
    }
  }
)

export default api