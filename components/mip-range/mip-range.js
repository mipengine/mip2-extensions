/**
 * @file mip-range 组件
 * @author mj(zoumiaojiang@gmail.com)
 */

/* globals MIP */

import './mip-range.less'

const { CustomElement, util, viewport, viewer } = MIP
const { log, rect } = util
const logger = log('mip-range')

export default class MIPRange extends CustomElement {
  constructor (...elements) {
    super(...elements)
    // 下面是内部用的属性
    this.canMove = false
    this.focusFlag = false
    this.processDragging = false
    this.processSign = null
    this.size = 0
    this.offset = 0
    this.focusSlider = 0
    this.currentValue = [0, 0]
    this.currentSlider = 0
    this.processRect = {}
    this.bodyTop = 0
    this.change = false
    this.timer = null
  }

  build () {
    let {
      direction, range, width, height,
      dotSize, min, max, step, disabled,
      tipShow, clickable, speed, fixRange,
      tipDir, dotStyle, processStyle, barStyle,
      tipFormat, tipExist
    } = this.props

    // 设定默认值
    this.isVertical = direction === 'vertical'
    this.isSingle = Array.isArray(range || 0) ? 0 : 1
    this.direction = direction || 'horizontal'
    this.width = width || 'auto'
    this.height = height || 6
    this.dotSize = dotSize || 16
    this.min = min || 0
    this.max = max || 100
    this.step = step || 1
    this.disabled = disabled === true
    this.tipShow = tipShow || 'always'
    this.clickable = clickable !== false
    this.speed = speed || 0.2
    this.range = range || 0
    this.fixRange = fixRange === true
    this.tipDir = tipDir || ''
    this.dotStyle = dotStyle || null
    this.processStyle = processStyle || null
    this.barStyle = barStyle || null
    this.tipFormat = tipFormat || ''
    this.tipExist = tipExist || 300
    this.currentValue = this.limitValue(!Array.isArray(this.range) ? [0, this.range] : this.range)

    // 渲染组件的内部结构
    this.render()
    this.setRangeData()
    this.setPosition()
    this.updateTips()
    this.bindEvents()
    this.registerEvent()
  }

  /**
   * 渲染组件内容
   */
  render () {
    let ele = this.element
    let { disabled, direction, isVertical, width, height, dotSize } = this
    let wrapper = document.createElement('div')
    let wrapperCls = wrapper.classList
    let flowDirectionClass = `mip-range-${direction}`
    let disabledClass = disabled ? 'mip-range-disabled' : ''

    wrapperCls.add('mip-range')
    wrapperCls.add(flowDirectionClass)
    disabledClass && wrapperCls.add(disabledClass)

    if (isVertical) {
      wrapper.style.height = typeof height === 'number' ? `${height}px` : height
    } else {
      wrapper.style.width = typeof width === 'number' ? `${width}px` : width
    }
    wrapper.style.padding = `${dotSize / 2}px`

    ele.appendChild(wrapper)
    this.wrapper = wrapper

    this.setRangeStatus()
    // 渲染划动控制柄
    this.renderSliderBar()
  }

  /**
   * 设置 range 组件的状态
   */
  setRangeStatus () {
    let wrapper = this.wrapper
    let wrapperCls = wrapper.classList
    const STATE_PROCESS_DRAG = 'mip-range-state-process-drag'
    const STATE_DRAG = 'mip-range-state-drag'
    const STATE_FOCUS = 'mip-range-state-focus'
    const STATE_CHANGE = 'mip-range-state-change'

    if (this.processDragging) {
      wrapperCls.add(STATE_PROCESS_DRAG)
    } else {
      wrapperCls.remove(STATE_PROCESS_DRAG)
    }
    if (this.canMove && !this.processDragging) {
      wrapperCls.add(STATE_DRAG)
    } else {
      wrapperCls.remove(STATE_DRAG)
    }
    if (this.focusFlag) {
      wrapperCls.add(STATE_FOCUS)
    } else {
      wrapperCls.remove(STATE_FOCUS)
    }
    if (this.change) {
      wrapperCls.add(STATE_CHANGE)
    } else {
      wrapperCls.remove(STATE_CHANGE)
    }
  }

