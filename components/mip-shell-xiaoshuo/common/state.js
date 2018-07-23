/**
 * @file 小说中的各种状态
 * @author JennyL, LiuJing
 */
export default (() => {
  return {
    getJsonld: () => {
      console.log('in getJsonld')
      // 获取<head>中声明的mip-shell-xiaoshuo 配置。每个页面不同，如上一页链接，当前章节名
      let jsonld = document.head.querySelector("script[type='application/ld+json']")
      let jsonldConf
      try {
        jsonldConf = JSON.parse(jsonld.innerText).mipShellConfig
        if (!jsonldConf) {
          throw new Error('mip-shell-xiaoshuo配置错误，请检查头部 application/ld+json mipShellConfig')
        } else {
          return jsonldConf
        }
      } catch (e) {
        console.error(e)
      }
    },
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
      let chapter

      if (!chapter) {
        throw new Error('请检查head中jsonld配置，chapter不存在')
      } else {
        return {
          'chapter': 1,
          'page': 3,
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
      return window.MIP.viewer.page.pageId
    },
    /**
      * 当前页面的章名
      *
      * @returns {string} 当前页面的章名
      */
    chapterName () {
      return '第一章'
    }
  }
})()
