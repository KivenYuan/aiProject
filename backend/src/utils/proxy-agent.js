/**
 * 出站 HTTPS 代理：Node 进程默认不使用系统代理，需通过 HTTPS_PROXY / HTTP_PROXY 访问 GitHub。
 */

const { HttpsProxyAgent } = require('https-proxy-agent');

let cachedAgent = null;
let cachedKey = '';

function getProxyUrl() {
  return (
    process.env.HTTPS_PROXY ||
    process.env.https_proxy ||
    process.env.HTTP_PROXY ||
    process.env.http_proxy ||
    process.env.ALL_PROXY ||
    process.env.all_proxy ||
    ''
  ).trim();
}

/** 合并到 axios 配置：有代理时使用 httpsAgent，并 proxy: false 避免冲突 */
function getAxiosProxyConfig() {
  const url = getProxyUrl();
  if (!url) {
    return {};
  }
  if (cachedAgent && cachedKey === url) {
    return { httpsAgent: cachedAgent, proxy: false };
  }
  try {
    cachedAgent = new HttpsProxyAgent(url);
    cachedKey = url;
    console.log('[proxy] 出站 HTTPS 经代理:', url.replace(/\/\/([^:@/]+):([^@/]+)@/, '//$1:***@'));
    return { httpsAgent: cachedAgent, proxy: false };
  } catch (e) {
    console.warn('[proxy] 解析代理地址失败:', e.message);
    return {};
  }
}

module.exports = { getProxyUrl, getAxiosProxyConfig };
