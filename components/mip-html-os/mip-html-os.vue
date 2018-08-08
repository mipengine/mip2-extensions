<template>
  <div
    v-if="show">
    <slot/>
  </div>
</template>

<style scoped>
</style>

<script>
export default {
  props: {
    os: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      show: false
    }
  },
  created () {
    let isOS = false
    let osUA = navigator.userAgent.toLowerCase()
    if (this.os === 'android') {
      isOS = osUA.indexOf('android') > -1
    } else if (this.os === 'ios') {
      isOS = !!osUA.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/i)
    }
    this.show = isOS
  }
}
</script>
