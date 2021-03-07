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
      }
    }
  });

  // PROCESOR
  (function (instance, main) {
    let nodes = main.querySelectorAll(
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
      instance.set(node);
    });
  }(layout, document));
}());

