<template>
  <div>
    <div class="container">
      <!-- 弹框 -->
      <div
        v-if="isShowDeleteBox"
        id="modal"
        class="modal">
        <div class="modal-content">
          <h4 class="tip">提示</h4>
          <div class="modal-body">
            <p id="tip1">是否确定清除车辆信息</p>
          </div>
          <footer class="modal-footer">
            <div
              id="cancel"
              @click="cancalDeleteBox"
            >取消</div>
            <div
              id="sure"
              @click="deleteConfirm">确定</div>
          </footer>
        </div>
      </div>
      <!-- 没有输入信息就跳到结果页--其实不太可能 -->
      <div
        v-if="noInfo"
        id="newerror">
        <mip-img
          id="tu"
          width="84"
          height="84"
          src="../static/img/tu.png" />
        <h1 class="weihuzhong">您所输入的信息有误，无法<br>查询到违章信息，请重新输入正确信息</h1>
        <div
          id="inputagain"
          @click="inputAgain">点击重新输入</div>
      </div>
      <!-- 驾驶证输入错误的信息 -->
      <div
        v-if="wrongInfo_license"
        id="newerror">
        <mip-img
          id="tu"
          width="84"
          height="84"
          src="../static/img/tu.png" />
        <h1 class="weihuzhong">您所输入的信息有误，无法<br>查询到违章信息，请重新输入正确信息</h1>
        <div
          id="inputagain"
          @click="inputAgain">点击重新输入</div>
      </div>
      <!-- 车辆输入了错误的信息 -->
      <div
        v-if="wrongInfo"
        id="newerror2">
        <mip-img
          id="tu"
          width="84"
          height="84"
          src="../static/img/tu.png" />
        <h1 class="weihuzhong">暂无法查询违章信息，可能原因如下：</h1>
        <h1 class="weihuzhong2">1.你的车辆是以下其中一种状态：转出，被盗抢，注销，达到报废标准<br>2.你所输入的车辆查询信息有误</h1>
        <div
          id="inputagain"
          @click="inputAgain">点击重新输入</div>
      </div>
      <!-- 输入正确且有返回的情况 -->
      <div v-if="!noInfo && !wrongInfo && !wrongInfo_license">
        <!-- license 驾驶证 -->
        <div v-if="isLicense">
          <div id="idcard">
            <div class="top">
              <p id="id_carid">
                {{ id_license }}
              </p>
              <div @click="deleteCardOrLicense">
                <mip-img
                  id="delete"
                  layout="responsive"
                  width="200"
                  height="200"
                  src="../static/img/delete.png" />
              </div>
            </div>
            <div class="middle">
              <div id="weizhang">
                <div class="weizhangcishu">
                  {{ weizhangcishu_license }}
                </div>
                <div class="weizhangtext">违章</div>
              </div>
              <div id="fakuan">
                <div class="fakuanshu">
                  {{ fakuanshu_license }}
                </div>
                <div class="fakuantext">罚款</div>
                <div class="fengexian" />
              </div>
              <div id="koufen">
                <div class="koufenshu">
                  {{ koufenshu_license }}
                </div>
                <div class="koufentext">扣分</div>
                <div class="fengexian" />
              </div>
            </div>
            <div class="bottom1">
              <div>
                <div class="bottom1_left">
                  <div class="tyyxqz">
                    检验有效期至：{{ tyyxqz_license }}
                  </div>
                  <div class="qzbfsj">
                    强制报废时间：{{ qzbfsj_license }}
                  </div>
                </div>
                <div id="leijijifen">
                  累计记分：{{ leijijifen_license }}分
                </div>
              </div>
            </div>
            <div class="bottom2">
              <div id="staus">
                <div id="staus_left">
                  状态
                </div>
                <div id="id_staus_right">
                  {{ status_license }}
                </div>
              </div>
            </div>
          </div>
          <div
            v-if="hasLicenseIllegal"
            class="two_button">
            <div
              class="ckwddd"
              @click="ckwddd">查看我的订单</div>
            <div
              class="ljblwz"
              @click="ljblwz">立即办理违章</div>
          </div>
          <div
            v-if="!hasLicenseIllegal"
            class="two_button">
            <div
              class="ckwddd"
              @click="ckwddd">查看我的订单</div>
            <div class="ljblwz_no">立即办理违章</div>
          </div>
          <div class="cxjg">
            <div class="zfgx" />
            <div class="cxjgtext">查询结果</div>
            <div class="yfgx" />
          </div>
          <div
            v-if="hasLicenseIllegal"
            class="cxjgresult">
            <div
              v-for="item in results_license"
              :key="item.index">
              <div class="cxjgitem_1">{{ item.cljgmc }}</div>
              <div class="cxjgfgx" />
              <div class="weifadetail">
                <div class="weifashijian">
                  <div class="time_left_item">违法时间</div>
                  <div class="time_right_item">{{ item.wfsj }}</div>
                </div>
                <div class="weifadizhi">
                  <div class="address_left_item">违法地址</div>
                  <div class="address_right_item">{{ item.wfdz }}</div>
                </div>
                <div class="weifaxingwei">
                  <div class="behavior_left_item">违法行为</div>
                  <div class="behavior_right_item">{{ item.wfxw }}}</div>
                </div>
                <div class="fakuanjine">
                  <div class="jine_left_item">罚款金额</div>
                  <div class="jine_right_item">
                  <strong class="amount">{{ item.fkje }}</strong>元</div>
                </div>
                <div class="weijijifen">
                  <div class="jifen_left_item">违纪记分</div>
                  <div class="jifen_right_item">
                  <strong class="amount">{{ item.wfjfs }}</strong>分</div>
                </div>
                <div class="zhinajin">
                  <div class="zhinajin_left_item">滞纳金</div>
                  <div class="zhinajin_right_item">
                    <strong class="amount">{{ item.znj }}</strong>元
                  </div>
                </div>
                <div class="juedingshubianhao">
                  <div class="juedingshu_left_item">决定书编号</div>
                  <div class="juedingshu_right_item">{{ item.jdsbh }}</div>
                </div>
              </div>
            </div>
          </div>
          <div
            v-if="!hasLicenseIllegal"
            class="noresult">
            <mip-img
              id="tu"
              width="84"
              height="84"
              src="../static/img/tu.png" />
            <h1 class="noweifa">恭喜你尚无新违法记录</h1>
            <div
              class="chufajuedingshu"
              @click="cxwzcl">查询车辆违章</div>
          </div>
        </div>
        <!-- card 车辆 -->
        <div v-if="isCard">
          <div id="license">
            <div class="top">
              <p id="carid">
                {{ id_card }}
              </p>
              <div @click="deleteCardOrLicense">
                <mip-img
                  id="delete"
                  layout="responsive"
                  width="200"
                  height="200"
                  src="../static/img/delete.png" />
              </div>
            </div>
            <div class="middle">
              <div id="weizhang">
                <div class="weizhangcishu">
                  {{ weizhangcishu }}
                </div>
                <div class="weizhangtext">违章</div>
              </div>
              <div id="fakuan">
                <div class="fakuanshu">
                  {{ fakuanshu }}
                </div>
                <div class="fakuantext">罚款</div>
                <div class="fengexian" />
              </div>
              <div id="koufen">
                <div class="koufenshu">
                  {{ koufenshu }}
                </div>
                <div class="koufentext">扣分</div>
                <div class="fengexian" />
              </div>
            </div>
            <div class="bottom1">
              <div>
                <div class="bottom1_left">
                  <div class="tyyxqz">
                    <!-- 审核有效期：{{tyyxqz}} -->
                    检验有效期至：{{ tyyxqz }}
                  </div>
                  <div class="qzbfsj">
                    <!-- 下次体检日期: {{qzbfsj}} -->
                    强制报废时间：{{ qzbfsj }}
                  </div>
                </div>
                <div class="bottom1_right">
                  办理六年免检
                </div>
              </div>
            </div>
            <div class="bottom2">
              <div id="staus">
                <div id="staus_left">
                  状态
                </div>
                <div id="staus_right">
                  {{ status }}
                </div>
              </div>
            </div>
          </div>
          <div
            v-if="hasCardIllegal"
            class="two_button">
            <div
              class="ckwddd"
              @click="ckwddd">查看我的订单</div>
            <div
              class="ljblwz"
              @click="ljblwz">立即办理违章</div>
          </div>
          <div
            v-if="!hasCardIllegal"
            class="two_button">
            <div
              class="ckwddd"
              @click="ckwddd">查看我的订单</div>
            <div class="ljblwz_no">立即办理违章</div>
          </div>
          <div class="cxjg">
            <div class="zfgx" />
            <div class="cxjgtext">查询结果</div>
            <div class="yfgx" />
          </div>
          <div
            v-if="hasCardIllegal"
            class="cxjgresult">
            <div
              v-for="item in results"
              :key="item.index">
              <div class="cxjgitem_1">{{ item.cjjgmc }}</div>
              <div class="cxjgfgx" />
              <div class="weifadetail">
                <div class="weifashijian">
                  <div class="time_left_item">违法时间</div>
                  <div class="time_right_item">{{ item.wfsj }}</div>
                </div>
                <div class="weifadizhi">
                  <div class="address_left_item">违法地址</div>
                  <div class="address_right_item">{{ item.wfdz }}</div>
                </div>
                <div class="weifaxingwei">
                  <div class="behavior_left_item">违法行为</div>
                  <div class="behavior_right_item">{{ item.wfxw }}}</div>
                </div>
                <div class="fakuanjine">
                  <div class="jine_left_item">罚款金额</div>
                  <div class="jine_right_item">
                  <strong class="amount">{{ item.fkje }}</strong>元</div>
                </div>
                <div class="weijijifen">
                  <div class="jifen_left_item">违纪记分</div>
                  <div class="jifen_right_item">
                  <strong class="amount">{{ item.wfjfs }}</strong>分</div>
                </div>
              </div>
            </div>
            <!-- 查询时有结果的话在这里插入内容 -->
          </div>
          <div
            v-if="!hasCardIllegal"
            class="noresult">
            <mip-img
              id="tu"
              width="84"
              height="84"
              src="../static/img/tu.png" />
            <h1 class="noweifa">恭喜你尚无新违法记录</h1>
            <div
              class="chufajuedingshu"
              @click="wycfjds">我有处罚决定书</div>
          </div>
        </div>
      </div>

    </div>
    <div id="savekong" />
    <!-- <div v-if="isFixed" id="fix_bottom">更多服务请关注"广东公安熊掌号"和"粤警民通公众号"</div> -->
    <div
      v-if="!isFixed"
      id="fix_bottom_no">更多服务请关注"广东公安熊掌号"和"粤警民通公众号"</div>
      <!-- <div @click="toOtherPage('license')">js点击跳转license</div>
    <a
      href="../../example/license.html"
      data-type="mip"
      class="actives inputfix">
      a链接点击我跳转license
    </a>
    <div @click="toOtherPage('secPage')">js点击跳转secPage</div>
    <a
      href="../../example/secPage.html"
      data-type="mip"
      class="actives inputfix">
      a链接点击我跳转secPage
    </a> -->
  </div>
