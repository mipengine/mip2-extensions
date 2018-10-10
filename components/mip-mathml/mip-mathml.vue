<template>
  <div
    :style="{height, width}"
    class="wrapper">
    <iframe
      v-if="iframeBody"
      :srcdoc="iframeBody"
      class="iframe"
      frameBorder="0"
      scrolling="no" />
  </div>
</template>

<style scoped>
.wrapper {
  margin: 0 auto;
  text-align: center;
}

.iframe {
  display: block;
  width: 0;
  height: 0;
  max-height: 100%;
  min-height: 100%;
  max-width: 100%;
  min-width: 100%;
}
</style>
<script>
export default {
  props: {
    formula: {
      type: String,
      required: true
    },
    inline: {
      type: Boolean,
      default: false
    },
    mathjaxConfig: {
      type: String,
      default: 'TeX-MML-AM_CHTML'
    }
  },
  data () {
    return {
      MATHJAX_CDN: `https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.5/MathJax.js?config=${this.mathjaxConfig}`,
      iframeID: `${Date.now()}_${Math.ceil(Math.random() * 100000)}`,
      iframeBody: null,
      height: 0,
      width: 'auto'
    }
  },
  created () {
    window.addEventListener('message', this.messageHandler)
  },
  beforeDestroy () {
    window.removeEventListener('message', this.messageHandler)
  },
  mounted () {
    if (this.inline) {
      // 如果是内敛要设置父级原生为 inline-block
      this.$el.parentNode.setAttribute('style', `
        display: inline-block;
        vertical-align: middle;
      `)
    }
    this.iframeBody = this.getIframeBody()
  },
  methods: {
    messageHandler (event) {
      if (event.origin === location.origin && event.data && this.iframeID === event.data.iframeID) {
        const {width, height} = event.data

        this.height = `${height}px`

        if (this.inline) {
          this.width = `${width}px`
        }
      }
    },
    getIframeBody () {
      /* eslint-disable no-useless-escape */
      let body = `
      <script type="text/javascript" src="${this.MATHJAX_CDN}"><\/script>
      <div>${this.formula}</div>
      <script>
      MathJax.Hub.Queue(function() {
        var rendered = document.getElementById('MathJax-Element-1-Frame')
        var display = document.getElementsByClassName('MJXc-display')
        // 移除 mathjax 和 body 的默认边距
        if (display[0]) {
          document.body.setAttribute('style','margin:0')
          display[0].setAttribute('style','margin-top:0;margin-bottom:0')
          window.parent.postMessage({
            iframeID: '${this.iframeID}',
            width: rendered.offsetWidth,
            height: rendered.offsetHeight
          }, '*')
        }
      })
      <\/script>
      `
      return body
    }
  }
}
</script>
