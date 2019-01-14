/**
 * @file mip-ad-ecom 的 dom 操作工具包
 * @author mj(zoumiaojiang@gmail.com)
 */

/**
 * 引入工具类
 *
 * @type {Object}
 */
let util = require('util')

/**
 * 模板库
 *
 * @type {Object}
 */
let templates = require('templates')

/**
 * 引入 fixed 元素类
 *
 * @type {Object}
 */
let fixedElement = require('fixed-element')

// let log = require('mip-ad-ecom/log');
let dataProcessor = require('mip-ad-ecom/data')
let regexs = dataProcessor.regexs

let maxzIndex = 0
let excr = 44

/**
 * 获取样式
 * 由于目前只需要取 height 和 paddig-bottom,
 * 所以对util.css结果进行处理, 返回整数
 *
 * @param   {HTMLElement} elem     dom 节点
 * @param   {string} style 获取样式
 * @returns {number} res 返回的数值
 */
function getCss (elem, style) {
  let res = parseInt(util.css(elem, style), 10)
  return res || 0
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
  let node = container.querySelector(tag + '[' + attr + ']') || document.createElement(tag)
  node.setAttribute(attr, '')
  let substrs = str.match(reg)
  substrs && substrs.forEach(function (tmp) {
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
   * @returns {HTMLElement}     tpl  template 子节点
   */
function createTemplateNode (html, id) {
  let tpl = document.createElement('template')
  tpl.setAttribute('type', 'mip-mustache')
  tpl.id = id
  tpl.innerHTML = dataProcessor.subStr(html, regexs.innerHtml)
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
  let tagandAttrs = dataProcessor.subStr(html, regexs.tagandAttr).split(' ')

  for (let i = 0; i < tagandAttrs.length; i++) {
    let attrs = tagandAttrs[i].split('=')

    if (attrs[0] && attrs[1]) {
      node.setAttribute(attrs[0], attrs[1].replace(/"/ig, ''))
    }
  }

  let id = customTag + '-' + Math.random().toString(36).slice(2)
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
  let html = str.replace(regexs.script, '').replace(regexs.style, '')
  let customTag = (new RegExp(regexs.tag, 'g')).exec(html)
  customTag = customTag && customTag[1] ? customTag[1] : null

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
  templates.render(customNode, result, true).then(function (res) {
    res.element.innerHTML = res.html

    if (res.element.hasAttribute('mip-fixed') &&
        res.element.parentNode.getAttribute('type') === 'bottom') {
      fixedElement.setPlaceholder()
      let zIndex = getCss(res.element.parentNode, 'z-index')

      if (zIndex >= maxzIndex) {
        maxzIndex = zIndex
        // alert(getCss(res.element, 'height') - 10)
        fixedElement.setPlaceholder(getCss(res.element, 'height') - excr)
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
    renderStyleOrScript(str, regexs.style, 'style', 'mip-ad-ecom-css', document.head)

    // html 处理
    let customTag = renderHtml(element, str, len, result, container)

    if (!customTag) {
      continue
    }

    // script 处理
    renderStyleOrScript(str, regexs.script, 'script', customTag, document.body)
  }
}

/**
 * a 标签事件代理
 *
 * @param  {HTMLElement} element    mip-ad-ecom, 只监听当前组件下的 a 标签
 * @param  {HTMLElement} fixedLayer  fixed body
 */
function proxyLink (element, fixedLayer) {
  util.event.delegate(element, 'a', 'click', (event) => {
    if (this.hasAttribute('mip-link') || /clk_info/.test(this.href)) {
      return
    }

    // 处理需要单独发送日志的 a 标签
    let link = this.getAttribute('data-log-href')

    let path = null

    // @todo: 这个地方的 log 没有引入
    if (fixedLayer) {
      // path = log.getXPath(this, fixedLayer)
      path.unshift('.mip-fixedlayer')
    } else {
      // path = log.getXPath(this, element)
    }
    let xpath = path ? path.join('_') : ''

    let logUrl = (link) || this.href
    logUrl += ((logUrl[logUrl.length - 1] === '&') ? '' : '&') + 'clk_info=' + JSON.stringify({xpath: xpath})
    if (link) {
      // log.sendLog(logUrl, {});
    } else {
      this.href = logUrl
    }
  })
}

/**
 * [getConfigScriptElement 获取页面配置的content内容]
 * 不在此做解析
 *
 * @param   {HTMLElement} elem   mip-ad-ecom element 节点
 * @returns {HTMLScriptElement}  返回`application/json`的script配置节点
 */
function getConfigScriptElement (elem) {
  if (!elem) {
    return
  }
  // scriptJson: 配置script写在组件标签内部
  let scriptJson = elem.querySelector('script[type="application/json"]')
  if (!scriptJson) {
    // 需要mustache渲染情况下，为了防止sanitizer.js移除script，将配置写在组件外
    scriptJson = document.querySelector('script[for="' + elem.id + '"]')
  }
  return scriptJson
}

// 广告加载前loading效果
function addPlaceholder () {
  let placeholder = document.createElement('div')
  this.placeholder = placeholder
  placeholder.classList.add('mip-ad-ecom-placeholder')
  placeholder.setAttribute('mip-ad-ecom-container', '')
  placeholder.innerHTML = '' +
    '<span class="mip-ad-ecom-placeholder-title"></span>' +
    '<span class="mip-ad-ecom-placeholder-text text1"></span>' +
    '<span class="mip-ad-ecom-placeholder-text text2"></span>' +
    '<span class="mip-ad-ecom-placeholder-text text3"></span>' +
    '<span class="mip-ad-ecom-placeholder-space"></span>' +
    '<span class="mip-ad-ecom-placeholder-title"></span>' +
    '<span class="mip-ad-ecom-placeholder-text text1"></span>' +
    '<span class="mip-ad-ecom-placeholder-text text2"></span>' +
    '<span class="mip-ad-ecom-placeholder-text text3"></span>'
  this.element.appendChild(placeholder)
}

// 移除 广告占位
function removePlaceholder () {
  let me = this
  this.placeholder.classList.add('fadeout')
  // 占位符增加淡出效果
  this.placeholder.addEventListener('transitionend', function () {
    me.placeholder.remove()
  }, false)
  this.placeholder.addEventListener('webkitTransitionend', function () {
    me.placeholder.remove()
  }, false)
}

export default {
  render: render,
  proxyLink: proxyLink,
  getConfigScriptElement: getConfigScriptElement,
  addPlaceholder: addPlaceholder,
  removePlaceholder: removePlaceholder
}
