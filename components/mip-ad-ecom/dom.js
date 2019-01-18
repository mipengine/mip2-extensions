/**
 * @file mip-ad-ecom 的 dom 操作工具包
 * @author mj(zoumiaojiang@gmail.com)
 */

/* global MIP */

import dataProcessor from './data'

const { util, templates, viewer } = MIP
const fixedElement = viewer.fixedElement
const REGEXS = dataProcessor.REGEXS

/**
 * mip-ad-ecom placeholder 类名
 *
 * @type {string}
 */
const PLACEHOLDER_PREFIX = 'mip-ad-ecom-placeholder'

let maxzIndex = 0
let excr = 44

/**
 * 获取样式
 * 由于目前只需要取 height 和 paddig-bottom,
 * 所以对 util.css 结果进行处理, 返回整数
 *
 * @param   {HTMLElement} elem     dom 节点
 * @param   {string} cssProperty 获取样式
 * @returns {number} 返回的数值
 */
function getCssPropertyValue (elem, cssProperty) {
  return parseInt(util.css(elem, cssProperty), 10) || 0
}

/**
 * 渲染 style/script 函数
 * 截取 style/script 并插入到 dom 中
 *
 * @param {string} str    返回的 tpl 字符串
 * @param {RegExp} reg    截取的正则表达式
 * @param {string} tag    定制化 MIP 标签名
 * @param {string} attr   style/script
 * @param {HTMLElement} container style/script 节点的容器
 */
function renderStyleOrScript (str, reg, tag, attr, container) {
  let node = container.querySelector(`${tag}[${attr}]`) || document.createElement(tag)
  let substrs = str.match(reg)

  node.setAttribute(attr, '')
  substrs && substrs.forEach(tmp => {
    let reg = new RegExp('<' + tag + '>([\\S\\s]*)</' + tag + '>', 'g')
    let substr = reg.exec(tmp)
    let innerhtml = substr && substr[1] ? substr[1] : ''

    if (node.innerHTML.indexOf(innerhtml) === -1) {
      node.innerHTML += innerhtml
    }
  })

  container.appendChild(node)
}

/**
 * 创建定制化组件的 template 子节点
 *
 * @param   {string}  html 定制化组件 dom 字符串
 * @param   {number} id   template id
 * @returns {HTMLElement}  template 子节点
 */
function createTemplateNode (html, id) {
  let tpl = document.createElement('template')
  tpl.setAttribute('type', 'mip-mustache')
  tpl.id = id
  tpl.innerHTML = dataProcessor.getSubString(html, REGEXS.innerHtml)

  return tpl
}

/**
 * 创建定制化组件节点
 *
 * @param   {string} html      定制化组件 dom 字符串
 * @param   {string} customTag 定制化组件标签
 * @returns {HTMLElement}      定制化组件节点
 */
