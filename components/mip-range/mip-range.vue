/**
 * @file mip-range.vue
 */
<template>
  <div
    ref="wrap"
    :class="['mip-range', flowDirection, disabledClass, stateClass]"
    :style="wrapStyles"
    @click.stop="wrapClick"
    @touchmove="dragging"
    @mousemove="dragging"
    @touchend="dragComplete"
    @mouseup="dragComplete"
    @mouseleave="dragComplete"
  >
    <div
      ref="sliderBar"
      :style="[elemStyles, barStyle]"
      class="mip-range-container"
    >
      <template>
        <div
          v-show="!isSingle"
          ref="dot0"
          key="dot0"
          :class="[tipStatus, 'mip-range-dot']"
          :style="[dotStyles, dotStyle]"
          @touchstart.stop="dragStart($event, 0)"
          @mousedown.stop="dragStart($event, 0)"
          @transitionend="tipHit"
        >
          <div
            ref="tip0"
            :style="tipExistTime"
            :class="['mip-range-tip-' + tipDirection, 'mip-range-tip-wrap', {'hideV': hideV}]"
          >
            <span class="mip-range-tip">{{ val[0] }}
            </span>
          </div>
        </div>
        <div
          ref="dot1"
          key="dot1"
          :class="[tipStatus, 'mip-range-dot']"
          :style="[dotStyles, dotStyle]"
          @touchstart.stop="dragStart($event, 1)"
          @mousedown.stop="dragStart($event, 1)"
          @transitionend="tipHit"
        >
          <div
            ref="tip1"
            :style="tipExistTime"
            :class="['mip-range-tip-' + tipDirection, 'mip-range-tip-wrap', {'hideV': hideV}]"
          >
            <span class="mip-range-tip">{{ val[1] }}</span>
          </div>
        </div>
      </template>
      <div
        ref="process"
        :class="['mip-range-process', { 'mip-range-process-dragable': fixRange }]"
        :style="[processRect, processStyle]"
        @touchstart.stop="dragStart($event, 0, true)"
        @mousedown.stop="dragStart($event, 0, true)"
      >
        <div
          ref="mergedtip"
          :class="['mip-range-tip-' + tipDirection, 'mip-range-tip-wrap', {'hideV': !hideV}]"
          :style="tipMergedPosition"
          class="mip-merged-tip"
        >
          <span class="mip-range-tip">
            {{ `${val[0]} — ${val[1]}` }}
          </span>
        </div>
      </div>
      <input
        v-model="val"
        :min="min"
        :max="max"
        class="mip-range-range"
        type="range"
      >
    </div>
  </div>