</template>

<style scoped>
/* 自定义样式 */

@media screen and (min-width: 320px) {
  html {
    font-size: 17.0667px !important;
  }
  body {
    font-size: 12px !important;
  }
}

@media screen and (min-width: 360px) {
  html {
    font-size: 19.2px !important;
  }
  body {
    font-size: 13px !important;
  }
}

@media screen and (min-width: 375px) {
  html {
    font-size: 20px !important;
  }
  body {
    font-size: 13.5px !important;
  }
}

@media screen and (min-width: 411px) {
  html {
    font-size: 21.92px !important;
  }
  body {
    font-size: 14px !important;
  }
}

@media screen and (min-width: 414px) {
  html {
    font-size: 22.08px !important;
  }
  body {
    font-size: 14px !important;
  }
}

@media screen and (min-width: 540px) {
  html {
    font-size: 28.8px !important;
  }
  body {
    font-size: 21px !important;
  }
}

@media screen and (min-width: 562px) {
  html {
    font-size: 29.9733px !important;
  }
  body {
    font-size: 18px !important;
  }
}

@media screen and (min-width: 600px) {
  html {
    font-size: 34px !important;
  }
  body {
    font-size: 26px !important;
  }
}

@media screen and (min-width: 720px) {
  html {
    font-size: 38.4px !important;
  }
  body {
    font-size: 24px !important;
  }
}

