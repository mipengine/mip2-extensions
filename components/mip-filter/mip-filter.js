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
  // used multiple times
  containReg (txt) {
    return new RegExp('(\\s+|^)' + txt + '(\\s+|$)')
  },
  // check if dom has certain class
  hasClass (ele, cls) {
    return ele.className.match(this.containReg(cls))
  },
  // add certain class to dom
  addClass (ele, cls) {
    if (this.hasClass(ele, cls)) {
      return
    }
    ele.className = (ele.className + ' ' + cls).trim()
  },
  // remove certain class from dom
  removeClass (ele, cls) {
    if (!this.hasClass(ele, cls)) {
      return
    }
    ele.className = ele.className.replace(this.containReg(cls), ' ').trim()
  },
  // toggle certain class of dom
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
   * shoot: at first time,
   * add filter color and text to default-"none"
   */
  init () {
    const filterValue = hash.get(FILTER_KEY) || 'all'
    let filterTarget = this.filterWrap.querySelector('[data-filtertype="' + filterValue + '"]')
    filterTarget = filterTarget || this.filterWrap.querySelector('[data-filtertype="all"]')
    this.setHash(filterValue)
    this.filterSelect(filterTarget)

    // add click event to all filters when clicked
    let self = this
    util.event.delegate(this.filterWrap, '.filter-link', 'click', function () {
      self.filterSelect(this)
    })
    // add click event to filter result, which show only on mobile.
    // when clicked, uncollapse and collapse filter list.
    if (viewport.getWidth() <= this.opt.mobileWidth) {
      this.filterWrap.querySelector('.filter-result').addEventListener('click', () => {
        this.toggleFilter()
      })
    }
  }

  /**
   * shoot: on mobile when filter btn is clicked.
   * slide up or down the whole filter.
   */
  toggleFilter () {
    const listWrap = this.filterWrap.querySelector('.filter-list')
    if (customUtil.hasClass(listWrap, 'show')) {
      // hide filter list
      listWrap.style.height = '0px'
    } else {
      // show filter list
      util.css(listWrap, {
        transition: 'none',
        height: 'auto',
        WebkitTransition: 'none'
      })

      // target height acquired, now start the animation
      const height = window.getComputedStyle(listWrap).height
      util.css(listWrap, {
        height: '0px',
        transition: 'height 0.3s'
      })

      setTimeout(() => {
        // trick: in setTimeout, or there won't be any animation
        listWrap.style.height = height
      }, 10)
    }
    customUtil.toggleClass(listWrap, 'show')
  }

  /**
   * @param {string} setValue
   *
   * 修改url
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
   * @param {Object} target HTML Element
   *
   * shoot: when a filter is clicked.
   * add filter color and text to selected one.
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
    // in mobile, when select, collapse filter
    if (viewport.getWidth() <= this.opt.mobileWidth && oldEle) {
      this.toggleFilter()
    }
    this.applyFilter(newEle.dataset.filtertype)
  }

  /**
   * Get Node Text
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
   * @param {string} filter
   * shoot: when filter btn is clicked.
   * hide items that cant pass the filter.
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
    // no item can be shown, add "no item" text
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
