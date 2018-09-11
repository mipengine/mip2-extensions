<template>
  <div
    v-if="visibleMark"
    class="paybox" >
    <div class="paybox__shadow"/>
    <transition name="fade">
      <div
        v-if="visiblePay"
        class="payContain">
        <div class="payContain__shadow"/>
        <span
          class="payContain__close btn"
          @click="toggleVisible()">
          <i>
            <svg
              t="1529369317928"
              class="icon"
              viewBox="0 0 1024 1024"
              version="1.1"
              xmlns="http://www.w3.org/2000/svg"
              p-id="2498"
              xmlns:xlink="http://www.w3.org/1999/xlink"
              width="12"
              height="12">
              <path
                d="M603.491471 512L1005.058336 110.433134a64.696385 64.696385 0 0 0-91.49147-91.49147L512 420.508529 110.433134 18.941664a64.696385 64.696385 0 0 0-91.49147 91.49147L420.508529 512 18.941664 913.566866a64.696385 64.696385 0 0 0 91.49147 91.49147L512 603.491471l401.566866 401.566865a64.696385 64.696385 0 0 0 91.49147-91.49147z"
                fill=""
                p-id="2499"/>
            </svg>
          </i>
        </span>
        <div class="payContain__header">
          <h3>支付订单</h3>
          <div class="info">
            支付信息： {{ payConfig.subject }}
          </div>
        </div>
        <div class="payTypeList">
          <div
            v-for="payItem in payInfos"
            v-if="!(isWechatApp && payItem.id==='alipay') && payConfig.endpoint[payItem.id]"
            :key="payItem.tye"
            class="payTypeList__list btn"
            @click="changePayType(payItem.id)">
            <span :class="['payTypeList__listIcon', payItem.id]" >
              <svg
                v-if="payItem.id==='baifubao'"
                t="1529115277984"
                class="icon"
                viewBox="0 0 1024 1024"
                version="1.1"
                xmlns="http://www.w3.org/2000/svg"
                p-id="2876"
                xmlns:xlink="http://www.w3.org/1999/xlink">
                <path
                  fill="currentColor"
                  d="M895.652205 1023.534753H128.344374C58.009942 1023.534753 0.465247 965.990058 0.465247 895.653345V128.345514C0.465247 58.011082 58.009942 0.465247 128.344374 0.465247h767.307831c70.334432 0 127.881408 57.546976 127.881407 127.880267v767.307831c0 70.336713-57.546976 127.881408-127.881407 127.881408zM840.158931 502.828472s-64.566735-206.29951-273.167394-147.356793c-4.966058 0-4.966058 4.911323-9.932116 4.911323 94.365363 19.647572 168.865354 108.062788 168.865354 211.213114 0 117.885434-94.366503 216.123296-213.566717 216.123296-119.200214 0-213.566717-98.237862-213.566717-216.123296 0-49.118931 14.900454-88.415216 39.733024-122.797898 74.499991-108.062788 183.766949-162.093042 273.167394-191.565541 79.467189-29.471359 148.999982-34.382682 173.833693-39.295145 4.966058-112.974111-99.333702-98.237862-124.167412-98.237862-302.966022 78.59029-432.099492 14.735109-466.866459 4.911323 14.899314 117.885434 144.032784 152.270396 144.032784 152.270397-9.932116 9.823786-19.866512 14.735109-24.83257 24.558895-79.467189 58.942717-134.100668 157.180579-134.100668 270.155831 0 186.653078 148.999982 334.009871 332.766931 334.009871 183.766949 0 332.766931-152.269256 332.766931-334.009871 0-24.560036 0-49.118931-4.966058-68.767644z m-229.208374 68.951234l-99.332561-103.150325-99.333702 103.150325 99.332561 103.150325 99.333702-103.150325z"
                  p-id="2877"/>
              </svg>

              <svg
                v-if="payItem.id==='alipay'"
                t="1529369172790"
                class="icon"
                viewBox="0 0 1024 1024"
                version="1.1"
                xmlns="http://www.w3.org/2000/svg"
                p-id="1581"
                xmlns:xlink="http://www.w3.org/1999/xlink">
                <path
                  fill="currentColor"
                  d="M894.79964445 1022.39800889H129.19694222c-70.17813333 0-127.59495111-57.41681778-127.59495111-127.59722667V129.19808c0-70.17813333 57.41681778-127.59608889 127.59495111-127.59608889h765.60270223c70.17813333 0 127.59722667 57.41909333 127.59722666 127.59608889v765.60270222c0 70.18040889-57.41909333 127.59722667-127.59722666 127.59722667z m127.2160711-336.39310222c-71.16344889-16.47957333-207.48060445-65.92284445-337.28625777-111.14837334 28.10766222-48.54784 51.48785778-103.09859555 68.35086222-163.27224888l3.19260445-11.88522667c3.19943111-12.1344 3.75011555-19.22730667 3.63178666-33.52689778H555.74869333v-58.33045333h262.48988445v-43.74869334H555.74869333v-102.07914666h-87.49738666v102.07914666H205.76142222v43.74869334h262.48988445v58.33045333H264.09187555v43.74755555l372.34460445-0.7623111c-8.94407111 46.12096-26.06307555 92.49792-48.41927111 132.73998222-17.75616-5.87662222-179.37635555-53.39932445-284.7744-53.39932445-84.32071111 0-224.21959111 64.512-224.21959111 182.17870223 0 116.01009778 80.49208889 181.29351111 224.21959111 181.2935111 137.98058667 0 239.54773333-68.99256889 321.69528889-191.25816888 156.37845333 68.09827555 301.63854222 143.22005333 397.07875555 186.27584V686.00490667z m-716.85461333 95.69848888c-71.16117333 0-189.08842667-24.27790222-189.08842667-111.02776888 0.12856889-75.50634667 104.51057778-113.82897778 189.0872889-113.82897778 90.06648889 0 158.03505778 37.04718222 228.0448 65.28455111-73.71207111 89.68305778-147.5584 159.57219555-228.0448 159.57219555z"
                  p-id="1582"/>
              </svg>
              <svg
                v-if="payItem.id==='weixin'"
                t="1529112834387"
                class="icon"
                viewBox="0 0 1025 1024"
                version="1.1"
                xmlns="http://www.w3.org/2000/svg"
                p-id="2977"
                xmlns:xlink="http://www.w3.org/1999/xlink">
                <path
                  fill="currentColor"
                  d="M537.622015 410.308169"
                  p-id="2978"/>
                <path
                  fill="currentColor"
                  d="M316.914611 320.110779c-19.899085 0-39.991474 13.179462-39.991474 33.147073 0 19.835673 20.03 33.141959 39.991474 33.141959 19.960451 0 33.141959-13.374812 33.141959-33.210485C350.055547 333.226829 336.811651 320.110779 316.914611 320.110779L316.914611 320.110779zM502.466215 386.335376c20.03 0 33.210485-13.3114 33.210485-33.141959 0-19.967611-13.180485-33.147073-33.210485-33.147073-19.835673 0-39.732712 13.11605-39.732712 33.147073C462.733503 373.023976 482.693954 386.335376 502.466215 386.335376L502.466215 386.335376zM588.659445 512.512921c-13.180485 0-26.491884 13.180485-26.491884 26.428472 0 13.369698 13.3114 26.484725 26.491884 26.484725 20.087275 0 33.208439-13.11605 33.208439-26.484725C621.867884 525.693406 608.810133 512.512921 588.659445 512.512921L588.659445 512.512921zM734.604138 512.512921c-13.11605 0-26.427449 13.242874-26.427449 26.48677 0 13.374812 13.3114 26.490861 26.427449 26.490861 19.962497 0 33.205371-13.11605 33.205371-26.490861C767.746096 525.693406 754.503223 512.512921 734.604138 512.512921L734.604138 512.512921zM827.32471 1.022774 197.701132 1.022774c-108.570496 0-196.678359 88.113999-196.678359 196.678359l0 629.618463c0 108.57561 88.044451 196.680404 196.678359 196.680404L827.32471 1024c96.745187 0 177.243613-69.948516 193.678563-161.95826l3.06423-160.683884L1024.067503 197.701132C1024.067503 89.130636 935.958618 1.022774 827.32471 1.022774L827.32471 1.022774zM403.09966 658.396247c-33.141959 0-59.695209-6.656211-92.842282-13.242874l-92.710344 46.453358 26.554273-79.726232c-66.41381-46.452336-106.153682-106.217094-106.153682-179.033467 0-126.173454 119.396556-225.476598 265.215447-225.476598 130.4016 0 244.548259 79.404059 267.580099 186.194928-8.571866-0.963453-17.081343-1.538252-25.589798-1.538252-125.989355 0-225.35591 93.995971-225.419322 209.801568 0 19.393835 3.006955 37.947972 8.19344 55.667527-8.256852 0.516501-16.507567 0.894927-24.826809 0.894927L403.100682 658.396247zM794.10502 751.365353l20.03 66.2921-72.74887-39.934199c-26.490861 6.656211-53.170936 13.247988-79.530882 13.247988-126.177545 0-225.480689-86.122659-225.480689-192.334639 0-106.021744 99.303144-192.404187 225.480689-192.404187 119.138817 0 225.287384 86.382443 225.287384 192.404187C887.078217 658.396247 847.408917 711.378993 794.10502 751.365353L794.10502 751.365353zM794.10502 751.365353"
                  p-id="2979"/></svg>
            </span>
            <div class="payTypeList__payName">
              <h4>{{ payItem.name }}</h4>
              <span v-if="payItem.desc">官方支付更安全，更便捷</span>
            </div>
            <div
              :class="{ selected: payItem.id === selectId }"
              class="payTypeList__select">
              <span class="icon">
                <svg
                  v-if="payItem.id !== selectId"
                  t="1529368844799"
                  class="icon"
                  viewBox="0 0 1024 1024"
                  version="1.1"
                  xmlns="http://www.w3.org/2000/svg"
                  p-id="1550"
                  xmlns:xlink="http://www.w3.org/1999/xlink">
                  <path
                    fill="currentColor"
                    d="M511.83818297 75.09333333C271.02170112 75.09333333 75.09333333 271.00551851 75.09333333 511.83818297s195.92836779 436.72866816 436.74484964 436.72866702c240.83266333 0 436.72866816-195.8960037 436.72866702-436.7448485C948.56684999 271.02170112 752.67084629 75.09333333 511.82200149 75.09333333m0 946.29129444C230.87483221 1021.38462777 2.27555555 792.78535111 2.27555555 511.82200149S230.84246926 2.27555555 511.83818297 2.27555555c280.94716814 0 509.54644594 228.56691371 509.5464448 509.56262742 0 280.94716814-228.59927666 509.54644594-509.56262628 509.5464448"
                    p-id="1551"/>
                </svg>
                <svg
                  v-if="payItem.id === selectId"
                  t="1529117556854"
                  class="icon"
                  viewBox="0 0 1024 1024"
                  version="1.1"
                  xmlns="http://www.w3.org/2000/svg"
                  p-id="3222"
                  xmlns:xlink="http://www.w3.org/1999/xlink">

                  <path
                    fill="currentColor"
                    d="M511.84 1015.664C234 1015.664 8 789.632 8 511.824S234.016 8 511.84 8c277.792 0 503.824 226.016 503.824 503.84 0 277.792-226.032 503.824-503.84 503.824m-68.512-371.152l-134.288-140.08a35.136 35.136 0 0 0-50.192-0.544 36.48 36.48 0 0 0-0.432 51.168l162.448 167.84a48 48 0 0 0 68.32 0.672L808.8 405.952a35.84 35.84 0 0 0 0.08-50.752 36.08 36.08 0 0 0-50.928-0.096L466.144 644.8a16 16 0 0 1-22.832-0.288z"
                    p-id="3223"/>
                </svg>
              </span>
            </div>
          </div>
        </div>
        <a
          v-if="selectId && !errorInfo && !loading && requestDataInfo"
          :href="requestDataInfo.url"
          class="mipPayBtn btn"
          @click="comfirmPayAction">确认支付¥{{ payConfig.fee }}</a>
        <div
          v-if="!selectId && !errorInfo"
          class="mipPayBtn loading"> 选择支付方式 </div>
        <div
          v-if="!errorInfo && loading"
          class="mipPayBtn loading">确认中...</div>
        <div
          v-if="errorInfo"
          class="mipPayBtn error">{{ errorInfo }}</div>

      </div>
    </transition>
    <div
      v-if="visibleConfirm"
      class="confirmDialog">
      <h4>支付确认</h4>
      <div class="confirmDialog__info">若未完成支付，请点击重新支付</div>
      <div class="confirmDialog__btnGroup">
        <span
          class="btn"
          @click="toggleVisible(false)">重新支付</span>
        <span
          class="btn"
          @click="goPayRedirectUrl">支付完成</span>
      </div>
    </div>
  </div>

