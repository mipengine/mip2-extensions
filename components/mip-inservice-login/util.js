/**
 * @file 常用方法
 * @author huangjing
 */

/* globals location, fetch, localStorage */

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
     * @returns {string} 结果
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
   * @param  {string=} url url地址
   * @returns {string} 结果
   */
  getSourceUrl (url) {
    !url && (url = location.href)

    // 修复 MIP-Cache 环境识别，因为核心代码里只识别了 // 或 https://
    // https://github.com/mipengine/mip/blob/master/src/util.js#L58
    if (url.indexOf('.com/c/s/') > -1 && url.indexOf('http://') === 0) {
      url = url.replace(/^http:/, '')
    }

    return window.MIP.util.parseCacheUrl(url)
      .replace(/#.*$/, '')
      .replace(/([&?])((code|state)=[^&$]+)/g, function (matched, prefix) {
        return prefix === '?' ? '?' : ''
      })
  },

  getSourceFormatUrl (url) {
    return (location.protocol + '//' + location.host + location.pathname + location.search)
      .replace(/([&?])((code|state)=[^&$]+)/g, function (matched, prefix) {
        return prefix === '?' ? '?' : ''
      })
  },

  getRedirectUrl (url, query, hash) {
    let result = url + (url.indexOf('?') >= 0 ? '&' : '?') +
        'code=' + query.code + '&state=' + query.state + hash

    return result
  },

  getFormatUrl (url) {
    let a = document.createElement('a')
    a.href = url

    let {protocol, host, pathname, search, hash} = a

    a = null

    return {
      url: protocol + '//' + host + pathname + search,
      hash: hash
    }
  },

  getDomain (url) {
    let str = url.replace(/^https?:\/\//, '').split('/')
    str = str[0].replace(/:.*$/, '')

    let ext = [
      '.com', '.co', '.cn', '.info', '.net', '.org', '.me',
      '.mobi', '.us', '.biz', '.xxx', '.ca', '.co.jp',
      '.com.cn', '.net.cn', '.org.cn', '.gov.cn', '.mx',
      '.tv', '.ws', '.ag', '.com.ag', '.net.ag', '.org.ag',
      '.am', '.asia', '.at', '.be', '.com.br', '.net.br',
      '.bz', '.com.bz', '.net.bz', '.cc', '.com.co', '.net.co',
      '.nom.co', '.de', '.es', '.com.es', '.nom.es', '.org.es',
      '.eu', '.fm', '.fr', '.gs', '.in', '.co.in', '.firm.in',
      '.gen.in', '.ind.in', '.net.in', '.org.in', '.it', '.jobs',
      '.jp', '.ms', '.com.mx', '.nl', '.nu', '.co.nz', '.net.nz',
      '.org.nz', '.se', '.tc', '.tk', '.tw', '.com.tw', '.com.hk',
      '.idv.tw', '.org.tw', '.hk', '.co.uk', '.me.uk', '.org.uk', '.vg', '.name'
    ]
    let res = ''
    ext = ext.join('|').replace('.', '\\.')
    let exps = new RegExp('\\.?([^.]+(' + ext + '))$')

    str.replace(exps, function ($0, $1) {
      res = $1
    })

    return res
  },

  /**
   * 获取链接中的 query
   *
   * @param  {string} name 参数名称
   * @returns {string} 结果
   */
  getQuery (name) {
    let url = location.search.substr(1)
    let reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i')
    let matched = url.match(reg)

    return matched ? decodeURIComponent(matched[2]) : ''
  },

  log (param) {
    /* eslint-disable fecs-camelcase */
    let img = document.createElement('img')
    let {action, xzhid, ext = {}} = param

    let data = {
      rqt: 300,
      click_token: window.MIP.util.customStorage(0).get('mip-click-token') || '',
      url: location.href,
      ext: JSON.stringify(ext),
      action,
      xzhid
    }

    let queryArr = Object.keys(data).map(key => {
      return `${key}=${encodeURIComponent(data[key])}`
    })

    img.src = 'https://rqs.baidu.com/service/api/rqs?' + queryArr.join('&') + '&_t=' + (new Date()).getTime()
    /* eslint-enable fecs-camelcase */
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
     * @returns {string} 结果
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
     * @returns {string} 结果
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
     * @param {number} expires 过期时间UTC
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
      body: util.querystring.stringify(Object.assign({}, data || {}, {
        sessionId: util.store.get(url)
      })),
      credentials: 'include'
    }).then(function (res) {
      return res.json()
    })
  }

}

export default util
