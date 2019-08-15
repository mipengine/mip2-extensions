import { shouldRenderVideoElement } from './vedio-detector'
import JSMpeg from './lib/jsmpeg'
import { getAttributeSet } from './utils'
const {
  CustomElement,
  util
} = MIP
const {
  css,
  dom
} = util

export default class MIPStoryVideo extends CustomElement {
  static get observedAttributes () {
    return ['preload']
  }

  /** @override */
  firstInviewCallback () {
    this.loaded = false
  }

  /** @override */
  attributeChangedCallback () {
    if (this.element.hasAttribute('preload') && !this.loaded) {
      this.initStoryVideoElement()
      this.loaded = true
    }
  }

  /**
   * 初始化 video 元素
   */
  initStoryVideoElement () {
    let sourceList = []

    this.attributes = getAttributeSet(this.element.attributes)
    this.sourceDoms = this.element.querySelectorAll('source')

    for (let node of this.sourceDoms) {
      sourceList[node.type] = node.src
    }

    this.sourceList = sourceList
    // 若不支持 JSMpeg 播放，浏览器渲染 mip-video
    if (shouldRenderVideoElement()) {
      this.isVideo = true
      this.renderVideoElement()
    } else {
      this.isVideo = false
      this.renderJSMpeg()
    }
  }

  /**
   * 渲染 video 元素
   */
  renderVideoElement () {
    const poster = this.attributes.poster
    const height = this.attributes.height
    const width = this.attributes.width
    const sourceHTML = this.element.innerHTML
    const isLoop = this.attributes.loop
    let loop = 'loop'
    if (isLoop !== '' && (!isLoop || isLoop === 'false')) {
      loop = ''
    }
    // 创建 mip-video 元素
    const html = `<mip-video layout="responsive" 
      ${loop} class="mip-fill-content mip-replaced-content"
      autoplay height="${height}" width="${width}" poster="${poster}">
      ${sourceHTML}
      </mip-video>`
    const videoElement = dom.create(html)
    this.element.parentNode.insertBefore(videoElement, this.element)
    this.player = videoElement.querySelector('video')
  }

  /**
   * 渲染 JSMpeg 视频播放器
   */
  renderJSMpeg () {
    const posterEl = document.createElement('div')
    const canvas = document.createElement('canvas')
    canvas.className = 'mip-fill-content mip-replaced-content'
    css(canvas, {opacity: '0'})
    // JSMpeg 视频 URL 地址
    const tsUrl = this.sourceList['video/ts']

    if (!tsUrl) {
      console.error('ts file is require')
      return
    }
    // 渲染 poster
    if (this.attributes.poster) {
      posterEl.style.backgroundImage = 'url(' + this.attributes.poster + ')'
      posterEl.style.backgroundSize = '100% 100%'
      posterEl.className = 'mip-fill-content mip-replaced-content'

      this.element.appendChild(posterEl)
    }

    this.attributes.canvas = canvas
    this.element.appendChild(canvas)
    this.option = this.attributes
    // 配置上，只需要对loop做处理
    const isLoop = this.option.loop
    if (isLoop !== '' && (!isLoop || isLoop === 'false')) {
      this.option.loop = false
    } else {
      this.option.loop = true
    }
    this.player = new JSMpeg.Player(tsUrl, this.option)
    this.player.on('playing', () => {
      const event = new Event('playing')
      // 开始播放时展示canvas
      css(canvas, {opacity: '1'})
      this.element.dispatchEvent(event)
    })

    this.player.on('play', () => {
      const event = new Event('play')
      this.element.dispatchEvent(event)
    })

    this.player.on('end', () => {
      const event = new Event('end')
      this.element.dispatchEvent(event)
    })

    this.stop()
  }

  play () {
    if (!this.isVideo) {
      setTimeout(() => {
        this.player.play()
        this.unlockAudio()
      }, 0)
    }
  }

  unlockAudio () {
    this.player.audioOut.unlock()
  }

  stop () {
    if (!this.isVideo) {
      this.player.stop()
    }
  }

  pause () {
    if (!this.isVideo) {
      this.this.player.pause()
    }
  }
}
