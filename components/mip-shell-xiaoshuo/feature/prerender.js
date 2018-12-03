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
   */
  updateFooterDom () {
    // 页面配置的数据
    let footerConfig = getJsonld(getCurrentWindow())
    const isRootPage = MIP.viewer.page.isRootPage
    // 用来记录翻页的次数，主要用来触发品专的广告
    let currentWindow = isRootPage ? window : window.parent
    window.MIP.viewer.page.emitCustomEvent(currentWindow, false, {
      name: 'updateShellFooter',
      data: {
        'jsonld': footerConfig
      }
    })
  }

  /**
   * 页面底部翻页按钮增加cache-first属性
   */
  resetNavigatorBtn () {
    let navigatorBtn = document.querySelectorAll('.navigator .button')
    if (navigatorBtn) {
      navigatorBtn[0].setAttribute('cache-first', true)
      navigatorBtn[2].setAttribute('cache-first', true)
    }
  }
}

export default prerender