  /**
   * 渲染滑动游标
   *
   * @param {HTMLElement} wrapper 滑动游标的容器
   */
  renderSliderBar () {
    let { isVertical, width, height, barStyle } = this
    let sliderBar = document.createElement('div')
    let sliderBarCls = sliderBar.classList

    sliderBarCls.add('mip-range-container')

    if (isVertical) {
      sliderBar.style.width = `${width}px`
      sliderBar.style.height = '100%'
    } else {
      sliderBar.style.height = `${height}px`
    }

    if (typeof barStyle === 'object') {
      for (let key in barStyle) {
        if (barStyle.hasOwnProperty(key)) {
          // 处理自定义样式
          sliderBar.style[key.replace(/-\w/g, s => s.toUpperCase().replace('-', ''))] = barStyle[key]
        }
      }
    }

    this.wrapper.appendChild(sliderBar)
    this.sliderBar = sliderBar

    this.renderSliderDot('start')
    this.renderSliderDot('end')
    this.renderProcessBar()
    this.renderRangeInput()

    // 渲染进度条的 tips
    this.renderTips(this.processBar, 'processBar')

    // 渲染拖拽点的 tips
    let dots = [
      this.sliderBar.querySelector('.mip-range-dot-start'),
      this.sliderBar.querySelector('.mip-range-dot-end')
    ]
    dots.forEach(ele => this.renderTips(ele, 'dot'))
    this.slider = dots
  }

  /**
   * 渲染滑动的游标
   *
   * @param {string} type 游标的类型
   */
  renderSliderDot (type) {
    let {tipShow, dotSize, width, height, dotStyle, isSingle} = this
    let dotElem = document.createElement('div')
    let dotCls = dotElem.classList

    dotCls.add('mip-range-dot')
    dotCls.add(`mip-range-tip-${tipShow || 'always'}`)

    // 设置默认样式
    if (this.isVertical) {
      dotElem.style.left = `${(-(dotSize - width) / 2)}px`
    } else {
      dotElem.style.top = `${(-(dotSize - height) / 2)}px`
    }

    dotElem.style.width = `${dotSize}px`
    dotElem.style.height = `${dotSize}px`

    // 设置 dot 的自定义样式
    if (typeof dotStyle === 'object') {
      for (let key in dotStyle) {
        if (dotStyle.hasOwnProperty(key)) {
          dotElem.style[key.replace(/-\w/g, s => s.toUpperCase().replace('-', ''))] = dotStyle[key]
        }
      }
    }

    this.sliderBar.appendChild(dotElem)

    // 如果是起始的点
    if (type === 'start') {
      dotCls.add('mip-range-dot-start')
      if (isSingle) {
        dotElem.style.display = 'none'
      }
    } else if (type === 'end') {
      dotCls.add('mip-range-dot-end')
    }
  }

  /**
   * 渲染 tips
   *
   * @param {HTMLElement} wrapper tips 的外层容器
   * @param {string} type tips 的类型
   */
  renderTips (wrapper, type = 'dot') {
    let { tipDir, isVertical, dotSize, width, height } = this
    let tipsEle = document.createElement('div')
    let tipsCls = tipsEle.classList
    let tipDirection = [
      'left',
      'right',
      'top',
      'bottom'
    ].indexOf(tipDir) > -1 ? tipDir : (isVertical ? 'left' : 'top')

    tipsCls.add('mip-range-tip-wrap')
    tipsCls.add('mip-range-tip-' + tipDirection)

    // 如果渲染的是控制柄的 tips 的话
    if (type !== 'dot') {
      let offset = isVertical ? (width / 2) - 9 : (height / 2) - 9
      tipsEle.style[tipDirection] = `${dotSize / -2 + offset}px`
      tipsCls.add('mip-merged-tip')
    }

    tipsEle.innerHTML = `<span class="mip-range-tip"></span>`
    wrapper.appendChild(tipsEle)
  }

  /**
   * 判断两个点是否碰撞
   */
  isDotHit () {
    let { isSingle, position, dotSize } = this
    if (isSingle) {
      return false
    }
    return position[1] - position[0] <= dotSize
  }

  /**
   * 渲染进度条
   */
  renderProcessBar () {
    let { fixRange, processStyle } = this
    let processBarEle = document.createElement('div')
    let processBarCls = processBarEle.classList

    processBarCls.add('mip-range-process')
    fixRange && processBarCls.add('mip-range-process-dragable')

    // 设置进度条的初始样式
    if (typeof processStyle === 'object') {
      for (let key in processStyle) {
        if (processStyle.hasOwnProperty(key)) {
          processBarEle.style[key.replace(/-\w/g, s => s.toUpperCase().replace('-', ''))] = processStyle[key]
        }
      }
    }

    this.processBar = processBarEle
    this.sliderBar.appendChild(processBarEle)
  }

