// APP MADRE — el mismo código para todos los clientes.
// Todo lo que cambia de un negocio a otro vive en clientes/<id>/config.json.
// Cliente a mostrar: ?c=<id> en el link, o el último usado, o "la-espiga".

const qs = new URLSearchParams(location.search);
const CLIENTE = qs.get('c') || leer('madre-cliente') || 'la-espiga';
let C = null;               // configuración del negocio
let datos = { movs: [] };   // ventas y gastos
let carrito = [];
let pantalla = 'hoy';
let medio = null;

function leer(k) { try { return localStorage.getItem(k); } catch { return null; } }
function guardar(k, v) { try { localStorage.setItem(k, v); } catch {} }
const clave = () => 'madre-datos-' + C.id;
const plata = n => C.moneda + ' ' + Math.round(n).toLocaleString('es-AR');
const hoyISO = () => new Date().toISOString().slice(0, 10);
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

async function iniciar() {
  try {
    const r = await fetch(`clientes/${encodeURIComponent(CLIENTE)}/config.json`, { cache: 'no-cache' });
    if (!r.ok) throw 0;
    C = await r.json();
  } catch {
    document.getElementById('vista').innerHTML =
      `<div class="card">No encuentro el cliente <b>${esc(CLIENTE)}</b>. Revisá el link.</div>`;
    return;
  }
  guardar('madre-cliente', C.id);
  try { datos = JSON.parse(leer(clave())) || datos; } catch {}
  aplicarMarca();
  dibujarNav();
  mostrar('hoy');
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});
}

// ---------- Marca: nombre, logo, colores ----------
function aplicarMarca() {
  const s = document.documentElement.style;
  s.setProperty('--p', C.colores.principal);
  s.setProperty('--f', C.colores.fondo);
  s.setProperty('--t', C.colores.texto);
  document.querySelector('meta[name=theme-color]').content = C.colores.principal;
  document.title = C.nombreCorto || C.nombre;
  document.getElementById('nombre').textContent = C.nombre;
  document.getElementById('eslogan').textContent = C.eslogan || '';
  document.getElementById('logo').innerHTML = C.logo
    ? `<img src="clientes/${esc(C.id)}/${esc(C.logo)}" alt="">`
    : esc(C.emoji || C.nombre[0]);
}

// ---------- Navegación ----------
function dibujarNav() {
  const tabs = [['hoy', '📊', 'Hoy']];
  if (C.modulos.ventas) tabs.push(['vender', '🛒', 'Vender']);
  if (C.modulos.gastos) tabs.push(['gasto', '💸', 'Gasto']);
  tabs.push(['movs', '📋', 'Movimientos']);
  document.getElementById('nav').innerHTML = tabs.map(([id, i, t]) =>
    `<button data-tab="${id}"><i>${i}</i>${t}</button>`).join('');
  document.querySelectorAll('nav button').forEach(b => b.onclick = () => mostrar(b.dataset.tab));
}

function mostrar(p) {
  pantalla = p;
  document.querySelectorAll('nav button').forEach(b => b.classList.toggle('on', b.dataset.tab === p));
  ({ hoy: vHoy, vender: vVender, gasto: vGasto, movs: vMovs })[p]();
  scrollTo(0, 0);
}

const movsHoy = () => datos.movs.filter(m => m.fecha === hoyISO());
function persistir() { guardar(clave(), JSON.stringify(datos)); }

// ---------- Hoy ----------
function vHoy() {
  const m = movsHoy();
  const ventas = m.filter(x => x.tipo === 'venta').reduce((a, x) => a + x.total, 0);
  const gastos = m.filter(x => x.tipo === 'gasto').reduce((a, x) => a + x.total, 0);
  const porMedio = {};
  m.filter(x => x.tipo === 'venta').forEach(x => porMedio[x.medio] = (porMedio[x.medio] || 0) + x.total);
  document.getElementById('vista').innerHTML = `
    <div class="card"><div class="gris">Quedó hoy (ventas − gastos)</div>
      <div class="grande">${plata(ventas - gastos)}</div></div>
    <div class="card">
      <div class="fila"><span>Ventas (${m.filter(x => x.tipo === 'venta').length})</span><b>${plata(ventas)}</b></div>
      <div class="fila"><span>Gastos</span><b>${plata(gastos)}</b></div>
    </div>
    <h2>Cómo pagaron</h2>
    <div class="card">${Object.keys(porMedio).length
      ? Object.entries(porMedio).map(([k, v]) => `<div class="fila"><span>${esc(k)}</span><b>${plata(v)}</b></div>`).join('')
      : '<div class="vacio">Todavía no hay ventas hoy</div>'}</div>`;
}

