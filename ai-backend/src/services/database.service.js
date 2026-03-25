/**
 * 数据库服务（内存实现，开发用）
 * 
 * 实际生产环境应替换为真实数据库（SQLite、PostgreSQL等）
 */

class MemoryDatabase {
  constructor() {
    // 内存存储
    this.users = new Map();
    this.sessions = new Map();
    this.tokens = new Map();
    
    // 初始化默认数据（开发用）
    this.initializeDefaultData();
    
    console.log('内存数据库初始化完成');
  }

  /**
   * 初始化默认数据
   */
  initializeDefaultData() {
    // 添加默认演示用户
    const demoUser = {
      id: 'user_demo_123',
      email: 'demo@example.com',
      password: '$2a$10$N9qo8uLOickgx2ZMRZoMy.Mrq5pH3qE1p6p7bRNT2C5YhB7J8kF1a', // Demo@123
      name: '演示用户',
      avatar: 'https://ui-avatars.com/api/?name=Demo+User&background=random',
      role: 'user',
      preferences: {
        theme: 'light',
        language: 'zh-CN',
        notifications: true
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.users.set(demoUser.email, demoUser);
    console.log('已创建默认演示用户:', demoUser.email);
  }

  // ==================== 用户操作 ====================

  /**
   * 根据ID查找用户
   */
  findUserById(id) {
    return Array.from(this.users.values()).find(user => user.id === id);
  }

  /**
   * 根据邮箱查找用户
   */
  findUserByEmail(email) {
    return this.users.get(email);
  }

  /**
   * 根据GitHub ID查找用户
   */
  findUserByGitHubId(githubId) {
    return Array.from(this.users.values()).find(user => user.githubId === githubId);
  }

  /**
   * 创建新用户
   */
  createUser(userData) {
    const { email } = userData;
    
    if (this.users.has(email)) {
      throw new Error(`用户邮箱 ${email} 已存在`);
    }

    const user = {
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...userData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.users.set(email, user);
    console.log(`创建用户: ${email} (ID: ${user.id})`);

    return user;
  }

  /**
   * 更新用户信息
   */
  updateUser(email, updates) {
    const user = this.users.get(email);
    
    if (!user) {
      throw new Error(`用户 ${email} 不存在`);
    }

    const updatedUser = {
      ...user,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    this.users.set(email, updatedUser);
    console.log(`更新用户: ${email}`);

    return updatedUser;
  }

  /**
   * 删除用户
   */
  deleteUser(email) {
    if (!this.users.has(email)) {
      throw new Error(`用户 ${email} 不存在`);
    }

    const user = this.users.get(email);
    this.users.delete(email);
    
    // 清理相关会话和token
    this.cleanupUserData(user.id);
    
    console.log(`删除用户: ${email} (ID: ${user.id})`);
    
    return user;
  }

  /**
   * 获取所有用户
   */
  getAllUsers() {
    return Array.from(this.users.values());
  }

  // ==================== 会话管理 ====================

  /**
   * 创建会话
   */
  createSession(userId, sessionData = {}) {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const session = {
      id: sessionId,
      userId,
      ...sessionData,
      createdAt: new Date().toISOString(),
      lastActiveAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24小时后过期
    };

    this.sessions.set(sessionId, session);
    console.log(`创建会话: ${sessionId} (用户: ${userId})`);

    return session;
  }

  /**
   * 获取会话
   */
  getSession(sessionId) {
    return this.sessions.get(sessionId);
  }

  /**
   * 更新会话活跃时间
   */
  updateSessionActivity(sessionId) {
    const session = this.sessions.get(sessionId);
    
    if (session) {
      session.lastActiveAt = new Date().toISOString();
      this.sessions.set(sessionId, session);
    }
    
    return session;
  }

  /**
   * 删除会话
   */
  deleteSession(sessionId) {
    if (!this.sessions.has(sessionId)) {
      return false;
    }

    this.sessions.delete(sessionId);
    console.log(`删除会话: ${sessionId}`);
    
    return true;
  }

  /**
   * 清理用户相关会话
   */
  cleanupUserSessions(userId) {
    let deletedCount = 0;
    
    for (const [sessionId, session] of this.sessions.entries()) {
      if (session.userId === userId) {
        this.sessions.delete(sessionId);
        deletedCount++;
      }
    }
    
    console.log(`清理用户 ${userId} 的会话，共删除 ${deletedCount} 个`);
    
    return deletedCount;
  }

  // ==================== Token管理 ====================

  /**
   * 存储Token
   */
  storeToken(token, data) {
    this.tokens.set(token, {
      ...data,
      createdAt: new Date().toISOString()
    });
    
    return true;
  }

  /**
   * 验证Token
   */
  validateToken(token) {
    return this.tokens.has(token);
  }

  /**
   * 获取Token数据
   */
  getTokenData(token) {
    return this.tokens.get(token);
  }

  /**
   * 删除Token
   */
  deleteToken(token) {
    return this.tokens.delete(token);
  }

  // ==================== 清理操作 ====================

  /**
   * 清理过期数据
   */
  cleanupExpiredData() {
    const now = new Date();
    let expiredSessions = 0;
    let expiredTokens = 0;

    // 清理过期会话
    for (const [sessionId, session] of this.sessions.entries()) {
      if (new Date(session.expiresAt) < now) {
        this.sessions.delete(sessionId);
        expiredSessions++;
      }
    }

    // 清理旧token（超过7天）
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    for (const [token, data] of this.tokens.entries()) {
      if (new Date(data.createdAt) < sevenDaysAgo) {
        this.tokens.delete(token);
        expiredTokens++;
      }
    }

    if (expiredSessions > 0 || expiredTokens > 0) {
      console.log(`数据清理完成: ${expiredSessions} 个过期会话, ${expiredTokens} 个过期token`);
    }

    return { expiredSessions, expiredTokens };
  }

  /**
   * 清理用户相关数据
   */
  cleanupUserData(userId) {
    const deletedSessions = this.cleanupUserSessions(userId);
    
    // 清理用户相关的token
    let deletedTokens = 0;
    for (const [token, data] of this.tokens.entries()) {
      if (data.userId === userId) {
        this.tokens.delete(token);
        deletedTokens++;
      }
    }
    
    console.log(`清理用户 ${userId} 的数据: ${deletedSessions} 个会话, ${deletedTokens} 个token`);
    
    return { deletedSessions, deletedTokens };
  }

  // ==================== 统计信息 ====================

  /**
   * 获取数据库统计信息
   */
  getStats() {
    return {
      users: this.users.size,
      sessions: this.sessions.size,
      tokens: this.tokens.size,
      lastCleanup: new Date().toISOString()
    };
  }

  /**
   * 导出数据（用于备份）
   */
  exportData() {
    return {
      users: Array.from(this.users.values()),
      sessions: Array.from(this.sessions.values()),
      tokens: Array.from(this.tokens.entries()).map(([token, data]) => ({ token, ...data })),
      exportedAt: new Date().toISOString()
    };
  }

  /**
   * 导入数据（用于恢复）
   */
  importData(data) {
    // 清空现有数据
    this.users.clear();
    this.sessions.clear();
    this.tokens.clear();

    // 导入用户
    if (data.users && Array.isArray(data.users)) {
      for (const user of data.users) {
        this.users.set(user.email, user);
      }
    }

    // 导入会话
    if (data.sessions && Array.isArray(data.sessions)) {
      for (const session of data.sessions) {
        this.sessions.set(session.id, session);
      }
    }

    // 导入token
    if (data.tokens && Array.isArray(data.tokens)) {
      for (const tokenData of data.tokens) {
        if (tokenData.token) {
          const { token, ...data } = tokenData;
          this.tokens.set(token, data);
        }
      }
    }

    console.log(`数据导入完成: ${this.users.size} 用户, ${this.sessions.size} 会话, ${this.tokens.size} token`);
    
    return this.getStats();
  }
}

// 创建单例实例
const memoryDatabase = new MemoryDatabase();

// 定时清理过期数据（每小时一次）
setInterval(() => {
  memoryDatabase.cleanupExpiredData();
}, 60 * 60 * 1000);

module.exports = memoryDatabase;