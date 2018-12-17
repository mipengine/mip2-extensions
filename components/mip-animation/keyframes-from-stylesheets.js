/**
 * @file keysframes-from-stylesheets.js
 * @author chenyongle (chenyongle@baidu.com)
 */

export function extractKeyframes (name) {
  let { styleSheets } = document
  if (!styleSheets) {
    return null
  }
  for (let i = styleSheets.length - 1; i >= 0; i--) {
    let keyframes = scanStyle(styleSheets[i], name)
    if (keyframes) {
      return keyframes
    }
  }
  return null
}

function scanStyle (styleSheet, name) {
  if (!styleSheet.cssRules) {
    return null
  }
  let node = styleSheet.ownerNode
  if (!node) {
    return null
  }
  // mip 好像没有 mip-keyframes
  return scanRules(styleSheet.cssRules, name)
}

function scanRules (rules, name) {
  for (let i = rules.length - 1; i >= 0; i--) {
    let rule = rules[i]
    if (rule.type === 7 && rule.name === name && isEnabled(rule)) {
      return createKeyframes(rule)
    } else if (rule.type === 4 || rule.type === 12) {
      let val = scanRules(rule.cssRules, name)
      if (val) {
        return val
      }
    }
  }
  return null
}

function isEnabled (rule) {
  if (rule.media && rule.media.mediaText) {
    let enabled = window.matchMedia(rule.media.mediaText).matches
    if (!enabled) {
      return false
    }
  }
  if (rule.type === 12) {
    if (!window.CSS || !window.CSS.supports ||
      !window.CSS.supports(rule.conditionText)) {
      return false
    }
  }
  if (rule.parentRule) {
    return isEnabled(rule.parentRule)
  }
  return true
}

function createKeyframes (rule) {
  let arr = []
  for (let i = 0; i < rule.cssRules.length; i++) {
    let keyframeRule = rule.cssRules[i]
    let keyframe = {}
    keyframe['offset'] = keyframeRule.keyText === 'from' ? 0
      : keyframeRule.keyText === 'to' ? 1
        : parseFloat(keyframeRule.keyText) / 100
    let { style } = keyframeRule
    for (let j = 0; j < style.length; j++) {
      let prop = style[j]
      let propName = prop
      if (endWith(prop, 'aniamtion-timing-function')) {
        propName = 'easing'
      }
      keyframe[propName] = style[prop]
    }
    arr.push(keyframe)
  }
  return arr
}
function endWith (string, suffix) {
  let index = string.length - suffix.length
  return index >= 0 && string.indexOf(suffix, index) === index
}
