const crawler = require('puppeteer')

async function start (pageLimit, auth, search = '') {
  let links = []
  let actualPage = 0

  async function login (auth) {
    await page.goto('https://conta.olx.com.br/acesso/')

    await Promise.all([
      page.waitForSelector('input[type=email]'),
      page.waitForSelector('input[type=password]'),
      page.waitForSelector('button')
    ])

    await page.type('input[type=email]', auth.email)
    await page.type('input[type=password]', auth.password)
    await page.click('button')
    await page.click('button[type=text]')
  }

  async function paginateData (page) {
    if (actualPage >= pageLimit)
      return

    actualPage++
    await page.goto(`https://www.olx.com.br/brasil?q=${search}&o=${actualPage}`)
    await page.waitForSelector('ul[id=ad-list]')

    const data = await getData(page, 'ul[id=ad-list] li a')
    links = links.concat(data)

    await paginateData(page)
  }

  async function getData (page, selector) {
    const data = await page.$$eval(selector, elem => elem.map(elem => elem.getAttribute('href')))

    return data
  }

  async function accessPage (page, links) {
    for (let link of links) {
      console.log(link);
      await page.goto(link)
      await page.waitForSelector('div#miniprofile')

      const data = await page.$eval('div#miniprofile', elem => elem.textContent)
      console.log(data)
    }
  }

  const browser = await crawler.launch({ headless: true })
  const page = await browser.newPage()

  await login(auth)
  await paginateData(page)
  await accessPage(page, links)
}

start(1, { email: '', password: '' })