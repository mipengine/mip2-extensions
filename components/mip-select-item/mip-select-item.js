import './index.less'

const {util} = MIP
const { fetchJsonp } = window

/**
 * Make height transiton for element that has unknown height.
 * height transiton from 0px/40px to whatever height element will be.
 *
 * author&maintainer liangjiaying<jiaojiaomao220@163.com>
 *
 * @param  {Object} opt options
 * @example
 * {
 *   "ele": document.getElementById('id1'), // target DOM
 *   "type": "fold",                  // "fold" or "unfold"
 *   "transitionTime": "0.3",         // seconds, animation time
 *   "tarHeight": "140px",            // DOM height when animation ends
 *   "oriHeight": "20px",             // DOM height when animation begins
 *   "cbFun": function() {}.bind()  //callback, exec after animation
 * }
 */
function heightAni (opt) {
  let element = opt.ele
  let type = opt.type

  if (!type || !element) {
    return
  }

  let transitionTime = isNaN(opt.transitionTime) ? 0.24 : Math.min(parseFloat(opt.transitionTime), 1)
  let oriHeight = (opt.oriHeight !== undefined ? opt.oriHeight : getComputedStyle(element).height)
  let tarHeight
  let cbFun = opt.cbFun || function () {}

  if (type === 'unfold') {
    if (opt.tarHeight !== undefined) {
      tarHeight = opt.tarHeight
    } else {
      element.style.transition = 'height 0s'
      element.style.height = 'auto'
      tarHeight = getComputedStyle(element).height
    }

    setTimeout(() => {
      element.style.transition = 'height 0s'
      element.style.height = 'auto'
    }, transitionTime * 1000)
  } else if (type === 'fold') {
    tarHeight = opt.tarHeight || 0
  }

  element.style.height = oriHeight

  // 开始动画
  setTimeout(() => {
    element.style.transition = 'height ' + transitionTime + 's'
    element.style.height = tarHeight
  }, 10)

  // 动画结束后，执行 callback
  setTimeout(cbFun, transitionTime * 1000)
}

function hasClass (elements, cName) {
  return !!elements.className.match(new RegExp('(\\s|^)' + cName + '(\\s|$)'))
}

function addClass (elements, cName) {
  if (!hasClass(elements, cName)) {
    elements.className += ' ' + cName
  } else {
    console.error('未找到' + cName + '的class')
  }
}

function removeClass (elements, cName) {
  if (hasClass(elements, cName)) {
    elements.className = elements.className.replace(new RegExp('(\\s|^)' + cName + '(\\s|$)'), ' ')
  } else {
    console.error('未找到' + cName + '的class')
  }
}

function isEmpty (value) {
  return (!value || value === '')
}

export default class MIPSelectItem extends MIP.CustomElement {
  build () {
    this.targetDom = {}
    this.modal = ''
    this.selects = this.element.querySelectorAll('.mip-select-item')
    this.selectFixedPopup = this.element.querySelector('.select-fixed-popup')
    this.selectWrapper = this.element.querySelector('.select-wrapper')
    // 是否需要组件置顶（组件固定在页面顶部）
    this.isTop = this.element.getAttribute('is-top') || 'true'
    // 是否需要背景蒙版（显示下拉列表时）
    this.isBackground = this.element.getAttribute('is-background') || 'true'
    // 下拉列表框是否有切换tab
    this.isSelectTab = 'false'
    // 下拉列表框是否有input输入框
    this.isInput = 'false'
    // 添加tab点击事件
    this.buildClickEvent()
    // 获取数据
    this.param = this.getData()
    console.log(this.param)
    // 添加背景蒙版的点击事件
    if (this.isBackground === 'true') {
      this.clickBackground()
    }
    MIP.watch('areaType', (newVal) => {
      this.param.areaType = newVal
      this.getAreaTypeHtml(newVal)
      this.buildMoreItemClick()
    })
    if (!this.param.areaUnits) {
      return false
    }
    // let wrapper = document.createElement('div')
    // wrapper.classList.add('wrapper')
    // wrapper.innerHTML = `
    //   <h1>MIP 2.0 component example</h1>
    //   <h3>This is my first custom component !</h3>
    // `
    // this.element.appendChild(wrapper)
  }

