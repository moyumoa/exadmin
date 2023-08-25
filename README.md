<p align="center">
	<img alt="logo" src="https://minipro.cvxv.cn/chat/funclist/cip.png">
</p>
<h1 align="center" style="margin: 30px 0 30px; font-weight: bold;">ExAdmin v0.0.1</h1>
<h4 align="center">基于Express+Vue3的前后端分离后台模板</h4>
<p align="center">
    <a href="https://github.com/moyumoa/exadmin.git"><img src="https://img.shields.io/badge/ExAdmin-V0.0.1-brightgreen?style=flat-square"></a>
		<a href="https://github.com/moyumoa/exadmin.git" style="margin-left: 10px"><img src="https://img.shields.io/github/stars/moyumoa/exadmin.svg?style=social"></a>
</p>

# 目前还在完善阶段

## 简介

+ 前端代码在 **views** 目录

+ 技术栈使用 [Vue3](https://v3.cn.vuejs.org) + [Element Plus](https://element-plus.org/zh-CN) + [Vite](https://cn.vitejs.dev)

+ 后端代码在 **server** 目录

+ 技术栈使用 [NodeJs](https://nodejs.org) + [Express](https://expressjs.com) + [Mysql](https://www.mysql.com/cn) + [Sequelize](https://sequelize.org)

+ 本项目前端模板使用的是若依, 只是UI样式略有改动, 后端代码改成了NodeJs+Express, 如果你不想使用本项目前端代码, 那你依旧可以使用若依的前端模板, 基础路由和请求接口名称不变, 只是需要把接收token的方式改为headers, 详见目录utils/request.js/响应拦截器代码块(因为不想使用redis, 所以直接在后端做了token自动刷新, 新的token直接放在了响应头里, 当前端监听到响应头有token时, 直接替换客户端token, 这样你就不需要redis了)

## 前端运行

```bash
# 克隆项目
git clone https://github.com/moyumoa/exadmin.git

# 进入项目目录
cd exadmin/views

# 安装依赖
npm install

# 启动服务
npm run dev

# 构建测试环境 npm run build:stage
# 构建生产环境 npm run build:prod
# 前端访问地址 http://localhost:6500
```

## 后端运行

```bash
# 克隆项目
git clone https://github.com/moyumoa/exadmin.git

# 进入项目目录
cd exadmin/server

# 安装依赖
npm install

# 启动服务
npm run dev

# 本地访问地址 http://localhost:6330
# 生成环境通过pm2启动 或 npm run start
```

## 内置功能

+ 用户管理：用户是系统操作者，该功能主要完成系统用户配置。
+ 部门管理：配置系统组织机构（公司、部门、小组），树结构展现支持数据权限。
+ 岗位管理：配置系统用户所属担任职务。
+ 菜单管理：配置系统菜单，操作权限，按钮权限标识等。
+ 角色管理：角色菜单权限分配、设置角色按机构进行数据范围权限划分。
+ 字典管理：对系统中经常使用的一些较为固定的数据进行维护。
+ 通知公告：系统通知公告信息发布维护。
+ 登录日志：系统登录日志记录查询包含登录异常。
+ 服务监控：监视当前系统CPU、内存、磁盘、堆栈等相关信息。

## 在线体验

+ 账号 admin
+ 密码 123456
+ 由于本人比较穷 演示服务器配置略低 响应稍有延迟还请谅解

演示地址：http://ex-admin.uginx.cn
