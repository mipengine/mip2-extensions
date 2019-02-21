/**
 * @file mip-showmore 显示更多组件
 * @author sekiyika(pengxing@baidu.com)
 */

import './mip-showmore.less'

const { CustomElement, viewport, util, hash } = MIP
const log = util.log('mip-showmore')
const DOCUMENT_URL = 'https://www.mipengine.org/v2/components/dynamic-content/mip-showmore.html'

let sidsArr
const SIDS_A = '126449'
const SIDS_B = '126450'
const SIDS_C = '126490'

let increaseId = 0

/**
 * 保存 showmore 的实例以及依赖关系，以便保证组件 init 的顺序从里到外
 *
 * @type {Array.<MIPShowMore>}
 */
const SHOWMORE_INSTANCE = {}

// 获取实验组id
if (hash.hashTree.sids) {
  sidsArr = hash.hashTree.sids.value.split('_')

  if (matchIsSids(SIDS_A)) { // 命中实验组
    let sidsBtn = document.querySelector('.mip-showmore-btn')
    sidsBtn.innerHTML = '展开全部'
    sidsBtn.classList.add('mip-showmore-btn-sidsA')
    let iconChildElement = document.createElement('span')
    iconChildElement.classList.add('down-icon')
    sidsBtn.appendChild(iconChildElement)
    if (!document.querySelector('mip-showmore').getAttribute('bottomshadow')) {
      document.querySelector('mip-showmore').setAttribute('bottomshadow', 1)
    }
  }
  if (matchIsSids(SIDS_B)) { // 命中实验组
    let sidsBtn = document.querySelector('.mip-showmore-btn')
    sidsBtn.innerHTML = '展开全部'
    sidsBtn.classList.add('mip-showmore-btn-sidsB')
    document.querySelector('.mip-showmore-btn').style.cssText = 'width:' + document.documentElement.clientWidth + 'px;display: inline-block; cursor: pointer;background: #f8f8f8!important'
    document.querySelector('mip-showmore').classList.add('sidsB')
    let iconChildElement = document.createElement('span')
    iconChildElement.classList.add('down-icon')
    sidsBtn.appendChild(iconChildElement)
  }
}

export default class MIPShowMore extends CustomElement {
  constructor (...args) {
    super(...args)

    /**
     * 表示是否运行过 connectedCallback
     *
     * @type {boolean}
     */
    this.inited = false
    this.timeoutArray = []
  }

  /** @override */
  connectedCallback () {
    if (this.inited) {
      return
    }
    let { element } = this

    // 获取点击按钮，v1.0.0 方法
    this.clickBtn = element.querySelector('[showmorebtn]')
    if (this.clickBtn) {
      log.warn(this.element, `[Deprecated] showmorebtn 属性已经废弃, ${DOCUMENT_URL}`)
    }
    this.clickBtnSpan = this.clickBtn && this.clickBtn.querySelector('.mip-showmore-btnshow')
    // 获取内容显示框，v1.0.0 方法
    this.showBox = element.querySelector('[showmorebox]')
    if (this.showBox) {
      log.warn(this.element, `[Deprecated] showmorebox 属性已经废弃, ${DOCUMENT_URL}`)
    }
    // 获取动画时间, 默认为0.24，兼容0的写法
    this.animateTime = element.getAttribute('animatetime')
    if (this.animateTime === null || isNaN(this.animateTime)) {
      // if transition time is not set, set into 0.24s
      this.animateTime = 0.24
    }
    // 折叠高度类型
    this.heightType = ['HEIGHTSCREEN', 'HEIGHT', 'LENGTH']
    // 对应的收起按钮，因收起按钮可能不在 showmore组件中，故使用 document.querySelector 全局选择
    this.btn =
      document.querySelector(`div[on="tap:${element.id}.toggle"]`) ||
      document.querySelector(`div[on="click:${element.id}.toggle"]`)
    this.eleid = element.id

    // 是否含有mip-showmore子元素
    this.containSMChild = false

    // 是否初使化
    this.initialized = false
    this.inited = true

    // 获取内容显示框，v1.1.0 方法
    if (!this.showBox) {
      this.showBox = this.element
    }
  }

  build () {
    if (hash.hashTree.sids && matchIsSids(SIDS_C)) { // 命中实验组
      this.element.setAttribute('maxheight', '99999')
    }
    this.analysisDep()
    if (!this.containSMChild) {
      this.firstInit()
    }
    this.bindClick()
    this.addEventAction('toggle', event => {
      this.toggle(event)
    })

    window.addEventListener('orientationchange', () => {
      this.firstInit()
    })
    if (hash.hashTree.sids && matchIsSids(SIDS_C)) { // 命中实验组
      let sidsBtn = document.querySelector('.wrap-showmore-btn')
      sidsBtn.style.cssText = 'display: none!important'
    }
  }