  /**
   * 渲染组件的表单类型控件
   */
  renderRangeInput () {
    let { min, max } = this.props
    let input = document.createElement('input')

    input.classList.add('mip-range-range')
    input.setAttribute('min', min)
    input.setAttribute('max', max)
    input.setAttribute('type', 'range')

    this.input = input
    this.sliderBar.appendChild(input)
  }

  /**
   * 注册事件
   */
  registerEvent () {
    // 设置值
    this.addEventAction('setVal', (e, val) => {
      let { min, max, element } = this
      let valCon
      if (typeof val === 'string') {
        valCon = JSON.parse(val)
      } else {
        valCon = val
      }
      valCon = valCon.length === 1 ? [0, ...valCon] : valCon

      if (valCon[0] < min || valCon[1] > max) {
        return logger.warn(element, '请设置范围内的数据')
      }

      this.setValue(valCon)
    })

    // 获取值
    this.addEventAction('getVal', () => {
      return this.currentValue
    })

    // 值增加
    this.addEventAction('valIncrease', (e, num) => {
      let numCon = num ? parseInt(num, 10) : this.step
      numCon = isNaN(numCon) ? this.step : numCon
      this.valIncrease(numCon)
    })

    // 值减小
    this.addEventAction('valReduce', (e, num) => {
      let numCon = num ? parseInt(num, 10) : this.step
      numCon = isNaN(numCon) ? this.step : numCon
      this.valReduce(numCon)
    })
  }

  /**
   * 绑定事件
   */
  bindEvents () {
    // 视口变动，及时刷新
    viewport.on('resize', () => this.resetSlider())

    // iframe 下，纵向 slider 高度补偿
    viewport.on('scroll', () => {
      this.bodyTop = rect.getElementRect(document.body).top
    })

    this.wrapper.addEventListener('click', e => this.wrapClick(e))
    this.wrapper.addEventListener('touchmove', e => this.dragging(e))
    this.wrapper.addEventListener('mousemove', e => this.dragging(e))
    this.wrapper.addEventListener('touchend', e => this.dragComplete())
    this.wrapper.addEventListener('mouseup', e => this.dragComplete())
    this.wrapper.addEventListener('mouseleave', e => this.dragComplete())

    this.slider.forEach((item, index) => {
      item.addEventListener('touchstart', e => this.dragStart(e, index))
      item.addEventListener('mousedown', e => this.dragStart(e, index))
    })
  }

  /**
   * 设置值
   *
   * @param {Array} values  值
   */
  setValue (values) {
    this.setCurrentValue(values)
    this.setRangeData()
    this.setPosition()
  }

  /**
   * 按下控制点，准备滑动
   *
   * @param {Object} e 事件对象
   * @param {number} index 控制点下标
   * @param {boolean} isProcess 触控的是否为进度条
   */
  dragStart (e, index = 0, isProcess) {
    let { canMove, disabled, fixRange, isSingle, position, currentValue } = this

    // 控制点无缓动
    canMove || this.setTransitionTime(0)

    if (disabled) {
      return false
    }

    this.currentSlider = index

    // 进度条滑动
    if (isProcess) {
      if (!fixRange || isSingle) {
        return false
      }
      this.processDragging = true

      // 保存当前状态
      this.processSign = {
        pos: position,
        start: this.getPos((e.targetTouches && e.targetTouches[0]) ? e.targetTouches[0] : e)
      }
    } else {
      this.focusFlag = true
      this.focusSlider = index
    }

    this.canMove = true
    viewer.eventAction.execute('dragStart', this.element, currentValue)
  }

  /**
   * 拖动
   *
   * @param {Object} e 事件对象
   */
  dragging (e) {
    let { canMove, processDragging, processSign } = this
    let ev = e.targetTouches && e.targetTouches[0] ? e.targetTouches[0] : e

    if (!canMove) {
      return false
    }

    if (processDragging) {
      // 两个控制柄同时移动
      this.currentSlider = 0
      this.setValueOnPos(processSign.pos[0] + this.getPos(ev) - processSign.start, true)
      this.currentSlider = 1
      this.setValueOnPos(processSign.pos[1] + this.getPos(ev) - processSign.start, true)
    } else {
      this.setValueOnPos(this.getPos(ev), true)
    }

    // 检测两个控制柄是否碰撞
    this.isDotHit()
    e.preventDefault()
  }

