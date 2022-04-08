const express = require('express')
const puppeteer = require('puppeteer-core')
const { scrollPageToBottom } = require('puppeteer-autoscroll-down')

const server = express()

server.listen(3000, () => {
    console.log('SUBIU A PIPA')
})

async function getMlb(){
  try {
    const options = {
      args: [
              '--no-sandbox',
              '--disable-setuid-sandbox',
              '--disable-infobars',
              '--window-position=0,0',
              '--ignore-certifcate-errors',
              '--ignore-certifcate-errors-spki-list',
              '--user-agent="Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36"'
            ],
      executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
      headless: false
    }
    const browser = await puppeteer.launch(options)
    const page = await browser.newPage()
    // await page.setViewport({
    //   width: 1800,
    //   height: 800
    // });

    const url = `https://www.mercadolivre.com.br/ofertas#nav-header`
    await page.goto(url);

    await page.waitForSelector('#root-app > div > section:nth-child(2) > div > div.promotions_boxed-width > div')

    await page.waitForTimeout(1000);

    const lastPosition = await scrollPageToBottom(page, {
      size: 500,
      delay: 250
    })

    const pageData = await page.evaluate(() => {
      const nodeList = document.querySelectorAll('#root-app > div > section:nth-child(2) > div > div.promotions_boxed-width > div > ol > li');


      const cards = []
      Array.from(nodeList).forEach((card) => {
        const obj = {
          href: String(card.querySelector('a')['href']),
          origin: 'MLB',
          name: card.querySelector('a > div > div > p').textContent,
          price: card.querySelector('a > div > div > div > span > span').textContent,
          img: String(card.querySelector('a > div > img')['src'])
        }
        //obj.price = obj.price.replace(/[^\d]/g, '').trim()
        cards.push(obj)
      })

      return cards;
    })

    await page.close();
    await browser.close();

    return pageData;
  } catch (error) {
    console.log("falha getMlb chome" + error)
  }
}

function GetHtmlCard(cards) {
  const html = cards.map(function(card, i){
    // eslint-disable-next-line react/jsx-key
    return `<li><img src=${card.img}></img><h1>${card.name}</h1><h3>${card.price}</h3></li>`
  })

  return html
}

server.get('/', async (req, res) => {
  const mlb = await getMlb()

  res.send(GetHtmlCard(mlb).join(''))
})
