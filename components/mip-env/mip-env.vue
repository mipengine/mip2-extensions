<template>
  <div v-if="toggleShow">
    <slot></slot>
  </div>
</template>

<script>
export default {
  props: ['scope'],
  data: function () {
    return {
      toggleShow: false
    };
  },
  methods: {
    cacheOk: function (cache) {
      const allowCache = { // 所支持的cache
        sm: [
          '.sm-tc.cn',
          '.transcode.cn'
        ],
        baidu: [
          '.bdstatic.com',
          '.mipcdn.com'
        ]
      };
      const allowCacheArr = allowCache[cache] || [];
      return allowCacheArr.some((item) => {
        return location.hostname.lastIndexOf(item) != -1;
      })
    },
    dpOk: function (dp) {
      const allowDp = { // 支持的分发平台
        sm: [
          '.sm-tc.cn',
          '.transcode.cn'
        ],
        baidu: [
          '.bdstatic.com',
          '.mipcdn.com'
        ]
      };
      if (!MIP.viewer.isIframed) {
        console.log('not in iframe');
        return false;
      }
      const allowDpArr = allowDp[dp] || [];
      return allowDpArr.some((item) => {
        return location.hostname.lastIndexOf(item) != -1;
      })
    },
    uaOk: function (ua) {
      const platform = MIP.util.platform;
      switch(ua) {
        case 'baidu':
          if (platform.isBaidu()) {
            return true;
          }
          break;
        case 'uc':
          if (platform.isUc()) {
            return true;
          }
          break;
        case 'chrome':
          if (platform.isChrome()) {
            return true;
          }
          break;
        case 'safari':
          if (platform.isSafari()) {
            return true;
          }
          break;
        case 'qq':
          if (platform.isQQ()) {
            return true;
          }
          break;
        case 'firefox':
          if (platform.isFireFox()) {
            return true;
          }
          break;
        default:
          return false;
      }
    },
    osOk: function (os) {
      switch(os) {
        case 'ios':
          if (MIP.util.platform.isIos()) {
            return true;
          }
          break;
        case 'android':
          if (MIP.util.platform.isAndroid()) {
            return true;
          }
          break;
        default:
          return false;
      }
    },
    jsonParse: function (jsonStr) {
      try {
        return MIP.util.jsonParse(jsonStr);
      }catch(e) {
        return jsonStr;
      }
    },
    scopeOk: function (scope) {
      if (scope) {
        const scopeJson = this.jsonParse(scope); 
        if (MIP.util.fn.isPlainObject(scopeJson) && Object.keys(scopeJson).length != 0) {
          for(const info in scopeJson) {
            const param = String(scopeJson[info]).toLowerCase();
            switch (info) {
              case 'cache':
                if (!this.cacheOk(param)) {
                  console.log('cache error');
                  return false;
                }
                break;
              case 'dp':
                if (!this.dpOk(param)) {
                  console.log('dp error');
                  return false;
                }
                break;
              case 'ua':
                if (!this.uaOk(param)) {
                  console.log('ua error');
                  return false;
                }
                break;
              case 'os':
                if (!this.osOk(param)) {
                  console.log('os error');
                  return false;
                }
                break;
              default:
                console.log('params error');
                return false;
            }
          }
          console.log('all right')
          return true;
        } else {
          console.log('scope error');
          return false;
        }
      } else {
        console.log('no scope');
        return false;
      }
    },
  },
  firstInviewCallback () {
    const isOk = this.scopeOk(this.scope);
    if (isOk) {
      this.toggleShow = true;
    }
  }
}
</script>
