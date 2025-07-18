import api from './index.js'

// 分页查询客户信息
export const queryPageCustomer = (params) => {
  return api.get('/customer/queryPageCustomer', {
    params: params
  })
}