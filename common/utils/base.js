// const aldhttp = 'https://www.lanxiniu.com/BaiduMip/'
const aldhttp = 'http://127.0.0.1:8111/example/'
const outAldhttp = 'https://yz-alipay.fundway.net/'
const tranObjUrlToCache = urls => {
  let result = {}
  Object.keys(urls).map(key => {
    result[key] = MIP.util.makeCacheUrl(urls[key])
  })
  return result
}
function resetRem () {
  let rootDom = document.body || document.documentElement
  let clientWidth = rootDom.clientWidth
  let designWidth = 750
  let realfontsize
  let windowheight = window.outerWidth
  realfontsize = (clientWidth / designWidth) * 40
  rootDom.style.fontSize = realfontsize + 'px'
  if (windowheight > 1200) {
    console.log(1)
    let a = document.getElementById('fix_bottom')
    a.style.position = 'inherit'
  }
  (function (doc, win, designWidth) {
    let rootDom = doc.body || doc.documentElement
    let resizeEvt = 'onorientationchange' in window ? 'orientationchange' : 'resize'
    let recalc = function () {
      console.log('调用rem自适应')
      let clientWidth = rootDom.clientWidth
      if (!clientWidth) {
        return
      }
      rootDom.style.fontSize = 40 * (clientWidth / designWidth) + 'px'
      doc.documentElement.style.fontSize = 40 * (clientWidth / designWidth) + 'px'
    }
    recalc()

    win.addEventListener(resizeEvt, recalc, false)
    // doc.addEventListener('DOMContentLoaded', recalc, false);
  }(document, window, 750))
}
export default ({
  resetRem: resetRem,
  outAldhttp: outAldhttp,
  htmlhref: tranObjUrlToCache({
    license: aldhttp + 'license.html',
    secPage: aldhttp + 'secPage.html'
  })
})
