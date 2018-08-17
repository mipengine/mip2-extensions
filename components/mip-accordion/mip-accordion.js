/**
 * @accordion
 * @author fengchuantao, liangjiaying
 * @file mip-accordion
 * @time 2017.07
 * @author caoru
 * @file mip-accordion
 * @time 2018.08
 */
import './mip-accordion.less'
let {
  CustomElement

} = MIP
export default class MipAccordion extends CustomElement {
  constructor (...args) {
    // 继承父类属性、方法
    super(...args)
    this.localurl = location.href
  }
  /**
   * 恢复用户上次选择
   *
   * @param  {string} id 上次用户选择的id
   */
  userSelect (id) {
    let sessionsKey = 'MIP-' + id + '-' + this.localurl
    let datajson = this.getSession(sessionsKey)
    for (let data of Object.entries(datajson)) {
      let [prop] = data
      let expand = datajson[prop]
      if (expand) {
        let content = this.element.querySelector('#' + prop)
        content.setAttribute('aria-expanded', 'open')
        content.parentElement.setAttribute('expanded', 'open')
      }
    }
  }
  /**
   * 绑定事件
   *
   * @param  {Object} elem 整个mip-accordion对象
   */
  bindEvent (elem) {
    let aniTime = elem.getAttribute('animatetime')
    if (aniTime === undefined || isNaN(aniTime)) {
      // if transition time is not set, set into 0.24s
      aniTime = 0.24
    } else {
      // '0.2s' -> 0.2, 20 -> 1, -0.5 -> 0.5
      aniTime = Math.min(parseFloat(aniTime), 1)
    }
    elem.addEventListener('click', e => {
      let showHeader = e.target
      let $showMore = this.element.querySelector('.show-more')
      let $showLess = this.element.querySelector('.show-less')
      if ($showMore || $showLess) {
        showHeader = showHeader.parentElement
      }
      let targetId = showHeader.getAttribute('aria-controls')
      let $targetdom = elem.querySelector('#' + targetId)
      if (!$targetdom) {
        return
      }
      let expanded = $targetdom.getAttribute('aria-expanded')
      if (expanded === 'open') {
        // 收起内容区域
        // fold animation
        this.heightAni({
          ele: $targetdom,
          type: 'fold',
          transitionTime: aniTime,
          cbFun () {
            $targetdom.setAttribute('aria-expanded', 'close')
          }
        })
        showHeader.parentElement.setAttribute('expanded', '')
        if ($showMore && $showMore.length && $showLess.length) {
          $showMore.css('display', 'block')
          $showLess.css('display', 'none')
        }
        this.setSession(elem, targetId, false)
      } else {
        // 同时只能展开一个节点
        if (elem.hasAttribute('expaned-limit')) {
          let sections = elem.querySelectorAll('section')
          for (let section of sections) {
            let cont = section.querySelector('.mip-accordion-content')
            let header = section.querySelector('.mip-accordion-header')
            let id = header.getAttribute('aria-controls')
            section.removeAttribute('expanded')
            cont.removeAttribute('aria-expanded')
            this.setSession(elem, id, false)
            // fold animation
            this.heightAni({
              ele: cont,
              type: 'fold',
              transitionTime: aniTime
            })
          }
        }
        $targetdom.setAttribute('aria-expanded', 'open')
        $targetdom.parentElement.setAttribute('expanded', 'open')
        if ($showMore && !!$showMore.length && !!$showLess.length) {
          $showLess.css('display', 'block')
          $showMore.css('display', 'none')
        }
        // unfold animation
        this.heightAni({
          ele: $targetdom,
          type: 'unfold',
          oriHeight: 0,
          transitionTime: aniTime
        })
        this.setSession(elem, targetId, true)
      }
    })
  }
  /**
   * 设置session storage
   *
   * @param {Object} element 整个mip-accordion对象
   * @param {Object} obj     aria-controls属性值，记录哪个节点
   * @param {boolean} expand true 展开 或者 false 收起
   */
  setSession (element, obj, expand) {
    let sessionsKey = 'MIP-' + element.getAttribute('sessions-key') + '-' + this.localurl
    let objsession = this.getSession(sessionsKey)
    objsession[obj] = expand
    sessionStorage[sessionsKey] = JSON.stringify(objsession)
  }
  /**
   * 获取 sission
   *
   * @param  {Object} sessionsKey 之前记录的session
   * @return {Object} data        返回session里的数据
   */
  getSession (sessionsKey) {
    let data = sessionStorage[sessionsKey]
    return data ? JSON.parse(data) : {}
  }

