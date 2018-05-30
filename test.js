async function haha () {
  await sleep(3000)
  return '3'
}

function sleep (time) {
  return new Promise(resolve => setTimeout(resolve, time))
}

function hehe () {
  setTimeout(async () => {
    await sleep(200)
    console.log('3')
  })
}

module.exports = { haha, hehe }
