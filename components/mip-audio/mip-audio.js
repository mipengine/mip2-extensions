/**
 * @file audio
 * @author fengchuantao, JennyL, TanQihui
 * @time 2016.8.1
 */
import './mip-audio.less'
let {
  CustomElement,
  util
} = MIP
export default class MipAudio extends CustomElement {
  constructor (...args) {
    // 继承父类属性、方法
    super(...args)

    this.audioAttrs = this.getAttributeSet(this.element.attributes)
    // 外层MIP元素，用于默认插入自定义DOM
    this.container = this.element
    // 内层元素，如source及audio失效提示
    this.content = this.element.childNodes
    // 保存用户自定义交互控件
    this.customControls = this.element.querySelector('[controller]') || ''
    this.totalTimeShown = false

    // 属性来自 https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/audio
    this.audioAttributes = [
      'autoplay',
      'buffered',
      'loop',
      'autoplay',
      'muted',
      'played',
      'preload',
      'src',
      'volume'
    ]
  }
  /**
   * Get attribute Set from attribute List
   *
   * @param {NamedNodeMap} attributes the attribute list, spec: https://dom.spec.whatwg.org/#interface-namednodemap
   * @return {Object} the attribute set, legacy:
   * @example
   * {
   *     "src": "http://xx.mp4",
   *     "autoplay": "",
   *     "width": "720"
   * }
   */
  getAttributeSet (attributes) {
    let attrs = {}
    for (let i = 0, len = attributes.length; i < len; i++) {
      attrs[attributes[i].name] = attributes[i].value
    }
    // Array.prototype.slice.apply(attributes).forEach((attr) => {
    //   attrs[attr.name] = attr.value
    // })
    return attrs
  }
  /**
   * 初始化
   *
   * @private
   */
  firstInit () {
    // 根据用户配置创建audio标签，插入文档流
    this.audioElement = this.createAudioTag()
    // 将原来mip-audio内容插入audio.
    // 由于每次元素移出content， content.length会减少, 提前保存length
    let length = this.content.length
    for (let i = 0; i < length; i++) {
      this.audioElement.appendChild(this.content[0])
    }
    this.container.appendChild(this.audioElement)

    // 优先加载音频，让总时间等信息更快返回
    this.audioElement.load()

    // 如果不存在用户自定义DOM，新建交互控件
    if (!this.customControls) {
      this.customControls = this.createDefaultController()
      this.container.classList.add('mip-audio-default-style')
      this.container.innerHTML += this.customControls
    } else {
      // 将用户自定义controller挪出audio
      this.container.appendChild(this.customControls)
    }

    // 事件绑定：获取总播放时长，更新DOM
    // FIXME: 由于ios10手机百度不执行loadedmetadata函数，
    // 魅族自带浏览器在播放前获取总播放时长为0.需要修改
    this.audioElement
      .addEventListener('loadedmetadata', this.applyTotalTime.bind(this), false)

    // 事件绑定：点击播放暂停按钮，播放&暂停音频
    this.container.querySelector('[play-button]')
      .addEventListener('click', this.playOrPause.bind(this), false)

    // 事件绑定：音频播放中，更新时间DOM
    this.audioElement
      .addEventListener('timeupdate', this.timeUpdate.bind(this), false)

    // 事件绑定：拖动进度条事件
    this.bindSeekEvent()

    // 事件绑定：音频播放完毕，显示停止DOM
    this.audioElement
      .addEventListener('ended', this.playEnded.bind(this), false)
  }

  /**
   * 根据用户配置，创建audio标签
   *
   * @private
   * @return {Object} 创建的audio元素
   */
  createAudioTag () {
    let audioEle = document.createElement('audio')
    for (let k in this.audioAttrs) {
      if (this.audioAttrs.hasOwnProperty(k) && this.audioAttributes.indexOf(k) > -1) {
        audioEle.setAttribute(k, this.audioAttrs[k])
      }
    }
    audioEle.classList.add('mip-audio-tag')
    return audioEle
  }

  /**
   * 创建默认交互控件DOM
   *
   * @private
   * @return {string} 创建的audio控件DOM
   */
  createDefaultController () {
    let audioDom =
      `
        <div controller>
          <i play-button class="mip-audio-stopped-icon"></i>
          <div current-time>00:00</div>
          <div seekbar>
            <div seekbar-fill></div>
            <div seekbar-button></div>
          </div>
          <div total-time>--:--</div>
        </div>
      `

    return audioDom
  }

  /**
   * 获取音频总时长 填充DOM, this为 Audio
   * FIXME： 在安卓UC上获取的duration为0.1
   *
   * @private
   */
  applyTotalTime () {
    let duration = this.audioElement.duration
    if (isNaN(duration)) {
      return
    }
    this.container.querySelector('[total-time]').innerHTML = this.msToDate(duration)
  }

