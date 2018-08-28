<template>
  <div class="wrap">
    <transition name="imgFade">
      <img
        v-show="placeholderShow"
        ref="placeholder"
      >
    </transition>
    <transition name="fade">
      <img
        v-show="imgShow"
        ref="gif"
        :src="src"
        :alt="alt"
      >
    </transition>
    <div class="slot">
      <slot/>
    </div>
  </div>
</template>

<style scoped lang="less">
.background {
  background-color: #aaa;
}

.fade-enter-active {
  opacity: 0;
}

.fade-enter-to {
  opacity: 1;
  transition: opacity linear 240ms;
}

.imgFade-leave-active {
  opacity: 1;
}

.imgFade-leave-to {
  opacity: 0;
  transition: opacity linear 240ms;
}
</style>

<script>
let util = MIP.util
export default {
  props: {
    show: {
      type: Boolean,
      default: false
    },
    src: {
      type: String,
      default: ''
    },
    alt: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      imgShow: false,
      placeholderShow: false
    }
  },
  firstInviewCallback () {
    this.init()
  },
  methods: {
    init () {
      let gif = this.$refs.gif
      let placeholderImg = this.$el.querySelector('.slot mip-img')
      // 判断组件内是否有dom 是否有默认pic 复制默认pic属性到模板mip-img中
      if (placeholderImg && placeholderImg.getAttribute('src')) {
        let placeholder = this.$refs.placeholder
        util.css(placeholder, {
          width: placeholderImg.getAttribute('width'),
          height: placeholderImg.getAttribute('height'),
          src: placeholderImg.getAttribute('src'),
          alt: placeholderImg.getAttribute('alt')
        })
        this.placeholderShow = true
      } else {
        this.placeholderShow = false
      }
      // 有默认图情况
      if (this.placeholderShow) {
        // 有默认图且有gif图情况  gif加载成功前显示默认图
        if (this.src) {
          promiseIf({ img: gif, src: this.src, alt: this.alt }).then(() => {
            this.placeholderShow = false
            this.imgShow = true
          })
          //  只有默认图情况 只显示默认图
        } else {
          this.placeholderShow = true
          this.imgShow = false
        }
        //  只有gif图
      } else {
        this.placeholderShow = false
        this.imgShow = true
        promiseIf({ img: gif, src: this.src, alt: this.alt }).then(() => {
          this.imgShow = true
        })
      }
      // 判断图片是否加载成功
      function promiseIf (data) {
        return new Promise((resolve, reject) => {
          let images = document.createElement('img')
          images.onload = () => {
            resolve()
          }
          images.src = data.src
        })
      }
    }
  }
}
</script>
