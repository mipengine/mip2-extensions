<template>
  <div>
    <slot/>
  </div>
</template>

<style scoped>

</style>

<script>
import './mip-semi-fixed.less'

let util = MIP.util
let viewport = MIP.viewport
let viewer = MIP.viewer
let fixedElement = MIP.viewer.fixedElement
/**
 * [YOFFSET 默认fixed top 的距离]
 * @type {integer}
 */
let YOFFSET = 0
/**
 * [STATUS 状态标记对象
 * @type {Object}
 */
const STATUS = {
  STATUS_FIXED: 'mip-semi-fixed-fixedStatus',
  STATUS_SCROLL: 'mip-semi-fixed-scrollStatus'
}

export default {
  props: {
    fixedClassNames: {
      type: String,
      required: true
    },
    threshold: {
      type: Number,
      required: false,
      default: YOFFSET
    }
  },
  mounted () {
    this.init()
  },
  methods: {
    /**
     * [onScroll mip 页面滑动事件]
     *
     * @param  {Object} viewport 视图
     */
    onScroll (viewport) {
      let element = this.$element
      let container = this.$el.children[0]
      let threshold = element.getAttribute('threshold') || YOFFSET
      let fixedClassNames = ' ' + element.getAttribute('fixedClassNames')
      let offsetTop = util.rect.getElementOffset(element).top

      if (offsetTop <= threshold) {
        if (container.className.indexOf(fixedClassNames) < 0) {
          container.className += fixedClassNames
        }
        container.setAttribute(STATUS.STATUS_FIXED, '')
        util.css(container, 'top', threshold + 'px')
      } else {
        container.className = container.className.replace(fixedClassNames, '')
        container.removeAttribute(STATUS.STATUS_FIXED)
        util.css(container, 'top', '')
      }
    },
    /**
     * [onIframeScroll iframe 下 mip 页面滑动事件]
     *
     * @param  {Object} viewport 视图
     */
    onIframeScroll (viewport) {
      let element = this.$element
      let offsetTop = util.rect.getElementOffset(element).top

      if (offsetTop <= this.threshold) {
        util.css(this.fixedContainer.parentNode, {display: 'block'})
        util.css(this.fixedContainer, {opacity: 1})
        util.css(this.container, {opacity: 0})
      } else {
        util.css(this.fixedContainer.parentNode, {display: 'none'})
        util.css(this.fixedContainer, {opacity: 0})
        util.css(this.container, {opacity: 1})
      }
    },
    init () {
      let element = this.$element
      let container = this.$el.children[0]
      let offsetTop = util.rect.getElementOffset(element).top

      if (fixedElement && fixedElement._fixedLayer && element.parentNode === fixedElement._fixedLayer) {
        return
      }

      container = element.querySelector('div[mip-semi-fixed-container]')
      if (!container) {
        console.error('必须有 <div mip-semi-fixed-container> 子节点')
        return
      }
      this.threshold = element.getAttribute('threshold') || YOFFSET
      this.fixedClassNames = ' ' + element.getAttribute('fixedClassNames')
      container.setAttribute(STATUS.STATUS_SCROLL, '')

      // iframe 中
      if (viewer.isIframed && util.platform.isIos()) {
        try {
          let wrapp = fixedElement._fixedLayer.querySelector('#' + element.id)
          this.fixedContainer = wrapp.querySelector('div[mip-semi-fixed-container]')
          this.fixedContainer.className += self.fixedClassNames
          this.fixedContainer.setAttribute(STATUS.STATUS_FIXED, '')
          this.fixedContainer.removeAttribute(STATUS.STATUS_SCROLL)
          util.css(this.fixedContainer, {
            top: this.threshold + 'px',
            opacity: 0
          })
        } catch (e) {
          console.error(e)
        }

        viewport.on('scroll', () => {
          this.onIframeScroll(viewport)
        })
        document.body.addEventListener('touchmove', event => {
          this.onIframeScroll(viewport)
        })
        this.onIframeScroll(viewport)
      } else {
        // 监听滚动事件和 touchmove 事件
        viewport.on('scroll', () => {
          this.onScroll(viewport)
        })
        document.body.addEventListener('touchmove', event => {
          this.onScroll(viewport)
        })
        this.onScroll(viewport)
      }

      // 初始状态为 fixed 时
      if (!util.platform.isIos() && offsetTop <= this.threshold) {
        if (container.className.indexOf(this.fixedClassNames) < 0) {
          container.className += this.fixedClassNames
        }
        container.setAttribute(STATUS.STATUS_FIXED, '')
        util.css(container, 'top', this.threshold + 'px')
      } else if (util.platform.isIos() && viewer.isIframed && offsetTop <= this.threshold) {
        util.css(this.fixedContainer.parentNode, {display: 'block'})
        util.css(this.fixedContainer, {opacity: 1})
        util.css(container, {opacity: 0})
      }

      /**
       * [关闭点击事件]
       */
      this.$on('close', event => {
        event.preventDefault()
        util.css(element, {
          display: 'none'
        })
        if (viewer.isIframed) {
          util.css(this.fixedContainer, {
            display: 'none'
          })
        }
      })
    }
  }
}
</script>
