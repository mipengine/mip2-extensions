**
 * @file detector.js 检测是否使用video原生播放
 * @author espoir-L
 */

<template>
  <div
    class="container show-container">
    <div class="backgroud"/>
    <div class="container-video">
      <div class="content show-content">
        <div class="content-title">
          <div class="content-tip">观看广告 免费阅读所有章节</div>
          <div
            v-if="count > 0"
            class="content-count" ><span>{{ count }}秒</span>后可跳过</div>
          <div
            v-else
            class="close-ad"
            @click="closeAd">关闭</div>
        </div>
        <div
          v-if="isShowVideo"
          @click="gotoAdUrl">
          <video
            ref="mipVideo"
            class="video"
            muted="true"
            loop
            autoplay
            webkit-playsinline
            playsinline
            layout="responsive"
            width="640"
            height="368"
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
            width="640"
            height="368"
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
const isIframed = MIP.viewer.isIframed

const VIDEOINDEX = 'ad-video'
const COUNTDOWNINDEX = 5
const PINZHUANGURL = 'https://www.vivo.com/vivo/nexs/?cid=w-1-baidu_ada-xs'
const PRETIME = 'ad-time'
let mipPlayer = null
let jSMpegPlayer = null
let canvas = null

// 由于本次为品专视频广告变现的小流量实验，7月9号需产出效果，
// 因此本次视频写死在组件内部，正式通过实验以后会与品专设置相关格式，修改升级为通用视频广告模板，本次将无属性参数传如；
const POSTER = 'https://ecmb.bdimg.com/adtest/cc74e541725b3d1c426927fe556f834e.jpg'
// const TSURL = 'https://searchvideo.bj.bcebos.com/vivo4.ts'
const TSURL = 'https://searchvideo.bj.bcebos.com/tsfile%2Fheritage%2Fvideo1.ts'

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
    isShowVideo: function () {
      return detector.isRenderVideoElement()
    }
  },
  created () {
    let index = +customStorage.get(VIDEOINDEX) + 1
    console.log('是否iframe：' + isIframed + '；页数：' + index)
    if (+customStorage.get(VIDEOINDEX) + 1 === 2) {
      this.readContainerNoScroll()
    }
  },
  firstInviewCallback () {
    // 初始化所有的视频内容
    this.init()
    this.openVideo()
  },
  methods: {
    isShow () {
      let isShow = isIframed && detector.getMobileSystemVersion() && !this.played && +customStorage.get(VIDEOINDEX) === 2
      console.log('version：' + detector.getMobileSystemVersion())
      console.log('第几次刷新：' + customStorage.get(VIDEOINDEX))
      console.log('是否已经播放过：' + this.played)
      return !isShow
    },
    openVideo () {
      let self = this
      this.isTimeExpired()
      document.body.addEventListener('touchstart', e => {
        if (self.isShow()) {
          self.$element.setAttribute('style', 'display: none !important')
          self.readContainerScroll()
          return
        }
        if (!self.forbidClick) {
          return
        }
        e.preventDefault()
        self.$element.setAttribute('style', 'display: block !important')
        if (mipPlayer && self.isShowVideo) {
          mipPlayer.play()
          self.startTimer()
        }
        if (jSMpegPlayer && !self.isShowVideo) {
          jSMpegPlayer.on('playing', () => {
            let event = new Event('playing')
            self.$element.dispatchEvent(event)
            css(canvas, {opacity: '1'})
            // 初始化倒计时器
            self.startTimer()
          })
          jSMpegPlayer.play()
        }
        setTimeout(() => {
          self.forbidClick = false
        }, 500)
      }, false)
    },
    init () {
      let self = this
      // 在非ios手百下使用JSMpeg兼容各种机型的视频自动播放
      if (this.isShowVideo) {
        // 初始化播放次数
        this.initVideoIndex()
        mipPlayer = this.$element.querySelector('video')
        if (mipPlayer) {
          mipPlayer.pause()
        }
      } else {
        self.initVideo()
        self.initVideoIndex()
      }
    },
    initVideo () {
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
      }
    },
    closeAd (e) {
      e.stopPropagation()
      e.preventDefault()
      let self = this
      let container = this.$element.querySelector('.container')
      let content = this.$element.querySelector('.content')
      let isClosed = false
      if (mipPlayer) {
        mipPlayer.pause()
      }
      if (jSMpegPlayer) {
        css(canvas, {opacity: '0'})
        jSMpegPlayer.stop()
      }
      if (!isClosed) {
        self.readContainerScroll()
        self.forbidClick = true
        self.played = true
        container.classList.add('close-container')
        setTimeout(() => {
          content.classList.add('close-content')
          setTimeout(() => {
            self.$element.setAttribute('style', 'display: none !important')
            container.classList.remove('close-container')
            content.classList.remove('close-content')
          }, 300)
        }, 100)
      }
      isClosed = true
    },
    isTimeExpired () {
      let myDate = new Date()
      let preTime = customStorage.get(PRETIME)
      if (preTime == null) {
        customStorage.set(PRETIME, myDate.getTime())
        return true
      }
      let currentTime = myDate.getTime()
      let diffTime = currentTime - preTime
      // 相差天数
      // let dayDiff = Math.floor(diffTime / (24 * 3600 * 1000))
      // 相差小时数
      let hours = diffTime % (24 * 3600 * 1000) // 计算天数后剩余的毫秒数
      // 相差分钟数
      let minutes = hours % (3600 * 1000) // 计算小时数后剩余的毫秒数
      // 相差秒数
      let seconds = minutes % (60 * 1000) // 计算分钟数后剩余的毫秒数
      let secondsDiff = Math.round(seconds / 1000)
      // 此处测试完毕会修改成一天一清
      if (secondsDiff >= 30) {
      // if (dayDiff >= 1) {
        alert('清空')
        customStorage.clear()
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
  span {
    color: #ff6767;
  }
  .container {
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
  .backgroud {
    width: 100%;
    height: 100%;
    z-index: 998;
    background-color: #000;
    opacity: 0.3;
    position: absolute;
    left: 0;
  }
  .container-video {
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
    height: 56vw;
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
  .close-ad {
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
    height: 56.5vw;
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
  }
}

</style>
