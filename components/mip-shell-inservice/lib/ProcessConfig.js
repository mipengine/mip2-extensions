/**
 * @file 处理shellconfig
 * @author zhuguoxi@baidu.com (zhuguoxi)
 */

import payPlaceholder from '../../../static/pay-placeholder.png'
// 站点数据请求url
const URL_SITE = 'https://xiongzhang.baidu.com/opensc/cambrian/card'
const XZH_KEY = 'mip-xzhid'
const CLICK_TOKEN_KEY = 'mip-click-token'

const fetchJsonp = window.fetchJsonp || {}

export default class {
  init (headerInfo, shellConfig) {
    this.headerInfo = headerInfo
    this.shellConfig = shellConfig
    headerInfo.isId = shellConfig.isId
    if (!shellConfig.isId) {
      console.error('请配置参isId: 数熊掌号ID')
    }
    return this
  }
  async process () {
    let {headerInfo, shellConfig} = this
    let clickToken
    // wise搜索环境页带入熊掌号信息
    try {
      let { isTitle } = MIP.hash.hashTree
      let hashHeader = isTitle && JSON.parse(decodeURIComponent(isTitle && isTitle.value))
      if (hashHeader && hashHeader.type === 'cambrian') {
        Object.assign(headerInfo, {
          title: hashHeader.title,
          logo: hashHeader.logo
        })
      }
      if (hashHeader && hashHeader.clickToken) {
        clickToken = hashHeader.clickToken
      }
    } catch (error) {}

    this.setToken(clickToken)

    // Set default data
    shellConfig.routes.forEach(routeConfig => {
      let { header, view } = routeConfig.meta
      header.logo = ''
      header.bouncy = false
      header.buttonGroup = [{
        name: 'cancel',
        text: '取消'
      }]
      if (view.isIndex) {
        header.title = headerInfo.title || header.title || document.title || ''
        header.logo = headerInfo.logo || payPlaceholder
        headerInfo.title = header.title
      }
    })

    if (shellConfig.isId) {
      Object.assign(headerInfo, await this.requestCambrian(shellConfig.isId))
    }

    // bos图片大小处理
    if (headerInfo.logo && /cdn\.bcebos\.com/.test(headerInfo.logo)) {
      headerInfo.logo += '@w_100'
    }

    shellConfig.routes.forEach(routeConfig => {
      let { header, view } = routeConfig.meta
      header.buttonGroup = []
      if (view.isIndex) {
        header.title = headerInfo.title
        header.logo = headerInfo.logo
      } else if (headerInfo.serviceUrl) {
        header.buttonGroup.push({
          name: 'indexPage',
          text: '首页'
        })
      }
      if (headerInfo.cambrianUrl) {
        header.buttonGroup.push({
          name: 'about',
          text: `关于${headerInfo.title}`
        })
      }
      header.buttonGroup.push({
        name: 'cancel',
        text: '取消'
      })
    })
  }

  /**
   * 获取熊掌号信息
   */
  async requestCambrian () {
    let isId = this.headerInfo.isId
    let result = await fetchJsonp(`${URL_SITE}?cambrian_id=${isId}`).then(res => res.json()).then(data => {
      if (data.code === 0 && data.data.name) {
        return {
          title: data.data.name,
          logo: data.data.avatar,
          serviceUrl: data.data.service_url,
          cambrianUrl: data.data.cambrian_url
        }
      }
      return {}
    }).catch(() => {})
    return result
  }

  /**
   * 设置click_token存储
   *
   * @param {string} clickToken 搜索结果页click_token
   */
  setToken (clickToken) {
    let storage = MIP.util.customStorage(0)
    let {isId} = this.headerInfo
    let customToken = this.getCustomToken()
    let currentSsToken = this.getSsToken()
    clickToken = clickToken || currentSsToken || customToken

    // 设置 熊掌号id 持久化
    storage.set(XZH_KEY, isId)
    storage.set(CLICK_TOKEN_KEY, clickToken)
    if (this.ssEnabled()) {
      window.sessionStorage.setItem(CLICK_TOKEN_KEY, clickToken)
    }
    this.clickToken = clickToken
    this.reflushToken()
  }

  /* 每个页面clickToken数据 */
  reflushToken () {
    let clickToken = MIP.util.customStorage(0).get(CLICK_TOKEN_KEY)
    clickToken && MIP.setData({mipClickToken: clickToken})
  }

  /**
   * 获取自定token
   */
  getCustomToken () {
    return this.headerInfo.isId
  }

  /**
   * 获取sesstionStorage中click_token
   */
  getSsToken () {
    let result = ''
    if (this.ssEnabled()) {
      result = window.sessionStorage.getItem(CLICK_TOKEN_KEY) || ''
    }
    return result
  }

  getLocalToken () {
    return MIP.util.customStorage(0).get(CLICK_TOKEN_KEY)
  }

  /**
   * test ss is available
   *
   */
  ssEnabled () {
    // this._ssEnabled = false
    if (this._ssEnabled) {
      return this._ssEnabled
    }
    try {
      window.sessionStorage.setItem('_t', 1)
      window.sessionStorage.removeItem('_t')
      this._ssEnabled = true
    } catch (e) {}

    return this._ssEnabled
  }
}
