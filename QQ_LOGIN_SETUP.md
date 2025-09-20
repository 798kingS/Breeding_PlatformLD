# QQ登录配置说明

## 概述
已成功实现QQ登录功能，用户可以通过QQ账号快速登录育种平台。

## 功能特点
- ✅ 完整的QQ OAuth2.0登录流程
- ✅ 自动获取用户基本信息（昵称、头像等）
- ✅ 与现有登录系统无缝集成
- ✅ 支持登录状态持久化
- ✅ 错误处理和用户提示

## 配置步骤

### 1. 申请QQ互联应用
1. 访问 [QQ互联开放平台](https://connect.qq.com/)
2. 注册开发者账号并创建应用
3. 获取 `App ID` 和 `App Key`

### 2. 修改配置文件
在 `src/utils/qqLogin.ts` 文件中修改以下配置：

```typescript
const QQ_LOGIN_CONFIG = {
  appId: 'YOUR_APP_ID', // 替换为实际的QQ应用ID
  redirectUri: encodeURIComponent(window.location.origin + '/login/qq/callback'),
  scope: 'get_user_info',
};
```

### 3. 后端接口配置
确保后端已实现以下接口：

**POST** `/api/auth/qq-login`

请求参数：
```json
{
  "accessToken": "string",
  "openId": "string",
  "userInfo": {
    "nickname": "string",
    "figureurl_qq_1": "string",
    "figureurl_qq_2": "string",
    "gender": "string"
  }
}
```

响应格式：
```json
{
  "success": true,
  "token": "string",
  "id": "number",
  "username": "string",
  "role": "string"
}
```

### 4. 回调URL配置
在QQ互联平台中设置回调URL：
```
https://yourdomain.com/login/qq/callback
```

## 使用方式

### 用户操作
1. 在登录页面点击QQ图标
2. 跳转到QQ授权页面
3. 用户授权后自动返回并登录

### 开发者调试
1. 确保已配置正确的App ID
2. 检查回调URL是否正确
3. 确认后端接口已实现
4. 查看浏览器控制台是否有错误信息

## 技术实现

### 前端流程
1. 用户点击QQ登录按钮
2. 跳转到QQ授权页面
3. 用户授权后返回回调页面
4. 获取授权码并换取Access Token
5. 使用Access Token获取用户信息
6. 调用后端接口完成登录

### 文件结构
```
src/
├── utils/
│   └── qqLogin.ts          # QQ登录工具类
├── services/
│   └── Breeding Platform/
│       └── api.ts          # API接口定义
└── pages/
    └── User/
        └── Login/
            └── index.tsx   # 登录页面组件
```

## 注意事项

1. **安全性**：请妥善保管App Key，不要在前端代码中暴露
2. **HTTPS**：生产环境必须使用HTTPS协议
3. **域名**：确保回调URL的域名与QQ互联平台配置一致
4. **测试**：建议先在测试环境验证功能正常

## 故障排除

### 常见问题
1. **授权失败**：检查App ID和回调URL配置
2. **获取用户信息失败**：确认scope权限设置
3. **后端接口错误**：检查接口实现和参数格式
4. **跨域问题**：确保后端支持CORS

### 调试方法
1. 打开浏览器开发者工具
2. 查看Network面板的请求详情
3. 检查Console面板的错误信息
4. 验证QQ互联平台的配置

## 后续扩展

可以基于相同的模式实现：
- 微信登录
- 支付宝登录
- 其他第三方登录方式

## 联系支持

如有问题，请联系开发团队或查看相关文档。
