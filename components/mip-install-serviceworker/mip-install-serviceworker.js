/**
 * @file mip-install-serviceworker 组件
 * @author sekiyika(pengxing@baidu.com)
 */

import { parseUrl, isSecureUrl, getUrlWithoutHash } from './util'
import installUrlRewriter from './install-url-rewiter'

const { util, CustomElement } = MIP
const log = util.log('mip-install-serviceworker')

export default class MIPInstallServiceWorker extends CustomElement {
  constructor (...args) {
    super(...args)

    this.taskList = []

    /**
     * 表示当前节点是否调用过 connectedCallback
     *
     * @type {boolean}
     */
    this.inited = false
  }

  /** @override */
  connectedCallback () {
    if (this.inited) {
      return
    }
    this.inited = true

    // 如果 Service Worker 不支持，可以通过浏览器缓存来实现 shell 效果
    if (window.navigator.serviceWorker) {
      this.installUrlRewrite()
      return
    }

    let { element } = this

    if (!MIP.standalone) {
      // 在 mip 环境中，通过嵌入 iframe 的方式给目标页面提前注册 sw

      let iframeSrc = element.getAttribute('data-iframe-src')

      // 如果没有设置 data-iframe-src 或者 iframeSrc 并非安全地址，则不注册
      if (!iframeSrc || !isSecureUrl(iframeSrc)) {
        return
      }

      // 如果 iframe 的 origin 和 mip 原页面 origin 不一样，则不注册
      if (parseUrl(util.parseCacheUrl(window.location.href)).origin !== parseUrl(iframeSrc).origin) {
        return
      }

      // 添加到队列中，等待用户滚动组件到视图中统一执行
      this.taskList.push(() => this.registerIframe(iframeSrc))
    } else {
      // 不在分发平台页面中，直接注册 sw

      let src = element.getAttribute('src')

      // 如果 sw 的 origin 和当前页面的 origin 不相等，则不注册
      if (parseUrl(window.location.href).origin !== parseUrl(src).origin) {
        return
      }

      if (window.document && window.document.readyState === 'complete') {
        registerServiceWorker(src)
      } else {
        window.addEventListener('load', function () {
          registerServiceWorker(src)
        })
      }
    }
  }

  /**
   * 在第一次进入视图的时候清空队列中的函数
   */
  firstInviewCallback () {
    this.taskList.forEach(task => task())
  }

  /**
   * 插入 iframe
   *
   * @param {string} src iframe 链接
   * @param {string} type iframe 的类型
   */
  registerIframe (src, type) {
    let iframe = document.createElement('iframe')

    iframe.setAttribute('sandbox', 'allow-same-origin allow-scripts')
    iframe.src = src + (type ? ('#' + type) : '')
    iframe.style.display = 'none'

    // 一旦 iframe 加载完成就将 iframe 的 dom 删除掉
    iframe.onload = function () {
      iframe.parentElement.removeChild(iframe)
    }

    this.element.appendChild(iframe)
  }

  /**
   * 如果当前环境不支持 service worker 的话，可以安装 url rewrite
   */
  installUrlRewrite () {
    // URL Rewrite 只在独立站时才能使用
    if (!MIP.standalone) {
      return
    }

    let { element } = this

    // 读取 url-rewrite 的配置
    let urlMatch = element.getAttribute('data-no-service-worker-fallback-url-match')
    let shellUrl = element.getAttribute('data-no-service-worker-fallback-shell-url')

    if (!urlMatch && !shellUrl) {
      return
    }

    shellUrl = getUrlWithoutHash(shellUrl)

    if (shellUrl && isSecureUrl(shellUrl)) {
      let urlMatchRegExp

      try {
        urlMatchRegExp = new RegExp(urlMatch)
      } catch (e) {
        throw new Error('Invalid "data-no-service-worker-fallback-url-match" expression', e)
      }

      installUrlRewriter(urlMatchRegExp, shellUrl)
      this.taskList.push(() => this.registerIframe(shellUrl, 'preload'))
    }
  };
}

/**
 * 注册 Service Worker
 *
 * @param {string} src Service Worker 的地址
 */
function registerServiceWorker (src) {
  if (navigator.serviceWorker) {
    navigator.serviceWorker.register(src)
      .then(() => {
        log.info('service worker 安装成功')
      })
      .catch(log.error)
  }
}
