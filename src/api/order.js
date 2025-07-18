import api from './index.js'

// 查询订单信息
export const queryOrderInfo = (params) =>
    api.get('/order/queryOrderInfo', { params })

// 修改订单状态
export const updateOrderStatus = (orderSn, orderStatus) =>
    api.get('/order/updateOrderStatus', { params: { orderSn, orderStatus } })

// 导出 Excel：使用同一套 api 实例，只改 responseType
export const exportExcel = (params) =>
    api({
      url: '/order/excel',
      method: 'get',
      params,
      responseType: 'blob',
    })

// 查询商品订单信息
export const queryProductOrderInfo = (params) =>
    api.get('/productOrder/findProductOrder', { params })

// 修改商品订单状态
export const updateProductOrderStatus = (id, status) =>
    api.get('/productOrder/updateProductOrderStatus', { params: { id, status } })

// 导出商品订单 Excel
export const exportProductOrderExcel = (params) =>
    api({
      url: '/productOrder/exportProductExcel',
      method: 'get',
      params,
      responseType: 'blob',
    })

// 添加商品订单
export const addProductOrder = (data) =>
    api.post('/productOrder/addProductOrder', data)

// 根据id删除商品订单
export const deleteProductOrder = (id) =>
    api.delete(`/productOrder/deleteProductOrder/${id}`)

// 添加房间订单
export const addRoomOrder = (data) =>
    api.post('/order/addRoomOrder', data)