function createCustomNode (html, customTag) {
  let node = document.createElement(customTag)
  let tagandAttrs = dataProcessor.getSubString(html, REGEXS.tagandAttr).split(' ')
  let id = customTag + '-' + Math.random().toString(36).slice(2)

  tagandAttrs.forEach(item => {
    let attrs = item.split('=')
    attrs[0] && attrs[1] && node.setAttribute(attrs[0], attrs[1].replace(/"/ig, ''))
  })

  node.setAttribute('template', id)
  node.appendChild(createTemplateNode(html, id))

  return node
}

/**
 * [renderHtml 渲染html]
 *
 * @param   {HTMLElement}     element   mip-ad-ecom 节点
 * @param   {string}  str       返回的 tpl 字符串
 * @param   {number} len       模块中第几个组件
 * @param   {Object}  result    渲染mustache模板的数据
 * @param   {HTMLElement}     container 装载定制化组件节点的容器
 * @returns {string}  customTag 定制化组件标签
 */
function renderHtml (element, str, len, result, container) {
  let html = str.replace(REGEXS.script, '').replace(REGEXS.style, '')
  let customTag = (new RegExp(REGEXS.tag, 'g')).exec(html)
  customTag = (customTag && customTag[1]) ? customTag[1] : null

  if (!customTag) {
    return null
  }

  // html 处理
  let customNode = createCustomNode(html, customTag)
  let itemNode = document.createElement('div')

  itemNode.setAttribute('mip-ad-ecom-item', len)
  itemNode.appendChild(customNode)
  container.appendChild(itemNode)

  // 模板渲染
  templates.render(customNode, result, true).then(res => {
    res.element.innerHTML = res.html

    if (res.element.hasAttribute('mip-fixed') &&
        res.element.parentNode.getAttribute('type') === 'bottom') {
      fixedElement.setPlaceholder()
      let zIndex = getCssPropertyValue(res.element.parentNode, 'z-index')

      if (zIndex >= maxzIndex) {
        maxzIndex = zIndex
        // alert(getCss(res.element, 'height') - 10)
        fixedElement.setPlaceholder(getCssPropertyValue(res.element, 'height') - excr)
      }
    }
  })

  return customTag
}

/**
 * dom 渲染
 *
 * @param  {HTMLElement}   element   mip-ad-ecom 节点
 * @param  {Array} tplData   渲染mustache模板的数据数组
 * @param  {HTMLElement}   container 装载定制化组件节点的容器
 */
function render (element, tplData, container) {
  for (let len = 0; len < tplData.length; len++) {
    // 某条结果为空时不渲染此条结果
    let result = tplData[len].tplData
    if (!result || (result instanceof Array && !result.length) ||
      (result instanceof Object && !Object.keys(result).length)) {
      continue
    }

    // 某条结果 tpl 为空时不渲染此条结果
    let str = tplData[len].tpl ? decodeURIComponent(tplData[len].tpl) : null
    if (!str) {
      continue
    }

    // style 处理
    renderStyleOrScript(str, REGEXS.style, 'style', 'mip-ad-ecom-css', document.head)

    // html 处理
    let customTag = renderHtml(element, str, len, result, container)

    if (!customTag) {
      continue
    }

    // script 处理
    renderStyleOrScript(str, REGEXS.script, 'script', customTag, document.body)
  }
}

/**
 * a 标签事件代理
 *
 * @param  {HTMLElement} element    mip-ad-ecom, 只监听当前组件下的 a 标签
 * @param  {HTMLElement} fixedLayer  fixed body
 */
function proxyLink (element, fixedLayer) {
  util.event.delegate(element, 'a', 'click', event => {
    if (this.hasAttribute('mip-link') || /clk_info/.test(this.href)) {
      return
    }

    // 处理需要单独发送日志的 a 标签
    let link = this.getAttribute('data-log-href')
    let path = null

    // @todo: 这个地方的 log 没有引入
    if (fixedLayer) {
      path.unshift('.mip-fixedlayer')
    }

    let xpath = path ? path.join('_') : ''
    let logUrl = (link) || this.href

    logUrl += ((logUrl[logUrl.length - 1] === '&') ? '' : '&') + 'clk_info=' + JSON.stringify({xpath: xpath})
    if (!link) {
      this.href = logUrl
    }
  })
}

/**
 * 获取页面配置的 content 内容, 不在此做解析
 *
 * @param   {HTMLElement} elem    mip-ad-ecom element 节点
 * @returns {?HTMLScriptElement}  返回`application/json`的script配置节点
 */
function getConfigScriptElement (elem) {
  if (!elem) {
    return
  }
  // scriptJson: 配置 script 写在组件标签内部
  let scriptJson = elem.querySelector('script[type="application/json"]')
  if (!scriptJson) {
    // 需要 mustache 渲染情况下，为了防止 sanitizer.js 移除 script，将配置写在组件外
    scriptJson = document.querySelector('script[for="' + elem.id + '"]')
  }
  return scriptJson
}

/**
 * 添加广告加载前的 loading 效果
 *
 * @param {HTMLElement} element 广告组件 DOM
 */
function addPlaceholder (element) {
  let placeholder = document.createElement('div')

  let getHtml = (num, suffix) => {
    let ret = ''
    for (let i = 0; i < num; i++) {
      ret += `<span class="${PLACEHOLDER_PREFIX}${suffix && `-${suffix}`} text${i + 1}"></span>`
    }
    return ret
  }
  placeholder.classList.add(PLACEHOLDER_PREFIX)
  placeholder.setAttribute('mip-ad-ecom-container', '')
  placeholder.innerHTML = `
    ${getHtml(1, 'title')}
    ${getHtml(3, 'text')}
    ${getHtml(1, 'space')}
    ${getHtml(1, 'title')}
    ${getHtml(3, 'text')}
  `
  element.appendChild(placeholder)
  return placeholder
}

/**
 * 移除广告占位
 *
 * @param {HTMLElement} placeholder  占位 DOM 元素
 */
function removePlaceholder (placeholder) {
  placeholder.classList.add('fadeout')

  // 占位符增加淡出效果
  placeholder.addEventListener('transitionend', () => placeholder.remove(), false)
  placeholder.addEventListener('webkitTransitionend', () => placeholder.remove(), false)
}

export default {
  render,
  proxyLink,
  getConfigScriptElement,
  addPlaceholder,
  removePlaceholder
}
