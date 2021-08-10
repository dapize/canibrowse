const https = require('https');
const scrapeIt = require('scrape-it');
const fetch = require('node-fetch');
const xml2js = require('xml2js');
const parser = new xml2js.Parser({ attrkey: "ATTR" });
const fs = require('fs');
const gulpFile = require('./gulpfile.js');


const resultsFile = './results.json';

const stats = {

  async init () {
    const numbers = [this.getStats, this.getVersions].map(item => item.call(this));
    Promise.all( numbers )
      .then( data => {
        const results = this.processor( data );

        // all correct?
        const allCorrect = this.allCorrect( results );
        if ( !allCorrect ) return console.log(' is not correct, something is not working good');

        // any update?
        const _this = this;
        (async function () {
          const updated = await _this.someUpdate( results );
          if ( !updated ) return console.log('all good, nothing to update');

          // I need to create the page again
          _this.jsonCreator( results );
          // const builder = await gulpFile.default();
          console.log('JSON creado');

        }());

      })
      .catch( err => {
        console.log('Error!!!!', err);
      })
  },

  getStats () {
    return new Promise((resolve, reject) => {
      const statsObj = this.statsSites.map(obj => obj.data());

      Promise.all(statsObj)
        .then(arr => {
          const browsers = arr.map(item => item.data.browsers);
          const average = this.averaging(browsers);
          resolve(average)
        })
        .catch(() => reject())
    })
  },

  getVersions () {
    return new Promise((resolve, reject) => {
      const versionsSites = this.browsersSites.map(obj => obj.data());

      Promise.all(versionsSites)
        .then(arr => {
          const versions = {};
          arr.map(item => versions[item.name] = item.version)
          resolve(versions)
        })
        .catch(() => reject())
    })
  },

  processor ( data ) {
    const results = {};
    this.objBuilder(data[0], 'percentage', results);
    this.objBuilder(data[1], 'version', results);
    return results;
  },

  allCorrect ( results ) {
    const browserNums = this.oneNumberList(results).filter( num => !isNaN( num ) );
    return browserNums.length === Object.keys( results ).length;
  },

  oneNumberList ( results ) {
    return Object.keys( results ).map( browser => {
      const percentage = results[ browser ].percentage.replace('%', '')
      const version = results[ browser ].version.split('.').join('')
      return Number( percentage ) + Number( version );
    })
  },

  someUpdate ( results ) {
    return new Promise( ( resolve, reject ) => {
      fs.readFile( resultsFile, ( err, data ) => {
        if ( err ) return reject( err );

        const arrNumsSaved = this.oneNumberList( JSON.parse( data ) );
        const arrNumsCurrent = this.oneNumberList( results );

        // cheking if are equal
        const numSaved = arrNumsSaved.reduce((acc, curr) => acc + curr);
        const numGetted = arrNumsCurrent.reduce((acc, curr) => acc + curr);

        resolve(numSaved !== numGetted);
      })
    })
  },

  jsonCreator ( results ) {
    fs.writeFile( resultsFile, JSON.stringify(results, null, 2), err => {
      if (err) return console.log(err);
    });
  },

  objBuilder ( obj, name, results ) {
    for (prop in obj) {
      if (!results[prop]) results[prop] = {};
      results[prop][name] = obj[prop]
    }
    return results;
  },

  statsSites: [
    {
      from: 'statcounter',
      data: () => {
        return new Promise( ( resolve, reject ) => {
          scrapeIt('https://gs.statcounter.com/', {
            browsers: {
              listItem: '.stats-snapshot tbody tr',
              data: {
                name: 'th',
                percentage: '.count'
              }
            }
          })
            .then( result => {

              fetch('https://gs.statcounter.com/chart.php?device=Desktop%20%26%20Mobile%20%26%20Tablet%20%26%20Console&device_hidden=desktop%2Bmobile%2Btablet%2Bconsole&multi-device=true&statType_hidden=browser&region_hidden=ww&granularity=monthly&statType=Browser&region=Worldwide&fromInt=202004&toInt=202104&fromMonthYear=2020-04&toMonthYear=2021-04&hideCaption=true&bottomLegend=true&siteStyling=true&siteChartMargins=true&forceJson=true&setChartTitle=Browser%20Market%20Share%20Worldwide')
                .then(res => res.json())
                .then( json => {

                  parser.parseString(json.xml, (error, resultParsed) => {
                    if (error) reject(error);
                    const sets = resultParsed.chart.dataset.filter(item => item['ATTR'].seriesName === 'IE');
                    const firstSet = sets[0].set;
                    const percentage = firstSet[firstSet.length - 1]['ATTR'].value;

                    result.data.browsers = result.data.browsers.filter(item => item.name !== 'Samsung Internet');

                    result.data.browsers.push({
                      name: 'ie',
                      percentage: percentage
                    })

                    resolve(result);
                  });

                })
                .catch(err => {
                  reject(err)
                });

              // resolve(result);
              //resolve( result.data.browsers );
            })
            .catch(err => reject(err));
        })
      }


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
          })
          .catch(err => reject(err))
        })
      }
    }

  ],

  browsersSites: [
    {
      from: 'chrome',
      data () {
        return new Promise((resolve, reject) => {
          https.get('https://raw.githubusercontent.com/chromium/chromium/master/chrome/VERSION', res => {
            let data = '';
            res.on('data', chunk => {
              data += chunk;
            });
            res.on('end', () => {
              const version = data.split('\n')
                .filter(item => item !== undefined && item !== '')
                .map(line => line.split('=')[1])
                .join('.')
              resolve({
                name: this.from,
                version: version
              });
            });
          }).on('error', () => {
            reject('Ocurrió un error obteniendo la versión de Chrome');
          });
        })
      }
    },

    {
      from: 'firefox',
      data () {
        return new Promise((resolve, reject) => {
          scrapeIt('https://www.mozilla.org/en-US/firefox/system-requirements/', {
            version: '.c-version-title'
          })
          .then(({data}) => {
            resolve({
              name: this.from,
              version: data.version.split(' ')[2]
            });
          }).catch(err => reject(err))
        })
      }
    },

    {
      from: 'ie',
      data () {
        return new Promise((resolve, reject) => {
          scrapeIt('https://www.microsoft.com/es-es/download/details.aspx?id=41628', {
            version: '.fileinfo .header:not(.date-published) + p'
          })
          .then(({ data }) => resolve({
            name: this.from,
            version: data.version
          }))
          .catch(err => reject(err))
        })
      }
    },

    {
      from: 'edge',
      data () {
        return new Promise((resolve, reject) => {
          https.get('https://docs.microsoft.com/en-us/deployedge/microsoft-edge-relnote-stable-channel', res => {
            let data = '';
            res.on('data', chunk => {
              data += chunk;
            });
            res.on('end', () => {
              const title = scrapeIt.scrapeHTML(data, {
                version: '#main h2:eq(0)'
              });
              const version = title.version.split(' ')[1].replace(':', '');
              resolve({
                name: this.from,
                version: version
              });
            });
          }).on('error', () => {
            reject('Ocurrió un error obteniendo la versión de Chrome');
          });
        })
      }
    },

    {
      from: 'opera',
      data () {
        return new Promise((resolve, reject) => {
          https.get('https://ftp.opera.com/ftp/pub/opera/desktop/', res => {
            let data = '';
            res.on('data', chunk => {
              data += chunk;
            });
            res.on('end', () => {
              const versions = data.split('\n')
                .filter(item => item !== undefined && item !== '' && item.substring(0, 2) === '<a')
                .map( line => {
                  const title = scrapeIt.scrapeHTML(line, {
                    version: 'a'
                  });
                  return title.version.replace('/', '');
                });
              const objVersion = {};
              const lastestVersions = versions
                .slice(versions.length - 5)
                .map(version => {
                  const vNumber = Number(version.split('.').join(''));
                  objVersion['v' + vNumber] = version;
                  return vNumber
                });
              const lastVersion = Math.max(...lastestVersions);
              const realLastVersion = objVersion['v' + lastVersion];
              resolve({
                name: this.from,
                version: realLastVersion
              });
            });
          }).on('error', () => {
            reject('Ocurrió un error obteniendo la versión de Chrome');
          });
        })
      }
    },

    {
      from: 'safari',
      data () {
        return new Promise((resolve, reject) => {
          fetch('https://developer.apple.com/tutorials/data/documentation/safari-release-notes.json')
            .then(res => res.json())
            .then((json) => {
              resolve({
                name: this.from,
                version: json.topicSections[0].title.split(' ')[1]
              })
            })
            .catch(() => {
              reject()
            })
        })
      }
    },
  ],

  averaging (arr) {
    const divisorNum = arr.length;
    const browsers = { chrome: 0, firefox: 0, safari: 0, edge: 0, opera: 0, ie: 0 };
    Object.keys(browsers).forEach(browser => {
      arr.forEach(dataList => {
        const browserCatch = dataList.filter(browserData => browserData.name.toLowerCase().includes(browser));
        if (browserCatch.length) browsers[browser] += Number(browserCatch[0].percentage.replace('%', ''))
      })
    });
    for (const item in browsers) browsers[item] = (Math.round((browsers[item] / divisorNum) * 100) / 100) + '%';
    return browsers;
  }

};


stats.init();

