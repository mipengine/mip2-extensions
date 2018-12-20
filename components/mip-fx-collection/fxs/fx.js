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
  }

  /**
   * shortcut for hasAttribute
   *
   * @param {string} name attribute name
   * @returns {boolean} has attribute
   */
  hasAttr (name) {
    return this.element.hasAttribute(name)
  }

  /**
   * shortcut for getAttribute()
   *
   * @param {string} name attribute name
   * @returns {string} attribute value
   */
  attr (name) {
    return this.element.getAttribute(name)
  }

  /**
   * listen to the scroll event of viewport
   */
  install () {
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

  /**
   * sanitize all attributes
   *
   * @abstract
   */
  sanitize () {
    throw new Error('sanitize need to be overrided.')
  }
}
