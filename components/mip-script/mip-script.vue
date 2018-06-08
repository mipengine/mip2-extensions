<script>
import generate from 'mip-sandbox/lib/generate-lite'
import detect from 'mip-sandbox/lib/unsafe-detect'
/* global mipDataPromises */
/* global Promise */

export default {
  created () {
    let script
    let code

    try {
      script = this.$slots.default[0].data.domProps.innerHTML
    } catch (e) {
      script = ''
    }

    if (/MIP.watch/.test(script)) {
      Promise.all(mipDataPromises)
        .then(() => {
          mipDataPromises = [] // eslint-disable-line no-global-assign
          this.detect(script)
          code = generate(script)
          this.execute(code)
        })
        .catch(err => {
          console.error('Fail to execute: ', err)
        })
    } else {
      this.detect(script)
      code = generate(script)
      this.execute(code)
    }
  },

  methods: {
    detect (script) {
      let result = detect(script)

      if (result && result.length) {
        let list = result.reduce((total, current) => {
          total.push(`${current.name}: start[${JSON.stringify(current.loc.start)}] end[${JSON.stringify(current.loc.end)}]`)
          return total
        }, [])
        console.error(`WARNING: Forbidden global variable[s] included in <mip-script>! Variable[s] Listed as below\n\n${list.join('\n')}`)
      }
    },

    execute (code) {
      eval(code) // eslint-disable-line no-eval
    }
  }
}
</script>
