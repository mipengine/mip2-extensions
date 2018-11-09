/**
 * @file 小说中的各种状态
 * @author JennyL, LiuJing
 */
import {getJsonld, getRootWindow} from './util'

export default (currentWindow) => {
  const jsonld = getJsonld(currentWindow)
  const rootWindow = getRootWindow(currentWindow)

  if (!jsonld.currentPage) {
    throw new Error('请检查head中json-ld配置，currentPage 不存在')
  }
  return {
    // 获取html head 中json-ld 配置
    /**
      * 返回当前页面的原始URL
      *
      * @type {string} 当前页面的原始URL
      */
    originalUrl: currentWindow.MIP.util.getOriginalUrl(),
    /**
      * 返回当前页面状态
      *
      * @type {Array} [1, 3] 第一章第三节
      */
    isRootPage: currentWindow.MIP.viewer.page.isRootPage,
    /**
      * 返回当前页面状态
      *
      * @type {Array} {1, 3, id} 第一章,第三节,页面id(url)
      */
    currentPage: {
      chapter: jsonld.currentPage.chapter,
      page: jsonld.currentPage.page,
      id: currentWindow.MIP.viewer.page.currentPageId
    },
    /**
      * 下一页状态
      *
      * @type {Object} {2, 1, id} 第二章,第一节,页面id(url)
      */
    nextPage: {
      chapter: jsonld.nextPage && jsonld.nextPage.chapter,
      page: jsonld.nextPage && jsonld.nextPage.chapter,
      id: jsonld.nextPage && jsonld.nextPage.url
    },
    /**
      * 上一页状态
      *
      * @type {Object} {1, 2, id} 第一章,第二节,页面id(url)
      */
    previousPage: {
      chapter: jsonld.previousPage && jsonld.previousPage.chapter,
      page: jsonld.previousPage && jsonld.previousPage.chapter,
      id: jsonld.previousPage && jsonld.previousPage.url
    },
    /**
      * 当前页是本章最后一页,
      *
      * @type {boolean} 是本章最后一页
      */
    isLastPage: jsonld.currentPage.isLastPage,

    /**
      * 根页面/搜索点出 ID(Root Page ID)，通常为页面URL, 可以用于选择根页面定制化组件
      *
      * @type {string} 根页面ID(Root Page ID)
      */
    rootPageId: currentWindow.MIP.viewer.page.pageId,
    /**
      * 当前页面的章名
      *
      * @type {string} 当前页面的章名
      */
    chapterName: jsonld.currentPage.chapterName,
    /**
      * 当前页面是否是搜索结果点出
      *
      * @type {string} 当前页面是否是搜索结果点出
      */
    isFromSearch: currentWindow.MIP.viewer.page.pageId === currentWindow.MIP.viewer.page.currentPageId,
    /**
      * 当前的小说实例
      *
      * @type {object} 当前的小说实例对象
      */
    novelInstance: rootWindow.MIP.novelInstance
  }
}
