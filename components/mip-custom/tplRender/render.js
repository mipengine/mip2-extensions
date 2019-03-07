/**
 * @file 搜索合作页 base render
 * @author liujing
 *
 */

// import modules
import dataProcessor from '../common/data'
import dom from '../common/dom'

const REGEXS = dataProcessor.REGEXS

export default class Render {
  constructor (args) {
    const {element, renderItem, container} = args
    this.element = element
    this.renderItem = renderItem
    this.container = container
    this.maxzIndex = 0
    this.excr = 44
  }

  /**
   * [build 处理入口]
   *
   */
  build () {
    this.str = this.renderItem && this.renderItem.tpl ? decodeURIComponent(this.renderItem.tpl) : null
    this.result = (this.renderItem && this.renderItem.tplData) || {}

    if (this.str != null) {
      // style 处理
      dom.renderStyleOrScript(this.str, REGEXS.style, 'style', 'mip-custom-css', document.head)
      // tpl 处理
      this.renderNode()
      // baseUI 处理
      this.renderBaseUI()
      // script 处理
      dom.renderStyleOrScript(this.str, REGEXS.script, 'script', this.customTag, document.body)
    }
  }

  /**
  * [renderItem 对tpl进行分类渲染]
  *
  */
  renderNode () {
    // 创建自定义标签
    this.creatTag()
    let itemNode = document.createElement('div')
    itemNode.setAttribute('mip-custom-item', this.renderItem.id)
    // 如果定制化组件属性有 no-padding 则把它的容器设置为 no-padding
    // 组件属性 no-padding 必须设置一个值，哪怕是""，不然会被remove
    if (this.customNode.hasAttribute('no-padding')) {
      itemNode.classList.add('no-padding')
    }
    // XXX work around: 由于需要在template渲染后把渲染结果插入到itemNode，container里面，
    // 只能把这些参数绑定在 customNode 里传给render.then中，通过res.element.itemNode获取
    this.customNode.itemNode = itemNode
    this.customNode.container = this.container

    if (this.customNode.hasAttribute('mip-fixed')) {
      dom.moveToFixedLayer(this.element, this.customNode, this.container, this)
    }
    this.renderTpl()
  }

  /**
   * [createTemplateNode 创建定制化组件的 template 子节点]
   *
   */
  renderTpl () {
    // 用于继承后扩展的tpl的render方法
  }

  /**
   * [createTemplateNode 创建定制化组件的 template 子节点]
   *
   */
  createTemplateNode () {
    // 用于继承后扩展的tpl的node节点的创建
  }

  /**
  * [creatTag 创建渲染的dom片段]
  *
  */
  creatTag () {
    this.html = this.str.replace(REGEXS.script, '').replace(REGEXS.style, '')
    let customTag = (new RegExp(REGEXS.tag, 'g')).exec(this.html)
    this.customTag = customTag && customTag[1] ? customTag[1] : null
    this.customNode = dom.createCustomNode(this.html, this.customTag)
    this.customNode.appendChild(this.createTemplateNode())
  }

  /**
   * [renderBaseUI 渲染 baseUI 函数]
   */
  renderBaseUI () {
    // TODO: 对该广告模板中依赖的baseUI进行处理
  }
}
