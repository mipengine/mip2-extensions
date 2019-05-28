import './mip-user-notification.less'
import NotificationUiManager from './user-notification-ui-maneger'
import UserNotificationManager from './user-notification-maneger'

export const NOTIFICATION_UI_MANAGER = 'mip-notification-ui-manager'
const SERVICE_ID = 'mip-user-notification-manager'
const {CustomElement, util, viewer, Services} = MIP
const Deferred = util.Deferred
const {error, log} = util.log('mip-user-notification')
const CustomStorage = util.customStorage
const storage = new CustomStorage(0)
const MIP_HIDDEN_CLASS = 'mip-hidden'
const MIP_ACTIVE_CLASS = 'mip-active'

export default class MIPUserNotification extends CustomElement {
  constructor (element) {
    super(element)
    this.elementId = null
    const {promise, resolve} = new Deferred()
    this.dialogPromise = promise
    this.dialogResolve = resolve
    this.dismissHref = null
    this.persistDismissal = false
    this.showIfHref = null
    this.storageKey = ''
    this.showIfGeo = null
    this.geoPromise = null
  }

  build () {
    this.handleNodisplayToClassHideen()
    this.getElementAttribute()
    this.addEventAction('dismiss', this.dismiss.bind(this))

    // 通过 userNotificationManager 管理多个 userNotification 出现的情况
    const userNotificationManagerPromise = Services.getServicePromise(SERVICE_ID)
    userNotificationManagerPromise.then(manager => {
      manager.registerUserNotification(this.elementId, this)
    })
  }

  /**
   * 覆盖 nodisplay 的 display: 'none', 通过 shouldShow 控制显示
   */
  handleNodisplayToClassHideen () {
    // 覆盖 nodisplay 的 display: 'none'
    util.css(this.element, { display: '' })
    // 通过 mip-hidden 先隐藏，通过 shouldShow 来控制显示
    this.toggle(false)
  }

  /**
   * 获取元素属性并校验
   */
  getElementAttribute () {
    this.elementId = this.element.id
    if (!this.elementId) {
      error('mip-user-notification 元素必须有 id')
    }

    this.storageKey = 'mip-user-notification:' + this.elementId

    this.showIfGeo = this.element.getAttribute('data-show-if-geo')
    if (this.showIfGeo) {
      this.geoPromise = new Promise(resolve => {
        this.addEventAction('getLocationComplete', res => {
          this.shouldShowInCity(res).then(resolve)
        })
        viewer.eventAction.execute('notificationLoaded', this.element)
      })
    }

    this.showIfHref = this.element.getAttribute('data-show-if-href')
    if (this.showIfHref) {
      this.assertHttpsUrl(this.showIfHref)
    }

    if (!!this.showIfHref + !!this.showIfGeo > 1) {
      error('最多只允许一个 data-show-if-*')
    }

    this.dismissHref = this.element.getAttribute('data-dismiss-href')
    if (this.dismissHref) {
      this.assertHttpsUrl(this.dismissHref)
    }

    const persistDismissal = this.element.getAttribute('data-persist-dismissal')
    this.persistDismissal = persistDismissal !== 'false' && persistDismissal !== 'no'

    this.enctype = this.element.getAttribute('enctype') || 'application/json;charset=utf-8'
  }

  /**
   * 根据 html 配置和定位信息判断当前城市是否应显示通知
   *
   * @param {Object} res mip-map getLocal 返回的位置信息
   * @returns {Promise<boolean>} 当前城市是否应显示通知
   */
  shouldShowInCity (res) {
    const {notShowIn, showIn} = this.props
    const province = res.address.province

    let shouldShow = !!(showIn && showIn.find(prov => province.indexOf(prov) > -1))
    let shouldNotShow = !!(notShowIn && notShowIn.find(prov => province.indexOf(prov) > -1))

    if (shouldShow && shouldNotShow) {
      error('当前城市同时出配置在 showIn 和 notShowIn 中')
    }
    // 当前城市配置在 showIn 中则显示，配置在 notShowIn 则不显示
    // 当前城市没有配置在 showIn 中，则查看是否配置在 notShowIn 中，若配置在 notShowIn 则不显示，若 notShowIn 中也没写则默认显示
    return Promise.resolve(shouldShow ? true : !shouldNotShow)
  }