@media screen and (min-width: 768px) {
  html {
    font-size: 40.96px !important;
  }
  body {
    font-size: 25px !important;
  }
}

@media screen and (min-width: 885px) {
  html {
    font-size: 48px !important;
  }
  body {
    font-size: 28px !important;
  }
}

@media screen and (min-width: 1024px) {
  html {
    font-size: 54.6133px !important;
  }
  body {
    font-size: 31px !important;
  }
}

@media screen and (min-width: 1200px) {
  html {
    font-size: 65px !important;
  }
  body {
    font-size: 40px !important;
  }
}

@media screen and (min-width: 1300px) {
  html {
    font-size: 70px !important;
  }
  body {
    font-size: 42px !important;
  }
}
body {
  background: rgba(245, 245, 245, 1);
  position: absolute;
}

#fix_bottom {
  width: 100%;
  margin: 0 auto;
  margin-bottom: 0.5rem;
  text-align: center;
  font-size: 0.55rem;
  font-family: PingFang-SC-Medium;
  color: rgba(153, 153, 153, 1);
  line-height: 1rem;
}
#fix_bottom_no {
  width: 100%;
  margin: 0 auto;
  margin-bottom: 0.5rem;
  text-align: center;
  font-size: 0.55rem;
  font-family: PingFang-SC-Medium;
  color: rgba(153, 153, 153, 1);
  line-height: 1rem;
}

.container {
  width: 92%;
  margin: 0 auto;
  margin-bottom: 1rem;
}

#id_carid {
  padding-left: 0.75rem;
  padding-top: 1.275rem;
  font-size: 1rem;
  font-family: PingFang-SC-Bold;
  color: rgba(255, 255, 255, 1);
  line-height: 0px;
  float: left;
}

#carid {
  padding-left: 0.75rem;
  padding-top: 1.275rem;
  font-size: 1rem;
  font-family: PingFang-SC-Bold;
  color: rgba(255, 255, 255, 1);
  line-height: 0px;
  float: left;
}

#delete {
  border-width: 0.75rem;
  border-radius: 0.375rem;
  float: right;
  width: 1rem;
  height: 1rem;
  text-align: center;
  margin-right: 0.75rem;
  margin-top: 0.9rem;
  color: blue;
}

