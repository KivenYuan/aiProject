/**
 * 用户管理路由
 * 
 * 提供用户信息的CRUD操作
 */

const express = require('express');
const router = express.Router();

// 临时内存存储（开发用）
const users = new Map();

// 中间件：验证JWT
const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: '未提供认证令牌'
      });
    }

    const token = authHeader.substring(7);
    
    // 在实际应用中，这里会验证JWT并提取用户信息
    // 为简化，我们假设token有效并包含userId
    
    // 解析token获取userId（简化处理，实际应使用JWT验证）
    const tokenParts = token.split('.');
    if (tokenParts.length === 3) {
      try {
        const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());
        req.userId = payload.userId;
      } catch (e) {
        // token格式无效
      }
    }
    
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: '无效的认证令牌'
      });
    }
    
    next();
  } catch (error) {
    console.error('认证错误:', error);
    res.status(500).json({
      success: false,
      message: '认证处理失败'
    });
  }
};

/**
 * 获取当前用户信息
 * GET /api/users/me
 */
router.get('/me', authenticate, (req, res) => {
  try {
    // 在实际应用中，这里会从数据库查询用户
    // 现在从内存存储中查找
    const user = Array.from(users.values()).find(u => u.id === req.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }

    // 移除敏感字段
    const { password, githubToken, ...userWithoutSensitive } = user;

    res.json({
      success: true,
      data: userWithoutSensitive
    });

  } catch (error) {
    console.error('获取用户信息错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

/**
 * 更新用户信息
 * PUT /api/users/me
 */
router.put('/me', authenticate, (req, res) => {
  try {
    const { name, avatar } = req.body;
    
    // 查找用户
    const user = Array.from(users.values()).find(u => u.id === req.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }

    // 更新用户信息
    if (name !== undefined) user.name = name;
    if (avatar !== undefined) user.avatar = avatar;
    user.updatedAt = new Date().toISOString();

    // 保存更新（在实际应用中，这里会更新数据库）
    users.set(user.email, user);

    // 移除敏感字段
    const { password, githubToken, ...userWithoutSensitive } = user;

    res.json({
      success: true,
      message: '用户信息更新成功',
      data: userWithoutSensitive
    });

  } catch (error) {
    console.error('更新用户信息错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

/**
 * 更新用户偏好设置
 * PATCH /api/users/me/preferences
 */
router.patch('/me/preferences', authenticate, (req, res) => {
  try {
    const preferences = req.body;
    
    // 查找用户
    const user = Array.from(users.values()).find(u => u.id === req.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }

    // 初始化preferences字段
    if (!user.preferences) {
      user.preferences = {};
    }

    // 合并更新偏好设置
    user.preferences = {
      ...user.preferences,
      ...preferences
    };
    user.updatedAt = new Date().toISOString();

    // 保存更新
    users.set(user.email, user);

    res.json({
      success: true,
      message: '偏好设置更新成功',
      data: {
        preferences: user.preferences
      }
    });

  } catch (error) {
    console.error('更新偏好设置错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

/**
 * 获取用户列表（仅管理员）
 * GET /api/users
 */
router.get('/', authenticate, (req, res) => {
  try {
    // 在实际应用中，这里会检查用户是否为管理员
    // 现在返回所有用户（移除敏感信息）
    const userList = Array.from(users.values()).map(user => {
      const { password, githubToken, ...userWithoutSensitive } = user;
      return userWithoutSensitive;
    });

    res.json({
      success: true,
      data: userList,
      total: userList.length
    });

  } catch (error) {
    console.error('获取用户列表错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

/**
 * 根据ID获取用户信息
 * GET /api/users/:id
 */
router.get('/:id', authenticate, (req, res) => {
  try {
    const userId = req.params.id;
    
    // 查找用户
    const user = Array.from(users.values()).find(u => u.id === userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }

    // 移除敏感字段
    const { password, githubToken, email, ...publicInfo } = user;

    res.json({
      success: true,
      data: publicInfo
    });

  } catch (error) {
    console.error('获取用户信息错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

/**
 * 删除用户（仅用户自己或管理员）
 * DELETE /api/users/me
 */
router.delete('/me', authenticate, (req, res) => {
  try {
    // 查找用户
    const user = Array.from(users.values()).find(u => u.id === req.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }

    // 从内存存储中删除（在实际应用中，这里会软删除数据库记录）
    users.delete(user.email);

    // 记录删除操作
    console.log(`用户删除: ${user.email} (ID: ${user.id})`);

    res.json({
      success: true,
      message: '用户账户已删除'
    });

  } catch (error) {
    console.error('删除用户错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

// 开发工具：重置内存存储（仅开发环境）
if (process.env.NODE_ENV === 'development') {
  router.post('/dev/reset', (req, res) => {
    try {
      const oldSize = users.size;
      users.clear();
      
      console.log(`开发工具：已清空用户存储，共删除 ${oldSize} 个用户`);
      
      res.json({
        success: true,
        message: `已清空用户存储，共删除 ${oldSize} 个用户`
      });
    } catch (error) {
      console.error('重置存储错误:', error);
      res.status(500).json({
        success: false,
        message: '重置存储失败'
      });
    }
  });
}

module.exports = router;