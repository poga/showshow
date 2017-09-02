const finalHandler = require('finalhandler')
const http = require('http')
const serveStatic = require('serve-static')
const puppeteer = require('puppeteer')
const devices = require('puppeteer/DeviceDescriptors')
const op = require('openport')

let findPort = () => new Promise((resolve, reject) => {
  op.find(function (err, port) {
    if (err) return reject(err)

    resolve(port)
  })
})

function serve (port, path) {
  return new Promise((resolve, reject) => {
    var serve = serveStatic(path)

    var server = http.createServer(function (req, res) {
      serve(req, res, finalHandler(req, res))
    })

    server.listen(port, function (err) {
      if (err) return reject(err)

      resolve(server)
    })
  })
}

async function screenshot (url, path) {
  const b = await puppeteer.launch()
  const page = await b.newPage()
  await page.emulate(devices['iPhone 6'])
  await page.goto(url)
  await page.screenshot({path})

  b.close()
}

(async() => {
  var port = await findPort()
  await serve(port, process.argv[2])
  await screenshot(`http://localhost:${port}`, process.argv[3])
  process.exit()
})()