  /**
   * 是否应显示通知
   */
  shouldShow () {
    return this.isDismissed().then(dismissed => {
      if (dismissed) {
        return false
      }
      if (this.showIfHref) {
        // 向服务器发起询问，是否应显示通知
        return this.shouldShowViaXhr()
      }
      if (this.geoPromise) {
        // 查看定位配置
        return this.geoPromise
      }
      // 默认显示通知
      return true
    })
  }

  /**
   * 按照配置和本地存储信息觉得是否不应当消息消息通知
   */
  isDismissed () {
    if (!this.persistDismissal) {
      return Promise.resolve(false)
    }
    let dismissedStorage = storage.get(this.storageKey)
    return Promise.resolve(dismissedStorage === 'true')
  }

  /**
   * 渲染元素
   */
  show () {
    let fixed = document.createElement('mip-fixed')
    fixed.setAttribute('type', 'bottom')
    fixed.setAttribute('id', `notification-fixed-${this.elementId}`)
    let content = this.element.children
    ;[...content].forEach(element => {
      if (element.nodeName !== 'SCRIPT') {
        fixed.appendChild(element)
      }
    })
    this.element.childNodes.forEach(element => {
      this.element.removeChild(element)
    })
    this.element.appendChild(fixed)
    this.toggle(true)
    return this.dialogPromise
  }

  /**
   * 触发 notification 显示与否
   *
   * @param  {boolean} isShow 是否显示
   */
  toggle (isShow) {
    if (isShow) {
      this.element.classList.remove(MIP_HIDDEN_CLASS)
      this.element.classList.add(MIP_ACTIVE_CLASS)
    } else {
      this.element.classList.remove(MIP_ACTIVE_CLASS)
      this.element.classList.add(MIP_HIDDEN_CLASS)
      let notificationFixed = document.getElementById(`notification-fixed-${this.elementId}`)
      notificationFixed && notificationFixed.classList.add(MIP_HIDDEN_CLASS)
    }
  }

  /**
   * 向服务端发请求询问时候显示通知
   */
  shouldShowViaXhr () {
    return this.getShowEndpoint()
      .then(this.onGetShowEndpointSuccess.bind(this))
  }

  /**
   * 向 `data-show-if-href` 的 url 发出 GET 请求
   *
   */
  getShowEndpoint () {
    const req = new Request(this.buildGetUrl(), this.buildGetRequestHeaders())
    return fetch(req)
      .then(res => {
        if (res.ok) {
          return res.json()
        } else {
          log(`加载失败：${res.statusText}`)
        }
      })
      .then(data => {
        if (data.showNotification === undefined) {
          error('返回数据格式错误, showNotification 不存在或者返回值嵌套层次错误')
        } else {
          return data.showNotification
        }
      })
      .catch(err => error(err))
  }

