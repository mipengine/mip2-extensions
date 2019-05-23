/**
 * @file 家庭医生在线广告
 * @author Shiuka(dyn.yxt@gmail.com)
 */

/**
 * 渲染家庭医生在线广告系统投放的广告
 *
 * @param  {HTMLElement} el 当前 mip-ad 组件的 DOM 元素
 */
export default function render (el) {
  el.classList.add('__customer_place')

  if (window.CUSTOMER) {
    loadSubScript(el)
  } else {
    window.require(['https://img.familydoctor.com.cn/component/common/scripts/gg_main.min'], function (CUSTOMER) {
      window.CUSTOMER = CUSTOMER
      loadSubScript(el)
    })
  }
}

/**
 * 加载广告位 js
 *
 * @param  {HTMLElement} el 当前 mip-ad 组件的 DOM 元素
 */
function loadSubScript (el) {
  let id = parseInt(el.getAttribute('data-id'), 10)
  let src = getPlaceUrl(id)
  let scri = document.createElement('script')
  scri.src = src
  el.appendChild(scri)
}

/**
 * 获取广告位 url
 *
 * @param  {string} id 广告位 id
 */
function getPlaceUrl (id) {
  let str = id.toString()
  let fileName = `ggw_${id}.js`
  let dir = ''
  let count = 9

  if (str.length < count) {
    str = `000000000${str}`
  }

  str = substr(str, -count)
  dir = str.substring(3, 6) + '/'

  return `https://static.tj.familydoctor.com.cn/c/a/${dir + fileName}`
}

/**
 * 字符串截取
 *
 * @param  {string} str   被截取的字符串
 * @param  {number} start 截取的起点位置
 * @param  {number} len   截取的长度
 */
function substr (str, start, len) {
  if (start < 0) {
    start = str.length + start
  }

  return str.substr(start, len)
}
