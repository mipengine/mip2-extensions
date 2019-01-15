/**
 * @file Mustache template
 * @author chenyongle(chenyongle@baidu.com)
 */
import htmlSanitizer from './html-sanitizer'
const SELF_CLOSING_TAGS = {
  'br': true,
  'col': true,
  'hr': true,
  'img': true,
  'input': true,
  'source': true,
  'track': true,
  'wbr': true,
  'area': true,
  'base': true,
  'command': true,
  'embed': true,
  'link': true,
  'meta': true,
  'param': true
}

const BLACKLISTED_TAGS = {
  'applet': true,
  'audio': true,
  'base': true,
  'embed': true,
  'form': true,
  'frame': true,
  'frameset': true,
  'iframe': true,
  'img': true,
  'link': true,
  'meta': true,
  'object': true,
  'script': true,
  'style': true,
  'svg': true,
  'template': true,
  'video': true
}
// 'WHITELISTED_FORMAT_TAGS' is assigned a value but never used, so commented out temporarily
// const WHITELISTED_FORMAT_TAGS = [
//   'b',
//   'br',
//   'code',
//   'del',
//   'em',
//   'i',
//   'ins',
//   'mark',
//   'q',
//   's',
//   'small',
//   'strong',
//   'sub',
//   'sup',
//   'time',
//   'u'
// ]

const WHITELISTED_ATTR_PREFIX_REGEX = /^data-/i

const BLACKLISTED_ATTR_VALUES = [
  'javascript:',
  'vbscript:',
  'data:',
  '<script',
  '</script'
]

const BLACKLISTED_TAG_SPECIFIC_ATTR_VALUES = {
  'input': {
    'type': /(?:image|file|password|button)/i
  }
}

const BLACKLISTED_FIELDS_ATTR = [
  'form',
  'formaction',
  'formmethod',
  'formtarget',
  'formnovalidate',
  'formenctype'
]

const BLACKLISTED_TAG_SPECIFIC_ATTRS = {
  'input': BLACKLISTED_FIELDS_ATTR,
  'textarea': BLACKLISTED_FIELDS_ATTR,
  'select': BLACKLISTED_FIELDS_ATTR
}

const WHITELISTED_ATTRS = [
  'fallback',
  'href',
  'on',
  'placeholder'
]

function isValidAttr (tagName, attrName, attrValue) {
  if (attrName.indexOf('on') === 0 && attrName !== 'on') {
    return false
  }

  if (attrName === 'style') {
    return false
  }

  if (attrValue) {
    // \u0000 eslint 会报错，但是这里的逗号更神奇
    /* eslint-disable-next-line */
    let attrValueNorm = attrValue.toLowerCase().replace(/[\s,\u0000]+/g, '')
    for (let i = 0; i < BLACKLISTED_ATTR_VALUES.length; i++) {
      if (attrValueNorm.indexOf(BLACKLISTED_ATTR_VALUES[i]) !== -1) {
        return false
      }
    }
  }

  let attrNameBlacklist = BLACKLISTED_TAG_SPECIFIC_ATTRS[tagName]
  if (attrNameBlacklist && attrNameBlacklist.indexOf(attrName) !== -1) {
    return false
  }

  let attrBlacklist = BLACKLISTED_TAG_SPECIFIC_ATTR_VALUES[tagName]
  if (attrBlacklist) {
    let blacklistedValuesRegex = attrBlacklist[attrName]
    if (blacklistedValuesRegex &&
      attrValue.search(blacklistedValuesRegex) !== -1) {
      return false
    }
  }

  return true
}

export default function sanitize (html) {
  let tagPolicy = htmlSanitizer.makeTagPolicy()
  let ignore = 0
  let output = []

  function emit (content) {
    if (ignore === 0) {
      output.push(content)
    }
  }
  let parser = htmlSanitizer.makeSaxParser({
    startTag: function (tagName, attribs) {
      // 单标签忽略
      if (ignore > 0) {
        if (!SELF_CLOSING_TAGS[tagName]) {
          ignore++
        }
        return
      }
      // 黑名单忽略
      if (BLACKLISTED_TAGS[tagName]) {
        ignore++
      // MIP元素
      } else if (tagName.indexOf('mip-') !== 0) {
        let savedAttribs = attribs.slice(0)
        let scrubbed = tagPolicy(tagName, attribs)
        if (!scrubbed) {
          ignore++
        }
        attribs = scrubbed.attribs
        for (let i = 0; i < attribs.length; i += 2) {
          if (WHITELISTED_ATTRS.indexOf(attribs[i]) !== -1) {
            attribs[i + 1] = savedAttribs[i + 1]
          } else if (attribs[i].search(WHITELISTED_ATTR_PREFIX_REGEX) === 0) {
            attribs[i + 1] = savedAttribs[i + 1]
          }
        }
      }

      if (ignore > 0) {
        if (SELF_CLOSING_TAGS[tagName]) {
          ignore--
        }
        return
      }
      emit('<')
      emit(tagName)
      for (let i = 0; i < attribs.length; i += 2) {
        let attrName = attribs[i]
        let attrValue = attribs[i + 1]
        if (!isValidAttr(tagName, attrName, attrValue)) {
          continue
        }
        emit(' ')
        emit(attrName)
        emit('="')
        if (attrValue) {
          emit(htmlSanitizer.escapeAttrib(attrValue))
        }
        emit('"')
      }
      emit('>')
    },
    endTag: function (tagName) {
      if (ignore > 0) {
        ignore--
        return
      }
      emit('</')
      emit(tagName)
      emit('>')
    },
    pcdata: emit,
    rcdata: emit,
    cdata: emit
  })
  parser(html)
  return output.join('')
}
