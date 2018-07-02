/**
 * @file 极速服务 shell 定制
 * @author zhuguoxi@baidu.com (zhuguoxi)
 */

import './mip-shell-inservice.less'
import payPlaceholder from '../../static/pay-placeholder.png'
// 站点数据请求url
const URL_SITE = 'https://xiongzhang.baidu.com/opensc/cambrian/card'
const fetchJsonp = window.fetchJsonp || {}

export default class MipShellInservice extends MIP.builtinComponents.MipShell {
  constructor (...args) {
    super(...args)

    this.alwaysReadConfigOnLoad = false
    this.transitionContainsHeader = false
  }

  /**
   * MipShell 扩展配置处理函数, 异步获取 熊掌号信息
   *
   * @param {Object} shellConfig 继承MipShell config
   */
  async processShellConfig (shellConfig) {
    let headerInfo = {
    }
    let isasync

    // wise搜索环境页带入熊掌号信息
    try {
      let { isTitle } = MIP.hash.hashTree
      let hashHeader = isTitle && JSON.parse(decodeURIComponent(isTitle && isTitle.value))
      if (hashHeader && hashHeader.type === 'cambrian') {
        Object.assign(headerInfo, {title: hashHeader.title, logo: hashHeader.logo})
      }
    } catch (error) {
    }

    // Set default data
    shellConfig.routes.forEach(routeConfig => {
      let { header, view } = routeConfig.meta
      header.logo = ''
      header.bouncy = false
      header.buttonGroup = [{
        name: 'cancel',
        text: '取消'
      }]
      if (view.isIndex) {
        header.title = headerInfo.title || header.title || document.title || ''
        header.logo = headerInfo.logo || payPlaceholder
        headerInfo.title = header.title
      }
    })

    let isId = shellConfig.isId

    if (isId) {
      headerInfo.isId = isId
      isasync = true
      headerInfo = await fetchJsonp(`${URL_SITE}?cambrian_id=${isId}`).then(res => res.json()).then(data => {
        if (data.code === 0 && data.data.name) {
          return {
            title: data.data.name,
            logo: data.data.avatar,
            serviceUrl: data.data.service_url,
            cambrianUrl: data.data.cambrian_url
          }
        }
        return headerInfo
      }).catch(() => headerInfo)
    }

    shellConfig.routes.forEach(routeConfig => {
      let { header, view } = routeConfig.meta
      if (view.isIndex) {
        header.title = headerInfo.title
        header.logo = headerInfo.logo
      }

      header.buttonGroup = []
      if (headerInfo.serviceUrl) {
        header.buttonGroup.push({
          name: 'indexPage',
          text: '首页'
        })
        // 暂时屏蔽分享功能
        // header.buttonGroup.push({
        //   name: 'share',
        //   text: '分享'
        // })
      }
      if (headerInfo.cambrianUrl) {
        header.buttonGroup.push({
          name: 'about',
          text: `关于${headerInfo.title}`
        })
      }
      header.buttonGroup.push({
        name: 'cancel',
        text: '取消'
      })
    })

    this.headerInfo = headerInfo
    this.updateShellConfig(shellConfig)
    if (isasync) {
      this.refreshShell({ pageId: window.MIP.viewer.page.pageId })
    }
  }
  /**
   * 更多按钮hook
   *
   * @param {string} buttonName 触发button类型
   */
  handleShellCustomButton (buttonName) {
    if (buttonName === 'share') {
      this.shareAction()
      this.toggleDropdown(false)
    } else if (buttonName === 'indexPage') {
      this.indexPageAction()
      this.toggleDropdown(false)
    } else if (buttonName === 'about') {
      this.aboutAction()
      this.toggleDropdown(false)
    }
  }
  /**
   * 是否显示 关闭button, 不能返回搜索结果页时进行处理
   */
  showHeaderCloseButton () {
    let { canClose } = MIP.hash.hashTree || {}
    return canClose && canClose.value === 'true'
  }
  /**
   * 关于我们处理逻辑
   */
  aboutAction () {
    let cambrianUrl = this.headerInfo.cambrianUrl
    let mipUrl = `https://m.baidu.com/mip/c/s/${encodeURIComponent(cambrianUrl.replace(/^http(s)?:\/\//, ''))}`
    if (MIP.standalone) {
      mipUrl = `${mipUrl}?title=${this.headerInfo.title}`
      MIP.viewer.open(mipUrl, { isMipLink: false })
    } else {
      MIP.viewer.sendMessage('loadiframe', { 'url': cambrianUrl, title: this.headerInfo.title })
    }
  }
  /**
   * 分享处理逻辑，动态加载创建mip-share组件
   */
  shareAction () {
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
  indexPageAction () {
    let serviceUrl = this.headerInfo.serviceUrl
    MIP.viewer.open(serviceUrl, { isMipLink: true, replace: true })
  }
}
