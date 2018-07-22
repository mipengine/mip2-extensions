/**
 * @file 小说中的各种状态
 * @author JennyL, LiuJing
 */
export default (() => {
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
      return {
        'chapter': 1,
        'page': 3,
        'id': window.MIP.viewer.page.pageId
      }
    },
    /**
      * 下一页状态
      *
      * @returns {Object} {2, 1, id} 第二章,第一节,页面id(url)
      */
    nextPage: () => {
      return {
        'chapter': 2,
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
      * 当前页是本章最后一页
      *
      * @returns {boolean} 是本章最后一页
      */
    isChapterEnd () {
      return true
    },

    /**
      * 根页面/搜索点出 ID(Root Page ID)，通常为页面URL, 可以用于选择根页面定制化组件
      *
      * @returns {string} 根页面ID(Root Page ID)
      */
    rootPageId () {
      return ''
    }
  }
})()
