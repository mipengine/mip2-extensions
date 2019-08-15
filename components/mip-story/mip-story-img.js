/**
 * @file mip-story-img 子组件
 * @description 创建和展现小故事中的图片
 * @author wangqizheng
 */
import {
  getAttributeSet,
  getJsonString
} from './utils'
const { CustomElement, util } = MIP
const { dom } = util

export default class MIPStoryImg extends CustomElement {
  static get observedAttributes () {
    return ['preload']
  }

  /** @override */
  firstInviewCallback () {
    this.loaded = false
  }

  /** @override */
  attributeChangedCallback () {
    if (this.element.hasAttribute('preload') && !this.loaded) {
      this.initStoryImg()
      this.loaded = true
    }
  }
  /**
   * 初始化 img 元素
   */
  initStoryImg () {
    this.attributes = getAttributeSet(this.element.attributes)
    const attrString = getJsonString(this.attributes)
    const imgHtml = '<mip-img ' + attrString + '></mip-img>'
    const storyImg = dom.create(imgHtml)
    this.element.parentNode.insertBefore(storyImg, this.element)
  }
}
