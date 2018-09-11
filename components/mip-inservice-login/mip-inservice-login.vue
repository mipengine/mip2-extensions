<template>
  <div>
    <slot
      :user="userInfo"
      name="content"/>
  </div>
</template>

<script>

import util from './util'

let viewer = window.MIP.viewer
let fn = window.MIP.util.fn

export default {
  props: {
    config: {
      type: Object,
      required: true,
      default () {
        return {}
      }
    }
  },
  data () {
    return {
      /**
       * 用户信息
       *
       * @type {Object}
       */
      userInfo: null,

      /**
       * 会话标识
       *
       * @type {string}
       */
      sessionId: null,

      /**
       * 默认为未登录
       *
       * @type {boolean}
       */
      isLogin: false,

      /**
       * 是否要在页面显示的时候查询登录状态，默认需要
       *
       * @type {boolean}
       */
      doAutoQuery: true
    }
  },
  created () {
    // 检查配置数据
    this.checkConfig()
    // 清空登录update
    util.store.remove(this.config.endpoint + '_login_handle')
  },
  prerenderAllowed () {
    return true
  },
  mounted () {
    // 熊掌号sdk
    let url = 'https://xiongzhang.baidu.com/sdk/c.js?appid=' + this.config.appid

    util.loadJS(
      url,
      () => {
        // 如果是自动登录，在检查完用户信息后没有登录时要求立即登录
        if (this.config.autologin) {
          return this.getUserInfo().then(() => {
            if (!this.isLogin) {
              this.login()
              this.bindEvents()
            }
          })
        }
        this.getUserInfo()
        this.bindEvents()
      },
      () => {
        throw new Error('加载资源出错')
      }
    )
  },
  methods: {
    bindEvents () {
      this.$element.customElement.addEventAction('login', (e, str = '') => {
        let args = str.split(',')
        this.login(...args)
      })

      this.$element.customElement.addEventAction('logout', () => {
        this.logout()
      })

      window.addEventListener('show-page', e => {
        // 如果不在进行登录状态的更新中
        if (this.doAutoQuery) {
          // 页面返回重新触发一遍查询
          this.getUserInfo().then(() => {
            if (this.config.autologin && !this.isLogin) {
              // TODO,抛出事件，让业务方自己处理
              this.$emit('autoLoginCancel')
            }
          })
        }
      })

      window.addEventListener('inservice-auth-logined', e => {
        // 标示在进行登录数据的更新
        this.doAutoQuery = false
        // 开始进行数据更新
        this.updateLogin(e.detail[0])
      })

      window.addEventListener('inservice-auth-data-updated', e => {
        let res = e.detail[0]
        // 没设置过就执行
        if (this.sessionId !== res.data.sessionId) {
          // 标示在进行登录数据的更新
          this.doAutoQuery = false
          this.loginHandle('login', true, res.data.userInfo, res.origin)
          // 更新数据哦
          this.setData()
        }
      })

      let self = this

      window.cambrian.init({
        data: { simpleInit: true },
        success () {
          window.cambrian.addListener('xzh-open-log', e => {
            util.log({
              action: e.action,
              ext: e.ext,
              xzhid: self.config.appid
            })
          })
        }
      })
    },
    updateLogin (data) {
      let key = this.config.endpoint + '_login_handle'

      // 先从store里取状态，看当前是否存在已经在查询状态的实例
      let logProcess = util.store.get(key)
      let { code, origin, callbackurl } = data

      // 如果没有，开启一次状态更新
      if (!logProcess) {
        util.store.set(key, 'pending')
        return this.getUserInfo({
          code,
          origin,
          callbackurl: callbackurl || (util.getSourceFormatUrl())
        }).then(() => {
          // 广播事件，通知数据更新结束
          window.MIP.viewer.page.broadcastCustomEvent({
            name: 'inservice-auth-data-updated',
            data: {
              data: {
                isLogin: this.isLogin,
                userInfo: this.userInfo,
                sessionId: this.sessionId
              },
              origin
            }
          })
          util.store.set(key, 'finish')
        }).catch(err => {
          throw err
        })
      }
    },
    /**
     * 检查配置
     */
    checkConfig () {
      let config = this.config
      let hasError = false
      let code = 0

      if (!config.clientId) {
        code = 1
        this.error('组件必选属性 clientId 为空')
        hasError = true
      }
      if (!config.endpoint) {
        code = 2
        this.error('组件必选属性 endpoint 为空')
        hasError = true
      } else if (!/^(https:)?\/\//.test(config.endpoint)) {
        code = 3
        this.error('组件必选属性 endpoint 必须以 https:// 或者 // 开头')
        hasError = true
      }

      // 如果有 mip-bind 则必须有组件id -- 之后补充
      if (typeof MIP.setData === 'function' && !config.id) {
        code = 4
        this.error('和 mip-bind 配合使用必须设置登录组件 id')
        hasError = true
      }

      if (hasError) {
        util.log({
          action: 'login_init_error',
          ext: { code },
          xzhid: this.config.appid
        })
        throw new TypeError('[mip-inservice-login] 组件参数检查失败')
      }
    },
    /**
     * 输出错误信息到控制台
     *
     * @param {string} text 输出文本
     */
    error (text) {
      console.error('[mip-inservice-login] ', text, this)
    },
    /**
     * 用户登录
     *
     * @param {string=} redirectUri 登录成功后的重定向地址
     * @param {string=} origin 发起登录操作的来源标示
     * @param {boolean=} replace 重定向的地址是否要replace当前地址，默认为false
     * @returns {undefined} 结果
     */
    login (redirectUri, origin = '', replace = false) {
      util.log({
        action: 'invoke_login',
        ext: { isLogin: this.isLogin ? 1 : 0 },
        xzhid: this.config.appid
      })

      // 当前页面的url
      let url = redirectUri || this.config.redirectUri

      if (this.isLogin) {
        return
      }
      // 用来oauth的url
      let sourceUrl
      // 当前页面的hash值
      let hash
      // 是否返回原页面
      let back = false

      // 校验url的合法性
      if (url) {
        sourceUrl = util.getSourceUrl(url)
        // 分析url，获取需要的参数
        let obj = util.getFormatUrl(url)
        url = obj.url
        hash = obj.hash
      } else {
        url = util.getSourceFormatUrl()
        hash = location.hash
        sourceUrl = util.getSourceUrl()
        back = true
      }

      let self = this

      window.cambrian && window.cambrian.authorize({
        data: {
          redirect_uri: sourceUrl,
          scope: 1,
          pass_no_login: 0,
          state: JSON.stringify({
            url,
            back,
            origin,
            h: encodeURIComponent(hash),
            r: Date.now()
          }),
          ifSilent: false,
          client_id: self.config.clientId
        },
        success (data) {
          // 弹窗情况会进入该回调
          self.doAutoQuery = false
          // 是返回原页面，就进行事件通知
          self.updateLogin({
            code: data.result.code,
            callbackurl: url,
            origin
          }).then(() => {
            if (!back) {
              viewer.open(
                util.getRedirectUrl(url, data.result, hash),
                { isMipLink: true, replace }
              )
            }
          }).catch(err => {
            throw err
          })
        },
        fail (data) {
          console.error(data.msg)
        },
        complete (data) {
          // 单词拼错，待依赖的文件升级再修改
          if (data.msg === 'oauth:cancel' && self.config.autologin) {
            // TODO,抛出事件，让业务方自己处理
            self.$emit('autoLoginCancel')
          }
        }
      })
    },

    /**
     * 用户退出
     */
    logout () {
      let self = this

      util.log({
        action: 'invoke_logout',
        xzhid: self.config.appid
      })

      if (!self.isLogin) {
        return
      }

      util.post(self.config.endpoint, {
        type: 'logout'
      }).then(function (res) {
        // 清空 sessionId
        util.store.remove(self.config.endpoint)
        // 清空登录update
        util.store.remove(self.config.endpoint + '_login_handle')
        if (res.data && res.data.url) {
          viewer.open(res.data.url, { isMipLink: true })
        } else {
          // 是否，需要补充多一点信息
          self.loginHandle('logout', false)
          // 设置数据
          self.setData()
        }
      }).catch(function (data) {
        // 清空 sessionId
        util.store.remove(self.config.endpoint)
        // 清空登录update
        util.store.remove(self.config.endpoint + '_login_handle')

        self.loginHandle('logout', false)
      })
    },

    /**
     * 登录统一处理
     *
     * @param {string}  name    事件名称
     * @param {boolean} isLogin 是否登录
     * @param {Object|undefined}  data    用户数据
     * @param {string=} origin 触发登录方法的来源标示
     */
    loginHandle (name, isLogin, data, origin) {
      this.isLogin = isLogin
      this.userInfo = data || null
      this.trigger(name, origin)
    },

    /**
     * 触发事件
     *
     * @param {string} name  事件名称
     * @param {string=} origin 触发登录方法的来源标示
     */
    trigger (name, origin = '') {
      let event = {
        userInfo: this.userInfo,
        sessionId: this.sessionId,
        origin
      }
      // viewer.eventAction.execute(name, this.$element, event)
      this.$emit(name, event)
    },

    /**
     * 获取用户信息
     *
     * @param {Object} options 授权数据，当弹窗登录成功的情况下存在
     * @param {string} options.code code
     * @param {string} options.callbackurl 回调地址
     * @param {string} options.origin 触发登录方法的来源标示
     * @returns {Promise} 用户信息
     */
    getUserInfo (options = {}) {
      let data = {
        type: 'check'
      }

      let { code, callbackurl, origin } = options

      if (!code) {
        code = util.getQuery('code')

        if (code) {
          try {
            callbackurl = JSON.parse(util.getQuery('state')).url
          } catch (e) {
            throw new Error('JSON parse解析出错')
          }
        }
      }

      if (code && callbackurl) {
        data.code = code
        // 处理为originurl
        data.redirect_uri = util.getSourceUrl(callbackurl)
        data.type = 'login'
      }

      let self = this
      return util.post(self.config.endpoint, data).then(res => {
        // 记录 sessionId 到 ls 中，修复在 iOS 高版本下跨域 CORS 透传 cookie 失效问题
        if (res.sessionId) {
          self.sessionId = res.sessionId
          util.store.set(self.config.endpoint, res.sessionId)
        }

        if (data.type === 'login') {
          if (res.status === 0 && fn.isPlainObject(res.data)) {
            util.log({
              action: 'login_success',
              xzhid: self.config.appid
            })
            self.loginHandle('login', true, res.data, origin)
          } else {
            util.log({
              action: 'login_error',
              ext: { code: res.status },
              xzhid: self.config.appid
            })
            throw new Error('登录失败', res)
          }
        } else if (res.status === 0 && res.data) {
          util.log({
            action: 'login_check_success',
            xzhid: self.config.appid
          })
          self.loginHandle('login', true, res.data, origin)
        }

        // 设置数据
        self.setData()
      }).catch(err => {
        if (data.type === 'login') {
          this.loginHandle('error', false)
          throw err
        }
      })
    },

    /**
     * 配合 mip-bind 设置数据
     */
    setData () {
      if (typeof MIP.setData !== 'function') {
        return
      }
      let id = (this.config.isGlobal ? '#' : '') + this.config.id

      // 设置源数据
      let data = {}

      data[id] = {
        isLogin: this.isLogin
      }

      // fix 因为直接使用 null 时 mip-bind 报错
      if (this.userInfo) {
        data[id].userInfo = this.userInfo
      }
      if (this.sessionId) {
        data[id].sessionId = this.sessionId
      }

      MIP.setData(data)
    }
  }
}
</script>
