<template>
  <div
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
      default: ''
    }
  },
  methods: {
    closeBanner () {
      if (this.history) {
        let historyArr = this.history.split(',')
        let func = historyArr[0].trim()
        switch (func) {
          case 'go':
            let step = Number(historyArr[1])
            if (step) {
              window.history.go(step)
            } else {
              console.warn('history.go() 需要填写第二个参数且为数字')
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
  mip-history.mip-history-default > div {
    display: block;
    padding: 10px;
    margin: 10px;
    background: #eee;
    tap-highlight-color: rgba(0, 0, 0, .1);
  }
  mip-history.mip-history-default > div :hover {
    background-color: rgba(0, 0, 0, .1);
  }
</style>
