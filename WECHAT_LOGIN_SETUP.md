# 微信登录配置说明

## 概述
已成功实现微信登录功能，用户可以通过微信账号快速登录育种平台。支持PC端二维码登录和微信内浏览器静默授权。

## 功能特点
- ✅ 完整的微信OAuth2.0登录流程
- ✅ 支持PC端二维码登录
- ✅ 支持微信内浏览器静默授权
- ✅ 自动检测微信浏览器环境
- ✅ 与现有登录系统无缝集成
- ✅ 支持登录状态持久化
- ✅ 完善的错误处理和用户提示

## 配置步骤

### 1. 申请微信开放平台应用
1. 访问 [微信开放平台](https://open.weixin.qq.com/)
2. 注册开发者账号并创建网站应用
3. 获取 `App ID` 和 `App Secret`
4. 设置授权回调域名

### 2. 修改配置文件
在 `src/utils/wechatLogin.ts` 文件中修改以下配置：

```typescript
const WECHAT_LOGIN_CONFIG = {
  appId: 'wx1234567890abcdef', // 替换为实际的微信应用ID
  redirectUri: encodeURIComponent(window.location.origin + '/login/wechat/callback'),
  scope: 'snsapi_userinfo',
  state: 'wechat_login_' + Math.random().toString(36).substring(2, 15),
};
```

### 3. 后端接口配置
确保后端已实现以下接口：

**POST** `/api/auth/wechat-login`

请求参数：
```json
{
  "code": "string",
  "state": "string"
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
在微信开放平台中设置授权回调域名：
```
yourdomain.com
```

注意：微信只支持域名配置，不需要完整URL路径。

## 使用方式

### PC端用户
1. 在登录页面点击微信图标
2. 弹出微信二维码
3. 使用微信扫描二维码
4. 在手机上确认授权
5. 自动返回并登录

### 微信内用户
1. 在微信内打开登录页面
2. 点击微信登录按钮
3. 自动静默授权（无需用户确认）
4. 直接完成登录

## 技术实现

### 登录流程
1. **PC端流程**：
   - 用户点击微信登录
   - 跳转到微信二维码页面
   - 用户扫码授权
   - 微信回调到指定URL
   - 获取授权码并调用后端接口

2. **微信内流程**：
   - 检测到微信浏览器环境
   - 使用静默授权模式
   - 直接获取授权码
   - 调用后端接口完成登录

### 文件结构
```
src/
├── utils/
│   └── wechatLogin.ts        # 微信登录工具类
├── services/
│   └── Breeding Platform/
│       └── api.ts            # API接口定义
└── pages/
    └── User/
        └── Login/
            └── index.tsx     # 登录页面组件
```

## 配置参数说明

### 微信登录配置
- `appId`: 微信开放平台应用ID
- `redirectUri`: 授权回调地址
- `scope`: 授权范围
  - `snsapi_userinfo`: 需要用户确认，可获取用户信息
  - `snsapi_base`: 静默授权，只能获取openid
- `state`: 防CSRF攻击的随机字符串

### 授权范围说明
- **snsapi_userinfo**: 需要用户确认授权，可以获取用户基本信息
- **snsapi_base**: 静默授权，用户无感知，只能获取openid

## 注意事项

1. **域名配置**：微信开放平台只支持域名配置，不支持IP地址
2. **HTTPS要求**：生产环境必须使用HTTPS协议
3. **App Secret安全**：App Secret必须保存在后端，不能暴露在前端
4. **测试环境**：开发环境可以使用测试号进行调试
5. **用户信息获取**：需要用户主动授权才能获取详细信息

## 故障排除

### 常见问题
1. **授权失败**：检查App ID和回调域名配置
2. **二维码不显示**：确认网络连接和域名配置
3. **静默授权失败**：检查scope设置和微信浏览器环境
4. **后端接口错误**：检查接口实现和参数格式
5. **跨域问题**：确保后端支持CORS

### 调试方法
1. 打开浏览器开发者工具
2. 查看Network面板的请求详情
3. 检查Console面板的错误信息
4. 验证微信开放平台的配置
5. 使用微信开发者工具测试

### 错误码说明
- `40013`: 无效的AppID
- `40125`: 无效的AppSecret
- `40001`: 无效的code
- `40029`: 无效的code（已使用）

## 安全建议

1. **State参数**：使用随机字符串防止CSRF攻击
2. **Token安全**：妥善保管用户token
3. **HTTPS传输**：确保所有通信使用HTTPS
4. **参数验证**：后端验证所有传入参数
5. **日志记录**：记录登录日志便于排查问题

## 后续扩展

可以基于相同的模式实现：
- 微信小程序登录
- 微信公众号登录
- 其他第三方登录方式

## 联系支持

如有问题，请联系开发团队或查看相关文档。

## 相关文档

- [微信开放平台文档](https://developers.weixin.qq.com/doc/oplatform/Website_App/WeChat_Login/Wechat_Login.html)
- [微信登录技术方案](https://developers.weixin.qq.com/doc/oplatform/Website_App/WeChat_Login/Wechat_Login.html)
