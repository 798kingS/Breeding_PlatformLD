/**
 * 微信登录工具类
 * 基于微信开放平台API
 */

// 微信登录配置
const WECHAT_LOGIN_CONFIG = {
  appId: 'wx1234567890abcdef', // 需要替换为实际的微信应用ID
  redirectUri: encodeURIComponent(window.location.origin + '/login/wechat/callback'),
  scope: 'snsapi_userinfo',
  state: 'wechat_login_' + Math.random().toString(36).substring(2, 15), // 防止CSRF攻击
};

/**
 * 获取微信登录URL
 */
export function getWechatLoginUrl(): string {
  const params = new URLSearchParams({
    appid: WECHAT_LOGIN_CONFIG.appId,
    redirect_uri: WECHAT_LOGIN_CONFIG.redirectUri,
    response_type: 'code',
    scope: WECHAT_LOGIN_CONFIG.scope,
    state: WECHAT_LOGIN_CONFIG.state,
  });

  return `https://open.weixin.qq.com/connect/qrconnect?${params.toString()}#wechat_redirect`;
}

/**
 * 从URL中获取授权码
 */
export function getWechatAuthorizationCode(): string | null {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('code');
}

/**
 * 从URL中获取state参数
 */
export function getWechatState(): string | null {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('state');
}

/**
 * 检查是否为微信登录回调
 */
export function isWechatLoginCallback(): boolean {
  const code = getWechatAuthorizationCode();
  const state = getWechatState();
  return !!(code && state && state.startsWith('wechat_login_'));
}

/**
 * 启动微信登录流程
 */
export function startWechatLogin(): void {
  const loginUrl = getWechatLoginUrl();
  window.location.href = loginUrl;
}

/**
 * 处理微信登录回调
 */
export async function handleWechatLoginCallback(): Promise<{
  code: string;
  state: string;
} | null> {
  const code = getWechatAuthorizationCode();
  const state = getWechatState();
  
  if (!code || !state) {
    return null;
  }

  // 验证state参数防止CSRF攻击
  if (!state.startsWith('wechat_login_')) {
    console.error('Invalid state parameter');
    return null;
  }

  return {
    code,
    state,
  };
}

/**
 * 检查是否在微信浏览器中
 */
export function isWechatBrowser(): boolean {
  const ua = navigator.userAgent.toLowerCase();
  return ua.includes('micromessenger');
}

/**
 * 在微信浏览器中启动微信登录（静默授权）
 */
export function startWechatSilentLogin(): void {
  if (!isWechatBrowser()) {
    console.warn('Not in WeChat browser, using QR code login');
    startWechatLogin();
    return;
  }

  // 在微信浏览器中使用静默授权
  const params = new URLSearchParams({
    appid: WECHAT_LOGIN_CONFIG.appId,
    redirect_uri: WECHAT_LOGIN_CONFIG.redirectUri,
    response_type: 'code',
    scope: 'snsapi_base', // 静默授权，不需要用户确认
    state: WECHAT_LOGIN_CONFIG.state,
  });

  const loginUrl = `https://open.weixin.qq.com/connect/oauth2/authorize?${params.toString()}#wechat_redirect`;
  window.location.href = loginUrl;
}

/**
 * 获取微信登录配置
 */
export function getWechatLoginConfig() {
  return {
    ...WECHAT_LOGIN_CONFIG,
    isWechatBrowser: isWechatBrowser(),
  };
}
