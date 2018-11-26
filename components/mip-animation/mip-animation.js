/**
 * @file mip-animation.js
 * @author clark-t (clarktanglei@163.com)
 */

import WebAnimation from './web-animation'
import playState from './play-state'
// TODO See https://github.com/ampproject/amphtml/issues/18612 and
// https://github.com/web-animations/web-animations-js/issues/46
import 'web-animations-js/web-animations.min.js'

const {CustomElement, util: {jsonParse}} = MIP

const ACTION = [
  'start',
  'restart',
  'pause',
  'resume',
  'togglePause',
  'seekTo',
  'reverse',
  'finish',
  'cancel'
]

export default class MipAnimation extends CustomElement {
  build () {
    let ele = this.element.querySelector('script[type="application/json"]')
    if (!ele) {
      return
    }
    let data = ele.textContent.toString()
    if (!data) {
      return
    }

    this.props = jsonParse(data)

    ACTION.forEach(name => this.addEventAction(name, this[`${name}Action`].bind(this)))

    this.triggered = this.element.getAttribute('trigger') === 'visibility'
  }
  firstInviewCallback () {
    if (this.triggered) {
      this.startAction()
    }
  }
  startAction () {
    this.createAnimationIfNeeded()
    this.animation.start()
  }

  restartAction () {
    if (this.animation) {
      this.animation.cancel()
    } else {
      this.createAnimationIfNeeded()
    }

    this.animation.start()
  }

  resumeAction () {
    if (!this.animation) {
      return
    }
    this.animation.resume()
  }

  pauseAction () {
    if (!this.animation) {
      return
    }
    this.animation.pause()
  }

  togglePauseAction () {
    if (!this.animation) {
      return
    }
    if (this.animation.getPlayState() === playState.PAUSED) {
      this.animation.resume()
    } else {
      this.animation.pause()
    }
  }

  seekToAction (e, time) {
    this.createAnimationIfNeeded()
    this.animation.seekTo(+time)
  }

  reverseAction () {
    if (!this.animation) {
      return
    }
    this.animation.reverse()
  }

  finishAction () {
    if (!this.animation) {
      return
    }
    this.animation.finish()
  }

  cancelAction () {
    if (!this.animation) {
      return
    }
    this.animation.cancel()
  }

  createAnimationIfNeeded () {
    if (!this.animation) {
      this.animation = new WebAnimation(this.props)
      this.animation.onPlayStateChanged(this.onPlayStateChanged.bind(this))
    }
  }

  onPlayStateChanged (state) {
    if (state === playState.FINISHED) {
      this.finishAction()
    }
  }

  onResize () {
    if (!this.animation) {
      return
    }

    let oldPlayState = this.animation.getPlayState()
    this.cancelAction()
    this.animation = null
    if (oldPlayState === playState.RUNNING) {
      this.startAction()
    }
  }
}
