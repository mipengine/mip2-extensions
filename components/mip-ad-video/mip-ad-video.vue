/**
 * @file detector.js 检测是否使用video原生播放
 * @author espoir-L
 */

<template>
  <div v-show="isShow">
    <!-- <div class="container show-container"> -->
    <div
      v-if="videoIndex + 1 == 2"
      class="container show-container">
      <div class="backgroud"/>
      <div
        class="content show-content"
        @click="gotoAdUrl">
        <div class="content-title">
          <div>观看广告 免费阅读所有章节</div>
          <div v-if="count > 0">{{ count }}秒后可跳过</div>
          <div
            v-else
            @click="closeAd">关闭</div>
        </div>
        <mip-video
          v-if="isShowVideo"
          class="video"
          loop
          muted
          autoplay
          layout="responsive"
          width="640"
          height="360"
          poster="https://www.mipengine.org/static/img/sample_04.jpg"
          src="http://searchvideo.bj.bcebos.com/tsfile%2Fheritage%2Fvideo1.mp4"/>
        <div
          v-else
          class="video">
          <div
            ref="videoCover"
            class="video-cover"/>
          <canvas
            ref="videoCanvas"
            class="video-canvas"/>
        </div>
        <div class="pinpai">品牌广告</div>
      </div>
    </div>
  </div>
</template>
<script>
import detector from './video-detector'

const customStorage = MIP.util.customStorage(0)
const css = MIP.util.css
const isIframed = MIP.viewer.isIframed

const VIDEOINDEX = 'ad-video'
const COUNTDOWNINDEX = 10
const PINZHUANGURL = 'm.baidu.com'
const PRETIME = 'ad-time'

// 由于本次为品专视频广告变现的小流量实验，7月9号需产出效果，
// 因此本次视频写死在组件内部，正式通过实验以后会与品专设置相关格式，修改升级为通用视频广告模板，本次将无属性参数传如；
const POSTER = 'https://www.mipengine.org/static/img/sample_04.jpg'
const TSURL = 'http://searchvideo.bj.bcebos.com/tsfile%2Fheritage%2Fvideo1.ts'
const JSMEGURL = '/components/mip-ad-video/jsmpeg.js'

