/**
 * file: 小说shell 目录边栏文件
 * author: liangjiaying <jiaojiaomao220@163.com>
 * @author liujing
 * TODO：
 *     1. 梳理现有的逻辑，抽取出相关的方法，比如有些html可以抽离出来
 */

import state from '../common/state'
import {getCurrentWindow} from '../common/util'
import {sendWebbLog, sendTCLog} from '../common/log' // 日志

const CATALOG_URL = 'https://sp0.baidu.com/5LMDcjW6BwF3otqbppnN2DJv/novelsearch.pae.baidu.com/novel/api/mipinfo?' // online
const originUrl = MIP.util.getOriginalUrl()
// const originUrl = 'http://www.xmkanshu.com/book/mip/read?bkid=685640121&crid=288&fr=bdgfh&mip=1&pg=3'
let util = MIP.util
let event = util.event

let reverseHandler
let isReverse = false // false = 正序，从小到大，默认情况；true = 倒序，从大到小。
// 记录上一次成功获取的 page
// 因为目录添加排序之后，当前章节可能在 this.categoryList 里找不到了，但这种情况不需要返回 matchErr 错误，所以需要记录起来。
let lastPage

// 以下字段isCatFetch=true时才有（根据RD反馈，线上其实不存在在HTML里面配置目录的书了，所以应该都走fetch了）
let isSplitPage
// 记录首尾章节的信息（后端返回的对象）
let firstChapter
let latestChapter
// 记录首尾章节是否已经被加载（因为分页了），如果已被加载，那滚动时就不再发请求了
let isFirstChapterLoaded
let isLatestChapterLoaded
// 记录上一次目录的滚动位置，用以判断滚动方向
let lastScrollTop
// 记录滚动响应函数，方便 removeEventListener 避免重复绑定
let catalogScrollListener
// 记录目录当前高度，方便在滚动时进行判断，且不必每次都获取 DOM
let categoryContentHeight
let isFetchLoading = false

class Catalog {
  constructor (config, book) {
    // 渲染侧边栏目录元素
    this.categoryList = ''
    this.isCatFetch = false
    this.$catalogSidebar = this._renderCatalog(config, book)
    // 禁止冒泡，防止目录滚动到底后，触发外层小说页面滚动
    this.propagationStopped = this._stopPropagation()
    // this.nowCatNum = 1
    this.isShowNetErr = false
  }

  /**
   * 获取当前章节信息
   *
   * @returns {Object|undefined|string} 期望返回正确的章节信息，'matchErr'为站点chapter与目录匹配失败，undefined为没有配置crid（兼容纵横）
   */
  getCurrentPage () {
    const currentWindow = getCurrentWindow()
    const {currentPage} = state(currentWindow)
    if (!this.isCatFetch) { // 纵横目前为同步获取目录，依靠crid高亮定位，所以这就是目前纵横的逻辑
      let crid = this.getLocationQuery().crid // 获取crid和currentPage.chapter判断是否一致
      if (crid && +crid === +currentPage.chapter) {
        lastPage = currentPage
        return currentPage
      }
      return
    }
    // 异步获取，标准逻辑，需要匹配currentPage的chapter与categoryList里的id。成功返回索引，否则false
    for (let i = 0; i < this.categoryList.length; i++) {
      if (+this.categoryList[i].id === +currentPage.chapter) {
        lastPage = currentPage
        return currentPage
      }
    }
    // this.categoryList.forEach((item, index) => {
    //   if (+item.id === +currentPage.chapter) { // 匹配成功
    //     result = currentPage
    //     result.chapter = index + 1 // 重写索引
    //   }
    // })
    // 如果找不到记录，可能是因为排序导致的，获取上一次（进入页面时）的 page 对象即可
    return lastPage || 'matchErr'
  }

  /**
   * 通过浏览器地址栏url获取query参数
   *
   * @param {string=} url 地址栏链接或自传链接参数 http://www.example/index.html?crid=1&pg=2 第一章第二节
   * @returns {Object} 参数对象
   */
  getLocationQuery (url) {
    url = url || location.href
    let query = url.split('?')[1] || ''
    query = query.split('#')[0] || ''
    if (!query) {
      return {}
    }
    return query.split('&').reduce(function (obj, item) {
      let data = item.split('=')
      obj[data[0]] = decodeURIComponent(data[1])
      return obj
    }, {})
  }

