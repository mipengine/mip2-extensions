/**
 * @file mip-list 组件
 * @author sekiyika(pengxing@baidu.com)
 */

const { CustomElement, templates, util } = MIP
const { fetchJsonp } = window

const log = util.log('mip-list')

export default class MIPList extends CustomElement {
  constructor (...args) {
    super(...args)

    this.sanitize()

    this.pnName = this.element.getAttribute('pn-name') ||
      this.element.getAttribute('pnName') ||
      'pn'
    this.pn = this.element.getAttribute('pn') || 1
    this.rnName = this.element.getAttribute('rn-name') ||
      this.element.getAttribute('rnName') || 'rn'
    this.rn = this.element.getAttribute('rn') || 1
    this.timeout = this.element.getAttribute('timeout') || 5000
    this.src = this.element.getAttribute('src') || ''
    this.endText = this.element.getAttribute('end-text') ||
      this.element.getAttribute('endText') || '已经加载完毕'
  }

  /**
   * shortcut for hasAttribute
   *
   * @param {string} name attr name
   * @returns {boolean} has attribute
   */
  has (name) {
    return this.element.hasAttribute(name)
  }

  /**
   * 校验参数
   */
  sanitize () {
    if (this.has('pnName')) {
      log.warn(this.element, '[Deprecated] pnName 属性不允许再使用，请使用 \'pn-name\' 代替')
    }
  }

  /**
   * 构造元素，只会运行一次
   *
   * @override
   */
  firstInviewCallback () {
    this.container = document.createElement('div')
    let { element, container } = this

    // this.applyFillContent(container)
    element.appendChild(container)

    if (!container.hasAttribute('role')) {
      container.setAttribute('role', 'list')
    }

    // 同步配置数据
    if (this.has('synchronous-data')) {
      let script = element.querySelector('script[type="application/json"]')
      let data = script ? util.jsonParse(script.textContent.toString()) : null
      this.renderTemplate(data)
      return
    }

    // 异步获取数据
    if (!this.src) {
      log.error(this.element, 'mip-list 的 src 属性不能为空')
      return
    }

    // 有查看更多属性的情况
    if (this.has('has-more')) {
      this.addEventAction('more', e => {
        this.button = e.target
        this.pushResult(this.src)
      })
    }

    if (this.has('preload')) {
      let url = getUrl(this.src, this.pnName, this.pn++, this.rnName, this.rn, this.dataParams)
      fetchJsonp(url, { timeout: this.timeout })
        .then(res => res.json())
        .then(data => {
          if (!data.status && data.data) {
            this.renderTemplate(data.data)
          }
        })
    }
  }

  /**
   * renderTemplate 获取模板
   *
   * @param {Object} data 渲染数据
   */
  renderTemplate (data) {
    if (!data || !data.items || !(data.items instanceof Array)) {
      log.error(this.element, data, '数据不符合规范')
      return
    }

    templates
      .render(this.element, data.items)
      .then(html => {
        this.render(html)
      })
  }

  /**
   * pushResult push 结果函数
   *
   * @param {string} src ajax 请求的 url
   */
  pushResult (src) {
    if (this.isEnd) {
      return
    }
    this.dataParams = this.getDataSet()
    this.button.innerHTML = '加载中...'

    let url = getUrl(src, this.pnName, this.pn++, this.rnName, this.rn, this.dataParams)
    fetchJsonp(url, { timeout: this.timeout })
      .then(res => res.json())
      .then(data => {
        if (data.status || !data.data) {
          this.button.innerHTML = '加载失败'
          return
        }
        // 根据异步数据更新自定义data-XX
        this.updateDataSet(data.data)

        this.renderTemplate(data.data)
        this.button.innerHTML = '点击查看更多'

        if (data.data.isEnd) {
          this.isEnd = data.isEnd
          if (this.endText === 'empty') {
            this.button.innerHTML = ''
            this.button.className = 'mip-list-more'
          } else {
            this.button.innerHTML = this.endText
          }
          this.button.removeAttribute('on')
        }
      })
  }

  /**
   * render dom 渲染函数
   *
   * @param {Array} htmls html 对象数组
   */
  render (htmls) {
    let fragment = document.createDocumentFragment()
    htmls.forEach(html => {
      let node = document.createElement('div')
      node.innerHTML = html
      node.setAttribute('role', 'listitem')
      fragment.appendChild(node)
    })
    this.container.appendChild(fragment)
  }

  /**
 * getDataSet 获取所有 data-xx 自定义属性
 */
  getDataSet () {
    let dataset = this.element.dataset
    let dataParams = ''

    if (Object.getOwnPropertyNames(dataset).length > 0) {
      for (let key in dataset) {
        dataParams += '&' + key + '=' + dataset[key]
      }
    }
    return dataParams
  }

  /**
 * updateDataSet
 *
 * @param {Object} res 异步返回数据
 */
  updateDataSet (res) {
    let dataset = this.element.dataset
    if (Object.getOwnPropertyNames(dataset).length > 0) {
      for (let i in dataset) {
        for (let j in res) {
          if (i === j) {
            dataset[i] = res[j]
          }
        }
      }
    }
  }
}

/**
 * getUrl 获取最后拼接好的数据请求 url
 *
 * @param {string} src 原始 url
 * @param {string} pnName 翻页字段名
 * @param {number} pn 页码
 * @param {string} rnName 翻页步长字段名
 * @param {number} rn 步长
 * @param {string} dataParams 自定义data-xx参数
 * @returns {string} 拼接好的 url
 */
function getUrl (src, pnName, pn, rnName, rn, dataParams) {
  if (!pnName || !pn) {
    return
  }
  let url = src
  if (src.indexOf('?') > 0) {
    url += src[src.length - 1] === '?' ? '' : '&'
    url += pnName + '=' + pn
    url += '&' + rnName + '=' + rn
  } else {
    url += '?' + pnName + '=' + pn
    url += '&' + rnName + '=' + rn
  }
  if (dataParams) {
    url += dataParams
  }
  return url
}