export default {
  firstInviewCallback () {
    // 初始化所有的视频内容
    this.init()
  },
  data () {
    return {
      count: '',
      timer: null,
      isInitEnd: false,
      close: false
    }
  },
  computed: {
    isShow: function () {
      return isIframed && this.isInitEnd && !this.close && this.isTimeExpired()
    },
    videoIndex: function () {
      console.log(+customStorage.get(VIDEOINDEX))
      return +customStorage.get(VIDEOINDEX)
    },
    isShowVideo: function (params) {
      return detector.isRenderVideoElement()
    }
  },
  methods: {
    init () {
      let self = this
      // 在非ios手百下使用JSMpeg兼容各种机型的视频自动播放
      if (this.isShowVideo) {
        this.isInitEnd = true
        // 初始化播放次数
        this.initVideoIndex()
        // 初始化倒计时器
        this.startTimer()
      } else {
        this.getJSMpeg().then(() => {
          self.initVideo()
          // 初始化播放次数
          self.initVideoIndex()
          // 初始化倒计时器
          self.startTimer()
        })
      }
    },
    getJSMpeg () {
      return new Promise(resolve => {
        let script = document.createElement('script')
        script.type = 'text/javascript'
        script.onload = script.onreadystatechange = function (a) {
          if (!this.readyState || this.readyState === 'loaded' || this.readyState === 'complete') {
            resolve(window.JSMpeg)
          }
        }
        script.src = JSMEGURL
        window.document.body.appendChild(script)
      })
    },
    initVideo () {
      let JSMpeg = window.JSMpeg
      let self = this
      let videoCover = this.$refs.videoCover
      if (videoCover) {
        css(videoCover, {backgroundImage: 'url(' + POSTER + ')'})
        let canvas = this.$refs.videoCanvas
        let attributes = {
          class: 'video',
          loop: '',
          poster: POSTER,
          canvas: canvas
        }
        let tsUrl = TSURL
        let player = new JSMpeg.Player(tsUrl, attributes)
        player.on('playing', () => {
          let event = new Event('playing')
          // 开始播放时展示canvas
          css(canvas, {opacity: '1'})
          self.$element.dispatchEvent(event)
          self.isInitEnd = true
        })

        player.on('play', () => {
          let event = new Event('play')
          self.$element.dispatchEvent(event)
        })

        player.on('end', () => {
          let event = new Event('end')
          self.$element.dispatchEvent(event)
        })
        player.play()
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
      this.readContainerNoScroll()
    },
    readContainerNoScroll () {
      if (this.videoIndex >= 2) {
        document.documentElement.setAttribute('style', 'height: 100% !important; overflow: hidden')
        document.body.setAttribute('style', 'height: 100% !important; overflow: hidden')
      }
    },
    readContainerScroll () {
      if (this.videoIndex >= 2) {
        document.documentElement.setAttribute('style', 'height: auto!important; overflow: auto!important')
        document.body.setAttribute('style', 'height: auto!important; overflow: auto!important')
      }
    },
    startTimer () {
      if (!this.timer) {
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
      if (this.count > 0 && this.count <= COUNTDOWNINDEX) {
        window.top.location.href = PINZHUANGURL
      }
    },
    closeAd () {
      let self = this
      let container = this.$element.querySelector('.container')
      let content = this.$element.querySelector('.content')
      content.classList.remove('show-content')
      content.classList.add('close-content')
      content.addEventListener('animationend', () => {
        container.classList.remove('show-container')
        container.classList.add('close-container')
        container.addEventListener('animationend', () => {
          self.close = true
          self.readContainerScroll()
        })
      })
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
      if (secondsDiff >= 10) {
      // if (dayDiff >= 1) {
        customStorage.clear()
        return true
      }
      return false
    }
  }
}
</script>

<style lang="less">
mip-ad-video {
  height: 100%;
  width: 100%;
  position: absolute !important;
  overflow: hidden;
  color: #fff;
  .container {
    height: 100%;
    width: 100%;
    position: absolute;
    z-index: 100;
    display: flex;
    display:flex;
    align-items: center;
    justify-content: center;
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
      transform: scale(1, 1);
      opacity: 1
    }
    to {
      transform: scale(0, 0);
      opacity: 0
    }
  }

  @-webkit-keyframes close
  {
    from {
      transform: scale(1, 1);
      opacity: 1
    }
    to {
      transform: scale(0, 0);
      opacity: 0
    }
  }

  .show-container {
    animation: show 500ms ease;
    -webkit-animation: show 500ms ease;
    animation-fill-mode: forwards;
    -webkit-animation-fill-mode: forwards;
  }
  .show-content {
    animation: showScale 500ms ease;
    -webkit-animation: showScale 500ms ease;
    animation-fill-mode: forwards;
    -webkit-animation-fill-mode: forwards;
  }
  @keyframes showScale
  {
    from {
      transform: scale(0, 0);
      opacity: 0
    }
    to {
      transform: scale(1, 1);
      opacity: 1
    }
  }
  @-webkit-keyframes showScale
  {
    from {
      transform: scale(0, 0);
      opacity: 0
    }
    to {
      transform: scale(1, 1);
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
      transform: scale(1, 1);
      opacity: 1
    }
    to {
      transform: scale(0, 0);
      opacity: 0
    }
  }
  @-webkit-keyframes closeScale
  {
    from {
      transform: scale(1, 1);
      opacity: 1
    }
    to {
      transform: scale(0, 0);
      opacity: 0
    }
  }
  .backgroud {
    width: 100%;
    height: 100%;
    z-index: 999;
    background-color: black;
    opacity: 0.5;
  }
  .content {
    width: 100%;
    height: 56.5vw;
    z-index: 1000;
    position: absolute;
    &-title {
      padding: 0 8px;
      width: 95%;
      position: absolute;
      z-index: 1001;
      top: 8px;
      display: flex;
      justify-content: space-between;
    }
  }
  .pinpai {
    margin-top: 8px;
  }
  .video {
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
