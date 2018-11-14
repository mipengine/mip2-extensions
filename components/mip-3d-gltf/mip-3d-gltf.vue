<template>
  <div>
  </div>
</template>

<style scoped>
</style>

<script>
export default {
  props: {
    width:  {
      type: Number,
      default: window.innerWidth
    },
    height: {
      type: Number,
      default: window.innerHeight
    },
    src: {
      type: String,
      required: true
    },
    alpha: {
      type: Boolean,
      default: false
    },
    antialiasing: {
      type: Boolean,
      default: false
    },
    clearColor: {
      type: String,
      default: '#FFFFFF'
    },
    maxPixelRatio: {
      type: Number,
      default: window.devicePixelRatio
    },
    autoRotate: {
      type: Boolean,
      default: false
    },
    enableZoom: {
      type: Boolean,
      default: true
    }
  },

  data () {
    return {
      option: this.getOption(),
      controls: {},
      camera: {},
      scene: {},
      renderer: {},
      light: {}
    }
  },

  prerenderAllowed () {
    return true
  },

  isLoadingEnabled () {
    return true
  },

  beforeMount () {
    return import('./three.min')
      .then(() => Promise.all([
        import('./GLTFLoader'),
        import('./OrbitControls')
      ]))
      .then(() => {
        if ( this.isWebGLAvailable() === false ) {
          this.$element.firstElementChild.appendChild( this.getWebGLErrorMessage(1) )
          // this.toggleFallback(true)
          return Promise.resolve()
        }
        this.init()
        this.animate()
        return Promise.resolve()
      })
      .catch(err => console.error('import err:', err))
  },

  methods: {
    isWebGLAvailable () {
      try {
        var canvas = document.createElement( 'canvas' )
        return !! ( window.WebGLRenderingContext && ( canvas.getContext( 'webgl' ) || canvas.getContext( 'experimental-webgl' ) ) )
      } catch ( e ) {
        return false
      }
    },
    
    getErrorMessage (version) {
      var names = {
        1: 'WebGL',
        2: 'WebGL 2'
      }
      var contexts = {
        1: window.WebGLRenderingContext,
        2: window.WebGL2RenderingContext
      }
      var message = 'Your $0 does not seem to support <a href="http://khronos.org/webgl/wiki/Getting_a_WebGL_Implementation" style="color:#000">$1</a>'
      var element = document.createElement( 'div' )
      element.id = 'webglmessage'
      element.style.fontFamily = 'monospace'
      element.style.fontSize = '13px'
      element.style.fontWeight = 'normal'
      element.style.textAlign = 'center'
      element.style.background = '#fff'
      element.style.color = '#000'
      element.style.padding = '1.5em'
      element.style.width = '400px'
      element.style.margin = '5em auto 0'

      if ( contexts[ version ] ) {
        message = message.replace( '$0', 'graphics card' )
      } else {
        message = message.replace( '$0', 'browser' )
      }
      message = message.replace( '$1', names[ version ] )
      element.innerHTML = message
      return element
    },

    init () {
      this.setupScene()
      this.setupRenderer()
      this.setupCamera()
      this.setupControls()
      this.setupLight()
      this.loadModel()
    },

    setupScene () {
      let scene = new THREE.Scene()

      this.scene = scene
    },

    setupRenderer () {
      let renderer = new THREE.WebGLRenderer(this.option['renderer'])
      this.$element.firstElementChild.appendChild(renderer.domElement)

      renderer.setPixelRatio(Math.min(this.option['rendererSettings']['maxPixelRatio'], window.devicePixelRatio))
      renderer.setClearColor(this.option['rendererSettings']['clearColor'], this.option['rendererSettings']['clearAlpha'])
      renderer.gammaOutput = true
      renderer.gammaFactor = 2.2
      renderer.setSize(this.width, this.height)

      this.renderer = renderer
    },

    setupCamera () {
      let camera = new THREE.PerspectiveCamera(45, this.width/this.height, 0.25, 20)
      camera.position.set(-1.8, 0.9, 5)

      this.camera = camera
    },

    setupControls () {
      let controls = new THREE.OrbitControls(this.camera, this.renderer.domElement)
      controls.target.set( 0, - 0.2, - 0.2 )
      Object.assign(controls, this.option['controls'])

      this.controls = controls
    },

    setupLight () {
      const amb = new THREE.AmbientLight(0xEDECD5, .5)

      const dir1 = new THREE.DirectionalLight(0xFFFFFF, .5)
      dir1.position.set(0, 5, 3)

      const dir2 = new THREE.DirectionalLight(0xAECDD6, .4)
      dir2.position.set(-1, -2, 4)

      const light = new THREE.Group()
      light.add(amb, dir1, dir2)
      this.scene.add(light)
    },

    loadModel () {
      let self = this
      let loader = new THREE.GLTFLoader()
      loader.load(this.option['src'], function ( gltf ) {
        self.scene.add( gltf.scene )
      }, undefined, function ( e ) {
        console.error( e )
      } )
    },

    animate () {
      requestAnimationFrame( this.animate )
      this.controls.update()
      this.renderer.render( this.scene, this.camera )
    },

    getOption () {
      return {
        'src': this.src,
        'renderer': {
          'alpha': this.alpha,
          'antialias': this.antialiasing
        },
        'rendererSettings': {
          'clearColor': this.clearColor,
          'clearAlpha': this.alpha,
          'maxPixelRatio': this.maxPixelRatio
        },
        'controls': {
          'enableZoom': this.enableZoom,
          'autoRotate': this.autoRotate
        }
      }
    }
  }
}
</script>