  /**
   * 函数说明：异步获取目录成功的回调渲染函数
   *
   * @param {Object} data 异步成功返回获取的数据
   * @param {?Object} options 一些配置项
   * @param {boolean} options.isReload 是否需要定位到当前章节
   * @param {boolean} options.isAppend 是否是追加章节（上下滑动加载更多）
   * @param {boolean} options.isUp 是否是向上追加章节（无视排序，只看章节本身的先后。加载以前的章节，isUp=true)
   */
  renderCatalogCallBack (data, {isReload = false, isAppend = false, isUp = false} = {}) {
    let $contentTop = this.$catalogSidebar.querySelector('.mip-catalog-btn') // 上边元素
    let $catWrapper = this.$catalogSidebar.querySelector('.novel-catalog-content-wrapper')
    let $catalogContent = this.$catalogSidebar.querySelector('.novel-catalog-content')
    let catalogs = data.data.catalog.chapters
    if (!isAppend) {
      isFirstChapterLoaded = isLatestChapterLoaded = !isSplitPage
      firstChapter = data.data.catalog.firstChapter
      latestChapter = data.data.catalog.latestChapter
      this.categoryList = catalogs.concat([])
    } else if (isUp) {
      this.categoryList = catalogs.concat(this.categoryList)
    } else {
      this.categoryList = this.categoryList.concat(catalogs)
    }
    if (isSplitPage && catalogs && catalogs.length !== 0) {
      if (catalogs[0].id === firstChapter.id) {
        isFirstChapterLoaded = true
      }
      if (catalogs[catalogs.length - 1].id === latestChapter.id) {
        isLatestChapterLoaded = true
      }
    }
    let renderCatalog = catalogs => catalogs.map(catalog => {
      return `<div class="catalog-page" data-chapter-id="${catalog.id}">
        <a class="mip-catalog-btn catalog-page-content"
        mip-catalog-btn mip-link data-button-name="${catalog.name}" href="${catalog.contentUrl[0]}" replace>
        ${catalog.name}
        </a>
      </div>`
    }).join('\n')

    if (!isAppend) {
      $catalogContent.innerHTML = !isReverse ? renderCatalog(catalogs) : renderCatalog(catalogs.reverse())
    } else if (!isReverse) {
      if (isUp) {
        $catalogContent.innerHTML = renderCatalog(catalogs) + $catalogContent.innerHTML
      } else {
        $catalogContent.innerHTML += renderCatalog(catalogs)
      }
    } else {
      if (isUp) {
        $catalogContent.innerHTML += renderCatalog(catalogs.reverse())
      } else {
        $catalogContent.innerHTML = renderCatalog(catalogs.reverse()) + $catalogContent.innerHTML
      }
    }
    categoryContentHeight = $catalogContent.clientHeight

    if (isReload) {
      let currentPage = this.getCurrentPage()
      // let catLocation = {
      //   section: currentPage.chapter,
      //   page: currentPage.page
      // }
      // let catalog = this.$catalogSidebar.querySelectorAll('.catalog-page')

      let originY, y
      $catWrapper.addEventListener('touchstart', e => {
        originY = e.touches[0].screenY
      })
      $catWrapper.addEventListener('touchmove', e => {
        if ($catWrapper.scrollTop < $catWrapper.scrollHeight - $catWrapper.clientHeight && $catWrapper.scrollTop > 0) {
          return
        }
        y = e.touches[0].screenY
        // 触底后向上滑动
        if ($catWrapper.scrollTop >= ($catWrapper.scrollHeight - $catWrapper.clientHeight) && y < originY) {
          e && e.stopPropagation()
          e.preventDefault()
        }
        // 触顶后向下滑动
        if ($catWrapper.scrollTop === 0 && y > originY) {
          e && e.stopPropagation()
          e.preventDefault()
        }
      })
      let $activeCatalog = this.$catalogSidebar.querySelector(`.catalog-page[data-chapter-id="${currentPage.chapter}"]`)
      if ($activeCatalog) {
        $activeCatalog.querySelector('a').classList.add('active')
        $catWrapper.scrollTo = $activeCatalog.offsetTop
      }
      // catalog[catLocation.section - 1].querySelector('a').classList.add('active')
      // this.nowCatNum = catLocation.section
      // $catWrapper.scrollTop = catalog[catLocation.section - 1].offsetTop
    }
    this.reverse($contentTop, $catalogContent)
    if (isSplitPage) {
      if (!isAppend) {
        this.bindCatalogScroll($catWrapper)
      } else {
        lastScrollTop = $catWrapper.scrollTop
      }
    }
  }

