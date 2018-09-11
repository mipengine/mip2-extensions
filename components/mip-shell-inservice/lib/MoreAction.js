/**
 * @file shell 更多button操作集合
 * @author zhuguoxi@baidu.com (zhuguoxi)
 */

export default class {
  constructor (headerInfo) {
    this.headerInfo = headerInfo
  }
  /**
   * 关于我们处理逻辑
   */
  about () {
    let cambrianUrl = this.headerInfo.cambrianUrl
    let mipUrl = `https://m.baidu.com/mip/c/s/${encodeURIComponent(cambrianUrl.replace(/^https?:\/\//, ''))}`
    if (MIP.standalone) {
      mipUrl = `${mipUrl}?title=${this.headerInfo.title}&nocache=1`
      // 解决ios 上 mark 未关闭前跳转后返回问题
      setTimeout(() => {
        MIP.viewer.open(mipUrl, { isMipLink: false })
      }, 300)
    } else {
      MIP.viewer.sendMessage('loadiframe', { 'url': cambrianUrl, title: this.headerInfo.title, nocache: 1 })
    }
  }
  /**
   * 分享处理逻辑，动态加载创建mip-share组件
   */
  share () {
    let { shareWrapper, mask } = this.createShareWarp()
    let { title, serviceUrl, logo } = this.headerInfo

    document.body.appendChild(mask)
    document.body.appendChild(shareWrapper)

    if (shareWrapper.querySelector('mip-share')) {
      this.toggleShare()
      return
    }

    new Promise((resolve, reject) => {
      let script = document.createElement('script')
      script.onload = resolve
      script.onerror = reject
      script.src = 'https://c.mipcdn.com/static/v1/mip-share/mip-share.js'
      document.body.appendChild(script)
    }).then(() => {
      shareWrapper.innerHTML = `
        <mip-share
            title="${title}"
            content="${title}"
            url="${serviceUrl}"
            icon="${logo}"
            layout="container"
            width="414"
            height="158">
        </mip-share>`
      this.toggleShare()
    })
  }

  createShareWarp () {
    if (this.shareWarp) {
      return this.shareWarp
    }

    let mask
    let shareWrapper

    mask = document.createElement('mip-fixed')
    mask.classList.add('mip-shell-share-mask')

    shareWrapper = document.createElement('mip-fixed')
    shareWrapper.classList.add('mip-shell-share-wrapper')

    mask.onclick = this.toggleShare.bind(this)
    this.shareWarp = { mask, shareWrapper, show: false }
    return this.shareWarp
  }
  /**
   * 分享功能切换
   */
  toggleShare () {
    if (this.shareWarp.show) {
      this.shareWarp.mask.classList.remove('show')
      this.shareWarp.shareWrapper.classList.remove('show')
    } else {
      this.shareWarp.mask.classList.add('show')
      this.shareWarp.shareWrapper.classList.add('show')
    }
    this.shareWarp.show = !this.shareWarp.show
    MIP.viewer.page.togglePageMask(this.shareWarp.show, {
      skipTransition: true
    })
  }
  /**
   * 跳转首页逻辑
   */
  indexPage () {
    MIP.viewer.open(MIP.util.makeCacheUrl(this.headerInfo.serviceUrl), { isMipLink: true, replace: true })
  }

  /**
   * 发送shell日志
   *
   * @param {string} clickToken 点击token
   */
  sendLog (clickToken) {
    let urlQuerysObj = {
      rqt: 300,
      action: 'page_vi',
      xzhid: MIP.util.customStorage(0).get('mip-xzhid'),
      click_token: clickToken,
      _t: new Date().getTime(),
      url: location.href
    }
    let urlQuerys = Object.keys(urlQuerysObj).map(key => {
      return `${key}=${encodeURIComponent(urlQuerysObj[key])}`
    })
    new Image().src = `//rqs.baidu.com/service/api/rqs?${urlQuerys.join('&')}`
    new Image().src = `//sp0.baidu.com/5LMDcjW6BwF3otqbppnN2DJv/servicehub.pae.baidu.com/servicehub/oplog/urlclk?click_token=${encodeURIComponent(clickToken)}&url=${encodeURIComponent(location.href)}&is_mip=1`
  }
}
