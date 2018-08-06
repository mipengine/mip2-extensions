<template>
  <div
    v-if="show"
    class="wrapper">
    <slot/>
  </div>
</template>

<style scoped>
.wrapper {

}
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
    switch (this.os) {
      case 'android':
        isOS = osUA.indexOf('android') > -1
        break
      case 'ios':
        isOS = !!osUA.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/i)
        break
    }
    this.show = isOS
  }
}
</script>
