/**
 * @file 小说内部预渲染
 * @author tanqihui
 */
import { getJsonld, getCurrentWindow } from '../common/util'
class prerender {
  /**
   * 小说预渲染
   *
   * @param {Object} jsonld 模板数据，用于更新footer的链接
   */
  readerPrerender (jsonld) {
    let nextPageUrl = jsonld.nextPage.url
    let prePageUrl = jsonld.previousPage.url
    if (window.MIP.util.isCacheUrl(location.href)) { // 处于cache下，需要转换cacheUrl
      window.MIP.viewer.page.prerender([this.getCacheUrl(nextPageUrl), this.getCacheUrl(prePageUrl)])
        .catch(err => {
          console.error(new Error(err)) // 抛出错误
        })
    } else {
      window.MIP.viewer.page.prerender([nextPageUrl, prePageUrl])
        .catch(err => {
          console.error(new Error(err)) // 抛出错误
        })
    }
  }

  /**
   * 拼接cacheUrl
   *
   * @param {string} url 需要被拼接的url
   * @returns {string} 返回的cacheURl
   */
  getCacheUrl (url) {
    if (url) {
      let netUrl = url.split('/')[2].split('.').join('-')
      return `https://${netUrl}.mipcdn.com${MIP.util.makeCacheUrl(url)}`
    }
    return ''
  }

  /**
   * 更新footer链接
   *
   */
  updateFooterDom (isReaderPrerender) {
    // 页面配置的数据
    let footerConfig = getJsonld(getCurrentWindow())
    const isRootPage = MIP.viewer.page.isRootPage
    // 用来记录翻页的次数，主要用来触发品专的广告
    let currentWindow = isRootPage ? window : window.parent
    if (window.MIP.util.isCacheUrl(location.href) && isReaderPrerender) { // cache页，需要改变翻页的地址为cache地址
      footerConfig.nextPage.url = this.getCacheUrl(footerConfig.nextPage.url)
      footerConfig.previousPage.url = this.getCacheUrl(footerConfig.previousPage.url)
    }
    window.MIP.viewer.page.emitCustomEvent(currentWindow, false, {
      name: 'updateShellFooter',
      data: {
        'jsonld': footerConfig
      }
    })
  }

  /**
   * 获取默认配置及用户历史配置
   */
  __getConfig () {
    // 默认配置
    let DEFAULTS = {
      theme: 'default',
      fontSize: 3.5
    }
    let STORAGE_KEY = 'mip-shell-xiaoshuo-mode'
    let CustomStorage = MIP.util.customStorage
    let storage = new CustomStorage(0)
    let extend = MIP.util.fn.extend
    let config = DEFAULTS
    try {
      config = extend(config, JSON.parse(storage.get(STORAGE_KEY)))
    } catch (e) { }
    if (config.theme) {
      document.documentElement.setAttribute('mip-shell-xiaoshuo-theme', config.theme)
    }
    if (config.fontSize) {
      document.documentElement.setAttribute('mip-shell-xiaoshuo-font-size', config.fontSize)
    }
  };

  /**
   * 底部按钮的链接以及cache-first属性需要更新
   */
  resetNavigatorBtn () {
    let navigatorBtn = document.querySelectorAll('.navigator .button')
    let footerConfig = getJsonld(getCurrentWindow())
    if (window.MIP.util.isCacheUrl(location.href)) { // cache页，需要改变翻页的地址为cache地址
      footerConfig.nextPage.url = this.getCacheUrl(footerConfig.nextPage.url)
      footerConfig.previousPage.url = this.getCacheUrl(footerConfig.previousPage.url)
    }
    navigatorBtn[0].href = footerConfig.previousPage.url
    navigatorBtn[0].setAttribute('cache-first', true)
    navigatorBtn[2].href = footerConfig.nextPage.url
    navigatorBtn[2].setAttribute('cache-first', true)
  }
}

export default prerender
