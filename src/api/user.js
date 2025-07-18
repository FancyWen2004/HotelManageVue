import api from './index.js'

// 获取登录验证码
export const getLoginCode = (key) => {
  return api.get('/user/getLoginCode', {
    params: { key },
    responseType: 'blob' // 返回验证码图片
  })
}

// 用户登录
export const login = (userDto, key, checkCode) => {
  return api.post('/user/login', userDto, {
    params: { key, checkCode }
  })
}

// 用户注册
export const register = (registerData) => {
  return api.post('/user/register', registerData)
}