  getData () {
    let params = {
      term: '',
      cateUrl: '',
      typeUrl: '',
      ab: '',
      sab: '',
      ssab: '',
      monter: '',
      hostUrl: '',
      district_1st: '',
      district_2nd: '',
      district_3rd: ''
    }
    let script = this.element.querySelector('script[type="application/json"]')
    if (script) {
      return Object.assign(params, util.jsonParse(script.textContent.toString()))
    }
    return params
  }

  buildClickEvent () {
    let selects = this.selects
    selects.forEach((select, index) => this.clickEvent(select))
  }

  clickEvent (select) {
    let element = this.element
    select.addEventListener('click', () => {
      // 删除所有选中样式
      this.removeAllClass('select-active')
      // 获取需要显隐的下拉modal列表
      this.modal = select.getAttribute('modal')
      this.targetDom = element.querySelector('.' + this.modal)
      // 获取modal显示标识
      let expend = select.getAttribute('expend')
      // 下拉列表框是否有切换tab
      this.isSelectTab = select.getAttribute('is-select-tab') || 'false'
      // 下拉列表框是否有input输入框
      this.isInput = select.getAttribute('is-input') || 'false'
      // 下拉列表是否为区域（三级联动）
      this.isDistrict = select.getAttribute('is-district') || 'false'
      // 下拉列表是否为类型（二级联动）
      this.isIndustry = select.getAttribute('is-industry') || 'false'
      // 二级联动或三级联动的请求地址
      this.fetchUrl = select.getAttribute('fetch-url') || ''
      this.term = select.getAttribute('term') || ''
      // 是否有【清空】按钮
      this.isClear = select.getAttribute('is-clear') || 'false'
      // 是否有图标显示
      this.isIcon = select.getAttribute('is-icon') || 'false'
      // 是否为【更多】下拉列表
      this.isMore = select.getAttribute('is-more') || 'false'
      // 【更多】列表是否有切换面积按钮
      this.isSwitch = select.getAttribute('is-switch') || 'false'
      // 隐藏除了当前选项卡的其他下modal列表
      this.hideAllSelectModal()
      if (expend === 'close') {
        // 组件置顶
        if (this.isTop === 'true') {
          this.stickyNav()
        }
        // 设置标识
        select.setAttribute('expend', 'open')
        // 增加选中样式
        addClass(select, 'select-active')
        // 增加背景蒙版样式
        if (this.isBackground === 'true') {
          addClass(this.selectFixedPopup, 'select-fixed-popup-active')
        }
        // 如果有图标显示，需要切换成对应的图标
        if (this.isIcon === 'true') {
          MIP.setData({
            orderIcon: this.param.orderIcons[1]
          })
        }
        if (this.isMore === 'true' && this.isSwitch === 'true') {
          MIP.setData({
            areaUnit: this.param.areaUnits[0].unit,
            areaOtherUnit: this.unitStringHandle(this.param.areaUnits[1].unit)
          })
        }
        this.showSelectModal(this.targetDom)
        // 添加一些点击事件监听
        this.addClickEvents()
      } else {
        // 组件置顶还原
        if (this.isTop === 'true') {
          this.restore()
        }
        // 设置标识
        select.setAttribute('expend', 'close')
        // 删除背景蒙版式
        if (this.isBackground === 'true') {
          removeClass(this.selectFixedPopup, 'select-fixed-popup-active')
        }
        this.hideSelectModal(this.targetDom)
        // 如果有图标显示，需要切换成对应的图标
        if (this.isIcon === 'true') {
          MIP.setData({
            orderIcon: this.param.orderIcons[0]
          })
        }
      }
    })
  }

