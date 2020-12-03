const Apify = require('apify')
const { Async } = require('crocks')

const url = 'https://www.queencreek.org'
const openRequestQueue = Async.fromPromise(Apify.openRequestQueue.bind(Apify))
const addRequest = (...args) => q => Async.fromPromise(q.addRequest.bind(q))(...args)
const pseudoUrls = [new Apify.PseudoUrl(`${url}/[.*]`)]
const runCrawler = c => Async.fromPromise(c.run.bind(c))()

Apify.main(async () => {
  await openRequestQueue()
    .chain(q => addRequest({ url: 'https://www.queencreek.org' })(q).map(() => q))
    .map(q => new Apify.PuppeteerCrawler({
      requestQueue: q,
      maxRequestsPerCrawl: 10,
      maxConcurrency: 10,
      handlePageFunction: async ({ request, page }) => {
        console.log(`Title of ${request.url}: ${title}`)
        await Apify.utils.enqueueLinks({
          page,
          selector: 'a',
          pseudoUrls,
          requestQueue: q
        })
      }
    }))
    .chain(runCrawler)
    .toPromise()

  // .fork(
  //   e => console.log(e),
  //   r => console.log('done')
  // )

})