  /**
   * 初始化各参数
   *
   * @private
   */
  firstInit () {
    let { element } = this
    // 获取高度阈值
    this.maxHeight = element.getAttribute('maxheight')
    // 获取字数阈值
    this.maxLen = element.getAttribute('maxlen')
    // 获取是否需要bottom渐变
    this.bottomShadow = element.getAttribute('bottomshadow') === '1'
    // 弹性高度，判断高度阈值时会增加此弹性
    this.bufferHeight = element.getAttribute('bufferheight')
    this.bufferHeight = +this.bufferHeight ? +this.bufferHeight : 0
    // 渐变className
    this.bottomShadowClassName = 'linear-gradient'
    // 处理阈值高度(高度优先于字体长度,不允许两个同时存在)
    if (this.maxHeight && isNaN(this.maxHeight)) {
      let maxHeightArr = this.maxHeight.split(':')
      let key
      let value
      if (maxHeightArr.length > 1) {
        key = maxHeightArr[0].trim()
        value = maxHeightArr[1].trim()

        switch (key) {
          case 'screen':
            this.showType = this.heightType[0]
            this.maxHeight = viewport.getHeight() * value
            this.initHeight()
            break
          case 'heightpx':
            this.showType = this.heightType[1]
            this.initHeight()
        }
      }
    } else if (this.maxHeight && !isNaN(this.maxHeight)) {
      this.showType = this.heightType[1]
      this.initHeight()
    } else if (this.maxLen && !isNaN(this.maxLen)) {
      this.showType = this.heightType[2]
      this.initTextLength()
    } else {
      this.maxHeight = 0
      this.initHeight()
    }

    // 避免初始加载闪现
    util.css(element, { visibility: 'visible' })

    this.runInitShowMore()
    this.initialized = true
    // 保存点击按钮当前display状态，兼容v1.0.0和v1.1.0
    let display = this.clickBtnSpan && getComputedStyle(this.clickBtnSpan).display
    let displayNew = this.btn && getComputedStyle(this.btn).display
    this.btn && this.btn.style && (this.btn.style.cursor = 'pointer')
    this.btnDisplay = displayNew || display
  }

  /**
   * 改变按钮的样式值 - showmore改为隐藏状态, 按钮为"收起"
   *
   * @param {string} type type
   * @private
   */
  changeBtnStyle (type) {
    // v1.0.0 显示更多按钮
    let showMoreBtn = this.element.querySelector('.mip-showmore-btnshow')
    let showMoreBtnHide = this.element.querySelector('.mip-showmore-btnhide')

    // v1.1.0 选中 showmore 的 div
    let showMoreBtn2 = this.btn || showMoreBtn
    if (type === 'fold') {
      util.css(showMoreBtn2, 'display', 'inline-block')
      showMoreBtnHide && util.css(showMoreBtnHide, 'display', 'none')
      // 处理 bottom 渐变
      this.bottomShadow && this.showBox.classList.add(this.bottomShadowClassName)
    } else if ((type === 'unfold')) {
      util.css(showMoreBtn2, 'display', 'none')
      // showMoreBtnHide && util.css(showMoreBtnHide, 'display', 'inline-block');

      // 处理 bottom 渐变
      this.bottomShadow && this.showBox.classList.remove(this.bottomShadowClassName)
    }
  }

  /**
   * @private
   */
  initHeight () {
    // 获取页面元素高度
    let height
    if (this.showBox.style.height && this.showBox.style.height.match('px')) {
      height = getHeightUnfold(this.showBox)
    } else {
      height = util.rect.getElementOffset(this.showBox).height
    }
    // 如果高度大于阈值
    if (height > (+this.maxHeight) + this.bufferHeight) {
      util.css(this.showBox, {
        height: this.maxHeight + 'px',
        overflow: 'hidden'
      })
      // 改变按钮的样式值 - 改为隐藏状态
      this.changeBtnStyle('fold')
    } else {
      util.css(this.showBox, height, 'auto')
      this.changeBtnStyle('unfold')
    }
  }