  bindCatalogScroll ($scrollWrapper) {
    if (catalogScrollListener) {
      $scrollWrapper.removeEventListener('scroll', catalogScrollListener)
    }
    lastScrollTop = $scrollWrapper.scrollTop
    catalogScrollListener = e => {
      if (isFetchLoading || (isFirstChapterLoaded && isLatestChapterLoaded)) {
        return
      }
      let type
      let currentScrollTop = $scrollWrapper.scrollTop
      let moveUp = currentScrollTop < lastScrollTop && currentScrollTop < 500
      let moveDown = currentScrollTop > lastScrollTop && currentScrollTop + $scrollWrapper.clientHeight + 300 > categoryContentHeight
      lastScrollTop = currentScrollTop
      if (!isReverse) {
        if (!isFirstChapterLoaded && moveUp) {
          type = 'up'
        } else if (!isLatestChapterLoaded && moveDown) {
          type = 'down'
        }
      } else {
        if (!isLatestChapterLoaded && moveUp) {
          type = 'down'
        } else if (!isFirstChapterLoaded && moveDown) {
          type = 'up'
        }
      }
      if (type) {
        this.loadCategory(type).then(data => {
          this.renderCatalogCallBack(data, {
            isAppend: true,
            isUp: type === 'up'
          })

          // 如果往上滚动，渲染完成后定位到当前章节，这样防止下一次滚动不了
          if (type === 'up') {
            let $catWrapper = this.$catalogSidebar.querySelector('.novel-catalog-content-wrapper')
            let $currentActiveLink = this.$catalogSidebar.querySelector(`.mip-catalog-btn.active`)
            if ($currentActiveLink) {
              $catWrapper.scrollTop = $currentActiveLink.offsetTop - 46
            }
          }
        })
      }
    }
    $scrollWrapper.addEventListener('scroll', catalogScrollListener)
  }

  // type = up / down / middle / asc / desc
  loadCategory (type) {
    isFetchLoading = true
    let url
    if (type === 'up') {
      url = this.categoryList[0].contentUrl[0]
    } else if (type === 'down') {
      url = this.categoryList[this.categoryList.length - 1].contentUrl[0]
    } else {
      // middle / asc / desc
      url = originUrl
    }
    let params = [
      'originUrl=' + encodeURIComponent(url),
      'type=' + type
    ]
    if (isSplitPage) {
      params.push('forceSplit=true')
    }

    return MIP.sandbox.fetchJsonp(CATALOG_URL + params.join('&'), {
      jsonpCallback: 'callback'
    }).then(res => {
      isFetchLoading = false
      return res.json()
    }).then(data => {
      if (data.errno !== 0) {
        throw new Error(data)
      } else {
        return data
      }
    })
  }

