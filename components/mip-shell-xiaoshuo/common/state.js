/**
 * @file 小说中的各种状态
 * @author JennyL, liujing
 */
export default () => {
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
      * @returns {Array} [1, 3] 第一章第三节
      */
    currentPage: () => {
      return [1, 3]
    },
    /**
      * 下一页状态
      *
      * @returns {Array} [2, 1] 第二章第一节
      */
    nextPage: () => {
      return [2, 1]
    },
    /**
      * 上一页状态
      *
      * @returns {Array} [2, 1] 第一章第二节
      */
    previousPage: () => {
      return [1, 2]
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
      * 当前页面的页面ID，通常为页面URL
      *
      * @returns {string} 当前页面的页面ID
      */
    pageId () {
      return window.MIP.viewer.page.pageId
    },
    /**
      * 全局custom的ID
      *
      * @returns {string} 全局custom的ID
      */
    globalCustomId () {
      return ''
    }
  }
}