  /**
   * Make height transiton for element that has unknown height.
   * height transiton from 0px/40px to whatever height element will be.
   *
   * @param  {Object} opt options
   * @example
   * {
   *     "ele": document.getElementById('id1'), // target DOM
   *     "type": "fold",                  // "fold" or "unfold"
   *     "transitionTime": "0.3",         // seconds, animation time
   *     "tarHeight": "140px",            // DOM height when animation ends
   *     "oriHeight": "20px",             // DOM height when animation begins
   *     "cbFun": function() {}.bind()    //callback, exec after animation
   * }
   */
  heightAni (opt) {
    let element = opt.ele
    let type = opt.type
    let transitionTime
    if (!type || !element) {
      return
    }
    if (opt.transitionTime === undefined || isNaN(opt.transitionTime)) {
      // if transition time is not set, set into 0.24s
      transitionTime = 0.24
    } else {
      // '0.2s' -> 0.2, 20 -> 1, -0.5 -> 0.5
      transitionTime = Math.min(parseFloat(opt.transitionTime), 1)
    }
    // use ?: to make sure oriHeight won't be rewrite when opt.oriHeight is set to 0
    // use ?: to make sure oriHeight won't be rewrite when opt.oriHeight is set to 0
    let oriHeight = (opt.oriHeight !== undefined ? opt.oriHeight : getComputedStyle(element).height)
    let tarHeight
    let cbFun = opt.cbFun || function () {}

    if (type === 'unfold') {
      // make sure tarHeight won't be rewrite when opt.tarHeight is set to 0
      if (opt.tarHeight !== undefined) {
        tarHeight = opt.tarHeight
      } else {
        // before set height to auto, remove animation.
        // or bad animation happens in iphone 4s
        element.style.transition = 'height 0s'
        element.style.height = 'auto'
        tarHeight = getComputedStyle(element).height
      }
      // set height to auto after transition,
      // in case of height change of inside element later.
      setTimeout(function () {
        // before set height to auto, remove animation.
        // or bad animation happens in iphone 4s
        element.style.transition = 'height 0s'
        element.style.height = 'auto'
      }, transitionTime * 1000)
    } else if (type === 'fold') {
      tarHeight = opt.tarHeight || 0
    }
    element.style.height = oriHeight
    // now start the animation
    setTimeout(function () {
      element.style.transition = 'height ' + transitionTime + 's'
      // XXX: in setTimeout, or there won't be any animation
      element.style.height = tarHeight
    }, 10)
    // after transition, exec callback functions
    setTimeout(function () {
      cbFun()
    }, transitionTime * 1000)
  }
  /**
   * 获取最近的下一个兄弟元素
   *
   * @param  {Object} ele  当前元素
   * @return {Object} item 最近的下一个兄弟元素
   */
  nextSibling (ele) {
    if (ele.nextElementSibling !== undefined) {
      return ele.nextElementSibling
    } else {
      let item = ele.nextSibling
      while (item && item.nodeType !== 1) {
        item = item.nextSibling
      }
      return item
    }
  }
  // 提前渲染
  prerenderAllowed () {
    return true
  }
  /**
   * 需要提前加载，图片需要提前加载否则部分浏览器不显示
   */
  build () {
    let element = this.element
    this.currentState = this.getSession(this)
    element.setAttribute('type', element.getAttribute('type') || 'automatic')
    this.sections = [...element.querySelectorAll('section')]
    this.id = element.getAttribute('sessions-key')
    element.setAttribute('role', 'tablist')
    this.sections.map((section, index) => {
      let header = section.children[0]
      let content = this.nextSibling(header)
      header.classList.add('mip-accordion-header')
      content.classList.add('mip-accordion-content')
      let id = content.getAttribute('id')
      if (!id) {
        id = 'MIP_' + this.id + '_content_' + index
        content.setAttribute('id', id)
      }
      // tab 状态[展开|收起]判断
      if (this.currentState[id]) {
        section.attr('expanded', '')
      } else if (this.currentState[id] === false) {
        section.removeAttribute('expanded')
      }
      // 手动控制或者自动根据用户操作控制
      if (element.getAttribute('type') === 'manual' && section.hasAttribute('expanded')) {
        content.setAttribute('aria-expanded', 'open')
        this.setSession(element, element.setAttribute('aria-controls', true))
      } else if (element.getAttribute('type') === 'automatic') {
        content.setAttribute('aria-expanded', section.hasAttribute('expanded').toString())
      }
      header.setAttribute('aria-controls', id)
    })
    if (element.getAttribute('type') === 'automatic') {
      this.userSelect(this.id)
    }
    this.bindEvent(element)
  }
}
