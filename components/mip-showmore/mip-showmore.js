/**
 * @file mip-showmore 显示更多组件
 * @author fengchuantao, liangjiaying, tfciw
 * @time 2017-7
 * @transfer 2018-8
 */
import './mip-showmore.less'
const {
  CustomElement,
  util,
  viewport
} = MIP
export default class MipShowMore extends CustomElement {
  constructor (...args) {
    // 继承父类属性，方法
    super(...args)

    this.timeoutArray = []
    this.increaseId = 0
    this.showmoreInstance = {}
    this.clickBtn = this.element.querySelector('[showmorebtn]')
    this.clickBtnSpan = this.clickBtn && this.clickBtn.querySelector('.mip-showmore-btnshow')
    // 获取内容显示框，v1.0.0 方法
    this.showBox = this.element.querySelector('[showmorebox]')
    // 获取动画时间, 默认为0.24，兼容0的写法
    this.animateTime = this.element.getAttribute('animatetime')
    if (this.animateTime === null || isNaN(this.animateTime)) {
      this.animateTime = 0.24
    }
    // 折叠高度类型
    this.heightType = ['HEIGHTSCREEN', 'HEIGHT', 'LENGTH']
    // 对应的收起按钮，因收起按钮可能不在 showmore组件中，故使用 document.querySelector 全局选择
    this.btn = document.querySelector('div[on="tap:' + this.element.id + '.toggle"]') || document.querySelector('div[on="click:' + this.element.id + '.toggle"]')
    this.eleid = this.element.id

    this.bottomShadow = false
    this.showType = ''

    // 是否含有mip-showmore子元素
    this.containSMChild = false

    // 是否初使化
    this.initialized = false

    // 获取内容显示框，v1.1.0 方法
    if (!this.showBox) {
      this.showBox = this.element
    }
  }

  /**
   * build生命周期，只会在创建的时候执行一次
   */
  build () {
    this.analysisDep()
    this.firstInit()
    this.bindClick()
    this.addEventAction('toggle', event => {
      this.toggle(event)
    })

    window.addEventListener('orientationchange', () => {
      this.firstInit()
    })

    this.addEventAction('refresh', event => {
      this.firstInit()
    })
  }

