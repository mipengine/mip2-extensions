/**
 * @file 搜索合作页 mustache render
 * @author liujing
 *
 */

// import modules
import Render from './render'
import dataProcessor from '../common/data'
import dom from '../common/dom'

// import tools
let {templates, viewer} = MIP
let {fixedElement} = viewer

const REGEXS = dataProcessor.REGEXS

export default class MustacheRender extends Render {
  /**
  * [createTemplateNode 对原来的tpl的节点进行继承修改]
  *
  * @returns {HTMLElement}  tpl  template 子节点
  */
  createTemplateNode () {
    let tpl = document.createElement('template')
    tpl.setAttribute('type', 'mip-mustache')
    tpl.innerHTML = dataProcessor.subStr(this.html, REGEXS.innerHtml)
    return tpl
  }

  /**
  * [renderTpl 渲染mustache的模板]
  *
  * @returns {HTMLElement}  tpl  template 子节点
  */
  renderTpl () {
    // 模板渲染
    templates.render(this.customNode, this.result, true).then(res => {
      res.element.innerHTML = res.html
      // XXX: 在模板渲染resolve后把custom element插入到页面
      // 防止组件先插入页面后触发firstInviewCallback方法，但内容只有待渲染的template，
      // 此时在组件中获取不到渲染后dom，无法绑定事件
      res.element.itemNode.appendChild(res.element)
      res.element.container.appendChild(res.element.itemNode)

      if (res.element.hasAttribute('mip-fixed') &&
        res.element.getAttribute('mip-fixed') === 'bottom') {
        dom.moveToFixedLayer(this.element, this.customNode, this.container, this)
        fixedElement.setPlaceholder()
        let zIndex = dom.getCss(res.element.parentNode, 'z-index')

        if (zIndex >= this.maxzIndex) {
          this.maxzIndex = zIndex
          let now = Date.now()
          let timer = setInterval(() => {
            let height = dom.getCss(res.element, 'height')
            if (height > 0 || Date.now() - now > 8000) {
              fixedElement.setPlaceholder(height - this.excr)
              clearInterval(timer)
            }
          }, 16)
        }
      }
    })
  }
}
