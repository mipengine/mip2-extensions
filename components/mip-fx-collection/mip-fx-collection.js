/**
 * @file 特效组件
 * @author sekiyika(pengxing@baidu.com)
 */

import './mip-fx-collection.less'
import fxInstallOn from './install'

/**
 * 支持的特效列表
 *
 * @enum {string}
 */
const FX_TYPE = [
  'parallax', 'fade-in', 'fade-in-scroll',
  'fly-in-bottom', 'fly-in-left',
  'fly-in-right', 'fly-in-top'
]

/**
 * 冲突的特效，比如使用了 parallax，就不能用 fly-in-top 和 fly-in-bottom
 *
 * @type {Object.<string, Array.<string>>}
 */
const CONFILICT_FXS = {
  'parallax': ['fly-in-top', 'fly-in-bottom'],
  'fly-in-top': ['parallax', 'fly-in-bottom'],
  'fly-in-bottom': ['fly-in-top', 'parallax'],
  'fly-in-right': ['fly-in-left'],
  'fly-in-left': ['fly-in-right'],
  'fade-in': ['fade-in-scroll'],
  'fade-in-scroll': ['fade-in']
}

class MIPFxCollection {
  constructor () {
    /**
     * The list stores those elments which have been seen.
     *
     * @type {Array.<HTMLElement>}
     * @private
     */
    this.seen_ = []

    this.scan()
  }

  /**
   * scan the entire dom tree, find out all elements with attribute "mip-fx".
   */
  scan () {
    let fxElements = [...document.body.querySelectorAll('[mip-fx]')]

    fxElements.forEach(element => {
      if (this.seen_.indexOf(element) !== -1) {
        return
      }

      this.register(element)
      this.seen_.push(element)
    })
  }

  /**
   * register fx factory.
   *
   * @param {HTMLElement} element the element with attribute "mip-fx"
   */
  register (element) {
    let fxs = this.getFxTypes(element)
    for (let fx of fxs) {
      fxInstallOn(element, fx)
    }
  }

  /**
   * get all fx types, and filter out confilicting fx
   *
   * @param {HTMLElement} element the element with attribute "mip-fx"
   * @returns {Array.<string>} all fx types
   */
  getFxTypes (element) {
    let fxs = element.getAttribute('mip-fx')
      .trim()
      .toLowerCase()
      .split(/\s+/)

    for (let i = 0; i < fxs.length; i++) {
      let fx = fxs[i]
      if (FX_TYPE.indexOf(fx) === -1) {
        fxs.splice(i--, 1)
        console.warn(`mip-fx: ${fx} is not supported, and will be ignored.`)
        continue
      }
      for (let j = i + 1; j < fxs.length; j++) {
        if (CONFILICT_FXS[fx].indexOf(fxs[j]) !== -1) {
          console.warn(
            `mip-fx: ${fxs[j]} can't be used with ${fx} as they have a confliction. ${fxs[j]} will be ignored.`
          )
          fxs.splice(j--, 1)
        }
      }
    }

    return fxs
  }
}

MIP.registerService('mip-fx-collection', MIPFxCollection)
