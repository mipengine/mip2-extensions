/**
 * @file web-animation.js
 * @author clark-t (clarktanglei@163.com)
 */

/* eslint-disable */

import playState from './play-state'

export default class WebAnimation {
  constructor (config) {
    this.config = config
    this.playStateChangeCallback = []
    this.playState = playState.IDLE
    this.domConfigList = null
    this.animations = null
  }

  init () {
    let domConfigList = getDomConfigList(document, this.config)
    if (!domConfigList || !domConfigList.length) {
      return
    }

    this.domConfigList = domConfigList

    this.animations = domConfigList.map(([dom, config]) => {
      let animation = dom.animate(config.keyframes, config)
      animation.pause()
      return animation
    })

    this.runningCount = this.animations.length

    this.animations.forEach(animation => {
      animation.onfinish = () => {
        this.runningCount--
        if (this.runningCount === 0) {
          this.setPlayState(playState.FINISHED)
        }
      }
    })
  }

  start () {
    if (!this.animations) {
      this.init()
    }

    this.resume()
  }

  pause () {
    if (!this.animations) {
      return
    }

    this.setPlayState(playState.PAUSED)
    this.animations.forEach(animation => {
      if (animation.playState === playState.RUNNING) {
        animation.pause()
      }
    })
  }

  resume () {
    if (!this.animations) {
      return
    }

    let oldPlayState = this.playState
    if (oldPlayState === playState.RUNNING) {
      return
    }

    this.setPlayState(playState.RUNNING)
    this.runningCount = 0
    this.animations.forEach(animation => {
      if (oldPlayState !== playState.PAUSED || animation.playState === playState.PAUSED) {
        this.runningCount++
        animation.play()
      }
    })
  }

  reverse () {
    if (!this.animations) {
      return
    }
    this.animations.forEach(animation => animation.reverse())
  }

  seekTo (time) {
    if (!this.animations) {
      this.init()
    }

    this.pause()

    this.animations.forEach(animation => {
        animation.currentTime = time
      })
  }

  seekToPercent (per) {
    if (per < 0 && per > 1) {
      return
    }
    let totalDuration = this.getTotalDuration()
    let time = totalDuration * per
    this.seekTo(time)
  }

  finish () {
    if (!this.animations) {
      return
    }
    this.setPlayState(playState.FINISHED)
    this.animations.forEach(animation => animation.finish())
    this.animations = null
  }

  cancel () {
    if (!this.animations) {
      return
    }
    this.setPlayState(playState.IDLE)
    this.animations.forEach(animation => animation.cancel())
  }

  onPlayStateChanged (cb) {
    for (let i = 0; i < this.playStateChangeCallback.length; i++) {
      if (this.playStateChangeCallback[i] === cb) {
        return
      }
    }

    this.playStateChangeCallback.push(cb)
  }

  setPlayState (state) {
    if (this.playState !== state) {
      this.playState = state
      this.playStateChangeCallback.forEach(cb => cb(state))
    }
  }

  getPlayState () {
    return this.playState
  }

  getTotalDuration () {
    let totalDuration = 0
    for (let i = 0; i < this.domConfigList.length; i++) {
      let config = this.domConfigList[i][1]
      let iteration = (config.iterations || 1) - (config.iterationStart || 0)
      totalDuration = Math.max(
        totalDuration,
        (config.duration || 0) * iteration + (config.delay || 0) + (config.endDelay || 0)
      )
    }

    return totalDuration
  }
}

function getDomConfigList (rootDom = document, options) {
  if (!options.selector) {
    return []
  }

  let doms = rootDom.querySelectorAll(options.selector)
  if (!doms.length) {
    return []
  }

  // switch
  if (Array.isArray(options.switch) && options.switch.length) {
    options = Object.assign({}, options, getSwitchConfig(options.switch))
  }

  let list = [...doms].map(dom => [dom, options])

  // subtargets
  list = mergeSubtargets(list, options.subtargets, doms)

  return list
}

function getNormalizeConfig (config) {

}

function getSwitchConfig (switchList) {
  if (!Array.isArray(switchList) && !switchList.length) {
    return
  }

  for (let i = 0; i < switchList.length; i++) {
    let obj = switchList[i]
    if (obj.media && typeof window.matchMedia === 'function') {
      if (window.matchMedia(obj.media).matches) {
        return obj
      }
    } else if (obj.supports && window.CSS && typeof window.CSS.supports === 'function') {
      if (window.CSS.supports(obj.supports)) {
        return obj
      }
    }
  }
}

const DOM = 0
const OPTIONS = 1

function mergeSubtargets(list, subtargets, doms) {
  if (Array.isArray(subtargets) && subtargets.length) {
    for (let i = 0; i < subtargets.length; i++) {
      let target = subtargets[i]
      let {index, selector} = target
      if (index) {
        list[index][OPTIONS] = Object.assign({}, list[index][OPTIONS], target)
      } else if (selector) {
        let matchIndex = findMatchIndex(doms, selector)
        if (matchIndex > -1) {
          list[matchIndex][OPTIONS] = Object.assign({}, list[matchIndex][OPTIONS], target)
        }
      }
    }
  }

  return list
}

function match (dom, selector) {
  let matcher = dom.matches ||
    dom.matchesSelector ||
    dom.webkitMatchesSelector ||
    dom.mozMatchesSelector ||
    dom.msMatchesSelector ||
    dom.oMatchesSelector

  return matcher && matcher.call(dom, selector) || false
}

function findMatchIndex (doms, selector) {
  for (let i = 0; i < doms.length; i++) {
    if (match(doms[i], selector)) {
      return i
    }
  }

  return -1
}