  /**
   * 根据配置渲染目录侧边栏到  mip-sidebar组件中，支持从页面直接获取目录，异步获取目录
   *
   * @param {Array} catalogs constructor构造传入的变量config
   * @param {Object} book 书本信息
   * @returns {HTMLElement} $catalogSidebar 目录dom
   */
  _renderCatalog (catalogs, book) {
    let renderCatalog
    let title = ''
    let chapterStatus = ''
    let chapterNumber = ''
    if (book) {
      title = book.title
      chapterNumber = book.chapterNumber
      chapterStatus = book.chapterStatus
    }
    let catalogHtml = `
      <div class="mip-shell-catalog mip-border mip-border-right">
        <div class="novel-catalog-content-wrapper">
          <div class="mip-catalog-btn book-catalog-info">
            <div class="catalog-header-wrapper book-catalog-info-header">
              <div class="book-catalog-info-title">
                <p class="book-catalog-title-name catalog-title">${title}</p>
                <div class="catalog-content-total-wrapper">
                  <p class="catalog-content-total"><span>${chapterStatus}</span><span class="chapter-number">${chapterNumber}</span></p>
                </div>
              </div>
              <div class="catalog-content-center-wrapper">
                <div class="width-50 text-left catalog-content-center-left"><a href="#">目录</a></div>
                <div class="width-50 text-right catalog-content-center-left">
                  <a href="#" class="catalog-reserve">
                    <i class="icon icon-order reverse-infor"><span class="reverse-name"> 倒序 </span></i>
                  </a>
                </div>
              </div>
            </div>
          </div>
          <div class="net-err-info">
            <div class="sm_con">
              <div class="bg"></div>
              <div class="cn">暂无内容</div>
              <span class="reloadBtn">重新加载</span>
            </div>
          </div>
          <div class="novel-catalog-content">
          </div>
        </div>
      </div>
    `
    if (!catalogs) {
      // 目录配置为空
      this.isCatFetch = true
      this.loadCategory('middle')
        .then(data => {
          isSplitPage = data.data.catalog.isSplitPage
          this.renderCatalogCallBack(data)
        }).catch(err => {
          isFetchLoading = false
          let reloadBtn = this.$catalogSidebar.querySelector('.reloadBtn')
          reloadBtn.addEventListener('click', e => this.reload())
          this.catalogFailMessageEvent()
          console.warn(new Error('网络异常'), err)
          this.categoryList = false
        })
    } else {
      // 目录为数组，本地目录, 直接读取渲染
      // deprecated
      this.categoryList = catalogs
      renderCatalog = catalogs => catalogs.map(catalog => `
        <div class="catalog-page">
          <a class="mip-catalog-btn catalog-page-content"
          mip-catalog-btn mip-link data-button-name="${catalog.name}" href="${catalog.link}" replace>
          ${catalog.name}
          </a>
        </div>`).join('\n')
    }
    // 将底部 bar 插入到页面中
    let $catalogSidebar = document.querySelector('.mip-shell-catalog-wrapper')
    let hadCatalog = !!$catalogSidebar
    if (!hadCatalog) {
      // 初次见面新建一个wrapper, 二次更新时直接复用
      $catalogSidebar = document.createElement('mip-fixed')
      $catalogSidebar.setAttribute('type', 'left')
      $catalogSidebar.setAttribute('top', '0')
      $catalogSidebar.setAttribute('mip-shell', '')
      $catalogSidebar.classList.add('mip-shell-catalog-wrapper')
      $catalogSidebar.addEventListener('touchmove', e =>
        e.stopPropagation()
      )
    }
    $catalogSidebar.innerHTML = catalogHtml // 目录页HTML
    let $catalog = $catalogSidebar.querySelector('.mip-shell-catalog')
    let $contentTop = $catalogSidebar.querySelector('.mip-catalog-btn') // 上边元素
    let $catalogContent = $catalogSidebar.querySelector('.novel-catalog-content')
    if (!this.isCatFetch) {
      $catalogContent.innerHTML = renderCatalog(catalogs)
      this.reverse($contentTop, $catalogContent)
    }
    let $catalogBook = $catalogSidebar.querySelector('.book-catalog-info-title')
    if (book) {
      $catalogBook.style.display = 'block'
    } else {
      $catalog.style.height = 'calc(100%)'
      $catalog.style.height = '-webkit-calc(100%)'
    }

    // 实现倒序，点击倒序，目录顺序倒序，倒序字边正序
    if (!hadCatalog) {
      $catalogSidebar.appendChild($catalog)
      document.body.appendChild($catalogSidebar)
    } else {
      // 将 catalog 内容替换为新内容
      $catalogSidebar.removeChild($catalogSidebar.querySelector('.mip-shell-catalog'))
      $catalogSidebar.appendChild($catalog)
    }
    this.bindClickCatalogMessageEvent()
    this.bindShellCatalogMessageEvent()
    this.bindPageCatalogMessageEvent()
    return $catalogSidebar
  }

