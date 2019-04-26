/**
 * @file 城市选择组件
 * @author mj(zoumiaojiang@gmail.com)
 */

/* global MIP, fetch */

import './mip-city-selection.less'

const { util, CustomElement, viewport, viewer } = MIP
const { rect, log } = util
const CustomStorage = util.customStorage
const logger = log('mip-city-selection')
const Storage = new CustomStorage(0)

const SELECTION_CONTENT_CLS = 'mip-city-selection-content'

export default class MIPCitySelection extends CustomElement {
  constructor (...element) {
    super(...element)

    /**
     * 规定格式的城市选择组件的数据
     *
     * @type {Array<Object>}
     */
    this.list = []

    /**
     * 选中历史的最大缓存数
     *
     * @type {number}
     */
    this.maxHistory = 3

    /**
     * 异步请求数据源 URL 地址
     *
     * @type {string}
     */
    this.dataSrc = ''

    /**
     * 缓存的数据
     *
     * @type {Array<Object>}
     */
    this.history = []

    /**
     * 滚动信息记录
     *
     * @type {Array<Object>}
     */
    this.offsetX = []

    /**
     * 标示是否有历史缓存信息
     *
     * @type {boolean}
     */
    this.hasHistory = false
  }

  async build () {
    await this.getData()
    this.render()
    viewport.on('scroll', () => {
      this.getOffsetX()
    })
  }

  /**
   * 获取
   */
  getOffsetX () {
    let scrollTop = viewport.getScrollTop()
    let offsetX = []
    let currentCitys = [...this.element.querySelectorAll('.mip-city-selection-city')]

    for (let city of currentCitys) {
      offsetX.push(rect.getElementOffset(city).top + scrollTop)
    }

    this.offsetX = offsetX
  }

  /**
   * 获取组件数据
   */
  async getData () {
    let ele = this.element
    let dataset = ele.dataset
    let dataSrc = this.dataSrc = (dataset && dataset.src)
    let data = []

    // 如果存在 data-src 属性的话，发起异步请求
    if (dataSrc) {
      try {
        let res = await fetch(dataSrc, {})
        data = await res.json()
        this.list = data.list
      } catch (e) {
        logger.warn(ele, '数据请求错误：', e)
      }
    } else {
      let dataScript = ele.querySelector('script[type="application/json"]')
      try {
        data = JSON.parse(dataScript.textContent)
        this.list = data.list
      } catch (e) {
        logger.warn(ele, 'JSON 配置数据异常，请检查 JSON 格式')
      }
    }

    if (!data) {
      logger.warn(ele, '请配置正确的 data-src 或提供正确的 JSON 配置数据!')
    }

    this.getOffsetX()

    // 显示 locationStorage 数据
    let locationStorage = Storage.get('cityData', data)
    this.hasHistory = !!locationStorage

    if (locationStorage) {
      this.history = JSON.parse(locationStorage)
    }

    return data
  }

  /**
   * 渲染组件内容
   */
  render () {
    let wrapper = document.createElement('div')
    let historyVisitedCityWrapper = document.createElement('div')
    let cityListWrapper = document.createElement('div')
    let cityNavWrapper = document.createElement('div')

    wrapper.className = 'mip-city-selection-wrapper'
    historyVisitedCityWrapper.className = cityListWrapper.className = SELECTION_CONTENT_CLS
    historyVisitedCityWrapper.classList.add('lasted-visted-hot')

    this.renderHistoryVisitCityList(historyVisitedCityWrapper)
    this.renderCityList(cityListWrapper)
    this.renderCityNav(cityNavWrapper)
    this.bindEventForHistoryVisit(historyVisitedCityWrapper)
    wrapper.appendChild(historyVisitedCityWrapper)
    wrapper.appendChild(cityListWrapper)
    wrapper.appendChild(cityNavWrapper)
    this.element.appendChild(wrapper)
  }

  /**
   * 渲染最近访问城市列表
   *
   * @param {HTMLElement} wrapper 最近访问城市列表的最外层 DOM
   */
  renderHistoryVisitCityList (wrapper) {
    let historyCityList = this.history

    if (this.hasHistory && historyCityList && historyCityList.length) {
      let html = [
        '<div class="mip-city-selection-part-letter content-wrapper">',
        '<div class="mip-city-selection-title">最近访问的城市</div>'
      ]

      historyCityList.forEach((item, index) => {
        html.push(`<p class="mip-city-selection-item" key="${index + 1}">${item.city}</p>`)
      })

      html.push('</div></div>')
      wrapper.innerHTML = html.join('')
    }
  }

