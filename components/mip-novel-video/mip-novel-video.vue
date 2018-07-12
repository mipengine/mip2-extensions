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
            muted="true"
            class="video"
            autoplay
            webkit-playsinline
            playsinline
            poster="https://ecmb.bdimg.com/adtest/cc74e541725b3d1c426927fe556f834e.jpg"
            src="https://ecmb.bdimg.com/cae-legoup-video-target/bcb262e0-fe62-49e6-9d3f-1649cad66394.mp4"
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

const VIDEOINDEX = 'ad-video'
const COUNTDOWNINDEX = 10
const PINZHUANGURL = 'https://www.vivo.com/vivo/nexs/?cid=w-1-baidu_ada-xs'
const PRETIME = 'ad-time'
const SFHOST = 'm.baidu.com'

const isSF = window.location.hostname === SFHOST

let player = null
let jSMpegPlayer = null
let canvas = null

// 由于本次为品专视频广告变现的小流量实验，7月9号需产出效果，
// 因此本次视频写死在组件内部，正式通过实验以后会与品专设置相关格式，修改升级为通用视频广告模板，本次将无属性参数传如；
const POSTER = 'https://ecmb.bdimg.com/adtest/cc74e541725b3d1c426927fe556f834e.jpg'
const TSURL = 'https://searchvideo.bj.bcebos.com/vivo4.ts'

let isShouldVideo

export default {
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
      let isShow = isSF && detector.getMobileSystemVersion() && !this.played && isShouldVideo
      return !isShow
    },
    isOriginalVideo: function () {
      return detector.isRenderVideoElement()
    }
  },
  created () {
    this.timeExpired()
    this.initVideoIndex()
    isShouldVideo = +customStorage.get(VIDEOINDEX) === 2 || false
    console.log('是否SF：' + (isSF || false) + '；页数：' + customStorage.get(VIDEOINDEX))
    if (isShouldVideo) {
      this.readContainerNoScroll()
    }
  },
  firstInviewCallback () {
    if (isShouldVideo) {
      this.creatVideo()
      this.openVideo()
    }
  },
  methods: {
    openVideo () {
      let self = this
      document.body.addEventListener('touchstart', e => {
        if (self.isShow) {
          self.$element.setAttribute('style', 'display: none !important')
          self.readContainerScroll()
          return
        }
        if (!self.forbidClick) {
          return
        }
        e && e.preventDefault()
        e && e.stopPropagation()
        e && e.stopImmediatePropagation()
        self.startPlayer()
      }, false)
    },
    startPlayer () {
      let self = this
      this.$element.setAttribute('style', 'display: block !important')
      if (player && this.isOriginalVideo) {
        player.play()
        this.startTimer()
      }
      if (jSMpegPlayer && !this.isOriginalVideo) {
        jSMpegPlayer.on('playing', () => {
          let event = new Event('playing')
          this.$element.dispatchEvent(event)
          css(canvas, {opacity: '1'})
          // 初始化倒计时器
          this.startTimer()
        })
        jSMpegPlayer.play()
      }
      /* global _hmt */
      _hmt && _hmt.push(['_trackEvent', 'video', 'show', 'vivo'])
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
      setTimeout(() => {
        self.forbidClick = false
      }, 500)
    },
    creatVideo () {
      if (this.isOriginalVideo) {
        this.initVideo()
      } else {
        this.initCanvasVideo()
      }
    },
    initVideo () {
      let self = this
      player = this.$element.querySelector('video')
      if (player) {
        player.pause()
        player.addEventListener('ended', () => {
          self.closeVideo()
        })
      }
    },
    initCanvasVideo () {
      let videoCover = this.$refs.videoCover
      if (videoCover) {
        css(videoCover, {backgroundImage: 'url(' + POSTER + ')'})
        canvas = this.$refs.videoCanvas
        let attributes = {
          class: 'video',
          loop: false,
          audio: false,
          poster: POSTER,
          canvas: canvas
        }
        let tsUrl = TSURL
        jSMpegPlayer = new JSMpeg.Player(tsUrl, attributes)
        jSMpegPlayer.pause()
        jSMpegPlayer.on('ended', () => {
          let event = new Event('ended')
          this.$element.dispatchEvent(event)
          this.closeVideo()
        })
      }
    },
    initVideoIndex () {
      let videoIndex = customStorage.get(VIDEOINDEX)
      if (videoIndex == null) {
        customStorage.set(VIDEOINDEX, 1)
      } else {
        videoIndex++
        customStorage.set(VIDEOINDEX, videoIndex)
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
        window.top.location.href = PINZHUANGURL
        /* global _hmt */
        _hmt && _hmt.push(['_trackEvent', 'video', 'click', 'vivo'])
      }
    },
    closeVideo (e, isClick) {
      e && e.stopPropagation()
      e && e.preventDefault()
      let self = this
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
        self.readContainerScroll()
        self.forbidClick = true
        self.played = true
        container.classList.add('close-container')
        setTimeout(() => {
          content.classList.add('close-content')
          /* global _hmt */
          isClick && _hmt && _hmt.push(['_trackEvent', 'close', 'click', 'vivo'])
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
      let myDate = new Date().getTime()
      let preTime = customStorage.get(PRETIME)
      if (preTime == null) {
        customStorage.set(PRETIME, myDate)
        return
      }
      let currentTime = myDate
      let diffTime = currentTime - preTime
      // let hoursDiff = parseInt(Math.abs(diffTime) / 1000 / 60 / 60)
      let secondsDiff = parseInt(Math.abs(diffTime) / 1000)
      if (secondsDiff >= 30) {
      // if (hoursDiff >= 24) {
        customStorage.rm(VIDEOINDEX)
        customStorage.rm(PRETIME)
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
