/**
 * QQ登录工具类
 * 基于QQ互联开放平台API
 */

// QQ登录配置
const QQ_LOGIN_CONFIG = {
  appId: '101234567', // 需要替换为实际的QQ应用ID
  redirectUri: encodeURIComponent(window.location.origin + '/login/qq/callback'),
  scope: 'get_user_info',
};

/**
 * 获取QQ登录URL
 */
export function getQQLoginUrl(): string {
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: QQ_LOGIN_CONFIG.appId,
    redirect_uri: QQ_LOGIN_CONFIG.redirectUri,
    scope: QQ_LOGIN_CONFIG.scope,
    state: Math.random().toString(36).substring(2, 15), // 防止CSRF攻击
  });

  return `https://graph.qq.com/oauth2.0/authorize?${params.toString()}`;
}

/**
 * 从URL中获取授权码
 */
export function getAuthorizationCode(): string | null {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('code');
}

/**
 * 使用授权码获取Access Token
 */
export async function getAccessToken(code: string): Promise<{
  access_token: string;
  expires_in: number;
  refresh_token: string;
} | null> {
  try {
    const response = await fetch(
      `https://graph.qq.com/oauth2.0/token?grant_type=authorization_code&client_id=${QQ_LOGIN_CONFIG.appId}&client_secret=YOUR_CLIENT_SECRET&code=${code}&redirect_uri=${QQ_LOGIN_CONFIG.redirectUri}`,
      {
        method: 'GET',
      }
    );

    const text = await response.text();
    
    // QQ返回的是URL编码格式，需要解析
    const params = new URLSearchParams(text);
    const accessToken = params.get('access_token');
    const expiresIn = params.get('expires_in');
    const refreshToken = params.get('refresh_token');

    if (accessToken) {
      return {
        access_token: accessToken,
        expires_in: parseInt(expiresIn || '0'),
        refresh_token: refreshToken || '',
      };
    }

    return null;
  } catch (error) {
    console.error('获取QQ Access Token失败:', error);
    return null;
  }
}

/**
 * 使用Access Token获取OpenID
 */
export async function getOpenId(accessToken: string): Promise<string | null> {
  try {
    const response = await fetch(
      `https://graph.qq.com/oauth2.0/me?access_token=${accessToken}`,
      {
        method: 'GET',
      }
    );

    const text = await response.text();
    
    // QQ返回的是JSONP格式，需要提取JSON部分
    const jsonMatch = text.match(/callback\((.+)\)/);
    if (jsonMatch) {
      const data = JSON.parse(jsonMatch[1]);
      return data.openid;
    }

    return null;
  } catch (error) {
    console.error('获取QQ OpenID失败:', error);
    return null;
  }
}

/**
 * 使用Access Token获取用户信息
 */
export async function getQQUserInfo(accessToken: string, openId: string): Promise<{
  nickname: string;
  figureurl_qq_1: string;
  figureurl_qq_2: string;
  gender: string;
  [key: string]: any;
} | null> {
  try {
    const response = await fetch(
      `https://graph.qq.com/user/get_user_info?access_token=${accessToken}&oauth_consumer_key=${QQ_LOGIN_CONFIG.appId}&openid=${openId}`,
      {
        method: 'GET',
      }
    );

    const data = await response.json();
    
    if (data.ret === 0) {
      return data;
    }

    return null;
  } catch (error) {
    console.error('获取QQ用户信息失败:', error);
    return null;
  }
}

/**
 * 启动QQ登录流程
 */
export function startQQLogin(): void {
  const loginUrl = getQQLoginUrl();
  window.location.href = loginUrl;
}

/**
 * 处理QQ登录回调
 */
export async function handleQQLoginCallback(): Promise<{
  accessToken: string;
  openId: string;
  userInfo: any;
} | null> {
  const code = getAuthorizationCode();
  
  if (!code) {
    return null;
  }

  // 获取Access Token
  const tokenData = await getAccessToken(code);
  if (!tokenData) {
    return null;
  }

  // 获取OpenID
  const openId = await getOpenId(tokenData.access_token);
  if (!openId) {
    return null;
  }

  // 获取用户信息
  const userInfo = await getQQUserInfo(tokenData.access_token, openId);
  if (!userInfo) {
    return null;
  }

  return {
    accessToken: tokenData.access_token,
    openId,
    userInfo,
  };
}
