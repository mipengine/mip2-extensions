/**
 * @file mip-vd-tabs.js
 * @author zhangjignfeng convert es module: chenqiushi(qiushidev@gmail.com)
 */

/* global $ */
import Tab from './tab'
import './mip-vd-tabs.less'

const {CustomElement} = MIP

const EPISODE_RANGE = 25
const EPISODE_PAGE_SIZE = 50
const ICON_SRC = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAQCAMAAAA/D5+aAAAAUVBMVEUAAABmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmbIinYlAAAAGnRSTlMABKqP+IFs7+fStaZaSjsuGBAK3tzGw3gkIaqv3YsAAABmSURBVBjTddE5FoMwEMBQGcy+Q1bd/6Cp8xir/aWARKn3FFjdAK2O5020gVp9HjexStCowx4JtOr1iQTmrP0WCSxZuzUSWDvNSySw9ZrnSOD7UNtIYB/UUOB4lQTOsSSQpqp84U9+ascIWXpxA/QAAAAASUVORK5CYII='
const ALLOW_SCROLL = 'allow-scroll'
const TOGGLE_MORE = 'toggle-more'
const CURRENT = 'current'
const TYPE = 'type'
const WRAPPER_CLS = 'mip-vd-tabs'
const CONTENT_CLS = 'mip-vd-tabs-content'
const SELECTED_CLS = 'mip-vd-tabs-nav-selected'
const ITEM_CLS = 'mip-vd-tabs-nav-li'
const NAV_CLS = 'mip-vd-tabs-nav'
const VIEW_CLS = 'mip-vd-tabs-nav-view'
const TOGGLE_CLS = 'mip-vd-tabs-nav-toggle'
const BOTTOM_CLS = 'mip-vd-tabs-nav-bottom'
const TPL_REG = /\{\{\w}}/g

/* eslint-disable no-new */
export default class MIPVdTabs extends CustomElement {
  build () {
    window.require(['zepto'], $ => {
      let el = this.element
      let type = el.getAttribute(TYPE)

      switch (type) {
        case 'episode':
          let $result = this.generateWrapper()
          if (el.hasAttribute(TOGGLE_MORE)) {
            $result = this.generateToggle($result)
          }
          this.generateEpisode(
            $result,
            el.getAttribute('total'),
            el.getAttribute(CURRENT),
            el.getAttribute('text-tpl'),
            el.getAttribute('link-tpl'),
            el.getAttribute('head-title')
          )
          break
        case 'bottom':
        default:
          this.generateCommonTab($result)
      }
    })
  }

  /**
   * 生成通用 Tab
   */
  generateCommonTab () {
    let el = this.element
    let $el = $(el)
    let type = el.getAttribute(TYPE)
    let allowScroll = !!el.hasAttribute(ALLOW_SCROLL)
    let toggleMore = !!el.hasAttribute(TOGGLE_MORE)
    let current = parseInt(el.getAttribute(CURRENT), 0) || 0
    let $header = null
    $el.addClass(WRAPPER_CLS)

    if (type === 'bottom') {
      $header = $(el.children.item(el.children.length - 1))
    } else {
      $header = $(el.children.item(0))
    }

    $header.detach()
    $header.children().each((index, element) => {
      let $element = $(element)
      if (current === index) {
        $element.addClass(SELECTED_CLS)
      }
      $element.addClass(ITEM_CLS)
    })
    if (allowScroll) {
      $header
        .addClass(VIEW_CLS)
        .append(
          $('<div class="' + NAV_CLS + '"></div>')
            .append($header.children())
        )
      if (toggleMore) {
        $header.append('<div class="mip-vd-tabs-nav-toggle"><img src=' + ICON_SRC + '></div>')
      }
    } else {
      $header
        .addClass('mip-vd-tabs-row-tile')
        .append(
          $('<div class="' + NAV_CLS + '"></div>')
            .append($header.children())
        )
    }

    $el.children()
      .addClass(CONTENT_CLS)
      .css('display', 'none')
      .eq(current)
      .css('display', 'block')

    if (type === 'bottom') {
      $el.append($header)
    } else {
      $el.prepend($header)
    }

    new Tab($el, {
      allowScroll,
      current: parseInt($el.attr(CURRENT), 10) || 1,
      toggleMore,
      toggleLabel: $el.attr('toggle-label') || '请选择',
      currentClass: SELECTED_CLS,
      navWrapperClass: NAV_CLS,
      viewClass: VIEW_CLS,
      contClass: CONTENT_CLS,
      navClass: ITEM_CLS,
      logClass: 'mip-vd-tabs-log',
      toggleClass: TOGGLE_CLS,
      layerClass: 'mip-vd-tabs-nav-layer',
      layerUlClass: 'mip-vd-tabs-nav-layer-ul'
    })
  }

