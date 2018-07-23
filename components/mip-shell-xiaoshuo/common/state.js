/**
 * @file 小说中的各种状态
 * @author JennyL, LiuJing
 */
import util from './util'

export default (() => {
  // 获取html head 中json-ld 配置
  let jsonld = util.getJsonld()
  return {
    /**
      * 返回当前页面状态
      *
      * @returns {Array} [1, 3] 第一章第三节
      */
    isRootPage: () => {
      return window.MIP.viewer.page.isRootPage
    },
    /**
      * 返回当前页面状态
      *
      * @returns {Array} {1, 3, id} 第一章,第三节,页面id(url)
      */
    currentPage: () => {
      if (!jsonld.currentChapter || !jsonld.currentPage) {
        throw new Error('请检查head中json-ld配置，currentChapter/currentPage 不存在')
      } else {
        return {
          'chapter': jsonld.currentChapter,
          'page': jsonld.currentPage,
          'id': MIP.viewer.page.currentPageId
        }
      }
    },
    /**
      * 下一页状态
      *
      * @returns {Object} {2, 1, id} 第二章,第一节,页面id(url)
      */
    nextPage: () => {
      return {
        'url': 2,
        'page': 1,
        'id': ''// todo
      }
    },
    /**
      * 上一页状态
      *
      * @returns {Object} {1, 2, id} 第一章,第二节,页面id(url)
      */
    previousPage: () => {
      return {
        'chapter': 1,
        'page': 2,
        'id': ''// todo
      }
    },
    /**
      * 当前页是本章最后一页,
      *
      * @returns {boolean} 是本章最后一页
      */
    isChapterEnd () {
      let isChapterEnd = false
      let isRootPage = window.MIP.viewer.page.isRootPage
      let win = isRootPage ? window : window.top
      let shellConfig = win.MIP.mipshellXiaoshuo.shellConfig
      // 获取当前页链接
      let reg = new RegExp(shellConfig.routes[0].pattern)
      const currentUrl = window.location.href.match(reg)[0]
      if (!currentUrl) {
        console.error('请确认 mip-shell-xiaoshuo 中 pattern 配置正确，且以页面链接匹配后在 catalog->pages 中存在')
      }
      // 获取目录，在目录中匹配页面url, 判断当前页url是否是某张最后一页
      let catalogs = shellConfig.routes[0].meta.catalog
      catalogs.forEach((item) => {
        let pages = item.pages
        pages.forEach((page, i) => {
          if (page === currentUrl && i === pages.length - 1) {
            isChapterEnd = true
          }
        })
      })
      return isChapterEnd
    },

    /**
      * 根页面/搜索点出 ID(Root Page ID)，通常为页面URL, 可以用于选择根页面定制化组件
      *
      * @returns {string} 根页面ID(Root Page ID)
      */
    rootPageId () {
      return window.MIP.viewer.page.pageId
    },
    /**
      * 当前页面的章名
      *
      * @returns {string} 当前页面的章名
      */
    chapterName () {
      return '第一章'
    },
    /**
      * 当前页面是否是搜索结果点出
      *
      * @returns {string} 当前页面是否是搜索结果点出
      */
    isFromSearch () {
      return MIP.viewer.page.pageId === MIP.viewer.page.currentPageId
    }

  }
})()
