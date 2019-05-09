/**
 * @file 小故事音频
 */
const { util } = MIP

export default class Audio {
  build (element, src) {
    if (!src) {
      return
    }
    const audioEl = document.createElement('audio')
    audioEl.setAttribute('src', src)
    audioEl.setAttribute('preload', 'auto')
    audioEl.setAttribute('loop', '')
    audioEl.setAttribute('autoplay', '')
    util.css(audioEl, {display: 'hidden'})
    element.appendChild(audioEl)
    return audioEl
  }
}