  buildGetRequestHeaders () {
    return new Headers({
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      }
    })
  }

  /**
   * buildGetUrl 获取最后拼接好的数据请求 url
   *
   * @returns {string} 拼接好的 url
   */
  buildGetUrl () {
    let url = this.showIfHref
    if (this.showIfHref.indexOf('?') > 0) {
      url += this.showIfHref[this.showIfHref.length - 1] === '?' ? '' : '&'
      url += 'elementId' + '=' + this.elementId
    } else {
      url += '?' + 'elementId' + '=' + this.elementId
    }
    return url
  }

  /**
   * 处理服务器返回的结果
   *
   * @param {boolean} isShowNotification 是否显示消息通知
   * @returns {Promise<boolean>} 根据服务器返回结果，是否显示消息通知
   */
  onGetShowEndpointSuccess (isShowNotification) {
    if (typeof isShowNotification !== 'boolean') {
      error('showNotification 应为 boolean 类型')
    }
    if (!isShowNotification) {
      this.dialogResolve()
    }
    return Promise.resolve(isShowNotification)
  }

  /**
   * 用户已读消息后，隐藏消息通知并将用户操作存储在本地
   * 如果配置了 ‘data-dismiss-href’, 则向配置的 url 发起 post 请求报告用户操作
   */
  dismiss () {
    this.toggle(false)
    this.dialogResolve()

    if (this.persistDismissal) {
      storage.set(this.storageKey, true)
    }
    if (this.dismissHref) {
      this.postDismissEnpoint()
    }
  }

  /**
   * 向 `data-dismiss-href` 的 url 发出 POST 请求
   *
   */
  postDismissEnpoint () {
    const req = new Request(this.dismissHref, this.buildPostDismissRequest(this.enctype))
    return fetch(req)
  }

  buildPostDismissRequest (enctype) {
    const body = {
      'elementId': this.elementId
    }
    return {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        'Content-Type': enctype
      }
    }
  }

  /**
   * 检查 url 是否合法
   *
   * @param {string} urlString 传入的 url
   * @returns {string} urlString
   */
  assertHttpsUrl (urlString) {
    if (urlString === null) {
      error('url 不存在')
    }
    if (!(this.isSecureUrlDeprecated(urlString) || /^(\/\/)/.test(urlString))) {
      error(`url 需为 https 协议，${urlString} 不合法`)
    }
    return urlString
  }

  /**
   * 检查 url 是否安全
   *
   * @param {string} url 传入的 url
   * @returns {boolean} url 是否安全
   */
  isSecureUrlDeprecated (url) {
    if (typeof url === 'string') {
      url = this.parseUrlWithA(url)
    }
    return (url.protocol === 'https:' ||
        url.hostname === 'localhost' ||
        url.hostname === '127.0.0.1' ||
        this.endsWith(url.hostname, '.localhost'))
  }

  endsWith (string, suffix) {
    const index = string.length - suffix.length
    return index >= 0 && string.indexOf(suffix, index) === index
  }

  /**
   * 使用 a 标签解析 url
   *
   * @param {string} url 传入的 url
   * @returns {Object} 解析后的 url
   */
  parseUrlWithA (url) {
    let a = document.createElement('a')
    a.href = url

    // IE11 没有解析相对 url 的组件
    if (!a.protocol) {
      a.href = a.href
    }

    const info = {
      href: a.href,
      protocol: a.protocol,
      host: a.host,
      hostname: a.hostname,
      port: a.port === '0' ? '' : a.port,
      pathname: a.pathname,
      search: a.search,
      hash: a.hash,
      origin: null // Set below.
    }

    // 1) IE11 会去掉路径名中的 '/'
    if (info.pathname[0] !== '/') {
      info.pathname = '/' + info.pathname
    }

    // 2) 对于隐式端口的URL，IE11解析为默认端口，而其他浏览器将端口字段留空
    if ((info.protocol === 'http:' && info.port === 80) ||
    (info.protocol === 'https:' && info.port === 443)) {
      info.port = ''
      info.host = info.hostname
    }

    // 对于数据 uri，a.origin 等于字符串'null'，这里返回原 url
    if (a.origin && a.origin !== 'null') {
      info.origin = a.origin
    } else if (info.protocol === 'data:' || !info.host) {
      info.origin = info.href
    } else {
      info.origin = info.protocol + '//' + info.host
    }
    const frozen = Object.freeze ? Object.freeze(info) : info

    return frozen
  }
}

MIP.registerService(SERVICE_ID, UserNotificationManager)
MIP.registerService(NOTIFICATION_UI_MANAGER, NotificationUiManager)
