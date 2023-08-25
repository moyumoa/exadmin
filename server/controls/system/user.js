// /system/user/profile

const crypto = require('crypto')

const { sys_user, sys_user_post, sys_user_role } = require('@/db/system/sys_user')
const { sys_role, sys_role_dept } = require('@/db/system/sys_role')
const { sys_dept } = require('@/db/system/sys_dept')
const { sys_post } = require('@/db/system/sys_post')
const { Op } = require('sequelize')
const { sequelize } = require('@/service/sequelize')

// 加密函数
const genPassword = (password) => {
  const md5 = (content) => {
    let md5 = crypto.createHash('md5')
    return md5.update(content).digest('hex') // 把输出编程16进制的格式
  }
  const str = `password=${password}&key=${process.env.SECRET_KEY}` // 拼接方式是自定的，只要包含密匙即可
  return `$$${md5(str)}$`
}

// 生成树结构
const generateTree = (menuList, parentId = 0) => {
  const tree = [];
  for (const menu of menuList) {
    if (menu.parentId === parentId) {
      const node = {
        id: menu.deptId,
        label: menu.deptName,
      };
      const children = generateTree(menuList, menu.deptId);
      if (children.length > 0) {
        node.children = children;
      }
      tree.push(node);
    }
  }
  return tree;
}

// 获取用户资料
const getProfile = async (userId) => {
  try {
    const user = await sys_user.findByPk(userId, {
      include: [
        {
          model: sys_role,
          as: 'roles',
          required: false
        },
        {
          model: sys_dept,
          as: 'dept',
          required: false
        },
        {
          model: sys_post,
          as: 'userPosts', // 根据您的定义使用别名
          through: {
            model: sys_user_post,
            attributes: [], // 排除中间表的属性
          },
        },
      ],
      required: false, // 设置 required 为 false 在查询关联数据时不强制要求匹配的结果
    });

    if (!user) {
      return null; // 用户不存在
    }

    const isSuperAdmin = user.roles.some(role => role.roleKey === 'admin');

    // 获取岗位信息（假设岗位信息是一个数组）
    const userPosts = user.userPosts.map(post => post.dataValues);

    // 获取角色信息
    const roles = user.roles.map(role => role.dataValues);

    // 组装返回的数据结构
    const profileData = {
      msg: '操作成功',
      postGroup: userPosts[0].postName,
      code: 200,
      data: {
        admin: isSuperAdmin,
        ...user.dataValues,
        roleId: roles[0].roleId,
        post: userPosts
      },
      roleGroup: roles[0].roleName,
    };
    delete profileData.data.userPosts;

    return profileData;
  } catch (error) {
    console.log('获取用户信息失败：', error)
  }
}

// 查询用户信息
exports.getUser = async (req, res) => {

  if (req.params.id === 'profile') {
    this.profile(req, res)
    return
  }

  if (req.params.id === 'list') {
    this.userList(req, res)
    return
  }

  if (req.params.id === 'deptTree') {
    this.deptTree(req, res)
    return
  }
  this.getUserById(req, res)
}

// 获取用户列表(分页)
exports.userList = async (req, res) => {
  const { pageNum, pageSize, userName: nickName, phonenumber, status, deptId, params } = req.query

  const where = {
    userId: { [Op.not]: 0 },
    ...$utils.query_like({
      [nickName]: ['nickName', 'userName'],
      [phonenumber]: 'phonenumber',
    }),
    ...$utils.query_eq({
      [status]: 'status',
    }),
    ...$utils.query_times({ createTime: params }),
  }
  if (deptId && deptId !== '100') {
    where.deptId = deptId
  }
  try {
    const { count: total, rows } = await sys_user.findAndCountAll({
      where,
      include: [
        {
          model: sys_dept,
          as: 'dept',
          required: false
        },
      ],
      ...$utils.query_page(pageNum, pageSize),
      required: false
    })
    res.send({
      code: 200,
      msg: '查询成功',
      rows,
      total
    })
  } catch (error) {
    log.error('获取用户列表失败：', error)
    res.send({
      code: 500,
      msg: '获取用户列表失败'
    })
  }
}

