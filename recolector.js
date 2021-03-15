const scrapeIt = require("scrape-it");

const stats = {
  init () {
    this.forSites()
      .then(arrData => {
        const browsers = arrData.map(item => item.data.browsers)
        console.log(this.averaging(browsers));
      })
      .catch(err => {
        console.log('Error iterando los sitios');
      })
  },

  forSites () {
    return new Promise((resolve, reject) => {
      const dataObjs = this.sites.map(obj => obj.data());
      Promise.all(dataObjs)
        .then(arr => resolve(arr))
        .catch(() => reject())
    })
  },

  sites: [
    {
      from: 'statcounter',
      data: () => scrapeIt('https://gs.statcounter.com/', {
        browsers: {
          listItem: '.stats-snapshot tbody tr',
          data: {
            name: 'th',
            percentage: '.count'
          }
        }
      })
    },

    {
      from: 'w3counter',
      data: () => scrapeIt('https://www.w3counter.com/globalstats.php', {
        browsers: {
          listItem: '.bargraphs .bar',
          data: {
            name: '.lab',
            percentage: '.value'
          }
        }
      })
    },

    {
      from: 'stetic',
      data () {
        return new Promise((resolve, reject) => {
          scrapeIt('https://www.stetic.com/market-share/browser/', {
            browsers: {
              listItem: '.container .table-striped tbody tr',
              data: {
                name: 'td:nth-child(2)',
                percentage: 'td:nth-child(3)'
              }
            },
          })
          .then(({data}) => {
            const arr = [].concat(data.browsers);
            const getOpera = arr.splice(4).find(browser => browser.name.includes('Opera'));
            if (getOpera) arr.push(getOpera);
            resolve({
              data: {
                browsers: arr
              }
            })
          }).catch(err => reject(err))
        })
      }
    }
  ],

  averaging (arr) {
    const divisorNum = arr.length;
    const browsers = { chrome: 0, firefox: 0, safari: 0, edge: 0, opera: 0 };
    Object.keys(browsers).forEach(browser => {
      arr.forEach(dataList => {
        const browserCatch = dataList.filter(browserData => browserData.name.toLowerCase().includes(browser));
        if (browserCatch.length) browsers[browser] += Number(browserCatch[0].percentage.replace('%', ''))
      })
    });
    for (const item in browsers) browsers[item] = Math.round((browsers[item] / divisorNum) * 100) / 100;
    return browsers;
  }

};

stats.init();