  /**
   * 发送目录渲染失败日志
   *
   * @private
   */
  catalogFailMessageEvent () {
    sendWebbLog('stability', {
      msg: 'catalogRenderFailed',
      renderMethod: 'async'
    })
  }

  /**
   * 发送 搜索点出/二跳 日志
   * 点击目录章节绑定发送日志函数
   *
   * @private
   */
  bindClickCatalogMessageEvent () {
    event.delegate(document.documentElement, '.novel-catalog-content .catalog-page-content', 'click', () => {
      sendTCLog('interaction', {
        type: 'b',
        action: 'clkShellCatalog'
      })
    })
  }
  /**
   * 发送 目录展现日志
   * 点击小说阅读器页面内部的目录 发送tc交互日志
   *
   * @private
   */
  bindPageCatalogMessageEvent () {
    event.delegate(document.documentElement, '.navigator .click-cursor', 'click', () => {
      sendTCLog('interaction', {
        type: 'b',
        action: 'clkPageShowCatalog'
      })
    })
  }
  /**
   * 发送 目录展现日志
   * 点击小说阅读器shell的目录 发送tc交互日志
   *
   * @private
   */
  bindShellCatalogMessageEvent () {
    event.delegate(document.documentElement, '.button-wrapper div:first-child', 'click', () => {
      sendTCLog('interaction', {
        type: 'b',
        action: 'clkShellShowCatalog'
      })
    })
  }
  /**
   * 目录消失
   *
   * @param {Event} e 事件对象
   * @param {Object} shellElement 小说章节
   */
  swipeHidden (e, shellElement) {
    e.preventDefault()
    this.hide()
    e.stopPropagation()
    shellElement.toggleDOM(shellElement.$buttonMask, false)
  }

  /**
   * 目录倒序正序
   *
   * @param {HTMLElement} $contentTop 目录头部信息栏dom
   * @param {HTMLElement} $catalogContent 目录列表dom
   */
  reverse ($contentTop, $catalogContent) {
    let reverse = $contentTop.querySelector('.catalog-reserve')
    let reverseName = $contentTop.querySelector('.reverse-name')

    if (reverseHandler) {
      reverse.removeEventListener('click', reverseHandler)
    }
    reverseHandler = () => {
      if (isSplitPage) {
        // isReverse = false时，默认 asc。点击后改为 desc
        let type = !isReverse ? 'desc' : 'asc'
        reverseName.innerHTML = isReverse ? ' 倒序' : ' 正序'
        this.loadCategory(type).then(data => {
          isReverse = !isReverse
          this.renderCatalogCallBack(data)
          // 高亮但不定位
          let currentPage = this.getCurrentPage()
          let $activeCatalog = this.$catalogSidebar.querySelector(`.catalog-page[data-chapter-id="${currentPage.chapter}"]`)
          if ($activeCatalog) {
            $activeCatalog.querySelector('a').classList.add('active')
          }
        })
      } else {
        let $refCatalog
        let $catalogs = $catalogContent.children
        for (let i = 0; i < $catalogs.length; i++) {
          let $node = $catalogs[i]
          if (i !== 0) {
            $catalogContent.insertBefore($node, $refCatalog)
          }
          $refCatalog = $node
        }
        isReverse = !isReverse
        reverseName.innerHTML = !isReverse ? ' 倒序' : ' 正序'
      }
    }
    reverse.addEventListener('click', reverseHandler)
  }

  bindShowEvent (shellElement) {
    let catalog = document.querySelector('.mip-shell-catalog-wrapper')
    let swipeLeft = new util.Gesture(document, {
      preventX: true
    })
    let swipeLeftCatalog = new util.Gesture(catalog, {
      preventX: true
    })
    swipeLeft.on('swipeleft', e => {
      this.swipeHidden(e, shellElement)
    })
    // 解决UC浏览器document不滑动问题
    swipeLeftCatalog.on('swipeleft', e => {
      this.swipeHidden(e, shellElement)
    })
  }

