/**
 * @fileOverview  mip-font.js
 * @description 根据自定义字体文件加载状态修改类名，控制样式
 */

import FontLoader from './mip-font-loader'

/**
 * 默认参数的配置
 */
const CONFIG_DEFAULT = {
  tag: 'mip-font',
  timeout: 3000,
  weight: '400',
  variant: 'normal',
  style: 'normal',
  size: 'medium',
  cacheFontTime: 100
}

export default class MIPFont extends MIP.CustomElement {
  constructor (...args) {
    super(...args)

    this.family = ''

    this.weight = ''

    this.style = ''

    this.variant = ''

    this.font = null
  }

  prerenderAllowed () {
    return true
  }

  build () {
    if (!this.element.getAttribute('font-family')) {
      console.warn(CONFIG_DEFAULT.tag, ': Without font-family')
    } else {
      this.family = this.element.getAttribute('font-family')
      this.weight = this.element.getAttribute('font-weight') || CONFIG_DEFAULT.weight
      this.style = this.element.getAttribute('font-style') || CONFIG_DEFAULT.style
      this.variant = this.element.getAttribute('font-variant') || CONFIG_DEFAULT.variant
      this.size = this.element.getAttribute('font-size') || CONFIG_DEFAULT.size

      this.fontConfig = {
        family: this.family,
        weight: this.weight,
        fontStyle: this.style,
        variant: this.variant,
        size: this.size
      }

      this.font = new FontLoader()
      // 字体下载
      this.font.load(this.fontConfig, this.timeout()).then(() => {
        this.loadSuccess()
      }).catch(err => {
        this.loadError()
        console.warn('font load failed:', err)
      })
    }
  }

  /**
   * 字体文件下载成功需要处理的根节点类名
   *
   * @private
   */
  loadSuccess () {
    const addClass = this.element.getAttribute('on-load-add-class')
    const removeClass = this.element.getAttribute('on-load-remove-class')
    if (addClass) {
      document.documentElement.classList.add(addClass)
    }
    if (removeClass) {
      document.documentElement.classList.remove(removeClass)
    }
    this.font = null
  }

  /**
   * 字体文件下载出错需要处理的根节点类名
   *
   * @private
   */
  loadError () {
    const addClass = this.element.getAttribute('on-error-add-class')
    const removeClass = this.element.getAttribute('on-error-remove-class')
    if (addClass) {
      document.documentElement.classList.add(addClass)
    }
    if (removeClass) {
      document.documentElement.classList.remove(removeClass)
    }
    this.font = null
  }

  /**
   * 获取设置的请求超时时间，默认是3000ms
   *
   * @returns {number} timeout (ms)
   */
  timeout () {
    let timeout = parseInt(this.element.getAttribute('timeout'), 10)
    timeout = !(typeof timeout === 'number' && isFinite(timeout)) ||
        timeout < 0 ? CONFIG_DEFAULT.timeout : timeout
    timeout = Math.max(
      (timeout - MIP.Services.timerFor(window).timeSinceStart()),
      CONFIG_DEFAULT.cacheFontTime
    )
    return timeout
  }
}
