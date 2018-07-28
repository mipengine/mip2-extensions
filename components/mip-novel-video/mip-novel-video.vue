**
 * @file detector.js 检测是否使用video原生播放
 * @author espoir-L
 */

<template>
  <div
    class="video-container show-container">
    <div class="video-mask"/>
    <div class="content-video">
      <div class="content show-content">
        <div class="content-title">
          <div class="content-tip">观看广告 免费阅读所有章节</div>
          <div
            v-if="count > 0"
            class="content-count" ><span>{{ count }}秒</span>后可跳过</div>
          <div
            v-else
            class="close-video"
            @click="closeVideo(e, true)">关闭</div>
        </div>
        <div
          v-if="isOriginalVideo"
          class="video"
          @click="gotoAdUrl">
          <video
            ref="mipVideo"
            :poster="poster"
            :src="videourl"
            muted="true"
            class="video"
            autoplay
            webkit-playsinline
            playsinline
          />
        </div>
        <div
          v-else
          class="video">
          <div
            ref="videoCover"
            class="video-cover"
          />
          <canvas
            ref="videoCanvas"
            class="video-canvas"
            @click="gotoAdUrl"/>
        </div>
        <div class="pinpai">
          <div class="pinpai-back"/>
          <div class="pinpai-title">品牌广告</div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import detector from './video-detector'
import JSMpeg from './jsmpeg'

const customStorage = MIP.util.customStorage(0)
const css = MIP.util.css

const COUNTDOWNINDEX = 10
const PREDATE = 'ad-time'

const isSF = !window.MIP.standalone

let player = null
let jSMpegPlayer = null
let canvas = null

let isShouldVideo