  /**
   * 渲染城市列表
   *
   * @param {HTMLElement} wrapper 城市列表外层 DOM
   */
  renderCityList (wrapper) {
    let listData = this.list
    let html = []

    if (listData && listData.length) {
      listData && listData.forEach((item, cityIndex) => {
        html.push(`
          <div class="mip-city-selection-city mip-city-selection-part-letter city-json-content content-wrapper">
            <div class="mip-city-selection-title">${item.key}</div>
        `)

        item.cities && item.cities.forEach((city, itemIndex) => {
          html.push(
            `<p class="mip-city-selection-item"
              cityKey="${cityIndex + 1}"
              itemKey="${itemIndex + 1}"
            >${city.city}</p>`
          )
        })

        html.push('</div>')
      })

      wrapper.innerHTML = html.join('')

      // 绑定点击城市 item 的事件
      wrapper.addEventListener('click', e => {
        let target = e.target
        if (target.classList.contains('mip-city-selection-item')) {
          let cityIndex = +target.getAttribute('cityKey')
          let itemIndex = +target.getAttribute('itemKey')
          cityIndex && itemIndex && this.showInfo(listData[cityIndex - 1].cities[itemIndex - 1])
        }
      })
    }
  }

  /**
   * 渲染城市字母导航
   *
   * @param {HTMLElement} wrapper 导航外层容器 DOM
   */
  renderCityNav (wrapper) {
    let listData = this.list
    let html = [`<mip-fixed class="mip-city-selection-sidebar-wrapper" type="right">
      <div class="mip-city-selection-sidebar">`
    ]

    listData && listData.forEach((item, index) => {
      html.push(`<div><a class="mip-city-selection-link" key="${index + 1}">${item.key}</a></div>`)
    })

    html.push('</mip-fixed>')
    wrapper.innerHTML = html.join('')
    wrapper.addEventListener('click', e => {
      let target = e.target
      if (target.classList.contains('mip-city-selection-link')) {
        let index = +target.getAttribute('key')
        index && this.scrollToCity(index - 1)
      }
    })
  }

  /**
   * 选中城市后的逻辑
   *
   * @param {Object} city 城市对象信息
   */
  showInfo (city) {
    this.getOffsetX()

    // 对外暴露 citySelected 事件
    viewer.eventAction.execute('citySelected', this.element, city)

    let isExit = false
    for (let i = 0; i < this.history.length; i++) {
      if (this.history[i].city === city.city) {
        let newCity = this.history[i]
        this.history.splice(i, 1)
        this.history.unshift(newCity)
        isExit = true
      }
    }

    if (!isExit) {
      this.history.unshift(city)
      this.history = this.history.slice(0, this.maxHistory)
    }

    let cityData = JSON.stringify(this.history)
    Storage.set('cityData', cityData)
    this.history = JSON.parse(Storage.get('cityData'))

    let locationStorage = Storage.get('cityData', cityData)
    this.hasHistory = !!locationStorage

    if (locationStorage) {
      this.history = JSON.parse(locationStorage)
      this.renderHistoryVisitCityList(this.element.querySelector('.lasted-visted-hot'))
    }
  }

  /**
   * 绑定最近访问的模块
   *
   * @param {HTMLElement} wrapper 组件的最外层容器 DOM
   */
  bindEventForHistoryVisit (wrapper) {
    // 绑定点击城市 item 的事件
    wrapper.addEventListener('click', e => {
      let target = e.target
      if (target.classList.contains('mip-city-selection-item')) {
        let index = +target.getAttribute('key')
        index && this.showInfo(this.history[index - 1])
      }
    })
  }

  /**
   * 滚动到对应的城市块
   *
   * @param {number} index 城市块下标
   */
  scrollToCity (index) {
    this.getOffsetX()
    let finalOffsetX = this.offsetX[index]
    viewport.setScrollTop(finalOffsetX)
  }
}