  /**
   * 初始化各参数
   *
   * @private
   */
  firstInit () {
    // 如果动画不是数字
    if (isNaN(this.animateTime)) {
      return
    }

    // 获取高度阈值
    this.maxHeight = this.element.getAttribute('maxheight')
    // 获取字数阈值
    this.maxLen = this.element.getAttribute('maxlen')
    // 获取是否需要bottom渐变
    this.bottomShadow = this.element.getAttribute('bottomshadow') === '1'
    // 弹性高度，判断高度阈值时会增加此弹性
    this.bufferHeight = parseInt(this.element.getAttribute('bufferheight'))
    this.bufferHeight = this.bufferHeight ? this.bufferHeight : 0
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
        if (key === 'screen') {
          this.showType = this.heightType[0]
          this.maxHeight = viewport.getHeight() * value
          this.initHeight()
        } else if (key === 'heightpx') {
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
    util.css(this.element, {
      visibility: 'visible'
    })
    this.runInitShowMore()

    this.initialized = true

    // 保存点击按钮当前display状态，兼容v1.0.0和v1.1.0
    let display = this.clickBtnSpan && getComputedStyle(this.clickBtnSpan).display
    let displayNew = this.btn && getComputedStyle(this.btn).display
    this.btn && this.btn.style && (this.btn.style.cursor = 'pointer')
    this.btnDisplay = displayNew || display
  };

  /**
   * 改变按钮的样式值 - showmore改为隐藏状态, 按钮为“收起”
   *
   * @private
   * @param {string} type fold类型
   */
  changeBtnStyle (type) {
    // v1.0.0显示更多按钮
    let showMoreBtn = this.element.querySelector('.mip-showmore-btnshow')
    let showMoreBtnHide = this.element.querySelector('.mip-showmore-btnhide')

    // v1.1.0选中 showmore的div
    let showMoreBtn2 = this.btn || showMoreBtn
    if (type === 'fold') {
      util.css(showMoreBtn2, 'display', 'inline-block')
      showMoreBtnHide && util.css(showMoreBtnHide, 'display', 'none')
      // 处理bottom渐变
      this.bottomShadow && this.showBox.classList.add(this.bottomShadowClassName)
    } else if ((type === 'unfold')) {
      util.css(showMoreBtn2, 'display', 'none')

      // 处理bottom渐变
      this.bottomShadow && this.showBox.classList.remove(this.bottomShadowClassName)
    }
  };

  /**
   * 初始化高度
   *
   * @private 根据高度判断按钮是否隐藏
   */
  initHeight () {
    // 获取页面元素高度
    let height
    if (this.showBox.style.height && this.showBox.style.height.match('px')) {
      height = this.getHeightUnfold(this.showBox)
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
  };

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

      // 清除被cutHtmlStr处理之后的原始内容
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
  };

  /**
   * 绑定显示更多按钮
   *
   * @private
   * XXX: v1.0.0 逻辑，兼容 <p showmorebtn></p>
   */
  bindClick () {
    if (!this.clickBtn) {
      return
    }
    this.clickBtn.addEventListener('click', () => {
      this.toggle()
    })
  };
  /**
   * 点击时按钮添加class
   *
   * @private
   */
  addClassWhenUnfold () {
    let btnShowmore = this.btn
    if (btnShowmore) {
      btnShowmore.classList.add('mip-showmore-btn-hide')
    }
  };

  /**
   * 高度阈值控制
   *
   * @private
   * @param {Object} event 事件对象
   * 根据当前模式以及打开的状态切换状态
   */
  toggle (event) {
    let classList = this.element.classList
    let clickBtn = event && event.target
      ? this.matchOriginTarget(this.element.id.trim(), event.target)
      : null
    let opt = {}
    opt.aniTime = this.animateTime
    if (this.showType === this.heightType[2]) {
      // 高度限制
      opt.oriHeight = util.rect.getElementOffset(this.showBox).height + 'px'
      let originDom = this.oriDiv
      let cutDom = this.cutDiv
      // 包含子showmore
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
        // 显示超出字数的内容 嵌套使用 字数
        this.bottomShadow && this.showBox.classList.remove(this.bottomShadowClassName)
        opt.type = 'unfold'
        originDom.classList.remove('mip-showmore-nodisplay')
        cutDom.classList.add('mip-showmore-nodisplay')
        opt.tarHeight = this.getHeightUnfold(this.showBox) + 'px'
        util.css(this.showBox, {
          height: this.maxHeight + 'px'
        })
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
          util.css(this.element, {
            height: 'auto'
          })
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

  /**
   * 切换按钮状态
   *
   * @private
   * @param {HTMLElement} clickBtn dom节点
   * @param {String} status 状态
   * 根据当前模式以及打开的状态切换状态
   */
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
          clickBtn.innerText = clickBtn.dataset.opentext
        }
      }
      // v1.0.0 显示“展开”按钮
      this.changeBtnText({
        display: this.btnDisplay
      }, {
        display: 'none'
      })
    } else {
      // v1.1.0显示“收起”按钮
      if (clickBtn) {
        if (closeclass) {
          clickBtn.classList.add(closeclass)
        } else {
          let opentext = clickBtn.innerText
          clickBtn.innerText = clickBtn.dataset.closetext || '收起'
          clickBtn.dataset.opentext = opentext
        }
      }
      // v1.0.0 显示“收起”按钮
      this.changeBtnText({
        display: 'none'
      }, {
        display: this.btnDisplay
      })
    }
  };

  /**
   * 剪切字符串
   *
   * @private
   * @param {number} maxLen 字数最大限制
   * @return {String} endHtml 剩余的字符串
   */
  cutHtmlStr (maxLen) {
    let allChildList = this.showBox.childNodes
    let cutHtml = ''
    let tmpNum = 0
    let newNodeList = []
    for (let i = 0; i < allChildList.length; i++) {
      let tmpHtml = allChildList[i].textContent.replace(/(^\s*)|(\s*$)/g, '')
      if ((cutHtml.length + tmpHtml.length) <= maxLen) { // 如果长度没有达到最大字数
        cutHtml += tmpHtml
        tmpNum = cutHtml.length
        newNodeList.push(allChildList[i])
      } else { // 已经大于
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
        endHtml += newNodeList[j].outerHTML
      } else if (nodeType === 3) {
        endHtml += newNodeList[j].textContent
      }
    }
    return endHtml
  };

  /**
   * 按钮文案切换
   *
   * @private
   * @param {HTMLElement} showBtnObj 展示按钮
   * @param {HTMLElement} hideBtnObj 隐藏按钮
   */
  changeBtnText (showBtnObj, hideBtnObj) {
    let btnShow = this.element.querySelector('.mip-showmore-btnshow')
    let btnHide = this.element.querySelector('.mip-showmore-btnhide')
    util.css(btnShow, showBtnObj)
    util.css(btnHide, hideBtnObj)
  };

  /**
   * 获取id
   *
   * @private
   * @param {HTMLElement} showmore dom节点
   * @return {String} 传入dom的id
   */
  getId (showmore) {
    if (!showmore.dataset.showmoreId) {
      showmore.dataset.showmoreId = '__showmoreincreaseId__' + (++this.increaseId)
    }
    return showmore.dataset.showmoreId
  }

  /**
   * 分析组件嵌套关系
   *
   * @private
   * this.containSMChild = true;
   */
  analysisDep () {
    let childMipShowmore = this.element.querySelectorAll('mip-showmore')
    if (!childMipShowmore.length) {
      return
    }
    let parentId = this.getId(this.element)
    this.showmoreInstance[parentId] = this.showmoreInstance[parentId] || { deps: [] }
    this.showmoreInstance[parentId].instance = this

    let currendParentNode = childMipShowmore[0]
    for (let i = 0; i < childMipShowmore.length; i++) {
      if (currendParentNode !== childMipShowmore[i] && currendParentNode.contains(childMipShowmore[i])) {
        return
      }
      let id = this.getId(childMipShowmore[i])
      let childIns = this.showmoreInstance[id] || {}
      childIns.deps = (childIns.deps || []).concat([parentId])
      this.showmoreInstance[id] = childIns
      currendParentNode = childMipShowmore[i]
    }
    this.containSMChild = true
  };

  /**
   * 运行嵌套的showmore组件实例
   * @private
   */
  runInitShowMore () {
    let depIds = this.showmoreInstance[this.getId(this.element)]
    depIds && depIds.deps.forEach(depid => {
      let instan = this.showmoreInstance[depid]
      instan && instan.instance && !instan.instance.initialized && instan.instance.init()
    })
  };

  /**
   * 动画
   *
   * @private
   * @param {Object} opt 参数对象
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
      transitionTime = 0.24
    } else {
      // '0.2s' -> 0.2, 20 -> 1, -0.5 -> 0.5
      transitionTime = Math.min(parseFloat(opt.transitionTime), 1)
    }

    let oriHeight = (opt.oriHeight !== undefined ? opt.oriHeight : getComputedStyle(element).height)
    let tarHeight
    let cbFun = opt.cbFun || function () { }

    if (type === 'unfold') {
      if (opt.tarHeight !== undefined) {
        tarHeight = opt.tarHeight
      } else {
        util.css(element, {
          transition: 'height .3s',
          height: 'auto'
        })
        tarHeight = getComputedStyle(element).height
      }
      let timeout1 = setTimeout(function () {
        util.css(element, {
          transition: 'height 0s',
          height: 'auto'
        })
      }, transitionTime * 1000)
      timeoutArr[0] = timeout1
    } else if (type === 'fold') {
      tarHeight = opt.tarHeight || 0
    }

    util.css(element, {
      height: oriHeight,
      transition: 'height ' + transitionTime + 's'
    })
    let timeout2 = requestAnimationFrame
      ? (requestAnimationFrame)(function () {
        util.css(element, {
          height: tarHeight
        })
      })
      : setTimeout(function () {
        util.css(element, {
          height: tarHeight
        })
      }, 10)
    let timeout3 = setTimeout(function () {
      cbFun()
    }, transitionTime * 1000)

    // save timeout, for later clearTimeout
    timeoutArr[element.id] = timeoutArr[element.id] || []
    timeoutArr[element.id][1] = timeout2
    timeoutArr[element.id][2] = timeout3
  }

  /**
   * 获取真实高度
   *
   * @param {HTMLElement} dom dom节点
   * @return {Number} height
   */
  getHeightUnfold (dom) {
    let fakeNode = document.createElement('div')
    let style = getComputedStyle(dom)
    fakeNode.innerHTML = dom.innerHTML

    util.css(fakeNode, {
      padding: style.padding,
      margin: style.margin,
      border: style.border,
      position: 'absolute'
    })
    // 先插入再改样式，以防元素属性在createdCallback中被添加覆盖
    dom.parentNode.insertBefore(fakeNode, dom)
    util.css(fakeNode, {
      height: 'auto',
      visibility: 'hidden'
    })
    let height = util.rect.getElementOffset(fakeNode).height
    // 移除fakeNode后的height已改变重新获取会与预期不符，在此需要对height进行一个存储
    dom.parentNode.removeChild(fakeNode)
    return height
  }

  /**
   * 匹配target
   *
   * @param  {String} id
   * @param  {HTMLElement} node dom节点
   * @return {HTMLElement} node dom节点
   */
  matchOriginTarget (id, node) {
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
}
