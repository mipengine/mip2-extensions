import './index.less'

export default class MIPFullpageScroll extends MIP.CustomElement {
  build () {
    let Gesture = MIP.util.Gesture
    let gesture = new Gesture(this.element)

    // 获取全屏页面内容
    let pagebox = document.getElementById('pagebox')
    let allpages = this.element.getElementsByClassName('section').length
    let nowpage = 0
    let pageboxwidth = 0

    let changefun = this.element.getAttribute('changefun')
    changefun = changefun === undefined ? 'lr' : 'ud'

    if (changefun === 'lr') {
      pagebox.classList.add('lr')
      pageboxwidth = 'width:' + allpages * 100 + 'vw;'
    }

    let udSwipe = function (e) {
      e.style.cssText = 'top:-' + nowpage * 100 + 'vh'
    }
    let lrSwipe = function (e) {
      e.style.cssText = pageboxwidth + 'left:-' + nowpage * 100 + 'vw;'
    }

    pagebox.classList.add('ChangeAnimate')
    gesture.on('swipe', function (event, data) {
      if (changefun === 'ud') {
        if (data.swipeDirection === 'up') {
          if (nowpage < allpages - 1) nowpage++
          udSwipe(pagebox)
        }
        if (data.swipeDirection === 'down') {
          if (nowpage > 0) nowpage--
          udSwipe(pagebox)
        }
      }
      if (changefun === 'lr') {
        if (data.swipeDirection === 'left') {
          if (nowpage < allpages - 1) nowpage++
          lrSwipe(pagebox)
        }
        if (data.swipeDirection === 'right') {
          if (nowpage > 0) nowpage--
          lrSwipe(pagebox)
        }
      }
    })
  }
}