.top {
  display: inline-block;
  width: 100%;
}

.middle {
  width: 100%;
}

#idcard {
  /* display: none; */
  margin: 1rem auto;
  height: 9.55rem;
  background-image: url(../../static/img/idcard.png);
  background-repeat: no-repeat;
  background-position-x: center;
  -moz-background-size: contain;
  -webkit-background-size: contain;
  -o-background-size: contain;
  background-size: contain;
}

#inputagain {
  width: 8rem;
  height: 2.2rem;
  background: rgba(0, 160, 233, 1);
  border-radius: 0.5rem;
  font-size: 0.9rem;
  font-family: PingFang-SC-Medium;
  color: rgba(255, 255, 255, 1);
  line-height: 2.2rem;
  margin: 2rem auto 0 auto;
}

.weijijifen {
  margin-bottom: 0.75rem;
}

#license {
  margin: 1rem auto;
  height: 9.55rem;
  background-image: url(../../static/img/license.png);
  background-repeat: no-repeat;
  background-position-x: center;
  -moz-background-size: contain;
  -webkit-background-size: contain;
  -o-background-size: contain;
  background-size: contain;
  /* display: none; */
}

#weizhang,
#fakuan,
#koufen {
  margin-top: 0.75rem;
  float: left;
  height: 1.75rem;
  width: 5.5rem;
  text-align: center;
}

.weizhangcishu,
.fakuanshu,
.koufenshu {
  font-size: 1rem;
  color: rgba(255, 255, 255, 1);
  font-weight: bold;
  font-family: PingFang-SC-Bold;
}

.middle {
  display: inline-block;
}

.bottom1 {
  margin-top: 0.75rem;
  margin-left: 0.75rem;
  display: inline-block;
}

.qzbfsj {
  font-size: 0.7rem;
  font-family: PingFang-SC-Medium;
  color: rgba(255, 255, 255, 1);
  margin-top: 0.5rem;
}

.tyyxqz {
  font-size: 0.7rem;
  font-family: PingFang-SC-Medium;
  color: rgba(255, 255, 255, 1);
}

.weizhangtext,
.fakuantext,
.koufentext {
  font-size: 0.7rem;
  font-family: PingFang-SC-Medium;
  color: rgba(255, 255, 255, 1);
  font-weight: medium;
}

.fengexian {
  margin-top: -2rem;
  background: white;
  width: 0.05rem;
  height: 1.75rem;
}

.bottom1_left {
  float: left;
}

.bottom1_right {
  float: right;
  width: 5.6rem;
  height: 1.5rem;
  background: rgba(255, 255, 255, 1);
  border-radius: 0.75rem;
  box-shadow: 0.05rem 0px 0.15rem rgba(78, 143, 199, 0.5);
  text-align: center;
  font-size: 0.65rem;
  font-family: PingFang-SC-Medium;
  color: rgba(53, 103, 179, 1);
  line-height: 1.4rem;
  margin-left: 1.05rem;
  margin-top: 0.3rem;
  display: none;
}

.bottom2 {
  margin-left: 0.775rem;
  margin-top: 0.2rem;
}

#staus_left {
  font-size: 0.7rem;
  font-family: PingFang-SC-Medium;
  color: rgba(255, 255, 255, 1);
  float: left;
}

#id_staus_right {
  float: left;
  display: inline-block;
  padding: 0 0.75rem;
  line-height: 0.9rem;
  height: 0.9rem;
  background: rgba(29, 112, 47, 1);
  border-radius: 0.9rem;
  text-align: center;
  margin-left: 0.725rem;
  font-family: PingFang-SC-Medium;
  color: rgba(96, 182, 109, 1);
  font-size: 0.5rem;
}

#staus_right {
  float: left;
  line-height: 0.9rem;
  display: inline-block;
  padding: 0 0.75rem;
  height: 0.9rem;
  background: rgba(0, 58, 95, 1);
  border-radius: 0.9rem;
  text-align: center;
  margin-left: 0.725rem;
  color: rgba(53, 103, 179, 1);
  font-size: 0.6rem;
}

.two_button {
  display: inline-block;
  width: 100%;
}

.ckwddd {
  width: 8rem;
  height: 2.2rem;
  background: rgba(255, 255, 255, 1);
  border-radius: 0.25rem;
  float: left;
  text-align: center;
  font-size: 0.9rem;
  font-family: PingFang-SC-Medium;
  color: rgba(51, 51, 51, 1);
  line-height: 2.2rem;
  border: #cccccc 1px solid;
  /* display: none; */
}

