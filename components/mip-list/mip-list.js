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

const { CustomElement, templates, util, viewer } = MIP
const { fetchJsonp, fetch } = window

const logger = util.log('mip-list')

export default class MIPList extends CustomElement {
  static props = {
    'id': {
      type: String,
      default: ''
    },
    'scope': {
      type: Boolean,
      default: false
    },
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
    }
  }

  static get observedAttributes () {
    return ['src']
  }

  attributeChangedCallback () {
    this.element.isBuilt() && this.refresh()
  }

  build () {
    this.dataScope = this.props.scope && this.props.id || getRandomId()
    this.pnName = this.props['pn-name'] || this.props.pnName
    this.script = this.element.querySelector('script[type="application/json"]')

    this.container = document.createElement('div')
    this.initState()

    this.oldArr = []
    this.createElement = this._createElement.bind(this)

    let waitingNewVal
    let waitingFlag = false

    const render = async (newVal) => {
      waitingFlag = true
      await this.render(newVal)
      while (waitingNewVal !== undefined) {
        let tmpNewVal = waitingNewVal
        waitingNewVal = undefined
        await this.render(tmpNewVal)
      }
      waitingFlag = false
    }

    MIP.watch(this.dataScope, (newVal = []) => {
      if (waitingFlag) {
        waitingNewVal = newVal
        return
      }

      render(newVal)
    })
  }

  /**
   * 构造元素，只会运行一次
   *
   * @override
   */
  firstInviewCallback () {
    let { element, container } = this

    // this.applyFillContent(container)
    element.appendChild(container)

    if (!container.hasAttribute('role')) {
      container.setAttribute('role', 'list')
    }

    if (this.props.src) {
      if (this.props.preload) {
        this.setState()
        this.asyncData(false)
      }
    } else if (this.script) {
      this.syncData(false)
    } else {
      let data = MIP.getData(this.dataScope)
      data && this.render(data)
    }

    this.addEventAction('refresh', () => {
      this.refresh()
    })

    if (this.loadMore === 'manual') {
      this.addEventAction('more', e => {
        this.asyncData(true)
      })
    }
  }

  refresh () {
    this.initState()
    this.setState()
    this.asyncData(false)
  }

  syncData (shouldAppend) {
    let data = util.jsonParse(this.script.textContent.toString())
    this.setData(data && data.items, shouldAppend)
  }

  async asyncData (shouldAppend) {
    if (this.loadMore && this.pending !== 'pending') {
      this.setPendingState('pending')
      try {
        let data = await this.request(this.src)
        this.setState(data)
        if (!data || data.status || !data.data) {
          throw 'data error'
        }
        this.setData(data.data.items, shouldAppend)
        if (data.data.isEnd) {
          this.setPendingState('done')
        } else {
          this.setPendingState('more')
        }
      } catch (e) {
        logger.error(e)
        this.setPendingState('error')
        viewer.eventAction.execute('fetch-error', this.element, e)
      }
    }
  }

  setData (items, shouldAppend = true) {
    if (items && items.length > 0) {
      MIP.setData({
        [this.dataScope]: shouldAppend
          ? append(MIP.getData(this.dataScope), items)
          : items
      })
    }
  }

  initState () {
    this.pn = this.props.pn
    // 有 src 才能够进一步去加载新数据
    this.loadMore = this.props.src &&
      (
        this.props['load-more'] ||
        this.props['has-more'] &&
        'manual'
      ) ||
      false
  }

  setState (data) {
    this.setSrc()
    if (data) {
      this.loadMore = data.data && !data.data.isEnd && this.loadMore || false
    }
  }

  setPendingState (state) {
    this.pending = state
    if (this.button) {
      let text
      switch (state) {
        case 'pending':
          text = '加载中...'
          break
        case 'error':
          text = '加载失败'
          break
        case 'more':
          text = '点击查看更多'
          break
        case 'done':
          text = '已经已经完毕'
          break
      }
      this.button.innerHTML = text
    }
  }

  setSrc () {
    let src = this.props.src
    if (src) {
      let pnName = this.pnName
      let pn = this.pn++
      let params = `?${pnName}=${pn}&`

      if (src.indexOf('?') > 0) {
        this.src = src.replace('?', params)
      } else {
        this.src = src + params
      }
    }
  }

  request (url) {
    let { method, credentials, timeout: time } = this.props
    return (
      method === 'jsonp'
      ? fetchJsonp(url, { timeout: time })
      : Promise.race([fetch(url, { credentials }), timeout(time)])
    ).then(res => {
      if (!res.ok) {
        throw Error(`Fetch request failed: ${url}`)
      }
      return res.json()
    })
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
      add: addPatches.map(patch => patch.node.element),
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
