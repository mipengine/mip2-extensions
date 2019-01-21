import {timeago} from './timeago'

export default class MIPTimeAgo extends MIP.CustomElement {
  build () {
    this.datetime = this.element.getAttribute('datetime')
    this.locale = this.element.getAttribute('locale')
    this.cutoff = this.element.getAttribute('cutoff')
    this.title = this.element.textContent.trim()
    this.element.title = this.title
    this.element.textContent = ''

    this.timeElement = document.createElement('time')
    this.setTimestamp()
    this.element.appendChild(this.timeElement)
  }

  setTimestamp () {
    if (this.cutoff) {
      let cutoff = parseInt(this.cutoff, 10)
      let elDate = new Date(+this.datetime)
      let secondsAgo = Math.floor((Date.now() - elDate.getTime()) / 1000)

      // 如果时间距离（当前时间 to 设置时间）比 cutoff 大，则显示组件的原始时间
      if (secondsAgo > cutoff) {
        this.timeElement.textContent = this.title
      } else {
        this.timeElement.textContent = timeago(this.datetime, this.locale)
      }
    } else {
      this.timeElement.textContent = timeago(this.datetime, this.locale)
    }
  }
}