.ljblwz {
  width: 8rem;
  height: 2.2rem;
  background: rgba(79, 156, 243, 1);
  border-radius: 0.25rem;
  float: right;
  text-align: center;
  font-size: 0.9rem;
  font-family: PingFang-SC-Medium;
  color: rgba(255, 255, 255, 1);
  line-height: 2.2rem;
  font-weight: medium;
  /* display: none; */
}
.ljblwz_no {
  width: 8rem;
  height: 2.2rem;
  background: rgba(229, 229, 229, 1);
  border-radius: 0.25rem;
  float: right;
  text-align: center;
  font-size: 0.9rem;
  font-family: PingFang-SC-Medium;
  color: rgba(51, 51, 51, 0.2);
  line-height: 2.2rem;
  font-weight: medium;
}

.cxjg {
  display: flex;
  width: 100%;
  flex-direction: row;
  justify-content: space-between;
  margin-top: 0.5rem;
}

.zfgx {
  float: left;
  width: 40%;
  height: 0.05rem;
  background: rgba(204, 204, 204, 1);
  margin-top: 0.4rem;
}

.cxjgtext {
  float: left;
  width: 15%;
  margin-left: 0.25rem;
  font-size: 0.6rem;
  font-family: PingFang-SC-Medium;
  color: rgba(153, 153, 153, 1);
}

.yfgx {
  float: left;
  width: 40%;
  height: 0.05rem;
  background: rgba(204, 204, 204, 1);
  margin-top: 0.4rem;
}

.cxjgresult {
  margin-bottom: 0.75rem;
  margin-top: 0.75rem;
  width: 100%;
  border-radius: 0.5rem;
  background: #fff;
  /* display: none; */
}

.cxjgitem_1 {
  margin-left: 0.775rem;
  margin-top: 0.75rem;
  font-size: 0.85rem;
  font-family: PingFang-SC-Medium;
  color: #333333;
  line-height: 2.2rem;
}

.cxjgfgx {
  width: 100%;
  height: 0.05rem;
  background: rgba(230, 230, 230, 1);
}

.weifadetail {
  display: flex;
  width: 100%;
  flex-direction: column;
  justify-content: space-between;
  margin-bottom: 1rem;
  display: -webkit-box;
  /* 老版本语法: Safari, iOS, Android browser, older WebKit browsers. */
  -webkit-flex-direction: column;
  -webkit-box-orient: vertical;
}

.time_left_item {
  margin-left: 0.775rem;
  float: left;
  display: -webkit-box;
  /* 老版本语法: Safari, iOS, Android browser, older WebKit browsers. */
  display: flex;
  font-size: 0.7rem;
  font-family: PingFang-SC-Medium;
  color: rgba(51, 51, 51, 1);
}

.time_right_item {
  font-size: 0.7rem;
  width: 7.3rem;
  margin-right: 0.725rem;
  float: right;
  color: #333333;
  font-family: PingFang-SC-Medium;
  text-align: right;
}

.address_left_item {
  margin-left: 0.775rem;
  float: left;
  font-size: 0.7rem;
  font-family: PingFang-SC-Medium;
  color: rgba(51, 51, 51, 1);
}

.address_right_item {
  font-size: 0.7rem;
  width: 7.3rem;
  margin-right: 0.725rem;
  float: right;
  color: #333333;
  font-family: PingFang-SC-Medium;
  text-align: right;
}

.jine_left_item {
  margin-left: 0.775rem;
  float: left;
  font-size: 0.7rem;
  font-family: PingFang-SC-Medium;
  color: rgba(51, 51, 51, 1);
}

.jine_right_item {
  font-size: 0.7rem;
  margin-right: 0.725rem;
  width: 7.3rem;
  float: right;
  color: #333333;
  font-family: PingFang-SC-Medium;
  text-align: right;
}

.behavior_left_item {
  margin-left: 0.775rem;
  float: left;
  font-size: 0.7rem;
  font-family: PingFang-SC-Medium;
  color: rgba(51, 51, 51, 1);
}

.behavior_right_item {
  font-size: 0.7rem;
  margin-right: 0.725rem;
  width: 7.3rem;
  float: right;
  color: #333333;
  font-family: PingFang-SC-Medium;
  text-align: right;
}

.zhinajin_left_item {
  margin-left: 0.775rem;
  float: left;
  font-size: 0.7rem;
  font-family: PingFang-SC-Medium;
  color: rgba(51, 51, 51, 1);
}

.zhinajin_right_item {
  font-size: 0.7rem;
  margin-right: 0.725rem;
  width: 7.3rem;
  float: right;
  color: #333333;
  font-family: PingFang-SC-Medium;
  text-align: right;
}

.jifen_left_item {
  margin-left: 0.775rem;
  float: left;
  font-size: 0.7rem;
  font-family: PingFang-SC-Medium;
  color: rgba(51, 51, 51, 1);
}

.jifen_right_item {
  font-size: 0.7rem;
  margin-right: 0.725rem;
  width: 7.3rem;
  float: right;
  color: #333333;
  font-family: PingFang-SC-Medium;
  text-align: right;
}

.juedingshu_left_item {
  margin-left: 0.775rem;
  float: left;
  font-size: 0.7rem;
  font-family: PingFang-SC-Medium;
  color: rgba(51, 51, 51, 1);
}

