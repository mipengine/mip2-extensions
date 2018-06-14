<template>
  <div><slot /></div>
</template>

<script>
import mark from 'mip-sandbox/lib/global-mark'
import generate from 'mip-sandbox/lib/generate-lite'
import detect from 'mip-sandbox/lib/unsafe-detect'
import keywords from 'mip-sandbox/lib/keywords'
/* global mipDataPromises */
/* global Promise */

const MAX_SIZE = 2048

export default {
  created () {
    let script

    try {
      script = this.$slots.default[0].text
    } catch (e) {
      script = ''
    }

    if (this.getSize(script) > MAX_SIZE) {
      console.error(`WARNING: <mip-script> is out of range.Please keep it under 2KB`)
      return
    }

    let ast = mark(script)
    let unsafeList = detect(ast, keywords.WHITELIST_STRICT)
    let generated = generate(ast, keywords.WHITELIST_STRICT_RESERVED, {prefix: 'MIP.sandbox.strict'})
    this.detect(unsafeList)

    if (/MIP.watch/.test(script)) {
      Promise.all(mipDataPromises)
        .then(() => {
          mipDataPromises = [] // eslint-disable-line no-global-assign
          this.execute(generated)
        })
        .catch(err => {
          console.error('Fail to execute: ', err)
        })
    } else {
      this.execute(generated)
    }
  },

  methods: {
    getSize (script) {
      return script.replace(/[^\x00-\xff]/g, 'aa').length // eslint-disable-line no-control-regex
    },

    detect (unsafeList) {
      if (unsafeList && unsafeList.length) {
        let list = unsafeList.reduce((total, current) => {
          total.push(`${current.name}: start[${JSON.stringify(current.loc.start)}] end[${JSON.stringify(current.loc.end)}]`)
          return total
        }, [])
        console.error(`WARNING: Forbidden global variable[s] included in <mip-script>! Variable[s] Listed as below\n\n${list.join('\n')}`)
      }
    },

    execute (code) {
      let scriptEle = document.createElement('script')
      scriptEle.innerHTML = code
      document.body.appendChild(scriptEle)
      this.$element.remove()
    }
  },

  prerenderAllowed () {
    return true
  }
}
</script>
