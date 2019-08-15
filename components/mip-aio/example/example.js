const servicePromise = MIP.Services.getServicePromise('mip-aio')

servicePromise.then(service => {
  // getBox(version)
  service.getBox('201602').then(Box => {
    console.log(Box.version)
    console.log(Box.share)
  })
})