  /**
   * 添加一些点击事件监听
   */
  addClickEvents () {
    let element = this.element
    // 下拉列表有子tab切换
    if (this.isSelectTab === 'true') {
      this.selectTabs = element.querySelectorAll('.' + this.modal + ' .select-area-tab-item')
      this.buildSelectItemTabClickEvent()
    }
    // 下拉列表有输入框的，需要添加确定按钮的点击事件
    if (this.isInput === 'true') {
      this.clickSearchButton()
    }
    // 地区三级联动
    if (this.isDistrict === 'true') {
      this.buildClickRegion()
    }
    // 相关分类的二级联动
    if (this.isIndustry === 'true') {
      this.buildIndustryItemClick()
    }
    // 切换单位
    if (this.isSwitch === 'true') {
      this.switchUnit()
    }
    // 【更多】下拉列表的一些监听事件
    if (this.isMore === 'true') {
      // 清空按钮监听事件
      this.buildClearClick()
      // 多选项点击事件
      this.buildMoreItemClick()
      // input框聚焦事件
      this.buildMoreItemInputClick()
      // 确定按钮点击事件
      this.buildMoreSureBtnClick()
      // 根据手机类型，增加对应class
      this.initMoreItemClass()
    }
  }

  initMoreItemClass () {
    let element = this.element
    let moreItems = element.querySelectorAll(`.more-item-active`)
    if (!moreItems) {
      console.error('未找到选中项')
      return false
    }
    moreItems.forEach((item, index) => {
      if (util.platform.isIos()) {
        removeClass(item, 'more-item-active')
        addClass(item, 'more-item-active-ios')
      }
    })
  }

  /*
   * 展示对应选项卡的下拉modal列表
   * @param ele
   */
  showSelectModal (ele) {
    util.css(this.selectWrapper, 'display', 'flex')
    util.css(ele, 'display', 'block')
    heightAni({
      ele: ele,
      type: 'unfold',
      oriHeight: 0,
      cb: function () {
        util.css(ele, 'height', '')
      }
    })
  }

  /*
   * 隐藏对应选项卡的下拉modal列表
   * @param ele
   */
  hideSelectModal (ele) {
    util.css(ele, 'height', '0')
  }

  /*
   * 隐藏除当前选项卡的下拉modal列表
   * @param currentModal
   */
  hideAllSelectModal () {
    let element = this.element
    this.selects.forEach((select) => {
      let modal = select.getAttribute('modal')
      let targetDom = element.querySelector('.' + modal)
      if (modal !== this.modal) {
        this.hideSelectModal(targetDom)
        select.setAttribute('expend', 'close')
      }
    })
  }

  /*
   * 删除所有的class
   * @param className
   */
  removeAllClass (className, ele) {
    let elements = {}
    if (ele) {
      elements = this.element.querySelectorAll(`.${ele} .${className}`)
    } else {
      elements = this.element.querySelectorAll(`.${className}`)
    }
    elements.forEach((element) => {
      removeClass(element, className)
    })
  }

  /*
   * 组件置顶
   */
  stickyNav () {
    let element = this.element
    util.css(element, {
      position: 'fixed',
      top: 0,
      'z-index': 9999,
      width: '100%'
    })
  }

  /**
   * 组件置顶恢复
   */
  restore () {
    let element = this.element
    util.css(element, {
      position: 'relative',
      width: '100%',
      'z-index': 1
    })
  }

  switchUnit () {
    let switchBtn = this.element.querySelector(`.switch`)
    if (!switchBtn) {
      return false
    }
    switchBtn.addEventListener('click', () => {
      let areaType = switchBtn.getAttribute('type')
      let type = ''
      switch (areaType) {
        case '1':
          type = '2'
          break
        case '2':
          type = '1'
          break
      }
      switchBtn.setAttribute('type', type)
      MIP.setData({areaType: type})
    })
  }

  unitStringHandle (unit) {
    return unit.replace('万', '')
  }

