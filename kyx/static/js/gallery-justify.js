(function () {
  var container = document.querySelector('.gallery-grid');
  if (!container) return;

  var items = Array.prototype.slice.call(container.querySelectorAll('.gallery-item'));
  if (!items.length) return;

  // Google Photos-style justified rows at every width: each row is sized
  // from the real width/height of the photos in it and filled edge to edge
  // with no cropping. Sets an explicit pixel width AND height on every
  // item — never CSS aspect-ratio or grid auto-tracks — so sizing never
  // depends on whether an image has finished loading yet.
  //
  // All the arithmetic below is done in WHOLE pixels. Firefox lays flex
  // lines out on the exact fractional content width, so a row whose parts
  // sum to a hair more than that width (which fractional widths, or a
  // fractional `gap`, make almost certain) wraps its last photo onto a
  // line of its own and the row visibly stops short of the right edge.
  // Chrome happens to absorb the same overflow. Flooring the container
  // width, pinning the gap to an integer, flooring each photo and handing
  // the leftover pixels back out one by one keeps every row's total at or
  // just under the real width in every browser.
  var ratios = items.map(function (item) {
    var img = item.querySelector('img');
    var w = parseFloat(img.getAttribute('width')) || 1;
    var h = parseFloat(img.getAttribute('height')) || 1;
    return w / h;
  });

  // A row is stretched to fill the container exactly. A trailing row with
  // too few photos to naturally reach that width would need an absurd
  // scale-up to still go edge to edge, so instead it's folded into the
  // previous row (more photos to spread the width across) rather than
  // left short or blown up.
  var MAX_ROW_SCALE = 1.4;

  function gapPx() {
    // Read the stylesheet's gap (which changes at the 576px breakpoint),
    // not the integer we pinned on a previous run, then pin the rounded
    // value so the gap the browser actually uses is the one this maths
    // assumes.
    container.style.gap = '';
    var value = parseFloat(getComputedStyle(container).columnGap);
    value = Math.round(isNaN(value) ? 8 : value);
    container.style.gap = value + 'px';
    return value;
  }

  function contentWidth() {
    var style = getComputedStyle(container);
    var width = container.getBoundingClientRect().width
      - (parseFloat(style.paddingLeft) || 0)
      - (parseFloat(style.paddingRight) || 0)
      - (parseFloat(style.borderLeftWidth) || 0)
      - (parseFloat(style.borderRightWidth) || 0);
    return Math.floor(width);
  }

  function ratioSum(row) {
    return row.reduce(function (sum, entry) {
      return sum + entry.ratio;
    }, 0);
  }

  // Height a row of these photos gets when stretched across the container.
  function fittedHeight(row, containerWidth, g) {
    return (containerWidth - g * (row.length - 1)) / ratioSum(row);
  }

  function buildRows(containerWidth, g, target) {
    var rows = [];
    var row = [];

    items.forEach(function (item, i) {
      var entry = { item: item, ratio: ratios[i] };
      row.push(entry);

      var height = fittedHeight(row, containerWidth, g);
      if (height >= target) return;

      // This photo drops the row below the target height. Keep it only if
      // that lands closer to the target than the (too tall) row without
      // it would — the same trade-off Google Photos makes.
      if (row.length > 1) {
        var without = row.slice(0, -1);
        if (fittedHeight(without, containerWidth, g) - target < target - height) {
          rows.push(without);
          row = [entry];
          return;
        }
      }

      rows.push(row);
      row = [];
    });

    if (row.length) rows.push(row);

    while (rows.length > 1 && fittedHeight(rows[rows.length - 1], containerWidth, g) > target * MAX_ROW_SCALE) {
      var last = rows.pop();
      rows[rows.length - 1] = rows[rows.length - 1].concat(last);
    }

    return rows;
  }

  function applyRow(row, containerWidth, g, maxHeight) {
    var available = containerWidth - g * (row.length - 1);
    var height = available / ratioSum(row);
    var justified = height <= maxHeight;
    if (!justified) height = maxHeight;

    var widths = row.map(function (entry) {
      return Math.floor(entry.ratio * height);
    });

    if (justified) {
      // Hand the pixels lost to flooring back out, one per photo, so the
      // row's parts add up to exactly the available width.
      var leftover = available - widths.reduce(function (sum, w) { return sum + w; }, 0);
      for (var i = 0; i < leftover; i++) widths[i % widths.length] += 1;
    }

    var rowHeight = Math.round(height);
    row.forEach(function (entry, i) {
      entry.item.style.width = widths[i] + 'px';
      entry.item.style.height = rowHeight + 'px';
    });
  }

  function layout() {
    var g = gapPx();
    var containerWidth = contentWidth();
    if (containerWidth <= 0) return;

    var target = containerWidth < 576 ? 130 : containerWidth < 992 ? 170 : 220;
    var rows = buildRows(containerWidth, g, target);

    rows.forEach(function (row, i) {
      // Only the final row may be left unjustified, and only when there
      // aren't enough photos left to fill the width at a sane height.
      var cap = i === rows.length - 1 ? target * MAX_ROW_SCALE : Infinity;
      applyRow(row, containerWidth, g, cap);
    });

    container.classList.add('is-ready');
  }

  var resizeTimer;
  var lastWidth = null;
  function scheduleLayout() {
    // ResizeObserver reports width changes as small as a fraction of a
    // pixel (fonts settling, scrollbar show/hide); re-running the full
    // layout for those is wasted work and can loop with the scrollbar
    // appearing/disappearing, so only actually re-layout when the
    // container's width has visibly changed.
    var currentWidth = contentWidth();
    if (currentWidth === lastWidth) return;
    lastWidth = currentWidth;
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(layout, 150);
  }

  // The container's own box — not just the window — is what the layout
  // depends on (sidebar toggles, zoom, print preview, etc. all resize it
  // without a window "resize" event). ResizeObserver is the reliable way
  // to catch every such case in every current browser; window/orientation
  // listeners are kept alongside it as a harmless fallback.
  if (typeof ResizeObserver === 'function') {
    new ResizeObserver(scheduleLayout).observe(container);
  } else {
    window.addEventListener('resize', scheduleLayout);
    window.addEventListener('orientationchange', scheduleLayout);
    if (window.screen && window.screen.orientation) {
      window.screen.orientation.addEventListener('change', scheduleLayout);
    }
  }

  try {
    lastWidth = contentWidth();
    layout();
  } catch (e) {
    container.classList.add('is-ready');
  }
})();
