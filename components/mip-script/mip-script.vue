<template>
  <div><slot /></div>
</template>

<script>
import mark from 'mip-sandbox/lib/global-mark'
import generate from 'mip-sandbox/lib/generate-lite'
import detect from 'mip-sandbox/lib/unsafe-detect'
/* global mipDataPromises */
/* global Promise */

const MAX_SIZE = 2048

function getSize (script) {
  return script.replace(/[^\x00-\xff]/g, 'aa').length // eslint-disable-line no-control-regex
}

function detectUnsafe (ast) {
  let unsafeList = detect(ast, MIP.sandbox.WHITELIST_STRICT)

  if (unsafeList.length) {
    let tips = unsafeList.map(identify => {
      return `${identify.name}: start[${JSON.stringify(identify.loc.start)}] end[${JSON.stringify(identify.loc.end)}]`
    }).join('\n')

    console.error(`WARNING: Forbidden global variable[s] included in <mip-script>! Variable[s] Listed as below\n\n${tips}`)
  }
}

function execute (ast, element) {
  let generated = generate(ast, MIP.sandbox.WHITELIST_STRICT_RESERVED, {prefix: 'MIP.sandbox.strict'})
  let scriptEle = document.createElement('script')
  scriptEle.innerHTML = generated
  scriptEle.setAttribute('class', 'mip-script')
  document.body.appendChild(scriptEle)
  element.remove()
}

export default {
  created () {
    let script

    try {
      script = this.$slots.default[0].text
    } catch (e) {
      return
    }

    if (getSize(script) > MAX_SIZE) {
      console.error(`WARNING: <mip-script> is out of range.Please keep it under 2KB`)
      return
    }

    let ast
    try {
      ast = mark(script)
    } catch (e) {
      console.error('Fail to generate AST of script: ', e)
      return
    }
    detectUnsafe(ast)

    if (/MIP.watch/.test(script) && mipDataPromises && mipDataPromises.length) {
      Promise.all(mipDataPromises)
        .finally(() => {
          execute(ast, this.$element)
        })
    } else {
      execute(ast, this.$element)
    }
  },

  prerenderAllowed () {
    return true
  }
}
</script>