</template>
<script>
let rect = MIP.util.rect
let viewport = MIP.viewport
export default {
  props: {
    width: {
      type: [Number, String],
      default: 'auto'
    },
    height: {
      type: [Number, String],
      default: 6
    },
    dotSize: {
      type: Number,
      default: 16
    },
    min: {
      type: Number,
      default: 0
    },
    max: {
      type: Number,
      default: 100
    },
    step: {
      type: Number,
      default: 1
    },
    disabled: {
      type: Boolean,
      default: false
    },
    tipShow: {
      type: String,
      default: 'always'
    },
    direction: {
      type: String,
      default: 'horizontal'
    },
    clickable: {
      type: Boolean,
      default: true
    },
    speed: {
      type: Number,
      default: 0.2
    },
    range: {
      type: [String, Number, Array],
      default: 0
    },
    fixRange: {
      type: Boolean,
      default: false
    },
    tipDir: {
      type: String,
      default: ''
    },
    dotStyle: {
      type: [Array, Object],
      default: () => {
        return null
      }
    },
    processStyle: {
      type: [Array, Object],
      default: () => {
        return null
      }
    },
    barStyle: {
      type: [Array, Object],
      default: () => {
        return null
      }
    },
    tipFormat: {
      type: String,
      default: ''
    },
    tipExist: {
      type: [String, Number],
      default: 300
    }
  },
  data () {
    return {
      canMove: false,
      focusFlag: false,
      processDragging: false,
      processSign: null,
      size: 0,
      offset: 0,
      focusSlider: 0,
      currentValue: [0, 0],
      currentSlider: 0,
      hideV: 0,
      legalDir: ['left', 'right', 'top', 'bottom'],
      processRect: {},
      bodyTop: 0,
      change: false,
      isInit: false,
      timer: null
    }
  },
  computed: {
    // 是否为单值
    isSingle () {
      return Array.isArray(this.range) ? 0 : 1
    },
    // range值
    value () {
      if (!Array.isArray(this.range)) {
        return [0, this.range]
      }
      return this.range
    },
    // 方向class
    flowDirection () {
      return `mip-range-${this.direction}`
    },
    // 合并tip时的位置补偿
    tipMergedPosition () {
      let { tipDirection, isVertical, dotSize, width, height } = this
      let offset = isVertical ? (width / 2) - 9 : (height / 2) - 9
      return {
        [tipDirection]: `${dotSize / -2 + offset}px`
      }
    },
    // tip方向
    tipDirection () {
      let { isVertical, tipDir, legalDir } = this
      // 方向是否合法 这里用 Array.prototype.find() 方法 会有兼容问题
      let dirIndex = legalDir.indexOf(tipDir)
      let hasDir = dirIndex > -1 ? tipDir : ''
      return hasDir || (isVertical ? 'left' : 'top')
    },
    // tips显示的时机
    tipStatus () {
      return `mip-range-tip-${this.tipShow}`
    },
    // 是否不可以
    disabledClass () {
      return this.disabled ? 'mip-range-disabled' : ''
    },
    // 状态class
    stateClass () {
      return {
        'mip-range-state-process-drag': this.processDragging,
        'mip-range-state-drag': this.canMove && !this.processDragging,
        'mip-range-state-focus': this.focusFlag,
        'mip-range-state-change': this.change
      }
    },
    // 控制柄
    slider () {
      return [this.$refs.dot0, this.$refs.dot1]
    },
    // 读取设置值
    val: {
      get () {
        let { tipFormat, currentValue } = this
        let format = tipFormat ? tipFormat.split('{{tip}}') : ['', '']
        let [prefix, suffix] = format
        return currentValue.map((item) => {
          return prefix + item + suffix
        })
      },
      set (val) {
        this.currentValue = val
      }
    },
    // 小数点
    multiple () {
      let decimals = `${this.step}`.split('.')[1]
      return decimals ? Math.pow(10, decimals.length) : 1
    },
    // 间隔长度
    gap () {
      let { min, max, size, step } = this
      return size / ((max - min) / step)
    },
    // 控制柄距顶端的距离
    position () {
      let { currentValue, min, step, gap } = this
      return [(currentValue[0] - min) / step * gap, (currentValue[1] - min) / step * gap]
    },
    // 控制柄本次可移动的 像素 范围
    limit () {
      let { position, size } = this
      return [[0, position[1]], [position[0], size]]
    },
    // 控制柄本次可移动的 竖置 范围
    valueLimit () {
      let { min, max, currentValue } = this
      return [[min, currentValue[1]], [currentValue[0], max]]
    },
    // 非激活状态的控制柄下标
    anotherSlider () {
      return this.currentSlider === 0 ? 1 : 0
    },
    // 是否为垂直方向
    isVertical () {
      return this.direction === 'vertical'
    },
    // tip存在时间
    tipExistTime () {
      return {
        'transition-duration': `${this.tipExist}ms`
      }
    },
    // 容器样式
    wrapStyles () {
      let { isVertical, width, height, dotSize } = this
      return isVertical
        ? {
          height: typeof height === 'number' ? `${height}px` : height,
          padding: `${dotSize / 2}px`
        }
        : {
          width: typeof width === 'number' ? `${width}px` : width,
          padding: `${dotSize / 2}px`
        }
    },
    // 滑动条样式
    elemStyles () {
      let { isVertical, width, height } = this
      return isVertical
        ? {
          width: `${width}px`,
          height: '100%'
        }
        : {
          height: `${height}px`
        }
    },
    // 控制柄样式
    dotStyles () {
      let { isVertical, dotSize, width, height } = this
      return isVertical
        ? {
          width: `${dotSize}px`,
          height: `${dotSize}px`,
          left: `${(-(dotSize - width) / 2)}px`
        }
        : {
          width: `${dotSize}px`,
          height: `${dotSize}px`,
          top: `${(-(dotSize - height) / 2)}px`
        }
    }
  },
  watch: {
    currentValue (val) {
      if (!this.isInit) {
        return
      }
      this.change = true
      this.$emit('dragging', val)
    }
  },
  prerenderAllowed () {
    return true
  },
  mounted () {
    this.$nextTick(() => {
      this.getStaticData()
      this.setValue(this.limitValue(this.value), 0)
      this.bindEvents()
      this.registerEvent()
    })
  },
  methods: {
    /**
     * 注册事件
     *
     */
    registerEvent () {
      // 设置值
      this.$on('setVal', (e, val) => {
        let valCon = JSON.parse(val)
        valCon = valCon.length === 1 ? [0, ...valCon] : valCon
        this.setValue(valCon)
      })
      // 获取值
      this.$on('getVal', () => {
        return this.currentValue
      })
      // 值增加
      this.$on('valIncrease', (e, num) => {
        let numCon = num ? parseInt(num, 10) : this.step
        numCon = isNaN(numCon) ? this.step : numCon
        this.valIncrease(numCon)
      })
      // 值减小
      this.$on('valReduce', (e, num) => {
        let numCon = num ? parseInt(num, 10) : this.step
        numCon = isNaN(numCon) ? this.step : numCon
        this.valReduce(numCon)
      })
    },
    /**
     * 绑定事件
     *
     */
    bindEvents () {
      // 视口变动，及时刷新
      viewport.on('resize', this.resetSlider)
      // iframe下，纵向 slider 高度补偿
      viewport.on('scroll', () => {
        this.bodyTop = rect.getElementRect(document.body).top
      })
    },
    /**
     * 按下控制点，准备滑动
     *
     * @param {Object} e 事件对象
     * @param {number} index 控制点下标
     * @param {boolean} isProcess 触控的是否为进度条
     */
    dragStart (e, index = 0, isProcess) {
      let { canMove, setTransitionTime, disabled, fixRange, isSingle, position, getPos } = this
      //  控制点无缓动
      canMove || setTransitionTime(0)
      if (disabled) return false
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
          start: getPos((e.targetTouches && e.targetTouches[0]) ? e.targetTouches[0] : e)
        }
      } else {
        this.focusFlag = true
        this.focusSlider = index
      }
      this.canMove = true
      this.$emit('dragStart', this.currentValue)
    },
    /**
     * 拖动
     *
     * @param {Object} e 事件对象
     */
    dragging (e) {
      e.preventDefault()
      let { canMove, processDragging, getPos, processSign, setValueOnPos } = this
      if (!canMove) return false
      let ev = e.targetTouches && e.targetTouches[0] ? e.targetTouches[0] : e
      if (processDragging) {
        // 两个控制柄同时移动
        this.currentSlider = 0
        setValueOnPos(processSign.pos[0] + getPos(ev) - processSign.start, true)
        this.currentSlider = 1
        setValueOnPos(processSign.pos[1] + getPos(ev) - processSign.start, true)
      } else {
        setValueOnPos(getPos(ev), true)
      }
      // 检测两个tip是否碰撞
      this.tipHit()
    },
    /**
     * 拖动结束
     *
     */
    dragComplete () {
      // 不是有效拖动
      if (!this.canMove) {
        return false
      }
      // 派发drag-end事件 并复位
      this.$emit('dragEnd', this.currentValue)
      this.canMove = false
      setTimeout(() => {
        this.processDragging = false
      }, 0)
      this.setPosition()
    },
    /**
     * 设置控制柄最终位置
     *
     * @param {number} paramSpeed 速度
     */
    setPosition (paramSpeed) {
      let { canMove, position, currentSlider, setTransform, setTransitionTime } = this
      canMove || setTransitionTime(paramSpeed === undefined ? this.speed : paramSpeed)
      setTransform(position[0], currentSlider === 1)
      setTransform(position[1], currentSlider === 0)
    },
    /**
     * 设置控制柄的位置
     *
     * @param {number} pos 点坐标
     * @param {boolean} isDrag 是否拖拽了进度bar
     */
    setValueOnPos (pos, isDrag) {
      let { limit, currentSlider, gap, valueLimit, setTransform, getValueByIndex, setCurrentValue } = this
      // 可移动的像素范围
      let range = limit[currentSlider]
      // 可显示的数值范围
      let valueRange = valueLimit[currentSlider]
      // 是不是第二个控制柄
      let isSecondSlider = currentSlider === 1
      if (pos >= range[0] && pos <= range[1]) {
        // 范围内
        setTransform(pos)
        // 获得当前位置的值并更新
        let v = getValueByIndex(Math.round(pos / gap))
        setCurrentValue(v, isDrag)
      } else if (pos < range[0]) {
        // 拖出了最小边界
        setTransform(range[0])
        setCurrentValue(valueRange[0])
        if (isSecondSlider) {
          this.focusSlider = 0
          this.currentSlider = 0
        }
      } else {
        // 拖出了最大边界
        setTransform(range[1])
        setCurrentValue(valueRange[1])
        if (!isSecondSlider) {
          this.focusSlider = 1
          this.currentSlider = 1
        }
      }
    },
    /**
     * 计算当前控制柄距离起点的距离
     *
     * @param {Object} e 事件对象
     * @returns {number} 像素值
     */
    getPos (e) {
      let {isVertical, size, offset, bodyTop} = this
      return isVertical ? (size - (e.pageY + bodyTop - offset)) : (e.clientX - offset)
    },
    /**
     * 单击设置控制柄
     *
     * @param {Object} e 事件对象
     */
    wrapClick (e) {
      let { disabled, clickable, processDragging, position, setValueOnPos, isSingle } = this
      if (disabled || !clickable || processDragging) return false
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
      setValueOnPos(pos)
    },
    /**
     * 设置当前数值
     *
     * @param {number} val 数值
     * @param {boolean} bool 数值
     * @param {boolean} isAnotherSlider 是不是正在闲着的控制柄
     */
    setCurrentValue (val, bool, isAnotherSlider) {
      let { min, max, anotherSlider, currentSlider } = this
      let slider = isAnotherSlider ? anotherSlider : currentSlider
      if (val < min || val > max) return false
      // 更新并设置数值
      this.currentValue.splice(slider, 1, val)
      bool || this.setPosition()
    },
    /**
     * 计算当前控制点的值
     *
     * @param {number} index 分段刻度值
     * @returns {number} 当前数值
     */
    getValueByIndex (index) {
      let { step, multiple, min } = this
      return ((step * multiple) * index + (min * multiple)) / multiple
    },
    /**
     * 设置值
     *
     * @param {Array} ran 选中的范围
     * @param {number} speed 初始样式缓动时间
     */
    setValue (ran, speed) {
      let { limitValue, setPosition, $nextTick } = this
      this.val = [...limitValue(ran)]
      $nextTick(() => setPosition(speed))
    },
    /**
     * 设置控制柄、进度bar位置
     *
     * @param {number} val 设置位置的数值
     * @param {boolean} isAnotherSlider 是否为被拖拽的控制柄
     */
    setTransform (val, isAnotherSlider) {
      let { anotherSlider, currentSlider, dotSize, isVertical, position, slider } = this
      let sliderIndex = isAnotherSlider ? anotherSlider : currentSlider
      this.isInit = true
      // 计算 控制点样式
      let offsetValue = isVertical ? ((dotSize / 2) - val) : (val - (dotSize / 2))
      let translateValue = isVertical ? `translateY(${offsetValue}px)` : `translateX(${offsetValue}px)`
      let dragSlider = slider[sliderIndex]
      dragSlider.style.transform = translateValue
      dragSlider.style.WebkitTransform = translateValue
      // 进度bar样式
      let processSize = `${sliderIndex === 0 ? position[1] - val : val - position[0]}px`
      let processPos = `${sliderIndex === 0 ? val : position[0]}px`
      this.processRect = isVertical ? {
        'height': processSize,
        'bottom': processPos
      } : {
        'width': processSize,
        'left': processPos
      }
    },
    /**
     * 设置 控制柄、进度bar的缓动
     *
     * @param {number} time 时间
     */
    setTransitionTime (time) {
      let process = this.$refs.process
      // 控制柄缓动
      for (let item of this.slider) {
        item.style.transitionDuration = `${time}s`
        item.style.WebkitTransitionDuration = `${time}s`
      }
      // bar缓动
      process.style.transitionDuration = `${time}s`
      process.style.WebkitTransitionDuration = `${time}s`
    },
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
    },
    /**
     * 数值增加
     *
     */
    valIncrease (num) {
      let {setValue, currentValue} = this
      currentValue = [currentValue[0], currentValue[1] + +num]
      setValue(currentValue)
    },
    /**
     * 初始化slider bar 尺寸数据
     *
     */
    valReduce (num) {
      let {setValue, currentValue} = this
      currentValue = [currentValue[0], currentValue[1] - +num]
      setValue(currentValue)
    },
    /**
     * 初始化slider bar 尺寸数据
     *
     */
    getStaticData () {
      let sliderBarRect = rect.getElementRect(this.$refs.sliderBar)
      // slider bar的尺寸和偏移量
      this.size = this.isVertical ? sliderBarRect.height : sliderBarRect.width
      this.offset = this.isVertical ? (sliderBarRect.top + viewport.getScrollTop()) : sliderBarRect.left
    },
    /**
     * 重置mip组件
     *
     */
    resetSlider () {
      this.getStaticData()
      this.setPosition()
    },
    /**
     * 处理 tip 接触
     *
     */
    tipHit () {
      let tipRectL = rect.getElementRect(this.$refs.tip0)
      let tipRectR = rect.getElementRect(this.$refs.tip1)
      // class延迟去除
      let delayTime = parseInt(this.tipExist, 10)
      clearTimeout(this.timer)
      this.timer = setTimeout(() => {
        this.change = false
      }, delayTime)
      // 是否碰撞
      let horHit = !this.isVertical && tipRectL.right > tipRectR.left
      let verHit = this.isVertical && tipRectR.top + tipRectR.height > tipRectL.top
      // 碰撞合并
      horHit || verHit ? this.hideV = 1 : this.hideV = 0
    }
  }
}
</script>

