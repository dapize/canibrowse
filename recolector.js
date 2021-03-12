const scrapeIt = require("scrape-it");

/*

// Stat Counter
scrapeIt('https://gs.statcounter.com/', {
  browsers: {
    listItem: '.stats-snapshot tbody tr',
    data: {
      name: 'th',
      percentage: '.count'
    }
  }
}).then(({ data, response }) => {
  console.log(data)
});

// W3Counter
scrapeIt('https://www.w3counter.com/globalstats.php', {
  browsers: {
    listItem: '.bargraphs .bar',
    data: {
      name: '.lab',
      percentage: '.value'
    }
  }
}).then(({ data, response }) => {
  console.log(data)
});

*/


// Stetic
scrapeIt('https://www.stetic.com/market-share/browser/', {
  browsers: {
    listItem: '.container > .table-striped tbody tr',
    data: {
      name: '.lab',
      percentage: '.value'
    }
  }
}).then(({ data, response }) => {
  console.log(data)
});