// ---------- Vender ----------
function vVender() {
  let html = '';
  C.categorias.forEach((cat, ci) => {
    html += `<h2>${esc(cat.nombre)}</h2><div class="prods">` +
      cat.productos.map((p, pi) =>
        `<button class="prod" data-c="${ci}" data-p="${pi}"><b>${esc(p.nombre)}</b><span>${plata(p.precio)}</span></button>`
      ).join('') + '</div>';
  });
  html += '<div class="carrito" id="carrito"></div>';
  document.getElementById('vista').innerHTML = html;
  document.querySelectorAll('.prod').forEach(b => b.onclick = () => {
    const p = C.categorias[b.dataset.c].productos[b.dataset.p];
    const it = carrito.find(x => x.nombre === p.nombre);
    it ? it.cant++ : carrito.push({ nombre: p.nombre, precio: p.precio, cant: 1 });
    dibujarCarrito();
  });
  dibujarCarrito();
}

function dibujarCarrito() {
  const el = document.getElementById('carrito');
  if (!carrito.length) { el.innerHTML = ''; return; }
  const total = carrito.reduce((a, x) => a + x.precio * x.cant, 0);
  el.innerHTML = `<div class="card">
    ${carrito.map((x, i) => `<div class="fila"><span>${x.cant} × ${esc(x.nombre)}</span>
      <span><b>${plata(x.precio * x.cant)}</b> <button class="x" data-i="${i}">✕</button></span></div>`).join('')}
    <div class="fila"><b>Total</b><b class="grande" style="font-size:24px">${plata(total)}</b></div>
    <div class="chips">${C.mediosDePago.map(m => `<button class="chip ${m === medio ? 'on' : ''}">${esc(m)}</button>`).join('')}</div>
    <button class="btn" id="cobrar" ${medio ? '' : 'disabled'}>${medio ? 'Cobrar ' + plata(total) : 'Elegí cómo paga'}</button>
  </div>`;
  el.querySelectorAll('.x').forEach(b => b.onclick = () => {
    const it = carrito[b.dataset.i];
    --it.cant || carrito.splice(b.dataset.i, 1);
    dibujarCarrito();
  });
  el.querySelectorAll('.chip').forEach(b => b.onclick = () => { medio = b.textContent; dibujarCarrito(); });
  document.getElementById('cobrar').onclick = () => {
    const mov = { id: Date.now(), tipo: 'venta', fecha: hoyISO(), hora: new Date().toTimeString().slice(0, 5),
                  items: carrito, total, medio };
    datos.movs.push(mov); persistir();
    carrito = []; medio = null;
    dibujarCarrito();
    avisar('Venta cobrada: ' + plata(total), () => {
      datos.movs = datos.movs.filter(x => x.id !== mov.id); persistir();
    });
  };
}

// ---------- Gasto ----------
function vGasto() {
  let rubro = null;
  const v = document.getElementById('vista');
  v.innerHTML = `<h2>Nuevo gasto</h2><div class="card">
    <input id="monto" type="number" inputmode="numeric" placeholder="Monto">
    <div class="chips">${C.rubrosGasto.map(r => `<button class="chip">${esc(r)}</button>`).join('')}</div>
    <button class="btn" id="guardarGasto" disabled>Elegí el rubro</button></div>`;
  const btn = document.getElementById('guardarGasto'), monto = document.getElementById('monto');
  const act = () => {
    const ok = rubro && +monto.value > 0;
    btn.disabled = !ok;
    btn.textContent = !rubro ? 'Elegí el rubro' : !(+monto.value > 0) ? 'Poné el monto' : 'Guardar gasto';
  };
  monto.oninput = act;
  v.querySelectorAll('.chip').forEach(b => b.onclick = () => {
    rubro = b.textContent;
    v.querySelectorAll('.chip').forEach(x => x.classList.toggle('on', x === b));
    act();
  });
  btn.onclick = () => {
    const mov = { id: Date.now(), tipo: 'gasto', fecha: hoyISO(), hora: new Date().toTimeString().slice(0, 5),
                  rubro, total: +monto.value };
    datos.movs.push(mov); persistir();
    avisar('Gasto guardado: ' + plata(mov.total), () => {
      datos.movs = datos.movs.filter(x => x.id !== mov.id); persistir();
    });
    vGasto();
  };
}

// ---------- Movimientos ----------
function vMovs() {
  const m = movsHoy().slice().reverse();
  document.getElementById('vista').innerHTML = `<h2>Movimientos de hoy</h2><div class="card">${m.length
    ? m.map(x => `<div class="fila"><span><span class="gris">${x.hora}</span> ${x.tipo === 'venta'
        ? esc(x.items.map(i => i.cant + '× ' + i.nombre).join(', ')) + ` <span class="gris">· ${esc(x.medio)}</span>`
        : '💸 ' + esc(x.rubro)}</span><b>${x.tipo === 'gasto' ? '−' : ''}${plata(x.total)}</b></div>`).join('')
    : '<div class="vacio">Nada cargado hoy</div>'}</div>`;
}

// ---------- Aviso con Deshacer ----------
let tAviso;
function avisar(texto, deshacer) {
  document.querySelector('.toast')?.remove();
  clearTimeout(tAviso);
  const t = document.createElement('div');
  t.className = 'toast';
  t.innerHTML = `<span>${esc(texto)}</span><button>Deshacer</button>`;
  t.querySelector('button').onclick = () => { deshacer(); t.remove(); mostrar(pantalla); };
  document.body.appendChild(t);
  tAviso = setTimeout(() => t.remove(), 5000);
}

iniciar();
