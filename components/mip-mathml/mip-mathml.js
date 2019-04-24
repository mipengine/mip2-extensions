/**
 * @file mathml 组件
 * @author mj(zoumiaojiang@gmail.com)
 */

/* globals MIP */

import './mip-mathml.less'

const { CustomElement } = MIP

export default class MIPMathml extends CustomElement {
  build () {
    let ele = this.element
    let inline = ele.hasAttribute('inline')
    let height = ele.getAttribute('height')
    let width = ele.getAttribute('width')
    let wrapper = document.createElement('div')
    let mipIframe = document.createElement('iframe')

    if (inline) {
      // 如果是内敛要设置父级原生为 inline-block
      ele.style.display = 'inline-block'
      ele.style.verticalAlign = 'middle'
    }

    wrapper.className = 'wrapper'
    mipIframe.width = width || 'auto'
    mipIframe.height = height || 100
    mipIframe.setAttribute('frameBorder', 0)
    mipIframe.setAttribute('scrolling', 'no')
    mipIframe.setAttribute('srcdoc', this.getIframeBody())

    this.iframe = mipIframe

    wrapper.appendChild(mipIframe)
    this.element.appendChild(wrapper)

    window.addEventListener('message', this.messageHandler)
  }

  disConnectedCallback () {
    window.removeEventListener('message', this.messageHandler)
  }

  messageHandler (event) {
    let inline = this.element.hasAttribute('inline')
    if (event.origin === window.location.origin &&
      event.data &&
      this.iframeID === event.data.iframeID
    ) {
      let { width, height } = event.data

      this.iframe.height = `${height}px`

      if (inline) {
        this.iframe.width = `${width}px`
      }
    }
  }

  getIframeBody () {
    let ele = this.element
    let mathjaxConfig = ele.getAttribute('mathjaxConfig') || 'TeX-MML-AM_CHTML'
    let formula = ele.getAttribute('formula') || ''
    let iframeID = this.iframeID = `${Date.now()}_${Math.ceil(Math.random() * 100000)}`
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
            iframeID: '${iframeID}',
            width: rendered.offsetWidth,
            height: rendered.offsetHeight
          }, '*')
        }
      })
      </script>
    `
  }
}