  /**
   * 字数控制
   *
   * @private
   */
  initTextLength () {
    // 防止重复初始化
    if (this.oriDiv) {
      return
    }
    // 存储原始html文字 & NODE
    let originalHtml = this.showBox.innerHTML

    // 获取剪切后的字符串
    let cutOffText = this.cutHtmlStr(this.maxLen)

    // 如果长度大于阈值，复制修改前内容到.mip-showmore-originText,
    // 剪切后的内容保存在.mip-showmore-abstract，未来修改内容，
    // 只需要针对这两个DOM做展示/隐藏处理
    if (originalHtml.length !== cutOffText.length) {
      // 改变按钮的样式值 - 改为隐藏状态
      this.changeBtnStyle('fold')

      // 清除被_cutHtmlStr处理之后的原始内容
      this.showBox.innerHTML = ''
      // 保存剪切前 dom，插入文档
      this.oriDiv = document.createElement('div')
      this.oriDiv.setAttribute('class', 'mip-showmore-originText mip-showmore-nodisplay')
      this.oriDiv.innerHTML = originalHtml
      this.showBox.appendChild(this.oriDiv)

      // 创建剪切后 dom, 插入文档
      this.cutDiv = document.createElement('div')
      this.cutDiv.setAttribute('class', 'mip-showmore-abstract')
      this.cutDiv.innerHTML = '<p>' + cutOffText + '...' + '</p>'
      this.showBox.appendChild(this.cutDiv)
    }
  }

  // 绑定显示更多按钮
  // XXX: v1.0.0 逻辑，兼容 <p showmorebtn></p>
  bindClick () {
    if (!this.clickBtn) {
      return
    }
    this.clickBtn.addEventListener('click', () => {
      this.toggle()
    })
  }
  // 点击时按钮添加class
  addClassWhenUnfold () {
    if (this.btn) {
      this.btn.classList.add('mip-showmore-btn-hide')
    }
  };
  // 高度阈值控制
  toggle (event) {
    let classList = this.element.classList
    let clickBtn = (event && event.target)
      ? matchOriginTarget(this.element.id.trim(), event.target)
      : null
    let opt = {}
    opt.aniTime = this.animateTime
    if (this.showType === this.heightType[2]) {
      // 高度限制
      opt.oriHeight = util.rect.getElementOffset(this.showBox).height + 'px'
      let originDom = this.oriDiv
      let cutDom = this.cutDiv

      if (classList.contains('mip-showmore-boxshow')) {
        // 隐藏超出字数的内容
        originDom.classList.add('mip-showmore-nodisplay')
        cutDom.classList.remove('mip-showmore-nodisplay')
        opt.tarHeight = util.rect.getElementOffset(this.showBox).height + 'px'
        originDom.classList.remove('mip-showmore-nodisplay')
        cutDom.classList.add('mip-showmore-nodisplay')
        this.bottomShadow && this.showBox.classList.add(this.bottomShadowClassName)
        opt.type = 'fold'
        opt.cbFun = () => {
          this.toggleClickBtn(clickBtn, 'showOpen')
          classList.remove('mip-showmore-boxshow')
          originDom.classList.add('mip-showmore-nodisplay')
          cutDom.classList.remove('mip-showmore-nodisplay')
        }
      } else {
        // 显示超出字数的内容
        this.bottomShadow && this.showBox.classList.remove(this.bottomShadowClassName)
        opt.type = 'unfold'
        originDom.classList.remove('mip-showmore-nodisplay')
        cutDom.classList.add('mip-showmore-nodisplay')
        opt.tarHeight = getHeightUnfold(this.showBox) + 'px'
        this.showBox.style.height = this.maxHeight + 'px'
        opt.cbFun = () => {
          this.toggleClickBtn(clickBtn, 'showClose')
          classList.add('mip-showmore-boxshow')
          this.addClassWhenUnfold()
        }
      }
    } else if (this.showType === this.heightType[1] || this.showType === this.heightType[0]) {
      if (classList.contains('mip-showmore-boxshow')) {
        this.bottomShadow && this.showBox.classList.add(this.bottomShadowClassName)
        // 隐藏超出高度的内容
        classList.remove('mip-showmore-boxshow')
        opt.type = 'fold'
        opt.tarHeight = this.maxHeight + 'px'
        opt.cbFun = () => {
          this.toggleClickBtn(clickBtn, 'showOpen')
        }
      } else {
        // 显示超出高度的内容
        this.bottomShadow && this.showBox.classList.remove(this.bottomShadowClassName)
        classList.add('mip-showmore-boxshow')
        opt.type = 'unfold'
        opt.cbFun = () => {
          this.toggleClickBtn(clickBtn, 'showClose')
          this.element.style.height = 'auto'
          this.addClassWhenUnfold()
        }
      }
    }

    this.heightAni({
      ele: this.showBox,
      type: opt.type,
      transitionTime: opt.aniTime,
      tarHeight: opt.tarHeight,
      oriHeight: opt.oriHeight,
      cbFun: opt.cbFun
    })
  };