</template>

<script>
import payUtil from './util.js'
const { platform } = MIP.util
let storage = MIP.util.customStorage(0)
// 支付信息
const payInfos = [
  {
    id: 'baifubao',
    name: '百度钱包支付',
    desc: '官方支付，更安全，更便捷'
  },
  {
    id: 'alipay',
    name: '支付宝',
    icon: ''
  },
  {
    id: 'weixin',
    name: '微信',
    icon: ''
  }
]

let decodeCacheUrl = (url) => {
  if (!url) {
    return ''
  }
  const cachePrefix = /^(https?:)?\/\/(mipcache\.bdstatic\.com|[^.]+\.mipcdn.com)/

  if (!cachePrefix.exec(url)) {
    return url
  }
  return url
    .replace(cachePrefix, '')
    .replace(/^\/c\/s\//, 'https://')
    .replace(/^\/c\//, 'http://')
}

// 微信环境、safari下进行跳出sf
if ((platform.isWechatApp()) && MIP.viewer.isIframed) {
  let reflushUrl =
    window.location.origin +
    window.location.pathname +
    '?' +
    window.location.search.replace('?', '') +
     '&_r=' +
     new Date().getTime() + window.location.hash
  window.top.location.replace(decodeCacheUrl(reflushUrl))
}

export default {
  props: {
    payConfig: {
      type: Object,
      required: true
    }
  },
  data () {
    return {
      selectId: 'baifubao',
      loading: false,

      // 弹层状态
      visibleMark: false,
      visiblePay: false,
      visibleConfirm: false,

      errorInfo: '',

      payInfos: payInfos,
      requestDataInfo: null,

      isWechatApp: platform.isWechatApp(),
      paySucRurl: '',

      isJumped: false
    }
  },

  watch: {
    // 修复某些机器 payConfig props数据绑定缓慢
    payConfig: {
      handler (payConfig, oldPayConfig) {
        if (!oldPayConfig && this.payConfig) {
          setTimeout(() => {
            this.init()
          }, 0)
        }
      }
    }
  },
  mounted () {
    this.$element.customElement.addEventAction('toggle', () => {
      this.toggleVisible(!this.visibleMark)
    })
    // 修复部分机型 回退不刷新页面问题
    window.addEventListener('focus', () => {
      if (this.isJumped) {
        this.init()
      }
      this.isJumped = false
    })
    this.init()
  },

  methods: {
    init () {
      // 初使化支付默认支付方式
      if (!this.payConfig) {
        return
      }
      this.payInfos.forEach(payInfo => {
        if (platform.isWechatApp() && payInfo.id === 'alipay') {
          payInfo.disable = true
        }

        // 初使化selectId
        if (!this.payConfig.endpoint[this.selectId] || (this.selectId === payInfo.id && payInfo.disable)) {
          this.selectId = ''
        }
        if (!this.selectId && !payInfo.disable) {
          this.selectId = payInfo.id
        }
      })

      // 微信跳转redirect， 自动弹窗
      this.paySucRurl = this.getMipPayRedirect().redirectUrl
      if (this.paySucRurl) {
        this.toggleVisible(true, 'visibleConfirm')
      }
    },
    /**
     * 支付弹窗切换功能函数
     *
     * @param {boolean} visible 显示或隐藏
     * @param {string} showType 切换弹窗类型
     */
    toggleVisible (visible, showType = 'visiblePay') {
      const DialogList = ['visiblePay', 'visibleConfirm']
      visible = !!visible
      if (!visible) {
        DialogList.forEach(type => { this[type] = visible })
        this.visibleMark = visible
        this.changeMipPayRedirect()
      } else {
        let curShowType
        DialogList.forEach(type => {
          if (!curShowType && this[type]) {
            curShowType = type
          }
        })
        if (curShowType && showType === curShowType) {
          return
        }

        if (curShowType) {
          this[curShowType] = !visible
        } else {
          this.visibleMark = visible
        }
        // 动画延迟
        setTimeout(() => {
          this[showType] = visible
          // 显示支付弹窗初使化支付数据
          if (showType === 'visiblePay') {
            this.payAction()
            this.sendLog({action: 'pay_dialog'})
          }
        }, 100)
      }

      window.MIP.viewer.page.togglePageMask(this.visibleMark, {
        skipTransition: true
      })
    },

    /**
     * 选择支付方式
     *
     * @param {string} selectId 支付方式ID
     */
    changePayType (selectId) {
      this.selectId = selectId
      if (selectId === 'weixin') {
        let mipanchorset = encodeURIComponent(JSON.stringify({redirectUrl: this.payConfig.redirectUrl, pay: 'weixin'}))
        this.changeMipPayRedirect(mipanchorset)
      } else {
        let getMipPayRedirect = this.getMipPayRedirect()
        if (getMipPayRedirect.pay && getMipPayRedirect.pay === 'weixin') {
          this.changeMipPayRedirect()
        }
      }
      setTimeout(() => {
        this.payAction().then(() => {
        }).catch(() => {
          this.changeMipPayRedirect()
        })
      }, 100)
    },
    /**
     * 改变当前支付方式url
     *
     * @param {string} value url值
     */
    changeMipPayRedirect (value = '') {
      let win = window
      let changeUrl
      if (!MIP.viewer.page.isRootPage) {
        win = window.parent
      }

      let search = payUtil.query.parse(win.location.search)
      if (!value && !search.mipPayRedirect) {
        return
      }
      if (value) {
        search.mipPayRedirect = value
      } else {
        delete search.mipPayRedirect
      }
      search = payUtil.query.stringify(search)

      changeUrl = `${win.location.href.split('#')[0].split('?')[0]}${search && '?' + search}`
      changeUrl += win.location.hash ? `#${win.location.hash}` : ''
      if (!window.MIP.standalone) {
        MIP.viewer.messager.sendMessage('replaceState', {
          url: MIP.util.getOriginalUrl(changeUrl)
        })
      }
      win.history.replaceState(null, null, changeUrl)
      if (!MIP.viewer.page.isRootPage) {
        window.history.replaceState(null, null, changeUrl)
      }
    },
    /**
     * 获取返回地址信息
     */
    getMipPayRedirect () {
      let search = payUtil.query.parse((!MIP.viewer.page.isRootPage ? window.parent : window).location.search)
      let mipPayRedirect = {}
      try {
        mipPayRedirect = JSON.parse(decodeURIComponent(decodeURIComponent(search.mipPayRedirect))) || {}
      } catch (e) {}
      return mipPayRedirect
    },

    /**
     * 确认支付动作
     * 微信内浏览器 截获 a 执行
     *
     * @param {Object} e 事件数据
     */
    comfirmPayAction (e) {
      this.sendLog({action: 'pay_click'})
      if (this.selectId === 'weixin') {
        if (this.getWechatVer() >= 5.0) {
          e.preventDefault()
          this.weixinRedierct()
          return false
        } else {
          this.isJumped = true
          // 微信外浏览器吊起微信 种值返回标识
          // storage.set('mipPayRedirect', this.payConfig.redirectUrl, 10000)
        }
      }
    },

    /**
     * 支付请求函数
     */
    payAction () {
      let payPromise = this.request(this.payConfig.endpoint[this.selectId], this.getPostData())
        .then(res => {
          if (res.status === 0 && res.data) {
            this.requestDataInfo = res.data
            return res
          } else {
            this.setError(res.msg || res.message || '支付错误，请重试')
          }
          this.sendLog({'action': 'pay_error', ext: {type: 1}})
          throw new Error('支付错误，请重试')
        })
      payPromise.catch(() => {
        this.sendLog({'action': 'pay_error', ext: {type: 1}})
        this.setError('支付错误，请重试')
      })
      return payPromise
    },

    /**
     * 微信支付，判断是否在微信内逻辑，不同情况进行不同处理
     */
    weixinRedierct () {
      // weixin
      let prepayInfo = this.requestDataInfo

      let invokeConfig = {
        appId: prepayInfo.appId, // 公众号名称，由商户传入
        timeStamp: prepayInfo.timeStamp, // 时间戳，自1970年以来的秒数;
        nonceStr: prepayInfo.nonceStr, // 随机串
        package: prepayInfo.package,
        signType: prepayInfo.signType, // 微信签名方式
        paySign: prepayInfo.paySign // 微信签名
      }

      let onBridgeReady = () => {
        window.WeixinJSBridge.invoke(
          'getBrandWCPayRequest',
          invokeConfig,
          res => {
            if (res.err_msg === 'get_brand_wcpay_request:ok') {
              this.goPayRedirectUrl()
            } else {
              this.sendLog({'action': 'pay_error', ext: {type: 2}})
              this.setError('支付失败，请重试')
            }
          }
        )
      }
      // 微信 bridge还未注入时的情况处理
      if (typeof WeixinJSBridge === 'undefined') {
        if (document.addEventListener) {
          document.addEventListener(
            'WeixinJSBridgeReady',
            onBridgeReady,
            false
          )
        } else if (document.attachEvent) {
          document.attachEvent('WeixinJSBridgeReady', onBridgeReady)
          document.attachEvent('onWeixinJSBridgeReady', onBridgeReady)
        }
      } else {
        onBridgeReady()
      }
    },
    /**
     * 支付成功后跳转
     */
    goPayRedirectUrl () {
      let url = this.paySucRurl || this.payConfig.redirectUrl
      window.top.location.replace(url)
    },
    /**
     * 错误显示函数
     *
     * @param {string} error 错误信息
     */
    setError (error) {
      this.selectId = ''
      this.errorInfo = error
      clearTimeout(this.errorTimer)
      this.errorTimer = setTimeout(() => {
        this.errorInfo = ''
      }, 2000)
    },

    /**
     * 获取订单提交数据
     */
    getPostData () {
      return Object.assign({}, this.payConfig.postData, {
        sessionId: this.payConfig.sessionId,
        state: JSON.stringify({
          r: Date.now(),
          url: location.href
        })
      })
    },
    queryString (data) {
      return Object.keys(data)
        .map(function (key) {
          return (
            encodeURIComponent(key) + '=' + encodeURIComponent(data[key] || '')
          )
        })
        .join('&')
    },
    /**
     * 微信版本号判断
     */
    getWechatVer () {
      let result = 0
      let weiMatch = navigator.userAgent.match(/\bmicromessenger\/([\d.]+)/i)
      if (weiMatch && weiMatch[1]) {
        result = +weiMatch[1].replace(/([\d+]\.[\d+])(\.)([\d+])(.*)/, '$1$3')
      }

      return result
    },

    request (url, postData) {
      this.loading = true
      let presult = fetch(url, {
        method: 'post',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: this.queryString(postData || {}),
        credentials: 'include'
      }).then(res => {
        this.loading = false
        return res.json()
      })
      presult.catch(() => {
        this.loading = false
      })
      return presult
    },

    sendLog ({action, param, url = location.href, ext = {}}) {
      let urlQuerys = {}
      urlQuerys.rqt = 300
      let xzhid = storage.get('mip-xzhid')
      let clickToken = storage.get('mip-click-token')
      urlQuerys.action = action
      param && (urlQuerys.param = param)
      urlQuerys.url = url
      xzhid && (urlQuerys.xzhid = xzhid)
      clickToken && (urlQuerys.click_token = clickToken)
      urlQuerys.ext = JSON.stringify(ext)
      let urlQueryParams = Object.keys(urlQuerys).map((key) => {
        return `${key}=${encodeURIComponent(urlQuerys[key])}`
      })
      new Image().src = `//rqs.baidu.com/service/api/rqs?${urlQueryParams.join('&')}`
    }
  }
}
</script>

<style scoped lang="less">
@border-color: #f1f1f1;

.fade-enter-active {
  transition: opacity 0.5s;
  animation-name: layout-fade-in;
  animation-duration: 0.2s;
  animation-timing-function: ease-out;
  animation-fill-mode: forwards;
}

.fade-enter /* .fade-leave-active below version 2.1.8 */ {
  opacity: 0;
}

.btn {
  &:active {
    opacity: 0.8;
  }
}

.paybox {
  font-family: "PingFangSC-Regular", serif;
  display: flex;
  justify-content: center;
  align-items: center;
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  line-height: 1;
  z-index: 20001;

  &__shadow {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    background-color: rgba(0, 0, 0, 0.5);
  }
}

.payContain {
  position: relative;
  z-index: 1;
  background: #fff;
  box-sizing: border-box;
  width: 80%;
  border-radius: 6px;
  padding-bottom: 28px;
  max-width: 410px;

  &__shadow {
    position: absolute;
    display: none;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    background-color: rgba(255, 255, 255, 0.65);
  }

  &__close {
    position: absolute;
    top: 0;
    right: 0;
    padding: 13px;

    i {
      display: inline-block;
      width: 12px;
      height: 12px;
      background-size: contain;
    }

    &:active {
      background-color: rgb(235, 235, 235);
    }
  }

  &__header {
    // margin-bottom: 28px;
    border-bottom: 1px solid @border-color;
    padding: 28px 16px;

    h3 {
      font-weight: normal;
      font-size: 20px;
      text-align: center;
      margin-bottom: 10px;
    }

    .info {
      // font-size:
      text-align: center;
      color: #999;
    }
  }

  .payTypeList {
    &__list {
      display: flex;
      align-items: center;
      margin: 0 16px;
      height: 57px;
      border-bottom: 1px solid @border-color;
      box-sizing: border-box;

      &:last-child {
        border: none;
      }
    }

    &__listIcon {
      width: 28px;
      height: 28px;
      margin-right: 8px;
      background-size: contain;

      svg {
        transform: translate3d(0, 0, 0);
        -webkit-transform: translate3d(0, 0, 0);
      }

      &.baifubao svg {
        color: #e84848;
      }

      &.alipay svg {
        color: #00acef;
      }

      &.weixin svg {
        color: #27b52f;
      }
    }

    &__payName {
      flex: 1;

      h4 {
        font-size: 14px;
        font-weight: normal;
      }

      span {
        display: inline-block;
        margin-top: 5px;
        color: #999;
        font-size: 12px;
      }
    }

    &__select {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 17px;

      .icon {
        display: inline-block;
        width: 21px;
        height: 21px;
        color: #eee;
      }

      &.selected {
        .icon {
          color: #555;
        }
      }
    }
  }

  .mipPayBtn {
    display: block;
    margin: 16px;
    margin-bottom: 0;
    padding: 0 10px;
    height: 38px;
    line-height: 38px;
    text-align: center;
    background-color: #3c76ff;
    border-radius: 3px;
    color: #fff;
    white-space: nowrap;
    word-break: normal;
    text-overflow: ellipsis;
    overflow: hidden;

    &.loading {
      background-color: #bbb;
    }

    &.error {
      background-color: #f15253;
    }
  }

  @keyframes layout-fade-in {
    from {
      transform: scale(0.7);
      -webkit-transform: scale(0.7);
    }

    to {
      transform: scale(1);
      -webkit-transform: scale(1);
    }
  }
}

.confirmDialog {
  color: #000;
  position: relative;
  z-index: 1;
  display: inline-block;
  background-color: #fff;
  border-radius: 4px;
  max-width: 80%;
  text-align: center;
  overflow: hidden;

  /* stylelint-disable no-descending-specificity */
  h4 {
    color: #333;
    margin: 28px 0 0 0;
    font-size: 24px;
    font-weight: normal;
  }
  /* stylelint-enable no-descending-specificity */

  &__info {
    padding: 24px 37px;
    font-size: 16px;
    line-height: 1.3;
    color: #999;
  }

  &__btnGroup {
    display: flex;
    font-size: 18px;
    border-top: 1px solid #e0e0e0;

    .btn {
      display: flex;
      flex: 1;
      padding: 13px;
      justify-content: center;
      align-content: center;

      &:first-child {
        border-right: 1px solid #e0e0e0;
      }

      &:active {
        background-color: rgb(235, 235, 235);
      }
    }
  }
}

</style>
