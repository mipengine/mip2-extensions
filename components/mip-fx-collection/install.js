/**
 * @file install fx on element
 * @author sekiyika(pengxing@baidu.com)
 */

import Parallax from './fxs/parallax'
import FlyInBottom from './fxs/fly-in-bottom'
import FlyInTop from './fxs/fly-in-top'
import FlyInLeft from './fxs/fly-in-left'
import FlyInRight from './fxs/fly-in-right'
import FadeIn from './fxs/fade-in'
import FadeInScroll from './fxs/fade-in-scroll'

export default function installOn (element, fxType) {
  let FxClazz
  switch (fxType) {
    case 'parallax':
      FxClazz = Parallax
      break
    case 'fly-in-bottom':
      FxClazz = FlyInBottom
      break
    case 'fly-in-top':
      FxClazz = FlyInTop
      break
    case 'fly-in-left':
      FxClazz = FlyInLeft
      break
    case 'fly-in-right':
      FxClazz = FlyInRight
      break
    case 'fade-in':
      FxClazz = FadeIn
      break
    case 'fade-in-scroll':
      FxClazz = FadeInScroll
      break
  }

  let fx = new FxClazz(element)
  fx.assert()
  fx.sanitize()
  fx.install()
}