.juedingshu_right_item {
  margin-right: 0.725rem;
  width: 7.3rem;
  float: right;
  color: #333333;
  font-family: PingFang-SC-Medium;
  text-align: right;
}

.juedingshubianhao {
  font-size: 0.7rem;
  margin-bottom: 0.725rem;
}

.weifashijian,
.weifadizhi,
.weifaxingwei,
.juedingshubianhao {
  margin-top: 0.725rem;
}

.fakuanjine {
  margin-top: 0.725rem;
  margin-bottom: 0.725rem;
}

.amount {
  font-size: 0.7rem;
  font-family: PingFang-SC-Medium;
  color: rgba(255, 73, 37, 1);
}

#tyyxqz2 {
  font-size: 0.7rem;
  font-family: PingFang-SC-Medium;
  color: rgba(255, 255, 255, 1);
  float: left;
}

#leijijifen {
  float: right;
  width: 5.6rem;
  height: 0.75rem;
  text-align: center;
  font-size: 0.65rem;
  font-family: PingFang-SC-Medium;
  color: rgba(255, 255, 255, 1);
  margin-left: 1.05rem;
  margin-top: 0.1rem;
}

.noresult {
  margin-top: 1.25rem;
  width: 100%;
  text-align: center;
  margin-bottom: 1.5rem;
  /* display: none; */
}

.noweifa {
  margin-top: 0.5rem;
  font-size: 0.7rem;
  font-family: PingFang-SC-Medium;
  color: rgba(153, 153, 153, 1);
  font-weight: medium;
  margin-bottom: 1.475rem;
}

.fixbottom {
  width: 10%;
  height: 1rem;
}

.chufajuedingshu {
  margin: auto;
  width: 8rem;
  height: 2.2rem;
  background: rgba(0, 160, 233, 1);
  border-radius: 0.25rem;
  font-size: 0.9rem;
  font-family: PingFang-SC-Medium;
  color: rgba(255, 255, 255, 1);
  line-height: 2.25rem;
}

/* #noerror {
      display: none;
    } */

#newerror {
  /* display: none; */
  height: 22rem;
  margin-top: 5rem;
  width: 100%;
  text-align: center;
}

#newerror2 {
  display: block;
  height: 22rem;
  margin-top: 5rem;
  width: 100%;
  text-align: center;
  /* display: none; */
}

#haserror {
  display: none;
  height: 22rem;
  margin-top: 5rem;
  width: 100%;
  text-align: center;
}

.weihuzhong {
  margin-top: 0.5rem;
  font-size: 0.7rem;
  font-family: PingFang-SC-Medium;
  color: rgba(153, 153, 153, 1);
}

.weihuzhong2 {
  margin-top: 0.7rem;
  font-size: 0.7rem;
  font-family: PingFang-SC-Medium;
  color: rgba(153, 153, 153, 1);
  text-align: left;
}

.shaohouzaishi {
  margin-top: 0.5rem;
  font-size: 0.6rem;
  font-family: PingFang-SC-Medium;
  color: rgba(153, 153, 153, 1);
}

p {
  text-align: center;
}

.btn {
  width: 100px;
  height: 35px;
  border-radius: 5px;
  font-size: 16px;
  color: white;
  background-color: cornflowerblue;
}

.btn:hover,
.btn:focus {
  background-color: #95b4ed;
}

.modal-content {
  display: flex;
  display: -webkit-box;
  flex-flow: column nowrap;
  justify-content: space-between;
  -webkit-flex-flow: column nowrap;
  max-width: 14rem;
  height: 6.725rem;
  margin: 10rem auto;
  border-radius: 0.2rem;
  background-color: #fff;
  -webkit-animation: zoom 0.6s;
  animation: zoom 0.6s;
  resize: both;
  overflow: auto;
  -webkit-flex-direction: column;
  -webkit-box-orient: vertical;
  -webkit-box-pack: justify;
}

@-webkit-keyframes zoom {
  from {
    -webkit-transform: scale(0);
  }
  to {
    -webkit-transform: scale(1);
  }
}

@keyframes zoom {
  from {
    transform: scale(0);
  }
  to {
    transform: scale(1);
  }
}

.tip {
  text-align: center;
  margin: 1rem auto 0 auto;
  font-size: 0.9rem;
  font-family: PingFang-SC-Medium;
  color: rgba(0, 0, 0, 1);
}

.modal-header {
  box-sizing: border-box;
  border-bottom: 1px solid #ccc;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.close {
  color: #b7b7b7;
  font-size: 30px;
  font-weight: bold;
  margin-right: 20px;
  transition: all 0.3s;
}

.close:hover,
.close:focus {
  color: #95b4ed;
  text-decoration: none;
  cursor: pointer;
}

.modal-body {
  font-size: 0.7rem;
  color: rgba(153, 153, 153, 1);
  margin-top: -0.75rem;
  box-sizing: border-box;
}

.modal-footer {
  height: 2.2rem;
  box-sizing: border-box;
  border-top: 1px solid #ccc;
}

