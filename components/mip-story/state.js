/**
 * @file 状态管理
 * @author wangqizheng
 */
import storage from './storage'
import {
  STORY_PREFIX
} from './constants'
import { unique } from './utils'

const { util, hash } = MIP
const originalUrl = util.getOriginalUrl().split('?')[0].split('#')[0]
let currentPageIndex = getState() || 0

/**
 * 获取状态
 */
function getState () {
  const hashPageIndex = hash.hashTree[STORY_PREFIX] && hash.hashTree[STORY_PREFIX].value
  let pageIndex = 0
  try {
    pageIndex = storage.get(originalUrl) || parseInt(hashPageIndex)
  } catch (e) {}
  return pageIndex
}

/**
 * 设置状态
 *
 * @param {number} index 页面索引
 */
function setState (index) {
  storage.set(originalUrl, index)
}

/**
 * 获取页面状态索引
 *
 * @param {number} viewsLength 页面数量
 */
function getPageStateIndex (viewsLength) {
  let maxIndex = viewsLength - 1
  let curIndex = currentPageIndex > maxIndex ? maxIndex : currentPageIndex
  currentPageIndex = curIndex
  const preIndex = curIndex > 0 ? curIndex - 1 : 0
  const nextIndex = curIndex < maxIndex ? curIndex + 1 : maxIndex
  return [preIndex, currentPageIndex, nextIndex]
}

/**
 * 获取预加载页面索引
 *
 * @param {*} viewsLength 页面数量
 */
function getPreloadIndex (viewsLength) {
  let preloadIndex = []
  const pageState = getPageStateIndex(viewsLength)
  const minIndex = pageState[0] - 1 >= 0 ? pageState[0] - 1 : 0
  const maxIndex = pageState[2] >= viewsLength - 1 ? pageState[2] : pageState[2] + 1

  preloadIndex.push(minIndex)
  preloadIndex = preloadIndex.concat(pageState)
  preloadIndex.push(maxIndex)

  return unique(preloadIndex)
}

export default {
  currentPageIndex,
  setState,
  getPageStateIndex,
  getPreloadIndex
}