  /**
   * 生成剧集选择下拉列表
   *
   * @param {string} linkTpl 链接模板
   *
   * @returns {string} wrapper 下拉列表 dom 结构
   */
  // 生成剧集选择下拉列表
  generateEpisodeDown (linkTpl) {
    let $el = $(this.element)
    let pageSize = parseInt($el.attr('page-size'), 10) || EPISODE_PAGE_SIZE
    let currentNum = parseInt($el.attr(CURRENT), 10) || 1
    let totalNum = parseInt($el.attr('total'), 10) || 1
    let tabCount = Math.ceil(totalNum / pageSize)
    let tabCurNum = Math.floor((currentNum - 1) / pageSize)
    let tabList = []

    for (let i = 0; i < tabCount; i++) {
      let from = pageSize * i + 1
      let to = Math.min(totalNum, pageSize * (i + 1))
      tabList.push({
        from,
        to,
        text: '' + from + (from < to ? ' - ' + to : '')
      })
    }

    let wrapper = $('<div class="' + WRAPPER_CLS + '"></div>')
    wrapper.append(
      tabList.map((v, index) => {
        let epFragment = '<div class="' +
          CONTENT_CLS +
          ' mip-vd-tabs-episode-content" ' +
          (index === tabCurNum ? '' : 'style="display:none;" ') +
          ' >'
        for (let j = v.from; j <= v.to; j++) {
          let selectedClass = j === currentNum ? 'mip-vd-tabs-episode-item-selected' : ''
          let link = (linkTpl ? ' href="' + linkTpl.replace(TPL_REG, j) + '"' : '')
          epFragment = epFragment +
            '<span class="mip-vd-tabs-episode-item ' +
            selectedClass + '"' +
            link + '>' +
            j +
            '</span>'
        }
        epFragment += '</div>'
        return epFragment
      }).join('')
    )

    if (tabCount > 1) {
      let tabFragment = ''
      let scrollNum = 4
      if (tabCount > scrollNum) {
        tabFragment = '<div class="' + VIEW_CLS + '">'
      }
      tabFragment += '<ul class="' + NAV_CLS + ' ' + BOTTOM_CLS + ' ' + 'mip-vd-tabs-episode-bottom-nav">'
      tabFragment += tabList.map((v, index) => {
        let selectedClass = index === tabCurNum ? SELECTED_CLS : ''
        return '<li class="' + ITEM_CLS + ' ' + selectedClass + '">' + v.text + '</li>'
      }).join('')
      tabFragment += '</ul>'
      if (tabCount > scrollNum) {
        tabFragment += '</div>'
      }
      wrapper.append(tabFragment)

      new Tab(wrapper, {
        allowScroll: tabCount > scrollNum,
        current: Math.floor((currentNum - 1) / pageSize) || 1,
        currentClass: SELECTED_CLS,
        navWrapperClass: NAV_CLS,
        viewClass: VIEW_CLS,
        contClass: CONTENT_CLS,
        navClass: ITEM_CLS,
        logClass: 'mip-vd-tabs-log',
        toggleClass: TOGGLE_CLS
      })
    }
    return wrapper
  }

  /**
   * 生成 wrapper
   *
   * @returns {$} wrapper 结构
   */
  generateWrapper () {
    let $el = $(this.element)
    let $result = null
    $el.addClass(WRAPPER_CLS)
    let totalNum = parseInt($el.attr('total'), 10) || 1
    if (totalNum > 4) {
      $result = $('<div class="' + VIEW_CLS + '">' +
        '<ul class="' + NAV_CLS + '"></ul>' +
        '</div>'
      )
    } else {
      $result = $('<div class="mip-vd-tabs-row-tile">' +
        '<ul class="' + NAV_CLS + '"></ul>' +
        '</div>'
      )
    }
    return $result
  }

  /**
   * 生成 Toggle 结构
   *
   * @param {$} $result wrapper
   * @returns {$} toggle 结构
   */
  generateToggle ($result) {
    let $el = $(this.element)
    let totalNum = parseInt($el.attr('total'), 10) || 1
    if (totalNum <= 4) {
      return $result
    }

    $result.append('<div class="' + TOGGLE_CLS + '">' +
      '<img src=' + ICON_SRC + '>' +
      '</div>')
    return $result
  }

