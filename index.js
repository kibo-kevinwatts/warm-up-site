require('dotenv').config()
const { CategoriesApi, ProductsApi } = require('@kibocommerce/rest-sdk/clients/CatalogStorefront')
const { Configuration } = require('@kibocommerce/rest-sdk')
const { getConfigFromEnv } = require('@kibocommerce/rest-sdk/utilities/index')
const HCCrawler = require('headless-chrome-crawler');
const BASE_URL = process.env.HEADLESS_STOREFRONT_URL
const MAX_CONCURRENCY = process.env.MAX_CONCURRENCY ? parseInt(process.env.MAX_CONCURRENCY) : 2
const envConfig = getConfigFromEnv()
const config = new Configuration(envConfig)
const urlsToCrawl = new Set()

function getCategoryCodes(json) {
  let categoryCodes = new Set();
  function dfs(node) {
    if (node.categoryCode) {
      categoryCodes.add(node.categoryCode);
    }
    if (node.childrenCategories && Array.isArray(node.childrenCategories)) {
      node.childrenCategories.forEach(child => {
        dfs(child);
      });
    }
  }
  for (const category of json) {
    dfs(category);
  }
  return Array.from(categoryCodes)
}

async function getCategories() {
  const api = new CategoriesApi(config)
  const tree = await api.storefrontGetCategoryTree({ includeAttributes: false })
  const codes = getCategoryCodes(tree.items)
  for (const code of codes) {
    urlsToCrawl.add(`${BASE_URL}/category/${code}`)
  }
}
async function getProducts() {
  const api = new ProductsApi(config)
  const products = await api.storefrontGetProducts({ pageSize: 300, startIndex: 0 })
  const codes = products.items.map(product => product.productCode)
  for (const code of codes) {
    urlsToCrawl.add(`${BASE_URL}/product/${code}`)
  }
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
async function main() {
  await getCategories()
  await getProducts()
  console.log(urlsToCrawl)
  const crawler = await HCCrawler.launch({
        maxConcurrency: MAX_CONCURRENCY,
        headless: true,
        obeyRobotsTxt: false,
        waitUntil: 'networkidle2',
        onSuccess: (result => {
          console.log(`done page ${result?.response?.url}`);
        }),
        onError:(result => {
          console.error(`error page ${result?.response?.url} status: ${result?.response?.status}`,);
        }),
      });
  await sleep(1000)
  await crawler.queue(Array.from(urlsToCrawl));
  await crawler.onIdle();
  await crawler.close(); 
}
main()