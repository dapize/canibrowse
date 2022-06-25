const browserItems = document.querySelectorAll('.browsers__item');

(function () {
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


(function () {
  // Counter in hover
  const counterAnim = (target, start = 0, end, duration, callBack) => {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        target.innerText = (progress * (end - start) + start).toFixed(2) + '%';
        if (progress < 1) {
          const idAnim = window.requestAnimationFrame(step);
          callBack( idAnim );
        }
    };
    const idAnim = window.requestAnimationFrame(step);
    callBack( idAnim );
  };

  Array.prototype.forEach.call(browserItems, function (item) {
    const percentage = item.querySelector('.browsers__item__percentage__number');
    const total = Number(percentage.textContent.replace('%', ''));
    let idAnimation = null;
    item.addEventListener('mouseenter', function () {
      counterAnim(percentage, 0, total, 1000, function (idAnim) {
        idAnimation = idAnim;
      });
    });
    item.addEventListener('mouseleave', function () {
      window.cancelAnimationFrame(idAnimation);
    })
  })
}());

(function () {
  const infoIcon = document.querySelector('.info');
  if (!infoIcon) return;
  infoIcon.addEventListener('click', function () {
    alert('Can I Browse v1.1\n\nHecho con ❤ por Daniel P Z - danielpz@outlook.com')
  })
}());
