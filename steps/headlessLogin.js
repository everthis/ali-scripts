require('dotenv').config()
const puppeteer = require('puppeteer')
const devices = require('puppeteer/DeviceDescriptors')
const iPhoneX = devices['iPhone X']
const { ALI_LOGIN_URL, MY_ALIPAY_URL } = require('../util/constant')
const cookiesArrToStr = require('../util/cookiesArrToStr')
const ALI_USERNAME = process.env.ALI_USERNAME
const ALI_PASSWORD = process.env.ALI_PASSWORD

/**
 * use puppeteer to get wanted cookies
 */
async function headlessLogin(...cbFnArr) {
  const browser = await puppeteer.launch({
    headless: false,
    devtools: true,
    args: ['--enable-sandbox', '--disable-setuid-sandbox']
  })
  const page = await browser.newPage()
  //   await page.emulate(iPhoneX)
  await page.goto(ALI_LOGIN_URL)

  await sc(page, 'pre')

  await page.waitForSelector('#J-authcenter')
  await page.click('#J-loginMethod-tabs [data-status="show_login"]')

  await tryLogin(page)

  await page.waitFor(1366 + Math.random() * 150)

  await Promise.race([myHome(page), anotherTry(page)])

  const cookies = await page.cookies()

  await browser.close()
  return [cookiesArrToStr(cookies), cookies]
}

function anotherTry(page) {
  return page.waitForSelector('#J-errorBox .sl-error-text').then(async d => {
    console.log('failed')
    await tryLogin(page).then(async d => {
      await myHome(page)
    })
  })
}

async function myHome(page) {
  await page.waitForSelector('#globalContainer')
  await page.waitFor(253 + Math.random() * 120)
  await page.waitForSelector('#J-assets-balance')
  await sc(page, 'home')
  console.log('success')
}

async function tryLogin(page) {
  await page.waitFor(786 + Math.random() * 150)
  await page.waitForSelector('#J-input-user')
  await page.evaluate(
    () => (document.getElementById('J-input-user').value = '')
  )

  const input = await page.$('#J-input-user')

  await input.click({ clickCount: 3 })

  await page.type('#J-input-user', ALI_USERNAME, { delay: Math.random() * 120 })
  await page.waitFor(786 + Math.random() * 100)
  await page.waitForSelector('#password_rsainput')
  await page.click('#password_rsainput')
  await page.type('#password_rsainput', ALI_PASSWORD, {
    delay: Math.random() * 120
  })
  await page.waitForSelector('#J-login-btn')
  await sc(page, 'post')
  await page.waitFor(1235 + Math.random() * 200)
  await page.click('#J-login-btn')
}

async function sc(page, name) {
  await page.screenshot({
    path: `${name}.jpeg`,
    type: 'jpeg'
  })
}

module.exports = headlessLogin