// 获取部门树
exports.deptTree = async (req, res) => {
  try {
    const data = await sys_dept.findAll({
      order: [['orderNum', 'ASC']]
    })
    const dataTree = generateTree(data.map(item => item.dataValues))

    res.send({
      code: 200,
      msg: '查询成功',
      data: dataTree
    })
  } catch (error) {
    log.error('获取部门树失败：', error)
    res.send({
      code: 500,
      msg: '获取部门树失败'
    })
  }
}

// 获取角色列表 部门列表 岗位列表
exports.roleAndDeptAndPostList = async (req, res) => {
  try {
    const roleList = await sys_role.findAll()
    const deptList = await sys_dept.findAll()
    const postList = await sys_post.findAll()
    res.send({
      code: 200,
      msg: '查询成功',
      roles: roleList,
      depts: deptList,
      posts: postList
    })
  } catch (error) {
    log.error('获取角色列表失败：', error)
    res.send({
      code: 500,
      msg: '获取角色列表失败'
    })
  }
}

// 新增用户
exports.addUser = async (req, res) => {
  const t = await sequelize.transaction(); // 开启事务
  try {
    const { deptId, userName, nickName, password, phonenumber, email, sex, status, remark, postIds, roleIds } = req.body;

    // 检查用户名是否已存在
    const existingUser = await sys_user.findOne({
      where: { userName },
      transaction: t
    });
    if (existingUser) {
      await t.rollback(); // 回滚事务
      return res.send({
        code: 400,
        msg: '用户名已存在'
      });
    }

    // 创建新用户记录
    const newUser = await sys_user.create({
      deptId,
      userName,
      nickName,
      password: genPassword(password),
      phonenumber,
      email,
      sex,
      status,
      remark,
      createBy: `${req.user.userName}-${req.user.nickName}`, // 创建人
      updateBy: `${req.user.userName}-${req.user.nickName}`, // 更新人
      createTime: new Date(), // 创建时间
      updateTime: new Date(), // 更新时间
    }, { transaction: t });

    // 关联用户与岗位
    if (postIds && postIds.length > 0) {
      const postAssociations = postIds.map(postId => ({
        userId: newUser.userId,
        postId
      }));

      await sys_user_post.bulkCreate(postAssociations, { transaction: t });
    }

    // 关联用户与角色
    if (roleIds && roleIds.length > 0) {
      const roleAssociations = roleIds.map(roleId => ({
        userId: newUser.userId,
        roleId
      }));
      await sys_user_role.bulkCreate(roleAssociations, { transaction: t });
    }

    await t.commit(); // 提交事务
    res.send({
      code: 200,
      msg: '新增用户成功',
      userId: newUser.userId
    });
  } catch (error) {
    await t.rollback(); // 回滚事务
    log.error('新增用户失败：', error);
    res.send({
      code: 500,
      msg: '新增用户失败'
    });
  }
}

// 修改用户信息
exports.updateUser = async (req, res) => {
  if (req.params.id === 'profile') {
    this.updateProfile(req, res)
    return
  }

  if (req.params.id === 'changeStatus' || req.params.id === 'resetPwd') {
    this.updateUserSpecifiedInfo(req, res)
    return
  }

  if (req.params.id === undefined || req.params.id === null || req.params.id === '') {
    this.updateUserById(req, res)
    return
  }
}

// 获取当前用户信息
exports.profile = async (req, res) => {
  try {
    const data = await getProfile(req.user.id)
    res.send(data)
  } catch (error) {
    log.error('获取用户信息失败：', error)
    res.send({
      code: 500,
      msg: '获取用户信息失败'
    })
  }
}

