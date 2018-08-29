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

let filter = 'all'

let filterKey = 'mipFilterKey'

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
    let {
      element
    } = this
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
    let {
      filterWrap,
      itemWrap
    } = opt
    this.opt = opt

    // opt opt.filterWrap opt.itemWrap必须被定义
    if (!opt || !filterWrap || !itemWrap) {
      return
    }

    opt.mobileWidth = opt.mobileWidth || 767
    opt.emptyTip = opt.emptyTip || '没有符合的内容'

    /**
     * shoot: on mobile when filter btn is clicked.
     * slide up or down the whole filter.
     */
    this.toggleFilter = function () {
      let listWrap = filterWrap.querySelector('.filter-list')
      // hide and show filter list only on wise
      if (viewport.getWidth() <= opt.mobileWidth) {
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
          let height = getComputedStyle(listWrap).height
          // target height acquired, now start the animation
          util.css(listWrap, {
            height: '0px',
            transition: 'height 0.3s'
          })
          setTimeout(function () {
            // trick: in setTimeout, or there won't be any animation
            listWrap.style.height = height
          }, 10)
        }
        customUtil.toggleClass(listWrap, 'show')
      }
    }

    // add click event to all filters when clicked, select the filter,
    // if wise, collapse filter list.
    let self = this

    util.event.delegate(opt.filterWrap, '.filter-link', 'click', function () {
      self.filterSelect(this)
    })
    // add click event to filter result, which show only on wise.
    // when clicked, uncollapse and collapse filter list.
    opt.filterWrap.querySelector('.filter-result').addEventListener('click', self.toggleFilter)
    // opt.filterWrap.querySelector('.filter-result').addEventListener('click', self.toggleFilter)
  }

  /**
   * shoot: at first time,
   * add filter color and text to default-"none"
   */
  init () {
    filter = hash.get(filterKey)
    this.setHash(filter)
    let filterTarget = this.opt.filterWrap.querySelector('[data-filtertype="' + filter + '"]')
    filterTarget = filterTarget || this.opt.filterWrap.querySelector('[data-filtertype="all"]')
    this.filterSelect(filterTarget)
  }

  /**
   * @param {string} setValue
   * 修改url
   */
  setHash (setValue) {
    let hasTreeKeys = Object.keys(hash.hashTree)
    let hashKeys = []
    if (hasTreeKeys.length > 0) {
      for (let key of hasTreeKeys) {
        key !== filterKey && hash.get(key) && hashKeys.push(key + '=' + hash.get(key))
      }
    }

    hashKeys.push(filterKey + '=' + setValue)
    window.location.hash = '&' + hashKeys.join('&')
    hash.refreshHashTree()
  }

  /**
   * @param {Object} target HTML Element
   * shoot: when a filter is clicked.
   * add filter color and text to selected one.
   */
  filterSelect (target) {
    let oldEle = this.opt.filterWrap.querySelector('.active') || ''
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
    this.opt.filterWrap.querySelector('.filter-result').innerText = this.opt.filterText + text
    // in wise, when select, collapse filter
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
  applyFilter (filter) {
    let num = 0
    // hack: arr.forEach() cannot be used in uc&qq browser
    for (let item of this.opt.itemWrap.querySelectorAll('.filter-item')) {
      if (item.dataset.filtertype.match(customUtil.containReg(filter)) || filter === 'all') {
        num++
        item.style.display = 'block'
      } else {
        item.style.display = 'none'
      }
    }
    if (!num) {
      // no item can be shown, add "no item" text
      if (!this.opt.itemWrap.querySelector('.filter-emptytip')) {
        let emptyTip = util.dom.create('<div></div>')
        customUtil.addClass(emptyTip, 'filter-emptytip')
        emptyTip.innerHTML = this.opt.emptyTip
        this.opt.itemWrap.appendChild(emptyTip)
      }
    } else {
      let emptyTip = this.opt.itemWrap.querySelector('.filter-emptytip')
      if (emptyTip) {
        this.opt.itemWrap.removeChild(emptyTip)
      }
    }
    this.setHash(filter)
    viewport.setScrollTop(0)
  }
}
