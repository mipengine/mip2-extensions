/**
 * @file mathml 组件
 * @author mj(zoumiaojiang@gmail.com)
 */

/* globals MIP */

import './mip-mathml.less'

const { CustomElement } = MIP

export default class MIPMathml extends CustomElement {
  /**
   * 指定在渲染 layout 的过程中是否出现 loading，默认 true
   *
   * @returns {boolean} 是否展示 loading
   */
  isLoadingEnabled () {
    return true
  }

  async layoutCallback () {
    await this.initialize()
  }

  /**
   * 初始化
   */
  initialize () {
    let ele = this.element
    let inline = ele.hasAttribute('inline')
    let wrapper = document.createElement('div')
    let iframe = document.createElement('iframe')
    let iframeID = this.iframeID = `${Date.now()}_${Math.ceil(Math.random() * 100000)}`

    if (inline) {
      // 如果是内联，要设置父级原生为 inline-block
      ele.style.display = 'inline-block'
      ele.style.verticalAlign = 'middle'
    }

    wrapper.className = 'wrapper'
    iframe.setAttribute('frameBorder', 0)
    iframe.setAttribute('scrolling', 'no')
    iframe.setAttribute('srcdoc', this.getIframeBody())
    wrapper.appendChild(iframe)

    this.applyFillContent(wrapper, true)
    this.element.appendChild(wrapper)

    return new Promise((resolve, reject) => {
      function messageHandler (event) {
        let inline = ele.hasAttribute('inline')

        if (event.origin === window.location.origin &&
          event.data &&
          iframeID === event.data.iframeID
        ) {
          let { width, height } = event.data

          iframe.style.height = `${height}px`

          if (inline) {
            iframe.style.width = `${width}px`
          }

          iframe.style.visibility = 'visible'
          resolve(true)
        }
      }

      window.addEventListener('message', e => messageHandler(e))
    })
  }

  getIframeBody () {
    let ele = this.element
    let mathjaxConfig = ele.getAttribute('mathjaxConfig') || 'TeX-MML-AM_CHTML'
    let formula = ele.getAttribute('formula') || ''
    const MATHJAX_CDN = `https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.5/MathJax.js?config=${mathjaxConfig}`

    return `
      <script type="text/javascript" src="${MATHJAX_CDN}"></script>
      <div>${formula}</div>
      <script>
      MathJax.Hub.Queue(function() {
        var rendered = document.getElementById('MathJax-Element-1-Frame')
        var display = document.getElementsByClassName('MJXc-display')
        if (display[0]) {
          document.body.setAttribute('style','margin:0')
          display[0].setAttribute('style','margin-top:0;margin-bottom:0')
          window.parent.postMessage({
            iframeID: '${this.iframeID}',
            width: rendered.offsetWidth,
            height: rendered.offsetHeight
          }, '*')
        }
      })
      </script>
    `
  }
}