// 根据id获取用户信息
exports.getUserById = async (req, res) => {
  const { id } = req.params;

  try {
    // 查询用户基本信息
    const user = await sys_user.findByPk(id, {
      include: [
        {
          model: sys_dept,
          as: 'dept',
          required: false
        },
        {
          model: sys_role,
          as: 'roles',
          required: false
        },
        {
          model: sys_post,
          as: 'userPosts',
          required: false
        }
      ],
    });

    if (!user) {
      return res.send({
        code: -1,
        msg: '用户不存在'
      });
    }

    // 判断用户是否为管理员
    const isAdmin = user.roles.some(role => role.roleKey === 'admin') || user.userId === 0;
    // 当前用户的角色
    const rolesData = user.roles.map(role => ({
      ...role.toJSON(),
      admin: role.roleKey === 'admin'
    }));
    // 当前用户的岗位
    // const postsData = user.userPosts.map(post => post.toJSON());

    // 查询所有的部门和角色信息
    const allposts = await sys_post.findAll();
    const allRoles = await sys_role.findAll();

    // 构建返回的数据结构
    const userData = {
      msg: '操作成功',
      code: 200,
      roleIds: user.roles.map(role => role.roleId),
      data: {
        admin: isAdmin,
        ...user.toJSON(),
        roles: rolesData,
        roleIds: null,
        postIds: user.userPosts.map(post => post.postId),
        roleId: null
      },
      postIds: user.userPosts.map(post => post.postId),
      roles: allRoles,
      posts: allposts
    };

    res.send(userData);
  } catch (error) {
    console.log('获取用户信息失败：', error);
    res.send({
      code: 500,
      msg: '获取用户信息失败'
    });
  }
}

// 修改当前用户资料
exports.updateProfile = async (req, res) => {
  const userId = req.user.id
  let bodys = req.body
  delete bodys.userId

  try {
    const data = await sys_user.update({
      ...bodys,
      updateBy: `${req.user.userName}-${req.user.nickName}`,
      updateTime: new Date(),
    }, {
      where: { userId },
    })
    const profileInfo = await getProfile(userId)
    res.send(profileInfo)
  } catch (error) {
    log.error('更新用户信息失败：', error)
    res.send({
      code: 500,
      msg: '更新用户信息失败'
    })
  }
}

// 修改指定用户信息
exports.updateUserById = async (req, res) => {
  const { userId, ...updateData } = req.body
  const t = await sequelize.transaction(); // 开启事务
  try {

    await sys_user.update({
      ...updateData,
      updateBy: `${req.user.userName}-${req.user.nickName}`,
      updateTime: new Date(),
    }, {
      where: { userId },
      fields: Object.keys(updateData),
      transaction: t,
    })

    // 更新用户与岗位关联
    if (updateData.postIds && updateData.postIds.length > 0) {
      // 删除之前的关联记录
      await sys_user_post.destroy({ where: { userId }, transaction: t });
      // 创建新的关联记录
      const postAssociations = updateData.postIds.map(postId => ({
        userId,
        postId
      }));
      await sys_user_post.bulkCreate(postAssociations, { transaction: t });
    } else {
      // 清空关联记录
      await sys_user_post.destroy({ where: { userId }, transaction: t });
    }

    // 更新用户与角色关联
    if (updateData.roleIds && updateData.roleIds.length > 0) {
      // 删除之前的关联记录
      await sys_user_role.destroy({ where: { userId }, transaction: t });
      // 创建新的关联记录
      const roleAssociations = updateData.roleIds.map(roleId => ({
        userId,
        roleId
      }));
      await sys_user_role.bulkCreate(roleAssociations, { transaction: t });
    } else {
      // 清空关联记录
      await sys_user_role.destroy({ where: { userId }, transaction: t });
    }

    await t.commit(); // 提交事务
    res.send({
      code: 200,
      msg: '修改用户信息成功',
      userId
    });
  } catch (error) {
    await t.rollback(); // 回滚事务
    log.error('修改用户信息失败：', error);
    res.send({
      code: 500,
      msg: '修改用户信息失败'
    });
  }
}

// 修改用户其它信息
exports.updateUserSpecifiedInfo = async (req, res) => {
  try {
    const { userId } = req.body;

    // 查询要修改的用户
    const userToUpdate = await sys_user.findByPk(userId);
    if (!userToUpdate) {
      return res.send({
        code: -1,
        msg: '用户不存在'
      });
    }

    // 动态更新用户信息
    for (const key in req.body) {
      if (key !== 'userId') {
        if (key === 'password') {
          // 对密码进行加密处理
          userToUpdate[key] = genPassword(req.body[key]);
        } else {
          userToUpdate[key] = req.body[key];
        }
      }
    }

    userToUpdate.updateBy = `${req.user.userName}-${req.user.nickName}`;
    userToUpdate.updateTime = new Date();
    await userToUpdate.save();

    res.send({
      code: 200,
      msg: '修改成功'
    });
  } catch (error) {
    log.error('修改用户信息失败：', error);
    res.send({
      code: 500,
      msg: '修改失败'
    });
  }
}

