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
      if (!jsonld.currentPage) {
        throw new Error('请检查head中json-ld配置，currentPage 不存在')
      } else {
        return {
          'chapter': jsonld.currentPage.chapter,
          'page': jsonld.currentPage.page,
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
        'chapter': jsonld.nextPage && jsonld.nextPage.chapter,
        'page': jsonld.nextPage && jsonld.nextPage.chapter,
        'id': jsonld.nextPage && jsonld.nextPage.url
      }
    },
    /**
      * 上一页状态
      *
      * @returns {Object} {1, 2, id} 第一章,第二节,页面id(url)
      */
    previousPage: () => {
      return {
        'chapter': jsonld.previousPage && jsonld.previousPage.chapter,
        'page': jsonld.previousPage && jsonld.previousPage.chapter,
        'id': jsonld.previousPage && jsonld.previousPage.url
      }
    },
    /**
      * 当前页是本章最后一页,
      *
      * @returns {boolean} 是本章最后一页
      */
    isChapterEnd () {
      return jsonld.currentPage.isLastPage
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
      return jsonld.currentPage.isLastPage
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
