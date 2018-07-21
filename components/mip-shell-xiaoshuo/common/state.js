/**
* 返回当前页面是否是根页面 - 搜索点出
*
* @returns {boolean} 是搜索点出、不是搜索点出
*/
export function isRootPage () {
  return true
}

/**
* 返回当前页面状态
*
* @returns {Array} [1, 3] 第一章第三节
*/
export function currentPage () {
  return [1, 3]
}

/**
* 下一页状态
*
* @returns {Array} [2, 1] 第二章第一节
*/
export function nextPage () {
  return [2, 1]
}

/**
* 上一页状态
*
* @returns {Array} [2, 1] 第一章第二节
*/
export function previousPage () {
  return [1, 2]
}

/**
* 当前页是本章最后一页
*
* @returns {boolean} 是本章最后一页
*/
export function isChapterEnd () {
  return true
}

// import { isRootPage, currentPage } from './common';
