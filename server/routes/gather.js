const path = require("path")
const fs = require("fs")
const { limiter } = require('../utils/tokenMiddleware')

// 获取所有导出模块
const asynchronousExecution = async (pathName) => {
  let dirs = {};
  const processFile = async (filePath) => {
    const files = await fs.promises.readdir(filePath);
    for (const item of files) {
      const fPath = path.join(filePath, item);
      const stats = await fs.promises.stat(fPath);

      if (stats.isDirectory()) {
        await processFile(fPath); // 递归处理子文件夹
      } else if (stats.isFile() && path.extname(fPath) === '.js') {
        const fileContent = require(fPath);
        for (const key in fileContent) {
          if (fileContent.hasOwnProperty(key)) {
            dirs[key] = fileContent[key];
          }
        }
      }
    }
  };

  await processFile(pathName);
  return dirs;
};

// 等待asynchronousExecution执行完毕后再执行下面的代码
const verifyParams = require('../config/verifyParamsMiddleware');

module.exports = async (router) => {
  const _c = await asynchronousExecution(__dirname.replace('routes', 'controls'))

  // 读取文件
  router.get('/read:path(*)', _c.read)

  // 登录
  router.post('/login', verifyParams([{ username: '账号' }, { password: '密码' }], 'body'), _c.mlogin)
  // 退出登录
  router.post('/logout', _c.logout)
  // 获取用户信息
  router.get('/getInfo', _c.getInfo)

  // 分配角色
  router.get('/system/user/authRole/:userId', _c.getAuthRoleList)
  // 批量分配角色
  router.put('/system/user/authRole', _c.authorizeAllAuthRole)

  // 获取用户资料
  router.get('/system/user/:id', _c.getUser)

  // 修改密码
  router.put('/system/user/profile/updatePwd', _c.updatePwd)

  // 新增用户
  router.post('/system/user', $$has(['system:user:add']), _c.addUser)
  // 修改用户信息
  router.put('/system/user/:id?', $$has(['system:user:edit']), _c.updateUser)
  // 删除用户
  router.delete('/system/user/:ids', $$has(['system:user:remove']), _c.deleteUser)

  // 获取角色列表 部门列表 岗位列表
  router.get('/system/user/', _c.roleAndDeptAndPostList)

  // 获取路由
  router.get('/getRouters', _c.getRouters)

  // 获取菜单列表
  router.get('/system/menu/:id/:roleId?', _c.getMenu)
  // 新增菜单
  router.post('/system/menu', $$has(['system:menu:add']), _c.addMenu)
  // 修改菜单信息
  router.put('/system/menu', $$has(['system:menu:edit']), _c.updateMenu)
  // 删除菜单
  router.delete('/system/menu/:menuId', $$has(['system:menu:remove']), _c.deleteMenu)

  // 获取部门列表 除了传入的deptId
  router.get('/system/dept/list/exclude/:deptId', _c.getDeptListExclude)
  // 获取部门列表
  router.get('/system/dept/:deptId?', _c.getDept)
  // 新增部门
  router.post('/system/dept', $$has(['system:dept:add']), _c.addDept)
  // 修改部门信息
  router.put('/system/dept', $$has(['system:dept:edit']), _c.updateDept)
  // 删除部门
  router.delete('/system/dept/:deptId', $$has(['system:dept:remove']), _c.deleteDept)

  // 获取岗位列表
  router.get('/system/post/:postId?', _c.getPost)
  // 新增岗位
  router.post('/system/post', $$has(['system:post:add']), _c.addPost)
  // 修改岗位信息
  router.put('/system/post', $$has(['system:post:edit']), _c.updatePost)
  // 删除岗位
  router.delete('/system/post/:postId', $$has(['system:post:remove']), _c.deletePost)

  // 获取字典列表
  router.get('/system/dict/type/:dictId?', _c.getDictType)
  // 新增字典
  router.post('/system/dict/type', $$has(['system:dict:add']), _c.addDictType)
  // 修改字典信息
  router.put('/system/dict/type', $$has(['system:dict:edit']), _c.updateDictType)
  // 删除字典
  router.delete('/system/dict/type/:dictId', $$has(['system:dict:remove']), _c.deleteDictType)

  // 获取字段数据类型
  router.get('/system/dict/data/type/:dictType', _c.getDictDataType)
  // 获取字典数据列表
  router.get('/system/dict/data/:dictCode?', _c.getDictData)
  // 新增字典数据
  router.post('/system/dict/data', $$has(['system:dict:add']), _c.addDictData)
  // 修改字典数据信息
  router.put('/system/dict/data', $$has(['system:dict:edit']), _c.updateDictData)
  // 删除字典数据
  router.delete('/system/dict/data/:dictCode', $$has(['system:dict:remove']), _c.deleteDictData)

  // 获取系统公告
  router.get('/system/notice/:noticeId?', _c.getNotice)
  // 新增系统公告
  router.post('/system/notice', $$has(['system:notice:add']), _c.addNotice)
  // 修改系统公告信息
  router.put('/system/notice', $$has(['system:notice:edit']), _c.updateNotice)
  // 删除系统公告
  router.delete('/system/notice/:noticeId', $$has(['system:notice:remove']), _c.deleteNotice)


  // 查询字典
  // router.get('/system/dict/data/type/:dtype', _c.dtypeFindData)

  // 分配用户
  router.get('/system/role/authUser/allocatedList', _c.allocatedList)
  // 获取未分配用户列表
  router.get('/system/role/authUser/unallocatedList', _c.unallocatedList)
  // 取消授权
  router.put('/system/role/authUser/cancel', _c.cancelAuthUser)
  // 批量取消授权
  router.put('/system/role/authUser/cancelAll', _c.cancelAllAuthUser)
  // 批量授权
  router.put('/system/role/authUser/selectAll', _c.authorizeAllAuthUser)

  // 获取角色信息
  router.get('/system/role/:id/:roleId?', _c.getRole)
  // 新增角色
  router.post('/system/role', $$has(['system:role:add']), _c.addRole)
  // 修改角色信息
  router.put('/system/role/:id?', $$has(['system:role:edit']), _c.updateRole)
  // 删除角色
  router.delete('/system/role/:ids', $$has(['system:role:remove']), _c.deleteRole)

  // 获取登录日志
  router.get('/monitor/logininfor/list', _c.getLoginLog)
  // 清空登录日志
  router.delete('/monitor/logininfor/clean', $$has(['monitor:logininfor:remove']), _c.cleanLoginLog)
  // 删除登录日志
  router.delete('/monitor/logininfor/:infoId', $$has(['monitor:logininfor:remove']), _c.deleteLoginLog)

  // 服务监控
  router.get('/monitor/server', $$has(['monitor:server:list']), _c.getServerInfo)

  // 上传图片
  router.post('/common/upload', _c.upload)

  /* 获取七牛云token */
  router.get('/common/qn-token/:bucket?', _c.getQiniuToken)

}
