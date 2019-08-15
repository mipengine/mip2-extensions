/**
 * @file 小故事提示层
 */
import QRCode from './lib/qrcode'
const { util } = MIP
const MIP_STORY_HINT_DAMPING_HIDE = 'mip-story-hint-damping-hide'
const MIP_STORY_SYSTEM_SHOW = 'mip-story-system-show'
const FIRST_PAGE_NAVIGATION_OVERLAY_TIMEOUT = 250
const MIP_STORY_HINT_CLASS = '.mip-story-hint'
const MIP_STORY_PAGE_SWITCH_LEFT_CLASS = 'mip-story-page-switch-lt'
const MIP_STORY_PAGE_SWITCH_RIGHT_CLASS = 'mip-story-page-switch-rt'

export default class MIPStoryHint {
  constructor (root) {
    this.rootEl = root
  }

  build () {
    const html = `
    <aside class="mip-story-hint mip-story-hint-damping-hide">
      <div class="mip-story-hint-shadow"></div>
      <div class="mip-story-hint-system">
        <div class="mip-story-hint-left"></div>
          <div class="mip-story-hint-middle">
            <span class="mip-story-hint-middle-top"></span>
            <span class="mip-story-hint-middle-icon">
              <span class="mip-story-hint-touch-icon"></span>
              <span>点击屏幕左右区域</span>
              <span>切换内容</span>
            </span>
            <span class="mip-story-hint-middle-bottom"></span>
          </div>
          <div class="mip-story-hint-right"></div>
        </div>
        <div class="mip-story-hint-rotate">
          <div class="mip-story-hint-img"></div>
          <p>为了更好的体验，请将手机横过来</p>
          <div class="mip-story-qrcode"></div>
        </div>
        <div class="mip-story-page-switch">
          <span class="mip-story-page-switch-left">
            <span></span>
            <span></span>
          </span>
          <span class="mip-story-page-switch-right">
            <span></span>
            <span></span>
          </span>
      </div>
    </aside>`
    return html
  }

  /**
   * 横屏时生成二维码
   */
  generateQRCode () {
    let ele = this.rootEl.querySelector('.mip-story-qrcode')
    return new QRCode(ele, {
      text: window.location.href,
      width: 96,
      height: 96,
      border: 2,
      colorDark: '#000000',
      colorLight: '#ffffff',
      correctLevel: QRCode.CorrectLevel.H
    })
  }

  /**
   * 动画展示蒙层，提示不可滑动
   */
  showDamping () {
    const ele = this.rootEl.querySelector(MIP_STORY_HINT_CLASS)
    util.css(ele, {display: 'block'})
    ele.classList.remove(MIP_STORY_HINT_DAMPING_HIDE)
    setTimeout(() => {
      this.hideDamping()
    }, FIRST_PAGE_NAVIGATION_OVERLAY_TIMEOUT)
  }

  /**
   * 隐藏蒙层
   */
  hideDamping () {
    const ele = this.rootEl.querySelector(MIP_STORY_HINT_CLASS)
    util.css(ele, {display: 'none'})
    ele.classList.add(MIP_STORY_HINT_DAMPING_HIDE)
  }

  /**
   * 展示点击切换页面提示
   */
  showSystemLater () {
    const ele = this.rootEl.querySelector(MIP_STORY_HINT_CLASS)
    util.css(ele, {display: 'block'})
    ele.classList.add(MIP_STORY_SYSTEM_SHOW)
  }

  /**
   * 隐藏点击切换页面提示
   */
  hideSystemLater () {
    const ele = this.rootEl.querySelector(MIP_STORY_HINT_CLASS)
    util.css(ele, {display: 'none'})
    ele.classList.remove(MIP_STORY_SYSTEM_SHOW)
  }

  /**
   * 隐藏/点击切换页面提示
   */
  toggleSystemLater () {
    const ele = this.rootEl.querySelector(MIP_STORY_HINT_CLASS)
    const display = ele.style.display
    if (display === 'block') {
      this.hideSystemLater()
    } else {
      this.showSystemLater()
    }
  }

  showPageSwitchLayer () {
    const hint = this.rootEl.querySelector(MIP_STORY_HINT_CLASS)
    hint.classList.add(MIP_STORY_PAGE_SWITCH_RIGHT_CLASS)
    setTimeout(function () {
      hint.classList.remove(MIP_STORY_PAGE_SWITCH_RIGHT_CLASS)
    }, 400)
  }

  hidePageSwitchLayer () {
    const hint = this.rootEl.querySelector(MIP_STORY_HINT_CLASS)
    hint.classList.add(MIP_STORY_PAGE_SWITCH_LEFT_CLASS)
    setTimeout(function () {
      hint.classList.remove(MIP_STORY_PAGE_SWITCH_LEFT_CLASS)
    }, 400)
  }
}
