/**
 * @file mip-slider.vue
 */
<template>
  <div
    ref="wrap"
    :class="['mip-slider', flowDirection, disabledClass, stateClass]"
    :style="wrapStyles"
    @click.stop="wrapClick"
  >
    <div
      ref="sliderBar"
      :style="[elemStyles, barStyle]"
      class="mip-slider-container"
    >
      <template>
        <div
          v-show="!isSingle"
          ref="dot0"
          key="dot0"
          :class="[
            tipStatus,
            'mip-slider-dot'
          ]"
          :style="[dotStyles, dotStyle]"
          @touchstart.stop="dragStart($event, 0)"
          @mousedown.stop="dragStart($event, 0)"
        >
          <div
            ref="tip0"
            :class="['mip-slider-tip-' + tipDirection, 'mip-slider-tip-wrap', {'hideV': hideV}]"
          >
            <span class="mip-slider-tip">{{ val[0] }}
            </span>
          </div>
        </div>
        <div
          ref="dot1"
          key="dot1"
          :class="[tipStatus, 'mip-slider-dot']"
          :style="[dotStyles,dotStyle]"
          @touchstart.stop="dragStart($event, 1)"
          @mousedown.stop="dragStart($event, 1)"
        >
          <div
            ref="tip1"
            :class="['mip-slider-tip-' + tipDirection, 'mip-slider-tip-wrap', {'hideV': hideV}]"
          >
            <span class="mip-slider-tip">{{ val[1] }}</span>
          </div>
        </div>
      </template>
      <div
        ref="process"
        :class="['mip-slider-process', { 'mip-slider-process-dragable': fixRange }]"
        :style="[processRect, processStyle]"
        @touchstart.stop="dragStart($event, 0, true)"
        @mousedown.stop="dragStart($event, 0, true)"
      >
        <div
          ref="mergedtip"
          :class="['mip-slider-tip-' + tipDirection, 'mip-slider-tip-wrap', {'hideV': !hideV}]"
          :style="tipMergedPosition"
          class="mip-merged-tip"
        >
          <span class="mip-slider-tip">
            {{ `${val[0]} — ${val[1]}` }}
          </span>
        </div>
      </div>
      <input
        v-model="val"
        :min="min"
        :max="max"
        class="mip-slider-range"
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
    tip: {
      type: [String, Boolean],
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
      processRect: {}
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
      return `mip-slider-${this.direction}`
    },

    // 合并tip时的位置补偿
    tipMergedPosition () {
      let { tipDirection, isVertial, dotSize, width, height } = this
      let offset = isVertial ? (width / 2) - 9 : (height / 2) - 9

      let style = {}
      style[tipDirection] = `${dotSize / -2 + offset}px`
      return style
    },

    // tip方向
    tipDirection () {
      let { isVertial, tipDir, legalDir } = this

      // 方向是否合法
      let hasDir = legalDir.find((dir) => {
        return tipDir === dir
      })

      return hasDir || (isVertial ? 'left' : 'top')
    },

    // tips显示的时机
    tipStatus () {
      return this.tip === 'hover' && this.canMove ? 'mip-slider-always' : this.tip ? `mip-slider-${this.tip}` : ''
    },

    // tip最终class
    tipClass () {
      return [`mip-slider-tip-${this.tipDirection}`, 'mip-slider-tip']
    },

    // 是否不可以
    disabledClass () {
      return this.disabled ? 'mip-slider-disabled' : ''
    },

    // 状态class
    stateClass () {
      return {
        'mip-slider-state-process-drag': this.processDragging,
        'mip-slider-state-drag': this.canMove && !this.processDragging,
        'mip-slider-state-focus': this.focusFlag
      }
    },

    // 控制柄
    slider () {
      return [this.$refs.dot0, this.$refs.dot1]
    },

    // 读取设置值
    val: {
      get () {
        return this.currentValue
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
    isVertial () {
      return this.direction === 'vertical'
    },

    // 容器样式
    wrapStyles () {
      let { isVertial, width, height, dotSize } = this

      return isVertial ? {
        height: typeof height === 'number' ? `${height}px` : height,
        padding: `${dotSize / 2}px`
      } : {
        width: typeof width === 'number' ? `${width}px` : width,
        padding: `${dotSize / 2}px`
      }
    },

    // 滑动条样式
    elemStyles () {
      let { isVertial, width, height } = this

      return isVertial ? {
        width: `${width}px`,
        height: '100%'
      } : {
        height: `${height}px`
      }
    },

    // 控制柄样式
    dotStyles () {
      let { isVertial, dotSize, width, height } = this

      return isVertial ? {
        width: `${dotSize}px`,
        height: `${dotSize}px`,
        left: `${(-(dotSize - width) / 2)}px`
      } : {
        width: `${dotSize}px`,
        height: `${dotSize}px`,
        top: `${(-(dotSize - height) / 2)}px`
      }
    }
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
      this.$on('setVal', (val, speed) => {
        this.setValue(val, speed)
      })
    },
    /**
     * 绑定事件
     *
     */
    bindEvents () {
      let {dragging, dragComplete, resetSlider, tipHit} = this
      let thisSlider = this.$el

      // 绑定拖拽相关事件
      thisSlider.addEventListener('touchmove', dragging, { passive: false })
      thisSlider.addEventListener('touchend', dragComplete, { passive: false })

      // 支持鼠标
      thisSlider.addEventListener('mousemove', dragging)
      thisSlider.addEventListener('mouseup', dragComplete)
      thisSlider.addEventListener('mouseleave', dragComplete)

      // 视口变动，及时刷新
      viewport.on('resize', resetSlider)

      // 检测碰撞
      this.$refs.dot0.addEventListener('transitionend', tipHit)
      this.$refs.dot1.addEventListener('transitionend', tipHit)
    },

    /**
     * 按下控制点，准备滑动
     *
     * @param {Object} e 事件对象
     * @param {Number} index 控制点下标
     * @param {Boolean} isProcess 触控的是否为进度条
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
     * @param {Number} paramSpeed 速度
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
     * @param {Number} pos 点坐标
     * @param {Boolen} isDrag 是否拖拽了进度bar
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
     * @returns {Number} 像素值
     */
    getPos (e) {
      let { isVertial, size, offset } = this
      return isVertial ? (size - (e.pageY - offset)) : (e.clientX - offset)
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
     * @param {Number} val 数值
     * @param {Boolean} bool 数值
     * @param {Boolean} isAnotherSlider 是不是正在闲着的控制柄
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
     * @param {Number} index 分段刻度值
     * @returns {Number} 当前数值
     */
    getValueByIndex (index) {
      let { step, multiple, min } = this
      return ((step * multiple) * index + (min * multiple)) / multiple
    },

    /**
     * 设置值
     *
     * @param {Array} ran 选中的范围
     * @param {Number} speed 初始样式缓动时间
     */
    setValue (ran, speed) {
      let { limitValue, setPosition, $nextTick } = this

      this.val = [...limitValue(ran)]

      $nextTick(() => setPosition(speed))
    },

    /**
     * 设置控制柄、进度bar位置
     *
     * @param {Number} val 设置位置的数值
     * @param {Boolean} isAnotherSlider 是否为被拖拽的控制柄
     */
    setTransform (val, isAnotherSlider) {
      let { anotherSlider, currentSlider, dotSize, isVertial, position, slider } = this

      let sliderIndex = isAnotherSlider ? anotherSlider : currentSlider

      // 计算 控制点样式
      let offsetValue = isVertial ? ((dotSize / 2) - val) : (val - (dotSize / 2))
      let translateValue = isVertial ? `translateY(${offsetValue}px)` : `translateX(${offsetValue}px)`

      let dragSlider = slider[sliderIndex]
      dragSlider.style.transform = translateValue
      dragSlider.style.WebkitTransform = translateValue

      // 进度bar样式
      let processSize = `${sliderIndex === 0 ? position[1] - val : val - position[0]}px`
      let processPos = `${sliderIndex === 0 ? val : position[0]}px`

      this.processRect = isVertial ? {
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
     * @param {Number} time 时间
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
     * 初始化slider bar 尺寸数据
     *
     */
    getStaticData () {
      let sliderBarRect = rect.getElementRect(this.$refs.sliderBar)

      // slider bar的尺寸和偏移量
      this.size = this.isVertial ? sliderBarRect.height : sliderBarRect.width
      this.offset = this.isVertial ? (sliderBarRect.top + viewport.getScrollTop()) : sliderBarRect.left
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

      // 是否碰撞
      let horHit = !this.isVertial && tipRectL.right > tipRectR.left
      let verHit = this.isVertial && tipRectR.top + tipRectR.height > tipRectL.top

      // 碰撞合并
      horHit || verHit ? this.hideV = 1 : this.hideV = 0
    },

    /**
     * 色值校验
     *
     * @param  {String} color  色值
     */
    checkColor (color) {
      if (color.charAt(0) === '#') {
        color = color.substring(1)
        return [3, 4, 6, 8].indexOf(color.length) > -1 && !isNaN(parseInt(color, 16))
      } else {
        return /^(rgb|hsl)a?\((\d+%?(deg|rad|grad|turn)?[,\s]+){2,3}[\s/]*[\d.]+%?\)$/i.test(color)
      }
    }
  }
}
</script>

<style scoped lang="less">
.mip-slider {
  position: relative;
  box-sizing: border-box;
  user-select: none;

  &.mip-slider-disabled {
    opacity: 0.5;
    cursor: not-allowed;
    .mip-slider-dot {
      cursor: not-allowed;
    }
  }

  .mip-slider-container {
    position: relative;
    display: block;
    border-radius: 15px;
    background: #f5f5f5;
    box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.1);
  }

  .mip-slider-process {
    position: absolute;
    border-radius: 15px;
    background-color: #38f;
    transition: all 0s;
    z-index: 1;
    &.mip-slider-process-dragable {
      cursor: pointer;
      z-index: 3;
    }
  }

  &.mip-slider-horizontal {
    .mip-slider-process {
      width: 0;
      height: 100%;
      top: 0;
      left: 0;
    }

    .mip-slider-dot {
      left: 0;
    }
  }
  &.mip-slider-vertical {
    .mip-slider-process {
      width: 100%;
      height: 0;
      bottom: 0;
      left: 0;
    }

    .mip-slider-dot {
      bottom: 0;
    }
  }

  .mip-slider-dot {
    position: absolute;
    border-radius: 50%;
    background-color: #fff;
    box-shadow: 0.5px 0.5px 2px 1px rgba(0, 0, 0, 0.32);
    transition: all 0s;
    cursor: pointer;
    z-index: 9;
    &.mip-slider-dot-dragging {
      z-index: 5;
    }
    &.mip-slider-always {
      .mip-slider-tip-wrap {
        display: block !important;
      }
    }
  }

  .mip-slider-tip-wrap {
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
    &.hideV {
      visibility: hidden;
    }
    &::after {
      content: '';
      position: absolute;
      display: block;
      width: 0;
      height: 0;
      border-style: solid;
    }
    &.mip-slider-tip {
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

  .mip-slider-range {
    clip: rect(1px, 1px, 1px, 1px);
    height: 1px;
    width: 1px;
    overflow: hidden;
    position: absolute !important;
  }
}

// .mip-slider .mip-slider-dot.mip-slider-always .mip-slider-tip-wrap {
//   display: block !important;
// }
</style>
