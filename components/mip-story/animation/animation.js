import AnimationRunner from './animation-runner'
import { animatePresets } from './animation-preset'
import { timeStrFormat } from './animation-util'
const { util } = MIP
const {
  EventEmitter,
  fn,
  css
} = util
const extend = fn.extend
const MIP_STORY_ANIMATE_IN_ATTR = 'animate-in'
const MIP_STORY_ANIMATE_IN_DURATION_ATTR = 'animate-in-duration'
const MIP_STORY_ANIMATE_IN_DELAY_ATTR = 'animate-in-delay'
const MIP_STORY_ANIMATE_IN_AFTER_ATTR = 'animate-in-after'
const MIP_STORY_ANIMATE_IN_SELECROR = '[animate-in]'

export function hasAnimations (element) {
  return !!element.querySelectorAll(MIP_STORY_ANIMATE_IN_SELECROR).length
}

export class AnimationManager {
  constructor (page) {
    this.page = page
    const style = window.getComputedStyle(page)
    const DOMMatrix = window.DOMMatrix || window.WebKitCSSMatrix
    const matrix = new DOMMatrix(style.webkitTransform)
    this.offsetX = matrix.m41
    this.sequence = []
    this.init()
  }

  init () {
    const currentEle = this.page
    const animateDom = currentEle.querySelectorAll(MIP_STORY_ANIMATE_IN_SELECROR)

    this.emitter = new EventEmitter()
    for (let el of animateDom) {
      const runner = this.buildRuner(el, this.offsetX)
      let player = {
        runner: runner
      }

      if (el.id) {
        player.id = el.id
      }

      this.sequence.push(player)
    }
  }

  runAllAnimate () {
    let startAfterId
    this.sequence.forEach((player) => {
      startAfterId = player.runner.animationDef.startAfterId
      const runner = this.getRunnerById(startAfterId)
      if (startAfterId && runner) {
        this.waitAndStart(runner, player)
      } else {
        player.runner.play()
      }
    })
  }

  paintFirstFrame () {
    this.sequence.forEach(function (player) {
      // 动画名词可能不存在或拼写错误
      try {
        css(player.runner.el, player.runner.animationDef.keyframes[0])
      } catch (error) {
        // console.log(error);
      }
    })
  }

  getRunnerById (id) {
    let runner = null
    if (id) {
      this.sequence.forEach(function (val) {
        if (val.id === id && val.runner && val.runner.isRunner) {
          runner = val.runner
        }
      })
    }
    return runner
  }

  cancelAllAnimate () {
    this.sequence.forEach((player) => {
      player.runner.cancel()
    })
  }

  waitAndStart (prevPlayer, player) {
    if (prevPlayer.runner && player.runner) {
      this.emitter.on(prevPlayer.el.id, () => {
        player.runner.play()
      })
      prevPlayer.runner.onfinish = () => {
        this.emitter.trigger(prevPlayer.el.id)
      }
    }
  }

  buildRuner (el, offsetX) {
    const animationDef = this.createAnimationDef(el, offsetX)
    const runner = new AnimationRunner(el, animationDef)
    return runner
  }

  getPreset (el) {
    const animationDef = {}
    const name = (String(el.getAttribute(MIP_STORY_ANIMATE_IN_ATTR)).split(/\s+/))[0]
    if (!animatePresets[name]) {
      return {
        animationName: name
      }
    }
    extend(animationDef, animatePresets[name])
    return animationDef
  }

  createAnimationDef (el, offsetX) {
    let keyframes
    let easing
    let offset = el.getBoundingClientRect()
    let animationDef = this.getPreset(el)
    let duration = timeStrFormat(el.getAttribute(MIP_STORY_ANIMATE_IN_DURATION_ATTR))
    let delay = timeStrFormat(el.getAttribute(MIP_STORY_ANIMATE_IN_DELAY_ATTR))
    let after = el.getAttribute(MIP_STORY_ANIMATE_IN_AFTER_ATTR)

    animationDef.delay = delay || 0

    if (after) {
      animationDef.startAfterId = after
    }

    // 如果是animate.css的动画
    if (animationDef.animationName) {
      animationDef.duration = duration
      animationDef.animationType = 'CSS_ANIMATION'
      return animationDef
    }

    offset.pageHeight = window.innerHeight
    offset.pageWidth = window.innerWidth
    offset.realLeft = offset.left - offsetX

    // 处理动画的keyframes
    if (animationDef && animationDef.keyframes) {
      if (typeof animationDef.keyframes === 'function') {
        keyframes = animationDef.keyframes(offset)
      } else {
        keyframes = animationDef.keyframes
      }
    }

    easing = {
      'duration': +duration || animationDef.duration,
      'easing': animationDef.easing || 'ease'
    }

    animationDef.easing = easing
    animationDef.keyframes = keyframes
    animationDef.animationType = 'JS_ANIMATION'
    animationDef.animationName = 'preSet'

    return animationDef
  }
}
