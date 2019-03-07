/**
 * @file 定制化有关dom操作的方法集
 * @author liujing
 */

// import modules
import log from './log'
import dataProcessor from './data'

// import tools
let {util, viewer} = MIP
let {fixedElement} = viewer
const REGEXS = dataProcessor.REGEXS

/**
 * [getConfigScriptElement 获取页面配置的content内容]
 * 不在此做解析
 *
 * @param  {HTMLElement} el     mip-custom element 节点
 * @returns {HTMLScriptElement}    返回`application/json`的script配置节点
 */
const getConfigScriptElement = el => {
  if (!el) {
    return
  }
  return el.querySelector('script[type="application/json"]')
}

/**
 * [addPlaceholder 广告加载前loading效果]
 *
 * @param {Object} me render的class实例
 */
const addPlaceholder = me => {
  let placeholder = document.createElement('div')
  me.placeholder = placeholder
  placeholder.classList.add('mip-custom-placeholder')
  placeholder.setAttribute('mip-custom-container', '')
  placeholder.innerHTML = `
    <span class="mip-custom-placeholder-title"></span>
    <span class="mip-custom-placeholder-text text1"></span>
    <span class="mip-custom-placeholder-text text2"></span>
    <span class="mip-custom-placeholder-text text3"></span>
    <span class="mip-custom-placeholder-space"></span>
    <span class="mip-custom-placeholder-title"></span>
    <span class="mip-custom-placeholder-text text1"></span>
    <span class="mip-custom-placeholder-text text2"></span>
    <span class="mip-custom-placeholder-text text3"></span>
  `
  me.element.appendChild(placeholder)
}

/**
 * [proxyLink a 标签事件代理]
 *
 * @param  {HTMLElement} el         mip-custom, 只监听当前组件下的 a 标签
 * @param  {HTMLElement} fixedLayer fixed body
 */
const proxyLink = (el, fixedLayer) => {
  // 事件监听不能改为箭头函数
  util.event.delegate(el, 'a', 'click', function (e) {
    if (this.hasAttribute('mip-link') || /clk_info/.test(this.href)) {
      return
    }

    // 处理需要单独发送日志的 a 标签
    let link = this.getAttribute('data-log-href')

    let path = null
    if (fixedLayer) {
      path = log.getXPath(this, fixedLayer)
      path.unshift('.mip-fixedlayer')
    } else {
      path = log.getXPath(this, el)
    }
    let xpath = path ? path.join('_') : ''

    let logUrl = link || this.href
    logUrl += ((logUrl[logUrl.length - 1] === '&') ? '' : '&') +
              'clk_info=' + JSON.stringify({xpath: xpath})
    if (link) {
      log.sendLog(logUrl, {})
    } else {
      this.href = logUrl
    }
  })
}

/**
* [renderItem 对tpl进行分类渲染]
*
* @param  {string} html      定制化组件 dom 字符串
* @param  {string} customTag 定制化组件标签
*/
const createCustomNode = (html, customTag) => {
  let node = document.createElement(customTag)
  let tagandAttrs = dataProcessor.subStr(html, REGEXS.tagandAttr).split(' ')

  for (let i = 0; i < tagandAttrs.length; i++) {
    let attrs = tagandAttrs[i].split('=')

    if (attrs[0] && attrs[1]) {
      node.setAttribute(attrs[0], attrs[1].replace(/"/ig, ''))
    }
  }
  return node
}

/**
 * [renderStyleOrScript 渲染 style/script 函数]
 * 截取 style/script 并插入到 dom 中
 *
 * @param {string} str    返回的 tpl 字符串
 * @param {RegExp} reg    截取的正则表达式
 * @param {string} tag    定制化 MIP 标签名
 * @param {string} attr   style/script
 * @param {HTMLElement} container style/script 节点的容器
 */
const renderStyleOrScript = (str, reg, tag, attr, container) => {
  let node = container.querySelector(tag + '[' + attr + ']') || document.createElement(tag)
  node.setAttribute(attr, '')
  let substrs = str.match(reg)
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
 * [moveToFixedLayer 需要悬浮的组件外层嵌套mip-fixed并移动到 fixed layer]
 *
 * @param {HTMLElement} element mip-custom 节点
 * @param {HTMLElement} customNode 定制化组件节点
 * @param {HTMLElement} container 装载定制化组件节点的容器
 * @param {Object} that 需要修改一个这个 Object 的一个参数 excr
 */
const moveToFixedLayer = (element, customNode, container, that = null) => {
  let type = customNode.getAttribute('mip-fixed')
  let top = customNode.getAttribute('top') || null
  let bot = customNode.getAttribute('bottom') || null
  let fixedParent = document.createElement('mip-fixed')

  // 兼容 酷派手机 UC 浏览器
  if (util.platform.isIos()) {
    that && (that.excr = 10)
    container.remove()
  }

  // 存在悬浮时, 设置距离 top/bottom 的距离
  if (customNode.hasAttribute('top') && top) {
    util.css(fixedParent, {top: top})
  }
  if (customNode.hasAttribute('bottom') && bot) {
    util.css(fixedParent, {bottom: bot})
  }
  fixedParent.setAttribute('type', type)
  fixedParent.appendChild(customNode)
  element.appendChild(fixedParent)

  // 初始化底部fixed元素一开始在页面外部, 动画滑入页面
  // 预先增加下移样式，当元素被插入页面后（setTimeout执行），动画执行。
  if (type === 'bottom') {
    fixedParent.classList.add('mip-custom-transit-from-bottom')
    setTimeout(function () {
      fixedParent.classList.add('mip-custom-transit-end')
    }, 0)
  }

  // 结果页打开, 移动到 fixed layer
  if (fixedElement._fixedLayer) {
    fixedElement.setFixedElement([fixedParent], true)
    // 为悬浮节点添加代理事件
    proxyLink(customNode, fixedElement._fixedLayer)
  }
}

/**
 * [getCss 获取样式]
 * 由于目前只需要取 height 和 paddig-bottom,
 * 所以对util.css结果进行处理, 返回整数
 *
 * @param  {HTMLElement} elem     dom 节点
 * @param  {string} style 获取样式
 * @returns {number} res 返回的数值
 */
const getCss = (elem, style) => {
  let res = parseInt(util.css(elem, style), 10)
  return res || 0
}

/**
 * [removePlaceholder 移除 广告占位]
 *
 * @param {Object} me render的class实例
 */
const removePlaceholder = me => {
  me.placeholder.classList.add('fadeout')
  // 占位符增加淡出效果
  me.placeholder.addEventListener('transitionend', () => {
    me.placeholder.remove()
  }, false)
  me.placeholder.addEventListener('webkitTransitionend', () => {
    me.placeholder.remove()
  }, false)
}

export default {
  getConfigScriptElement,
  addPlaceholder,
  proxyLink,
  createCustomNode,
  renderStyleOrScript,
  moveToFixedLayer,
  getCss,
  removePlaceholder
}