#sure {
  float: right;
  font-size: 0.9rem;
  font-family: PingFang-SC-Medium;
  color: rgba(0, 160, 233, 1);
  width: 49.5%;
  margin: auto;
  text-align: center;
  line-height: 2rem;
}

#cancel {
  border-right: 1px solid #ccc;
  float: left;
  font-size: 0.9rem;
  font-family: PingFang-SC-Medium;
  color: rgba(51, 51, 51, 1);
  width: 49.5%;
  margin: auto;
  text-align: center;
  line-height: 2rem;
}

.modal-footer button {
  width: 60px;
  height: 35px;
  padding: 5px;
  box-sizing: border-box;
  margin-right: 10px;
  font-size: 16px;
  color: white;
  border-radius: 5px;
  background-color: cornflowerblue;
}

.modal-footer button:hover,
.modal-footer button:focus {
  background-color: #95b4ed;
  cursor: pointer;
}

@media only screen and (max-width: 700px) {
  .modal-content {
    width: 14rem;
  }
}

/* .cxjg {
      display: none;
    } */

/* .cxjgresult {
      display: none;
    } */

.eachresult {
  background: rgba(255, 255, 255, 1);
  border-radius: 0.5rem;
}

#savekong {
  height: 1rem;
}

#tu {
  height: calc(100vw / 5) !important;
  width: calc(100vw / 5) !important;
}
</style>

