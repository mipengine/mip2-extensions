const UA = navigator.userAgent.toLowerCase()
const badUaList = ['baiduboxapp']

function isIPhone () {
  return UA.indexOf('iphone') > -1
}

function isBadUA () {
  let badUA = 0
  badUaList.forEach(function (val) {
    if (UA.indexOf(val) > -1) {
      badUA = 1
    }
  })
  return badUA
}

export function shouldRenderVideoElement () {
  return isIPhone() && isBadUA()
}
