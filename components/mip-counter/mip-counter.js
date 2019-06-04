/**
 * @file mip 投票计数类型的组件
 * @author mj(zoumiaojiang@gmail.com)
 */

/* global MIP, fetch */

const { CustomElement, util, templates } = MIP
const logger = util.log('mip-counter')

export default class mipCounter extends CustomElement {
  static props = {
    timeout: {
      type: Number,
      default: 300
    },

    src: {
      type: String,
      default: ''
    }
  }

  constructor (...elements) {
    super(...elements)
    this.timer = null
  }

  async getData () {
    let { src } = this.props
    let res = await window.fetchJsonp(src)

    if (!res) {
      logger.wran(this.element, '接口请求异常！')
    }

    let data = await res.json()

    if (!data || data.status !== 0) {
      logger.wran(this.element, '接口数据错误！')
    }

    this.data = data.data
    this.data.counter = +this.data.counter || 0
  }

  async layoutCallback () {
    await this.getData()
    await this.render()
  }

  build () {
    this.bindEvents()
  }

  bindEvents () {
    this.element.addEventListener('click', () => {
      this.data.counter++
      this.renderButton()
      clearTimeout(this.timer)

      let url = this.data.src
      let { timeout } = this.props

      url += ((url.indexOf('?') > -1 ? '&' : '?') + 'counter=' + this.data.counter)
      this.timer = setTimeout(() => fetch(url), +timeout || 300)
    })
  }

  async renderButton () {
    let ele = this.element
    this.data = Object.assign(this.data, this.props)
    let html = await templates.render(ele, this.data)
    this.wrapper.innerHTML = html
  }

  async render () {
    let wrapper = document.createElement('div')
    this.wrapper = wrapper
    this.element.appendChild(wrapper)
    await this.renderButton()
  }
}
