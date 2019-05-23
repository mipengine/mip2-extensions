const { util } = MIP
const { css } = util

export default class AnimationRunner {
  constructor (el, animationDef) {
    this.animationType = animationDef.animationType
    this.animationName = animationDef.animationName
    this.duration = animationDef.duration
    this.delay = animationDef.delay
    this.el = el
    this.animationDef = animationDef
    this.isRunner = 1
    this.create()
    this.isStart = 0
  }

  create () {
    if (this.animationType === 'CSS_ANIMATION') {
      this.el.classList.add('mip-story-hidden')
      if (this.delay) {
        css(this.el, {
          'animation-delay': this.delay + 'ms'
        })
      }

      if (this.duration) {
        css(this.el, {
          'animation-duration': this.duration + 'ms'
        })
      }
      this.runner = {
        el: this.el
      }
    } else {
      let animationDef = this.animationDef
      animationDef.easing.fill = 'forwards'
      this.runner = this.el.animate(animationDef.keyframes, animationDef.easing)
      this.pause()
    }
  }

  play () {
    if (this.animationType === 'CSS_ANIMATION') {
      this.el.classList.add('animated', this.animationName)
      this.el.classList.remove('mip-story-hidden')
    } else {
      if (this.isStart) {
        return
      }
      // delay属性会造成无法渲染第一帧，所以使用setTimeout来代替delay
      if (this.animationDef.delay) {
        this.timer = setTimeout(() => {
          css(this.el, {visibility: ''})
          this.runner.play()
        }, this.animationDef.delay)
      } else {
        css(this.el, {visibility: ''})
        this.runner.play()
      }
      this.isStart = 1
    }
  }

  pause () {
    if (this.animationType === 'CSS_ANIMATION') {
    } else {
      this.runner.pause()
    }
  }

  cancel () {
    if (this.animationType === 'CSS_ANIMATION') {
      this.el.classList.remove('animated')
      this.el.classList.add('mip-story-hidden')
    } else {
      clearTimeout(this.timer)
      this.isStart = 0
      this.runner.cancel()
    }
  }
}