<script>
import base from '../../common/utils/base.js'
// function getUrlParam(name) {
//     // 用于获取url的参数后置参数
//     let reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); // 构造一个含有目标参数的正则表达式对象
//     let r = window.location.search.substr(1).match(reg); // 匹配目标参数
//     if (r != null) {
//         return decodeURI(r[2]);
//     }
//     return null; // 返回参数值
// }
export default {
  data () {
    return {
      noInfo: false,
      isLicense: false,
      isCard: false,
      hasLicenseIllegal: false,
      hasCardIllegal: false,
      isShowDeleteBox: false, // 控制弹框
      id_card: '',
      weizhangcishu: '',
      koufenshu: '',
      tyyxqz: '',
      qzbfsj: '',
      status: '',
      id_license: '',
      weizhangcishu_license: '',
      koufenshu_license: '',
      tyyxqz_license: '',
      qzbfsj_license: '',
      status_license: '',
      results: [],
      results_license: [],
      wrongInfo: false,
      wrongInfo_license: false,
      htmlhref: {}
    }
  },
  created () {
    base.resetRem()
  },
  mounted () {
    // Common.resetRem();
    // 基本数据初始化
    this.initData()
    let options = {
      headers: {
        'X-CLIENT-SOURCE': escape('百度'),
        'X-CHANNEL-ID': '4291',
        'X-CHANNEL-NAME': escape('百度阿拉丁')
      }
    }
    let reg1 = /[0-9a-zA-Z]/g
    console.log('This is my first custom component !')
    if (!this.getUrlParam('license_no') && !this.getUrlParam('plate_no')) {
      console.log('没有输入信息就跳转到这个页面')
      let that = this
      that.noInfo = true
    }
    if (this.getUrlParam('license_no')) {
      let that = this
      that.getUrlParam('file_no')
      fetch(
        'https://gdjmt.gdsecurity.cn:8081/jmt-api/aladdin/getLicenseInfo?license_no=' +
          that.getUrlParam('license_no') +
          '&file_no=' +
          that.getUrlParam('file_no'),
        options
      )
        .then(function (res) {
          return res.json()
        })
        .then(function (res) {
          that.noInfo = false
          console.log('license信息', res)
          if (res.errcode === 0) {
            that.isLicense = true
            let realLicense = res.result.license_no
            let licenseLength = realLicense.length
            let one = realLicense.substring(6, licenseLength - 10)
            let two = realLicense
              .substring(licenseLength - 10, licenseLength - 1)
              .replace(reg1, '*')
            let three = realLicense.substring(licenseLength - 1)
            let chulied = one.concat(two, three)
            that.id_license = chulied
            that.weizhangcishu_license = res.result.undeal_count
            that.fakuanshu_license = res.result.undeal_amount_of_money
            that.koufenshu_license = res.result.undeal_amount_of_score
            that.tyyxqz_license = res.result.check_date
            that.qzbfsj_license = res.result.valid_date
            that.leijijifen_license = res.result.ljjf
            that.status_license = res.result.status
            if (res.result_set.length > 0) {
              that.hasLicenseIllegal = true
              that.results_license = res.result_set
            }
            if (res.result_set.length === 0) {
              that.hasLicenseIllegal = false
            }
          }

          if (res.errcode === -200) {
            that.wrongInfo_license = true
          }
        })
    }
    // 如果能获取
    if (this.getUrlParam('plate_no')) {
      let that = this
      that.getUrlParam('car_type')
      that.getUrlParam('eng_no')
      fetch(
        'https://gdjmt.gdsecurity.cn:8081/jmt-api/aladdin/getCarInfo?plate_no=' +
          that.getUrlParam('plate_no') +
          '&car_type=' +
          that.getUrlParam('car_type') +
          '&eng_no=' +
          that.getUrlParam('eng_no'),
        options
      )
        .then(function (res) {
          return res.json()
        })
        .then(function (res) {
          console.log('plate信息', res)
          if (res.errcode === 0) {
            that.isCard = true
            that.noInfo = false
            that.isLicense = false
            that.id_card = res.result.hphm
            that.weizhangcishu = res.result.undeal_count
            that.fakuanshu = res.result.undeal_amount_of_money
            that.koufenshu = res.result.undeal_amount_of_score
            that.tyyxqz = res.result.invalidated_date
            that.qzbfsj = res.result.valid_date
            that.leijijife = res.result.ljjf
            that.status = res.result.status
            if (res.result_set.length > 0) {
              that.hasCardIllegal = true
              that.results = res.result_set
            }
          }
          if (res.errcode === -200) {
            that.wrongInfo = true
          }
        })
    }
  },
  methods: {
    toOtherPage (url) {
      MIP.viewer.open(this.htmlhref[url], { isMipLink: true })
    },
    getUrlParam (name) {
      // 用于获取url的参数后置参数
      let reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)') // 构造一个含有目标参数的正则表达式对象
      let r = window.location.search.substr(1).match(reg) // 匹配目标参数
      if (r != null) {
        return decodeURI(r[2])
      }
      return null // 返回参数值
    },
    // 基本数据初始化
    initData () {
      // 配置链接信息
      this.htmlhref = base.htmlhref
    },
    inputAgain: function () {
      console.log('到这里了', MIP.viewer)
      if (this.getUrlParam('license_no')) {
        console.log('111111', window)
        // window.top.location.href = 'https://www.baidu.com/s?wd=驾驶人违法查询'
        MIP.viewer.open('https://www.baidu.com/s?wd=驾驶人违法查询', {
          isMipLink: false
        })
      } else {
        console.log('22222222', window)
        MIP.viewer.open('https://www.baidu.com/s?wd=违章查询', {
          isMipLink: false
        })
        // window.top.location.href = 'https://www.baidu.com/s?wd=违章查询'
      }
    },
    ckwddd () {
      // let baseUrl = "https://yz-alipay.fundway.net/";
      // window.top.location.href =
      //     baseUrl + "yzcw-web-admin/login/xmd/xmd_baidu_xzh/myOrder/auth";
      MIP.viewer.open(
        base.outAldhttp + 'yzcw-web-admin/login/xmd/xmd_baidu_xzh/myOrder/auth',
        { isMipLink: true }
      )
    },
    ljblwz () {
      let that = this
      // let baseUrl = 'https://yz-alipay.fundway.net/'
      if (that.getUrlParam('license_no')) {
        // window.top.location.href =
        //     baseUrl +
        //     "yzcw-web-admin/login/xmd/xmd_baidu_xzh/site_illegal_payment/auth";
        MIP.viewer.open(
          base.outAldhttp +
            'yzcw-web-admin/login/xmd/xmd_baidu_xzh/site_illegal_payment/auth',
          { isMipLink: true }
        )
      }
      if (that.getUrlParam('plate_no')) {
        let plateNo = that.getUrlParam('plate_no')
        plateNo = plateNo.substr(0, 1) === '粤' ? plateNo : '粤' + plateNo
        MIP.viewer.open(
          base.outAldhttp +
            'yzcw-web-admin/login/' +
            'xmd/xmd_baidu_xzh/illegal_result/auth?' +
            'PLATENUMBER=' +
            plateNo +
            '&FDJH=' +
            that.getUrlParam('eng_no') +
            '&PLATETYPE=' +
            that.getUrlParam('car_type'),
          { isMipLink: true }
        )
      }
    },
    cxwzcl () {
      MIP.viewer.open(
        base.outAldhttp +
          'yzcw-web-admin/login/xmd/xmd_baidu_xzh/illegal_payment/auth',
        { isMipLink: true }
      )
    },
    wycfjds () {
      MIP.viewer.open(
        base.outAldhttp +
          'yzcw-web-admin/login/xmd/xmd_baidu_xzh/site_illegal_payment/auth',
        { isMipLink: true }
      )
    },
    deleteCardOrLicense (str) {
      let that = this
      console.log('删除')
      that.isShowDeleteBox = true
    },
    cancalDeleteBox () {
      let that = this
      that.isShowDeleteBox = false
    },
    deleteConfirm () {
      let that = this
      that.isShowDeleteBox = false
      if (that.getUrlParam('license_no')) {
        MIP.viewer.open('https://www.baidu.com/s?wd=驾驶人违法查询', {
          isMipLink: false
        })
      } else {
        MIP.viewer.open('https://www.baidu.com/s?wd=违章查询', {
          isMipLink: false
        })
      }
    }
  }
}
</script>