export default {
  props: {
    videoid: {
      type: String,
      default: ''
    },
    poster: {
      type: String,
      default: ''
    },
    videourl: {
      type: String,
      default: ''
    },
    tsurl: {
      type: String,
      default: ''
    },
    jumpurl: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      isOpening: false,
      count: COUNTDOWNINDEX,
      timer: null,
      forbidClick: true,
      played: false
    }
  },
  computed: {
    isShow: function () {
      return this.videourl && this.tsurl && isSF && detector.getMobileSystemVersion() && isShouldVideo
    },
    isOriginalVideo: function () {
      return detector.isRenderVideoElement()
    }
  },
  created () {
    if (!this.videourl || !this.tsurl) {
      return
    }
    this.timeExpired()
    this.initVideoIndex()
    isShouldVideo = +customStorage.get(this.videoid) === 2 || false
    if (this.isShow) {
      this.readContainerNoScroll()
    }
  },
  firstInviewCallback () {
    if (this.isShow) {
      this.creatVideo()
      this.openVideo()
    }
  },
  methods: {
    openVideo () {
      let self = this
      document.body.addEventListener('touchstart', e => {
        if (!self.forbidClick || self.played) {
          return
        }
        e && e.preventDefault()
        self.startPlayer()
      }, false)
    },
    startPlayer () {
      let self = this
      this.$element.setAttribute('style', 'display: block !important')
      let forceClose = setTimeout(() => {
        self.closeVideo()
      }, 15000)
      if (player && this.isOriginalVideo) {
        player.addEventListener('playing', () => {
          self.startTimer()
          clearTimeout(forceClose)
        })
        player.play()
      }
      if (jSMpegPlayer && !this.isOriginalVideo) {
        jSMpegPlayer.on('playing', () => {
          let event = new Event('playing')
          this.$element.dispatchEvent(event)
          css(canvas, {opacity: '1'})
          self.startTimer()
          clearTimeout(forceClose)
        })
        jSMpegPlayer.play()
      }
      /* global _hmt */
      _hmt && _hmt.push(['_trackEvent', 'video', 'show', this.videoid])
      this.noVideoMaskScroll()
      setTimeout(() => {
        self.forbidClick = false
      }, 500)
    },
    noVideoMaskScroll () {
      let videoMask = this.$element.querySelector('.video-mask')
      videoMask.addEventListener('touchmove', e => {
        e && e.preventDefault()
        e && e.stopPropagation()
        e && e.stopImmediatePropagation()
        return false
      })
      videoMask.addEventListener('scroll', e => {
        e && e.preventDefault()
        e && e.stopPropagation()
        e && e.stopImmediatePropagation()
        return false
      })
    },
    creatVideo () {
      if (this.isOriginalVideo) {
        this.initVideo()
      } else {
        this.initCanvasVideo()
      }
    },
    initVideo () {
      player = this.$element.querySelector('video')
      if (player) {
        player.pause()
        player.addEventListener('ended', () => {
          this.closeVideo()
        })
      }
    },
    initCanvasVideo () {
      let self = this
      let videoCover = this.$refs.videoCover
      if (videoCover) {
        css(videoCover, {backgroundImage: 'url(' + this.poster + ')'})
        canvas = this.$refs.videoCanvas
        let attributes = {
          class: 'video',
          loop: false,
          audio: false,
          poster: this.poster,
          canvas: canvas
        }
        let tsurl = this.tsurl
        jSMpegPlayer = new JSMpeg.Player(tsurl, attributes)
        jSMpegPlayer.pause()
        jSMpegPlayer.on('ended', () => {
          let event = new Event('ended')
          this.$element.dispatchEvent(event)
          self.closeVideo()
        })
      }
    },
    initVideoIndex () {
      let videoIndex = customStorage.get(this.videoid)
      if (videoIndex == null) {
        customStorage.set(this.videoid, 1)
      } else {
        videoIndex++
        customStorage.set(this.videoid, videoIndex)
      }
    },
    readContainerNoScroll () {
      document.documentElement.setAttribute('style', 'height: 100% !important; overflow: hidden')
      document.body.setAttribute('style', 'height: 100% !important; overflow: hidden')
    },
    readContainerScroll () {
      document.documentElement.setAttribute('style', '')
      document.body.setAttribute('style', '')
    },
    startTimer () {
      if (!this.timer && this.count > 0) {
        this.count = COUNTDOWNINDEX
        this.timer = setInterval(() => {
          if (this.count > 0 && this.count <= COUNTDOWNINDEX) {
            this.count--
          } else {
            clearInterval(this.timer)
            this.timer = null
          }
        }, 1000)
      }
    },
    gotoAdUrl () {
      if (this.forbidClick) return
      if (this.count <= COUNTDOWNINDEX) {
        this.forbidClick = true
        this.played = true
        this.$element.setAttribute('style', 'display: none !important')
        window.top.location.href = this.jumpurl
        /* global _hmt */
        _hmt && _hmt.push(['_trackEvent', 'video', 'click', this.videoid])
      }
    },
    closeVideo (e, isClick) {
      e && e.stopPropagation()
      e && e.preventDefault()
      let container = this.$element.querySelector('.video-container')
      let content = this.$element.querySelector('.content')
      let isClosed = false
      if (player) {
        player.pause()
      }
      if (jSMpegPlayer) {
        jSMpegPlayer.pause()
      }
      if (!isClosed) {
        this.readContainerScroll()
        this.forbidClick = true
        this.played = true
        container.classList.add('close-container')
        let self = this
        setTimeout(() => {
          content.classList.add('close-content')
          /* global _hmt */
          isClick && _hmt && _hmt.push(['_trackEvent', 'close', 'click', this.videoid])
          setTimeout(() => {
            self.$element.setAttribute('style', 'display: none !important')
            container.classList.remove('close-container')
            content.classList.remove('close-content')
          }, 200)
        }, 100)
      }
      isClosed = true
    },
    timeExpired () {
      let myDate = new Date().getDate()
      let preDate = customStorage.get(PREDATE)
      if (preDate == null) {
        customStorage.set(PREDATE, myDate)
        return
      }
      let currentDate = myDate
      if (currentDate !== +preDate) {
        customStorage.rm(this.videoid)
        customStorage.rm(PREDATE)
      }
    }
  }
}

</script>