  /*
   * 切换面积单位，获取相关html
   * @param areaType
   */
  getAreaTypeHtml (areaType = 1) {
    let areaUnits = {}
    let areaOtherUnits = {}
    let element = this.element
    switch (areaType) {
      case '1':
        areaUnits = this.param.areaUnits[0]
        areaOtherUnits = this.param.areaUnits[1]
        break
      case '2':
        areaUnits = this.param.areaUnits[1]
        areaOtherUnits = this.param.areaUnits[0]
        break
      default:
        areaUnits = this.param.areaUnits[0]
        areaOtherUnits = this.param.areaUnits[1]
    }
    let html = '<div class="more-item" data-li="area-li"><span class="more-item-bgc"></span>全部</div>'
    if (util.platform.isIos()) {
      html = '<div class="more-item more-item-active-ios" data-li="area-li"><span class="more-item-bgc"></span>全部</div>'
    }
    if (util.platform.isAndroid()) {
      html = '<div class="more-item more-item-active" data-li="area-li"><span class="more-item-bgc"></span>全部</div>'
    }
    let term = areaUnits.term.split(',')
    let otherTerm = areaOtherUnits.term.split(',')
    element.querySelector(`.${this.modal} input[name=${otherTerm[0]}]`).setAttribute('name', term[0])
    element.querySelector(`.${this.modal} input[name=${otherTerm[1]}]`).setAttribute('name', term[1])
    for (let values of areaUnits.value) {
      let itemValue = ''
      if (values.includes('-')) {
        let val = values.split('-')
        if (val[0] !== '0') {
          itemValue += `${term[0]}${val[0]}`
        }
        if (val[1] !== '0') {
          itemValue += `${term[1]}${val[1]}`
        }
      } else {
        itemValue += `${term[0]}${values}`
      }
      html += `<div class="more-item" value="${itemValue}" data-li="area-li"><span class="more-item-bgc"></span>${values}${areaUnits.unit}</div>`
    }
    element.querySelector('.area_list').innerHTML = html
    MIP.setData({areaOtherUnit: this.unitStringHandle(areaOtherUnits.unit), areaUnit: areaUnits.unit})
  }

  /**
   * 点击背景蒙版事件
   */
  clickBackground () {
    let element = this.element
    let popup = element.querySelector('.mip-select-fixed-popup')
    popup.addEventListener('click', () => {
      this.selects.forEach((select, index) => {
        // 组件置顶还原
        if (this.isTop === 'true') {
          this.restore()
        }
        // 设置标识
        select.setAttribute('expend', 'close')
        // 删除背景蒙版式
        if (this.isBackground === 'true') {
          removeClass(this.selectFixedPopup, 'select-fixed-popup-active')
        }
        this.hideSelectModal(this.targetDom)
        this.removeAllClass('select-active')
        // 如果有图标显示
        if (this.isIcon === 'true') {
          MIP.setData({
            orderIcon: this.param.orderIcons[0]
          })
        }
      })
    })
  }

  /*
   * 添加下拉列表子tab的点击事件监听
   */
  buildSelectItemTabClickEvent () {
    let element = this.element
    if (!this.selectTabs) {
      return false
    }
    this.targetTab = element.querySelector('.' + this.modal + ' .select-area-tab-item-active').getAttribute('tab')
    this.selectTabs.forEach((tab, index) => {
      tab.addEventListener('click', () => {
        this.targetTab = tab.getAttribute('tab')
        this.removeSelectItemAllActiveTab()
        addClass(element.querySelector('.' + this.targetTab), 'select-area-tab-show')
        addClass(tab, 'select-area-tab-item-active')
        // 下拉列表有输入框的，需要添加确定按钮的点击事件
        if (this.isInput === 'true') {
          this.clickSearchButton()
        }
      })
    })
  }

  /*
   * 移除下拉列表子tab的选中状态
   */
  removeSelectItemAllActiveTab () {
    this.selectTabs.forEach((tab, index) => {
      let targetTab = tab.getAttribute('tab')
      removeClass(tab, 'select-area-tab-item-active')
      removeClass(this.element.querySelector('.' + targetTab), 'select-area-tab-show')
    })
  }

  /**
   * tab下拉列表里的确定按钮点击事件
   */
  clickSearchButton () {
    let element = this.element
    let button = {}
    let inputs = []
    if (this.isSelectTab === 'true') {
      // 如果有子tab选项卡，需要对应到子tab选项卡里面的确定按钮和输入框
      button = element.querySelector('.' + this.targetTab + ' .mip-sure-btn')
      inputs = element.querySelectorAll('.' + this.targetTab + ' input')
    } else {
      button = element.querySelector('.' + this.modal + ' .mip-sure-btn')
      inputs = element.querySelectorAll('.' + this.modal + ' input')
    }
    if (!button) {
      console.error('未找到确认按钮')
      return false
    }
    if (!inputs) {
      console.error('未找到输入框')
      return false
    }
    button.addEventListener('click', () => {
      let xinTerm = ''
      for (let input of inputs) {
        let su = input.getAttribute('url')
        let value = input.value
        if (value === '' || !value) {
          continue
        }
        // 清除url上其他tab的参数
        if (this.isSelectTab === 'true') {
          this.clearOtherTabSearchValue()
        }
        xinTerm += (su + '' + value)
        let nd = this.param.term.match(new RegExp(su + '([0-9.]*)'))
        if (nd) {
          this.param.term = this.param.term.replace(nd[0], '')
        }
      }
      let href = this.splitUrlStr(xinTerm)
      window.location.replace(href)
    })
  }

