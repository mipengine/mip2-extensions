/**
 * @file url rewriter
 * @author mj(zoumiaojiang@gmail.com)
 */

import { parseUrl, getUrlWithoutHash } from './util'

const { util } = MIP

/**
 * url writer
 *
 * @param {RegExp} urlMatchRegExp urlMatch RegExp
 * @param {string} shellUrl shell url
 */
export default function installUrlRewriter (urlMatchRegExp, shellUrl) {
  let shellLoc = parseUrl(shellUrl)

  util.event.delegate(document, 'a', 'click', event => {
    let target = event.target
    if (!target || target.tagName !== 'A' || !target.href) {
      return
    }

    let tgtLoc = parseUrl(target.href)
    if (tgtLoc.origin === shellLoc.origin &&
      tgtLoc.pathname !== shellLoc.pathname &&
      urlMatchRegExp.test(tgtLoc.href)
    ) {
      if (target.getAttribute('i-miphtml-orig-href')) {
        return
      }

      if (getUrlWithoutHash(tgtLoc.href) === getUrlWithoutHash(window.location.href)) {
        return
      }

      target.setAttribute('i-miphtml-orig-href', target.href)
      target.href = shellUrl + '#href=' + encodeURIComponent(tgtLoc.pathname + tgtLoc.search + tgtLoc.hash)
    }
  })
}
