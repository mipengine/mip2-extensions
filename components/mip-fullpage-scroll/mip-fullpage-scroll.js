import './index.less'

const {
  CustomElement,
  util,
  // viewer,
  // viewport
} = MIP
const Gesture = util.Gesture

export default class MIPFullpageScroll extends CustomElement {
  // 初始化
  connectedCallback () {
    // 引入API
    this.gesture = new Gesture(this.element)

    // 获取标签参数
    this.pagebox = document.getElementById('pagebox')
    this.allpages = this.element.getElementsByClassName('section').length
    this.changefun = this.element.getAttribute('changefun') === null ? 'ud' : this.element.getAttribute('changefun')
    
    // 关于外框尺寸
    // this.unit = this.element.getAttribute('unit') == undefined ? 'v' : this.element.getAttribute('unit')
    // this.width = this.element.getAttribute('width') == undefined ? '100' : this.element.getAttribute('width')
    // this.height = this.element.getAttribute('height') == undefined ? '100' : this.element.getAttribute('height')

    // console.log(this.unit,this.width,this.height)

    // 初始化动画CSS类（待修改，可自定义动画效果）
    this.pagebox.classList.add('ChangeAnimate')

    // 初始化切换方式(待修改)
    if (this.changefun === 'lr') {
      this.pagebox.classList.add('lr')
      this.pageboxwidth = 'width:' + this.allpages * 100 + 'vw;'
    } else {
      this.pageboxwidth = ''
    }

    // 设定导航点
    let mainid = this.element.getAttribute('id')
    let indexDot = '<div class="navdots">'
    for (let i = 1; i < this.allpages; i++) {
      indexDot += '<div class="navdot" on="tap:' + mainid + '.ChangeTo(' + (i - 1) + ')"></div>'
    }
    indexDot += '</div>'
    let index = util.dom.create(indexDot)
    util.dom.insert(this.element, index)
  }

  // 切换函数
  ChangeTo (event, index) {
    if (this.changefun === 'ud') {
      this.pagebox.style.cssText = 'top:-' + index * 100 + 'vh'
    }
    if (this.changefun === 'lr') {
      this.pagebox.style.cssText = this.pageboxwidth + 'left:-' + index * 100 + 'vw;'
    }
  }

  // 整体页面移动函数
  MoveTo (event, opt) {
    let option = util.jsonParse(opt)
    this.element.style.cssText = 'top:' + option.top + ';left:' + option.left + ';'
  }
  BackToDefault () {
    this.element.style.cssText = 'top:0;left:0;'
  }

  build () {
    // 数据绑定
    let mainclass = this
    let allpages = this.allpages

    // 初始化应用变量
    let nowpage = 0

    // 滑动事件监听
    this.gesture.on('swipe', function (event, data) {
      if (data.swipeDirection === 'up' || data.swipeDirection === 'left') {
        if (nowpage < allpages - 1) nowpage++
      }
      if (data.swipeDirection === 'down' || data.swipeDirection === 'right') {
        if (nowpage > 0) nowpage--
      }
      mainclass.ChangeTo(event, nowpage)
    })

    // 事件绑定
    this.addEventAction('ChangeTo', this.ChangeTo.bind(this))
    this.addEventAction('MoveTo', this.MoveTo.bind(this))
    this.addEventAction('BackToDefault', this.BackToDefault.bind(this))
  }
}
