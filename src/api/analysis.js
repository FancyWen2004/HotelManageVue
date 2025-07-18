import api from './index.js'

// 查询年度营业额数据
export const queryTurnover = (year) => {
  return api.get(`/order/queryTurnover/${year}`)
}
