<template>
  <div>
    <transition name="imgFade">
      <mip-img
        v-show="placeholderShow"
        ref="placeholder"
      />
    </transition>
    <transition name="fade">
      <img
        v-show="imgShow"
        ref="gif"
        :src="src"
        :alt="alt"
      >
    </transition>
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
export default {
  props: {
    show: {
      type: Boolean,
      default: false
    },
    srcPlaceholder: {
      type: String,
      default: ''
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
      let me = this
      let gif = this.$refs.gif
      // 判断组件内是否有dom 是否有默认pic 复制默认pic属性到模板mip-img中
      if (Object.keys(this.$slots).length !== 0 && this.$slots.default.length) {
        this.placeholderShow = true
        let placeholder = this.$refs.placeholder
        this.srcPlaceholder = this.$slots.default[0].data.attrs.src
        let obj = this.$slots.default[0].data.attrs
        for (let attr in obj) {
          placeholder.setAttribute(attr, obj[attr])
        }
      }

      // 判断图片是否加载成功
      function promiseIf (data) {
        let promise = new Promise((resolve, reject) => {
          let images = document.createElement('img')
          images.src = data.src
          images.onload = () => {
            resolve()
          }
        })
        return promise
      }

      // 有默认图情况
      if (this.srcPlaceholder) {
        // 有默认图且有gif图情况  gif加载成功前显示默认图
        if (this.src) {
          let promise = promiseIf({ img: gif, src: this.src, alt: this.alt })
          promise.then(() => {
            me.placeholderShow = false
            me.imgShow = true
          })
          //  只有默认图情况 只显示默认图
        } else {
          me.placeholderShow = true
          me.imgShow = false
        }
        //  只有gif图
      } else {
        me.placeholderShow = false
        me.imgShow = true
        let promise = promiseIf({ img: gif, src: this.src, alt: this.alt })
        promise.then(() => {
          me.imgShow = true
        })
      }
    }
  }
}
</script>