  /**
   * 清除其他下拉列表的子tab下input的值
   */
  clearOtherTabSearchValue () {
    let element = this.element
    for (let selectTab of this.selectTabs) {
      let tab = selectTab.getAttribute('tab')
      if (tab === this.targetTab) {
        continue
      }
      let otherTabInputs = element.querySelectorAll('.' + tab + ' input')
      for (let otherInput of otherTabInputs) {
        let su = otherInput.getAttribute('url')
        let nd = this.param.term.match(new RegExp(su + '([0-9.]*)'))
        if (nd) {
          this.param.term = this.param.term.replace(nd[0], '')
        }
      }
    }
  }

  /*
   * 拼接跳转url字符串
   * @param xinTerm
   * @returns {string|string}
   */
  splitUrlStr (xinTerm = '', ab = this.param.ab, sab = this.param.sab, ssab = this.param.ssab) {
    let href = this.param.hostUrl
    if (isEmpty(ab) && isEmpty(sab) && isEmpty(ssab)) {
      href += this.param.typeUrl + '/' + this.param.cateUrl + this.param.term + xinTerm
    } else {
      let abname = ab
      if (sab) {
        abname = ab + '-' + sab
      }
      if (this.param.sab) {
        abname = abname + '-' + ssab
      }
      if (abname) {
        href += abname + '/'
      }
      href += this.param.typeUrl + '/' + this.param.cateUrl + this.param.term + xinTerm
    }
    return href
  }

  /**
   * 一级地区点击事件
   */
  buildClickRegion () {
    if (this.param.hostUrl === '' || !this.param.hostUrl) {
      return false
    }
    if (!this.fetchUrl || this.fetchUrl === '') {
      return false
    }
    let element = this.element
    let regionFirsts = element.querySelectorAll('.select-region-1-item')
    let regionSecondBox = element.querySelector('.select-region-2')

    regionFirsts.forEach((item) => {
      item.addEventListener('click', () => {
        let districtId = item.getAttribute('value')
        let name = item.innerHTML
        let ab = item.getAttribute('ab')
        let type = item.getAttribute('type')
        if (name.indexOf('全') === -1) {
          name = '全' + name
        } else {
          let href = this.splitUrlStr('', '', '', '')
          window.location.replace(href)
          return false
        }
        this.removeAllClass('select-region-1-item-active', this.modal)
        addClass(item, 'select-region-1-item-active')
        let districtType = 0
        if (typeof this.param.monter === 'string' && this.param.monter === 'price') {
          districtType = 1
        }
        let url = `${this.param.hostUrl}${this.fetchUrl}?district_id=${districtId}&district_type=${districtType}`
        fetchJsonp(url).then(res => {
          return res.json()
        }).then(data => {
          let secondRegion = data
          let html = ''
          if (typeof (this.param.monter) !== 'string' || ab !== 'zhixiashi' || this.param.monter !== 'price') {
            html += `<div class="select-region-2-item border-right-1px" value="0" ab="${ab}" type="${type}">${name}</div>`
          }
          for (let value of secondRegion) {
            html += `<div class="select-region-2-item border-right-1px" value="${value.id}" ab="${ab}-${value.ab}" type="${type}">${value.name}</div>`
          }
          regionSecondBox.innerHTML = html
          // 添加二级区域点击监听
          this.buildSecondRegionClick()
        })
      })
    })
  }