  // 显示侧边目录
  show (shellElement) {
    this.bindShowEvent(shellElement)
    // XXX: setTimeout用于解决tap执行过早，click执行过晚导致的点击穿透事件
    this.$catalogSidebar.classList.add('show')
    // 处理UC浏览器默认禁止滑动，触发dom变化后UC允许滑动
    let $catalogContent = this.$catalogSidebar.querySelector('.novel-catalog-content')
    let $catWrapper = this.$catalogSidebar.querySelector('.novel-catalog-content-wrapper')
    // let catalog = [...$catalogContent.querySelectorAll('div')]
    // 处理UC浏览器默认禁止滑动，触发dom变化后UC允许滑动
    // for (let i = 0; i < catalog.length; i++) {
    //   catalog[i].innerHTML = catalog[i].innerHTML
    // }
    if (!this.categoryList) {
      if (!this.isShowNetErr) {
        let errCont = this.$catalogSidebar.querySelector('.net-err-info')
        util.css(errCont, {
          'display': 'block',
          'height': 'calc(100% - ' + this.$catalogSidebar.querySelector('.book-catalog-info').clientHeight + 'px)'
        })
        util.css(document.querySelector('.sm_con'), {
          'margin-top': (document.querySelector('.net-err-info').clientHeight - document.querySelector('.sm_con').clientHeight) * 0.4 + 'px'
        })
        errCont.addEventListener('touchmove', e => {
          e && e.stopPropagation()
          e.preventDefault()
        })
        this.isShowNetErr = true
      }
      return
    }
    let currentPage = this.getCurrentPage()
    document.body.classList.add('body-forbid')
    if (!currentPage) {
      console.error(new Error('链接里没有配置crid'))
      return
    } else if (currentPage === 'matchErr') {
      console.error(new Error('请检查模板配置的currentPage.chapter是否与异步目录章节id匹配'))
      return
    }
    // let catLocation = {
    //   section: currentPage.chapter,
    //   page: currentPage.page
    // }
    let $formalActiveLink = $catalogContent.querySelector('.catalog-page a.active')
    let $currentActiveCatalog = $catalogContent.querySelector(`.catalog-page[data-chapter-id="${currentPage.chapter}"]`)
    if ($formalActiveLink) {
      $formalActiveLink.classList.remove('active')
    }
    if ($currentActiveCatalog) {
      $currentActiveCatalog.querySelector('a').classList.add('active')
      $catWrapper.scrollTop = $currentActiveCatalog.offsetTop
    }
    // if (isReverse) {
    //   catalog[catalog.length - this.nowCatNum].querySelector('a').classList.remove('active')
    //   catalog[catalog.length - catLocation.section].querySelector('a').classList.add('active')
    //   this.nowCatNum = catLocation.section
    //   $catWrapper.scrollTop = catalog[catalog.length - catLocation.section].offsetTop
    // } else {
    //   catalog[this.nowCatNum - 1].querySelector('a').classList.remove('active')
    //   catalog[catLocation.section - 1].querySelector('a').classList.add('active')
    //   this.nowCatNum = catLocation.section
    //   $catWrapper.scrollTop = catalog[catLocation.section - 1].offsetTop
    // }
  }

  // 隐藏侧边目录
  hide () {
    document.body.classList.remove('body-forbid')
    this.$catalogSidebar.classList.remove('show')
  }

  // 禁止冒泡，防止目录滚动到底后，触发外层小说页面滚动
  _stopPropagation () {
    if (this.propagationStopped) {
      // 由于目录页只有一个，刷新页面时只绑定一次
      return
    }
    // sidebar 绑定一次停止冒泡事件, 防止滚到底部后外层小说内容继续滚动
    this.$catalogSidebar.addEventListener('scroll', (e) => {
      e && e.stopPropagation()
      return false
    })
    return true
  }

  /**
   * 重新加载目录
   */
  reload () {
    isReverse = false
    this.loadCategory('middle')
      .then(data => {
        util.css(this.$catalogSidebar.querySelector('.net-err-info'), {
          display: 'none'
        })
        isSplitPage = data.data.catalog.isSplitPage
        this.renderCatalogCallBack(data, {
          isReload: true
        })
      }).catch(err => {
        this.catalogFailMessageEvent()
        console.warn(new Error('网络异常'), err)
        this.categoryList = false
      })
  }

  getLatestChapterId () {
    if (this.isCatFetch && latestChapter) {
      return latestChapter.id
    }
  }
}

export default Catalog
