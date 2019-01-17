/**
 * @file 通用广告
 * @author mj(zoumiaojiang@gmail.com)
 */

/**
 * 通用广告组件的 render 方法
 *
 * @param {HTMLElement} el 当前 mip-ad 组件的 DOM 元素
 */
export default function render (el) {
  let tpl = el.getAttribute('tpl')

  switch (tpl) {
    case 'onlyImg':
      renderOnlyImg(el)
      break
    case 'noneImg':
      renderNoneImg(el)
      break
    case 'oneImg':
      renderOneImg(el)
      break
    case 'moreImg':
      renderMoreImg(el)
      break
  }
}

/**
 * banner 样式渲染函数
 *
 * @param {HTMLElement} el 当前 mip-ad 组件的 DOM 元素
 */
function renderOnlyImg (el) {
  let url = el.getAttribute('href')
  let src = el.getAttribute('src')
  let size = (el.getAttribute('data-size') || '').trim().split(' ')
  let ratio = (size[1] / size[0] * 100).toFixed(2)
  let html = `<div class="mip-ad-bannerbox" style="padding-bottom:${ratio}%;"><img src="${src}"></div>`
  let node = document.createElement('a')

  node.setAttribute('href', url)
  node.classList.add('c-urljump')
  node.innerHTML = html

  el.appendChild(node)
  el.customElement.applyFillContent(node, true)
}

/**
 * 无图样式渲染函数
 *
 * @param {HTMLElement} el 当前 mip-ad 组件的 DOM 元素
 */
function renderNoneImg (el) {
  let url = el.getAttribute('href')
  let title = el.getAttribute('data-title')
  let html = `<div class="mip-ad-row"><div class="c-span12 c-line-clamp2">${title}</div></div>`
  let node = document.createElement('a')

  node.setAttribute('href', url)
  node.className += 'c-blocka c-urljump mip-ad-box'
  node.innerHTML = html

  el.appendChild(node)
  el.customElement.applyFillContent(node, true)
}

/**
 * 单图样式渲染函数
 *
 * @param {HTMLElement} el 当前 mip-ad 组件的 DOM 元素
 */
function renderOneImg (el) {
  let url = el.getAttribute('href')
  let src = el.getAttribute('src')
  let title = el.getAttribute('data-title')
  let size = (el.getAttribute('data-size') || '').trim().split(' ')
  let ratio = (size[1] / size[0] * 100).toFixed(2)
  let node = document.createElement('a')
  let html = `
    <div class="mip-ad-row">
      <div class="c-span4">
        <div class="c-img c-img-x" style="padding-bottom:${ratio}%;"><img src="${src}"></div>
      </div>
      <div class="c-span8 c-line-clamp2">${title}</div>
    </div>`

  node.setAttribute('href', url)
  node.className += 'c-blocka c-urljump mip-ad-box'
  node.innerHTML = html

  el.appendChild(node)
  el.customElement.applyFillContent(node, true)
}

/**
 * 多图样式渲染函数
 *
 * @param {HTMLElement} el 当前 mip-ad 组件的 DOM 元素
 */
function renderMoreImg (el) {
  let url = el.getAttribute('href')
  let srcs = el.getAttribute('src').split(';')
  let dataTxt = el.getAttribute('data-txt')
  let dataAds = el.getAttribute('data-ads')
  let txts = dataTxt ? dataTxt.split(';') : []
  let ads = dataAds ? dataAds.split(';') : []
  let title = el.getAttribute('data-title') || ''
  let size = (el.getAttribute('data-size') || '').trim().split(' ')
  let ratio = (size[1] / size[0] * 100).toFixed(2)
  let len = srcs.length < 3 ? srcs.length : 3
  let imgHtml = ''

  if (len >= 3) {
    for (let index = 0; index < len; index++) {
      imgHtml += `
      <div class="c-span4">
        <div class="mip-ad-imgbox">
          <div class="c-img c-img-x" style="padding-bottom:${ratio}%;"><img src="${srcs[index]}"></div>
          ${getLineHtml(ads[index], 'mip-ad-abs')}
        </div>
        ${getLineHtml(txts[index], '')}
      </div>`
    }

    let html = [
      `<div class="mip-ad-row c-gap-bottom-small"><div class="c-span12 c-title">${title}</div></div>`,
      `<div class="mip-ad-row">${imgHtml}</div>`
    ].join('')

    let node = document.createElement('a')
    node.setAttribute('href', url)
    node.className += 'c-blocka c-urljump mip-ad-box'
    node.innerHTML = html

    el.appendChild(node)
    el.customElement.applyFillContent(node, true)
  }
}

/**
 * 生成 c-line 样式组件
 *
 * @param {string} content 行内元素内容
 * @param {string} clsname 指定的 class 名称
 */
function getLineHtml (content, clsname) {
  return content ? `<div class="c-line-clamp1 ${clsname}">${content}</div>` : ''
}