  /**
   * 音频播放时更新当前时间 填充DOM, this为 Audio
   *
   * @private
   * @param {number} percent 进度条百分比
   */
  timeUpdate (percent) {
    let now
    // XXX: 在安卓UC上loadedmetadata事件触发获取的duration为0.1，需要重新计算一遍时间。
    if (!this.totalTimeShown) {
      this.applyTotalTime()
      this.totalTimeShown = true
    }
    if (typeof percent === 'number') {
      // 拖动进度条导致需要更新播放位置&当前时间, now为具体时间 90 (s)
      now = this.audioElement.duration * percent
      this.audioElement.currentTime = now
    }

    // 更新进度条
    this.progressShow()

    // now为进度条显示的时间，如1:40
    now = this.msToDate(this.audioElement.currentTime)
    // timeupdate 每秒执行多次，当时间真正改变时才更新dom，减少DOM操作
    if (this.audioElement.currentTimeShown !== now) {
      this.audioElement.currentTimeShown = now
      // 更新当前时间
      this.container.querySelector('[current-time]').innerHTML = now
    }
  }

  /**
   * 音频播放时更新进度条
   *
   * @private
   */
  progressShow () {
    let currentTime = this.audioElement.currentTime
    let percent = currentTime / this.audioElement.duration * 100

    util.css(this.container.querySelector('[seekbar-button]'), 'left', percent + '%')
    util.css(this.container.querySelector('[seekbar-fill]'), 'width', percent + '%')
  }

  /**
   * 时长格式化换算小工具。例 100s -> 1:40
   *
   * @private
   * @param {number} now 秒数
   * @return {string} 格式化后的时间
   */
  msToDate (now) {
    if (isNaN(now)) {
      return '--:--'
    }
    let second = parseInt(now, 10) // 秒

    let minute = 0 // 分
    let hour = 0 // 小时
    if (second > 60) {
      minute = parseInt(second / 60, 10)
      second = parseInt(second % 60, 10)
      if (minute > 60) {
        hour = parseInt(minute / 60, 10)
        minute = parseInt(minute % 60, 10)
      }
    }

    if (second < 10) {
      second = '0' + second
    }

    let result = '' + second
    if (minute === 0) {
      result = '00' + ':' + result
    } else if (minute > 0 && minute < 10) {
      result = '0' + minute + ':' + result
    } else if (minute >= 10) {
      result = minute + ':' + result
    }

    if (hour > 0) {
      result = hour + ':' + result
    }

    return result
  }

  /**
   * 开始&停止播放音频
   *
   * @param {string} action 如为'pause'，强制暂停
   * @private
   */
  playOrPause (action) {
    let classList = this.container.querySelector('[play-button]').classList
    if (!this.audioElement.paused || action === 'pause') {
      // 暂停播放
      this.audioElement.pause()
      classList.remove('mip-audio-playing-icon')
      classList.add('mip-audio-stopped-icon')
    } else {
      // 开始播放
      this.audioElement.play()
      classList.remove('mip-audio-stopped-icon')
      classList.add('mip-audio-playing-icon')
    }
  }

  /**
   * 绑定进度条拖动事件
   *
   * @private
   */
  bindSeekEvent () {
    let button = this.container.querySelector('[seekbar-button]')
    let seekbar = this.container.querySelector('[seekbar]')
    let seekbarProp = seekbar.getBoundingClientRect()

    let seekbarProperty = {
      left: seekbarProp.left,
      width: seekbarProp.width,
      right: seekbarProp.right
    }
    let startX
    let startBtnLeft
    let seekPercent
    // 由于mousemove跟touchmove机制不同，鼠标不按下也会触发
    // 需要一个flag表示鼠标按下状态
    let isSeeking
    // 保存拖动时音频状态：playing paused
    let status = 'paused'
    // 兼容PC端和移动端。移动端不触发mousemove事件，用touchmove代替
    // 是否是移动设备
    let isPhone = 'ontouchmove' in document
    let pointer = 'ontouchmove' in document ? 'touch' : 'mouse'
    // 拖动开始时记录当前位置，是否播放中
    button.addEventListener(isPhone ? 'touchstart' : 'mousedown', e => {
      let event = isPhone ? e.touches[0] : e
      startX = event.clientX
      startBtnLeft = button.offsetLeft + button.offsetWidth * 0.5
      status = this.audioElement.paused ? 'paused' : 'playing'
      isSeeking = true
      this.audioElement.pause()
    }, false)
    // 拖动事件
    this.container.addEventListener(pointer + 'move', e => {
      if (!isSeeking) {
        return
      }

      e.preventDefault()
      e.stopPropagation()

      let event = isPhone ? e.touches[0] : e
      let moveX = event.clientX
      let moveXDelta = moveX - startX

      // 滑块超出右边界
      if (moveX >= seekbarProperty.right + 10) {
        // seekPercent 不能为1，不然会视为播放完成
        // 如果为1，会触发timeupdate使时间清零，导致进度按钮抖动
        seekPercent = 0.9999
      } else if (startBtnLeft + moveXDelta <= 0) { // 滑出右块边界
        seekPercent = 0
      } else { // 正常拖动
        seekPercent = (startBtnLeft + moveXDelta) / seekbarProperty.width
      }
      this.timeUpdate(seekPercent)
    }, false)

    // 结束拖动时，回复之前的播放状态
    button.addEventListener(isPhone ? 'touchend' : 'mouseup', e => {
      isSeeking = false
      if (status === 'playing') {
        this.audioElement.play()
      }
    }, false)
  }

  /**
   * 音频播放到结尾，强制转为暂停
   *
   * @private
   */
  playEnded () {
    this.playOrPause('pause')
    this.timeUpdate(0)
  }

  firstInviewCallback () {
    let ele = this.element
    if (ele.rendered) {
      return
    }
    this.x = 1
    ele.rendered = true
    this.firstInit()
  }
}