  toggleClickBtn (clickBtn, status) {
    if (!status) {
      return
    }
    let closeclass
    if (clickBtn && clickBtn.dataset && clickBtn.dataset.closeclass) {
      closeclass = clickBtn.dataset.closeclass
    }
    if (status === 'showOpen') {
      // v1.1.0 显示“展开”按钮
      if (clickBtn) {
        if (closeclass) {
          clickBtn.classList.remove(closeclass)
        } else {
          let suffix = ''
          if (hash.hashTree.sids && (matchIsSids(SIDS_A) || matchIsSids(SIDS_B))) {
            suffix = '<span class="down-icon"></span>'
          }
          clickBtn.innerHTML = clickBtn.dataset.opentext + suffix
        }
      }
      // v1.0.0 显示“展开”按钮
      this.changeBtnText(
        { display: this.btnDisplay },
        { display: 'none' }
      )
    } else {
      // v1.1.0显示“收起”按钮
      if (clickBtn) {
        if (closeclass) {
          clickBtn.classList.add(closeclass)
        } else {
          let opentext = clickBtn.innerText
          clickBtn.dataset.opentext = opentext
          clickBtn.innerHTML = clickBtn.dataset.closetext || '收起'
        }
      }
      // v1.0.0 显示“收起”按钮
      this.changeBtnText(
        { display: 'none' },
        { display: this.btnDisplay }
      )
    }
  };

  /**
   * 剪切字符串
   *
   * @param {number} maxLen max length
   */
  cutHtmlStr (maxLen) {
    let allChildList = this.showBox.childNodes
    let cutHtml = ''
    let tmpNum = 0
    let newNodeList = []
    for (let i = 0; i < allChildList.length; i++) {
      let tmpHtml = allChildList[i].textContent.replace(/(^\s*)|(\s*$)/g, '')
      // 如果长度没有达到最大字数
      if ((cutHtml.length + tmpHtml.length) <= maxLen) {
        cutHtml = cutHtml + tmpHtml
        tmpNum = cutHtml.length
        newNodeList.push(allChildList[i])
      } else {
        // 已经大于
        let diffNum = maxLen - tmpNum > 0 ? maxLen - tmpNum : tmpNum - maxLen
        let cutText = tmpHtml ? tmpHtml.slice(0, diffNum) : ''
        allChildList[i].textContent = cutText
        newNodeList.push(allChildList[i])
        break
      }
    }
    let endHtml = ''
    for (let j = 0; j < newNodeList.length; j++) {
      let nodeType = newNodeList[j].nodeType
      if (nodeType === 1) {
        endHtml = endHtml + newNodeList[j].outerHTML
      } else if (nodeType === 3) {
        endHtml = endHtml + newNodeList[j].textContent
      }
    }
    return endHtml
  }

  // v1.0.0 按钮文案显示切换
  changeBtnText (showBtnObj, hideBtnObj) {
    let btnShow = this.element.querySelector('.mip-showmore-btnshow')
    let btnHide = this.element.querySelector('.mip-showmore-btnhide')
    this.changeBtnShow(btnShow, showBtnObj)
    this.changeBtnShow(btnHide, hideBtnObj)
  };

  // v1.0.0 文案切换显示
  changeBtnShow (obj, cssObj) {
    util.css(obj, cssObj)
  };

  getId (element) {
    element = element || this.element
    if (!element.dataset.showmoreId) {
      element.dataset.showmoreId = `__showmoreincreaseId__${++increaseId}`
    }
    return element.dataset.showmoreId
  }

  // 分析组件嵌套关系
  analysisDep () {
    let childMipShowmore = this.element.querySelectorAll('mip-showmore')
    if (!childMipShowmore.length) {
      return
    }
    let parentId = this.getId(this.element)

    SHOWMORE_INSTANCE[parentId] = SHOWMORE_INSTANCE[parentId] || { deps: [] }
    SHOWMORE_INSTANCE[parentId].instance = this

    let currendParentNode = childMipShowmore[0]
    Array.prototype.slice.call(childMipShowmore).forEach(child => {
      if (currendParentNode !== child && currendParentNode.contains(child)) {
        return
      }

      let id = this.getId(child)
      let childIns = SHOWMORE_INSTANCE[id] || {}
      childIns.deps = (childIns.deps || []).concat([parentId])
      SHOWMORE_INSTANCE[id] = childIns

      currendParentNode = child
    })
    this.containSMChild = true
  }