  /**
   * 生成剧情展开结构
   *
   * @param {$} $result wrapper
   * @param {string} total 剧集总数
   * @param {string} current 当前已选标签页
   * @param {string} textTpl 显示在标签页上的剧集文案
   * @param {string} linkTpl 标签页和下拉菜单里的剧集跳转链接
   * @param {string} headTitle 标签页和下拉菜单里的剧集跳转新页面的头部标题
   */
  generateEpisode ($result, total, current, textTpl, linkTpl, headTitle) {
    let $el = $(this.element)

    let totalNum = parseInt(total, 10)
    let currentNum = parseInt(current, 10) || 1
    let tpl = textTpl || '第{x}集'
    let html = ''
    for (let i = Math.max(1, currentNum - EPISODE_RANGE),
      r = Math.min(totalNum, currentNum + EPISODE_RANGE);
      i <= r;
      i++) {
      html = html +
        '<a class="' + ITEM_CLS + ' ' +
        (i === currentNum ? SELECTED_CLS : '') + '" ' +
        (linkTpl ? ' href="' + linkTpl.replace(TPL_REG, i) + '"' : '') + '>' +
        tpl.replace(TPL_REG, '' + i) +
        '</a>'
    }

    $result.find('.' + NAV_CLS).append(html)
    $el.empty().append($result)

    let tab = new Tab($el, {
      allowScroll: !!$el.get(0).hasAttribute(ALLOW_SCROLL),
      toggleMore: false,
      current: currentNum || 1,
      currentClass: SELECTED_CLS,
      navWrapperClass: NAV_CLS,
      viewClass: VIEW_CLS,
      navClass: ITEM_CLS,
      logClass: 'mip-vd-tabs-log',
      toggleClass: TOGGLE_CLS,
      toggleLabel: $el.attr('toggle-label') || '请选择'
    })

    // override toggle-more
    let $navLayer = $('<div class="mip-vd-tabs-nav-layer"><p>' + tab.toggleLabel + '</p></div>')
    let $navLayerUl = $('<ul class="mip-vd-tabs-nav-layer-ul"></ul>')
    let $mask = $('<div class="mip-vd-tabs-mask"></div>')

    tab.toggleState = 0 // 展开状态 0-收起,1-展开

    // 事件代理
    $navLayerUl.on('click', '.mip-vd-tabs-episode-item ', () => {
      toggleUp()
    })

    $mask.on('click', () => {
      toggleUp()
    }).on('touchmove', e => {
      e.preventDefault()
    })

    tab.toggle.on('click', () => {
      tab.toggleState === 0 ? toggleDown.call(this) : toggleUp.call(this)
    })

    /**
     * 收起剧集
     */
    function toggleUp () {
      $navLayerUl.empty()
      $navLayer.hide()
      $mask.hide()
      $el
        .find('.mip-vd-tabs-nav-toggle,.mip-vd-tabs-scroll-touch')
        .css({'position': '', 'top': ''})
      $el
        .find('.mip-vd-tabs-nav-layer')
        .css({'position': '', 'border-top': '', 'top': ''})
      tab.toggle.css({
        '-webkit-transform': 'scaleY(1)',
        'transform': 'scaleY(1)'
      })
      tab.toggleState = 0
    }

    /**
     * 展开剧集
     */
    function toggleDown () {
      $navLayerUl.html(this.generateEpisodeDown(linkTpl))
      $navLayer.append($navLayerUl)
      $el.append($mask.show())
      tab.view.after($navLayer.show())
      $el
        .find('.mip-vd-tabs-scroll-touch,.mip-vd-tabs-nav-toggle')
        .css({'position': 'fixed', 'top': '1px'})
      $el
        .find('.mip-vd-tabs-nav-layer')
        .css({'position': 'fixed', 'border-top': '1px solid #ccc', 'top': '0'})
      tab.toggle.css({
        '-webkit-transform': 'scaleY(-1)',
        'transform': 'scaleY(-1)'
      })
      tab.toggleState = 1
    }

    $el.delegate('.' + ITEM_CLS + ', .mip-vd-tabs-episode-item', 'click', function (ev) {
      ev.preventDefault()

      let href = $(this).attr('href')

      if (!href) {
        return
      }

      // 顶部标题
      let head = $(this).text()

      if (!head) {
        head = $(this).find('.' + ITEM_CLS).text()
      }

      let message = {
        'event': 'loadiframe',
        'data': {
          'url': href,
          'title': headTitle || head,
          'click': $el.data('click')
        }
      }

      if (window.parent !== window) {
        window.parent.postMessage(message, '*')
      } else {
        location.href = href
      }
    })
  }
}
