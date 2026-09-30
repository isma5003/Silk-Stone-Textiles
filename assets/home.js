/* Home: the silk strip beside the first photo, the four stones, and the dark silk band. */
(function () {
  var strip = document.getElementById('silkStrip'), band = document.getElementById('silkBand'), hero = document.getElementById('silkHero'), stones = document.getElementById('stones');
  if (hero) {
    silk(hero, { dark: '#0B0B0A', light: '#6A6862', fold: 1.35, sheen: .26, grain: .012, angle: .3, speed: .55 });
    var nav = document.querySelector('.nav'), sec = hero.parentNode;
    var dark = function () { if (nav) nav.classList.toggle('on-dark', sec.getBoundingClientRect().bottom > 80); };
    dark(); addEventListener('scroll', dark, { passive: true }); addEventListener('resize', dark);
  }
  if (strip) silk(strip, { dark: '#6E6961', light: '#D6D2CA', fold: 3.2, sheen: .12, grain: .035, angle: 1.5, speed: .6 });
  if (band) silk(band, { dark: '#0B0B0A', light: '#55554F', fold: 1.5, sheen: .22, grain: .015, angle: .25, speed: .7 });
  if (!stones) return;
  var F = function (k) { return '300 ' + Math.round(stones.clientWidth * k) + 'px Boska, Georgia, serif'; };
  var list = function () { return [
    { x: .26, y: .36, w: .36, h: .25, r: -.2, color: '#4A4640', light: '#77716A', dark: '#26241F', seed: 7, label: '16', ink: '#EEECE7', font: F(.1) },
    { x: .66, y: .3, w: .22, h: .17, r: .3, color: '#C9C4BB', light: '#E8E4DD', dark: '#9A948A', seed: 19, label: '9', ink: '#1B1A18', font: F(.07), vein: 'rgba(255,255,255,.6)' },
    { x: .44, y: .74, w: .27, h: .19, r: .12, color: '#8E887E', light: '#B3ADA3', dark: '#5E5A53', seed: 31, label: '3', ink: '#EEECE7', font: F(.075) },
    { x: .8, y: .68, w: .15, h: .12, r: -.35, color: '#E6E3DD', light: '#FBFAF8', dark: '#BDB8AF', seed: 53, label: '1', ink: '#1B1A18', font: F(.05) }
  ]; };
  var draw = function () { pebbles(stones, list(), { shadow: .2, speckle: 22 }); };
  (document.fonts ? document.fonts.ready : Promise.resolve()).then(draw);
  var tm; addEventListener('resize', function () { clearTimeout(tm); tm = setTimeout(draw, 150); });
})();
