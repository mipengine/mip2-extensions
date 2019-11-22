/**
 * @file 小说 util
 * @author chenyongle
 */

/**
 * 获取当前定制化页面的 window
 *
 * @returns {window} 当前 iframe 的 window
 */
export function getCurrentWindow () {
  let pageId = window.MIP.viewer.page.currentPageId || ''
  let pageInfo = window.MIP.viewer.page.getPageById(pageId)
  return pageInfo.targetWindow
}
/**
 * 获取当前定制化页面的 root window
 *
 * @returns {window} 当前 iframe 的 root window
 */
export function getRootWindow () {
  let win = getCurrentWindow()
  return win.MIP.viewer.page.isRootPage
    ? win
    : win.parent
}
/**
 * [getHashData 根据 key 获取 hash 中的数据]
 *
 * @param  {string} key key
 * @returns {string}     value
 */
export const getHashData = key => {
  let MIP = window.MIP || {}
  return MIP && MIP.hash && MIP.hash.get ? MIP.hash.get(key) : ''
}
/**
 * 返回当前页面的状态
 *
 * @param {window} win 当前页面的 window 对象
 * @returns {Object} 返回一个表示状态的对象
 */
export function state (win) {
  const rootWindow = getRootWindow(win)
  return {
    /**
      * 返回当前页面状态
      *
      * @type {Array} [1, 3] 第一章第三节
      */
    isRootPage: win.MIP.viewer.page.isRootPage,
    /**
      * 返回当前页面的原始URL
      *
      * @type {string} 当前页面的原始URL
      */
    originalUrl: win.MIP.util.getOriginalUrl(),
    /**
      * 当前的小说实例
      *
      * @type {object} 当前的小说实例对象
      */
    novelInstance: rootWindow.MIP.novelInstance
  }
}
/**
 * [getHashData 根据 key 获取 hash 中的数据]
 *
 * @returns {string}  value
 */
export const getNovelInstanceId = () => {
  return (Math.random() * 10000000).toString(16).substr(0, 4) + '-' + (new Date()).getTime() + '-' + Math.random().toString().substr(2, 5)
}