  // 运行嵌套的showmore组件实例
  runInitShowMore () {
    let depIds = SHOWMORE_INSTANCE[this.getId(this.element)]
    depIds && depIds.deps.forEach(function (depid) {
      let instan = SHOWMORE_INSTANCE[depid]
      instan && instan.instance && !instan.instance.initialized && instan.instance.firstInit()
    })
  }

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
   *   "cbFun": function() {}.bind()    //callback, exec after animation
   * }
   */
  heightAni (opt) {
    let element = opt.ele
    let type = opt.type
    let transitionTime
    let timeoutArr = this.timeoutArray || []

    if (!type || !element) {
      return
    }

    if (opt.transitionTime === undefined || isNaN(opt.transitionTime)) {
      // if transition time is not set, set into 0.24s
      transitionTime = 0.24
    } else {
      // '0.2s' -> 0.2, 20 -> 1, -0.5 -> 0.5
      transitionTime = Math.min(parseFloat(opt.transitionTime), 1)
    }

    // use ?: to make sure oriHeight won't be rewrite when opt.oriHeight is set to 0
    let oriHeight = (opt.oriHeight !== undefined ? opt.oriHeight : getComputedStyle(element).height)
    let tarHeight
    let cbFun = opt.cbFun || function () { }

    if (type === 'unfold') {
      // make sure tarHeight won't be rewrite when opt.tarHeight is set to 0
      if (opt.tarHeight !== undefined) {
        tarHeight = opt.tarHeight
      } else {
        // before set height to auto, remove animation.
        // or bad animation happens in iphone 4s
        element.style.transition = 'height 0s'
        element.style.height = 'auto'
        tarHeight = getComputedStyle(element).height
      }

      // set height to auto after transition,
      // in case of height change of inside element later.
      let timeout1 = setTimeout(function () {
        // before set height to auto, remove animation.
        // or bad animation happens in iphone 4s
        element.style.transition = 'height 0s'
        element.style.height = 'auto'
      }, transitionTime * 1000)
      timeoutArr[0] = timeout1
    } else if (type === 'fold') {
      tarHeight = opt.tarHeight || 0
    }

    element.style.height = oriHeight
    element.style.transition = 'height ' + transitionTime + 's'

    // now start the animation

    let timeout2 = requestAnimationFrame ? (requestAnimationFrame)(function () {
      // XXX: in setTimeout, or there won't be any animation
      element.style.height = tarHeight
    }) : setTimeout(function () {
      element.style.height = tarHeight
    }, 10)
    // after transition, exec callback functions
    let timeout3 = setTimeout(function () {
      cbFun()
    }, transitionTime * 1000)

    // save timeout, for later clearTimeout
    timeoutArr[element.id] = timeoutArr[element.id] || []
    timeoutArr[element.id][1] = timeout2
    timeoutArr[element.id][2] = timeout3
  }

  disconnectedCallback () {
    let tArr = (this.timeoutArray && this.timeoutArray[this.element.id]) || []
    for (let i = 0; i < tArr.length; i++) {
      window.clearTimeout(tArr[i])
    }
  }
}

/**
 * get real height of DOM without height restrictions
 *
 * @param {Object} dom some dom
 * @returns {number} height
 */
function getHeightUnfold (dom) {
  let fakeNode = document.createElement('div')
  let style = getComputedStyle(dom)
  fakeNode.innerHTML = dom.innerHTML

  fakeNode.style.padding = style.padding
  fakeNode.style.margin = style.margin
  fakeNode.style.border = style.border

  fakeNode.style.position = 'absolute'
  // 先插入再改样式，以防元素属性在createdCallback中被添加覆盖
  dom.parentNode.insertBefore(fakeNode, dom)
  fakeNode.style.height = 'auto'
  fakeNode.style.visibility = 'hidden'

  let height = util.rect.getElementOffset(fakeNode).height
  dom.parentNode.removeChild(fakeNode)

  return height
}

/**
 * 匹配实验组sids是否命中
 *
 * @param {string} sids sids
 * @returns {boolean} 是否匹配到实验组id
 */
function matchIsSids (sids) {
  for (let sidNum = 0, sidsLen = sidsArr.length; sidNum < sidsLen; sidNum++) {
    if (sidsArr[sidNum] === sids) {
      return true
    }
  }
  return false
}

/**
 * 匹配节点是否在按钮种
 *
 * @param {string} id id
 * @param {HTMLElement} node node
 * @returns {HTMLElement} node
 */
function matchOriginTarget (id, node) {
  while (node.parentNode) {
    let attr = node.getAttribute('on')
    // 兼容click
    if (attr && new RegExp('^(tap|click):' + id).test(attr)) {
      return node
    }
    node = node.parentNode
  }
  return node
}
