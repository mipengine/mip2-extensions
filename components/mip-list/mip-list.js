/**
 * @file mip-list 组件
 * @author sekiyika(pengxing@baidu.com)
 */
/* eslint-disable */
import { diff } from './util/diff'
import {
  update,
  isAddPatch,
  isRemovedPatch
} from './util/patch'

import {
  timeout,
  getRandomId,
  append,
  sameData,
  sameText,
  createFindIndex
} from './util/helper'

const { CustomElement, templates, util } = MIP
const { fetchJsonp, fetch } = window

const log = util.log('mip-list')

/**
 * getUrl 获取最后拼接好的数据请求 url
 *
 * @param {string} src 原始 url
 * @param {string} pnName 翻页字段名
 * @param {number} pn 页码
 * @returns {string} 拼接好的 url
 */
// function getUrl (src, pnName, pn) {
//   if (!pnName || !pn) {
//     return
//   }
//   let url = src
//   if (src.indexOf('?') > 0) {
//     url += src[src.length - 1] === '?' ? '' : '&'
//     url += pnName + '=' + pn
//   } else {
//     url += '?' + pnName + '=' + pn
//   }
//   return url
// }

export default class MIPList extends CustomElement {
  static props = {
    'id': {
      type: String,
      default: ''
    },
    // 'scoped': {
    //   type: Boolean,
    //   default: false
    // },
    'src': {
      type: String,
      default: ''
    },
    'method': {
      type: String,
      default: 'jsonp'
    },
    'credentials': {
      type: String,
      default: 'include'
    },
    'timeout': {
      type: Number,
      default: 5000
    },
    // 'items': {
    //   type: String,
    //   default: 'items'
    // },
    'pn-name': {
      type: String,
      default: ''
    },
    'pnName': {
      type: String,
      default: 'pn'
    },
    'pn': {
      type: Number,
      default: 1
    },
    'has-more': {
      type: Boolean,
      default: false
    },
    'load-more': {
      type: String,
      default: 'auto'
    },
    'preload': {
      type: Boolean,
      default: false
    },
    // 'binding': {
    //   type: String,
    //   default: 'always'
    // },
    // 'synchronous-data': {
    //   type: Boolean,
    //   default: false
    // }

    // 'reset-on-refresh': {
    //   type: ''
    // }
  }

  static get observerdAttributes () {
    return ['src']
  }

  attributeChangedCallback () {
    this.refresh()
  }

  build () {
    let { id, src } = this.props
    this.dataScope = id || getRandomId()
    this.src = src
    this.loadMore = this.props['load-more'] ||
       this.props['has-more'] &&
      'manual' ||
      false

    this.oldArr = []
    this.createElement = this._createElement.bind(this)

    let waitingNewVal
    let waitingOldVal
    let waitingFlag = false

    const fn = async (newVal, oldVal) => {
      waitingFlag = true
      await this.render(newVal, oldVal)
      while (waitingNewVal !== undefined && waitingOldVal !== undefined) {
        let tmpNewVal = waitingNewVal
        let tmpOldVal = waitingOldVal
        waitingNewVal = undefined
        waitingOldVal = undefined
        await this.render(tmpNewVal, tmpOldVal)
      }
      waitingFlag = false
    }

    MIP.watch(this.dataScope, (newVal = [], oldVal = []) => {
      if (waitingFlag) {
        waitingNewVal = newVal
        if (waitingOldVal === undefined) {
          waitingOldVal = oldVal
        }
        return
      }

      fn(newVal, oldVal)
    })
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

    if (this.props.src) {
      if (this.loadMore === 'manual' && this.props.preload) {
        this.asyncData()
      }
    } else {
      this.syncData()
    }

    this.addEventAction('refresh', () => {
      this.refresh()
    })

    if (this.loadMore === 'manual') {
      this.addEventAction('more', () => {
        this.asyncData(true)
      })
    }
  }

  refresh () {
    this.src = this.props.src
    this.asyncData(false)
  }

  syncData (shouldAppend) {
    let script = this.element.querySelector('script[type="application/json"]')
    let data = script ? util.jsonParse(script.textContent.toString()) : null
    this.setData(data, shouldAppend)
  }

  async asyncData (shouldAppend) {
    let url = this.getUrl()
    let data = await this.request(url)
    this.setData(data, shouldAppend)
  }

  setData (val, shouldAppend = true) {
    let items = this.getItems(val)

    if (!items) {
      return
    }

    MIP.setData({
      [this.dataScope]: shouldAppend
        ? append(MIP.getData(this.dataScope), items)
        : items
    })
  }

  getItems (data) {
    if (!data) {
      return
    }
    return data.items
    // console.log(this.props.items)
    // let keys = this.props.items.split('.')
    // for (let key of keys) {
    //   data = data[key]
    //   if (!data) {
    //     return
    //   }
    // }
    // return data
  }

  getUrl () {

  }

  request (url) {
    let { method, credentials, timeout: time } = this.props
    return method === 'jsonp'
      ? fetchJsonp(url, { timeout })
      : Promise.race([fetch(url, { credentials }), timeout(time)])
  }

  async render (arr) {
    let newArr = arr.map(data => ({ data }))

    let patches = diff({
      newArr,
      oldArr: this.oldArr,
      compare: sameData,
      findIndex: createFindIndex('data')
    })

    if (!patches.length) {
      return
    }

    let addPatches = patches.filter(isAddPatch)
    let removedPatches = patches.filter(isRemovedPatch)

    if (addPatches.length) {
      await Promise.all(
        addPatches.map(async patch => {
          let [html] = await this.compile([ patch.node.data ])
          patch.node.text = html
        })
      )
    }

    update({
      patches,
      parent: this.container,
      oldArr: this.oldArr,
      createElement: this.createElement
    })

    util.customEmit(document, 'dom-change', {
      add: addPatches,
      removed: removedPatches.map(patch => patch.node.element)
    })
  }

  /**
   * 将数据列表编译成 HTML String List
   *
   * @param {Object} data 渲染数据
   * @param {Promise.<Array.<string>>} 异步 HTML String 列表
   */
  compile (arr) {
    return templates.render(this.element, arr)
  }

  _createElement (html) {
    let node = document.createElement('div')
    node.setAttribute('role', 'listitem')
    node.innerHTML = html
    return node
  }
}
