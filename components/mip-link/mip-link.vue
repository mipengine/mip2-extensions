<template>
  <a
    mip-link
    class="defaultClass"><slot/></a>
</template>

<script>
export default {
  firstInviewCallback () {
    this.init()
  },
  methods: {
    init () {
      let ele = this.$element
      ele.setAttribute('pageType', this.isNoCache() ? 2 : 1)
      let childNodes = ele.childNodes[0]
      childNodes.href = ele.getAttribute('href')
    },
    isNoCache () {
      let cacheMeta = document.querySelector('meta[property="mip:use_cache"]')
      if (cacheMeta && cacheMeta.getAttribute('content') === 'no') {
        return true
      }
      return false
    }
  }
}
</script>

<style scoped>
.defaultClass {
  margin: 0;
  padding: 0;
  width: 100%;
  display: block;
  font-size: 14px;
  color: rgb(0, 0, 0);
}
</style>
