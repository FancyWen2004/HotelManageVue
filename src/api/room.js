import api from './index.js'

// 获取所有房型
export const getAllRoomTypes = () => {
  return api.get('/room/getAllRoomTypes')
}

// 根据房型ID获取所有房间号
export const getAllRoomNumbersByRoomTypeId = (roomTypeId) => {
  return api.get('/room/getAllRoomNumbersByRoomTypeId', {
    params: { roomTypeId }
  })
}

// 查看某一天内的房间出租情况
export const getSaleStatusInOneDay = (date, roomTypeId = null) => {
  const params = { date }
  if (roomTypeId) {
    params.roomTypeId = roomTypeId
  }
  return api.get('/room/saleStatusInOneDay', { params })
}

// 查看多日内的房间出租情况
export const getSaleStatusInPeriod = (startDate, endDate, roomTypeId) => {
  return api.get('/room/saleStatusInPeriod', {
    params: { startDate, endDate, roomTypeId }
  })
}

// 根据客户信息查询订单
export const searchByCustomer = (customerName = null, customerPhone = null) => {
  const params = {}
  if (customerName) params.customerName = customerName
  if (customerPhone) params.customerPhone = customerPhone
  return api.get('/room/searchByCustomer', { params })
}

// 获取所有房型信息及房间数量
export const getAllRoomTypesWithRoomCount = () => {
  return api.get('/room/getAllRoomTypesWithRoomCount')
}

// 更新房型信息
export const updateRoomType = (roomType) => {
  return api.post('/room/updateRoomType', roomType)
}

// 上传文件
export const uploadFile = (file) => {
  const formData = new FormData()
  formData.append('file', file)
  return api.post('/common/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

// 新增房间
export const addRoom = (roomInfo) => {
  return api.post('/room/addRoom', roomInfo)
}