(function () {
  // CONFIG
  const layout = new Layouter({
    breakPoints: {
      xs: {
        width: 360,
        cols: 15,
        direct: true
      },
      sm: {
        width: 768,
        cols: 31
      },
      md: {
        width: 1024,
        cols: 31
      },
      lg: {
        width: 1280,
        cols: 31
      },
      xl: {
        width: 1440,
        cols: 31
      },
      xxl: {
        width: 1600,
        cols: 31
      }
    }
  });

  // PROCESOR
  let nodes = document.querySelectorAll(
    "[cols], [pad], [padt], [padr], [padb], [padl], [mar], [mart], [marr], [marb], [marl], [flex], [mxw], [mxh], [miw], [mih], [wdh], [hgt]"
  );
  if (!nodes.length) return false;

  const setNodes = new Set();
  Array.prototype.forEach.call(nodes, function (itemNode) {
    setNodes.add(itemNode);
  });

  nodes = [];
  setNodes.forEach(function (node) {
    nodes.push(node);
    layout.set(node);
  });

  // AUTO LANGUAGE
  let currentLang = navigator.language;
  currentLang = currentLang.substring(0, 2);
  if (currentLang === 'es') {

    // dictionaries
    const texts = {
      percentage: 'de personas usan <br>este navegador',
      download: 'descargar',
      available: 'disponible en'
    };

    const targets = {
      link: '.browsers__item__download a',
      percentage: '.browsers__item__percentage .title',
      available: '.browsers__item__sos .title'
    }

    const browserItems = document.querySelectorAll('.browsers__item');
    Array.prototype.forEach.call(browserItems, function( bItem ) {
      let titleBrowser = bItem.querySelector('.title').textContent.toLowerCase();

      // Download LInk
      let downLink = bItem.querySelector( targets.link );
      downLink.textContent = texts.download;

      if (titleBrowser.indexOf('chrome') === -1 ) {
        let toReplace;
        const hrefLink = downLink.getAttribute('href');
        if ( hrefLink.indexOf('firefox') !== -1 ) toReplace = ['en-US', 'es-ES'];
        if ( hrefLink.indexOf('microsoft') !== -1 ) toReplace = ['en-us', 'es-es'];
        if ( hrefLink.indexOf('opera') !== -1 ) toReplace = ['download', 'es/download'];
        if ( hrefLink.indexOf('safari') !== -1 ) toReplace = ['downloads', 'es_ES/downloads'];
        downLink.setAttribute('href', hrefLink.replace(toReplace[ 0 ], toReplace[ 1 ]));
      }

      // Percentage Text
      bItem.querySelector( targets.percentage ).innerHTML = texts.percentage;

      // Available on
      bItem.querySelector( targets.available ).textContent = texts.available;
    })
  }
}());



