/* Silk (WebGL, lit folded satin) and pebbles (canvas 2D) for the Limewash and Quarry treatments. */
(function () {
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  function hex(h) { h = h.replace('#', ''); return [parseInt(h.slice(0, 2), 16) / 255, parseInt(h.slice(2, 4), 16) / 255, parseInt(h.slice(4, 6), 16) / 255]; }

  /* ---------- Silk: a folded satin surface lit from one side ---------- */
  var FRAG = [
    'precision highp float;',
    'uniform vec2 r; uniform float t; uniform vec3 dark; uniform vec3 light; uniform float fold; uniform float sheen; uniform float grain; uniform float angle;',
    'float h(vec2 p){ return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453); }',
    'float surf(vec2 p){',
    '  float a=sin(p.x*1.6*fold+sin(p.y*0.9+t*0.18)*1.8+t*0.12);',
    '  float b=sin(p.x*3.1*fold-p.y*0.7+sin(p.y*1.7-t*0.1)*1.2)*0.45;',
    '  float c=sin(p.x*0.7+p.y*0.35+t*0.07)*0.9;',
    '  return a+b+c; }',
    'void main(){',
    '  vec2 uv=gl_FragCoord.xy/r; vec2 p=(gl_FragCoord.xy-0.5*r)/r.y*3.0;',
    '  float ca=cos(angle), sa=sin(angle); p=mat2(ca,-sa,sa,ca)*p;',
    '  float e=0.01; float s=surf(p);',
    '  vec3 n=normalize(vec3(surf(p+vec2(e,0.))-s, surf(p+vec2(0.,e))-s, e*2.2));',
    '  vec3 L=normalize(vec3(-0.5,0.6,0.8)); vec3 V=vec3(0.,0.,1.); vec3 H=normalize(L+V);',
    '  float dif=clamp(dot(n,L),0.,1.);',
    '  float spec=pow(clamp(dot(n,H),0.,1.),38.0)*sheen;',
    '  float aniso=pow(1.0-abs(dot(n,normalize(vec3(1.,0.2,0.)))),6.0)*0.35*sheen;',
    '  vec3 col=mix(dark,light,smoothstep(0.05,0.95,dif));',
    '  col+=vec3(spec+aniso);',
    '  col+= (h(gl_FragCoord.xy+t)-0.5)*grain;',
    '  gl_FragColor=vec4(col,1.0); }'
  ].join('\n');

  window.silk = function (canvas, o) {
    o = o || {};
    var gl = canvas.getContext('webgl', { antialias: false, premultipliedAlpha: false });
    if (!gl) { canvas.style.background = 'linear-gradient(120deg,' + (o.dark || '#777') + ',' + (o.light || '#eee') + ')'; return; }
    function sh(type, src) { var s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; }
    var pr = gl.createProgram();
    gl.attachShader(pr, sh(gl.VERTEX_SHADER, 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}'));
    gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FRAG)); gl.linkProgram(pr); gl.useProgram(pr);
    var b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    var loc = gl.getAttribLocation(pr, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    var U = function (n) { return gl.getUniformLocation(pr, n); };
    gl.uniform3fv(U('dark'), hex(o.dark || '#6b6a66')); gl.uniform3fv(U('light'), hex(o.light || '#f4f4f1'));
    gl.uniform1f(U('fold'), o.fold || 1); gl.uniform1f(U('sheen'), o.sheen == null ? 0.5 : o.sheen);
    gl.uniform1f(U('grain'), o.grain || 0.02); gl.uniform1f(U('angle'), o.angle || 0.5);
    var t0 = performance.now(), visible = true;
    function size() { var d = Math.min(devicePixelRatio || 1, 1.5); canvas.width = canvas.clientWidth * d; canvas.height = canvas.clientHeight * d; gl.viewport(0, 0, canvas.width, canvas.height); }
    size(); addEventListener('resize', size);
    new IntersectionObserver(function (e) { visible = e[0].isIntersecting; }).observe(canvas);
    function frame(now) {
      if (visible) { gl.uniform2f(U('r'), canvas.width, canvas.height); gl.uniform1f(U('t'), reduce ? 8 : (now - t0) / 1000 * (o.speed || 1) + 8); gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4); }
      if (!reduce) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  };

  /* ---------- Pebbles: irregular rounded stones with soft light and grain ---------- */
  function rng(seed) { return function () { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }; }
  function shape(ctx, cx, cy, w, h, rot, rand, wobble) {
    var n = 64, pts = [], k = [rand() * 6, rand() * 6, rand() * 6];
    for (var i = 0; i < n; i++) {
      var a = i / n * Math.PI * 2;
      var rr = 1 + wobble * (Math.sin(a * 2 + k[0]) * 0.5 + Math.sin(a * 3 + k[1]) * 0.3 + Math.sin(a * 5 + k[2]) * 0.12);
      var c = Math.cos(a), s = Math.sin(a);
      var ex = Math.sign(c) * Math.pow(Math.abs(c), 0.78), ey = Math.sign(s) * Math.pow(Math.abs(s), 0.78);
      var x = ex * w / 2 * rr, y = ey * h / 2 * rr;
      pts.push([cx + x * Math.cos(rot) - y * Math.sin(rot), cy + x * Math.sin(rot) + y * Math.cos(rot)]);
    }
    ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
    for (i = 1; i <= n; i++) { var p = pts[i % n], q = pts[(i + 1) % n]; ctx.quadraticCurveTo(p[0], p[1], (p[0] + q[0]) / 2, (p[1] + q[1]) / 2); }
    ctx.closePath();
  }
  window.pebbles = function (canvas, list, o) {
    o = o || {};
    var d = Math.min(devicePixelRatio || 1, 2), W = canvas.clientWidth, H = canvas.clientHeight;
    canvas.width = W * d; canvas.height = H * d;
    var ctx = canvas.getContext('2d'); ctx.scale(d, d);
    list.forEach(function (p, idx) {
      var rand = rng(p.seed || (idx + 3) * 977);
      var x = p.x * W, y = p.y * H, w = p.w * W, h = p.h * W, rot = p.r || 0;
      // contact shadow
      ctx.save(); ctx.filter = 'blur(' + Math.max(6, h * 0.12) + 'px)'; ctx.fillStyle = 'rgba(20,20,18,' + (o.shadow || 0.22) + ')';
      shape(ctx, x + w * 0.04, y + h * 0.16, w * 0.96, h * 0.7, rot, rng(p.seed || 5), 0.05); ctx.fill(); ctx.restore();
      // body
      ctx.save(); shape(ctx, x, y, w, h, rot, rand, p.wobble == null ? 0.07 : p.wobble); ctx.clip();
      var g = ctx.createRadialGradient(x - w * 0.22, y - h * 0.32, Math.min(w, h) * 0.05, x, y, Math.max(w, h) * 0.72);
      g.addColorStop(0, p.light); g.addColorStop(0.55, p.color); g.addColorStop(1, p.dark);
      ctx.fillStyle = g; ctx.fillRect(x - w, y - h, w * 2, h * 2);
      // speckle grain
      var n = Math.round(w * h / (o.speckle || 30));
      for (var i = 0; i < n; i++) {
        var sx = x + (rand() - 0.5) * w, sy = y + (rand() - 0.5) * h, v = rand();
        ctx.fillStyle = v > 0.5 ? 'rgba(255,255,255,' + (0.05 + rand() * 0.08) + ')' : 'rgba(0,0,0,' + (0.04 + rand() * 0.08) + ')';
        ctx.fillRect(sx, sy, 0.8 + rand() * 1.2, 0.8 + rand() * 1.2);
      }
      // a quartz vein on some stones
      if (p.vein) { ctx.strokeStyle = p.vein; ctx.lineWidth = Math.max(1.2, w * 0.012); ctx.globalAlpha = 0.7; ctx.beginPath();
        var vy = y + (rand() - 0.5) * h * 0.4; ctx.moveTo(x - w, vy); ctx.bezierCurveTo(x - w * 0.2, vy - h * 0.2, x + w * 0.2, vy + h * 0.25, x + w, vy - h * 0.05); ctx.stroke(); ctx.globalAlpha = 1; }
      // soft rim light
      var rim = ctx.createLinearGradient(x - w / 2, y - h / 2, x + w / 2, y + h / 2);
      rim.addColorStop(0, 'rgba(255,255,255,.18)'); rim.addColorStop(0.5, 'rgba(255,255,255,0)'); rim.addColorStop(1, 'rgba(0,0,0,.12)');
      ctx.fillStyle = rim; ctx.fillRect(x - w, y - h, w * 2, h * 2);
      ctx.restore();
      if (p.label) { ctx.fillStyle = p.ink || '#fff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.font = p.font || ('300 ' + Math.round(h * 0.42) + 'px serif'); ctx.fillText(p.label, x, y + h * 0.02); }
    });
  };

  /* redraw pebbles when fonts arrive or the window changes size */
  window.pebbleScene = function (canvas, list, o) {
    var draw = function () { window.pebbles(canvas, list, o); };
    (document.fonts ? document.fonts.ready : Promise.resolve()).then(draw);
    var tm; addEventListener('resize', function () { clearTimeout(tm); tm = setTimeout(draw, 150); });
  };
})();
