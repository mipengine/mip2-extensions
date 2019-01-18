/**
 * @file mip-filter.js 筛选组件
 * @author liangjiaying@baidu.com
 */
import './mip-filter.less'

let {
  CustomElement,
  util,
  hash,
  viewport
} = MIP

const FILTER_KEY = 'mipFilterKey'

const customUtil = {
  containReg (txt) {
    return new RegExp('(\\s+|^)' + txt + '(\\s+|$)')
  },
  hasClass (ele, cls) {
    return ele.className.match(this.containReg(cls))
  },
  addClass (ele, cls) {
    if (this.hasClass(ele, cls)) {
      return
    }
    ele.className = (ele.className + ' ' + cls).trim()
  },
  removeClass (ele, cls) {
    if (!this.hasClass(ele, cls)) {
      return
    }
    ele.className = ele.className.replace(this.containReg(cls), ' ').trim()
  },
  toggleClass (ele, cls) {
    if (this.hasClass(ele, cls)) {
      this.removeClass(ele, cls)
    } else {
      this.addClass(ele, cls)
    }
  }
}

export default class MipFilter extends CustomElement {
  build () {
    const element = this.element
    let filter = new Filter({
      filterWrap: element.querySelector(element.getAttribute('mip-filter-filterWrap')),
      itemWrap: element.querySelector(element.getAttribute('mip-filter-itemWrap')),
      filterText: element.getAttribute('mip-filter-filterText') || ''
    })
    filter.init()
  }
}

class Filter {
  constructor (opt = {}) {
    if (!opt || !opt.filterWrap || !opt.itemWrap) {
      return
    }
    opt.mobileWidth = opt.mobileWidth || 767
    opt.emptyTip = opt.emptyTip || '没有符合的内容'

    this.opt = opt
    this.filterWrap = opt.filterWrap
    this.itemWrap = opt.itemWrap
  }

  /**
   * 初始化当前 filter
   */
  init () {
    const filterValue = hash.get(FILTER_KEY) || 'all'
    let filterTarget = this.filterWrap.querySelector('[data-filtertype="' + filterValue + '"]')
    filterTarget = filterTarget || this.filterWrap.querySelector('[data-filtertype="all"]')
    this.setHash(filterValue)
    this.filterSelect(filterTarget)

    let self = this
    util.event.delegate(this.filterWrap, '.filter-link', 'click', function () {
      self.filterSelect(this)
    })
    // 仅在移动设备下展现筛选结果
    if (viewport.getWidth() <= this.opt.mobileWidth) {
      this.filterWrap.querySelector('.filter-result').addEventListener('click', () => {
        this.toggleFilter()
      })
    }
  }

  /**
   * 点击筛选结果时，展开/收起筛选列表
   */
  toggleFilter () {
    const listWrap = this.filterWrap.querySelector('.filter-list')
    if (customUtil.hasClass(listWrap, 'show')) {
      listWrap.style.height = 0
    } else {
      util.css(listWrap, {
        transition: 'none',
        height: 'auto',
        WebkitTransition: 'none'
      })

      // 收起动画
      const height = window.getComputedStyle(listWrap).height
      util.css(listWrap, {
        height: 0,
        transition: 'height 0.3s'
      })

      setTimeout(() => {
        // trick: 使用 setTimeout 设置动画，否则动画不执行
        listWrap.style.height = height
      }, 10)
    }
    customUtil.toggleClass(listWrap, 'show')
  }

  /**
   * 修改 url hash
   *
   * @param {string} setValue filter value
   */
  setHash (setValue) {
    let hasTreeKeys = Object.keys(hash.hashTree)
    let hashKeys = []
    if (hasTreeKeys.length > 0) {
      for (let key of hasTreeKeys) {
        key !== FILTER_KEY && hash.get(key) && hashKeys.push(key + '=' + hash.get(key))
      }
    }

    hashKeys.push(FILTER_KEY + '=' + setValue)
    window.location.hash = '&' + hashKeys.join('&')
    hash.refreshHashTree()
  }

  /**
   * 选择筛选项
   *
   * @param {Object} target HTML Element
   */
  filterSelect (target) {
    let oldEle = this.filterWrap.querySelector('.active') || ''
    let newEle = target
    if (oldEle) {
      customUtil.removeClass(oldEle, 'active')
    }
    customUtil.addClass(target, 'active')
    let text = this.getText(newEle)
    text = text.replace(/\s+/g, '')
    if (text === '查看全部') {
      text = '无'
    }
    this.filterWrap.querySelector('.filter-result').innerText = this.opt.filterText + text
    // 移动设备中，点击选中筛选项后，自动折叠筛选列表
    if (viewport.getWidth() <= this.opt.mobileWidth && oldEle) {
      this.toggleFilter()
    }
    this.applyFilter(newEle.dataset.filtertype)
  }

  /**
   * 获取 Dom 文本
   *
   * @param {Object} node HTML Element
   * @returns {string} node Text
   */
  getText (node) {
    let output = ''
    let childs = node.childNodes || []
    for (let node of childs) {
      if (node.nodeType === 3) {
        output = output.concat(node.textContent)
      }
    }
    return output
  }

  /**
   * 筛选功能
   *
   * @param {string} selectedFilter 用户点击的筛选项
   */
  applyFilter (selectedFilter) {
    const filterItems = this.itemWrap.querySelectorAll('.filter-item')
    let filterMatched = false
    for (let item of filterItems) {
      if (item.dataset.filtertype.match(customUtil.containReg(selectedFilter)) || selectedFilter === 'all') {
        filterMatched = true
        item.style.display = 'block'
      } else {
        item.style.display = 'none'
      }
    }
    // 没有内容展示时提示
    let emptyTip = this.itemWrap.querySelector('.filter-emptytip')
    if (!emptyTip) {
      emptyTip = util.dom.create('<div></div>')
      customUtil.addClass(emptyTip, 'filter-emptytip')
      emptyTip.innerHTML = this.opt.emptyTip
      this.itemWrap.appendChild(emptyTip)
    }
    if (filterMatched) {
      this.itemWrap.removeChild(emptyTip)
    }
    this.setHash(selectedFilter)
    viewport.setScrollTop(0)
  }
}
