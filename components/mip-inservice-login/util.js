/**
 * @file 常用方法
 * @author huangjing
 */

let {parseCacheUrl, fn} = window.MIP.util
let extend = fn.extend

const util = {

  loadJS (src, success = () => {}, fail = () => {}) {
    let ref = document.getElementsByTagName('script')[0]
    let script = document.createElement('script')
    // src 为 百度pass账号服务
    script.src = src
    script.async = true
    ref.parentNode.insertBefore(script, ref)
    script.onload = function () {
      script = null
      success()
    }
    script.onerror = function (e) {
      script = null
      fail()
    }
  },

  /**
     * 处理字符串query
     *
     * @type {Object}
     */
  querystring: {

    /**
         * 解析对象为 string
         *
         * @param  {Object} data 一级对象数据
         * @return {string}
         */
    stringify (data) {
      return Object.keys(data).map(function (key) {
        return encodeURIComponent(key) + '=' + encodeURIComponent(data[key] || '')
      }).join('&')
    }
  },

  /**
     * 获取当前原始页面链接
     *
     * @description 会做如下处理：
     *              1. 删除 hash 后面的字符，因为透传有问题
     *              2. 删除 code state 参数，防止多次重定向链接越来越长
     * @return {string}
     */
  getSourceUrl () {
    let url = location.href

    // 修复 MIP-Cache 环境识别，因为核心代码里只识别了 // 或 https://
    // https://github.com/mipengine/mip/blob/master/src/util.js#L58
    if (url.indexOf('.com/c/s/') > -1 && url.indexOf('http://') === 0) {
      url = url.replace(/^http:/, '')
    }

    return parseCacheUrl(url)
      .replace(/#.*$/, '')
      .replace(/([&?])((code|state)=[^&$]+)/g, function (matched, prefix) {
        return prefix === '?' ? '?' : ''
      })
  },

  getRedirectUrl (url, query, type) {
    let result = url + (url.indexOf('?') >= 0 ? '&' : (type === 'hash' ? '#' : '?')) +
            'code=' + query.code +
            '&state=' + query.state
    return result
  },

  /**
     * 获取链接中的 query
     *
     * @param  {string} name 参数名称
     * @return {string}
     */
  getQuery (name) {
    let url = location.search.substr(1)
    let reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i')
    let matched = url.match(reg)

    return matched ? decodeURIComponent(matched[2]) : ''
  },

  /**
     * 小小的封装下 ls
     *
     * @type {Object}
     */
  store: {
    /**
         * 存储 key 前缀
         *
         * @type {string}
         */
    prefix: 'mip-login-xzh:sessionId:',

    /**
         * 获取 key
         *
         * @param  {string} key 键值
         *
         * @return {string}
         */
    getKey (key) {
      return util.store.prefix + key
    },

    /**
         * 检查是否支持 ls
         *
         * @type {boolean}
         */
    support: (function () {
      let support = true
      try {
        window.localStorage.setItem('lsExisted', '1')
        window.localStorage.removeItem('lsExisted')
      } catch (e) {
        support = false
      }
      return support
    })(),

    /**
         * 获取缓存数据
         *
         * @param  {string} key 数据名称
         * @return {string}
         */
    get (key) {
      if (util.store.support) {
        return localStorage.getItem(util.store.getKey(key))
      }
    },

    /**
         * 设置缓存数据
         *
         * @param {string} key   数据名称
         * @param {string} value 数据值
         * @param {UTC} expires 过期时间
         */
    set (key, value, expires) {
      if (util.store.support) {
        localStorage.setItem(util.store.getKey(key), value)
      }
    },

    /**
     * 删除缓存数据
     *
     * @param  {string} key 数据名称
     */
    remove (key) {
      if (util.store.support) {
        return localStorage.removeItem(util.store.getKey(key))
      }
    }
  },

  /**
     * 发送 POST 请求
     *
     * @param  {string} url  接口链接
     * @param  {Object} data  发送数据
     *
     */
  post (url, data) {
    return fetch(url, {
      method: 'post',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: util.querystring.stringify(extend({}, data || {}, {
        sessionId: util.store.get(url)
      })),
      credentials: 'include'
    }).then(function (res) {
      return res.json()
    })
  }

}

export default util
