/**
 * @file mip-list 组件
 * @author zhangqichao02@baidu.com
 */

let {
  CustomElement,
  templates
} = MIP

let {
  fetchJsonp
} = window

export default class MipList extends CustomElement {
  constructor (...args) {
    super(...args)
    this.pnName = this.element.getAttribute('pnName') || 'pn'
    this.pn = this.element.getAttribute('pn') || 1
    this.timeout = this.element.getAttribute('timeout') || 5000
    this.src = this.element.getAttribute('src') || ''
  }

  firstInviewCallback () {
    let {
      element
    } = this
    this.container = document.createElement('div')
    element.appendChild(this.container)
    if (!this.container.hasAttribute('role')) {
      this.container.setAttribute('role', 'list')
    }

    // 同步配置数据
    if (element.hasAttribute('synchronous-data')) {
      let script = element.querySelector('script[type="application/json"]')
      let data = script ? JSON.parse(script.textContent.toString()) : null
      this.renderTemplate(data)
      return
    }

    // 异步获取数据
    let url = this.src
    if (!this.src) {
      console.error('mip-list 的 src 属性不能为空')
      return
    }

    // 有查看更多属性的情况
    if (element.hasAttribute('has-more')) {
      this.addEventAction('more', function (e) {
        this.button = e.target
        this.pushResult(this.src)
      })
    }

    if (element.hasAttribute('preLoad')) {
      url = getUrl(this.src, this.pnName, this.pn++)
      fetchJsonp(url, {
        jsonpCallback: 'callback',
        timeout: this.timeout
      }).then(res => {
        return res.json()
      }).then(data => {
        if (!data.status && data.data) {
          this.renderTemplate(data.data)
        }
      })
    }
  }

  /**
   * renderTemplate 获取模版
   *
   * @param {Object} data 渲染数据
   */
  renderTemplate (data) {
    if (data && data.items && data.items instanceof Array) {
      templates.render(
        this.element, data.items
      ).then(render.bind(this))
    } else {
      console.error('数据不符合规范')
    }
  }

  /**
   * pushResult push结果函数
   *
   * @param {string} src ajax请求的url
   */
  pushResult (src) {
    if (this.isEnd) {
      return
    }
    this.button.innerHTML = '加载中...'
    let url = getUrl(src, this.pnName, this.pn++)
    fetchJsonp(url, {
      jsonpCallback: 'callback',
      timeout: this.timeout
    }).then(res => {
      return res.json()
    }).then(data => {
      if (!data.status && data.data) {
        this.renderTemplate(data.data)
        this.button.innerHTML = '点击查看更多'
        if (data.data.isEnd) {
          this.isEnd = data.isEnd
          this.button.innerHTML = '已经加载完毕'
          this.button.removeAttribute('on')
        }
      } else {
        this.button.innerHTML = '加载失败'
      }
    })
  }
}

/**
 * getUrl 获取最后拼接好的数据请求 url
 *
 * @param {string} src 原始 url
 * @param {string} pnName 翻页字段名
 * @param {number} pn 页码
 * @returns {string} 拼接好的 url
 */
function getUrl (src, pnName, pn) {
  let url = src
  if (src.indexOf('?') > 0) {
    url += src[src.length - 1] === '?' ? '' : '&'
    url += pnName + '=' + pn
  } else {
    url += '?' + pnName + '=' + pn
  }
  return url
}

/**
 * render dom渲染函数
 *
 * @param {Array} htmls html对象数组
 */
function render (htmls) {
  let fragment = document.createElement('div')
  for (let html of htmls) {
    let node = document.createElement('div')
    node.innerHTML = html
    node.setAttribute('role', 'listitem')
    fragment.appendChild(node)
  }
  this.container.appendChild(fragment)
}
