const https = require('https');
const scrapeIt = require('scrape-it');

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

//stats.init();

const versions = {
  sites: [
    {
      from: 'chrome',
      data () {
        return new Promise((resolve, reject) => {
          https.get('https://raw.githubusercontent.com/chromium/chromium/master/chrome/VERSION', function(res) {
            let data = '';
            res.on('data', chunk => {
              data += chunk;
            });
            res.on('end', () => {
              const version = data.split('\n')
                .filter(item => item !== undefined && item !== '')
                .map(line => line.split('=')[1])
                .join('.')
              resolve(version);
            });
          }).on('error', () => {
            reject('Ocurrió un error obteniendo la versión de Chrome');
          });
        })
      }
    },

    {
      from: 'mozilla',
      data () {
        return new Promise((resolve, reject) => {
          scrapeIt('https://www.mozilla.org/en-US/firefox/system-requirements/', {
            version: '.c-version-title'
          })
          .then(({data}) => {
            resolve(data.version.split(' ')[2]);
          }).catch(err => reject(err))
        })
      }
    },

    {
      from: 'iexplorer',
      data () {
        return new Promise((resolve, reject) => {
          scrapeIt('https://www.microsoft.com/es-es/download/details.aspx?id=41628', {
            version: '.fileinfo .header:not(.date-published) + p'
          })
          .then(({data}) => resolve(data.version))
          .catch(err => reject(err))
        })
      }
    },

    {
      from: 'edge',
      data () {
        return new Promise((resolve, reject) => {
          scrapeIt('https://docs.microsoft.com/en-us/deployedge/microsoft-edge-relnote-stable-channel', {
            version: '#center-doc-outline'
          })
          .then(({data}) => {
            resolve(data.version)
          })
          .catch(err => reject(err))
        })
      }
    },

    {
      from: 'edge2',
      data () {
        return new Promise((resolve, reject) => {
          https.get('https://docs.microsoft.com/en-us/deployedge/microsoft-edge-relnote-stable-channel', function(res) {
            let data = '';
            res.on('data', chunk => {
              data += chunk;
            });
            res.on('end', () => {
              //console.log(data);
              resolve(data);
            });
          }).on('error', () => {
            reject('Ocurrió un error obteniendo la versión de Chrome');
          });
        })
      }
    },

  ]
}

versions.sites[3].data().then(ver => console.log(ver));

//.then(({data}) => resolve(data.version))
