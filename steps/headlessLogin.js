require('dotenv').config()
const puppeteer = require('puppeteer')
const devices = require('puppeteer/DeviceDescriptors')
const iPhoneX = devices['iPhone X']
const { ALI_LOGIN_URL } = require('../util/constant')
const cookiesArrToStr = require('../util/cookiesArrToStr')
const ALI_USERNAME = process.env.ALI_USERNAME
const ALI_PASSWORD = process.env.ALI_PASSWORD

/**
 * use puppeteer to get wanted cookies
 */
async function headlessLogin(...cbFnArr) {
  const browser = await puppeteer.launch()
  const page = await browser.newPage()
//   await page.emulate(iPhoneX)
  await page.goto(ALI_LOGIN_URL)

  await page.evaluate(
    (u, p) => {
      document.querySelector('#J-input-user').value = u
      document.querySelector('#password_rsainput').value = p
      document.querySelector('#J-login-btn').click()
    },
    ALI_USERNAME,
    ALI_PASSWORD
  )
  await page.waitForNavigation()
//   await page.goto(MY_TB_PAGE_URL, {
//     waitUntil: 'networkidle0'
//   })
  const cookies = await page.cookies()

  // execute callback functions if they are passed in.
  // do this procedure before browser.close()
  if (cbFnArr.length) {
    for (let fn of cbFnArr) {
      await fn({ browser, page })
    }
  }
  await browser.close()
  return [cookiesArrToStr(cookies), cookies]
}

module.exports = headlessLogin