  /**
   * 拖动结束
   */
  dragComplete () {
    let { tipExist, currentValue } = this

    // 不是有效拖动
    if (!this.canMove) {
      return false
    }

    this.canMove = false
    setTimeout(() => {
      this.processDragging = false
      this.setRangeStatus()
    }, 0)

    // class延迟去除
    this.timer && clearTimeout(this.timer)
    this.timer = setTimeout(() => {
      this.change = false
      this.setRangeStatus()
    }, +tipExist)

    this.setPosition()

    // 派发 drag-end 事件，并复位
    viewer.eventAction.execute('dragEnd', this.element, currentValue)
  }

  /**
   * 设置控制柄、进度bar位置
   *
   * @param {number} val 设置位置的数值
   * @param {boolean} isAnotherSlider 是否为被拖拽的控制柄
   */
  setTransform (val, isAnotherSlider) {
    let { currentSlider, dotSize, isVertical, position, slider, processBar } = this
    let anotherSlider = currentSlider === 0 ? 1 : 0
    let sliderIndex = isAnotherSlider ? anotherSlider : currentSlider

    // 计算控制点样式
    let offsetValue = isVertical
      ? ((dotSize / 2) - val)
      : (val - (dotSize / 2))
    let translateValue = isVertical
      ? `translateY(${offsetValue}px)`
      : `translateX(${offsetValue}px)`
    let dragSlider = slider[sliderIndex]

    dragSlider.style.transform = translateValue
    dragSlider.style.WebkitTransform = translateValue

    // 进度 bar 样式
    let processSize = `${sliderIndex === 0 ? position[1] - val : val - position[0]}px`
    let processPos = `${sliderIndex === 0 ? val : position[0]}px`
    let processRect = isVertical ? {
      'height': processSize,
      'bottom': processPos
    } : {
      'width': processSize,
      'left': processPos
    }

    Object.keys(processRect).forEach(key => (processBar.style[key] = processRect[key]))
  }

  /**
   * 设置当前数值
   *
   * @param {number} val 数值
   */
  setCurrentValue (val) {
    let { min, max, currentSlider } = this

    if (val < min || val > max) {
      return false
    }

    if (typeof val === 'number') {
      // 更新并设置数值
      this.currentValue.splice(currentSlider, 1, val)
    } else if (val.length && val.length === 2) {
      this.currentValue = val
    }

    // 将值设置到真正的表单控件上去
    this.input.value = this.currentValue

    this.setRangeData()
    this.updateTips()
    this.setRangeStatus()
  }

  /**
   * 计算当前控制点的值
   *
   * @param {number} index 分段刻度值
   * @returns {number} 当前数值
   */
  getValueByIndex (index) {
    let { step, multiple, min } = this
    return ((step * multiple) * index + (min * multiple)) / multiple
  }

  /**
   * 设置控制柄的位置
   */
  setPosition () {
    let { position, currentSlider } = this
    let speed = this.canMove ? 0 : this.speed

    this.setTransitionTime(speed)
    this.setTransform(position[0], currentSlider === 1)
    this.setTransform(position[1], currentSlider === 0)
  }

  /**
   * 设置 控制柄、进度bar的缓动
   *
   * @param {number} time 时间
   */
  setTransitionTime (time) {
    let { processBar } = this
    // 控制柄缓动
    for (let item of this.slider) {
      item.style.transitionDuration = `${time}s`
      item.style.WebkitTransitionDuration = `${time}s`
    }
    // bar 缓动
    processBar.style.transitionDuration = `${time}s`
    processBar.style.WebkitTransitionDuration = `${time}s`
  }

  /**
   * 设置控制柄的位置
   *
   * @param {number} pos 点坐标
   * @param {boolean} isDrag 是否拖拽了进度 bar
   */
  setValueOnPos (pos, isDrag) {
    let { limit, currentSlider, gap, valueLimit } = this
    // 可移动的像素范围
    let range = limit[currentSlider]

    // 可显示的数值范围
    let valueRange = valueLimit[currentSlider]

    // 是不是第二个控制柄
    let isSecondSlider = currentSlider === 1

    if (pos >= range[0] && pos <= range[1]) {
      // 范围内
      this.setTransform(pos)
      // 获得当前位置的值并更新
      let v = this.getValueByIndex(Math.round(pos / gap))
      this.setCurrentValue(v)
    } else if (pos < range[0]) {
      // 拖出了最小边界
      this.setTransform(range[0])
      if (isSecondSlider) {
        this.focusSlider = 0
        this.currentSlider = 0
      }
      this.setCurrentValue(valueRange[0])
    } else {
      // 拖出了最大边界
      this.setTransform(range[1])
      if (!isSecondSlider) {
        this.focusSlider = 1
        this.currentSlider = 1
      }
      this.setCurrentValue(valueRange[1])
    }
  }

