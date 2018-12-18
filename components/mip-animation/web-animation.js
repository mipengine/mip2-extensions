/**
 * @file web-animation.js
 * @author clark-t (clarktanglei@163.com)
 */

import playState from './play-state'
import parseCss from './css-expression'
import {getComputedStyle} from './css-expression-ast'
import {extractKeyframes} from './keyframes-from-stylesheets'
const KEYFRAMES_PROPS = {
  offset: true,
  easing: true
}

const WHITELISTPROPS = {
  'opacity': true,
  'transform': true,
  'transform-origin': true,
  'visibility': true,
  'offset-distance': true,
  'offsetDistance': true
}
/**
 * 经过尝试，duration 不能是字符串，以下 4 个可以，因此可以通过 var 来取值，但是 delay && endDelay 都不能带单位
 */
const NEEDPARSE = {
  delay: true,
  endDelay: true,
  iterations: true,
  iterationStart: true
}
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

  let list = [...doms].map(dom => [dom, JSON.parse(JSON.stringify(options))])

  // subtargets
  list = mergeSubtargets(list, options.subtargets, doms)

  list = list.map(([dom, options], index) => {
    // 这里处理 index(), 代替 css-expression 的 indexNode
    options = changeIndex(options, index)
    // 解析 keyframes 之外的内容，如 delay: var(--x)
    let keys = Object.keys(options)
    for (let key of keys) {
      let str = options[key]
      if (NEEDPARSE[key] && typeof str === 'string') {
        options[key] = parseCss(str, dom, options)
      }
    }
    options.keyframes = createKeyframes(dom, options.keyframes, options)
    return [dom, options]
  })
  return list
}
function changeIndex (obj, index) {
  if (typeof obj === 'string') {
    return obj.replace(/index\(\)/g, index)
  }
  if (Array.isArray(obj)) {
    for (let i = 0; i < obj.length; i++) {
      obj[i] = changeIndex(obj[i], index)
    }
    return obj
  }
  if (Object.prototype.toString.call(obj) === '[object Object]') {
    let keys = Object.keys(obj)
    for (let key of keys) {
      obj[key] = changeIndex(obj[key], index)
    }
    return obj
  }
  return obj
}
function createKeyframes (target, keyframes, options) {
  if (typeof keyframes === 'string') {
    keyframes = extractKeyframes(keyframes)
  }
  if (Object.prototype.toString.call(keyframes) === '[object Object]') {
    let props = Object.keys(keyframes)
    for (let prop of props) {
      if (!validateProp(prop)) {
        throw new SyntaxError('非法的属性！')
      }
      let value = keyframes[prop]
      let computedValue
      if (KEYFRAMES_PROPS[prop]) {
        computedValue = value
      } else if (!Array.isArray(value) || value.length === 1) {
        let from = getComputedStyle(target, options, prop)
        // parse is here for css extensions in value, parse('transform', 'translate(calc(2 * 100vh + width()/2), var(--y))')
        let to = Array.isArray(value) ? value[0] : value
        computedValue = [from, parseCss(to, target, options)]
      } else {
        computedValue = value.map(val => parseCss(val, target, options))
      }
      keyframes[prop] = computedValue
    }
    return keyframes
  }
  if (Array.isArray(keyframes) && keyframes.length > 0) {
    let arr = keyframes
    let newKeyframes = []
    let addFirstFrame = arr.length === 1 || arr[0].offset > 0
    let firstFrame = addFirstFrame ? {} : parseCssMap(arr[0], target, options)
    newKeyframes.push(firstFrame)
    let start = addFirstFrame ? 0 : 1
    for (let i = start; i < arr.length; i++) {
      let val = arr[i]
      let props = Object.keys(val)
      for (let prop of props) {
        if (!validateProp(prop)) {
          throw new SyntaxError('非法的属性！')
        }
        if (KEYFRAMES_PROPS[prop]) {
          continue
        }
        if (!firstFrame[prop]) {
          firstFrame[prop] = getComputedStyle(target, options, prop)
        }
        newKeyframes.push(parseCssMap(val, target, options))
      }
    }
    return newKeyframes
  }
  // 考虑到除去上述3种情况，可能还有其他，不过目前还没有
  throw new Error('keyframes not found')
}
function parseCssMap (obj, target, options) {
  let result = {}
  let keys = Object.keys(obj)
  for (let key of keys) {
    if (key === 'offset') {
      result[key] = obj[key]
    } else {
      result[key] = parseCss(obj[key], target, options)
    }
  }
  return result
}
function validateProp (prop) {
  if (KEYFRAMES_PROPS[prop]) {
    return true
  }
  return WHITELISTPROPS[prop] || false
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

// const DOM = 0
const OPTIONS = 1

function mergeSubtargets (list, subtargets, doms) {
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

  return (matcher && matcher.call(dom, selector)) || false
}

function findMatchIndex (doms, selector) {
  for (let i = 0; i < doms.length; i++) {
    if (match(doms[i], selector)) {
      return i
    }
  }

  return -1
}
