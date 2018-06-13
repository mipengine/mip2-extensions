<template>
  <div
    :class="defaultClass"
    @click="closeBanner"
  >
    <slot/>
  </div>
</template>

<script>
export default {
  props: {
    history: {
      type: String,
      default: null
    }
  },
  computed: {
    defaultClass () {
      let defaultClass
      if (this.$element &&
        this.$element.className &&
        this.$element.className.indexOf &&
        this.$element.className.indexOf('mip-history-default') > -1
      ) {
        defaultClass = 'mip-history-default'
        return defaultClass
      }
    }
  },
  methods: {
    closeBanner () {
      if (this.history) {
        var historyArr = this.history.split(',')
        var func = historyArr[0]
        switch (func) {
          case 'go':
            var step = historyArr[1]
            if (step) {
              window.history.go(step - 0)
            } else {
              console.warn('history.go() 需要填写第二个参数')
            }
            break
          case 'back':
            window.history.back()
            break
          case 'forward':
            window.history.forward()
            break
        }
      }
    }
  }
}
</script>

<style lang="less" scoped>
  mip-history {
    .mip-history-default {
      display: block;
      padding: 10px;
      margin: 10px;
      background: #eee;
      -webkit-tap-highlight-color: rgba(0,0,0,0.1);
      tap-highlight-color: rgba(0,0,0,0.1);
    }
    .mip-history-default:hover {
      background-color: rgba(0,0,0,0.1);
    }
  }
</style>
