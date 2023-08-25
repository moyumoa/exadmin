import request from '@/utils/request'

export const getInfo = params => request({ url: '/getInfo', method: 'get', params })

// 上传文件
export const upload = params => request({ url: '/common/upload', method: 'post', data: params, headers: { 'Content-Type': 'multipart/form-data' } })
// 获取七牛token
export const getQiniuToken = params => request({ url: `/common/qn-token`, method: 'get', params })
// 获取七牛buckets列表
export const getQiniuBuckets = d => request(d)