<style scoped lang="less">
/* stylelint-disable no-descending-specificity */
.mip-range {
  position: relative;
  box-sizing: border-box;
  user-select: none;

  &.mip-range-disabled {
    opacity: 0.5;
    cursor: not-allowed;

    .mip-range-dot {
      cursor: not-allowed;
    }
  }

  .hideV {
    visibility: hidden;
  }

  .mip-range-container {
    position: relative;
    display: block;
    border-radius: 15px;
    background: #f5f5f5;
    box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.1);

    .mip-range-dot {
      .mip-range-tip-wrap {
        opacity: 0;
        transition-property: opacity;
        transition-timing-function: ease-in-out;
      }
    }

    .mip-range-tip {
      &-always {
        .mip-range-tip-wrap {
          opacity: 0.5;
        }
      }

      &-none {
        .mip-range-tip-wrap {
          opacity: 0 !important;
        }
      }
    }
  }

  &.mip-range-state-process-drag,
  &.mip-range-state-drag {
    .mip-range-tip {
      &-dragging {
        .mip-range-tip-wrap {
          opacity: 0.5;
        }
      }
    }
  }

  &.mip-range-state-change {
    .mip-range-tip {
      &-change {
        .mip-range-tip-wrap {
          opacity: 0.5;
        }
      }
    }
  }

  .mip-range-process {
    position: absolute;
    border-radius: 15px;
    background-color: #38f;
    transition: all 0s;
    z-index: 1;

    &.mip-range-process-dragable {
      cursor: pointer;
      z-index: 3;
    }
  }

  &.mip-range-horizontal {
    .mip-range-process {
      width: 0;
      height: 100%;
      top: 0;
      left: 0;
    }

    .mip-range-dot {
      left: 0;
    }
  }

  &.mip-range-vertical {
    .mip-range-process {
      width: 100%;
      height: 0;
      bottom: 0;
      left: 0;
    }

    .mip-range-dot {
      bottom: 0;
    }
  }

  .mip-range-dot {
    position: absolute;
    border-radius: 50%;
    background-color: #fff;
    box-shadow: 0.5px 0.5px 2px 1px rgba(0, 0, 0, 0.32);
    transition: all 0s;
    cursor: pointer;
    z-index: 9;
    -webkit-user-select: none;
    -webkit-tap-highlight-color: transparent;

    &.mip-range-dot-dragging {
      z-index: 5;
    }
  }

  .mip-range-tip-wrap {
    position: absolute;
    z-index: 9;
    display: block;
    font-size: 14px;
    white-space: nowrap;
    padding: 2px 5px;
    min-width: 20px;
    text-align: center;
    color: #fff;
    border-radius: 5px;
    background: #000;
    opacity: 0.5;

    &::after {
      content: '';
      position: absolute;
      display: block;
      width: 0;
      height: 0;
      border-style: solid;
    }

    &.mip-range-tip {
      &-top {
        top: -9px;
        left: 50%;
        transform: translate(-50%, -100%);

        &::after {
          left: 50%;
          top: 100%;
          margin-left: -4px;
          border-width: 6px 4px 0 4px;
          border-color: #000 transparent transparent transparent;
        }
      }

      &-bottom {
        bottom: -9px;
        left: 50%;
        transform: translate(-50%, 100%);

        &::after {
          left: 50%;
          bottom: 100%;
          margin-left: -4px;
          border-width: 0 4px 6px 4px;
          border-color: transparent transparent #000 transparent;
        }
      }

      &-left {
        top: 50%;
        left: -9px;
        transform: translate(-100%, -50%);

        &::after {
          left: 100%;
          top: 50%;
          margin-top: -4px;
          border-width: 4px 0 4px 6px;
          border-color: transparent transparent transparent #000;
        }
      }

      &-right {
        top: 50%;
        right: -9px;
        transform: translate(100%, -50%);

        &::after {
          right: 100%;
          top: 50%;
          margin-top: -4px;
          border-width: 4px 6px 4px 0;
          border-color: transparent #000 transparent transparent;
        }
      }
    }
  }

  .mip-range-range {
    height: 1px;
    width: 1px;
    visibility: hidden;
    overflow: hidden;
    position: absolute !important;
  }
}
</style>