// 删除用户(这里的删除是软删除 只修改delFlag字段 0代表存在 2代表删除)
exports.deleteUser = async (req, res) => {
  const { ids } = req.params; // 参数形式是字符串，如 "1,2,3"
  if (ids.split(',').includes('1')) {
    res.send({ code: -1, msg: '删除失败，请勿包含系统内置角色' })
    return
  }
  const transaction = await sequelize.transaction();

  try {
    await deleteUserAndAssociations(req, ids.split(','), transaction);
    // 提交事务并返回成功响应
    await transaction.commit();

    res.send({
      code: 200,
      msg: '删除用户成功'
    });
  } catch (error) {
    res.send({
      code: 500,
      msg: '删除用户失败'
    });
  }
}


// 获取指定用户信息 角色信息 部门信息 (分配角色)
exports.getAuthRoleList = async (req, res) => {
  const { userId } = req.params

  try {
    // 查询全部角色
    const allRoles = await sys_role.findAll()
    const user = await sys_user.findByPk(userId, {
      include: [
        {
          model: sys_role,
          as: 'roles',
          required: false
        },
        {
          model: sys_dept,
          as: 'dept',
          required: false
        },
      ],
      required: false
    });

    if (!user) { return null }

    const isSuperAdmin = user.roles.some(role => role.roleKey === 'admin') || user.userId === 0;

    // 匹配用户拥有的角色 设置flag为true
    const roles = allRoles.map(role => {
      const flag = user.roles.some(item => item.roleId === role.roleId)
      return {
        ...role.dataValues,
        flag
      }
    })


    // 组装返回的数据结构
    const profileData = {
      msg: '操作成功',
      code: 200,
      user: {
        admin: isSuperAdmin,
        ...user.dataValues,
      },
      roles,
    };

    res.send(profileData);
  } catch (error) {
    log.error('获取用户信息失败：', error)
    res.send({
      code: 500,
      msg: '获取用户信息失败'
    })
  }
}

// 批量分配角色
exports.authorizeAllAuthRole = async (req, res) => {
  const { userId, roleIds } = req.query
  // 如果没有角色id 则清空该用户的角色
  if (!roleIds) {
    try {
      await sys_user_role.destroy({ where: { userId } })
      res.send({ code: 200, msg: '操作成功' })
    } catch (error) {
      log.error('操作失败：', error)
      res.send({ code: 500, msg: '操作失败' })
    }
    return
  }
  const roleList = roleIds.split(',')
  const transaction = await sequelize.transaction()
  try {
    await sys_user_role.destroy({
      where: { userId },
      transaction
    })
    const roleAssociations = roleList.map(roleId => ({
      userId,
      roleId
    }));
    await sys_user_role.bulkCreate(roleAssociations, { transaction });
    await transaction.commit()
    res.send({
      code: 200,
      msg: '操作成功'
    })
  } catch (error) {
    log.error('操作失败：', error)
    res.send({
      code: 500,
      msg: '操作失败'
    })
  }
}


// 删除角色及其关联数据
async function deleteUserAndAssociations (req, userId, transaction) {
  try {
    // 删除角色本身
    await sys_user.update(
      {
        delFlag: '2',
        updateBy: `${req.user.userName}-${req.user.nickName}`,
        updateTime: new Date(),
      },
      {
        where: { userId: userId },
        transaction,
      }
    );

    // 删除用户与岗位的关联记录
    await sys_user_post.destroy({
      where: { userId: userId },
      transaction,
    });

    // 删除用户与角色的关联记录
    await sys_user_role.destroy({
      where: { userId: userId },
      transaction,
    });

    // 返回成功状态
    return true;
  } catch (error) {
    log.error('删除用户失败', error);
    throw error;
  }
}