  /**
   * 单击设置控制柄
   *
   * @param {Object} e 事件对象
   */
  wrapClick (e) {
    let { disabled, clickable, processDragging, position, isSingle } = this

    if (disabled || !clickable || processDragging) {
      return false
    }

    // 计算距离起点的距离
    let ev = e.targetTouches && e.targetTouches[0] ? e.targetTouches[0] : e
    let pos = this.getPos(ev)

    // 距离谁最近
    if (isSingle) {
      this.currentSlider = 1
    } else {
      this.currentSlider = pos > ((position[1] - position[0]) / 2 + position[0]) ? 1 : 0
    }

    // 控制柄移动
    this.setValueOnPos(pos)
  }

  /**
   * 计算当前控制柄距离起点的距离
   *
   * @param {Object} e 事件对象
   * @returns {number} 像素值
   */
  getPos (e) {
    let { isVertical, size, offset, bodyTop } = this
    return isVertical
      ? (size - (e.pageY + bodyTop - offset))
      : (e.clientX - offset)
  }

  /**
   * 范围修正
   *
   * @param {Array} ran 范围值
   * @returns {Array} 修正后的范围值
   */
  limitValue (ran) {
    let { min, max } = this
    let inRange = r => {
      if (r < min) {
        return min
      } else if (r > max) {
        return max
      }
      return r
    }
    return ran.map((r) => inRange(r))
  }

  /**
   * 数值增加
   */
  valIncrease (num) {
    let { currentValue, min, max, element } = this
    let start = currentValue[0]
    let end = currentValue[1] + +num

    if (end < min || end > max) {
      return logger.warn(element, '请设置范围内的数据')
    }

    this.setValue([start, end])
  }

  /**
   * 初始化 slider bar 尺寸数据
   */
  valReduce (num) {
    let { currentValue, min, max, element } = this
    let start = currentValue[0]
    let end = currentValue[1] - +num

    if (end < min || end > max) {
      return logger.warn(element, '请设置范围内的数据')
    }

    this.setValue([start, end])
  }

  /**
   * 获取配置数据
   */
  setRangeData () {
    let { min, max, step, currentValue, isVertical, sliderBar } = this
    let sliderBarRect = rect.getElementRect(sliderBar)

    // slider bar 的尺寸和偏移量
    let size = this.size = isVertical
      ? sliderBarRect.height
      : sliderBarRect.width

    // 偏移量
    this.offset = isVertical ? sliderBarRect.top : sliderBarRect.left

    // 小数点
    let decimals = `${step}`.split('.')[1]
    this.multiple = decimals ? Math.pow(10, decimals.length) : 1

    // 间隔长度
    this.gap = size / ((max - min) / step)

    // 控制柄距顶端的距离
    this.position = [
      Math.floor((currentValue[0] - min) / step * this.gap),
      Math.floor((currentValue[1] - min) / step * this.gap)
    ]

    // 控制柄本次可移动的 像素 范围
    this.limit = [
      [0, this.position[1]],
      [this.position[0], size]
    ]

    // 控制柄本次可移动的 竖置 范围
    this.valueLimit = [
      [min, currentValue[1]],
      [currentValue[0], max]
    ]
  }

  /**
   * 设置 tip 的内容
   */
  updateTips () {
    let { tipFormat, currentValue, isSingle } = this
    let format = tipFormat ? tipFormat.split('{{tip}}') : ['', '']
    let [prefix, suffix] = format
    let processTips = this.processBar.querySelector('.mip-range-tip')
    let processTipsCls = processTips.parentNode.classList
    let formatValue = currentValue.map(item => prefix + item + suffix)

    this.slider.forEach((item, index) => {
      let tipsEle = item.querySelector('.mip-range-tip')
      let tipsCls = tipsEle.parentNode.classList

      !isSingle && this.isDotHit()
        ? tipsCls.add('hideV')
        : tipsCls.remove('hideV')
      tipsEle.innerHTML = formatValue[index]
    })

    processTips.innerHTML = `${formatValue[0]} - ${formatValue[1]}`

    !isSingle
      ? this.isDotHit()
        ? processTipsCls.remove('hideV')
        : processTipsCls.add('hideV')
      : processTipsCls.add('hideV')
  }

  /**
   * 重置 mip-range 组件
   */
  resetSlider () {
    this.setRangeData()
    this.setPosition()
  }
}