<style lang="less">
mip-novel-video {
  height: 100%;
  width: 100%;
  position: absolute !important;
  overflow: hidden;
  color: #fff;
  display: none !important;
  font-size: 14px;
  left: 0;
  top: 0;
  span {
    color: #ff6767;
  }
  .video-container {
    height: 100%;
    width: 100%;
    position: absolute;
    z-index: 100;
    opacity: 0;
  }
  .close-container {
    animation: close 500ms ease;
    -webkit-animation: close 500ms ease;
    animation-fill-mode: forwards;
    -webkit-animation-fill-mode: forwards;
  }

  @keyframes close
  {
    from {
      transform: scale3d(1, 1, 1);
      opacity: 1
    }
    to {
      transform: scale3d(0, 0, 0);
      opacity: 0
    }
  }

  @-webkit-keyframes close
  {
    from {
      transform: scale3d(1, 1, 1);
      opacity: 1
    }
    to {
      transform: scale3d(0, 0, 0);
      opacity: 0
    }
  }

  .show-container {
    animation: show 500ms ease;
    -webkit-animation: show 500ms ease;
    animation-fill-mode: forwards;
    -webkit-animation-fill-mode: forwards;
    opacity: 1
  }
  .show-content {
    animation: showScale 500ms ease;
    -webkit-animation: showScale 500ms ease;
    animation-fill-mode: forwards;
    -webkit-animation-fill-mode: forwards;
    opacity: 1
  }
  @keyframes showScale
  {
    from {
      transform: scale3d(0, 0, 0);
      opacity: 0
    }
    to {
      transform: scale3d(1, 1, 1);
      opacity: 1
    }
  }
  @-webkit-keyframes showScale
  {
    from {
      transform: scale3d(0, 0, 0);
      opacity: 0
    }
    to {
      transform: scale3d(1, 1, 1);
      opacity: 1
    }
  }
  .close-content {
    animation: closeScale 500ms ease;
    -webkit-animation: closeScale 500ms ease;
    animation-fill-mode: forwards;
    -webkit-animation-fill-mode: forwards;
  }
  @keyframes closeScale
  {
    from {
      transform: scale3d(1, 1, 1);
      opacity: 1
    }
    to {
      transform: scale3d(0, 0, 0);
      opacity: 0
    }
  }
  @-webkit-keyframes closeScale
  {
    from {
      transform: scale3d(1, 1, 1);
      opacity: 1
    }
    to {
      transform: scale3d(0, 0, 0);
      opacity: 0
    }
  }
  .video-mask {
    width: 100%;
    height: 100%;
    z-index: 998;
    background-color: #000;
    opacity: 0.3;
    position: absolute;
    left: 0;
  }
  .content-video {
    width: 100%;
    height: 100%;
    z-index: 999;
    left: 0;
    position: absolute;
    display: -webkit-flex;
    display:         flex;
    -webkit-align-items: center;
            align-items: center;
    -webkit-justify-content: center;
            justify-content: center;
  }
  .content {
    width: 95%;
    height: 53.5vw;
    z-index: 1000;
    position: relative;
    &-title {
      width: 100%;
      height: 50px;
      line-height: 40px;
      background: -webkit-linear-gradient(top, rgba(0, 0, 0, 1), transparent);
      background:         linear-gradient(top, rgba(0, 0, 0, 1), transparent);
      position: absolute;
      z-index: 1001;
      display: flex;
      justify-content: space-between;
    }
    &-count {
      margin-right: 10px;
    }
    &-tip {
      margin-left: 10px;
    }
  }
  .close-video {
    padding-right: 10px;
    width: 100px;
    text-align: right;
  }
  .pinpai {
    width: 54px;
    height: 23px;
    position: absolute;
    bottom: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .pinpai-back {
    width: 100%;
    height: 100%;
    position: absolute;
    background-color: #666;
    opacity: .75;
    bottom: 0;
  }
  .pinpai-title {
    width: 100%;
    height: 100%;
    z-index: 1;
    font-size: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    position: absolute;
  }
  .video {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;
  }
  .video-cover {
    width: 100%;
    height: 100%;
  }

  @keyframes show
  {
    from {
      opacity: 0
    }
    to {
      opacity: 1
    }
  }

  @-webkit-keyframes show
  {
    from {
      opacity: 0
    }
    to {
      opacity: 1
    }
  }
  .video-cover {
    background-size: cover;
    height: 100%;
    width: 100%;
    position: absolute;
  }
  .video-canvas {
    position: absolute;
    opacity: 0;
    width: 100%;
    height: 100%;
  }
}

</style>
