/**
 * @file Mustache template
 * @author chenyongle(chenyongle@baidu.com)
 */

import log from './log'
import dataProcessor from './data'

/**
 * util 引入工具类 templates 模板库
 * @type {Object}
 */
const { util, templates, viewer } = MIP

/**
 * fixedElement 引入 fixed 元素类
 * @type {Object}
 */
const fixedElement = viewer.fixedElement

const REGEXS = dataProcessor.REGEXS

let maxzIndex = 0
let excr = 44

/**
 * 获取样式
 * 由于目前只需要取 height 和 paddig-bottom,
 * 所以对util.css结果进行处理, 返回整数
 *
 * @param {HTMLElement} elem HTMLElement 节点
 * @param {string} style 获取样式
 * @returns {number} res 返回的数值
 */
function getCss (elem, style) {
  return parseInt(util.css(elem, style), 10) || 0
}

/**
 * 需要悬浮的组件外层嵌套mip-fixed并移动到 fixed layer
 *
 * @param {HTMLElement} element mip-custom 节点
 * @param {HTMLElement} customNode 定制化组件节点
 * @param {HTMLElement} container 装载定制化组件节点的容器
 */
function moveToFixedLayer (element, customNode, container) {
  let type = customNode.getAttribute('mip-fixed')
  let top = customNode.getAttribute('top') || null
  let bottom = customNode.getAttribute('bottom') || null
  let fixedParent = document.createElement('mip-fixed')

  // 兼容 酷派手机 UC 浏览器
  if (util.platform.isIos()) {
    container.remove()
    excr = 10
  }

  // 存在悬浮时, 设置距离 top/bottom 的距离
  if (customNode.hasAttribute('top') && top) {
    util.css(fixedParent, { top })
  }
  if (customNode.hasAttribute('bottom') && bottom) {
    util.css(fixedParent, { bottom })
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
 * 渲染 style/script 函数
 * 截取 style/script 并插入到 dom 中
 *
 * @param {string} str 返回的 tpl 字符串
 * @param {RegExp} reg 截取的正则表达式
 * @param {string} tag 定制化 MIP 标签名
 * @param {string} attr style/script
 * @param {HTMLElement} container style/script 节点的容器
 */
function renderStyleOrScript (str, reg, tag, attr, container) {
  let node = container.querySelector(tag + '[' + attr + ']') || document.createElement(tag)
  node.setAttribute(attr, '')
  let substrs = str.match(reg)
  // reg 是全局的 /g ，所以这里遍历每一个值是可以的
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
 * @param {string} html 定制化组件 dom 字符串
 * @param {number} id  template id
 * @returns {HTMLElement} tpl template 子节点
 */
function createTemplateNode (html, id) {
  let tpl = document.createElement('template')

  tpl.setAttribute('type', 'mip-mustache')
  if (id) {
    tpl.id = id
  }
  tpl.innerHTML = dataProcessor.getSubString(html, REGEXS.innerHtml)

  return tpl
}

/**
 * 创建定制化组件节点
 *
 * @param {string} html 定制化组件 dom 字符串
 * @param {string} customTag 定制化组件标签
 * @returns {HTMLElement} node 定制化组件节点
 */
function createCustomNode (html, customTag) {
  let node = document.createElement(customTag)
  let tagandAttrs = dataProcessor.getSubString(html, REGEXS.tagandAttr).split(' ')

  tagandAttrs.forEach(item => {
    let attrs = item.split('=')
    attrs[0] && attrs[1] && node.setAttribute(attrs[0], attrs[1].replace(/"/g, ''))
  })

  node.appendChild(createTemplateNode(html))
  return node
}

/**
 * renderHtml 渲染html
 *
 * @param {HTMLElement} element mip-custom 节点
 * @param {string} str 返回的 tpl 字符串
 * @param {number} len 模块中第几个组件
 * @param {Object} result 渲染mustache模板的数据
 * @param {HTMLElement} container 装载定制化组件节点的容器
 * @returns {string} customTag 定制化组件标签
 */
function renderHtml (element, str, len, result, container) {
  let html = str.replace(REGEXS.script, '').replace(REGEXS.style, '')
  let customTag = (new RegExp(REGEXS.tag, 'g')).exec(html)
  customTag = customTag && customTag[1] ? customTag[1] : null

  if (!customTag) {
    return null
  }

  // html 处理
  let customNode = createCustomNode(html, customTag)
  let itemNode = document.createElement('div')
  itemNode.setAttribute('mip-custom-item', len)
  // XXX work around: 由于需要在template渲染后把渲染结果插入到itemNode，container里面，
  // 只能把这些参数绑定在 customNode 里传给render.then中，通过res.element.itemNode获取
  customNode.itemNode = itemNode
  customNode.container = container

  if (customNode.hasAttribute('mip-fixed')) {
    moveToFixedLayer(element, customNode, container)
  }

  // 模板渲染
  templates.render(customNode, result, true).then(function (res) {
    res.element.innerHTML = res.html
    // XXX: 在模板渲染resolve后把custom element插入到页面
    // 防止组件先插入页面后触发firstInviewCallback方法，但内容只有待渲染的template，
    // 此时在组件中获取不到渲染后dom，无法绑定事件
    res.element.itemNode.appendChild(res.element)
    res.element.container.appendChild(res.element.itemNode)

    if (res.element.hasAttribute('mip-fixed') &&
      res.element.getAttribute('mip-fixed') === 'bottom') {
      moveToFixedLayer(element, customNode, container)
      fixedElement.setPlaceholder()
      let zIndex = getCss(res.element.parentNode, 'z-index')

      if (zIndex >= maxzIndex) {
        maxzIndex = zIndex
        let now = Date.now()
        let timer = setInterval(function () {
          let height = getCss(res.element, 'height')
          if (height > 0 || Date.now() - now > 8000) {
            clearInterval(timer)
          }
          fixedElement.setPlaceholder(height - excr)
        }, 16)
      }
    }
  })

  return customTag
}

/**
 * dom 渲染
 *
 * @param {HTMLElement} element mip-custom 节点
 * @param {Array} tplData 渲染mustache模板的数据数组
 * @param {HTMLElement} container 装载定制化组件节点的容器
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
    renderStyleOrScript(str, REGEXS.style, 'style', 'mip-custom-css', document.head)

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
 * @param {HTMLElement} element mip-custom, 只监听当前组件下的 a 标签
 * @param {HTMLElement} fixedLayer fixed body
 */
function proxyLink (element, fixedLayer) {
  // `function (event)` 感觉改为箭头函数有风险
  util.event.delegate(element, 'a', 'click', function (event) {
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
      path = log.getXPath(this, element)
    }
    let xpath = path ? path.join('_') : ''

    let logUrl = (link) || this.href
    logUrl += ((logUrl[logUrl.length - 1] === '&') ? '' : '&') +
      'clk_info=' + JSON.stringify({ xpath })
    if (link) {
      log.sendLog(logUrl, {})
    } else {
      this.href = logUrl
    }
  })
}

/**
 * 获取页面配置的content内容
 * 不在此做解析
 *
 * @param {HTMLElement} elem mip-custom element 节点
 * @returns {HTMLScriptElement} 返回 `application/json` 的script配置节点
 */
function getConfigScriptElement (elem) {
  if (!elem) {
    return
  }
  return elem.querySelector('script[type="application/json"]')
}

/**
 * 广告加载前loading效果
 *
 * @param {Object} that 传入 this 对象
 */
function addPlaceholder (that) {
  let placeholder = document.createElement('div')
  that.placeholder = placeholder
  placeholder.classList.add('mip-custom-placeholder')
  placeholder.setAttribute('mip-custom-container', '')
  placeholder.innerHTML = '' +
    '<span class="mip-custom-placeholder-title"></span>' +
    '<span class="mip-custom-placeholder-text text1"></span>' +
    '<span class="mip-custom-placeholder-text text2"></span>' +
    '<span class="mip-custom-placeholder-text text3"></span>' +
    '<span class="mip-custom-placeholder-space"></span>' +
    '<span class="mip-custom-placeholder-title"></span>' +
    '<span class="mip-custom-placeholder-text text1"></span>' +
    '<span class="mip-custom-placeholder-text text2"></span>' +
    '<span class="mip-custom-placeholder-text text3"></span>'
  that.element.appendChild(placeholder)
}
/**
 * 移除广告占位
 *
 * @param {Object} that 传入 this 对象
 */
function removePlaceholder (that) {
  that.placeholder.classList.add('fadeout')
  // 占位符增加淡出效果
  that.placeholder.addEventListener('transitionend', () => that.placeholder.remove(), false)
  that.placeholder.addEventListener('webkitTransitionend', () => that.placeholder.remove(), false)
}

export default {
  render,
  proxyLink,
  getConfigScriptElement,
  addPlaceholder,
  removePlaceholder
}
