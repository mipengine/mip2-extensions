/**
 * @file fx
 * @author sekiyika(pengxing@baidu.com)
 */

export default class Fx {
  /**
   * fx
   *
   * @class
   * @param {HTMLElement} element element
   */
  constructor (element) {
    this.element = element

    /**
     * fx type, need to be overrided by sub class
     * @type {string}
     */
    this.type = ''

    this.onScroll = () => {
      this.update()
    }

    /**
     * if assert_ is false, fx shouldn't be installed on this element
     * @type {boolean}
     * @private
     */
    this.assert_ = true
  }

  /**
   * listen to the scroll event of viewport
   */
  install () {
    if (!this.assert_) {
      return
    }
    MIP.viewport.on('scroll', this.onScroll)
  }

  /**
   * uninstall scroll listener
   */
  uninstall () {
    MIP.viewport.un('scroll', this.onScroll)
  }

  /**
   *
   * @abstract
   */
  assert () {
    throw new Error('assert need to be overrided.')
  }

  /**
   * update should be invoked, once the position of element changed.
   *
   * @abstract
   */
  update () {
    throw new Error('update need to be overrided.')
  }
}