  /**
   * 添加二级区域点击监听
   */
  buildSecondRegionClick () {
    let element = this.element
    let regionThirdBox = element.querySelector('.select-region-3')
    let regionSecond = element.querySelectorAll('.select-region-2 .select-region-2-item')
    if (!this.fetchUrl || this.fetchUrl === '') {
      return false
    }
    regionSecond.forEach((item) => {
      item.addEventListener('click', () => {
        let districtId = item.getAttribute('value')
        let name = item.innerHTML
        let ab = item.getAttribute('ab')
        let type = item.getAttribute('type')
        let href = this.param.hostUrl + this.param.typeUrl + '/' + this.param.cateUrl + this.param.term
        if (districtId === 0) {
          window.location.replace(href)
          return false
        }
        if (name.indexOf('全') === -1) {
          name = '全' + name
        }
        addClass(element.querySelector('.select-region-3'), 'select-region-3-active')
        let url = `${this.param.hostUrl}${this.fetchUrl}?district_id=${districtId}`
        fetchJsonp(url).then(res => {
          return res.json()
        }).then(data => {
          let thirdRegion = data
          let html = `<div class="select-region-2-item" value="0" ab="${ab}" type="${type}">${name}</div>`
          for (let value of thirdRegion) {
            if (value.id === this.param.district_3rd) {
              html += `<div class="select-region-2-item select-region-2-item-active" value="${value.id}" ab="${ab}-${value.ab}" type="${type}">${value.name}</div>`
            } else {
              html += `<div class="select-region-2-item" value="${value.id}" ab="${ab}-${value.ab}" type="${type}">${value.name}</div>`
            }
          }
          regionThirdBox.innerHTML = html
          this.buildThirdRegionClick()
        })
        this.removeAllClass('select-region-2-item-active', this.modal)
        addClass(item, 'select-region-2-item-active')
      })
    })
  }

  /**
   * 三级地区点击事件绑定
   */
  buildThirdRegionClick () {
    let element = this.element
    let regionThird = element.querySelectorAll('.select-region-3 .select-region-2-item')
    for (let item of regionThird) {
      item.addEventListener('click', () => {
        let ab = item.getAttribute('ab')
        let href = `${this.param.hostUrl}${ab}/${this.param.typeUrl}/${this.param.cateUrl}${this.param.term}`
        window.location.replace(href)
      })
    }
  }

  /*
   * 相关类型列表二级联动点击事件监听
   * @returns {boolean}
   */
  buildIndustryItemClick () {
    let element = this.element
    let itemFirsts = element.querySelectorAll('.select-region-1 .select-industry-1-item')
    if (!this.fetchUrl || this.fetchUrl === '') {
      return false
    }
    for (let item of itemFirsts) {
      item.addEventListener('click', () => {
        this.removeAllClass('select-region-1-item-active', this.modal)
        addClass(item, 'select-region-1-item-active')
        let ab = item.getAttribute('data-id')
        let href = window.location.href
        if (!ab && this.term) {
          let terms = this.term.split(',')
          for (let v of terms) {
            let s = `/${v}([0-9]*)/`
            let sco = href.match(s)
            if (sco) {
              href = href.replace(sco[0], '')
            }
          }
          window.location.replace(href)
          return false
        }
        let im = item.getAttribute('data-im') ? item.getAttribute('data-im') : 'industry'
        let url = `${this.param.hostUrl}${this.fetchUrl}?ab=${ab}&im=${im}&nowurl=${href}&term=${this.param.term}`
        fetchJsonp(url).then(res => {
          return res.json()
        }).then(data => {
          element.querySelector('.' + this.modal + ' .select-industry-2').innerHTML = data
        })
      })
    }
  }

  /**
   * 清空按钮点击事件监听
   */
  buildClearClick () {
    let element = this.element
    let clearBtn = element.querySelector(`.${this.modal} .mip-clear-btn`)
    if (!clearBtn) {
      console.error('未找到清除按钮')
      return false
    }
    clearBtn.addEventListener('click', () => {
      this.removeAllClass('more-item-active-ios', this.modal)
      this.removeAllClass('more-item-active', this.modal)
    })
  }

  /*
   * 【更多】下拉列表的选项点击事件
   * @returns {boolean}
   */
  buildMoreItemClick () {
    let element = this.element
    let moreItems = element.querySelectorAll(`.${this.modal} .more-item`)
    if (!moreItems) {
      console.error('未找到选项')
      return false
    }
    for (let item of moreItems) {
      item.addEventListener('click', () => {
        let liId = item.getAttribute('data-li')
        this.clearMoreItemAllActive(liId)
        if (util.platform.isIos()) {
          addClass(item, 'more-item-active-ios')
        }
        if (util.platform.isAndroid()) {
          addClass(item, 'more-item-active')
        }
        // 清空输入框的值
        let moreItemInputs = element.querySelectorAll(`#${liId} input`)
        if (!moreItemInputs) {
          console.error('未找到input输入框')
          return false
        }
        moreItemInputs.forEach((input) => {
          input.value = ''
        })
      })
    }
  }

