/**
 * @file mip-fit-text.js
 * @author clark-t (clarktanglei@163.com)
 * @description 同步 amp 组件 [amp-fit-text](https://github.com/ampproject/amphtml/blob/master/extensions/amp-fit-text/0.1/amp-fit-text.js)
 */

import './mip-fit-text.less'

const {CustomElement, util: {css}, viewport} = MIP

function parseLineHeight (val) {
  return parseFloat(val, 10) || 1.15
}

function parseMinFontSize (val) {
  return parseInt(val, 10) || 6
}

function parseMaxFontSize (val) {
  return parseInt(val, 10) || 72
}

/**
 * 计算字体大小，使得内容文本能够最大限度地占满显示区域
 *
 * @param {HTMLElement} measurer 测量节点
 * @param {number} expectedHeight 内容区域高度
 * @param {number} expectedWidth 内容区域宽度
 * @param {number} minFontSize 最小字体大小
 * @param {number} maxFontSize 最大字体大小
 * @returns {number} 字体大小
 */
function calculateFontSize (measurer, expectedHeight, expectedWidth, minFontSize, maxFontSize) {
  maxFontSize++
  // 通过二分法查找
  while (maxFontSize - minFontSize > 1) {
    let mid = Math.floor((minFontSize + maxFontSize) / 2)
    css(measurer, 'fontSize', `${mid}px`)
    let width = measurer.offsetWidth
    let height = measurer.offsetHeight
    if (height > expectedHeight || width > expectedWidth) {
      maxFontSize = mid
    } else {
      minFontSize = mid
    }
  }
  return minFontSize
}

/**
 * 文本溢出探测与更新
 *
 * @param {HTMLElement} content 内容包裹节点
 * @param {HTMLElement} measurer 测量节点
 * @param {number} maxHeight 内容区域最大高度
 * @param {number} fontSize 内容字体大小
 * @param {number} lineHeight 内容行高
 */
function updateOverflow (content, measurer, maxHeight, fontSize, lineHeight) {
  css(measurer, 'fontSize', `${fontSize}px`)
  let overflown = measurer.offsetHeight > maxHeight
  if (overflown) {
    let lineHeightPx = fontSize * lineHeight
    let numberOfLines = Math.floor(maxHeight / lineHeightPx)
    content.classList.add('mip-fit-text-content-overflown')
    css(content, {
      lineClamp: numberOfLines,
      maxHeight: `${lineHeightPx * numberOfLines}px`
    })
  } else {
    content.classList.remove('mip-fit-text-content-overflown')
    css(content, {
      lineClamp: '',
      maxHeight: ''
    })
  }
}

export default class MIPFitText extends CustomElement {
  constructor (...args) {
    super(...args)
    // 获取并浅拷贝组件内容
    // 防止在后续流程中 layout="responsive" 往组件内部添加别的 dom
    this.originalChildNodes = [...this.element.childNodes]
  }

  connectedCallback () {
    this.onResize = this.updateFontSize.bind(this)
    viewport.on('resize', this.onResize)
  }

  disconnectCallback () {
    viewport.off('resize', this.onResize)
  }

  static get observedAttributes () {
    return ['min-font-size', 'max-font-size', 'line-height']
  }

  attributeChangedCallback (name, oldValue, newValue) {
    switch (name) {
      case 'line-height':
        let newLineHeight = parseLineHeight(newValue)
        if (newLineHeight === this.lineHeight) {
          return
        }

        this.lineHeight = newLineHeight
        this.updateLineHeight()
        break

      case 'min-font-size':
        let newMinFontSize = parseMinFontSize(newValue)
        if (newMinFontSize === this.minFontSize) {
          return
        }

        this.minFontSize = newMinFontSize
        break

      case 'max-font-size':
        let newMaxFontSize = parseMaxFontSize(newValue)
        if (newMaxFontSize === this.maxFontSize) {
          return
        }

        this.maxFontSize = newMaxFontSize
        break
    }

    this.updateFontSize()
  }

  build () {
    this.lineHeight = this.lineHeight || parseLineHeight(this.element.getAttribute('line-height'))
    this.minFontSize = this.minFontSize || parseMinFontSize(this.element.getAttribute('min-font-size'))
    this.maxFontSize = this.maxFontSize || parseMaxFontSize(this.element.getAttribute('max-font-size'))

    // 内容节点，用于完全覆盖组件根节点的宽高
    this.content = document.createElement('div')
    this.content.classList.add('mip-fill-content', 'mip-fit-text-content')
    css(this.content, 'zIndex', 2)
    // 内容包裹节点高度由（行高 * 行数）得来，有可能会小于内容节点高度
    // 因此垂直居中于内容节点
    this.contentWrapper = document.createElement('div')
    this.content.appendChild(this.contentWrapper)
    // 测量节点，一个不可见的节点，用于模拟内容节点并用于各种测量和计算
    this.measure = document.createElement('div')

    css(this.measure, {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 1,
      visibility: 'hidden'
    })

    this.updateLineHeight()

    this.originalChildNodes.forEach(node => {
      this.contentWrapper.appendChild(node)
    })
    // 将组件内容拷贝一份到测量节点
    this.measure.innerHTML = this.contentWrapper.innerHTML

    this.element.appendChild(this.content)
    this.element.appendChild(this.measure)

    this.updateFontSize()
  }

  updateLineHeight () {
    if (!this.measure) {
      return
    }

    let val = `${this.lineHeight}em`
    css(this.contentWrapper, 'lineHeight', val)
    css(this.content, 'lineHeight', val)
    css(this.measure, 'lineHeight', val)
  }

  prerenderAllowed () {
    return true
  }

  updateFontSize () {
    if (!this.measure) {
      return
    }

    let maxHeight = this.element.offsetHeight
    let maxWidth = this.element.offsetWidth
    let fontSize = calculateFontSize(
      this.measure,
      maxHeight,
      maxWidth,
      this.minFontSize,
      this.maxFontSize
    )
    css(this.contentWrapper, 'fontSize', `${fontSize}px`)
    updateOverflow(
      this.contentWrapper,
      this.measure,
      maxHeight,
      fontSize,
      this.lineHeight
    )
  }
}
