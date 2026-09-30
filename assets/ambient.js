/* Silkstone · ambient silk behind every page.
   Very faint, drawn at low resolution, starts only after the page has loaded,
   drifts slowly and moves a little with scrolling, pauses when the tab is hidden,
   and holds still for visitors who ask for reduced motion. */
(function () {
  if (window.__ssAmbient) return; window.__ssAmbient = true;
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var cv = document.createElement('canvas');
  cv.className = 'ambient-silk'; cv.setAttribute('aria-hidden', 'true');
  var gl = cv.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'low-power' });
  if (!gl) return;
  var FRAG = [
    'precision mediump float;',
    'uniform vec2 r; uniform float t; uniform float s;',
    'float surf(vec2 p){',
    '  float a=sin(p.x*1.9+sin(p.y*0.9+t*0.18)*1.8+t*0.12);',
    '  float b=sin(p.x*3.4-p.y*0.7+sin(p.y*1.7-t*0.1)*1.2)*0.45;',
    '  float c=sin(p.x*0.7+p.y*0.35+t*0.07)*0.9;',
    '  return a+b+c; }',
    'void main(){',
    '  vec2 p=(gl_FragCoord.xy-0.5*r)/r.y*2.6; p.y+=s;',
    '  float ca=cos(1.1), sa=sin(1.1); p=mat2(ca,-sa,sa,ca)*p;',
    '  float e=0.01; float h=surf(p);',
    '  vec3 n=normalize(vec3(surf(p+vec2(e,0.))-h, surf(p+vec2(0.,e))-h, e*2.2));',
    '  float dif=clamp(dot(n,normalize(vec3(-0.5,0.6,0.8))),0.,1.);',
    '  float spec=pow(clamp(dot(n,normalize(vec3(-0.25,0.3,1.4))),0.,1.),30.0)*0.05;',
    '  vec3 col=mix(vec3(0.878,0.867,0.843),vec3(0.945,0.937,0.918),smoothstep(0.1,0.95,dif))+spec;',
    '  gl_FragColor=vec4(col,1.0); }'
  ].join('\n');
  function sh(type, src) { var x = gl.createShader(type); gl.shaderSource(x, src); gl.compileShader(x); return x; }
  var pr = gl.createProgram();
  gl.attachShader(pr, sh(gl.VERTEX_SHADER, 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}'));
  gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FRAG)); gl.linkProgram(pr);
  if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) return;
  gl.useProgram(pr);
  var b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  var loc = gl.getAttribLocation(pr, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  var uR = gl.getUniformLocation(pr, 'r'), uT = gl.getUniformLocation(pr, 't'), uS = gl.getUniformLocation(pr, 's');
  var SCALE = 0.3; /* silk is soft, so a small drawing stretched to the screen looks the same and costs little */
  function size() { cv.width = Math.max(64, Math.round(innerWidth * SCALE)); cv.height = Math.max(64, Math.round(innerHeight * SCALE)); gl.viewport(0, 0, cv.width, cv.height); draw(); }
  var t0 = performance.now(), last = 0;
  function draw(now) {
    now = now || performance.now();
    gl.uniform2f(uR, cv.width, cv.height);
    gl.uniform1f(uT, reduce ? 10 : 10 + (now - t0) / 1000 * 0.35);
    gl.uniform1f(uS, reduce ? 0 : scrollY / Math.max(innerHeight, 1) * 0.35);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }
  function frame(now) {
    if (!document.hidden && now - last > 40) { last = now; draw(now); }
    requestAnimationFrame(frame);
  }
  document.body.insertBefore(cv, document.body.firstChild);
  size(); addEventListener('resize', size);
  requestAnimationFrame(function () { cv.classList.add('on'); });
  if (!reduce) requestAnimationFrame(frame);
})();