  /*
   * 【更多】下拉列表里面的input输入框聚焦事件
   * @returns {boolean}
   */
  buildMoreItemInputClick () {
    let element = this.element
    let moreItemInputs = element.querySelectorAll(`.${this.modal} input`)
    if (!moreItemInputs) {
      console.error('未找到input输入框')
      return false
    }
    moreItemInputs.forEach((input, index) => {
      input.addEventListener('focus', () => {
        this.clearMoreItemAllActive(input.getAttribute('data-li'))
      })
    })
  }

  clearMoreItemAllActive (liId) {
    if (!liId) {
      return false
    }
    let element = this.element
    let moreItems = element.querySelectorAll(`#${liId} .more-item`)
    if (!moreItems) {
      console.error('未找到要清除的选中项')
      return false
    }
    moreItems.forEach((item, index) => {
      if (util.platform.isIos()) {
        removeClass(item, 'more-item-active-ios')
      }
      if (util.platform.isAndroid()) {
        removeClass(item, 'more-item-active')
      }
    })
  }

  buildMoreSureBtnClick () {
    let element = this.element
    let sureBtn = element.querySelector(`.${this.modal} .mip-more-sure-btn`)
    if (!sureBtn) {
      console.error('未找到确定按钮')
      return false
    }
    sureBtn.addEventListener('click', () => {
      let xinTerm = ''
      // let type = sureBtn.getAttribute('type')
      // 判断更多下拉列表多个
      if (this.param.moreItemTerms instanceof Array === false) {
        let cateMatch = this.param.cateUrl.match(`[a-z]+`)
        if (cateMatch) {
          let type = cateMatch[0]
          if (this.param.moreItemTerms[type]) {
            this.param.moreItemTerms = this.param.moreItemTerms[type]
          } else {
            this.param.moreItemTerms = []
          }
        }
      }
      if (this.isSwitch === 'true') {
        let areaTerm = this.param.moreItemTerms[(this.param.moreItemTerms.length - 1)]
        xinTerm = `${areaTerm}${this.param.areaType}`
      }
      for (let itemTerm of this.param.moreItemTerms) {
        let nd = this.param.term.match(new RegExp(itemTerm + '([0-9]*)'))
        if (nd) {
          this.param.term = this.param.term.replace(nd[0], '')
        }
      }
      // 输入框
      let moreItemAreaInputs = element.querySelectorAll(`.${this.modal} .more-item-area`)
      if (!moreItemAreaInputs) {
        console.error('未找到输入框')
        return false
      }
      moreItemAreaInputs.forEach((item) => {
        if (item.value !== '') {
          xinTerm += `${item.getAttribute('name')}${item.value}`
        }
      })
      // 选中的item
      let activeItems = []
      if (util.platform.isIos()) {
        activeItems = element.querySelectorAll(`.${this.modal} .more-item-active-ios`)
      }
      if (util.platform.isAndroid()) {
        activeItems = element.querySelectorAll(`.${this.modal} .more-item-active`)
      }
      if (!activeItems) {
        console.error('未找到选中项')
        return false
      }
      activeItems.forEach((active) => {
        let cate = active.getAttribute('cate')
        if (this.param.cateUrlTerms.includes(cate)) {
          this.param.cateUrl = active.getAttribute('value') ? active.getAttribute('value') : ''
        } else {
          let val = active.getAttribute('value')
          if (val) {
            xinTerm += val
          }
        }
      })
      let kws = ''
      if (this.param.keywordTerms) {
        let kw = this.param.term.match(new RegExp(this.param.keywordTerms + '(.*)'))
        if (kw) {
          this.param.term = this.param.term.replace(kw[0], '')
          kws = kw[0]
        }
      }
      let href = this.splitUrlStr(xinTerm) + kws
      window.location.replace(href)
    })
  }
}
