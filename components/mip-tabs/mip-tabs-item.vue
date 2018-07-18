<template>
  <transition name="fade">
    <div
      v-show="isActive"
      :class="{active: isActive}"
      class="tabs-item"
    >
      <slot/>
    </div>
  </transition>
</template>

<script>
export default {
  props: {
    isActive: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      isNest: false
    }
  },
  watch: {
    isActive (cur, pre) {
      if (cur) {
        let nestTab = this.$el.querySelector('mip-tabs')
        nestTab && nestTab.setAttribute('reset-tab', 'true')
      }
    }
  }
}
</script>

<style lang="less" scoped>
.tabs-item {
  width: 100%;
  margin: 0 auto;
}
.fade-enter-active, .fade-leave-active {
  transition: opacity .3s;
}
.fade-enter, .fade-leave-to {
  opacity: 0;
}
</style>
