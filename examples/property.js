const R = require('ramda');
const { apply } = require('../src/low-level/apply');
const { get } = require('../src/io/fetcher');
const { injectJquery, injectScript, injectUrlScript, injectRamda } = require('../src/inject/inject');
const { scrape } = require('../src/scrape/scrape');
const { makeDriver } = require('../src/selenium/selenium');

const Driver = makeDriver('chrome');

const url = `https://franksalt.com.mt/advanced-search/?status=forSale&bedrooms=&priceFrom=&priceTo=&referenceNum=`;

apply(
    Driver.build(),
    Promise.resolve(2),
    scrape(
        url,
        [],
        function(v, cb){
            const links = $(`section[role="main"] > div[class="properties-container properties-container- clearfix"] > div[class="row"] > div[class="col-xs-12 col-md-6 property-grid-item"] > a`)
                .map(function(){
                    return $(this).attr("href")
                }).get();
            cb(links);
        }
    ),
    driver => promise => promise
)
    .then(v => console.log(v), err => console.log(err));