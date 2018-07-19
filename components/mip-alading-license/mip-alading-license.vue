<template>
  <div class="wrapper">
    <div class="top"/>
    <div class="content">
      <div class="line-div">
        <div class="line-left">车牌号码</div>
        <div class="line-right">
          <div class="line-right-text">粤</div>
          <div class="line-right-inputbox">
            <input
              class="line-right-input"
              type="text"
              placeholder="请输入车牌号码">
          </div>
        </div>
      </div>
      <div class="line-div">
        <div class="line-left">发动机号</div>
        <div class="line-right">
          <div>
            <input
              type="text"
              placeholder="请输入车牌号码">
          </div>
          <div>
            <mip-img
              layout="responsive"
              width="32"
              height="32"
              src="../../static/img/delete.png"/>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>

.wrapper {
    background: rgba(245,245,245,1);;
    margin: 0 auto;
    text-align: center;
    height: 100%;
}
.top{
  height: 2.125rem;
}
.content{
  padding: 0 0.75rem;
  background: #fff;
}
.line-div {
    background: #fff;
    display: flex;
    flex-direction: row;
    height: 2.3rem;
    justify-content: space-between;
    align-items: center;
    font-size: 0.85rem;
    font-family: PingFang-SC-Medium;
    color: rgba(51, 51, 51, 1);
    /* background: yellow; */
    border-bottom: 1px solid rgba(230,230,230,1);
}
.line-div:last-of-type{
  border-bottom: none;
}
.line-left {
    width: 30%;
    /* background: red; */
    text-align: left;
}
.line-right {
    display: flex;
    flex-direction: row;
    width: 70%;
    /* background: green; */
}
.line-right-text {
  margin-right: 1.125rem;
  height: 2.3rem;
  line-height: 2.3rem;
}
.line-right-inputbox{
  height: 2.3rem;
  /* border: 0;
  font-size: .85rem; */
}
.line-right-input{
  height: 2.3rem;
  border: 0;
  font-size: .8rem;
  line-height: 2.3rem;
}
</style>

<script src="https://cdn.bootcss.com/vue/2.5.17-beta.0/vue.common.js"></script>
<script>
import base from "../../common/utils/base.js";

import '../../common/utils/reset.css'
export default {
    mounted() {
        console.log('Vue',Vue)
        console.log("This is my first custom component !");
        localStorage.setItem('testValue','hphm');
        let bb = localStorage.getItem('testValue');
        console.log(bb)
    },
    created() {
        base.resetRem();
    }
};
</script>
