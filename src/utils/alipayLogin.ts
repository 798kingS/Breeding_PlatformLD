/**
 * 支付宝登录工具类
 * 基于支付宝开放平台API
 */

// 支付宝登录配置
const ALIPAY_LOGIN_CONFIG = {
  appId: '2021001234567890', // 需要替换为实际的支付宝应用ID
  redirectUri: encodeURIComponent(window.location.origin + '/login/alipay/callback'),
  scope: 'auth_user',
  state: 'alipay_login_' + Math.random().toString(36).substring(2, 15), // 防止CSRF攻击
};

/**
 * 获取支付宝登录URL
 */
export function getAlipayLoginUrl(): string {
  const params = new URLSearchParams({
    app_id: ALIPAY_LOGIN_CONFIG.appId,
    redirect_uri: ALIPAY_LOGIN_CONFIG.redirectUri,
    scope: ALIPAY_LOGIN_CONFIG.scope,
    state: ALIPAY_LOGIN_CONFIG.state,
  });

  return `https://openauth.alipay.com/oauth2/publicAppAuthorize.htm?${params.toString()}`;
}

/**
 * 从URL中获取授权码
 */
export function getAlipayAuthCode(): string | null {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('auth_code');
}

/**
 * 从URL中获取state参数
 */
export function getAlipayState(): string | null {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('state');
}

/**
 * 检查是否为支付宝登录回调
 */
export function isAlipayLoginCallback(): boolean {
  const authCode = getAlipayAuthCode();
  const state = getAlipayState();
  return !!(authCode && state && state.startsWith('alipay_login_'));
}

/**
 * 启动支付宝登录流程
 */
export function startAlipayLogin(): void {
  const loginUrl = getAlipayLoginUrl();
  window.location.href = loginUrl;
}

/**
 * 处理支付宝登录回调
 */
export async function handleAlipayLoginCallback(): Promise<{
  authCode: string;
  state: string;
} | null> {
  const authCode = getAlipayAuthCode();
  const state = getAlipayState();
  
  if (!authCode || !state) {
    return null;
  }

  // 验证state参数防止CSRF攻击
  if (!state.startsWith('alipay_login_')) {
    console.error('Invalid state parameter');
    return null;
  }

  return {
    authCode,
    state,
  };
}

/**
 * 检查是否在支付宝浏览器中
 */
export function isAlipayBrowser(): boolean {
  const ua = navigator.userAgent.toLowerCase();
  return ua.includes('alipay') || ua.includes('alipayclient');
}

/**
 * 在支付宝浏览器中启动登录（静默授权）
 */
export function startAlipaySilentLogin(): void {
  if (!isAlipayBrowser()) {
    console.warn('Not in Alipay browser, using web login');
    startAlipayLogin();
    return;
  }

  // 在支付宝浏览器中使用静默授权
  const params = new URLSearchParams({
    app_id: ALIPAY_LOGIN_CONFIG.appId,
    redirect_uri: ALIPAY_LOGIN_CONFIG.redirectUri,
    scope: 'auth_base', // 静默授权，不需要用户确认
    state: ALIPAY_LOGIN_CONFIG.state,
  });

  const loginUrl = `https://openauth.alipay.com/oauth2/publicAppAuthorize.htm?${params.toString()}`;
  window.location.href = loginUrl;
}

/**
 * 获取支付宝登录配置
 */
export function getAlipayLoginConfig() {
  return {
    ...ALIPAY_LOGIN_CONFIG,
    isAlipayBrowser: isAlipayBrowser(),
  };
}

/**
 * 检查支付宝环境
 */
export function checkAlipayEnvironment(): {
  isAlipayBrowser: boolean;
  canUseSilentAuth: boolean;
  recommendedMethod: 'web' | 'silent';
} {
  const isAlipay = isAlipayBrowser();
  
  return {
    isAlipayBrowser: isAlipay,
    canUseSilentAuth: isAlipay,
    recommendedMethod: isAlipay ? 'silent' : 'web',
  };
}
