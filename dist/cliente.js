/* App de bodega – pantallas (es el mismo código de la app original de Apps Script) */
  /* ================= Utilidades ================= */
  const $ = id => document.getElementById(id);
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c =>
    ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
  const MESES = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
  const pad3 = n => String(n).padStart(3, '0');

  /* ----- Paginación: todas las tablas y listas largas muestran 15 por página ----- */
  const POR_PAG = 15;
  const pagAct = {};        // página actual de cada tabla
  const pagRepintar = {};   // cómo se vuelve a pintar cada tabla al cambiar de página
  function paginar(clave, lista, repintar) {
    if (repintar) pagRepintar[clave] = repintar;
    const pags = Math.max(1, Math.ceil(lista.length / POR_PAG));
    const p = Math.min(Math.max(1, pagAct[clave] || 1), pags);
    pagAct[clave] = p;
    return { filas: lista.slice((p - 1) * POR_PAG, p * POR_PAG), barra: barraPag(clave, p, pags, lista.length) };
  }
  function barraPag(clave, p, pags, total) {
    if (total <= POR_PAG) return '';
    const ini = (p - 1) * POR_PAG + 1, fin = Math.min(p * POR_PAG, total);
    const nums = [...new Set([1, p - 1, p, p + 1, pags])].filter(n => n >= 1 && n <= pags).sort((a, b) => a - b);
    let botones = '', prev = 0;
    nums.forEach(n => {
      if (n - prev > 1) botones += '<span class="pag-sep">…</span>';
      botones += `<button type="button" class="${n === p ? 'on' : ''}" ${n === p ? 'aria-current="page"' : ''} onclick="irPag('${clave}', ${n})">${n}</button>`;
      prev = n;
    });
    return `<nav class="pag" data-pag="${clave}" aria-label="Páginas"><span class="muted small">${ini}–${fin} de ${total}</span>
      <span class="pag-btns"><button type="button" aria-label="Página anterior" ${p === 1 ? 'disabled' : ''} onclick="irPag('${clave}', ${p - 1})">‹</button>${botones}<button type="button" aria-label="Página siguiente" ${p === pags ? 'disabled' : ''} onclick="irPag('${clave}', ${p + 1})">›</button></span></nav>`;
  }
  function irPag(clave, n) {
    pagAct[clave] = n;
    if (pagRepintar[clave]) pagRepintar[clave]();
    // Que se vea el comienzo de la tabla
    const nav = document.querySelector(`.pag[data-pag="${clave}"]`);
    const caja = nav && (nav.previousElementSibling || nav);
    if (caja && caja.getBoundingClientRect().top < 0) caja.scrollIntoView({ block: 'start', behavior: 'smooth' });
  }
  const pagInicio = (...claves) => claves.forEach(k => { pagAct[k] = 1; });

  const ICONOS = {
    casa: '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 9l9-5 9 5v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z"/><path d="M8 20v-6h8v6"/></svg>',
    check: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12l5 5 9-10"/></svg>',
    barras: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 5v14M7 5v14M11 5v14M14 5v14M17 5v14M20 5v14"/></svg>',
    camara: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/></svg>',
    lupa: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/></svg>',
    lugar: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="3" width="16" height="18" rx="1.5"/><path d="M4 9h16M4 15h16M12 3v18"/></svg>',
    cerrar: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    sol: '<svg class="i-sol" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
    luna: '<svg class="i-luna" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>'
  };

  function guardarLS(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function leerLS(k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } }

  // Antes llamaba a Apps Script (google.script.run). Ahora llama a servidor.js, que guarda en Supabase.
  function llamar(fn, ...args) {
    const f = window.servidor && window.servidor[fn];
    if (typeof f !== 'function') return Promise.reject(new Error(`Falta la función ${fn} en servidor.js`));
    return Promise.resolve().then(() => f(...args)).then(r => {
      // Sin señal: quedó guardado en el equipo y se sube solo después
      if (r && r._enCola) setTimeout(() => toast('Sin señal: quedó guardado en este equipo y se sube solo cuando vuelva la señal.', 'ok'), 450);
      return r;
    }).catch(e => {
      // En los avisos se muestra el código de ubicación numérico, no el interno
      if (e && e.message && typeof sede !== 'undefined' && sede && sede.espPorId) {
        e.message = e.message.replace(/\b[A-Z0-9]+(?:-[A-Z0-9]+)*-F\d+-P\d{3}(?:-(?:PK|\d+)[A-D])?\b/g, m => {
          if (sede.espPorId[m]) return cu(m);
          const x = m.match(/^(.+)-P(\d{3})$/); return x && sede.rackPorId[x[1]] ? posCodigo(x[1], Number(x[2])) : m;
        });
      }
      throw e;
    });
  }

  /* ----- Señal: aviso arriba y lo que falta por subir ----- */
  const estadoSenal = () => (window.servidor && window.servidor.offlineEstado) ? window.servidor.offlineEstado()
    : { enLinea: true, pendientes: [], fallidos: [], subiendo: false };
  function chipSenalHtml() {
    const e = estadoSenal(), n = e.pendientes.length, f = e.fallidos.length;
    if (e.enLinea && !n && !f) return '';
    const txt = !e.enLinea ? (n ? `Sin señal · ${n} por subir` : 'Sin señal')
      : e.subiendo ? `Subiendo ${n}…` : n ? `${n} por subir` : `${f} sin subir`;
    const cls = f || !e.enLinea ? 'chip-senal mal' : 'chip-senal';
    return `<button class="${cls}" onclick="abrirSenal()" aria-label="${txt}"><span class="punto" aria-hidden="true"></span>${txt}</button>`;
  }
  function pintarChipSenal() { const c = $('chipSenal'); if (c) c.innerHTML = chipSenalHtml(); if (!$('modal').hidden && $('senalCaja')) abrirSenal(); }
  window.addEventListener('bodega-offline', pintarChipSenal);
  window.addEventListener('bodega-subido', ev => {
    const { subidos, fallidos } = ev.detail;
    if (fallidos) toast(`${fallidos} movimiento${fallidos === 1 ? '' : 's'} hecho${fallidos === 1 ? '' : 's'} sin señal no se pudo subir. Toca el aviso de arriba.`, 'error');
    else if (subidos) toast(`Volvió la señal: se subieron ${subidos} movimiento${subidos === 1 ? '' : 's'}.`, 'ok');
    if (pantalla === 'app' && ses) refrescar();
  });

  // La base rechazó lo pendiente porque el equipo perdió su sesión: hay que activarlo otra vez
  window.addEventListener('bodega-sesion', () => {
    toast('La sesión de este equipo se cerró. Lo pendiente sigue guardado: recarga la página y, si la pide, activa el equipo otra vez.', 'error');
    pintarChipSenal();
  });

  function abrirSenal() {
    const e = estadoSenal();
    const hora = iso => new Date(iso).toLocaleString('es-CO', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
    abrirModal(`<div class="fila-sb"><span class="h2">${e.enLinea ? 'Con señal' : 'Sin señal'}</span>${btnCerrar()}</div>
      <div id="senalCaja" class="col gap12 mt8">
        <span class="muted small">${e.enLinea
          ? 'Lo que se hizo sin señal se está subiendo solo.'
          : 'Puedes consultar, ubicar, mover y dar salida. Todo queda guardado en este equipo y se sube solo cuando vuelva la señal. Rotular, recibir y descargar Excel necesitan señal.'}</span>
        ${e.sesionCerrada ? `<p class="error">La sesión de este equipo se cerró y la base no recibe nada. Lo pendiente <b>sigue guardado</b>: recarga la página y, si la pide, activa el equipo con el correo y la contraseña de la bodega. Después toca «Subir ahora».</p>
          <button class="btn btn-sec" onclick="location.reload()">Recargar la página</button>` : ''}
        <div><span class="h3">Por subir (${e.pendientes.length})</span>
          ${e.pendientes.length ? `<div class="lista-senal mt8">${e.pendientes.map(o => `<div><b>${esc(o.texto)}</b><span class="muted small">${hora(o.fecha)} · ${esc(o.d.usuario || '')}</span></div>`).join('')}</div>`
            : '<p class="muted small mt8">Nada pendiente.</p>'}</div>
        ${e.fallidos.length ? `<div><span class="h3 txt-rojo">No se pudieron subir (${e.fallidos.length})</span>
          <span class="muted small">El servidor no los aceptó. Siguen guardados en este equipo: vuelve a intentarlo con señal o descarga la lista para no perderlos.</span>
          <div class="fila gap8 mt8" style="flex-wrap: wrap;">
            ${e.enLinea ? '<button class="btn btn-pri" onclick="reintentarSenal()">Volver a intentar todos</button>' : ''}
            <button class="btn btn-sec" onclick="descargarFallidos()">Descargar la lista</button></div>
          <div class="lista-senal mt8">${e.fallidos.map(o => `<div class="mal"><b>${esc(o.texto)}</b>
            <span class="error small">${esc(o.error)}</span><span class="muted small">${hora(o.fecha)} · ${esc(o.d.usuario || '')}</span>
            <button class="btn btn-sec btn-mini" onclick="window.servidor.offlineDescartar('${esc(o.id)}'); abrirSenal(); pintarChipSenal()">Ya lo revisé</button></div>`).join('')}</div></div>` : ''}
        ${e.pendientes.length && e.enLinea ? `<button class="btn btn-pri btn-xl" onclick="window.servidor.offlineSubir()">Subir ahora</button>` : ''}
      </div>`);
  }

  // Los que no se pudieron subir vuelven a la cola
  async function reintentarSenal() {
    const n = await window.servidor.offlineReintentar();
    toast(`Subiendo otra vez ${n} pendiente${n === 1 ? '' : 's'}…`, 'ok');
    abrirSenal(); pintarChipSenal();
  }
  // Copia de lo que no se pudo subir (para no perderlo): se abre en Excel
  function descargarFallidos() {
    const e = estadoSenal(), q = v => '"' + String(v == null ? '' : v).replace(/"/g, '""') + '"';
    const filas = [['Qué se hizo', 'Usuario', 'Fecha', 'Error', 'Producto', 'Ubicación', 'Cantidades']].concat(e.fallidos.map(o => [o.texto, o.d.usuario, o.fecha, o.error,
      o.d.codigo || o.d.productoId || '', o.d.ubicacionId || '', o.d.cantidades ? JSON.stringify(o.d.cantidades) : (o.d.cantidad != null ? o.d.cantidad : '')]));
    const blob = new Blob(['\ufeff' + filas.map(f => f.map(q).join(';')).join('\r\n')], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = 'no-se-pudieron-subir.csv';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  }

  /* ---------- Enter: pasar al siguiente campo ----------
   * En cualquier formulario, Enter salta al siguiente campo. En el último, se va al botón de guardar
   * (otro Enter guarda). Los campos que ya hacen algo con Enter (escanear, buscar…) siguen igual. */
  const ENTER_CAMPOS = 'input:not([type=hidden]):not([type=checkbox]):not([type=radio]):not([type=file]):not([type=button]):not([disabled]):not([readonly]), select:not([disabled])';
  const ENTER_GUARDAR = '[id$="Ok"], .btn-ent-solido, .btn-pri';
  const visible_ = el => !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length) && !el.closest('[hidden]');
  document.addEventListener('keydown', ev => {
    if (ev.key !== 'Enter' || ev.defaultPrevented || ev.shiftKey || ev.ctrlKey || ev.altKey || ev.isComposing) return;
    const t = ev.target;
    if (!t || !t.matches || !t.matches(ENTER_CAMPOS) || t.id === 'lectorPda' || t.hasAttribute('onkeydown') || t.closest('.pin, #lgPin')) return;
    setTimeout(() => {   // primero lo que haga el campo con su Enter
      if (!document.body.contains(t) || document.activeElement !== t) return;   // ya cambió la pantalla o el foco
      const caja = t.closest('#caja, .modal, section, .card, form, main') || document.body;
      const campos = Array.prototype.filter.call(caja.querySelectorAll(ENTER_CAMPOS), visible_);
      const sig = campos[campos.indexOf(t) + 1];
      if (sig) { sig.focus(); if (sig.select && sig.tagName === 'INPUT') try { sig.select(); } catch (e) {} return; }
      const btn = Array.prototype.filter.call(caja.querySelectorAll(ENTER_GUARDAR), b => b.tagName === 'BUTTON' && !b.disabled && visible_(b))[0];
      if (btn) {   // queda marcado mientras tenga el foco (el lector del PDA no se lo quita)
        btn.classList.add('btn-enter'); btn.focus();
        btn.addEventListener('blur', () => btn.classList.remove('btn-enter'), { once: true });
      }
    }, 0);
  });

  let toastTimer = null;
  function toast(texto, tipo) {
    const t = $('toast');
    t.textContent = texto;
    t.className = 'toast ' + (tipo || '');
    t.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { t.hidden = true; }, 2800);
  }

  // Sonido de la app (al escanear, guardar, avisos): se apaga en Configuración → Ajustes
  const conSonido = () => !(ini && ini.parametros && ini.parametros.sonido === false);
  function pitido() {
    if (!conSonido()) return;
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const o = ctx.createOscillator();
      o.frequency.value = 880;
      o.connect(ctx.destination);
      o.start();
      o.stop(ctx.currentTime + 0.12);
    } catch (e) {}
  }

  // Colores de vencimiento: ROJO si faltan 15 días o menos (o ya venció) · AMARILLO de 16 a 30 días · VERDE más de 30
  const DIAS_ROJO = 15, DIAS_AMARILLO = 30;
  const DIAS_ALERTA = DIAS_ROJO;

  function dias(f) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(f || '')) return null;
    const hoy = new Date(); hoy.setHours(0, 0, 0, 0);
    return Math.round((new Date(f + 'T00:00:00') - hoy) / 86400000);
  }
  function fFecha(f, corto) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(f || '')) return '—';
    const [y, m, d] = f.split('-');
    return `${d} ${MESES[Number(m) - 1]}${corto ? '' : ' ' + y}`;
  }
  function cant(l) {
    const pr = ini && ini.productos.find(x => x.id === l.productoId);
    if (pr && (pr.unidadMedida || '').toUpperCase() === 'KG') return `${+Number(l.unidades).toFixed(2)} kg`;
    const cj = l.undPorCaja > 1 ? ` · ${+(l.unidades / l.undPorCaja).toFixed(2)} cj` : '';
    return `${l.unidades} und${cj}`;
  }
  function estadoDe(lineas) {
    if (!lineas.length) return 'vacio';
    const ds = lineas.map(l => dias(l.vencimiento)).filter(d => d !== null);
    if (ds.some(d => d <= DIAS_ROJO)) return 'vencido';
    if (ds.some(d => d <= DIAS_AMARILLO)) return 'pronto';
    return 'ocupado';
  }
  function tagVence(d, mostrarOk) {
    if (d === null) return '';
    if (d < 0) return '<span class="tag venc">Vencido</span>';
    const txt = d === 0 ? 'Vence hoy' : d === 1 ? 'Vence en 1 día' : 'Vence en ' + d + ' días';
    if (d <= DIAS_ROJO) return `<span class="tag venc">${txt}</span>`;
    if (d <= DIAS_AMARILLO) return `<span class="tag amar">${txt}</span>`;
    return mostrarOk ? '<span class="tag ok">Vigente</span>' : '';
  }
  const fefo = ls => [...ls].sort((a, b) =>
    (a.vencimiento || '9999-99-99').localeCompare(b.vencimiento || '9999-99-99'));
  const etiqueta = e => e.nivel === 0 ? 'Picking ' + e.lado : e.codigo;

  function leyenda() {
    return `<div class="leyenda">${[['vacio','Vacío'],['ocupado','Más de 30 días'],['pronto','16 a 30 días'],['vencido','Menos de 15 días / vencido'],['ocupado multi','Varios productos en el espacio']]
      .map(([c, t]) => `<span><i class="e-${c}"></i>${t}</span>`).join('')}</div>`;
  }
  function btnTema(claro) {
    return `<button class="icono ${claro ? 'icono-claro' : ''}" onclick="cambiarTema()" aria-label="Cambiar entre modo claro y oscuro">${ICONOS.sol}${ICONOS.luna}</button>`;
  }
  const esAncho = () => window.innerWidth >= 1000;

  /* ================= Tema claro / oscuro ================= */
  function aplicarTema(t) { document.documentElement.dataset.tema = t; guardarLS('tema', t); }
  function cambiarTema() { aplicarTema(document.documentElement.dataset.tema === 'oscuro' ? 'claro' : 'oscuro'); }
  aplicarTema(leerLS('tema') || (window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches ? 'oscuro' : 'claro'));

  /* ================= Estado ================= */
  let ini = null;          // operarios, sedes, productos
  let ses = null;          // sesión: perfil, nombre, sedeId
  let sede = null;         // datos de la sede cargada
  let pantalla = 'login';  // login | app
  let vista = 'mapa';      // mapa | config
  let posSel = null;       // { rackId, posicion }
  let espSel = null;       // id del espacio seleccionado
  let busqueda = '';
  let form = null;
  let lg = Object.assign({ perfil: 'OPERARIO', nombre: '', sedeId: '' }, leerLS('sesion') || {});
  const esJefe = () => ses && ses.perfil === 'JEFE';
  // Cómo se llama cada tipo en pantalla (por dentro siguen siendo JEFE y OPERARIO)
  const nombreRol = r => (r === 'JEFE' ? 'Admin' : 'Usuario');
  // Lo que sale arriba al lado del nombre: el perfil con el que entró la persona
  function perfilTxt() {
    if (!ses) return '';
    if (ses.perfilNombre) return ses.perfilNombre;
    if (ses.perfilNombre === null) return puede('superadmin') ? 'Superadministrador' : 'Personalizado';
    return '';
  }
  function cargarMiPerfil() {
    if (!ses || !ses.token) return;
    llamar('bdMiPerfil', ses.token).then(r => {
      const n = (r && r.nombre) || null;
      if (ses && ses.perfilNombre !== n) { ses.perfilNombre = n; if (pantalla === 'app') pintarApp(); }
    }).catch(() => {});
  }
  // Permisos de la persona que entró (los da el administrador en "Usuarios")
  const puede = k => !!(ses && (ses.permisos || []).includes(k));
  // Permisos por módulo y por acción (el administrador los marca uno por uno en "Usuarios")
  const MODULOS = [
    { k: 'plano', t: 'Plano', d: 'Ubicar, mover y sacar producto de la bodega', p: [
      ['ubicar', 'Ubicar rótulos', 'Poner en un lugar lo que llega con rótulo'],
      ['mover', 'Mover producto', 'Cambiar producto de un lugar a otro'],
      ['salida', 'Dar salida', 'Sacar producto de la bodega'],
      ['estructura', 'Estructura de la posición', 'Ver y cambiar la estructura: agregar o quitar niveles y posiciones, y bloquear espacios'],
      ['carga_manual', 'Cargar sin código de barras', 'Registrar a mano lo que ya está en la bodega con su rótulo viejo'],
      ['cm_obligatorio', 'Pedir vencimiento, recibo y lote', 'En «Cargar sin código de barras»: marcado, la fecha de vencimiento, la fecha de recibo y el lote son obligatorios. Sin marcar, se pueden dejar vacíos'],
      ['cargar_aereo', 'Cargar aéreo con Excel', 'Subir un Excel con lo que hay en el aéreo (en el Plano y en el Inventario)'],
      ['ean_plano', 'Agregar o cambiar EAN (Plano)', 'Ponerle el EAN a un producto al escanear, ubicar un rótulo o cargar sin código']] },
    { k: 'inventario', t: 'Inventario', d: 'Conteos de planta contra SAP', p: [
      ['inventario', 'Ver inventario contra SAP', 'La tabla de SAP contra lo que hay en planta'],
      ['inv_contar', 'Registrar conteos', 'Llenar picking, calidad y bloqueado'],
      ['inv_sap', 'Cargar Excel de SAP', 'Subir el reporte de SAP (reemplaza el anterior), crear y cerrar inventarios'],
      ['inv_nombre', 'Cambiar el nombre de un inventario', 'El lápiz al lado de cada inventario'],
      ['ciclico', 'Hacer cíclicos', 'Contar los productos de los cíclicos que le asignen'],
      ['ciclico_asignar', 'Asignar cíclicos', 'Crear cíclicos (a quién y qué productos), cerrarlos y borrarlos'],
      ['ciclico_sap', 'Ver SAP y diferencia de los cíclicos', 'Ver lo de SAP y la diferencia en los cíclicos que creó otra persona'],
      ['ean_inventario', 'Agregar o cambiar EAN (Inventario)', 'Ponerle el EAN a un producto al contar (Ingresar y reconteos)']] },
    { k: 'productos', t: 'Productos', d: 'Catálogo y reportes del inventario', p: [
      ['productos', 'Nuevo producto', 'Agregar productos nuevos al catálogo, uno por uno'],
      ['prod_editar', 'Editar productos', 'Cambiar los datos de los productos en la tabla de «Editar productos»'],
      ['prod_cargar', 'Cargar productos: actualizar', 'Subir el Excel de productos: agrega los nuevos y completa o actualiza los datos'],
      ['prod_reemplazar', 'Cargar productos: reemplazar todo', 'Subir el Excel de productos y dejar solo esos (los que no vienen se desactivan)'],
      ['prod_almacenes', 'Actualizar almacenes', 'Cargar el almacén de cada producto (y los pasillos por sede en el Inventario)'],
      ['deshacer_salida', 'Deshacer una salida', 'Devolver al plano una salida hecha por error'],
      ['bitacora', 'Descargar bitácora', 'Bajar en Excel todo lo que ha pasado con los productos'],
      ['reportes', 'Descargar reportes', 'Inventario, salidas, rotación e historial en Excel']] },
    { k: 'rotular', t: 'Rotular', d: 'Rótulos de las estibas', p: [
      ['rotular', 'Crear e imprimir rótulos', 'Llenar rótulos nuevos e imprimirlos'],
      ['ean_rotular', 'Agregar o cambiar EAN (Rotular)', 'Ponerle el EAN a un producto al llenar el rótulo']] },
    { k: 'recibidor', t: 'Recibir mercancía', d: 'Facturas y lo que llega', p: [
      ['rc_facturas', 'Crear facturas', 'Abrir una factura nueva para recibir'],
      ['rc_lista', 'Cargar lo que debe llegar', 'Copiar la lista de la factura, cambiarla o borrarla'],
      ['recibir', 'Recibir producto', 'Anotar lo que llegó por partes y crear sus rótulos'],
      ['rc_corregir', 'Corregir lo recibido', 'Cambiar lote o novedad, o borrar una línea'],
      ['rc_fotos', 'Fotos de evidencia', 'Tomar y borrar fotos de cada producto'],
      ['rc_cerrar', 'Cerrar facturas', 'Cerrar y volver a abrir una factura'],
      ['ean_recibidor', 'Agregar o cambiar EAN (Recibidor)', 'Ponerle el EAN a un producto al recibir']] },
    { k: 'calidad', t: 'Calidad', d: 'Tabla de lo recibido para Calidad', p: [
      ['calidad', 'Ver Calidad', 'Ver la tabla con todo lo recibido'],
      ['cal_editar', 'Fotos y links', 'Agregar fotos y links desde Calidad'],
      ['cal_excel', 'Descargar Excel', 'Bajar la tabla de Calidad en Excel']] },
    { k: 'inv', t: 'Inventario del recibo', d: 'Pedido contra lo que llegó', p: [
      ['inv_recibo', 'Ver inventario del recibo', 'Lo pedido, lo que llegó y la diferencia'],
      ['inv_excel', 'Descargar Excel', 'Bajar el inventario del recibo en Excel']] },
    { k: 'admin', t: 'Administración', d: 'Plano y seguridad', p: [
      ['config', 'Configuración del plano', 'Zonas y filas'],
      ['usuarios', 'Usuarios y permisos', 'Crear usuarios, asignar PIN y permisos'],
      ['superadmin', 'Superadministrador', 'Entra a todas las regionales, crea regionales y administra los usuarios de cada una. Solo otro superadministrador lo da']] }
  ];
  const PERMISOS = MODULOS.flatMap(m => m.p);
  const PERM_RC = ['rc_facturas', 'rc_lista', 'recibir', 'rc_corregir', 'rc_fotos', 'rc_cerrar'];
  const puedeAlguno = ks => ks.some(puede);
  /* ----- Logo de la empresa: uno para el modo claro y otro para el modo oscuro (si solo hay uno, sale en los dos).
     Sale arriba a la izquierda, en la entrada y en la pestaña del navegador, tal como es (sin fondo).
     Se guarda en el equipo para que salga de una vez (y sin señal). Solo el superadministrador lo cambia. ----- */
  let logoApp = (() => { const x = leerLS('logoApp2'); return x && typeof x === 'object' ? { claro: x.claro || '', oscuro: x.oscuro || '' } : { claro: leerLS('logoApp') || '', oscuro: '' }; })();
  const hayLogo = () => !!(logoApp.claro || logoApp.oscuro);
  function ponerFavicon() {
    const u = logoApp.claro || logoApp.oscuro;
    if (!u) return;
    let l = document.querySelector('link[rel="icon"]');
    if (!l) { l = document.createElement('link'); l.rel = 'icon'; document.head.appendChild(l); }
    l.href = u;
  }
  function cargarLogo() {
    ponerFavicon();
    llamar('bdLogo').then(l => {
      const n = typeof l === 'object' && l ? { claro: l.claro || '', oscuro: l.oscuro || '' } : { claro: l || '', oscuro: '' };
      if (n.claro === logoApp.claro && n.oscuro === logoApp.oscuro) return;
      logoApp = n; guardarLS('logoApp2', n); ponerFavicon();
      if (pantalla === 'app' && ses) pintarApp(); else if (typeof pintar === 'function') pintar();
    }).catch(() => {});
  }
  // Con los dos logos se ponen los dos y el modo (claro u oscuro) decide cuál se ve, sin volver a pintar
  function logoHtml(clase) {
    const c = clase || 'logo-img', L = logoApp;
    if (L.claro && L.oscuro) return `<img class="${c} logo-solo-claro" src="${esc(L.claro)}" alt="Logo de la empresa"><img class="${c} logo-solo-oscuro" src="${esc(L.oscuro)}" alt="Logo de la empresa">`;
    const u = L.claro || L.oscuro;
    return u ? `<img class="${c}" src="${esc(u)}" alt="Logo de la empresa">` : '';
  }

  /* Entregar un archivo hecho en la app (Excel): descargarlo o enviarlo (correo, WhatsApp…) con la ventana de compartir del equipo.
     El correo automático (que la app lo mande sola) queda para cuando la app esté en el servidor nuevo. */
  function entregarArchivo(blob, nombre, titulo) {
    nombre = String(nombre || 'archivo.xlsx').replace(/[\\/:*?"<>|]/g, '-');
    let file = null;
    try { file = new File([blob], nombre, { type: blob.type || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }); } catch (e) { file = null; }
    let compartir = false;
    try { compartir = !!(file && navigator.share && navigator.canShare && navigator.canShare({ files: [file] })); } catch (e) { compartir = false; }
    entregarArchivo.x = { blob, nombre, file };
    abrirModal(`<div class="fila-sb"><span class="h2">${esc(titulo || 'Tu Excel está listo')}</span>${btnCerrar()}</div>
      <span class="small mt8 mono-c" style="overflow-wrap:anywhere">${esc(nombre)}</span>
      <div class="col gap8 mt16">
        <button class="btn btn-pri btn-xl" onclick="bajarArchivo()">Descargar</button>
        ${compartir ? '<button class="btn btn-sec btn-xl" onclick="compartirArchivo()">Enviar por correo, WhatsApp…</button>'
          : '<span class="muted small">En este equipo no se puede enviar directo: descárgalo y adjúntalo al correo.</span>'}
      </div>`);
  }
  function bajarArchivo() {
    const x = entregarArchivo.x; if (!x) return;
    const url = URL.createObjectURL(x.blob), a = document.createElement('a');
    a.href = url; a.download = x.nombre;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
    cerrarModal(); toast('Descarga lista', 'ok');
  }
  function compartirArchivo() {
    const x = entregarArchivo.x; if (!x || !x.file) return;
    navigator.share({ files: [x.file], title: x.nombre, text: x.nombre }).then(() => cerrarModal())
      .catch(e => { if (!e || e.name !== 'AbortError') toast('No se pudo enviar: ' + ((e && e.message) || 'intenta descargarlo'), 'error'); });
  }
  /* Barra de botones por grupos: cada grupo con su color (Cargar, Capturar, Descargar…) y botones pequeños.
     grupos: [{ t: 'Cargar', tono: 'azul' | 'violeta' | 'verde' | 'gris' | 'rojo', b: ['<button…>', …], nota: 'texto pequeño' }] */
  function accionesHtml(grupos) {
    const gs = grupos.map(g => Object.assign({}, g, { b: (g.b || []).filter(Boolean) })).filter(g => g.b.length);
    if (!gs.length) return '';
    const barra = `<div class="acc-barra">${gs.map(g => `<div class="acc-grupo acc-${g.tono || 'gris'}" role="group" aria-label="${esc(g.t)}">
      <span class="acc-t">${esc(g.t)}</span><div class="acc-b">${g.b.join('')}</div>${g.nota ? `<span class="acc-nota">${g.nota}</span>` : ''}</div>`).join('')}</div>`;
    // En celular y pistola van plegadas para no ocupar la pantalla: se abren al tocar «Acciones»
    if (typeof pantallaTactil === 'function' && pantallaTactil() && gs.length > 1)
      return `<details class="acc-det" ${accionesHtml.abierto ? 'open' : ''} ontoggle="accionesHtml.abierto = this.open"><summary><span>Acciones</span><span class="muted small">${gs.map(g => esc(g.t)).join(' · ')}</span></summary>${barra}</details>`;
    return barra;
  }
  // Un botón de la barra: texto, acción y si es el principal del grupo
  const accBtn = (txt, onclick, pri, extra) => `<button type="button" class="btn-acc${pri ? ' acc-pri' : ''}" onclick="${onclick}" ${extra || ''}>${txt}</button>`;
  // Agregar o cambiar el EAN de un producto: un permiso en cada módulo donde se puede hacer
  const puedeEan = mod => puede('ean_' + (mod || 'plano'));
  const PERM_OPERARIO = ['ubicar', 'mover', 'salida', 'rotular', 'recibir', 'rc_fotos', 'inventario', 'inv_contar', 'ciclico'];
  function sinPermiso(k) {
    if (puede(k)) return false;
    const x = PERMISOS.find(p => p[0] === k);
    toast(`No tienes permiso para: ${x ? x[1] : k}. Pídeselo al administrador.`, 'error');
    return true;
  }

  function setSede(d) {
    sede = d;
    // El servidor manda los espacios compactos: [rackId, posicion, nivel, lado]
    d.espacios = d.espacios.map(([rackId, posicion, nivel, lado]) => {
      const codigo = (nivel === 0 ? 'PK' : nivel) + lado;
      return { id: `${rackId}-P${pad3(posicion)}-${codigo}`, rackId, posicion, nivel, lado, codigo };
    });
    sede.porUbic = {};
    sede.espPorPos = {};
    sede.espPorId = {};
    sede.rackPorId = {};
    sede.zonaPorId = {};
    sede.bloqueos = d.bloqueos || {};
    d.lineas.forEach(l => (sede.porUbic[l.ubicacionId] = sede.porUbic[l.ubicacionId] || []).push(l));
    d.espacios.forEach(e => {
      sede.espPorId[e.id] = e;
      const k = e.rackId + '|' + e.posicion;
      (sede.espPorPos[k] = sede.espPorPos[k] || []).push(e);
    });
    d.racks.forEach(r => (sede.rackPorId[r.id] = r));
    d.zonas.forEach(z => (sede.zonaPorId[z.id] = z));
    // Pasillos armados en el editor del plano: cada fila sabe a qué pasillo pertenece
    sede.pasillos = d.pasillos || [];
    sede.pasilloDeRack = {};
    sede.pasillos.forEach(pa => pa.filas.forEach(id => (sede.pasilloDeRack[id] = pa)));
    if (posSel && !sede.rackPorId[posSel.rackId]) { posSel = null; espSel = null; }
    if (espSel && !sede.espPorId[espSel]) espSel = null;
  }
  const lineasDe = id => (sede.porUbic[id] || []);
  const espaciosDe = (rackId, p) => (sede.espPorPos[rackId + '|' + p] || []);
  const nombreSede = id => { const s = (ini.sedesTodas || ini.sedes).find(x => x.id === id); return s ? s.nombre : id; };
  // Regional (ciudad) escogida antes de entrar: arriba solo se ven las sedes de esa regional
  const regionalAct = () => (window.regionalActual ? window.regionalActual() : '');
  const hayRegionales = () => !!(ini.regionales && ini.regionales.length);
  const nombreRegional = id => { const r = (ini.regionales || []).find(x => x.id === (id || regionalAct())); return r ? r.nombre : ''; };
  function aplicarRegional() {
    if (!ini.sedesTodas) ini.sedesTodas = ini.sedes;
    const r = regionalAct();
    // Antes del script 42 las sedes no tienen regional: se ven todas
    ini.sedes = hayRegionales() && ini.sedesTodas.some(s => s.regionalId) ? ini.sedesTodas.filter(s => s.regionalId === r) : ini.sedesTodas;
    if (!ini.sedes.some(s => s.id === lg.sedeId)) lg.sedeId = ini.sedes[0] ? ini.sedes[0].id : '';
  }
  function cambiarRegional(id) {
    if (window.ponerRegional) window.ponerRegional(id);
    aplicarRegional();
    guardarLS('sesion', { perfil: lg.perfil, nombre: lg.nombre, sedeId: lg.sedeId });
    pinError = ''; pintarPin();
  }
  const coincide = id => {
    const q = busqueda.trim().toLowerCase();
    return !q || lineasDe(id).some(l => (l.nombre + ' ' + l.productoId + ' ' + l.lote).toLowerCase().includes(q));
  };

  /* ----- Fechas: se pueden escribir (dd/mm/aaaa) o elegir en el calendario ----- */
  const ICONO_CAL = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/></svg>';
  const isoATexto = iso => /^\d{4}-\d{2}-\d{2}$/.test(iso || '') ? iso.split('-').reverse().join('/') : '';
  function textoAIso(t) {
    const m = /^(\d{1,2})\/(\d{1,2})\/(\d{2}|\d{4})$/.exec(String(t || '').trim());
    if (!m) return '';
    const d = +m[1], mes = +m[2], a = m[3].length === 2 ? 2000 + +m[3] : +m[3];
    const f = new Date(a, mes - 1, d);
    if (f.getFullYear() !== a || f.getMonth() !== mes - 1 || f.getDate() !== d || a < 2000 || a > 2100) return '';
    return `${a}-${String(mes).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  }
  function mejorarFechas() {
    document.querySelectorAll('input[type="date"]:not([data-fecha])').forEach(d => {
      d.dataset.fecha = '1';
      const caja = document.createElement('div');
      caja.className = 'fecha-caja';
      const t = document.createElement('input');
      t.type = 'text'; t.className = d.className + ' fecha-txt'; t.inputMode = 'numeric';
      t.placeholder = 'dd/mm/aaaa'; t.autocomplete = 'off'; t.maxLength = 10;
      if (d.id) {
        t.id = d.id + 'Txt';
        const lab = document.querySelector(`label[for="${d.id}"]`);
        if (lab) lab.htmlFor = t.id;
      }
      const cal = document.createElement('span');
      cal.className = 'fecha-cal';
      cal.innerHTML = `<button type="button" class="btn btn-sec" tabindex="-1" aria-hidden="true">${ICONO_CAL}</button>`;
      d.parentNode.insertBefore(caja, d);
      caja.append(t, cal);
      cal.append(d);                           // el calendario de verdad queda encima del botón (invisible)
      d.classList.add('fecha-nativa');
      d.setAttribute('aria-label', 'Abrir calendario');
      t.value = isoATexto(d.value); t.defaultValue = t.value;
      const avisar = cambio => {
        d.dispatchEvent(new Event('input', { bubbles: true }));
        if (cambio) d.dispatchEvent(new Event('change', { bubbles: true }));
      };
      t.addEventListener('input', ev => {
        const borrando = ev.inputType && ev.inputType.startsWith('delete');
        if (borrando) t.value = t.value.replace(/\/$/, '');
        else {
          const v = t.value.replace(/\D/g, '').slice(0, 8);
          t.value = v.slice(0, 2) + (v.length > 2 ? '/' + v.slice(2, 4) : '') + (v.length > 4 ? '/' + v.slice(4) : '');
        }
        const iso = textoAIso(t.value), antes = d.value;
        d.value = iso;
        t.classList.toggle('fecha-mal', t.value.replace(/\D/g, '').length >= 8 && !iso);
        avisar(iso !== antes && (iso || !t.value));
      });
      t.addEventListener('blur', () => {
        // Año de 2 números: 12/02/27 → 12/02/2027
        const iso = textoAIso(t.value);
        if (iso) { t.value = isoATexto(iso); t.classList.remove('fecha-mal'); }
        else if (t.value) t.classList.add('fecha-mal');
        if (d.value !== iso) { d.value = iso; avisar(true); }
      });
      d.addEventListener('click', () => { try { d.showPicker(); } catch (e) { /* el navegador lo abre solo */ } });
      d.addEventListener('change', () => { if (document.activeElement !== t) { t.value = isoATexto(d.value); t.classList.remove('fecha-mal'); } });
      d.addEventListener('input', () => { if (document.activeElement !== t) t.value = isoATexto(d.value); });
    });
  }
  new MutationObserver(() => mejorarFechas()).observe(document.body, { childList: true, subtree: true });

  function pintar() {
    if (pantalla === 'login') pintarLogin();
    else pintarApp();
  }/* ================= Inicio ================= */
  $('fotoCodigo').addEventListener('change', ev => {
    const f = ev.target.files[0];
    ev.target.value = ''; // permite tomar otra foto igual después
    leerFoto(f);
  });
  llamar('bdInicio')
    .then(d => {
      ini = d;
      ini.regionales = d.regionales || [];
      ini.sedesTodas = d.sedes;
      if (hayRegionales() && !ini.regionales.some(r => r.id === regionalAct()) && window.ponerRegional) window.ponerRegional(ini.regionales.length === 1 ? ini.regionales[0].id : '');
      aplicarRegional();
      $('dlProductos').innerHTML = d.productos.map(p => `<option value="${esc(p.id + ' · ' + p.nombre)}">`).join('');
      cargarLogo();
      const tok = leerLS('token');
      if (!tok) return pintar();
      $('app').innerHTML = '<div class="cargando" style="padding:40px">Entrando…</div>';
      llamar('bdSesion', tok)
        .then(r => { if (r && r.ok) return iniciarSesion(r); if (r && r.error) pinError = r.error; quitarToken(); pintar(); })
        .catch(() => pintar());
    })
    .catch(e => { $('app').innerHTML = `<div class="wrap"><p class="error">No se pudo cargar: ${esc(e.message)}</p></div>`; });

  /* ================= Pantalla de ingreso ================= */
  // Regional: un botón con la ciudad y su código; al tocarlo sale la lista para escoger
  const ICONO_PIN = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/></svg>';
  function regSelHtml() {
    const r = (ini.regionales || []).find(x => x.id === regionalAct());
    return `<span class="reg-ico">${ICONO_PIN}</span>
      <span class="reg-txt"><b>${r ? esc(r.nombre) : 'Escoge tu regional'}</b><small>${r ? (r.codigo ? 'Regional ' + esc(r.codigo) : 'Regional') : 'Toca para escoger la ciudad'}</small></span>
      <span class="reg-cambiar">${r ? 'Cambiar' : ''} ▾</span>`;
  }
  function elegirRegionalLogin() {
    const act = regionalAct();
    abrirModal(`<div class="fila-sb"><span class="h2">Escoge tu regional</span>${btnCerrar()}</div>
      <span class="muted small mt8">Adentro solo verás las sedes, la gente y los productos de la regional que escojas.</span>
      <div class="reg-lista mt12" role="listbox" aria-label="Regionales">${(ini.regionales || []).map(r => `
        <button type="button" role="option" aria-selected="${r.id === act}" class="reg-op ${r.id === act ? 'on' : ''}" onclick="escogerRegionalLogin('${esc(r.id)}')">
          <span class="reg-ico">${ICONO_PIN}</span>
          <span class="reg-txt"><b>${esc(r.nombre)}</b><small>${r.codigo ? 'Regional ' + esc(r.codigo) : '&nbsp;'}</small></span>
          ${r.id === act ? `<span class="reg-ok">${ICONOS.check}</span>` : ''}</button>`).join('')}</div>`);
  }
  function escogerRegionalLogin(id) {
    cambiarRegional(id);
    cerrarModal();
    if ($('lgReg')) { $('lgReg').innerHTML = regSelHtml(); }
    const c = $('lgCed'); if (c && !c.value && !('ontouchstart' in window)) c.focus();
  }
  function pintarLogin() {
    aplicarRegional();
    const reg = regionalAct();
    $('app').innerHTML = `
    <div class="login"><div class="login-caja login-simple">
      ${hayLogo() ? `<div class="login-logo-fila"><span></span><div class="logo-entrada">${logoHtml('logo-img')}</div>${btnTema(true)}</div>`
        : `<div class="fila-sb"><div class="logo">${ICONOS.casa}</div>${btnTema(true)}</div>`}
      <div class="col gap4"><h1 class="h1">Bodega</h1><span class="muted">${hayRegionales() ? 'Escoge la regional y entra con tu cédula y tu PIN' : 'Entra con tu cédula y tu PIN'}</span></div>
      ${hayRegionales() ? `<div>
        <span class="lbl">Regional ${ayudaHtml('Es la ciudad a la que te conectas. Adentro, arriba, solo verás las sedes de esta regional. Este equipo recuerda la última que escogiste.')}</span>
        <button type="button" id="lgReg" class="reg-sel" onclick="elegirRegionalLogin()" aria-haspopup="dialog">${regSelHtml()}</button></div>` : ''}

      <div class="ced-caja">
        <label class="lbl" for="lgCed">Cédula</label>
        <input id="lgCed" class="campo campo-grande" inputmode="numeric" autocomplete="off" spellcheck="false" placeholder="Número de cédula" maxlength="15"
          role="combobox" aria-autocomplete="list" aria-controls="cedSug" aria-expanded="false">
        <div id="cedSug" class="ced-sug" role="listbox" hidden></div>
        <span id="cedHola" class="small txt-verde"></span>
      </div>

      <div>
        <span class="lbl" id="pinTit">PIN</span>
        <div id="pinCaja"></div>
      </div>

      <button id="btnEntrar" class="btn btn-pri btn-xl" onclick="entrar()">Entrar</button>
      <span class="muted small centro">Tu sesión queda abierta en este equipo hasta que toques "Salir". La sede la cambias adentro.</span>
    </div></div>`;
    const c = $('lgCed');
    c.addEventListener('input', () => { c.value = c.value.replace(/\D/g, ''); pinError = ''; pintarSugCed(); });
    c.addEventListener('focus', pintarSugCed);
    c.addEventListener('blur', () => setTimeout(() => { if ($('cedSug')) { $('cedSug').hidden = true; c.setAttribute('aria-expanded', 'false'); } }, 180));
    c.addEventListener('keydown', ev => {
      if (ev.key === 'Enter') { ev.preventDefault(); const f = document.querySelector('#lgPin .pin-c'); if (f) f.focus(); }
      if (ev.key === 'Escape') $('cedSug').hidden = true;
    });
    pintarPin();
    if (!('ontouchstart' in window)) c.focus();
  }


  /* ----- Cédulas que ya entraron en este equipo (sugerencias al escribir) ----- */
  // Solo se recuerdan en este equipo las personas que ya entraron aquí: la lista completa nunca se muestra.
  const cedulasEquipo = () => { const l = leerLS('cedulasEquipo'); return Array.isArray(l) ? l : []; };
  function recordarCedula(cedula, nombre) {
    if (!cedula) return;
    const l = cedulasEquipo().filter(x => x.cedula !== cedula);
    l.unshift({ cedula, nombre });
    guardarLS('cedulasEquipo', l.slice(0, 15));
  }
  function olvidarCedula(cedula) {
    guardarLS('cedulasEquipo', cedulasEquipo().filter(x => x.cedula !== cedula));
    pintarSugCed();
  }
  function pintarSugCed() {
    const c = $('lgCed'), box = $('cedSug');
    if (!c || !box) return;
    const q = c.value.trim();
    const l = cedulasEquipo().filter(x => !q || x.cedula.startsWith(q) || sinTilde(x.nombre).includes(sinTilde(q)));
    const exacto = cedulasEquipo().find(x => x.cedula === q);
    $('cedHola').textContent = exacto ? `Hola, ${exacto.nombre}` : '';
    const ver = l.length && !(exacto && l.length === 1);
    box.hidden = !ver;
    c.setAttribute('aria-expanded', ver ? 'true' : 'false');
    if (!ver) return;
    box.innerHTML = l.map(x => `<div class="ced-op" role="option">
        <button type="button" onmousedown="event.preventDefault()" onclick="elegirCedula('${esc(x.cedula)}')"><b>${esc(x.nombre)}</b><span class="muted small">${esc(x.cedula)}</span></button>
        <button type="button" class="ced-quitar" onmousedown="event.preventDefault()" onclick="olvidarCedula('${esc(x.cedula)}')" aria-label="Quitar de este equipo">${ICONOS.cerrar}</button>
      </div>`).join('');
  }
  function elegirCedula(cedula) {
    $('lgCed').value = cedula;
    $('cedSug').hidden = true;
    pintarSugCed();
    const f = document.querySelector('#lgPin .pin-c');
    if (f) f.focus();
  }

  /* ----- PIN de 4 números: cuatro cuadritos que se llenan con el teclado del celular o del PC ----- */
  let pinTxt = '', pinPrimero = null, pinError = '';

  // Cuatro cuadritos; al escribir pasa solo al siguiente. alCompletar se llama con los 4 números.
  function pinCajas(id) {
    return `<div class="pin-cajas" id="${id}" role="group" aria-label="PIN de 4 números">${[0, 1, 2, 3].map(i =>
      `<input class="pin-c" data-i="${i}" type="text" inputmode="numeric" pattern="[0-9]*" maxlength="1" autocomplete="off"
        autocorrect="off" spellcheck="false" aria-label="Número ${i + 1} del PIN">`).join('')}</div>`;
  }
  const pinValor = id => [...document.querySelectorAll(`#${id} .pin-c`)].map(c => c.value).join('');
  function pinLimpiar(id, enfocar) {
    const cs = [...document.querySelectorAll(`#${id} .pin-c`)];
    cs.forEach(c => (c.value = ''));
    if (enfocar && cs[0]) cs[0].focus();
  }
  function pinPoner(id, txt) {
    const cs = [...document.querySelectorAll(`#${id} .pin-c`)];
    cs.forEach((c, i) => (c.value = txt[i] || ''));
  }
  function enlazarPin(id, alCompletar) {
    const cs = [...document.querySelectorAll(`#${id} .pin-c`)];
    cs.forEach((c, i) => {
      c.addEventListener('input', () => {
        const d = c.value.replace(/\D/g, '');
        if (d.length > 1) { // pegaron o el celular escribió varios de una
          pinPoner(id, (pinValor(id).slice(0, i) + d).slice(0, 4));
          const k = Math.min(3, i + d.length); cs[k].focus();
        } else {
          c.value = d;
          if (d && cs[i + 1]) cs[i + 1].focus();
        }
        $(id).classList.remove('pin-mal');
        if (pinValor(id).length === 4 && alCompletar) alCompletar(pinValor(id));
      });
      c.addEventListener('keydown', ev => {
        if (ev.key === 'Backspace' && !c.value && cs[i - 1]) { cs[i - 1].value = ''; cs[i - 1].focus(); ev.preventDefault(); }
        else if (ev.key === 'ArrowLeft' && cs[i - 1]) cs[i - 1].focus();
        else if (ev.key === 'ArrowRight' && cs[i + 1]) cs[i + 1].focus();
        else if (ev.key === 'Enter' && alCompletar) { ev.preventDefault(); alCompletar(pinValor(id)); }
      });
      c.addEventListener('focus', () => c.select());
    });
  }

  function pintarPin() {
    const c = $('pinCaja');
    if (!c) return;
    $('pinTit').textContent = pinPrimero ? 'Confirma tu PIN nuevo' : 'PIN';
    c.innerHTML = `${pinCajas('lgPin')}
      ${pinError ? `<p class="error mt8">${esc(pinError)}</p>` : pinPrimero !== null
        ? '<p class="muted small mt8">Eres el primer administrador. Escribe el mismo PIN otra vez para confirmarlo.</p>'
        : '<p class="muted small mt8">Escribe tus 4 números.</p>'}`;
    if (pinError) $('lgPin').classList.add('pin-mal');
    enlazarPin('lgPin', v => { pinTxt = v; pinError = ''; setTimeout(entrar, 80); });
    if ((pinError || pinPrimero !== null) && $('lgCed') && $('lgCed').value) {
      const f = document.querySelector('#lgPin .pin-c'); if (f) f.focus({ preventScroll: true });
    }
  }

  let entrando = false;
  function entrar() {
    const cedula = ($('lgCed').value || '').replace(/\D/g, '');
    if ($('lgPin')) pinTxt = pinValor('lgPin');
    if (cedula.length < 5) { pinError = 'Escribe tu número de cédula'; pintarPin(); return $('lgCed').focus(); }
    if (hayRegionales() && !regionalAct()) { pinError = 'Escoge la regional a la que te vas a conectar'; pintarPin(); return $('lgReg') && $('lgReg').focus(); }
    if (!lg.sedeId && !hayRegionales()) return toast('No hay sedes creadas', 'error');
    if (pinTxt.length !== 4) { pinError = 'Escribe tu PIN de 4 números'; return pintarPin(); }
    if (entrando) return;
    // Primera vez del sistema: el PIN se escribe dos veces
    if (pinPrimero) {
      if (pinPrimero !== pinTxt) { pinPrimero = null; pinTxt = ''; pinError = 'Los dos PIN no son iguales. Empieza otra vez.'; return pintarPin(); }
    }
    entrando = true;
    const b = $('btnEntrar'); b.disabled = true; b.textContent = 'Entrando…';
    llamar('bdLogin', { cedula, pin: pinTxt, sedeId: lg.sedeId || null, regionalId: regionalAct(), confirmar: !!pinPrimero })
      .then(r => {
        entrando = false;
        if (r.primerPin) { pinPrimero = pinTxt; pinTxt = ''; b.disabled = false; b.textContent = 'Entrar'; return pintarPin(); }
        if (!r.ok) { pinTxt = ''; pinError = r.error || 'No se pudo entrar'; b.disabled = false; b.textContent = 'Entrar'; return pintarPin(); }
        pinTxt = ''; pinPrimero = null;
        recordarCedula(cedula, r.nombre);
        iniciarSesion(r);
      })
      .catch(e => { entrando = false; pinTxt = ''; pinError = e.message; b.disabled = false; b.textContent = 'Entrar'; pintarPin(); });
  }

  // Sesión lista (al entrar con PIN o al recargar con el token guardado)
  function iniciarSesion(r) {
    guardarLS('token', r.token);
    aplicarRegional();
    ses = { nombre: r.nombre, perfil: r.rol, sedeId: lg.sedeId, permisos: r.permisos || [], token: r.token, id: r.id, regionalId: regionalAct() };
    cargarMiPerfil();   // el nombre del perfil, para mostrarlo arriba
    lg.perfil = r.rol; lg.nombre = r.nombre;
    guardarLS('sesion', { perfil: lg.perfil, nombre: lg.nombre, sedeId: lg.sedeId });
    posSel = null; espSel = null; busqueda = ''; vista = 'mapa';
    cargarProdRegional();
    // Regional sin sedes todavía: se entra igual (para crearlas en Configuración → Sedes)
    if (!ses.sedeId) { sede = null; pantalla = 'app'; pintar(); iniciarVivo(); return Promise.resolve(); }
    return llamar('bdSede', ses.sedeId)
      .then(d => { setSede(d); pantalla = 'app'; pintar(); iniciarVivo(); })
      .catch(e => { toast(e.message, 'error'); ses = null; pantalla = 'login'; pintar(); });
  }

  function quitarToken() { try { localStorage.removeItem('token'); } catch (e) {} }

  function salir() {
    if (ses && ses.token) llamar('bdSalir', ses.token).catch(() => {});
    quitarToken();
    ses = null; pantalla = 'login'; sede = null; ubicando = null; moviendo = null; pinTxt = ''; pinError = '';
    pintar();
  }

  // Se revisa que la sesión siga activa y con los mismos permisos: al cambiar un usuario o perfil (en vivo),
  // al volver a la app y, por si no hay conexión en vivo, cada minuto
  function revisarSesion() {
    if (pantalla !== 'app' || !ses || !ses.token) return;
    llamar('bdSesion', ses.token).then(r => {
      if (!r || !r.ok) { toast((r && r.error) || 'Tu sesión terminó. Vuelve a entrar con tu PIN.', 'error'); return salir(); }
      const antes = (ses.permisos || []).join();
      ses.permisos = r.permisos || []; ses.perfil = r.rol; ses.nombre = r.nombre;
      cargarMiPerfil();
      if (antes !== ses.permisos.join() && $('modal').hidden) pintarApp();
    }).catch(() => {});
  }
  document.addEventListener('visibilitychange', () => { if (!document.hidden) revisarSesion(); });
  setInterval(() => { if (!document.hidden) revisarSesion(); }, 60 * 1000);

  function elegirSede() {
    abrirModal(`<div class="fila-sb"><span class="h2">Cambiar de sede</span>${btnCerrar()}</div>
      <div class="col gap10 mt12">${ini.sedes.map(s => `<button class="sede-btn ${s.id === ses.sedeId ? 'on' : ''}"
        onclick="cerrarModal(); lg.sedeId='${esc(s.id)}'; guardarLS('sesion', { perfil: lg.perfil, nombre: lg.nombre, sedeId: lg.sedeId }); verSede('${esc(s.id)}')">
        <span>${esc(s.nombre)}</span>${s.id === ses.sedeId ? `<span style="color:var(--pri)">${ICONOS.check}</span>` : ''}</button>`).join('')}</div>`);
  }/* ================= Pantalla principal ================= */
  let anchoPrevio = esAncho();

  let vistaPintada = null;
  function pintarApp() {
    sugCerrar();   // la lista desplegable de productos no se queda flotando al cambiar la pantalla
    anchoPrevio = esAncho();
    // Al volver a pintar la misma pantalla se queda donde estaba (antes saltaba hacia arriba)
    const misma = vistaPintada === vista;
    const y = window.scrollY;
    const internos = misma ? ['.col-panel', '.plano-wrap', '#invTabla .tabla-wrap'].map(sel => { const el = document.querySelector(sel); return el ? [sel, el.scrollTop, el.scrollLeft] : null; }).filter(Boolean) : [];
    const encabezado = `
    <header class="top">
      ${hayLogo() ? `<span class="logo-top">${logoHtml('logo-img')}</span>` : ''}
      <div class="col flex1">${ini.sedes.length > 1
          ? `<button class="t1 sede-top" onclick="elegirSede()" aria-label="Cambiar de sede">${esc(nombreSede(ses.sedeId))} <span aria-hidden="true">▾</span></button>`
          : `<span class="t1">${ses.sedeId ? esc(nombreSede(ses.sedeId)) : 'Sin sedes'}</span>`}
        <span class="t2">${esc(ses.nombre)}${perfilTxt() ? ' · ' + esc(perfilTxt()) : ''}${nombreRegional() ? ' · ' + esc(nombreRegional()) : ''}</span></div>
      <nav class="nav" aria-label="Secciones">
        <button class="${vista === 'mapa' ? 'on' : ''}" onclick="irVista('mapa')">Plano</button>
        <button class="${vista === 'productos' ? 'on' : ''}" onclick="irVista('productos')">Productos</button>
        ${puedeAlguno(PERM_RC) || puede('calidad') || puede('inv_recibo') ? `<button class="${vista === 'recibidor' ? 'on' : ''}" onclick="irVista('recibidor')">Recibidor</button>` : ''}
        ${puede('rotular') ? `<button class="${vista === 'rotulo' ? 'on' : ''}" onclick="irVista('rotulo')">Rotular</button>` : ''}
        ${puede('config') ? `<button class="${vista === 'config' ? 'on' : ''}" onclick="irVista('config')">Configuración</button>` : ''}
        ${puede('usuarios') ? `<button class="${vista === 'usuarios' ? 'on' : ''}" onclick="irVista('usuarios')">Usuarios</button>` : ''}
      </nav>
      <div class="fila gap8"><span id="chipSenal">${chipSenalHtml()}</span>${btnTema()}<button class="btn-top" onclick="salir()">Salir</button></div>
    </header>`;

    let cuerpo;
    if (!vistaPermitida(vista)) vista = 'mapa';
    if (!ses.sedeId && vista !== 'usuarios') {
      cuerpo = `<main class="wrap wrap-ancho">${vistaSinSedes()}</main>`;
    } else if (vista === 'usuarios') {
      cuerpo = `<main class="wrap wrap-ancho">${vistaUsuarios()}</main>`;
    } else if (vista === 'config') {
      cuerpo = `<main class="wrap wrap-ancho">${vistaConfig()}</main>`;
    } else if (vista === 'productos') {
      cuerpo = `<main class="wrap wrap-ancho">${vistaProductos()}</main>`;
    } else if (vista === 'recibidor') {
      cuerpo = `<main class="wrap ${rcTab !== 'recibir' ? 'wrap-ancho' : ''}">${vistaRecibidor()}</main>`;
    } else if (vista === 'rotulo') {
      cuerpo = `<main class="wrap wrap-ancho">${vistaRotulo()}</main>`;
    } else if (esAncho()) {
      cuerpo = `<main class="wrap wrap-ancho">${barraEscaneo()}
        <div class="dos-col mt12"><div class="col-mapa">${vistaMapa()}</div>
        <aside class="col-panel" aria-label="Posición seleccionada">${vistaPosicion(false)}</aside></div></main>`;
    } else {
      cuerpo = `<main class="wrap">${barraEscaneo()}<div class="mt12">${posSel ? vistaPosicion(true) : vistaMapa()}</div></main>`;
    }
    $('app').innerHTML = encabezado + cuerpo.replace('<main class="wrap', '<main data-x class="wrap').replace(/(<main data-x[^>]*>)/, '$1' + (vista === 'mapa' ? avisoMoviendo() + avisoUbicando() + avisoSeguir() : ''));
    enlazarEventos();
    enlazarRotulo();
    if (vista === 'rotulo' && rtVista === 'conteo') enlazarConteoRot();
    enlazarRecibidor();
    enlazarCalidad();
    enlazarUsuarios();
    if (sede) enlazarInventario();
    if (vista === 'config' && cfgTab === 'editor' && sede) enlazarEditor();
    if (sede) ajustarPlano();
    dibujarCodigos($('app'));
    if (misma) {
      internos.forEach(([sel, t, l]) => { const el = document.querySelector(sel); if (el) { el.scrollTop = t; el.scrollLeft = l; } });
      if (Math.abs(window.scrollY - y) > 1) window.scrollTo(0, y);
    } else window.scrollTo(0, 0);
    vistaPintada = vista;
  }

  // Dos accesos: PRODUCTO (escanear o buscar en la lista) y LUGAR (escanear o elegir zona, fila, posición, nivel y lado)
  // En celular y pistola siempre sale. En el computador sale solo si se prende el switch «Producto y Lugar» del Plano
  // (se recuerda en el equipo), para que el plano tenga más espacio.
  const verEscanearPC = () => pantallaTactil() || leerLS('verEscanearPC') === true;
  function ponerEscanearPC(v) { guardarLS('verEscanearPC', !!v); pintarApp(); }
  function barraEscaneo() {
    if (!verEscanearPC()) return '';
    const cam = true;
    return `<div class="barra-dos">
      <div class="acceso">
        <span class="acceso-t">Producto</span>
        <div class="acceso-b">
          ${cam ? botonCamara('scanProd', 'btn btn-pri btn-acceso', 'Escanear') : ''}
          <button class="btn btn-sec btn-acceso" onclick="abrirBuscarProducto()">${ICONOS.lupa}<span>Buscar</span></button>
        </div>
      </div>
      <div class="acceso">
        <span class="acceso-t">Lugar</span>
        <div class="acceso-b">
          ${cam ? botonCamara('scanLugar', 'btn btn-pri btn-acceso', 'Escanear') : ''}
          <button class="btn btn-sec btn-acceso" onclick="abrirLugar()">${ICONOS.lugar}<span>Elegir</span></button>
        </div>
      </div>
    </div>`;
  }

  /* ----- Buscar producto: la lista sale de una vez y se filtra mientras escribes ----- */
  const sinTilde = t => String(t || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase();
  let bpTotales = {};

  function abrirBuscarProducto(texto) {
    bpTotales = {};
    sede.lineas.forEach(l => {
      const t = bpTotales[l.productoId] || (bpTotales[l.productoId] = { und: 0, lugares: 0 });
      t.und += l.unidades; t.lugares++;
    });
    abrirModal(`
      <div class="fila-sb"><span class="h2">Buscar producto</span>${btnCerrar()}</div>
      <div class="mt12">${campoConCamara(`<input id="bpQ" class="campo" autocomplete="off" spellcheck="false"
        placeholder="Código AFS, Nutresa, barras o nombre" value="${esc(texto || '')}">`, 'bpQ')}</div>
      <label class="fila gap8 mt12 small" style="cursor:pointer"><input type="checkbox" id="bpSolo"> Solo los que están en esta sede</label>
      <div id="bpLista" class="lista-bp mt12" role="list"></div>`);
    const q = $('bpQ');
    q.addEventListener('input', pintarListaProd);
    q.addEventListener('keydown', ev => {
      if (ev.key !== 'Enter') return;
      ev.preventDefault();
      const exacto = buscarProducto(q.value);
      if (exacto) elegirProducto(exacto.id);
      else if (/^E\d{4,}$/i.test(q.value.trim())) { cerrarModal(); buscarCodigo(q.value); }
      else { const primero = $('bpLista').querySelector('button'); if (primero) primero.click(); }
    });
    $('bpSolo').addEventListener('change', pintarListaProd);
    pintarListaProd();
    if (!('ontouchstart' in window)) q.focus();
  }

  function pintarListaProd() {
    const q = sinTilde($('bpQ').value.trim());
    const palabras = q.split(/\s+/).filter(Boolean);
    const solo = $('bpSolo').checked;
    let lista = ini.productos.filter(p => {
      if (solo && !bpTotales[p.id]) return false;
      if (!bpTotales[p.id] && !prodDeMiRegional(p)) return false;   // de otra regional (y no está en esta bodega)
      if (!palabras.length) return true;
      const t = sinTilde(p.id + ' ' + p.codigoNutresa + ' ' + p.codigoBarras + ' ' + p.nombre);
      return palabras.every(w => t.includes(w));
    });
    // Primero los que coinciden exacto con el código y los que están en bodega
    lista.sort((a, b) => (b.id === q) - (a.id === q) || (!!bpTotales[b.id]) - (!!bpTotales[a.id]) || a.nombre.localeCompare(b.nombre));
    const total = lista.length;
    lista = lista.slice(0, 80);
    $('bpLista').innerHTML = (total ? `<span class="muted small">${total} producto${total === 1 ? '' : 's'}${total > 80 ? ' · sigue escribiendo para ver menos' : ''}</span>` : '')
      + (lista.length ? lista.map(p => {
        const t = bpTotales[p.id];
        return `<button class="bp-item" role="listitem" onclick="elegirProducto('${esc(p.id)}')">
          <span class="chip">${esc(p.id)}</span>
          <span class="col flex1 gap4" style="min-width:0"><span class="nombre">${esc(p.nombre)}</span>
            <span class="muted small">Nutresa ${esc(p.codigoNutresa || '—')} · ${p.undPorCaja} und/cj</span></span>
          ${t ? `<span class="tag ok">${t.lugares} lugar${t.lugares === 1 ? '' : 'es'}</span>` : '<span class="muted small">No está</span>'}
        </button>`;
      }).join('') : '<p class="muted">No hay productos con ese código o nombre.</p>');
  }

  function elegirProducto(id) {
    cerrarModal();
    abrirFicha(id);
  }

  /* ----- Elegir lugar: se escoge zona, fila, posición, nivel y lado; el código se arma solo ----- */
  let lugar = { zona: '', rack: '', pos: 0, nivel: null, lado: '' };

  function abrirLugar() {
    lugarCtx = null;
    if (posSel && sede.rackPorId[posSel.rackId]) {
      const r = sede.rackPorId[posSel.rackId];
      lugar = { zona: r.zonaId, rack: r.id, pos: posSel.posicion, nivel: null, lado: '' };
    } else if (!sede.zonaPorId[lugar.zona]) {
      lugar = { zona: '', rack: '', pos: 0, nivel: null, lado: '' };
    }
    abrirModal('<div id="lugarCaja"></div>');
    pintarLugar();
  }

  function codigoLugar() {
    if (!lugar.rack || !lugar.pos) return '';
    let c = `${lugar.rack}-P${pad3(lugar.pos)}`;
    if (lugar.nivel !== null && lugar.lado) c += '-' + (lugar.nivel === 0 ? 'PK' : lugar.nivel) + lugar.lado;
    return c;
  }

  function pintarLugar() {
    const zonas = sede.zonas.filter(z => sede.racks.some(r => r.zonaId === z.id));
    const racks = sede.racks.filter(r => r.zonaId === lugar.zona);
    const r = sede.rackPorId[lugar.rack];
    const esps = r && lugar.pos ? espaciosDe(r.id, lugar.pos) : [];
    const niveles = [...new Set(esps.map(e => e.nivel))].sort((a, b) => b - a);
    const lados = lugar.nivel !== null ? esps.filter(e => e.nivel === lugar.nivel).map(e => e.lado).sort() : [];
    const conFondo = lados.some(l => l === 'C' || l === 'D');
    // Doble fondo: se muestra como en la estantería, el fondo (C - D) arriba y el frente (A - B) abajo
    const ladosVer = conFondo ? lados.filter(l => l === 'C' || l === 'D').concat(lados.filter(l => l !== 'C' && l !== 'D')) : lados;
    const boton = (on, txt, accion, extra) => `<button class="elige ${on ? 'on' : ''}" onclick="${accion}" ${extra || ''}>${txt}</button>`;
    const cod = codigoLugar();
    const codVer = !cod ? '' : lugar.nivel !== null && lugar.lado ? cu(cod) : posCodigo(lugar.rack, lugar.pos);   // el código nuevo si ya lo tiene
    const ejemplo = sede.codigos && Object.keys(sede.codigos).length ? '2000-01-02-01' : 'SECF03P0052A';

    const ctx = lugarCtx;
    const caja = $(ctx ? ctx.contenedor : 'lugarCaja');
    if (!caja) return;
    caja.innerHTML = `
      ${ctx ? `<div class="mt8">${campoConCamara(`<input id="lgCod" class="campo" autocomplete="off" spellcheck="false" autocapitalize="characters"
          placeholder="Escanea con la pistola o escribe: ${ejemplo}">`, 'flujoLugar')}</div>
        ${ctx.otrasSedes && ini.sedes.length > 1 ? `<div class="tabs mt12">${ini.sedes.map(s =>
          `<button class="tab ${s.id === ses.sedeId ? 'on' : ''}" onclick="flujoSede('${esc(s.id)}')">${esc(s.nombre)}</button>`).join('')}</div>` : ''}
        <span class="lbl mt12">O elígelo</span>`
      : `<div class="fila-sb"><span class="h2">Elegir lugar</span>${btnCerrar()}</div>`}
      <div class="lugar-cod mt12" aria-live="polite">${cod ? esc(codVer) : '<span class="muted">Elige zona, fila y posición</span>'}</div>

      <span class="lbl mt12">Zona</span>
      <div class="elige-grid">${zonas.map(z => boton(z.id === lugar.zona, esc(z.nombre), `lugarSet('zona','${esc(z.id)}')`)).join('')}</div>

      ${lugar.zona ? `<span class="lbl mt12">Fila</span>
      <div class="elige-grid">${racks.map(x => boton(x.id === lugar.rack, esc(x.nombre.replace('Fila ', 'F')), `lugarSet('rack','${esc(x.id)}')`)).join('')}</div>` : ''}

      ${r ? `<span class="lbl mt12">Posición</span>
      <div class="elige-grid">${Array.from({ length: r.posiciones }, (_, i) => i + 1).filter(p => !r.omitidas.includes(p))
        .map(p => boton(p === lugar.pos, p, `lugarSet('pos',${p})`)).join('')}</div>` : ''}

      ${r && lugar.pos ? (niveles.length ? `<span class="lbl mt12">Nivel ${ctx ? '' : '<span class="muted small">(opcional)</span>'}</span>
      <div class="elige-grid">${niveles.map(n => boton(n === lugar.nivel, n === 0 ? 'Picking' : n, `lugarSet('nivel',${n})`)).join('')}</div>`
        : '<p class="muted small mt12">Esta posición todavía no tiene niveles.</p>') : ''}

      ${lados.length ? `<span class="lbl mt12">Lado</span>
      <div class="elige-grid ${conFondo ? 'elige-2' : ''}">${ladosVer.map(l => {
        const idL = `${lugar.rack}-P${pad3(lugar.pos)}-${lugar.nivel === 0 ? 'PK' : lugar.nivel}${l}`;
        const lleno = ctx && !ctx.permitirLlenos && sinCupo(idL);
        const cupo = ctx && !lleno && cupoTxt(idL);
        return boton(l === lugar.lado, l + (l === 'C' || l === 'D' ? ' <small>fondo</small>' : '') + (lleno ? ' <small>lleno</small>' : cupo ? ` <small>${cupo}</small>` : ''),
          `lugarSet('lado','${l}')`, lleno ? `disabled title="Este espacio ya tiene ${maxEsp()} productos"` : '');
      }).join('')}</div>` : ''}

      ${ctx ? `<div class="mt16"><button class="btn btn-pri btn-xl" style="width:100%" onclick="lugarUsar()" ${cod && lugar.lado ? '' : 'disabled'}>
        ${cod && lugar.lado ? 'Usar ' + esc(codVer) : 'Elige hasta el lado'}</button></div>` : `<div class="mt16"><button class="btn btn-pri btn-xl" style="width:100%" onclick="irLugar()" ${cod ? '' : 'disabled'}>
        ${lugar.lado ? 'Ir al espacio' : 'Ir a la posición'}</button></div>

      <details class="mt16"><summary class="small">Escanear con la pistola o escribir el código</summary>
        <div class="mt12">${campoConCamara(`<input id="lgCod" class="campo" autocomplete="off" spellcheck="false" autocapitalize="characters"
          placeholder="Ej. ${ejemplo}">`, 'lgCod')}</div>
      </details>`}`;
    const c = $('lgCod');
    if (c) c.addEventListener('keydown', ev => {
      if (ev.key !== 'Enter') return;
      ev.preventDefault();
      if (ctx) flujoLugarCodigo(c.value); else buscarLugar(c.value);
    });
  }

  // Cuántos productos caben en un espacio (Configuración → Ajustes)
  const maxEsp = () => Math.max(1, Math.round(Number(ini && ini.parametros && ini.parametros.max_productos_espacio)) || 3);
  // ¿Ya no cabe otro producto en el espacio? (si es el mismo producto y lote que ya está, se suma y sí cabe)
  function sinCupo(id, m) {
    const ls = lineasDe(id);
    if (m && ls.some(l => l.productoId === m.productoId && (l.lote || '') === (m.lote || ''))) return false;
    return ls.length >= maxEsp();
  }
  const cupoTxt = id => { const n = lineasDe(id).length; return n ? `${n}/${maxEsp()}` : ''; };
  function espacioLleno(id, m) {
    if (!sinCupo(id, m)) return false;
    const ls = lineasDe(id);
    toast(`El espacio ${cu(id)} ya tiene ${ls.length} producto${ls.length === 1 ? '' : 's'} (${ls.map(l => l.nombre).join(', ')}) y el máximo es ${maxEsp()}. Elige otro.`, 'error');
    return true;
  }

  function lugarSet(campo, valor) {
    if (campo === 'zona') lugar = { zona: valor, rack: '', pos: 0, nivel: null, lado: '' };
    if (campo === 'rack') lugar = Object.assign(lugar, { rack: valor, pos: 0, nivel: null, lado: '' });
    if (campo === 'pos') lugar = Object.assign(lugar, { pos: valor, nivel: null, lado: '' });
    if (campo === 'nivel') lugar = Object.assign(lugar, { nivel: valor, lado: '' });
    if (campo === 'lado') lugar.lado = valor;
    // Si el nivel tiene un solo lado, se elige solo
    if (campo === 'nivel') {
      const l = espaciosDe(lugar.rack, lugar.pos).filter(e => e.nivel === valor);
      if (l.length === 1 && !(lugarCtx && !lugarCtx.permitirLlenos && sinCupo(l[0].id))) lugar.lado = l[0].lado;
    }
    pintarLugar();
  }

  function lugarUsar() {
    const cod = codigoLugar();
    if (!cod || !lugar.lado || !sede.espPorId[cod] || !lugarCtx) return;
    lugarCtx.alElegir(cod);
  }

  function irLugar() {
    const cod = codigoLugar();
    if (!cod) return;
    cerrarModal();
    const e = lugar.lado ? sede.espacios.find(x => x.id === cod) : null;
    abrirPos(lugar.rack, lugar.pos, e ? e.id : undefined);
  }

  // Busca un lugar escrito o escaneado, con o sin guiones: SECF03P0052A = SEC-F03-P005-2A
  const sinGuion = t => String(t || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
  function buscarLugar(txt) {
    const c = sinGuion(txt);
    if (!c) return toast('Escribe o escanea el código del lugar', 'error');
    const hoja = !ubicando && !moviendo && !lugarCtx && !flujo;   // sin nada pendiente: sale la ventana con lo que se puede hacer
    const e = espDeTexto(txt);
    if (e) { pitido(); if (hoja) return hojaLugar(e.id); cerrarModal(); return abrirPos(e.rackId, e.posicion, e.id); }
    const pp = posDeTexto(txt);
    if (pp) { pitido(); if (hoja) return hojaPos(pp.rackId, pp.posicion); cerrarModal(); return abrirPos(pp.rackId, pp.posicion); }
    for (const r of sede.racks) {
      const m = c.match(new RegExp('^' + sinGuion(r.id) + 'P0*(\\d+)$'));
      if (m) {
        const p = Number(m[1]);
        if (p >= 1 && p <= r.posiciones && !r.omitidas.includes(p)) { cerrarModal(); pitido(); return abrirPos(r.id, p); }
      }
    }
    toast(`No existe el lugar ${String(txt).trim().toUpperCase()} en esta sede`, 'error');
  }

  // Producto escaneado: rótulo (E000001) → ubicar · producto → dónde está
  function buscarProductoCod(txt) {
    const v = String(txt || '').trim();
    if (/^E\d{4,}$/i.test(v)) return buscarCodigo(v);
    const p = buscarProducto(v);
    if (p) { pitido(); return hojaProducto(p); }
    if (pareceEan(v)) return hojaEanNuevo(v);
    abrirBuscarProducto(v);
    toast('No hay un producto con ese código exacto. Revisa la lista.', 'error');
  }/* ================= Ficha del producto: INGRESO · MOVER · SALIDA (todo en una ventana) ================= */
  let flujo = null;      // { pid, accion, paso, linea, destino, cantidad, unidad, lote, venc }
  let lugarCtx = null;   // cuando el selector de lugar se usa dentro de la ficha

  const prodDe = id => ini.productos.find(p => p.id === id);
  const lineasProd = pid => fefo(sede.lineas.filter(l => l.productoId === pid));
  const idxLinea = l => sede.lineas.indexOf(l);
  const und = (n, p) => p && (p.unidadMedida || '').toUpperCase() === 'KG' ? `${+Number(n).toFixed(2)} kg`
    : `${n} und${p && p.undPorCaja > 1 ? ` · ${+(n / p.undPorCaja).toFixed(2)} cj` : ''}`;

  // Rotación: primero sale lo que vence primero. Devuelve los lotes del mismo producto que vencen antes que este.
  function vencenAntes(l) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(l.vencimiento || '')) return [];
    return fefo(sede.lineas.filter(x => x.productoId === l.productoId && x !== l &&
      /^\d{4}-\d{2}-\d{2}$/.test(x.vencimiento || '') && x.vencimiento < l.vencimiento));
  }
  const MOTIVOS = ['Pedido pide ese lote', 'El que vence antes no está accesible', 'El que vence antes está dañado', 'Otro'];
  function textoRotacion(antes) {
    const a = antes[0];
    return `Fuera de rotación: había rótulo ${a.lote || '—'} (vence ${a.vencimiento}) en ${cu(a.ubicacionId)}`;
  }

  function abrirFicha(pid) {
    if (!prodDe(pid)) return toast('Producto no encontrado', 'error');
    flujo = { pid, accion: null, paso: 'ficha' };
    lugarCtx = null;
    abrirModal('<div id="fichaCaja"></div>');
    pintarFicha();
  }

  function cerrarFicha() { flujo = null; lugarCtx = null; cerrarModal(); }

  function lugarTxt(id) {
    const e = sede.espPorId[id];
    return e ? textoUbic(e) : id;
  }

  function pintarFicha() {
    if (!flujo || !$('fichaCaja')) return;
    const p = prodDe(flujo.pid);
    const ls = lineasProd(p.id);
    const total = ls.reduce((a, l) => a + l.unidades, 0);
    const cab = (titulo, atras) => `<div class="fila-sb">
        <div class="fila gap8">${atras ? `<button class="icono icono-claro" aria-label="Atrás" onclick="${atras}">←</button>` : ''}<span class="h2">${titulo}</span></div>
        <button class="icono icono-claro" aria-label="Cerrar" onclick="cerrarFicha()">${ICONOS.cerrar}</button></div>
      <div class="ficha-prod mt12"><span class="chip">${esc(p.id)}</span><span class="nombre">${esc(p.nombre)}</span></div>`;
    const lineaBtn = (l, accion) => `<button class="bp-item" onclick="${accion}">
        <span class="col flex1 gap4" style="min-width:0"><span class="nombre mono-c">${esc(cu(l.ubicacionId))}</span>
          <span class="muted small">${esc(lugarTxt(l.ubicacionId))}</span>
          <span class="muted small">Lote ${esc(l.lote || '—')} · Vence ${fFecha(l.vencimiento)} · ${cant(l)}</span></span>
        ${tagVence(dias(l.vencimiento), true)}</button>`;
    let h = '';

    if (flujo.paso === 'ficha') {
      h = cab('Producto') + `
        <div class="ficha-datos mt12">
          <div><span class="muted small">Código Nutresa</span><b>${esc(p.codigoNutresa || '—')}</b></div>
          <div><span class="muted small">Und × caja</span><b>${p.undPorCaja}</b></div>
          <div><span class="muted small">En esta sede</span><b>${und(total, p)}</b></div>
          <div><span class="muted small">Lugares</span><b>${ls.length}</b></div>
        </div>
        ${ls.length ? (puede('mover') || puede('salida') ? `<div class="acciones3 ${puede('mover') && puede('salida') ? 'dos-acc' : ''} mt16">
          ${puede('mover') ? `<button class="btn btn-pri btn-xl" onclick="flujoAccion('MOVER')">Mover</button>` : ''}
          ${puede('salida') ? `<button class="btn btn-sal btn-xl" onclick="flujoAccion('SALIDA')">Salida</button>` : ''}
        </div>` : '') : '<p class="muted small mt16">Este producto no está en ninguna ubicación. Para ingresarlo, crea su rótulo en <b>Rotular</b> y luego escanéalo para ubicarlo.</p>'}
        <span class="h3 mt16">Dónde está hoy</span>
        <div class="lista-bp mt8">${ls.length ? ls.map(l => lineaBtn(l, `cerrarFicha(); abrirPos('${esc(sede.espPorId[l.ubicacionId].rackId)}', ${sede.espPorId[l.ubicacionId].posicion}, '${esc(l.ubicacionId)}')`)).join('')
          : '<p class="muted">No está en ninguna ubicación de esta sede.</p>'}</div>
        <div class="dos mt16">
          <button class="btn btn-sec" onclick="abrirHistorial('${esc(p.id)}')">Ver historial</button>
          <button class="btn btn-sec" onclick="seguirEnMapa('${esc(p.id)}')">Ver en el mapa</button>
        </div>`;
    }

    // ----- Elegir un lugar (destino del ingreso, origen o destino al mover) -----
    else if (flujo.paso === 'lugar') {
      const titulo = flujo.accion === 'INGRESO' ? 'Ingreso · ¿dónde lo pones?'
        : flujo.accion === 'MOVER' && !flujo.linea ? 'Mover · ¿de dónde sale?' : 'Mover · ¿a dónde va?';
      h = cab(titulo, flujo.accion === 'MOVER' && flujo.linea ? 'flujoPaso(\'origen\')' : 'flujoPaso(\'ficha\')') + `
        ${flujo.linea ? `<div class="info mt12"><span class="small muted">Sale de</span><span class="fuerte mono-c">${esc(cu(flujo.linea.ubicacionId))}</span>
          <span class="muted small">Lote ${esc(flujo.linea.lote || '—')} · ${cant(flujo.linea)}</span></div>` : ''}
        <div class="dos mt12">
          ${botonCamara('flujoLugar', 'btn btn-pri btn-xl btn-acceso', 'Escanear lugar')}
          <button class="btn btn-sec btn-xl" onclick="document.getElementById('lgCod') && document.getElementById('lgCod').focus()">Escribir código</button>
        </div>
        <div id="flujoLugar" class="mt8"></div>`;
    }

    // ----- Elegir de cuál lugar sale (mover o salida) -----
    else if (flujo.paso === 'origen') {
      h = cab(flujo.accion === 'SALIDA' ? 'Salida · ¿de dónde sale?' : 'Mover · ¿de dónde sale?', 'flujoPaso(\'ficha\')') + `
        <span class="muted small mt12">${flujo.accion === 'SALIDA' ? 'Primero sale lo que vence primero. ' : ''}Toca el lugar, o escanéalo.</span>
        <div class="lista-bp mt8">${ls.map((l, i) => (flujo.accion === 'SALIDA' && i === 0 && ls.length > 1 ? '<span class="sale-primero">Sacar primero este</span>' : '')
          + lineaBtn(l, `flujoOrigen(${idxLinea(l)})`)).join('')}</div>
        <div class="mt12">${botonCamara('flujoOrigen', 'btn btn-sec btn-xl btn-acceso', 'Escanear el lugar de origen')}</div>`;
    }

    // ----- Datos y confirmación -----
    else if (flujo.paso === 'confirmar') {
      const a = flujo.accion;
      const l = flujo.linea;
      const max = l ? (flujo.unidad === 'UND' ? l.unidades : +(l.unidades / l.undPorCaja).toFixed(2)) : '';
      const dest = flujo.destino;
      let aviso = '';
      if (a === 'SALIDA') {
        const e = sede.espPorId[l.ubicacionId];
        if (e && (e.lado === 'C' || e.lado === 'D')) {
          const frente = espaciosDe(e.rackId, e.posicion).find(x => x.nivel === e.nivel && x.lado === (e.lado === 'C' ? 'A' : 'B'));
          if (frente && lineasDe(frente.id).length) aviso = `<p class="aviso-n">${esc(etiqueta(frente))} está delante y tiene producto.</p>`;
        }
      }
      const antes = a === 'SALIDA' ? vencenAntes(l) : [];
      if (antes.length && !flujo.fefoOk) {
        h = cab('Ojo con la rotación', 'flujoPaso(\'origen\')') + `
          <div class="alerta-fefo mt12">
            <b>No saques de aquí.</b> Este lote vence el <b>${fFecha(l.vencimiento)}</b>, pero hay ${antes.length === 1 ? 'otro que vence antes' : antes.length + ' que vencen antes'}:
          </div>
          <div class="lista-bp mt8">${antes.map(x => lineaBtn(x, `flujoOrigen(${idxLinea(x)})`)).join('')}</div>
          <button class="btn btn-ent btn-xl mt12" style="width:100%" onclick="flujoOrigen(${idxLinea(antes[0])})">Sacar el que vence antes</button>
          <button class="btn btn-sec btn-xl mt8" style="width:100%" onclick="flujo.fefoOk = true; pintarFicha()">Sacar de aquí de todos modos</button>
          <span class="muted small mt8">Si lo sacas de aquí, queda registrado como salida fuera de rotación.</span>`;
        $('fichaCaja').innerHTML = h;
        return;
      }
      if (antes.length) aviso += `<div class="alerta-fefo mt12"><b>Salida fuera de rotación.</b> ${esc(textoRotacion(antes))}.
        <label class="lbl mt8" for="flMotivo">Motivo</label>
        <select id="flMotivo" class="campo">${MOTIVOS.map(m => `<option>${m}</option>`).join('')}</select></div>`;
      const titulo = a === 'INGRESO' ? 'Confirmar ingreso' : a === 'MOVER' ? 'Confirmar traslado' : antes.length ? 'Sí, sacar todo (fuera de rotación)' : 'Sí, sacar todo';
      h = cab(titulo, a === 'INGRESO' || a === 'MOVER' ? 'flujoPaso(\'lugar\')' : 'flujoPaso(\'origen\')') + `
        <div class="resumen mt12">
          ${a !== 'INGRESO' ? `<div><span class="muted small">${a === 'MOVER' ? 'Sale de' : 'Sale de'}</span><b class="mono-c">${esc(cu(l.ubicacionId))}</b>
            <span class="muted small">${esc(lugarTxt(l.ubicacionId))} · Lote ${esc(l.lote || '—')} · hay ${cant(l)}</span></div>` : ''}
          ${a !== 'SALIDA' ? `<div><span class="muted small">${a === 'MOVER' ? 'Va a' : 'Entra a'}</span><b class="mono-c">${esc(dest)}</b>
            <span class="muted small">${esc(lugarTxt(dest))}</span></div>` : ''}
        </div>
        ${aviso}
        ${a === 'SALIDA' ? `<div class="linea-cant mt12">Sale todo: ${cant(l)}</div>
          <span class="muted small mt8">El espacio queda libre y el rótulo ya no se podrá volver a usar.</span>` : `<div class="dos mt12">
          <div><label class="lbl" for="flCant">Cantidad</label>
            <input id="flCant" class="campo" type="number" inputmode="decimal" min="0" step="any" value="${flujo.cantidad ?? (a === 'INGRESO' ? '' : max)}"></div>
          <div><label class="lbl" for="flUnd">Unidad</label>
            <select id="flUnd" class="campo" onchange="flujoUnidad(this.value)">${[['CAJA', 'Cajas'], ['UND', 'Unidades']]
              .map(([v, t]) => `<option value="${v}" ${v === flujo.unidad ? 'selected' : ''}>${t}</option>`).join('')}</select></div>
        </div>`}
        ${a === 'INGRESO' ? `<div class="dos mt12">
          <div><label class="lbl" for="flVenc">Vencimiento</label><input id="flVenc" type="date" class="campo" value="${esc(flujo.venc || '')}"></div>
          <div><label class="lbl" for="flLote">Lote o rótulo (opcional)</label><input id="flLote" class="campo" value="${esc(flujo.lote || '')}" autocomplete="off"></div>
        </div>` : a === 'MOVER' ? '<span class="muted small mt8">Por defecto se mueve todo.</span>' : ''}
        <p id="fErr" class="error" hidden></p>
        <button id="flOk" class="btn ${a === 'SALIDA' ? 'btn-sal' : a === 'MOVER' ? 'btn-pri' : 'btn-ent'} btn-xl mt16" style="width:100%" onclick="flujoGuardar()">${titulo}</button>`;
    }

    $('fichaCaja').innerHTML = h;
    if (flujo.paso === 'lugar') {
      lugarCtx = { contenedor: 'flujoLugar', alElegir: flujoLugarElegido, otrasSedes: flujo.accion === 'MOVER' && !!flujo.linea };
      pintarLugar();
    } else lugarCtx = null;
    dibujarCodigos($('fichaCaja'));
    if (flujo.paso === 'confirmar') verBoton('flOk');
  }

  // Lleva la vista hasta el botón de confirmar (sin que el operario tenga que bajar)
  function verBoton(id) {
    setTimeout(() => {
      const b = $(id);
      if (!b) return;
      b.scrollIntoView({ behavior: 'smooth', block: 'center' });
      if (!('ontouchstart' in window)) b.focus({ preventScroll: true });
    }, 60);
  }

  function flujoPaso(paso) {
    if (paso === 'ficha') Object.assign(flujo, { accion: null, linea: null, destino: null, cantidad: null });
    if (paso === 'origen') Object.assign(flujo, { linea: null, destino: null, cantidad: null });
    if (paso === 'lugar') flujo.destino = null;
    if (paso === 'origen' && flujo.accion === 'MOVER' && flujo.sedeOrigen && flujo.sedeOrigen !== ses.sedeId) return volverSedeOrigen('origen');
    flujo.paso = paso;
    pintarFicha();
  }

  function flujoAccion(a) {
    if (sinPermiso(a === 'MOVER' ? 'mover' : a === 'SALIDA' ? 'salida' : 'ubicar')) return;
    flujo.accion = a;
    flujo.unidad = leerLS('unidad') || 'CAJA';
    flujo.linea = null; flujo.destino = null; flujo.cantidad = null; flujo.sedeOrigen = ses.sedeId;
    const ls = lineasProd(flujo.pid);
    flujo.fefoOk = false;
    if (a === 'INGRESO') flujo.paso = 'lugar';
    else if (ls.length === 1) { flujo.linea = ls[0]; flujo.paso = a === 'SALIDA' ? 'confirmar' : 'lugar'; }
    else flujo.paso = 'origen';
    if (flujo.paso === 'lugar') lugar = { zona: lugar.zona, rack: '', pos: 0, nivel: null, lado: '' };
    pintarFicha();
  }

  function flujoOrigen(i) {
    flujo.linea = sede.lineas[i];
    flujo.fefoOk = false;
    flujo.paso = flujo.accion === 'SALIDA' ? 'confirmar' : 'lugar';
    lugar = { zona: '', rack: '', pos: 0, nivel: null, lado: '' };
    pintarFicha();
  }

  // Origen escaneado o escrito: el producto tiene que estar en ese lugar
  function flujoOrigenCodigo(txt) {
    const c = sinGuion(txt);
    const ls = lineasProd(flujo.pid).filter(l => sinGuion(l.ubicacionId) === c || sinGuion(cu(l.ubicacionId)) === c);
    if (!ls.length) return toast(`Este producto no está en ${String(txt).trim().toUpperCase()}`, 'error');
    pitido();
    flujoOrigen(idxLinea(ls[0]));
  }

  // Lugar elegido en el selector (o escaneado) para ingresar o recibir el traslado
  function flujoLugarElegido(id) {
    if (flujo.linea && id === flujo.linea.ubicacionId) return toast('El destino es el mismo lugar de origen', 'error');
    if (espacioLleno(id, flujo.linea)) return;
    flujo.destino = id;
    flujo.paso = 'confirmar';
    pintarFicha();
  }

  function flujoLugarCodigo(txt) {
    const c = sinGuion(txt);
    if (!c) return;
    const e = espDeTexto(txt);
    if (e) { pitido(); return lugarCtx && lugarCtx.alElegir ? lugarCtx.alElegir(e.id) : flujoLugarElegido(e.id); }
    const pp = posDeTexto(txt);
    if (pp) { const r = sede.rackPorId[pp.rackId]; pitido(); lugar = { zona: r.zonaId, rack: r.id, pos: pp.posicion, nivel: null, lado: '' }; toast('Ahora elige el nivel y el lado', 'ok'); return pintarLugar(); }
    for (const r of sede.racks) {
      const m = c.match(new RegExp('^' + sinGuion(r.id) + 'P0*(\\d+)$'));
      if (m && Number(m[1]) >= 1 && Number(m[1]) <= r.posiciones) {
        pitido();
        lugar = { zona: r.zonaId, rack: r.id, pos: Number(m[1]), nivel: null, lado: '' };
        toast('Ahora elige el nivel y el lado', 'ok');
        return pintarLugar();
      }
    }
    toast(`No existe el lugar ${String(txt).trim().toUpperCase()} en esta sede`, 'error');
  }

  function flujoUnidad(u) {
    flujo.unidad = u;
    const l = flujo.linea;
    if (l && $('flCant')) $('flCant').value = u === 'UND' ? l.unidades : +(l.unidades / l.undPorCaja).toFixed(2);
  }

  // Cambiar de sede mientras se elige el destino de un traslado
  function flujoSede(id) {
    if (id === ses.sedeId) return;
    toast('Cargando ' + nombreSede(id) + '…');
    llamar('bdSede', id).then(d => {
      ses.sedeId = id; setSede(d); posSel = null; espSel = null;
      lugar = { zona: '', rack: '', pos: 0, nivel: null, lado: '' };
      pintarApp(); pintarFicha();
    }).catch(e => toast(e.message, 'error'));
  }
  function volverSedeOrigen(paso) {
    llamar('bdSede', flujo.sedeOrigen).then(d => {
      ses.sedeId = flujo.sedeOrigen; setSede(d); flujo.paso = paso; pintarApp(); pintarFicha();
    }).catch(e => toast(e.message, 'error'));
  }

  function flujoGuardar() {
    const a = flujo.accion, l = flujo.linea, p = prodDe(flujo.pid);
    const cantidad = a === 'SALIDA' ? l.unidades : Number($('flCant').value);
    const unidad = a === 'SALIDA' ? 'UND' : $('flUnd').value;
    if (!(cantidad > 0)) return errForm('Escribe una cantidad mayor que 0.');
    if (l && cantidad * (unidad === 'CAJA' ? l.undPorCaja : 1) > l.unidades + 1e-9) return errForm(`Solo hay ${cant(l)}.`);
    if (a !== 'SALIDA') guardarLS('unidad', unidad);
    let fn, datos, msg;
    if (a === 'INGRESO') {
      const venc = $('flVenc').value;
      if (!venc) return errForm('Escribe la fecha de vencimiento.');
      fn = 'bdMovimiento';
      datos = { sedeId: ses.sedeId, tipo: 'ENTRADA', ubicacionId: flujo.destino, productoId: p.id, cantidad, unidad,
        lote: $('flLote').value.trim(), vencimiento: venc, usuario: ses.nombre, observacion: 'Ingreso' };
      msg = `Ingresado en ${flujo.destino}`;
    } else if (a === 'SALIDA') {
      fn = 'bdMovimiento';
      const antes = vencenAntes(l);
      datos = { sedeId: ses.sedeId, tipo: 'SALIDA', ubicacionId: l.ubicacionId, productoId: p.id, cantidad, unidad,
        lote: l.lote, vencimiento: l.vencimiento, usuario: ses.nombre,
        observacion: antes.length ? textoRotacion(antes) : 'Salida',
        fueraRotacion: antes.length > 0, motivo: antes.length && $('flMotivo') ? $('flMotivo').value : '' };
      msg = 'Salida registrada';
    } else {
      fn = 'bdMover';
      datos = { sedeId: ses.sedeId, origenId: l.ubicacionId, destinoId: flujo.destino, productoId: p.id,
        lote: l.lote, cantidad, unidad, usuario: ses.nombre };
      msg = `Movido a ${flujo.destino}`;
    }
    const b = $('flOk');
    b.disabled = true; b.textContent = 'Guardando…';
    llamar(fn, datos).then(d => {
      setSede(d);
      pitido();
      toast(msg, 'ok');
      flujo.paso = 'ficha'; flujo.accion = null; flujo.linea = null; flujo.destino = null;
      pintarApp(); pintarFicha();
    }).catch(err => { errForm(err.message); b.disabled = false; b.textContent = 'Intentar de nuevo'; });
  }

  /* ================= Historial (bitácora) de un producto ================= */
  const TIPOS = { ENTRADA: 'Ingreso', SALIDA: 'Salida', 'TRASLADO-SALIDA': 'Sale (traslado)', 'TRASLADO-ENTRADA': 'Llega (traslado)', AJUSTE: 'Corregido en reconteo' };

  // Mismo orden en que pasó: en un traslado, primero sale y luego llega
  function ordenMov(lista) {
    return [...lista].sort((a, b) => a.fecha.localeCompare(b.fecha) ||
      (a.tipo === 'TRASLADO-ENTRADA') - (b.tipo === 'TRASLADO-ENTRADA'));
  }
  function fechaHora(iso) {
    const d = new Date(iso);
    return `${String(d.getDate()).padStart(2, '0')} ${MESES[d.getMonth()]} ${d.getFullYear()} · ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  }

  // Une la salida y la llegada de cada traslado en un solo paso: "Movido de A a B"
  function pasosDe(movs) {
    const pasos = [], tras = {};
    ordenMov(movs).forEach(m => {
      if (m.tipo.indexOf('TRASLADO') === 0 && m.referencia) {
        const t = tras[m.referencia] || (tras[m.referencia] = { tipo: 'TRASLADO', fecha: m.fecha, usuario: m.usuario, cantidad: m.cantidad, unidad: m.unidad, unidades: m.unidades, lote: m.lote });
        if (m.tipo === 'TRASLADO-SALIDA') t.desde = m.ubicacion; else t.hasta = m.ubicacion;
        if (!t.puesto) { t.puesto = true; pasos.push(t); }
      } else pasos.push(m);
    });
    return pasos;
  }

  let historial = null; // { pid, movs, tab }

  function abrirHistorial(pid) {
    flujo = null; lugarCtx = null;
    const p = prodDe(pid);
    abrirModal(`<div class="fila-sb"><span class="h2">Historial</span>${btnCerrar()}</div>
      <div class="ficha-prod mt12"><span class="chip">${esc(p.id)}</span><span class="nombre">${esc(p.nombre)}</span></div>
      <div id="histCaja" class="mt12"><div class="cargando">Cargando historial…</div></div>`);
    llamar('bdHistorial', pid).then(movs => {
      historial = { pid, movs, tab: 'recorrido' }; pagInicio('histSal');
      pintarHistorial();
    }).catch(e => { $('histCaja').innerHTML = `<p class="error">${esc(e.message)}</p>`; });
  }

  function pintarHistorial() {
    const { pid, movs } = historial;
    const p = prodDe(pid);
    if (!movs.length) {
      $('histCaja').innerHTML = '<p class="muted">Este producto todavía no tiene movimientos.</p>';
      return;
    }
    // Un recorrido por cada lote o rótulo
    const lotes = {};
    movs.forEach(m => (lotes[m.lote || '(sin lote)'] = lotes[m.lote || '(sin lote)'] || []).push(m));
    const hoy = {};
    sede.lineas.filter(l => l.productoId === pid).forEach(l => (hoy[l.lote || '(sin lote)'] = hoy[l.lote || '(sin lote)'] || []).push(l));
    const nombres = Object.keys(lotes).sort((a, b) => ordenMov(lotes[b])[0].fecha.localeCompare(ordenMov(lotes[a])[0].fecha));

    const salidas = ordenMov(movs.filter(m => m.tipo === 'SALIDA')).reverse();
    const fuera = salidas.filter(m => m.fueraRotacion).length;
    const pestanas = `<div class="tabs">
        <button class="tab ${historial.tab === 'recorrido' ? 'on' : ''}" onclick="historial.tab='recorrido'; pintarHistorial()">Recorrido por lote</button>
        <button class="tab ${historial.tab === 'salidas' ? 'on' : ''}" onclick="historial.tab='salidas'; pintarHistorial()">Salidas (${salidas.length})${fuera ? ` · <span class="txt-rojo">${fuera} fuera de rotación</span>` : ''}</button></div>`;
    const botones = `<div class="dos mt12"><button class="btn btn-sec" onclick="seguirEnMapa('${esc(pid)}')">Ver en el mapa</button>
        ${puede('reportes') ? '<button class="btn btn-sec" onclick="descargarHistorial()">Descargar (Excel)</button>' : ''}</div>`;
    if (historial.tab === 'salidas') {
      const pg = paginar('histSal', salidas, pintarHistorial);
      $('histCaja').innerHTML = pestanas + botones + (salidas.length ? `<div class="lista-bp mt12">${pg.filas.map(m => salidaHtml(m, false)).join('')}</div>${pg.barra}`
        : '<p class="muted mt12">Este producto no ha tenido salidas.</p>');
      return;
    }
    $('histCaja').innerHTML = pestanas + botones + `
      ${nombres.map(lote => {
        const pasos = pasosDe(lotes[lote]);
        const ahora = hoy[lote] || [];
        const venc = (lotes[lote].find(m => m.vencimiento) || {}).vencimiento;
        return `<section class="lote mt16">
          <div class="fila-sb"><span class="h3">Lote ${esc(lote)}</span><span class="muted small">Vence ${fFecha(venc)}</span></div>
          <div class="estado-hoy ${ahora.length ? 'esta' : 'salio'}">${ahora.length
            ? 'Hoy está en ' + ahora.map(l => `<b class="mono-c">${esc(cu(l.ubicacionId))}</b> (${cant(l)})`).join(', ')
            : 'Ya no está en esta sede'}</div>
          <ol class="linea-t">${pasos.map(m => {
            const qty = `${m.cantidad} ${m.unidad === 'CAJA' ? 'cj' : m.unidad === 'UND' ? 'und' : esc(m.unidad || '')}`;
            const que = m.tipo === 'TRASLADO'
              ? `Movido de <b class="mono-c">${esc(m.desde || '?')}</b> a <b class="mono-c">${esc(m.hasta || '?')}</b>`
              : m.tipo === 'ENTRADA' ? `Ingresó a <b class="mono-c">${esc(cu(m.ubicacion))}</b>`
              : m.tipo === 'SALIDA' ? `Salió de <b class="mono-c">${esc(cu(m.ubicacion))}</b>${m.fueraRotacion ? ' <span class="tag venc">Fuera de rotación</span>' : ''}`
              : m.tipo === 'AJUSTE' ? `<b>Corregido</b> en <b class="mono-c">${esc(cu(m.ubicacion))}</b> · ${esc(m.observacion || '')}`
              : `${esc(TIPOS[m.tipo] || m.tipo)} · <b class="mono-c">${esc(cu(m.ubicacion))}</b>`;
            return `<li class="t-${m.tipo === 'TRASLADO' ? 'mov' : m.tipo === 'SALIDA' ? 'sal' : 'ent'}">
              <span class="small muted">${fechaHora(m.fecha)} · ${esc(m.usuario || '—')}</span>
              <span>${que} · ${qty}</span></li>`;
          }).join('')}</ol>
        </section>`;
      }).join('')}`;
  }

  // Una salida: cuándo, de dónde, qué lote, quién y si respetó la rotación
  function salidaHtml(m, conProducto) {
    return `<div class="salida-item ${m.fueraRotacion ? 'mala' : ''}">
      <div class="fila-sb inicio"><span class="small muted">${fechaHora(m.fecha)} · ${esc(m.usuario || '—')}</span>
        ${m.fueraRotacion ? '<span class="tag venc">Fuera de rotación</span>' : '<span class="tag ok">En rotación</span>'}</div>
      ${conProducto ? `<span class="nombre">${esc(m.productoId)} · ${esc(m.producto)}</span>` : ''}
      <span>Salió de <b class="mono-c">${esc(cu(m.ubicacion))}</b> · ${m.cantidad} ${m.unidad === 'CAJA' ? 'cj' : 'und'} (${m.unidades} und)</span>
      <span class="muted small">Lote ${esc(m.lote || '—')} · vencía ${fFecha(m.vencimiento)}${m.sede ? ' · ' + esc(m.sede) : ''}</span>
      ${m.fueraRotacion ? `<span class="small">${esc(m.observacion || '')}${m.motivo ? ` · <b>Motivo:</b> ${esc(m.motivo)}` : ''}</span>` : ''}
    </div>`;
  }

  /* ----- Reporte de salidas y rotación (todos los productos) ----- */
  let repSalidas = null; // { movs, solo }

  function abrirSalidas() {
    const hace30 = new Date(Date.now() - 30 * 864e5);
    const desde = `${hace30.getFullYear()}-${String(hace30.getMonth() + 1).padStart(2, '0')}-${String(hace30.getDate()).padStart(2, '0')}`;
    abrirModal(`<div class="fila-sb"><span class="h2">Salidas y rotación</span>${btnCerrar()}</div>
      <div class="dos mt12">
        <div><label class="lbl" for="sDesde">Desde</label><input id="sDesde" type="date" class="campo" value="${desde}"></div>
        <div><label class="lbl" for="sHasta">Hasta</label><input id="sHasta" type="date" class="campo" value="${hoyISO()}"></div>
      </div>
      <button class="btn btn-pri mt12" onclick="cargarSalidas()">Ver salidas</button>
      <div id="salCaja" class="mt12"></div>`);
    cargarSalidas();
  }

  function cargarSalidas() {
    const desde = $('sDesde').value, hasta = $('sHasta').value;
    if (!desde || !hasta) return toast('Elige las dos fechas', 'error');
    const fin = new Date(hasta + 'T00:00:00'); fin.setDate(fin.getDate() + 1);
    $('salCaja').innerHTML = '<div class="cargando">Cargando…</div>';
    llamar('bdSalidas', { desde: new Date(desde + 'T00:00:00').toISOString(), hasta: fin.toISOString() }).then(movs => {
      repSalidas = { movs: ordenMov(movs).reverse(), solo: repSalidas ? repSalidas.solo : false, desde, hasta }; pagInicio('sal');
      pintarSalidas();
    }).catch(e => { $('salCaja').innerHTML = `<p class="error">${esc(e.message)}</p>`; });
  }

  function pintarSalidas() {
    const { movs, solo } = repSalidas;
    const fuera = movs.filter(m => m.fueraRotacion);
    const lista = solo ? fuera : movs;
    const porUsuario = {};
    fuera.forEach(m => (porUsuario[m.usuario || '—'] = (porUsuario[m.usuario || '—'] || 0) + 1));
    $('salCaja').innerHTML = `
      <div class="ficha-datos">
        <div><span class="muted small">Salidas</span><b>${movs.length}</b></div>
        <div><span class="muted small">Fuera de rotación</span><b class="${fuera.length ? 'txt-rojo' : ''}">${fuera.length}${movs.length ? ` (${Math.round(fuera.length * 100 / movs.length)}%)` : ''}</b></div>
      </div>
      ${fuera.length ? `<span class="muted small mt8">Fuera de rotación por persona: ${Object.keys(porUsuario).map(u => `${esc(u)} ${porUsuario[u]}`).join(' · ')}</span>` : ''}
      <div class="fila-sb wrap-f gap8 mt12">
        <label class="fila gap8 small" style="cursor:pointer"><input type="checkbox" ${solo ? 'checked' : ''} onchange="repSalidas.solo = this.checked; pagInicio('sal'); pintarSalidas()"> Solo fuera de rotación</label>
        <button class="btn btn-sec" onclick="descargarExcel('Salidas ' + repSalidas.desde + ' a ' + repSalidas.hasta + '.xlsx', { Salidas: filasMov(repSalidas.movs) })">Descargar (Excel)</button>
      </div>
      <div class="lista-bp mt12">${lista.length ? paginar('sal', lista, pintarSalidas).filas.map(m => salidaHtml(m, true)).join('') : '<p class="muted">No hay salidas en esas fechas.</p>'}</div>${lista.length ? barraPag('sal', pagAct.sal, Math.ceil(lista.length / POR_PAG), lista.length) : ''}`;
  }

  function filasMov(movs) {
    return ordenMov(movs).map(m => {
      const d = new Date(m.fecha);
      return {
        Fecha: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`,
        Hora: `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`,
        Tipo: TIPOS[m.tipo] || m.tipo, Lugar: cu(m.ubicacion), Sede: m.sede || '', 'Código AFS': m.productoId,
        Producto: m.producto, Lote: m.lote, Vencimiento: m.vencimiento, Cantidad: m.cantidad, Unidad: m.unidad,
        Unidades: m.unidades, Usuario: m.usuario, 'Fuera de rotación': m.fueraRotacion ? 'Sí' : '', Motivo: m.motivo || '',
        Referencia: m.referencia, Observación: m.observacion
      };
    });
  }

  function descargarHistorial() {
    const p = prodDe(historial.pid);
    descargarExcel(`Historial ${p.id}.xlsx`, { Historial: filasMov(historial.movs) });
  }

  /* ================= Ver el recorrido de un producto en el mapa ================= */
  let seguir = null; // { pid, nombre, hoy:Set('rack|pos'), antes:Set('rack|pos') }
  const posDe = id => { const e = sede.espPorId[id]; return e ? e.rackId + '|' + e.posicion : null; };

  function seguirEnMapa(pid) {
    const p = prodDe(pid);
    const hoy = new Set(sede.lineas.filter(l => l.productoId === pid).map(l => posDe(l.ubicacionId)).filter(Boolean));
    const marcar = movs => {
      const antes = new Set(movs.map(m => posDe(m.ubicacion)).filter(k => k && !hoy.has(k)));
      seguir = { pid, nombre: p.nombre, hoy, antes };
      flujo = null; lugarCtx = null; cerrarModal();
      busqueda = ''; vista = 'mapa'; posSel = null; espSel = null;
      pintarApp();
      toast(hoy.size ? 'En azul: dónde está hoy · punteado: dónde estuvo' : 'Hoy no está en esta sede · punteado: dónde estuvo', 'ok');
    };
    if (historial && historial.pid === pid) marcar(historial.movs);
    else llamar('bdHistorial', pid).then(movs => { historial = { pid, movs }; marcar(movs); }).catch(e => toast(e.message, 'error'));
  }

  function avisoSeguir() {
    if (!seguir || vista !== 'mapa') return '';
    return `<div class="colocar-aviso" style="margin-top:0;margin-bottom:10px;flex-wrap:wrap">
      <span>Recorrido de ${esc(seguir.nombre)}<br><small style="font-weight:400">
        <i class="ley-hoy"></i> Hoy (${seguir.hoy.size}) · <i class="ley-antes"></i> Estuvo antes (${seguir.antes.size})</small>
        ${seguir.hoy.size ? `<span class="fila gap8 wrap-f mt8">${[...seguir.hoy].map(k => { const [rk, ps] = k.split('|');
          return `<button class="btn btn-sec" style="min-height:36px" onclick="abrirPos('${esc(rk)}', ${ps})">${esc(rk)} · P${ps}</button>`; }).join('')}</span>` : ''}</span>
      <span class="fila gap8"><button class="btn btn-sec" onclick="abrirHistorial('${esc(seguir.pid)}')">Historial</button>
        <button class="btn btn-sec" onclick="seguir=null; pintarApp()">Quitar</button></span></div>`;
  }

  /* ================= Descargas en Excel ================= */
  function descargarExcel(archivo, hojas, permiso) {
    if (sinPermiso(permiso || 'reportes')) return;
    if (window.XLSX) {
      const libro = XLSX.utils.book_new();
      Object.keys(hojas).forEach(n => {
        const hoja = XLSX.utils.json_to_sheet(hojas[n].length ? hojas[n] : [{ Aviso: 'Sin datos' }]);
        const cols = Object.keys(hojas[n][0] || { Aviso: 1 });
        hoja['!cols'] = cols.map(c => ({ wch: Math.min(48, Math.max(c.length + 2, ...hojas[n].slice(0, 200).map(f => String(f[c] ?? '').length + 1))) }));
        XLSX.utils.book_append_sheet(libro, hoja, n.slice(0, 31));
      });
      XLSX.writeFile(libro, archivo);
    } else {
      // Sin la librería de Excel: CSV que también abre en Excel
      const filas = hojas[Object.keys(hojas)[0]];
      const cols = Object.keys(filas[0] || {});
      const csv = [cols.join(';')].concat(filas.map(f => cols.map(c => `"${String(f[c] ?? '').replace(/"/g, '""')}"`).join(';'))).join('\r\n');
      const a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv' }));
      a.download = archivo.replace(/\.xlsx$/, '.csv');
      a.click();
    }
    toast('Descarga lista', 'ok');
  }

  function filasInventario() {
    return fefo(sede.lineas).map(l => {
      const e = sede.espPorId[l.ubicacionId], r = sede.rackPorId[e.rackId], z = sede.zonaPorId[r.zonaId];
      const p = prodDe(l.productoId) || {};
      return {
        Sede: nombreSede(ses.sedeId), Zona: z.nombre, Fila: r.nombre, Posición: e.posicion, Nivel: e.nivel === 0 ? 'Picking' : e.nivel,
        Lado: e.lado, Lugar: cu(l.ubicacionId), 'Código AFS': l.productoId, 'Código Nutresa': p.codigoNutresa || '', Producto: l.nombre,
        Lote: l.lote, Vencimiento: l.vencimiento, 'Días para vencer': dias(l.vencimiento), Unidades: l.unidades,
        Cajas: +(l.unidades / l.undPorCaja).toFixed(2), 'Fecha de ingreso': l.ingreso
      };
    });
  }

  function descargarInventario() {
    descargarExcel(`Inventario ${nombreSede(ses.sedeId)} ${hoyISO()}.xlsx`, { Inventario: filasInventario() });
  }

  function pedirBitacora() {
    if (sinPermiso('bitacora')) return;
    const hace30 = new Date(Date.now() - 30 * 864e5);
    const desde = `${hace30.getFullYear()}-${String(hace30.getMonth() + 1).padStart(2, '0')}-${String(hace30.getDate()).padStart(2, '0')}`;
    abrirModal(`<div class="fila-sb"><span class="h2">Descargar bitácora</span>${btnCerrar()}</div>
      <span class="muted small mt8">Todo lo que se hizo: ingresos, salidas y traslados, con fecha, hora, lugar y quién lo hizo.</span>
      <div class="dos mt12">
        <div><label class="lbl" for="bDesde">Desde</label><input id="bDesde" type="date" class="campo" value="${desde}"></div>
        <div><label class="lbl" for="bHasta">Hasta</label><input id="bHasta" type="date" class="campo" value="${hoyISO()}"></div>
      </div>
      <p id="fErr" class="error" hidden></p>
      <button id="bOk" class="btn btn-pri btn-xl mt16" onclick="descargarBitacora()">Descargar (Excel)</button>`);
  }

  function descargarBitacora() {
    const desde = $('bDesde').value, hasta = $('bHasta').value;
    if (!desde || !hasta) return errForm('Elige las dos fechas.');
    const b = $('bOk'); b.disabled = true; b.textContent = 'Preparando…';
    const finDia = new Date(hasta + 'T00:00:00'); finDia.setDate(finDia.getDate() + 1);
    llamar('bdBitacora', { desde: new Date(desde + 'T00:00:00').toISOString(), hasta: finDia.toISOString() }).then(movs => {
      cerrarModal();
      descargarExcel(`Bitácora ${desde} a ${hasta}.xlsx`, { 'Bitácora': filasMov(movs) }, 'bitacora');
    }).catch(e => { errForm(e.message); b.disabled = false; b.textContent = 'Descargar (Excel)'; });
  }   /* ================= RECIBIDOR: recibo con factura en mano ================= */
  let rcTab = 'recibir';      // recibir | calidad
  let rcLista = null;         // facturas recientes
  let rcAct = null;           // factura abierta (con sus productos)
  let rcEdit = null;          // id del producto que se está corrigiendo
  let rcCal = null;           // datos de calidad
  let rcFiltro = { desde: '', hasta: '', q: '', solo: false };
  let colaRot = null;         // productos de una factura que se van a rotular uno tras otro

  const isoDe = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const nfmt = n => (n === null || n === undefined || n === '') ? '—' : +Number(n).toFixed(2);

  function vistaRecibidor() {
    const tabs = [['recibir', PERM_RC, 'Recibir mercancía'], ['calidad', ['calidad'], 'Calidad'], ['inventario', ['inv_recibo'], 'Inventario']].filter(t => puedeAlguno(t[1]));
    if (!tabs.some(t => t[0] === rcTab)) rcTab = tabs.length ? tabs[0][0] : 'recibir';
    return `<div class="col gap12">
      <div class="tabs">${tabs.map(([k, , t]) => `<button class="tab ${rcTab === k ? 'on' : ''}" onclick="rcTab='${k}'; pintarApp()">${t}</button>`).join('')}</div>
      ${rcTab === 'calidad' || rcTab === 'inventario' ? vistaCalidad() : rcAct ? detalleRecepcion() : listaRecepciones()}
    </div>`;
  }

  /* ----- Lista de facturas ----- */
  function listaRecepciones() {
    if (rcLista === null) { cargarRecepciones(); return '<div class="cargando">Cargando facturas…</div>'; }
    return `<div class="fila-sb wrap-f gap8"><span class="h2">Facturas recibidas</span>
        ${puede('rc_facturas') ? '<button class="btn btn-pri" onclick="nuevaRecepcion()">+ Nueva factura</button>' : ''}</div>
      <span class="muted small">Crea la factura y copia lo que debe llegar (código y cantidad). El personal solo llena lo que llegó de verdad.</span>
      <div class="lista-bp">${rcLista.length ? rcLista.map(r => `<button class="bp-item" onclick="abrirRecepcion('${r.id}')">
          <span class="col flex1 gap4" style="min-width:0"><span class="nombre">Factura ${esc(r.factura)} · ${esc(r.proveedor)}</span>
            <span class="muted small">${fFecha(r.fecha)} · ${r.items} producto${r.items === 1 ? '' : 's'}${r.pendientes ? ` · <b>${r.pendientes} por recibir</b>` : ''} · ${r.evidencias} foto${r.evidencias === 1 ? '' : 's'}${r.recibidoPor ? ' · ' + esc(r.recibidoPor) : ''}</span></span>
          <span class="col gap4" style="align-items:flex-end">
            ${r.estado === 'ABIERTA' ? '<span class="tag">Abierta</span>' : '<span class="tag ok">Cerrada</span>'}
            ${r.novedades ? `<span class="tag venc">${r.novedades} con diferencia</span>` : ''}</span>
        </button>`).join('') : '<p class="muted">Todavía no hay facturas. Crea la primera con "+ Nueva factura".</p>'}</div>`;
  }

  function cargarRecepciones() {
    llamar('bdRecepciones', {}).then(l => { rcLista = l; if (vista === 'recibidor') pintarApp(); })
      .catch(e => { rcLista = []; toast(e.message, 'error'); if (vista === 'recibidor') pintarApp(); });
  }

  /* ----- Proveedores: al crear o editar la factura solo se escoge uno de la lista (o se crea) ----- */
  let provLista = null;   // [{ nombre, nit }] · false si todavía no se corrió el script 37
  function asegurarProv(luego) {
    if (provLista !== null) return luego && luego();
    llamar('bdProveedores').then(l => { provLista = l === null ? false : l; }).catch(() => { provLista = false; }).finally(() => luego && luego());
  }
  const provNombres = () => provLista ? provLista.map(p => p.nombre) : [...new Set((rcLista || []).map(r => r.proveedor))];
  const provDe = v => provLista && provLista.find(p => p.nombre.toUpperCase() === String(v || '').trim().toUpperCase());
  // Campo de proveedor: con lista, solo deja escoger de ella; si no está, ofrece crearlo
  function provCampoHtml(id, valor) {
    const hay = provLista && provLista.length;
    return `<div class="mt12"><label class="lbl fila gap8" for="${id}">Proveedor ${hay ? ayudaHtml('Escoge el proveedor de la lista. Si no está, créalo con el botón que aparece debajo.') : ''}</label>
      <input id="${id}" class="campo" list="dl${id}" autocomplete="off" value="${esc(valor)}" oninput="provRevisar('${id}')">
      <datalist id="dl${id}">${provNombres().map(p => `<option value="${esc(p)}">`).join('')}</datalist>
      <div id="${id}Aviso" class="mt4"></div>
      ${puede('rc_facturas') && provLista !== false ? `<button class="link mt4" style="align-self:flex-start" onclick="abrirCargaProv()">${hay ? 'Actualizar' : 'Cargar'} lista de proveedores (Excel)</button>` : ''}</div>`;
  }
  function provRevisar(id) {
    const el = $(id), av = $(id + 'Aviso');
    if (!el || !av) return true;
    const v = el.value.trim();
    if (!provLista || !provLista.length || !v || provDe(v)) { av.innerHTML = ''; return true; }
    av.innerHTML = `<span class="small txt-naranja">«${esc(v)}» no está en la lista de proveedores.</span>
      ${puede('rc_facturas') ? ` <button class="btn btn-sec btn-mini" onclick="crearProveedor('${id}')">+ Crear proveedor ${esc(v.toUpperCase())}</button>` : ''}`;
    return false;
  }
  function crearProveedor(id) {
    const v = $(id).value.trim();
    if (!v) return;
    llamar('bdCrearProveedor', { nombre: v, usuario: ses.nombre }).then(l => {
      provLista = l; $(id).value = v.toUpperCase();
      const dl = $('dl' + id); if (dl) dl.innerHTML = provNombres().map(p => `<option value="${esc(p)}">`).join('');
      provRevisar(id); toast(`Proveedor ${v.toUpperCase()} creado`, 'ok');
    }).catch(e => errForm(e.message));
  }
  // Cargar la lista de proveedores desde Excel (la columna del nombre; el NIT es opcional). Solo agrega, no borra.
  let provVolver = null;
  function abrirCargaProv() {
    provVolver = $('efFac') ? 'editar' : 'nueva';
    abrirModal(`<div class="fila-sb"><span class="h2 fila gap8">Lista de proveedores ${ayudaHtml('Sube un Excel con una columna PROVEEDOR (o NOMBRE / RAZÓN SOCIAL) y, si quieres, otra con el NIT. Se agregan los que no están; no se borra ninguno.')}</span>${btnCerrar()}</div>
      <label for="pvArch" class="btn btn-pri btn-xl mt12" role="button" tabindex="0">Escoger el Excel</label>
      <input id="pvArch" type="file" accept=".xlsx,.xls,.csv" class="oculto">
      <div id="pvCaja" class="mt12"></div><p id="fErr" class="error" hidden></p>
      <button class="btn btn-sec btn-xl mt12" onclick="provVolverA()">Volver</button>`);
    $('pvArch').addEventListener('change', ev => { const f = ev.target.files[0]; if (f) leerProv(f); ev.target.value = ''; });
  }
  function provVolverA() { if (provVolver === 'editar' && rcAct) editarFactura(); else nuevaRecepcion(); }
  let pvTmp = [];
  function leerProv(f) {
    const r = new FileReader();
    r.onload = () => {
      try {
        let filas;
        if (window.XLSX && !/\.csv$/i.test(f.name)) {
          const wb = XLSX.read(new Uint8Array(r.result), { type: 'array' });
          filas = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1, raw: false, defval: '' });
        } else filas = new TextDecoder('utf-8').decode(r.result).split(/\r?\n/).map(l => l.split(/[;\t]/).map(c => c.replace(/^"|"$/g, '').trim()));
        const t = v => sinTilde(String(v || '')).toUpperCase().trim();
        let iCab = filas.findIndex(x => x.some(c => /PROVEEDOR|RAZON SOCIAL|^NOMBRE/.test(t(c))));
        let cNom = 0, cNit = -1;
        if (iCab >= 0) { const cab = filas[iCab].map(t); cNom = cab.findIndex(c => /PROVEEDOR|RAZON SOCIAL|^NOMBRE/.test(c)); cNit = cab.findIndex(c => /NIT|IDENTIFICACION/.test(c)); }
        pvTmp = []; const vistos = new Set();
        filas.slice(iCab + 1).forEach(x => { const n = String(x[cNom] ?? '').trim().replace(/\s+/g, ' '); if (!n || vistos.has(n.toUpperCase())) return; vistos.add(n.toUpperCase()); pvTmp.push({ nombre: n, nit: cNit >= 0 ? String(x[cNit] ?? '').trim() : '' }); });
        const ya = new Set((provLista || []).map(p => p.nombre.toUpperCase())), nuevos = pvTmp.filter(p => !ya.has(p.nombre.toUpperCase()));
        $('pvCaja').innerHTML = `<div class="info"><b>${pvTmp.length}</b> proveedores en el archivo · <b>${nuevos.length}</b> nuevos</div>
          ${nuevos.length ? `<span class="muted small mt8">${nuevos.slice(0, 15).map(p => esc(p.nombre)).join(' · ')}${nuevos.length > 15 ? '…' : ''}</span>
          <button id="pvOk" class="btn btn-pri btn-xl mt12" onclick="guardarProv()">Agregar ${nuevos.length} proveedor${nuevos.length === 1 ? '' : 'es'}</button>` : '<span class="muted small mt8">Todos ya están en la lista.</span>'}`;
      } catch (e) { errForm('No se pudo leer el archivo: ' + e.message); }
    };
    r.readAsArrayBuffer(f);
  }
  function guardarProv() {
    const b = $('pvOk'); b.disabled = true; b.textContent = 'Guardando…';
    llamar('bdCargarProveedores', { filas: pvTmp, usuario: ses.nombre }).then(r => {
      provLista = r.proveedores; toast(`Listo: ${r.agregados} proveedores agregados`, 'ok'); provVolverA();
    }).catch(e => { b.disabled = false; b.textContent = 'Agregar'; errForm(e.message); });
  }

  function nuevaRecepcion() {
    if (sinPermiso('rc_facturas')) return;
    if (provLista === null) return asegurarProv(nuevaRecepcion);
    const def = !provLista || !provLista.length || provDe('NUTRESA') ? 'NUTRESA' : '';
    abrirModal(`<div class="fila-sb"><span class="h2">Nueva factura</span>${btnCerrar()}</div>
      <div class="mt12"><label class="lbl" for="nfFac">Número de factura</label><input id="nfFac" class="campo" autocomplete="off"></div>
      ${provCampoHtml('nfProv', def)}
      <div class="mt12"><label class="lbl" for="nfFecha">Fecha de ingreso</label><input id="nfFecha" type="date" class="campo" value="${hoyISO()}"></div>
      <p id="fErr" class="error" hidden></p>
      <button id="nfOk" class="btn btn-pri btn-xl mt16" onclick="crearRecepcion()">Crear factura</button>`);
    $('nfFac').focus();
  }

  function crearRecepcion() {
    if (!provRevisar('nfProv')) return errForm('Escoge un proveedor de la lista o créalo.');
    const b = $('nfOk'); b.disabled = true; b.textContent = 'Creando…';
    llamar('bdCrearRecepcion', { factura: $('nfFac').value, proveedor: $('nfProv').value, fecha: $('nfFecha').value,
      sedeId: ses.sedeId, usuario: ses.nombre })
      .then(r => { r.items = []; r.evidencias = 0; rcAct = r; rcLista = null; rcEdit = null; cerrarModal(); pintarApp(); if (puede('rc_lista')) abrirLista(); })
      .catch(e => { errForm(e.message); b.disabled = false; b.textContent = 'Crear factura'; });
  }

  function abrirRecepcion(id) {
    llamar('bdRecepcion', id).then(r => { rcAct = r; rcEdit = null; rcPendQ = ''; rcTab = 'recibir'; vista = 'recibidor'; pintarApp(); window.scrollTo(0, 0); })
      .catch(e => toast(e.message, 'error'));
  }

  /* ----- Una factura: lo que dice y lo que llegó ----- */
  // Por producto: lo facturado (se escribe una vez) contra la suma de lo que llegó en todas sus líneas
  function gruposFactura(items) {
    const g = {};
    items.forEach(i => {
      const x = g[i.codigo] || (g[i.codigo] = { codigo: i.codigo, producto: i.producto, unidad: i.unidad, factura: null, llego: 0, lineas: [] });
      if (i.cantFactura !== null) x.factura = (x.factura || 0) + i.cantFactura;
      x.llego += i.cantRecibida;
      x.lineas.push(i);
    });
    return Object.values(g);
  }
  function estadoGrupo(x) {
    if (x.lineas && x.lineas.length && x.lineas.every(i => i.pendiente)) return { cls: 'venc', txt: 'No ha llegado' };
    if (x.factura === null) return { cls: '', txt: 'Sin cantidad de factura' };
    const d = +(x.llego - x.factura).toFixed(3);
    if (d === 0) return { cls: 'ok', txt: 'Llegó completo' };
    return d < 0 ? { cls: 'venc', txt: `Faltan ${nfmt(-d)}` } : { cls: '', txt: `Sobran ${nfmt(d)}` };
  }

  function detalleRecepcion() {
    const r = rcAct;
    const pend = r.items.filter(i => i.pendiente);
    const grupos = gruposFactura(r.items.filter(i => !i.pendiente));
    const todos = gruposFactura(r.items);
    const completos = grupos.filter(x => estadoGrupo(x).cls === 'ok').length;
    const conDif = grupos.filter(x => x.factura !== null && estadoGrupo(x).cls !== 'ok').length;
    const abierta = r.estado === 'ABIERTA';
    return `
      <div class="fila gap8"><button class="btn btn-sec" onclick="rcAct=null; rcLista=null; pintarApp()">← Facturas</button></div>
      <div class="card col gap4">
        <div class="fila-sb wrap-f gap8"><div class="col gap4"><span class="h2">Factura ${esc(r.factura)}</span>
          <span class="muted small">${esc(r.proveedor)} · Ingreso ${fFecha(r.fecha)}${r.recibidoPor ? ' · Recibe ' + esc(r.recibidoPor) : ''}</span></div>
          <span class="fila gap8 wrap-f">${abierta ? '<span class="tag">Abierta</span>' : '<span class="tag ok">Cerrada</span>'}
            ${puede('rc_facturas') ? `<button class="btn btn-sec btn-mini" onclick="editarFactura()">Editar datos</button>
              <button class="btn btn-sec btn-mini txt-rojo" onclick="borrarFactura()">Eliminar factura</button>` : ''}</span></div>
        <div class="ficha-datos mt8">
          <div><span class="muted small">Productos</span><b>${todos.length}</b></div>
          <div><span class="muted small">Por recibir</span><b class="${pend.length ? 'txt-naranja' : ''}">${pend.length}</b></div>
          <div><span class="muted small">Completos</span><b>${completos}</b></div>
          <div><span class="muted small">Con diferencia</span><b class="${conDif ? 'txt-rojo' : ''}">${conDif}</b></div>
          <div><span class="muted small">Fotos</span><b>${r.evidencias || 0}</b></div>
        </div>
      </div>

      ${abierta && puede('recibir') ? '<div class="card col gap8" id="rcForm"></div>' : ''}

      <div class="card col gap8">
        <div class="fila-sb wrap-f gap8"><span class="h3">Lo que debe llegar${pend.length ? ` · ${pend.length} por recibir` : ''}</span>
          ${abierta && pend.length && puede('rc_lista') ? `<span class="fila gap8 wrap-f">
            <button class="btn btn-sec" onclick="abrirLista()">+ Agregar a la lista</button>
            <button class="btn btn-sec txt-rojo" onclick="vaciarLista()">Borrar toda la lista</button></span>` : ''}</div>
        ${pend.length > 1 ? `<div class="rc-pend-buscar">${campoConCamara(`<input id="rcPendQ" class="campo" type="search" autocomplete="off" spellcheck="false" placeholder="Buscar por código Nutresa, Atlantic, nombre o EAN" value="${esc(rcPendQ)}" aria-label="Buscar en lo que debe llegar" oninput="rcPendQ=this.value; rcPintarPend()">`, 'rcPendQ')}</div>` : ''}
        ${pend.length ? `<div class="lista-bp" id="rcPendLista">${rcPendHtml(pend, abierta)}</div>` : ''}
        ${pend.length ? '' : `<span class="muted small">${r.items.some(i => i.cantFactura !== null) ? 'No hay nada pendiente por recibir. Si falta algo de la factura, agrégalo a la lista.'
              : 'Copia aquí lo que dice la factura (código y cantidad) para que el personal solo llene lo que llegó.'}</span>
            ${abierta && puede('rc_lista') ? '<button class="btn btn-pri btn-xl" onclick="abrirLista()">Copiar lista de la factura</button>' : ''}`}
      </div>

      <div class="card col gap8">
        <span class="h3">Lo que ya se recibió (${grupos.length} producto${grupos.length === 1 ? '' : 's'})</span>
        ${grupos.length ? grupos.map(x => {
          const est = estadoGrupo(x);
          return `<div class="prod-card">
            <div class="fila-sb inicio gap8"><div class="fila gap10 inicio" style="min-width:0"><span class="chip">${esc(x.codigo)}</span>
              <div class="col gap4" style="min-width:0"><span class="nombre">${esc(x.producto)}</span>
                <span class="muted small">Factura ${nfmt(x.factura)} · Llegó ${nfmt(x.llego)} ${esc(x.unidad || '')}</span></div></div>
              <span class="tag ${est.cls}">${est.txt}</span></div>
            ${x.lineas.map(i => `<div class="linea-rc">
              <span class="col gap4 flex1" style="min-width:0">
                <span><b>${nfmt(i.cantRecibida)} ${esc(i.unidad || '')}</b> · ${(i.partes || []).length || 1} parte${(i.partes || []).length === 1 ? '' : 's'} · Vence ${fFecha(i.vencimiento)}${i.lote ? ' · Lote ' + esc(i.lote) : ''}</span>
                ${i.novedad ? `<span class="small txt-naranja">${esc(i.novedad)}</span>` : ''}
                ${i.etiquetas.length ? `<span class="small muted">Rótulos: ${i.etiquetas.map(esc).join(', ')}</span>` : ''}</span>
              <span class="fila gap4 wrap-f">
                ${puede('rc_fotos') || i.fotos ? `<button class="btn ${i.fotos ? 'btn-sec' : 'btn-pri'} btn-mini" onclick="abrirEvidencias('${r.id}', '${i.id}')">${ICONOS.camara}<span>${i.fotos ? `Fotos (${i.fotos})` : 'Foto'}</span></button>` : ''}
                ${i.etiquetas.length && (puede('recibir') || puede('rotular')) ? `<button class="btn btn-sec btn-mini" onclick="imprimirDeItem('${i.id}')">Imprimir</button>` : ''}
                ${abierta && puede('rc_corregir') ? `<button class="btn btn-sec btn-mini" onclick="corregirItem('${i.id}')">Corregir</button>` : ''}
                ${abierta && puede('recibir') ? `<button class="btn btn-sec btn-mini" onclick="otroVencimiento('${esc(i.codigo)}')">+ Agregar más</button>` : ''}</span>
            </div>`).join('')}
          </div>`;
        }).join('') : '<p class="muted">Todavía no has recibido productos en esta factura.</p>'}
      </div>

      ${!puede('rc_cerrar') ? '' : abierta ? `<button class="btn btn-pri btn-xl btn-cerrar-fac" onclick="confirmarCierre()">Terminé: cerrar factura</button>`
        : `<button class="btn btn-sec btn-xl btn-cerrar-fac" onclick="estadoRecepcion('ABIERTA')">Reabrir factura</button>`}`;
  }

  // Lo que debe llegar, con buscador (código Nutresa, Atlantic, nombre o EAN)
  let rcPendQ = '';
  function rcPendHtml(pend, abierta) {
    const t = rcPendQ.trim(), pr = t && buscarProducto(t), pal = sinTilde(t).split(/\s+/).filter(Boolean);
    const l = pend.filter(i => { if (!t) return true; if (pr) return i.codigo === pr.id; const q = prodDe(i.codigo) || {};
      return pal.every(w => sinTilde(`${i.codigo} ${i.producto} ${q.codigoNutresa || ''} ${q.codigoBarras || ''} ${q.ean2 || ''} ${q.ean14 || ''}`).includes(w)); });
    if (!l.length) return `<p class="muted small">${pr ? `${esc(pr.nombre)} no está en lo que debe llegar. Si llegó, recíbelo arriba.` : 'Ningún producto de la lista coincide con la búsqueda.'}</p>`;
    return l.map(i => { const q = prodDe(i.codigo) || {}; return `<div class="pend-item">
            <span class="chip">${esc(i.codigo)}</span>
            <span class="col gap4 flex1" style="min-width:0"><span class="nombre">${esc(i.producto)}</span>
              <span class="muted small">${q.codigoNutresa ? `Nutresa ${esc(q.codigoNutresa)} · ` : ''}Debe llegar <b>${nfmt(i.cantFactura)} ${unidadTxt(i.unidad, i.cantFactura)}</b></span></span>
            ${abierta ? (puede('recibir') || puede('rc_lista') ? `<span class="fila gap4">${puede('recibir') ? `<button class="btn btn-pri" onclick="recibirDeLista('${i.id}')">Recibir</button>` : ''}
              ${puede('rc_lista') ? `<button class="icono icono-claro" aria-label="Quitar de la lista" onclick="quitarDeLista('${i.id}')">${ICONOS.cerrar}</button>` : ''}</span>` : '<span class="tag amar">Por recibir</span>') : '<span class="tag venc">No llegó</span>'}
          </div>`; }).join('');
  }
  function rcPintarPend() {
    const c = $('rcPendLista');
    if (c && rcAct) c.innerHTML = rcPendHtml(rcAct.items.filter(i => i.pendiente), rcAct.estado === 'ABIERTA');
  }

  /* ----- Recibir un producto por partes (cada parte = una estiba = un rótulo) ----- */
  // Borrador del producto que se está bajando; se guarda en el celular por si se recarga la página
  let rb = null;
  const guardarRb = () => guardarLS('rcBorrador', rb);

  const mismoTxt = (a, b) => String(a || '').trim().toUpperCase() === String(b || '').trim().toUpperCase();
  // Unidad en que llega un producto: la del proveedor (UM proveedor) y, si no tiene, la unidad de medida del producto
  function umRecibo(p) {
    const u = sinTilde((p && (p.umProveedor || p.unidadMedida)) || '').toUpperCase().trim();
    if (/^K/.test(u)) return 'KG';
    if (/^(UN|UND|UNIDAD|U$|ST|PZ|PAQ|BOL|BL)/.test(u)) return 'UND';
    return 'CJ';
  }
  // Lotes de este producto: los que ya se guardaron en la factura y los que van en este borrador
  function rbLotes(cod) {
    const l = [];
    const poner = (lote, venc, guardado) => { if (lote && venc && !l.some(x => mismoTxt(x.lote, lote) && x.venc === venc)) l.push({ lote, venc, guardado }); };
    rb.partes.forEach(x => poner(x.lote, x.venc, false));
    rcAct.items.filter(i => i.codigo === cod && !i.pendiente).forEach(i => poner(i.lote, i.vencimiento, true));
    return l;
  }
  // Partes anotadas, agrupadas por lote y vencimiento
  function rbGrupos() {
    const g = [];
    rb.partes.forEach((x, i) => {
      let y = g.find(z => mismoTxt(z.lote, x.lote) && z.venc === x.venc);
      if (!y) g.push(y = { lote: x.lote || '', venc: x.venc || '', partes: [], idx: [] });
      y.partes.push(x); y.idx.push(i);
    });
    return g;
  }
  function rbGruposHtml() {
    return rbGrupos().map(g => {
      const tot = rb.tipo === 'PESO' ? kg(g.partes.reduce((a, x) => a + x.neto, 0)) : `${g.partes.reduce((a, x) => a + x.cajas, 0)} cj · ${g.partes.reduce((a, x) => a + x.cajas * x.und, 0)} und`;
      return `<div class="rb-lote"><div class="fila-sb gap8"><b>Lote ${esc(g.lote || '—')} · vence ${fFecha(g.venc)}</b><span class="small">${tot}</span></div>
        <div class="lista-bp">${g.partes.map((x, k) => { const i = g.idx[k]; return `<div class="estiba">
        <span class="chip">${i + 1}</span>
        <span class="col gap4 flex1" style="min-width:0">${rb.tipo === 'PESO'
          ? `<b>${kg(x.neto)}</b><span class="muted small">${x.nc} cavas × ${x.pc} kg · estiba ${x.pe} kg · báscula ${x.pb} kg</span>`
          : `<b>${x.cajas} cj × ${x.und} = ${x.cajas * x.und} und</b>`}</span>
        ${rb.final ? '' : `<button class="icono icono-claro" aria-label="Quitar parte ${i + 1}" onclick="rb.partes.splice(${i}, 1); guardarRb(); pintarRbForm()">${ICONOS.cerrar}</button>`}
      </div>`; }).join('')}</div></div>`;
    }).join('');
  }

  function borradorNuevo(codigo) {
    const p = codigo ? prodDe(codigo) : null;
    const um = umRecibo(p), peso = um === 'KG';
    const b = { recId: rcAct.id, codigo: p ? p.id : '', tipo: peso ? 'PESO' : 'NORMAL', fac: '', unidadFac: um,
      partes: [], pc: '', pe: '', final: false, lote: '', venc: '' };
    // Si el producto está en la lista de la factura, se llena esa línea
    const pend = p && rcAct.items.find(i => i.pendiente && i.codigo === p.id);
    if (pend) {
      b.itemId = pend.id;
      b.unidadFac = pend.unidad || b.unidadFac;
      b.tipo = b.unidadFac === 'KG' ? 'PESO' : (pend.tipo || 'NORMAL');
    }
    return b;
  }
  const unidadTxt = (u, n) => (Number(n) === 1 ? { CJ: 'caja', UND: 'unidad', KG: 'kg' } : { CJ: 'cajas', UND: 'unidades', KG: 'kg' })[u] || (u || '');
  const pendDeRb = () => rb && rb.itemId ? rcAct.items.find(i => i.id === rb.itemId && i.pendiente) : null;

  function enlazarRecibidor() {
    if (!$('rcForm')) return;
    const g = leerLS('rcBorrador');
    if (!rb || rb.recId !== rcAct.id) rb = g && g.recId === rcAct.id ? g : borradorNuevo();
    pintarRbForm();
  }

  // Cuánto lleva en la misma unidad de la factura
  function totalPartes() {
    const p = prodDe(rb.codigo);
    if (rb.tipo === 'PESO') return { valor: +rb.partes.reduce((a, x) => a + x.neto, 0).toFixed(2), unidad: 'KG' };
    const cajas = rb.partes.reduce((a, x) => a + x.cajas, 0);
    const und = rb.partes.reduce((a, x) => a + x.cajas * x.und, 0);
    return rb.unidadFac === 'UND' ? { valor: und, unidad: 'UND', cajas, und } : { valor: cajas, unidad: 'CJ', cajas, und, p };
  }

  // Lo que ya está escrito en la factura para este producto (otro vencimiento)
  const facturaPrevia = cod => rcAct.items.filter(i => i.codigo === cod && i.cantFactura !== null);

  function pintarRbForm() {
    const caja = $('rcForm');
    if (!caja) return;
    const p = prodDe(rb.codigo);
    if (!p) {
      const hayLista = rcAct.items.some(i => i.pendiente);
      caja.innerHTML = `<span class="h3">Recibir un producto</span>
        ${hayLista ? '<span class="muted small">Toca <b>Recibir</b> en la lista de abajo, o escanea el producto aquí.</span>' : ''}
        <label class="lbl" for="rcProd">1. Producto (código AFS, escanea o busca)</label>
        ${campoConCamara('<input id="rcProd" class="campo" list="dlProductos" autocomplete="off">', 'rcProd')}
        <p id="fErr" class="error" hidden></p>`;
      const c = $('rcProd');
      const elegir = enter => rcElegirProd(c.value, enter);
      c.addEventListener('change', () => elegir(false));
      c.addEventListener('keydown', ev => { if (ev.key === 'Enter') { ev.preventDefault(); elegir(true); } });
      return;
    }
    const previas = facturaPrevia(p.id);
    const n = rb.partes.length + 1;
    const lotes = rbLotes(p.id);
    const loteSel = lotes.find(l => mismoTxt(l.lote, rb.lote) && l.venc === rb.venc);
    caja.innerHTML = `
      <div class="fila-sb inicio gap8"><div class="fila gap10 inicio" style="min-width:0"><span class="chip">${esc(p.id)}</span>
        <span class="nombre">${esc(p.nombre)}</span></div>
        <button class="link" onclick="descartarRb()">${rb.partes.length ? 'Descartar' : 'Cambiar'}</button></div>

      ${pendDeRb() ? `<div class="total-op"><span>Según la factura debe llegar <b>${nfmt(pendDeRb().cantFactura)} ${unidadTxt(pendDeRb().unidad, pendDeRb().cantFactura)}</b>. Anota lo que llegó de verdad.</span></div>`
        : previas.length ? `<span class="muted small">Factura de este producto: <b>${nfmt(previas.reduce((a, i) => a + i.cantFactura, 0))} ${esc(previas[0].unidad || '')}</b> (ya escrita en la otra línea)</span>`
        : `<div><label class="lbl" for="rbFac">¿Cuánto debe llegar? (según factura)</label>
        <div class="fila gap8"><input id="rbFac" class="campo flex1" type="number" inputmode="decimal" step="any" min="0" value="${esc(rb.fac)}">
          <select id="rbUF" class="campo" style="width:auto" ${rb.partes.length ? 'disabled' : ''}>${[['CJ', 'Cajas'], ['UND', 'Unidades'], ['KG', 'Kilogramos']]
            .map(([v, t]) => `<option value="${v}" ${rb.unidadFac === v ? 'selected' : ''}>${t}</option>`).join('')}</select>
        </div></div>`}

      ${rb.final ? '' : `<div class="peso-caja">
        <span class="h3">Parte ${n}</span>
        <span class="lbl">1. Lote y vencimiento ${ayudaHtml('Si lo que llegó tiene varios vencimientos, agrega una parte por cada lote. Para sumarle a un lote que ya anotaste (o que ya se guardó en esta factura), escógelo en la lista.')}</span>
        ${lotes.length ? `<select id="rbLoteSel" class="campo" aria-label="Lote">
            ${lotes.map((l, k) => `<option value="${k}" ${loteSel === l ? 'selected' : ''}>Lote ${esc(l.lote)} · vence ${fFecha(l.venc)}${l.guardado ? ' (ya guardado)' : ''}</option>`).join('')}
            <option value="nuevo" ${loteSel ? '' : 'selected'}>+ Otro lote (nuevo)</option></select>` : ''}
        <div class="dos" id="rbLoteNuevo" ${loteSel ? 'hidden' : ''}>
          <div><label class="lbl" for="rbLote">Lote</label><input id="rbLote" class="campo" autocomplete="off" value="${esc(loteSel ? '' : rb.lote || '')}"></div>
          <div><label class="lbl" for="rbVen">Fecha de vencimiento</label><input id="rbVen" type="date" class="campo" value="${esc(loteSel ? '' : rb.venc || '')}"></div>
        </div>
        <span class="lbl">2. Tipo de mercancía</span>
        <div class="seg" role="group" aria-label="Tipo de mercancía">
          <button class="${rb.tipo === 'NORMAL' ? 'on' : ''}" onclick="rbTipo('NORMAL')" ${rb.partes.length ? 'disabled' : ''}>Normal</button>
          <button class="${rb.tipo === 'PESO' ? 'on' : ''}" onclick="rbTipo('PESO')" ${rb.partes.length ? 'disabled' : ''}>Peso variable</button>
        </div>
        <span class="lbl">3. Cantidad</span>
        ${rb.tipo === 'NORMAL' ? `<div class="dos">
            <div><label class="lbl" for="rbCj">Número de cajas</label><input id="rbCj" class="campo" type="number" inputmode="numeric" min="1"></div>
            <div><label class="lbl" for="rbUnd">Unidades por caja</label><input id="rbUnd" class="campo" type="number" inputmode="numeric" min="1" value="${rb.undX || p.undPorCaja}"></div>
          </div>` : `<div class="dos">
            <div><label class="lbl" for="rbPC">Peso de cada cava (kg)</label><input id="rbPC" class="campo" type="number" inputmode="decimal" step="any" min="0" value="${esc(rb.pc)}"></div>
            <div><label class="lbl" for="rbNC">¿Cuántas cavas?</label><input id="rbNC" class="campo" type="number" inputmode="numeric" min="1"></div>
          </div><div class="dos">
            <div><label class="lbl" for="rbPE">Peso de la estiba (kg)</label><input id="rbPE" class="campo" type="number" inputmode="decimal" step="any" min="0" value="${esc(rb.pe)}"></div>
            <div><label class="lbl" for="rbPB">Peso en báscula (kg)</label><input id="rbPB" class="campo" type="number" inputmode="decimal" step="any" min="0"></div>
          </div>`}
        <div id="rbCalc" class="calc"></div>
        <p id="fErr" class="error" hidden></p>
        <button class="btn btn-pri btn-xl" onclick="agregarParte()">+ Agregar parte ${n}</button>
      </div>`}

      ${rb.partes.length ? rbGruposHtml() : ''}

      <div id="rbResumen" class="total-op" aria-live="polite">${resumenRbHtml()}</div>

      ${rb.partes.length && !rb.final ? `<button class="btn btn-ent btn-xl" onclick="rb.final = true; guardarRb(); pintarRbForm()">Terminé de bajar este producto</button>` : ''}
      ${rb.final ? `<div class="peso-caja">
        <span class="h3">Para terminar</span>
        <div class="dos">
          <div><label class="lbl" for="rbRec">Fecha de recibo</label><input id="rbRec" type="date" class="campo" value="${esc(rcAct.fecha || hoyISO())}"></div>
          <div class="resp-fijo"><span class="lbl">Responsable</span><span class="resp-nom">${esc(ses.nombre)}</span></div>
        </div>
        <label class="lbl" for="rbNov">Novedad (opcional)</label><input id="rbNov" class="campo" placeholder="Ej. 2 cajas golpeadas" autocomplete="off">
        <p id="fErr" class="error" hidden></p>
        <div class="fila gap8 wrap-f">
          <button class="btn btn-sec btn-xl" onclick="rb.final = false; guardarRb(); pintarRbForm()">Volver</button>
          <button id="rbOk" class="btn btn-pri btn-xl flex1" onclick="guardarRecibido()">Guardar y crear ${rb.partes.length} rótulo${rb.partes.length === 1 ? '' : 's'}</button>
        </div>
      </div>` : ''}`;

    const f = $('rbFac');
    if (f) f.addEventListener('input', () => { rb.fac = f.value; guardarRb(); actualizarResumenRb(); });
    const uf = $('rbUF');
    if (uf) uf.addEventListener('change', () => { rb.unidadFac = uf.value; rb.tipo = uf.value === 'KG' ? 'PESO' : 'NORMAL'; guardarRb(); pintarRbForm(); });
    const ls = $('rbLoteSel');
    if (ls) ls.addEventListener('change', () => {
      const l = lotes[Number(ls.value)];
      if (l) { rb.lote = l.lote; rb.venc = l.venc; } else { rb.lote = ''; rb.venc = ''; }
      $('rbLoteNuevo').hidden = !!l;
      if (!l) { $('rbLote').value = ''; $('rbVen').value = ''; $('rbLote').focus(); }
      guardarRb();
    });
    ['rbLote', 'rbVen'].forEach(id => { const el = $(id); if (el) el.addEventListener('input', () => { rb[id === 'rbLote' ? 'lote' : 'venc'] = el.value.trim(); guardarRb(); }); });
    ['rbCj', 'rbUnd', 'rbPC', 'rbNC', 'rbPE', 'rbPB'].forEach(id => { const el = $(id); if (el) el.addEventListener('input', calcParte); });
    calcParte();
  }

  // Producto escrito, escaneado (código, EAN del producto o de la caja) o buscado
  function rcElegirProd(v, enter) {
    const t = String(v || '').trim(), pr = buscarProducto(t.split(' · ')[0]) || buscarProducto(t);
    if (pr) { rb = borradorNuevo(pr.id); guardarRb(); pintarRbForm(); setTimeout(() => { const l = $('rbLote'); if (l && !l.closest('[hidden]')) l.focus(); }, 30); return; }
    const e = t.replace(/\s+/g, '');
    if (pareceEan(e)) return eanNuevoEn(e, 'rcProd');   // EAN que no está: ponérselo a un producto
    if (enter && t) errForm('No hay un producto con ese código. Búscalo por código o nombre.');
  }
  function actualizarResumenRb() { if ($('rbResumen')) $('rbResumen').innerHTML = resumenRbHtml(); }

  // Suma de lo que llevan contra lo que dice la factura
  function resumenRbHtml() {
    if (!rb.partes.length) return '<span class="muted small">Aquí va la suma de lo que van bajando.</span>';
    const t = totalPartes();
    const previas = facturaPrevia(rb.codigo);
    const fac = previas.length ? previas.reduce((a, i) => a + i.cantFactura, 0) - rcAct.items.filter(i => i.codigo === rb.codigo).reduce((a, i) => a + i.cantRecibida, 0) : num(rb.fac);
    const uTxt = { CJ: 'cajas', UND: 'unidades', KG: 'kg' }[t.unidad];
    const u1 = v => (Number(v) === 1 ? { CJ: 'caja', UND: 'unidad', KG: 'kg' }[t.unidad] : uTxt);
    const lleva = `Llevan <b>${nfmt(t.valor)} ${uTxt}</b>${rb.tipo === 'NORMAL' ? ` (${t.cajas} cj · ${t.und} und)` : ''} en ${rb.partes.length} parte${rb.partes.length === 1 ? '' : 's'}`;
    if (fac === null) return `<span>${lleva}</span>`;
    const d = +(fac - t.valor).toFixed(2);
    return `<span>${lleva} de <b>${nfmt(fac)} ${uTxt}</b>${previas.length && !pendDeRb() ? ' (lo que falta de la factura)' : ''}</span>
      <b class="${d === 0 ? 'txt-verde' : d > 0 ? 'txt-rojo' : 'txt-naranja'}">${d === 0 ? 'Ya llegó todo' : d > 0 ? `Falta${d === 1 ? '' : 'n'} ${nfmt(d)} ${u1(d)}` : `Sobra${d === -1 ? '' : 'n'} ${nfmt(-d)} ${u1(-d)}`}</b>`;
  }

  function rbTipo(t) {
    rb.tipo = t;
    rb.unidadFac = t === 'PESO' ? 'KG' : (rb.unidadFac === 'UND' ? 'UND' : 'CJ');
    guardarRb(); pintarRbForm();
  }

  // Muestra al instante el total de la parte que están bajando
  function calcParte() {
    const c = $('rbCalc');
    if (!c) return;
    if (rb.tipo === 'NORMAL') {
      const cj = num($('rbCj').value), u = num($('rbUnd').value);
      c.innerHTML = cj > 0 && u > 0 ? `Esta parte: <b>${cj} cj × ${u} = ${cj * u} und</b>` : '<span class="muted small">Escribe las cajas de esta parte.</span>';
      return;
    }
    const pc = num($('rbPC').value) || 0, nc = num($('rbNC').value), pe = num($('rbPE').value) || 0, pb = num($('rbPB').value);
    rb.pc = $('rbPC').value; rb.pe = $('rbPE').value;
    if (!(nc > 0) || !(pb > 0)) { c.innerHTML = '<span class="muted small">Escribe las cavas y el peso de la báscula.</span>'; return; }
    const neto = pb - pe - pc * nc;
    c.innerHTML = `Cavas ${nc} × ${pc} = ${kg(pc * nc)} · Neto: ${kg(pb)} − ${kg(pe)} − ${kg(pc * nc)} = <b class="${neto > 0 ? '' : 'txt-rojo'}">${kg(neto)}</b>`;
  }

  function agregarParte() {
    const nuevo = !$('rbLoteSel') || $('rbLoteSel').value === 'nuevo';
    const lote = nuevo ? $('rbLote').value.trim() : rb.lote, venc = nuevo ? $('rbVen').value : rb.venc;
    if (!lote) { if ($('rbLote')) $('rbLote').focus(); return errForm('Escribe el lote de esta parte.'); }
    if (!venc) { if ($('rbVen')) $('rbVen').focus(); return errForm('Escribe la fecha de vencimiento de esta parte.'); }
    rb.lote = lote; rb.venc = venc;
    if (rb.tipo === 'NORMAL') {
      const cj = num($('rbCj').value), u = num($('rbUnd').value);
      if (!(cj > 0)) return errForm('Escribe el número de cajas de esta parte.');
      if (!(u > 0)) return errForm('Escribe las unidades por caja.');
      rb.undX = u;
      rb.partes.push({ cajas: cj, und: u, lote, venc });
    } else {
      const pc = num($('rbPC').value) || 0, nc = num($('rbNC').value), pe = num($('rbPE').value) || 0, pb = num($('rbPB').value);
      if (!(nc > 0)) return errForm('Escribe cuántas cavas trae esta parte.');
      if (!(pb > 0)) return errForm('Escribe el peso de la báscula.');
      const neto = +(pb - pe - pc * nc).toFixed(2);
      if (neto <= 0) return errForm(`El peso neto da ${kg(neto)}. Revisa los pesos.`);
      rb.partes.push({ pc, nc, pe, pb, neto, lote, venc });
    }
    guardarRb();
    pitido();
    pintarRbForm();
    const s = $('rbCj') || $('rbNC');
    if (s) s.focus();
  }

  function descartarRb() {
    if (rb.partes.length && !rb.confirmarDescarte) {
      rb.confirmarDescarte = true;
      return toast('Toca "Descartar" otra vez para borrar las partes anotadas', 'error');
    }
    rb = borradorNuevo(); guardarRb(); pintarRbForm();
  }

  // Al terminar: crea un rótulo por cada parte y guarda el producto en la factura
  async function guardarRecibido() {
    const p = prodDe(rb.codigo);
    const recibo = $('rbRec').value, resp = ses.nombre;
    if (!recibo) return errForm('Escribe la fecha de recibo.');
    if (rb.partes.some(x => !x.lote || !x.venc)) return errForm('Hay partes sin lote o sin vencimiento: quítalas y agrégalas otra vez.');
    if (!resp) return errForm('Elige el responsable.');
    guardarLS('ultResp', resp);
    const b = $('rbOk'); b.disabled = true; b.textContent = 'Guardando…';
    const creados = [], etqDe = [];
    try {
      for (const x of rb.partes) {
        const datos = rb.tipo === 'PESO'
          ? { tipo: 'PESO', codigo: p.id, numCavas: x.nc, pesoCava: x.pc, pesoEstiba: x.pe, pesoBascula: x.pb, recibo, vencimiento: x.venc, responsable: resp, usuario: ses.nombre }
          : { tipo: 'NORMAL', codigo: p.id, cajas: x.cajas, undXCaja: x.und, recibo, vencimiento: x.venc, responsable: resp, usuario: ses.nombre };
        const e = await llamar('bdCrearEtiqueta', Object.assign({ sedeId: ses.sedeId }, datos));
        creados.push(e); etqDe.push(e.id);
      }
      if (rb.tipo === 'NORMAL' && rb.undX) p.undPorCaja = rb.undX;
      const previas = facturaPrevia(p.id), pend = pendDeRb();
      // Cada lote + vencimiento va en su línea, con la cantidad en la unidad de la factura
      const cantDe = ps => rb.tipo === 'PESO' ? +ps.reduce((a, x) => a + x.neto, 0).toFixed(2)
        : rb.unidadFac === 'UND' ? ps.reduce((a, x) => a + x.cajas * x.und, 0) : ps.reduce((a, x) => a + x.cajas, 0);
      const grupos = rbGrupos().map(g => ({ lote: g.lote, vencimiento: g.venc, partes: g.partes, etiquetas: g.idx.map(i => etqDe[i]), cantidad: cantDe(g.partes) }));
      rcAct = await llamar('bdGuardarRecibido', {
        recepcionId: rcAct.id, codigo: p.id, tipo: rb.tipo, unidad: totalPartes().unidad, pendId: pend ? pend.id : null,
        cantFactura: pend || previas.length ? '' : rb.fac, novedad: $('rbNov').value, usuario: ses.nombre, grupos
      });
    } catch (err) {
      errForm(err.message + (creados.length ? ` (alcanzaron a crearse los rótulos ${creados.map(e => e.id).join(', ')})` : ''));
      b.disabled = false; b.textContent = 'Intentar de nuevo';
      return;
    }
    rotulos = creados.slice().reverse().concat(rotulos || []);
    rb = borradorNuevo(); guardarRb();
    pitido();
    pintarApp();
    preguntarImpresion(creados);
  }

  // ¿Cuáles imprimo? (los rótulos que se acaban de crear)
  function preguntarImpresion(lista) {
    imprimiendo = lista;
    abrirModal(`<div class="fila-sb"><span class="h2">Rótulos creados</span>${btnCerrar()}</div>
      <span class="muted small mt8">Marca los que vas a imprimir. Los demás los puedes imprimir después desde la factura o desde Rotular.</span>
      <div class="lista-bp mt12">${lista.map((e, i) => `<label class="estiba" style="cursor:pointer">
        <input type="checkbox" class="impSel2" data-i="${i}" checked>
        <span class="col gap4 flex1" style="min-width:0"><b>${esc(e.id)} · ${esc(e.producto)}</b>
          <span class="muted small">${e.cajas} cj · ${e.tipo === 'PESO' ? kg(e.total) : e.total + ' und'} · vence ${fCorta(e.vencimiento)}</span></span></label>`).join('')}</div>
      <div class="dos mt12">
        <div><label class="lbl" for="ipCopias">Copias de cada uno <span class="muted small">(mismo código)</span></label><input id="ipCopias" class="campo" type="number" inputmode="numeric" min="1" max="20" value="1"></div>
        <div><label class="lbl" for="ipTam">Tamaño del papel</label>
          <select id="ipTam" class="campo">
            <option value="carta" ${leerLS('rtTam') !== '10x15' ? 'selected' : ''}>Hoja carta (horizontal)</option>
            <option value="10x15" ${leerLS('rtTam') === '10x15' ? 'selected' : ''}>Etiqueta 15 × 10 cm</option>
          </select></div>
      </div>
      <p id="fErr" class="error" hidden></p>
      <div class="dos mt16"><button class="btn btn-sec btn-xl" onclick="cerrarModal()">Ahora no</button>
        <button class="btn btn-pri btn-xl" onclick="imprimirElegidos()">Imprimir</button></div>`);
  }
  let imprimiendo = [];

  function imprimirElegidos() {
    const lista = [...document.querySelectorAll('.impSel2')].filter(c => c.checked).map(c => imprimiendo[Number(c.dataset.i)]);
    if (!lista.length) return errForm('Marca al menos un rótulo.');
    const tam = $('ipTam').value;
    guardarLS('rtTam', tam);
    const copias = Math.max(1, Math.min(20, Number($('ipCopias').value) || 1));
    cerrarModal();
    imprimirRotulo(lista, copias, tam);
  }

  // Volver a imprimir los rótulos de un producto ya recibido
  function imprimirDeItem(id) {
    const it = rcAct.items.find(x => x.id === id);
    llamar('bdEtiquetas', ses.sedeId).then(l => {
      rotulos = l;
      const lista = it.etiquetas.map(eid => l.find(e => e.id === eid)).filter(Boolean);
      if (!lista.length) return toast('No encontré esos rótulos', 'error');
      preguntarImpresion(lista);
    }).catch(e => toast(e.message, 'error'));
  }

  // Datos de la factura: número, proveedor y fecha
  function editarFactura() {
    if (sinPermiso('rc_facturas')) return;
    if (provLista === null) return asegurarProv(editarFactura);
    const r = rcAct;
    abrirModal(`<div class="fila-sb"><span class="h2">Editar datos de la factura</span>${btnCerrar()}</div>
      <div class="mt12"><label class="lbl" for="efFac">Número de factura</label><input id="efFac" class="campo" autocomplete="off" value="${esc(r.factura)}"></div>
      ${provCampoHtml('efProv', r.proveedor)}
      <div class="mt12"><label class="lbl" for="efFecha">Fecha de ingreso</label><input id="efFecha" type="date" class="campo" value="${esc(r.fecha || '')}"></div>
      <span class="muted small mt8">Lo recibido, los rótulos y las fotos se quedan igual.</span>
      <p id="fErr" class="error" hidden></p>
      <div class="dos mt16"><button class="btn btn-sec btn-xl" onclick="cerrarModal()">Cancelar</button>
        <button id="efOk" class="btn btn-pri btn-xl" onclick="guardarDatosFactura()">Guardar</button></div>`);
  }
  function guardarDatosFactura() {
    const factura = $('efFac').value.trim(), proveedor = $('efProv').value.trim(), fecha = $('efFecha').value;
    if (!factura) return errForm('Escribe el número de la factura.');
    if (!proveedor) return errForm('Escribe el proveedor.');
    if (proveedor.toUpperCase() !== String(rcAct.proveedor).toUpperCase() && !provRevisar('efProv')) return errForm('Escoge un proveedor de la lista o créalo.');
    if (!fecha) return errForm('Elige la fecha de ingreso.');
    const b = $('efOk'); b.disabled = true; b.textContent = 'Guardando…';
    llamar('bdGuardarRecepcion', { id: rcAct.id, factura, proveedor, fecha }).then(r => {
      rcAct = r; rcLista = null; cerrarModal(); toast('Datos de la factura guardados', 'ok'); pintarApp();
    }).catch(e => { errForm(e.message); b.disabled = false; b.textContent = 'Guardar'; });
  }

  // Eliminar una factura creada por error
  function borrarFactura() {
    if (sinPermiso('rc_facturas')) return;
    const r = rcAct, rot = r.items.reduce((n, i) => n + (i.etiquetas || []).length, 0), fotos = r.evidencias || 0;
    abrirModal(`<div class="fila-sb"><span class="h2">¿Eliminar la factura ${esc(r.factura)}?</span>${btnCerrar()}</div>
      <span class="mt12">${esc(r.proveedor)} · ${fFecha(r.fecha)}. Se borra todo lo de esta factura:</span>
      <ul class="small mt8"><li>${r.items.length} producto${r.items.length === 1 ? '' : 's'} (lo que debía llegar y lo recibido)</li>
        <li>${fotos} foto${fotos === 1 ? '' : 's'}</li>
        <li>${rot} rótulo${rot === 1 ? '' : 's'}: quedan <b>anulados</b> (si ya los imprimiste, bota el papel)</li></ul>
      <span class="small mt8">Si alguno de sus rótulos ya se ubicó en el plano, no se puede eliminar: corrige solo lo que está mal con <b>Editar datos</b> o <b>Corregir</b>.</span>
      <label class="lbl mt12" for="bfConf">Para confirmar, escribe el número de la factura</label>
      <input id="bfConf" class="campo" autocomplete="off" placeholder="${esc(r.factura)}">
      <p id="fErr" class="error" hidden></p>
      <div class="dos mt16"><button class="btn btn-sec btn-xl" onclick="cerrarModal()">No</button>
        <button id="bfOk" class="btn btn-sal btn-xl" onclick="confirmarBorrarFactura()">Sí, eliminar</button></div>`);
    $('bfConf').focus();
  }
  function confirmarBorrarFactura() {
    if ($('bfConf').value.trim().toUpperCase() !== String(rcAct.factura).trim().toUpperCase()) return errForm('El número no coincide con el de la factura.');
    const b = $('bfOk'); b.disabled = true; b.textContent = 'Eliminando…';
    const fac = rcAct.factura;
    llamar('bdBorrarRecepcion', { id: rcAct.id, usuario: ses.nombre }).then(() => {
      rcAct = null; rcLista = null; cerrarModal(); toast(`Factura ${fac} eliminada`, 'ok'); pintarApp();
    }).catch(e => { errForm(e.message); b.disabled = false; b.textContent = 'Sí, eliminar'; });
  }

  // Corregir lo escrito: producto, vencimiento, lote, novedad y cantidad de factura
  // (la cantidad que llegó ya tiene rótulo: esa se corrige en Rotular → Editar)
  function corregirItem(id) {
    if (sinPermiso('rc_corregir')) return;
    const i = rcAct.items.find(x => x.id === id);
    abrirModal(`<div class="fila-sb"><span class="h2">Corregir</span>${btnCerrar()}</div>
      <span class="muted small mt8">${esc(i.codigo)} · ${esc(i.producto)} · ${nfmt(i.cantRecibida)} ${esc(i.unidad || '')}${i.etiquetas.length ? ' · rótulos ' + i.etiquetas.map(esc).join(', ') : ''}</span>
      <div class="mt12"><label class="lbl" for="ciProd">Producto</label>
        ${campoConCamara(`<input id="ciProd" class="campo" list="dlProductos" autocomplete="off" spellcheck="false" value="${esc(i.codigo + ' · ' + i.producto)}">`, 'ciProd')}</div>
      <div class="mt12"><label class="lbl" for="ciVen">Vencimiento</label><input id="ciVen" class="campo" type="date" value="${esc(i.vencimiento || '')}"></div>
      ${i.etiquetas.length ? '<span class="muted small mt4">Si cambias el producto o el vencimiento, sus rótulos también se corrigen y quedan para volver a imprimir. Para cambiar cuánto llegó, ve a Rotular → Editar.</span>' : ''}
      <div class="mt12"><label class="lbl" for="ciFac">Cantidad en factura (${esc(i.unidad || '')})</label>
        <input id="ciFac" class="campo" type="number" inputmode="decimal" step="any" min="0" value="${i.cantFactura === null ? '' : i.cantFactura}"></div>
      <div class="mt12"><label class="lbl" for="ciLote">Lote</label><input id="ciLote" class="campo" value="${esc(i.lote)}" autocomplete="off"></div>
      <div class="mt12"><label class="lbl" for="ciNov">Novedad</label><input id="ciNov" class="campo" value="${esc(i.novedad)}" autocomplete="off"></div>
      <p id="fErr" class="error" hidden></p>
      <div class="dos mt16"><button class="btn btn-sal btn-xl" onclick="borrarItem('${id}')">Borrar línea</button>
        <button id="ciOk" class="btn btn-pri btn-xl" onclick="guardarCorreccion('${id}')">Guardar</button></div>`);
  }

  async function guardarCorreccion(id) {
    const i = rcAct.items.find(x => x.id === id);
    if (!$('ciLote').value.trim()) return errForm('Escribe el lote.');
    const p = buscarProducto($('ciProd').value.split(' · ')[0]) || buscarProducto($('ciProd').value);
    if (!p) return errForm('Escribe o escanea el producto correcto.');
    const venc = $('ciVen').value || null;
    const cambiaProd = p.id !== i.codigo, cambiaVen = (venc || '') !== (i.vencimiento || '');
    const b = $('ciOk'); b.disabled = true; b.textContent = 'Guardando…';
    try {
      // Primero los rótulos (si alguno ya está ubicado con el producto equivocado, no se cambia nada)
      let corregidos = [];
      if ((cambiaProd || cambiaVen) && i.etiquetas.length) {
        const motivo = `Corrección en la factura ${rcAct.factura}: ${[cambiaProd ? `producto ${i.codigo} → ${p.id}` : '', cambiaVen ? `vence ${i.vencimiento || '—'} → ${venc || '—'}` : ''].filter(Boolean).join(' · ')}`;
        for (const et of i.etiquetas) {
          corregidos.push(await llamar('bdEditarEtiqueta', { etiquetaId: et, codigo: cambiaProd ? p.id : undefined, vencimiento: cambiaVen ? venc : undefined, motivo, usuario: ses.nombre }));
        }
      }
      const r = await llamar('bdGuardarItem', { id, recepcionId: rcAct.id, codigo: p.id, tipo: i.tipo, partes: i.partes, etiquetas: i.etiquetas,
        unidad: i.unidad, cantFactura: $('ciFac').value, cantRecibida: i.cantRecibida, lote: $('ciLote').value,
        vencimiento: venc, novedad: $('ciNov').value });
      rcAct = r; pintarApp();
      if (corregidos.length) {
        window.rcCorregidos = corregidos;
        abrirModal(`<div class="fila-sb"><span class="h2">Corregido</span>${btnCerrar()}</div>
          <span class="mt12">${corregidos.length === 1 ? 'El rótulo quedó' : `Los ${corregidos.length} rótulos quedaron`} con los datos nuevos. Imprímel${corregidos.length === 1 ? 'o' : 'os'} y cámbial${corregidos.length === 1 ? 'o' : 'os'} en la estiba.</span>
          <div class="dos mt16"><button class="btn btn-sec btn-xl" onclick="cerrarModal()">Después</button>
            <button class="btn btn-pri btn-xl" onclick="cerrarModal(); imprimirRotulo(rcCorregidos, 1, leerLS('rtTam') || 'carta')">Imprimir ahora</button></div>`);
      } else { cerrarModal(); toast('Corregido', 'ok'); }
    } catch (e) { errForm(e.message); b.disabled = false; b.textContent = 'Guardar'; }
  }

  // Otra línea del mismo producto (otro vencimiento): arranca un borrador nuevo de ese producto
  function otroVencimiento(codigo) {
    rb = borradorNuevo(codigo);
    const prev = rcAct.items.find(i => i.codigo === codigo);
    if (prev && prev.tipo) rb.tipo = prev.tipo;
    if (prev && prev.unidad) rb.unidadFac = prev.unidad;
    guardarRb(); pintarRbForm();
    $('rcForm').scrollIntoView();
    toast('Escoge el lote (o uno nuevo) y anota lo que falta', 'ok');
  }

  /* ----- Lista de la factura: lo que debe llegar (se copia de la factura o de Excel) ----- */
  let lsManual = [];   // productos agregados uno por uno
  let lsUnid = {};     // unidad cambiada a mano en una línea de la lista

  function abrirLista() {
    if (sinPermiso('rc_lista')) return;
    llamar('bdRecepcion', rcAct.id).then(r => { rcAct = r; pintarApp(); abrirListaYa(); }).catch(() => abrirListaYa());
  }

  function abrirListaYa() {
    lsManual = []; lsUnid = {};
    abrirModal(`<div class="fila-sb"><span class="h2">Lo que debe llegar · Factura ${esc(rcAct.factura)}</span>${btnCerrar()}</div>
      <span class="muted small mt8">Copia de la factura o de Excel las columnas <b>código, nombre y cantidad</b> y pégalas aquí (una fila por producto). El nombre es opcional.</span>
      <textarea id="lsTxt" class="campo ls-txt mt8" rows="6" autocomplete="off" spellcheck="false"
        placeholder="2680	GALLETA FESTIVAL MINICHIPS	20&#10;1125	CHOCOLATINA JET	10"></textarea>
      <span class="muted small mt8">La unidad de cada producto (cajas, unidades o kg) sale sola de Productos. Si en esta factura viene en otra, cámbiala en la lista de abajo.</span>
      <details class="mt12"><summary class="small">O agrégalos uno por uno</summary>
        <div class="col gap8 mt8">
          ${campoConCamara('<input id="lsProd" class="campo" list="dlProductos" autocomplete="off" placeholder="Código o nombre">', 'lsProd')}
          <div class="fila gap8"><input id="lsCant" class="campo flex1" type="number" inputmode="decimal" step="any" min="0" placeholder="Cantidad">
            <button class="btn btn-sec" onclick="agregarALista()">Agregar</button></div>
        </div>
      </details>
      <div id="lsPrev" class="mt12" aria-live="polite"></div>
      <p id="fErr" class="error" hidden></p>
      <div class="dos mt16"><button class="btn btn-sec btn-xl" onclick="cerrarModal()">Cancelar</button>
        <button id="lsOk" class="btn btn-pri btn-xl" onclick="guardarLista()" disabled>Guardar lista</button></div>`);
    $('lsTxt').addEventListener('input', pintarPrevLista);
    $('lsCant').addEventListener('keydown', ev => { if (ev.key === 'Enter') { ev.preventDefault(); agregarALista(); } });
    $('lsTxt').focus();
    pintarPrevLista();
  }

  // Número escrito como en Colombia o en Excel: 20 · 1.200 · 12,5 · 12.5
  function numLista(c) {
    let t = String(c).replace(/\s/g, '');
    if (/^\d{1,3}(\.\d{3})+$/.test(t)) t = t.replace(/\./g, '');
    t = t.replace(',', '.');
    return /^\d+(\.\d+)?$/.test(t) ? Number(t) : null;
  }

  // Lee lo pegado: el primer dato es el código y el último número es la cantidad
  function leerLista() {
    const buenos = {}, malos = [];
    const sumar = (p, cant, u) => {
      const unidad = lsUnid[p.id] || u || umRecibo(p);
      const x = buenos[p.id] || (buenos[p.id] = { codigo: p.id, nombre: p.nombre, cantidad: 0, unidad });
      x.cantidad = +(x.cantidad + cant).toFixed(3);
    };
    ($('lsTxt').value || '').split(/\r?\n/).forEach(linea => {
      if (!linea.trim()) return;
      let cols = linea.split(/\t|;/).map(c => c.trim()).filter(Boolean);
      if (cols.length < 2) cols = linea.trim().split(/\s+/);
      const p = buscarProducto(cols[0]);
      const nums = cols.slice(1).map(numLista).filter(n => n !== null);
      const cant = nums.length ? nums[nums.length - 1] : null;
      const uCol = cols.slice(1).map(c => c.toUpperCase()).find(c => /^(CJ|CJA|CAJA|CAJAS|UND|UN|UNIDAD|UNIDADES|KG|KGS|KILOS?)$/.test(c));
      const u = !uCol ? null : /^K/.test(uCol) ? 'KG' : /^U/.test(uCol) ? 'UND' : 'CJ';
      if (p && cant > 0) return sumar(p, cant, u);
      if (!p && !/\d/.test(cols[0])) return; // encabezado (Código, Nombre, Cantidad…)
      malos.push({ linea: linea.trim(), motivo: !p ? 'código no existe' : 'falta la cantidad' });
    });
    lsManual.forEach(m => { const p = prodDe(m.codigo); if (p) sumar(p, m.cantidad); });
    return { lineas: Object.values(buenos), malos };
  }

  function pintarPrevLista() {
    const { lineas, malos } = leerLista();
    const caja = $('lsPrev');
    if (!caja) return;
    $('lsOk').disabled = !lineas.length;
    $('lsOk').textContent = lineas.length ? `Guardar lista (${lineas.length})` : 'Guardar lista';
    const recibido = new Set(rcAct.items.filter(i => !i.pendiente).map(i => i.codigo));
    const enLista = new Set(rcAct.items.filter(i => i.pendiente).map(i => i.codigo));
    caja.innerHTML = (lineas.length ? `<span class="h3">Así queda la lista (${lineas.length} producto${lineas.length === 1 ? '' : 's'})</span>
      <div class="lista-bp mt8">${lineas.map(l => `<div class="pend-item">
        <span class="chip">${esc(l.codigo)}</span>
        <span class="col gap4 flex1" style="min-width:0"><span class="nombre">${esc(l.nombre)}</span>
          ${recibido.has(l.codigo) ? '<span class="small txt-naranja">Ya se recibió en esta factura: no se agrega otra vez</span>'
            : enLista.has(l.codigo) ? '<span class="small txt-naranja">Ya estaba en la lista: se cambia la cantidad</span>' : ''}</span>
        <span class="fila gap4 nowrap"><b>${nfmt(l.cantidad)}</b>
          <select class="campo ls-u" aria-label="Unidad de ${esc(l.codigo)}" onchange="lsUnid['${esc(l.codigo)}']=this.value; pintarPrevLista()">${[['CJ', 'Cajas'], ['UND', 'Unidades'], ['KG', 'Kg']]
            .map(([v, t]) => `<option value="${v}" ${l.unidad === v ? 'selected' : ''}>${t}</option>`).join('')}</select></span>
      </div>`).join('')}</div>` : '<span class="muted small">Aquí vas a ver los productos antes de guardar.</span>')
      + (malos.length ? `<div class="alerta-fefo mt8"><b>No se pudieron leer (${malos.length}):</b><br>${malos.map(m => `${esc(m.linea)} <span class="small">(${m.motivo})</span>`).join('<br>')}</div>` : '');
  }

  function agregarALista() {
    const p = buscarProducto($('lsProd').value);
    const c = num($('lsCant').value);
    if (!p) return errForm('Elige el producto de la lista.');
    if (!(c > 0)) return errForm('Escribe la cantidad que debe llegar.');
    lsManual.push({ codigo: p.id, cantidad: c });
    $('lsProd').value = ''; $('lsCant').value = '';
    $('fErr').hidden = true;
    pintarPrevLista();
    $('lsProd').focus();
  }

  function guardarLista() {
    const { lineas } = leerLista();
    if (!lineas.length) return errForm('No hay productos para guardar.');
    const b = $('lsOk'); b.disabled = true; b.textContent = 'Guardando…';
    llamar('bdCargarLista', { recepcionId: rcAct.id, lineas: lineas.map(l => ({ codigo: l.codigo, cantidad: l.cantidad, unidad: l.unidad })) })
      .then(res => {
        rcAct = res.rec; rcLista = null;
        cerrarModal(); pintarApp();
        const partes = [];
        if (res.agregados) partes.push(`${res.agregados} agregado${res.agregados === 1 ? '' : 's'}`);
        if (res.cambiados) partes.push(`${res.cambiados} con cantidad cambiada`);
        if (res.repetidos.length) partes.push(`${res.repetidos.length} ya recibido${res.repetidos.length === 1 ? '' : 's'}`);
        toast('Lista: ' + (partes.join(' · ') || 'sin cambios'), 'ok');
      })
      .catch(e => { errForm(e.message); b.disabled = false; b.textContent = 'Guardar lista'; });
  }

  // El personal toca "Recibir" en un producto de la lista y solo anota lo que llegó
  function recibirDeLista(id) {
    if (sinPermiso('recibir')) return;
    const it = rcAct.items.find(i => i.id === id);
    if (!it) return;
    if (rb && rb.partes.length && rb.codigo !== it.codigo) {
      $('rcForm').scrollIntoView({ behavior: 'smooth', block: 'start' });
      return toast('Primero termina o descarta el producto que estás bajando', 'error');
    }
    if (!rb || rb.codigo !== it.codigo || rb.itemId !== it.id) { rb = borradorNuevo(it.codigo); guardarRb(); }
    pintarRbForm();
    $('rcForm').scrollIntoView({ behavior: 'smooth', block: 'start' });
    const s = $('rbCj') || $('rbPC');
    if (s) setTimeout(() => s.focus({ preventScroll: true }), 300);
  }

  function vaciarLista() {
    if (sinPermiso('rc_lista')) return;
    const pend = rcAct.items.filter(i => i.pendiente);
    abrirModal(`<div class="fila-sb"><span class="h2">¿Borrar toda la lista?</span>${btnCerrar()}</div>
      <p>Se borran los <b>${pend.length}</b> productos que están por recibir. Lo que ya se recibió no se toca.</p>
      <span class="muted small">Después puedes volver a copiar la lista de la factura.</span>
      <p id="fErr" class="error" hidden></p>
      <div class="dos mt12"><button class="btn btn-sec btn-xl" onclick="cerrarModal()">No</button>
        <button id="vlOk" class="btn btn-sal btn-xl" onclick="confirmarVaciar()">Sí, borrar todo</button></div>`);
  }

  function confirmarVaciar() {
    const b = $('vlOk'); b.disabled = true; b.textContent = 'Borrando…';
    llamar('bdVaciarLista', { recepcionId: rcAct.id }).then(r => {
      rcAct = r; rcLista = null;
      if (rb && rb.itemId && !rb.partes.length) { rb = borradorNuevo(); guardarRb(); }
      cerrarModal(); toast('Lista borrada', 'ok'); pintarApp();
    }).catch(e => { errForm(e.message); b.disabled = false; b.textContent = 'Sí, borrar todo'; });
  }

  function quitarDeLista(id) {
    if (sinPermiso('rc_lista')) return;
    const i = rcAct.items.find(x => x.id === id);
    abrirModal(`<div class="fila-sb"><span class="h2">¿Quitar de la lista?</span>${btnCerrar()}</div>
      <p>${esc(i.codigo)} · ${esc(i.producto)} · debe llegar ${nfmt(i.cantFactura)} ${unidadTxt(i.unidad, i.cantFactura)}</p>
      <span class="muted small">Úsalo si se copió por error. Si el producto no llegó, déjalo: al cerrar la factura queda como "No llegó".</span>
      <div class="dos mt12"><button class="btn btn-sec btn-xl" onclick="cerrarModal()">No</button>
        <button class="btn btn-sal btn-xl" onclick="cerrarModal(); llamar('bdBorrarItem', { id: '${id}', recepcionId: rcAct.id }).then(r => { rcAct = r; if (rb && rb.itemId === '${id}') { rb = borradorNuevo(); guardarRb(); } toast('Quitado de la lista', 'ok'); pintarApp(); }).catch(e => toast(e.message, 'error'))">Sí, quitar</button></div>`);
  }

  function borrarItem(id) {
    const i = rcAct.items.find(x => x.id === id);
    abrirModal(`<div class="fila-sb"><span class="h2">¿Borrar esta línea?</span>${btnCerrar()}</div>
      <p>${esc(i.producto)} · ${nfmt(i.cantRecibida)} ${esc(i.unidad || '')} · vence ${fFecha(i.vencimiento)}</p>
      ${i.etiquetas.length ? `<p class="aviso-n">Sus rótulos ${i.etiquetas.map(esc).join(', ')} quedan anulados: no se podrán ubicar. Si ya los imprimiste, bótalos.</p>` : ''}
      <div class="dos mt12"><button class="btn btn-sec btn-xl" onclick="cerrarModal()">No</button>
        <button class="btn btn-sal btn-xl" onclick="cerrarModal(); llamar('bdBorrarItem', { id: '${id}', recepcionId: rcAct.id }).then(r => { rcAct = r; toast('Línea borrada', 'ok'); pintarApp(); }).catch(e => toast(e.message, 'error'))">Sí, borrar</button></div>`);
  }

  // Antes de cerrar: muestra lo que falta o sobra y si quedó un producto a medio bajar
  function confirmarCierre() {
    if (sinPermiso('rc_cerrar')) return;
    const grupos = gruposFactura(rcAct.items.filter(i => !i.pendiente));
    const noLlego = rcAct.items.filter(i => i.pendiente);
    const dif = grupos.filter(x => x.factura !== null && estadoGrupo(x).cls !== 'ok');
    const pendiente = rb && rb.recId === rcAct.id && rb.partes.length;
    abrirModal(`<div class="fila-sb"><span class="h2">¿Cerrar la factura ${esc(rcAct.factura)}?</span>${btnCerrar()}</div>
      <span class="mt8">${grupos.length} producto${grupos.length === 1 ? '' : 's'} recibido${grupos.length === 1 ? '' : 's'}.</span>
      ${pendiente ? `<p class="aviso-n">Hay un producto a medio bajar (${rb.partes.length} parte${rb.partes.length === 1 ? '' : 's'}) que todavía no se ha guardado.</p>` : ''}
      ${noLlego.length ? `<div class="alerta-fefo mt12"><b>No han llegado (${noLlego.length}):</b><br>${noLlego.map(i => `${esc(i.producto)}: ${nfmt(i.cantFactura)} ${unidadTxt(i.unidad, i.cantFactura)}`).join('<br>')}<br><span class="small">Si cierras, quedan como "No llegó".</span></div>` : ''}
      ${dif.length ? `<div class="alerta-fefo mt12"><b>Con diferencia:</b><br>${dif.map(x => `${esc(x.producto)}: ${estadoGrupo(x).txt}`).join('<br>')}</div>` : ''}
      <div class="dos mt16"><button class="btn btn-sec btn-xl" onclick="cerrarModal()">Seguir recibiendo</button>
        <button class="btn btn-pri btn-xl" onclick="cerrarModal(); estadoRecepcion('CERRADA')">Sí, cerrar</button></div>`);
  }

  function estadoRecepcion(estado) {
    llamar('bdGuardarRecepcion', { id: rcAct.id, estado }).then(r => {
      rcAct = r; toast(estado === 'CERRADA' ? 'Factura cerrada' : 'Factura abierta otra vez', 'ok'); pintarApp();
    }).catch(e => toast(e.message, 'error'));
  }

  /* ----- Rotular desde la factura: se llena el rótulo con los datos de cada producto ----- */
  function iniciarColaRot() {
    const ids = [...document.querySelectorAll('.rcSel')].filter(c => c.checked).map(c => c.dataset.id);
    if (!ids.length) return toast('Marca al menos un producto para rotular', 'error');
    colaRot = { rec: rcAct, items: ids.map(id => rcAct.items.find(i => i.id === id)), i: 0 };
    vista = 'rotulo';
    pintarApp();
    aplicarCola();
  }

  function avisoCola() {
    if (!colaRot) return '';
    const it = colaRot.items[colaRot.i];
    return `<div class="colocar-aviso" style="margin-top:0;flex-wrap:wrap">
      <span>Factura ${esc(colaRot.rec.factura)} · rótulo ${colaRot.i + 1} de ${colaRot.items.length}<br>
        <small style="font-weight:400">${esc(it.producto)} · llegó ${nfmt(it.cantRecibida)} ${esc(it.unidad || '')} · vence ${fFecha(it.vencimiento)}</small></span>
      <span class="fila gap8"><button class="btn btn-sec" onclick="saltarCola()">Saltar</button>
        <button class="btn btn-sec" onclick="terminarCola()">Terminar</button></span></div>`;
  }

  function aplicarCola() {
    if (!colaRot || !$('rtCod')) return;
    const it = colaRot.items[colaRot.i], p = prodDe(it.codigo);
    $('rtCod').value = it.codigo;
    $('rtCod').dispatchEvent(new Event('change'));
    $('rtRec').value = colaRot.rec.fecha || hoyISO();
    $('rtVen').value = it.vencimiento || '';
    if (rt.tipo === 'NORMAL' && $('rtCajas')) {
      const u = (it.unidad || '').toUpperCase();
      const cajas = /^(CJ|CAJA|CAJAS)$/.test(u) || !p || p.undPorCaja <= 1 ? it.cantRecibida : Math.round(it.cantRecibida / p.undPorCaja);
      $('rtCajas').value = cajas;
      $('rtCajas').dispatchEvent(new Event('input'));
    }
    if (rt.tipo === 'PESO' && $('rtNC')) $('rtNC').focus();
  }

  function siguienteCola(etiqueta) {
    const it = colaRot.items[colaRot.i];
    llamar('bdItemRotulado', { itemId: it.id, etiquetaId: etiqueta.id }).catch(() => {});
    it.etiquetas = (it.etiquetas || []).concat([etiqueta.id]);
    saltarCola();
  }

  function saltarCola() {
    colaRot.i++;
    if (colaRot.i >= colaRot.items.length) return terminarCola(true);
    pintarApp();
    aplicarCola();
  }

  function terminarCola(completa) {
    colaRot = null;
    pintarApp();
    if (completa && tanda.length) { toast('Rótulos de la factura listos. Elige cuáles imprimir.', 'ok'); elegirImpresion(); }
  }

  /* ================= CALIDAD: todo lo recibido en una tabla, con fotos ================= */
  function vistaCalidad() {
    if (!rcFiltro.desde) {
      rcFiltro.desde = isoDe(new Date(Date.now() - 30 * 864e5));
      rcFiltro.hasta = hoyISO();
    }
    if (rcCal === null) { cargarCalidad(); }
    const inv = rcTab === 'inventario';
    return `<div class="fila-sb wrap-f gap8"><span class="h2">${inv ? 'Inventario de lo recibido' : 'Calidad'}</span>
        ${puede(inv ? 'inv_excel' : 'cal_excel') ? `<button class="btn btn-sec" onclick="${inv ? 'descargarInvRecibo()' : 'descargarCalidad()'}" ${rcCal ? '' : 'disabled'}>Descargar Excel</button>` : ''}</div>
      <div class="filtros">
        <div><label class="lbl" for="cqDesde">Ingreso desde</label><input id="cqDesde" type="date" class="campo" value="${rcFiltro.desde}"></div>
        <div><label class="lbl" for="cqHasta">Hasta</label><input id="cqHasta" type="date" class="campo" value="${rcFiltro.hasta}"></div>
        <div class="filtro-q"><label class="lbl" for="cqQ">Buscar (factura, proveedor, producto, lote)</label>
          <input id="cqQ" class="campo" value="${esc(rcFiltro.q)}" autocomplete="off"></div>
        <button class="btn btn-pri" onclick="rcFiltro.desde=$('cqDesde').value; rcFiltro.hasta=$('cqHasta').value; rcCal=null; pintarApp()">Buscar</button>
      </div>
      <label class="fila gap8 small" style="cursor:pointer"><input type="checkbox" id="cqSolo" ${rcFiltro.solo ? 'checked' : ''}> ${inv ? 'Solo productos con diferencia o novedad' : 'Solo productos con novedad'}</label>
      <div id="calCaja">${rcCal ? tablaRc() : '<div class="cargando">Cargando…</div>'}</div>`;
  }

  function cargarCalidad() {
    llamar('bdCalidad', { desde: rcFiltro.desde, hasta: rcFiltro.hasta })
      .then(d => { rcCal = d; if (vista === 'recibidor' && rcTab !== 'recibir') pintarApp(); })
      .catch(e => { rcCal = { recepciones: [], items: [] }; toast(e.message, 'error'); });
  }

  function enlazarCalidad() {
    const q = $('cqQ'), s = $('cqSolo');
    if (!q) return;
    q.addEventListener('input', () => { rcFiltro.q = q.value; pagInicio('cal', 'invrc'); $('calCaja').innerHTML = rcCal ? tablaRc() : ''; });
    s.addEventListener('change', () => { rcFiltro.solo = s.checked; pagInicio('cal', 'invrc'); $('calCaja').innerHTML = rcCal ? tablaRc() : ''; });
  }

  // Una fila por cada línea recibida, con las columnas que usa Calidad
  function filasCalidad() {
    const recs = {}; rcCal.recepciones.forEach(r => (recs[r.id] = r));
    const dif = {};
    rcCal.recepciones.forEach(r => gruposFactura(rcCal.items.filter(i => i.recepcionId === r.id))
      .forEach(x => (dif[r.id + '|' + x.codigo] = x)));
    const palabras = sinTilde(rcFiltro.q.trim()).split(/\s+/).filter(Boolean);
    return rcCal.items.map(i => {
      const r = recs[i.recepcionId], g = dif[i.recepcionId + '|' + i.codigo];
      const est = estadoGrupo(g);
      return { i, r, g, est, novedad: !!i.novedad || (g.factura !== null && est.cls !== 'ok') };
    }).filter(x => x.r && !x.i.pendiente && (!rcFiltro.solo || x.novedad) && (!palabras.length || palabras.every(w =>
      sinTilde(`${x.r.factura} ${x.r.proveedor} ${x.i.codigo} ${x.i.producto} ${x.i.lote}`).includes(w))))
      .sort((a, b) => b.r.fecha.localeCompare(a.r.fecha) || a.r.factura.localeCompare(b.r.factura));
  }

  function calidadHtml() {
    const filas = filasCalidad();
    const pg = paginar('cal', filas, () => { if ($('calCaja') && rcCal) $('calCaja').innerHTML = tablaRc(); });
    return `<span class="h3 mt12">Productos recibidos (${filas.length})</span>
      <div class="tabla-wrap"><table class="tabla">
        <thead><tr><th>Factura</th><th>Proveedor</th><th>Fecha de ingreso</th><th>Código AFS</th><th>Nombre del producto</th>
          <th>Unidad de medida</th><th>Cantidad</th><th>Lote</th><th>Fecha de vencimiento</th><th>Novedad</th><th>Fotos</th><th>Link</th></tr></thead>
        <tbody>${pg.filas.map(({ i, r }) => `<tr>
          <td>${esc(r.factura)}</td><td>${esc(r.proveedor)}</td><td>${esc(r.fecha)}</td><td class="mono-c">${esc(i.codigo)}</td>
          <td class="txt">${esc(i.producto)}</td><td>${esc(i.unidad)}</td><td class="num">${nfmt(i.cantRecibida)}</td><td>${esc(i.lote)}</td>
          <td>${esc(i.vencimiento)}</td><td class="txt">${esc(i.novedad)}</td>
          <td>${puede('cal_editar') || i.fotos ? `<button class="btn ${i.fotos ? 'btn-sec' : 'btn-pri'} btn-mini" onclick="abrirEvidencias('${r.id}', '${i.id}')">${i.fotos ? `Fotos (${i.fotos})` : '+ Foto'}</button>` : '<span class="muted">—</span>'}</td>
          <td>${i.link ? `<a href="${esc(i.link)}" target="_blank" rel="noopener" class="link-cal">Abrir</a>
            ${puede('cal_editar') ? `<button class="link" onclick="editarLink('${i.id}')">Cambiar</button>` : ''}`
            : puede('cal_editar') ? `<button class="btn btn-sec btn-mini" onclick="editarLink('${i.id}')">+ Link</button>` : '<span class="muted">—</span>'}</td>
        </tr>`).join('') || '<tr><td colspan="12" class="muted">Sin resultados</td></tr>'}</tbody>
      </table></div>${pg.barra}`;
  }

  const tablaRc = () => (rcTab === 'inventario' ? inventarioRcHtml() : calidadHtml());

  // INVENTARIO: una fila por producto de cada factura: lo pedido, lo que llegó, la diferencia y quién lo recibió
  function filasInvRecibo() {
    const palabras = sinTilde(rcFiltro.q.trim()).split(/\s+/).filter(Boolean);
    const filas = [];
    rcCal.recepciones.forEach(r => gruposFactura(rcCal.items.filter(i => i.recepcionId === r.id)).forEach(g => {
      const est = estadoGrupo(g);
      const ls = g.lineas;
      const uniq = f => [...new Set(ls.map(f).filter(Boolean))];
      filas.push({
        r, g, est,
        dif: g.factura === null ? null : +(g.llego - g.factura).toFixed(2),
        lotes: uniq(i => i.lote).join(', '), vencs: uniq(i => i.vencimiento).join(', '),
        novedad: uniq(i => i.novedad).join(' · '), recibio: uniq(i => i.pendiente ? '' : i.creadoPor).join(', ') || (ls.every(i => i.pendiente) ? '' : r.recibidoPor),
        rotulos: ls.flatMap(i => i.etiquetas), partes: ls.reduce((a, i) => a + (i.pendiente ? 0 : ((i.partes || []).length || 1)), 0),
        tipo: ls[0].tipo === 'PESO' ? 'Peso variable' : 'Normal', fotos: ls.reduce((a, i) => a + (i.fotos || 0), 0),
        links: uniq(i => i.link), lineas: ls.length
      });
    }));
    return filas.filter(x => (!rcFiltro.solo || x.novedad || (x.dif !== null && x.dif !== 0)) && (!palabras.length || palabras.every(w =>
      sinTilde(`${x.r.factura} ${x.r.proveedor} ${x.g.codigo} ${x.g.producto} ${x.lotes} ${x.recibio}`).includes(w))))
      .sort((a, b) => b.r.fecha.localeCompare(a.r.fecha) || a.r.factura.localeCompare(b.r.factura));
  }

  function inventarioRcHtml() {
    const filas = filasInvRecibo();
    const conDif = filas.filter(x => x.dif !== null && x.dif !== 0).length;
    const pg = paginar('invrc', filas, () => { if ($('calCaja') && rcCal) $('calCaja').innerHTML = tablaRc(); });
    return `<div class="ficha-datos mt12">
        <div><span class="muted small">Productos</span><b>${filas.length}</b></div>
        <div><span class="muted small">Con diferencia</span><b class="${conDif ? 'txt-rojo' : ''}">${conDif}</b></div>
      </div>
      <div class="tabla-wrap mt12"><table class="tabla">
        <thead><tr><th>Factura</th><th>Proveedor</th><th>Fecha de ingreso</th><th>Código AFS</th><th>Nombre del producto</th>
          <th>Unidad de medida</th><th>Pedido</th><th>Llegó</th><th>Diferencia</th><th>Estado</th><th>Tipo</th><th>Lote</th>
          <th>Fecha de vencimiento</th><th>Novedad</th><th>Recibió</th><th>Partes</th><th>Rótulos</th><th>Fotos</th><th>Link</th></tr></thead>
        <tbody>${pg.filas.map(x => `<tr class="${x.est.cls === 'venc' ? 'fila-mala' : ''}">
          <td>${esc(x.r.factura)}</td><td>${esc(x.r.proveedor)}</td><td>${esc(x.r.fecha)}</td><td class="mono-c">${esc(x.g.codigo)}</td>
          <td class="txt">${esc(x.g.producto)}</td><td>${esc(x.g.unidad)}</td><td class="num">${nfmt(x.g.factura)}</td><td class="num">${nfmt(x.g.llego)}</td>
          <td class="num ${x.dif < 0 ? 'txt-rojo' : x.dif > 0 ? 'txt-naranja' : ''}">${x.dif === null ? '—' : (x.dif > 0 ? '+' : '') + nfmt(x.dif)}</td>
          <td><span class="tag ${x.est.cls}">${x.est.txt}</span></td><td>${x.tipo}</td><td>${esc(x.lotes)}</td><td>${esc(x.vencs)}</td>
          <td class="txt">${esc(x.novedad)}</td><td>${esc(x.recibio)}</td><td class="num">${x.partes}</td>
          <td class="txt">${esc(x.rotulos.join(', '))}</td><td class="num">${x.fotos}</td>
          <td>${x.links.map(l => `<a href="${esc(l)}" target="_blank" rel="noopener" class="link-cal">Abrir</a>`).join(' ')}</td>
        </tr>`).join('') || '<tr><td colspan="19" class="muted">Sin resultados</td></tr>'}</tbody>
      </table></div>${pg.barra}`;
  }

  function descargarInvRecibo() {
    if (!rcCal) return;
    const filas = filasInvRecibo().map(x => ({
      Factura: x.r.factura, Proveedor: x.r.proveedor, 'Fecha de ingreso': x.r.fecha, 'Código AFS': x.g.codigo,
      'Nombre del producto': x.g.producto, 'Unidad de medida': x.g.unidad, Pedido: x.g.factura, Llegó: x.g.llego,
      Diferencia: x.dif, Estado: x.est.txt, Tipo: x.tipo, Lote: x.lotes, 'Fecha de vencimiento': x.vencs, Novedad: x.novedad,
      Recibió: x.recibio, Partes: x.partes, Rótulos: x.rotulos.join(', '), Fotos: x.fotos, Link: x.links.join(' ')
    }));
    descargarExcel(`Inventario recibido ${rcFiltro.desde} a ${rcFiltro.hasta}.xlsx`, { Inventario: filas }, 'inv_excel');
  }

  // Link que agrega Calidad (por ejemplo un formato o un reporte en otra página)
  function editarLink(itemId) {
    const it = rcCal.items.find(x => x.id === itemId);
    abrirModal(`<div class="fila-sb"><span class="h2">Link de calidad</span>${btnCerrar()}</div>
      <span class="muted small mt8">${esc(it.codigo)} · ${esc(it.producto)} · lote ${esc(it.lote || '—')}</span>
      <div class="mt12"><label class="lbl" for="lkUrl">Pega el link</label>
        <input id="lkUrl" class="campo" type="url" inputmode="url" autocomplete="off" placeholder="https://…" value="${esc(it.link)}"></div>
      <p id="fErr" class="error" hidden></p>
      <div class="dos mt16">
        ${it.link ? '<button class="btn btn-sal btn-xl" onclick="guardarLink(\'' + itemId + '\', \'\')">Quitar link</button>' : '<button class="btn btn-sec btn-xl" onclick="cerrarModal()">Cancelar</button>'}
        <button id="lkOk" class="btn btn-pri btn-xl" onclick="guardarLink('${itemId}', $('lkUrl').value)">Guardar</button>
      </div>`);
    $('lkUrl').focus();
  }

  function guardarLink(itemId, link) {
    if (link && !link.trim()) link = '';
    llamar('bdGuardarLink', { itemId, link }).then(l => {
      const it = rcCal.items.find(x => x.id === itemId);
      if (it) it.link = l;
      cerrarModal(); toast(l ? 'Link guardado' : 'Link quitado', 'ok');
      if ($('calCaja')) $('calCaja').innerHTML = tablaRc();
    }).catch(e => errForm(e.message));
  }

  function descargarCalidad() {
    if (!rcCal) return;
    // Mismas columnas de la tabla, nada más
    const detalle = filasCalidad().map(({ i, r }) => ({
      Factura: r.factura, Proveedor: r.proveedor, 'Fecha de ingreso': r.fecha, 'Código AFS': i.codigo,
      'Nombre del producto': i.producto, 'Unidad de medida': i.unidad, Cantidad: i.cantRecibida, Lote: i.lote,
      'Fecha de vencimiento': i.vencimiento, Novedad: i.novedad, Fotos: i.fotos || 0, Link: i.link
    }));
    descargarExcel(`Calidad ${rcFiltro.desde} a ${rcFiltro.hasta}.xlsx`, { Calidad: detalle }, 'cal_excel');
  }

  /* ----- Fotos de evidencia de una factura ----- */
  let evRec = null, evItem = null, evEditable = false;

  // Fotos de una factura (itemId vacío) o de un producto de la factura
  function abrirEvidencias(recId, itemId) {
    evRec = recId; evItem = itemId || null;
    // Desde la factura manda "Fotos de evidencia"; desde Calidad manda "Fotos y links"
    const editable = puede(vista === 'recibidor' && rcTab === 'calidad' ? 'cal_editar' : 'rc_fotos');
    evEditable = editable;
    const it = evItem ? ((rcAct && rcAct.items.find(x => x.id === evItem)) || (rcCal && rcCal.items.find(x => x.id === evItem))) : null;
    const r = (rcAct && rcAct.id === recId) ? rcAct : ((rcCal && rcCal.recepciones.find(x => x.id === recId)) || (rcLista || []).find(x => x.id === recId) || {});
    abrirModal(`<div class="fila-sb"><span class="h2">Fotos · Factura ${esc(r.factura || '')}</span>${btnCerrar()}</div>
      <span class="muted small mt8">${it ? `${esc(it.codigo)} · ${esc(it.producto)} · lote ${esc(it.lote || '—')}` : 'Fotos de cómo llegó la mercancía.'}</span>
      ${editable ? `<div class="dos mt12">
        <label for="evCam" class="btn btn-pri btn-acceso" role="button" tabindex="0">${ICONOS.camara}<span>Tomar foto</span></label>
        <label for="evGal" class="btn btn-sec btn-acceso" role="button" tabindex="0">Subir de la galería</label>
      </div>
      <input id="evCam" type="file" accept="image/*" capture="environment" class="oculto">
      <input id="evGal" type="file" accept="image/*" multiple class="oculto">
      <input id="evNota" class="campo mt8" placeholder="Nota para la foto (opcional)" autocomplete="off">` : ''}
      <div id="evGrid" class="ev-grid mt12"><div class="cargando">Cargando fotos…</div></div>`);
    if (editable) ['evCam', 'evGal'].forEach(id => $(id).addEventListener('change', ev => { const fs = [...ev.target.files]; ev.target.value = ''; subirEvidencias(fs); }));
    llamar('bdEvidencias', { recepcionId: recId, itemId: evItem }).then(pintarEvidencias).catch(e => { $('evGrid').innerHTML = `<p class="error">${esc(e.message)}</p>`; });
  }

  function pintarEvidencias(lista) {
    if (!$('evGrid')) return;
    $('evGrid').innerHTML = lista.length ? lista.map(f => `<figure class="ev-foto">
        <a href="${esc(f.url)}" target="_blank" rel="noopener"><img src="${esc(f.url)}" alt="Evidencia ${esc(f.nombre)}" loading="lazy"></a>
        <figcaption class="small muted">${fechaHora(f.creado)}${f.subidoPor ? ' · ' + esc(f.subidoPor) : ''}${f.nota ? '<br>' + esc(f.nota) : ''}</figcaption>
        ${evEditable ? `<button class="icono icono-claro ev-borrar" aria-label="Borrar foto" onclick="borrarEvidencia('${f.id}', '${esc(f.ruta)}')">${ICONOS.cerrar}</button>` : ''}
      </figure>`).join('') : '<p class="muted">Todavía no hay fotos.</p>';
    actualizarConteoFotos(lista.length);
  }

  function actualizarConteoFotos(n) {
    if (evItem) {
      const it = rcCal && rcCal.items.find(x => x.id === evItem);
      if (it) it.fotos = n;
      if ($('calCaja') && rcCal) $('calCaja').innerHTML = tablaRc();
      const ia = rcAct && rcAct.items.find(x => x.id === evItem);
      if (ia && (ia.fotos || 0) !== n) {
        rcAct.evidencias = (rcAct.evidencias || 0) + n - (ia.fotos || 0);
        ia.fotos = n;
        rcLista = null;
        if (vista === 'recibidor' && rcTab === 'recibir') pintarApp();
      }
      return;
    }
    if (rcAct && rcAct.id === evRec) rcAct.evidencias = n;
    if (rcCal) { const r = rcCal.recepciones.find(x => x.id === evRec); if (r) r.evidencias = n; }
    if (rcLista) { const r = rcLista.find(x => x.id === evRec); if (r) r.evidencias = n; }
    if (vista === 'recibidor') pintarApp();
  }

  // Reduce la foto antes de subirla (más rápido y ocupa menos espacio)
  async function comprimir(f) {
    try {
      const img = await createImageBitmap(f);
      const k = Math.min(1, 1600 / Math.max(img.width, img.height));
      const c = document.createElement('canvas');
      c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      const blob = await new Promise(ok => c.toBlob(ok, 'image/jpeg', 0.82));
      return blob ? new File([blob], (f.name || 'foto').replace(/\.\w+$/, '') + '.jpg', { type: 'image/jpeg' }) : f;
    } catch (e) { return f; }
  }

  async function subirEvidencias(archivos) {
    if (!archivos.length) return;
    const nota = $('evNota') ? $('evNota').value : '';
    let lista = null;
    for (let k = 0; k < archivos.length; k++) {
      toast(`Subiendo foto ${k + 1} de ${archivos.length}…`);
      try {
        const f = await comprimir(archivos[k]);
        lista = await llamar('bdSubirEvidencia', { recepcionId: evRec, itemId: evItem, archivo: f, nombre: f.name, nota, usuario: ses.nombre });
      } catch (e) { toast(e.message, 'error'); }
    }
    if (lista) { pintarEvidencias(lista); if ($('evNota')) $('evNota').value = ''; toast('Fotos guardadas', 'ok'); }
  }

  function borrarEvidencia(id, ruta) {
    llamar('bdBorrarEvidencia', { id, ruta, recepcionId: evRec, itemId: evItem }).then(l => { pintarEvidencias(l); toast('Foto borrada', 'ok'); })
      .catch(e => toast(e.message, 'error'));
  }

  function enlazarEventos() {
    const s = $('scan');
    if (s) {
      s.addEventListener('keydown', ev => { if (ev.key === 'Enter') { ev.preventDefault(); escanear(s.value); } });
      if ($('modal').hidden && !('ontouchstart' in window)) s.focus({ preventScroll: true });
    }
    const b = $('busca');
    if (b) b.addEventListener('input', () => {
      busqueda = b.value;
      if ($('mapaCont')) { $('mapaCont').innerHTML = contenidoMapa(); ajustarPlano(); }
    });
    const pq = $('prodQ');
    if (pq) pq.addEventListener('input', () => { prodFiltro = pq.value; pagInicio('prod'); $('prodLista').innerHTML = listaProdHtml(); });
    const ps = $('prodStock');
    if (ps) ps.addEventListener('change', () => { prodSoloStock = ps.checked; pagInicio('prod'); $('prodLista').innerHTML = listaProdHtml(); });
    const pb = $('pBus');
    if (pb) {
      const elegir = () => {
        const p = buscarProducto(pb.value);
        if (p) { prodSel = p.id; pintarApp(); }
        else if (pb.value.trim()) toast('Producto no encontrado', 'error');
      };
      pb.addEventListener('change', elegir);
      pb.addEventListener('keydown', ev => { if (ev.key === 'Enter') { ev.preventDefault(); elegir(); } });
    }
  }

  window.addEventListener('resize', () => {
    if (pantalla === 'app' && esAncho() !== anchoPrevio && $('modal').hidden) pintarApp();
    else { ajustarPlano(); if ($('edLienzo')) edAjustar(); }
  });

/* ================= USUARIOS Y PERMISOS (administrador) ================= */
  let usLista = null;            // usuarios cargados
  let usRegs = {};               // regionales de cada usuario: { id: ['BAQ', …] }
  let pfLista = null;            // perfiles (paquetes de permisos)
  let pfFalta = false;           // todavía no se corrió el script 21
  let usCargando = false;
  let usEdit = null;             // usuario abierto en el editor
  let pfEdit = null;             // perfil abierto en el editor
  let usTab = 'usuarios';        // 'usuarios' | 'perfiles' | 'regionales'
  let usFiltro = { q: '', estado: 'activos', perfil: '', cargo: '' };
  let usSel = new Set();         // usuarios marcados para ponerles perfil
  let usAbiertos = new Set();    // módulos abiertos en el acordeón

  const nPermisos = u => (u.permisos || []).filter(k => PERMISOS.some(p => p[0] === k)).length;
  const perfilDe = id => (pfLista || []).find(p => p.id === id);
  const mismosPermisos = (a, b) => {
    const x = new Set((a || []).filter(k => PERMISOS.some(p => p[0] === k))), y = new Set((b || []).filter(k => PERMISOS.some(p => p[0] === k)));
    return x.size === y.size && [...x].every(k => y.has(k));
  };
  const miPerfilId = () => ((usLista || []).find(u => u.id === ses.id) || {}).perfilId || '';
  const barraPermisos = n => `<span class="us-perm"><span class="us-barra-p"><i style="width:${Math.round(n * 100 / PERMISOS.length)}%"></i></span>${n}/${PERMISOS.length}</span>`;

  function cargarUsuarios() {
    if (usCargando) return;
    usCargando = true;
    Promise.all([llamar('bdUsuarios', ses.token), llamar('bdPerfiles', ses.token).then(l => { pfFalta = false; return l; }).catch(() => { pfFalta = true; return []; }),
      llamar('bdRegionalesUsuarios', ses.token).catch(() => ({}))])
      .then(([u, p, rg]) => { usLista = u; pfLista = p; usRegs = rg || {}; })
      .catch(e => { usLista = []; pfLista = []; toast(e.message, 'error'); })
      .finally(() => { usCargando = false; if (vista === 'usuarios') pintarApp(); });
  }

  function vistaUsuarios() {
    if (usLista === null || pfLista === null) { cargarUsuarios(); return '<div class="cargando">Cargando usuarios…</div>'; }
    if (pfEdit) return editorPerfil();
    if (usEdit) return editorUsuario();
    const activos = usLista.filter(u => u.activo).length;
    return `<div class="col gap16">
      <div class="fila-sb wrap-f gap12">
        <div class="col gap4"><span class="h2">Usuarios y permisos</span>
          <span class="muted small">${usTab === 'regionales' ? 'Las ciudades donde trabaja la empresa. Solo tú (superadministrador) ves esta pestaña.' : usTab === 'perfiles' ? 'Un perfil es un paquete de permisos: lo armas una vez y se lo pones a muchas personas.'
            : hayRegionales() ? `Solo las personas de ${esc(nombreRegional() || 'esta regional')}. Cada una entra con su cédula y su PIN y lo que puede hacer lo da su perfil.`
            : 'Cada persona entra con su cédula y su PIN. Lo que puede hacer lo da su perfil.'}</span></div>
        <span class="fila gap8 wrap-f">${usTab === 'regionales' ? '' : usTab === 'perfiles'
          ? (pfFalta ? '' : '<button class="btn btn-pri" onclick="editarPerfil()">+ Nuevo perfil</button>')
          : `<button class="btn btn-sec" onclick="abrirCargaUsuarios()">Cargar lista</button>
            <button class="btn btn-pri" onclick="editarUsuario()">+ Nuevo usuario</button>`}</span>
      </div>
      <div class="tabs" role="tablist">
        <button class="tab ${usTab === 'usuarios' ? 'on' : ''}" role="tab" aria-selected="${usTab === 'usuarios'}" onclick="usTab='usuarios'; pintarApp()">Usuarios (${activos})</button>
        <button class="tab ${usTab === 'perfiles' ? 'on' : ''}" role="tab" aria-selected="${usTab === 'perfiles'}" onclick="usTab='perfiles'; pintarApp()">Perfiles${pfFalta ? '' : ` (${pfLista.length})`}</button>
        ${puede('superadmin') && hayRegionales() ? `<button class="tab ${usTab === 'regionales' ? 'on' : ''}" role="tab" aria-selected="${usTab === 'regionales'}" onclick="usTab='regionales'; pintarApp()">Regionales y logo</button>` : ''}
      </div>
      ${usTab === 'regionales' && puede('superadmin') && hayRegionales() ? logoCardHtml() + vistaRegionales() : usTab === 'perfiles' ? tablaPerfiles() : tablaUsuarios()}
    </div>`;
  }

  function filtrarUsuarios() {
    const q = sinTilde(usFiltro.q.trim());
    return usLista.filter(u => (usFiltro.estado === 'todos' || (usFiltro.estado === 'activos') === !!u.activo)
      && (!usFiltro.perfil || (usFiltro.perfil === '-' ? !perfilDe(u.perfilId) : u.perfilId === usFiltro.perfil))
      && (!usFiltro.cargo || sinTilde(u.cargo || '') === usFiltro.cargo)
      && (!q || sinTilde(u.nombre + ' ' + (u.cargo || '')).includes(q) || String(u.cedula || '').includes(usFiltro.q.trim())));
  }

  function tablaUsuarios() {
    const activos = usLista.filter(u => u.activo).length;
    const sinPin = usLista.filter(u => u.activo && (!u.tienePin || !u.cedula)).length;
    const bloq = usLista.filter(u => u.bloqueado).length;
    const cargos = [...new Map(usLista.filter(u => u.cargo).map(u => [sinTilde(u.cargo), u.cargo])).entries()].sort((a, b) => a[1].localeCompare(b[1]));
    return `<div class="us-resumen">
        <div><span class="muted small">Activos</span><b>${activos}</b></div>
        <div><span class="muted small">Sin PIN o sin cédula</span><b class="${sinPin ? 'txt-naranja' : ''}">${sinPin}</b></div>
        <div><span class="muted small">Bloqueados</span><b class="${bloq ? 'txt-rojo' : ''}">${bloq}</b></div>
        <div><span class="muted small">Desactivados</span><b>${usLista.length - activos}</b></div>
      </div>
      <div class="us-barra">
        <input id="usQ" class="campo" placeholder="Buscar por nombre, cédula o cargo" value="${esc(usFiltro.q)}" autocomplete="off" aria-label="Buscar usuario">
        ${pfFalta ? '' : `<select id="usFPerfil" class="campo us-fsel" aria-label="Filtrar por perfil" onchange="usFiltro.perfil=this.value; usFiltrado()">
          <option value="">Todos los perfiles</option>${pfLista.map(p => `<option value="${esc(p.id)}" ${usFiltro.perfil === p.id ? 'selected' : ''}>${esc(p.nombre)}</option>`).join('')}
          <option value="-" ${usFiltro.perfil === '-' ? 'selected' : ''}>Personalizado (sin perfil)</option></select>`}
        <select id="usFCargo" class="campo us-fsel" aria-label="Filtrar por cargo" onchange="usFiltro.cargo=this.value; usFiltrado()">
          <option value="">Todos los cargos</option>${cargos.map(([k, t]) => `<option value="${esc(k)}" ${usFiltro.cargo === k ? 'selected' : ''}>${esc(t)}</option>`).join('')}</select>
        <div class="seg" role="group" aria-label="Filtrar por estado">${[['activos', 'Activos'], ['inactivos', 'Desactivados'], ['todos', 'Todos']].map(([k, t]) =>
          `<button class="${usFiltro.estado === k ? 'on' : ''}" onclick="usFiltro.estado='${k}'; pagInicio('us'); pintarApp()">${t}</button>`).join('')}</div>
      </div>
      <div id="usTabla">${filasUsuarios()}</div>`;
  }

  function usFiltrado() { pagInicio('us'); if ($('usTabla')) $('usTabla').innerHTML = filasUsuarios(); }
  function usMarcar(id, on) { on ? usSel.add(id) : usSel.delete(id); usFiltrado2(); }
  function usMarcarTodos(on) { filtrarUsuarios().forEach(u => (on ? usSel.add(u.id) : usSel.delete(u.id))); usFiltrado2(); }
  function usFiltrado2() { if ($('usTabla')) $('usTabla').innerHTML = filasUsuarios(); }

  function filasUsuarios() {
    const l = filtrarUsuarios();
    const pg = paginar('us', l, usFiltrado2);
    const estado = u => !u.activo ? '<span class="tag">Desactivado</span>' : u.bloqueado ? '<span class="tag venc">Bloqueado</span>' : '<span class="tag ok">Activo</span>';
    const pin = u => u.tienePin ? '<span class="us-pin ok">Asignado</span>' : '<span class="us-pin no">Sin PIN</span>';
    const perfilTxt = u => { const p = perfilDe(u.perfilId); return p ? esc(p.nombre) : pfFalta ? nombreRol(u.rol) : '<span class="muted">Personalizado</span>'; };
    const todosMarcados = l.length && l.every(u => usSel.has(u.id));
    const sel = [...usSel].filter(id => usLista.some(u => u.id === id));
    const bulk = sel.length && !pfFalta ? `<div class="us-bulk" role="region" aria-label="Seleccionados">
        <b>${sel.length} seleccionado${sel.length === 1 ? '' : 's'}</b>
        <select id="usBulkPf" class="campo" aria-label="Perfil para los seleccionados"><option value="">Escoge el perfil…</option>
          ${pfLista.map(p => `<option value="${esc(p.id)}">${esc(p.nombre)}</option>`).join('')}</select>
        <button id="usBulkOk" class="btn btn-pri" onclick="asignarPerfilSel()">Poner perfil</button>
        <button class="link" onclick="usSel.clear(); usFiltrado2()">Quitar selección</button></div>` : '';
    const todosMovil = pfFalta || !l.length ? '' : `<label class="us-todos"><input type="checkbox" class="us-chk" ${todosMarcados ? 'checked' : ''} onchange="usMarcarTodos(this.checked)"> Marcar los ${l.length} del filtro</label>`;
    return `${bulk}${todosMovil}<div class="tabla-wrap us-tabla-wrap"><table class="tabla us-tabla">
      <thead><tr><th>${pfFalta ? '' : `<input type="checkbox" class="us-chk" ${todosMarcados ? 'checked' : ''} onchange="usMarcarTodos(this.checked)" aria-label="Marcar los ${l.length} del filtro" title="Marcar los ${l.length} del filtro"> `}Usuario</th><th>Cédula</th><th>Perfil</th><th>Estado</th><th>PIN</th><th>Permisos</th><th>Último ingreso</th><th class="us-acc"></th></tr></thead>
      <tbody>${pg.filas.length ? pg.filas.map(u => `<tr onclick="editarUsuario('${esc(u.id)}')" class="${u.activo ? '' : 'us-off'} ${usSel.has(u.id) ? 'us-marcado' : ''}">
          <td><span class="us-nom">${pfFalta ? '' : `<input type="checkbox" class="us-chk" ${usSel.has(u.id) ? 'checked' : ''} onclick="event.stopPropagation()" onchange="usMarcar('${esc(u.id)}', this.checked)" aria-label="Marcar a ${esc(u.nombre)}">`}
            <span class="us-ini" aria-hidden="true">${esc((u.nombre || '?').trim().charAt(0).toUpperCase())}</span>
            <span class="col gap4" style="min-width:0"><b>${esc(u.nombre)}${u.id === ses.id ? ' <span class="muted small">(tú)</span>' : ''}</b>
              ${u.cargo ? `<span class="muted small">${esc(u.cargo)}</span>` : ''}
              <span class="us-movil muted small">${u.cedula ? 'C.C. ' + esc(u.cedula) : '<b class="txt-naranja">sin cédula</b>'} · ${perfilTxt(u)}${u.tienePin ? '' : ' · <b class="txt-naranja">sin PIN</b>'}${u.bloqueado ? ' · <b class="txt-rojo">bloqueado</b>' : ''}${u.activo ? '' : ' · desactivado'}</span></span></span></td>
          <td>${u.cedula ? esc(u.cedula) : '<span class="tag amar">Sin cédula</span>'}</td>
          <td>${perfilTxt(u)}</td>
          <td>${estado(u)}</td><td>${pin(u)}</td><td>${barraPermisos(nPermisos(u))}</td>
          <td class="muted small">${u.ultimaVez ? fechaHora(u.ultimaVez) : 'Nunca'}</td>
          <td class="us-acc"><button class="btn btn-sec btn-mini" onclick="event.stopPropagation(); editarUsuario('${esc(u.id)}')">Editar</button></td>
        </tr>`).join('') : `<tr><td colspan="8" class="muted">No hay usuarios con ese filtro.</td></tr>`}</tbody></table></div>${pg.barra}`;
  }

  function asignarPerfilSel() {
    const pf = $('usBulkPf').value, ids = [...usSel].filter(id => usLista.some(u => u.id === id));
    if (!pf) return toast('Escoge el perfil que les vas a poner', 'error');
    const b = $('usBulkOk'); b.disabled = true; b.textContent = 'Guardando…';
    llamar('bdAsignarPerfil', { token: ses.token, ids, perfilId: pf }).then(r => {
      revisarSesion();   // si cambió los permisos de quien está usando la app, se aplican ya
      usLista = r.usuarios; pfLista = r.perfiles; usSel.clear();
      toast(`Perfil ${perfilDe(pf).nombre} puesto a ${r.actualizados} persona${r.actualizados === 1 ? '' : 's'}`, 'ok');
      if (ids.includes(ses.id)) revisarSesion();
      pintarApp();
    }).catch(e => { toast(e.message, 'error'); b.disabled = false; b.textContent = 'Poner perfil'; });
  }

  function enlazarUsuarios() {
    const q = $('usQ');
    if (q) q.addEventListener('input', () => { usFiltro.q = q.value; usFiltrado(); });
    if ($('usPin')) enlazarPin('usPin', null);
    if ($('usPermCaja')) marcarIndeterminados();
  }

  /* ----- Perfiles ----- */
  function tablaPerfiles() {
    if (pfFalta) return `<div class="card col gap8 card-aviso"><span class="h3">Los perfiles no están disponibles</span>
      <span>Pídele al administrador del sistema que active los perfiles.</span></div>`;
    const pg = paginar('pf', pfLista, pintarApp);
    return `<div class="card col gap8 pf-ayuda">
        <span><b>¿Cómo se usa?</b> 1) Crea el perfil con sus permisos (por ejemplo <i>Montacarguista</i>). 2) En la pestaña <b>Usuarios</b> marca a las personas
          y dale <b>Poner perfil</b>. Si después cambias el perfil, se actualiza para todos los que lo tienen.</span></div>
      <div class="tabla-wrap"><table class="tabla us-tabla pf-tabla">
        <thead><tr><th>Perfil</th><th>Tipo</th><th>Permisos</th><th>Personas</th><th class="us-acc"></th></tr></thead>
        <tbody>${pg.filas.length ? pg.filas.map(p => `<tr onclick="editarPerfil('${esc(p.id)}')">
          <td><span class="col gap4"><b>${esc(p.nombre)}${p.id === miPerfilId() ? ' <span class="muted small">(el tuyo)</span>' : ''}</b>
            ${p.descripcion ? `<span class="muted small">${esc(p.descripcion)}</span>` : ''}
            <span class="us-movil muted small">${nPermisos(p)}/${PERMISOS.length} permisos · ${p.usuarios} persona${p.usuarios === 1 ? '' : 's'}</span></span></td>
          <td>${nombreRol(p.rol)}</td>
          <td>${barraPermisos(nPermisos(p))}</td>
          <td><button class="link" onclick="event.stopPropagation(); usTab='usuarios'; usFiltro.perfil='${esc(p.id)}'; usFiltro.estado='activos'; pagInicio('us'); pintarApp()">${p.usuarios} persona${p.usuarios === 1 ? '' : 's'}</button></td>
          <td class="us-acc"><button class="btn btn-sec btn-mini" onclick="event.stopPropagation(); editarPerfil('${esc(p.id)}')">Editar</button></td>
        </tr>`).join('') : '<tr><td colspan="5" class="muted">Todavía no hay perfiles. Crea el primero con «+ Nuevo perfil».</td></tr>'}</tbody></table></div>${pg.barra}`;
  }

  function editarPerfil(id) {
    const p = id ? perfilDe(id) : null;
    pfEdit = p ? { id: p.id, nombre: p.nombre, descripcion: p.descripcion || '', rol: p.rol, permisos: [...p.permisos], usuarios: p.usuarios }
      : { id: '', nombre: '', descripcion: '', rol: 'OPERARIO', permisos: [], usuarios: 0 };
    usAbiertos = new Set(p ? [] : ['plano']);
    pintarApp();
    window.scrollTo(0, 0);
    if (!p && $('pfNom')) $('pfNom').focus();
  }

  function editorPerfil() {
    const p = pfEdit, nuevo = !p.id;
    return `<div class="col gap16 us-editor">
      <div class="fila gap12"><button class="btn btn-sec" onclick="pfEdit=null; pintarApp()">← Perfiles</button>
        <div class="col gap4"><span class="h2">${nuevo ? 'Nuevo perfil' : esc(p.nombre)}</span>
          ${nuevo ? '' : `<span class="muted small">Lo tienen ${p.usuarios} persona${p.usuarios === 1 ? '' : 's'}</span>`}</div></div>
      <div class="us-ed-grid">
        <section class="card col gap12">
          <span class="h3">Datos</span>
          <div><label class="lbl" for="pfNom">Nombre del perfil</label>
            <input id="pfNom" class="campo" value="${esc(p.nombre)}" autocomplete="off" oninput="pfEdit.nombre=this.value" placeholder="Ej. Montacarguista"></div>
          <div><label class="lbl" for="pfDesc">Descripción (opcional)</label>
            <input id="pfDesc" class="campo" value="${esc(p.descripcion)}" autocomplete="off" oninput="pfEdit.descripcion=this.value" placeholder="Ej. Ubica y mueve estibas"></div>
          <div><span class="lbl">Tipo</span>
            <div class="seg" role="group" aria-label="Tipo">
              <button class="${p.rol === 'OPERARIO' ? 'on' : ''}" onclick="pfEdit.rol='OPERARIO'; pintarApp()">Usuario</button>
              <button class="${p.rol === 'JEFE' ? 'on' : ''}" onclick="pfEdit.rol='JEFE'; pintarApp()">Admin</button></div>
            <span class="muted small">El tipo Admin ve los indicadores arriba del Plano.</span></div>
          ${pfLista.length ? `<div><label class="lbl" for="pfCopia">Copiar los permisos de otro perfil</label>
            <select id="pfCopia" class="campo" onchange="if (this.value) { pfEdit.permisos = [...perfilDe(this.value).permisos]; repintarPermisos(); this.value=''; }">
              <option value="">Escoge uno para copiarlo…</option>${pfLista.filter(x => x.id !== p.id).map(x => `<option value="${esc(x.id)}">${esc(x.nombre)}</option>`).join('')}</select></div>` : ''}
          ${!nuevo && p.usuarios ? `<div class="alerta-fefo">Al guardar, a las <b>${p.usuarios} persona${p.usuarios === 1 ? '' : 's'}</b> con este perfil se les actualizan los permisos.</div>` : ''}
        </section>
        <section class="card col gap12">
          <div class="fila-sb wrap-f gap8"><span class="h3">Permisos</span>
            <span class="fila gap12"><button class="link" onclick="usPreset('todos')">Todos</button>
              <button class="link" onclick="usPreset('ninguno')">Ninguno</button></span></div>
          <span class="muted small">Ver el plano y buscar productos lo pueden hacer todos. Prende el módulo completo o abre cada uno para escoger acción por acción.</span>
          <div id="usPermCaja">${acordeonPermisos()}</div>
        </section>
      </div>
      <p id="usErr" class="error" hidden></p>
      <div class="us-pie">
        <span class="muted small" id="usCuenta">${nPermisos(p)} de ${PERMISOS.length} permisos</span>
        <span class="fila gap8 wrap-f">${nuevo ? '' : `<button class="btn btn-sal" onclick="borrarPerfil()">Eliminar perfil</button>`}
          <button class="btn btn-sec" onclick="pfEdit=null; pintarApp()">Cancelar</button>
          <button id="pfOk" class="btn btn-pri" onclick="guardarPerfil()">${nuevo ? 'Crear perfil' : 'Guardar cambios'}</button></span>
      </div>
    </div>`;
  }

  // Si la base de datos no aceptó algún permiso (falta correr el script que lo agrega), se avisa cuáles
  function avisarPermisosNoGuardados(pedidos, guardados) {
    const g = new Set(guardados || []);
    const faltan = (pedidos || []).filter(k => k !== 'superadmin' && !g.has(k));
    if (!faltan.length) return;
    const nom = faltan.map(k => (PERMISOS.find(x => x[0] === k) || [k, k])[1]);
    toast(`No se guardaron estos permisos: ${nom.join(', ')}. Falta correr en Supabase el script que los agrega (46_permisos_plano.sql o 47_permisos_productos.sql).`, 'error');
  }
  function guardarPerfil() {
    const p = pfEdit;
    const err = m => { const e = $('usErr'); e.textContent = m; e.hidden = false; e.scrollIntoView({ behavior: 'smooth', block: 'center' }); };
    p.nombre = $('pfNom').value.trim(); p.descripcion = $('pfDesc').value.trim();
    if (!p.nombre) return err('Escribe el nombre del perfil.');
    if (!nPermisos(p)) return err('Prende al menos un permiso.');
    const b = $('pfOk'); b.disabled = true; b.textContent = 'Guardando…';
    llamar('bdGuardarPerfil', { token: ses.token, id: p.id, nombre: p.nombre, descripcion: p.descripcion, rol: p.rol, permisos: p.permisos }).then(r => {
      revisarSesion();   // si cambió los permisos de quien está usando la app, se aplican ya
      usLista = r.usuarios; pfLista = r.perfiles; pfEdit = null; usTab = 'perfiles';
      const g = (r.perfiles || []).find(x => p.id ? x.id === p.id : x.nombre === p.nombre);
      if (g && (p.permisos || []).some(k => k !== 'superadmin' && !(g.permisos || []).includes(k))) {
        pintarApp(); window.scrollTo(0, 0); return avisarPermisosNoGuardados(p.permisos, g.permisos);
      }
      toast(p.id ? `Perfil guardado${r.actualizados ? ` · ${r.actualizados} persona${r.actualizados === 1 ? '' : 's'} actualizada${r.actualizados === 1 ? '' : 's'}` : ''}`
        : 'Perfil creado. Ahora pónselo a las personas en la pestaña Usuarios.', 'ok');
      if (p.id && p.id === miPerfilId()) revisarSesion();
      pintarApp(); window.scrollTo(0, 0);
    }).catch(e => { err(e.message); b.disabled = false; b.textContent = p.id ? 'Guardar cambios' : 'Crear perfil'; });
  }

  function borrarPerfil() {
    const p = pfEdit;
    abrirModal(`<div class="fila-sb"><span class="h2">¿Eliminar el perfil ${esc(p.nombre)}?</span>${btnCerrar()}</div>
      <span class="mt12">${p.usuarios ? `Las <b>${p.usuarios} persona${p.usuarios === 1 ? '' : 's'}</b> que lo tienen conservan sus permisos y quedan como <b>Personalizado</b>.` : 'Nadie lo tiene puesto.'}</span>
      <p id="fErr" class="error" hidden></p>
      <div class="dos mt16"><button class="btn btn-sec btn-xl" onclick="cerrarModal()">No</button>
        <button id="pfBorrarOk" class="btn btn-sal btn-xl" onclick="confirmarBorrarPerfil()">Sí, eliminar</button></div>`);
  }
  function confirmarBorrarPerfil() {
    const b = $('pfBorrarOk'); b.disabled = true;
    llamar('bdBorrarPerfil', { token: ses.token, id: pfEdit.id }).then(r => {
      usLista = r.usuarios; pfLista = r.perfiles; pfEdit = null; usTab = 'perfiles';
      if (usFiltro.perfil && !perfilDe(usFiltro.perfil)) usFiltro.perfil = '';
      cerrarModal(); toast('Perfil eliminado', 'ok'); pintarApp();
    }).catch(e => { errForm(e.message); b.disabled = false; });
  }

  /* ----- Editor de usuario ----- */
  function perfilInicial() {
    const p = perfilDe('PF_OPERARIO') || (pfLista || []).find(x => x.rol === 'OPERARIO' && !x.permisos.includes('usuarios'));
    return p || null;
  }

  function editarUsuario(id) {
    const u = id ? usLista.find(x => x.id === id) : null;
    const pi = perfilInicial();
    usEdit = u ? { id: u.id, nombre: u.nombre, cedula: u.cedula || '', cargo: u.cargo || '', rol: u.rol, activo: u.activo, permisos: [...(u.permisos || [])], perfilId: perfilDe(u.perfilId) ? u.perfilId : '', tienePin: u.tienePin, bloqueado: u.bloqueado, ultimaVez: u.ultimaVez,
        regionales: [...(usRegs[u.id] || [])] }
      : { id: '', nombre: '', cedula: '', cargo: '', rol: pi ? pi.rol : 'OPERARIO', activo: true, permisos: pi ? [...pi.permisos] : [...PERM_OPERARIO], perfilId: pi ? pi.id : '', tienePin: false ,
        regionales: regionalAct() ? [regionalAct()] : [] };
    usAbiertos = new Set();
    pintarApp();
    window.scrollTo(0, 0);
    if (!u && $('usNom')) $('usNom').focus();
  }

  const notaPerfil = () => usEdit.perfilId
    ? 'Tiene los permisos de este perfil. Si cambias alguno a mano, queda como Personalizado.'
    : 'Personalizado: sus permisos se escogen a mano abajo.';

  function usElegirPerfil(id) {
    usEdit.perfilId = id;
    const p = perfilDe(id);
    if (p) { usEdit.permisos = [...p.permisos]; usEdit.rol = p.rol; }
    repintarPermisos();
  }

  function editorUsuario() {
    const u = usEdit, nuevo = !u.id, yo = u.id === ses.id;
    const campoPerfil = pfFalta || !pfLista.length
      ? `<div><span class="lbl">Perfil</span>
          <div class="seg" role="group" aria-label="Perfil">
            <button class="${u.rol === 'OPERARIO' ? 'on' : ''}" onclick="usRol('OPERARIO')">Usuario</button>
            <button class="${u.rol === 'JEFE' ? 'on' : ''}" onclick="usRol('JEFE')">Admin</button>
          </div></div>`
      : `<div><label class="lbl" for="usPerfil">Perfil</label>
          <select id="usPerfil" class="campo" onchange="usElegirPerfil(this.value)">
            ${pfLista.map(p => `<option value="${esc(p.id)}" ${u.perfilId === p.id ? 'selected' : ''}>${esc(p.nombre)}</option>`).join('')}
            <option value="" ${!u.perfilId ? 'selected' : ''}>Personalizado (permisos a mano)</option></select>
          <span class="muted small" id="usPerfilNota">${notaPerfil()}</span></div>`;
    return `<div class="col gap16 us-editor">
      <div class="fila-sb wrap-f gap8">
        <div class="fila gap12"><button class="btn btn-sec" onclick="usEdit=null; pintarApp()">← Usuarios</button>
          <div class="col gap4"><span class="h2">${nuevo ? 'Nuevo usuario' : esc(u.nombre)}</span>
            ${nuevo ? '' : `<span class="muted small">${u.ultimaVez ? 'Último ingreso ' + fechaHora(u.ultimaVez) : 'Nunca ha entrado'}</span>`}</div></div>
      </div>
      <div class="us-ed-grid">
        <section class="card col gap12">
          <span class="h3">Datos</span>
          <div><label class="lbl" for="usNom">Nombre (así aparece al entrar)</label>
            <input id="usNom" class="campo" value="${esc(u.nombre)}" autocomplete="off" oninput="usEdit.nombre=this.value"></div>
          <div><label class="lbl" for="usCed">Cédula (con ella entra a la app)</label>
            <input id="usCed" class="campo" inputmode="numeric" maxlength="12" value="${esc(u.cedula || '')}" autocomplete="off"
              oninput="this.value=this.value.replace(/\D/g,''); usEdit.cedula=this.value" placeholder="Solo números"></div>
          <div><label class="lbl" for="usCargo">Cargo</label>
            <input id="usCargo" class="campo" value="${esc(u.cargo || '')}" autocomplete="off" oninput="usEdit.cargo=this.value" placeholder="Ej. Auxiliar de bodega"></div>
          ${campoPerfil}
          <div><span class="lbl">${nuevo ? 'PIN de 4 números' : 'Cambiar PIN'}</span>
            <div class="fila gap8 wrap-f">${pinCajas('usPin')}
              <button class="btn btn-sec" onclick="usGenerarPin()">Generar</button>
              <button class="link" onclick="$('usPin').classList.toggle('pin-ver'); this.textContent = $('usPin').classList.contains('pin-ver') ? 'Ocultar' : 'Mostrar'">Mostrar</button></div>
            <span class="muted small">${nuevo ? 'Dáselo a la persona en privado. Después nadie lo puede ver.'
              : (u.bloqueado ? '<b class="txt-rojo">Está bloqueado por intentos fallidos.</b> Ponle un PIN nuevo para desbloquearlo. '
                : !u.tienePin ? '<b class="txt-naranja">Todavía no tiene PIN.</b> ' : 'Déjalo vacío para no cambiarlo. ') + 'Al cambiarlo se cierra su sesión en los otros equipos.'}</span></div>
          <label class="perm-fila">
            <span class="col gap4"><b>Activo</b><span class="muted small">${yo ? 'No te puedes desactivar a ti mismo' : 'Si lo apagas, no puede entrar a la app'}</span></span>
            <span class="switch"><input type="checkbox" id="usAct" ${u.activo ? 'checked' : ''} ${yo ? 'disabled' : ''} onchange="usEdit.activo=this.checked"><span></span></span>
          </label>
          ${!hayRegionales() ? '' : puede('superadmin') ? `<div><span class="lbl">Regionales donde trabaja ${ayudaHtml('Marca las ciudades donde trabaja esta persona. Solo la ven y la administran en esas regionales. Si le quitas esta regional, desaparece de esta lista.')}</span>
            <div class="cic-sedes">${ini.regionales.map(r => `<label class="cic-sede-op"><input type="checkbox" ${u.regionales.indexOf(r.id) >= 0 ? 'checked' : ''}
              onchange="usRegional('${esc(r.id)}', this.checked)"> ${esc(r.nombre)}</label>`).join('')}</div></div>`
            : `<div><span class="lbl">Regional</span><span>${esc(nombreRegional() || '—')} ${ayudaHtml('Las personas que creas quedan en la regional con la que entraste. Para pasar a alguien a otra regional, pídeselo al superadministrador.')}</span></div>`}
        </section>
        <section class="card col gap12">
          <div class="fila-sb wrap-f gap8"><span class="h3">Permisos</span>
            <span class="fila gap12"><button class="link" onclick="usPreset('todos')">Todos</button>
              <button class="link" onclick="usPreset('ninguno')">Ninguno</button></span></div>
          <span class="muted small">Ver el plano y buscar productos lo pueden hacer todos. Abre un módulo solo si quieres ajustar algo puntual.</span>
          <div id="usPermCaja">${acordeonPermisos()}</div>
        </section>
      </div>
      <p id="usErr" class="error" hidden></p>
      <div class="us-pie">
        <span class="muted small" id="usCuenta">${nPermisos(u)} de ${PERMISOS.length} permisos</span>
        <span class="fila gap8"><button class="btn btn-sec" onclick="usEdit=null; pintarApp()">Cancelar</button>
          <button id="usOk" class="btn btn-pri" onclick="guardarUsuario()">${nuevo ? 'Crear usuario' : 'Guardar cambios'}</button></span>
      </div>
    </div>`;
  }

  // Permisos del editor abierto (perfil o usuario)
  const permEd = () => pfEdit || usEdit;
  // ¿Se le puede quitar "usuarios"? No, si es uno mismo o su propio perfil
  const usuariosFijo = () => pfEdit ? (!!pfEdit.id && pfEdit.id === miPerfilId()) : usEdit.id === ses.id;

  // «Superadministrador» no va en perfiles y solo lo ve (y lo da) el superadministrador
  const verSuper = () => !pfEdit && puede('superadmin');
  const permsMod = m => m.p.filter(p => p[0] !== 'superadmin' || verSuper());
  function acordeonPermisos() {
    const u = permEd(), fijoU = usuariosFijo();
    return `<div class="acc-lista">${MODULOS.map(m => {
      const mp = permsMod(m);
      const n = mp.filter(p => u.permisos.includes(p[0])).length;
      const abierto = usAbiertos.has(m.k);
      return `<div class="acc ${abierto ? 'abierto' : ''}">
        <div class="acc-cab">
          <button class="acc-btn" onclick="usAcc('${m.k}')" aria-expanded="${abierto}" aria-controls="acc-${m.k}">
            <span class="acc-flecha" aria-hidden="true">›</span>
            <span class="col gap4" style="min-width:0"><b>${m.t}</b><span class="muted small">${m.d}</span></span>
          </button>
          <span class="acc-n ${n === mp.length ? 'todo' : n ? 'algo' : ''}">${n}/${mp.length}</span>
          <span class="switch" title="Todo el módulo"><input type="checkbox" class="usMod" data-m="${m.k}" data-n="${n}" data-t="${mp.length}"
            ${n === mp.length ? 'checked' : ''} onchange="usModulo('${m.k}', this.checked)" aria-label="Todo el módulo ${m.t}"><span></span></span>
        </div>
        <div class="acc-panel" id="acc-${m.k}" ${abierto ? '' : 'hidden'}>${mp.map(([k, t, d]) => {
          const fijo = fijoU && k === 'usuarios';
          return `<label class="perm-fila ${fijo ? 'fijo' : ''}">
            <span class="col gap4"><b>${t}</b><span class="muted small">${d}${fijo ? (pfEdit ? ' · es tu perfil, no se lo puedes quitar' : ' · no te lo puedes quitar') : ''}</span></span>
            <span class="switch"><input type="checkbox" ${u.permisos.includes(k) ? 'checked' : ''} ${fijo ? 'disabled' : ''}
              onchange="usPerm('${k}', this.checked)"><span></span></span></label>`;
        }).join('')}</div>
      </div>`;
    }).join('')}</div>`;
  }

  function marcarIndeterminados() {
    document.querySelectorAll('.usMod').forEach(c => { const n = +c.dataset.n, t = +c.dataset.t; c.indeterminate = n > 0 && n < t; });
  }
  function repintarPermisos() {
    const u = permEd();
    if (usuariosFijo() && !u.permisos.includes('usuarios')) u.permisos.push('usuarios');
    // Si al usuario le cambian permisos a mano y ya no son los del perfil, queda como Personalizado
    if (!pfEdit && usEdit.perfilId) {
      const p = perfilDe(usEdit.perfilId);
      if (!p || !mismosPermisos(p.permisos, usEdit.permisos)) {
        usEdit.perfilId = '';
        if ($('usPerfil')) $('usPerfil').value = '';
      }
    }
    if ($('usPerfilNota')) $('usPerfilNota').textContent = notaPerfil();
    $('usPermCaja').innerHTML = acordeonPermisos();
    marcarIndeterminados();
    $('usCuenta').textContent = `${nPermisos(u)} de ${PERMISOS.length} permisos`;
  }
  function usAcc(k) { usAbiertos.has(k) ? usAbiertos.delete(k) : usAbiertos.add(k); repintarPermisos(); }
  function usPerm(k, on) {
    const u = permEd();
    u.permisos = u.permisos.filter(x => x !== k);
    if (on) u.permisos.push(k);
    repintarPermisos();
  }
  function usModulo(mk, on) {
    const u = permEd();
    const ks = permsMod(MODULOS.find(m => m.k === mk)).map(p => p[0]);
    u.permisos = u.permisos.filter(x => !ks.includes(x));
    if (on) u.permisos.push(...ks);
    usAbiertos.add(mk);
    repintarPermisos();
  }
  function usRegional(id, on) {
    const l = usEdit.regionales.filter(x => x !== id);
    if (on) l.push(id);
    usEdit.regionales = l;
  }
  function usPreset(cual) {
    // «Superadministrador» no entra con «Todos»: se marca a mano
    const yaSuper = (permEd().permisos || []).indexOf('superadmin') >= 0;
    permEd().permisos = cual === 'todos' ? PERMISOS.map(p => p[0]).filter(k => k !== 'superadmin' || yaSuper) : cual === 'operario' ? [...PERM_OPERARIO] : [];
    repintarPermisos();
  }
  function usRol(r) {
    if (usEdit.rol === r) return;
    usEdit.rol = r;
    usEdit.permisos = r === 'JEFE' ? PERMISOS.map(p => p[0]).filter(k => k !== 'superadmin' || usEdit.permisos.indexOf('superadmin') >= 0) : [...PERM_OPERARIO];
    const pin = pinValor('usPin');
    pintarApp();
    pinPoner('usPin', pin);
  }
  function usGenerarPin() {
    pinPoner('usPin', String(Math.floor(Math.random() * 10000)).padStart(4, '0'));
    $('usPin').classList.add('pin-ver');
  }

  /* ----- Cargar la lista de usuarios (cédula, nombre, cargo) ----- */
  let usCarga = null;   // { filas: [{ cedula, nombre, cargo, rol }], malas }
  let ucCrudo = null;   // lo último que se pegó o subió (para volver a pintar)
  let ucPerfil = '_cargo';
  // Perfil que le toca a un cargo cuando se elige "Según el cargo"
  function perfilPorCargo(cargo) {
    const jefe = cargoEsJefe(cargo), l = pfLista || [];
    return jefe ? (perfilDe('PF_JEFE') || l.find(p => p.rol === 'JEFE' && !p.permisos.includes('usuarios')))
      : (perfilDe('PF_OPERARIO') || l.find(p => p.rol === 'OPERARIO'));
  }
  const perfilCarga = f => ucPerfil === '_cargo' ? perfilPorCargo(f.cargo) : perfilDe(ucPerfil);
  const cargoEsJefe = c => /jefe|coordinador|supervisor|l[ií]der|director|gerente/i.test(c || '');

  function abrirCargaUsuarios() {
    usCarga = null; ucCrudo = null; ucPerfil = '_cargo';
    abrirModal(`<div class="fila-sb"><span class="h2">Cargar lista de usuarios</span>${btnCerrar()}</div>
      <span class="muted small mt8">Copia de Excel las columnas <b>cédula, nombre y cargo</b> y pégalas aquí (una fila por persona), o sube el archivo.
        A los nuevos se les pone de <b>PIN los últimos 4 números de su cédula</b>. Si la cédula ya existe, solo se actualiza el nombre y el cargo.</span>
      <textarea id="ucTxt" class="campo ls-txt mt8" rows="6" spellcheck="false" placeholder="1045678901	Ana Torres	Auxiliar de bodega&#10;72123456	Pedro Gómez	Jefe de bodega"></textarea>
      <div class="fila gap8 mt8 wrap-f"><label for="ucArch" class="btn btn-sec" role="button" tabindex="0">O subir archivo (Excel o CSV)</label>
        <input id="ucArch" type="file" accept=".xlsx,.xls,.csv" class="oculto"></div>
      ${pfFalta || !pfLista.length ? '' : `<label class="lbl mt8" for="ucPerfil">Perfil para los nuevos</label>
        <select id="ucPerfil" class="campo" onchange="ucPerfil=this.value; pagInicio('uc'); if (ucCrudo) leerListaUsuarios(ucCrudo)">
          <option value="_cargo">Según el cargo (jefes → ${esc((perfilPorCargo('jefe') || {}).nombre || 'Admin')}, los demás → ${esc((perfilPorCargo('') || {}).nombre || 'Usuario')})</option>
          ${pfLista.map(p => `<option value="${esc(p.id)}">${esc(p.nombre)} (a todos)</option>`).join('')}</select>`}
      <div id="ucPrev" class="mt12"></div>
      <p id="fErr" class="error" hidden></p>`);
    $('ucTxt').addEventListener('input', () => { pagInicio('uc'); leerListaUsuarios($('ucTxt').value.split(/\r?\n/).map(l => l.split(/\t|;/))); });
    $('ucArch').addEventListener('change', ev => { const f = ev.target.files[0]; if (f) leerArchivoFilas(f).then(leerListaUsuarios).catch(e => errForm(e.message)); });
    $('ucTxt').focus();
  }

  // Lee un Excel/CSV como filas (arreglo de arreglos)
  function leerArchivoFilas(f) {
    return new Promise((ok, mal) => {
      const r = new FileReader();
      r.onload = () => {
        try {
          if (window.XLSX && !/\.csv$/i.test(f.name)) {
            const wb = XLSX.read(new Uint8Array(r.result), { type: 'array' });
            return ok(XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1, raw: false, defval: '' }));
          }
          let txt = new TextDecoder('utf-8').decode(r.result);
          if (txt.includes('�')) txt = new TextDecoder('windows-1252').decode(r.result);
          const m = txt.split(/\r?\n/).slice(0, 15).join('\n');
          const n = ch => (m.split(ch).length - 1);
          const sep = n('\t') > n(';') && n('\t') > n(',') ? '\t' : n(';') >= n(',') ? ';' : ',';
          ok(txt.split(/\r?\n/).map(l => l.split(sep).map(c => c.replace(/^"|"$/g, '').trim())));
        } catch (e) { mal(new Error('No se pudo leer el archivo: ' + e.message)); }
      };
      r.onerror = () => mal(new Error('No se pudo leer el archivo'));
      r.readAsArrayBuffer(f);
    });
  }

  // Busca qué columna es la cédula (la que tiene números de 5 a 12 cifras); nombre y cargo por título o por orden
  function leerListaUsuarios(filas) {
    ucCrudo = filas;
    filas = (filas || []).map(x => x.map(c => String(c ?? '').trim())).filter(x => x.some(Boolean));
    const caja = $('ucPrev');
    if (!filas.length) { caja.innerHTML = ''; return; }
    const esCed = v => /^\d{5,12}$/.test(String(v).replace(/[.\s,-]/g, ''));
    const nCol = Math.max(...filas.map(x => x.length));
    let iCed = 0, mejor = -1;
    for (let k = 0; k < nCol; k++) { const c = filas.filter(x => esCed(x[k] || '')).length; if (c > mejor) { mejor = c; iCed = k; } }
    const tit = filas[0].map(t => sinTilde(t));
    const conTitulo = !esCed(filas[0][iCed] || '');
    let iNom = conTitulo ? tit.findIndex(t => /NOMBRE/.test(t)) : -1;
    let iCargo = conTitulo ? tit.findIndex(t => /CARGO|PUESTO|ROL/.test(t)) : -1;
    const otras = [...Array(nCol).keys()].filter(k => k !== iCed);
    if (iNom < 0) iNom = otras.find(k => k !== iCargo);
    if (iCargo < 0) iCargo = otras.find(k => k !== iNom);
    const existentes = new Set((usLista || []).map(u => u.cedula).filter(Boolean));
    const vistas = new Set();
    const ok = [], malas = [];
    (conTitulo ? filas.slice(1) : filas).forEach(x => {
      const cedula = String(x[iCed] || '').replace(/\D/g, '');
      const nombre = (x[iNom] || '').replace(/\s+/g, ' ').trim();
      const cargo = iCargo !== undefined ? (x[iCargo] || '').trim() : '';
      if (!esCed(cedula)) return malas.push(`${x.join(' · ')} (cédula no válida)`);
      if (!nombre) return malas.push(`${cedula} (falta el nombre)`);
      if (vistas.has(cedula)) return malas.push(`${cedula} (repetida en la lista)`);
      vistas.add(cedula);
      const rol = cargoEsJefe(cargo) ? 'JEFE' : 'OPERARIO';
      ok.push({ cedula, nombre, cargo, rol, existe: existentes.has(cedula) });
    });
    usCarga = { filas: ok };
    const nuevos = ok.filter(f => !f.existe).length;
    const pg = paginar('uc', ok, () => leerListaUsuarios(ucCrudo));
    const usaPerfiles = !pfFalta && pfLista && pfLista.length;
    caja.innerHTML = `<div class="inv-res">
        <div><span class="muted small">Nuevos</span><b class="txt-verde">${nuevos}</b></div>
        <div><span class="muted small">Ya existen (se actualizan)</span><b>${ok.length - nuevos}</b></div>
        <div><span class="muted small">Con problema</span><b class="${malas.length ? 'txt-naranja' : ''}">${malas.length}</b></div></div>
      ${ok.length ? `<div class="tabla-wrap mt8"><table class="tabla"><thead><tr><th>Cédula</th><th>Nombre</th><th>Cargo</th><th>Perfil</th><th>PIN</th></tr></thead>
        <tbody>${pg.filas.map(f => `<tr><td>${esc(f.cedula)}</td><td>${esc(f.nombre)}</td><td>${esc(f.cargo || '—')}</td>
          <td>${f.existe ? '<span class="muted small">No cambia</span>' : usaPerfiles ? esc((perfilCarga(f) || {}).nombre || 'Personalizado') : nombreRol(f.rol)}</td>
          <td>${f.existe ? '<span class="muted small">No cambia</span>' : `<b>${f.cedula.slice(-4)}</b>`}</td></tr>`).join('')}</tbody></table></div>${pg.barra}` : ''}
      ${malas.length ? `<div class="alerta-fefo mt8"><b>No se cargan (${malas.length}):</b><br>${malas.slice(0, 20).map(esc).join('<br>')}</div>` : ''}
      <span class="muted small mt8">${usaPerfiles ? (ucPerfil === '_cargo' ? 'Según el cargo: si dice jefe, coordinador, supervisor, líder, director o gerente le toca el perfil de jefe; a los demás el de operario. ' : '')
        + 'Después lo puedes cambiar a varios a la vez en Usuarios con «Poner perfil».'
        : 'El perfil sale del cargo: si dice jefe, coordinador, supervisor, líder, director o gerente queda como <b>Admin</b> (con todos los permisos menos Usuarios); los demás como <b>Usuario</b>. Después lo puedes cambiar a cada uno.'}</span>
      <button id="ucOk" class="btn btn-pri btn-xl mt12" onclick="guardarListaUsuarios()" ${ok.length ? '' : 'disabled'}>${ok.length ? `Cargar ${ok.length} usuario${ok.length === 1 ? '' : 's'}` : 'No hay usuarios para cargar'}</button>`;
  }

  function guardarListaUsuarios() {
    if (!usCarga || !usCarga.filas.length) return;
    const todos = PERMISOS.map(p => p[0]).filter(k => k !== 'usuarios' && k !== 'superadmin');
    const filas = usCarga.filas.map(f => {
      const p = !pfFalta ? perfilCarga(f) : null;
      return p ? { cedula: f.cedula, nombre: f.nombre, cargo: f.cargo, rol: p.rol, permisos: p.permisos, perfilId: p.id }
        : { cedula: f.cedula, nombre: f.nombre, cargo: f.cargo, rol: f.rol, permisos: f.rol === 'JEFE' ? todos : PERM_OPERARIO };
    });
    const b = $('ucOk'); b.disabled = true; b.textContent = 'Cargando…';
    llamar('bdCargarUsuarios', { token: ses.token, filas }).then(r => {
      revisarSesion();   // si cambió los permisos de quien está usando la app, se aplican ya
      usLista = r.usuarios;
      if (!pfFalta) llamar('bdPerfiles', ses.token).then(p => { pfLista = p; }).catch(() => {});
      llamar('bdInicio').then(d => { ini.operarios = d.operarios; }).catch(() => {});
      // Los nuevos quedan en la regional con la que entraste (lo hace el servidor)
      llamar('bdRegionalesUsuarios', ses.token).then(rg => { usRegs = rg || {}; }).catch(() => {});
      abrirModal(`<div class="fila-sb"><span class="h2">Lista cargada</span>${btnCerrar()}</div>
        <div class="inv-res mt12">
          <div><span class="muted small">Creados</span><b class="txt-verde">${r.creados}</b></div>
          <div><span class="muted small">Actualizados</span><b>${r.actualizados}</b></div>
          <div><span class="muted small">No se pudieron</span><b class="${r.errores.length ? 'txt-rojo' : ''}">${r.errores.length}</b></div></div>
        ${r.errores.length ? `<div class="alerta-fefo mt8">${r.errores.map(e => `${esc(e.cedula || '')} ${esc(e.nombre || '')}: <b>${esc(e.error)}</b>`).join('<br>')}</div>` : ''}
        <span class="mt12">Los nuevos entran con su <b>cédula</b> y de PIN los <b>últimos 4 números de su cédula</b>. Recomiéndales cambiarlo: tú se lo cambias en Usuarios.</span>
        <button class="btn btn-pri btn-xl mt16" onclick="cerrarModal(); pintarApp()">Listo</button>`);
    }).catch(e => { errForm(e.message); b.disabled = false; b.textContent = 'Cargar usuarios'; });
  }

  function guardarUsuario() {
    const u = usEdit, pin = pinValor('usPin');
    const err = m => { const e = $('usErr'); e.textContent = m; e.hidden = false; e.scrollIntoView({ behavior: 'smooth', block: 'center' }); };
    u.nombre = $('usNom').value;
    u.cedula = ($('usCed').value || '').replace(/\D/g, '');
    if (!u.nombre.trim()) return err('Escribe el nombre.');
    if (u.cedula.length < 5) return err('Escribe la cédula (solo números). Con ella entra a la app.');
    if (!u.id && pin.length !== 4) return err('Ponle un PIN de 4 números.');
    if (pin && pin.length !== 4) return err('El PIN deben ser 4 números.');
    const b = $('usOk'); b.disabled = true; b.textContent = 'Guardando…';
    llamar('bdGuardarUsuario', { token: ses.token, id: u.id, nombre: u.nombre.trim(), cedula: u.cedula, cargo: (u.cargo || '').trim(), rol: u.rol, activo: u.activo, permisos: u.permisos, perfilId: u.perfilId || null, pin })
      .then(l => {
        revisarSesion();   // si cambió los permisos de quien está usando la app, se aplican ya
        // La persona queda en la regional con la que entraste (eso lo hace el servidor). Solo el superadministrador le cambia las regionales.
        const nuevo = u.id || (l.find(x => String(x.cedula) === String(u.cedula)) || {}).id;
        const gu = l.find(x => x.id === nuevo);
        if (gu) setTimeout(() => avisarPermisosNoGuardados(u.permisos, gu.permisos), 1500);
        if (!nuevo || !puede('superadmin') || !hayRegionales()) return l;
        return llamar('bdGuardarRegionalesUsuario', { token: ses.token, id: nuevo, regionales: u.regionales })
          .then(() => llamar('bdUsuarios', ses.token))   // si le quitaste esta regional, sale de la lista
          .then(l2 => l2, e => { toast('El usuario se guardó, pero sus regionales no: ' + e.message, 'error'); return l; });
      })
      .then(l => {
        usLista = l; usEdit = null;
        llamar('bdRegionalesUsuarios', ses.token).then(r => { usRegs = r || {}; }).catch(() => {});
        if (!pfFalta) llamar('bdPerfiles', ses.token).then(p => { pfLista = p; }).catch(() => {});
        llamar('bdInicio').then(d => { ini.operarios = d.operarios; }).catch(() => {});
        toast(u.id ? 'Cambios guardados' : `Usuario creado. Su PIN es ${pin}`, 'ok');
        if (u.id === ses.id) revisarSesion();
        pintarApp();
        window.scrollTo(0, 0);
      })
      .catch(e => { err(e.message); b.disabled = false; b.textContent = u.id ? 'Guardar cambios' : 'Crear usuario'; });
  }

  function vistaPermitida(v) {
    if (v === 'recibidor') return puedeAlguno(PERM_RC) || puede('calidad') || puede('inv_recibo');
    if (v === 'rotulo') return puede('rotular');
    if (v === 'config') return puede('config');
    if (v === 'usuarios') return puede('usuarios');
    return true;
  }
  function irVista(v) {
    if (!vistaPermitida(v)) return toast('No tienes permiso para entrar ahí', 'error');
    if (v === 'usuarios') { usLista = null; pfLista = null; usEdit = null; pfEdit = null; usSel.clear(); }
    if (v === 'rotulo') { sinImp = null; rotulos = null; piLista = null; }
    if (v === 'productos') { invData = null; cicLista = null; cicData = cicSel ? cicData : null; }
    vista = v; pintarApp();
  }

  // Pistola lectora (escribe muy rápido y termina con Enter): funciona aunque no haya un campo seleccionado
  let pistola = { txt: '', t: 0 };
  document.addEventListener('keydown', ev => {
    if (pantalla !== 'app') return;
    const el = document.activeElement;
    if (el && (el.tagName === 'INPUT' || el.tagName === 'SELECT' || el.tagName === 'TEXTAREA')) return;
    const ahora = Date.now();
    if (ev.key === 'Enter') {
      if (pistola.txt.length >= 3) {
        ev.preventDefault();
        const t = pistola.txt; pistola.txt = '';
        if ($('eanTxt')) { $('eanTxt').value = t; guardarEan(); }
        else if ($('eanMini') && $('eanMini').offsetParent) { $('eanMini').value = t; guardarEanMini($('eanMini').dataset.pid); }
        else if ($('raTxt')) rotuloAquiTexto(t);
        else if (flujo && flujo.paso === 'lugar') flujoLugarCodigo(t);
        else if (flujo && flujo.paso === 'origen') flujoOrigenCodigo(t);
        else if ($('rcQ') && $('rcTabla')) rcEscaneado(t);   // reconteo: solo busca el producto para contarlo
        else { cerrarModal(); buscarCodigo(t); }
      }
      pistola.txt = '';
      return;
    }
    if (ev.key.length !== 1) return;
    if (ahora - pistola.t > 80) pistola.txt = '';
    pistola.txt += ev.key; pistola.t = ahora;
  });/* ================= Plano en 3D (solo PC) =================
     Se dibuja en un lienzo, sin librerías: cada posición es una columna de cajas (una por nivel y lado),
     del color de su estado (vacío, más de 30 días, por vencer, vencido). Arrastrar = girar, rueda = acercar,
     clic derecho o Shift + arrastrar = mover, clic en una caja = abrir esa posición. */
  let ver3d = leerLS('mapa3d') === '1';
  const pc3d = () => window.matchMedia('(min-width: 1000px) and (pointer: fine)').matches;
  const p3 = { yaw: -0.55, tilt: 0.95, zoom: 1, px: 0, py: 0, cajas: [], hits: [], hover: null, raf: 0, ini: false };
  function ponerVer3d(si) {
    ver3d = !!si; guardarLS('mapa3d', ver3d ? '1' : '');
    p3.ini = false;
    pintarApp();
  }
  const usa3d = () => ver3d && pc3d() && !colocando;
  function plano3dHtml() {
    return `<div class="p3-wrap" id="p3Wrap">
      <canvas id="plano3d" aria-label="Plano en 3D"></canvas>
      <div class="p3-ctrl">
        ${ayudaHtml('Arrastra con el mouse para girar. Rueda para acercar o alejar. Clic derecho (o Shift + arrastrar) para mover. Clic en una caja para abrir esa posición. Cada caja es un nivel de la posición, del color de su estado.')}
        <button onclick="p3Zoom(1.25)" aria-label="Acercar">+</button>
        <button onclick="p3Zoom(1 / 1.25)" aria-label="Alejar">−</button>
        <button onclick="p3Vista('arriba')">Desde arriba</button>
        <button onclick="p3Vista('')">Restablecer</button>
      </div>
      <div class="p3-tip" id="p3Tip" hidden></div>
    </div>`;
  }
  function p3Zoom(f) { p3.zoom = Math.min(8, Math.max(0.3, p3.zoom * f)); p3Pintar(); }
  function p3Vista(v) { if (v === 'arriba') { p3.tilt = 1.5; p3.yaw = 0; } else { p3.yaw = -0.55; p3.tilt = 0.95; p3.zoom = 1; p3.px = 0; p3.py = 0; } p3Pintar(); }

  // Cajas del plano: posiciones (por nivel y lado), paredes y piso de las zonas
  // Piezas del plano: estantería (parales azules y vigas naranja), estibas de madera con cajas encima, paredes y piso.
  // Cada posición (nivel y lado) es una "celda": al tocar cualquiera de sus piezas se abre esa posición.
  function p3Datos() {
    const dentro = sede.zonas.filter(enPlano), zv = dentro.length > 1 ? zonaVista() : null;
    const zonas = zv ? [zv] : dentro;
    const piezas = [], pisos = [], etqs = [], celdas = [];
    const H = 26;   // alto de cada nivel
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    const caja = (x, y, x2, y2) => { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x2); y1 = Math.max(y1, y2); };
    const colores = getComputedStyle(document.documentElement);
    const col = k => colores.getPropertyValue('--' + k).trim() || '#999';
    const C = { ocupado: col('ocupado'), pronto: col('pronto'), vencido: col('vencido') };
    const PARAL = '#2f5d9e', VIGA = '#e8772e', MADERA = '#b7895a', CARTON = ['#c9a06a', '#bf9460', '#d2ab76'];
    const add = (x, y, z, w, h, d, color, extra) => piezas.push(Object.assign({ x, y, z, w, h, d, color }, extra || {}));
    zonas.forEach(z => {
      pisos.push({ x: z.x, y: z.y, w: z.ancho, h: z.alto, color: z.color });
      (z.areas || []).forEach(a => pisos.push({ x: a.x, y: a.y, w: a.ancho, h: a.alto, color: z.color }));
      caja(z.x, z.y, z.x + z.ancho, z.y + z.alto);
      etqs.push({ x: z.x + 8, y: z.y + 10, z: 0, txt: z.nombre, color: z.color, grande: true });
      racksEnPlano(z).forEach(c => {
        const r = c.r, grueso = r.fondo === 'D' ? 44 : 22;
        const piezasR = c.tramos ? (() => { let ini = 1; return c.tramos.map(t => { const pz = { x: t.x, y: t.y, largo: t.largo, o: 'V', desde: ini, n: t.pos, ancho: t.ancho || grueso }; ini += t.pos; return pz; }); })()
          : [{ x: c.x, y: c.y, largo: c.largo, o: c.o, desde: 1, n: r.posiciones, ancho: grueso }];
        // Niveles de la fila (el picking va en el piso)
        const nivFila = [...new Set(sede.espacios.filter(e => e.rackId === r.id).map(e => e.nivel))].sort((a, b) => a - b);
        const nNiv = Math.max(1, nivFila.length), alto = nNiv * H + 3;
        piezasR.forEach((pz, k) => {
          const paso = pz.largo / Math.max(1, pz.n), H_ = pz.o === 'H';
          if (k === 0) etqs.push({ x: pz.x + (H_ ? -14 : pz.ancho / 2), y: pz.y + (H_ ? pz.ancho / 2 : -12), z: alto + 6, txt: nombreCorto(r) });
          // Estructura: un paral en cada borde de posición (adelante y atrás) y vigas en cada nivel
          const T = 2.2;
          for (let i = 0; i <= pz.n; i++) {
            const a = Math.min(pz.largo - T, i * paso);
            if (H_) { add(pz.x + a, pz.y, 0, T, T, alto, PARAL, { est: 1 }); add(pz.x + a, pz.y + pz.ancho - T, 0, T, T, alto, PARAL, { est: 1 }); }
            else { add(pz.x, pz.y + a, 0, T, T, alto, PARAL, { est: 1 }); add(pz.x + pz.ancho - T, pz.y + a, 0, T, T, alto, PARAL, { est: 1 }); }
          }
          for (let i = 0; i < pz.n; i++) {
            const p = pz.desde + i;
            if (p > r.posiciones || r.omitidas.includes(p)) continue;
            let x, y, w, h;
            if (H_) { w = paso; h = pz.ancho; y = pz.y; x = r.invertida ? pz.x + pz.largo - (i + 1) * paso : pz.x + i * paso; }
            else { w = pz.ancho; h = paso; x = pz.x; y = r.invertida ? pz.y + i * paso : pz.y + pz.largo - (i + 1) * paso; }
            caja(x, y, x + w, y + h);
            // Vigas de esta posición en cada nivel (por posición, para que se dibujen en el orden correcto)
            for (let n = 1; n <= nNiv; n++) {
              const zv2 = n * H - 2;
              if (H_) { add(x, y, zv2, w, T, 2.4, VIGA, { est: 1 }); add(x, y + h - T, zv2, w, T, 2.4, VIGA, { est: 1 }); }
              else { add(x, y, zv2, T, h, 2.4, VIGA, { est: 1 }); add(x + w - T, y, zv2, T, h, 2.4, VIGA, { est: 1 }); }
            }
            const esps = espaciosDe(r.id, p);
            const lados = [...new Set(esps.map(e => e.lado))].sort();
            esps.forEach(e => {
              const nv = Math.max(0, nivFila.indexOf(e.nivel)), li = lados.indexOf(e.lado), nl = Math.max(1, lados.length);
              let bx = x, by = y, bw = w, bh = h;
              if (nl > 1) { if (H_) { bh = h / nl; by = y + li * bh; } else { bw = w / nl; bx = x + li * bw; } }
              const ls = lineasDe(e.id), est = estadoDe(ls);
              const cel = { esp: e, rackId: r.id, pos: p, vacio: !ls.length, apagado: !!busqueda.trim() && !coincide(e.id),
                x: bx, y: by, z: nv * H + (nv ? 0.4 : 0), w: bw, h: bh, d: H - 4 };
              celdas.push(cel);
              if (!ls.length) return;
              // Estiba de madera y encima las cajas (la tapa sale del color de su vencimiento)
              const m = 2.2, zb = cel.z + (nv ? 0.6 : 0);
              add(bx + m, by + m, zb, bw - 2 * m, bh - 2 * m, 2.6, MADERA, { cel });
              const tapa = C[est] || C.ocupado, cajasN = Math.min(3, Math.max(1, ls.length + 1));
              const largoL = (H_ ? bw : bh) - 2 * m - 1, alt = H - 9;
              for (let q = 0; q < cajasN; q++) {
                const t0 = m + 0.5 + q * largoL / cajasN, tl = largoL / cajasN - 1;
                const altq = alt - (q % 2) * 3;
                if (H_) add(bx + t0, by + m + 0.8, zb + 2.6, tl, bh - 2 * m - 1.6, altq, CARTON[q % 3], { cel, top: tapa });
                else add(bx + m + 0.8, by + t0, zb + 2.6, bw - 2 * m - 1.6, tl, altq, CARTON[q % 3], { cel, top: tapa });
              }
            });
          }
        });
      });
    });
    (sede.muros || []).forEach(([a, b, c2, d2]) => {
      const x = Math.min(a, c2), y = Math.min(b, d2), w = Math.max(4, Math.abs(c2 - a)), h = Math.max(4, Math.abs(d2 - b));
      if (x + w < x0 || x > x1 || y + h < y0 || y > y1) return;
      add(x, y, 0, w, h, 90, '#9aa3ae', { muro: true });
    });
    return { piezas, celdas, pisos, etqs, cx: (x0 + x1) / 2, cy: (y0 + y1) / 2, ancho: Math.max(1, x1 - x0), alto: Math.max(1, y1 - y0),
      piso: { x: x0 - 20, y: y0 - 20, w: x1 - x0 + 40, h: y1 - y0 + 40 } };
  }

  function p3Pintar() { if (!p3.raf) p3.raf = requestAnimationFrame(() => { p3.raf = 0; p3Dibujar(); }); }
  function p3Dibujar() {
    const cv = $('plano3d');
    if (!cv) return;
    const wrap = $('p3Wrap'), W = wrap.clientWidth, Hc = Math.max(420, Math.min(760, window.innerHeight - 220));
    const dpr = window.devicePixelRatio || 1;
    if (cv.width !== Math.round(W * dpr) || cv.height !== Math.round(Hc * dpr)) { cv.width = Math.round(W * dpr); cv.height = Math.round(Hc * dpr); cv.style.width = W + 'px'; cv.style.height = Hc + 'px'; }
    const g = cv.getContext('2d');
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.clearRect(0, 0, W, Hc);
    const D = p3.datos || (p3.datos = p3Datos());
    const cy = Math.cos(p3.yaw), sy = Math.sin(p3.yaw), ct = Math.cos(p3.tilt), st = Math.sin(p3.tilt);
    const base = Math.min(W / (D.ancho * 1.1), Hc / (D.alto * 1.25)), s = base * p3.zoom;
    const ox = W / 2 + p3.px, oy = Hc / 2 + p3.py;
    // Mundo (x, y, z) → pantalla. La cámara mira desde +y (girado) y desde arriba según la inclinación.
    const pr = (x, y, z) => { const rx = (x - D.cx) * cy - (y - D.cy) * sy, ry = (x - D.cx) * sy + (y - D.cy) * cy; return [ox + rx * s, oy + (ry * st - z * ct) * s, ry * ct + z * st]; };
    const poli = (pts, fill, stroke, alfa) => { g.globalAlpha = alfa; g.beginPath(); pts.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.closePath(); if (fill) { g.fillStyle = fill; g.fill(); } if (stroke) { g.strokeStyle = stroke; g.lineWidth = 0.5; g.stroke(); } g.globalAlpha = 1; };
    const rect = f => [pr(f.x, f.y, 0), pr(f.x + f.w, f.y, 0), pr(f.x + f.w, f.y + f.h, 0), pr(f.x, f.y + f.h, 0)];
    // Piso de concreto y las zonas encima
    poli(rect(D.piso), '#d9dde2', null, 0.55);
    D.pisos.forEach(f => poli(rect(f), f.color, f.color, 0.14));
    const oscuro = (hex, f) => { const m = /^#?([0-9a-f]{6})$/i.exec(hex); if (!m) return hex; const n = parseInt(m[1], 16); return `rgb(${Math.round((n >> 16) * f)},${Math.round(((n >> 8) & 255) * f)},${Math.round((n & 255) * f)})`; };
    // Sombra suave de cada estiba en el piso del nivel
    const orden = D.piezas.map(b => ({ b, k: pr(b.x + b.w / 2, b.y + b.h / 2, b.z + b.d / 2)[2] + (b.est ? -0.01 : 0) })).sort((a, b) => a.k - b.k);
    const caras = [[1, 0], [-1, 0], [0, 1], [0, -1]];
    const hits = new Map();
    orden.forEach(({ b }) => {
      const { x, y, z, w, h, d } = b, z2 = z + d;
      const cel = b.cel, alfa = cel && cel.apagado ? 0.15 : 1, resalto = cel && p3.hover === cel;
      const color = resalto ? '#3b82f6' : b.color;
      const ps = [];
      caras.forEach(([nx, ny]) => {
        if (nx * sy + ny * cy <= 0) return;   // esa cara no mira a la cámara
        let q;
        if (nx === 1) q = [[x + w, y], [x + w, y + h]]; else if (nx === -1) q = [[x, y + h], [x, y]];
        else if (ny === 1) q = [[x + w, y + h], [x, y + h]]; else q = [[x, y], [x + w, y]];
        const cara = [pr(q[0][0], q[0][1], z), pr(q[1][0], q[1][1], z), pr(q[1][0], q[1][1], z2), pr(q[0][0], q[0][1], z2)];
        poli(cara, oscuro(color, nx ? 0.7 : 0.85), b.est ? null : 'rgba(60,40,20,.35)', alfa);
        ps.push(cara);
      });
      const tapa = [pr(x, y, z2), pr(x + w, y, z2), pr(x + w, y + h, z2), pr(x, y + h, z2)];
      poli(tapa, resalto ? '#60a5fa' : b.top || color, b.est ? null : 'rgba(60,40,20,.35)', alfa);
      ps.push(tapa);
      if (cel) { const l = hits.get(cel) || []; hits.set(cel, l.concat(ps)); }
    });
    // Celdas vacías: se pueden tocar aunque no tengan nada (su caja invisible)
    p3.hits = [];
    D.celdas.forEach(c => {
      if (hits.has(c)) return;
      const { x, y, z, w, h } = c, z2 = z + 4;
      p3.hits.push({ b: c, pts: [[pr(x, y, z2), pr(x + w, y, z2), pr(x + w, y + h, z2), pr(x, y + h, z2)]], k: pr(x + w / 2, y + h / 2, z)[2] });
      if (p3.hover === c) poli([pr(x, y, z + 0.8), pr(x + w, y, z + 0.8), pr(x + w, y + h, z + 0.8), pr(x, y + h, z + 0.8)], '#3b82f6', '#1d4ed8', 0.45);
    });
    hits.forEach((pts, c) => p3.hits.push({ b: c, pts, k: pr(c.x + c.w / 2, c.y + c.h / 2, c.z + c.d)[2] }));
    p3.hits.sort((a, b) => a.k - b.k);
    // Nombres de zonas y filas
    g.textBaseline = 'middle';
    D.etqs.forEach(e => {
      const [sx, syy] = pr(e.x, e.y, e.z);
      g.font = e.grande ? '700 13px Inter, system-ui, sans-serif' : '700 11px Inter, system-ui, sans-serif';
      g.textAlign = e.grande ? 'left' : 'center';
      if (!e.grande) { const tw = g.measureText(e.txt).width + 8; g.fillStyle = 'rgba(255,255,255,.85)'; g.fillRect(sx - tw / 2, syy - 8, tw, 16); }
      g.fillStyle = e.color || '#1b2430';
      g.fillText(e.txt, sx, syy);
    });
  }
  const p3Dentro = (pt, poly) => { let c = false; for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) { const [xi, yi] = poly[i], [xj, yj] = poly[j]; if ((yi > pt[1]) !== (yj > pt[1]) && pt[0] < (xj - xi) * (pt[1] - yi) / (yj - yi) + xi) c = !c; } return c; };
  function p3Buscar(ev) {
    const r = $('plano3d').getBoundingClientRect(), pt = [ev.clientX - r.left, ev.clientY - r.top];
    for (let i = p3.hits.length - 1; i >= 0; i--) if (p3.hits[i].pts.some(pl => p3Dentro(pt, pl))) return p3.hits[i].b;
    return null;
  }
  function iniciar3d() {
    const cv = $('plano3d');
    if (!cv) return;
    p3.datos = null;
    if (cv.dataset.listo) return p3Pintar();
    cv.dataset.listo = '1';
    let movio = false;
    cv.addEventListener('contextmenu', ev => ev.preventDefault());
    cv.addEventListener('mousedown', ev => { p3.arr = { x: ev.clientX, y: ev.clientY, mover: ev.button === 2 || ev.shiftKey }; movio = false; });
    if (!p3.suelta) { p3.suelta = true; window.addEventListener('mouseup', () => { p3.arr = null; }); }
    cv.addEventListener('mousemove', ev => {
      const arr = p3.arr;
      if (arr) {
        const dx = ev.clientX - arr.x, dy = ev.clientY - arr.y;
        if (Math.abs(dx) + Math.abs(dy) > 2) movio = true;
        if (arr.mover) { p3.px += dx; p3.py += dy; }
        else { p3.yaw += dx * 0.008; p3.tilt = Math.min(1.5, Math.max(0.2, p3.tilt + dy * 0.006)); }
        arr.x = ev.clientX; arr.y = ev.clientY;
        $('p3Tip').hidden = true;
        return p3Pintar();
      }
      const b = p3Buscar(ev), tip = $('p3Tip');
      if (b !== p3.hover) { p3.hover = b; p3Pintar(); }
      cv.style.cursor = b ? 'pointer' : 'grab';
      if (!b) { tip.hidden = true; return; }
      const ls = lineasDe(b.esp.id);
      tip.innerHTML = `<b>${esc(cu(b.esp.id))}</b>${ls.length ? ls.map(l => `<span>${esc(l.nombre)} · ${cant(l)}</span>`).join('') : '<span>Vacío</span>'}`;
      const r = $('p3Wrap').getBoundingClientRect();
      tip.style.left = Math.min(ev.clientX - r.left + 14, r.width - 260) + 'px'; tip.style.top = (ev.clientY - r.top + 14) + 'px';
      tip.hidden = false;
    });
    cv.addEventListener('mouseleave', () => { $('p3Tip').hidden = true; if (p3.hover) { p3.hover = null; p3Pintar(); } });
    cv.addEventListener('click', ev => { if (movio) return; const b = p3Buscar(ev); if (b) abrirPos(b.rackId, b.pos, b.esp.id); });
    cv.addEventListener('wheel', ev => { ev.preventDefault(); p3Zoom(ev.deltaY < 0 ? 1.12 : 1 / 1.12); }, { passive: false });
    p3Pintar();
  }

  /* ================= Mapa ================= */
  let zoom = null; // null = ajustar al ancho de la pantalla

  function vistaMapa() {
    let h = '';
    if (!sede.zonas.length) {
      return h + `<div class="card col gap12 mt12"><span class="h3">Esta sede no tiene plano todavía</span>
        <span class="muted">${puede('config') ? 'Dibújalo en Configuración → Editor del plano: zonas, filas y paredes.' : 'Pídele a quien maneja el plano que lo dibuje.'}</span>
        ${puede('config') ? `<button class="btn btn-pri" onclick="cfgTab='editor'; irVista('config')">Dibujar el plano</button>` : ''}</div>`;
    }
    if (esJefe()) h += kpis();
    h += `<div class="fila-sb wrap-f gap8 mt12">${leyenda()}
      <div class="fila gap8 wrap-f">
        <label for="busca" class="oculto">Buscar producto o lote</label>
        <input id="busca" class="campo busca" placeholder="Resaltar en el plano (producto o lote)" value="${esc(busqueda)}" autocomplete="off">
        ${usa3d() ? '' : `<div class="zoom" role="group" aria-label="Zoom del plano">
          <button onclick="cambiarZoom(1 / 1.25)" aria-label="Alejar">−</button>
          <button onclick="cambiarZoom(0)">Ajustar</button>
          <button onclick="cambiarZoom(1.25)" aria-label="Acercar">+</button>
        </div>`}
        ${puedeCargarAereo() ? '<button class="btn btn-sec" onclick="abrirCargaAereo()">Cargar aéreo (Excel)</button>' : ''}
        ${!pantallaTactil() ? `<label class="sw3d"><input type="checkbox" role="switch" ${verEscanearPC() ? 'checked' : ''} onchange="ponerEscanearPC(this.checked)"><span class="sw3d-i" aria-hidden="true"></span>Producto y Lugar</label>` : ''}
        ${pc3d() && !colocando ? `<label class="sw3d"><input type="checkbox" role="switch" ${ver3d ? 'checked' : ''} onchange="ponerVer3d(this.checked)"><span class="sw3d-i" aria-hidden="true"></span>Ver en 3D</label>` : ''}
      </div></div>
      ${zonasBarHtml()}
      <div id="mapaCont">${contenidoMapa()}</div>`;
    return h;
  }

  // Ver todo el mapa o una sola zona en grande (se recuerda en este equipo, por sede)
  let zonaVer = null, zonaVerSede = null;
  function zonaVista() {
    if (zonaVer === null || zonaVerSede !== ses.sedeId) { zonaVer = leerLS('mapaZona:' + ses.sedeId) || ''; zonaVerSede = ses.sedeId; }
    const z = zonaVer && sede.zonas.find(x => x.id === zonaVer && enPlano(x));
    return z || null;
  }
  function zonasBarHtml() {
    const dentro = sede.zonas.filter(enPlano);
    if (dentro.length < 2 || colocando) return '';
    const z = zonaVista();
    return `<div class="mapa-zonas" role="group" aria-label="Zona del mapa">
      <button class="${z ? '' : 'on'}" aria-pressed="${!z}" onclick="verZona('')">Todo el mapa</button>
      ${dentro.map(x => `<button class="${z && z.id === x.id ? 'on' : ''}" aria-pressed="${!!(z && z.id === x.id)}" onclick="verZona('${esc(x.id)}')">${esc(x.nombre)}</button>`).join('')}
    </div>`;
  }
  function verZona(id) {
    zonaVer = id || '';
    guardarLS('mapaZona:' + ses.sedeId, zonaVer);
    zoom = null;
    pintarApp();
  }

  const enPlano = z => z.x !== null && z.y !== null && z.ancho && z.alto;

  function contenidoMapa() {
    if (usa3d() && sede.zonas.some(enPlano)) return plano3dHtml();
    const dentro = sede.zonas.filter(enPlano);
    const fuera = sede.zonas.filter(z => !enPlano(z));
    const zv = !colocando && dentro.length > 1 ? zonaVista() : null;
    if (zv) return planoHtml([zv], true);
    let h = dentro.length ? planoHtml(dentro) : '';
    if (fuera.length) {
      h += `${dentro.length ? '<span class="lbl mt16">Zonas sin ubicación en el plano</span>' : ''}
        <div class="zonas">${fuera.map(zonaHtml).join('')}</div>`;
    }
    return h;
  }

  function hexA(hex, a) {
    const m = /^#?([0-9a-f]{6})$/i.exec(hex || '');
    if (!m) return 'transparent';
    const n = parseInt(m[1], 16);
    return `rgba(${n >> 16}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
  }

  // Racks de una zona del plano; los que no tienen coordenadas se acomodan solos
  function racksEnPlano(z) {
    let auto = 0;
    return sede.racks.filter(r => r.zonaId === z.id).map(r => {
      if (r.tramos) return { r, x: r.x, y: r.y, largo: r.largo, o: 'V', tramos: r.tramos };
      if (r.x !== null && r.y !== null && r.largo) return { r, x: r.x, y: r.y, largo: r.largo, o: r.orientacion };
      const x = z.x + 10 + (auto++) * 50;
      return { r, x, y: z.y + 30, largo: Math.max(60, z.alto - 40), o: 'V' };
    });
  }

  function ocupacionZona(z) {
    const esps = sede.espacios.filter(e => sede.rackPorId[e.rackId] && sede.rackPorId[e.rackId].zonaId === z.id);
    if (!esps.length) return sede.racks.some(r => r.zonaId === z.id) ? 'Sin niveles' : 'Sin racks';
    const ocup = esps.filter(e => lineasDe(e.id).length).length;
    return (ocup ? Math.max(1, Math.round(ocup * 100 / esps.length)) : 0) + '% ocupado';
  }

  function planoHtml(zonas, recortar) {
    let w = 0, h = 0, x0 = Infinity, y0 = Infinity;
    const racks = [];
    const caja = (x, y, x2, y2) => { w = Math.max(w, x2); h = Math.max(h, y2); x0 = Math.min(x0, x); y0 = Math.min(y0, y); };
    zonas.forEach(z => {
      caja(z.x, z.y, z.x + z.ancho, z.y + z.alto);
      (z.areas || []).forEach(a => caja(a.x, a.y, a.x + a.ancho, a.y + a.alto));
      if (z.etqY !== null && z.etqY !== undefined) caja(z.etqX !== null ? z.etqX : z.x, z.etqY, z.x, z.etqY);
      racksEnPlano(z).forEach(x => {
        racks.push(x);
        (x.tramos || [{ x: x.x, y: x.y, largo: x.largo }]).forEach(t => {
          caja(t.x, t.y, t.x + (x.o === 'V' ? 44 : t.largo), t.y + (x.o === 'V' ? t.largo : 44));
        });
      });
    });
    // Una sola zona: se recorta a lo que ocupa esa zona (con espacio para su nombre arriba), así se ve en grande
    const dx = recortar ? Math.max(0, x0 - 8) : 0, dy = recortar ? Math.max(0, y0 - 20) : 0;
    w = w - dx + 12; h = h - dy + 12;
    return `<div class="plano-wrap" id="planoWrap"><div class="plano-sizer" id="planoSizer">
      <div class="plano${recortar ? ' plano-zona' : ''}" id="plano" data-w="${w}" data-h="${h}" style="width:${w}px;height:${h}px">${recortar ? `<div class="plano-in" style="left:${-dx}px;top:${-dy}px">` : ''}
        ${zonas.map(z => [{ x: z.x, y: z.y, ancho: z.ancho, alto: z.alto }].concat(z.areas || []).map(a =>
          `<div class="pz" style="left:${a.x}px;top:${a.y}px;width:${a.ancho}px;height:${a.alto}px;border-color:${esc(z.color)};background:${hexA(z.color, .06)}"></div>`).join('')).join('')}
        ${(sede.muros || []).map(([x1, y1, x2, y2]) =>
          `<div class="muro" style="left:${Math.min(x1, x2) - 2}px;top:${Math.min(y1, y2)}px;width:${Math.abs(x2 - x1) + 4}px;height:${Math.abs(y2 - y1) || 4}px"></div>`).join('')}
        ${pasillosPlanoHtml(zonas)}
        ${racks.map(rackPlanoHtml).join('')}
        ${zonas.map(z => `<div class="pz-lbl" style="left:${z.etqX !== null ? z.etqX : z.x + 8}px;top:${z.etqY !== null ? z.etqY : z.y - 11}px;border-color:${esc(z.color)}">
          <b style="color:${esc(z.color)}">${esc(z.nombre)}</b><small>${ocupacionZona(z)}</small></div>`).join('')}
      ${recortar ? '</div>' : ''}</div></div></div>`;
  }

  // Color del pasillo: el de la zona de sus filas (así se sigue viendo de qué zona es)
  const colorPasillo = zonas => (zonas.find(Boolean) || { color: '#5A6673' }).color;

  // Pasillos del editor que tocan las zonas que se están viendo
  function pasillosPlanoHtml(zonas) {
    const ids = new Set(zonas.map(z => z.id));
    return (sede.pasillos || []).filter(pa => pa.ancho > 0 && pa.alto > 0 && pa.filas.some(id => sede.rackPorId[id] && ids.has(sede.rackPorId[id].zonaId)))
      .map(pa => {
        const c = colorPasillo(pa.filas.map(id => sede.rackPorId[id] && sede.zonaPorId[sede.rackPorId[id].zonaId]));
        return `<div class="pasillo-area" style="left:${pa.x}px;top:${pa.y}px;width:${pa.ancho}px;height:${pa.alto}px;border-color:${esc(c)}" title="Pasillo ${esc(pa.nombre)}">
          <span class="${pa.alto > pa.ancho ? 'vert' : ''}" style="color:${esc(c)};border-color:${esc(c)}">Pasillo ${esc(pa.nombre)}</span></div>`;
      }).join('');
  }

  // Nombre corto de la fila en el plano: el que se le puso (Fila 4 → F4)
  const nombreCorto = r => String(r.nombre || '').replace(/^\s*fila\s*/i, 'F').trim() || ((r.id.match(/F(\d+)$/) || [])[1] ? 'F' + Number(r.id.match(/F(\d+)$/)[1]) : '');
  function rackPlanoHtml({ r, x, y, largo, o, tramos }) {
    if (tramos) {
      // Fila con varios tramos (las dos caras de un pasillo): la numeración sigue de un tramo al otro
      const num = (r.id.match(/F(\d+)$/) || [])[1];
      const grueso = r.fondo === 'D' ? 44 : 20;
      let inicio = 1;
      return tramos.map(t => {
        let celdas = '';
        for (let p = inicio; p < inicio + t.pos && p <= r.posiciones; p++) celdas += celdaHtml(r, p, 'pc');
        inicio += t.pos;
        return `<div class="pr V${r.invertida ? ' inv' : ''}" style="left:${t.x}px;top:${t.y}px;width:${t.ancho || grueso}px;height:${t.largo}px"><span class="fila-lbl">${esc(nombreCorto(r))}</span>${celdas}</div>`;
      }).join('');
    }
    const grueso = r.fondo === 'D' ? 44 : 20; // doble fondo se dibuja más ancho
    const tam = o === 'V' ? `width:${grueso}px;height:${largo}px` : `height:${grueso}px;width:${largo}px`;
    let celdas = '';
    for (let p = 1; p <= r.posiciones; p++) {
      celdas += celdaHtml(r, p, 'pc');
      r.pasillos.filter(k => k === p).forEach(() => celdas += '<span class="pasillo" aria-hidden="true"></span>');
    }
    const num = (r.id.match(/F(\d+)$/) || [])[1];
    return `<div class="pr ${o}${r.invertida ? ' inv' : ''}" style="left:${x}px;top:${y}px;${tam}"><span class="fila-lbl">${esc(nombreCorto(r))}</span>${celdas}</div>`;
  }

  // Una posición: una franja por nivel (arriba el más alto), cada franja dividida en A / B
  function celdaHtml(r, p, clase) {
    if (r.omitidas.includes(p)) {
      // Posición quitada: quien maneja el plano la puede tocar para volver a ponerla
      return puede('estructura')
        ? `<button class="${clase === 'pc' ? 'pc-omit' : 'pos-omit'} quitada" onclick="restaurarPos('${esc(r.id)}', ${p})" aria-label="${esc(r.nombre)} posición ${p} quitada. Tocar para volver a ponerla" title="Posición ${p} quitada · tocar para volver a ponerla"></button>`
        : `<span class="${clase === 'pc' ? 'pc-omit' : 'pos-omit'}"></span>`;
    }
    const esps = espaciosDe(r.id, p);
    const sel = posSel && posSel.rackId === r.id && posSel.posicion === p ? 'sel' : '';
    const kp = r.id + '|' + p;
    const dim = seguir ? (seguir.hoy.has(kp) ? 'sig-hoy' : seguir.antes.has(kp) ? 'sig-antes' : 'dim')
      : busqueda.trim() && !esps.some(e => coincide(e.id)) ? 'dim' : '';
    const nombre = `${esc(r.nombre)} · posición ${p}`;
    if (!esps.length) {
      return `<button class="${clase} sin ${sel} ${dim}" onclick="abrirPos('${esc(r.id)}', ${p})" aria-label="${nombre}, sin niveles" title="${nombre}">${clase === 'pos' ? p : ''}</button>`;
    }
    const niveles = [...new Set(esps.map(e => e.nivel))].sort((a, b) => b - a);
    // Al pasar el mouse (o dejar el dedo) se ve qué hay en cada espacio
    const det = [...esps].sort((a, b) => b.nivel - a.nivel || a.lado.localeCompare(b.lado))
      .map(e => { const ls = lineasDe(e.id); return ls.length ? `${etiqueta(e)}: ${ls.map(l => l.nombre).join(' + ')}` : ''; })
      .filter(Boolean);
    const tit = esc(r.nombre + ' · posición ' + p + (det.length ? '\n' + det.join('\n') : ' · vacía'));
    return `<button class="${clase} ${sel} ${dim}" onclick="abrirPos('${esc(r.id)}', ${p})" aria-label="${tit}" title="${tit}"><span class="pc-in">
      ${niveles.map(n => `<span class="franja ${n === 0 ? 'pk' : ''}">${esps.filter(e => e.nivel === n)
        .sort((a, b) => a.lado.localeCompare(b.lado))
        .map(e => `<i class="e-${sede.bloqueos[e.id] ? 'bloq' : estadoDe(lineasDe(e.id))}${lineasDe(e.id).length > 1 ? ' multi' : ''}"></i>`).join('')}</span>`).join('')}
    </span></button>`;
  }

  // Cuánto se agranda una zona sola: en el computador, poco y igual para todas; en celular, hasta 3 veces
  const maxZona = () => (pantallaTactil() ? 3 : 1.4);
  // Escala el plano para que quepa en la pantalla (o usa el zoom elegido)
  function ajustarPlano() {
    if ($('plano3d')) return iniciar3d();
    const wrap = $('planoWrap'), pl = $('plano'), sizer = $('planoSizer');
    if (!wrap || !pl) return;
    const w = Number(pl.dataset.w), h = Number(pl.dataset.h);
    const s = zoom || Math.min(pl.classList.contains('plano-zona') ? maxZona() : 1, (wrap.clientWidth - 2) / w);
    pl.style.transform = `scale(${s})`;
    sizer.style.width = w * s + 'px';
    sizer.style.height = h * s + 'px';
  }

  function cambiarZoom(f) {
    const pl = $('plano'), wrap = $('planoWrap');
    if (!pl) return;
    const actual = zoom || Math.min(pl.classList.contains('plano-zona') ? maxZona() : 1, (wrap.clientWidth - 2) / Number(pl.dataset.w));
    zoom = f === 0 ? null : Math.min(4, Math.max(0.3, actual * f));
    ajustarPlano();
  }

  function kpis() {
    let ocup = 0, pv = 0, ven = 0;
    sede.espacios.forEach(e => { if (lineasDe(e.id).length) ocup++; });
    sede.lineas.forEach(l => {
      const d = dias(l.vencimiento);
      if (d !== null) { if (d < 0) ven++; else if (d <= DIAS_ALERTA) pv++; }
    });
    return `<div class="kpis">
      <div class="kpi"><span class="muted small">Espacios ocupados</span><span class="kpi-v">${ocup} de ${sede.espacios.length}</span></div>
      <div class="kpi"><span class="muted small">Vencen en menos de ${DIAS_ALERTA} días</span><span class="kpi-v txt-naranja">${pv}</span></div>
      <div class="kpi"><span class="muted small">Vencidos</span><span class="kpi-v txt-rojo">${ven}</span></div>
    </div>`;
  }

  // Zonas que aún no tienen ubicación en el plano: se muestran como tarjetas
  function zonaHtml(z) {
    const racks = sede.racks.filter(r => r.zonaId === z.id);
    return `<section class="zona" style="border-color:${esc(z.color)}">
      <div class="zona-tit"><span class="punto" style="background:${esc(z.color)}"></span><b>${esc(z.nombre)}</b>
        <span class="muted small">${ocupacionZona(z)}</span></div>
      ${racks.length ? `<div class="racks">${racks.map(r => {
        let celdas = '';
        for (let p = 1; p <= r.posiciones; p++) celdas += celdaHtml(r, p, 'pos');
        return `<div class="rack"><span class="rack-lbl" title="${esc(r.nombre)}">${esc(r.nombre)}</span><div class="rack-pos">${celdas}</div></div>`;
      }).join('')}</div>` : '<span class="muted small">Sin racks todavía.</span>'}
    </section>`;
  }

  function verSede(id) {
    ses.sedeId = id; posSel = null; espSel = null;
    llamar('bdSede', id).then(d => { setSede(d); pintarApp(); }).catch(e => toast(e.message, 'error'));
  }

  /* ================= Códigos de barras ================= */
  function dibujarCodigos(raiz) {
    if (!window.JsBarcode || !raiz) return;
    raiz.querySelectorAll('svg[data-cb]').forEach(el => {
      try {
        JsBarcode(el, el.dataset.cb, { format: 'CODE128', height: 52, width: 2, margin: 12, displayValue: true, font: 'Arial', fontOptions: 'bold', fontSize: 15, textMargin: 4, background: '#FFFFFF', lineColor: '#000000' });
      } catch (e) {}
    });
  }

  function textoUbic(e) {
    const r = sede.rackPorId[e.rackId];
    const z = sede.zonaPorId[r.zonaId];
    const pa = (sede.pasilloDeRack || {})[r.id];
    return `${z.nombre} · ${pa ? 'Pasillo ' + pa.nombre + ' · ' : ''}${r.nombre} · Posición ${e.posicion} · ${etiqueta(e)}`;
  }

  // Imprime etiquetas: [{ titulo, sub, codigo }]
  function imprimirEtiquetas(lista) {
    modoEtiquetas();
    const pr = $('print');
    pr.innerHTML = lista.map(x => `<div class="etq"><b>${esc(x.titulo)}</b><span>${esc(x.sub)}</span><svg data-cb="${esc(x.codigo)}"></svg></div>`).join('');
    dibujarCodigos(pr);
    setTimeout(() => window.print(), 100);
  }

  function etiquetasPosicion(rackId, p, conNiveles) {
    const r = sede.rackPorId[rackId];
    const z = sede.zonaPorId[r.zonaId];
    const pc = posCodigo(rackId, p), nuevo = !/[A-Z]/i.test(pc);
    const lista = [{ titulo: nuevo ? pc : `${r.nombre} · Posición ${p}`, sub: nuevo ? `${z.nombre} · ${r.nombre} · Posición ${p}` : z.nombre, codigo: pc }];
    if (conNiveles) {
      [...espaciosDe(rackId, p)].sort((a, b) => a.nivel - b.nivel || a.lado.localeCompare(b.lado))
        .forEach(e => lista.push(tieneCu(e.id) ? { titulo: cu(e.id), sub: `${z.nombre} · ${r.nombre} · P${p} · ${etiqueta(e)}`, codigo: cu(e.id) }
          : { titulo: `P${p} · ${etiqueta(e)}`, sub: `${z.nombre} · ${r.nombre}`, codigo: e.id }));
    }
    return lista;
  }

  function pedirEtiquetasRack(rackId) {
    const r = sede.rackPorId[rackId];
    abrirModal(`
      <div class="fila-sb"><span class="h2">Etiquetas de ${esc(r.nombre)}</span>${btnCerrar()}</div>
      <span class="muted small">Se abre la ventana de impresión con un código de barras por etiqueta.</span>
      <div class="col gap8 mt16">
        <button class="btn btn-pri btn-xl" onclick="imprimirRack('${esc(r.id)}', false)">Solo posiciones</button>
        <button class="btn btn-sec btn-xl" onclick="imprimirRack('${esc(r.id)}', true)">Posiciones y cada nivel / lado</button>
      </div>`);
  }

  function imprimirRack(rackId, conNiveles) {
    const r = sede.rackPorId[rackId];
    let lista = [];
    for (let p = 1; p <= r.posiciones; p++) {
      if (!r.omitidas.includes(p)) lista = lista.concat(etiquetasPosicion(rackId, p, conNiveles));
    }
    cerrarModal();
    imprimirEtiquetas(lista);
  }/* ================= Buscar productos ================= */
  let prodSel = '';

  let prodFiltro = '', prodSoloStock = false;   // «Solo los que tienen algo» viene sin marcar

  /* ================= PRODUCTOS: Inventario · Inventario por productos · Productos totales ================= */
  let prodTab = 'inventario';

  function vistaProductos() {
    const tabs = [['inventario', 'Inventario'], ['ciclico', 'Cíclico'], ['totales', 'Productos totales']]
      .filter(([k]) => k === 'totales' || (k === 'ciclico' ? puedeAlguno(['ciclico', 'ciclico_asignar']) : puede('inventario')));
    if (!tabs.some(t => t[0] === prodTab)) prodTab = tabs[0][0];
    return `<div class="col gap12">
      <div class="tabs">${tabs.map(([k, t]) => `<button class="tab ${prodTab === k ? 'on' : ''}" onclick="prodTab='${k}'; pintarApp()">${t}</button>`).join('')}</div>
      ${prodTab === 'inventario' ? vistaInventario()
        : prodTab === 'ciclico' ? vistaCiclico()
        : vistaProductosTotales()}
    </div>`;
  }

  /* ----- Inventario contra SAP ----- */
  let invData = null;                                      // { sap, carga, conteos } de la sede
  let invRcs = null, invRcsCargando = false, invRcsHora = 0;   // reconteos del inventario en curso, con sus conteos
  let invSede = null;                                      // sede de los datos cargados
  const invF = { zona: '', q: '', soloDif: false, alm: '', pas: '', sede: '', estado: '' };
  const invForm = { ubic: '', prod: '', tipo: 'PICKING' };
  const TIPOS_CONTEO = [['PICKING', 'Picking'], ['CALIDAD', 'Calidad'], ['BLOQUEADO', 'Bloqueado']];
  const nInv = n => (Math.round(Number(n) * 1000) / 1000).toLocaleString('es-CO', { maximumFractionDigits: 3 });

  function vistaInventario() {
    if (invData === null || invSede !== ses.sedeId) {
      if (invSede && invSede !== ses.sedeId) { invDentro = null; invVer = null; invNuevo = null; }
      invData = null; invRcs = null; invSede = ses.sedeId;
      llamar('bdInventarioGeneral', ses.sedeId).then(d => { invData = d; if (vista === 'productos' && prodTab === 'inventario') pintarApp(); })
        .catch(e => { invData = { sap: [], carga: null, conteos: [], error: e.message }; if (vista === 'productos') pintarApp(); });
      return '<div class="cargando">Cargando inventario…</div>';
    }
    const c = invData.carga;
    const zonas = sede.zonas.filter(z => sede.racks.some(r => r.zonaId === z.id));
    // Quien solo cuenta ve su tabla para llenar; el jefe ve el avance y la tabla contra SAP
    const jefe = puede('ciclico_asignar') || puede('inv_sap');
    const tabs = [];
    if (puede('inv_contar')) tabs.push(['ingresar', 'Ingresar'], ['confirmar', 'Consultar']);
    if (jefe || !puede('inv_contar')) tabs.push(['tabla', jefe ? 'Avance y SAP' : 'Tabla contra SAP']);   // el avance va arriba de la tabla
    if (puedeAlguno(['ciclico', 'ciclico_asignar'])) tabs.push(['reconf', 'Reconteos']);
    if (!tabs.some(t => t[0] === invSub)) invSub = tabs[0][0];
    // Primero la lista de inventarios (como en Cíclico). Quien solo cuenta entra de una al que está en curso.
    const ia = invActualCli();
    if (invDentro === null) invDentro = !jefe && ia.estado === 'ABIERTO';
    if (ia.estado !== 'ABIERTO') invDentro = false;
    if (!invDentro) return listaInventariosVista(jefe);
    asegurarRcInv();
    const g = codGen(), SDf = sedesInv(), carg = usarPasCargado();
    asegurarUbicSede(ses.sedeId);
    // Con «Usar el pasillo cargado» encendido, los filtros son los almacenes y pasillos cargados (no los del plano)
    const almOp = carg ? cargadosSede().map(x => ({ key: x.alm, nombre: x.alm, pasillos: x.pasillos })) : Object.values(g.almacenes);
    if (invF.alm && !almOp.some(a => a.key === invF.alm)) { invF.alm = ''; invF.pas = ''; }
    const pasOp = invF.alm ? ((almOp.find(a => a.key === invF.alm) || {}).pasillos || []) : [...new Set(almOp.flatMap(a => a.pasillos))].sort((a, b) => String(a).localeCompare(String(b), 'es', { numeric: true }));
    if (invF.pas && !pasOp.includes(invF.pas)) invF.pas = '';
    return `<div class="col gap12">
      <div class="fila-sb wrap-f gap8">
        <div class="col gap4"><span class="h2 fila gap8 wrap-f">${esc(ia.nombre || 'Inventario')}${puede('inv_nombre') ? `<button class="ec-btn" onclick="renombrarInventario('actual')" title="Cambiar el nombre" aria-label="Cambiar el nombre del inventario">✎</button>` : ''}</span>
          <span class="small">${fCorta(ia.fecha)} · ${esc(nombreRegional() || nombreSede(ses.sedeId))} · <span class="tag amar">En curso</span></span>
          ${jefe ? `<span class="muted small inv-sap-info">${c ? `SAP cargado el ${fechaHora(c.fecha)} por ${esc(c.usuario || '—')} · ${c.filas} productos${c.archivo ? ' · ' + esc(c.archivo) : ''}`
            : '<b class="txt-naranja">Todavía no se ha cargado el Excel de SAP de este inventario.</b>'}</span>` : ''}
          ${invData.error ? `<span class="error small">${esc(invData.error)}</span>` : ''}</div>
      </div>
      ${barraInventarioHtml(jefe)}
      ${tabs.length > 1 ? subTabsHtml(invSub, tabs, 'invSub') : ''}
      ${invSub === 'reconf' ? vistaRcInv() : invSub === 'ingresar' ? cpIngresarHtml() : invSub === 'confirmar' ? cpConfirmarHtml() : `
      ${jefe ? `<div id="cpAvance">${cpAvanceHtml()}</div>` : ''}
      <div class="card col gap12">
        <div class="inv-filtros">
          <div><label class="lbl" for="invAlm">Almacén</label>
            <select id="invAlm" class="campo"><option value="">Todos</option>${almOp.map(a => `<option value="${esc(a.key)}" ${invF.alm === a.key ? 'selected' : ''}>${esc(a.nombre)}</option>`).join('')}</select></div>
          <div><label class="lbl" for="invPas">Pasillo</label>
            <select id="invPas" class="campo"><option value="">Todos</option>${pasOp.map(x => `<option value="${esc(x)}" ${invF.pas === String(x) ? 'selected' : ''}>${esc(pasTxt(x))}</option>`).join('')}</select></div>
          <div><label class="lbl" for="invSede">Sede</label>
            <select id="invSede" class="campo"><option value="">Todas</option>${SDf.map(x => `<option value="${esc(x.id)}" ${invF.sede === x.id ? 'selected' : ''}>${esc(x.nombre)}</option>`).join('')}</select></div>
          <div><label class="lbl" for="invZona">Zona</label>
            <select id="invZona" class="campo"><option value="">Todas las zonas</option>${zonas.map(z =>
              `<option value="${esc(z.id)}" ${invF.zona === z.id ? 'selected' : ''}>${esc(z.nombre)}</option>`).join('')}
              <option value="-" ${invF.zona === '-' ? 'selected' : ''}>Sin ubicar en el plano</option></select></div>
          <div class="inv-buscar"><label class="lbl" for="invQ">Buscar</label>
            <input id="invQ" class="campo" placeholder="Código o nombre" value="${esc(invF.q)}" autocomplete="off"></div>
          <div class="inv-estado"><span class="lbl">Mostrar</span>
            <div class="seg inv-seg" role="group" aria-label="Mostrar">${[['', 'Todos'], ['pend', 'Pendientes'], ['hecho', 'Contados'], ['dif', 'Con diferencia']].map(([k, t]) =>
              `<button class="${invF.estado === k ? 'on' : ''}" onclick="invF.estado='${k}'; pagInicio('inv'); if ($('invTabla')) pintarInvTabla(); this.parentNode.querySelectorAll('button').forEach(x => x.classList.toggle('on', x === this))">${t}</button>`).join('')}</div></div>
        </div>
        <div id="invTabla">${tablaInventario()}</div>
        <span class="muted small">Todo en unidades. <b>Total SAP</b> = Inventario + Calidad + Bloqueado de SAP. <b>Aéreo</b> = lo ubicado en el plano del nivel 2 hacia arriba (sin picking).
          <b>Recont.</b> = el picking de la último reconteo del producto en esa sede. <b>Total planta</b> = Picking + Aéreo + Calidad + Bloqueado; en la sede donde se recontó, el picking es el del reconteo.
          <b>Diferencia</b> = Total planta − Total SAP. Toca un producto para ver su historial.</span>
      </div>`}
    </div>`;
  }

  /* ----- Capturar el aéreo o el picking del inventario en curso (de toda la regional) -----
     Si el inventario se termina otro día y mientras tanto mueven o sacan del aéreo, o llega producto nuevo,
     lo capturado no cambia. Al picking capturado se le suma lo que se cuente después. */
  // Botones de arriba del inventario, por grupos
  function barraInventarioHtml(jefe) {
    const cap = (invData && invData.capturas) || {};
    const capTxt = (t, nom) => cap[t] ? `${nom}: ${fechaHora(cap[t].fecha)} · ${esc(cap[t].por || '—')}` : '';
    const notas = [capTxt('AEREO', 'Aéreo'), capTxt('PICKING', 'Picking')].filter(Boolean);
    return accionesHtml([
      { t: 'Cargar', tono: 'azul', b: [
        puede('inv_sap') && accBtn('Excel de SAP', 'abrirCargaSap()', true),
        puede('prod_almacenes') && accBtn('Almacenes y pasillos', 'abrirCargaUbicSede()'),
        puedeCargarAereo() && accBtn('Aéreo (Excel)', 'abrirCargaAereo()')] },
      { t: 'Capturar', tono: 'violeta', b: puede('inv_sap') ? [
        accBtn(cap.AEREO ? 'Recapturar aéreo' : 'Capturar aéreo', "capturarInv('AEREO')"),
        accBtn(cap.PICKING ? 'Recapturar picking' : 'Capturar picking', "capturarInv('PICKING')"),
        cap.AEREO && accBtn('Aéreo de ahora', "quitarCaptura('AEREO')", false, 'title="Dejar de usar la captura del aéreo"'),
        cap.PICKING && accBtn('Picking de ahora', "quitarCaptura('PICKING')", false, 'title="Dejar de usar la captura del picking"')] : [],
        nota: (notas.length ? notas.join(' · ') + ' ' : 'En vivo. ') + ayudaHtml('Capturar guarda cómo está ahora el aéreo (o el picking contado) de todas las sedes de la regional. Si el inventario sigue otro día y mueven o sacan del aéreo, o llega producto nuevo, lo capturado no cambia. Lo que se cuente de picking después de capturar se suma a lo capturado. «… de ahora» vuelve a usar lo que hay en vivo.') },
      { t: 'Descargar', tono: 'verde', b: [puede('reportes') && jefe && accBtn('Excel', 'descargarInventarioSap()', true)] },
      { t: 'Inventario', tono: 'gris', b: [
        accBtn('Actualizar', 'invData=null; invRcs=null; pintarApp()'),
        accBtn('← Volver a la lista', "invDentro=false; invSub=''; invLista=null; pintarApp(); window.scrollTo(0, 0)")] },
      { t: 'Cerrar', tono: 'rojo', b: [puede('inv_sap') && accBtn('Cerrar inventario', 'cerrarInventario(this)')] }
    ]);
  }
  function capturasHtml() {
    const cap = (invData && invData.capturas) || {};
    const linea = (t, nom) => {
      const c = cap[t];
      return `<div class="cap-fila"><span class="small"><b>${nom}:</b> ${c ? `capturado el ${fechaHora(c.fecha)} por ${esc(c.por || '—')} · ${nInv((c.resumen || {}).total || 0)} und`
          : '<span class="muted">en vivo (lo que hay ahora)</span>'}</span>
        <span class="fila gap8 wrap-f"><button class="btn btn-sec btn-mini" onclick="capturarInv('${t}')">${c ? 'Volver a capturar' : 'Capturar ' + nom.toLowerCase()}</button>
          ${c ? `<button class="btn btn-sec btn-mini" onclick="quitarCaptura('${t}')">Usar el de ahora</button>` : ''}</span></div>`;
    };
    return `<div class="card cap-barra">${linea('AEREO', 'Aéreo')}${linea('PICKING', 'Picking')}
      <span class="muted small">${ayudaHtml('Capturar guarda cómo está ahora el aéreo (o el picking contado) de todas las sedes de la regional. Si el inventario sigue otro día y mueven o sacan del aéreo, o llega producto nuevo, lo capturado no cambia. Lo que se cuente de picking después de capturar se suma a lo capturado.')} Sirve si el inventario sigue otro día.</span></div>`;
  }
  function datosCaptura(tipo) {
    const yo = ses.sedeId, d = {}, almDe = u => { u = String(u || ''); return u.startsWith('PICKING-') ? u.slice(8) : ((pasilloDe(u) || {}).key || ''); };
    let total = 0;
    if (tipo === 'AEREO') {
      const pon = (k, n) => { d[k] = +((d[k] || 0) + n).toFixed(3); total += n; };
      sede.lineas.forEach(l => { const e = sede.espPorId[l.ubicacionId]; if (!e || e.nivel === 0) return; pon(`${yo}|${l.productoId}|${almDe(l.ubicacionId)}`, Number(l.unidades) || 0); });
      (invData.otrasSedes || []).forEach(o => o.aereo.forEach(x => pon(`${o.sedeId}|${x.codigo}|${x.almacen}`, x.cantidad)));
    } else {
      // Picking por lugar, como lo está mostrando el inventario (con la captura anterior, si hay)
      const capP = invData.capturas && invData.capturas.PICKING;
      if (capP) Object.entries(capP.datos).forEach(([k, x]) => { d[k] = { alm: x.alm, c: Number(x.c) || 0 }; });
      const poner = (sid, c, alm) => {
        if (c.tipo !== 'PICKING') return;
        const k = `${sid}|${c.codigo}|${c.ubicacion}`;
        if (capP && !(String(c.fecha) > String(capP.fecha))) return;   // ya estaba en la captura anterior
        d[k] = { alm, c: +Number(c.cantidad).toFixed(3) };
      };
      (invData.conteos || []).forEach(c => poner(yo, c, almDe(c.ubicacion)));
      (invData.otrasSedes || []).forEach(o => o.conteos.forEach(c => poner(o.sedeId, c, c.almacen)));
      Object.values(d).forEach(x => { total += x.c; });
    }
    return { datos: d, resumen: { productos: new Set(Object.keys(d).map(k => k.split('|')[1])).size, total: +total.toFixed(3) } };
  }
  function capturarInv(tipo, ok) {
    const nom = tipo === 'AEREO' ? 'el aéreo' : 'el picking';
    if (ok !== true) return abrirModal(`<div class="fila-sb"><span class="h2">¿Capturar ${nom}?</span>${btnCerrar()}</div>
      <p class="mt12">Se guarda cómo está ${nom} ahora en todas las sedes de ${esc(nombreRegional() || 'la regional')}. Desde ahí el inventario usa lo capturado${tipo === 'AEREO' ? ': si mueven, sacan o llega algo al aéreo, no cambia.' : ', y lo que se cuente de picking después se le suma.'}</p>
      ${(invData.capturas || {})[tipo] ? '<p class="small txt-naranja">Ya había una captura: esta la reemplaza.</p>' : ''}
      <div class="dos mt16"><button class="btn btn-sec btn-xl" onclick="cerrarModal()">Cancelar</button>
        <button class="btn btn-pri btn-xl" onclick="capturarInv('${tipo}', true)">Sí, capturar</button></div>`);
    const { datos, resumen } = datosCaptura(tipo);
    llamar('bdCapturar', { tipo, datos, resumen, usuario: ses.nombre }).then(c => {
      invData.capturas = Object.assign({}, invData.capturas, { [tipo]: c }); diMemo = null;
      cerrarModal(); toast(`${tipo === 'AEREO' ? 'Aéreo' : 'Picking'} capturado: ${resumen.productos} productos`, 'ok'); pintarApp();
    }).catch(e => { cerrarModal(); toast(e.message, 'error'); });
  }
  function quitarCaptura(tipo) {
    llamar('bdQuitarCaptura', { tipo }).then(() => {
      const c = Object.assign({}, invData.capturas); delete c[tipo]; invData.capturas = c; diMemo = null;
      toast(`Listo: ${tipo === 'AEREO' ? 'el aéreo' : 'el picking'} vuelve a ser el de ahora`, 'ok'); pintarApp();
    }).catch(e => toast(e.message, 'error'));
  }

  // Formulario de conteo (lo usan Inventario y Cíclico)
  function formConteoHtml(titulo) {
    return `<div class="card col gap8 inv-form">
        <span class="h3">${titulo}</span>
        <div class="inv-grid">
          <div><label class="lbl" for="invLug">1. ¿Dónde lo encontraron?</label>
            <div class="fila gap8">${campoConCamara(`<input id="invLug" class="campo" autocomplete="off" spellcheck="false" autocapitalize="characters" placeholder="Escanea o escribe el lugar" value="${esc(invForm.ubic)}">`, 'invLug')}
              <button class="btn btn-sec" onclick="invElegirLugar()">Elegir</button></div>
            <span id="invLugInfo" class="small">${invLugarInfo()}</span></div>
          <div><label class="lbl" for="invProd">2. Producto (código Nutresa, Atlantic o nombre)</label>
            ${campoConCamara('<input id="invProd" class="campo" list="dlProductos" autocomplete="off" spellcheck="false" placeholder="Escanea, escribe o elige">', 'invProd')}</div>
        </div>
        <div id="invProdInfo" class="info" hidden></div>
        <span class="lbl">3. Cantidades <span id="invUm" class="muted small">(unidades)</span></span>
        <div class="inv-grid3">
          ${TIPOS_CONTEO.map(([k, t]) => `<div><label class="lbl" for="invC${k}">${t}</label>
            <input id="invC${k}" class="campo inv-cant" type="number" inputmode="decimal" min="0" step="any" value="0" data-tipo="${k}">
            <span id="invU${k}" class="muted small"></span></div>`).join('')}
          <button id="invOk" class="btn btn-ent-solido btn-xl" onclick="guardarConteo()">Guardar conteo</button>
        </div>
        <p id="invErr" class="error" hidden></p>
      </div>`;
  }

  // Une SAP + plano + conteos por producto
  // Se calcula una sola vez mientras no cambien los datos (la pantalla lo pide varias veces y son miles de productos)
  let diMemo = null;
  function datosInventario() {
    const k = [invData, invData && invData.conteos, invData && invData.sap, invData && invData.otrasSedes, sede, sede && sede.lineas, sede && sede.espPorId, ini.productos, ini.productos.length, codGen(), ini.prodReg];
    if (diMemo && diMemo.k.length === k.length && diMemo.k.every((x, i) => x === k[i])) return diMemo.v;
    const v = calcDatosInventario();
    diMemo = { k, v };
    return v;
  }
  function calcDatosInventario() {
    const m = {};
    const fila = cod => m[cod] || (m[cod] = { cod, p: prodDe(cod), sap: null, picking: 0, aereo: 0, calidad: 0, bloqueado: 0, zonas: new Set(), pas: new Set(), ult: null, alm: {}, pk: {}, ae: {} });
    const yo = ses.sedeId, suma = (o, k, n) => { o[k] = (o[k] || 0) + n; };
    // Por almacén (2000, 1500, 1000): un producto puede estar en varios
    const almDe = ubic => { const u = String(ubic || ''); if (u.startsWith('PICKING-')) return u.slice(8); const x = pasilloDe(u); return x ? x.key : ''; };
    const enAlmK = (f, k) => f.alm[k] || (f.alm[k] = { key: k, picking: 0, aereo: 0, calidad: 0, bloqueado: 0, pk: {}, ae: {} });
    const enAlm = (f, ubic) => enAlmK(f, almDe(ubic));
    const pasK = ubic => { const x = pasilloDe(ubic); return x ? x.key + '|' + x.pasillo : ''; };
    const zonaDe = ubic => { const e = sede.espPorId[ubic]; const r = e && sede.rackPorId[e.rackId]; return r ? r.zonaId : ''; };
    ini.productos.forEach(p => { if (p.activo !== false && prodDeMiRegional(p)) fila(p.id); });   // todos los de la regional, aunque no tengan nada
    // Capturas: el aéreo capturado reemplaza al de ahora; al picking capturado se le suma lo que se cuente después
    const capA = invData.capturas && invData.capturas.AEREO, capP = invData.capturas && invData.capturas.PICKING;
    const pkCap = (sid, c) => {   // cuánto suma un conteo de picking cuando hay captura
      if (!capP) return c.cantidad;
      if (!(String(c.fecha) > String(capP.fecha))) return 0;   // ya está en la captura
      const x = capP.datos[`${sid}|${c.codigo}|${c.ubicacion}`];
      return c.cantidad - (x ? Number(x.c) || 0 : 0);
    };
    (invData.sap || []).forEach(x => (fila(x.codigo).sap = x));
    sede.lineas.forEach(l => {
      const e = sede.espPorId[l.ubicacionId];
      if (e && e.nivel === 0) { const k = pasK(l.ubicacionId); if (k) fila(l.productoId).pas.add(k); }
      if (!e || e.nivel === 0) return;                    // el picking se cuenta a mano
      const f = fila(l.productoId), n = Number(l.unidades) || 0, a = enAlm(f, l.ubicacionId);
      if (!capA) { f.aereo += n; a.aereo += n; suma(f.ae, yo, n); suma(a.ae, yo, n); }
      const z = zonaDe(l.ubicacionId); if (z) f.zonas.add(z);
      const k = pasK(l.ubicacionId); if (k) f.pas.add(k);
    });
    (invData.conteos || []).forEach(c => {
      const f = fila(c.codigo), a = enAlm(f, c.ubicacion);
      if (c.tipo === 'PICKING') f.contado = true;
      if (c.tipo === 'CALIDAD') f.hayCal = true;
      if (c.tipo === 'BLOQUEADO') f.hayBlo = true;
      if (c.tipo === 'CALIDAD') { f.calidad += c.cantidad; a.calidad += c.cantidad; }
      else if (c.tipo === 'BLOQUEADO') { f.bloqueado += c.cantidad; a.bloqueado += c.cantidad; }
      else { const n = pkCap(yo, c); f.picking += n; a.picking += n; suma(f.pk, yo, n); suma(a.pk, yo, n); }
      const z = zonaDe(c.ubicacion); if (z) f.zonas.add(z);
      const k = pasK(c.ubicacion); if (k) f.pas.add(k);
      if (!f.ult || c.fecha > f.ult.fecha) f.ult = c;
    });
    // Las demás sedes: su picking y su aéreo van en sus columnas; todo se suma contra el mismo SAP
    (invData.otrasSedes || []).forEach(o => {
      if (!capA) o.aereo.forEach(x => { const f = fila(x.codigo), a = enAlmK(f, x.almacen); f.aereo += x.cantidad; a.aereo += x.cantidad; suma(f.ae, o.sedeId, x.cantidad); suma(a.ae, o.sedeId, x.cantidad); });
      o.conteos.forEach(c => {
        const f = fila(c.codigo), a = enAlmK(f, c.almacen);
        if (c.tipo === 'PICKING') f.contado = true;
        if (c.tipo === 'CALIDAD') f.hayCal = true;
        if (c.tipo === 'BLOQUEADO') f.hayBlo = true;
        if (c.tipo === 'CALIDAD') { f.calidad += c.cantidad; a.calidad += c.cantidad; }
        else if (c.tipo === 'BLOQUEADO') { f.bloqueado += c.cantidad; a.bloqueado += c.cantidad; }
        else { const n = pkCap(o.sedeId, c); f.picking += n; a.picking += n; suma(f.pk, o.sedeId, n); suma(a.pk, o.sedeId, n); }
      });
    });
    // Lo capturado (aéreo: sede|código|almacén → cantidad · picking: sede|código|lugar → { alm, c })
    if (capA) Object.entries(capA.datos).forEach(([k, n]) => {
      const [sid, cod, alm] = k.split('|'), f = fila(cod), a = enAlmK(f, alm); n = Number(n) || 0;
      f.aereo += n; a.aereo += n; suma(f.ae, sid, n); suma(a.ae, sid, n);
    });
    if (capP) Object.entries(capP.datos).forEach(([k, x]) => {
      const p = k.split('|'), f = fila(p[1]), a = enAlmK(f, x.alm || ''), n = Number(x.c) || 0;
      f.picking += n; a.picking += n; suma(f.pk, p[0], n); suma(a.pk, p[0], n); f.contado = true;
    });
    return Object.values(m).map(f => {
      // Calidad y bloqueado = lo del sistema + lo nuevo que reportan. Lo guardado ya trae los dos;
      // si nadie lo ha registrado todavía, se toma lo del sistema (SAP).
      if (f.sap) {
        const pon = (k, v) => { if (!v) return; f[k] += v; const ks = Object.keys(f.alm); const a = ks.length ? f.alm[ks[0]] : (f.alm[''] = { key: '', picking: 0, aereo: 0, calidad: 0, bloqueado: 0, pk: {}, ae: {} }); a[k] += v; };
        if (!f.hayCal) pon('calidad', Number(f.sap.calidad) || 0);
        if (!f.hayBlo) pon('bloqueado', Number(f.sap.bloqueado) || 0);
      }
      // Todo es producto que se tiene: el total suma calidad y bloqueado (en SAP y en planta)
      const sapTotal = f.sap ? f.sap.inventario + f.sap.calidad + f.sap.bloqueado : 0;
      const planta = f.picking + f.aereo + f.calidad + f.bloqueado;
      // Almacenes donde está, el de más cantidad primero (ahí va lo de SAP en el Excel)
      const almacenes = Object.values(f.alm).map(a => Object.assign(a, { planta: a.picking + a.aereo + a.calidad + a.bloqueado }))
        .filter(a => a.planta || Object.keys(f.alm).length === 1).sort((a, b) => b.planta - a.planta || String(a.key).localeCompare(String(b.key)));
      return Object.assign(f, { sapTotal, planta, dif: +(planta - sapTotal).toFixed(3), almacenes });
    });
  }

  /* ----- Reconteos del inventario en curso: por producto, lo de su último reconteo con conteo.
     Se cuenta solo el picking; si no se volvió a contar calidad o bloqueado, queda lo del inventario.
     El aéreo es el del plano (ya trae lo corregido en las estibas). Total y diferencia van con el reconteo. ----- */
  function asegurarRcInv(forzar) {
    if (invRcsCargando || (!forzar && invRcs !== null) || !invData || invData.error) return;
    invRcsCargando = true;
    reconfsInventario().then(l => { invRcs = l; }).catch(() => { invRcs = invRcs || []; })
      .finally(() => { invRcsCargando = false; invRcsHora = Date.now(); if (vista === 'productos' && prodTab === 'inventario' && $('invTabla')) pintarInvTabla(); });
  }
  let rcMemo = null;
  function datosInvRc() {
    const d = datosInventario();
    if (rcMemo && rcMemo.d === d && rcMemo.r === invRcs) return d;
    const rcs = invRcs || [];
    d.forEach(f => {
      // Por cada sede: el picking de la último reconteo que lo contó en esa sede
      const rcPk = {};
      for (let i = rcs.length - 1; i >= 0; i--) {
        const r = rcs[i];
        if (!(r.ciclico.codigos || []).includes(f.cod)) continue;
        const porSede = {};
        (r.conteos || []).forEach(c => { if (c.codigo === f.cod && c.tipo === 'PICKING') { const sd = c.sedeId || r.ciclico.sedeId || ses.sedeId; porSede[sd] = (porSede[sd] || 0) + c.cantidad; } });
        Object.entries(porSede).forEach(([sd, n]) => { if (rcPk[sd] === undefined) rcPk[sd] = +n.toFixed(3); });
      }
      f.rcPk = rcPk;
      const hay = Object.keys(rcPk).length > 0;
      // Picking con el reconteo: en cada sede recontada se usa lo del reconteo; en las demás, lo contado
      const pk = hay ? +(f.picking + Object.entries(rcPk).reduce((t, [sd, n]) => t + n - (f.pk[sd] || 0), 0)).toFixed(3) : f.picking;
      f.rc = hay ? { pk } : null;
      f.plantaRc = hay ? +(pk + f.aereo + f.calidad + f.bloqueado).toFixed(3) : f.planta;
      f.difRc = +(f.plantaRc - f.sapTotal).toFixed(3);
    });
    rcMemo = { d, r: invRcs };
    return d;
  }
  // Vuelve a pintar la tabla sin que se corra (se queda donde la estaban mirando)
  function pintarInvTabla() {
    const c = $('invTabla');
    if (!c) return;
    const w = c.querySelector('.tabla-wrap'), x = w ? w.scrollLeft : 0, y = w ? w.scrollTop : 0;
    c.innerHTML = tablaInventario();
    const w2 = c.querySelector('.tabla-wrap');
    if (w2) { w2.scrollLeft = x; w2.scrollTop = y; }
  }

  function filtrarInventario(l) {
    const pal = sinTilde(invF.q.trim()).split(/\s+/).filter(Boolean);
    return l.filter(f => {
      if (invF.zona === '-' && f.zonas.size) return false;
      if (invF.zona && invF.zona !== '-' && !f.zonas.has(invF.zona)) return false;
      if (usarPasCargado()) {   // lo cargado para esta sede
        const cg = (invF.alm || invF.pas) ? cargadoDe(f.cod) : [];
        if (invF.alm && !cg.some(y => y.almacen === invF.alm)) return false;
        if (invF.pas && !cg.some(y => y.pasillo === String(invF.pas) && (!invF.alm || y.almacen === invF.alm))) return false;
      } else {
        if (invF.alm && ![...f.pas].some(k => k.split('|')[0] === invF.alm) && !f.almacenes.some(a => a.key === invF.alm && a.planta)) return false;
        if (invF.pas && ![...f.pas].some(k => { const [a, x] = k.split('|'); return x === String(invF.pas) && (!invF.alm || a === invF.alm); })) return false;
      }
      if (invF.sede && !((f.pk[invF.sede] || 0) + (f.ae[invF.sede] || 0) > 0)) return false;   // solo los que tienen cantidad en esa sede
      const dif = f.difRc !== undefined ? f.difRc : f.dif;
      if ((invF.soloDif || invF.estado === 'dif') && !dif) return false;
      if (invF.estado === 'pend' && f.contado) return false;   // pendiente = de toda la lista, nadie lo ha contado
      if (invF.estado === 'hecho' && !f.contado) return false;
      if (!pal.length) return true;
      const t = sinTilde(`${f.cod} ${f.p ? f.p.codigoNutresa + ' ' + f.p.nombre : ''}`);
      return pal.every(w => t.includes(w));
    }).sort((a, b) => {
      // Primero los que tienen algo (SAP o planta), después el resto del catálogo
      const da = a.sap || a.planta || a.calidad ? 0 : 1, db = b.sap || b.planta || b.calidad ? 0 : 1;
      return da - db || (a.p ? a.p.nombre : a.cod).localeCompare(b.p ? b.p.nombre : b.cod);
    });
  }

  function tablaInventario() {
    const todos = datosInvRc(), l = aplicarOrden('inv', filtrarInventario(todos), valInv);
    if (!todos.length) return '<p class="muted">Todavía no hay datos: carga el Excel de SAP o registra un conteo.</p>';
    const con = todos.filter(f => f.difRc).length;
    const rcTd = v => `<td class="num g-rc">${v === null || v === undefined ? '—' : nInv(v)}</td>`;
    const pkRc = (o, rc, cls = '') => SD.map(x => `<td class="num ${cls}">${nInv(o[x.id] || 0)}</td>` + (rc ? rcTd(rc[x.id]) : '<td class="g-rc"></td>')).join('');
    const difCls = d => !d ? 'dif-ok' : d < 0 ? 'dif-falta' : 'dif-sobra';
    const pg = paginar('inv', l, () => { if ($('invTabla')) pintarInvTabla(); });
    const SD = sedesInv();
    const porSede = (o, cls) => SD.map(x => `<td class="num ${cls || ''}">${nInv(o[x.id] || 0)}</td>`).join('');
    const filas = pg.filas.map(f => {
      const varios = f.almacenes.length > 1, abierto = varios && invAlmAbiertos.has(f.cod);
      const almTxt = f.almacenes.map(a => almCorto(a.key)).filter(Boolean).join(' · ');
      return `<tr onclick="historialInventario('${esc(f.cod)}')" class="${abierto ? 'inv-abierto' : ''}">
        <td>${esc(f.p ? f.p.codigoNutresa || '—' : '—')}</td>
        <td>${esc(f.cod)}</td>
        <td class="inv-prod">${esc(f.p ? f.p.nombre : 'Producto no está en el catálogo')}
          ${varios ? `<button class="inv-alm-btn" onclick="event.stopPropagation(); invVerAlm('${esc(f.cod)}')" aria-expanded="${abierto}" title="Está en ${f.almacenes.length} almacenes">${abierto ? '▾' : '▸'} ${f.almacenes.length} almacenes</button>`
            : almTxt ? `<span class="inv-alm-txt">Alm. ${esc(almTxt)}</span>` : ''}</td>
        <td>${esc(f.p ? f.p.unidadMedida || 'UN' : '')}</td>
        <td class="num g-sap">${f.sap ? nInv(f.sap.inventario) : '—'}</td>
        <td class="num g-sap">${f.sap ? nInv(f.sap.calidad) : '—'}</td>
        <td class="num g-sap">${f.sap ? nInv(f.sap.bloqueado) : '—'}</td>
        <td class="num g-sap fuerte">${f.sap ? nInv(f.sapTotal) : '—'}</td>
        ${pkRc(f.pk, f.rcPk)}
        ${porSede(f.ae, 'g-ae')}
        <td class="num">${nInv(f.calidad)}</td>
        <td class="num">${nInv(f.bloqueado)}</td>
        <td class="num fuerte">${nInv(f.plantaRc)}</td>
        <td class="num"><span class="dif ${difCls(f.difRc)}">${f.difRc > 0 ? '+' : ''}${nInv(f.difRc)}</span></td>
        <td class="ec-td">${f.ult ? `<span class="fila gap4">${btnDetalleConteo(f)}${puedeAlguno(['inv_contar', 'inv_sap']) ? btnEditarConteo(f) : ''}</span>` : ''}</td>
      </tr>${abierto ? f.almacenes.map(a => `<tr class="inv-sub"><td></td><td></td><td class="inv-prod small">↳ Almacén <b>${esc(almCorto(a.key) || '—')}</b></td><td></td>
        <td class="g-sap" colspan="4"></td>
        ${pkRc(a.pk, null)}${porSede(a.ae, 'g-ae')}<td class="num">${nInv(a.calidad)}</td><td class="num">${nInv(a.bloqueado)}</td>
        <td class="num">${nInv(a.planta)}</td><td></td><td></td></tr>`).join('') : ''}`;
    }).join('');
    return `<div class="muted small">${l.length} de ${todos.length} productos · <b class="${con ? 'txt-rojo' : ''}">${con}</b> con diferencia</div>
      <div class="tabla-wrap mt8"><table class="tabla inv-tabla">
        <thead>
          <tr class="inv-grupos"><th colspan="4"></th><th colspan="4" class="g-sap">SAP</th><th colspan="${SD.length * 3 + 3}">Planta (conteo + plano + reconteo) · todas las sedes</th><th></th><th></th></tr>
          <tr>${thO('inv', 'nutresa', 'Cód. Nutresa')}${thO('inv', 'cod', 'Cód. Atlantic')}${thO('inv', 'prod', 'Producto')}${thO('inv', 'und', 'Unidad')}
            ${thO('inv', 'sapInv', 'Inventario', 'num g-sap')}${thO('inv', 'sapCal', 'Calidad', 'num g-sap')}${thO('inv', 'sapBlq', 'Bloqueado', 'num g-sap')}${thO('inv', 'sapTot', 'Total', 'num g-sap')}
            ${SD.map(x => thO('inv', 'pk:' + x.id, `Picking<br><span class="inv-sede">${esc(x.nombre)}</span>`, 'num') + thO('inv', 'rc:' + x.id, `Recont.<br><span class="inv-sede">${esc(x.nombre)}</span>`, 'num g-rc')).join('')}
            ${SD.map(x => thO('inv', 'ae:' + x.id, `Aéreo<br><span class="inv-sede">${esc(x.nombre)}</span>`, 'num g-ae')).join('')}
            ${thO('inv', 'cal', 'Calidad', 'num')}${thO('inv', 'blq', 'Bloqueado', 'num')}${thO('inv', 'planta', 'Total', 'num')}
            ${thO('inv', 'dif', 'Diferencia', 'num')}<th><span class="sr">Corregir</span></th></tr>
        </thead>
        <tbody>${filas || `<tr><td colspan="${SD.length * 3 + 13}" class="muted">No hay productos con ese filtro.</td></tr>`}</tbody></table></div>${pg.barra}`;
  }
  /* ----- Ordenar las tablas tocando el título de la columna (como en Excel): ▲ menor a mayor, ▼ mayor a menor, otra vez = como estaba ----- */
  const ordT = { inv: { k: '', dir: 1 }, cic: { k: '', dir: 1 } };
  function ordenarTabla(t, k) {
    const o = ordT[t];
    if (o.k !== k) { o.k = k; o.dir = 1; } else if (o.dir === 1) o.dir = -1; else o.k = '';
    pagInicio(t);
    if (t === 'inv') { if ($('invTabla')) pintarInvTabla(); } else if (t === 'prod') { if ($('prodLista')) $('prodLista').innerHTML = listaProdHtml(); } else pintarCicTabla();
  }
  function aplicarOrden(t, l, val) {
    const o = ordT[t], v = o.k && val(o.k);
    if (!v) return l;
    const vacio = x => x === null || x === undefined || x === '';
    return l.slice().sort((a, b) => {
      const x = v(a), y = v(b);
      if (vacio(x) || vacio(y)) return vacio(x) - vacio(y);   // los vacíos siempre al final
      return (typeof x === 'number' && typeof y === 'number' ? x - y : String(x).localeCompare(String(y), 'es', { numeric: true, sensitivity: 'base' })) * o.dir;
    });
  }
  const thO = (t, k, txt, cls) => {
    const o = ordT[t], on = o.k === k;
    return `<th class="${cls || ''} th-ord${on ? ' on' : ''}" onclick="ordenarTabla('${t}', '${esc(k)}')" aria-sort="${on ? (o.dir > 0 ? 'ascending' : 'descending') : 'none'}" title="Ordenar por esta columna">${txt}<span class="ord-i" aria-hidden="true">${on ? (o.dir > 0 ? '▲' : '▼') : '↕'}</span></th>`;
  };
  const valInv = k => {
    if (k.startsWith('pk:')) { const sd = k.slice(3); return f => f.pk[sd] || 0; }
    if (k.startsWith('ae:')) { const sd = k.slice(3); return f => f.ae[sd] || 0; }
    if (k.startsWith('rc:')) { const sd = k.slice(3); return f => f.rcPk && f.rcPk[sd] !== undefined ? f.rcPk[sd] : null; }
    return { nutresa: f => f.p ? f.p.codigoNutresa : '', cod: f => f.cod, prod: f => f.p ? f.p.nombre : '', und: f => f.p ? f.p.unidadMedida : '',
      sapInv: f => f.sap ? f.sap.inventario : null, sapCal: f => f.sap ? f.sap.calidad : null, sapBlq: f => f.sap ? f.sap.bloqueado : null, sapTot: f => f.sap ? f.sapTotal : null,
      cal: f => f.calidad, blq: f => f.bloqueado, planta: f => f.plantaRc !== undefined ? f.plantaRc : f.planta, dif: f => f.difRc !== undefined ? f.difRc : f.dif,
    }[k];
  };
  const valCic = k => ({ estado: f => f.listo ? 1 : 0, nutresa: f => f.p ? f.p.codigoNutresa : '', cod: f => f.cod, prod: f => f.p ? f.p.nombre : '', und: f => f.p ? f.p.unidadMedida : '',
    sapInv: f => f.sap ? f.sap.inventario : null, sapCal: f => f.sap ? f.sap.calidad : null, sapBlq: f => f.sap ? f.sap.bloqueado : null, sapTot: f => f.sap ? f.sapTotal : null,
    pk: f => f.contado ? f.picking : null, ae: f => f.aereo, cal: f => f.contado ? f.calidad : null, blq: f => f.contado ? f.bloqueado : null,
    planta: f => f.contado ? f.planta : null, dif: f => f.contado ? f.dif : null, antes: f => f.antes, difAntes: f => f.contado && f.antes != null ? f.difAntes : null,
    rcTot: f => f.rc && f.rc.hecho ? f.rc.total : null, rcSap: f => f.rc && f.rc.hecho ? f.rc.difSap : null, rcCont: f => f.rc && f.rc.hecho ? f.rc.difConteo : null,
    rcQuien: f => f.rc && f.rc.hecho ? f.rc.ult.usuario : null, conto: f => f.ult ? f.ult.usuario : null }[k]);

  // Sedes que se suman en el inventario: la abierta primero y después las demás
  const sedesInv = () => [{ id: ses.sedeId, nombre: nombreSede(ses.sedeId) }].concat(((invData && invData.otrasSedes) || []).map(o => ({ id: o.sedeId, nombre: o.nombre })));
  // Almacenes de un producto: se abren y se cierran (para no llenar la tabla)
  const invAlmAbiertos = new Set();
  function invVerAlm(cod) { if (invAlmAbiertos.has(cod)) invAlmAbiertos.delete(cod); else invAlmAbiertos.add(cod); if ($('invTabla')) pintarInvTabla(); }
  const almCorto = key => { if (!key) return ''; const a = codGen().almacenes[key]; return a ? (a.alm || a.nombre) : String(key).replace(/^Z:/, ''); };

  function enlazarInventario() {
    if ($('cpTabla')) cpEnlazar();
    if ($('rcTabla')) rcEnlazar();
    enlazarIngresar(); enlazarConfirmar();
    if ($('cicQ')) $('cicQ').addEventListener('input', () => { cicF.q = $('cicQ').value; pagInicio('cic'); pintarCicTabla(); });
    if ($('cnProd')) {
      $('cnProd').addEventListener('keydown', ev => { if (ev.key === 'Enter') { ev.preventDefault(); cnAgregar(); } });
      // Pegar una columna de Excel: el campo de una línea borraría los saltos, así que se separan aquí
      $('cnProd').addEventListener('paste', ev => {
        const t = (ev.clipboardData || window.clipboardData).getData('text') || '';
        if (!/[\r\n\t]/.test(t.trim())) return;
        ev.preventDefault();
        $('cnProd').value = t.trim().split(/[\r\n\t]+/).map(x => x.trim()).filter(Boolean).join(', ');
        cnAgregar();
      });
    }
    if ($('invTabla')) {
      const repintar = () => { pagInicio('inv'); pintarInvTabla(); };
      $('invZona').addEventListener('change', () => { invF.zona = $('invZona').value; repintar(); });
      if ($('invAlm')) $('invAlm').addEventListener('change', () => { invF.alm = $('invAlm').value; invF.pas = ''; pagInicio('inv'); pintarApp(); });
      if ($('invPas')) $('invPas').addEventListener('change', () => { invF.pas = $('invPas').value; repintar(); });
      if ($('invSede')) $('invSede').addEventListener('change', () => { invF.sede = $('invSede').value; repintar(); });
      $('invQ').addEventListener('input', () => { invF.q = $('invQ').value; repintar(); });
      if ($('invDif')) $('invDif').addEventListener('change', () => { invF.soloDif = $('invDif').checked; repintar(); });
    }
    const lg = $('invLug'), pr = $('invProd');
    if (lg) {
      lg.addEventListener('keydown', ev => { if (ev.key === 'Enter') { ev.preventDefault(); invLugarTexto(lg.value); } });
      lg.addEventListener('change', () => invLugarTexto(lg.value, true));
    }
    if (pr) {
      pr.addEventListener('input', () => invProdTexto(pr.value));
      pr.addEventListener('keydown', ev => { if (ev.key === 'Enter') { ev.preventDefault(); invProdTexto(pr.value, true); } });
      document.querySelectorAll('.inv-cant').forEach((c, i, todos) => {
        c.addEventListener('focus', () => c.select());
        c.addEventListener('keydown', ev => {
          if (ev.key !== 'Enter') return;
          ev.preventDefault();
          if (todos[i + 1]) todos[i + 1].focus(); else guardarConteo();
        });
      });
      if (invForm.prod) { pr.value = invForm.prod; invProdTexto(invForm.prod); }
    }
  }

  function invLugarInfo() {
    const e = sede.espPorId[invForm.ubic];
    if (!e) return invForm.ubic ? '<span class="txt-rojo">Ese lugar no existe en esta sede</span>' : '<span class="muted">Primero el lugar, después el producto.</span>';
    const r = sede.rackPorId[e.rackId], z = r && sede.zonaPorId[r.zonaId];
    return `<span class="txt-verde">✓ ${tieneCu(e.id) ? `<b class="mono-c">${esc(cu(e.id))}</b> · ` : ''}${esc(etiqueta(e))} · ${esc(r ? r.nombre : '')} · Posición ${e.posicion}${z ? ' · ' + esc(z.nombre) : ''}</span>`;
  }

  // Lugar escaneado o escrito (con o sin guiones). Debe ser un espacio exacto (con nivel y lado).
  function invLugarTexto(txt, silencio) {
    const c = sinGuion(txt);
    if (!c) { invForm.ubic = ''; $('invLugInfo').innerHTML = invLugarInfo(); return; }
    const e = espDeTexto(txt);
    if (!e) {
      invForm.ubic = '';
      $('invLugInfo').innerHTML = `<span class="txt-rojo">No es un espacio exacto de esta sede. Escanea el espacio (con nivel y lado) o toca Elegir.</span>`;
      if (!silencio) toast('Ese lugar no existe o le falta el nivel y el lado', 'error');
      return;
    }
    invSetLugar(e.id);
  }

  function invSetLugar(id) {
    invForm.ubic = id;
    if ($('invLug')) $('invLug').value = cu(id);
    if ($('invLugInfo')) $('invLugInfo').innerHTML = invLugarInfo();
    invProdInfo();
    const pr = $('invProd');
    if (pr && !pr.value) pr.focus({ preventScroll: true });
  }

  function invElegirLugar() {
    const e = sede.espPorId[invForm.ubic];
    lugar = e ? { zona: (sede.rackPorId[e.rackId] || {}).zonaId || '', rack: e.rackId, pos: e.posicion, nivel: e.nivel, lado: e.lado }
      : { zona: '', rack: '', pos: 0, nivel: null, lado: '' };
    lugarCtx = { contenedor: 'invLugarCaja', permitirLlenos: true, alElegir: id => { lugarCtx = null; cerrarModal(); pitido(); invSetLugar(id); } };
    abrirModal(`<div class="fila-sb"><span class="h2">¿Dónde lo encontraron?</span>${btnCerrar()}</div><div id="invLugarCaja"></div>`);
    pintarLugar();
  }

  function invProdTexto(txt, enter) {
    const p = buscarProducto(txt);
    invForm.prod = p ? p.id : '';
    invProdInfo();
    if (p && enter) { if ($('invProd')) $('invProd').value = p.id + ' · ' + p.nombre; $('invCPICKING').focus(); }
    else if (enter && txt.trim()) toast('No hay un producto con ese código o nombre', 'error');
  }

  function invProdInfo() {
    const caja = $('invProdInfo');
    if (!caja) return;
    const p = prodDe(invForm.prod);
    if (!p) { caja.hidden = true; if ($('invUm')) $('invUm').textContent = '(unidades)'; return; }
    const f = (ctxCic() && cicData ? datosCiclico() : datosInventario()).find(x => x.cod === p.id) || { picking: 0, aereo: 0, calidad: 0, bloqueado: 0, sap: null, sapTotal: 0, planta: 0, dif: 0 };
    TIPOS_CONTEO.forEach(([k]) => {
      const c = ((ctxCic() && cicData ? cicData.conteos : invData.conteos) || []).find(x => x.codigo === p.id && x.ubicacion === invForm.ubic && x.tipo === k);
      const u = $('invU' + k);
      if (u) u.textContent = c ? `Último aquí: ${nInv(c.cantidad)} (${c.usuario || '—'})` : '';
    });
    $('invUm').textContent = `(${(p.unidadMedida || 'UN').toUpperCase() === 'KG' ? 'kg' : 'unidades'})`;
    caja.hidden = false;
    if (ctxCic() && cicData && !cicVeSap(cicSel_())) {   // conteo a ciegas: sin SAP ni diferencia
      caja.innerHTML = `<span class="fuerte">${esc(p.nombre)}</span>
        <span class="muted small">Nutresa ${esc(p.codigoNutresa || '—')} · Atlantic ${esc(p.id)} · Unidad ${esc(p.unidadMedida || 'UN')}</span>`;
      return;
    }
    caja.innerHTML = `<span class="fuerte">${esc(p.nombre)}</span>
      <span class="muted small">Nutresa ${esc(p.codigoNutresa || '—')} · Atlantic ${esc(p.id)} · Unidad ${esc(p.unidadMedida || 'UN')}</span>
      <span class="small">SAP total <b>${f.sap ? nInv(f.sapTotal) : '—'}</b> · Picking <b>${nInv(f.picking)}</b> · Aéreo <b>${nInv(f.aereo)}</b> · Calidad <b>${nInv(f.calidad)}</b> · Bloqueado <b>${nInv(f.bloqueado)}</b> · Diferencia <b>${nInv(f.dif)}</b></span>`;
  }

  function guardarConteo() {
    const err = m => { const e = $('invErr'); e.textContent = m; e.hidden = false; };
    $('invErr').hidden = true;
    if (!sede.espPorId[invForm.ubic]) return err('Primero escanea o elige dónde lo encontraron.');
    const p = prodDe(invForm.prod) || buscarProducto($('invProd').value);
    if (!p) return err('Elige el producto.');
    const enCic = ctxCic() && cicData ? cicData.ciclico : null;
    if (enCic && !enCic.codigos.includes(p.id)) return err('Ese producto no está en este cíclico.');
    const cantidades = {};
    for (const [k, t] of TIPOS_CONTEO) {
      const v = $('invC' + k).value.trim().replace(',', '.');
      const n = Number(v);
      if (v === '' || !(n >= 0)) { $('invC' + k).focus(); return err(`Llena ${t.toLowerCase()} (0 si no hay).`); }
      cantidades[k] = n;
    }
    const b = $('invOk'); b.disabled = true; b.textContent = 'Guardando…';
    llamar('bdGuardarConteo', { sedeId: ses.sedeId, ubicacionId: invForm.ubic, codigo: p.id, cantidades, usuario: ses.nombre, ciclicoId: enCic ? enCic.id : null })
      .then(lista => {
        // Reemplaza el último de ese producto + lugar en cada tipo
        // Inventario y cíclicos van aparte: un conteo de cíclico no cambia la tabla de Inventario
        if (!enCic) lista.forEach(c => { invData.conteos = (invData.conteos || []).filter(x => !(x.codigo === c.codigo && x.ubicacion === c.ubicacion && x.tipo === c.tipo)).concat([c]); });
        if (enCic && cicData && cicData.ciclico.id === enCic.id) {
          lista.forEach(c => { cicData.conteos = cicData.conteos.filter(x => !(x.codigo === c.codigo && x.ubicacion === c.ubicacion && x.tipo === c.tipo)).concat([c]); });
          const ec = (cicLista || []).find(x => x.id === enCic.id);
          if (ec) ec.contados = datosCiclico().filter(f => f.listo).length;
          if ($('cicLista')) $('cicLista').innerHTML = listaCiclicos();
        }
        pitido();
        toast(`${p.nombre} en ${etiqueta(sede.espPorId[invForm.ubic])}: picking ${nInv(cantidades.PICKING)} · calidad ${nInv(cantidades.CALIDAD)} · bloqueado ${nInv(cantidades.BLOQUEADO)}`, 'ok');
        invForm.prod = '';
        $('invProd').value = '';
        TIPOS_CONTEO.forEach(([k]) => { $('invC' + k).value = '0'; $('invU' + k).textContent = ''; });
        $('invProdInfo').hidden = true;
        if ($('invTabla')) pintarInvTabla();
        if ($('cicTabla')) { $('cicTabla').innerHTML = tablaCiclico(); botonPedirRc(); const cc = document.querySelector('.cic-progreso b'); if (cc) { const d = datosCiclico(); cc.textContent = `${d.filter(f => f.listo).length} de ${d.length}`; } }
        b.disabled = false; b.textContent = 'Guardar conteo';
        $('invProd').focus();
      })
      .catch(e => { err(e.message); b.disabled = false; b.textContent = 'Guardar conteo'; });
  }

  // Historial de un producto: conteos (quién, cuándo, dónde) y dónde está en el plano
  function historialInventario(cod) {
    const p = prodDe(cod);
    const f = datosInventario().find(x => x.cod === cod);
    abrirModal(`<div class="fila-sb"><span class="h2">${esc(p ? p.nombre : cod)}</span>${btnCerrar()}</div>
      <span class="muted small">Nutresa ${esc(p ? p.codigoNutresa || '—' : '—')} · Atlantic ${esc(cod)}</span>
      ${f ? `<div class="inv-res mt12">
        <div><span class="muted small">Total SAP</span><b>${f.sap ? nInv(f.sapTotal) : '—'}</b></div>
        <div><span class="muted small">Total planta</span><b>${nInv(f.planta)}</b></div>
        <div><span class="muted small">Diferencia</span><b class="${f.dif ? 'txt-rojo' : 'txt-verde'}">${f.dif > 0 ? '+' : ''}${nInv(f.dif)}</b></div></div>` : ''}
      <span class="h3 mt12">En el plano (aéreo)</span>
      ${(() => {
        const ls = sede.lineas.filter(l => l.productoId === cod && sede.espPorId[l.ubicacionId] && sede.espPorId[l.ubicacionId].nivel !== 0);
        return ls.length ? `<div class="lista-senal mt8">${ls.map(l => `<div><b>${esc(cu(l.ubicacionId))}</b><span class="muted small">${nInv(l.unidades)} · lote ${esc(l.lote || '—')} · vence ${fCorta(l.vencimiento)}</span></div>`).join('')}</div>`
          : '<p class="muted small mt8">No hay estibas ubicadas en el plano.</p>';
      })()}
      <span class="h3 mt12">Revisiones y correcciones del aéreo</span>
      <div id="histVal" class="mt8"><div class="cargando">Cargando…</div></div>
      <span class="h3 mt12">Conteos</span>
      <div id="histInv" class="mt8"><div class="cargando">Cargando historial…</div></div>`);
    pagInicio('histInv');
    llamar('bdValidaciones', cod).then(v => {
      if (!$('histVal')) return;
      const tx = { OK: '✓ Está bien', CORREGIDO: 'Corregido', NO_ESTA: 'No estaba' };
      $('histVal').innerHTML = v.length ? `<div class="tabla-wrap"><table class="tabla"><thead><tr><th>Fecha</th><th>Lugar</th><th>Rótulo</th><th>Qué pasó</th><th class="num">Antes</th><th class="num">Después</th><th>Motivo</th><th>Quién</th></tr></thead>
        <tbody>${v.slice(0, 15).map(x => `<tr><td class="nowrap">${fechaHora(x.fecha)}</td><td>${esc(cu(x.ubicacion))}</td><td>${esc(x.lote || '—')}</td><td>${tx[x.accion] || x.accion}</td>
          <td class="num">${nInv(x.antes)}</td><td class="num">${nInv(x.despues)}${x.vencDespues !== x.vencAntes ? `<span class="muted small"> · vence ${fCorta(x.vencDespues)}</span>` : ''}</td><td>${esc(x.motivo || '')}</td><td>${esc(x.usuario || '—')}</td></tr>`).join('')}</tbody></table></div>`
        : '<p class="muted small">No ha tenido reconteos del aéreo.</p>';
    }).catch(() => { if ($('histVal')) $('histVal').innerHTML = ''; });
    llamar('bdHistorialConteos', { sedeId: ses.sedeId, codigo: cod }).then(function pintar(h) {
      if (!$('histInv')) return;
      const pg = paginar('histInv', h, () => pintar(h));
      $('histInv').innerHTML = h.length ? `<div class="tabla-wrap"><table class="tabla"><thead><tr><th>Fecha</th><th>Lugar</th><th>Tipo</th><th class="num">Cantidad</th><th>Quién</th></tr></thead>
        <tbody>${pg.filas.map(c => `<tr class="${c.anulado ? 'ec-anulado' : ''}"><td class="nowrap">${fechaHora(c.fecha)}</td><td>${esc(cu(c.ubicacion))}</td><td>${TIPOS_CONTEO.find(t => t[0] === c.tipo)[1]}${tagAnulado(c)}</td>
          <td class="num">${nInv(c.cantidad)}</td><td>${esc(c.usuario || '—')}</td></tr>`).join('')}</tbody></table></div>${pg.barra}`
        : '<p class="muted small">Todavía no hay conteos de este producto.</p>';
    }).catch(e => { if ($('histInv')) $('histInv').innerHTML = `<p class="error">${esc(e.message)}</p>`; });
  }

  // Excel del inventario con la plantilla de Control Interno (FORMATO INVENTARIO CONTROL INTERNO), columnas A a la Z.
  // Un producto contado en varios almacenes sale en una fila por almacén (lo de SAP va en el almacén con más cantidad).
  const JSZIP_URL = 'https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js';
  function cargarScript(url) {
    return new Promise((ok, mal) => {
      const ya = document.querySelector(`script[src="${url}"]`);
      if (ya && ya.dataset.listo) return ok();
      const sc = ya || document.createElement('script');
      sc.addEventListener('load', () => { sc.dataset.listo = '1'; ok(); });
      sc.addEventListener('error', () => mal(new Error('No se pudo preparar el Excel con la plantilla (revisa la señal).')));
      if (!ya) { sc.src = url; document.head.appendChild(sc); }
    });
  }
  function filasPlantillaInv(l) {
    const filas = [];
    l.forEach(f => {
      const alms = f.almacenes.length ? f.almacenes : [{ key: '', picking: f.picking, aereo: f.aereo, calidad: f.calidad, bloqueado: f.bloqueado, pk: f.pk, ae: f.ae }];
      alms.forEach((a, i) => {
        const sap = i === 0 && f.sap ? f.sap : null, alm = almCorto(a.key);
        filas.push({ nutresa: f.p ? f.p.codigoNutresa || '' : '', cod: f.cod, nombre: f.p ? f.p.nombre : '', alm, umb: f.p ? f.p.unidadMedida || 'UN' : '',
          libre: sap ? sap.inventario : 0, calidadSap: sap ? sap.calidad : 0, bloqueoSap: sap ? sap.bloqueado : 0,
          picking: a.picking, aereo: a.aereo, calidad: a.calidad, bloqueado: a.bloqueado, pk: a.pk || {}, ae: a.ae || {} });
      });
    });
    return filas;
  }
  // Excel del inventario (lo que está filtrado en la tabla): una fila por producto, con el reconteo
  /* ----- Libro de Excel con varias hojas y estilos (para el Control Interno) -----
     hojas: [{ nombre, celdas: [[{ v, s } | null]], anchos, fijar (filas fijas arriba), filtro ('A8:AD900'), unir: ['A1:D3'], altos: { fila: alto } }]
     Estilos: 1 título oscuro · 2 título verde · 3 título naranja · 4 título gris · 5 texto · 6 número · 7 número rojo · 8 número verde
       9 título grande · 10 etiqueta negrita · 11 plata · 12 plata roja · 13 plata verde · 14 porcentaje · 15 texto verde claro · 16 texto rojo claro
       17 texto negrita gris · 18 plata negrita · 19 número negrita */
  async function xlsxLibro(hojas) {
    if (!window.JSZip) await cargarScript(JSZIP_URL);
    const xe = t => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    const letra = i => { let s = ''; i++; while (i) { const m = (i - 1) % 26; s = String.fromCharCode(65 + m) + s; i = Math.floor((i - 1) / 26); } return s; };
    const hojaXml = h => {
      const nCol = Math.max(1, ...h.celdas.map(f => f.length));
      const filas = h.celdas.map((f, r) => `<row r="${r + 1}"${h.altos && h.altos[r] ? ` ht="${h.altos[r]}" customHeight="1"` : ''}>${f.map((c, i) => {
        if (!c) return '';
        const ref = letra(i) + (r + 1), st = c.s ? ` s="${c.s}"` : '';
        if (c.v === '' || c.v === null || c.v === undefined) return `<c r="${ref}"${st}/>`;
        if (typeof c.v === 'number' && isFinite(c.v)) return `<c r="${ref}"${st}><v>${c.v}</v></c>`;
        return `<c r="${ref}"${st} t="inlineStr"><is><t xml:space="preserve">${xe(c.v)}</t></is></c>`;
      }).join('')}</row>`).join('');
      const fin = `${letra(nCol - 1)}${h.celdas.length}`;
      return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
<sheetPr><pageSetUpPr fitToPage="1"/></sheetPr><dimension ref="A1:${fin}"/><sheetViews><sheetView workbookViewId="0">${h.fijar ? `<pane ySplit="${h.fijar}" topLeftCell="A${h.fijar + 1}" activePane="bottomLeft" state="frozen"/>` : ''}</sheetView></sheetViews>
<sheetFormatPr defaultRowHeight="15"/><cols>${(h.anchos || []).map((w, i) => `<col min="${i + 1}" max="${i + 1}" width="${w}" customWidth="1"/>`).join('')}</cols>
<sheetData>${filas}</sheetData>${h.filtro ? `<autoFilter ref="${h.filtro}"/>` : ''}${h.unir && h.unir.length ? `<mergeCells count="${h.unir.length}">${h.unir.map(u => `<mergeCell ref="${u}"/>`).join('')}</mergeCells>` : ''}
<pageMargins left="0.3" right="0.3" top="0.4" bottom="0.4" header="0.2" footer="0.2"/><pageSetup orientation="landscape" fitToWidth="1" fitToHeight="0"/></worksheet>`;
    };
    const borde = '<border><left style="thin"><color rgb="FFBFBFBF"/></left><right style="thin"><color rgb="FFBFBFBF"/></right><top style="thin"><color rgb="FFBFBFBF"/></top><bottom style="thin"><color rgb="FFBFBFBF"/></bottom><diagonal/></border>';
    const relleno = c => `<fill><patternFill patternType="solid"><fgColor rgb="FF${c}"/><bgColor indexed="64"/></patternFill></fill>`;
    const tit = '<alignment horizontal="center" vertical="center" wrapText="1"/>';
    const xf = (num, font, fill, extra) => `<xf numFmtId="${num}" fontId="${font}" fillId="${fill}" borderId="${fill === 0 && font === 5 ? 0 : 1}" xfId="0" applyNumberFormat="1" applyFont="1" applyFill="1" applyBorder="1"${extra ? ' applyAlignment="1">' + extra + '</xf>' : '/>'}`;
    // fuentes: 0 normal · 1 blanca negrita · 2 roja · 3 verde · 4 negrita · 5 grande negrita · 6 roja negrita · 7 verde negrita
    // rellenos: 2 azul oscuro · 3 verde · 4 naranja · 5 gris oscuro · 6 verde claro · 7 rojo claro · 8 gris claro · 9 negro
    const estilos = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
<numFmts count="2"><numFmt numFmtId="164" formatCode="#,##0.00"/><numFmt numFmtId="165" formatCode="&quot;$&quot;#,##0;-&quot;$&quot;#,##0"/></numFmts>
<fonts count="8"><font><sz val="10"/><name val="Calibri"/></font><font><b/><sz val="10"/><color rgb="FFFFFFFF"/><name val="Calibri"/></font>
<font><sz val="10"/><color rgb="FFC00000"/><name val="Calibri"/></font><font><sz val="10"/><color rgb="FF2E7D32"/><name val="Calibri"/></font><font><b/><sz val="10"/><name val="Calibri"/></font>
<font><b/><sz val="16"/><name val="Calibri"/></font><font><b/><sz val="10"/><color rgb="FFC00000"/><name val="Calibri"/></font><font><b/><sz val="10"/><color rgb="FF2E7D32"/><name val="Calibri"/></font></fonts>
<fills count="10"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill>${['1F3864', '548235', 'C55A11', '404040', 'E2EFDA', 'FCE4D6', 'EDEDED', '1A1A1A'].map(relleno).join('')}</fills>
<borders count="2"><border><left/><right/><top/><bottom/><diagonal/></border>${borde}</borders>
<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
<cellXfs count="20"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>
${xf(0, 1, 9, tit)}${xf(0, 1, 3, tit)}${xf(0, 1, 4, tit)}${xf(0, 1, 5, tit)}
${xf(0, 0, 0)}${xf(164, 0, 0)}${xf(164, 2, 0)}${xf(164, 3, 0)}
${xf(0, 5, 0, '<alignment vertical="center"/>')}${xf(0, 4, 8)}${xf(165, 0, 0)}${xf(165, 2, 0)}${xf(165, 3, 0)}${xf(10, 4, 8)}
${xf(0, 7, 6, '<alignment horizontal="center"/>')}${xf(0, 6, 7, '<alignment horizontal="center"/>')}${xf(0, 4, 8, '<alignment horizontal="center" vertical="center" wrapText="1"/>')}${xf(165, 4, 8)}${xf(164, 4, 8)}</cellXfs>
<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>`;
    const zip = new JSZip();
    zip.file('[Content_Types].xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/>
<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
${hojas.map((h, i) => `<Override PartName="/xl/worksheets/sheet${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`).join('')}
<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>`);
    zip.file('_rels/.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>`);
    zip.file('xl/workbook.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>${hojas.map((h, i) => `<sheet name="${xe(h.nombre)}" sheetId="${i + 1}" r:id="rId${i + 1}"/>`).join('')}</sheets>
<definedNames>${hojas.map((h, i) => h.filtro ? `<definedName name="_xlnm._FilterDatabase" localSheetId="${i}" hidden="1">'${xe(h.nombre)}'!${h.filtro.replace(/([A-Z]+)(\d+)/g, '$$$1$$$2')}</definedName>` : '').join('')}</definedNames></workbook>`);
    zip.file('xl/_rels/workbook.xml.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${hojas.map((h, i) => `<Relationship Id="rId${i + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${i + 1}.xml"/>`).join('')}
<Relationship Id="rId${hojas.length + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`);
    zip.file('xl/styles.xml', estilos);
    hojas.forEach((h, i) => zip.file(`xl/worksheets/sheet${i + 1}.xml`, hojaXml(h)));
    return zip.generateAsync({ type: 'blob', mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', compression: 'DEFLATE' });
  }

  // Excel del inventario como el formato de CONTROL INTERNO (más la hoja de AJUSTES SAP y el RESUMEN).
  // Sale lo que está filtrado en la tabla. Una fila por producto y almacén.
  async function descargarInventarioSap() {
    if (sinPermiso('reportes')) return;
    toast('Preparando el Excel…', 'ok');
    try {
      if (invRcs === null) { try { invRcs = await reconfsInventario(); } catch (e) { invRcs = []; } }
      const A = analisisInv(), vis = new Set(filtrarInventario(datosInvRc()).map(f => f.cod));
      const l = A.filas.filter(r => r.algo && vis.has(r.cod));
      if (!l.length) return toast('No hay datos para descargar', 'error');
      const red = n => +Number(n || 0).toFixed(3), din = n => (n === null || n === undefined || isNaN(n) ? '' : Math.round(n));
      const codN = c => /^\d+$/.test(String(c)) ? Number(c) : String(c);
      const T = (v, s) => ({ v, s }), N = v => T(red(v), 6), P = v => T(din(v), 11);
      // Filas por almacén: SAP de cada almacén (MB52) y lo contado en cada almacén
      const filasXls = [];
      l.forEach(r => {
        const f = r.f, porAlm = {};
        const de = k => porAlm[k] || (porAlm[k] = { alm: k, lib: 0, cal: 0, blq: 0, vLib: null, vCal: null, vBlq: null, pk: 0, ae: 0, fcal: 0, fblq: 0, umb: '' });
        if (r.almSap.length) r.almSap.forEach(a => { const x = de(a.almacen); x.lib += a.inventario; x.cal += a.calidad; x.blq += a.bloqueado; x.umb = a.umb || x.umb;
          ['vLib', 'vCal', 'vBlq'].forEach(k => { if (a[k] !== null && a[k] !== undefined) x[k] = (x[k] || 0) + a[k]; }); });
        else { const x = de(r.alm); x.lib = r.sap.inventario; x.cal = r.sap.calidad; x.blq = r.sap.bloqueado; x.vLib = r.sap.vLib; x.vCal = r.sap.vCal; x.vBlq = r.sap.vBlq; }
        Object.values(f.alm).forEach(a => { const k = almCorto(a.key) || r.alm; const x = de(k);
          x.pk += a.picking; x.ae += a.aereo; x.fcal += a.calidad; x.fblq += a.bloqueado; });
        const ks = Object.keys(porAlm);
        const princ = porAlm[r.alm] ? r.alm : ks[0];
        ks.forEach(k => {
          const x = porAlm[k], rc = f.rc && k === princ ? f.rc.pk - f.picking : 0;   // el reconteo va en el almacén principal
          const pkFin = x.pk + rc, fis = pkFin + x.ae + x.fcal + x.fblq, sapT = x.lib + x.cal + x.blq, dif = +(fis - sapT).toFixed(3);
          filasXls.push({ r, x, alm: k, rc: f.rc && k === princ ? f.rc.pk : null, fis, sapT, dif, valDif: r.c === null ? null : dif * r.c });
        });
      });
      filasXls.sort((a, b) => String(a.alm).localeCompare(String(b.alm), 'es', { numeric: true }) || String(a.r.p ? a.r.p.nombre : a.r.cod).localeCompare(String(b.r.p ? b.r.p.nombre : b.r.cod)));
      // ---- Hoja CONTROL INTERNO ----
      const cols = ['VALOR FISICO', 'COD NUTRESA', 'COD ATL', 'TEXTO BREVE DE MATERIAL', 'ALMACEN', 'UMB', 'LIBRE UTILIZACIÓN', 'VALOR LIBRE UTILIZACION', 'CALIDAD', 'VALOR CALIDAD',
        'BLOQUEO', 'VALOR BLOQUEO', 'TOTAL SAP', 'CONTEO 1 (LIBRE)', 'LIBRE UTIL (RECUPERADO)', 'CONTEO 3', 'AEREO', 'BLOQUEO', 'CALIDAD', 'TOTAL FISICO', 'DIFERENCIA', 'VR. DIFERENCIA',
        'VALOR UNIDAD KILO', 'SUB CATEGORIA', 'ACCIONES', 'OBSERVACION', 'CANTIDAD AJUSTE', 'CRUCE', 'GANANCIA', 'BAJA'];
      const estTit = i => (i >= 6 && i <= 12 ? 1 : i >= 13 && i <= 19 ? 2 : i >= 20 ? 4 : 4);
      const fis = filasXls.reduce((a, y) => a + (y.r.c === null ? 0 : y.fis * y.r.c), 0);
      const vSap = filasXls.reduce((a, y) => a + (y.r.c === null ? 0 : y.sapT * y.r.c), 0);
      const bajas = filasXls.filter(y => y.r.contado && y.dif < 0), gan = filasXls.filter(y => y.r.contado && y.dif > 0);
      const sumV = ls => ls.reduce((a, y) => a + (y.valDif || 0), 0);
      const fila = n => Array(30).fill(null).map((_, i) => (n && n[i]) || null);
      const enc = [];
      for (let i = 0; i < 7; i++) enc.push(fila());
      enc[0][0] = T('ATLANTIC FS S.A.S', 9); enc[0][5] = T('INVENTARIO FISICO', 9);
      enc[1][5] = T('ATLANTIC FS S.A.S', 10);
      enc[2][5] = T('FECHA: ' + hoyISO().split('-').reverse().join('.'), 10);
      enc[3][5] = T('SUCURSAL: ' + [nombreRegional(), nombreSede(ses.sedeId)].filter(Boolean).join(' · ').toUpperCase(), 10);
      const caja = (r, c, et, v, s) => { enc[r][c] = T(et, 10); enc[r][c + 1] = v === null ? T('', 5) : T(v, s || 11); };
      caja(1, 23, 'VALOR ALMACENADO', A.hayValores ? Math.round(vSap) : null);
      caja(2, 23, 'PNC FISICO', A.hayValores ? Math.round(fis) : null);
      caja(3, 23, 'DIFERENCIA', A.hayValores ? Math.round(fis - vSap) : null, fis - vSap < 0 ? 12 : 13);
      caja(4, 23, 'VARIACION', vSap ? (fis / vSap) - 1 : null, 14);
      caja(5, 23, 'SKU SIN MOV', filasXls.filter(y => y.r.contado && !y.dif).length, 6);
      enc[1][26] = T('MATERIALES', 17); enc[1][27] = T(A.alcance, 19); enc[1][28] = T(A.hayValores ? Math.round(vSap) : '', 18);
      enc[2][26] = T('BAJA', 17); enc[2][27] = T(bajas.length, 19); enc[2][28] = T(A.hayValores ? Math.round(sumV(bajas)) : '', 12);
      enc[3][26] = T('GANANCIA', 17); enc[3][27] = T(gan.length, 19); enc[3][28] = T(A.hayValores ? Math.round(sumV(gan)) : '', 13);
      enc[4][26] = T('CRUCES', 17); enc[4][27] = T(A.cruces.length, 19);
      enc[5][26] = T('DIFERENCIAS', 17); enc[5][27] = T(bajas.length + gan.length, 19); enc[5][28] = T(A.hayValores ? Math.round(sumV(bajas) + sumV(gan)) : '', 18);
      enc[6][26] = T('EXACTITUD DEL INV', 17); enc[6][27] = T(A.nContados ? A.sinDif / A.nContados : 0, 14);
      enc[6][0] = T(A.hayValores ? Math.round(fis) : '', 18);
      enc[6][6] = T('MATERIALES EN SAP', 1); enc[6][13] = T('CONTEO FISICO', 2);
      const hoja = enc.concat([cols.map((c, i) => T(c, i === 0 ? 4 : i < 6 ? 4 : estTit(i)))]);
      filasXls.forEach(y => {
        const r = y.r, x = y.x, c = r.c, val = q => (c === null ? '' : Math.round(q * c));
        const acc = !r.contado ? 'PENDIENTE' : y.dif > 0 ? 'GANANCIA' : y.dif < 0 ? 'BAJA' : r.reclas ? 'RECLASIFICAR' : 'SIN ACCIONES';
        hoja.push([
          T(c === null ? '' : Math.round(y.fis * c), 11), T(r.p && r.p.codigoNutresa ? codN(r.p.codigoNutresa) : '', 5), T(codN(r.cod), 5), T(r.p ? r.p.nombre : '', 5),
          T(codN(y.alm), 5), T(x.umb || (r.p ? r.p.unidadMedida || 'UN' : ''), 5),
          N(x.lib), T(x.vLib !== null ? Math.round(x.vLib) : val(x.lib), 11), N(x.cal), T(x.vCal !== null ? Math.round(x.vCal) : val(x.cal), 11),
          N(x.blq), T(x.vBlq !== null ? Math.round(x.vBlq) : val(x.blq), 11), N(y.sapT),
          N(x.pk), y.rc !== null ? N(y.rc) : T('', 5), T('', 5), N(x.ae), N(x.fblq), N(x.fcal), N(y.fis),
          T(red(y.dif), y.dif < 0 ? 7 : y.dif > 0 ? 8 : 6), T(y.valDif === null ? '' : Math.round(y.valDif), y.valDif < 0 ? 12 : y.valDif > 0 ? 13 : 11),
          T(c === null ? '' : Math.round(c), 11), T(r.p ? r.p.subcategoria || r.p.categoria || '' : '', 5),
          T(acc, acc === 'GANANCIA' ? 15 : acc === 'BAJA' ? 16 : 5), T('', 5), r.contado && y.dif ? N(y.dif) : T('', 5), T(r.cruce || '', 5),
          T(r.contado && y.valDif > 0 ? Math.round(y.valDif) : '', 13), T(r.contado && y.valDif < 0 ? Math.round(y.valDif) : '', 12)]);
      });
      const finCI = `AD${hoja.length}`;
      const anchosCI = [14, 12, 9, 40, 9, 6, 12, 14, 9, 12, 9, 12, 11, 11, 13, 9, 10, 9, 9, 11, 11, 13, 12, 18, 14, 18, 11, 8, 13, 13];
      // ---- Hoja AJUSTES SAP: solo los contados con diferencia (clase de movimiento por tipo de stock) ----
      const aj = [[T('Almacén', 4), T('SKU', 4), T('Material', 4), T('UM', 4), T('SAP libre', 1), T('Contado libre', 2), T('Dif. libre', 4), T('SAP calidad', 1), T('Contado calidad', 2), T('Dif. calidad', 4),
        T('SAP bloqueo', 1), T('Contado bloqueo', 2), T('Dif. bloqueo', 4), T('Valor dif.', 4), T('Mov. libre', 3), T('Mov. calidad', 3), T('Mov. bloqueo', 3), T('Nota', 4)]];
      filasXls.filter(y => y.r.contado && (y.dif || y.r.reclas)).sort((a, b) => Math.abs(b.valDif || 0) - Math.abs(a.valDif || 0)).forEach(y => {
        const x = y.x, r = y.r, pkFin = y.fis - x.ae - x.fcal - x.fblq;
        const dl = +(pkFin + x.ae - x.lib).toFixed(3), dc = +(x.fcal - x.cal).toFixed(3), db = +(x.fblq - x.blq).toFixed(3);
        const mov = (d, mas, menos) => (d > 0 ? mas : d < 0 ? menos : '');
        const dif = d => T(d, d < 0 ? 7 : d > 0 ? 8 : 6);
        aj.push([T(codN(y.alm), 5), T(codN(r.cod), 5), T(r.p ? r.p.nombre : '', 5), T(x.umb || (r.p ? r.p.unidadMedida || 'UN' : ''), 5),
          N(x.lib), N(pkFin + x.ae), dif(dl), N(x.cal), N(x.fcal), dif(dc), N(x.blq), N(x.fblq), dif(db),
          T(y.valDif === null ? '' : Math.round(y.valDif), y.valDif < 0 ? 12 : 13), T(mov(dl, 701, 702), 5), T(mov(dc, 703, 704), 5), T(mov(db, 707, 708), 5),
          T(r.reclas ? 'El total cuadra: reclasificar el tipo de stock' : '', 5)]);
      });
      // ---- Hoja RESUMEN ----
      const res = [[T('RESUMEN DEL CONTEO FÍSICO', 9)], [T([nombreRegional(), nombreSede(ses.sedeId)].filter(Boolean).join(' · ') + ' · ' + fCorta(hoyISO()), 5)], []];
      const linea = (a, b, s) => res.push([T(a, 10), T(b, s || 6)]);
      res.push([T('AVANCE', 4)]); linea(A.sinSap ? 'Referencias a inventariar (catálogo)' : 'Referencias a inventariar (SAP)', A.alcance); linea('Referencias verificadas', A.contados); linea('Por verificar', A.pendientes); linea('Cobertura del inventario', A.alcance ? A.contados / A.alcance : 0, 14);
      res.push([]); res.push([T('RESULTADO', 4)]); linea('Cuadradas con SAP', A.sinDif); linea('Con novedad por ajustar', A.conDif); linea('Cambio de estado de stock', A.reclas); linea('Contadas fuera de la base', A.sinLinea);
      res.push([]); res.push([T('GESTIÓN', 4)]); linea('Índice de exactitud (IRA)', A.nContados ? A.sinDif / A.nContados : 0, 14); linea('Reconteo prioritario', A.alta); linea('Posibles cruces entre referencias', A.cruces.length); linea('Referencias en altura', A.conAereo);
      if (A.hayValores) { res.push([]); res.push([T('IMPACTO ECONÓMICO (solo verificadas)', 4)]); linea('Valor en libros (SAP)', Math.round(A.valSap), 11); linea('Valor físico verificado', Math.round(A.valFis), 11); linea('Excedentes', Math.round(A.sobrantes), 13); linea('Faltantes', Math.round(A.faltantes), 12); linea('Impacto neto', Math.round(A.neta), A.neta < 0 ? 12 : 13); linea('Valor en calidad y bloqueado', Math.round(A.valCalBlq), 11); }
      res.push([]); res.push([T('AVANCE POR ALMACÉN', 4)]);
      res.push([T('Almacén', 4), T('Materiales', 4), T('Contados', 4), T('Pendientes', 4), T('% avance', 4), T('Con diferencia', 4), T('Valor dif.', 4)]);
      A.porAlm.forEach(x => res.push([T(codN(x.alm), 5), T(x.mat, 6), T(x.cont, 6), T(x.mat - x.cont, 6), T(x.mat ? x.cont / x.mat : 0, 14), T(x.dif, 6), T(x.hayVal ? Math.round(x.valDif) : '', x.valDif < 0 ? 12 : 11)]));
      const blob = await xlsxLibro([
        { nombre: 'CONTROL INTERNO', celdas: hoja, anchos: anchosCI, fijar: 8, filtro: `A8:${finCI}`, unir: ['A1:D3'], altos: { 7: 34 } },
        { nombre: 'AJUSTES SAP', celdas: aj, anchos: [9, 9, 40, 6, 11, 12, 10, 11, 12, 10, 11, 12, 10, 13, 10, 11, 11, 36], fijar: 1, filtro: `A1:R${aj.length}`, altos: { 0: 30 } },
        { nombre: 'RESUMEN', celdas: res, anchos: [36, 14, 12, 12, 12, 14, 14] }]);
      entregarArchivo(blob, `Control interno ${nombreRegional() || nombreSede(ses.sedeId)} ${hoyISO()}.xlsx`, 'Excel de Control Interno');
    } catch (e) { toast('No se pudo armar el Excel: ' + e.message, 'error'); }
  }

  /* ----- Excel en formato MB52: el almacén de cada producto lo dice la MB52 (no el que escogieron al contar).
     Solo lee la MB52, lo contado y los reconteos; no cambia nada guardado. ----- */
  function abrirMb52() {
    if (sinPermiso('reportes')) return;
    abrirModal(`<div class="fila-sb"><span class="h2">Descargar en formato MB52</span>${btnCerrar()}</div>
      <span class="muted small mt8">Escoge la planilla MB52 de SAP. Cada producto sale en el almacén que dice la MB52, con lo que se contó y sus reconteos.</span>
      <label for="mbArch" class="btn btn-pri btn-xl mt12" role="button" tabindex="0">Escoger planilla MB52</label>
      <input id="mbArch" type="file" accept=".xlsx,.xls" class="oculto">
      <p id="mbEstado" class="muted small" hidden></p>
      <p id="fErr" class="error" hidden></p>`);
    $('mbArch').addEventListener('change', ev => { const f = ev.target.files[0]; if (f) llenarMb52(f); });
  }

  // Reconteos de inventario de este inventario (desde que se cargó SAP), con sus conteos
  async function reconfsInventario() {
    const lista = await llamar('bdCiclicos', ses.sedeId);
    const ini = [invData && invData.carga ? invData.carga.fecha : null, invData && invData.inventario ? invData.inventario.desde : null].filter(Boolean).sort((a, b) => new Date(b) - new Date(a));
    const desde = ini[0] || null;
    const rcs = lista.filter(c => esRcInv(c) && (!desde || !c.creado || new Date(c.creado) >= new Date(desde)))
      .sort((a, b) => String(a.creado || '').localeCompare(String(b.creado || '')));
    const datos = [];
    for (const c of rcs) datos.push(await llamar('bdCiclico', c.id));
    return datos;
  }

  async function llenarMb52(arch) {
    const est = $('mbEstado');
    const aviso = t => { est.textContent = t; est.hidden = false; };
    if (!window.XLSX) return errForm('No se pudo abrir el Excel (revisa la señal) e inténtalo otra vez.');
    try {
      aviso('Leyendo la MB52…');
      const wb = XLSX.read(new Uint8Array(await arch.arrayBuffer()), { type: 'array' });
      const filas = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1, raw: true, defval: '' });
      const t = v => sinTilde(String(v || '')).toUpperCase().trim();
      const iCab = filas.findIndex(x => x.some(c => /^COD/.test(t(c))) && x.some(c => /ALMACEN/.test(t(c))));
      if (iCab < 0) return errForm('No se encontraron las columnas COD ATL y ALMACEN. Revisa que sea la planilla MB52.');
      const cab = filas[iCab].map(t), col = re => cab.findIndex(c => re.test(c));
      const cCod = col(/^COD/), cNom = col(/TEXTO|MATERIAL|DESCRIP/), cAlm = col(/ALMACEN/), cUmb = col(/^UMB|UNIDAD/);
      const cLib = col(/LIBRE/), cCal = col(/CALIDAD/), cBlq = col(/BLOQ/);
      let cTot = col(/^TOTAL/);
      // Columnas de la MB52 que salen: de la primera hasta TOTAL SAP (si no viene, se agrega)
      const nMb = cTot >= 0 ? cTot + 1 : Math.max(cCod, cNom, cAlm, cUmb, cLib, cCal, cBlq) + 2;
      if (cTot < 0) cTot = nMb - 1;
      const titMb = Array.from({ length: nMb }, (_, i) => i === cTot && !String(filas[iCab][i] || '').trim() ? 'TOTAL SAP' : String(filas[iCab][i] ?? '').trim());
      const cod = v => String(v ?? '').trim().replace(/\.0+$/, '').replace(/^0+(?=\d)/, '');
      const num = (x, i) => (i >= 0 ? numSap(x[i]) : 0);
      const red = n => +Number(n || 0).toFixed(3);

      aviso('Buscando reconteos…');
      const rcs = await reconfsInventario();
      if (!window.JSZip) await cargarScript(JSZIP_URL);

      // Lo contado (todas las sedes sumadas) y, si tiene, su último reconteo con conteo
      const datos = {}; datosInventario().forEach(f => (datos[String(f.cod)] = f));
      const valores = k => {
        const f = datos[k];
        const v = f ? { pk: f.picking, ae: f.aereo, cal: f.calidad, blq: f.bloqueado } : { pk: 0, ae: 0, cal: 0, blq: 0 };
        let rc = null;
        for (let i = rcs.length - 1; i >= 0 && !rc; i--) {
          const r = rcs[i], cs = r.ciclico.codigos.includes(k) ? r.conteos.filter(c => c.codigo === k) : [];
          if (!cs.length) continue;
          const s = { PICKING: null, CALIDAD: null, BLOQUEADO: null };
          cs.forEach(c => { s[c.tipo] = (s[c.tipo] || 0) + c.cantidad; });
          const b = r.ciclico.base && r.ciclico.base[k];
          if (b) v.ae = Number(b.aereo) || 0;     // el aéreo como estaba cuando se pidió el reconteo
          const otrasPk = f ? f.picking - (f.pk[ses.sedeId] || 0) : 0;
          rc = { pk: s.PICKING === null ? v.pk : s.PICKING + otrasPk, ae: f ? f.aereo : 0,
            cal: s.CALIDAD === null ? v.cal : s.CALIDAD, blq: s.BLOQUEADO === null ? v.blq : s.BLOQUEADO };
        }
        return { v, rc };
      };

      // Filas: las de la MB52 en su orden; un producto en varios almacenes deja sus filas vacías y abajo el total para repartir a mano
      const porCod = {}, orden = [];
      filas.slice(iCab + 1).forEach(x => { const k = cod(x[cCod]); if (!k) return; if (!porCod[k]) { porCod[k] = []; orden.push(k); } porCod[k].push(x); });
      const mbDe = x => { const y = Array.from({ length: nMb }, (_, i) => x[i] ?? ''); y[cTot] = red(num(x, cLib) + num(x, cCal) + num(x, cBlq)); return y; };
      const salida = [];   // { mb: [...], val: {v, rc} | null, tipo: '' | 'total' | 'seccion' }
      orden.forEach(k => {
        const g = porCod[k], val = valores(k);
        if (g.length === 1) return salida.push({ mb: mbDe(g[0]), val, sap: num(g[0], cLib) + num(g[0], cCal) + num(g[0], cBlq) });
        g.forEach(y => salida.push({ mb: mbDe(y), val: null }));
        const tot = Array(nMb).fill(''), suma = i => red(g.reduce((a, y) => a + num(y, i), 0));
        tot[cCod] = g[0][cCod];
        if (cNom >= 0) tot[cNom] = 'TOTAL CONTADO: repártelo a mano en los almacenes de arriba';
        if (cUmb >= 0) tot[cUmb] = g[0][cUmb];
        [cLib, cCal, cBlq].forEach(i => { if (i >= 0) tot[i] = suma(i); });
        tot[cTot] = red(suma(cLib) + suma(cCal) + suma(cBlq));
        salida.push({ mb: tot, val, sap: tot[cTot], tipo: 'total' });
      });
      const fuera = Object.values(datos).filter(f => !porCod[String(f.cod)] && (f.picking || f.aereo || f.hayCal || f.hayBlo))
        .sort((a, b) => (a.p ? a.p.nombre : a.cod).localeCompare(b.p ? b.p.nombre : b.cod));
      if (fuera.length) {
        const s = Array(nMb).fill(''); s[cCod] = 'CONTADOS QUE NO ESTÁN EN LA MB52';
        salida.push({ mb: s, val: null, tipo: 'seccion' });
        fuera.forEach(f => {
          const y = Array(nMb).fill('');
          y[cCod] = /^\d+$/.test(String(f.cod)) ? Number(f.cod) : f.cod;
          if (cNom >= 0) y[cNom] = f.p ? f.p.nombre : '';
          if (cAlm >= 0) { const a = f.almacenes.map(z => almCorto(z.key)).filter(Boolean).join(' / '); y[cAlm] = /^\d+$/.test(a) ? Number(a) : a; }
          if (cUmb >= 0) y[cUmb] = f.p ? f.p.unidadMedida || 'UN' : '';
          [cLib, cCal, cBlq, cTot].forEach(i => { if (i >= 0) y[i] = 0; });
          salida.push({ mb: y, val: valores(String(f.cod)), sap: 0 });
        });
      }

      // Columnas de lo contado (con reconteo solo si alguno de la lista tiene)
      const conRc = salida.some(r => r.val && r.val.rc);
      const C = conRc
        ? [['PICKING', 'f', r => r.v.pk], ['RECONTEO PICKING', 'r', r => r.rc && r.rc.pk], ['AEREO', 'f', r => r.v.ae], ['RECONTEO AEREO', 'r', r => r.rc && r.rc.ae],
          ['CALIDAD', 'f', r => r.v.cal], ['RECONTEO CALIDAD', 'r', r => r.rc && r.rc.cal], ['BLOQUEO', 'f', r => r.v.blq], ['RECONTEO BLOQUEO', 'r', r => r.rc && r.rc.blq],
          ['TOTAL FISICO', 't', r => r.fis], ['TOTAL CON RECONTEO', 't', r => r.conRc], ['DIFERENCIA', 'd', r => r.fis - r.sap], ['DIFERENCIA DE RECONTEO', 'd', r => r.conRc - r.sap]]
        : [['PICKING', 'f', r => r.v.pk], ['AEREO', 'f', r => r.v.ae], ['CALIDAD', 'f', r => r.v.cal], ['BLOQUEO', 'f', r => r.v.blq],
          ['TOTAL FISICO', 't', r => r.fis], ['DIFERENCIA', 'd', r => r.fis - r.sap]];

      // Estilos: 1-4 títulos (SAP azul, contado verde, reconteo naranja, totales gris), 5 texto, 6 número, 7 rojo, 8 verde,
      // 9-10 fila para repartir (amarillo), 11 sección, 12 número de reconteo
      const cant = new Set([cLib, cCal, cBlq, cTot].filter(i => i >= 0));   // columnas de cantidad (códigos y almacén van sin decimales)
      const hoja = [];
      hoja.push(titMb.map(h => ({ v: h, s: 1 })).concat(C.map(([h, k]) => ({ v: h, s: k === 'f' ? 2 : k === 'r' ? 3 : 4 }))));
      salida.forEach(r => {
        const amar = r.tipo === 'total', secc = r.tipo === 'seccion';
        const fila = r.mb.map((v, i) => { const q = typeof v === 'number' && cant.has(i); return { v, s: secc ? 11 : amar ? (q ? 10 : 9) : (q ? 6 : 5) }; });
        if (r.val) {
          const x = Object.assign({}, r.val, { sap: r.sap });
          x.fis = x.v.pk + x.v.ae + x.v.cal + x.v.blq;
          x.conRc = x.rc ? x.rc.pk + x.rc.ae + x.rc.cal + x.rc.blq : x.fis;
          C.forEach(([, k, fn]) => {
            const v = fn(x);
            if (v === null || v === undefined || v === false) return fila.push({ v: '', s: amar ? 9 : 5 });
            const n = red(v);
            fila.push({ v: n, s: amar ? 10 : k === 'd' ? (n < 0 ? 7 : n > 0 ? 8 : 6) : k === 'r' ? 12 : 6 });
          });
        } else C.forEach(() => fila.push({ v: '', s: secc ? 11 : 5 }));
        hoja.push(fila);
      });
      const anchos = titMb.map((h, i) => i === cNom ? 46 : i === cCod ? 10 : Math.max(9, String(h).length + 2)).concat(C.map(([h]) => h.includes('RECONTEO') ? 17 : 12));
      aviso('Armando el Excel…');
      const blob = await xlsxConEstilo('INVENTARIO', hoja, anchos);
      entregarArchivo(blob, `MB52 ${nombreSede(ses.sedeId)} ${hoyISO()}.xlsx`, 'Excel en formato MB52');
      const varios = salida.filter(r => r.tipo === 'total').length;
      toast(varios ? `Listo. ${varios} producto(s) están en varios almacenes: reparte a mano la fila amarilla.` : 'Excel en formato MB52 listo', 'ok');
    } catch (e) { est.hidden = true; errForm('No se pudo armar el Excel: ' + e.message); }
  }

  // Arma un .xlsx con colores (una hoja, primera fila fija y con filtro). celdas: [[{ v, s }]]
  async function xlsxConEstilo(nombre, celdas, anchos) {
    const xe = t => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    const letra = i => { let s = ''; i++; while (i) { const m = (i - 1) % 26; s = String.fromCharCode(65 + m) + s; i = Math.floor((i - 1) / 26); } return s; };
    const nCol = Math.max(...celdas.map(f => f.length));
    const filas = celdas.map((f, r) => `<row r="${r + 1}"${r === 0 ? ' ht="34" customHeight="1"' : ''}>${f.map((c, i) => {
      const ref = letra(i) + (r + 1), st = c.s ? ` s="${c.s}"` : '';
      if (c.v === '' || c.v === null || c.v === undefined) return `<c r="${ref}"${st}/>`;
      if (typeof c.v === 'number' && isFinite(c.v)) return `<c r="${ref}"${st}><v>${c.v}</v></c>`;
      return `<c r="${ref}"${st} t="inlineStr"><is><t xml:space="preserve">${xe(c.v)}</t></is></c>`;
    }).join('')}</row>`).join('');
    const fin = `${letra(nCol - 1)}${celdas.length}`;
    const hojaXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
<sheetPr><pageSetUpPr fitToPage="1"/></sheetPr><dimension ref="A1:${fin}"/><sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews>
<sheetFormatPr defaultRowHeight="15"/><cols>${anchos.map((w, i) => `<col min="${i + 1}" max="${i + 1}" width="${w}" customWidth="1"/>`).join('')}</cols>
<sheetData>${filas}</sheetData><autoFilter ref="A1:${fin}"/>
<pageMargins left="0.3" right="0.3" top="0.4" bottom="0.4" header="0.2" footer="0.2"/><pageSetup orientation="landscape" fitToWidth="1" fitToHeight="0"/></worksheet>`;
    const borde = '<border><left style="thin"><color rgb="FFBFBFBF"/></left><right style="thin"><color rgb="FFBFBFBF"/></right><top style="thin"><color rgb="FFBFBFBF"/></top><bottom style="thin"><color rgb="FFBFBFBF"/></bottom><diagonal/></border>';
    const relleno = c => `<fill><patternFill patternType="solid"><fgColor rgb="FF${c}"/><bgColor indexed="64"/></patternFill></fill>`;
    const tit = '<alignment horizontal="center" vertical="center" wrapText="1"/>';
    const estilos = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
<numFmts count="1"><numFmt numFmtId="164" formatCode="#,##0.00"/></numFmts>
<fonts count="5"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="10"/><color rgb="FFFFFFFF"/><name val="Calibri"/></font>
<font><sz val="11"/><color rgb="FFC00000"/><name val="Calibri"/></font><font><sz val="11"/><color rgb="FF2E7D32"/><name val="Calibri"/></font><font><b/><sz val="11"/><name val="Calibri"/></font></fonts>
<fills count="9"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill>${['1F3864', '548235', 'C55A11', '404040', 'FFF2CC', 'D9E1F2', 'FCE4D6'].map(relleno).join('')}</fills>
<borders count="2"><border><left/><right/><top/><bottom/><diagonal/></border>${borde}</borders>
<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
<cellXfs count="13"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>
<xf numFmtId="0" fontId="1" fillId="2" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1">${tit}</xf>
<xf numFmtId="0" fontId="1" fillId="3" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1">${tit}</xf>
<xf numFmtId="0" fontId="1" fillId="4" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1">${tit}</xf>
<xf numFmtId="0" fontId="1" fillId="5" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1">${tit}</xf>
<xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0" applyBorder="1"/>
<xf numFmtId="164" fontId="0" fillId="0" borderId="1" xfId="0" applyNumberFormat="1" applyBorder="1"/>
<xf numFmtId="164" fontId="2" fillId="0" borderId="1" xfId="0" applyNumberFormat="1" applyFont="1" applyBorder="1"/>
<xf numFmtId="164" fontId="3" fillId="0" borderId="1" xfId="0" applyNumberFormat="1" applyFont="1" applyBorder="1"/>
<xf numFmtId="0" fontId="4" fillId="6" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1"/>
<xf numFmtId="164" fontId="4" fillId="6" borderId="1" xfId="0" applyNumberFormat="1" applyFont="1" applyFill="1" applyBorder="1"/>
<xf numFmtId="0" fontId="4" fillId="7" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1"/>
<xf numFmtId="164" fontId="0" fillId="8" borderId="1" xfId="0" applyNumberFormat="1" applyFill="1" applyBorder="1"/></cellXfs>
<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>`;
    const zip = new JSZip();
    zip.file('[Content_Types].xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/>
<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>`);
    zip.file('_rels/.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>`);
    zip.file('xl/workbook.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="${xe(nombre)}" sheetId="1" r:id="rId1"/></sheets>
<definedNames><definedName name="_xlnm._FilterDatabase" localSheetId="0" hidden="1">'${xe(nombre)}'!$A$1:$${letra(nCol - 1)}$${celdas.length}</definedName></definedNames></workbook>`);
    zip.file('xl/_rels/workbook.xml.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`);
    zip.file('xl/styles.xml', estilos);
    zip.file('xl/worksheets/sheet1.xml', hojaXml);
    return zip.generateAsync({ type: 'blob', mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', compression: 'DEFLATE' });
  }

  /* ----- Cargar el Excel de SAP ----- */
  let sapTmp = null;   // { archivo, filas: [[...]], cab: índice de la fila de títulos }
  let sapModo = 'general';   // 'general' (Inventario) | 'ciclico' (solo los productos de un cíclico nuevo)

  function abrirCargaSap(modo) {
    sapModo = modo === 'ciclico' || modo === 'ciclicoAct' ? 'ciclico' : 'general';
    sapAct = modo === 'ciclicoAct';   // volver a cargar el Excel de un cíclico que ya existe
    if (sinPermiso(sapModo === 'ciclico' ? 'ciclico_asignar' : 'inv_sap')) return;
    sapTmp = null;
    abrirModal(`<div class="fila-sb"><span class="h2">${sapModo === 'ciclico' ? 'Excel de SAP del cíclico' : 'Cargar Excel de SAP'}</span>${btnCerrar()}</div>
      <span class="muted small mt8">${sapModo === 'ciclico'
        ? 'Sube el Excel de SAP (o CSV) <b>solo con los productos que van a revisar</b>. Esos productos quedan en el cíclico y su SAP se usa para la diferencia. No cambia el SAP de la pestaña Inventario.'
        : `Exporta el reporte de inventario de SAP de <b>${esc(nombreSede(ses.sedeId))}</b> y súbelo aquí (Excel o CSV).
        Reemplaza lo que estaba cargado de SAP; los conteos de planta no se tocan.`}</span>
      <label for="sapArch" class="btn btn-pri btn-xl mt12" role="button" tabindex="0">Escoger archivo</label>
      <input id="sapArch" type="file" accept=".xlsx,.xls,.csv" class="oculto">
      <div id="sapCaja" class="mt12"></div>
      <p id="fErr" class="error" hidden></p>`);
    $('sapArch').addEventListener('change', ev => { const f = ev.target.files[0]; if (f) leerSap(f); });
  }

  function leerSap(f) {
    $('sapCaja').innerHTML = '<div class="cargando">Leyendo…</div>';
    const r = new FileReader();
    r.onload = () => {
      try {
        let filas;
        if (window.XLSX && !/\.csv$/i.test(f.name)) {
          const wb = XLSX.read(new Uint8Array(r.result), { type: 'array' });
          filas = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1, raw: true, defval: '' });
        } else {
          let txt = new TextDecoder('utf-8').decode(r.result);
          if (txt.includes('\uFFFD')) txt = new TextDecoder('windows-1252').decode(r.result);   // CSV guardado desde Excel en Windows
          const muestra = txt.split(/\r?\n/).slice(0, 15).join('\n');
          const cuenta = ch => (muestra.match(new RegExp(ch === '\t' ? '\t' : '\\' + ch, 'g')) || []).length;
          const sep = cuenta('\t') > cuenta(';') && cuenta('\t') > cuenta(',') ? '\t' : cuenta(';') >= cuenta(',') ? ';' : ',';
          filas = txt.split(/\r?\n/).map(l => l.split(sep).map(c => c.replace(/^"|"$/g, '').trim()));
        }
        filas = filas.filter(x => x.some(c => String(c).trim() !== ''));
        const cab = Math.max(0, filas.findIndex(x => x.filter(c => String(c).trim() && isNaN(Number(c))).length >= 3));
        sapTmp = { archivo: f.name, filas, cab };
        pintarSap();
      } catch (e) { $('sapCaja').innerHTML = `<p class="error">No se pudo leer el archivo: ${esc(e.message)}</p>`; }
    };
    r.readAsArrayBuffer(f);
  }

  // Número de SAP: 1.234,5 · 1,234.5 · 1234,5 · 1234
  function numSap(v) {
    if (typeof v === 'number') return v;
    let t = String(v || '').replace(/\s/g, '');
    if (!t) return 0;
    const neg = /-$/.test(t) || /^-/.test(t); t = t.replace(/-/g, '');
    if (t.includes(',') && t.includes('.')) t = t.lastIndexOf(',') > t.lastIndexOf('.') ? t.replace(/\./g, '').replace(',', '.') : t.replace(/,/g, '');
    else if (t.includes(',')) t = /,\d{3}$/.test(t) && !/,\d{1,2}$/.test(t) && t.split(',').length > 2 ? t.replace(/,/g, '') : t.replace(',', '.');
    else if (/^\d{1,3}(\.\d{3})+$/.test(t)) t = t.replace(/\./g, '');   // 1.200 = mil doscientos (punto de miles)
    const n = Number(t);
    return isNaN(n) ? 0 : (neg ? -n : n);
  }

  function pintarSap() {
    const { filas, cab } = sapTmp;
    const tit = filas[cab].map((c, i) => String(c).trim() || `Columna ${i + 1}`);
    const adiv = (re, no) => { const i = tit.findIndex(t => re.test(sinTilde(t)) && !(no && no.test(sinTilde(t)))); return i; };
    const sel = (id, i) => `<select id="${id}" class="campo"><option value="-1">— No viene —</option>${tit.map((t, k) => `<option value="${k}" ${k === i ? 'selected' : ''}>${esc(t)}</option>`).join('')}</select>`;
    const g = sapTmp.guia || {
      cod: adiv(/material|codigo|cod\b|sku|referencia/i),
      inv: adiv(/libre|inventario|stock|existencia|disponible|cantidad|total/i, /VALOR|\$/),
      cal: adiv(/calidad|inspecc/i, /VALOR|\$/),
      blq: adiv(/bloq/i, /VALOR|\$/)
    };
    // Valores (precios) y almacén: opcionales. Con ellos el Avance muestra valores y el avance por almacén.
    if (g.alm === undefined) g.alm = adiv(/^ALMAC/i);
    if (g.vLib === undefined) g.vLib = adiv(/VALOR.*LIBRE|LIBRE.*VALOR|VALOR LIB/i);
    if (g.vCal === undefined) g.vCal = adiv(/VALOR.*CALID|VALOR.*INSPEC/i);
    if (g.vBlq === undefined) g.vBlq = adiv(/VALOR.*BLOQ/i);
    if (g.nom === undefined) g.nom = adiv(/texto|descrip|nombre/i);
    if (g.um === undefined) g.um = adiv(/^umb$|^um$|unidad/i);
    sapTmp.guia = g;
    $('sapCaja').innerHTML = `<span class="muted small">Archivo: <b>${esc(sapTmp.archivo)}</b> · ${filas.length - cab - 1} filas. Revisa qué columna es cada cosa:</span>
      <div class="dos mt8">
        <div><label class="lbl" for="sapCod">Código del producto (Nutresa o Atlantic)</label>${sel('sapCod', g.cod)}</div>
        <div><label class="lbl" for="sapInv">Inventario SAP</label>${sel('sapInv', g.inv)}</div>
        <div><label class="lbl" for="sapCal">Calidad SAP</label>${sel('sapCal', g.cal)}</div>
        <div><label class="lbl" for="sapBlq">Bloqueado SAP</label>${sel('sapBlq', g.blq)}</div>
      </div>
      ${sapModo !== 'ciclico' ? `<details class="mt8" ${g.alm >= 0 || g.vLib >= 0 ? 'open' : ''}><summary class="small">Almacén y valores (precios) ${ayudaHtml('Opcional. Con el almacén y los valores de la MB52, el Avance muestra los valores (sobrantes, faltantes y diferencia neta), el avance por almacén, y el Excel sale como el formato de Control Interno.')}</summary>
        <div class="dos mt8">
          <div><label class="lbl" for="sapAlm">Almacén</label>${sel('sapAlm', g.alm)}</div>
          <div><label class="lbl" for="sapVLib">Valor libre utilización</label>${sel('sapVLib', g.vLib)}</div>
          <div><label class="lbl" for="sapVCal">Valor calidad</label>${sel('sapVCal', g.vCal)}</div>
          <div><label class="lbl" for="sapVBlq">Valor bloqueo</label>${sel('sapVBlq', g.vBlq)}</div>
        </div></details>` : ''}
      <div id="sapPrev" class="mt12"></div>`;
    ['sapCod', 'sapInv', 'sapCal', 'sapBlq', 'sapAlm', 'sapVLib', 'sapVCal', 'sapVBlq'].forEach(id => $(id) && $(id).addEventListener('change', () => {
      sapTmp.guia = Object.assign(sapTmp.guia, { cod: +$('sapCod').value, inv: +$('sapInv').value, cal: +$('sapCal').value, blq: +$('sapBlq').value });
      if ($('sapAlm')) Object.assign(sapTmp.guia, { alm: +$('sapAlm').value, vLib: +$('sapVLib').value, vCal: +$('sapVCal').value, vBlq: +$('sapVBlq').value });
      prevSap();
    }));
    prevSap();
  }

  function filasSap() {
    const { filas, cab, guia: g } = sapTmp;
    const porCod = {};
    ini.productos.forEach(p => { porCod[String(p.id)] = p; if (p.codigoNutresa) porCod[String(p.codigoNutresa)] = porCod[String(p.codigoNutresa)] || p; });
    const ok = [], malos = [], nuevos = {};
    if (g.cod < 0) return { ok, malos, nuevos: [] };
    filas.slice(cab + 1).forEach(x => {
      const c = String(x[g.cod] ?? '').trim().replace(/\.0+$/, '').replace(/^0+(?=\d)/, '');
      if (!c) return;
      const p = porCod[c] || porCod[String(x[g.cod]).trim()];
      const val = i => (i >= 0 ? numSap(x[i]) : 0);
      if (!p) {
        if (!nuevos[c]) nuevos[c] = { codigo: c, nombre: g.nom >= 0 ? String(x[g.nom] ?? '').trim() : '', unidad: g.um >= 0 ? String(x[g.um] ?? '').trim() : '' };
        return malos.push(c);
      }
      const vOpc = i => (i >= 0 && String(x[i] ?? '').trim() !== '' ? numSap(x[i]) : null);
      ok.push({ codigo: p.id, inventario: val(g.inv), calidad: val(g.cal), bloqueado: val(g.blq),
        almacen: g.alm >= 0 ? String(x[g.alm] ?? '').trim().replace(/\.0+$/, '') : '', umb: g.um >= 0 ? String(x[g.um] ?? '').trim() : '',
        valorLibre: vOpc(g.vLib), valorCalidad: vOpc(g.vCal), valorBloqueo: vOpc(g.vBlq) });
    });
    return { ok, malos, nuevos: Object.values(nuevos) };
  }

  function prevSap() {
    const { ok, malos, nuevos } = filasSap();
    const g = sapTmp.guia;
    const crear = sapModo !== 'ciclico' && nuevos.length && sapTmp.crear !== false;
    const nCrear = crear ? nuevos.length : 0, nOk = new Set(ok.map(r => r.codigo)).size;
    // Un producto puede venir en varias filas (un almacén por fila): se muestra ya sumado, como se guarda
    const sumM = {};
    ok.forEach(r => { const x = sumM[r.codigo] || (sumM[r.codigo] = { codigo: r.codigo, inventario: 0, calidad: 0, bloqueado: 0, filas: 0 });
      x.inventario = +(x.inventario + r.inventario).toFixed(3); x.calidad = +(x.calidad + r.calidad).toFixed(3); x.bloqueado = +(x.bloqueado + r.bloqueado).toFixed(3); x.filas++; });
    const sumados = Object.values(sumM).sort((a, b) => b.filas - a.filas), rep = sumados.filter(x => x.filas > 1).length;
    const listo = g.cod >= 0 && g.inv >= 0 && (ok.length || nCrear);
    const selG = (id, k, i) => `<select id="${id}" class="campo" onchange="sapTmp.guia.${k}=+this.value; prevSap()"><option value="-1">— No viene —</option>${sapTmp.filas[sapTmp.cab].map((t, j) => `<option value="${j}" ${j === i ? 'selected' : ''}>${esc(String(t).trim() || 'Columna ' + (j + 1))}</option>`).join('')}</select>`;
    $('sapPrev').innerHTML = `<div class="inv-res">
        <div><span class="muted small">Productos encontrados</span><b class="txt-verde">${nOk}</b></div>
        <div><span class="muted small">Códigos que no están</span><b class="${malos.length ? 'txt-naranja' : ''}">${new Set(malos).size}</b></div></div>
      ${malos.length ? `<span class="muted small mt8">No están en el catálogo: ${esc([...new Set(malos)].slice(0, 15).join(', '))}${new Set(malos).size > 15 ? '…' : ''}</span>` : ''}
      ${sapModo !== 'ciclico' && nuevos.length ? `<div class="card col gap8 mt8">
        <label class="fila gap8"><input type="checkbox" id="sapCrear" ${crear ? 'checked' : ''} onchange="sapTmp.crear=this.checked; prevSap()">
          <span>Crearlos en el catálogo y cargarlos (${nuevos.length}) ${ayudaHtml('Se crean en Productos con el código Atlantic del Excel. Como el Excel no trae el código Nutresa, queda el mismo código Atlantic, y la unidad por caja queda en 1. Quien maneja Productos los corrige después. Los productos que ya existen no se tocan.')}</span></label>
        ${crear ? `<div class="dos">
          <div><label class="lbl" for="sapNom">Nombre del producto</label>${selG('sapNom', 'nom', g.nom)}</div>
          <div><label class="lbl" for="sapUm">Unidad de medida (opcional)</label>${selG('sapUm', 'um', g.um)}</div>
        </div>
        <span class="muted small">Así quedan: ${nuevos.slice(0, 3).map(x => `<b>${esc(x.codigo)}</b> · ${esc(x.nombre || 'Producto ' + x.codigo)}`).join(' — ')}${nuevos.length > 3 ? '…' : ''}</span>` : '<span class="muted small">Si no los creas, esos códigos no se cargan.</span>'}
      </div>` : ''}
      ${rep ? `<span class="small txt-azul mt8">${rep} producto${rep === 1 ? '' : 's'} venía${rep === 1 ? '' : 'n'} en varias filas (varios almacenes): se suma${rep === 1 ? '' : 'n'} todo y queda un solo total por producto.</span>` : ''}
      ${ok.length ? `<div class="tabla-wrap mt8"><table class="tabla"><thead><tr><th>Atlantic</th><th>Producto</th><th class="num">Inventario</th><th class="num">Calidad</th><th class="num">Bloqueado</th></tr></thead>
        <tbody>${sumados.slice(0, 5).map(r => `<tr><td>${esc(r.codigo)}</td><td>${esc((prodDe(r.codigo) || {}).nombre || '')}</td><td class="num">${nInv(r.inventario)}</td><td class="num">${nInv(r.calidad)}</td><td class="num">${nInv(r.bloqueado)}</td></tr>`).join('')}</tbody></table></div>
        <span class="muted small">Así quedan los primeros 5 (ya sumados). Si los números no cuadran, cambia las columnas de arriba.</span>` : ''}
      <button id="sapOk" class="btn btn-pri btn-xl mt12" onclick="guardarSap()" ${listo ? '' : 'disabled'}>${listo ? (sapModo === 'ciclico' ? `Usar estos ${new Set(ok.map(r => r.codigo)).size} productos` : `Cargar ${nOk + nCrear} productos`) : g.cod < 0 ? 'Elige la columna del código' : g.inv < 0 ? 'Elige la columna de inventario' : 'No hay productos para cargar'}</button>`;
  }

  let sapAct = false;
  // Después de crear productos: la lista para buscar y el caché de productos totales
  function prodRefrescado() {
    if ($('dlProductos')) $('dlProductos').innerHTML = ini.productos.map(p => `<option value="${esc(p.id + ' · ' + p.nombre)}">`).join('');
    try { ptMemo = null; } catch (e) {}
  }
  function guardarSap() {
    const { ok } = filasSap();
    if (sapModo === 'ciclico' && sapAct) {
      const sap = {};
      ok.forEach(r => { const x = sap[r.codigo] || (sap[r.codigo] = { inventario: 0, calidad: 0, bloqueado: 0 }); x.inventario += r.inventario; x.calidad += r.calidad; x.bloqueado += r.bloqueado; });
      const b = $('sapOk'); b.disabled = true; b.textContent = 'Guardando…';
      return llamar('bdActualizarSapCiclico', { id: cicSel, sap, archivo: sapTmp.archivo, usuario: ses.nombre })
        .then(c => { const i = (cicLista || []).findIndex(x => x.id === c.id); if (i >= 0) cicLista[i] = Object.assign({}, cicLista[i], c); if (cicData) cicData.ciclico = Object.assign({}, cicData.ciclico, c);
          cerrarModal(); toast(`Excel actualizado: ${Object.keys(sap).length} productos`, 'ok'); pintarApp(); })
        .catch(e => { errForm(e.message); b.disabled = false; b.textContent = 'Usar este Excel'; });
    }
    if (sapModo === 'ciclico') return usarSapCiclico(ok);
    const b = $('sapOk'), txt = b.textContent; b.disabled = true;
    const { nuevos } = filasSap(), crear = nuevos.length && sapTmp.crear !== false;
    let creados = 0;
    (crear ? (b.textContent = 'Creando productos…', llamar('bdCrearProductosSap', { productos: nuevos, usuario: ses.nombre }).then(r => {
      ini.productos = r.productos; creados = r.creados; prodRefrescado();
    })) : Promise.resolve())
      .then(() => { b.textContent = 'Cargando…'; return llamar('bdCargarSap', { sedeId: ses.sedeId, filas: filasSap().ok, usuario: ses.nombre, archivo: sapTmp.archivo }); })
      .then(r => { invData = r.inv; invSede = ses.sedeId; cerrarModal(); toast(`SAP cargado: ${r.filas} productos${creados ? ` · ${creados} creados en el catálogo` : ''}`, 'ok'); pintarApp(); })
      .catch(e => { errForm(e.message); b.disabled = false; b.textContent = txt; if (creados) prevSap(); });
  }/* ================= CÍCLICO: el encargado asigna qué revisar y a quién; la persona lo cuenta aquí ================= */
  let cicLista = null, cicSede = null;   // cíclicos de la sede
  let cicSel = null;                     // id del cíclico abierto
  let cicData = null;                    // { ciclico, conteos } del abierto
  let cicNuevo = null;                   // formulario de nuevo cíclico
  let cicPersonas = null;                // personas activas para asignar
  const cicF = { ver: 'ABIERTO', q: '', estado: '', modo: 'ciclicos', tipo: '' };   // modo: ciclicos | reconf

  // Ya no se asigna a nadie: quien tenga permiso de contar ve todos los cíclicos abiertos
  const cicVisibles = () => puedeAlguno(['ciclico', 'ciclico_asignar']) ? (cicLista || []) : [];
  const cicPuedeContar = c => c && c.estado === 'ABIERTO' && puede('ciclico');
  // Nombre que le pusieron (los viejos, que no tienen, salen con su tipo y fecha)
  const tituloCic = c => !c ? '' : (c.nota || `${nombreCic(c)} del ${fCorta(c.fecha)}`);
  // ¿Lo que se cuenta en pantalla es de un cíclico/reconteo? (en Inventario, solo dentro de sus reconteos)
  const ctxCic = () => prodTab === 'ciclico' || (prodTab === 'inventario' && invSub === 'reconf');
  const esRcInv = c => esReconf(c) && c.origenTipo !== 'CICLICO';
  // SAP y diferencia: los ve quien pidió el cíclico, o quien tenga el permiso
  const cicVeSap = c => !!c && (puede('ciclico_sap') || (c.creadoPorId ? c.creadoPorId === ses.id : c.creadoPor === ses.nombre));
  const cicSel_ = () => (cicLista || []).find(x => x.id === cicSel);

  // Los datos de SAP se usan para la comparación (los mismos de la pestaña Inventario)
  function asegurarInvData() {
    if (invData !== null && invSede === ses.sedeId) return true;
    invData = null; invSede = ses.sedeId;
    llamar('bdInventarioGeneral', ses.sedeId).then(d => { invData = d; if (vista === 'productos') pintarApp(); })
      .catch(e => { invData = { sap: [], carga: null, conteos: [], error: e.message }; if (vista === 'productos') pintarApp(); });
    return false;
  }

  function cargarCiclicos() {
    cicSede = ses.sedeId;
    return llamar('bdCiclicos', ses.sedeId).then(l => {
      cicLista = l;
      // Quien solo cuenta: si hay un solo cíclico abierto, se le abre de una
      if (!cicSel && !puede('ciclico_asignar') && prodTab === 'ciclico') {
        const ab = l.filter(c => !esReconf(c) && c.estado === 'ABIERTO');
        if (ab.length === 1) abrirCiclico(ab[0].id, true);
      }
      if (cicSel && !l.some(c => c.id === cicSel)) { cicSel = null; cicData = null; }
      if (vista === 'productos' && ctxCic()) pintarApp();
    }).catch(e => { cicLista = []; toast(e.message, 'error'); if (vista === 'productos') pintarApp(); });
  }
  // Carga la lista si hace falta (Cíclico y Reconteos de Inventario usan la misma)
  function asegurarCiclicos() {
    if (cicLista !== null && cicSede === ses.sedeId) return true;
    if (cicSede !== ses.sedeId) { cicLista = null; cicSel = null; cicData = null; }
    if (!asegurarCiclicos.cargando) { asegurarCiclicos.cargando = true; cargarCiclicos().finally(() => { asegurarCiclicos.cargando = false; }); }
    return false;
  }

  function abrirCiclico(id, sinPintar) {
    if (cicSel !== id) { rcc.listo = ''; rcc.sede = ''; rcc.pas = ''; rcc.racks = []; rcc.q = ''; rcc.eanPid = ''; pagInicio('rcc'); invForm.prod = ''; pagInicio('cic'); cicF.q = ''; cicF.estado = ''; cicSub = 'ingresar'; ing.cod = ''; cf.q = ''; cp.alm = '*'; cp.pas = '*'; cpMarcados = new Set(); }
    cicSel = id;
    if (!cicData || cicData.ciclico.id !== id) cicData = null;
    llamar('bdCiclico', id).then(d => {
      if (cicSel !== id) return;
      cicData = d;
      if (vista === 'productos' && ctxCic()) pintarApp();
    }).catch(e => { toast(e.message, 'error'); cicSel = null; cicData = null; cargarCiclicos(); });
    if (!sinPintar) { pintarApp(); window.scrollTo(0, 0); }
  }
  // Volver: de un reconteo de cíclico, a su cíclico (pestaña Reconteos); si no, a la lista
  function volverCic(c) {
    c = c || cicSel_();
    if (c && esReconf(c) && c.origenTipo === 'CICLICO' && c.origenId && (cicLista || []).some(x => x.id === c.origenId)) {
      abrirCiclico(c.origenId, true); cicSub = 'reconf';
    } else { cicSel = null; cicData = null; }
    pintarApp(); window.scrollTo(0, 0);
  }

  function vistaCiclico() {
    const listoInv = asegurarInvData();
    if (!asegurarCiclicos()) return '<div class="cargando">Cargando cíclicos…</div>';
    if (!listoInv) return '<div class="cargando">Cargando inventario…</div>';
    if (cicSel && esRcInv(cicSel_())) { cicSel = null; cicData = null; }   // las de inventario van en Inventario
    if (cicNuevo && cicNuevo.tipo !== 'CICLICO' && !cicSel) cicNuevo = null;
    const jefe = puede('ciclico_asignar');
    const abiertos = cicVisibles().filter(c => !esReconf(c) && c.estado === 'ABIERTO').length;
    return `<div class="col gap12">
      <div class="fila-sb wrap-f gap8">
        <div class="col gap4"><span class="h2">Cíclicos · ${esc(nombreSede(ses.sedeId))}</span>
          <span class="muted small">${cicSel ? '' : jefe ? 'Crea un cíclico con su nombre y el Excel de SAP. Toca uno de la lista para ver cómo va.'
            : 'Toca el cíclico que vas a contar.'}</span></div>
      </div>
      ${accionesHtml([{ t: 'Cíclico', tono: 'azul', b: [jefe && !cicNuevo && !cicSel && accBtn('+ Nuevo cíclico', 'nuevoCiclico()', true)] },
        { t: 'Pantalla', tono: 'gris', b: [accBtn('Actualizar', 'cicLista=null; if (cicSel) abrirCiclico(cicSel, true); pintarApp()')] }])}
      ${cicNuevo && cicNuevo.tipo === 'CICLICO' && !cicSel ? formNuevoCiclico() : ''}
      ${cicSel ? detalleCiclico() : `<section class="card col gap8">
        <div class="fila-sb wrap-f gap8"><span class="h3">Historial de cíclicos
            <span class="muted small">(${abiertos} abierto${abiertos === 1 ? '' : 's'})</span></span>
          <div class="seg seg-c" role="group" aria-label="Ver cíclicos">${[['ABIERTO', 'Abiertos'], ['CERRADO', 'Cerrados'], ['', 'Todos']].map(([k, t]) =>
            `<button class="${cicF.ver === k ? 'on' : ''}" onclick="cicF.ver='${k}'; pagInicio('cicl'); pintarApp()">${t}</button>`).join('')}</div></div>
        <div id="cicLista">${listaCiclicos()}</div>
      </section>`}
    </div>`;
  }

  function listaCiclicos() {
    const l = cicVisibles().filter(c => !esReconf(c) && (!cicF.ver || c.estado === cicF.ver));
    return tablaCics(l, 'cicl', () => { if ($('cicLista')) $('cicLista').innerHTML = listaCiclicos(); },
      cicF.ver === 'ABIERTO' ? (puede('ciclico_asignar') ? 'No hay cíclicos abiertos. Crea uno con «+ Nuevo cíclico».' : 'No hay cíclicos abiertos por ahora.') : 'No hay cíclicos aquí.');
  }
  // Tabla de cíclicos o reconteos: toca una fila para abrirla
  function tablaCics(l, pk, repintar, vacio) {
    if (!l.length) return `<p class="muted small">${vacio}</p>`;
    const pg = paginar(pk, l, repintar);
    return `<div class="tabla-wrap"><table class="tabla cic-lista">
      <thead><tr><th>Nombre</th><th>Fecha</th><th class="num">Productos</th><th>Avance</th><th>Estado</th><th>Lo creó</th></tr></thead>
      <tbody>${pg.filas.map(c => {
        const n = c.codigos.length, h = Math.min(c.contados || 0, n), pct = n ? Math.round(h * 100 / n) : 0;
        return `<tr onclick="abrirCiclico('${c.id}')" class="${c.id === cicSel ? 'cic-sel' : ''}">
          <td><b>${esc(tituloCic(c))}</b>${sedesCicTxt(c) ? `<div class="muted small">${esc(sedesCicTxt(c))}</div>` : ''}</td>
          <td class="nowrap">${fCorta(c.fecha)}</td>
          <td class="num">${n}</td>
          <td><span class="cic-avance"><span class="us-barra-p"><i style="width:${pct}%"></i></span>${h}/${n}</span></td>
          <td>${c.estado === 'CERRADO' ? '<span class="tag">Cerrado</span>' : h >= n && n ? '<span class="tag ok">Contado</span>' : '<span class="tag amar">Abierto</span>'}</td>
          <td class="muted small">${esc(c.creadoPor || '—')}</td></tr>`;
      }).join('')}</tbody></table></div>${pg.barra}`;
  }

  /* ----- Inventarios (2 al mes): lista con nombre y fecha, crear uno nuevo y ver los ya cerrados ----- */
  let invLista = null, invNuevo = null, invVer = null;   // invVer: { id, d (con la foto) }
  let invDentro = null;   // true = adentro del inventario en curso; false = en la lista; null = se decide al entrar
  const invVerF = { q: '', dif: false };
  function invActualCli() { return (invData && invData.inventario) || { nombre: '', estado: 'NINGUNO' }; }

  function listaInventariosVista(jefe) {
    const puedeComparar = invLista && invLista.filter(x => x.estado !== 'ABIERTO' || x.id || x.virtual).length >= 2;
    return `<div class="col gap12">
      <div class="col gap4"><span class="h2">Inventarios · ${esc(nombreRegional() || nombreSede(ses.sedeId))}</span>
        <span class="muted small">${invVer || invComp ? '' : jefe ? 'Toca el que está en curso para entrar a contar, o uno cerrado para ver cómo quedó.' : 'Toca el inventario en curso para entrar a contar.'}</span>
        ${invData.error ? `<span class="error small">${esc(invData.error)}</span>` : ''}</div>
      ${invVer || invComp ? '' : accionesHtml([
        { t: 'Inventario', tono: 'azul', b: [puede('inv_sap') && accBtn('+ Nuevo inventario', 'nuevoInventario()', true)] },
        { t: 'Consultar', tono: 'violeta', b: [puedeComparar && accBtn('Comparar inventarios', 'abrirComparar()')] },
        { t: 'Pantalla', tono: 'gris', b: [accBtn('Actualizar', 'invLista=null; invData=null; pintarApp()')] }])}
      ${vistaInventarios()}
    </div>`;
  }
  function vistaInventarios() {
    if (invLista === null) {
      if (!vistaInventarios.cargando) {
        vistaInventarios.cargando = true;
        llamar('bdInventarios').then(l => { invLista = l; }).catch(e => { invLista = []; toast(e.message, 'error'); })
          .finally(() => { vistaInventarios.cargando = false; if (vista === 'productos' && prodTab === 'inventario' && !invDentro) pintarApp(); });
      }
      return '<div class="cargando">Cargando inventarios…</div>';
    }
    if (invComp) return compararHtml();
    if (invVer) return detalleInventarioCerrado();
    const a = invActualCli();
    return `${resumenInventariosHtml()}
      <section class="card col gap8">
        <span class="h3">Historial de inventarios</span>
        <div id="invsLista">${listaInventarios(a)}</div>
      </section>`;
  }
  // Números de cada inventario: los del cerrado salen de su foto; los del que está en curso, en vivo
  function numsInv(x) {
    if (x.estado === 'ABIERTO') {
      const d = datosInvRc(), cont = d.filter(f => f.contado);
      return { productos: d.filter(f => f.sapTotal || f.plantaRc || f.contado).length, contados: cont.length, conDif: d.filter(f => f.difRc && (f.sap || f.plantaRc)).length,
        conDifCont: cont.filter(f => f.difRc && (f.sap || f.plantaRc)).length };
    }
    const r = x.resumen || {};
    // conDifCont (contados con diferencia) se guarda desde esta versión; en los cerrados antes, la exactitud sale en —
    return { productos: r.productos, contados: r.contados, conDif: r.conDif, conDifCont: r.conDifCont };
  }
  const exactitudInv = n => (n.contados && n.conDifCont !== undefined ? Math.max(0, n.contados - n.conDifCont) / n.contados : null);
  const pctN = v => (v === null || v === undefined ? '—' : (v * 100).toLocaleString('es-CO', { maximumFractionDigits: 1 }) + '%');
  // Arriba de la lista: cuántos se han hecho, cómo va el de ahora y la exactitud de los últimos (gráfico)
  function resumenInventariosHtml() {
    const cerrados = invLista.filter(x => x.estado !== 'ABIERTO'), ab = invLista.find(x => x.estado === 'ABIERTO');
    const ex = cerrados.map(x => ({ x, e: exactitudInv(numsInv(x)) })).filter(y => y.e !== null);
    const prom = ex.length ? ex.reduce((a, y) => a + y.e, 0) / ex.length : null;
    const nA = ab ? numsInv(ab) : null;
    const ult = ex.slice(0, 8).reverse();
    return `<section class="card col gap12">
      <div class="kpis">
        <div class="kpi"><span class="muted small">Inventarios cerrados</span><span class="kpi-v">${cerrados.length}</span></div>
        <div class="kpi"><span class="muted small">En curso ${ayudaHtml('Productos contados del que está abierto, sobre los productos que tiene (SAP, plano o contados).')}</span>
          <span class="kpi-v">${nA ? `${nA.contados} <small class="muted">de ${nA.productos}</small>` : '—'}</span></div>
        <div class="kpi"><span class="muted small">Exactitud promedio ${ayudaHtml('De los productos contados, cuántos quedaron sin diferencia con SAP. Promedio de los inventarios cerrados.')}</span><span class="kpi-v">${pctN(prom)}</span></div>
      </div>
      ${ult.length ? `<div class="col gap4"><span class="small muted">Exactitud de los últimos inventarios cerrados</span>
        <div class="inv-barras" role="img" aria-label="Exactitud por inventario">${ult.map(y => `<div class="inv-bar" title="${esc(y.x.nombre)}: ${pctN(y.e)}">
          <span class="inv-bar-v">${pctN(y.e)}</span><div class="inv-bar-p"><i style="height:${Math.max(2, y.e * 100).toFixed(1)}%"></i></div>
          <span class="inv-bar-n">${esc(fCorta(y.x.fecha))}</span></div>`).join('')}</div></div>` : ''}
    </section>`;
  }
  function listaInventarios(a) {
    if (!invLista.length) return '<p class="muted small">Todavía no hay inventarios.</p>';
    const pg = paginar('invs', invLista, () => { if ($('invsLista')) $('invsLista').innerHTML = listaInventarios(invActualCli()); });
    return `<div class="tabla-wrap"><table class="tabla cic-lista">
      <thead><tr><th>Nombre</th><th>Fecha</th><th class="num">Productos</th><th>Contados</th><th class="num">Con diferencia</th><th class="num">Exactitud</th><th>Estado</th><th>Lo creó</th><th>Lo cerró</th><th aria-label="Acciones"></th></tr></thead>
      <tbody>${pg.filas.map(x => {
        const abierto = x.estado === 'ABIERTO', n = numsInv(x), pc = n.productos ? Math.round((n.contados || 0) * 100 / n.productos) : 0;
        return `<tr onclick="${abierto ? 'entrarInventario()' : `verInventario('${x.id}')`}">
          <td><b>${esc(x.nombre || 'Inventario')}</b></td>
          <td class="nowrap">${fCorta(x.fecha)}</td>
          <td class="num">${n.productos === undefined ? '—' : n.productos}</td>
          <td>${n.contados === undefined ? '—' : `<span class="cic-avance"><span class="us-barra-p"><i style="width:${pc}%"></i></span>${n.contados}</span>`}</td>
          <td class="num ${n.conDif ? 'txt-naranja' : ''}">${n.conDif === undefined ? '—' : n.conDif}</td>
          <td class="num"><b>${pctN(exactitudInv(n))}</b></td>
          <td>${abierto ? '<span class="tag amar">En curso</span>' : '<span class="tag">Cerrado</span>'}</td>
          <td class="muted small">${esc(x.creadoPor || '—')}</td>
          <td class="muted small">${x.cerrado ? `${esc(x.cerradoPor || '—')} · ${fechaHora(x.cerrado)}` : '—'}</td>
          <td class="nowrap">${puede('inv_nombre') ? `<button class="ec-btn" onclick="event.stopPropagation(); renombrarInventario(${invLista.indexOf(x)})" title="Cambiar el nombre" aria-label="Cambiar el nombre de ${esc(x.nombre || 'Inventario')}">✎</button>` : ''}</td></tr>`;
      }).join('')}</tbody></table></div>${pg.barra}`;
  }

  /* ----- Comparar dos inventarios: qué había en uno y qué hay en el otro, producto por producto ----- */
  let invComp = null;   // { a, b, fa, fb, q, ver: '' | 'cambio' | 'soloA' | 'soloB' }
  function abrirComparar() {
    const l = invLista.filter(x => x.estado !== 'ABIERTO');
    const ab = invLista.find(x => x.estado === 'ABIERTO');
    invComp = { a: l[0] ? l[0].id : '', b: ab ? 'actual' : (l[1] ? l[0].id : ''), fa: null, fb: null, q: '', ver: '' };
    if (!ab && l[1]) { invComp.a = l[1].id; invComp.b = l[0].id; }
    pagInicio('invc'); cargarComparar(); pintarApp(); window.scrollTo(0, 0);
  }
  function fotoDe(id) {
    if (id === 'actual') return Promise.resolve(fotoInventario().foto);
    return llamar('bdInventario', id).then(d => d.foto || { filas: [] });
  }
  function cargarComparar() {
    const c = invComp; if (!c) return;
    c.fa = null; c.fb = null;
    Promise.all([fotoDe(c.a), fotoDe(c.b)]).then(([fa, fb]) => { if (invComp === c) { c.fa = fa; c.fb = fb; pintarApp(); } })
      .catch(e => { toast(e.message, 'error'); invComp = null; pintarApp(); });
  }
  function nombreInvComp(id) { if (id === 'actual') return (invActualCli().nombre || 'En curso') + ' (en curso)'; const x = invLista.find(y => y.id === id); return x ? x.nombre : '—'; }
  function filasComparar() {
    const c = invComp, m = {};
    (c.fa.filas || []).forEach(f => { m[f.c] = { c: f.c, n: f.n, a: f }; });
    (c.fb.filas || []).forEach(f => { (m[f.c] = m[f.c] || { c: f.c, n: f.n }).b = f; if (!m[f.c].n) m[f.c].n = f.n; });
    return Object.values(m).map(x => Object.assign(x, { ta: x.a ? x.a.t : null, tb: x.b ? x.b.t : null, cambio: +((x.b ? x.b.t : 0) - (x.a ? x.a.t : 0)).toFixed(3) }));
  }
  function compararHtml() {
    const c = invComp;
    const ops = [...(invLista.some(x => x.estado === 'ABIERTO') ? [['actual', nombreInvComp('actual')]] : []), ...invLista.filter(x => x.estado !== 'ABIERTO').map(x => [x.id, `${x.nombre} · ${fCorta(x.fecha)}`])];
    const sel = (k, v) => `<select class="campo" id="icmp${k}" onchange="invComp.${k}=this.value; pagInicio('invc'); cargarComparar(); pintarApp()">${ops.map(([id, t]) => `<option value="${esc(id)}" ${id === v ? 'selected' : ''}>${esc(t)}</option>`).join('')}</select>`;
    let cuerpo = '<div class="cargando">Cargando los dos inventarios…</div>';
    if (c.fa && c.fb) {
      const l = filasComparar(), suma = (k, w) => l.reduce((t, x) => t + (x[w] ? Number(x[w][k]) || 0 : 0), 0);
      const kp = (t, va, vb, fmt) => `<div class="kpi"><span class="muted small">${t}</span><span class="kpi-v cmp-v"><span>${fmt(va)}</span><span class="muted">→</span><span>${fmt(vb)}</span></span></div>`;
      const cont = w => l.filter(x => x[w] && x[w].k).length, dif = w => l.filter(x => x[w] && x[w].d && (x[w].s || x[w].t)).length;
      cuerpo = `<div class="kpis cmp-kpis">
          ${kp('Productos', l.filter(x => x.a).length, l.filter(x => x.b).length, v => v)}
          ${kp('Contados', cont('a'), cont('b'), v => v)}
          ${kp('Total físico (und)', suma('t', 'a'), suma('t', 'b'), nInv)}
          ${kp('Con diferencia', dif('a'), dif('b'), v => v)}
        </div>
        <div class="inv-filtros">
          <div class="inv-buscar"><label class="lbl" for="icmpQ">Buscar</label>
            <input id="icmpQ" class="campo" placeholder="Código o nombre" value="${esc(c.q)}" autocomplete="off" oninput="invComp.q=this.value; pagInicio('invc'); $('icmpTabla').innerHTML = tablaComparar()"></div>
          <div class="inv-estado"><span class="lbl">Mostrar</span>
            <div class="seg inv-seg" role="group" aria-label="Mostrar">${[['', 'Todos'], ['cambio', 'Cambiaron'], ['soloA', 'Solo en A'], ['soloB', 'Solo en B']].map(([k, t]) =>
              `<button class="${c.ver === k ? 'on' : ''}" onclick="invComp.ver='${k}'; pagInicio('invc'); $('icmpTabla').innerHTML = tablaComparar(); this.parentNode.querySelectorAll('button').forEach(b => b.classList.toggle('on', b === this))">${t}</button>`).join('')}</div></div>
        </div>
        <div id="icmpTabla">${tablaComparar()}</div>`;
    }
    return `<section class="card col gap12">
      <div class="fila-sb wrap-f gap8"><span class="h2">Comparar inventarios ${ayudaHtml('Escoge dos inventarios y mira, producto por producto, cuánto se encontró en cada uno (total físico = picking + aéreo + calidad + bloqueado) y cómo cambió.')}</span>
        ${accBtn('← Volver a la lista', 'invComp=null; pintarApp()')}</div>
      <div class="dos"><div><label class="lbl" for="icmpa">Inventario A</label>${sel('a', c.a)}</div><div><label class="lbl" for="icmpb">Inventario B</label>${sel('b', c.b)}</div></div>
      ${cuerpo}
    </section>`;
  }
  function tablaComparar() {
    const c = invComp, pal = sinTilde(c.q.trim()).split(/\s+/).filter(Boolean);
    const l = filasComparar().filter(x => (!c.ver || (c.ver === 'cambio' ? x.a && x.b && x.cambio : c.ver === 'soloA' ? x.a && !x.b : x.b && !x.a))
      && (!pal.length || pal.every(w => sinTilde(`${x.c} ${x.n}`).includes(w)))).sort((x, y) => Math.abs(y.cambio) - Math.abs(x.cambio));
    if (!l.length) return '<p class="muted small">No hay productos con ese filtro.</p>';
    const pg = paginar('invc', l, () => { if ($('icmpTabla')) $('icmpTabla').innerHTML = tablaComparar(); });
    const v = x => (x === null ? '<span class="muted">—</span>' : nInv(x));
    const d = (f) => (!f ? '<span class="muted">—</span>' : `<span class="${f.d < 0 ? 'txt-rojo' : f.d > 0 ? 'txt-verde' : ''}">${f.d > 0 ? '+' : ''}${nInv(f.d)}</span>`);
    return `<div class="tabla-wrap"><table class="tabla">
      <thead><tr><th>Código</th><th>Producto</th><th class="num">Físico A</th><th class="num">Físico B</th><th class="num">Cambio</th><th class="num">Dif. SAP A</th><th class="num">Dif. SAP B</th></tr></thead>
      <tbody>${pg.filas.map(x => `<tr><td class="nowrap"><b>${esc(x.c)}</b></td><td>${esc(x.n || '')}</td><td class="num">${v(x.ta)}</td><td class="num">${v(x.tb)}</td>
        <td class="num"><b class="${x.cambio < 0 ? 'txt-rojo' : x.cambio > 0 ? 'txt-verde' : ''}">${x.cambio > 0 ? '+' : ''}${nInv(x.cambio)}</b></td><td class="num">${d(x.a)}</td><td class="num">${d(x.b)}</td></tr>`).join('')}</tbody></table></div>${pg.barra}
      <span class="muted small">A = ${esc(nombreInvComp(c.a))} · B = ${esc(nombreInvComp(c.b))}. Ordenado por el cambio más grande.</span>`;
  }

  function nuevoInventario() {
    if (sinPermiso('inv_sap')) return;
    const f = hoyISO();
    invNuevo = { nombre: 'Inventario ' + fCorta(f), fecha: f, sap: 'si' };
    abrirModal(formNuevoInventario());
    const c = $('inNombre'); if (c) { c.focus(); c.select(); }
  }
  function formNuevoInventario() {
    const n = invNuevo, a = invActualCli();
    return `<div class="fila-sb"><span class="h2">Nuevo inventario</span><button class="icono icono-claro" aria-label="Cerrar" onclick="invNuevo=null; cerrarModal()">${ICONOS.cerrar}</button></div>
      <div class="col gap12 mt12">
      ${a.estado === 'ABIERTO' && a.nombre ? `<span class="muted small">Al crearlo, <b>${esc(a.nombre)}</b> se cierra y queda guardado como está (SAP, picking, aéreo, calidad, bloqueado y diferencias).</span>` : ''}
      <div class="dos">
        <div><label class="lbl" for="inNombre">Nombre</label>
          <input id="inNombre" class="campo" autocomplete="off" maxlength="80" value="${esc(n.nombre)}" oninput="invNuevo.nombre=this.value"></div>
        <div><label class="lbl" for="inFecha">Fecha</label>
          <input id="inFecha" class="campo" type="date" value="${esc(n.fecha)}" onchange="invNuevo.fecha=this.value"></div>
      </div>
      <div class="col gap8"><span class="lbl">¿Tienes el Excel de SAP de este inventario?</span>
        <div class="seg" role="group" aria-label="Excel de SAP">${[['si', 'Sí, cargarlo ahora'], ['no', 'No, empezar a contar']].map(([k, t]) =>
          `<button class="${n.sap === k ? 'on' : ''}" onclick="invNuevo.sap='${k}'; this.parentNode.querySelectorAll('button').forEach(b => b.classList.toggle('on', b === this))">${t}</button>`).join('')}</div>
        <span class="muted small">Si no lo tienes, lo puedes cargar después con «Excel de SAP» dentro del inventario.</span></div>
      <p id="inErr" class="error" hidden></p>
      <div class="dos"><button class="btn btn-sec btn-xl" onclick="invNuevo=null; cerrarModal()">Cancelar</button>
        <button id="inOk" class="btn btn-pri btn-xl" onclick="crearInventario(this)">Crear inventario</button></div></div>`;
  }
  // La foto del inventario como quedó: lo mismo que se ve en la tabla contra SAP
  function fotoInventario() {
    const red = n => +Number(n || 0).toFixed(3);
    const SD = sedesInv();
    const filas = datosInvRc().filter(f => f.sapTotal || f.plantaRc || f.contado).map(f => {
      const x = { c: f.cod, n: f.p ? f.p.nombre : '', s: red(f.sapTotal), pk: red(f.picking), ae: red(f.aereo), ca: red(f.calidad), bl: red(f.bloqueado),
        t: red(f.plantaRc), d: red(f.difRc), k: f.contado ? 1 : 0, alm: f.almacenes.map(z => almCorto(z.key)).filter(Boolean).join(' / ') };
      if (f.rc) x.cf = red(f.rc.pk);   // confirmación (picking del reconteo)
      if (f.sap) x.sap = [red(f.sap.inventario), red(f.sap.calidad), red(f.sap.bloqueado)];
      return x;
    });
    const resumen = { productos: filas.length, contados: filas.filter(x => x.k).length, conDif: filas.filter(x => x.d && (x.s || x.t)).length,
      conDifCont: filas.filter(x => x.k && x.d && (x.s || x.t)).length, sede: nombreSede(ses.sedeId) };
    return { foto: { sedeId: ses.sedeId, sede: nombreSede(ses.sedeId), carga: invData.carga || null, sedes: SD.map(s => ({ id: s.id, nombre: s.nombre })), filas }, resumen };
  }
  async function crearInventario(b) {
    const n = invNuevo, err = t => { const e = $('inErr'); e.textContent = t; e.hidden = false; };
    if (!String(n.nombre || '').trim()) return err('Escribe el nombre del inventario.');
    if (!n.fecha) return err('Escoge la fecha.');
    b.disabled = true; b.textContent = 'Guardando…';
    try {
      invData = await llamar('bdInventarioGeneral', ses.sedeId);   // lo más reciente antes de cerrar
      try { invRcs = await reconfsInventario(); } catch (e) { invRcs = invRcs || []; }
      const a = invData.inventario || {};
      const { foto, resumen } = fotoInventario();
      const cerrar = a.estado !== 'ABIERTO' ? null : a.id ? { id: a.id } : a.virtual && a.primer ? { nombre: a.nombre, fecha: a.fecha, desde: a.primer } : null;
      await llamar('bdCrearInventario', { sedeId: ses.sedeId, nombre: n.nombre.trim(), fecha: n.fecha, usuario: ses.nombre, usuarioId: ses.id, cerrar, foto: cerrar ? foto : null, resumen: cerrar ? resumen : null });
      const conSap = n.sap === 'si';
      invNuevo = null; cerrarModal(); invLista = null; invData = null; invDentro = true; invSub = ''; pagInicio('invs');
      pitido(); toast(conSap ? 'Inventario creado. Ahora escoge el Excel de SAP.' : 'Inventario creado. Ya pueden empezar a contar.', 'ok');
      pintarApp(); window.scrollTo(0, 0);
      if (conSap && puede('inv_sap')) abrirCargaSap();
    } catch (e) { b.disabled = false; b.textContent = 'Crear inventario'; err(e.message); }
  }

  // Cambiar el nombre: i = posición en la lista, 'actual' = el que está en curso, 'ver' = el cerrado que se está viendo
  function renombrarInventario(i) {
    if (sinPermiso('inv_nombre')) return;
    const x = i === 'actual' ? invActualCli() : i === 'ver' ? invVer && invVer.d : invLista && invLista[i];
    if (!x) return;
    renombrarInventario.x = x;
    abrirModal(`<div class="fila-sb"><span class="h2">Cambiar nombre</span>${btnCerrar()}</div>
      <label class="lbl mt12" for="rnNombre">Nombre del inventario</label>
      <input id="rnNombre" class="campo" autocomplete="off" maxlength="80" value="${esc(x.nombre || '')}" onkeydown="if (event.key === 'Enter') guardarNombreInventario()">
      <span class="muted small mt8">Solo cambia el nombre. Lo contado y lo de SAP quedan igual.</span>
      <p id="rnErr" class="error" hidden></p>
      <div class="dos mt16"><button class="btn btn-sec btn-xl" onclick="cerrarModal()">Cancelar</button>
        <button id="rnOk" class="btn btn-pri btn-xl" onclick="guardarNombreInventario()">Guardar</button></div>`);
    const c = $('rnNombre'); c.focus(); c.select();
  }
  function guardarNombreInventario() {
    const x = renombrarInventario.x, b = $('rnOk'), nombre = $('rnNombre').value.trim();
    const err = t => { $('rnErr').textContent = t; $('rnErr').hidden = false; };
    if (!nombre) return err('Escribe el nombre del inventario.');
    b.disabled = true; b.textContent = 'Guardando…';
    const d = x.id ? { id: x.id } : x.virtual && x.primer ? { virtual: { fecha: x.fecha, desde: x.primer } } : null;
    if (!d) { b.disabled = false; b.textContent = 'Guardar'; return err('Este inventario no tiene conteos todavía. Crea uno con «+ Nuevo inventario».'); }
    llamar('bdRenombrarInventario', Object.assign(d, { nombre, sedeId: ses.sedeId, usuario: ses.nombre })).then(() => {
      cerrarModal(); toast('Nombre guardado', 'ok');
      if (invVer && invVer.d && invVer.d.id === x.id) invVer.d.nombre = nombre;
      invLista = null; invData = null;
      pintarApp();
    }).catch(e => { b.disabled = false; b.textContent = 'Guardar'; err(e.message); });
  }

  function entrarInventario() { invDentro = true; invVer = null; invNuevo = null; invComp = null; invSub = ''; pintarApp(); window.scrollTo(0, 0); }
  // Cerrar el inventario en curso (sin crear otro): queda guardado con su foto y ya no se cuenta en él
  async function cerrarInventario(b) {
    if (b.dataset.ok !== '1') { b.dataset.ok = '1'; b.textContent = '¿Seguro? Toca otra vez para cerrarlo'; return; }
    b.disabled = true; b.textContent = 'Cerrando…';
    try {
      invData = await llamar('bdInventarioGeneral', ses.sedeId);
      try { invRcs = await reconfsInventario(); } catch (e) { invRcs = invRcs || []; }   // la foto va con el reconteo
      const a = invData.inventario || {};
      const cerrar = a.estado !== 'ABIERTO' ? null : a.id ? { id: a.id } : a.virtual && a.primer ? { nombre: a.nombre, fecha: a.fecha, desde: a.primer } : null;
      if (!cerrar) throw new Error('Este inventario no tiene conteos todavía: no hay nada que cerrar.');
      const { foto, resumen } = fotoInventario();
      await llamar('bdCerrarInventario', { cerrar, sedeId: ses.sedeId, usuario: ses.nombre, foto, resumen });
      invDentro = false; invSub = ''; invLista = null; invData = null;
      pitido(); toast('Inventario cerrado. Quedó guardado en la lista.', 'ok');
      pintarApp(); window.scrollTo(0, 0);
    } catch (e) { b.disabled = false; b.dataset.ok = ''; b.textContent = 'Cerrar inventario'; toast(e.message, 'error'); }
  }
  function reabrirInventario(id, b) {
    if (b.dataset.ok !== '1') { b.dataset.ok = '1'; b.textContent = '¿Seguro? Toca otra vez'; return; }
    b.disabled = true;
    llamar('bdReabrirInventario', { id }).then(() => {
      invVer = null; invLista = null; invData = null; invDentro = true; invSub = '';
      toast('El inventario quedó abierto otra vez.', 'ok'); pintarApp();
    }).catch(e => { b.disabled = false; b.dataset.ok = ''; b.textContent = 'Volver a abrir'; toast(e.message, 'error'); });
  }
  function verInventario(id) {
    invVer = { id, d: null }; invVerF.q = ''; invVerF.dif = false; pagInicio('invv');
    llamar('bdInventario', id).then(d => { if (invVer && invVer.id === id) { invVer.d = d; pintarApp(); } })
      .catch(e => { invVer = null; toast(e.message, 'error'); pintarApp(); });
    pintarApp(); window.scrollTo(0, 0);
  }
  function detalleInventarioCerrado() {
    const x = invVer.d;
    if (!x) return '<div class="cargando">Cargando inventario…</div>';
    const fo = x.foto || { filas: [] }, r = x.resumen || {};
    return `<section class="card col gap12">
      <div class="fila-sb wrap-f gap8">
        <div class="col gap4"><span class="h2 fila gap8 wrap-f">${esc(x.nombre)} <span class="tag">Cerrado</span>${puede('inv_nombre') ? `<button class="ec-btn" onclick="renombrarInventario('ver')" title="Cambiar el nombre" aria-label="Cambiar el nombre del inventario">✎</button>` : ''}</span>
          <span class="muted small">${fCorta(x.fecha)}${fo.sede ? ' · ' + esc(fo.sede) : ''} · Lo cerró ${esc(x.cerradoPor || '—')} el ${fechaHora(x.cerrado)}${fo.carga ? ` · SAP cargado el ${fechaHora(fo.carga.fecha)}` : ''}</span></div>
        <span class="fila gap8 wrap-f">
          ${puede('reportes') && fo.filas.length ? '<button class="btn btn-sec" onclick="descargarInventarioCerrado(this)">Descargar Excel de este inventario</button>' : ''}
          ${puede('inv_sap') && invLista && invLista[0] && invLista[0].id === x.id ? `<button class="btn btn-sec" onclick="reabrirInventario('${x.id}', this)">Volver a abrir</button>` : ''}
          <button class="btn btn-sec" onclick="invVer=null; pintarApp()">← Volver a la lista</button></span>
      </div>
      <div class="kpis">
        <div class="kpi"><span class="muted small">Productos</span><span class="kpi-v">${r.productos ?? fo.filas.length}</span></div>
        <div class="kpi"><span class="muted small">Contados</span><span class="kpi-v">${r.contados ?? '—'}</span></div>
        <div class="kpi"><span class="muted small">Con diferencia</span><span class="kpi-v txt-naranja">${r.conDif ?? '—'}</span></div>
      </div>
      ${fo.filas.length ? `<div class="inv-filtros">
        <div class="inv-buscar"><label class="lbl" for="ivQ">Buscar</label>
          <input id="ivQ" class="campo" placeholder="Código o nombre" value="${esc(invVerF.q)}" autocomplete="off"
            oninput="invVerF.q=this.value; pagInicio('invv'); $('ivTabla').innerHTML = tablaInventarioCerrado()"></div>
        <div class="inv-estado"><span class="lbl">Mostrar</span>
          <div class="seg inv-seg" role="group" aria-label="Mostrar">${[[false, 'Todos'], [true, 'Con diferencia']].map(([k, t]) =>
            `<button class="${invVerF.dif === k ? 'on' : ''}" onclick="invVerF.dif=${k}; pagInicio('invv'); $('ivTabla').innerHTML = tablaInventarioCerrado(); this.parentNode.querySelectorAll('button').forEach(b => b.classList.toggle('on', b === this))">${t}</button>`).join('')}</div></div>
      </div>
      <div id="ivTabla">${tablaInventarioCerrado()}</div>` : '<p class="muted small">Este inventario se cerró sin productos.</p>'}
    </section>`;
  }
  function filasInventarioCerrado() {
    const pal = sinTilde(invVerF.q.trim()).split(/\s+/).filter(Boolean);
    return ((invVer.d.foto || {}).filas || []).filter(f => (!invVerF.dif || (f.d && (f.s || f.t))) && (!pal.length || pal.every(w => sinTilde(`${f.c} ${f.n}`).includes(w))));
  }
  function tablaInventarioCerrado() {
    const l = filasInventarioCerrado();
    if (!l.length) return '<p class="muted small">No hay productos con ese filtro.</p>';
    const pg = paginar('invv', l, () => { if ($('ivTabla')) $('ivTabla').innerHTML = tablaInventarioCerrado(); });
    return `<div class="tabla-wrap"><table class="tabla">
      <thead><tr><th>Código</th><th>Producto</th><th>Almacén</th><th class="num">Total SAP</th><th class="num">Picking</th><th class="num">Confirmación</th><th class="num">Aéreo</th>
        <th class="num">Calidad</th><th class="num">Bloqueado</th><th class="num">Total planta</th><th class="num">Diferencia</th></tr></thead>
      <tbody>${pg.filas.map(f => `<tr><td class="nowrap"><b>${esc(f.c)}</b></td><td>${esc(f.n)}</td><td class="nowrap">${esc(f.alm || '—')}</td>
        <td class="num">${nInv(f.s)}</td><td class="num">${nInv(f.pk)}</td><td class="num">${f.cf === undefined ? '—' : nInv(f.cf)}</td><td class="num">${nInv(f.ae)}</td><td class="num">${nInv(f.ca)}</td><td class="num">${nInv(f.bl)}</td>
        <td class="num"><b>${nInv(f.t)}</b></td><td class="num ${f.d < 0 ? 'txt-rojo' : f.d > 0 ? 'txt-verde' : ''}"><b>${f.d > 0 ? '+' : ''}${nInv(f.d)}</b></td></tr>`).join('')}</tbody></table></div>${pg.barra}`;
  }
  async function descargarInventarioCerrado(b) {
    const x = invVer && invVer.d;
    if (!x) return;
    b.disabled = true;
    try {
      if (!window.JSZip) await cargarScript(JSZIP_URL);
      const C = [['COD ATL', 1, 'c'], ['TEXTO BREVE DE MATERIAL', 1, 'n'], ['ALMACEN', 1, 'alm'], ['LIBRE UTILIZACIÓN', 1, 0], ['CALIDAD', 1, 1], ['BLOQUEO', 1, 2],
        ['TOTAL SAP', 1, 's'], ['PICKING', 2, 'pk'], ['CONFIRMACION', 3, 'cf'], ['AEREO', 2, 'ae'], ['CALIDAD', 2, 'ca'], ['BLOQUEO', 2, 'bl'], ['TOTAL FISICO', 4, 't'], ['DIFERENCIA', 4, 'd']];
      const hoja = [C.map(([h, s]) => ({ v: h, s }))];
      x.foto.filas.forEach(f => hoja.push(C.map(([, , k]) => {
        const v = typeof k === 'number' ? (f.sap ? f.sap[k] : 0) : f[k];
        if (k === 'c') return { v: /^\d+$/.test(String(v)) ? Number(v) : v, s: 5 };
        if (k === 'alm') return { v: /^\d+$/.test(String(v || '')) ? Number(v) : v || '', s: 5 };
        if (k === 'n') return { v: v || '', s: 5 };
        if (k === 'cf' && v === undefined) return { v: '', s: 5 };
        const n = Number(v) || 0;
        return { v: n, s: k === 'd' ? (n < 0 ? 7 : n > 0 ? 8 : 6) : 6 };
      })));
      const blob = await xlsxConEstilo('INVENTARIO', hoja, [10, 46, 12, 12, 11, 11, 12, 12, 13, 12, 12, 12, 13, 13]);
      entregarArchivo(blob, `${x.nombre} ${x.fecha}.xlsx`, 'Excel del inventario');
    } catch (e) { toast('No se pudo armar el Excel: ' + e.message, 'error'); }
    b.disabled = false;
  }

  /* ----- Reconteos de Inventario (van en la pestaña Inventario, aparte de los cíclicos) ----- */
  function vistaRcInv() {
    if (!asegurarCiclicos()) return '<div class="cargando">Cargando reconteos…</div>';
    if (cicSel && !esRcInv(cicSel_())) { cicSel = null; cicData = null; }
    if (cicNuevo && !(cicNuevo.tipo === 'RECONFIRMACION' && cicNuevo.origenTipo === 'INVENTARIO')) cicNuevo = null;
    if (cicSel) return detalleCiclico();
    const ab = (cicLista || []).filter(c => esRcInv(c) && c.estado === 'ABIERTO').length;
    return `${cicNuevo ? formNuevoCiclico() : ''}
      ${tableroReconteosHtml((cicLista || []).filter(c => esRcInv(c) && c.estado === 'ABIERTO'))}
      <section class="card col gap8">
        <div class="fila-sb wrap-f gap8"><span class="h3">Reconteos de inventario <span class="muted small">(${ab} abierto${ab === 1 ? '' : 's'})</span></span>
          <span class="fila gap8 wrap-f">
            ${puede('ciclico_asignar') && !cicNuevo ? '<button class="btn btn-pri btn-mini" onclick="pedirReconfirmacion(\'inv\')">Pedir reconteo</button>' : ''}
            <div class="seg seg-c" role="group" aria-label="Ver reconteos">${[['ABIERTO', 'Abiertos'], ['CERRADO', 'Cerrados'], ['', 'Todos']].map(([k, t]) =>
              `<button class="${cicF.ver === k ? 'on' : ''}" onclick="cicF.ver='${k}'; pagInicio('rci'); pintarApp()">${t}</button>`).join('')}</div></span></div>
        <span class="muted small">Vuelven a contar los productos que salieron con diferencia contra SAP: el picking y el aéreo estiba por estiba. Toca uno para abrirlo.</span>
        <div id="rcInvLista">${listaRcInv()}</div>
      </section>`;
  }
  // Tablero en vivo de los reconteos abiertos: cuánto va cada uno, quién está recontando y lo último que contaron
  const haceTxt = f => { const m = Math.max(0, Math.round((Date.now() - new Date(f).getTime()) / 60000)); return m < 1 ? 'ahora' : m < 60 ? `hace ${m} min` : m < 1440 ? `hace ${Math.round(m / 60)} h` : fechaHora(f); };
  function tableroReconteosHtml(l) {
    if (!l.length) return '';
    const tot = l.reduce((a, c) => a + c.codigos.length, 0), hechos = l.reduce((a, c) => a + Math.min(c.contados || 0, c.codigos.length), 0);
    const feed = [].concat(...l.map(c => (c.actividad || []).map(x => Object.assign({ rc: c }, x)))).sort((a, b) => String(b.fecha).localeCompare(String(a.fecha))).slice(0, 10);
    const activos = new Set(feed.filter(x => Date.now() - new Date(x.fecha).getTime() < 30 * 60000).map(x => x.usuario));
    return `<section class="card col gap12 rct">
      <div class="fila-sb wrap-f gap8"><span class="h3">Reconteos en curso ${ayudaHtml('Se actualiza solo: cada vez que alguien guarda un reconteo aparece aquí. Toca un reconteo para abrirlo.')}</span>
        <span class="rct-vivo ${vivoOk ? 'on' : ''}">${vivoOk ? '● En vivo' : '○ Se actualiza cada 20 s'}</span></div>
      <div class="kpis">
        <div class="kpi"><span class="muted small">Abiertos</span><span class="kpi-v">${l.length}</span></div>
        <div class="kpi"><span class="muted small">Recontados</span><span class="kpi-v">${hechos} <small class="muted">de ${tot}</small></span></div>
        <div class="kpi"><span class="muted small">Personas recontando ${ayudaHtml('Quienes han guardado algo en los últimos 30 minutos.')}</span><span class="kpi-v">${activos.size}</span></div>
      </div>
      <div class="rct-grid">${l.map(c => {
        const n = c.codigos.length, h = Math.min(c.contados || 0, n), pc = n ? Math.round(h * 100 / n) : 0, u = (c.actividad || [])[0];
        const per = Object.entries(c.personas || {}).sort((a, b) => b[1] - a[1]);
        return `<button type="button" class="rct-tile" onclick="abrirCiclico('${c.id}')">
          <span class="fila-sb gap8"><b>${esc(tituloCic(c))}</b><b class="rct-pct">${pc}%</b></span>
          <span class="us-barra-p rct-barra"><i style="width:${pc}%"></i></span>
          <span class="small">${h} de ${n} productos${u ? ` · <span class="muted">${haceTxt(u.fecha)}</span>` : ' · <span class="muted">nadie ha empezado</span>'}</span>
          ${per.length ? `<span class="rct-per">${per.map(([p, k]) => `<span class="rct-chip">${esc(p)} · ${k}</span>`).join('')}</span>` : ''}
        </button>`;
      }).join('')}</div>
      ${feed.length ? `<div class="col gap4"><span class="lbl" style="margin:0">Lo último que recontaron</span>
        <div class="rct-feed">${feed.map(x => { const p = prodDe(x.codigo); return `<div class="rct-ev"><span class="rct-hora">${haceTxt(x.fecha)}</span>
          <span class="rct-txt"><b>${esc(x.usuario)}</b> · ${esc(x.codigo)} ${esc(p ? p.nombre : '')} · <b>${nInv(x.cantidad)}</b>${x.tipo && x.tipo !== 'PICKING' ? ' ' + esc(x.tipo.toLowerCase()) : ''}</span>
          <span class="muted small rct-de">${esc(tituloCic(x.rc))}</span></div>`; }).join('')}</div></div>` : ''}
    </section>`;
  }
  function listaRcInv() {
    const l = (cicLista || []).filter(c => esRcInv(c) && (!cicF.ver || c.estado === cicF.ver));
    return tablaCics(l, 'rci', () => { if ($('rcInvLista')) $('rcInvLista').innerHTML = listaRcInv(); },
      cicF.ver === 'ABIERTO' ? (puede('ciclico_asignar') ? 'No hay reconteos abiertos. Pide uno con «Pedir reconteo».' : 'No hay reconteos abiertos por ahora.') : 'No hay reconteos aquí.');
  }

  /* ----- Reconteo de inventario: la lista de sus productos para contar (solo el picking).
     Código, producto, almacén, pasillo (donde está su picking en el plano) y, si tiene aéreo, el rack donde está.
     Se filtra por pasillo o por rack (lo que les toque contar). Cada cantidad se guarda sola al pasar al siguiente;
     «Finalizar» guarda lo que falte y dice Listo. ----- */
  let rcRacksCierre = false;
  const rcc = { sede: '', pas: '', racks: [], q: '', listo: '', eanPid: '' };   // racks: los que se marcaron (varios)
  const rcGuardando = new Map();   // sede|código → lo que se está guardando
  const rcSede = () => (rcc.sede && ini.sedes.some(x => x.id === rcc.sede)) ? rcc.sede : ses.sedeId;
  // Plano de cualquier sede (lugares, pasillos del editor, filas y códigos), guardado 2 minutos
  const planoSedeC = {};
  function lugaresDeSede(d) {
    const esp = {}, pasDeRack = {}, rackNom = {};
    if (d) {
      (d.espacios || []).forEach(([r, p, n, l]) => { esp[`${r}-P${String(p).padStart(3, '0')}-${Number(n) === 0 ? 'PK' : n}${l}`] = { r, p: Number(p), n: Number(n), l }; });
      (d.pasillos || []).forEach(pa => (pa.filas || []).forEach(id => { pasDeRack[id] = pa.nombre; }));
      (d.racks || []).forEach(r => { rackNom[r.id] = r.nombre; });
    }
    return { esp, pasDeRack, rackNom, codigos: (d && d.codigos) || {}, lineas: (d && d.lineas) || [] };
  }
  function asegurarPlanoSede(sid) {
    const x = planoSedeC[sid];
    if (x && x.d && Date.now() - x.t < 120000) return x.d;
    if (!x || !x.pidiendo) {
      planoSedeC[sid] = Object.assign({}, x, { pidiendo: true });
      llamar('bdSede', sid).then(d => { planoSedeC[sid] = { d: lugaresDeSede(d), t: Date.now() }; })
        .catch(() => { planoSedeC[sid] = { d: lugaresDeSede(null), t: Date.now() }; })
        .finally(() => { if (vista === 'productos' && cicSel) pintarApp(); });
    }
    return x && x.d ? x.d : null;   // mientras se vuelve a pedir, sirve el que había
  }
  // Las filas del reconteo en una sede. null mientras se carga lo de esa sede.
  function rcFilas(sid) {
    sid = sid || rcSede();
    const L = asegurarPlanoSede(sid), ubOk = asegurarUbicSede(sid), almOk = asegurarAlmProd();
    if (!L || !ubOk || !almOk) return null;
    const S = cpScope(), c = S.cic, g = sid === ses.sedeId ? codGen() : null;
    const num_ = (a, b) => String(a).localeCompare(String(b), 'es', { numeric: true });
    const porProd = {};
    L.lineas.forEach(l => { if (L.esp[l.ubicacionId]) (porProd[l.productoId] = porProd[l.productoId] || []).push(l); });
    return (c.codigos || []).map(cod => {
      const p = prodDe(cod), ls = porProd[cod] || [];
      const pk = ls.filter(l => L.esp[l.ubicacionId].n === 0), ae = ls.filter(l => L.esp[l.ubicacionId].n !== 0);
      // Pasillo: el cargado para esta sede; si no, el del editor del plano donde está (picking y aéreo)
      const cargado = pasCargado(cod, sid);
      const pasL = cargado ? [cargado] : [...new Set(pk.concat(ae).map(l => L.pasDeRack[L.esp[l.ubicacionId].r]).filter(Boolean))].sort(num_);
      // Rack del aéreo: ALMACÉN-RAK del código de la ubicación; si no tiene código, la fila y la posición
      // ubR: por cada rack, la ubicación más baja donde está (para ordenar del 1 al último dentro del rack)
      const ubR = {};
      ae.forEach(l => { const e = L.esp[l.ubicacionId], cd = L.codigos[l.ubicacionId];
        const k = cd ? cd.split('-').slice(0, 2).join('-') : (g && g.porPos[e.r + '|' + e.p]) || `${L.rackNom[e.r] || e.r} P${e.p}`;
        const u = cd || `${k} N${e.n}`;
        if (!(k in ubR) || num_(u, ubR[k]) < 0) ubR[k] = u; });
      const racks = Object.keys(ubR).sort(num_);
      const reg = almsRegDe(cod, sid);
      const almCod = ls.map(l => (L.codigos[l.ubicacionId] || '').split('-')[0]).find(Boolean) || '';
      const cs = S.conteos.filter(k => k.codigo === cod && k.tipo === 'PICKING' && (k.sedeId || c.sedeId) === sid);
      const cont = cs.length ? +cs.reduce((t, k) => t + k.cantidad, 0).toFixed(3) : null;
      const pkDeAe = ae[0] ? Object.keys(L.esp).find(id => { const e = L.esp[id], a2 = L.esp[ae[0].ubicacionId]; return e.n === 0 && e.r === a2.r && e.p === a2.p; }) : '';
      const lugar = (cs[0] && cs[0].ubicacion) || (pk[0] && pk[0].ubicacionId) || pkDeAe || 'PICKING-' + (reg[0] || almCod || '');
      return { cod, p, alm: reg.join(' / ') || almCod, pasL, pas: pasL.join(', '), racks, ubR, cont, lugar };
    }).sort((a, b) => (a.pasL.length ? 0 : 1) - (b.pasL.length ? 0 : 1) || num_(a.pas, b.pas) || num_(a.alm, b.alm) || (a.p ? a.p.nombre : a.cod).localeCompare(b.p ? b.p.nombre : b.cod));
  }
  function rcFiltradas(todas) {
    todas = todas || rcFilas() || [];
    const pal = sinTilde(rcc.q.trim()).split(/\s+/).filter(Boolean);
    const selR = rcc.racks || [];
    const l = todas.filter(f => (!rcc.pas || (rcc.pas === '-' ? !f.pasL.length : f.pasL.includes(rcc.pas))) && (!selR.length || f.racks.some(r => selR.includes(r)))
      && (!pal.length || pal.every(w => sinTilde(`${f.cod} ${f.p ? f.p.codigoNutresa + ' ' + f.p.nombre : ''}`).includes(w))));
    if (!selR.length) return l;
    // Con racks marcados: en orden del primer rack al último y, dentro de cada rack, por ubicación
    const num_ = (a, b) => String(a).localeCompare(String(b), 'es', { numeric: true });
    const clave = f => { const r = f.racks.filter(x => selR.includes(x)).sort(num_)[0]; return [r, f.ubR[r] || '']; };
    return l.map(f => ({ f, k: clave(f) })).sort((a, b) => num_(a.k[0], b.k[0]) || num_(a.k[1], b.k[1]) || num_(a.f.cod, b.f.cod)).map(x => x.f);
  }
  function rcContarHtml() {
    const S = cpScope();
    if (!cpPuedeContar(S)) return '<p class="muted">No tienes permiso para contar. Pídeselo al administrador.</p>';
    const sid = rcSede(), todas = rcFilas(sid);
    const selSede = `<div><label class="lbl" for="rcSede">Sede</label>
          <select id="rcSede" class="campo">${ini.sedes.map(x => `<option value="${esc(x.id)}" ${x.id === sid ? 'selected' : ''}>${esc(x.nombre)}</option>`).join('')}</select></div>`;
    if (!todas) return `<section class="card col gap12 rc-contar"><div class="rc-filtros">${selSede}</div><div class="cargando">Cargando los pasillos y racks de ${esc(nombreSede(sid))}…</div></section>`;
    const num_ = (a, b) => String(a).localeCompare(String(b), 'es', { numeric: true });
    const pasillos = [...new Set(todas.flatMap(f => f.pasL))].sort(num_);
    const racks = [...new Set(todas.flatMap(f => f.racks))].sort(num_);
    if (rcc.pas && rcc.pas !== '-' && !pasillos.includes(rcc.pas)) rcc.pas = '';
    rcc.racks = (rcc.racks || []).filter(r => racks.includes(r));
    return `<section class="card col gap12 rc-contar">
      <div class="col gap4"><span class="h3">Productos para recontar</span>
        <span class="muted small">Escoge la sede y el pasillo o los racks que te tocó contar (puedes marcar varios). Escribe cuánto hay en <b>picking</b> de cada producto: se guarda solo al pasar al siguiente (✓). Cuando termines, toca <b>Finalizar</b>.</span></div>
      <div class="rc-filtros">
        ${selSede}
        <div><label class="lbl" for="rcPas">Pasillo</label>
          <select id="rcPas" class="campo"><option value="">Todos</option>${pasillos.map(x => `<option value="${esc(x)}" ${rcc.pas === x ? 'selected' : ''}>${/^\d+$/.test(x) ? 'Pasillo ' : ''}${esc(x)}</option>`).join('')}
            ${todas.some(f => !f.pasL.length) ? `<option value="-" ${rcc.pas === '-' ? 'selected' : ''}>Sin pasillo</option>` : ''}</select></div>
        <div><span class="lbl" id="rcRackL">Rack (aéreo)</span>
          <details id="rcRacks" class="rc-racks"><summary class="campo" aria-labelledby="rcRackL">${rcRacksTxt()}</summary>
            <div class="rc-racks-lista">
              ${racks.length ? racks.map(r => `<label class="rc-rack-op"><input type="checkbox" value="${esc(r)}" ${rcc.racks.includes(r) ? 'checked' : ''}> ${esc(r)}</label>`).join('')
                : '<span class="muted small">No hay racks de aéreo en este reconteo.</span>'}
              ${racks.length ? '<button type="button" id="rcRacksTodos" class="btn btn-sec">Ver todos</button>' : ''}
            </div></details></div>
        <div class="inv-buscar"><label class="lbl" for="rcQ">Buscar</label>
          <div class="fila gap8"><input id="rcQ" class="campo" style="flex:1;min-width:0" type="search" placeholder="Código, nombre, EAN o rótulo" value="${esc(rcc.q)}" autocomplete="off">
            ${botonCamara('rcQ', 'btn btn-sec btn-cam2')}</div></div>
      </div>
      ${rcc.eanPid ? `<div class="rc-ean">${eanMiniHtml(rcc.eanPid, 'inventario')}</div>` : ''}
      <div id="rcTabla">${rcTablaHtml(todas)}</div>
      <div id="rcListo">${rcc.listo}</div>
      <button id="rcFin" class="btn btn-ent-solido btn-xl" onclick="rcFinalizar()">Finalizar</button>
    </section>`;
  }
  function rcRacksTxt() {
    const r = rcc.racks || [];
    return `<span class="rc-racks-txt">${!r.length ? 'Todos' : r.length === 1 ? esc(r[0]) : `${r.length} racks`}</span>`;
  }
  function rcTablaHtml(todas) {
    const l = rcFiltradas(todas);
    if (!l.length) return '<p class="muted">No hay productos con ese filtro.</p>';
    const hechos = l.filter(f => f.cont !== null).length;
    const pg = paginar('rcc', l, () => rcPintarTabla());
    const pasTxt = f => f.pasL.length ? f.pasL.map(x => (/^\d+$/.test(x) ? 'Pasillo ' : '') + x).join(', ') : '—';
    return `<div id="rcCuenta" class="muted small"><b>${hechos} de ${l.length}</b> contados${l.length - hechos ? ` · ${rcFaltan(l.length - hechos)}` : ' · <b class="txt-verde">todos contados</b>'}</div>
      <div class="tabla-wrap mt8"><table class="tabla rc-tabla"><thead><tr><th>Código</th><th>Producto</th><th>Almacén</th><th>Pasillo</th><th>Rack (aéreo)</th><th class="num">Cantidad contada</th><th><span class="sr">Estado</span></th></tr></thead><tbody>
      ${pg.filas.map(f => `<tr class="${f.cont !== null ? 'rc-hecho' : ''}">
        <td class="mono-c" data-l="Código">${esc(f.cod)}</td><td class="rc-prod" data-l="Producto"><b>${esc(f.p ? f.p.nombre : f.cod)}</b></td>
        <td data-l="Almacén">${esc(f.alm || '—')}</td><td data-l="Pasillo">${esc(pasTxt(f))}</td><td data-l="Rack">${f.racks.length ? esc(f.racks.join(', ')) : '—'}</td>
        <td class="num rc-cant" data-l="Cantidad"><input class="campo rc-in" type="number" inputmode="decimal" min="0" step="any" placeholder="0" data-cod="${esc(f.cod)}"
          value="${f.cont === null ? '' : f.cont}" aria-label="Cantidad contada de ${esc(f.p ? f.p.nombre : f.cod)}"></td>
        <td class="rc-est">${f.cont !== null ? '<span class="txt-verde" title="Guardado">✓</span>' : ''}</td></tr>`).join('')}
      </tbody></table></div>${pg.barra}`;
  }
  /* Escanear en el reconteo: el rótulo (E000123), el EAN o el código del producto. Solo busca el producto en la lista y
     deja el cursor en su cantidad para guardarla enseguida (nada de ubicar ni dar salida). Si el producto no tiene EAN,
     sale «+ Agregar EAN» para escanear el de la caja y guardarlo de una vez. */
  async function rcEscaneado(v, silencio) {
    v = String(v || '').trim();
    if (!v) return;
    let p = null;
    if (/^E\d{4,}$/i.test(v)) {
      try { const e = await llamar('bdEtiqueta', v.toUpperCase()); p = prodDe(e.codigo); }   // solo importa de qué producto es
      catch (err) { return toast(err.message, 'error'); }
    } else p = buscarProducto(v) || buscarProducto(v.replace(/\s+/g, ''));
    if (!p) {
      if (pareceEan(v)) return eanNuevoEn(String(v).replace(/\s+/g, ''), 'rc');   // EAN que no está: ponérselo a un producto
      if (!silencio) toast('No hay un producto con ese código', 'error');
      return;
    }
    if (!(cpScope().cic.codigos || []).includes(p.id)) return toast(`${p.nombre} no está en este reconteo`, 'error');
    pitido();
    rcc.q = p.id; rcc.pas = ''; rcc.racks = []; rcc.eanPid = p.codigoBarras ? '' : p.id; pagInicio('rcc');
    pintarApp();
    setTimeout(() => { const el = document.querySelector(`.rc-in[data-cod="${CSS.escape(p.id)}"]`); if (el) el.focus(); }, 60);
  }
  function rcPintarTabla() { if ($('rcTabla')) { $('rcTabla').innerHTML = rcTablaHtml(); rcEnlazarTabla(); } }
  function rcEnlazar() {
    const f = () => { pagInicio('rcc'); rcc.listo = ''; if ($('rcListo')) $('rcListo').innerHTML = ''; rcPintarTabla(); };
    if ($('rcSede')) $('rcSede').addEventListener('change', () => { rcc.sede = $('rcSede').value; rcc.pas = ''; rcc.racks = []; rcc.listo = ''; pagInicio('rcc'); pintarApp(); });
    if ($('rcPas')) $('rcPas').addEventListener('change', () => { rcc.pas = $('rcPas').value; f(); });
    if ($('rcRacks')) {
      const caja = $('rcRacks'), sum = caja.querySelector('summary');
      const leer = () => { rcc.racks = [...caja.querySelectorAll('input[type=checkbox]:checked')].map(x => x.value); sum.innerHTML = rcRacksTxt(); f(); };
      caja.querySelectorAll('input[type=checkbox]').forEach(x => x.addEventListener('change', leer));
      if ($('rcRacksTodos')) $('rcRacksTodos').addEventListener('click', () => { caja.querySelectorAll('input[type=checkbox]').forEach(x => { x.checked = false; }); leer(); caja.open = false; });
      // Al tocar fuera, se cierra la lista
      if (!rcRacksCierre) { rcRacksCierre = true; document.addEventListener('click', ev => { const c = $('rcRacks'); if (c && c.open && !c.contains(ev.target)) c.open = false; }); }
    }
    if ($('rcQ')) {
      $('rcQ').addEventListener('input', () => { rcc.q = $('rcQ').value; rcc.eanPid = ''; f(); });
      // Enter con un código exacto (pistola o escrito): igual que escanear
      $('rcQ').addEventListener('keydown', ev => { if (ev.key === 'Enter') { ev.preventDefault(); rcEscaneado($('rcQ').value, true); } });
    }
    rcEnlazarTabla();
  }
  function rcEnlazarTabla() {
    const ins = [...document.querySelectorAll('.rc-in')];
    ins.forEach((el, i) => {
      el.addEventListener('focus', () => el.select());
      el.addEventListener('change', () => { const pr = rcGuardarUno(el); if (pr) pr.catch(() => {}); });
      el.addEventListener('keydown', ev => { if (ev.key !== 'Enter') return; ev.preventDefault(); if (ins[i + 1]) ins[i + 1].focus(); else el.blur(); });
    });
  }
  // Guarda la cantidad de un producto (si cambió). Devuelve la promesa o null si no hay nada que guardar.
  function rcGuardarUno(el) {
    const cod = el.dataset.cod, v = el.value.trim(), sid = rcSede(), kg = sid + '|' + cod;
    if (rcGuardando.has(kg)) return rcGuardando.get(kg);
    if (v === '') return null;
    const tr = el.closest('tr'), est = tr && tr.querySelector('.rc-est');
    const n = num(v);
    if (!(n >= 0)) { if (est) est.innerHTML = '<span class="txt-rojo small">Revisa el número</span>'; return null; }
    const f = (rcFilas(sid) || []).find(x => x.cod === cod), S = cpScope();
    if (!f || (f.cont !== null && +n.toFixed(3) === f.cont)) { el.defaultValue = el.value; return null; }
    if (est) est.innerHTML = '<span class="muted small">Guardando…</span>';
    const pr = llamar('bdGuardarConteo', { sedeId: sid, ubicacionId: f.lugar, codigo: cod, cantidades: { PICKING: +n.toFixed(3) }, usuario: ses.nombre, ciclicoId: S.id })
      .then(lista => {
        const rem = (arr, c) => arr.filter(x => !(x.codigo === c.codigo && x.ubicacion === c.ubicacion && x.tipo === c.tipo && (x.sedeId || '') === (c.sedeId || ''))).concat([c]);
        lista.forEach(c => { cicData.conteos = rem(cicData.conteos, c); });
        const ec = (cicLista || []).find(x => x.id === S.id); if (ec) ec.contados = datosCiclico().filter(x => x.listo).length;
        el.defaultValue = el.value;
        if (est) est.innerHTML = '<span class="txt-verde" title="Guardado">✓</span>';
        if (tr) tr.classList.add('rc-hecho');
        rcCuenta();
      })
      .catch(e => { if (est) est.innerHTML = `<span class="txt-rojo small">${esc(e.message)}</span>`; throw e; })
      .finally(() => rcGuardando.delete(kg));
    rcGuardando.set(kg, pr);
    return pr;
  }
  const rcFaltan = n => `falta${n === 1 ? '' : 'n'} <b class="txt-naranja">${n}</b>`;
  function rcCuenta() {
    // El avance de arriba (cuántos van recontados) también se pone al día
    const pr = document.querySelector('.cic-progreso');
    if (pr && cicData) { const d = datosCiclico(), h = d.filter(f => f.listo).length, pct = d.length ? Math.round(h * 100 / d.length) : 0;
      const i = pr.querySelector('i'), b = pr.querySelector('b'); if (i) i.style.width = pct + '%'; if (b) b.textContent = `${h} de ${d.length}`; }
    const el = $('rcCuenta');
    if (!el) return;
    const l = rcFiltradas(), h = l.filter(f => f.cont !== null).length;
    el.innerHTML = `<b>${h} de ${l.length}</b> contados${l.length - h ? ` · ${rcFaltan(l.length - h)}` : ' · <b class="txt-verde">todos contados</b>'}`;
  }
  async function rcFinalizar() {
    const b = $('rcFin');
    if (b) { b.disabled = true; b.textContent = 'Guardando…'; }
    const ps = [...document.querySelectorAll('.rc-in')].map(el => rcGuardarUno(el)).filter(Boolean).concat([...rcGuardando.values()]);
    try { await Promise.all(ps); } catch (e) {
      if (b) { b.disabled = false; b.textContent = 'Finalizar'; }
      return toast('No se pudo guardar todo: ' + e.message, 'error');
    }
    const l = rcFiltradas(), falta = l.filter(f => f.cont === null).length;
    rcc.listo = `<div class="rc-listo" role="status"><b>✓ Listo.</b> ${l.length - falta} de ${l.length} productos contados${rcc.pas || rcc.racks.length ? ' en lo que filtraste' : ''}.${falta ? ` Falta${falta === 1 ? '' : 'n'} <b>${falta}</b> por contar.` : ''}</div>`;
    if ($('rcListo')) $('rcListo').innerHTML = rcc.listo;
    rcCuenta();
    pitido(); toast(falta ? `Listo. Falta${falta === 1 ? '' : 'n'} ${falta} por contar.` : 'Listo: todo contado', 'ok');
    if (b) { b.disabled = false; b.textContent = 'Finalizar'; }
  }

  /* ----- Reconteos de un cíclico (pestaña dentro del cíclico) ----- */
  function cicReconfHtml() {
    const c = cicSel_();
    if (cicNuevo && cicNuevo.tipo === 'RECONFIRMACION' && cicNuevo.origenId === c.id) return formNuevoCiclico();
    const jefe = puede('ciclico_asignar') && cicVeSap(c);
    const conDif = jefe ? datosCiclico().filter(f => f.contado && f.dif).length : 0;
    return `<section class="card col gap8">
      <div class="fila-sb wrap-f gap8"><span class="h3">Reconteos de este cíclico</span>
        ${jefe ? `<button id="cicPedirRc" class="btn ${conDif ? 'btn-pri' : 'btn-sec'} btn-mini" onclick="pedirReconfirmacion('cic')">Pedir reconteo${conDif ? ` (${conDif})` : ''}</button>` : ''}</div>
      <span class="muted small">${jefe ? 'Pide que vuelvan a contar los productos que salieron con diferencia. Sus resultados también salen en la tabla del cíclico.' : 'Toca una para contarla.'}</span>
      <div id="cicRcLista">${listaRcCic()}</div>
    </section>`;
  }
  function listaRcCic() {
    const ids = (cicData.reconfs || []).map(r => r.ciclico.id);
    const l = ids.map(id => (cicLista || []).find(x => x.id === id) || Object.assign({ contados: 0 }, cicData.reconfs.find(r => r.ciclico.id === id).ciclico)).reverse();
    return tablaCics(l, 'rcc', () => { if ($('cicRcLista')) $('cicRcLista').innerHTML = listaRcCic(); },
      puede('ciclico_asignar') ? 'Todavía no hay reconteos. Cuando haya productos contados con diferencia, toca «Pedir reconteo».' : 'No hay reconteos por ahora.');
  }

  /* ----- Nuevo cíclico ----- */
  function nuevoCiclico() {
    cicNuevo = { tipo: 'CICLICO', codigos: [], nombre: '', fecha: hoyISO(), sedes: [ses.sedeId] };
    pintarApp();
    if ($('cnNombre')) $('cnNombre').focus();
  }

  function formNuevoCiclico() {
    const n = cicNuevo;
    const zonas = sede.zonas.filter(z => sede.racks.some(r => r.zonaId === z.id));
    const conDif = datosInventario().filter(f => f.dif && (f.sap || f.planta)).length;
    const rc = n.tipo === 'RECONFIRMACION';
    return `<section class="card col gap12 cic-nuevo" aria-label="${rc ? 'Nuevo reconteo' : 'Nuevo cíclico'}">
      <div class="col gap4"><span class="h3">${rc ? (n.origenTipo === 'CICLICO' ? 'Nuevo reconteo de cíclico' : 'Nuevo reconteo de inventario') : 'Nuevo cíclico'}</span>
        ${rc ? `<span class="muted small">Sale de: <b>${esc(n.origen)}</b>. Quien la haga vuelve a contar picking, calidad y bloqueado, y revisa el aéreo estiba por estiba en el plano.</span>` : ''}</div>
      <div class="cic-grid">
        <div class="col gap8">
          <label class="lbl" for="cnNombre">1. Nombre ${rc ? 'del reconteo' : 'del cíclico'}</label>
          <input id="cnNombre" class="campo" placeholder="${rc ? 'Ej. Reconteo galletas' : 'Ej. Cíclico galletas semana 46'}" autocomplete="off" maxlength="80" value="${esc(n.nombre)}" oninput="cicNuevo.nombre=this.value">
          <span class="muted small">Con este nombre lo encuentran en la lista. Quien tenga permiso de contar lo ve y lo puede contar.</span>
          <div><label class="lbl" for="cnFecha">Fecha</label><input id="cnFecha" class="campo" type="date" value="${esc(n.fecha)}" onchange="cicNuevo.fecha=this.value"></div>
          ${ini.sedes.length > 1 ? `<div><span class="lbl">Sedes donde se cuenta ${ayudaHtml('Marca las sedes que van a contar este ' + (rc ? 'reconteo' : 'cíclico') + '. Lo que se cuente en cada una y su aéreo se suman contra el mismo SAP. Lo ven en la lista de cíclicos de cada sede marcada.')}</span>
            ${sedesCheckHtml('cnSede', n.sedes || [ses.sedeId], ses.sedeId, 'cicNuevo.sedes')}</div>` : ''}
        </div>
        ${rc ? `<div class="col gap8"><span class="lbl">2. ¿Qué productos va a recontar?</span>
          <div class="dos"><button class="btn btn-sec cn-pegar" onclick="rcCargarArchivo()">📄 Cargar Excel con los productos</button>
            <button class="btn btn-sec cn-pegar" onclick="cnPegarLista()">📋 Pegar lista de códigos</button></div>
          <div id="cnCand">${cnCandHtml()}</div></div>` : `<div class="col gap8">
          <span class="lbl">2. Carga el Excel de SAP con los productos a revisar</span>
          <div id="cnSap">${cnSapHtml()}</div>
          <details class="cn-mano" ${n.codigos.length && !n.sap ? 'open' : ''}><summary>¿No tienes el Excel? Agrega los productos a mano</summary>
          <div class="col gap8 mt8">
          <div class="fila gap8">${campoConCamara('<input id="cnProd" class="campo" list="dlProductos" autocomplete="off" spellcheck="false" placeholder="Escanea, escribe o pega varios códigos">', 'cnProd')}
            <button class="btn btn-sec" onclick="cnAgregar()">Agregar</button></div>
          <button class="btn btn-sec cn-pegar" onclick="cnPegarLista()">📋 Pegar lista de códigos (de Excel o WhatsApp)</button>
          <select id="cnVarios" class="campo" aria-label="Agregar varios de una vez" onchange="cnAgregarVarios(this.value); this.value=''">
            <option value="">Agregar varios de una vez…</option>
            ${conDif ? `<option value="dif">Los que tienen diferencia en Inventario (${conDif})</option>` : ''}
            ${zonas.map(z => `<option value="z:${esc(z.id)}">Todos los ubicados en la zona ${esc(z.nombre)}</option>`).join('')}
          </select>
          <span class="muted small">Los que agregues a mano se comparan con el SAP de la pestaña Inventario.</span>
          </div></details>
          <div id="cnLista">${cnListaHtml()}</div>
        </div>`}
      </div>
      <p id="cnErr" class="error" hidden></p>
      <div class="fila gap8 wrap-f" style="justify-content:flex-end">
        <button class="btn btn-sec" onclick="cicNuevo=null; pintarApp()">Cancelar</button>
        <button id="cnOk" class="btn btn-pri" onclick="guardarCiclico()">${rc ? 'Crear reconteo' : 'Crear cíclico'}</button></div>
    </section>`;
  }

  function cnListaHtml() {
    const c = cicNuevo.codigos;
    if (!c.length) return '<p class="muted small">Todavía no hay productos.</p>';
    return `<div class="fila-sb"><span class="muted small"><b>${c.length}</b> producto${c.length === 1 ? '' : 's'}</span>
        <button class="link small" onclick="cicNuevo.codigos=[]; $('cnLista').innerHTML=cnListaHtml()">Quitar todos</button></div>
      <div class="cic-codigos">${c.map(k => { const p = prodDe(k); return `<span class="cic-cod" title="${esc(p ? p.nombre : k)}">
        <b>${esc(k)}</b> ${esc(p ? p.nombre : '')}<button onclick="cnQuitar('${esc(k)}')" aria-label="Quitar ${esc(k)}">×</button></span>`; }).join('')}</div>`;
  }
  function cnQuitar(k) {
    cicNuevo.codigos = cicNuevo.codigos.filter(x => x !== k);
    if (cicNuevo.sap) delete cicNuevo.sap[k];
    $('cnLista').innerHTML = cnListaHtml();
    if ($('cnSap')) $('cnSap').innerHTML = cnSapHtml();
  }

  function cnSapHtml() {
    const n = cicNuevo, k = n.sap ? Object.keys(n.sap).length : 0;
    return n.sap ? `<div class="cn-sap-ok"><span class="col" style="min-width:0"><b class="txt-verde">✓ Excel cargado: ${k} producto${k === 1 ? '' : 's'}</b>
          <span class="muted small" style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(n.archivo || '')}</span></span>
        <button class="btn btn-sec btn-mini" onclick="abrirCargaSap('ciclico')">Cambiar</button></div>`
      : `<button class="btn btn-pri cn-pegar" onclick="abrirCargaSap('ciclico')">📄 Cargar Excel de SAP</button>`;
  }

  // El Excel del cíclico: sus productos quedan en la lista y su SAP se guarda con el cíclico
  function usarSapCiclico(ok) {
    const n = cicNuevo;
    if (!n) return cerrarModal();
    const antes = n.sap ? Object.keys(n.sap) : [];
    n.codigos = n.codigos.filter(k => !antes.includes(k));          // si cambia de Excel, salen los del anterior
    n.sap = {};
    ok.forEach(r => {
      const x = n.sap[r.codigo] || (n.sap[r.codigo] = { inventario: 0, calidad: 0, bloqueado: 0 });
      x.inventario += r.inventario; x.calidad += r.calidad; x.bloqueado += r.bloqueado;
    });
    Object.keys(n.sap).forEach(k => { if (!n.codigos.includes(k)) n.codigos.push(k); });
    n.archivo = sapTmp.archivo;
    cerrarModal();
    $('cnSap').innerHTML = cnSapHtml();
    $('cnLista').innerHTML = cnListaHtml();
    pitido(); toast(`${Object.keys(n.sap).length} productos del Excel listos para el cíclico`, 'ok');
  }

  // Acepta un código, un nombre de la lista o varios códigos pegados (uno por línea, con comas o espacios)
  function cnAgregar() {
    const txt = $('cnProd').value;
    if (!txt.trim()) return $('cnProd').focus();
    let partes = txt.split(/[\n,;\t]+/).map(x => x.trim()).filter(Boolean);
    if (partes.length === 1 && !buscarProducto(partes[0])) {
      const ws = partes[0].split(/\s+/);
      if (ws.length > 1 && ws.every(w => buscarProducto(w))) partes = ws;
    }
    let nuevos = 0; const malos = [];
    partes.forEach(t => { const p = buscarProducto(t); if (!p) return malos.push(t); if (!cicNuevo.codigos.includes(p.id)) { cicNuevo.codigos.push(p.id); nuevos++; } });
    $('cnLista').innerHTML = cnListaHtml();
    $('cnProd').value = malos.join(', ');
    if (malos.length) toast(`No encontré: ${malos.slice(0, 5).join(', ')}${malos.length > 5 ? '…' : ''}`, 'error');
    else if (nuevos) { pitido(); toast(nuevos === 1 ? 'Producto agregado' : `${nuevos} productos agregados`, 'ok'); }
    $('cnProd').focus();
  }
  // Ventana para pegar muchos códigos: la app reconoce cada producto antes de agregarlo
  function cnPegarLista() {
    abrirModal(`<div class="fila-sb"><span class="h2">Pegar lista de códigos</span>${btnCerrar()}</div>
      <span class="muted small mt8">Copia la columna de códigos (Nutresa o Atlantic) y pégala aquí. Uno por línea, o separados por comas o espacios.</span>
      <textarea id="cnTxt" class="campo mt8" rows="8" placeholder="1049449\n1080263\n2034" style="height:auto;font-family:inherit"></textarea>
      <div id="cnPrev" class="mt8"></div>
      <p id="fErr" class="error" hidden></p>
      <button id="cnPegOk" class="btn btn-pri btn-xl mt12" onclick="cnPegarOk()" disabled>Agregar productos</button>`);
    const t = $('cnTxt');
    t.addEventListener('input', cnPegarPrevia);
    setTimeout(() => t.focus(), 50);
  }
  function cnLeerLista(txt) {
    const toks = String(txt || '').split(/[\s,;]+/).map(x => x.trim()).filter(Boolean);
    const ok = [], malos = [];
    toks.forEach(t => { const p = buscarProducto(t); if (p) { if (!ok.some(x => x.id === p.id)) ok.push(p); } else if (!malos.includes(t)) malos.push(t); });
    return { ok, malos };
  }
  function cnPegarPrevia() {
    const { ok, malos } = cnLeerLista($('cnTxt').value);
    const nuevos = ok.filter(p => !cicNuevo.codigos.includes(p.id));
    $('cnPrev').innerHTML = !ok.length && !malos.length ? '' : `
      <span class="small">${ok.length ? `<b class="txt-verde">✓ ${ok.length} producto${ok.length === 1 ? '' : 's'} reconocido${ok.length === 1 ? '' : 's'}</b>` : ''}${ok.length - nuevos.length ? ` (${ok.length - nuevos.length} ya estaba${ok.length - nuevos.length === 1 ? '' : 'n'})` : ''}
        ${malos.length ? ` · <b class="txt-rojo">${malos.length} no encontrado${malos.length === 1 ? '' : 's'}:</b> ${esc(malos.slice(0, 15).join(', '))}${malos.length > 15 ? '…' : ''}` : ''}</span>
      ${ok.length ? `<div class="lista-senal mt8" style="max-height:200px;overflow-y:auto">${ok.map(p => `<div><b>${esc(p.id)}</b><span class="muted small">${esc(p.codigoNutresa || '')} · ${esc(p.nombre)}</span></div>`).join('')}</div>` : ''}`;
    $('cnPegOk').disabled = !nuevos.length;
    $('cnPegOk').textContent = nuevos.length ? `Agregar ${nuevos.length} producto${nuevos.length === 1 ? '' : 's'}` : 'Agregar productos';
  }
  function cnPegarOk() {
    const { ok } = cnLeerLista($('cnTxt').value);
    if (cicNuevo.tipo === 'RECONFIRMACION') return rcAgregarCods(ok.map(p => p.id));
    let n = 0;
    ok.forEach(p => { if (!cicNuevo.codigos.includes(p.id)) { cicNuevo.codigos.push(p.id); n++; } });
    cerrarModal();
    $('cnLista').innerHTML = cnListaHtml();
    pitido(); toast(`${n} producto${n === 1 ? '' : 's'} agregado${n === 1 ? '' : 's'}`, 'ok');
  }

  function cnAgregarVarios(v) {
    if (!v) return;
    let ks = [];
    if (v === 'dif') ks = datosInventario().filter(f => f.dif && (f.sap || f.planta)).map(f => f.cod);
    else if (v.startsWith('z:')) {
      const z = v.slice(2);
      ks = sede.lineas.filter(l => { const e = sede.espPorId[l.ubicacionId], r = e && sede.rackPorId[e.rackId]; return r && r.zonaId === z; }).map(l => l.productoId);
    }
    const antes = cicNuevo.codigos.length;
    ks.forEach(k => { if (prodDe(k) && !cicNuevo.codigos.includes(k)) cicNuevo.codigos.push(k); });
    $('cnLista').innerHTML = cnListaHtml();
    const n = cicNuevo.codigos.length - antes;
    toast(n ? `${n} producto${n === 1 ? '' : 's'} agregado${n === 1 ? '' : 's'}` : 'No hay productos nuevos para agregar', n ? 'ok' : 'error');
  }

  // Casillas de sedes: la propia va marcada y no se puede quitar. var: dónde se guarda la lista al marcar
  function sedesCheckHtml(pref, marcadas, propia, varNom) {
    return `<div class="cic-sedes">${ini.sedes.map(s => {
      const on = s.id === propia || marcadas.indexOf(s.id) >= 0;
      return `<label class="cic-sede-op"><input type="checkbox" value="${esc(s.id)}" ${on ? 'checked' : ''} ${s.id === propia ? 'disabled' : ''}
        onchange="${varNom} = sedesMarcadas(this.closest('.cic-sedes'))"> ${esc(s.nombre)}${s.id === propia ? ' <span class="muted small">(donde se crea)</span>' : ''}</label>`;
    }).join('')}</div>`;
  }
  function sedesMarcadas(caja) {
    return Array.prototype.slice.call(caja.querySelectorAll('input[type=checkbox]')).filter(x => x.checked).map(x => x.value);
  }
  // Nombres de las sedes de un cíclico (si se cuenta en varias)
  const sedesCicTxt = c => c && c.sedes && c.sedes.length > 1 ? c.sedes.map(nombreSede).join(' · ') : '';
  // Cambiar las sedes de un cíclico que ya existe
  function editarSedesCiclico() {
    const c = cicSel_();
    if (!c || sinPermiso('ciclico_asignar')) return;
    abrirModal(`<div class="fila-sb"><span class="h3">Sedes donde se cuenta</span><button class="btn btn-sec btn-x" aria-label="Cerrar" onclick="cerrarModal()">✕</button></div>
      <p class="muted small mt8">${esc(tituloCic(c))}. Marca las sedes que cuentan: lo contado en cada una y su aéreo se suman. ${esReconf(c) ? '' : 'Sus reconteos abiertos también cambian.'}</p>
      <div class="mt8">${sedesCheckHtml('esSede', c.sedes || [c.sedeId], c.sedeId, 'window._esSedes')}</div>
      <p id="esErr" class="error" hidden></p>
      <div class="fila gap8 mt12" style="justify-content:flex-end"><button class="btn btn-sec" onclick="cerrarModal()">Cancelar</button>
        <button id="esOk" class="btn btn-pri" onclick="guardarSedesCiclico()">Guardar</button></div>`);
    window._esSedes = (c.sedes || [c.sedeId]).slice();
  }
  function guardarSedesCiclico() {
    const c = cicSel_(), b = $('esOk');
    if (!c) return;
    b.disabled = true; b.textContent = 'Guardando…';
    llamar('bdSedesCiclico', { id: c.id, sedes: window._esSedes || [c.sedeId] }).then(n => {
      Object.assign(c, { sedes: n.sedes });
      (cicLista || []).forEach(x => { if (x.origenId === c.id && x.estado === 'ABIERTO') x.sedes = n.sedes.slice(); });
      cerrarModal(); toast(n.sedes.length > 1 ? `Se cuenta en: ${sedesCicTxt(n)}` : 'Se cuenta solo en ' + nombreSede(n.sedeId), 'ok');
      abrirCiclico(c.id);
    }).catch(e => { const er = $('esErr'); er.textContent = e.message; er.hidden = false; b.disabled = false; b.textContent = 'Guardar'; });
  }

  function guardarCiclico() {
    const n = cicNuevo, err = m => { const e = $('cnErr'); e.textContent = m; e.hidden = false; };
    $('cnErr').hidden = true;
    n.nombre = String(n.nombre || '').trim();
    if (!n.nombre) { $('cnNombre').focus(); return err(n.tipo === 'RECONFIRMACION' ? 'Escribe el nombre del reconteo.' : 'Escribe el nombre del cíclico.'); }
    if (!n.codigos.length) return err(n.tipo === 'RECONFIRMACION' ? 'Marca al menos un producto.' : 'Agrega al menos un producto.');
    const b = $('cnOk'); b.disabled = true; b.textContent = 'Guardando…';
    llamar('bdCrearCiclico', { sedeId: ses.sedeId, fecha: $('cnFecha').value || hoyISO(), nota: n.nombre, asignados: [], codigos: n.codigos,
      sap: n.sap || null, archivo: n.archivo || null, usuario: ses.nombre, usuarioId: ses.id, tipo: n.tipo || 'CICLICO', origen: n.origen || null, sedes: n.sedes || [ses.sedeId],
      origenTipo: n.origenTipo || null, origenId: n.origenId || null, base: n.base || null })
      .then(c => {
        cicLista = [c].concat(cicLista || []); cicNuevo = null; cicF.ver = 'ABIERTO';
        if (cicData && c.origenId === cicData.ciclico.id) cicData.reconfs = (cicData.reconfs || []).concat([{ ciclico: c, conteos: [] }]);
        pitido(); toast(`${tituloCic(c)}: cread${esReconf(c) ? 'a' : 'o'} con ${c.codigos.length} producto${c.codigos.length === 1 ? '' : 's'}`, 'ok');
        abrirCiclico(c.id);
      })
      .catch(e => { err(e.message); b.disabled = false; b.textContent = n.tipo === 'RECONFIRMACION' ? 'Crear reconteo' : 'Crear cíclico'; });
  }

  /* ----- Reconteo: volver a contar lo que tiene diferencia (picking + aéreo estiba por estiba) ----- */
  const esReconf = c => !!c && c.tipo === 'RECONFIRMACION';
  const nombreCic = c => !esReconf(c) ? 'Cíclico' : c.origenTipo === 'CICLICO' ? 'Reconteo de cíclico' : 'Reconteo de inventario';

  // Desde Inventario ('inv') o desde el cíclico abierto ('cic'): armal reconteo con los productos que tienen diferencia
  function pedirReconfirmacion(fuente) {
    if (sinPermiso('ciclico_asignar')) return;
    let filas, origen, origenTipo, origenId = null;
    if (fuente === 'inv') {
      filas = filtrarInventario(datosInventario()).filter(f => f.dif && (f.sap || f.planta));
      origen = 'Inventario del ' + fCorta(hoyISO()); origenTipo = 'INVENTARIO';
    } else {
      const c = cicSel_();
      filas = datosCiclico().filter(f => f.contado && f.dif);
      origen = tituloCic(c); origenTipo = 'CICLICO'; origenId = c.id;
    }
    // Sin diferencias igual se abre: puede cargar o pegar los productos que quiere recontar
    const sap = {}, base = {};
    filas.forEach(f => {
      if (f.sap) sap[f.cod] = { inventario: f.sap.inventario, calidad: f.sap.calidad, bloqueado: f.sap.bloqueado };
      base[f.cod] = { picking: f.picking, aereo: f.aereo, calidad: f.calidad, bloqueado: f.bloqueado, planta: f.planta, sapTotal: f.sapTotal };   // cómo estaba
    });
    cicNuevo = { tipo: 'RECONFIRMACION', fuente, origen, origenTipo, origenId, base, codigos: filas.map(f => f.cod), sap, archivo: null, fecha: hoyISO(),
      sedes: fuente === 'cic' && cicData && cicData.ciclico.sedes ? cicData.ciclico.sedes.slice() : [ses.sedeId],   // la de un cíclico se cuenta en sus mismas sedes
      nombre: fuente === 'inv' ? 'Reconteo de inventario ' + fCorta(hoyISO()) : 'Reconteo de ' + origen,
      candidatos: filas.map(f => ({ cod: f.cod, sapTotal: f.sapTotal, planta: f.planta, dif: f.dif })) };
    if (fuente === 'inv') { cicSel = null; cicData = null; prodTab = 'inventario'; invSub = 'reconf'; }
    else cicSub = 'reconf';
    pintarApp();
    window.scrollTo(0, 0);
  }

  function cnCandHtml() {
    const n = cicNuevo, sel = new Set(n.codigos);
    if (!n.candidatos.length) return '<p class="muted small">Carga o pega los códigos de los productos que quieres recontar.</p>';
    const difCls = d => !d ? 'dif-ok' : d < 0 ? 'dif-falta' : 'dif-sobra';
    return `<div class="fila-sb"><span class="muted small"><b>${sel.size}</b> de ${n.candidatos.length} marcados</span>
        <span class="fila gap12"><button class="link small" onclick="cnCandTodos(true)">Todos</button><button class="link small" onclick="cnCandTodos(false)">Ninguno</button></span></div>
      <div class="cic-plista">${n.candidatos.map(c => { const p = prodDe(c.cod); return `<label class="cic-persona ${sel.has(c.cod) ? 'on' : ''}">
        <input type="checkbox" class="us-chk" ${sel.has(c.cod) ? 'checked' : ''} onchange="cnCand('${esc(c.cod)}', this.checked)">
        <span class="col flex1" style="min-width:0"><b class="pi-prod">${esc(p ? p.nombre : c.cod)}</b>
          <span class="muted small">${esc(c.cod)} · SAP ${nInv(c.sapTotal)} · Planta ${nInv(c.planta)}</span></span>
        <span class="dif ${difCls(c.dif)}">${c.dif > 0 ? '+' : ''}${nInv(c.dif)}</span></label>`; }).join('')}</div>`;
  }
  function cnCand(cod, on) {
    cicNuevo.codigos = cicNuevo.codigos.filter(k => k !== cod);
    if (on) cicNuevo.codigos.push(cod);
    $('cnCand').innerHTML = cnCandHtml();
  }
  // Productos que el encargado carga o pega: entran a la lista ya marcados, con cómo estaban (SAP y planta)
  function rcAgregarCods(ids) {
    const n = cicNuevo, cic = n.fuente === 'cic';
    const datos = {}; (cic ? datosCiclico() : datosInventario()).forEach(f => (datos[f.cod] = f));
    let nuevos = 0; const fuera = [];
    ids.forEach(cod => {
      const f = datos[cod];
      if (!f) return fuera.push(cod);
      if (!n.candidatos.some(c => c.cod === cod)) {
        n.candidatos.push({ cod, sapTotal: f.sapTotal, planta: f.planta, dif: f.dif });
        if (f.sap) n.sap[cod] = { inventario: f.sap.inventario, calidad: f.sap.calidad, bloqueado: f.sap.bloqueado };
        n.base[cod] = { picking: f.picking, aereo: f.aereo, calidad: f.calidad, bloqueado: f.bloqueado, planta: f.planta, sapTotal: f.sapTotal };
      }
      if (!n.codigos.includes(cod)) { n.codigos.push(cod); nuevos++; }
    });
    cerrarModal();
    if ($('cnCand')) $('cnCand').innerHTML = cnCandHtml();
    if (fuera.length) toast(`${nuevos} marcado${nuevos === 1 ? '' : 's'}. No están en este cíclico: ${fuera.slice(0, 5).join(', ')}${fuera.length > 5 ? '…' : ''}`, 'error');
    else { pitido(); toast(`${nuevos} producto${nuevos === 1 ? '' : 's'} marcado${nuevos === 1 ? '' : 's'}`, 'ok'); }
  }
  // Excel o CSV con los productos: se toma la columna de códigos (Atlantic primero, si no Nutresa) y se revisa en la ventana de pegar
  function rcCargarArchivo() {
    const inp = document.createElement('input');
    inp.type = 'file'; inp.accept = '.xlsx,.xls,.csv,.txt';
    inp.addEventListener('change', () => {
      const f = inp.files[0]; if (!f) return;
      const r = new FileReader();
      r.onload = () => {
        try {
          let filas;
          if (window.XLSX && !/\.(csv|txt)$/i.test(f.name)) {
            const wb = XLSX.read(new Uint8Array(r.result), { type: 'array' });
            filas = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1, raw: true, defval: '' });
          } else {
            let txt = new TextDecoder('utf-8').decode(r.result);
            if (txt.includes('\uFFFD')) txt = new TextDecoder('windows-1252').decode(r.result);
            filas = txt.split(/\r?\n/).map(l => l.split(/[;,\t]/).map(c => c.replace(/^"|"$/g, '').trim()));
          }
          const t = v => sinTilde(String(v || '')).toUpperCase();
          const iCab = filas.findIndex(x => x.some(c => /COD|MATERIAL/.test(t(c))));
          let col = 0;
          if (iCab >= 0) {
            const cab = filas[iCab].map(t), busca = re => cab.findIndex(c => re.test(c));
            col = [busca(/COD.*(ATL|AFS)/), busca(/COD.*NUTRESA/), busca(/^COD/), busca(/COD|MATERIAL/)].find(i => i >= 0);
          }
          const cods = filas.slice(iCab + 1).map(x => String(x[col] ?? '').trim().replace(/\.0+$/, '')).filter(Boolean);
          if (!cods.length) return toast('No encontré códigos en ese archivo. Revisa que tenga una columna de códigos.', 'error');
          cnPegarLista();
          $('cnTxt').value = cods.join('\n');
          cnPegarPrevia();
        } catch (e) { toast('No se pudo leer el archivo: ' + e.message, 'error'); }
      };
      r.readAsArrayBuffer(f);
    });
    inp.click();
  }
  function cnCandTodos(on) { cicNuevo.codigos = on ? cicNuevo.candidatos.map(c => c.cod) : []; $('cnCand').innerHTML = cnCandHtml(); }

  // Estibas del aéreo de los productos del reconteo, con su última revisión
  let aereoKeys = [];
  function aereoCiclico() {
    const c = cicSel_(), codes = new Set(cicData.ciclico.codigos);
    const ult = {};
    (cicData.validaciones || []).forEach(v => { ult[`${v.ubicacion}|${v.productoId}|${v.lote}`] = v; });
    const lineas = sede.lineas.filter(l => codes.has(l.productoId) && sede.espPorId[l.ubicacionId] && sede.espPorId[l.ubicacionId].nivel !== 0)
      .map(l => ({ l, v: ult[`${l.ubicacionId}|${l.productoId}|${l.lote}`] || null }));
    // Las que se quitaron porque no estaban siguen saliendo (trazabilidad)
    const quitadas = Object.values(ult).filter(v => v.accion === 'NO_ESTA' && !sede.lineas.some(l => l.ubicacionId === v.ubicacion && l.productoId === v.productoId && l.lote === v.lote));
    return { c, lineas, quitadas };
  }

  function aereoCiclicoHtml() {
    const { c, lineas, quitadas } = aereoCiclico(), contar = cicPuedeContar(c);
    const hechas = lineas.filter(x => x.v).length;
    if (!lineas.length && !quitadas.length) return '<p class="muted small">Estos productos no tienen estibas en el aéreo (nivel 2 hacia arriba).</p>';
    const orden = lineas.sort((a, b) => (!!a.v - !!b.v) || a.l.productoId.localeCompare(b.l.productoId) || a.l.ubicacionId.localeCompare(b.l.ubicacionId));
    const pg = paginar('cicA', orden, () => { if ($('cicAereo')) $('cicAereo').innerHTML = aereoCiclicoHtml(); });
    aereoKeys = pg.filas.map(x => x.l);
    const estadoV = v => !v ? '<span class="tag amar">Sin revisar</span>'
      : v.accion === 'OK' ? `<span class="tag ok">✓ Está bien</span><span class="muted small"> ${esc(v.usuario || '')} · ${fechaHora(v.fecha)}</span>`
      : `<span class="tag venc">Corregido</span><span class="small"> ${nInv(v.antes)} → <b>${nInv(v.despues)}</b>${v.vencDespues !== v.vencAntes ? ` · vence ${fCorta(v.vencDespues)}` : ''}</span><span class="muted small"> · ${esc(v.motivo || '')} · ${esc(v.usuario || '')}</span>`;
    return `<div class="muted small"><b>${hechas}</b> de ${lineas.length} estibas revisadas${quitadas.length ? ` · <b class="txt-rojo">${quitadas.length}</b> no estaban` : ''}</div>
      <div class="lista-bp">${pg.filas.map(({ l, v }, i) => {
        const e = sede.espPorId[l.ubicacionId], p = prodDe(l.productoId);
        return `<div class="ra-fila ${v ? 'ra-ok' : ''}">
          <span class="col flex1" style="min-width:0">
            <b class="pi-prod">${esc(etiqueta(e))} · ${esc(p ? p.nombre : l.productoId)}</b>
            <span class="muted small">${esc(cu(l.ubicacionId))} · rótulo ${esc(l.lote || '—')} · ${cant(l)} · vence ${fCorta(l.vencimiento)}</span>
            <span>${estadoV(v)}</span></span>
          ${contar ? `<span class="ra-acc">
            <button class="btn ${v ? 'btn-sec' : 'btn-ent'} btn-mini" onclick="validarEstiba(${i}, 'OK')">Está bien</button>
            <button class="btn btn-sec btn-mini" onclick="corregirEstiba(${i})">Corregir</button>
            <button class="btn btn-sal btn-mini" onclick="noEstaEstiba(${i})">No está</button></span>` : ''}
        </div>`;
      }).join('')}
      ${quitadas.map(v => { const p = prodDe(v.productoId); return `<div class="ra-fila ra-quitada"><span class="col flex1" style="min-width:0">
          <b class="pi-prod">${esc(cu(v.ubicacion))} · ${esc(p ? p.nombre : v.productoId)}</b>
          <span class="muted small">rótulo ${esc(v.lote || '—')} · tenía ${nInv(v.antes)} und</span>
          <span><span class="tag venc">No estaba</span><span class="muted small"> se quitó del plano · ${esc(v.motivo || '')} · ${esc(v.usuario || '')} · ${fechaHora(v.fecha)}. El rótulo quedó por ubicar.</span></span></span></div>`; }).join('')}
      </div>${pg.barra}`;
  }

  function enviarValidacion(l, d, boton) {
    if (boton) boton.disabled = true;
    const enCic = ctxCic() && cicData;
    return llamar('bdCorregirEstiba', Object.assign({ ciclicoId: enCic ? cicSel : null, sedeId: ses.sedeId, ubicacionId: l.ubicacionId, productoId: l.productoId, lote: l.lote, usuario: ses.nombre }, d))
      .then(r => {
        if (enCic) cicData.validaciones = (cicData.validaciones || []).concat([r.validacion]);
        else if (invData) invData.validaciones = (invData.validaciones || []).concat([r.validacion]);
        pitido();
        return llamar('bdSede', ses.sedeId).then(setSede).catch(() => {}).then(() => {
          repintarCiclicoParcial(); cpRepintar();
          if (cpAereoCod && !$('modal').hidden && document.querySelector('#caja .cp-est')) pintarCpAereo();
          return r;
        });
      })
      .catch(e => { if (boton) boton.disabled = false; throw e; });
  }
  function repintarCiclicoParcial() {
    if ($('cicAereo')) $('cicAereo').innerHTML = aereoCiclicoHtml();
    if ($('cicTabla')) $('cicTabla').innerHTML = tablaCiclico();
    const cc = document.querySelector('.cic-progreso b');
    if (cc) { const d = datosCiclico(); cc.textContent = `${d.filter(f => f.listo).length} de ${d.length}`; }
  }

  function validarEstiba(i, accion) {
    const l = aereoKeys[i];
    if (!l) return;
    enviarValidacion(l, { accion }, event && event.target).then(() => toast(`${cu(l.ubicacionId)}: está bien`, 'ok')).catch(e => toast(e.message, 'error'));
  }

  function corregirEstiba(i) {
    const l = aereoKeys[i];
    if (!l) return;
    const p = prodDe(l.productoId) || {}, kg = (p.unidadMedida || '').toUpperCase() === 'KG';
    const upc = Number(l.undPorCaja) || Number(p.undPorCaja) || 1;
    const cajas = kg ? 0 : Math.round(l.unidades / upc);
    abrirModal(`<div class="fila-sb"><span class="h2">Corregir estiba</span>${btnCerrar()}</div>
      <div class="info mt12"><span class="fuerte">${esc(p.nombre || l.productoId)}</span>
        <span class="muted small">${esc(cu(l.ubicacionId))} · rótulo ${esc(l.lote || '—')}</span>
        <span class="small">Hoy dice: <b>${cant(l)}</b> · vence <b>${fCorta(l.vencimiento)}</b></span></div>
      ${kg ? `<div class="mt12"><label class="lbl" for="ceKg">Kilos que hay de verdad</label>
          <input id="ceKg" class="campo" type="number" inputmode="decimal" min="0" step="any" value="${l.unidades}"></div>`
        : `<div class="dos mt12">
          <div><label class="lbl" for="ceCajas">Cajas que hay de verdad</label><input id="ceCajas" class="campo" type="number" inputmode="numeric" min="0" step="1" value="${cajas}"></div>
          <div><label class="lbl" for="ceUpc">Unidades por caja</label><input id="ceUpc" class="campo" type="number" inputmode="numeric" min="1" step="1" value="${upc}"></div></div>
        <div class="info mt8" id="ceTotal"></div>`}
      <div class="mt12"><label class="lbl" for="ceVen">Fecha de vencimiento</label>
        <input id="ceVen" class="campo" type="date" value="${esc(l.vencimiento || '')}"></div>
      <div class="mt12"><label class="lbl" for="ceMot">¿Por qué se corrige?</label>
        <div class="fila gap8 wrap-f mt4">${['Faltaban cajas', 'Sobraban cajas', 'Vencimiento equivocado', 'Rótulo con datos errados'].map(t =>
          `<button type="button" class="chip-btn" onclick="$('ceMot').value='${t}'">${t}</button>`).join('')}</div>
        <input id="ceMot" class="campo mt8" placeholder="Escribe el motivo" autocomplete="off"></div>
      <p id="fErr" class="error" hidden></p>
      <button id="ceOk" class="btn btn-pri btn-xl mt16" onclick="guardarCorrEstiba(${i})">Guardar corrección</button>
      <span class="muted small mt8">Queda guardado quién lo corrigió, cuándo, cómo estaba y cómo quedó. También se corrige el rótulo y el plano.</span>`);
    const tot = () => { if (!$('ceTotal')) return; const n = (Number($('ceCajas').value) || 0) * (Number($('ceUpc').value) || 0); $('ceTotal').innerHTML = `Queda en <b>${nInv(n)} unidades</b> (antes ${nInv(l.unidades)})`; };
    if (!kg) { $('ceCajas').addEventListener('input', tot); $('ceUpc').addEventListener('input', tot); tot(); }
  }

  function guardarCorrEstiba(i) {
    const l = aereoKeys[i];
    const kg = !!$('ceKg');
    const cantidad = kg ? Number(String($('ceKg').value).replace(',', '.')) : (Number($('ceCajas').value) || 0) * (Number($('ceUpc').value) || 0);
    const cajas = kg ? null : Number($('ceCajas').value) || 0;
    const motivo = $('ceMot').value.trim();
    if (!(cantidad >= 0) || (!kg && $('ceCajas').value === '')) return errForm('Escribe la cantidad que hay de verdad.');
    if (!motivo) { $('ceMot').focus(); return errForm('Escribe por qué se corrige.'); }
    if (cantidad === l.unidades && ($('ceVen').value || '') === (l.vencimiento || '')) return errForm('No cambiaste nada. Si está bien, usa «Está bien».');
    const b = $('ceOk'); b.textContent = 'Guardando…';
    enviarValidacion(l, { accion: 'CORREGIDO', cantidad, cajas, vencimiento: $('ceVen').value || null, motivo }, b).then(r => {
      const et = r.etiqueta;
      abrirModal(`<div class="fila-sb"><span class="h2">Corrección guardada</span>${btnCerrar()}</div>
        <span class="mt12">${esc(cu(l.ubicacionId))}: ${nInv(r.validacion.antes)} → <b>${nInv(r.validacion.despues)}</b>${r.validacion.vencDespues !== r.validacion.vencAntes ? ` · vence ${fCorta(r.validacion.vencDespues)}` : ''}.</span>
        ${et && r.validacion.despues > 0 ? `<span class="muted small mt8">El rótulo ${esc(et.id)} quedó con los datos nuevos. Imprímelo y cámbialo en la estiba.</span>
          <button class="btn btn-pri btn-xl mt16" onclick="cerrarModal(); imprimirRotulo([cicRotulo], 1, leerLS('rtTam') || 'carta')">Imprimir rótulo corregido</button>` : ''}
        <button class="btn btn-sec btn-xl mt8" onclick="cerrarModal()">Listo</button>`);
      window.cicRotulo = et;
    }).catch(e => { errForm(e.message); b.disabled = false; b.textContent = 'Guardar corrección'; });
  }

  function noEstaEstiba(i) {
    const l = aereoKeys[i], p = prodDe(l.productoId) || {};
    abrirModal(`<div class="fila-sb"><span class="h2">¿No está esta estiba?</span>${btnCerrar()}</div>
      <div class="info mt12"><span class="fuerte">${esc(p.nombre || l.productoId)}</span>
        <span class="muted small">${esc(cu(l.ubicacionId))} · rótulo ${esc(l.lote || '—')} · ${cant(l)}</span></div>
      <span class="small mt12">Se quita del plano y queda guardado que no estaba. El rótulo vuelve a <b>por ubicar</b>: si aparece en otro lugar, escanéalo y ubícalo.</span>
      <label class="lbl mt12" for="neMot">Comentario (opcional)</label>
      <input id="neMot" class="campo" placeholder="Ej. El espacio estaba vacío" autocomplete="off">
      <p id="fErr" class="error" hidden></p>
      <div class="dos mt16"><button class="btn btn-sec btn-xl" onclick="cerrarModal()">Cancelar</button>
        <button id="neOk" class="btn btn-sal btn-xl" onclick="confirmarNoEsta(${i})">Sí, no está</button></div>`);
  }
  function confirmarNoEsta(i) {
    const l = aereoKeys[i];
    enviarValidacion(l, { accion: 'NO_ESTA', motivo: $('neMot').value.trim() || null }, $('neOk'))
      .then(() => { cerrarModal(); toast(`${cu(l.ubicacionId)}: se quitó del plano. El rótulo ${l.lote || ''} quedó por ubicar.`, 'ok'); })
      .catch(e => errForm(e.message));
  }

  /* ----- Detalle: formulario de conteo + tabla igual que Inventario ----- */
  function detalleCiclico() {
    const c = (cicLista || []).find(x => x.id === cicSel);
    if (!c) return '';
    if (!cicData) return '<div class="cargando">Cargando…</div>';
    const d = datosCiclico(), hechos = d.filter(f => f.listo).length, rc = esReconf(c), rcI = esRcInv(c);
    const pct = d.length ? Math.round(hechos * 100 / d.length) : 0;
    const nRc = (cicData.reconfs || []).length;
    const jefeC = puede('ciclico_asignar') || cicVeSap(c);
    const volver = rc ? (c.origenTipo === 'CICLICO' && c.origenId && (cicLista || []).some(x => x.id === c.origenId) ? 'Volver al cíclico' : 'Todos los reconteos') : 'Todos los cíclicos';
    const cab = rc ? (c.origenTipo === 'CICLICO' ? 'cic-cab-rcc' : 'cic-cab-rc') : '';
    const cerrado = `<div class="alerta-fefo">Est${rc ? 'a reconteo' : 'e cíclico'} está cerrad${rc ? 'a' : 'o'}. Para seguir contando, el encargado l${rc ? 'a' : 'o'} tiene que volver a abrir.</div>`;
    // Pestañas: los reconteos de un cíclico van dentro de él
    const tabRc = !rc && (jefeC || nRc) ? [['reconf', `Reconteos${nRc ? ` (${nRc})` : ''}`]] : [];
    if (!jefeC) {   // quien cuenta: solo el título, el avance y sus pestañas
      const tabs = [['ingresar', rcI ? 'Contar' : 'Ingresar'], ['confirmar', 'Consultar']].concat(tabRc);
      if (!tabs.some(t => t[0] === cicSub)) cicSub = 'ingresar';
      return `<button class="btn btn-sec cic-volver" onclick="volverCic()">← ${volver}</button>
      <section class="card col gap8 cic-cab ${cab}" aria-label="${esc(tituloCic(c))}">
        <div class="fila-sb wrap-f gap8"><span class="col gap4"><span class="h3">${esc(tituloCic(c))}</span>
            <span class="muted small">${rc ? nombreCic(c) + ' · ' : ''}${fCorta(c.fecha)}${sedesCicTxt(c) ? ' · se cuenta en ' + esc(sedesCicTxt(c)) : ''}</span></span>
          <button class="btn btn-sec btn-mini" onclick="historialCiclico()">Historial</button></div>
        <div class="cic-progreso"><span class="us-barra-p"><i style="width:${pct}%"></i></span><b>${hechos} de ${d.length}</b> ${rc ? 'recontados' : 'contados'}</div>
      </section>
      ${subTabsHtml(cicSub, tabs, 'cicSub')}
      ${cicSub === 'reconf' ? cicReconfHtml() : !cicPuedeContar(c) ? cerrado : cicSub === 'confirmar' ? cpConfirmarHtml() : rcI ? rcContarHtml() : cpIngresarHtml()}`;
    }
    return `<button class="btn btn-sec cic-volver" onclick="volverCic()">← ${volver}</button>
      <section class="card col gap8 cic-cab ${cab}" aria-label="${esc(tituloCic(c))}">
        <div class="fila-sb wrap-f gap8">
          <div class="col gap4"><span class="h3">${esc(tituloCic(c))}</span>
            ${rc && c.origen ? `<span class="small">${nombreCic(c)} · sale de: ${c.origenId && (cicLista || []).some(x => x.id === c.origenId) ? `<button class="link" onclick="volverCic()"><b>${esc(c.origen)}</b></button>` : `<b>${esc(c.origen)}</b>`}</span>` : ''}
            <span class="muted small">${fCorta(c.fecha)} · lo creó ${esc(c.creadoPor || '—')}${c.estado === 'CERRADO' ? ` · cerrado por ${esc(c.cerradoPor || '—')} ${c.cerrado ? fechaHora(c.cerrado) : ''}` : ''}</span>
            ${sedesCicTxt(c) ? `<span class="small">Se cuenta en: <b>${esc(sedesCicTxt(c))}</b></span>` : ''}</div>
        </div>
        ${(() => {
          const ab = c.estado === 'ABIERTO', asig = puede('ciclico_asignar'), capC = c.base && c.base._captura;
          return accionesHtml([
            { t: rc ? 'Reconteo' : 'Cíclico', tono: 'gris', b: [accBtn('Historial', 'historialCiclico()'),
              asig && ab && accBtn('+ Producto', 'agregarProdCicModal()'),
              asig && ini.sedes.length > 1 && ab && accBtn('Sedes', 'editarSedesCiclico()')] },
            { t: 'Cargar', tono: 'azul', b: [asig && cicVeSap(c) && ab && !rc && accBtn(c.archivo ? 'Volver a cargar el Excel' : 'Excel de SAP', "abrirCargaSap('ciclicoAct')", !c.archivo, 'title="Si te equivocaste de Excel, sube el correcto"')] },
            { t: 'Capturar', tono: 'violeta', b: asig && ab && !rc ? [accBtn(capC ? 'Recapturar aéreo' : 'Capturar aéreo', 'capturarCiclico(false)'),
              capC && accBtn('Aéreo de ahora', 'capturarCiclico(true)', false, 'title="Dejar de usar la captura"')] : [],
              nota: capC ? `Aéreo: ${fechaHora(capC.fecha)} · ${esc(capC.por || '—')} ${ayudaHtml('El aéreo de este cíclico es el que se capturó. Lo que muevan o saquen después no lo cambia.')}` : ayudaHtml('Capturar guarda el aéreo de ahora para seguir contando otro día sin que cambie.') },
            { t: 'Descargar', tono: 'verde', b: [puede('reportes') && cicVeSap(c) && accBtn('Excel', 'descargarCiclico()', true)] },
            { t: 'Estado', tono: 'rojo', b: asig ? [ab ? accBtn(`Cerrar ${rc ? 'reconteo' : 'cíclico'}`, "estadoCiclico('CERRADO')") : accBtn('Volver a abrir', "estadoCiclico('ABIERTO')"),
              accBtn('Eliminar', 'borrarCiclico()')] : [] }]);
        })()}
        <div class="cic-progreso"><span class="us-barra-p"><i style="width:${pct}%"></i></span><b>${hechos} de ${d.length}</b> ${rc ? (rcI ? 'recontados' : 'recontados (picking + aéreo)') : 'contados'}</div>
      </section>
      ${(() => {
        const tabs = [];
        if (cicPuedeContar(c)) tabs.push(['ingresar', rcI ? 'Contar' : 'Ingresar'], ['confirmar', 'Consultar']);
        tabs.push(['tabla', cicVeSap(c) ? 'Avance y SAP' : 'Avance y tabla']);   // el avance va arriba de la tabla
        tabs.push(...tabRc);
        if (!tabs.some(t => t[0] === cicSub)) cicSub = tabs[0][0];
        return subTabsHtml(cicSub, tabs, 'cicSub')
          + (cicSub === 'ingresar' ? (rcI ? rcContarHtml() : cpIngresarHtml()) : cicSub === 'confirmar' ? cpConfirmarHtml() : cicSub === 'reconf' ? cicReconfHtml() : '');
      })()}
      ${cicSub !== 'tabla' ? '' : `<div id="cpAvance">${cpAvanceHtml()}</div>
      ${c.estado === 'CERRADO'
        ? `<div class="alerta-fefo">Est${rc ? 'a reconteo' : 'e cíclico'} está cerrad${rc ? 'a' : 'o'}. Para seguir contando, el encargado l${rc ? 'a' : 'o'} tiene que volver a abrir.</div>` : ''}
      ${rc ? `<section class="card col gap8" aria-label="Aéreo">
        <div class="col gap4"><span class="h3">${cicPuedeContar(c) ? '2. ' : ''}Aéreo: revisa cada estiba en el plano</span>
          <span class="muted small">Ve a cada lugar y mira la estiba. Si coincide, <b>Está bien</b>. Si el rótulo tiene la cantidad o el vencimiento mal, <b>Corregir</b> (se arregla el rótulo y el plano, y queda guardado). Si no está, <b>No está</b>.</span></div>
        <div id="cicAereo">${aereoCiclicoHtml()}</div></section>` : ''}
      <section class="card col gap12">
        <div class="cic-filtros">
          <div class="inv-buscar"><label class="lbl" for="cicQ">Buscar</label>
            <input id="cicQ" class="campo" placeholder="Código o nombre" value="${esc(cicF.q)}" autocomplete="off"></div>
          <div><span class="lbl">Mostrar</span>
            <div class="seg seg-c" role="group" aria-label="Mostrar">${[['', 'Todos'], ['pend', 'Pendientes'], ['hecho', 'Contados'], ['dif', 'Con diferencia']].filter(([k]) => k !== 'dif' || cicVeSap(c)).map(([k, t]) =>
              `<button class="${cicF.estado === k ? 'on' : ''}" onclick="cicF.estado='${k}'; pagInicio('cic'); pintarCicTabla(); this.parentNode.querySelectorAll('button').forEach(x => x.classList.toggle('on', x === this))">${t}</button>`).join('')}</div></div>
        </div>
        <div id="cicTabla">${tablaCiclico()}</div>
        <span class="muted small">En unidades. <b>Picking, Calidad y Bloqueado</b> son los que se contaron en este cíclico. <b>Aéreo</b> es lo ubicado en el plano.
          ${cicVeSap(c) ? `<b>SAP</b> ${c.archivo ? 'es el del Excel que se cargó con el cíclico' : 'es el de la pestaña Inventario'}; <b>Diferencia</b> = Total planta − Total SAP. ` : ''}
          ${cicPuedeContar(c) ? 'Toca un producto <b>pendiente</b> para ir a contarlo en su pasillo.' : cicVeSap(c) ? 'Toca un producto para ver su historial.' : ''}</span>
      </section>`}`;
  }

  // Cíclico cerrado: lo que quedó guardado al cerrarlo (aéreo, SAP y estibas revisadas). Lo que entre o salga después no lo cambia.
  //  Los que se cerraron antes de guardar esto: el aéreo se calcula como estaba al cerrarlo (el de hoy menos los movimientos de después).
  const cierreReco = {};   // id → { aereo } | 'pidiendo'
  function cierreCiclico() {
    const c = cicData && cicData.ciclico;
    if (!c || c.estado !== 'CERRADO') return null;
    if (c.base && c.base._cierre) return c.base._cierre;
    const k = cierreReco[c.id];
    if (k && k !== 'pidiendo') return k;
    if (!k && c.cerrado) {
      cierreReco[c.id] = 'pidiendo';
      llamar('bdMovimientosDesde', { codigos: c.codigos, desde: c.cerrado }).then(ms => {
        const aereo = {};
        c.codigos.forEach(cod => { aereo[cod] = 0; });
        sede.lineas.forEach(l => { const e = sede.espPorId[l.ubicacionId]; if (e && e.nivel !== 0 && aereo[l.productoId] !== undefined) aereo[l.productoId] += Number(l.unidades) || 0; });
        ms.forEach(m => {
          const e = sede.espPorId[m.ubicacion];
          if (!e || e.nivel === 0 || aereo[m.codigo] === undefined) return;
          const t = m.tipo.toUpperCase(), signo = /ENTRADA/.test(t) ? 1 : /SALIDA/.test(t) ? -1 : t === 'AJUSTE' ? 1 : 0;
          aereo[m.codigo] -= signo * m.unidades;   // se deshace lo que pasó después del cierre
        });
        Object.keys(aereo).forEach(cod => { aereo[cod] = Math.max(0, +aereo[cod].toFixed(3)); });
        cierreReco[c.id] = { aereo };
        if (vista === 'productos' && ctxCic() && cicData && cicData.ciclico.id === c.id) pintarApp();
      }).catch(() => { delete cierreReco[c.id]; });
    }
    return null;
  }
  // Lo que se guarda al cerrar un cíclico o un reconteo
  function fotoCierreCiclico() {
    const aereo = {}, tot = {}, ok = {}, sap = {};
    datosCiclico().forEach(f => {
      aereo[f.cod] = +Number(f.aereo || 0).toFixed(3);
      if (f.aereoTot !== undefined) { tot[f.cod] = f.aereoTot; ok[f.cod] = f.aereoOk; }
      if (f.sap) sap[f.cod] = { inventario: Number(f.sap.inventario) || 0, calidad: Number(f.sap.calidad) || 0, bloqueado: Number(f.sap.bloqueado) || 0 };
    });
    return { aereo, tot, ok, sap };
  }
  // Aéreo de un producto del cíclico como está ahora en el plano (y en las otras sedes donde se cuenta)
  function aereoVivoCic(cod) {
    let n = 0;
    sede.lineas.forEach(l => { const e = sede.espPorId[l.ubicacionId]; if (l.productoId === cod && e && e.nivel !== 0) n += Number(l.unidades) || 0; });
    // Cíclico en varias sedes: más el aéreo de las otras (el de esta sede es el del plano en vivo)
    const as = (cicData && cicData.aereoSedes) || {};
    Object.keys(as).forEach(sid => { if (sid !== ses.sedeId && as[sid]) n += Number(as[sid][cod]) || 0; });
    return +n.toFixed(3);
  }
  // Capturar el aéreo del cíclico: si se sigue contando otro día, lo que muevan o saquen del aéreo no lo cambia
  function capturarCiclico(quitar, ok) {
    const c = cicData && cicData.ciclico;
    if (!c || sinPermiso('ciclico_asignar')) return;
    if (!quitar && ok !== true) return abrirModal(`<div class="fila-sb"><span class="h2">¿Capturar el aéreo?</span>${btnCerrar()}</div>
      <p class="mt12">Se guarda cuánto hay ahora en el aéreo de los ${c.codigos.length} productos de este cíclico. Si siguen contando otro día y mueven, sacan o llega algo al aéreo, el cíclico no cambia. Lo contado de picking sigue igual.</p>
      ${c.base && c.base._captura ? '<p class="small txt-naranja">Ya había una captura: esta la reemplaza.</p>' : ''}
      <div class="dos mt16"><button class="btn btn-sec btn-xl" onclick="cerrarModal()">Cancelar</button>
        <button class="btn btn-pri btn-xl" onclick="capturarCiclico(false, true)">Sí, capturar</button></div>`);
    const aereo = {};
    if (!quitar) c.codigos.forEach(cod => { aereo[cod] = aereoVivoCic(cod); });
    llamar('bdCapturaCiclico', { id: c.id, aereo: quitar ? null : aereo, usuario: ses.nombre }).then(n => {
      cicData.ciclico = n; const x = (cicLista || []).find(y => y.id === n.id); if (x) x.base = n.base;
      cerrarModal(); toast(quitar ? 'Listo: el aéreo vuelve a ser el de ahora' : 'Aéreo capturado. Pueden seguir mañana sin que cambie.', 'ok'); pintarApp();
    }).catch(e => { cerrarModal(); toast(e.message, 'error'); });
  }
  function datosCiclico() {
    if (!cicData) return [];
    const sap = {}; ((invData && invData.sap) || []).forEach(x => (sap[x.codigo] = x));
    const propio = cicData.ciclico.sap && Object.keys(cicData.ciclico.sap).length ? cicData.ciclico.sap : null;   // el Excel del cíclico
    const rc = esReconf(cicData.ciclico);
    const val = new Set((cicData.validaciones || []).map(v => `${v.ubicacion}|${v.productoId}|${v.lote}`));
    const ci = cierreCiclico();
    return cicData.ciclico.codigos.map(cod => {
      const f = { cod, p: prodDe(cod), sap: propio ? (propio[cod] ? Object.assign({ codigo: cod }, propio[cod]) : (sap[cod] || null)) : (sap[cod] || null), picking: 0, aereo: 0, calidad: 0, bloqueado: 0, contado: false, ult: null, lugares: new Set() };
      if (ci && ci.sap) f.sap = ci.sap[cod] ? Object.assign({ codigo: cod }, ci.sap[cod]) : null;
      const capC = !ci && !rc && cicData.ciclico.base && cicData.ciclico.base._captura;   // aéreo capturado (para seguir otro día)
      if (ci && ci.aereo && ci.aereo[cod] !== undefined) f.aereo = Number(ci.aereo[cod]) || 0;
      else if (capC && capC.aereo) f.aereo = Number(capC.aereo[cod]) || 0;
      else f.aereo = aereoVivoCic(cod);
      cicData.conteos.filter(c => c.codigo === cod).forEach(c => {
        f.contado = true; f.lugares.add(c.ubicacion);
        if (c.tipo === 'CALIDAD') f.calidad += c.cantidad; else if (c.tipo === 'BLOQUEADO') f.bloqueado += c.cantidad; else f.picking += c.cantidad;
        if (!f.ult || c.fecha > f.ult.fecha) f.ult = c;
      });
      f.sapTotal = f.sap ? (Number(f.sap.inventario) || 0) + (Number(f.sap.calidad) || 0) + (Number(f.sap.bloqueado) || 0) : 0;
      f.planta = f.picking + f.aereo + f.calidad + f.bloqueado;
      f.dif = +(f.planta - f.sapTotal).toFixed(3);
      if (rc && ci && ci.tot && ci.tot[cod] !== undefined) { f.aereoTot = ci.tot[cod]; f.aereoOk = ci.ok[cod]; }
      else if (rc) {   // en reconteo también tiene que estar revisado todo su aéreo
        const ls = sede.lineas.filter(l => l.productoId === cod && sede.espPorId[l.ubicacionId] && sede.espPorId[l.ubicacionId].nivel !== 0);
        f.aereoTot = ls.length;
        f.aereoOk = ls.filter(l => val.has(`${l.ubicacionId}|${l.productoId}|${l.lote}`)).length;
      }
      f.listo = f.contado && (!rc || !esRcInv(cicData.ciclico) && f.aereoOk === f.aereoTot || esRcInv(cicData.ciclico));
      // En el reconteo: cómo estaba cuando se pidió
      const b = rc && cicData.ciclico.base ? cicData.ciclico.base[cod] : null;
      if (b) { f.antes = Number(b.planta) || 0; f.difAntes = +(f.planta - f.antes).toFixed(3); }
      // En el cíclico: lo que salió en su último reconteo de este producto
      const r = [...(cicData.reconfs || [])].reverse().find(x => x.ciclico.codigos.includes(cod));
      if (r) {
        const cs = r.conteos.filter(x => x.codigo === cod);
        const t = { PICKING: 0, CALIDAD: 0, BLOQUEADO: 0 }; let u = null;
        cs.forEach(x => { t[x.tipo] = (t[x.tipo] || 0) + x.cantidad; if (!u || x.fecha > u.fecha) u = x; });
        const rb = r.ciclico.base && r.ciclico.base[cod];
        const tot = t.PICKING + f.aereo + t.CALIDAD + t.BLOQUEADO;
        f.rc = cs.length ? { hecho: true, total: tot, difSap: +(tot - f.sapTotal).toFixed(3), difConteo: +(tot - (rb ? Number(rb.planta) || 0 : f.planta)).toFixed(3), ult: u, id: r.ciclico.id }
          : { hecho: false, id: r.ciclico.id };
      }
      return f;
    });
  }

  function tablaCiclico() {
    const todos = datosCiclico();
    const c = cicSel_(), contar = cicPuedeContar(c), veSap = cicVeSap(c);
    if (!veSap && cicF.estado === 'dif') cicF.estado = '';
    const pal = sinTilde(cicF.q.trim()).split(/\s+/).filter(Boolean);
    const l = todos.filter(f => (cicF.estado !== 'pend' || !f.listo) && (cicF.estado !== 'hecho' || f.listo) && (cicF.estado !== 'dif' || (f.contado && f.dif))
      && (!pal.length || pal.every(w => sinTilde(`${f.cod} ${f.p ? f.p.codigoNutresa + ' ' + f.p.nombre : ''}`).includes(w))))
      .sort((a, b) => (a.listo - b.listo) || (a.p ? a.p.nombre : a.cod).localeCompare(b.p ? b.p.nombre : b.cod));
    const lo = aplicarOrden('cic', l, valCic);
    const rc = esReconf(c);
    const difCls = d => !d ? 'dif-ok' : d < 0 ? 'dif-falta' : 'dif-sobra';
    const difH = d => `<span class="dif ${difCls(d)}">${d > 0 ? '+' : ''}${nInv(d)}</span>`;
    const conRc = veSap && !rc && (cicData.reconfs || []).length;          // columnas de reconteo en el cíclico
    const conAntes = veSap && rc && !!cicData.ciclico.base;                // en el reconteo: contra lo que había
    const pg = paginar('cic', lo, pintarCicTabla);
    const clic = f => contar && (!f.contado || !veSap) ? `cicContar('${esc(f.cod)}')` : veSap ? `historialInventario('${esc(f.cod)}')` : '';
    const filas = pg.filas.map(f => `<tr onclick="${clic(f)}" class="${f.listo ? '' : 'cic-pend'}">
        <td>${f.listo ? `<span class="tag ok">${rc ? 'Recontado' : 'Contado'}</span>` : '<span class="tag amar">Pendiente</span>'}</td>
        <td>${esc(f.p ? f.p.codigoNutresa || '—' : '—')}</td>
        <td>${esc(f.cod)}</td>
        <td class="inv-prod">${esc(f.p ? f.p.nombre : 'Producto no está en el catálogo')}</td>
        <td>${esc(f.p ? f.p.unidadMedida || 'UN' : '')}</td>
        ${veSap ? `<td class="num g-sap">${f.sap ? nInv(f.sap.inventario) : '—'}</td>
        <td class="num g-sap">${f.sap ? nInv(f.sap.calidad) : '—'}</td>
        <td class="num g-sap">${f.sap ? nInv(f.sap.bloqueado) : '—'}</td>
        <td class="num g-sap fuerte">${f.sap ? nInv(f.sapTotal) : '—'}</td>` : ''}
        <td class="num">${f.contado ? nInv(f.picking) : '—'}</td>
        <td class="num">${nInv(f.aereo)}${rc && f.aereoTot ? `<span class="muted small ra-n"> ${f.aereoOk}/${f.aereoTot} rev.</span>` : ''}</td>
        <td class="num">${f.contado ? nInv(f.calidad) : '—'}</td>
        <td class="num">${f.contado ? nInv(f.bloqueado) : '—'}</td>
        <td class="num fuerte">${f.contado ? nInv(f.planta) : '—'}</td>
        ${veSap ? `<td class="num">${f.contado ? difH(f.dif) : '—'}</td>` : ''}
        ${conAntes ? `<td class="num g-rc">${f.antes != null ? nInv(f.antes) : '—'}</td><td class="num g-rc">${f.contado && f.antes != null ? difH(f.difAntes) : '—'}</td>` : ''}
        ${conRc ? (f.rc && f.rc.hecho ? `<td class="num g-rc fuerte">${nInv(f.rc.total)}</td><td class="num g-rc">${difH(f.rc.difSap)}</td><td class="num g-rc">${difH(f.rc.difConteo)}</td>
            <td class="small g-rc">${esc(f.rc.ult.usuario || '—')}<span class="muted"> · ${fechaHora(f.rc.ult.fecha)}</span></td>`
          : f.rc ? '<td class="g-rc small muted" colspan="4">Pendiente</td>' : '<td class="g-rc" colspan="4"></td>') : ''}
        <td class="small">${f.ult ? `${esc(f.ult.usuario || '—')}<span class="muted"> · ${fechaHora(f.ult.fecha)}</span>` : '—'}</td>
        ${contar ? `<td class="ec-td">${f.contado ? `<span class="fila gap4">${btnDetalleConteo(f)}${btnEditarConteo(f)}</span>` : ''}</td>` : ''}
      </tr>`).join('');
    const hechos = todos.filter(f => f.listo).length, conDif = todos.filter(f => f.contado && f.dif).length;
    const cols = (veSap ? 16 : 11) + (conRc ? 4 : 0) + (conAntes ? 2 : 0) + (contar ? 1 : 0);
    return `<div class="muted small">${l.length} de ${todos.length} productos · <b>${hechos}</b> ${rc ? 'recontados' : 'contados'} · <b class="${todos.length - hechos ? 'txt-naranja' : ''}">${todos.length - hechos}</b> pendientes${veSap ? ` · <b class="${conDif ? 'txt-rojo' : ''}">${conDif}</b> con diferencia` : ''}</div>
      <div class="tabla-wrap mt8"><table class="tabla inv-tabla">
        <thead>
          <tr class="inv-grupos"><th colspan="5"></th>${veSap ? '<th colspan="4" class="g-sap">SAP' + (c && c.archivo ? ' (Excel del cíclico)' : '') + '</th>' : ''}<th colspan="5">${veSap ? (rc ? 'Planta (lo recontado + plano)' : 'Planta (conteo del cíclico + plano)') : 'Lo contado'}</th>${veSap ? '<th></th>' : ''}${conAntes ? '<th colspan="2" class="g-rc">Contra lo que había</th>' : ''}${conRc ? '<th colspan="4" class="g-rc">Reconteo</th>' : ''}<th></th>${contar ? '<th></th>' : ''}</tr>
          <tr>${thO('cic', 'estado', 'Estado')}${thO('cic', 'nutresa', 'Cód. Nutresa')}${thO('cic', 'cod', 'Cód. Atlantic')}${thO('cic', 'prod', 'Producto')}${thO('cic', 'und', 'Unidad')}
            ${veSap ? thO('cic', 'sapInv', 'Inventario', 'num g-sap') + thO('cic', 'sapCal', 'Calidad', 'num g-sap') + thO('cic', 'sapBlq', 'Bloqueado', 'num g-sap') + thO('cic', 'sapTot', 'Total', 'num g-sap') : ''}
            ${thO('cic', 'pk', 'Picking', 'num')}${thO('cic', 'ae', 'Aéreo', 'num')}${thO('cic', 'cal', 'Calidad', 'num')}${thO('cic', 'blq', 'Bloqueado', 'num')}${thO('cic', 'planta', 'Total', 'num')}
            ${veSap ? thO('cic', 'dif', 'Diferencia', 'num') : ''}
            ${conAntes ? thO('cic', 'antes', 'Había (conteo anterior)', 'num g-rc') + thO('cic', 'difAntes', 'Dif. vs anterior', 'num g-rc') : ''}
            ${conRc ? thO('cic', 'rcTot', 'Recontado', 'num g-rc') + thO('cic', 'rcSap', 'Dif. reconteo vs SAP', 'num g-rc') + thO('cic', 'rcCont', 'Dif. reconteo vs conteo', 'num g-rc') + thO('cic', 'rcQuien', 'Recontó', 'g-rc') : ''}
            ${thO('cic', 'conto', 'Contó')}${contar ? '<th><span class="sr">Corregir</span></th>' : ''}</tr>
        </thead>
        <tbody>${filas || `<tr><td colspan="${cols}" class="muted">No hay productos con ese filtro.</td></tr>`}</tbody></table></div>${pg.barra}`;
  }
  function pintarCicTabla() { if ($('cicTabla')) $('cicTabla').innerHTML = tablaCiclico(); botonPedirRc(); }
  // El botón de pedir reconteo muestra cuántos tienen diferencia (se actualiza al contar)
  function botonPedirRc() {
    const b = $('cicPedirRc');
    if (!b || !cicData) return;
    const n = datosCiclico().filter(f => f.contado && f.dif).length;
    b.textContent = 'Pedir reconteo' + (n ? ` (${n})` : '');
    b.classList.toggle('btn-pri', !!n); b.classList.toggle('btn-sec', !n);
  }

  // Tocar un pendiente: queda listo en el formulario
  function cicContar(cod) {
    if (!$('invProd') || !$('invProd').offsetParent) return cpIrProducto(cod);   // va al pasillo del producto
    const p = prodDe(cod), pr = $('invProd');
    if (!p || !pr) return;
    invForm.prod = cod;
    pr.value = p.id + ' · ' + p.nombre;
    invProdInfo();
    $('invLug').closest('.inv-form').scrollIntoView({ behavior: 'smooth', block: 'start' });
    if (!sede.espPorId[invForm.ubic]) $('invLug').focus({ preventScroll: true }); else $('invCPICKING').focus({ preventScroll: true });
  }  /* ================= Códigos nuevos de ubicación: ALMACÉN-RAK-NIVEL-POSICIÓN =================
     El código interno de cada espacio (SEC-F01-P001-2A) NUNCA cambia: lo ubicado, los rótulos y el historial siguen igual.
     El código nuevo (2000-01-02-01) va al lado: es el que se ve, se imprime y se escanea (el viejo también sirve).
     - Almacén: lo tiene cada zona (Configuración → Códigos). Varias zonas pueden ser del mismo almacén y siguen la numeración.
     - Rak: todas las posiciones del almacén contadas seguidas, sin importar la fila, en forma de gusano (orden y sentido de cada fila).
     - Nivel: picking = 01, nivel 2 = 02… Las filas marcadas como piso (mercancía en el suelo) = 00.
     - Posición: lado A = 01, B = 02, C = 03, D = 04. */
  const LADO_NUM = { A: '01', B: '02', C: '03', D: '04' };
  const pad2 = n => String(n).padStart(2, '0');
  // Código de un espacio que ve la gente: el guardado; si todavía no se han aplicado, el que sale de las reglas.
  // El código interno (con letras) no se muestra.
  const cuNuevo = id => (sede && sede.codigos && sede.codigos[id]) || (sede && sede.espPorId && sede.espPorId[id] ? codGen().porEsp[id] : '') || '';
  const cu = id => cuNuevo(id) || id;
  const tieneCu = id => !!cuNuevo(id);
  // Código de una posición (sin nivel ni lado): 2000-01
  function posCodigo(rackId, p) {
    const e = espaciosDe(rackId, p).find(x => sede.codigos && sede.codigos[x.id]);
    if (e) return sede.codigos[e.id].split('-').slice(0, 2).join('-');
    return codGen().porPos[rackId + '|' + p] || `${rackId}-P${pad3(p)}`;
  }
  // Almacén que se le pone por defecto a una zona según su nombre
  function almacenSugerido(nombre) {
    const n = sinTilde(nombre);
    const num = n.match(/\b(\d{3,6})\b/);
    if (num) return num[1];   // la zona ya se llama con el número del almacén
    if (/CAVA|CONGEL/.test(n)) return '1000';
    if (/REFRI/.test(n)) return '1500';
    if (/SECO|ATEMP/.test(n)) return '2000';
    return '2000';   // cualquier otra zona: 2000 (se cambia en Configuración → Códigos)
  }
  const zonaConocida = nombre => /CAVA|CONGEL|REFRI|SECO|ATEMP|\b\d{3,6}\b/.test(sinTilde(nombre));

  // Columnas del plano: cada fila (o cada tramo de una fila) con dónde está dibujada
  function columnasZona(z) {
    const cols = [];
    racksEnPlano(z).forEach(({ r, x, y, largo, o, tramos }) => {
      if (tramos) {
        let ini = 1;
        tramos.forEach((t, i) => {
          const hasta = Math.min(r.posiciones, ini + t.pos - 1);
          if (hasta >= ini) cols.push({ key: r.id + '#' + (i + 1), r, tramo: i + 1, desde: ini, hasta, x: t.x, y: t.y, largo: t.largo, o: 'V' });
          ini += t.pos;
        });
      } else cols.push({ key: r.id, r, tramo: null, desde: 1, hasta: r.posiciones, x, y, largo, o });
    });
    return cols;
  }
  const nombreCol = c => c.r.nombre + (c.tramo ? ' · tramo ' + c.tramo : '');

  // Reglas: lo guardado + lo que falte (filas o zonas nuevas) con valores por defecto
  function cfgCodigosDe(guardada) {
    const g = guardada || {};
    const cfg = { zonas: {}, columnas: {}, digitos: g.digitos === '3' ? '3' : 'auto' };
    sede.zonas.forEach((z, i) => {
      const x = (g.zonas || {})[z.id] || {};
      cfg.zonas[z.id] = { almacen: x.almacen !== undefined ? String(x.almacen) : almacenSugerido(z.nombre),
        orden: Number(x.orden) || (zonaConocida(z.nombre) ? (i + 1) * 10 : 1000 + (i + 1) * 10) };   // las zonas que no se reconocen van al final
    });
    // Por almacén: las filas de izquierda a derecha (y de abajo hacia arriba), el sentido va alternando (gusano)
    const porAlm = {};
    sede.zonas.forEach(z => columnasZona(z).forEach(c => {
      const a = cfg.zonas[z.id].almacen || 'Z:' + z.id;
      (porAlm[a] = porAlm[a] || []).push(Object.assign(c, { zonaId: z.id }));
    }));
    Object.values(porAlm).forEach(cols => {
      // Filas horizontales: de abajo hacia arriba; verticales: de izquierda a derecha (empezando abajo)
      const horiz = cols.filter(c => c.o === 'H').length > cols.length / 2;
      const bajo = c => c.y + (c.o === 'H' ? 0 : (c.largo || 0));
      cols.sort((a, b) => cfg.zonas[a.zonaId].orden - cfg.zonas[b.zonaId].orden || (horiz ? (b.y - a.y) || a.x - b.x : a.x - b.x || bajo(b) - bajo(a)));
      // Reglas guardadas antes (el orden era dentro de cada zona): se pasa a un solo orden en todo el almacén
      if (g.guardado && !g.v2) cols.sort((a, b) => cfg.zonas[a.zonaId].orden - cfg.zonas[b.zonaId].orden || ((((g.columnas || {})[a.key] || {}).orden || 1e6) - (((g.columnas || {})[b.key] || {}).orden || 1e6)));
      let i = 0;
      cols.forEach(c => {
        const x = (g.columnas || {})[c.key];
        i++;
        const dirDef = c.o === 'H' ? (i % 2 ? 'der' : 'izq') : (i % 2 ? 'sube' : 'baja');
        cfg.columnas[c.key] = x ? { orden: g.v2 ? Number(x.orden) || i * 10 : i * 10, dir: x.dir || dirDef, pasillo: String(x.pasillo || i), piso: !!x.piso, pasManual: !!x.pasManual }
          : { orden: (g.guardado ? 100000 : 0) + i * 10, dir: dirDef, pasillo: String(i), piso: false, nueva: !!g.guardado };
      });
    });
    return normalizarOrden(cfg);
  }

  // Cada almacén se numera solo, desde la fila 1 y el pasillo 1, sin huecos ni números repetidos.
  // Si dos zonas del mismo almacén quedaron con el mismo número de fila (porque una zona se pasó de otro almacén),
  // cada zona va en bloque (en el orden de las zonas) en vez de mezclarse.
  function normalizarOrden(cfg) {
    const porAlm = {};
    sede.zonas.forEach(z => columnasZona(z).forEach(c => {
      if (!cfg.columnas[c.key]) return;
      const a = (cfg.zonas[z.id] || {}).almacen || 'Z:' + z.id;
      (porAlm[a] = porAlm[a] || []).push({ key: c.key, zonaId: z.id });
    }));
    Object.values(porAlm).forEach(cols => {
      const ord = c => Number(cfg.columnas[c.key].orden) || 0, zo = c => Number((cfg.zonas[c.zonaId] || {}).orden) || 0;
      const vistos = {};
      const choque = cols.some(c => { const o = ord(c); if (vistos[o] !== undefined && vistos[o] !== c.zonaId) return true; vistos[o] = c.zonaId; return false; });
      cols.sort((a, b) => choque ? (zo(a) - zo(b) || ord(a) - ord(b)) : (ord(a) - ord(b) || zo(a) - zo(b)));
      cols.forEach((c, i) => { const x = cfg.columnas[c.key]; x.orden = (i + 1) * 10; if (!x.pasManual) x.pasillo = String(i + 1); });
    });
    return cfg;
  }

  // Arma todos los códigos y pasillos con unas reglas
  function generarCodigos(cfg) {
    const res = { porEsp: {}, porPos: {}, pasDe: {}, almacenes: {}, cols: [] };
    const porAlm = {};
    sede.zonas.forEach(z => columnasZona(z).forEach(c => {
      const zc = cfg.zonas[z.id] || { almacen: '', orden: 0 };
      const cc = cfg.columnas[c.key] || { orden: 0, dir: 'sube', pasillo: '1', piso: false };
      const alm = zc.almacen || '';
      const key = alm || 'Z:' + z.id;
      const delPlano = (sede.pasilloDeRack || {})[c.r.id];   // el pasillo armado en el editor del plano manda
      (porAlm[key] = porAlm[key] || []).push(Object.assign({}, c, { zonaId: z.id, zOrden: zc.orden, alm, dir: cc.dir, orden: cc.orden, pasillo: delPlano ? delPlano.nombre : cc.pasillo, piso: cc.piso }));
    }));
    Object.entries(porAlm).forEach(([key, cols]) => {
      cols.sort((a, b) => a.orden - b.orden || a.zOrden - b.zOrden);   // un solo orden en todo el almacén
      const zonasAlm = [...new Set(cols.map(c => c.zonaId))];
      const nomZ = zonasAlm.map(z => sede.zonaPorId[z].nombre).filter(n => n.trim() !== cols[0].alm);
      const info = res.almacenes[key] = { key, alm: cols[0].alm, nombre: cols[0].alm ? cols[0].alm + (nomZ.length ? ' · ' + nomZ.join(' y ') : '') : sede.zonaPorId[zonasAlm[0]].nombre,
        zonas: zonasAlm, pasillos: [], total: 0 };
      let n = 0;
      cols.forEach(c => {
        // Posiciones de esta columna en el orden en que se camina
        const ps = [];
        for (let p = c.desde; p <= c.hasta; p++) if (!c.r.omitidas.includes(p)) ps.push(p);
        const fisico = c.o === 'H' ? (c.dir === 'der') : (c.dir === 'sube');   // true = del 1 hacia arriba / a la derecha (dibujo normal)
        if (fisico === !!c.r.invertida) ps.reverse();
        c.rakDesde = n + 1;
        ps.forEach(p => {
          n++;
          res.pasDe[c.r.id + '|' + p] = { key, pasillo: c.pasillo, rak: n, col: c.key };
        });
        c.rakHasta = n;
        c.ps = ps;
        if (!info.pasillos.includes(c.pasillo)) info.pasillos.push(c.pasillo);
        res.cols.push(c);
      });
      info.total = n;
      const rakTxt = k => cfg.digitos === '3' ? String(k).padStart(3, '0') : (k < 100 ? pad2(k) : String(k));
      cols.forEach(c => (c.ps || []).forEach(p => {
        const x = res.pasDe[c.r.id + '|' + p];
        x.rakTxt = rakTxt(x.rak);
        if (!c.alm) return;   // zona sin almacén: no lleva código nuevo
        res.porPos[c.r.id + '|' + p] = `${c.alm}-${x.rakTxt}`;
        espaciosDe(c.r.id, p).forEach(e => {
          const niv = c.piso && e.nivel === 0 ? '00' : pad2(e.nivel === 0 ? 1 : e.nivel);
          res.porEsp[e.id] = `${c.alm}-${x.rakTxt}-${niv}-${LADO_NUM[e.lado] || e.lado}`;
        });
      }));
      info.pasillos.sort((a, b) => (Number(a) - Number(b)) || String(a).localeCompare(String(b)));
    });
    return res;
  }

  // Reglas de la sede abierta (guardadas o por defecto) y lo que salen: se calcula una vez por cambio
  let codCache = null;
  function codGen() {
    if (codCache && codCache.sede === sede) return codCache.res;
    const cfg = cfgCodigosDe(sede.cfgCodigos);
    codCache = { sede, cfg, res: generarCodigos(cfg) };
    return codCache.res;
  }
  // Pasillo de un espacio (para contar): { key (almacén), pasillo, rak }
  const pasilloDe = id => { const e = sede.espPorId[id]; return e ? codGen().pasDe[e.rackId + '|' + e.posicion] || null : null; };
  const nombreAlm = key => { const a = codGen().almacenes[key]; return a ? a.nombre : key; };

  // Busca un espacio por su código interno o por el nuevo (con o sin guiones)
  function espDeTexto(txt) {
    const t = String(txt || '').trim().toUpperCase(), c = sinGuion(t);
    if (!c) return null;
    return sede.espacios.find(x => x.id === t || cu(x.id) === t) || sede.espacios.find(x => sinGuion(x.id) === c || (tieneCu(x.id) && sinGuion(cu(x.id)) === c)) || null;
  }
  // Posición (sin nivel) por su código nuevo: 2000-01
  function posDeTexto(txt) {
    const c = sinGuion(txt);
    if (!c) return null;
    for (const e of sede.espacios) {
      const cod = cuNuevo(e.id);
      if (!cod) continue;
      const [a, r] = cod.split('-');
      if (sinGuion(a + r) === c) return { rackId: e.rackId, posicion: e.posicion };
    }
    return null;
  }

  /* ----- Configuración → Códigos: reglas del código nuevo, vista del gusano, aplicar e imprimir ----- */
  let cd = null;   // { sede, cfg (borrador), alm (almacén que se ve), cambios }
  function cdIniciar() {
    if (cd && cd.sedeId === ses.sedeId && (cd.cambios || cd.sede === sede)) return;   // lo que se está cambiando no se pierde si llega algo en vivo
    const cfg = cfgCodigosDe(sede.cfgCodigos);
    const g = generarCodigos(cfg);
    cd = { sedeId: ses.sedeId, sede, cfg, alm: (cd && cd.sedeId === ses.sedeId && cd.alm) || Object.keys(g.almacenes)[0] || '', cambios: false };
  }
  function vistaCodigos() {
    if (!sede.zonas.length) return '<p class="muted">Esta sede todavía no tiene plano. Dibújalo en «Editor del plano» y vuelve aquí.</p>';
    cdIniciar();
    const g = generarCodigos(cd.cfg), almacenes = Object.values(g.almacenes);
    if (!g.almacenes[cd.alm]) cd.alm = (almacenes[0] || {}).key || '';
    const totalEsp = sede.espacios.length, conCod = Object.keys(g.porEsp).length;
    const aplicados = Object.keys(sede.codigos || {}).length;
    const distintos = Object.entries(g.porEsp).filter(([id, c]) => (sede.codigos || {})[id] !== c).length;
    const a = g.almacenes[cd.alm];
    const cols = g.cols.filter(c => (c.alm || 'Z:' + c.zonaId) === cd.alm);
    const tap = cd.tap;
    return `<div class="col gap12">
      <section class="card col gap8">
        <div class="fila-sb wrap-f gap8"><span class="h3">Códigos de ubicación <span class="mono-c muted small">ALMACÉN-RAK-NIVEL-POSICIÓN</span></span>
          <details class="cp-ayuda"><summary aria-label="¿Cómo funciona?" title="¿Cómo funciona?">?</summary><div class="cp-ayuda-txt small">
            El <b>rak</b> cuenta todas las posiciones del almacén seguidas, en forma de gusano. Picking es el nivel 01 y el piso (mercancía en el suelo) el 00.
            La posición es el lado: A = 01, B = 02, C = 03, D = 04. Lo que ya está ubicado no cambia: el código va al lado del que ya tiene.</div></details></div>
        <div class="cd-estado ${aplicados && !distintos ? 'cd-ok' : 'cd-pend'}">
          ${!aplicados ? '<b>Falta aplicar los códigos en esta sede.</b> Revisa el gusano y toca «Aplicar códigos».'
            : distintos ? `<b>${distintos} espacio${distintos === 1 ? '' : 's'}</b> con un código distinto al guardado (cambiaste el orden o hay espacios nuevos). Vuelve a aplicar.`
            : `✓ Códigos aplicados en <b>${aplicados}</b> espacios.`}
        </div>
        <span class="lbl">Almacén de cada zona</span>
        <div class="cd-zonas2">${sede.zonas.filter(z => sede.racks.some(r => r.zonaId === z.id)).map(z => `<label class="cd-zona">
          <span><i style="background:${esc(z.color)}"></i>${esc(z.nombre)}</span>
          <input class="campo cd-alm" inputmode="numeric" maxlength="6" value="${esc(cd.cfg.zonas[z.id].almacen)}" placeholder="2000" aria-label="Almacén de ${esc(z.nombre)}" onchange="cdZona('${esc(z.id)}', 'almacen', this.value)"></label>`).join('')}</div>
      </section>

      <section class="card col gap8">
        <div class="tabs">${almacenes.map(x => `<button class="tab ${x.key === cd.alm ? 'on' : ''}" onclick="cd.alm='${esc(x.key)}'; cd.tap=null; pintarApp()">${esc(x.nombre)}</button>`).join('')}</div>
        ${a ? `<div class="cd-barra">
          ${tap ? '' : `<span class="small"><b>Toca una fila del dibujo</b> y abajo le pones su número, dónde empieza y hacia dónde va.</span>
              <span class="flex1"></span>
              <div class="seg seg-c" role="group" aria-label="Orden automático">
                <button onclick="cdAuto('abajo')" title="Empieza abajo a la izquierda">Auto ↗</button><button onclick="cdAuto('arriba')" title="Empieza arriba a la izquierda">Auto ↘</button></div>`}
        </div>
        <div class="cd-dibujo ${tap ? 'cd-tapando' : ''}">${cdDibujo(cols, g)}</div>
        ${cdPanelFila(cols)}
        <div class="fila gap8 wrap-f small muted"><span>● verde = rak 1</span><span>Número grande = orden de la fila</span><span>P = pasillo</span>
          <span class="flex1"></span><label class="fila gap8"><span>Rak de 3 dígitos:</span><select class="campo cd-sel-dig" onchange="cdDig(this.value)">
            <option value="auto" ${cd.cfg.digitos !== '3' ? 'selected' : ''}>solo desde el 100</option><option value="3" ${cd.cfg.digitos === '3' ? 'selected' : ''}>siempre (001)</option></select></label></div>
        <details class="cd-mas"><summary>Pasillos y filas de piso</summary>
          <span class="muted small">Las filas que tienen pasillo en el editor del plano usan ese. Las demás: cada fila es un pasillo; si dos filas se cuentan juntas, ponles el mismo número. «Piso» = mercancía en el suelo (nivel 00).</span>
          <div class="cd-filas mt8">${cols.map((c, i) => `<div class="cd-fila"><b>${i + 1}.</b> <span class="flex1">${esc(nombreCol(c))} <span class="muted small">${esc(sede.zonaPorId[c.zonaId].nombre)} · rak ${c.ps.length ? `${pad2(c.rakDesde)}–${pad2(c.rakHasta)}` : '—'}</span></span>
            ${(sede.pasilloDeRack || {})[c.r.id] ? `<span class="small" title="Se cambia en el editor del plano">Pasillo <b>${esc(sede.pasilloDeRack[c.r.id].nombre)}</b> <span class="muted">(del plano)</span></span>`
              : `<label class="fila gap4 small">Pasillo <input class="campo cd-num" value="${esc(c.pasillo)}" aria-label="Pasillo de ${esc(nombreCol(c))}" onchange="cdCol('${esc(c.key)}', 'pasillo', this.value.trim() || '1')"></label>`}
            <label class="fila gap4 small"><input type="checkbox" ${c.piso ? 'checked' : ''} onchange="cdCol('${esc(c.key)}', 'piso', this.checked)"> Piso</label></div>`).join('')}</div>
        </details>` : ''}
      </section>

      <section class="card col gap8">
        <div class="fila gap8 wrap-f">
          ${cd.cambios ? '<button class="btn btn-sec" onclick="cdGuardar(this)">Guardar sin aplicar</button><button class="btn btn-sec" onclick="cd=null; pintarApp()">Deshacer cambios</button>' : ''}
          <button class="btn btn-pri" onclick="cdRevisar()">Aplicar códigos (${conCod} de ${totalEsp} espacios)</button>
          <span class="flex1"></span>
          ${aplicados ? `<select id="cdEAlm" class="campo" style="max-width:220px" onchange="$('cdEPas').innerHTML = cdOpcPasillos(this.value)">${almacenes.filter(x => x.alm).map(x => `<option value="${esc(x.key)}">${esc(x.nombre)}</option>`).join('')}</select>
            <select id="cdEPas" class="campo" style="max-width:180px">${cdOpcPasillos((almacenes.find(x => x.alm) || {}).key)}</select>
            <label class="fila gap8 small"><input type="checkbox" id="cdENiv" checked> Con niveles</label>
            <button class="btn btn-sec" onclick="cdImprimir()">Imprimir etiquetas</button>` : ''}
        </div>
      </section>
    </div>`;
  }
  const cdOpcPasillos = key => { const a = key && codGen().almacenes[key]; return a ? `<option value="">Todos los pasillos</option>` + a.pasillos.map(p => `<option value="${esc(p)}">Pasillo ${esc(p)}</option>`).join('') : ''; };

  // Dibujo del almacén: cada fila se toca (para ordenarla o cambiarle el sentido), con su número de rak en cada posición
  function cdDibujo(cols, g) {
    if (!cols.length) return '';
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    const filas = [], camino = [];
    cols.forEach((c, k) => {
      const n = c.hasta - c.desde + 1, grueso = c.r.fondo === 'D' ? 44 : 24, largo = c.largo || n * 30, paso = largo / n;
      const centro = {}, cajas = [];
      for (let p = c.desde; p <= c.hasta; p++) {
        const i = p - c.desde;
        let x, y, w, h;
        if (c.o === 'H') { w = paso; h = grueso; y = c.y; x = c.r.invertida ? c.x + largo - (i + 1) * paso : c.x + i * paso; }
        else { w = grueso; h = paso; x = c.x; y = c.r.invertida ? c.y + i * paso : c.y + largo - (i + 1) * paso; }
        x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x + w); y1 = Math.max(y1, y + h);
        const info = g.pasDe[c.r.id + '|' + p];
        centro[p] = [x + w / 2, y + h / 2];
        cajas.push({ x, y, w, h, omit: c.r.omitidas.includes(p), txt: info ? String(info.rak) : '' });
      }
      const pts = c.ps.map(p => centro[p]);
      camino.push(...pts);
      const bx = Math.min(...cajas.map(b => b.x)), by = Math.min(...cajas.map(b => b.y));
      const bw = Math.max(...cajas.map(b => b.x + b.w)) - bx, bh = Math.max(...cajas.map(b => b.y + b.h)) - by;
      filas.push({ c, k, cajas, pts, bx, by, bw, bh });
    });
    const m = 30, W = x1 - x0 + m * 2, H = y1 - y0 + m * 2;
    const tap = cd.tap;
    const ordenTap = key => tap ? tap.indexOf(key) : -1;
    return `<svg viewBox="${x0 - m} ${y0 - m} ${W} ${H}" role="img" aria-label="Orden de las filas del almacén">
      <defs><marker id="cdFl" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" class="cd-fl"/></marker></defs>
      ${camino.length > 1 ? `<polyline points="${camino.map(p => p.join(',')).join(' ')}" class="cd-camino"/>` : ''}
      ${filas.map(f => {
        const t = ordenTap(f.c.key), hecho = (tap && t >= 0) || cd.selCol === f.c.key;
        const num = tap ? (hecho ? t + 1 : '') : f.k + 1;
        const fs = Math.max(8, Math.min(14, Math.min(...f.cajas.map(b => Math.min(b.w, b.h))) * 0.45));
        const a = f.pts[0], z = f.pts[f.pts.length - 1];
        return `<g class="cd-g ${hecho ? 'cd-hecho' : ''}" onclick="cdTocar('${esc(f.c.key)}', event)" data-cx="${f.bx + f.bw / 2}" data-cy="${f.by + f.bh / 2}" role="button" aria-label="${esc(nombreCol(f.c))}">
          <rect x="${f.bx - 4}" y="${f.by - 4}" width="${f.bw + 8}" height="${f.bh + 8}" rx="6" class="cd-fila-bg"/>
          ${f.cajas.map(b => `<rect x="${b.x + .5}" y="${b.y + .5}" width="${Math.max(1, b.w - 1)}" height="${Math.max(1, b.h - 1)}" rx="2" class="${b.omit ? 'cd-omit' : 'cd-pos'}"/>
            ${b.txt && !tap ? `<text x="${b.x + b.w / 2}" y="${b.y + b.h / 2}" font-size="${fs}" class="cd-txt">${b.txt}</text>` : ''}`).join('')}
          ${a && z && f.pts.length > 1 ? (f.c.o === 'H' ? `<line x1="${a[0]}" y1="${f.by + f.bh + 8}" x2="${z[0]}" y2="${f.by + f.bh + 8}" class="cd-dir" marker-end="url(#cdFl)"/>`
            : `<line x1="${f.bx + f.bw + 8}" y1="${a[1]}" x2="${f.bx + f.bw + 8}" y2="${z[1]}" class="cd-dir" marker-end="url(#cdFl)"/>`) : ''}
          ${num !== '' ? `<g transform="translate(${f.bx - 4 + (f.c.o === 'H' ? -18 : f.bw / 2 + 4)}, ${f.by - 4 + (f.c.o === 'H' ? f.bh / 2 + 4 : -18)})"><circle r="15" class="cd-num-c ${tap ? 'tap' : ''}"/><text class="cd-num-t" font-size="15">${num}</text></g>` : ''}
          <text x="${f.bx + f.bw / 2}" y="${f.by + f.bh + (f.c.o === 'H' ? 26 : 16)}" font-size="11" class="cd-lbl">${esc(nombreCol(f.c))} · P${esc(f.c.pasillo)}${f.c.piso ? ' · piso' : ''}</text>
        </g>`;
      }).join('')}
      ${camino.length ? `<circle cx="${camino[0][0]}" cy="${camino[0][1]}" r="7" class="cd-ini"/>` : ''}
    </svg>`;
  }
  function cdCambio() { cd.cambios = true; cd.v = (cd.v || 0) + 1; pintarApp(); }
  function cdZona(id, campo, v) {
    const nuevo = String(v).trim().replace(/\D/g, '');
    if (nuevo === cd.cfg.zonas[id].almacen) return;
    cd.cfg.zonas[id].almacen = nuevo;
    // La zona pasa al final de su nuevo almacén; los dos almacenes se vuelven a numerar desde 1
    const z = sede.zonaPorId[id];
    if (z) columnasZona(z).forEach(c => { const x = cd.cfg.columnas[c.key]; if (x) { x.orden = 1e7 + (Number(x.orden) || 0); x.pasManual = false; } });
    normalizarOrden(cd.cfg);
    if (nuevo) cd.alm = nuevo;
    cdCambio();
  }
  function cdDig(v) { cd.cfg.digitos = v; cdCambio(); }
  function cdCol(key, campo, v) { cd.cfg.columnas[key][campo] = v; if (campo === 'pasillo') cd.cfg.columnas[key].pasManual = true; cdCambio(); }
  const cdColsAlm = () => generarCodigos(cd.cfg).cols.filter(c => (c.alm || 'Z:' + c.zonaId) === cd.alm);
  // Tocar una fila: en modo ordenar le pone el siguiente número; si no, le cambia el sentido
  // Lo que se le pone a la fila tocada: su número (orden), dónde empieza (y hacia dónde va), pasillo y piso
  function cdPanelFila(cols) {
    const i = cols.findIndex(c => c.key === cd.selCol);
    if (i < 0) return '';
    const c = cols[i], H = c.o === 'H';
    const lados = H ? [['der', 'Izquierda', 'va hacia la derecha →'], ['izq', 'Derecha', 'va hacia la izquierda ←']] : [['sube', 'Abajo', 'va hacia arriba ↑'], ['baja', 'Arriba', 'va hacia abajo ↓']];
    return `<div class="cd-panel">
      <div class="fila-sb wrap-f gap8"><span class="h3">${esc(nombreCol(c))} <span class="muted small">${esc(sede.zonaPorId[c.zonaId].nombre)} · rak ${c.ps.length ? `${c.rakDesde} al ${c.rakHasta}` : '—'}</span></span>
        <button class="btn btn-sec btn-mini" onclick="cd.selCol=null; pintarApp()">Cerrar</button></div>
      <div class="cd-panel-g">
        <label class="col gap4"><span class="lbl">Número de la fila</span>
          <select class="campo" onchange="cdPonerOrden('${esc(c.key)}', Number(this.value))">${cols.map((x, k) => `<option value="${k + 1}" ${k === i ? 'selected' : ''}>${k + 1}${k === 0 ? ' (aquí está el rak 1)' : ''}</option>`).join('')}</select></label>
        <div class="col gap4"><span class="lbl">¿Por dónde empieza?</span>
          <div class="seg seg-c">${lados.map(([k, t]) => `<button class="${c.dir === k ? 'on' : ''}" onclick="cdCol('${esc(c.key)}', 'dir', '${k}')">${t}</button>`).join('')}</div>
          <span class="small muted">${(lados.find(x => x[0] === c.dir) || lados[0])[2]}</span></div>
        ${(sede.pasilloDeRack || {})[c.r.id] ? `<div class="col gap4"><span class="lbl">Pasillo</span><b>${esc(sede.pasilloDeRack[c.r.id].nombre)}</b><span class="small muted">Se cambia en el editor del plano</span></div>`
          : `<label class="col gap4"><span class="lbl">Pasillo</span><input class="campo cd-num" value="${esc(c.pasillo)}" onchange="cdCol('${esc(c.key)}', 'pasillo', this.value.trim() || '1')"></label>`}
        <label class="fila gap8 small" style="align-self:end;min-height:44px"><input type="checkbox" ${c.piso ? 'checked' : ''} onchange="cdCol('${esc(c.key)}', 'piso', this.checked)"> Es piso (nivel 00)</label>
      </div></div>`;
  }
  function cdPonerOrden(key, n) {
    const cols = cdColsAlm().map(c => c.key).filter(k => k !== key);
    cols.splice(Math.max(0, n - 1), 0, key);
    cols.forEach((k, i) => { const x = cd.cfg.columnas[k]; x.orden = (i + 1) * 10; if (!x.pasManual) x.pasillo = String(i + 1); });
    cdCambio();
  }
  // Sentido según el lado de la fila que se tocó: la fila empieza por ahí
  function cdLadoTocado(key, ev) {
    const col = cdColsAlm().find(x => x.key === key), g = ev && ev.currentTarget, svg = g && g.ownerSVGElement;
    if (!col || !svg || !svg.getScreenCTM) return null;
    const pt = svg.createSVGPoint(); pt.x = ev.clientX; pt.y = ev.clientY;
    const p = pt.matrixTransform(svg.getScreenCTM().inverse());
    return col.o === 'H' ? (p.x < Number(g.dataset.cx) ? 'der' : 'izq') : (p.y > Number(g.dataset.cy) ? 'sube' : 'baja');
  }
  function cdTocar(key, ev) {
    if (!cd.tap) { cd.selCol = cd.selCol === key ? null : key; return pintarApp(); }
    const lado = cdLadoTocado(key, ev);
    if (cd.tap) {
      const i = cd.tap.indexOf(key);
      if (i >= 0 && i === cd.tap.length - 1) { cd.tap.pop(); cd.tapDir && delete cd.tapDir[key]; }   // tocar la última otra vez = deshacer
      else if (i < 0) { cd.tap.push(key); if (lado) (cd.tapDir = cd.tapDir || {})[key] = lado; }
      if (cd.tap.length === cdColsAlm().length) return cdTapFin();
      return pintarApp();
    }
    const c = cd.cfg.columnas[key];
    const col = cdColsAlm().find(x => x.key === key);
    c.dir = lado || (col && col.o === 'H' ? (c.dir === 'der' ? 'izq' : 'der') : (c.dir === 'sube' ? 'baja' : 'sube'));
    cdCambio();
  }
  function cdTapFin() {
    const cols = cdColsAlm(), orden = cd.tap.concat(cols.map(c => c.key).filter(k => !cd.tap.includes(k)));
    // Gusano: el sentido va alternando en el orden que se tocó (después se puede cambiar tocando la fila)
    orden.forEach((k, i) => { const x = cd.cfg.columnas[k], c = cols.find(y => y.key === k); x.orden = (i + 1) * 10; x.dir = c && c.o === 'H' ? (i % 2 ? 'izq' : 'der') : (i % 2 ? 'baja' : 'sube'); if (!x.pasManual) x.pasillo = String(i + 1); if (cd.tapDir && cd.tapDir[k]) x.dir = cd.tapDir[k]; });
    cd.tap = null; cd.tapDir = null;
    toast('Orden listo. Si una fila empieza por el otro lado, tócala por ese lado.', 'ok');
    cdCambio();
  }
  // Orden automático: de izquierda a derecha (filas verticales) o de abajo hacia arriba (filas horizontales), alternando el sentido
  function cdAuto(desde) {
    const cols = cdColsAlm();
    const horiz = cols.filter(c => c.o === 'H').length > cols.length / 2;
    const bajo = c => c.y + (c.o === 'H' ? 0 : (c.largo || 0));
    const arribaPrimero = desde === 'arriba';
    cols.sort((a, b) => horiz ? ((arribaPrimero ? a.y - b.y : b.y - a.y) || a.x - b.x) : (a.x - b.x || (arribaPrimero ? a.y - b.y : bajo(b) - bajo(a))));
    cols.forEach((c, i) => {
      const x = cd.cfg.columnas[c.key];
      x.orden = (i + 1) * 10;
      if (!x.pasManual) x.pasillo = String(i + 1);
      x.dir = c.o === 'H' ? (i % 2 ? 'izq' : 'der') : ((i % 2 === 0) !== arribaPrimero ? 'sube' : 'baja');
    });
    cdCambio();
  }
  function cdGuardar(b) {
    if (b) b.disabled = true;
    const cfg = { zonas: cd.cfg.zonas, columnas: {}, digitos: cd.cfg.digitos, v2: true };
    Object.entries(cd.cfg.columnas).forEach(([k, c]) => (cfg.columnas[k] = { orden: c.orden, dir: c.dir, pasillo: c.pasillo, piso: !!c.piso, pasManual: !!c.pasManual }));
    return llamar('bdGuardarCfgCodigos', { sedeId: ses.sedeId, cfg, usuario: ses.nombre }).then(x => {
      sede.cfgCodigos = x; codCache = null; cd = null;
      toast('Reglas guardadas. Los pasillos ya se pueden usar para contar.', 'ok');
      pintarApp();
    }).catch(e => { if (b) b.disabled = false; toast(e.message, 'error'); throw e; });
  }

  // Lista de todos los espacios con su código nuevo, antes de aplicar
  let cdLista = null;
  function cdRevisar() {
    const g = generarCodigos(cd.cfg);
    const ant = sede.codigos || {};
    cdLista = sede.espacios.map(e => {
      const r = sede.rackPorId[e.rackId], z = r && sede.zonaPorId[r.zonaId];
      return { id: e.id, nuevo: g.porEsp[e.id] || '', antes: ant[e.id] || '', donde: `${z ? z.nombre : ''} · ${r ? r.nombre : ''} · P${e.posicion} · ${etiqueta(e)}`, rak: (g.pasDe[e.rackId + '|' + e.posicion] || {}).rak || 0 };
    }).sort((a, b) => a.nuevo.localeCompare(b.nuevo, 'es', { numeric: true }));
    cdLista.f = '';
    pintarCdLista();
  }
  function pintarCdLista() {
    const l = cdLista, sin = l.filter(x => !x.nuevo).length, cambian = l.filter(x => x.antes && x.nuevo && x.antes !== x.nuevo).length;
    const ver = l.filter(x => !l.f || (l.f === 'sin' ? !x.nuevo : l.f === 'cambian' ? x.antes && x.antes !== x.nuevo : true));
    const pg = paginar('cdL', ver, pintarCdLista);
    abrirModal(`<div class="fila-sb"><span class="h2">Revisar códigos nuevos</span>${btnCerrar()}</div>
      <div class="inv-res mt12">
        <div><span class="muted small">Con código nuevo</span><b>${l.length - sin}</b></div>
        <div><span class="muted small">Sin código (zona sin almacén)</span><b class="${sin ? 'txt-naranja' : ''}">${sin}</b></div>
        <div><span class="muted small">Cambian (ya tenían otro)</span><b class="${cambian ? 'txt-rojo' : ''}">${cambian}</b></div></div>
      ${cambian ? '<div class="alerta-fefo mt8">Algunos espacios ya tenían un código nuevo y van a cambiar: sus etiquetas impresas dejan de servir y hay que volver a imprimirlas.</div>' : ''}
      <div class="seg seg-c mt12" role="group" aria-label="Mostrar">${[['', 'Todos'], ['cambian', 'Los que cambian'], ['sin', 'Sin código']].map(([k, t]) =>
        `<button class="${l.f === k ? 'on' : ''}" onclick="cdLista.f='${k}'; pagInicio('cdL'); pintarCdLista()">${t}</button>`).join('')}</div>
      <div class="tabla-wrap mt8"><table class="tabla"><thead><tr><th>Código nuevo</th><th>Código interno (no cambia)</th><th>Dónde</th>${l.some(x => x.antes) ? '<th>Tenía</th>' : ''}</tr></thead><tbody>
        ${pg.filas.map(x => `<tr><td class="mono-c fuerte">${esc(x.nuevo || '—')}</td><td class="mono-c">${esc(x.id)}</td><td class="small">${esc(x.donde)}</td>
          ${l.some(y => y.antes) ? `<td class="mono-c ${x.antes && x.antes !== x.nuevo ? 'txt-rojo' : 'muted'}">${esc(x.antes || '—')}</td>` : ''}</tr>`).join('') || '<tr><td colspan="4" class="muted">Nada con ese filtro.</td></tr>'}
      </tbody></table></div>${pg.barra}
      <p id="fErr" class="error" hidden></p>
      <div class="fila gap8 wrap-f mt16">
        <button class="btn btn-sec" onclick="cdExcel()">Descargar Excel</button>
        <span class="flex1"></span>
        <button class="btn btn-sec btn-xl" onclick="cerrarModal()">Seguir revisando</button>
        <button id="cdAplOk" class="btn btn-pri btn-xl" onclick="cdAplicar()" ${l.length - sin ? '' : 'disabled'}>Aplicar ${l.length - sin} códigos</button></div>`, 'modal-ancho');
  }
  function cdExcel() {
    descargarExcel(`Códigos nuevos ${nombreSede(ses.sedeId)} ${hoyISO()}.xlsx`, { 'Códigos': cdLista.map(x => ({ 'Código nuevo': x.nuevo, 'Código interno': x.id, 'Dónde': x.donde, 'Tenía': x.antes })) }, 'estructura');
  }
  function cdAplicar() {
    const b = $('cdAplOk'); b.disabled = true; b.textContent = 'Guardando…';
    const codigos = cdLista.filter(x => x.nuevo).map(x => [x.id, x.nuevo]);
    cdGuardar(null)
      .then(() => llamar('bdAplicarCodigos', { sedeId: ses.sedeId, codigos, usuario: ses.nombre }))
      .then(n => llamar('bdSede', ses.sedeId).then(d => { setSede(d); codCache = null; cd = null; cerrarModal(); toast(`Listo: ${n} espacios con su código nuevo. Ya los puedes escanear e imprimir.`, 'ok'); pintarApp(); }))
      .catch(e => { errForm(e.message); b.disabled = false; b.textContent = `Aplicar ${codigos.length} códigos`; });
  }
  function cdImprimir() {
    const key = $('cdEAlm').value, pas = $('cdEPas').value, niv = $('cdENiv').checked;
    const g = codGen(), lista = [];
    g.cols.filter(c => (c.alm || 'Z:' + c.zonaId) === key && (!pas || c.pasillo === pas)).forEach(c => c.ps.forEach(p => {
      const esps = espaciosDe(c.r.id, p);
      if (!esps.length) return;
      const z = sede.zonaPorId[c.r.zonaId];
      lista.push({ titulo: posCodigo(c.r.id, p), sub: `${z.nombre} · Pasillo ${c.pasillo}`, codigo: posCodigo(c.r.id, p) });
      if (niv) [...esps].sort((a, b) => a.nivel - b.nivel || a.lado.localeCompare(b.lado))
        .forEach(e => lista.push({ titulo: cu(e.id), sub: `${z.nombre} · Pasillo ${c.pasillo} · ${etiqueta(e)}`, codigo: cu(e.id) }));
    }));
    if (!lista.length) return toast('Ese pasillo no tiene espacios con código nuevo', 'error');
    imprimirEtiquetas(lista);
  }

/* ================= Contar por almacén y pasillo (Inventario y Cíclico) =================
     Quien cuenta escoge almacén → pasillo y le sale una tabla con los productos de ese pasillo:
     llena picking, confirma calidad y bloqueado (vienen de lo que cargó el encargado) y el aéreo queda confirmado.
     El jefe ve el avance de cada pasillo y de cada persona, y asigna pasillos. */
  const cp = { alm: '*', pas: '*', ver: 'pend', todos: false, extra: [], foco: '', sinUb: false, q: '' };
  let invSub = 'ingresar', cicSub = 'ingresar';

  // De dónde salen los datos: el Inventario o el cíclico abierto
  function cpScope() {
    if (ctxCic() && cicData) {
      const c = cicData.ciclico;
      const sap = {}; ((invData && invData.sap) || []).forEach(x => (sap[x.codigo] = x));
      const propio = c.sap && Object.keys(c.sap).length ? c.sap : null;
      return { cic: c, id: c.id, conteos: cicData.conteos || [], val: cicData.validaciones || [], codigos: new Set(c.codigos),
        asig: cicData.asignaciones || [], abierto: c.estado === 'ABIERTO', sapDe: cod => propio ? propio[cod] || sap[cod] || null : sap[cod] || null };
    }
    // Todos los conteos del inventario en curso (el servidor ya trae solo los de este inventario).
    // Antes se escondían los que se hicieron antes de cargar el Excel de SAP: por eso al volver a cargarlo
    // «Lo último que contaste» y Consultar quedaban vacíos.
    const sap = {}; ((invData && invData.sap) || []).forEach(x => (sap[x.codigo] = x));
    return { cic: null, id: null, conteos: (invData && invData.conteos) || [], val: (invData && invData.validaciones) || [],
      codigos: null, asig: (invData && invData.asignaciones) || [], abierto: true, sapDe: cod => sap[cod] || null };
  }
  const cpPuedeContar = S => S.cic ? cicPuedeContar(S.cic) : puede('inv_contar');
  const cpJefe = S => puede('ciclico_asignar') || (S.cic ? cicVeSap(S.cic) : puede('inv_sap'));
  const cpMias = S => S.asig.filter(a => a.usuarioId ? a.usuarioId === ses.id : a.nombre === ses.nombre);

  // Todas las filas (producto + pasillo) del alcance, agrupadas por "almacén|pasillo"
  function cpTodo(S) {
    S = S || cpScope();
    const ult = {};
    S.val.forEach(v => { ult[`${v.ubicacion}|${v.productoId}|${v.lote}`] = v; });
    const grupos = {}, porCod = {};
    const fila = (x, cod) => {
      const k = x.key + '|' + x.pasillo;
      const g = grupos[k] || (grupos[k] = {});
      return g[cod] || (g[cod] = { cod, p: prodDe(cod), key: x.key, pasillo: x.pasillo, lineas: [], conteos: [], rak: 1e9, ubicExtra: '' });
    };
    const ok = cod => !S.codigos || S.codigos.has(cod);
    sede.lineas.forEach(l => {
      const x = pasilloDe(l.ubicacionId);
      if (!x || !ok(l.productoId)) return;
      const f = fila(x, l.productoId); f.lineas.push(l); f.rak = Math.min(f.rak, x.rak);
    });
    S.conteos.forEach(c => {
      const x = pasilloDe(c.ubicacion);
      if (!x || !ok(c.codigo)) return;
      const f = fila(x, c.codigo); f.conteos.push(c); f.rak = Math.min(f.rak, x.rak);
    });
    cp.extra.filter(e => e.scope === (S.id || 'inv')).forEach(e => {
      const x = pasilloDe(e.ubic);
      if (!x || !ok(e.cod)) return;
      const f = fila(x, e.cod); if (!f.ubicExtra) f.ubicExtra = e.ubic; f.rak = Math.min(f.rak, x.rak);
    });
    // Conteos en lugares sin pasillo y productos que no están en el plano: van en la misma tabla (lugar: picking)
    const sinP = { key: '', pasillo: '' };
    S.conteos.forEach(c => { if (!pasilloDe(c.ubicacion) && ok(c.codigo)) fila(sinP, c.codigo).conteos.push(c); });
    const enAlguno = new Set(Object.values(grupos).flatMap(g => Object.keys(g)));
    const todos = S.codigos ? [...S.codigos] : ((invData && invData.sap) || []).map(x => x.codigo);
    todos.forEach(cod => { if (!enAlguno.has(cod) && prodDe(cod)) fila(sinP, cod); });
    Object.values(grupos).forEach(g => Object.values(g).forEach(f => {
      const enPk = f.lineas.find(l => sede.espPorId[l.ubicacionId].nivel === 0);
      const orden = [...f.lineas].sort((a, b) => (pasilloDe(a.ubicacionId).rak - pasilloDe(b.ubicacionId).rak) || sede.espPorId[a.ubicacionId].nivel - sede.espPorId[b.ubicacionId].nivel);
      // El conteo es del picking: el lugar es el picking de la posición donde está el producto (después se organiza)
      const pkDe = id => { const e = sede.espPorId[id]; if (!e) return ''; const pk = espaciosDe(e.rackId, e.posicion).filter(x => x.nivel === 0).sort((a, b) => a.lado.localeCompare(b.lado))[0]; return pk ? pk.id : id; };
      f.ubic = (f.conteos[0] && f.conteos[0].ubicacion) || (enPk && enPk.ubicacionId) || (orden[0] && pkDe(orden[0].ubicacionId)) || (f.ubicExtra && pkDe(f.ubicExtra)) || f.ubicExtra || 'PICKING';
      f.aereo = f.lineas.filter(l => sede.espPorId[l.ubicacionId].nivel !== 0).map(l => ({ l, v: ult[`${l.ubicacionId}|${l.productoId}|${l.lote}`] || null }));
      f.aereoUnd = f.aereo.reduce((a, x) => a + (Number(x.l.unidades) || 0), 0);
      f.aereoPend = f.aereo.filter(x => !x.v).length;
      f.cant = { PICKING: 0, CALIDAD: 0, BLOQUEADO: 0 };
      f.conteos.forEach(c => { f.cant[c.tipo] = (f.cant[c.tipo] || 0) + c.cantidad; });
      f.contado = f.conteos.some(c => c.tipo === 'PICKING');   // solo calidad no cuenta como contado
      f.listo = f.contado;   // aquí solo se confirma el picking
      f.ult = f.conteos.reduce((a, c) => !a || c.fecha > a.fecha ? c : a, null);
      (porCod[f.cod] = porCod[f.cod] || []).push(f);
    }));
    return { grupos, porCod, S };
  }
  // Productos del alcance que no están en ningún pasillo (ni en el plano ni contados)
  function cpSinUbicar(T) {
    return Object.values(T.grupos['|'] || {}).filter(f => !f.contado);
  }
  // Resumen de cada pasillo: total, listos y a quién está asignado
  function cpPasillos(T) {
    const g = codGen(), out = [];
    Object.values(g.almacenes).forEach(a => a.pasillos.forEach(pas => {
      const filas = Object.values(T.grupos[a.key + '|' + pas] || {});
      const asig = T.S.asig.filter(x => x.almacen === a.key && x.pasillo === pas);
      const ult = filas.reduce((u, f) => f.ult && (!u || f.ult.fecha > u.fecha) ? f.ult : u, null);
      out.push({ key: a.key, alm: a.nombre, pas, total: filas.length, listos: filas.filter(f => f.listo).length, asig, ult });
    }));
    const sinP = Object.values(T.grupos['|'] || {});
    if (sinP.length) out.push({ key: '', alm: 'Sin lugar en el plano', pas: '', total: sinP.length, listos: sinP.filter(f => f.listo).length, asig: [],
      ult: sinP.reduce((u, f) => f.ult && (!u || f.ult.fecha > u.fecha) ? f.ult : u, null) });
    return out;
  }
  // Inventario: cada producto va en su pasillo: el cargado para esta sede («Actualizar almacenes y pasillos»);
  // si no tiene, el del plano donde está su picking; si no tiene picking, el de su aéreo. Listo = ya se contó su picking.
  function invPasillosProd(S) {
    const g = codGen(), sid = ses.sedeId;
    asegurarUbicSede(sid);
    if (!invData || invData.error) return [];
    // Igual que la lista de Avance y SAP: un producto cuenta en cada pasillo del plano donde está (picking, aéreo o donde lo contaron).
    // Con el interruptor encendido, también en su pasillo cargado.
    const enOtro = {};
    sede.lineas.forEach(l => {
      const e = sede.espPorId[l.ubicacionId];
      if (!e || pasilloDe(l.ubicacionId)) return;
      // Está en el plano pero su fila no tiene pasillo con código: el pasillo del editor del plano; si no, la fila (rack)
      const pa = (sede.pasilloDeRack || {})[e.rackId], r = sede.rackPorId[e.rackId];
      (enOtro[l.productoId] = enOtro[l.productoId] || new Set()).add('|' + (pa ? pa.nombre : 'Fila ' + ((r && r.nombre) || e.rackId)));
    });
    const ult = {}, contado = new Set();
    S.conteos.forEach(c => { if (c.tipo === 'PICKING') contado.add(c.codigo); if (!ult[c.codigo] || c.fecha > ult[c.codigo].fecha) ult[c.codigo] = c; });
    const keyAlm = a => { const x = Object.values(g.almacenes).find(y => String(y.alm) === String(a)); return x ? x.key : String(a); };
    const grupos = {}, nCarg = new Set(), carg = usarPasCargado();
    datosInventario().forEach(f => {
      const cod = f.cod;
      if (!f.p) return;
      if (f.contado) contado.add(cod);
      // Encendido: solo lo cargado (almacén y pasillo como se cargaron). Apagado: los pasillos del plano.
      const ks = new Set(carg ? [] : f.pas);
      if (carg) pasCargadosDe(cod, sid).forEach(y => { ks.add(y.almacen + '|' + y.pasillo); nCarg.add(cod); });
      if (!carg && !ks.size && enOtro[cod]) enOtro[cod].forEach(k => ks.add(k));
      // Sin pasillo: los del inventario (con SAP o contados) que no tienen pasillo cargado ni están en el plano
      if (!ks.size && (f.sap || f.contado || f.planta)) ks.add('|');
      ks.forEach(k => (grupos[k] = grupos[k] || []).push(cod));
    });
    const resumen = cs => ({ total: cs.length, listos: cs.filter(c => contado.has(c)).length, ult: cs.reduce((u, c) => ult[c] && (!u || ult[c].fecha > u.fecha) ? ult[c] : u, null) });
    const out = [], vistos = new Set(['|']);
    if (!carg) Object.values(g.almacenes).forEach(a => a.pasillos.forEach(pas => {
      const k = a.key + '|' + pas; vistos.add(k);
      out.push(Object.assign({ key: a.key, alm: a.nombre, pas, asig: S.asig.filter(x => x.almacen === a.key && x.pasillo === pas) }, resumen(grupos[k] || [])));
    }));
    // Pasillos cargados que no están en el plano (ej. «Conge»)
    Object.keys(grupos).filter(k => !vistos.has(k)).sort((x, y) => x.localeCompare(y, 'es', { numeric: true })).forEach(k => {
      const [key, pas] = k.split('|');
      out.push(Object.assign({ key, alm: key ? (carg ? key : nombreAlm(key)) : '—', pas, asig: S.asig.filter(x => x.almacen === key && x.pasillo === pas) }, resumen(grupos[k])));
    });
    const num_ = (a, b) => String(a).localeCompare(String(b), 'es', { numeric: true });
    out.sort((a, b) => (a.key ? 0 : 1) - (b.key ? 0 : 1) || num_(a.key, b.key) || num_(a.pas, b.pas));
    if (grupos['|']) out.push(Object.assign({ key: '', alm: carg ? 'Sin pasillo cargado' : 'Sin pasillo', pas: '', asig: [] }, resumen(grupos['|'])));
    out.cargados = nCarg.size;
    return out;
  }
  const cpPct = (a, b) => b ? Math.round(a * 100 / b) : 0;
  const cpBarra = (a, b) => `<span class="us-barra-p cp-barra"><i style="width:${cpPct(a, b)}%"></i></span>`;

  /* ----- Pestaña Contar ----- */
  function cpContarHtml() {
    const S = cpScope();
    if (!cpPuedeContar(S)) return S.cic && S.cic.estado === 'CERRADO' ? '<div class="alerta-fefo">Este cíclico está cerrado. Para seguir contando, el encargado lo tiene que volver a abrir.</div>'
      : '<p class="muted">No tienes permiso para contar. Pídeselo al administrador.</p>';
    const T = cpTodo(S);
    cpVisibles(T);
    return `<section class="card col gap8 cp-elegir">
        <div class="cp-sel">
          <div><label class="lbl" for="cpAlm">Almacén</label><select id="cpAlm" class="campo" onchange="cp.alm=this.value; cp.pas='*'; pagInicio('cp'); pintarApp()">${cpOpcAlm(T)}</select></div>
          ${cp.alm !== '*' ? `<div><label class="lbl" for="cpPas">Pasillo</label><select id="cpPas" class="campo" onchange="cp.pas=this.value; pagInicio('cp'); pintarApp()">${cpOpcPas(T)}</select></div>` : ''}
          <div class="cp-buscar"><label class="lbl" for="cpQ">Buscar producto</label>${campoConCamara(`<input id="cpQ" class="campo" type="search" autocomplete="off" spellcheck="false" placeholder="Código Nutresa, Atlantic o nombre" value="${esc(cp.q)}">`, 'cpQ')}</div>
        </div>
        ${cpMias(S).length ? `<label class="fila gap8 small cp-mios"><input type="checkbox" ${cp.todos ? '' : 'checked'} onchange="cp.todos=!this.checked; pintarApp()"> Solo mis pasillos</label>` : ''}
        <div class="cp-prog small">${cpProgAlm(T)}</div>
        <div id="cpTabla">${cpTablaHtml(T)}</div>
      </section>`;
  }
  // Almacenes y pasillos que ve la persona (si le asignaron, solo los suyos)
  function cpVisibles(T) {
    const S = T.S, mias = cpMias(S), soloMias = mias.length && !cp.todos;
    const ps = cpPasillos(T).filter(x => x.total && (!soloMias || mias.some(a => a.almacen === x.key && a.pasillo === x.pas)));
    const alms = [...new Set(ps.map(x => x.key).filter(Boolean))];
    if (cp.alm !== '*' && !alms.includes(cp.alm)) { cp.alm = '*'; cp.pas = '*'; }
    if (!cp.alm) cp.alm = '*';
    const delAlm = ps.filter(x => cp.alm === '*' || x.key === cp.alm);
    if (cp.pas !== '*' && !delAlm.some(x => x.pas === cp.pas)) cp.pas = '*';
    return { ps, alms, delAlm, soloMias, mias };
  }
  const cpFaltaTxt = (l, t) => t - l ? `faltan ${t - l} de ${t}` : '✓ listo';
  const cpSuma = xs => ({ t: xs.reduce((a, x) => a + x.total, 0), l: xs.reduce((a, x) => a + x.listos, 0) });
  function cpOpcAlm(T) {
    const { ps, alms } = cpVisibles(T), tot = cpSuma(ps);
    return `<option value="*" ${cp.alm === '*' ? 'selected' : ''}>Todos · ${cpFaltaTxt(tot.l, tot.t)}</option>` + alms.map(k => { const x = cpSuma(ps.filter(y => y.key === k));
      return `<option value="${esc(k)}" title="${esc(nombreAlm(k))}" ${k === cp.alm ? 'selected' : ''}>${esc(nombreAlm(k))} · ${x.t - x.l ? 'faltan ' + (x.t - x.l) : '✓ listo'}</option>`; }).join('');
  }
  function cpOpcPas(T) {
    const { delAlm } = cpVisibles(T), x = cpSuma(delAlm);
    return `<option value="*" ${cp.pas === '*' ? 'selected' : ''}>Todos los pasillos · ${cpFaltaTxt(x.l, x.t)}</option>`
      + delAlm.map(y => `<option value="${esc(y.pas)}" ${y.pas === cp.pas ? 'selected' : ''}>Pasillo ${esc(y.pas)} · ${cpFaltaTxt(y.listos, y.total)}</option>`).join('');
  }
  function cpProgAlm(T) {
    const { delAlm } = cpVisibles(T);
    const x = cpSuma(cp.pas === '*' ? delAlm : delAlm.filter(y => y.pas === cp.pas));
    return `${cpBarra(x.l, x.t)} <span><b>${x.l} de ${x.t}</b> listos · faltan <b>${x.t - x.l}</b></span>`;
  }

  function cpTablaHtml(T) {
    T = T || cpTodo();
    const S = T.S, V = cpVisibles(T);
    const deMis = f => !V.soloMias || V.mias.some(a => a.almacen === f.key && a.pasillo === f.pasillo);
    const enSel = f => deMis(f) && (cp.alm === '*' || (f.key === cp.alm && (cp.pas === '*' || f.pasillo === cp.pas)));
    const filas = Object.values(T.grupos).flatMap(g => Object.values(g)).filter(enSel)
      .sort((a, b) => (a.key === '') - (b.key === '') || String(a.key).localeCompare(String(b.key)) || a.rak - b.rak || (a.p ? a.p.nombre : a.cod).localeCompare(b.p ? b.p.nombre : b.cod));
    const listos = filas.filter(f => f.listo).length;
    const pal = sinTilde(cp.q.trim()).split(/\s+/).filter(Boolean);
    const busca = f => !pal.length || pal.every(w => sinTilde(`${f.cod} ${f.p ? f.p.codigoNutresa + ' ' + f.p.nombre + ' ' + (f.p.codigoBarras || '') : ''}`).includes(w));
    // Al buscar se ven todos (listos y que faltan); si no, primero los que faltan
    const ver = filas.filter(f => busca(f) && (pal.length || cp.ver === 'todos' || (cp.ver === 'pend' ? !f.listo : f.listo)));
    const pg = paginar('cp', ver, cpRepintar);
    cpFilasVis = pg.filas;
    // Calidad y bloqueado: los del Excel que cargó el encargado, solo la primera vez que se cuenta el producto
    const yaTipo = (cod, tipo) => S.conteos.some(c => c.codigo === cod && c.tipo === tipo);
    const pre = (f, tipo) => {
      if (f.contado) return f.cant[tipo];
      if (yaTipo(f.cod, tipo)) return 0;
      const s = S.sapDe(f.cod); return s ? Number(tipo === 'CALIDAD' ? s.calidad : s.bloqueado) || 0 : 0;
    };
    const lugar = f => { const e = sede.espPorId[f.ubic]; return e ? cu(e.id) : 'Picking'; };
    return `<div class="fila-sb wrap-f gap8 cp-cab">
        <span class="fila gap8"><span class="small"><b>${ver.length}</b> producto${ver.length === 1 ? '' : 's'}</span>
          <details class="cp-ayuda"><summary aria-label="¿Cómo se llena?" title="¿Cómo se llena?">?</summary>
            <div class="cp-ayuda-txt small">Escribe el <b>picking</b>. <b>Calidad</b> y <b>bloqueado</b> ya vienen del Excel: si está igual, déjalo. Toca <b>✓</b> o Enter y pasa al siguiente.</div></details></span>
        <div class="seg seg-c" role="group" aria-label="Mostrar">${[['pend', `Faltan ${filas.length - listos}`], ['listos', `Listos ${listos}`], ['todos', 'Todos']].map(([k, t]) =>
          `<button class="${cp.ver === k && !pal.length ? 'on' : ''}" onclick="cp.ver='${k}'; cp.q=''; if ($('cpQ')) $('cpQ').value=''; pagInicio('cp'); cpRepintar()">${t}</button>`).join('')}</div>
      </div>
      ${ver.length ? `<div class="tabla-wrap"><table class="tabla cp-tabla"><thead><tr><th>Lugar</th><th>Cód. Nutresa</th><th>Cód. Atlantic</th><th>Producto</th><th>Unidad</th><th class="num">Picking</th><th class="num">Calidad</th><th class="num">Bloqueado</th><th></th></tr></thead><tbody>
        ${pg.filas.map((f, i) => `<tr class="${f.listo ? 'cp-listo' : ''}" data-cod="${esc(f.cod)}">
          <td class="mono-c small" data-l="Lugar">${esc(lugar(f))}</td>
          <td class="mono-c" data-l="Nutresa">${esc(f.p ? f.p.codigoNutresa || '—' : '—')}</td>
          <td class="mono-c" data-l="Atlantic">${esc(f.cod)}</td>
          <td class="cp-prod" data-l="Producto"><b>${esc(f.p ? f.p.nombre : f.cod)}</b></td>
          <td data-l="Unidad">${esc(f.p ? f.p.unidadMedida || 'UN' : '')}</td>
          ${['PICKING', 'CALIDAD', 'BLOQUEADO'].map(t => `<td class="num" data-l="${t === 'PICKING' ? 'Picking' : t === 'CALIDAD' ? 'Calidad' : 'Bloqueado'}">
            <input class="campo cp-in" id="cp${t[0]}${i}" type="number" inputmode="decimal" min="0" step="any" ${S.abierto ? '' : 'disabled'}
              value="${t === 'PICKING' && !f.contado ? '' : pre(f, t)}" placeholder="0" data-i="${i}" aria-label="${t === 'PICKING' ? 'Picking' : t === 'CALIDAD' ? 'Calidad' : 'Bloqueado'} de ${esc(f.p ? f.p.nombre : f.cod)}"></td>`).join('')}
          <td data-l="">${S.abierto ? `<button class="btn ${f.listo ? 'btn-sec' : 'btn-ent-solido'} cp-ok" id="cpOk${i}" onclick="cpGuardar(${i})" aria-label="${f.listo ? 'Guardar de nuevo' : 'Listo'} ${esc(f.p ? f.p.nombre : f.cod)}" title="${f.listo && f.ult ? 'Contó ' + esc(f.ult.usuario || '') : 'Guardar'}">${f.listo ? '✓ Listo' : '✓'}</button>` : f.listo ? '<span class="tag ok">Listo</span>' : ''}</td>
        </tr>`).join('')}
      </tbody></table></div>${pg.barra}`
      : `<p class="muted">${pal.length ? 'Ningún producto coincide con la búsqueda.' : cp.ver === 'pend' ? '✓ Ya está todo.' : 'Nada con ese filtro.'}</p>`}`;
  }
  let cpFilasVis = [];
  function cpLugaresPasillo() {
    const g = codGen();
    return sede.espacios.filter(e => { const x = g.pasDe[e.rackId + '|' + e.posicion]; return x && x.key === cp.alm && x.pasillo === cp.pas; })
      .sort((a, b) => g.pasDe[a.rackId + '|' + a.posicion].rak - g.pasDe[b.rackId + '|' + b.posicion].rak || a.nivel - b.nivel || a.lado.localeCompare(b.lado));
  }
  function cpRepintar() {
    if ($('cpTabla')) { $('cpTabla').innerHTML = cpTablaHtml(); cpEnlazar(); }
    if ($('cpAvance')) $('cpAvance').innerHTML = cpAvanceHtml();
    if ($('cpAlm')) {   // avance del almacén y de cada pasillo, sin perder lo que se escribe
      const T = cpTodo();
      $('cpAlm').innerHTML = cpOpcAlm(T); $('cpPas').innerHTML = cpOpcPas(T);
      const pr = document.querySelector('.cp-prog'); if (pr) pr.innerHTML = cpProgAlm(T);
    }
    if ($('cicTabla')) { $('cicTabla').innerHTML = tablaCiclico(); }
    const cc = document.querySelector('.cic-progreso');
    if (cc && ctxCic() && cicData) { const d = datosCiclico(), h = d.filter(f => f.listo).length; cc.querySelector('b').textContent = `${h} de ${d.length}`; cc.querySelector('i').style.width = cpPct(h, d.length) + '%'; }
    if ($('invTabla')) pintarInvTabla();
  }
  // Enter pasa al siguiente campo; en el último, guarda y salta al siguiente producto
  function cpEnlazar() {
    const q = $('cpQ');
    if (q && !q.dataset.ok) {
      q.dataset.ok = '1';
      q.addEventListener('input', () => { cp.q = q.value; pagInicio('cp'); if ($('cpTabla')) { $('cpTabla').innerHTML = cpTablaHtml(); cpEnlazar(); } });
      q.addEventListener('keydown', ev => { if (ev.key === 'Enter') { ev.preventDefault(); const el = $('cpP0'); if (el) el.focus(); } });
    }
    document.querySelectorAll('.cp-in').forEach(c => {
      c.addEventListener('focus', () => c.select());
      c.addEventListener('keydown', ev => {
        if (ev.key !== 'Enter') return;
        ev.preventDefault();
        const i = Number(c.dataset.i), orden = ['P', 'C', 'B'], k = orden.indexOf(c.id[2]);
        if (k < 2) $(`cp${orden[k + 1]}${i}`).focus(); else cpGuardar(i);
      });
    });
    if (cp.foco) {
      const i = cpFilasVis.findIndex(f => f.cod === cp.foco);
      cp.foco = '';
      if (i >= 0) { const el = $('cpP' + i); el.scrollIntoView({ block: 'center' }); el.focus({ preventScroll: true }); }
    }
  }

  function cpGuardar(i) {
    const f = cpFilasVis[i], S = cpScope();
    if (!f) return;
    const cantidades = {};
    for (const [t, l, n] of [['PICKING', 'P', 'picking'], ['CALIDAD', 'C', 'calidad'], ['BLOQUEADO', 'B', 'bloqueado']]) {
      const el = $(`cp${l}${i}`), v = el.value.trim().replace(',', '.'), x = Number(v);
      if (v === '' || !(x >= 0)) { el.focus(); return toast(`Escribe ${n} de ${f.p ? f.p.nombre : f.cod} (0 si no hay)`, 'error'); }
      cantidades[t] = x;
    }

    const b = $('cpOk' + i); b.disabled = true; b.textContent = '…';
    const pend = [];   // aquí solo se confirma el picking (el aéreo se revisa en el reconteo)
    llamar('bdGuardarConteo', { sedeId: ses.sedeId, ubicacionId: f.ubic, codigo: f.cod, cantidades, usuario: ses.nombre, ciclicoId: S.id })
      .then(lista => {
        const rem = (arr, c) => arr.filter(x => !(x.codigo === c.codigo && x.ubicacion === c.ubicacion && x.tipo === c.tipo)).concat([c]);
        if (S.cic) lista.forEach(c => { cicData.conteos = rem(cicData.conteos, c); });
        else lista.forEach(c => { invData.conteos = rem(invData.conteos || [], c); });
        cp.extra = cp.extra.filter(e => !(e.cod === f.cod && e.ubic === f.ubic));
        return pend.length ? llamar('bdValidarEstibas', { ciclicoId: S.id, sedeId: ses.sedeId, usuario: ses.nombre, estibas: pend })
          .catch(e => { toast(`El conteo quedó guardado, pero el aéreo no se pudo confirmar (${e.message}). Toca «Revisar» en el aéreo para confirmarlo.`, 'error'); pend.length = 0; return []; }) : [];
      })
      .then(vals => {
        if (vals.length) { if (S.cic) cicData.validaciones = (cicData.validaciones || []).concat(vals); else invData.validaciones = (invData.validaciones || []).concat(vals); }
        if (S.cic) { const ec = (cicLista || []).find(x => x.id === S.id); if (ec) ec.contados = datosCiclico().filter(x => x.listo).length; if ($('cicLista')) $('cicLista').innerHTML = listaCiclicos(); }
        pitido();
        toast(`✓ ${f.p ? f.p.nombre : f.cod}: picking ${nInv(cantidades.PICKING)} · calidad ${nInv(cantidades.CALIDAD)} · bloqueado ${nInv(cantidades.BLOQUEADO)}`, 'ok');
        cpRepintar();
        // Sigue con el siguiente que falta
        const sig = cpFilasVis.find(x => !x.listo && x.cod !== f.cod);
        if (sig) { const k = cpFilasVis.indexOf(sig); const el = $('cpP' + k); if (el) el.focus({ preventScroll: false }); }
      })
      .catch(e => { toast(e.message, 'error'); if ($('cpOk' + i)) { $('cpOk' + i).disabled = false; $('cpOk' + i).textContent = '✓'; } });
  }

  // Revisar estiba por estiba el aéreo de un producto en este pasillo
  let cpAereoCod = '';
  function cpRevisarAereo(i) { const f = cpFilasVis[i]; if (!f) return; cpAereoCod = f.cod; pintarCpAereo(); }
  function pintarCpAereo() {
    const T = cpTodo(), f = (T.grupos[cp.alm + '|' + cp.pas] || {})[cpAereoCod], S = T.S;
    if (!f) return cerrarModal();
    aereoKeys = f.aereo.map(x => x.l);
    abrirModal(`<div class="fila-sb"><span class="h2">Aéreo · ${esc(f.p ? f.p.nombre : f.cod)}</span>${btnCerrar()}</div>
      <span class="muted small mt8">Mira cada estiba. Si coincide, <b>Está bien</b>. Si el rótulo tiene la cantidad o el vencimiento mal, <b>Corregir</b>. Si no está, <b>No está</b>.</span>
      <div class="lista-bp mt12">${f.aereo.map(({ l, v }, k) => `<div class="cp-est ${v ? 'hecho' : ''}">
        <span class="col" style="min-width:0"><b class="mono-c">${esc(cu(l.ubicacionId))}</b>
          <span class="muted small">Rótulo ${esc(l.lote || '—')} · ${cant(l)} · vence ${fCorta(l.vencimiento)}</span>
          ${v ? `<span class="small">${v.accion === 'OK' ? '<span class="tag ok">✓ Está bien</span>' : '<span class="tag venc">Corregido</span>'} ${esc(v.usuario || '')} · ${fechaHora(v.fecha)}</span>` : ''}</span>
        ${S.abierto ? `<span class="fila gap8 wrap-f">${v ? '' : `<button class="btn btn-ent btn-mini" onclick="validarEstiba(${k}, 'OK')">Está bien</button>`}
          <button class="btn btn-sec btn-mini" onclick="corregirEstiba(${k})">Corregir</button>
          <button class="btn btn-sal btn-mini" onclick="noEstaEstiba(${k})">No está</button></span>` : ''}</div>`).join('')}</div>
      <button class="btn btn-sec btn-xl mt16" onclick="cpAereoCod=''; cerrarModal()">Listo</button>`);
  }

  function cpAgregar() {
    const p = buscarProducto($('cpAProd').value.split(' · ')[0]) || buscarProducto($('cpAProd').value), ubic = $('cpALug').value;
    if (!p) return toast('Escribe o escanea el producto', 'error');
    const S = cpScope();
    if (S.codigos && !S.codigos.has(p.id)) return preguntarAgregarCic(p, () => cpAgregar());
    if (!ubic) return toast('Elige el lugar', 'error');
    cp.extra.push({ cod: p.id, ubic, scope: S.id || 'inv' });
    cp.ver = 'pend'; cp.foco = p.id; pagInicio('cp');
    cpRepintar();
  }
  function cpEncontre(cod) {
    lugar = { zona: '', rack: '', pos: 0, nivel: null, lado: '' };
    lugarCtx = { contenedor: 'cpLugarCaja', permitirLlenos: true, alElegir: id => {
      lugarCtx = null; cerrarModal(); pitido();
      const x = pasilloDe(id);
      if (!x) return toast('Ese lugar no tiene pasillo. Revisa Configuración → Códigos.', 'error');
      cp.extra.push({ cod, ubic: id, scope: cpScope().id || 'inv' }); cp.alm = x.key; cp.pas = x.pasillo; cp.ver = 'pend'; cp.foco = cod; cp.todos = true; pagInicio('cp');
      pintarApp();
    } };
    const p = prodDe(cod);
    abrirModal(`<div class="fila-sb"><span class="h2">¿Dónde está ${esc(p ? p.nombre : cod)}?</span>${btnCerrar()}</div><div id="cpLugarCaja"></div>`);
    pintarLugar();
  }

  /* ----- Pestaña Avance (jefe): cuánto falta por pasillo y por persona, y asignar ----- */
  let cpMarcados = new Set();
  const cpAv = { soloFaltan: false, verPas: false };
  // Inventario: cuánto falta en cada sede, contra TODA la lista de productos.
  //  Picking: productos que ya tienen conteo de picking en esa sede (se cuenta sin ubicación, aunque el producto no esté en el plano).
  //  Aéreo: productos que esa sede tiene en el plano (aéreo) y cuántos de la lista no están en el aéreo.
  function cpPorSedeHtml() {
    const lista = new Set(ini.productos.filter(p => p.activo !== false).map(p => p.id));
    const N = lista.size;
    const desde = invData && invData.carga ? invData.carga.fecha : null;
    const enLista = arr => new Set([...arr].filter(c => lista.has(c)));
    const filas = [];
    // Esta sede
    const pkYo = enLista(((invData && invData.conteos) || []).filter(c => c.tipo === 'PICKING' && (!desde || c.fecha >= desde)).map(c => c.codigo));
    const aeYo = enLista(sede.lineas.filter(l => sede.espPorId[l.ubicacionId] && sede.espPorId[l.ubicacionId].nivel > 0).map(l => l.productoId));
    filas.push({ nombre: nombreSede(ses.sedeId), pk: pkYo, ae: aeYo });
    ((invData && invData.otrasSedes) || []).forEach(o => {
      const pk = enLista(o.conteos.filter(c => c.tipo === 'PICKING' && (!desde || !c.fecha || c.fecha >= desde)).map(c => c.codigo));
      const ae = enLista((o.aereo || []).filter(x => x.cantidad).map(x => x.codigo));
      filas.push({ nombre: o.nombre, pk, ae });
    });
    const celdas = (pk, ae) => `<td>${pk} de ${N} ${cpBarra(pk, N)}</td>
        <td><b class="${N - pk ? 'txt-naranja' : 'txt-verde'}">${N - pk}</b></td>
        <td>${ae} de ${N} ${cpBarra(ae, N)}</td>
        <td><b>${N - ae}</b></td>`;
    const union = k => new Set(filas.flatMap(x => [...x[k]])).size;
    return `<section class="card col gap8">
      <span class="h3">Cuánto falta en cada sede <span class="muted small">(lista de ${N} productos)</span></span>
      <div class="tabla-wrap"><table class="tabla cp-sedes"><thead><tr><th>Sede</th><th>Picking contado</th><th>Falta picking</th><th>Productos en aéreo</th><th>No están en aéreo</th></tr></thead>
        <tbody>${filas.map(x => `<tr><td><b>${esc(x.nombre)}</b></td>${celdas(x.pk.size, x.ae.size)}</tr>`).join('')}
        ${filas.length > 1 ? `<tr class="cp-sedes-tot"><td><b>Todas las sedes</b></td>${celdas(union('pk'), union('ae'))}</tr>` : ''}</tbody></table></div>
      <span class="muted small"><b>Picking contado</b>: productos de la lista que ya contaron en picking (sin ubicación). <b>Falta picking</b>: los que faltan por contar.
        <b>Productos en aéreo</b>: los que están ubicados en el plano (nivel 2 hacia arriba). <b>No están en aéreo</b>: los de la lista que no tienen nada en el aéreo.
        En <b>Todas las sedes</b> un producto cuenta una vez aunque esté en varias.</span>
    </section>`;
  }
  // Tablero de Inventario: todo contra el total de productos, sin fórmulas.
  //  Contados = productos con picking registrado en este inventario (en cualquier sede).
  let cpContadores = null;   // { inv (los datos con que se pidió), l: [{ nombre, conteos, ultimo }] }
  function cpTableroInvHtml() {
    const d = datosInventario();
    const lista = new Set(ini.productos.filter(p => p.activo !== false && prodDeMiRegional(p)).map(p => p.id)), N = lista.size;
    const enLista = d.filter(f => lista.has(f.cod));
    const contados = enLista.filter(f => f.contado).length;
    const sapCods = new Set(((invData && invData.sap) || []).map(x => x.codigo)), M = sapCods.size;
    const contSap = d.filter(f => sapCods.has(f.cod) && f.contado).length;
    // Por sede: productos con picking registrado y productos con aéreo en el plano
    const sedes = sedesInv();
    const porSede = sedes.map(x => ({ nombre: x.nombre, pk: enLista.filter(f => f.pk[x.id] !== undefined).length, ae: enLista.filter(f => f.ae[x.id] > 0).length }));
    const pkTodas = enLista.filter(f => Object.keys(f.pk).length).length, aeTodas = enLista.filter(f => f.aereo > 0).length;
    // Por almacén: productos con algo contado en ese almacén (picking, calidad, bloqueado o aéreo)
    const alms = {};
    enLista.forEach(f => Object.values(f.alm).forEach(a => {
      if (!a.key) return;
      const k = almCorto(a.key) || a.key;
      if (a.picking || a.aereo || a.calidad || a.bloqueado || f.contado || f.hayCal || f.hayBlo) (alms[k] = alms[k] || new Set()).add(f.cod);
    }));
    const listaAlm = Object.entries(alms).sort((a, b) => String(a[0]).localeCompare(String(b[0]), 'es', { numeric: true }));
    // Total contado en este inventario: productos con cualquier conteo registrado
    const total = enLista.filter(f => f.contado || f.hayCal || f.hayBlo).length;
    const celda = n => `<td>${n} de ${N} ${cpBarra(n, N)}</td>`;
    return `${resumenConteoHtml()}
      ${porSede.length > 1 ? `<section class="card col gap8">
          <span class="h3">Sedes</span>
          <div class="tabla-wrap"><table class="tabla cp-sedes"><thead><tr><th>Sede</th><th>Picking</th><th>Aéreo</th></tr></thead>
            <tbody>${porSede.map(x => `<tr><td><b>${esc(x.nombre)}</b></td>${celda(x.pk)}${celda(x.ae)}</tr>`).join('')}
            <tr class="cp-sedes-tot"><td><b>Total</b></td>${celda(pkTodas)}${celda(aeTodas)}</tr></tbody></table></div>
        </section>` : ''}
      <section class="card col gap8">
        <span class="h3">Contadores</span>
        <div id="cpContadores">${cpContadoresHtml()}</div>
      </section>`;
  }
  /* ================= Resumen del conteo (Avance y SAP) y Excel de Control Interno =================
     Todo sale de lo mismo que la tabla de abajo (SAP + plano + conteos + reconteos). Los valores salen del
     Excel de SAP (valor libre, calidad y bloqueo); sin valores, se ven las cantidades y los valores quedan en —. */
  const TOL_DEF = { pct: 300, valor: 2000000 };
  const tolRecontar = () => Object.assign({}, TOL_DEF, leerLS('tolRecontar') || {});
  const plata = v => (v === null || v === undefined || isNaN(v) ? '—' : (v < 0 ? '-$' : '$') + Math.round(Math.abs(v)).toLocaleString('es-CO'));
  const pctTxt = (n, d) => (d ? (n * 100 / d).toLocaleString('es-CO', { maximumFractionDigits: 1, minimumFractionDigits: 1 }) + '%' : '—');
  // Costo por unidad (o kilo) del producto según los valores de SAP
  function costoUnit(f) {
    const x = f.sap;
    if (!x) return null;
    const val = [x.vLib, x.vCal, x.vBlq].filter(v => v !== null && v !== undefined);
    if (!val.length) return null;
    const q = x.inventario + x.calidad + x.bloqueado;
    if (q > 0) return val.reduce((a, v) => a + v, 0) / q;
    return x.inventario > 0 && x.vLib ? x.vLib / x.inventario : null;
  }
  let anMemo = null;
  function analisisInv() {
    const d = datosInvRc();
    if (anMemo && anMemo.d === d && anMemo.t === JSON.stringify(tolRecontar())) return anMemo.v;
    const tol = tolRecontar();
    const sapAlm = {};   // código → [{ almacen, inventario, calidad, bloqueado, vLib, vCal, vBlq }]
    ((invData && invData.sapAlm) || []).forEach(x => { (sapAlm[x.codigo] = sapAlm[x.codigo] || []).push(x); });
    const hayValores = d.some(f => costoUnit(f) !== null);
    // Base del inventario: lo que se subió de SAP; si todavía no hay SAP, todos los productos activos del catálogo de la regional
    const sinSap = !((invData && invData.sap) || []).length;
    const enCat = f => !!(f.p && f.p.activo !== false && prodDeMiRegional(f.p));
    const filas = d.filter(f => f.sapTotal || f.plantaRc || f.contado || f.hayCal || f.hayBlo || (sinSap && enCat(f))).map(f => {
      const c = costoUnit(f), pk = f.rc ? f.rc.pk : f.picking;
      const contado = !!(f.contado || f.hayCal || f.hayBlo);
      const x = f.sap || { inventario: 0, calidad: 0, bloqueado: 0 };
      // Reclasificar: el total cuadra pero no el tipo (libre, calidad, bloqueo)
      const reclas = contado && f.sap && !f.difRc && (Math.abs(f.calidad - x.calidad) > 0.0005 || Math.abs(f.bloqueado - x.bloqueado) > 0.0005);
      const valDif = c === null ? null : f.difRc * c;
      const pctDif = f.sapTotal ? Math.abs(f.difRc) * 100 / f.sapTotal : (f.difRc ? Infinity : 0);
      const almSap = (sapAlm[f.cod] || []).filter(a => a.inventario || a.calidad || a.bloqueado);
      const almCont = f.almacenes.map(a => almCorto(a.key)).filter(Boolean);
      const alm = (almSap.sort((a, b) => (b.inventario + b.calidad + b.bloqueado) - (a.inventario + a.calidad + a.bloqueado))[0] || {}).almacen || almCont[0] || ((prodAlm && prodAlm[f.cod]) || [])[0] || '';
      return { f, cod: f.cod, p: f.p, c, pk, ae: f.aereo, cal: f.calidad, blq: f.bloqueado, fis: f.plantaRc, sap: x, sapTot: f.sapTotal, dif: f.difRc,
        contado, enSap: !!f.sap && f.sapTotal > 0, enAlc: sinSap ? enCat(f) : !!f.sap && f.sapTotal > 0, algo: !!(f.sapTotal || f.plantaRc || contado), reclas, valDif, valSap: c === null ? null : f.sapTotal * c, valFis: c === null ? null : f.plantaRc * c,
        alta: contado && !!f.difRc && (pctDif >= tol.pct || (valDif !== null && Math.abs(valDif) >= tol.valor)), alm, almSap };
    });
    const suma = (l, k) => l.reduce((a, r) => a + (r[k] || 0), 0);
    const alcance = filas.filter(r => r.enAlc), contados = filas.filter(r => r.contado), contAlc = alcance.filter(r => r.contado);
    const conDif = contados.filter(r => r.dif && !r.reclas), sinDif = contados.filter(r => !r.dif && !r.reclas);
    // Cruces sugeridos: en la misma subcategoría, un sobrante y un faltante de valor parecido (±25%)
    const cruces = [];
    const porSub = {};
    conDif.filter(r => r.valDif).forEach(r => { const k = (r.p && (r.p.subcategoria || r.p.categoria)) || ''; if (k) (porSub[k] = porSub[k] || []).push(r); });
    Object.values(porSub).forEach(l => {
      const mas = l.filter(r => r.valDif > 0).sort((a, b) => b.valDif - a.valDif), menos = l.filter(r => r.valDif < 0).sort((a, b) => a.valDif - b.valDif);
      mas.forEach(m => { const i = menos.findIndex(n => Math.abs(m.valDif + n.valDif) <= 0.25 * Math.max(m.valDif, -n.valDif)); if (i >= 0) { cruces.push([m, menos[i]]); menos.splice(i, 1); } });
    });
    cruces.forEach(([a, b], i) => { a.cruce = b.cruce = 'C' + (i + 1); });
    // Por almacén: materiales de SAP en ese almacén (o donde se contó)
    const alms = {};
    filas.forEach(r => {
      const lista = r.almSap.length ? r.almSap.map(a => a.almacen) : [r.alm];
      lista.forEach(k => {
        const a = alms[k || '—'] = alms[k || '—'] || { alm: k || '—', mat: 0, cont: 0, dif: 0, valDif: 0, hayVal: false };
        if (r.enAlc) { a.mat++; if (r.contado) a.cont++; }
        if (r.contado && r.dif && !r.reclas) { a.dif++; if (r.valDif !== null) { a.valDif += r.valDif / lista.length; a.hayVal = true; } }
      });
    });
    const porAlm = Object.values(alms).filter(a => a.mat).sort((a, b) => String(a.alm).localeCompare(String(b.alm), 'es', { numeric: true }));
    // SAP contra físico por tipo de stock (la diferencia, solo de los contados)
    const val = (l, k) => (hayValores ? l.reduce((a, r) => a + (r.c === null ? 0 : (r[k] || 0) * r.c), 0) : null);
    const sapV = (l, k, vk) => (hayValores ? l.reduce((a, r) => a + (r.sap[vk] !== null && r.sap[vk] !== undefined ? r.sap[vk] : (r.c === null ? 0 : (r.sap[k] || 0) * r.c)), 0) : null);
    const tipo = (nom, qs, qf, vs, vf) => ({ nom, qs, qf, vs, vf });
    const libreSap = l => l.reduce((a, r) => a + r.sap.inventario, 0), libreFis = l => l.reduce((a, r) => a + r.pk + r.ae, 0);
    const tipos = [
      Object.assign(tipo('Libre · piso', null, suma(filas, 'pk'), null, val(filas, 'pk')), { sub: true }),
      Object.assign(tipo('Libre · aéreo', null, suma(filas, 'ae'), null, val(filas, 'ae')), { sub: true }),
      Object.assign(tipo('Libre total', libreSap(filas), libreFis(filas), sapV(filas, 'inventario', 'vLib'), hayValores ? val(filas, 'pk') + val(filas, 'ae') : null),
        { dq: libreFis(contados) - libreSap(contados), dv: hayValores ? (val(contados, 'pk') + val(contados, 'ae')) - sapV(contados, 'inventario', 'vLib') : null }),
      Object.assign(tipo('Calidad', filas.reduce((a, r) => a + r.sap.calidad, 0), suma(filas, 'cal'), sapV(filas, 'calidad', 'vCal'), val(filas, 'cal')),
        { dq: suma(contados, 'cal') - contados.reduce((a, r) => a + r.sap.calidad, 0), dv: hayValores ? val(contados, 'cal') - sapV(contados, 'calidad', 'vCal') : null }),
      Object.assign(tipo('Bloqueo', filas.reduce((a, r) => a + r.sap.bloqueado, 0), suma(filas, 'blq'), sapV(filas, 'bloqueado', 'vBlq'), val(filas, 'blq')),
        { dq: suma(contados, 'blq') - contados.reduce((a, r) => a + r.sap.bloqueado, 0), dv: hayValores ? val(contados, 'blq') - sapV(contados, 'bloqueado', 'vBlq') : null })];
    const tot = tipos.slice(2);
    tipos.push(Object.assign(tipo('Total', tot.reduce((a, t) => a + t.qs, 0), tot.reduce((a, t) => a + t.qf, 0), hayValores ? tot.reduce((a, t) => a + t.vs, 0) : null, hayValores ? tot.reduce((a, t) => a + t.vf, 0) : null),
      { dq: tot.reduce((a, t) => a + t.dq, 0), dv: hayValores ? tot.reduce((a, t) => a + t.dv, 0) : null, total: true }));
    const valSapCont = hayValores ? suma(contados.filter(r => r.valSap !== null), 'valSap') : null;
    const v = {
      filas, hayValores, sinSap, alcance: alcance.length, almacenes: new Set(alcance.map(r => r.alm).filter(Boolean)).size || porAlm.length,
      contados: contAlc.length, pendientes: alcance.length - contAlc.length,
      sapSinVerificar: hayValores ? suma(alcance.filter(r => !r.contado && r.valSap !== null), 'valSap') : null,
      sinDif: sinDif.length, conDif: conDif.length, reclas: contados.filter(r => r.reclas).length, sinLinea: contados.filter(r => !r.enAlc).length, fuera: contados.filter(r => !r.enAlc),
      nContados: contados.length, alta: contados.filter(r => r.alta).length, cruces, conAereo: filas.filter(r => r.ae > 0).length, aereo: suma(filas, 'ae'),
      valSap: valSapCont, valFis: hayValores ? suma(contados.filter(r => r.valFis !== null), 'valFis') : null,
      sobrantes: hayValores ? contados.reduce((a, r) => a + (r.valDif > 0 ? r.valDif : 0), 0) : null,
      faltantes: hayValores ? contados.reduce((a, r) => a + (r.valDif < 0 ? r.valDif : 0), 0) : null,
      porAlm, tipos, tol,
      // Lo que está en calidad o bloqueado (físico), en cantidad y en valor
      calBlq: suma(contados, 'cal') + suma(contados, 'blq'), valCalBlq: hayValores ? val(contados, 'cal') + val(contados, 'blq') : null,
      mayores: contados.filter(r => r.dif && r.valDif !== null).sort((a, b) => Math.abs(b.valDif) - Math.abs(a.valDif)).slice(0, 15)
    };
    v.neta = hayValores ? v.sobrantes + v.faltantes : null;
    anMemo = { d, t: JSON.stringify(tol), v };
    return v;
  }
  function cambiarTolerancia() {
    const t = tolRecontar();
    abrirModal(`<div class="fila-sb"><span class="h2">Cuándo recontar (prioridad alta)</span>${btnCerrar()}</div>
      <span class="muted small mt8">Un producto contado va «a recontar» si su diferencia es igual o mayor a este porcentaje de lo que dice SAP, o si la diferencia vale igual o más que este valor.</span>
      <div class="dos mt12"><div><label class="lbl" for="tolPct">Porcentaje (%)</label><input id="tolPct" class="campo" type="number" min="0" value="${t.pct}"></div>
        <div><label class="lbl" for="tolVal">Valor ($)</label><input id="tolVal" class="campo" type="number" min="0" value="${t.valor}"></div></div>
      <button class="btn btn-pri btn-xl mt16" onclick="guardarLS('tolRecontar', { pct: Number($('tolPct').value) || ${TOL_DEF.pct}, valor: Number($('tolVal').value) || ${TOL_DEF.valor} }); cerrarModal(); pintarApp()">Guardar</button>`);
  }
  /* ===== Tablero del conteo físico (Avance y SAP): indicadores y gráficos =====
     Todo sale de analisisInv() (lo mismo que la tabla de abajo). Los gráficos son HTML/SVG simples (sirven en Chrome 88). */
  function tbAnillo(n, d, tono, sub) {
    const p = d ? Math.max(0, Math.min(1, n / d)) : 0, r = 50, L = 2 * Math.PI * r;
    return `<svg class="tb-anillo" viewBox="0 0 120 120" role="img" aria-label="${pctTxt(n, d)}">
      <circle cx="60" cy="60" r="${r}" class="tb-anillo-f"/>
      <circle cx="60" cy="60" r="${r}" class="tb-anillo-v tb-s-${tono}" stroke-dasharray="${(p * L).toFixed(2)} ${L.toFixed(2)}" transform="rotate(-90 60 60)"/>
      <text x="60" y="${sub ? 60 : 66}" text-anchor="middle" class="tb-anillo-n">${pctTxt(n, d)}</text>
      ${sub ? `<text x="60" y="80" text-anchor="middle" class="tb-anillo-s">${esc(sub)}</text>` : ''}</svg>`;
  }
  // Barra apilada: [{ n, tono, nom }]
  function tbApilada(partes, total) {
    const T = total || partes.reduce((a, x) => a + x.n, 0);
    if (!T) return '<div class="tb-apil tb-apil-vacia"></div>';
    return `<div class="tb-apil" role="img" aria-label="${partes.map(x => `${x.nom}: ${x.n}`).join(', ')}">
      ${partes.filter(x => x.n > 0).map(x => `<i class="tb-b-${x.tono}" style="width:${(x.n * 100 / T).toFixed(2)}%" title="${esc(x.nom)}: ${x.n}"></i>`).join('')}</div>`;
  }
  function tbLeyenda(partes, total) {
    return `<div class="tb-ley">${partes.map(x => `<span><i class="tb-b-${x.tono}"></i>${esc(x.nom)} <b>${x.n.toLocaleString('es-CO')}</b>${total ? ` <span class="muted">(${pctTxt(x.n, total)})</span>` : ''}</span>`).join('')}</div>`;
  }
  function resumenConteoHtml() {
    const a = analisisInv();
    const kpi = (t, v, sub, tono, ayuda) => `<div class="tb-kpi ${tono ? 'tb-t-' + tono : ''}">
      <span class="tb-kpi-t">${t}${ayuda ? ayudaHtml(ayuda) : ''}</span><b>${v}</b>${sub ? `<span class="tb-kpi-s">${sub}</span>` : ''}</div>`;
    const uni = a.sinSap ? 'catálogo de la regional' : 'Excel de SAP';
    const NC = a.nContados;
    const comp = [
      { n: a.sinDif, tono: 'verde', nom: 'Cuadradas con SAP' },
      { n: a.conDif, tono: 'rojo', nom: 'Con novedad' },
      { n: a.reclas, tono: 'violeta', nom: 'Cambio de estado' },
      { n: a.sinLinea, tono: 'amar', nom: 'Fuera de la base' }];
    // ---- Cobertura ----
    const hero = `<section class="card tb-hero">
      <div class="tb-hero-g">${tbAnillo(a.contados, a.alcance, 'azul', 'cobertura')}</div>
      <div class="col gap12 tb-min0">
        <div class="fila-sb wrap-f gap8"><span class="h3">Cobertura del inventario ${ayudaHtml(`Cuántas de las referencias a inventariar ya se verificaron físicamente. La base sale del ${uni}${a.sinSap ? '; cuando cargues el Excel de SAP se toma el de SAP' : ''}.`)}</span>
          <span class="tb-chip">Base: ${esc(uni)}</span></div>
        <div class="tb-kpis3">
          ${kpi('Referencias a inventariar', a.alcance.toLocaleString('es-CO'), `en ${a.almacenes} ${a.almacenes === 1 ? 'almacén' : 'almacenes'}`, '', 'Total de referencias que se deben contar en este inventario.')}
          ${kpi('Referencias verificadas', a.contados.toLocaleString('es-CO'), 'ya tienen conteo', 'verde', 'Referencias a inventariar que ya tienen al menos un conteo registrado.')}
          ${kpi('Por verificar', a.pendientes.toLocaleString('es-CO'), a.hayValores ? `${plata(a.sapSinVerificar)} sin verificar` : 'faltan por contar', a.pendientes ? 'naranja' : '', 'Referencias a inventariar que todavía nadie ha contado. Con valores de SAP se muestra cuánta plata falta por verificar.')}
        </div>
        ${tbApilada([{ n: a.contados, tono: 'azul', nom: 'Verificadas' }, { n: a.pendientes, tono: 'gris', nom: 'Por verificar' }], a.alcance)}
        ${tbLeyenda([{ n: a.contados, tono: 'azul', nom: 'Verificadas' }, { n: a.pendientes, tono: 'gris', nom: 'Por verificar' }], a.alcance)}
      </div></section>`;
    // ---- Calidad del conteo ----
    const calidad = `<section class="card col gap12">
      <span class="h3">Calidad del conteo ${ayudaHtml('Cómo quedaron las referencias verificadas frente a SAP.')}</span>
      ${a.sinSap ? `<p class="muted small">Sin el Excel de SAP no hay con qué comparar lo contado. Cárgalo para ver la exactitud, las novedades y los reconteos.</p>` : ''}
      <div class="tb-cal" ${a.sinSap ? 'hidden' : ''}>
        <div class="tb-cal-g">${tbAnillo(a.sinDif, NC, 'verde', 'exactitud')}
          <span class="small muted tb-centro">Índice de exactitud (IRA) ${ayudaHtml('Referencias verificadas que cuadran con SAP, sobre el total de verificadas. Entre más alto, más confiable es el inventario.')}</span></div>
        <div class="col gap12 tb-min0">
          <span class="small muted">Composición de las ${NC.toLocaleString('es-CO')} referencias verificadas</span>
          ${tbApilada(comp, NC)}${tbLeyenda(comp, NC)}
          <div class="tb-acc">
            ${kpi('Reconteo prioritario', a.alta, `más de ${a.tol.pct}% o ${plata(a.tol.valor)} · <button class="link small" onclick="cambiarTolerancia()">ajustar</button>`, a.alta ? 'rojo' : '', 'Novedades tan grandes (en porcentaje o en plata) que conviene volver a contarlas antes de ajustar.')}
            ${kpi('Posibles cruces', a.cruces.length, a.cruces.length ? '<button class="link small" onclick="verCruces()">ver parejas</button>' : 'sin parejas por ahora', a.cruces.length ? 'violeta' : '', 'Referencias parecidas (misma subcategoría) donde a una le sobra y a otra le falta casi lo mismo en plata: puede que se contó una por la otra.')}
            ${kpi('Fuera de la base', a.sinLinea, a.sinLinea ? '<button class="link small" onclick="verFueraAlcance()">ver cuáles</button>' : 'todo dentro', a.sinLinea ? 'naranja' : '', 'Referencias que se contaron pero no estaban en lo que se subió a contar. Revisa el código o el almacén.')}
            ${kpi('Referencias en altura', a.conAereo, `${nInv(a.aereo)} unidades en aéreo`, '', 'Referencias que tienen producto ubicado en el aéreo (nivel 1 hacia arriba).')}
          </div>
        </div>
      </div></section>`;
    // ---- Impacto económico ----
    let plataHtml;
    if (a.hayValores) {
      const mx = Math.max(Math.abs(a.faltantes || 0), a.sobrantes || 0) || 1;
      plataHtml = `<div class="tb-kpis3">
          ${kpi('Valor en libros', plata(a.valSap), 'SAP de lo verificado', '', 'Lo que vale en SAP lo que ya se contó.')}
          ${kpi('Valor físico verificado', plata(a.valFis), 'lo que se encontró', '', 'Lo que vale lo que se encontró al contar.')}
          ${kpi('Impacto neto', plata(a.neta), a.valSap ? `${pctTxt(a.neta, a.valSap)} del valor en libros` : '', a.neta < 0 ? 'rojo' : a.neta > 0 ? 'verde' : '', 'Excedentes menos faltantes: lo que cambiaría el inventario si se ajusta hoy.')}
        </div>
        <div class="tb-bal" role="img" aria-label="Faltantes ${plata(a.faltantes)}, excedentes ${plata(a.sobrantes)}">
          <div class="tb-bal-l"><span class="small">Faltantes ${ayudaHtml('Lo que falta frente a SAP (incluye calidad y bloqueado). Se ajusta como baja.')}</span><div class="tb-bal-x izq"><i class="tb-b-rojo" style="width:${(Math.abs(a.faltantes || 0) * 100 / mx).toFixed(1)}%"></i></div><b class="txt-rojo">${plata(a.faltantes)}</b></div>
          <div class="tb-bal-l"><span class="small">Excedentes ${ayudaHtml('Lo que sobra frente a SAP. Se ajusta como entrada.')}</span><div class="tb-bal-x"><i class="tb-b-verde" style="width:${((a.sobrantes || 0) * 100 / mx).toFixed(1)}%"></i></div><b class="txt-verde">${plata(a.sobrantes)}</b></div>
        </div>
        <span class="small muted">En calidad y bloqueado (físico): <b>${plata(a.valCalBlq)}</b> · ${nInv(a.calBlq)} unidades</span>`;
    } else {
      plataHtml = `<p class="muted small">Para ver la plata, carga el Excel de SAP y escoge las columnas de valor (libre, calidad y bloqueo). Si vienen como en la MB52, se escogen solas.</p>
        <span class="small muted">En calidad y bloqueado (físico): <b>${nInv(a.calBlq)}</b> unidades</span>`;
    }
    const valor = `<section class="card col gap12"><span class="h3">Impacto económico ${ayudaHtml('Solo de las referencias verificadas, con los valores del Excel de SAP.')}</span>${plataHtml}</section>`;
    // ---- Por almacén ----
    const alm = `<section class="card col gap8">
      <span class="h3">Cobertura por almacén</span>
      ${a.porAlm.length ? `<div class="tabla-wrap"><table class="tabla av-tabla tb-alm"><thead><tr><th>Almacén</th><th>Cobertura</th><th class="num">Verificadas</th><th class="num">Por verificar</th><th class="num">Novedades</th><th class="num">Valor novedades</th></tr></thead><tbody>
        ${a.porAlm.map(x => `<tr><td><b>${esc(x.alm)}</b></td>
          <td><div class="tb-fila-b"><div class="tb-pista"><i class="tb-b-azul" style="width:${x.mat ? (x.cont * 100 / x.mat).toFixed(1) : 0}%"></i></div><span class="small nowrap">${pctTxt(x.cont, x.mat)}</span></div></td>
          <td class="num">${x.cont} / ${x.mat}</td><td class="num ${x.mat - x.cont ? 'av-pend' : ''}">${x.mat - x.cont}</td>
          <td class="num ${x.dif ? 'av-dif' : ''}">${x.dif}</td><td class="num ${x.valDif < 0 ? 'txt-rojo' : ''}">${x.hayVal ? plata(x.valDif) : '—'}</td></tr>`).join('')}
        <tr class="av-total"><td><b>Total</b></td><td><div class="tb-fila-b"><div class="tb-pista"><i class="tb-b-azul" style="width:${a.alcance ? (a.contados * 100 / a.alcance).toFixed(1) : 0}%"></i></div><span class="small nowrap">${pctTxt(a.contados, a.alcance)}</span></div></td>
          <td class="num">${a.contados} / ${a.alcance}</td><td class="num">${a.pendientes}</td><td class="num">${a.conDif}</td><td class="num ${a.neta < 0 ? 'txt-rojo' : ''}">${a.hayValores ? plata(a.neta) : '—'}</td></tr>
      </tbody></table></div>` : '<p class="muted small">Todavía no hay referencias por almacén.</p>'}
    </section>`;
    // ---- Conciliación por estado de stock ----
    const est = a.tipos.filter(t => !t.sub && !t.total);
    const nomEst = { 'Libre total': 'Disponible', Calidad: 'En calidad', Bloqueo: 'Bloqueado' };
    const enPlata = a.hayValores;
    const mxE = Math.max(1, ...est.map(t => Math.max(Math.abs(enPlata ? t.vs || 0 : t.qs || 0), Math.abs(enPlata ? t.vf || 0 : t.qf || 0))));
    const barE = (v, tono) => `<div class="tb-pista"><i class="tb-b-${tono}" style="width:${(Math.abs(v || 0) * 100 / mxE).toFixed(1)}%"></i></div>`;
    const fmtE = v => (enPlata ? plata(v) : nInv(v || 0));
    const nomT = t => ({ 'Libre · piso': 'Disponible en piso (picking)', 'Libre · aéreo': 'Disponible en altura (aéreo)', 'Libre total': 'Disponible', Calidad: 'En calidad', Bloqueo: 'Bloqueado', Total: 'Total' })[t.nom] || t.nom;
    const conc = `<section class="card col gap12">
      <span class="h3">Conciliación SAP vs. físico ${ayudaHtml('Compara lo que dice SAP con lo que se encontró, por estado del stock: disponible, en calidad y bloqueado.')}</span>
      <div class="tb-ley"><span><i class="tb-b-gris"></i>SAP</span><span><i class="tb-b-azul"></i>Físico</span><span class="muted">${enPlata ? 'en pesos' : 'en unidades'}</span></div>
      <div class="tb-est">${est.map(t => `<div class="tb-est-f"><b class="small">${esc(nomEst[t.nom] || t.nom)}</b>
          <div class="tb-fila-b">${barE(enPlata ? t.vs : t.qs, 'gris')}<span class="small nowrap">${fmtE(enPlata ? t.vs : t.qs)}</span></div>
          <div class="tb-fila-b">${barE(enPlata ? t.vf : t.qf, 'azul')}<span class="small nowrap">${fmtE(enPlata ? t.vf : t.qf)}</span></div></div>`).join('')}</div>
      <details class="tb-det"><summary class="small">Ver la tabla completa</summary>
        <div class="tabla-wrap mt8"><table class="tabla av-tabla"><thead><tr><th>Estado del stock</th><th class="num">SAP (cant.)</th><th class="num">Físico (cant.)</th><th class="num">Variación *</th><th class="num">SAP ($)</th><th class="num">Físico ($)</th><th class="num">Variación $ *</th></tr></thead><tbody>
          ${a.tipos.map(t => `<tr class="${t.sub ? 'av-sub' : ''} ${t.total ? 'av-total' : ''}"><td>${t.sub ? '↳ ' : ''}${esc(nomT(t))}</td><td class="num">${t.qs === null ? '' : nInv(t.qs)}</td><td class="num">${nInv(t.qf)}</td>
            <td class="num ${t.dq < 0 ? 'txt-rojo' : t.dq > 0 ? 'txt-verde' : ''}">${t.dq === undefined ? '' : nInv(+t.dq.toFixed(3))}</td><td class="num">${t.vs === null ? (t.sub ? '' : '—') : plata(t.vs)}</td>
            <td class="num">${t.vf === null ? '—' : plata(t.vf)}</td><td class="num ${t.dv < 0 ? 'txt-rojo' : t.dv > 0 ? 'txt-verde' : ''}">${t.dv === undefined ? '' : plata(t.dv)}</td></tr>`).join('')}
        </tbody></table></div>
        <span class="muted small">* Variación solo de las referencias verificadas. El aéreo ya va sumado en «Disponible».</span></details>
    </section>`;
    // ---- Mayores variaciones (barras a lado y lado) ----
    const mxV = Math.max(1, ...a.mayores.map(r => Math.abs(r.valDif)));
    const top = `<section class="card col gap8">
      <span class="h3">Mayores variaciones en valor ${ayudaHtml('Las 15 referencias verificadas con más plata de diferencia. Toca una para ver su historial.')}</span>
      ${a.mayores.length ? `<div class="tb-ley"><span><i class="tb-b-rojo"></i>Falta</span><span><i class="tb-b-verde"></i>Sobra</span></div>
        <div class="tb-div">${a.mayores.map(r => { const w = (Math.abs(r.valDif) * 50 / mxV).toFixed(1), neg = r.valDif < 0;
          return `<button type="button" class="tb-div-f" onclick="historialInventario('${esc(r.cod)}')">
            <span class="tb-div-n"><b>${esc(r.cod)}</b> <span class="muted">${esc(r.p ? r.p.nombre : '')}</span></span>
            <span class="tb-div-x"><i class="tb-b-${neg ? 'rojo' : 'verde'}" style="${neg ? `right:50%` : `left:50%`};width:${w}%"></i></span>
            <span class="tb-div-v ${neg ? 'txt-rojo' : 'txt-verde'}">${plata(r.valDif)}<span class="muted"> · ${nInv(r.dif)} und · ${esc(r.alm || '—')}</span></span></button>`; }).join('')}</div>`
        : `<p class="muted small">${a.hayValores ? 'Todavía no hay variaciones en lo verificado.' : 'Carga el Excel de SAP con los valores para ver las mayores variaciones en plata.'}</p>`}
    </section>`;
    return `<div class="col gap12 tb">${hero}<div class="av-dos">${calidad}${valor}</div>${alm}<div class="av-dos">${conc}${top}</div></div>`;
  }
  function verCruces() {
    const a = analisisInv();
    abrirModal(`<div class="fila-sb"><span class="h2">Posibles cruces entre referencias</span>${btnCerrar()}</div>
      <span class="muted small mt8">Referencias de la misma subcategoría donde a una le sobra y a otra le falta casi lo mismo en plata: puede que se contó una por la otra. Revísalas antes de ajustar.</span>
      <div class="tabla-wrap mt12"><table class="tabla"><thead><tr><th>Pareja</th><th>Sobra</th><th class="num">Valor</th><th>Falta</th><th class="num">Valor</th></tr></thead><tbody>
        ${a.cruces.map(([m, n], i) => `<tr><td><b>C${i + 1}</b></td><td class="small">${esc(m.cod)} · ${esc(m.p ? m.p.nombre : '')}</td><td class="num txt-verde">${plata(m.valDif)}</td>
          <td class="small">${esc(n.cod)} · ${esc(n.p ? n.p.nombre : '')}</td><td class="num txt-rojo">${plata(n.valDif)}</td></tr>`).join('')}
      </tbody></table></div>`, 'modal-ancho');
  }
  // Referencias contadas que no estaban en lo que se subió a contar
  function verFueraAlcance() {
    const a = analisisInv();
    const pg = paginar('fua', a.fuera, verFueraAlcance);
    abrirModal(`<div class="fila-sb"><span class="h2">Contadas fuera de la base</span>${btnCerrar()}</div>
      <span class="muted small mt8">Se contaron pero no estaban en ${a.sinSap ? 'el catálogo de la regional' : 'el Excel de SAP'}. Revisa si el código o el almacén están bien.</span>
      <div class="tabla-wrap mt12"><table class="tabla"><thead><tr><th>Código</th><th>Producto</th><th class="num">Físico</th><th>Almacén</th></tr></thead><tbody>
        ${pg.filas.map(r => `<tr onclick="cerrarModal(); historialInventario('${esc(r.cod)}')"><td><b>${esc(r.cod)}</b></td><td class="small">${esc(r.p ? r.p.nombre : 'No está en el catálogo')}</td><td class="num">${nInv(r.fis)}</td><td>${esc(r.alm || '—')}</td></tr>`).join('')}
      </tbody></table></div>${pg.barra}`, 'modal-ancho');
  }

  function donaHtml(n, N) {
    const p = N ? Math.min(1, n / N) : 0, r = 42, L = 2 * Math.PI * r;
    return `<svg class="dona" viewBox="0 0 100 100" role="img" aria-label="${cpPct(n, N)}% contado">
      <circle cx="50" cy="50" r="${r}" class="dona-fondo"/>
      <circle cx="50" cy="50" r="${r}" class="dona-valor" stroke-dasharray="${(p * L).toFixed(2)} ${L.toFixed(2)}" transform="rotate(-90 50 50)"/>
      <text x="50" y="55" text-anchor="middle" class="dona-txt">${cpPct(n, N)}%</text></svg>`;
  }
  function cpContadoresHtml() {
    if (!cpContadores || cpContadores.inv !== invData) {
      const pedido = invData;
      if (!cpContadoresHtml.pidiendo) {
        cpContadoresHtml.pidiendo = true;
        llamar('bdContadoresInv').then(l => { cpContadores = { inv: pedido, l }; })
          .catch(() => { cpContadores = { inv: pedido, l: null }; })
          .finally(() => { cpContadoresHtml.pidiendo = false; if ($('cpContadores')) $('cpContadores').innerHTML = cpContadoresHtml(); });
      }
      if (!cpContadores) return '<div class="cargando">Cargando contadores…</div>';
    }
    const l = cpContadores.l;
    if (!l) return '<p class="muted small">No se pudieron cargar los contadores. Toca «Actualizar».</p>';
    if (!l.length) return '<p class="muted small">Todavía nadie ha contado.</p>';
    const pg = paginar('cpc', l, () => { if ($('cpContadores')) $('cpContadores').innerHTML = cpContadoresHtml(); });
    return `<div class="tabla-wrap"><table class="tabla cp-cont"><thead><tr><th>Contador</th><th class="num">Conteos</th><th>Último</th></tr></thead><tbody>
      ${pg.filas.map(x => `<tr><td><b>${esc(x.nombre)}</b></td><td class="num">${x.conteos}</td><td class="small nowrap">${x.ultimo ? fechaHora(x.ultimo) : '—'}</td></tr>`).join('')}
      </tbody></table></div>${pg.barra}`;
  }
  function cpAvanceHtml() {
    const T = cpTodo(), S = T.S, ps0 = S.cic ? cpPasillos(T) : invPasillosProd(S), ps = ps0.filter(x => x.total);
    const ubOk = S.cic || !!(ubicSede[ses.sedeId] || {}).m;
    const tot = ps.reduce((a, x) => a + x.total, 0), lis = ps.reduce((a, x) => a + x.listos, 0);
    const est = Object.values(T.grupos).reduce((a, g) => a + Object.values(g).reduce((b, f) => b + f.aereo.length, 0), 0);
    const estOk = Object.values(T.grupos).reduce((a, g) => a + Object.values(g).reduce((b, f) => b + f.aereo.filter(x => x.v).length, 0), 0);
    const sinUb = cpSinUbicar(T);
    // Por persona: productos que dejó listos y sus pasillos asignados
    const pers = {};
    Object.values(T.grupos).forEach(g => Object.values(g).forEach(f => { if (f.listo && f.ult) { const n = f.ult.usuario || '—'; (pers[n] = pers[n] || { n, listos: 0, ult: null }).listos++; if (!pers[n].ult || f.ult.fecha > pers[n].ult) pers[n].ult = f.ult.fecha; } }));
    // Ya no se asigna a nadie: en Personas solo sale quien ha contado
    const conAsig = !S.cic;   // la tabla de pasillos sale solo en Inventario
    const jefe = false;       // ya no se asigna a nadie: la cuenta quien tenga permiso
    const ver = ps.filter(x => !cpAv.soloFaltan || x.listos < x.total);
    return `<div class="col gap12">
      ${!S.cic ? cpTableroInvHtml() : `
      <div class="cp-kpis">
        <div class="cp-kpi"><span class="muted small">Listos</span><b>${lis} de ${tot}</b>${cpBarra(lis, tot)}</div>
        <div class="cp-kpi"><span class="muted small">Faltan</span><b class="${tot - lis ? 'txt-naranja' : 'txt-verde'}">${tot - lis}</b><span class="muted small">${cpPct(lis, tot)}% hecho</span></div>
        <div class="cp-kpi"><span class="muted small">Sin lugar en el plano</span><b class="${sinUb.length ? 'txt-naranja' : ''}">${sinUb.length}</b><span class="muted small">por contar</span></div>
      </div>
      <section class="card col gap8">
        <span class="h3">Personas</span>
        ${Object.values(pers).length ? `<div class="tabla-wrap"><table class="tabla"><thead><tr><th>Persona</th><th class="num">Productos listos</th><th>Último</th></tr></thead><tbody>
          ${Object.values(pers).sort((a, b) => b.listos - a.listos).map(x => `<tr><td><b>${esc(x.n)}</b></td>
              <td class="num">${x.listos}</td><td class="small nowrap">${x.ult ? fechaHora(x.ult) : '—'}</td></tr>`).join('')}
        </tbody></table></div>` : '<p class="muted small">Todavía nadie ha contado.</p>'}
      </section>`}
      ${!conAsig ? '' : `<details class="card col gap8 cp-pas-det" ${cpAv.verPas ? 'open' : ''} ontoggle="cpAv.verPas=this.open">
        <summary class="h3">Pasillos</summary>
        <div class="fila-sb wrap-f gap8 mt8"><span class="muted small">${S.cic ? 'Avance de cada pasillo.' : usarPasCargado()
            ? 'Avance de cada <b>pasillo cargado</b> (almacén y pasillo como se cargaron). ' + (!ubOk ? '<span class="muted">(cargando pasillos…)</span> ' : ps0.cargados ? `<b>${ps0.cargados}</b> productos con pasillo cargado en esta sede. ` : '<span class="txt-naranja">Esta sede no tiene pasillos cargados: usa «Actualizar almacenes y pasillos» y escoge esta sede.</span> ') + ayudaHtml('Está encendido «Usar el pasillo cargado» en Configuración → Ajustes: cada producto cuenta en el almacén y pasillo que se le cargó con «Actualizar almacenes y pasillos» para esta sede (no se usan los pasillos del plano). Son los mismos productos que salen en la lista al filtrar por ese almacén y pasillo. Contado = ya le contaron el picking. En «Sin pasillo cargado» quedan los que tienen SAP o conteo pero no tienen pasillo cargado.')
            : 'Avance de cada pasillo: los mismos productos que salen en la lista al filtrar por ese pasillo (<b>pasillo del plano</b>). ' + ayudaHtml('Está apagado «Usar el pasillo cargado» en Configuración → Ajustes: un producto cuenta en cada pasillo del plano donde está (picking o aéreo). Si está en dos pasillos, sale en los dos. Contado = ya le contaron el picking. En «Sin pasillo» quedan solo los que no están en el plano.')}</span>
          <span class="fila gap8 wrap-f"><label class="fila gap8 small"><input type="checkbox" ${cpAv.soloFaltan ? 'checked' : ''} onchange="cpAv.soloFaltan=this.checked; cpRepintar()"> Solo los que faltan</label>
            ${jefe ? `<button class="btn btn-pri btn-mini" onclick="cpAsignar()" ${cpMarcados.size ? '' : 'disabled'}>Asignar ${cpMarcados.size ? cpMarcados.size + ' ' : ''}marcado${cpMarcados.size === 1 ? '' : 's'}</button>` : ''}</span></div>
        ${jefe ? '<span class="muted small">Marca los pasillos y toca «Asignar» para escoger quién los cuenta. Puedes poner a alguien más a ayudar en un pasillo que va atrasado.</span>' : ''}
        <div class="tabla-wrap"><table class="tabla cp-av"><thead><tr>${jefe ? '<th></th>' : ''}<th>Almacén</th><th>Pasillo</th><th>Avance</th><th class="cp-faltan">Faltan</th><th class="cp-ult">Último</th></tr></thead><tbody>
          ${ver.map(x => { const k = x.key + '|' + x.pas; return `<tr class="${x.listos === x.total ? 'cp-listo' : ''}">
            ${jefe ? `<td>${x.key ? `<input type="checkbox" aria-label="Marcar pasillo ${esc(x.pas)}" ${cpMarcados.has(k) ? 'checked' : ''} onchange="cpMarcar('${esc(k)}', this.checked)">` : ''}</td>` : ''}
            <td><span class="cp-alm-l">${esc(x.alm)}</span><span class="cp-alm-c">${esc(almCorto(x.key) || x.alm)}</span></td><td>${x.pas ? `<b>${/^Fila /.test(x.pas) ? esc(x.pas) : esc(pasTxt(x.pas))}</b>` : '<span class="muted">—</span>'}</td>
            <td class="small nowrap">${x.listos} de ${x.total} ${cpBarra(x.listos, x.total)}</td>
            <td class="cp-faltan ${x.total - x.listos ? 'fuerte' : 'txt-verde'}">${x.total - x.listos || '✓'}</td>
            <td class="small nowrap cp-ult">${x.ult ? `${esc(x.ult.usuario || '')} · ${fechaHora(x.ult.fecha)}` : '—'}</td></tr>`; }).join('') || `<tr><td colspan="5" class="muted">${ps.length ? 'Todos los pasillos están listos.' : 'No hay productos ubicados en el plano.'}</td></tr>`}
        </tbody></table></div>
      </details>`}
    </div>`;
  }
  function cpMarcar(k, si) { if (si) cpMarcados.add(k); else cpMarcados.delete(k); if ($('cpAvance')) $('cpAvance').innerHTML = cpAvanceHtml(); }
  function cpAsignar() {
    const S = cpScope();
    const ks = [...cpMarcados];
    const actuales = new Set(S.asig.filter(a => ks.includes(a.almacen + '|' + a.pasillo)).map(a => a.usuarioId || a.nombre));
    const pintar = l => abrirModal(`<div class="fila-sb"><span class="h2">¿Quién cuenta ${ks.length === 1 ? 'este pasillo' : `estos ${ks.length} pasillos`}?</span>${btnCerrar()}</div>
      <span class="muted small mt8">${ks.map(k => { const [a, p] = k.split('|'); return `${esc(nombreAlm(a))} · Pasillo ${esc(p)}`; }).join(' · ')}</span>
      <span class="muted small">Quedan asignadas exactamente las personas marcadas. Si no marcas a nadie, los pasillos quedan sin asignar.</span>
      <input class="campo mt8" placeholder="Buscar persona" oninput="document.querySelectorAll('.cp-per').forEach(x => x.hidden = !sinTilde(x.textContent).includes(sinTilde(this.value)))">
      <div class="cp-personas mt8">${l.map(x => `<label class="cp-per fila gap8"><input type="checkbox" value="${esc(x.id)}" data-n="${esc(x.nombre)}" ${actuales.has(x.id) || actuales.has(x.nombre) ? 'checked' : ''}> ${esc(x.nombre)} <span class="muted small">${esc(x.cargo || '')}</span></label>`).join('')}</div>
      <p id="fErr" class="error" hidden></p>
      <div class="dos mt16"><button class="btn btn-sec btn-xl" onclick="cerrarModal()">Cancelar</button><button id="cpAsOk" class="btn btn-pri btn-xl" onclick="cpGuardarAsig()">Guardar</button></div>`);
    if (cicPersonas) return pintar(cicPersonas);
    llamar('bdPersonas').then(l => { cicPersonas = l; pintar(l); }).catch(e => toast(e.message, 'error'));
  }
  function cpGuardarAsig() {
    const S = cpScope(), b = $('cpAsOk'); b.disabled = true;
    const personas = [...document.querySelectorAll('.cp-personas input:checked')].map(x => ({ id: x.value, nombre: x.dataset.n }));
    const pasillos = [...cpMarcados].map(k => { const [almacen, pasillo] = k.split('|'); return { almacen, pasillo }; });
    llamar('bdAsignarPasillos', { sedeId: ses.sedeId, ciclicoId: S.id, pasillos, personas, usuario: ses.nombre }).then(l => {
      if (S.cic) cicData.asignaciones = l; else invData.asignaciones = l;
      cpMarcados = new Set(); cerrarModal();
      toast(personas.length ? `Asignado a ${personas.map(p => p.nombre).join(', ')}` : 'Pasillos sin asignar', 'ok');
      cpRepintar();
    }).catch(e => { errForm(e.message); b.disabled = false; });
  }

  // Ir a contar un producto (desde la tabla): abre su pasillo
  function cpIrProducto(cod) {
    const T = cpTodo(), fs = T.porCod[cod];
    if (ctxCic()) cicSub = 'ingresar'; else invSub = 'ingresar';
    ing.cod = cod;
    if (fs && fs.length) { const f = fs.find(x => !x.listo) || fs[0]; cp.alm = f.key || '*'; cp.pas = f.pasillo || '*'; cp.q = cod; cp.foco = cod; cp.todos = true; pagInicio('cp'); }
    pintarApp();
  }
  // Pestañas de Inventario / Cíclico
  function subTabsHtml(actual, lista, campo) {
    return `<div class="tabs tabs-sub" role="tablist">${lista.map(([k, t]) => `<button class="tab ${actual === k ? 'on' : ''}" onclick="${campo}='${k}'; pintarApp()">${t}</button>`).join('')}</div>`;
  }/* ================= Contar: Ingresar (como el rótulo: código y cantidad) y Confirmar (buscar lo que se llenó) =================
     Inventario y cíclico son procesos aparte: cada uno guarda sus propios conteos.
     Siempre se escoge primero el almacén. En el cíclico solo se aceptan los productos que mandaron a contar.
     Lo que se ingresa es el picking; calidad y bloqueado se toman del Excel que cargó el encargado. */
  const ing = { alm: leerLS('ingAlm') || '', cod: '', partes: [] };   // partes: cantidades que ya sumó antes de guardar
  const ingAlmacenes = () => Object.values(codGen().almacenes).filter(a => a.alm);
  const ingEsKg = p => !!p && (p.unidadMedida || '').toUpperCase() === 'KG';

  function cpIngresarHtml() {
    const S = cpScope();
    if (!cpPuedeContar(S)) return S.cic && S.cic.estado === 'CERRADO' ? '<div class="alerta-fefo">Este cíclico está cerrado. Para seguir contando, el encargado lo tiene que volver a abrir.</div>'
      : '<p class="muted">No tienes permiso para contar. Pídeselo al administrador.</p>';
    if (!S.cic) return invIngresarHtml(S);   // Inventario: primero el producto y después su almacén
    const alms = ingAlmacenes();
    if (ing.alm && !alms.some(a => a.key === ing.alm)) ing.alm = '';
    const p = ing.cod && prodDe(ing.cod);
    const kg = ingEsKg(p);
    const ya = p ? ingYaContado(S, p.id) : null;
    const T = S.cic ? cpTodo(S) : null;
    const prog = S.cic ? (() => { const fs = new Set(S.conteos.map(c => c.codigo)); return { l: S.cic.codigos.filter(k => fs.has(k)).length, t: S.cic.codigos.length }; })() : null;
    return `<div class="ing-lado"><section class="card col gap12 ing">
      <div><label class="lbl" for="ingAlm">1. Almacén</label>
        <select id="ingAlm" class="campo" onchange="ing.alm=this.value; guardarLS('ingAlm', ing.alm); pintarApp(); setTimeout(() => $('ingCod') && $('ingCod').focus(), 50)">
          <option value="">Escoge el almacén</option>${alms.map(a => `<option value="${esc(a.key)}" ${a.key === ing.alm ? 'selected' : ''}>${esc(a.nombre)}</option>`).join('')}</select></div>
      ${!ing.alm ? '' : `
      <div><label class="lbl" for="ingCod">2. Código del producto</label>
        <div class="fila gap8"><span class="campo-x" style="flex:1;min-width:0">
          <input id="ingCod" class="campo" autocomplete="off" spellcheck="false" placeholder="Código Atlantic, Nutresa, EAN o nombre" value="${p ? esc(p.id + ' · ' + p.nombre) : ''}" aria-controls="ingSug">
          <button type="button" class="campo-x-btn" onclick="ingLimpiar()" aria-label="Borrar el código" title="Borrar todo">✕</button></span>${botonCamara('ingCod', 'btn btn-sec btn-cam2')}</div>
        <div id="ingSug" class="ing-sug" role="listbox" aria-label="Productos que coinciden" hidden></div></div>
      ${p ? `<div class="info"><span class="fuerte">${esc(p.nombre)}</span>
          <span class="muted small">Nutresa ${esc(p.codigoNutresa || '—')} · Atlantic ${esc(p.id)} · ${kg ? 'peso variable (kg)' : `${p.undPorCaja || 1} und por caja`}</span>
          ${ingCbHtml(S, p, kg)}
          ${ya && ya.tienePk ? `<span class="small txt-naranja">Ya se contó en este almacén: <b>${nInv(ya.cant)}</b> ${kg ? 'kg' : 'und'} (${esc(ya.usuario || '—')}). Lo que guardes se suma; si te equivocas, corrígelo en Consultar.</span>` : ''}
          <div id="ingAviso">${ingAvisoHtml(S)}</div></div>
        <div><label class="lbl" for="ingCant">3. ${kg ? 'Peso total (kg)' : 'Cantidad total (unidades)'}</label>
          <input id="ingCant" class="campo ing-in ing-total" type="text" inputmode="${tactil ? 'none' : 'decimal'}" autocomplete="off" placeholder="0  (ej. 12x24)">
          <span id="ingCalc" class="small txt-azul" aria-live="polite"></span>
          ${tactil ? ingTecladoHtml() : ''}
          ${ingUltimoHtml()}</div>
        <div class="ing-cal">
          <span class="fila gap8 wrap-f">
            <button type="button" id="ingCalBtn" class="btn btn-sec btn-mini" onclick="ingVerExtra('CALIDAD')">+ Agregar calidad</button>
            <button type="button" id="ingBloBtn" class="btn btn-sec btn-mini" onclick="ingVerExtra('BLOQUEADO')">+ Agregar bloqueado</button></span>
          <div id="ingCalCampo" hidden><label class="lbl" for="ingCal">Calidad nueva (${kg ? 'kg' : 'und'}) <span class="muted" id="ingCalBase"></span></label>
            <input id="ingCal" class="campo" type="number" inputmode="decimal" min="0" step="any" placeholder="0" oninput="ingExtraTotal('CALIDAD')">
            <span class="small muted" id="ingCalTot"></span></div>
          <div id="ingBloCampo" hidden><label class="lbl" for="ingBlo">Bloqueado nuevo (${kg ? 'kg' : 'und'}) <span class="muted" id="ingBloBase"></span></label>
            <input id="ingBlo" class="campo" type="number" inputmode="decimal" min="0" step="any" placeholder="0" oninput="ingExtraTotal('BLOQUEADO')">
            <span class="small muted" id="ingBloTot"></span></div></div>
        <p id="fErr" class="error" hidden></p>
        <button id="ingOk" class="btn btn-ent-solido btn-xl" onclick="ingGuardar()">Guardar</button>` : ''}
      ${prog ? `<div class="cp-prog small">${cpBarra(prog.l, prog.t)} <span><b>${prog.l} de ${prog.t}</b> productos ${esReconf(S.cic) ? 'del reconteo' : 'del cíclico'} contados · ${prog.t - prog.l
          ? `<button type="button" class="link ing-faltan" onclick="ingVerFaltan()">faltan <b>${prog.t - prog.l}</b> · ver cuáles</button>` : '<b class="txt-verde">todos contados</b>'}</span></div>` : ''}`}
    </section>
    ${ing.alm ? ingRecientesHtml(S) : ''}</div>`;
  }
  /* ----- Ingresar en Inventario: 1. producto, 2. almacén (el registrado del producto), 3. cantidad -----
     Si el producto tiene un solo almacén registrado, viene escogido. Si tiene dos o más, no viene ninguno y
     solo se puede escoger entre esos. Si no tiene ninguno registrado, se escoge entre todos. */
  function asegurarAlmProd() {
    if (prodAlm !== null) return true;
    if (!asegurarAlmProd.pidiendo) {
      asegurarAlmProd.pidiendo = true;
      llamar('bdAlmacenesProductos').then(m => { prodAlm = m || {}; }).catch(() => { prodAlm = {}; })
        .finally(() => { asegurarAlmProd.pidiendo = false; if (vista === 'productos' && prodTab === 'inventario') pintarApp(); });
    }
    return false;
  }
  /* ----- Almacén y pasillo de cada producto POR SEDE (Inventario → «Actualizar almacenes y pasillos»).
     Si en una sede el producto no está cargado, vale el almacén de Productos totales y el pasillo del plano. ----- */
  const ubicSede = {};   // sede → { m: { codigo: [{ almacen, pasillo }] } } o { pidiendo: true }
  function asegurarUbicSede(sid) {
    const x = ubicSede[sid];
    if (x && x.m) return x.m;
    if (!x || !x.pidiendo) {
      ubicSede[sid] = { pidiendo: true };
      llamar('bdUbicProductosSede', sid).then(m => { ubicSede[sid] = { m: m || {} }; }).catch(() => { ubicSede[sid] = { m: {} }; })
        .finally(() => { if (vista === 'productos') pintarApp(); });
    }
    return null;
  }
  function almsRegDe(cod, sid) {
    const m = (ubicSede[sid] || {}).m, l = m && m[cod];
    return l && l.length ? [...new Set(l.map(x => x.almacen))] : ((prodAlm && prodAlm[cod]) || []);
  }
  // Lo cargado de un producto en una sede (almacén y pasillo, ya arreglado), con o sin pasillo
  function cargadoDe(cod, sid) {
    const m = (ubicSede[sid || ses.sedeId] || {}).m, l = (m && m[cod]) || [];
    return l.map(y => ({ almacen: String(y.almacen), pasillo: normPas(y.pasillo) }));
  }
  // Almacenes y pasillos cargados en la sede (para los filtros cuando se usa lo cargado)
  function cargadosSede(sid) {
    const m = (ubicSede[sid || ses.sedeId] || {}).m || {}, alms = {}, num_ = (a, b) => String(a).localeCompare(String(b), 'es', { numeric: true });
    Object.values(m).forEach(l => l.forEach(y => { const a = String(y.almacen), pa = normPas(y.pasillo); (alms[a] = alms[a] || new Set()); if (pa) alms[a].add(pa); }));
    return Object.keys(alms).sort(num_).map(a => ({ alm: a, pasillos: [...alms[a]].sort(num_) }));
  }
  const pasTxt = x => /^\d/.test(String(x)) ? 'Pasillo ' + x : String(x);
  // Configuración → Ajustes: si se apaga, el pasillo es siempre el del plano
  const usarPasCargado = () => !(ini && ini.parametros && ini.parametros.pasillo_cargado === false);
  // Pasillo como lo escriben en el Excel → como lo usa la app: «PASILLO 3», «PAISLLO 3», «P-3» → «3»; «PASILLO» solo → sin pasillo; «Conge» queda igual
  function normPas(v) {
    const t = String(v ?? '').trim().replace(/\.0+$/, '').replace(/\s+/g, ' ');
    if (!t) return '';
    const u = sinTilde(t).toUpperCase();
    if (/^P[A-Z]*L+[A-Z]*$/.test(u) && /^PA?I?S/.test(u)) return '';            // «PASILLO» sin número
    const m = u.match(/^([A-Z.]*)\s*[-#:.]?\s*(\d+[A-Z]?)$/);
    if (m && (!m[1] || /^P/.test(m[1]))) return m[2].replace(/^0+(?=\d)/, '');
    return t;
  }
  function pasCargado(cod, sid, alm) {
    if (!usarPasCargado()) return '';
    const l = pasCargadosDe(cod, sid);
    const x = l.find(y => !alm || y.almacen === alm) || l[0];
    return x ? x.pasillo : '';
  }
  // Todos los almacén + pasillo cargados de un producto en una sede (ya arreglados)
  function pasCargadosDe(cod, sid) {
    const m = (ubicSede[sid] || {}).m, l = (m && m[cod]) || [];
    return l.map(y => ({ almacen: y.almacen, pasillo: normPas(y.pasillo) })).filter(y => y.pasillo);
  }
  let ubTmp = null;
  function abrirCargaUbicSede() {
    if (sinPermiso('prod_almacenes')) return;
    ubTmp = { sede: '' };
    abrirModal(`<div class="fila-sb"><span class="h2 fila gap8">Actualizar almacenes y pasillos ${ayudaHtml('El almacén y el pasillo de un producto pueden cambiar de una sede a otra. Por eso primero escoges la sede y después subes el Excel con el código del producto, su almacén y su pasillo. Si un producto no trae pasillo, se usa el del plano. Lo que subas reemplaza lo cargado de esa sede; las demás sedes no cambian.')}</span>${btnCerrar()}</div>
      <div class="mt12"><label class="lbl" for="ubSede">1. ¿De qué sede vas a cargar?</label>
        <select id="ubSede" class="campo"><option value="">Escoge la sede</option>${ini.sedes.map(x => `<option value="${esc(x.id)}">${esc(x.nombre)}</option>`).join('')}</select></div>
      <div id="ubPaso2" class="mt12" hidden><span class="lbl">2. Sube el Excel de esa sede (código, almacén y pasillo)</span>
        <label for="ubArch" class="btn btn-pri btn-xl mt8" role="button" tabindex="0">Cargar Excel</label>
        <input id="ubArch" type="file" accept=".xlsx,.xls,.csv" class="oculto"></div>
      <div id="ubCaja" class="mt12"></div>
      <p id="fErr" class="error" hidden></p>`);
    $('ubSede').addEventListener('change', () => { ubTmp = { sede: $('ubSede').value }; $('ubPaso2').hidden = !ubTmp.sede; $('ubCaja').innerHTML = ''; $('fErr').hidden = true; });
    $('ubArch').addEventListener('change', ev => { const f = ev.target.files[0]; if (f) leerUbicSede(f); ev.target.value = ''; });
  }
  function leerUbicSede(f) {
    const r = new FileReader();
    r.onload = () => {
      try {
        let filas;
        if (window.XLSX && !/\.csv$/i.test(f.name)) {
          const wb = XLSX.read(new Uint8Array(r.result), { type: 'array' });
          filas = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1, raw: true, defval: '' });
        } else filas = new TextDecoder('utf-8').decode(r.result).split(/\r?\n/).map(l => l.split(/[;,\t]/).map(c => c.replace(/^"|"$/g, '').trim()));
        const t = v => sinTilde(String(v || '')).toUpperCase().trim();
        const iCab = filas.findIndex(x => x.some(c => /COD/.test(t(c))) && x.some(c => /ALMACEN/.test(t(c))));
        if (iCab < 0) return errForm('No encontré las columnas de código y ALMACEN en ese archivo.');
        const cab = filas[iCab].map(t), col = re => cab.findIndex(c => re.test(c));
        const cCod = [col(/COD.*(ATL|AFS)/), col(/^COD/), col(/COD/)].find(i => i >= 0), cAlm = col(/ALMACEN/), cPas = col(/PASILLO/);
        const cod = v => String(v ?? '').trim().replace(/\.0+$/, '').replace(/^0+(?=\d)/, '');
        const ok = [], malos = new Set();
        filas.slice(iCab + 1).forEach(x => {
          const c = cod(x[cCod]), a = cod(x[cAlm]), pa = cPas >= 0 ? normPas(x[cPas]) : '';
          if (!c || !a) return;
          const p = prodDe(c) || buscarProducto(c);
          if (p && p.id === c) ok.push({ codigo: c, almacen: a, pasillo: pa }); else malos.add(c);
        });
        ubTmp = { sede: ubTmp.sede, archivo: f.name, filas: ok };
        const prods = new Set(ok.map(x => x.codigo)).size, conPas = ok.filter(x => x.pasillo).length;
        const pasVistos = [...new Set(ok.filter(x => x.pasillo).map(x => x.pasillo))].sort((a, b) => a.localeCompare(b, 'es', { numeric: true }));
        $('ubCaja').innerHTML = `<div class="info"><b>${prods}</b> productos para <b>${esc(nombreSede(ubTmp.sede))}</b> · <b>${conPas}</b> filas con pasillo${cPas < 0 ? ' <span class="txt-naranja">(el archivo no trae columna PASILLO: se usará el del plano)</span>' : ''}${malos.size ? ` · <span class="txt-naranja">${malos.size} códigos no están en Productos</span>` : ''}</div>
          ${malos.size ? `<span class="muted small">No están: ${[...malos].slice(0, 12).map(esc).join(', ')}${malos.size > 12 ? '…' : ''}</span>` : ''}
          ${pasVistos.length ? `<span class="small mt8">Pasillos que quedan: <b>${pasVistos.slice(0, 30).map(esc).join(', ')}</b>${pasVistos.length > 30 ? '…' : ''} ${ayudaHtml('«PASILLO 3» o «PAISLLO 3» quedan como pasillo 3, igual que en el plano. Si dice solo «PASILLO» sin número, ese producto queda sin pasillo cargado.')}</span>` : ''}
          <div class="dos mt12"><button class="btn btn-sec btn-xl" onclick="cerrarModal()">Cancelar</button>
            <button id="ubOk" class="btn btn-pri btn-xl" onclick="guardarUbicSede()" ${ok.length ? '' : 'disabled'}>Guardar</button></div>`;
      } catch (e) { errForm('No se pudo leer el archivo: ' + e.message); }
    };
    r.readAsArrayBuffer(f);
  }
  /* ----- Cargar el Excel maestro de productos (COD, Texto breve, Unidad medida base, Equiv Kg, Categoría, EAN 13, EAN 13, EAN 14, UND / CJ…) ----- */
  let maeTmp = null, maeModo = 'actualizar';
  // «Cargar productos»: escoger qué se va a hacer (cada opción es un permiso)
  function abrirCargarProductos() {
    const op = (perm, t, d, onclick, peligro) => puede(perm) ? `<button class="op-carga ${peligro ? 'op-peligro' : ''}" onclick="${onclick}"><b>${t}</b><span class="muted small">${d}</span></button>` : '';
    abrirModal(`<div class="fila-sb"><span class="h2">Cargar productos</span>${btnCerrar()}</div>
      <span class="muted small mt8">Escoge qué quieres hacer con el Excel.</span>
      <div class="col gap8 mt12">
        ${op('prod_cargar', 'Actualizar productos', 'Agrega los productos nuevos y, a los que ya están, les completa o actualiza los datos que traiga el Excel. Lo que venga vacío se deja como estaba.', "abrirCargaMaestro('actualizar')")}
        ${op('prod_reemplazar', 'Reemplazar todo', 'Los productos quedan exactamente como vienen en el Excel. Los que no vienen se desactivan (no se borran: su historial sigue guardado).', "abrirCargaMaestro('reemplazar')", true)}
        ${op('prod_almacenes', 'Actualizar almacenes', 'Sube el código de cada producto y su almacén (sirve la MB52).', 'abrirCargaAlmProd()')}
      </div>`);
  }
  function abrirCargaMaestro(modo) {
    maeModo = modo === 'reemplazar' ? 'reemplazar' : 'actualizar';
    if (sinPermiso(maeModo === 'reemplazar' ? 'prod_reemplazar' : 'prod_cargar')) return;
    maeTmp = null;
    abrirModal(`<div class="fila-sb"><span class="h2 fila gap8">${maeModo === 'reemplazar' ? 'Reemplazar todos los productos' : 'Actualizar productos'} ${ayudaHtml('Sube el Excel maestro con las columnas COD, Texto breve de material, Unidad medida base, Equiv Kg, Categoría, Subcategoría, Observaciones Abastecimiento, EAN 13, EAN 13, EAN 14, UM PROVEEDOR, UND / CJ, LARGO, ANCHO, ALTO y OBSERVACIONES. Los datos que vengan en el Excel se actualizan; si una celda viene vacía, se deja lo que ya tenía el producto. El nombre de los productos que ya existen no se cambia.')}</span>${btnCerrar()}</div>
      <label for="maeArch" class="btn btn-pri btn-xl mt12" role="button" tabindex="0">Escoger el Excel</label>
      <input id="maeArch" type="file" accept=".xlsx,.xls,.csv" class="oculto">
      <div id="maeCaja" class="mt12"></div>
      <p id="fErr" class="error" hidden></p>`);
    $('maeArch').addEventListener('change', ev => { const f = ev.target.files[0]; if (f) leerMaestro(f); ev.target.value = ''; });
  }
  function leerMaestro(f) {
    const r = new FileReader();
    r.onload = () => {
      try {
        let filas;
        if (window.XLSX && !/\.csv$/i.test(f.name)) {
          const wb = XLSX.read(new Uint8Array(r.result), { type: 'array' });
          filas = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1, raw: true, defval: '' });
        } else filas = new TextDecoder('utf-8').decode(r.result).split(/\r?\n/).map(l => l.split(/[;\t]/).map(c => c.replace(/^"|"$/g, '').trim()));
        const t = v => sinTilde(String(v || '')).toUpperCase().replace(/\s+/g, ' ').trim();
        const iCab = filas.findIndex(x => x.some(c => /^COD/.test(t(c))) && x.some(c => /^EAN/.test(t(c))));
        if (iCab < 0) return errForm('No encontré las columnas COD y EAN en ese archivo. Revisa que sea el maestro de productos.');
        const cab = filas[iCab].map(t), col = re => cab.findIndex(c => re.test(c));
        const e13 = cab.map((c, i) => /^EAN ?13/.test(c) ? i : -1).filter(i => i >= 0);
        const C = { codigo: [col(/^COD(IGO)?$/), col(/^COD/)].find(i => i >= 0), nombre: col(/TEXTO BREVE|DESCRIPCION/), unidadMedida: col(/UNIDAD MEDIDA BASE|^UMB$/),
          equivKg: col(/EQUIV/), categoria: col(/^CATEGORIA/), subcategoria: col(/SUBCATEGORIA/), obsAbast: col(/OBSERVACIONES ABAST/),
          ean: e13[0] ?? -1, ean2: e13[1] ?? -1, ean14: col(/^EAN ?14/), umProveedor: col(/UM PROVEEDOR/), undPorCaja: col(/^UND ?\/ ?CJ|UND.*CJ/),
          largo: col(/^LARGO/), ancho: col(/^ANCHO/), alto: col(/^ALTO/), observaciones: cab.findIndex(c => c === 'OBSERVACIONES') };
        const val = (x, k) => { const i = C[k]; if (i < 0 || i === undefined) return ''; const v = x[i]; return typeof v === 'number' ? String(v) : String(v ?? '').trim(); };
        const cod = v => String(v ?? '').trim().replace(/\.0+$/, '').replace(/^0+(?=\d)/, '');
        const ean = v => String(v ?? '').replace(/\.0+$/, '').replace(/[\s-]/g, '');
        const lista = [], vistos = new Set();
        filas.slice(iCab + 1).forEach(x => {
          const c = cod(x[C.codigo]);
          if (!c || vistos.has(c)) return;
          vistos.add(c);
          const o = { codigo: c };
          Object.keys(C).forEach(k => { if (k !== 'codigo') o[k] = /^ean/.test(k) ? ean(val(x, k)) : val(x, k); });
          lista.push(o);
        });
        if (!lista.length) return errForm('El archivo no trae productos debajo de los títulos.');
        const existen = lista.filter(o => prodDe(o.codigo)).length, nuevos = lista.length - existen;
        const con13 = lista.filter(o => o.ean || o.ean2).length, con14 = lista.filter(o => o.ean14).length;
        const faltanCols = [['nombre', 'Texto breve'], ['unidadMedida', 'Unidad medida base'], ['ean14', 'EAN 14'], ['undPorCaja', 'UND / CJ']].filter(([k]) => C[k] < 0).map(([, n]) => n);
        maeTmp = { archivo: f.name, filas: lista };
        $('fErr').hidden = true;
        if (maeModo === 'reemplazar') {
          const enArch = new Set(lista.map(o => o.codigo));
          const fuera = ini.productos.filter(p => p.activo !== false && !enArch.has(p.id));
          const conStock = new Set(sede.lineas.map(l => l.productoId));
          const fueraStock = fuera.filter(p => conStock.has(p.id)).length;
          $('maeCaja').innerHTML = `<div class="info"><b>${lista.length}</b> productos en el archivo · <b>${existen}</b> ya están · <b>${nuevos}</b> nuevos</div>
            ${faltanCols.length ? `<span class="small txt-naranja mt8">No encontré estas columnas: ${faltanCols.map(esc).join(', ')}. Esos datos quedan vacíos.</span>` : ''}
            <div class="alerta-fefo mt12"><b>Ojo:</b> los productos quedan exactamente como vienen en el Excel (nombre, datos y EAN; lo vacío queda vacío).
              <b>${fuera.length}</b> producto${fuera.length === 1 ? '' : 's'} que no ${fuera.length === 1 ? 'viene' : 'vienen'} en el Excel se ${fuera.length === 1 ? 'desactiva' : 'desactivan'}${fueraStock ? ` (<b class="txt-rojo">${fueraStock} tienen producto en el plano de esta sede</b>)` : ''}: ya no salen en las listas, pero su historial sigue guardado.</div>
            <div class="dos mt12"><button class="btn btn-sec btn-xl" onclick="cerrarModal()">Cancelar</button>
              <button id="maeOk" class="btn btn-sal-solido btn-xl" onclick="if (this.dataset.ok !== '1') { this.dataset.ok = '1'; this.textContent = '¿Seguro? Toca otra vez'; return; } guardarMaestro()">Reemplazar todo</button></div>`;
          return;
        }
        $('maeCaja').innerHTML = `<div class="info"><b>${lista.length}</b> productos en el archivo · <b>${existen}</b> ya están en Productos${nuevos ? ` · <span class="txt-naranja"><b>${nuevos}</b> no están</span>` : ''}<br>
            <b>${con13}</b> con EAN 13 · <b>${con14}</b> con EAN 14 (caja)</div>
          ${faltanCols.length ? `<span class="small txt-naranja mt8">No encontré estas columnas: ${faltanCols.map(esc).join(', ')}. Esos datos no se cargan.</span>` : ''}
          ${nuevos ? `<label class="fila gap8 mt12"><input type="checkbox" id="maeCrear" checked> <span>${nuevos === 1 ? 'Crear el que no está' : `Crear los ${nuevos} que no están`} ${ayudaHtml('Se crean con el nombre del Excel y el código Nutresa igual al código. Después los puedes corregir en «Editar productos».')}</span></label>` : ''}
          <label class="fila gap8 mt8"><input type="checkbox" id="maeReemp" onchange="$('maeAviso').hidden = !this.checked"> <span>Esta vez, <b>reemplazar los EAN</b> que ya tienen ${ayudaHtml('Úsalo solo para quitar EAN de prueba: los EAN de los productos del archivo quedan exactamente como vienen en el Excel (si en el Excel no traen EAN, se les quita). Sin marcar, solo se llenan los EAN que estén vacíos y no se cambia ninguno que ya exista.')}</span></label>
          <p id="maeAviso" class="small txt-rojo" hidden>Se borran los EAN que tienen hoy los ${existen} productos del archivo y quedan los del Excel.</p>
          <div class="dos mt12"><button class="btn btn-sec btn-xl" onclick="cerrarModal()">Cancelar</button>
            <button id="maeOk" class="btn btn-pri btn-xl" onclick="guardarMaestro()">Cargar ${lista.length} productos</button></div>`;
      } catch (e) { errForm('No se pudo leer el archivo: ' + e.message); }
    };
    r.readAsArrayBuffer(f);
  }
  function guardarMaestro() {
    const b = $('maeOk');
    if (!b || b.disabled || !maeTmp) return;
    b.disabled = true; b.textContent = 'Cargando…';
    const reemplazarEan = !!($('maeReemp') && $('maeReemp').checked), crear = !!($('maeCrear') && $('maeCrear').checked);
    const reemplazarTodo = maeModo === 'reemplazar';
    llamar('bdCargarMaestroProductos', { filas: maeTmp.filas, reemplazarEan, crear, reemplazarTodo, usuario: ses.nombre }).then(r => {
      ini.productos = r.productos; prodRefrescado();
      pitido();
      const lst = (l, n) => l.length ? `<span class="small mt8">${n} (${l.length}): ${l.slice(0, 20).map(esc).join(' · ')}${l.length > 20 ? '…' : ''}</span>` : '';
      $('maeCaja').innerHTML = `<div class="info"><b>Listo.</b> ${plural(r.actualizados, 'producto actualizado', 'productos actualizados')}${r.creados ? ` · ${plural(r.creados, 'creado', 'creados')}` : ''}${r.sinCambios ? ` · ${plural(r.sinCambios, 'ya estaba igual', 'ya estaban iguales')}` : ''}${r.desactivados ? ` · ${plural(r.desactivados, 'desactivado', 'desactivados')}` : ''}<br>
          ${plural(r.eanPuestos, 'EAN puesto', 'EAN puestos')}${r.eanQuitados ? ` · ${plural(r.eanQuitados, 'EAN quitado', 'EAN quitados')}` : ''}</div>
        ${lst(r.repetidos, '<b class="txt-naranja">EAN que no se pusieron porque ya son de otro producto</b>')}
        ${lst(r.malos, '<b class="txt-naranja">EAN con números de más o de menos</b>')}
        ${lst(r.noEstan, '<b class="txt-naranja">Códigos que no están (no se crearon)</b>')}
        <button class="btn btn-pri btn-xl mt12" onclick="cerrarModal(); pintarApp()">Cerrar</button>`;
      if (vista === 'productos' && prodTab === 'totales') { ptMemo = null; if ($('prodLista')) $('prodLista').innerHTML = listaProdHtml(); }
    }).catch(e => { b.disabled = false; b.textContent = `Cargar ${maeTmp.filas.length} productos`; errForm(e.message); });
  }
  function guardarUbicSede() {
    const b = $('ubOk'); b.disabled = true; b.textContent = 'Guardando…';
    const sid = ubTmp.sede;
    llamar('bdCargarUbicProductosSede', { sedeId: sid, filas: ubTmp.filas, usuario: ses.nombre }).then(r => {
      cerrarModal(); delete ubicSede[sid]; ptMemo = null;
      pitido(); toast(`Listo: ${r.guardados} filas de almacén y pasillo guardadas para ${nombreSede(sid)}`, 'ok');
      pintarApp();
    }).catch(e => { b.disabled = false; b.textContent = 'Guardar'; errForm(e.message); });
  }
  function ingAlmsProd(cod) {
    const todos = ingAlmacenes(), reg = almsRegDe(cod, ses.sedeId);
    const suyos = todos.filter(a => reg.includes(String(a.alm)));
    return suyos.length ? { lista: suyos, registrado: true } : { lista: todos, registrado: false };
  }
  function ingElegirAlm(v) {
    ing.alm = v;
    const ya = ing.cod ? ingYaContado(cpScope(), ing.cod) : null;
    ing.base = ya ? ya.fecha : null; ing.avisado = false;
    pintarApp();
    setTimeout(() => { const f = ing.alm ? $('ingCant') : $('ingAlm'); if (f) f.focus(); }, 30);
  }
  function invIngresarHtml(S) {
    if (!asegurarAlmProd() || !asegurarUbicSede(ses.sedeId)) return '<div class="cargando">Cargando almacenes de los productos…</div>';
    const p = ing.cod && prodDe(ing.cod), kg = ingEsKg(p);
    const ops = p ? ingAlmsProd(p.id) : null;
    if (ops && ing.alm && !ops.lista.some(a => a.key === ing.alm)) ing.alm = '';
    if (ops && !ing.alm && ops.registrado && ops.lista.length === 1) ing.alm = ops.lista[0].key;
    const ya = p && ing.alm ? ingYaContado(S, p.id) : null;
    return `<div class="ing-lado"><section class="card col gap12 ing">
      <div><label class="lbl" for="ingCod">1. Código del producto</label>
        <div class="fila gap8"><span class="campo-x" style="flex:1;min-width:0">
          <input id="ingCod" class="campo" autocomplete="off" spellcheck="false" placeholder="Código Atlantic, Nutresa, EAN o nombre" value="${p ? esc(p.id + ' · ' + p.nombre) : ''}" aria-controls="ingSug">
          <button type="button" class="campo-x-btn" onclick="ingLimpiar()" aria-label="Borrar el código" title="Borrar todo">✕</button></span>${botonCamara('ingCod', 'btn btn-sec btn-cam2')}</div>
        <div id="ingSug" class="ing-sug" role="listbox" aria-label="Productos que coinciden" hidden></div></div>
      ${!p ? '' : `<div class="info"><span class="fuerte">${esc(p.nombre)}</span>
          <span class="muted small">Nutresa ${esc(p.codigoNutresa || '—')} · Atlantic ${esc(p.id)} · ${kg ? 'peso variable (kg)' : `${p.undPorCaja || 1} und por caja`}</span>
          ${ingCbHtml(S, p, kg)}</div>
        <div><label class="lbl" for="ingAlm">2. Almacén</label>
          <select id="ingAlm" class="campo" onchange="ingElegirAlm(this.value)">
            ${ops.lista.length === 1 && ops.registrado ? '' : '<option value="">Escoge el almacén</option>'}${ops.lista.map(a => `<option value="${esc(a.key)}" ${a.key === ing.alm ? 'selected' : ''}>${esc(a.nombre)}</option>`).join('')}</select>
          <span class="muted small">${ops.registrado ? (ops.lista.length > 1 ? `Este producto está registrado en ${ops.lista.length} almacenes: escoge en cuál lo estás contando.` : 'Es el almacén registrado del producto.')
            : '<span class="txt-naranja">Este producto no tiene almacén registrado: escoge dónde lo estás contando.</span>'}</span></div>
        ${!ing.alm ? '' : `
        ${ya && ya.tienePk ? `<span class="small txt-naranja">Ya se contó en este almacén: <b>${nInv(ya.cant)}</b> ${kg ? 'kg' : 'und'} (${esc(ya.usuario || '—')}). Lo que guardes se suma; si te equivocas, corrígelo en Consultar.</span>` : ''}
        <div id="ingAviso">${ingAvisoHtml(S)}</div>
        <div><label class="lbl" for="ingCant">3. ${kg ? 'Peso total (kg)' : 'Cantidad total (unidades)'}</label>
          <input id="ingCant" class="campo ing-in ing-total" type="text" inputmode="${tactil ? 'none' : 'decimal'}" autocomplete="off" placeholder="0  (ej. 12x24)">
          <span id="ingCalc" class="small txt-azul" aria-live="polite"></span>
          ${tactil ? ingTecladoHtml() : ''}
          ${ingUltimoHtml()}</div>
        <div class="ing-cal">
          <span class="fila gap8 wrap-f">
            <button type="button" id="ingCalBtn" class="btn btn-sec btn-mini" onclick="ingVerExtra('CALIDAD')">+ Agregar calidad</button>
            <button type="button" id="ingBloBtn" class="btn btn-sec btn-mini" onclick="ingVerExtra('BLOQUEADO')">+ Agregar bloqueado</button></span>
          <div id="ingCalCampo" hidden><label class="lbl" for="ingCal">Calidad nueva (${kg ? 'kg' : 'und'}) <span class="muted" id="ingCalBase"></span></label>
            <input id="ingCal" class="campo" type="number" inputmode="decimal" min="0" step="any" placeholder="0" oninput="ingExtraTotal('CALIDAD')">
            <span class="small muted" id="ingCalTot"></span></div>
          <div id="ingBloCampo" hidden><label class="lbl" for="ingBlo">Bloqueado nuevo (${kg ? 'kg' : 'und'}) <span class="muted" id="ingBloBase"></span></label>
            <input id="ingBlo" class="campo" type="number" inputmode="decimal" min="0" step="any" placeholder="0" oninput="ingExtraTotal('BLOQUEADO')">
            <span class="small muted" id="ingBloTot"></span></div></div>
        <p id="fErr" class="error" hidden></p>
        <button id="ingOk" class="btn btn-ent-solido btn-xl" onclick="ingGuardar()">Guardar</button>`}`}
    </section>
    ${ingRecientesHtml(S)}</div>`;
  }

  // Calidad y bloqueado del producto, tal como vienen en el Excel (se guardan solos con el conteo)
  function ingCbHtml(S, p, kg) {
    const x = S.sapDe(p.id), u = kg ? 'kg' : 'und';
    if (!x) return `<span class="small muted">No está en el Excel de SAP: calidad y bloqueado quedan en 0.</span>`;
    const cal = Number(x.calidad) || 0, blo = Number(x.bloqueado) || 0;
    return `<div class="ing-cb" aria-label="Calidad y bloqueado del Excel">
        <span class="ing-cb-i ${cal ? 'hay' : ''}"><span class="muted small">Calidad</span><b>${nInv(cal)} ${u}</b></span>
        <span class="ing-cb-i ${blo ? 'hay' : ''}"><span class="muted small">Bloqueado</span><b>${nInv(blo)} ${u}</b></span></div>`;
  }
  // Lugar del conteo: el picking de la posición donde está el producto en ese almacén (o el picking del almacén)
  function ingLugar(cod) {
    const ls = sede.lineas.filter(l => l.productoId === cod && (pasilloDe(l.ubicacionId) || {}).key === ing.alm)
      .sort((a, b) => pasilloDe(a.ubicacionId).rak - pasilloDe(b.ubicacionId).rak);
    if (ls.length) {
      const e = sede.espPorId[ls[0].ubicacionId];
      const pk = espaciosDe(e.rackId, e.posicion).filter(x => x.nivel === 0).sort((a, b) => a.lado.localeCompare(b.lado))[0];
      return pk ? pk.id : e.id;
    }
    return 'PICKING-' + ing.alm;
  }
  const ingDelAlm = ubic => ubic === 'PICKING-' + ing.alm || (pasilloDe(ubic) || {}).key === ing.alm;
  function ingYaContado(S, cod) {
    const cs = S.conteos.filter(c => c.codigo === cod && ingDelAlm(c.ubicacion));
    if (!cs.length) return null;
    const pk = cs.filter(c => c.tipo === 'PICKING');
    const u = cs.reduce((a, c) => !a || c.fecha > a.fecha ? c : a, null);
    const lugar = (pk[0] || cs[0]).ubicacion;
    const de = t => cs.filter(c => c.tipo === t && c.ubicacion === lugar).reduce((a, c) => a + c.cantidad, 0);
    return { cant: pk.reduce((a, c) => a + c.cantidad, 0), tienePk: pk.length > 0, lugar, calidad: de('CALIDAD'), bloqueado: de('BLOQUEADO'), usuario: u && u.usuario, fecha: u && u.fecha };
  }
  // ¿Otra persona guardó este mismo producto (en este almacén) mientras yo lo estaba llenando?
  function ingOtro(S) {
    if (!ing.cod) return null;
    const ya = ingYaContado(S || cpScope(), ing.cod);
    if (!ya || ya.fecha === ing.base || !ya.usuario || ya.usuario === ses.nombre) return null;
    return ya;
  }
  function ingAvisoHtml(S) {
    const o = ingOtro(S), p = o && prodDe(ing.cod);
    if (!o) return '';
    return `<div class="ing-aviso" role="alert"><b>⚠ ${esc(o.usuario)} también está llenando este producto.</b>
      <span>Acaba de guardar <b>${nInv(o.cant)} ${ingEsKg(p) ? 'kg' : 'und'}</b> aquí (${fechaHora(o.fecha)}). Pónganse de acuerdo antes de guardar para no contarlo dos veces.</span></div>`;
  }
  // Llega algo en vivo: si es el producto que estoy llenando, avisa (y suena una vez)
  function ingAvisoVivo() {
    if (!$('ingAviso')) return;
    const h = ingAvisoHtml();
    if (h && !ing.avisado) { ing.avisado = true; try { pitido(); if (navigator.vibrate) navigator.vibrate([120, 80, 120]); } catch (e) {} }
    $('ingAviso').innerHTML = h;
  }
  // Los productos del cíclico que todavía no se han contado: tocar uno lo pone para contar
  function ingVerFaltan() {
    const S = cpScope();
    if (!S.cic) return;
    const fs = new Set(S.conteos.map(c => c.codigo));
    const l = S.cic.codigos.filter(k => !fs.has(k)).map(k => ({ k, p: prodDe(k) }))
      .sort((a, b) => (a.p ? a.p.nombre : a.k).localeCompare(b.p ? b.p.nombre : b.k));
    abrirModal(`<div class="fila-sb"><span class="h3">Faltan ${l.length} por contar</span><button class="btn btn-sec btn-x" aria-label="Cerrar" onclick="cerrarModal()">✕</button></div>
      <input id="ifQ" class="campo mt8" placeholder="Buscar código o nombre" autocomplete="off" oninput="ingFaltanFiltrar(this.value)">
      <p class="muted small mt8">Toca uno para contarlo.</p>
      <div id="ifLista" class="if-lista">${l.map(x => `<button type="button" class="if-op" data-t="${esc(sinTilde(x.k + ' ' + (x.p ? x.p.codigoNutresa + ' ' + x.p.nombre : '')))}"
          onclick="cerrarModal(); ingProducto('${esc(x.k)}')"><b>${esc(x.k)}</b> · ${esc(x.p ? x.p.nombre : 'Producto no está en el catálogo')}</button>`).join('')}</div>`);
  }
  function ingFaltanFiltrar(q) {
    const pal = sinTilde(String(q || '').trim()).split(/\s+/).filter(Boolean);
    Array.prototype.forEach.call(document.querySelectorAll('#ifLista .if-op'), b => {
      const t = b.getAttribute('data-t');
      b.hidden = !pal.every(w => t.indexOf(w) >= 0);
    });
  }
  // Producto que no está en el cíclico: se pregunta si se agrega (y luego sigue con despues())
  function preguntarAgregarCic(p, despues) {
    const S = cpScope(), c = S.cic;
    if (!c) return;
    window._agrCic = despues;
    abrirModal(`<span class="h3">${esc(p.nombre)} no está en ${esReconf(c) ? 'este reconteo' : 'este cíclico'}</span>
      <p class="mt8">Atlantic ${esc(p.id)}${p.codigoNutresa ? ' · Nutresa ' + esc(p.codigoNutresa) : ''}. ¿Lo agregas para contarlo?</p>
      <p id="acErr" class="error" hidden></p>
      <div class="col gap8 mt12">
        <button id="acOk" class="btn btn-pri btn-xl" onclick="agregarProdCic('${esc(p.id)}')">Agregar y contar</button>
        <button class="btn btn-sec" onclick="cerrarModal()">Cancelar</button></div>`);
  }
  function agregarProdCic(cod) {
    const S = cpScope(), c = S.cic, b = $('acOk');
    if (!c) return;
    b.disabled = true; b.textContent = 'Agregando…';
    llamar('bdAgregarProductoCiclico', { id: c.id, codigo: cod, usuario: ses.nombre }).then(n => {
      [cicData && cicData.ciclico, cicSel_()].forEach(x => { if (x && x.id === n.id) x.codigos = n.codigos.slice(); });
      cerrarModal(); pitido();
      toast(`${(prodDe(cod) || {}).nombre || cod} quedó agregado`, 'ok');
      const f = window._agrCic; window._agrCic = null;
      if (f) f(); else pintarApp();
    }).catch(e => { const er = $('acErr'); er.textContent = e.message; er.hidden = false; b.disabled = false; b.textContent = 'Agregar y contar'; });
  }
  // El encargado agrega un producto desde el cíclico (sin contarlo)
  function agregarProdCicModal() {
    if (sinPermiso('ciclico_asignar')) return;
    abrirModal(`<div class="fila-sb"><span class="h3">Agregar producto</span><button class="btn btn-sec btn-x" aria-label="Cerrar" onclick="cerrarModal()">✕</button></div>
      <label class="lbl mt8" for="apcProd">Código del producto</label>
      <div class="fila gap8">${campoConCamara('<input id="apcProd" class="campo" list="dlProductos" autocomplete="off" spellcheck="false" placeholder="Escanea o escribe el código">', 'apcProd')}</div>
      <p id="acErr" class="error" hidden></p>
      <div class="fila gap8 mt12" style="justify-content:flex-end"><button class="btn btn-sec" onclick="cerrarModal()">Cancelar</button>
        <button id="acOk" class="btn btn-pri" onclick="agregarProdCicDesdeModal()">Agregar</button></div>`);
    setTimeout(() => $('apcProd') && $('apcProd').focus(), 50);
  }
  function agregarProdCicDesdeModal() {
    const v = $('apcProd').value, p = buscarProducto(v.split(' · ')[0]) || buscarProducto(v), er = $('acErr');
    if (!p) { er.textContent = 'No hay un producto con ese código.'; er.hidden = false; return; }
    const S = cpScope();
    if (S.cic && S.cic.codigos.includes(p.id)) { er.textContent = 'Ese producto ya está en el cíclico.'; er.hidden = false; return; }
    window._agrCic = null;
    agregarProdCic(p.id);
  }
  function ingTotal() {
    const el = $('ingCant'), f = el ? calcCant(el.value) : null;
    if (f !== null && isNaN(f)) return NaN;
    if (!ing.partes.length) return f;
    return +(ing.partes.reduce((a, b) => a + b, 0) + (f > 0 ? f : 0)).toFixed(3);
  }
  // Debajo de la cantidad: lo que se acaba de guardar con Enter
  function ingUltimoHtml() {
    const u = ing.ultimo;
    if (!u || u.cod !== ing.cod) return '<span class="small muted ing-ayuda">Enter guarda y se suma. Otra cantidad: escríbela y Enter. Para terminar: Enter con el campo vacío.</span>';
    return `<span class="small txt-verde ing-ultimo" aria-live="polite">✓ Lo acabo de contar${u.cant != null ? `: <b>${nInv(u.cant)} ${u.u}</b>${u.op ? ` (${esc(u.op)})` : ''}` : ''} · total <b>${nInv(u.total)} ${u.u}</b>.
      Escribe otra cantidad y Enter, o Enter vacío para terminar.</span>`;
  }
  // Varias cantidades (cuando van contando por partes): cada una se suma antes de guardar
  function ingPartesHtml(kg) {
    if (!ing.partes.length) return '';
    const t = +ing.partes.reduce((a, b) => a + b, 0).toFixed(3);
    return `Llevas <b>${ing.partes.map(nInv).join(' + ')}${ing.partes.length > 1 ? ' = ' + nInv(t) : ''}</b> ${kg ? 'kg' : 'und'}
      <button type="button" class="link" onclick="ingQuitarParte()">Quitar la última</button>`;
  }
  function ingSumarParte() {
    const el = $('ingCant'), v = el ? num(el.value) : 0;
    if (!(v > 0)) { if (el) el.focus(); return toast('Escribe la cantidad que vas a sumar', 'error'); }
    ing.partes.push(v); el.value = '';
    $('ingPartes').innerHTML = ingPartesHtml(ingEsKg(prodDe(ing.cod)));
    el.focus();
  }
  function ingQuitarParte() {
    ing.partes.pop();
    $('ingPartes').innerHTML = ingPartesHtml(ingEsKg(prodDe(ing.cod)));
    if ($('ingCant')) $('ingCant').focus();
  }
  // Cantidad con operaciones: 12x24+6 → 294 (solo suma y multiplicación). null si está vacía; NaN si no se entiende
  function calcCant(txt) {
    const t = String(txt == null ? '' : txt).replace(/\s+/g, '').replace(/[×*X]/g, 'x').replace(/[−–]/g, '-');
    if (!t) return null;
    if (!/^[\d.,x+\-]+$/.test(t)) return NaN;
    let total = 0;
    // Términos separados por + o −; dentro de cada uno se multiplica primero
    const partes = t.split(/(?=[+\-])/);
    for (const parte of partes) {
      const signo = parte[0] === '-' ? -1 : 1, termino = parte.replace(/^[+\-]/, '');
      if (!termino) return NaN;
      let prod = 1;
      for (const f of termino.split('x')) {
        if (!f) return NaN;
        const n = numSap(f);   // entiende 1,5 y 1.5
        if (!/\d/.test(f) || isNaN(n)) return NaN;
        prod *= n;
      }
      total += signo * prod;
    }
    if (partes[0][0] === '-' || partes[0][0] === '+' || total < 0) return NaN;   // no empieza con signo ni da negativo
    return +total.toFixed(3);
  }
  const ingEsOperacion = v => /[x×*X+\-−]/.test(String(v || ''));
  function ingCalc() {
    const el = $('ingCant'), out = $('ingCalc');
    if (!el || !out) return;
    const v = el.value, r = calcCant(v);
    out.textContent = !ingEsOperacion(v) ? '' : isNaN(r) || r === null ? 'Revisa la operación' : '= ' + nInv(r);
  }
  // Teclado propio en celulares y radiofrecuencias: números con ×, − y + (el del celular no los trae)
  function ingTecladoHtml() {
    const t = (k, txt, cls, lbl) => `<button type="button" class="ing-tecla ${cls || ''}" data-k="${k}" ${lbl ? `aria-label="${lbl}"` : ''}>${txt}</button>`;
    return `<div class="ing-teclado" role="group" aria-label="Teclado de la cantidad">
      ${t('7', '7')}${t('8', '8')}${t('9', '9')}${t('x', '×', 'op', 'Multiplicar')}
      ${t('4', '4')}${t('5', '5')}${t('6', '6')}${t('-', '−', 'op', 'Restar')}
      ${t('1', '1')}${t('2', '2')}${t('3', '3')}${t('+', '+', 'op', 'Sumar')}
      ${t(',', ',', '', 'Coma decimal')}${t('0', '0')}${t('borrar', '⌫', '', 'Borrar')}${t('enter', '✓', 'ok', 'Guardar esta cantidad')}</div>`;
  }
  function ingTecla(k) {
    const el = $('ingCant');
    if (!el) return;
    if (k === 'enter') return ingEnterCant();
    let v = el.value;
    if (k === 'borrar') v = v.slice(0, -1);
    else if (/^[x+\-]$/.test(k)) { if (!v || /[x+\-]$/.test(v)) return; v += k; }   // no empezar ni repetir operación
    else v += k;
    el.value = v; el.focus();
    try { el.setSelectionRange(v.length, v.length); } catch (e) {}
    ingCalc();
  }
  function ingOp(op) {
    const el = $('ingCant');
    if (!el) return;
    const v = el.value.replace(/\s+$/, '');
    if (!v || /[x+]$/.test(v)) { el.focus(); return; }
    el.value = v + op; el.focus();
    try { el.setSelectionRange(el.value.length, el.value.length); } catch (e) {}
    ingCalc();
  }
  /* Buscar productos por código Atlantic, código Nutresa, EAN (del producto o de la caja) o nombre.
     Primero los que coinciden exacto con un código, después los que empiezan así y luego por nombre. */
  function buscarProductos(txt, max, dentro, todo) {
    const t = sinTilde(String(txt || '').trim()), pal = t.split(/\s+/).filter(Boolean);
    if (!pal.length) return [];
    // Primero en la lista de la regional; si ahí no está, en todo el catálogo (a veces el producto no viene en la lista)
    const base = dentro ? dentro.map(prodDe).filter(Boolean) : ini.productos.filter(p => p.activo !== false && (todo || prodDeMiRegional(p)));
    const cods = p => [p.id, p.codigoNutresa, p.codigoBarras, p.ean2, p.ean14].filter(Boolean).map(x => sinTilde(String(x)));
    const res = [];
    base.forEach(p => {
      const cs = cods(p), nom = sinTilde(p.nombre || '');
      let r = -1;
      if (cs.some(c => c === t)) r = 0;
      else if (pal.length === 1 && cs.some(c => c.startsWith(t))) r = 1;
      else if (pal.every(w => nom.includes(w) || cs.some(c => c.includes(w)))) r = nom.startsWith(pal[0]) ? 2 : 3;
      if (r >= 0) res.push([r, p]);
    });
    res.sort((a, b) => a[0] - b[0] || a[1].nombre.localeCompare(b[1].nombre));
    if (!res.length && !dentro && !todo && ini.prodReg) return buscarProductos(txt, max, null, true);
    return res.slice(0, max || 8).map(x => x[1]);
  }
  // Lista de coincidencias debajo del código (se toca la que es)
  function ingSugerir(txt) {
    const caja = $('ingSug');
    if (!caja) return;
    const S = cpScope(), t = String(txt || '').trim();
    const l = t.length < 2 || buscarProducto(t.split(' · ')[0]) ? [] : buscarProductos(t, 8, S.cic ? S.cic.codigos : null);
    if (!l.length) { caja.hidden = true; caja.innerHTML = ''; return; }
    caja.innerHTML = l.map(p => `<button type="button" class="ing-sug-op" role="option" data-id="${esc(p.id)}">
        <b>${esc(p.nombre)}</b><span class="muted small">Atlantic ${esc(p.id)} · Nutresa ${esc(p.codigoNutresa || '—')}${p.codigoBarras ? ' · EAN ' + esc(p.codigoBarras) : ''}${prodDeMiRegional(p) ? '' : ' · <b class="txt-naranja">fuera de la lista de la regional</b>'}</span></button>`).join('');
    caja.hidden = false;
    caja.querySelectorAll('.ing-sug-op').forEach(b => {
      b.addEventListener('mousedown', ev => ev.preventDefault());
      b.addEventListener('click', () => { caja.hidden = true; ingProducto(b.getAttribute('data-id'), true); });
    });
  }
  function ingProducto(txt, enter) {
    const p = buscarProducto(String(txt || '').split(' · ')[0]) || buscarProducto(txt);
    const S = cpScope();
    if (!p) {
      const t = String(txt || '').replace(/\s+/g, '');
      if (pareceEan(t) && !buscarProductos(txt, 1).length) return eanNuevoEn(t, 'ing');   // EAN que no está: ponérselo a un producto
      if (enter && String(txt || '').trim()) {
        const l = buscarProductos(txt, 8, S.cic ? S.cic.codigos : null);
        if (l.length === 1) return ingProducto(l[0].id, true);   // una sola coincidencia: esa es
        if (l.length) { ingSugerir(txt); toast('Escoge el producto de la lista'); return; }
        toast('No hay un producto con ese código o nombre', 'error');
      }
      return;
    }
    if ($('ingSug')) $('ingSug').hidden = true;
    if (S.cic && !S.cic.codigos.includes(p.id)) { $('ingCod').value = ''; return preguntarAgregarCic(p, () => ingProducto(p.id)); }
    if (ing.cod !== p.id) { ing.partes = []; ing.ultimo = null; }
    ing.cod = p.id;
    if (!S.cic) { const o = ingAlmsProd(p.id); ing.alm = o.registrado && o.lista.length === 1 ? o.lista[0].key : ''; }   // 2 o más: que escojan
    const ya = ing.alm ? ingYaContado(S, p.id) : null;
    ing.base = ya ? ya.fecha : null; ing.avisado = false;   // lo que había cuando empecé a llenarlo
    pintarApp();
    setTimeout(() => { const f = ing.alm ? $('ingCant') : $('ingAlm'); if (f) f.focus(); }, 30);
  }
  // Calidad a mano (opcional): se abre con el botón; si no la escriben, queda la del Excel
  // Calidad / bloqueado: lo que ya hay (sistema o lo ya registrado) + lo nuevo que escriben
  const ING_X = { CALIDAD: ['Cal', 'calidad'], BLOQUEADO: ['Blo', 'bloqueado'] };
  function ingBaseExtra(S, p, t) {
    const ya = ingYaContado(S, p.id);
    if (ya && S.conteos.some(c => c.codigo === p.id && c.tipo === t && c.ubicacion === ya.lugar)) return ya[ING_X[t][1]];
    if (S.conteos.some(c => c.codigo === p.id && c.tipo === t)) return 0;   // ya se registró en otro lugar
    const sap = S.sapDe(p.id);
    return sap ? Number(sap[ING_X[t][1]]) || 0 : 0;
  }
  function ingVerExtra(t) {
    const S = cpScope(), p = prodDe(ing.cod), k = ING_X[t][0];
    if (!p) return;
    $(`ing${k}Btn`).hidden = true;
    $(`ing${k}Campo`).hidden = false;
    $(`ing${k}Base`).textContent = `· se suma a ${nInv(ingBaseExtra(S, p, t))} que ya hay`;
    ingExtraTotal(t);
    $(`ing${k}`).focus();
  }
  function ingExtraTotal(t) {
    const S = cpScope(), p = prodDe(ing.cod), k = ING_X[t][0], el = $(`ing${k}`);
    if (!p || !el) return;
    const n = el.value.trim() === '' ? 0 : num(el.value);
    $(`ing${k}Tot`).textContent = n >= 0 ? `Queda en ${ING_X[t][1]}: ${nInv(+(ingBaseExtra(S, p, t) + n).toFixed(3))} ${ingEsKg(p) ? 'kg' : 'und'}` : '';
  }
  // Lo nuevo escrito (null si no abrieron el campo o lo dejaron vacío); false si está mal
  function ingLeerExtra(t) {
    const k = ING_X[t][0], el = $(`ing${k}`);
    if (!el || $(`ing${k}Campo`).hidden || el.value.trim() === '') return null;
    const n = num(el.value);
    if (!(n >= 0)) { el.focus(); errForm(`Escribe ${t === 'CALIDAD' ? 'la calidad' : 'el bloqueado'} nuevo (0 si no hay).`); return false; }
    return n;
  }
  // Borra el código de una vez (para no borrar letra por letra) y deja listo para escanear otro
  function ingLimpiar() {
    ing.partes = []; ing.ultimo = null;
    if (ing.cod) { ing.cod = ''; ing.base = null; ing.avisado = false; pintarApp(); }
    const c = $('ingCod');
    if (c) { c.value = ''; c.focus(); }
  }
  function enlazarIngresar() {
    const c = $('ingCod');
    if (!c) return;
    c.addEventListener('change', () => { if (buscarProducto(c.value.split(' · ')[0]) || buscarProducto(c.value)) ingProducto(c.value); });
    c.addEventListener('input', () => ingSugerir(c.value));
    c.addEventListener('blur', () => setTimeout(() => { if ($('ingSug')) $('ingSug').hidden = true; }, 200));
    c.addEventListener('keydown', ev => { if (ev.key === 'Enter') { ev.preventDefault(); ingProducto(c.value, true); } });
    ['ingCal', 'ingBlo'].forEach(id => { if ($(id)) $(id).addEventListener('keydown', ev => { if (ev.key === 'Enter') { ev.preventDefault(); ingGuardar(); } }); });
    document.querySelectorAll('.ing-teclado .ing-tecla').forEach(b => {
      b.addEventListener('mousedown', ev => ev.preventDefault());   // el foco se queda en la cantidad
      b.addEventListener('click', () => ingTecla(b.getAttribute('data-k')));
    });
    const ins = [...document.querySelectorAll('.ing-in')];
    ins.forEach((el, i) => {
      el.addEventListener('input', ingCalc);
      el.addEventListener('focus', () => el.select());
      el.addEventListener('keydown', ev => {
        if (ev.key !== 'Enter') return;
        ev.preventDefault();
        if (el.id === 'ingCant') return ingEnterCant();   // cantidad: guarda y sigue en el mismo producto
        if (ins[i + 1]) ins[i + 1].focus(); else ingGuardar();
      });
    });
    if (!ing.cod) c.focus({ preventScroll: true });
  }
  // Enter en la cantidad: con número, guarda (se suma) y vuelve a la cantidad para el siguiente;
  // vacío, termina ese producto y vuelve al código
  function ingEnterCant() {
    if (ing.guardando) return;
    const el = $('ingCant'), vacio = !el || el.value.trim() === '';
    const abiertos = ['ingCal', 'ingBlo'].some(id => $(id) && $(id).offsetParent && $(id).value.trim() !== '');
    if (vacio && !abiertos && ing.ultimo && ing.ultimo.cod === ing.cod) {
      ing.cod = ''; ing.ultimo = null; ing.extra = null;
      pintarApp();
      setTimeout(() => $('ingCod') && $('ingCod').focus(), 30);
      return;
    }
    ingGuardar(true);
  }
  function ingGuardar(seguir) {
    const S = cpScope(), p = prodDe(ing.cod);
    if (!p) return errForm('Escanea o escribe el código del producto.');
    if (!ing.alm) return errForm('Escoge el almacén.');
    // Calidad y bloqueado nuevos (si abrieron los campos): se suman a lo que ya hay
    const xc = ingLeerExtra('CALIDAD'); if (xc === false) return;
    const xb = ingLeerExtra('BLOQUEADO'); if (xb === false) return;
    ing.extra = { CALIDAD: xc, BLOQUEADO: xb };
    const t = ingTotal();
    // Solo calidad / bloqueado: no hace falta la cantidad de arriba (el picking queda como estaba)
    if (t === null && (xc !== null || xb !== null)) return ingEnviar(p, null, 'extra', seguir);
    if (t !== null && isNaN(t)) { if ($('ingCant')) $('ingCant').focus(); return errForm('No se entiende la operación (o da menos de 0). Usa números con ×, − y + (ej. 12x24+6).'); }
    if (t === null || !(t >= 0)) { if ($('ingCant')) $('ingCant').focus(); return errForm(ingEsKg(p) ? 'Escribe el peso total (o solo calidad / bloqueado).' : 'Escribe la cantidad total (o solo calidad / bloqueado).'); }
    // Si ya estaba contado aquí, se suma directo (si se equivocan, lo corrigen en Consultar)
    const ya = ingYaContado(S, p.id);
    return ingEnviar(p, t, ya && ya.tienePk ? 'sumar' : null, seguir);
  }
  function ingEnviar(p, t, modo, seguir) {
    const S = cpScope(), ya = ingYaContado(S, p.id);
    const lugar = ya ? ya.lugar : ingLugar(p.id);
    // Calidad y bloqueado: los del Excel la primera vez que se cuenta el producto; después se dejan como estaban
    const sap = S.sapDe(p.id);
    const otraVez = t => S.conteos.some(c => c.codigo === p.id && c.tipo === t);
    // Calidad y bloqueado: lo que ya hay (del sistema la primera vez, o lo ya registrado) + lo nuevo que escribieron
    const ex = ing.extra || {};
    const conExtra = tp => +(ingBaseExtra(S, p, tp) + (ex[tp] || 0)).toFixed(3);
    let cantidades;
    if (modo === 'extra') {
      cantidades = {};
      if (ex.CALIDAD !== null && ex.CALIDAD !== undefined) cantidades.CALIDAD = conExtra('CALIDAD');
      if (ex.BLOQUEADO !== null && ex.BLOQUEADO !== undefined) cantidades.BLOQUEADO = conExtra('BLOQUEADO');
    } else cantidades = {
      PICKING: modo === 'sumar' && ya ? +(ya.cant + t).toFixed(3) : t,
      CALIDAD: conExtra('CALIDAD'),
      BLOQUEADO: conExtra('BLOQUEADO')
    };
    const b = $('ingOk'); if (b) { b.disabled = true; b.textContent = 'Guardando…'; }
    ing.guardando = true;
    llamar('bdGuardarConteo', { sedeId: ses.sedeId, ubicacionId: lugar, codigo: p.id, cantidades, usuario: ses.nombre, ciclicoId: S.id })
      .then(lista => {
        const rem = (arr, c) => arr.filter(x => !(x.codigo === c.codigo && x.ubicacion === c.ubicacion && x.tipo === c.tipo)).concat([c]);
        if (S.cic) { lista.forEach(c => { cicData.conteos = rem(cicData.conteos, c); }); const ec = (cicLista || []).find(x => x.id === S.id); if (ec) ec.contados = datosCiclico().filter(x => x.listo).length; }
        else lista.forEach(c => { invData.conteos = rem(invData.conteos || [], c); });
        pitido();
        const xs = [ex.CALIDAD != null ? `calidad ${nInv(cantidades.CALIDAD)}` : '', ex.BLOQUEADO != null ? `bloqueado ${nInv(cantidades.BLOQUEADO)}` : ''].filter(Boolean).join(' · ');
        toast(modo === 'extra' ? `✓ ${p.nombre}: ${xs}` : `✓ ${p.nombre}: ${nInv(cantidades.PICKING)} ${ingEsKg(p) ? 'kg' : 'und'}${modo === 'sumar' ? ' (sumado)' : ''}${xs ? ' · ' + xs : ''}`, 'ok');
        ing.guardando = false; ing.extra = null; ing.partes = [];
        if (seguir) {   // Enter: sigue en el mismo producto, listo para la siguiente cantidad
          const ya2 = ingYaContado(cpScope(), p.id);
          const opTxt = $('ingCant') && ingEsOperacion($('ingCant').value) ? $('ingCant').value.replace(/\s+/g, '').replace(/x/gi, '×').replace(/-/g, '−') : '';
          ing.ultimo = { cod: p.id, cant: modo === 'extra' ? null : t, op: opTxt, total: cantidades.PICKING != null ? cantidades.PICKING : (ya2 ? ya2.cant : 0), u: ingEsKg(p) ? 'kg' : 'und' };
          pintarApp();
          setTimeout(() => $('ingCant') && $('ingCant').focus(), 30);
          return;
        }
        ing.cod = ''; ing.ultimo = null;
        pintarApp();
        setTimeout(() => $('ingCod') && $('ingCod').focus(), 30);
      })
      .catch(e => { ing.guardando = false; errForm(e.message); if (b) { b.disabled = false; b.textContent = 'Guardar'; } });
  }
  // Lo último que llenó la persona en este almacén
  function ingRecientesHtml(S) {
    const m = {};
    S.conteos.filter(c => c.usuario === ses.nombre && (!S.cic || ingDelAlm(c.ubicacion))).forEach(c => {
      const k = c.codigo + '|' + c.ubicacion;
      const x = m[k] || (m[k] = { cod: c.codigo, fecha: c.fecha, PICKING: 0 });
      if (c.tipo === 'PICKING') x.PICKING = c.cantidad;
      if (c.fecha > x.fecha) x.fecha = c.fecha;
    });
    const l = Object.values(m).sort((a, b) => b.fecha.localeCompare(a.fecha)).slice(0, 100);
    if (!l.length) return '';
    return `<section class="card col gap8 ing-recs"><span class="h3">Lo último que contaste${S.cic ? ' aquí' : ''} <span class="muted small">(${l.length})</span></span>
      <div class="lista-bp ing-recs-l">${l.map(x => { const p = prodDe(x.cod); return `<div class="fila-sb gap8 ing-rec"><span class="col" style="min-width:0"><b>${esc(p ? p.nombre : x.cod)}</b>
        <span class="muted small">${esc(x.cod)} · ${fechaHora(x.fecha)}</span></span><b>${nInv(x.PICKING)} ${ingEsKg(p) ? 'kg' : 'und'}</b></div>`; }).join('')}</div>
      <span class="muted small">Para ver todo o corregir, ve a <b>Consultar</b>.</span></section>`;
  }

  /* ----- Confirmar: buscar un código y ver lo que se llenó ----- */
  const cf = { alm: '*', q: '' };
  function cpConfirmarHtml() {
    const S = cpScope(), alms = ingAlmacenes();
    return `<section class="card col gap8">
      <div class="cp-sel">
        <div><label class="lbl" for="cfAlm">Almacén</label><select id="cfAlm" class="campo" onchange="cf.alm=this.value; pagInicio('cf'); $('cfTabla').innerHTML = cfTablaHtml()">
          <option value="*">Todos</option>${alms.map(a => `<option value="${esc(a.key)}" ${a.key === cf.alm ? 'selected' : ''}>${esc(a.nombre)}</option>`).join('')}</select></div>
        <div class="cp-buscar"><label class="lbl" for="cfQ">Buscar producto</label>${campoConCamara(`<input id="cfQ" class="campo" type="search" autocomplete="off" spellcheck="false" placeholder="Código Nutresa, Atlantic o nombre" value="${esc(cf.q)}">`, 'cfQ')}</div>
      </div>
      <div id="cfTabla">${cfTablaHtml(S)}</div>
    </section>`;
  }
  function cfTablaHtml(S) {
    S = S || cpScope();
    const almDe = u => u.startsWith('PICKING-') ? u.slice(8) : (pasilloDe(u) || {}).key || '';
    const m = {};
    S.conteos.forEach(c => {
      const k = c.codigo + '|' + c.ubicacion;
      const x = m[k] || (m[k] = { cod: c.codigo, p: prodDe(c.codigo), ubic: c.ubicacion, alm: almDe(c.ubicacion), PICKING: 0, CALIDAD: 0, BLOQUEADO: 0, usuario: '', fecha: '' });
      x[c.tipo] = c.cantidad;
      if (c.fecha > x.fecha) { x.fecha = c.fecha; x.usuario = c.usuario; }
    });
    const pal = sinTilde(cf.q.trim()).split(/\s+/).filter(Boolean);
    const l = Object.values(m).filter(x => (cf.alm === '*' || x.alm === cf.alm)
      && (!pal.length || pal.every(w => sinTilde(`${x.cod} ${x.p ? x.p.codigoNutresa + ' ' + x.p.nombre + ' ' + (x.p.codigoBarras || '') : ''}`).includes(w))))
      .sort((a, b) => b.fecha.localeCompare(a.fecha));
    const pg = paginar('cf', l, () => { if ($('cfTabla')) $('cfTabla').innerHTML = cfTablaHtml(); });
    if (!l.length) {
      const p = pal.length && buscarProducto(cf.q.trim());
      return `<p class="muted">${pal.length ? (p ? `Todavía no se ha contado <b>${esc(p.nombre)}</b>${cf.alm !== '*' ? ' en este almacén' : ''}.` : 'Ningún producto contado coincide con la búsqueda.') : 'Todavía no hay nada contado.'}</p>`;
    }
    const lugar = u => u.startsWith('PICKING-') ? 'Picking' : cu(u);
    return `<span class="muted small">${l.length} producto${l.length === 1 ? '' : 's'} contado${l.length === 1 ? '' : 's'}</span>
      <div class="tabla-wrap"><table class="tabla cp-tabla cf-tabla"><thead><tr><th>Almacén</th><th>Lugar</th><th>Cód. Nutresa</th><th>Cód. Atlantic</th><th>Producto</th>
        <th class="num">Picking</th><th class="num">Calidad</th><th class="num">Bloqueado</th><th>Contó</th><th></th></tr></thead><tbody>
        ${pg.filas.map(x => `<tr><td data-l="Almacén">${esc(x.alm || '—')}</td><td class="mono-c small" data-l="Lugar">${esc(lugar(x.ubic))}</td><td class="mono-c" data-l="Nutresa">${esc(x.p ? x.p.codigoNutresa || '—' : '—')}</td>
          <td class="mono-c" data-l="Atlantic">${esc(x.cod)}</td><td class="cp-prod" data-l="Producto"><b>${esc(x.p ? x.p.nombre : x.cod)}</b></td>
          <td class="num fuerte" data-l="Picking">${nInv(x.PICKING)}</td><td class="num" data-l="Calidad">${nInv(x.CALIDAD)}</td><td class="num" data-l="Bloqueado">${nInv(x.BLOQUEADO)}</td>
          <td class="small" data-l="Contó">${esc(x.usuario || '—')}<span class="muted"> · ${fechaHora(x.fecha)}</span></td>
          <td class="ec-td" data-l=""><span class="fila gap4">${btnDetalleConteo({ cod: x.cod, p: x.p })}${S.abierto ? btnEditarConteo({ cod: x.cod, p: x.p }) : ''}</span></td></tr>`).join('')}
      </tbody></table></div>${pg.barra}`;
  }
  function enlazarConfirmar() {
    const q = $('cfQ');
    if (!q) return;
    q.addEventListener('input', () => { cf.q = q.value; pagInicio('cf'); $('cfTabla').innerHTML = cfTablaHtml(); });
  }

  /* ----- Detalle de quién contó un producto: cada vez que alguien guardó, cuánto sumó, dónde y cuándo.
     Lo guardado es el total del lugar; aquí se muestra por partes (lo que sumó cada vez). Solo lee. ----- */
  const btnDetalleConteo = f => `<button class="ec-btn" onclick="event.stopPropagation(); verDetalleConteo('${esc(f.cod)}')" title="Ver quién lo contó" aria-label="Ver quién contó ${esc(f.p ? f.p.nombre : f.cod)}">👥</button>`;
  function verDetalleConteo(cod) {
    const p = prodDe(cod), enCic = ctxCic() && cicData ? cicData.ciclico : null;
    abrirModal(`<div class="fila-sb"><span class="h2">Quién lo contó</span>${btnCerrar()}</div>
      <div class="info mt8"><span class="fuerte">${esc(p ? p.nombre : cod)}</span>
        <span class="muted small">Nutresa ${esc(p ? p.codigoNutresa || '—' : '—')} · Atlantic ${esc(cod)}${enCic ? ` · ${esc(nombreCic(enCic))}` : ' · Inventario en curso'} · ${esc(nombreSede(ses.sedeId))}</span></div>
      <div id="dcCaja" class="mt12"><div class="cargando">Cargando…</div></div>`, 'modal-ancho');
    const pedir = enCic ? llamar('bdHistorialCiclico', enCic.id).then(h => h.conteos.filter(c => c.codigo === cod && c.sedeId === ses.sedeId))
      : llamar('bdHistorialConteos', { sedeId: ses.sedeId, codigo: cod });
    pedir.then(l => { if ($('dcCaja')) $('dcCaja').innerHTML = detalleConteoHtml(l, p); })
      .catch(e => { if ($('dcCaja')) $('dcCaja').innerHTML = `<p class="error">${esc(e.message)}</p>`; });
  }
  function detalleConteoHtml(lista, p) {
    const u = ingEsKg(p) ? 'kg' : 'und';
    const almDe = x => String(x || '').startsWith('PICKING-') ? String(x).slice(8) : ((pasilloDe(x) || {}).key || '');
    // Por lugar y tipo, en orden de fecha: cada registro trae el total; la parte es lo que cambió desde el anterior.
    // Lo eliminado va aparte (cada eliminación es su propia serie).
    const grupos = {};
    lista.slice().sort((a, b) => String(a.fecha).localeCompare(String(b.fecha))).forEach(c => {
      const k = `${c.ubicacion}|${c.tipo}|${c.anulado ? 'X' + (c.anuladoEn || '') : ''}`;
      (grupos[k] = grupos[k] || []).push(c);
    });
    const filas = [];
    Object.values(grupos).forEach(g => {
      let antes = 0;
      g.forEach((c, i) => {
        const parte = +(c.cantidad - antes).toFixed(3);
        antes = c.cantidad;
        if (c.tipo !== 'PICKING' && !parte) return;          // calidad y bloqueado solo cuando cambian
        if (c.tipo === 'PICKING' && !parte && i > 0) return;   // se volvió a guardar igual
        filas.push(Object.assign({}, c, { parte }));
      });
    });
    filas.sort((a, b) => String(b.fecha).localeCompare(String(a.fecha)));
    if (!filas.length) return '<p class="muted">Todavía nadie ha contado este producto aquí.</p>';
    const porPersona = {};
    filas.filter(f => !f.anulado && f.tipo === 'PICKING').forEach(f => { porPersona[f.usuario || '—'] = +((porPersona[f.usuario || '—'] || 0) + f.parte).toFixed(3); });
    const tipoTxt = { PICKING: 'Picking', CALIDAD: 'Calidad', BLOQUEADO: 'Bloqueado' };
    return `${Object.keys(porPersona).length ? `<div class="dc-personas">${Object.entries(porPersona).sort((a, b) => b[1] - a[1]).map(([n, c]) =>
        `<span class="dc-persona"><b>${esc(n)}</b> ${nInv(c)} ${u}</span>`).join('')}</div>` : ''}
      <div class="tabla-wrap mt8"><table class="tabla"><thead><tr><th>Fecha y hora</th><th>Quién</th><th>Almacén</th><th>Tipo</th><th class="num">Contó</th><th class="num">Total en ese lugar</th></tr></thead><tbody>
        ${filas.map(f => `<tr class="${f.anulado ? 'dc-anulado' : ''}"><td data-l="Fecha">${fechaHora(f.fecha)}</td><td data-l="Quién">${esc(f.usuario || '—')}</td>
          <td data-l="Almacén">${esc(almCorto(almDe(f.ubicacion)) || '—')}</td><td data-l="Tipo">${tipoTxt[f.tipo] || esc(f.tipo)}${tagAnulado(f)}</td>
          <td class="num fuerte" data-l="Contó">${f.parte > 0 ? '+' : ''}${nInv(f.parte)} ${u}</td><td class="num" data-l="Total">${nInv(f.cantidad)}</td></tr>`).join('')}
      </tbody></table></div>
      <span class="muted small">«Contó» es lo que sumó esa persona cada vez que guardó (si es negativo, fue una corrección). Lo eliminado sale tachado.</span>`;
  }

  /* ----- Corregir lo contado (Inventario o cíclico): cantidades, otro producto o eliminar ----- */
  const btnEditarConteo = f => `<button class="ec-btn" onclick="event.stopPropagation(); editarConteos('${esc(f.cod)}')" title="Corregir o eliminar lo contado" aria-label="Corregir o eliminar lo contado de ${esc(f.p ? f.p.nombre : f.cod)}">✎</button>`;
  const tagAnulado = c => {
    if (!c.anulado) return '';
    const pas = /pasado a (.+)$/.exec(c.anuladoPor || '');
    return ` <span class="tag venc" title="${pas ? 'Lo pasó' : 'Eliminado por'} ${esc(c.anuladoPor || '—')}${c.anuladoEn ? ' el ' + esc(fechaHora(c.anuladoEn)) : ''}">${pas ? 'Pasado a ' + esc(pas[1]) : 'Eliminado'}</span>`;
  };
  let ec = null;   // { cod, conf: índice que pide confirmar eliminar, otro: índice que cambia de producto }
  function ecFuente() {
    const enCic = ctxCic() && cicData ? cicData.ciclico : null;
    return { enCic, conteos: enCic ? cicData.conteos : ((invData && invData.conteos) || []) };
  }
  function ecLugares() {
    const m = {};
    ecFuente().conteos.filter(c => c.codigo === ec.cod).forEach(c => {
      const l = m[c.ubicacion] || (m[c.ubicacion] = { ubic: c.ubicacion, PICKING: 0, CALIDAD: 0, BLOQUEADO: 0, usuario: '', fecha: '' });
      l[c.tipo] = c.cantidad;
      if (c.fecha > l.fecha) { l.fecha = c.fecha; l.usuario = c.usuario; }
    });
    return Object.values(m).sort((a, b) => a.ubic.localeCompare(b.ubic));
  }
  /* ----- Pasar conteos de Inventario a otra sede (cuando los registraron en la sede que no era) -----
     Por ahora lo puede hacer quien tiene el permiso de SAP del inventario (inv_sap). */
  const puedePasarSede = () => puede('inv_sap');   // cambiar de almacén (y de sede si hay varias)
  const almDeUbic = u => { u = String(u || ''); if (u.startsWith('PICKING-')) return u.slice(8); const x = pasilloDe(u); return x ? almCorto(x.key) : ''; };
  let ps = null;   // { claves: [{codigo, ubicacion}], cont, alListo }
  function pasarSedeAbrir(claves, cont, alListo) {
    if (!claves.length) return toast('Marca al menos un conteo.', 'error');
    ps = { claves, cont, alListo, sede: ses.sedeId, alms: null, alm: '' };
    pasarSedePintar();
    pasarSedeCargarAlms();
  }
  function pasarSedeCargarAlms() {
    const sid = ps.sede; ps.alms = null; pasarSedePintar();
    llamar('bdAlmacenesSede', sid).then(l => {
      if (!ps || ps.sede !== sid) return;
      ps.alms = l;
      ps.alm = '';   // otra sede: '' = cada conteo a su mismo almacén · misma sede: hay que escoger
      ps.alt = (l[0] || {}).almacen || '';
      pasarSedePintar();
    }).catch(e => { if (ps) { ps.alms = []; pasarSedePintar(); errForm(e.message); } });
  }
  function pasarSedePintar() {
    const c = ps && $(ps.cont);
    if (!c) return;
    const prods = [...new Set(ps.claves.map(k => k.codigo))];
    c.innerHTML = `<div class="ps-panel col gap8">
      <span class="fuerte">Cambiar ${ps.claves.length} conteo${ps.claves.length === 1 ? '' : 's'} (${prods.length} producto${prods.length === 1 ? '' : 's'}) de almacén${ini.sedes.length > 1 ? ' o de sede' : ''}</span>
      <div class="inv-grid3">
        ${ini.sedes.length > 1 ? `<div><label class="lbl" for="psSede">Sede</label>
          <select id="psSede" class="campo" onchange="ps.sede=this.value; pasarSedeCargarAlms()">${ini.sedes.map(x =>
            `<option value="${esc(x.id)}" ${x.id === ps.sede ? 'selected' : ''}>${esc(x.nombre)}${x.id === ses.sedeId ? ' (esta sede)' : ''}</option>`).join('')}</select></div>` : ''}
        <div><label class="lbl" for="psAlm">Almacén correcto</label>
          <select id="psAlm" class="campo" ${ps.alms ? '' : 'disabled'} onchange="ps.alm=this.value; pasarSedePintar()">${ps.alms ? (ps.sede === ses.sedeId
              ? `<option value="" ${ps.alm ? '' : 'selected'} disabled>Escoge el almacén</option>`
              : `<option value="" ${ps.alm ? '' : 'selected'}>El mismo almacén de cada conteo</option>`) + ps.alms.map(a =>
            `<option value="${esc(a.almacen)}" ${a.almacen === ps.alm ? 'selected' : ''}>${ps.sede === ses.sedeId ? '' : 'Todos a '}${esc(a.nombre)}</option>`).join('') : '<option>Cargando…</option>'}</select></div>
        ${(() => {
          if (!ps.alms || ps.alm || ps.sede === ses.sedeId) return '';
          const hay = new Set(ps.alms.map(a => a.almacen));
          const faltan = [...new Set(ps.claves.map(k => almDeUbic(k.ubicacion) || '—').filter(a => !hay.has(a)))];
          return faltan.length ? `<div><label class="lbl" for="psAlt">Almacén ${esc(faltan.join(', '))} no existe allá: pasarlo a</label>
            <select id="psAlt" class="campo" onchange="ps.alt=this.value">${ps.alms.map(a => `<option value="${esc(a.almacen)}" ${a.almacen === ps.alt ? 'selected' : ''}>${esc(a.nombre)}</option>`).join('')}</select></div>` : '';
        })()}
      </div>
      <div class="fila gap8 wrap-f"><button class="btn btn-sec" onclick="pasarSedeCerrar()">Cancelar</button>
        <button id="psOk" class="btn btn-pri" ${ps.alms && ps.alms.length && (ps.alm || ps.sede !== ses.sedeId) ? '' : 'disabled'} onclick="pasarSedeHacer()">${ps.sede === ses.sedeId ? (ps.alm ? 'Pasar al almacén ' + esc(ps.alm) : 'Cambiar') : 'Pasar a ' + esc(nombreSede(ps.sede))}</button></div>
    </div>`;
  }
  function pasarSedeCerrar() { const c = ps && $(ps.cont); if (c) c.innerHTML = ''; ps = null; }
  function pasarSedeHacer() {
    const x = ps;
    if (x.sede === ses.sedeId && !x.alm) return errForm('Escoge el almacén correcto.');
    const b = $('psOk'), txt = b.textContent; b.disabled = true; b.textContent = 'Pasando…';
    const hay = new Set((x.alms || []).map(a => a.almacen));
    const claves = x.claves.map(k => { const propio = almDeUbic(k.ubicacion); return Object.assign({}, k, { almacen: x.alm || (hay.has(propio) ? propio : x.alt) }); });
    llamar('bdPasarConteosSede', { sedeOrigen: ses.sedeId, sedeDestino: x.sede, claves, usuario: ses.nombre }).then(r => {
      toast(`✓ ${r.pasados} conteo${r.pasados === 1 ? '' : 's'} pasado${r.pasados === 1 ? '' : 's'} a ${x.sede === ses.sedeId ? 'almacén ' + x.alm : nombreSede(x.sede)}`
        + (r.yaHabia.length ? `. Ojo: ${r.yaHabia.join(', ')} ya tenía${r.yaHabia.length === 1 ? '' : 'n'} conteo en ese almacén; revísalo en esa sede.` : ''), r.yaHabia.length ? 'error' : 'ok');
      pasarSedeCerrar();
      if (x.alListo) x.alListo();
      return llamar('bdInventarioGeneral', ses.sedeId).then(d => { invData = d; if ($('invTabla')) pintarInvTabla(); if ($('cfTabla')) $('cfTabla').innerHTML = cfTablaHtml(); });
    }).catch(e => { errForm(e.message); b.disabled = false; b.textContent = txt; });
  }

  function editarConteos(cod) { ec = { cod, conf: -1, otro: -1 }; pintarEc(); }
  // Almacén de un lugar contado (la clave de codGen)
  const ecAlmDe = u => { u = String(u || ''); return u.startsWith('PICKING-') ? u.slice(8) : ((pasilloDe(u) || {}).key || ''); };
  function pintarEc() {
    const { enCic } = ecFuente(), p = prodDe(ec.cod), ls = ecLugares();
    if (!ls.length) { cerrarModal(); ec = null; return; }
    const alms = ingAlmacenes();
    abrirModal(`<div class="fila-sb"><span class="h2">Corregir lo contado</span>${btnCerrar()}</div>
      <div class="info mt8"><span class="fuerte">${esc(p ? p.nombre : ec.cod)}</span>
        <span class="muted small">Nutresa ${esc(p ? p.codigoNutresa || '—' : '—')} · Atlantic ${esc(ec.cod)}${enCic ? ` · ${esc(nombreCic(enCic))} del ${fCorta(enCic.fecha)}` : ' · Inventario'}</span></div>
      <span class="muted small mt8">Cambia lo que esté mal —el producto, el almacén o la cantidad— y toca <b>Guardar cambios</b>. Todo queda en el historial con tu nombre.</span>
      ${ls.map((l, i) => { const almAct = ecAlmDe(l.ubic); return `<div class="ec-lugar mt12">
        <div class="fila-sb wrap-f gap8"><span class="fuerte">Almacén ${esc(almCorto(almAct) || '—')}</span>
          <span class="muted small">Contó ${esc(l.usuario || '—')} · ${fechaHora(l.fecha)}</span></div>
        <div class="ec-form mt8">
          <div class="ec-prod"><label class="lbl" for="ecProd${i}">Producto</label>
            ${campoConCamara(`<input id="ecProd${i}" class="campo" autocomplete="off" spellcheck="false" value="${esc(ec.cod + ' · ' + (p ? p.nombre : ''))}" placeholder="Código Atlantic, Nutresa, EAN o nombre">`, 'ecProd' + i)}
            <div id="ecSug${i}" class="ing-sug" role="listbox" hidden></div></div>
          <div><label class="lbl" for="ecAlm${i}">Almacén</label>
            <select id="ecAlm${i}" class="campo">${alms.some(a => a.key === almAct) ? '' : `<option value="${esc(almAct)}" selected>${esc(almCorto(almAct) || 'Sin almacén')}</option>`}
              ${alms.map(a => `<option value="${esc(a.key)}" ${a.key === almAct ? 'selected' : ''}>${esc(a.nombre)}</option>`).join('')}</select></div>
          <div><label class="lbl" for="ecPICKING${i}">Cantidad (picking)</label>
            <input id="ecPICKING${i}" class="campo" type="number" inputmode="decimal" min="0" step="any" value="${l.PICKING}"></div>
        </div>
        <details class="ec-mas mt8" ${l.CALIDAD || l.BLOQUEADO ? 'open' : ''}><summary class="small">Calidad y bloqueado</summary>
          <div class="dos mt8">${TIPOS_CONTEO.filter(([k]) => k !== 'PICKING').map(([k, t]) => `<div><label class="lbl" for="ec${k}${i}">${t}</label>
            <input id="ec${k}${i}" class="campo" type="number" inputmode="decimal" min="0" step="any" value="${l[k]}"></div>`).join('')}</div></details>
        ${ec.conf === i ? `<div class="fila gap8 mt8 wrap-f ec-conf"><span class="small fuerte">¿Eliminar lo contado aquí (picking, calidad y bloqueado)?</span>
            <button class="btn btn-sec btn-mini" onclick="ec.conf=-1; pintarEc()">No</button>
            <button class="btn btn-sal btn-mini" onclick="ecEliminar(${i}, this)">Sí, eliminar</button></div>`
        : `<div class="fila gap8 mt8 wrap-f"><button class="btn btn-pri" onclick="ecGuardarTodo(${i}, this)">Guardar cambios</button>
            <button class="btn btn-sal btn-mini" onclick="ec.conf=${i}; pintarEc()">Eliminar</button></div>`}
      </div>`; }).join('')}
      ${!enCic && puedePasarSede() && ini.sedes.length > 1 ? `<div class="mt12"><div id="ecPasar"></div>
        <button class="btn btn-sec btn-mini" onclick="pasarSedeAbrir(ecLugares().map(l => ({ codigo: ec.cod, ubicacion: l.ubic })), 'ecPasar', () => ecRefrescar())">Se registró en otra sede: cambiar</button></div>` : ''}
      <p id="fErr" class="error" hidden></p>`, 'modal-ancho');
    ls.forEach((l, i) => enlazarSugProd($('ecProd' + i), $('ecSug' + i), enCic ? enCic.codigos : null));
  }
  // Lista de coincidencias para un campo de producto (código Atlantic, Nutresa, EAN o nombre)
  function enlazarSugProd(input, caja, dentro, alElegir) {
    if (!input || !caja) return;
    const pintar = () => {
      const t = input.value.trim();
      const l = t.length < 2 || buscarProducto(t.split(' · ')[0]) ? [] : buscarProductos(t, 8, dentro);
      caja.hidden = !l.length;
      caja.innerHTML = l.map(p => `<button type="button" class="ing-sug-op" role="option" data-id="${esc(p.id)}">
        <b>${esc(p.nombre)}</b><span class="muted small">Atlantic ${esc(p.id)} · Nutresa ${esc(p.codigoNutresa || '—')}</span></button>`).join('');
      caja.querySelectorAll('.ing-sug-op').forEach(b => {
        b.addEventListener('mousedown', ev => ev.preventDefault());
        b.addEventListener('click', () => { const p = prodDe(b.getAttribute('data-id')); input.value = p.id + ' · ' + p.nombre; caja.hidden = true; if (alElegir) alElegir(p); });
      });
    };
    input.addEventListener('input', pintar);
    input.addEventListener('focus', () => input.select());
    input.addEventListener('blur', () => setTimeout(() => { caja.hidden = true; }, 200));
  }
  function ecCantidades(i) {
    const c = {};
    for (const [k, t] of TIPOS_CONTEO) {
      const v = $(`ec${k}${i}`).value.trim().replace(',', '.'), n = Number(v);
      if (v === '' || !(n >= 0)) { $(`ec${k}${i}`).focus(); errForm(`Llena ${t.toLowerCase()} (0 si no hay).`); return null; }
      c[k] = n;
    }
    return c;
  }
  // Vuelve a traer los conteos y repinta la tabla y la ventana
  function ecRefrescar() {
    const { enCic } = ecFuente();
    const p = enCic ? llamar('bdCiclico', enCic.id).then(d => { if (cicSel === d.ciclico.id) cicData = d;
        const x = (cicLista || []).find(y => y.id === d.ciclico.id); if (x) x.contados = datosCiclico().filter(f => f.listo).length;
        if ($('cicLista')) $('cicLista').innerHTML = listaCiclicos(); pintarCicTabla();
        const cc = document.querySelector('.cic-progreso b'); if (cc) { const dd = datosCiclico(); cc.textContent = `${dd.filter(f => f.listo).length} de ${dd.length}`; } })
      : llamar('bdInventarioGeneral', ses.sedeId).then(d => { invData = d; if ($('invTabla')) pintarInvTabla(); });
    return p.then(() => { if ($('cfTabla')) $('cfTabla').innerHTML = cfTablaHtml(); if (ec) { ec.conf = -1; ec.otro = -1; pintarEc(); } });
  }
  // Guarda de una vez lo que cambió: producto, almacén y/o cantidades.
  // Si cambia el producto o el almacén, se pasa a ese producto y almacén (si allí ya había conteo, se suma) y lo de aquí queda eliminado.
  function ecGuardarTodo(i, b) {
    const l = ecLugares()[i], c = ecCantidades(i);
    if (!l || !c) return;
    const txt = $('ecProd' + i).value;
    let p2 = buscarProducto(txt.split(' · ')[0]) || buscarProducto(txt);
    if (!p2) { const l2 = buscarProductos(txt, 2); if (l2.length === 1) p2 = l2[0]; }
    if (!p2) { $('ecProd' + i).focus(); return errForm('Escoge el producto correcto de la lista.'); }
    const almAct = ecAlmDe(l.ubic), alm = $('ecAlm' + i).value;
    const mismoProd = p2.id === ec.cod, mismoAlm = !alm || alm === almAct;
    const { enCic, conteos } = ecFuente();
    if (mismoProd && mismoAlm) {
      if (TIPOS_CONTEO.every(([k]) => c[k] === l[k])) return errForm('No cambiaste nada.');
      b.disabled = true; b.textContent = 'Guardando…';
      return llamar('bdGuardarConteo', { sedeId: ses.sedeId, ubicacionId: l.ubic, codigo: ec.cod, cantidades: c, usuario: ses.nombre, ciclicoId: enCic ? enCic.id : null })
        .then(() => { toast('Conteo corregido', 'ok'); return ecRefrescar(); })
        .catch(e => { errForm(e.message); b.disabled = false; b.textContent = 'Guardar cambios'; });
    }
    if (enCic && !enCic.codigos.includes(p2.id)) return errForm(`${p2.nombre} no está en ${esReconf(enCic) ? 'este reconteo' : 'este cíclico'}. Pídele al encargado que lo agregue.`);
    const dest = mismoAlm ? l.ubic : 'PICKING-' + alm;
    // Lo que ya había de ese producto en ese lugar se suma
    const ya = {};
    conteos.filter(x => x.codigo === p2.id && x.ubicacion === dest).forEach(x => { ya[x.tipo] = x.cantidad; });
    const hay = Object.keys(ya).length > 0;
    const cants = {};
    TIPOS_CONTEO.forEach(([k]) => { cants[k] = +((ya[k] || 0) + c[k]).toFixed(3); });
    b.disabled = true; b.textContent = 'Guardando…';
    llamar('bdGuardarConteo', { sedeId: ses.sedeId, ubicacionId: dest, codigo: p2.id, cantidades: cants, usuario: ses.nombre, ciclicoId: enCic ? enCic.id : null })
      .then(() => llamar('bdAnularConteos', { sedeId: ses.sedeId, codigo: ec.cod, ubicacionId: l.ubic, ciclicoId: enCic ? enCic.id : null, usuario: ses.nombre }))
      .then(() => {
        toast(`Listo: quedó en ${p2.nombre}${mismoAlm ? '' : ', almacén ' + almCorto(alm)}${hay ? ' (sumado a lo que ya había)' : ''}`, 'ok');
        if (!mismoProd) ec.cod = p2.id;   // se sigue viendo el producto correcto
        return ecRefrescar();
      })
      .catch(e => { errForm(e.message); b.disabled = false; b.textContent = 'Guardar cambios'; });
  }
  function ecGuardar(i, b) {
    const l = ecLugares()[i], c = ecCantidades(i);
    if (!l || !c) return;
    if (TIPOS_CONTEO.every(([k]) => c[k] === l[k])) return errForm('No cambiaste ninguna cantidad.');
    const { enCic } = ecFuente();
    b.disabled = true; b.textContent = 'Guardando…';
    llamar('bdGuardarConteo', { sedeId: ses.sedeId, ubicacionId: l.ubic, codigo: ec.cod, cantidades: c, usuario: ses.nombre, ciclicoId: enCic ? enCic.id : null })
      .then(() => { toast('Conteo corregido', 'ok'); return ecRefrescar(); })
      .catch(e => { errForm(e.message); b.disabled = false; b.textContent = 'Guardar'; });
  }
  function ecCambiarProducto(i, b) {
    const l = ecLugares()[i], c = ecCantidades(i);
    if (!l || !c) return;
    const p2 = buscarProducto($('ecProd' + i).value);
    if (!p2) return errForm('Escribe o escanea el producto correcto.');
    if (p2.id === ec.cod) return errForm('Es el mismo producto. Si solo cambian las cantidades, usa Guardar.');
    const { enCic } = ecFuente();
    if (enCic && !enCic.codigos.includes(p2.id)) return errForm(`${p2.nombre} no está en ${esReconf(enCic) ? 'este reconteo' : 'este cíclico'}. Pídele al encargado que lo incluya en uno nuevo.`);
    b.disabled = true; b.textContent = 'Guardando…';
    llamar('bdGuardarConteo', { sedeId: ses.sedeId, ubicacionId: l.ubic, codigo: p2.id, cantidades: c, usuario: ses.nombre, ciclicoId: enCic ? enCic.id : null })
      .then(() => llamar('bdAnularConteos', { sedeId: ses.sedeId, codigo: ec.cod, ubicacionId: l.ubic, ciclicoId: enCic ? enCic.id : null, usuario: ses.nombre }))
      .then(() => { toast(`Listo: lo de ${l.ubic} quedó en ${p2.nombre}`, 'ok'); return ecRefrescar(); })
      .catch(e => { errForm(e.message); b.disabled = false; b.textContent = 'Pasar a ese producto'; });
  }
  function ecEliminar(i, b) {
    const l = ecLugares()[i];
    if (!l) return;
    const { enCic } = ecFuente();
    b.disabled = true; b.textContent = 'Eliminando…';
    llamar('bdAnularConteos', { sedeId: ses.sedeId, codigo: ec.cod, ubicacionId: l.ubic, ciclicoId: enCic ? enCic.id : null, usuario: ses.nombre })
      .then(() => { toast(`Conteo de ${l.ubic} eliminado`, 'ok'); return ecRefrescar(); })
      .catch(e => { errForm(e.message); b.disabled = false; b.textContent = 'Sí, eliminar'; });
  }

  // Historial de Inventario: quién va contando (solo Inventario, sin cíclicos)
  let hcInv = null;
  const hcF = { quien: '', q: '' };
  function historialConteosInv() {
    hcF.quien = ''; hcF.q = '';
    abrirModal(`<div class="fila-sb"><span class="h2">Historial de conteos · Inventario</span>${btnCerrar()}</div>
      <span class="muted small mt8">Quién contó qué, dónde y cuándo. Lo más nuevo primero. Los conteos de cíclicos y reconteos no salen aquí.</span>
      <div class="pi-filtros mt12"><select id="hcQuien" class="campo" aria-label="Persona"><option value="">Todas las personas</option></select>
        <input id="hcQ" class="campo" placeholder="Buscar producto o lugar" autocomplete="off"></div>
      <div id="hcPasar" class="mt8"></div>
      <div id="hcCaja" class="mt8"><div class="cargando">Cargando…</div></div>
      <p id="fErr" class="error" hidden></p>`, 'modal-ancho');
    pagInicio('hc');
    hcSel = new Set();
    hcCargar();
  }
  let hcSel = new Set();
  function hcCargar() {
    return llamar('bdConteosInventario', ses.sedeId).then(l => {
      const nuevo = hcInv === null || !$('hcQuien') || !$('hcQuien').dataset.listo;
      hcInv = l;
      if (!nuevo) { pintarHc(); return; }
      $('hcQuien').dataset.listo = '1';
      const ps = [...new Set(l.map(c => c.usuario || '—'))].sort();
      $('hcQuien').innerHTML = '<option value="">Todas las personas</option>' + ps.map(p => `<option>${esc(p)}</option>`).join('');
      $('hcQuien').addEventListener('change', () => { hcF.quien = $('hcQuien').value; pagInicio('hc'); pintarHc(); });
      $('hcQ').addEventListener('input', () => { hcF.q = $('hcQ').value; pagInicio('hc'); pintarHc(); });
      pintarHc();
    }).catch(e => { if ($('hcCaja')) $('hcCaja').innerHTML = `<p class="error">${esc(e.message)}</p>`; });
  }
  function hcMarcar(k, on) { if (on) hcSel.add(k); else hcSel.delete(k); pintarHc(); }
  function hcMarcarPagina(on) { (hcVis || []).forEach(k => on ? hcSel.add(k) : hcSel.delete(k)); pintarHc(); }
  let hcVis = [];
  function hcPasarSede() {
    const claves = [...hcSel].map(k => { const i = k.indexOf('|'); return { codigo: k.slice(0, i), ubicacion: k.slice(i + 1) }; });
    pasarSedeAbrir(claves, 'hcPasar', () => { hcSel = new Set(); hcCargar(); });
  }
  function pintarHc() {
    if (!$('hcCaja')) return;
    const pal = sinTilde(hcF.q.trim()).split(/\s+/).filter(Boolean);
    const l = hcInv.filter(c => (!hcF.quien || (c.usuario || '—') === hcF.quien)
      && (!pal.length || pal.every(w => sinTilde(`${c.codigo} ${(prodDe(c.codigo) || {}).nombre || ''} ${(prodDe(c.codigo) || {}).codigoNutresa || ''} ${c.ubicacion}`).includes(w))));
    const pg = paginar('hc', l, pintarHc);
    const marca = puedePasarSede(), sedeN = esc(nombreSede(ses.sedeId)), key = c => c.codigo + '|' + c.ubicacion;
    hcVis = [...new Set(pg.filas.filter(c => !c.anulado).map(key))];
    const todosPag = hcVis.length && hcVis.every(k => hcSel.has(k));
    $('hcCaja').innerHTML = l.length ? `<div class="fila-sb wrap-f gap8"><span class="muted small">${l.length} conteo${l.length === 1 ? '' : 's'}</span>
        ${marca && hcSel.size ? `<span class="fila gap8 wrap-f"><span class="small fuerte">${hcSel.size} marcado${hcSel.size === 1 ? '' : 's'}</span>
          <button class="btn btn-sec btn-mini" onclick="hcSel = new Set(); pintarHc()">Quitar marcas</button>
          <button class="btn btn-pri btn-mini" onclick="hcPasarSede()">Cambiar almacén${ini.sedes.length > 1 ? ' o sede' : ''}</button></span>` : ''}</div>
      <div class="tabla-wrap mt8"><table class="tabla"><thead><tr>${marca ? `<th><input type="checkbox" aria-label="Marcar todos los de esta página" ${todosPag ? 'checked' : ''} onchange="hcMarcarPagina(this.checked)"></th>` : ''}<th>Fecha</th><th>Quién</th><th>Sede</th><th>Almacén</th><th>Producto</th><th>Lugar</th><th>Tipo</th><th class="num">Cantidad</th></tr></thead>
      <tbody>${pg.filas.map(c => { const p = prodDe(c.codigo), k = key(c); return `<tr class="${c.anulado ? 'ec-anulado' : ''}">
        ${marca ? `<td>${c.anulado ? '' : `<input type="checkbox" aria-label="Marcar" ${hcSel.has(k) ? 'checked' : ''} onchange="hcMarcar('${esc(k)}', this.checked)">`}</td>` : ''}
        <td class="nowrap">${fechaHora(c.fecha)}</td><td>${esc(c.usuario || '—')}</td><td class="nowrap">${sedeN}</td><td>${esc(almDeUbic(c.ubicacion) || '—')}</td>
        <td><b>${esc(c.codigo)}</b> <span class="muted small">${esc(p ? p.nombre : '')}</span></td><td>${esc(cu(c.ubicacion))}</td>
        <td>${(TIPOS_CONTEO.find(t => t[0] === c.tipo) || [0, c.tipo])[1]}${tagAnulado(c)}</td><td class="num">${nInv(c.cantidad)}</td></tr>`; }).join('')}</tbody></table></div>${pg.barra}`
      : '<p class="muted">No hay conteos con ese filtro.</p>';
  }

  // Historial del cíclico o reconteo abierto: todos los conteos y revisiones, con quién
  function historialCiclico() {
    const c = cicSel_();
    abrirModal(`<div class="fila-sb"><span class="h2">Historial · ${esc(tituloCic(c))}</span>${btnCerrar()}</div>
      <span class="muted small mt8">Todo lo que se contó en ${esReconf(c) ? 'este reconteo' : 'este cíclico'}, con quién y cuándo (también lo que se volvió a contar). Lo más nuevo primero.</span>
      <div id="hcCaja" class="mt12"><div class="cargando">Cargando…</div></div>`, 'modal-ancho');
    pagInicio('hcc');
    llamar('bdHistorialCiclico', c.id).then(h => {
      const tx = { OK: 'Aéreo: está bien', CORREGIDO: 'Aéreo: corregido', NO_ESTA: 'Aéreo: no estaba' };
      const filas = h.conteos.map(x => ({ fecha: x.fecha, quien: x.usuario, cod: x.codigo, lugar: x.ubicacion, que: (TIPOS_CONTEO.find(t => t[0] === x.tipo) || [0, x.tipo])[1]
          + (x.anulado ? ` · eliminado por ${x.anuladoPor || '—'}${x.anuladoEn ? ' el ' + fechaHora(x.anuladoEn) : ''}` : ''), cant: nInv(x.cantidad) }))
        .concat(h.validaciones.map(v => ({ fecha: v.fecha, quien: v.usuario, cod: v.productoId, lugar: v.ubicacion, que: tx[v.accion] + (v.lote ? ` · rótulo ${v.lote}` : ''),
          cant: v.accion === 'OK' ? nInv(v.antes) : `${nInv(v.antes)} → ${nInv(v.despues)}${v.motivo ? ' · ' + v.motivo : ''}` })))
        .sort((a, b) => String(b.fecha).localeCompare(String(a.fecha)));
      const pintar = () => {
        if (!$('hcCaja')) return;
        const pg = paginar('hcc', filas, pintar);
        $('hcCaja').innerHTML = filas.length ? `<div class="tabla-wrap"><table class="tabla"><thead><tr><th>Fecha</th><th>Quién</th><th>Producto</th><th>Lugar</th><th>Qué</th><th class="num">Cantidad</th></tr></thead>
          <tbody>${pg.filas.map(x => { const p = prodDe(x.cod); return `<tr><td class="nowrap">${fechaHora(x.fecha)}</td><td>${esc(x.quien || '—')}</td>
            <td><b>${esc(x.cod)}</b> <span class="muted small">${esc(p ? p.nombre : '')}</span></td><td>${esc(x.lugar)}</td><td>${esc(x.que)}</td><td class="num">${esc(x.cant)}</td></tr>`; }).join('')}</tbody></table></div>${pg.barra}`
          : '<p class="muted">Todavía no hay nada contado.</p>';
      };
      pintar();
    }).catch(e => { if ($('hcCaja')) $('hcCaja').innerHTML = `<p class="error">${esc(e.message)}</p>`; });
  }

  function estadoCiclico(estado) {
    const cierre = estado === 'CERRADO' && cicData && cicData.ciclico.id === cicSel ? fotoCierreCiclico() : null;
    if (estado === 'CERRADO' && !cierre) return toast('Espera a que cargue el cíclico y vuelve a intentarlo.', 'error');
    llamar('bdEstadoCiclico', { id: cicSel, estado, usuario: ses.nombre, cierre }).then(c => {
      delete cierreReco[c.id];
      cicLista = cicLista.map(x => x.id === c.id ? Object.assign(x, c) : x);
      if (cicData) cicData.ciclico = Object.assign(cicData.ciclico, c);
      toast(estado === 'CERRADO' ? 'Cíclico cerrado' : 'Cíclico abierto otra vez', 'ok'); pintarApp();
    }).catch(e => toast(e.message, 'error'));
  }

  function borrarCiclico() {
    const c = cicLista.find(x => x.id === cicSel), rc = esReconf(c);
    abrirModal(`<div class="fila-sb"><span class="h2">¿Eliminar est${rc ? 'a reconteo' : 'e cíclico'}?</span>${btnCerrar()}</div>
      <span class="mt12"><b>${esc(tituloCic(c))}</b> (${fCorta(c.fecha)}). Los conteos que ya hicieron se quedan en el historial.</span>
      <p id="fErr" class="error" hidden></p>
      <div class="dos mt16"><button class="btn btn-sec btn-xl" onclick="cerrarModal()">No</button>
        <button id="cicBorrarOk" class="btn btn-sal btn-xl" onclick="confirmarBorrarCiclico()">Sí, eliminar</button></div>`);
  }
  function confirmarBorrarCiclico() {
    const id = cicSel, b = $('cicBorrarOk'); b.disabled = true;
    llamar('bdBorrarCiclico', id).then(() => {
      const c = cicLista.find(x => x.id === id);
      cicLista = cicLista.filter(x => x.id !== id);
      cerrarModal(); toast(esReconf(c) ? 'Reconteo eliminado' : 'Cíclico eliminado', 'ok');
      cicData = null; volverCic(c);
    }).catch(e => { errForm(e.message); b.disabled = false; });
  }

  function descargarCiclico() {
    const c = cicLista.find(x => x.id === cicSel), l = datosCiclico();
    descargarExcel(`${String(tituloCic(c)).replace(/[\\/:*?"<>|]/g, '')} ${nombreSede(ses.sedeId)} ${c.fecha}.xlsx`, { 'Cíclico': l.map(f => ({
      'Estado': f.contado ? 'Contado' : 'Pendiente', 'Código Nutresa': f.p ? f.p.codigoNutresa : '', 'Código Atlantic': f.cod, 'Producto': f.p ? f.p.nombre : '',
      'Unidad': f.p ? f.p.unidadMedida : '', 'Inventario SAP': f.sap ? f.sap.inventario : 0, 'Calidad SAP': f.sap ? f.sap.calidad : 0, 'Bloqueado SAP': f.sap ? f.sap.bloqueado : 0,
      'Total SAP': f.sapTotal, 'Picking': f.contado ? f.picking : '', 'Aéreo': f.aereo, 'Calidad planta': f.contado ? f.calidad : '', 'Bloqueado planta': f.contado ? f.bloqueado : '',
      'Total planta': f.contado ? f.planta : '', 'Diferencia': f.contado ? f.dif : '', 'Lugares contados': [...f.lugares].join(', '),
      'Contó': f.ult ? f.ult.usuario : '', 'Fecha conteo': f.ult ? fechaHora(f.ult.fecha) : '' })),
      'Datos': [{ 'Nombre': tituloCic(c), 'Fecha': c.fecha, 'Creó': c.creadoPor, 'Estado': c.estado }] }, 'reportes');
  }/* ================= Productos totales: una tabla con lo que hay de cada producto en cada almacén =================
     Picking, calidad y bloqueado: del inventario en curso (todas las sedes). Aéreo: lo ubicado en el plano.
     El almacén de cada producto sale de la lista que se carga (un producto con dos almacenes sale en dos filas). */
  let prodAlm = null;                    // { codigo: ['2000', ...] }
  const prodF = { alm: '', cat: '', sub: '', um: '', ump: '' };
  ordT.prod = { k: '', dir: 1 };

  // Ícono de ayuda: muestra el texto en una burbuja pequeña sin tapar la pantalla
  function ayudaHtml(t) { return `<button type="button" class="ayuda-i" aria-label="¿Para qué sirve?" data-ayuda="${esc(t)}" onclick="verAyuda(event, this)">i</button>`; }
  function verAyuda(ev, b) {
    ev.stopPropagation();
    const ya = document.querySelector('.ayuda-burbuja');
    if (ya) { const mismo = ya._de === b; ya.remove(); if (mismo) return; }
    const d = document.createElement('div');
    d.className = 'ayuda-burbuja'; d.textContent = b.dataset.ayuda; d._de = b; d.setAttribute('role', 'tooltip');
    document.body.appendChild(d);
    const r = b.getBoundingClientRect(), w = Math.min(300, window.innerWidth - 24);
    d.style.width = w + 'px';
    d.style.left = Math.max(12, Math.min(r.left + r.width / 2 - w / 2, window.innerWidth - w - 12)) + 'px';
    d.style.top = (r.bottom + window.scrollY + 8) + 'px';
    setTimeout(() => document.addEventListener('click', function fuera() { d.remove(); document.removeEventListener('click', fuera); }), 0);
  }

  function vistaProductosTotales() {
    if (ptEd && puede('prod_editar')) return ptEdVista();
    const listo = asegurarInvData();
    if (prodAlm === null && !vistaProductosTotales.pidiendo) {
      vistaProductosTotales.pidiendo = true;
      llamar('bdAlmacenesProductos').then(m => { prodAlm = m || {}; }).catch(() => { prodAlm = {}; })
        .finally(() => { vistaProductosTotales.pidiendo = false; if (vista === 'productos' && prodTab === 'totales') pintarApp(); });
    }
    if (!listo || prodAlm === null) return '<div class="cargando">Cargando productos…</div>';
    const alms = [...new Set(filasProdTotales().map(x => x.alm).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'es', { numeric: true }));
    return `<div class="col gap12">
      <div class="fila-sb wrap-f gap8">
        <span class="h2 fila gap8">Productos totales ${ayudaHtml('Aquí ves lo que tienes de cada producto en cada almacén. Picking, calidad y bloqueado salen del inventario en curso (todas las sedes) y el aéreo es lo que está ubicado en el plano. Total = picking + aéreo + calidad + bloqueado. Almacén y pasillo: con «Usar el pasillo cargado» encendido (Configuración → Ajustes) son los cargados para esta sede; apagado, los del plano. Toca «Ver» en un producto para moverlo, darle salida, ver su historial o dónde está.')}</span>
      </div>
      ${accionesHtml([
        { t: 'Productos', tono: 'azul', b: [puede('productos') && accBtn('+ Nuevo producto', 'formProducto(false)', true),
          puede('prod_editar') && accBtn('Editar productos', 'ptEdAbrir()'),
          puedeAlguno(['prod_cargar', 'prod_reemplazar', 'prod_almacenes']) && accBtn('Cargar productos', 'abrirCargarProductos()')] },
        { t: 'Descargar', tono: 'verde', b: [puede('reportes') && accBtn('Inventario', 'descargarInventario()'),
          puede('reportes') && accBtn('Salidas y rotación', 'abrirSalidas()'),
          puede('bitacora') && accBtn('Bitácora', 'pedirBitacora()')] },
        { t: 'Corregir', tono: 'rojo', b: [puede('deshacer_salida') && accBtn('Deshacer una salida', 'abrirSalidasRecientes()')] },
        { t: 'Pantalla', tono: 'gris', b: [accBtn('Actualizar', 'invData=null; prodAlm=null; ptMemo=null; pintarApp()')] }])}
      <div class="pt-filtros">
        <div class="pt-buscar">${campoConCamara(`<input id="prodQ" class="campo" autocomplete="off" spellcheck="false"
          placeholder="Buscar por código AFS, Nutresa, barras o nombre" value="${esc(prodFiltro)}" aria-label="Buscar producto">`, 'prodQ')}</div>
        <select id="prodAlmF" class="campo" aria-label="Almacén" onchange="prodF.alm=this.value; pagInicio('prod'); $('prodLista').innerHTML = listaProdHtml()">
          <option value="">Todos los almacenes</option>${alms.map(a => `<option value="${esc(a)}" ${prodF.alm === a ? 'selected' : ''}>Almacén ${esc(a)}</option>`).join('')}
          <option value="-" ${prodF.alm === '-' ? 'selected' : ''}>Sin almacén</option></select>
        <label class="fila gap8 small" style="cursor:pointer"><input type="checkbox" id="prodStock" ${prodSoloStock ? 'checked' : ''}> Solo los que tienen algo</label>
      </div>
      <div class="pt-filtros2">${PT_FIL.map(([k, campo, t]) => {
        const vals = [...new Set(ini.productos.map(p => p[campo]).filter(Boolean))].sort((a, b) => String(a).localeCompare(String(b), 'es', { numeric: true }));
        return `<select class="campo" aria-label="${t}" onchange="prodF.${k}=this.value; pagInicio('prod'); $('prodLista').innerHTML = listaProdHtml()">
          <option value="">${t}: todas</option>${vals.map(v => `<option value="${esc(v)}" ${prodF[k] === v ? 'selected' : ''}>${esc(v)}</option>`).join('')}
          <option value="-" ${prodF[k] === '-' ? 'selected' : ''}>Sin ${t.toLowerCase()}</option></select>`;
      }).join('')}</div>
      <div id="prodLista">${listaProdHtml()}</div>
    </div>`;
  }

  /* ----- Editar productos: una tabla con los datos de cada producto para corregirlos de una vez ----- */
  let ptEd = null;   // { q, cambios: { cod: { campo: valor } }, ok }
  const plural = (n, uno, varios) => `${n} ${n === 1 ? uno : varios}`;
  const PT_ED = [['nombre', 'Nombre', 'nombre'], ['codigoNutresa', 'Cód. Nutresa', 'nut'], ['codigoBarras', 'EAN 13', 'ean'], ['ean2', 'Otro EAN 13', 'ean'], ['ean14', 'EAN 14 (caja)', 'ean'],
    ['unidadMedida', 'Unidad', 'um'], ['undPorCaja', 'Und x caja', 'num'], ['cajasPorEstiba', 'Cajas x estiba', 'num'], ['equivKg', 'Equiv Kg', 'kg'],
    ['umProveedor', 'UM proveedor', 'um'], ['categoria', 'Categoría', 'nut'], ['subcategoria', 'Subcategoría', 'nut'],
    ['largo', 'Largo', 'um'], ['ancho', 'Ancho', 'um'], ['alto', 'Alto', 'um'], ['obsAbast', 'Obs. abastecimiento', 'nombre'], ['observaciones', 'Observaciones', 'nombre']];
  function ptEdAbrir() {
    if (sinPermiso('prod_editar')) return;
    ptEd = { q: prodFiltro || '', cambios: {}, ok: false };
    pagInicio('pted'); pintarApp();
  }
  const ptEdN = () => Object.keys(ptEd.cambios).length;
  function ptEdSalir(b) {
    if (ptEdN() && b && b.dataset.ok !== '1') { b.dataset.ok = '1'; b.textContent = '¿Salir sin guardar? Toca otra vez'; return; }
    ptEd = null; pintarApp();
  }
  function ptEdVista() {
    return `<div class="col gap12">
      <div class="fila-sb wrap-f gap8">
        <span class="h2 fila gap8">Editar productos ${ayudaHtml('Cambia lo que necesites directamente en la tabla: nombre, código Nutresa, los EAN (el del producto, otro EAN 13 y el EAN 14 de la caja), unidad, und x caja, Equiv Kg, categoría, medidas y observaciones. Lo que cambias queda marcado en amarillo y no se guarda hasta que toques «Guardar cambios». El código Atlantic no se puede cambiar porque con él está guardado todo el historial del producto (inventario, movimientos y conteos).')}</span>
        <div class="fila gap8 wrap-f">
          <button class="btn btn-sec" onclick="ptEdSalir(this)">Volver</button>
          <button id="ptEdOk" class="btn btn-pri" onclick="ptEdGuardar()" ${ptEdN() ? '' : 'disabled'}>${ptEdBtnTxt()}</button>
        </div></div>
      <div class="pt-filtros">
        <div class="pt-buscar">${campoConCamara(`<input id="ptEdQ" class="campo" type="search" autocomplete="off" spellcheck="false"
          placeholder="Buscar por código Atlantic, Nutresa, EAN o nombre" value="${esc(ptEd.q)}" aria-label="Buscar producto" oninput="ptEd.q=this.value; pagInicio('pted'); ptEdPintarLista()">`, 'ptEdQ')}</div>
        <label class="fila gap8 small" style="cursor:pointer"><input type="checkbox" ${ptEd.solo ? 'checked' : ''} onchange="ptEd.solo=this.checked; pagInicio('pted'); ptEdPintarLista()"> Solo los cambiados</label>
      </div>
      <p id="fErrPt" class="error" hidden></p>
      <div id="ptEdLista">${ptEdListaHtml()}</div>
    </div>`;
  }
  const ptEdBtnTxt = () => ptEdN() ? `Guardar cambios (${ptEdN()})` : 'Guardar cambios';
  function ptEdPintarLista() { if ($('ptEdLista')) $('ptEdLista').innerHTML = ptEdListaHtml(); }
  function ptEdListaHtml() {
    const pal = sinTilde(ptEd.q.trim()).split(/\s+/).filter(Boolean);
    const lista = ini.productos.filter(p => (!ptEd.solo || ptEd.cambios[p.id])
      && (!pal.length || pal.every(w => sinTilde(`${p.id} ${p.codigoNutresa} ${p.codigoBarras} ${p.ean2 || ''} ${p.ean14 || ''} ${p.nombre}`).includes(w))))
      .sort((a, b) => a.id.localeCompare(b.id, 'es', { numeric: true }));
    if (!lista.length) return `<p class="muted">${ptEd.solo ? 'No hay productos cambiados.' : 'No hay productos con esa búsqueda.'}</p>`;
    const pg = paginar('pted', lista, ptEdPintarLista);
    const val = (p, k) => { const c = ptEd.cambios[p.id]; return c && k in c ? c[k] : (p[k] ?? ''); };
    return `<span class="muted small">${plural(lista.length, 'producto', 'productos')}</span>
      <div class="tabla-wrap"><table class="tabla pted-tabla"><thead><tr><th>Código Atlantic</th>${PT_ED.map(([, t]) => `<th>${t}</th>`).join('')}</tr></thead>
      <tbody>${pg.filas.map(p => `<tr>
        <td class="nowrap" data-l="Código Atlantic"><b>${esc(p.id)}</b></td>
        ${PT_ED.map(([k, t, cls]) => {
          const v = val(p, k), cam = ptEd.cambios[p.id] && k in ptEd.cambios[p.id];
          return `<td data-l="${t}" class="pted-${cls}"><input class="campo pted-in${cam ? ' pted-cam' : ''}" data-c="${esc(p.id)}" data-k="${k}" value="${esc(v)}" aria-label="${t} de ${esc(p.id)}"
            ${cls === 'num' ? 'type="number" inputmode="numeric" min="1" step="1"' : cls === 'kg' ? 'inputmode="decimal" autocomplete="off"' : cls === 'ean' ? 'inputmode="numeric" autocomplete="off"' : 'autocomplete="off"'} oninput="ptEdCambio(this)"></td>`;
        }).join('')}</tr>`).join('')}</tbody></table></div>${pg.barra}`;
  }
  function ptEdCambio(el) {
    const p = prodDe(el.dataset.c), k = el.dataset.k;
    if (!p) return;
    const orig = String(p[k] ?? ''), v = el.value;
    const c = ptEd.cambios[p.id] = ptEd.cambios[p.id] || {};
    if (v.trim() === orig.trim()) delete c[k]; else c[k] = v;
    if (!Object.keys(c).length) delete ptEd.cambios[p.id];
    el.classList.toggle('pted-cam', k in (ptEd.cambios[p.id] || {}));
    const b = $('ptEdOk'); if (b) { b.disabled = !ptEdN(); b.textContent = ptEdBtnTxt(); }
    if ($('fErrPt')) $('fErrPt').hidden = true;
  }
  function ptEdGuardar() {
    const b = $('ptEdOk');
    if (!b || b.disabled || !ptEdN()) return;
    const cambios = Object.entries(ptEd.cambios).map(([codigo, c]) => Object.assign({ codigo }, c));
    b.disabled = true; b.textContent = 'Guardando…';
    llamar('bdEditarProductos', { cambios, usuario: ses.nombre }).then(r => {
      ini.productos = r.productos; prodRefrescado();
      ptEd.cambios = {}; ptEd.solo = false;
      pitido(); toast(`Listo: ${plural(r.cambiados, 'producto actualizado', 'productos actualizados')}`, 'ok');
      pintarApp();
    }).catch(e => {
      b.disabled = false; b.textContent = ptEdBtnTxt();
      const f = $('fErrPt'); if (f) { f.textContent = e.message; f.hidden = false; f.scrollIntoView({ block: 'nearest' }); } else toast(e.message, 'error');
    });
  }

  // Una fila por producto y almacén
  let ptMemo = null;
  function filasProdTotales() {
    const d = datosInventario();
    asegurarUbicSede(ses.sedeId);
    const ub = (ubicSede[ses.sedeId] || {}).m;
    if (ptMemo && ptMemo.d === d && ptMemo.alm === prodAlm && ptMemo.sede === sede && ptMemo.ub === ub && ptMemo.pc === usarPasCargado()) return ptMemo.v;
    const porCod = {}; d.forEach(f => (porCod[f.cod] = f));
    const enPlano = new Set(sede.lineas.map(l => l.productoId));
    // Pasillos donde está cada producto en aéreo (los del editor del plano), por almacén
    const pasProd = {};
    sede.lineas.forEach(l => {
      const e = sede.espPorId[l.ubicacionId];
      if (!e || e.nivel === 0) return;
      const pa = (sede.pasilloDeRack || {})[e.rackId];
      if (!pa) return;
      const x = pasilloDe(l.ubicacionId), k = (x && almCorto(x.key)) || '';
      ((pasProd[l.productoId] = pasProd[l.productoId] || {})[k] = pasProd[l.productoId][k] || new Set()).add(pa.nombre);
    });
    const pasDe = (cod, alm) => {
      if (usarPasCargado()) return pasCargado(cod, ses.sedeId, alm);   // encendido: solo el cargado para esta sede
      const m = pasProd[cod];
      if (!m) return '';
      const s = m[alm] || (Object.keys(m).length === 1 || !alm ? Object.values(m)[0] : null);   // si solo hay uno, va en cualquier almacén
      return s ? [...s].sort((a, b) => a.localeCompare(b, 'es', { numeric: true })).join(', ') : '';
    };
    const filas = [];
    ini.productos.forEach(p => {
      // Almacén: encendido = el cargado (de esta sede; si no tiene, el de «Cargar almacenes»); apagado = donde está en el plano o se contó
      const f = porCod[p.id], asig = usarPasCargado() ? almsRegDe(p.id, ses.sedeId).map(String) : [];
      const vals = {};
      if (f) Object.values(f.alm).forEach(a => {
        const k = almCorto(a.key) || '', v = vals[k] = vals[k] || { pk: 0, ae: 0, ca: 0, bl: 0 };
        v.pk += a.picking; v.ae += a.aereo; v.ca += a.calidad; v.bl += a.bloqueado;
      });
      const keys = [...new Set(asig.concat(Object.keys(vals).filter(Boolean)))];
      if (!keys.length) keys.push('');
      if (vals[''] && keys[0]) {   // lo que no tiene almacén (ej. calidad de SAP) va con el primero
        const v = vals[keys[0]] = vals[keys[0]] || { pk: 0, ae: 0, ca: 0, bl: 0 };
        ['pk', 'ae', 'ca', 'bl'].forEach(x => (v[x] += vals[''][x]));
      }
      keys.forEach(k => {
        const v = vals[k] || { pk: 0, ae: 0, ca: 0, bl: 0 };
        filas.push({ p, alm: k, otro: !!(asig.length && k && !asig.includes(k)), pas: pasDe(p.id, k), pk: v.pk, ae: v.ae, ca: v.ca, bl: v.bl, tot: v.pk + v.ae + v.ca + v.bl, plano: enPlano.has(p.id) });
      });
    });
    ptMemo = { d, alm: prodAlm, sede, ub, pc: usarPasCargado(), v: filas };
    return filas;
  }
  const PT_FIL = [['cat', 'categoria', 'Categoría'], ['sub', 'subcategoria', 'Subcategoría'], ['um', 'unidadMedida', 'Unidad'], ['ump', 'umProveedor', 'UM proveedor']];
  const valProd = k => ({ cod: x => x.p.id, nut: x => x.p.codigoNutresa || '', ean: x => x.p.codigoBarras || '', prod: x => x.p.nombre,
    um: x => x.p.unidadMedida || '', kg: x => x.p.equivKg === '' ? '' : x.p.equivKg, ucj: x => x.p.undPorCaja, cat: x => x.p.categoria || '', sub: x => x.p.subcategoria || '',
    ump: x => x.p.umProveedor || '', lar: x => x.p.largo || '', anc: x => x.p.ancho || '', alt: x => x.p.alto || '', oab: x => x.p.obsAbast || '', obs: x => x.p.observaciones || '', alm: x => x.alm, pas: x => x.pas, pk: x => x.pk, ae: x => x.ae, ca: x => x.ca, bl: x => x.bl, tot: x => x.tot }[k]);

  function listaProdHtml() {
    if (!invData || prodAlm === null) return '';
    const palabras = sinTilde(prodFiltro.trim()).split(/\s+/).filter(Boolean);
    const todas = filasProdTotales(), conAlgo = new Set(todas.filter(x => x.tot || x.plano).map(x => x.p.id));
    let lista = todas.filter(x => {
      if (prodSoloStock && !conAlgo.has(x.p.id)) return false;   // si el producto tiene algo, salen todos sus almacenes
      if (prodF.alm === '-' ? x.alm : prodF.alm && x.alm !== prodF.alm) return false;
      if (PT_FIL.some(([k, campo]) => prodF[k] && (prodF[k] === '-' ? x.p[campo] : x.p[campo] !== prodF[k]))) return false;
      if (!palabras.length) return true;
      const t = sinTilde([x.p.id, x.p.codigoNutresa, x.p.codigoBarras, x.p.ean2, x.p.ean14, x.p.nombre, x.p.categoria, x.p.subcategoria, x.p.umProveedor, x.p.obsAbast, x.p.observaciones].join(' '));
      return palabras.every(w => t.includes(w));
    });
    if (!ordT.prod.k) lista = lista.slice().sort((a, b) => conAlgo.has(b.p.id) - conAlgo.has(a.p.id) || a.p.nombre.localeCompare(b.p.nombre) || String(a.alm).localeCompare(String(b.alm), 'es', { numeric: true }));
    lista = aplicarOrden('prod', lista, valProd);
    if (!lista.length) return `<p class="muted">${prodSoloStock && !palabras.length ? 'Todavía no hay productos con cantidad.' : 'No hay productos con ese filtro.'}</p>`;
    const pg = paginar('prod', lista, () => { if ($('prodLista')) $('prodLista').innerHTML = listaProdHtml(); });
    const n = v => v ? nInv(v) : '<span class="muted">0</span>';
    return `<span class="muted small">${lista.length} fila${lista.length === 1 ? '' : 's'}</span>
      <div class="tabla-wrap"><table class="tabla pt-tabla"><thead><tr>
        ${thO('prod', 'cod', 'Código')}${thO('prod', 'nut', 'Cód. Nutresa')}${thO('prod', 'ean', 'EAN')}${thO('prod', 'prod', 'Producto')}${thO('prod', 'alm', 'Almacén')}${thO('prod', 'pas', 'Pasillo')}
        ${thO('prod', 'pk', 'Picking', 'num')}${thO('prod', 'ae', 'Aéreo', 'num')}${thO('prod', 'ca', 'Calidad', 'num')}${thO('prod', 'bl', 'Bloqueado', 'num')}${thO('prod', 'tot', 'Total', 'num')}
        ${thO('prod', 'um', 'Unidad')}${thO('prod', 'kg', 'Equiv Kg', 'num')}${thO('prod', 'ucj', 'Und / cj', 'num')}${thO('prod', 'ump', 'UM proveedor')}${thO('prod', 'cat', 'Categoría')}${thO('prod', 'sub', 'Subcategoría')}
        ${thO('prod', 'lar', 'Largo')}${thO('prod', 'anc', 'Ancho')}${thO('prod', 'alt', 'Alto')}${thO('prod', 'oab', 'Obs. abastecimiento')}${thO('prod', 'obs', 'Observaciones')}
        <th></th></tr></thead>
      <tbody>${pg.filas.map(x => `<tr>
        <td class="nowrap"><b>${esc(x.p.id)}</b></td>
        <td class="nowrap">${x.p.codigoNutresa ? esc(x.p.codigoNutresa) : '<span class="muted">—</span>'}</td>
        <td class="nowrap small">${x.p.codigoBarras || x.p.ean2 || x.p.ean14 ? [x.p.codigoBarras, x.p.ean2].filter(Boolean).map(esc).join('<br>') + (x.p.ean14 ? `${x.p.codigoBarras || x.p.ean2 ? '<br>' : ''}<span class="muted">Caja</span> ${esc(x.p.ean14)}` : '') : '<span class="muted">—</span>'}</td>
        <td><span class="pt-nom">${esc(x.p.nombre)}</span></td>
        <td class="nowrap">${x.alm ? `<b>${esc(x.alm)}</b>${x.otro ? ' <span class="tag amar" title="Este almacén no está en la lista de almacenes del producto">Otro</span>' : ''}` : '<span class="muted">—</span>'}</td>
        <td class="nowrap">${x.pas ? esc(x.pas) : '<span class="muted">—</span>'}</td>
        <td class="num">${n(x.pk)}</td><td class="num">${n(x.ae)}</td><td class="num">${n(x.ca)}</td><td class="num">${n(x.bl)}</td>
        <td class="num"><b>${nInv(x.tot)}</b></td>
        <td class="nowrap">${esc(x.p.unidadMedida || '—')}</td><td class="num">${x.p.equivKg === '' ? '<span class="muted">—</span>' : nInv(x.p.equivKg)}</td><td class="num">${nInv(x.p.undPorCaja)}</td>
        ${['umProveedor', 'categoria', 'subcategoria', 'largo', 'ancho', 'alto'].map(k => `<td class="nowrap small">${x.p[k] ? esc(x.p[k]) : '<span class="muted">—</span>'}</td>`).join('')}
        ${['obsAbast', 'observaciones'].map(k => `<td class="small pt-obs">${x.p[k] ? esc(x.p[k]) : '<span class="muted">—</span>'}</td>`).join('')}
        <td><button class="btn btn-sec btn-mini" onclick="abrirOpcionesProd('${esc(x.p.id)}')">Ver</button></td></tr>`).join('')}</tbody></table></div>${pg.barra}`;
  }

  // Lo que se puede hacer con un producto: dónde está, mover, salida, historial, mapa y deshacer una salida
  function abrirOpcionesProd(cod) {
    const p = prodDe(cod);
    if (!p) return toast('Producto no encontrado', 'error');
    const ls = fefo(sede.lineas.filter(l => l.productoId === cod));
    const unds = ls.reduce((a, l) => a + l.unidades, 0);
    abrirModal(`<div class="fila-sb"><span class="h2">${esc(p.nombre)}</span>${btnCerrar()}</div>
      <span class="muted small">Código ${esc(p.id)} · Nutresa ${esc(p.codigoNutresa || '—')} · ${p.undPorCaja} und/cj${prodAlm && prodAlm[cod] ? ' · Almacén ' + prodAlm[cod].map(esc).join(', ') : ''}</span>
      <span class="small">${p.codigoBarras ? `EAN <b>${esc(p.codigoBarras)}</b>` : '<b class="txt-naranja">Sin EAN</b>'}
        ${puede('prod_editar') ? `<button class="link" onclick="hojaCtx = { p: prodDe('${esc(cod)}'), e: null, volver: () => abrirOpcionesProd('${esc(cod)}') }; hojaEan()">${p.codigoBarras ? 'Cambiar EAN' : '+ Agregar EAN'}</button>` : ''}</span>
      <span class="lbl mt12 fila gap8">Dónde está en ${esc(nombreSede(ses.sedeId))} ${ayudaHtml('Cada cuadro es un lugar del plano donde está este producto. Tócalo para abrir esa posición.')}</span>
      ${ls.length ? `<span class="muted small">${ls.length} lugar${ls.length === 1 ? '' : 'es'} · ${und(unds, p)}</span>
        <div class="lugares">${ls.map(l => `<button class="lugar-chip e2-${estadoDe([l])}" title="${esc(lugarTxt(l.ubicacionId))}"
          onclick="cerrarModal(); abrirPos('${esc(sede.espPorId[l.ubicacionId].rackId)}', ${sede.espPorId[l.ubicacionId].posicion}, '${esc(l.ubicacionId)}')">
          <b>${esc(cu(l.ubicacionId))}</b><small>${cant(l)} · vence ${fFecha(l.vencimiento, true)}</small></button>`).join('')}</div>`
        : '<span class="muted small">No está ubicado en el plano de esta sede.</span>'}
      <div class="pt-acciones mt12">
        ${ls.length && puede('mover') ? `<button class="btn btn-pri" onclick="cerrarModal(); abrirFicha('${esc(cod)}')">Mover</button>` : ''}
        ${ls.length && puede('salida') ? `<button class="btn btn-sal" onclick="cerrarModal(); abrirFicha('${esc(cod)}')">Salida</button>` : ''}
        <button class="btn btn-sec" onclick="cerrarModal(); abrirHistorial('${esc(cod)}')">Historial</button>
        ${ls.length ? `<button class="btn btn-sec" onclick="cerrarModal(); seguirEnMapa('${esc(cod)}')">Ver en el mapa</button>` : ''}
      </div>
      ${puede('salida') ? `<span class="lbl mt16 fila gap8">Salidas de los últimos 5 días ${ayudaHtml('Si le diste salida a este producto por error, toca «Deshacer» y vuelve al mismo lugar, con su rótulo, vencimiento y cantidad. Se puede durante 5 días.')}</span>
        <div id="ptSalidas"><div class="cargando">Buscando…</div></div>` : ''}`);
    if (puede('salida')) cargarSalidasRecientes(cod);
  }

  // Salidas recientes (de un producto o de todos en esta sede) con su botón para deshacer
  let salRec = null;   // { cod, l }
  function cargarSalidasRecientes(cod) {
    llamar('bdSalidasRecientes', cod || '').then(l => {
      salRec = { cod: cod || '', l: l.filter(m => sede.espPorId[m.ubicacionId]) };   // solo las de esta sede
      if ($('ptSalidas')) $('ptSalidas').innerHTML = salidasRecHtml();
    }).catch(e => { if ($('ptSalidas')) $('ptSalidas').innerHTML = `<p class="error small">${esc(e.message)}</p>`; });
  }
  function salidasRecHtml() {
    const l = salRec ? salRec.l : [];
    if (!l.length) return `<p class="muted small">No hay salidas en los últimos 5 días${salRec && salRec.cod ? ' de este producto' : ' en esta sede'}.</p>`;
    return `<div class="lista-bp">${l.map(m => `<div class="pt-salida">
      <span class="col gap4 flex1" style="min-width:0">
        <b>${salRec.cod ? '' : esc(m.productoId) + ' · ' + esc(m.nombre) + ' · '}${esc(cu(m.ubicacionId))}</b>
        <span class="muted small">${fechaHora(m.fecha)} · ${esc(m.usuario || '—')} · ${nInv(m.unidades)} und${m.lote ? ' · Lote ' + esc(m.lote) : ''}${m.motivo ? ' · ' + esc(m.motivo) : ''}</span></span>
      ${m.deshecha ? '<span class="tag ok">Deshecha</span>' : `<button class="btn btn-sec btn-mini" onclick="deshacerSalida('${esc(m.id)}', this)">Deshacer</button>`}
    </div>`).join('')}</div>`;
  }
  function abrirSalidasRecientes() {
    if (sinPermiso('deshacer_salida')) return;
    abrirModal(`<div class="fila-sb"><span class="h2 fila gap8">Deshacer una salida ${ayudaHtml('Aquí están las salidas de los últimos 5 días en esta sede. Si alguna fue por error, toca «Deshacer»: el producto vuelve al mismo lugar del plano, con su rótulo, vencimiento y cantidad. Cada salida se puede deshacer una sola vez.')}</span>${btnCerrar()}</div>
      <div id="ptSalidas" class="mt12"><div class="cargando">Buscando…</div></div>`);
    cargarSalidasRecientes('');
  }
  function deshacerSalida(id, b) {
    if (b.dataset.ok !== '1') { b.dataset.ok = '1'; b.textContent = '¿Seguro? Toca otra vez'; b.classList.add('btn-pri'); return; }
    const m = (salRec ? salRec.l : []).find(x => x.id === id);
    b.disabled = true; b.textContent = 'Devolviendo…';
    llamar('bdDeshacerSalida', { movimientoId: id, usuario: ses.nombre, sedeId: ses.sedeId }).then(s => {
      setSede(s); ptMemo = null;
      if (m) m.deshecha = true;
      if ($('ptSalidas')) $('ptSalidas').innerHTML = salidasRecHtml();
      pitido(); toast(m ? `Listo: volvió a ${cu(m.ubicacionId)}` : 'Listo: volvió a su lugar', 'ok');
      if (vista === 'productos' && prodTab === 'totales' && $('prodLista')) $('prodLista').innerHTML = listaProdHtml();
    }).catch(e => { b.disabled = false; b.dataset.ok = ''; b.textContent = 'Deshacer'; b.classList.remove('btn-pri'); toast(e.message, 'error'); });
  }

  // Cargar la lista de almacenes de cada producto (Excel con código y almacén; sirve la MB52)
  let almTmp = null;
  function abrirCargaAlmProd() {
    if (sinPermiso('prod_almacenes')) return;
    almTmp = null;
    abrirModal(`<div class="fila-sb"><span class="h2 fila gap8">Cargar almacenes ${ayudaHtml('Sube un Excel con el código del producto y su almacén (sirve la MB52). Si un producto viene con dos almacenes, en la tabla sale una fila por cada almacén. La lista que subas reemplaza la anterior.')}</span>${btnCerrar()}</div>
      <label for="almArch" class="btn btn-pri btn-xl mt12" role="button" tabindex="0">Escoger Excel</label>
      <input id="almArch" type="file" accept=".xlsx,.xls,.csv" class="oculto">
      <div id="almCaja" class="mt12"></div>
      <p id="fErr" class="error" hidden></p>`);
    $('almArch').addEventListener('change', ev => { const f = ev.target.files[0]; if (f) leerAlmProd(f); });
  }
  function leerAlmProd(f) {
    const r = new FileReader();
    r.onload = () => {
      try {
        let filas;
        if (window.XLSX && !/\.csv$/i.test(f.name)) {
          const wb = XLSX.read(new Uint8Array(r.result), { type: 'array' });
          filas = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1, raw: true, defval: '' });
        } else filas = new TextDecoder('utf-8').decode(r.result).split(/\r?\n/).map(l => l.split(/[;,\t]/).map(c => c.replace(/^"|"$/g, '').trim()));
        const t = v => sinTilde(String(v || '')).toUpperCase().trim();
        const iCab = filas.findIndex(x => x.some(c => /COD/.test(t(c))) && x.some(c => /ALMACEN/.test(t(c))));
        if (iCab < 0) return errForm('No encontré las columnas de código y ALMACEN en ese archivo.');
        const cab = filas[iCab].map(t), col = re => cab.findIndex(c => re.test(c));
        const cCod = [col(/COD.*(ATL|AFS)/), col(/^COD/), col(/COD/)].find(i => i >= 0), cAlm = col(/ALMACEN/);
        const cod = v => String(v ?? '').trim().replace(/\.0+$/, '').replace(/^0+(?=\d)/, '');
        const ok = [], malos = new Set();
        filas.slice(iCab + 1).forEach(x => {
          const c = cod(x[cCod]), a = cod(x[cAlm]);
          if (!c || !a) return;
          const p = prodDe(c) || buscarProducto(c);
          if (p && p.id === c) ok.push({ codigo: c, almacen: a }); else malos.add(c);
        });
        almTmp = { archivo: f.name, filas: ok };
        const prods = new Set(ok.map(x => x.codigo)).size, dobles = Object.values(ok.reduce((m, x) => ((m[x.codigo] = (m[x.codigo] || 0) + 1), m), {})).filter(n => n > 1).length;
        $('almCaja').innerHTML = `<div class="info"><b>${prods}</b> productos con almacén${dobles ? ` · <b>${dobles}</b> con más de un almacén` : ''}${malos.size ? ` · <span class="txt-naranja">${malos.size} códigos no están en Productos</span>` : ''}</div>
          ${malos.size ? `<span class="muted small">No están: ${[...malos].slice(0, 12).map(esc).join(', ')}${malos.size > 12 ? '…' : ''}</span>` : ''}
          <div class="dos mt12"><button class="btn btn-sec btn-xl" onclick="cerrarModal()">Cancelar</button>
            <button id="almOk" class="btn btn-pri btn-xl" onclick="guardarAlmProd()" ${ok.length ? '' : 'disabled'}>Guardar</button></div>`;
      } catch (e) { errForm('No se pudo leer el archivo: ' + e.message); }
    };
    r.readAsArrayBuffer(f);
  }
  function guardarAlmProd() {
    const b = $('almOk'); b.disabled = true; b.textContent = 'Guardando…';
    llamar('bdCargarAlmacenesProductos', { filas: almTmp.filas, usuario: ses.nombre }).then(r => {
      cerrarModal(); prodAlm = null; ptMemo = null;
      pitido(); toast(`Listo: ${r.guardados} filas de almacén guardadas`, 'ok');
      pintarApp();
    }).catch(e => { b.disabled = false; b.textContent = 'Guardar'; errForm(e.message); });
  }/* ================= Identificador del producto (rótulo) ================= */
  let rotulos = null;     // últimos identificadores creados
  let sinImp = null;      // cargados sin código de barras que falta imprimir
  let ubicando = null;    // identificador escaneado que se va a poner en un espacio

  const hoyISO = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };
  // Fecha de recibo que sale escrita: la de hoy. Si hoy ya se escribió otra (varios rótulos del mismo recibo), esa.
  function reciboDefecto() {
    const u = leerLS('ultRecibo2');
    return u && u.dia === hoyISO() && u.fecha ? u.fecha : hoyISO();
  }
  function recordarRecibo(fecha) { if (fecha) guardarLS('ultRecibo2', { fecha, dia: hoyISO() }); }
  const fCorta = f => /^\d{4}-\d{2}-\d{2}$/.test(f || '') ? f.split('-').reverse().join('/') : (f || '');

  /* ----- Rótulos: se llenan varios seguidos (cada uno completo) y al final se elige cuáles imprimir ----- */
  let rt = { tipo: 'NORMAL', pc: '', pe: '' };
  let tanda = leerLS('tandaRotulos') || [];   // rótulos guardados en esta tanda: [{ ...rótulo, imprimir }]
  const num = v => { const n = parseFloat(String(v ?? '').replace(',', '.')); return isNaN(n) ? null : n; };
  const kg = n => `${+Number(n).toFixed(2)} kg`;
  const guardarTanda = () => guardarLS('tandaRotulos', tanda);

  /* ---------- Rótulos de conteo (contingencia de inventario) ----------
   * Hojas para pegar donde está el producto (cava, empaques al vacío sin código visible): el código Atlantic
   * en barras y un cuadro para anotar la cantidad con marcador borrable. Individual: una hoja por producto.
   * Lista: 6 por hoja, con la ubicación arriba si la escriben. Solo imprime: no guarda nada en la base. */
  let rtVista = 'estiba', rcnListasSede = '';
  // Cada tipo tiene su propia lista: lo de Individual no pasa a Lista ni al revés
  const rcn = (() => {
    const r = { modo: 'ind', ind: [], lista: [], ubic: '' };
    try {
      const x = JSON.parse(localStorage.getItem('rotConteo') || 'null');
      if (x) {
        r.modo = x.modo === 'lista' ? 'lista' : 'ind'; r.ubic = x.ubic || '';
        if (Array.isArray(x.ind)) r.ind = x.ind;
        if (Array.isArray(x.lista)) r.lista = x.lista;
        if (Array.isArray(x.prods) && !x.ind && !x.lista) r[r.modo] = x.prods;   // de la versión anterior
      }
    } catch (e) {}
    return r;
  })();
  const rcnL = () => (rcn.modo === 'lista' ? rcn.lista : rcn.ind);
  const rcnGuardar = () => { try { localStorage.setItem('rotConteo', JSON.stringify(rcn)); } catch (e) {} };
  function rotTabsHtml() {
    return `<div class="tabs" role="tablist" aria-label="Rotular">
      <button class="tab ${rtVista === 'estiba' ? 'on' : ''}" onclick="rtVista='estiba'; pintarApp()">Rótulos de estiba</button>
      <button class="tab ${rtVista === 'conteo' ? 'on' : ''}" onclick="rtVista='conteo'; pintarApp()">Rótulos de conteo</button></div>`;
  }
  function vistaConteoRot() {
    const n = rcnL().length, hojas = rcn.modo === 'ind' ? n : Math.ceil(n / 6);
    return `<div class="col gap12">${rotTabsHtml()}
      <div class="col gap4"><span class="h2">Rótulos de conteo ${ayudaHtml('Para el inventario, como plan de contingencia: se pegan donde está el producto (por ejemplo en la cava, donde el empaque al vacío no deja ver el código). Se anota la cantidad con marcador borrable y la radiofrecuencia escanea el código de barras para registrarla cuando haya señal.')}</span>
        <span class="muted small">Escanea o escribe los códigos, revisa la lista y toca Imprimir.</span></div>
      <div class="rcn-arriba">
        <section class="card col gap12">
          <div><span class="lbl">Tipo</span>
            <div class="seg" role="group" aria-label="Tipo de rótulo">
              <button class="${rcn.modo === 'ind' ? 'on' : ''}" onclick="rcnModo('ind')">Individual</button>
              <button class="${rcn.modo === 'lista' ? 'on' : ''}" onclick="rcnModo('lista')">Lista (6 por hoja)</button></div></div>
          ${rcn.modo === 'lista' ? `<div><label class="lbl" for="rcnUbic">Ubicación (opcional) ${ayudaHtml('Si la escribes o la escaneas, sale arriba de cada hoja con su código de barras: así queda claro qué productos van en ese lugar.')}</label>
            ${campoConCamara(`<input id="rcnUbic" class="campo" autocomplete="off" spellcheck="false" autocapitalize="characters" placeholder="Ej. 2000-07-02-01" value="${esc(rcn.ubic)}" onchange="rcnUbicar(this.value)">`, 'rcnUbic')}</div>` : ''}
          <div><label class="lbl" for="rcnCod">Producto</label>
            ${campoConCamara('<input id="rcnCod" class="campo" list="dlProductos" autocomplete="off" spellcheck="false" placeholder="Escanea o escribe el código y Enter">', 'rcnCod')}
            <span class="muted small">Puedes pegar varios códigos a la vez (uno por línea o separados por comas).</span></div>
          <button class="btn btn-pri btn-xl" onclick="rcnImprimir()" ${n ? '' : 'disabled'}>${n ? `Imprimir ${hojas} hoja${hojas === 1 ? '' : 's'}` : 'Agrega productos para imprimir'}</button>
        </section>
        <section class="card col gap8" aria-labelledby="rcnTit">
          <div class="fila-sb"><span class="h3" id="rcnTit">${rcn.modo === 'lista' ? 'Lista' : 'Individual'}: para imprimir (${n})</span>${n ? '<button class="btn btn-sec btn-mini" onclick="rcnVaciar()">Quitar todos</button>' : ''}</div>
          ${n ? `<div class="rcn-lista">${rcnL().map((k, i) => { const p = prodDe(k);
            return `<div class="rcn-item"><span class="rcn-n">${i + 1}</span><span class="col" style="min-width:0;flex:1"><b>${esc(k)}</b><span class="small">${esc(p ? p.nombre : 'No está en Productos')}</span></span>
              <button class="btn btn-sec btn-mini" onclick="rcnQuitar(${i})" aria-label="Quitar ${esc(k)}">✕</button></div>`; }).join('')}</div>`
            : '<p class="muted">Todavía no hay productos. Escanea el primero.</p>'}
          ${n ? `<div class="rcn-guardar col gap8">
            <label class="lbl" for="rcnNom">¿La imprimen en otro equipo? Guárdala con un nombre ${ayudaHtml('La lista queda guardada para esta sede: en la oficina (o en cualquier equipo) la ven en «Listas guardadas» y la imprimen.')}</label>
            <div class="fila gap8"><input id="rcnNom" class="campo" style="flex:1;min-width:0" maxlength="80" autocomplete="off" placeholder="Ej. Cava −17 pasillo 2">
              <button id="rcnGuardar" class="btn btn-sec" onclick="rcnGuardarLista()">Guardar lista</button></div>
            <p id="rcnErr" class="error" hidden></p></div>` : ''}
        </section>
      </div>
      <section class="card col gap8" aria-labelledby="rcnLT">
        <div class="fila-sb wrap-f gap8"><span class="h3" id="rcnLT">Listas guardadas · ${esc(nombreSede(ses.sedeId))}</span>
          <button class="btn btn-sec btn-mini" onclick="rcnListas = rcnListas || []; rcnCargarListas()">Actualizar</button></div>
        <div id="rcnListas">${rcnListasHtml()}</div>
      </section></div>`;
  }
  function rcnModo(m) { rcn.modo = m; rcnGuardar(); pintarApp(); }
  function rcnUbicar(v) { rcn.ubic = String(v || '').trim().toUpperCase(); rcnGuardar(); }
  function rcnQuitar(i) { rcnL().splice(i, 1); rcnGuardar(); pintarApp(); setTimeout(() => $('rcnCod') && $('rcnCod').focus(), 30); }
  function rcnVaciar() { rcn[rcn.modo] = []; rcnGuardar(); pintarApp(); }
  function rcnAgregar(txt) {
    let partes = String(txt || '').split(/[\n,;\t]+/).map(x => x.trim()).filter(Boolean);
    if (partes.length === 1 && !buscarProducto(partes[0].split(' · ')[0])) {
      const ws = partes[0].split(/\s+/);
      if (ws.length > 1 && ws.every(w => buscarProducto(w))) partes = ws;
    }
    const malos = [], ya = [];
    let n = 0;
    partes.forEach(t => {
      const p = buscarProducto(t.split(' · ')[0]) || buscarProducto(t);
      if (!p) return malos.push(t);
      if (rcnL().includes(p.id)) return ya.push(p.id);
      rcnL().push(p.id); n++;
    });
    rcnGuardar();
    if (n) { pitido(); pintarApp(); setTimeout(() => $('rcnCod') && $('rcnCod').focus(), 30); }
    else if ($('rcnCod')) { $('rcnCod').value = ''; $('rcnCod').focus(); }
    if (malos.length) toast(`No hay producto con ${malos.length === 1 ? 'el código' : 'los códigos'} ${malos.slice(0, 5).join(', ')}`, 'error');
    else if (ya.length && !n) toast(`${ya.join(', ')} ya está en la lista`, 'error');
  }
  function enlazarConteoRot() {
    if (rcnListasSede !== ses.sedeId) { rcnListasSede = ses.sedeId; rcnListas = null; rcnCargarListas(); }   // al entrar o al cambiar de sede
    const c = $('rcnCod');
    if (c) {
      c.addEventListener('keydown', ev => { if (ev.key === 'Enter') { ev.preventDefault(); rcnAgregar(c.value); } });
      c.addEventListener('change', () => { if (buscarProducto(c.value.split(' · ')[0])) rcnAgregar(c.value); });
      // Pegar una columna de Excel: el campo borraría los saltos de línea, por eso se toma lo pegado directo
      c.addEventListener('paste', ev => {
        const t = ev.clipboardData && ev.clipboardData.getData('text');
        if (t && /[\n\r,;\t]/.test(t.trim())) { ev.preventDefault(); rcnAgregar(t); }
      });
      c.focus({ preventScroll: true });
    }
    const u = $('rcnUbic');
    if (u) u.addEventListener('keydown', ev => { if (ev.key === 'Enter') { ev.preventDefault(); rcnUbicar(u.value); u.value = rcn.ubic; if (c) c.focus(); } });
  }
  // Tamaño del nombre según qué tan largo es (que se lea de lejos sin exagerar)
  const rcnTamNombre = (t, modo) => {
    const n = String(t || '').length;
    if (modo === 'ind') return n <= 18 ? 60 : n <= 30 ? 50 : n <= 45 ? 42 : 34;
    return n <= 22 ? 22 : n <= 36 ? 19 : 16;
  };
  function rcnImprimir() {
    if (!rcnL().length) return;
    if ($('rcnUbic')) rcnUbicar($('rcnUbic').value);
    return rcnImprimirCon(rcnL(), rcn.modo, rcn.modo === 'lista' ? rcn.ubic : '');
  }
  // codigos: lista de códigos · modo: 'ind' | 'lista' · ubic: ubicación (solo lista). Devuelve true si mandó a imprimir
  function rcnImprimirCon(codigos, modo, ubic) {
    if (!window.JsBarcode) { toast('No se pudo cargar el dibujo del código de barras. Revisa la conexión y vuelve a intentarlo.', 'error'); return false; }
    const pr = $('print');
    pr.className = 'modo-conteo';
    const ps = codigos.map(k => ({ k, nom: (prodDe(k) || {}).nombre || k }));
    if (modo === 'ind') {
      pr.innerHTML = ps.map(x => `<div class="rcx-hoja rcx-ind"><div class="rcx-cinta"></div>
        <div class="rcx-nombre" style="font-size:${rcnTamNombre(x.nom, 'ind')}pt">${esc(x.nom)}</div>
        <div class="rcx-abajo">
          <div class="rcx-cbcaja"><svg class="rcx-cb" data-rcx="${esc(x.k)}" data-g="1"></svg><div class="rcx-atl">${esc(x.k)}</div></div>
          <div class="rcx-cuadro"><div class="rcx-blanco"></div><div class="rcx-pie">CANTIDAD</div></div>
        </div></div>`).join('');
    } else {
      const hojas = [];
      for (let i = 0; i < ps.length; i += 6) hojas.push(ps.slice(i, i + 6));
      pr.innerHTML = hojas.map(h => `<div class="rcx-hoja rcx-lista ${ubic ? 'con-ubic' : ''}"><div class="rcx-cinta"></div>
        ${ubic ? `<div class="rcx-ubic"><span class="rcx-ubic-t">UBICACIÓN</span><b>${esc(ubic)}</b><svg class="rcx-cb" data-rcx="${esc(ubic)}"></svg></div>` : ''}
        <div class="rcx-filas">${h.map(x => `<div class="rcx-fila">
          <div class="rcx-cbcaja"><svg class="rcx-cb" data-rcx="${esc(x.k)}"></svg><div class="rcx-atl">${esc(x.k)}</div></div>
          <div class="rcx-nombre" style="font-size:${rcnTamNombre(x.nom, 'lista')}pt">${esc(x.nom)}</div>
          <div class="rcx-cuadro"><div class="rcx-blanco"></div><div class="rcx-pie">CANTIDAD</div></div></div>`).join('')}</div>
      </div>`).join('');
    }
    let st = $('pagina');
    if (!st) { st = document.createElement('style'); st.id = 'pagina'; document.head.appendChild(st); }
    st.textContent = '@page { size: letter landscape; margin: 8mm; }';
    // Todos los códigos de barras del mismo tamaño (el recuadro lo fija la hoja, no el largo del código)
    pr.querySelectorAll('svg[data-rcx]').forEach(el => {
      try { JsBarcode(el, el.dataset.rcx, { format: 'CODE128', width: 4, height: 100, margin: 0, displayValue: false, background: '#FFFFFF', lineColor: '#000000' }); } catch (x) {}
      el.removeAttribute('width'); el.removeAttribute('height'); el.removeAttribute('style');
      el.setAttribute('preserveAspectRatio', 'none');
    });
    setTimeout(() => window.print(), 150);
    return true;
  }

  // Listas guardadas de la sede (se arman en planta y se imprimen en la oficina)
  let rcnListas = null, rcnFalta40 = false, rcnFil = 'pend', rcnBorrar = '';
  function rcnCargarListas() {
    llamar('bdListasConteo', ses.sedeId).then(r => { rcnListas = r.listas; rcnFalta40 = r.falta; if (vista === 'rotulo' && rtVista === 'conteo') rcnPintarListas(); })
      .catch(e => { rcnListas = rcnListas || []; if ($('rcnListas')) $('rcnListas').innerHTML = `<p class="error">${esc(e.message)}</p>`; });
  }
  function rcnPintarListas() { if ($('rcnListas')) $('rcnListas').innerHTML = rcnListasHtml(); }
  function rcnListasHtml() {
    if (rcnListas === null) return '<div class="cargando">Cargando listas…</div>';
    if (rcnFalta40) return '<p class="muted">Para guardar listas y verlas desde otro equipo falta correr el script 40 en Supabase.</p>';
    const l = rcnListas.filter(x => rcnFil === 'todas' || (rcnFil === 'pend' ? !x.impreso : !!x.impreso));
    const { filas, barra } = paginar('rcnListas', l, rcnPintarListas);
    const seg = `<div class="seg seg-3" role="group" aria-label="Qué listas ver">${[['pend', 'Por imprimir'], ['imp', 'Impresas'], ['todas', 'Todas']]
      .map(([k, t]) => `<button class="${rcnFil === k ? 'on' : ''}" onclick="rcnFil='${k}'; pagInicio('rcnListas'); rcnPintarListas()">${t}</button>`).join('')}</div>`;
    if (!l.length) return seg + `<p class="muted mt8">${rcnFil === 'imp' ? 'Todavía no hay listas impresas.' : rcnFil === 'pend' ? 'No hay listas por imprimir.' : 'Todavía no hay listas guardadas.'}</p>`;
    return seg + `<div class="tabla-wrap mt8"><table class="tabla"><thead><tr><th>Nombre</th><th>Tipo</th><th class="num">Productos</th><th>La hizo</th><th>Estado</th><th></th></tr></thead><tbody>
      ${filas.map(x => `<tr>
        <td><b>${esc(x.nombre)}</b>${x.ubicacion ? `<div class="muted small">Ubicación ${esc(x.ubicacion)}</div>` : ''}</td>
        <td>${x.tipo === 'LISTA' ? 'Lista' : 'Individual'}</td>
        <td class="num">${x.codigos.length}</td>
        <td>${esc(x.creadoPor || '—')}<div class="muted small">${fechaHora(x.creado)}</div></td>
        <td>${x.impreso ? `<span class="tag ok">Impresa</span><div class="muted small">${esc(x.impresoPor || '')} ${fechaHora(x.impreso)}</div>` : '<span class="tag">Por imprimir</span>'}</td>
        <td class="nowrap">${rcnBorrar === x.id
          ? `<span class="small">¿Borrar?</span> <button class="btn btn-sal-solido btn-mini" onclick="rcnBorrarLista('${esc(x.id)}')">Sí, borrar</button> <button class="btn btn-sec btn-mini" onclick="rcnBorrar=''; rcnPintarListas()">No</button>`
          : `<button class="btn btn-pri btn-mini" onclick="rcnImprimirLista('${esc(x.id)}')">Imprimir</button> <button class="btn btn-sec btn-mini" onclick="rcnBorrar='${esc(x.id)}'; rcnPintarListas()" aria-label="Borrar la lista ${esc(x.nombre)}">Borrar</button>`}</td>
      </tr>`).join('')}</tbody></table></div>${barra}`;
  }
  function rcnGuardarLista() {
    const nom = ($('rcnNom') && $('rcnNom').value.trim()) || '', er = $('rcnErr'), b = $('rcnGuardar');
    if ($('rcnUbic')) rcnUbicar($('rcnUbic').value);
    if (!nom) { er.textContent = 'Escribe un nombre para la lista (por ejemplo «Cava −17 pasillo 2»).'; er.hidden = false; $('rcnNom').focus(); return; }
    b.disabled = true; b.textContent = 'Guardando…';
    llamar('bdGuardarListaConteo', { sedeId: ses.sedeId, nombre: nom, tipo: rcn.modo === 'lista' ? 'LISTA' : 'IND', ubicacion: rcn.modo === 'lista' ? rcn.ubic : '', codigos: rcnL(), usuario: ses.nombre })
      .then(x => {
        rcn[rcn.modo] = []; if (rcn.modo === 'lista') rcn.ubic = ''; rcnGuardar();
        (rcnListas = rcnListas || []).unshift(x); rcnFil = 'pend'; pagInicio('rcnListas');
        pitido(); toast(`Lista «${x.nombre}» guardada. Ya la pueden imprimir desde otro equipo de esta sede.`, 'ok');
        pintarApp();
      })
      .catch(e => { er.textContent = e.message; er.hidden = false; b.disabled = false; b.textContent = 'Guardar lista'; });
  }
  function rcnImprimirLista(id) {
    const x = (rcnListas || []).find(y => y.id === id);
    if (!x) return;
    if (!rcnImprimirCon(x.codigos, x.tipo === 'LISTA' ? 'lista' : 'ind', x.tipo === 'LISTA' ? x.ubicacion : '')) return;
    llamar('bdImpresaListaConteo', { id, usuario: ses.nombre }).then(n => { Object.assign(x, n); rcnPintarListas(); }).catch(() => {});
  }
  function rcnBorrarLista(id) {
    llamar('bdBorrarListaConteo', id).then(() => { rcnListas = (rcnListas || []).filter(y => y.id !== id); rcnBorrar = ''; rcnPintarListas(); toast('Lista borrada', 'ok'); })
      .catch(e => toast(e.message, 'error'));
  }

  function vistaRotulo() {
    if (rtVista === 'conteo') return vistaConteoRot();
    const responsables = ini.operarios.filter(o => !o.regionales || o.regionales.indexOf(regionalAct()) >= 0).map(o => o.nombre);
    const ultResp = leerLS('ultResp');
    return `<div class="col gap12">${avisoCola()}${rotTabsHtml()}
      <div class="col gap4"><span class="h2">Rotular</span>
        <span class="muted small">Llena un rótulo, dale <b>Guardar rótulo</b> y sigue con el siguiente. Cuando termines, eliges cuáles imprimir.</span></div>
      <div class="rt-arriba">
      <div class="card col gap4">
        <span class="h3">Rótulo ${tanda.length + 1}</span>
        <label class="lbl" for="rtCod">Código AFS (escribe, elige o escanea)</label>
        ${campoConCamara('<input id="rtCod" class="campo" list="dlProductos" autocomplete="off">', 'rtCod')}
        <div id="rtInfo" class="info" hidden></div>
        <span class="lbl">Tipo de mercancía</span>
        <div class="seg" role="group" aria-label="Tipo de mercancía">
          <button id="rtT1" class="${rt.tipo === 'NORMAL' ? 'on' : ''}" onclick="rtTipo('NORMAL')">Normal</button>
          <button id="rtT2" class="${rt.tipo === 'PESO' ? 'on' : ''}" onclick="rtTipo('PESO')">Peso variable</button>
        </div>
        <div id="rtTipoCaja"></div>
        <div id="rtTotal" class="total-op" aria-live="polite"></div>
        <div class="dos">
          <div><label class="lbl" for="rtRec">Fecha de recibo</label><input id="rtRec" class="campo" type="date" value="${esc(reciboDefecto())}"></div>
          <div><label class="lbl" for="rtVen">Fecha de vencimiento</label><input id="rtVen" class="campo" type="date"></div>
        </div>
        <div class="resp-fijo"><span class="lbl">Responsable</span><span class="resp-nom">${esc(ses.nombre)}</span></div>
        <p id="fErr" class="error" hidden></p>
        <div class="rt-iguales mt12">
          <div><label class="lbl" for="rtN">¿Cuántas estibas iguales?</label>
            <div class="paso-num"><button type="button" class="btn btn-sec" onclick="rtNPaso(-1)" aria-label="Una menos">−</button>
              <input id="rtN" class="campo" type="number" inputmode="numeric" min="1" max="50" value="1" oninput="rtNTexto()">
              <button type="button" class="btn btn-sec" onclick="rtNPaso(1)" aria-label="Una más">+</button></div>
            <span class="muted small">Cada estiba sale con su propio código de barras.</span></div>
          <button id="rtOk" class="btn btn-pri btn-xl" onclick="crearRotulo()">Guardar rótulo</button>
        </div>
      </div>

      <div class="col gap12">
        ${panelPorImprimir()}
        <div class="card col gap8" id="tandaCaja">${tandaHtml()}</div>
      </div>
      </div>

      <div class="card col gap12">
        <div class="fila-sb wrap-f gap8"><span class="h3">Rótulos</span>
          <span class="fila gap8 wrap-f">${puede('reportes') ? '<button class="btn btn-sec" onclick="descargarRotulos()">Descargar Excel</button>' : ''}
            <button class="btn btn-sec" onclick="cargarRotulos()">Actualizar</button></span></div>
        <div class="rt-filtros">
          <div><label class="lbl" for="rtfDesde">Creados desde</label><input id="rtfDesde" class="campo" type="date" value="${esc(rtF.desde)}"></div>
          <div><label class="lbl" for="rtfHasta">Hasta</label><input id="rtfHasta" class="campo" type="date" value="${esc(rtF.hasta)}"></div>
          <div><label class="lbl" for="rtfEst">Estado</label>
            <select id="rtfEst" class="campo">${[['todos', 'Todos'], ['falta', 'Falta ubicar'], ['ubicado', 'Ubicados'], ['salio', 'Ya salieron'], ['sinimp', 'Sin imprimir'], ['imphoy', 'Impresos hoy'], ['anulado', 'Anulados']]
              .map(([k, t]) => `<option value="${k}" ${rtF.estado === k ? 'selected' : ''}>${t}</option>`).join('')}</select></div>
          <div class="rt-buscar"><label class="lbl" for="rtfQ">Buscar</label>
            <input id="rtfQ" class="campo" placeholder="Rótulo, código o producto" value="${esc(rtF.q)}" autocomplete="off"></div>
        </div>
        <div id="rtLista">${listaRotulos()}</div>
      </div>
    </div>`;
  }

  function tandaHtml() {
    if (!tanda.length) return `<span class="h3">Rótulos de esta tanda</span><span class="muted small">Aquí van quedando los rótulos que guardes.</span>`;
    const und = tanda.filter(e => e.tipo !== 'PESO').reduce((a, e) => a + Number(e.total), 0);
    const kgs = tanda.filter(e => e.tipo === 'PESO').reduce((a, e) => a + Number(e.total), 0);
    return `<div class="fila-sb"><span class="h3">Rótulos de esta tanda (${tanda.length})</span>
        <button class="link" onclick="limpiarTanda()">Empezar otra tanda</button></div>
      <div class="lista-bp">${tanda.map((e, i) => `<div class="estiba">
        <span class="chip">${i + 1}</span>
        <span class="col gap4 flex1" style="min-width:0"><b>${esc(e.id)} · ${esc(e.producto)}</b>
          <span class="muted small">${e.cajas} cj · ${e.tipo === 'PESO' ? kg(e.total) : e.total + ' und'} · vence ${fCorta(e.vencimiento)} · ${esc(e.responsable)}</span></span>
      </div>`).join('')}</div>
      <div class="calc">Total de la tanda: <b>${[und ? und + ' und' : '', kgs ? kg(kgs) : ''].filter(Boolean).join(' + ')}</b> en ${tanda.length} rótulo${tanda.length === 1 ? '' : 's'}</div>
      <button class="btn btn-ent btn-xl" onclick="elegirImpresion()">Terminé: elegir cuáles imprimir</button>`;
  }

  // Rótulos que nunca se han impreso (los de "Cargar sin código de barras" y los que se guardaron sin imprimir)
  const noImpreso = e => e.estado !== 'ANULADA' && (e.vecesImpreso === 0 || (e.sinImprimir && !e.vecesImpreso));

  // Imprimir varios de una vez: los que faltan por imprimir en el filtro de la tabla
  function elegirSinImp() {
    sinImp = filtrarRotulos().filter(noImpreso);
    if (!sinImp.length) return toast('No hay rótulos sin imprimir con ese filtro', 'error');
    abrirModal(`<div class="fila-sb"><span class="h2">¿Cuáles imprimo?</span>${btnCerrar()}</div>
      <span class="muted small mt8">Están en el orden en que se cargaron. Tip: imprímelos por fila para pegarlos recorriendo la bodega.</span>
      <div class="fila gap8 mt12 wrap-f"><button class="btn btn-sec" onclick="marcarTodos(true)">Marcar todos</button>
        <button class="btn btn-sec" onclick="marcarTodos(false)">Ninguno</button></div>
      <div class="lista-bp mt12">${sinImp.map((e, i) => `<label class="estiba" style="cursor:pointer">
        <input type="checkbox" class="impSel" data-i="${i}" checked>
        <span class="col gap4 flex1" style="min-width:0"><b>${esc(e.id)} · ${esc(e.producto)}</b>
          <span class="muted small">${e.ubicacion ? esc(cu(e.ubicacion)) : 'Sin lugar'} · ${e.cajas} cj · vence ${fCorta(e.vencimiento)}</span></span></label>`).join('')}</div>
      <div class="dos mt12">
        <div><label class="lbl" for="rtCopias">Copias de cada uno <span class="muted small">(mismo código)</span></label><input id="rtCopias" class="campo" type="number" inputmode="numeric" min="1" max="20" value="1"></div>
        <div><label class="lbl" for="rtTam">Tamaño del papel</label>
          <select id="rtTam" class="campo">
            <option value="carta" ${leerLS('rtTam') !== '10x15' ? 'selected' : ''}>Hoja carta (horizontal)</option>
            <option value="10x15" ${leerLS('rtTam') === '10x15' ? 'selected' : ''}>Etiqueta 15 × 10 cm</option>
          </select></div>
      </div>
      <p id="fErr" class="error" hidden></p>
      <button class="btn btn-pri btn-xl mt16" onclick="imprimirSinImp()">Imprimir los marcados</button>`);
  }

  function imprimirSinImp() {
    const lista = [...document.querySelectorAll('.impSel')].filter(c => c.checked).map(c => sinImp[Number(c.dataset.i)]);
    if (!lista.length) return errForm('Marca al menos uno.');
    const copias = Math.max(1, Math.min(20, Number($('rtCopias').value) || 1));
    const tam = $('rtTam').value;
    guardarLS('rtTam', tam);
    cerrarModal();
    imprimirRotulo(lista, copias, tam);   // queda registrado quién y cuándo imprimió
    const ids = lista.filter(e => e.sinImprimir).map(e => e.id);
    if (ids.length) llamar('bdMarcarImpresos', ids).then(() => lista.forEach(e => { e.sinImprimir = false; })).catch(() => {});
  }

  function limpiarTanda() {
    tanda = []; guardarTanda();
    if ($('tandaCaja')) $('tandaCaja').innerHTML = tandaHtml();
    pintarApp();
  }

  function rtTipo(t) {
    rt.tipo = t;
    $('rtT1').className = t === 'NORMAL' ? 'on' : '';
    $('rtT2').className = t === 'PESO' ? 'on' : '';
    pintarRtTipo();
  }

  // Parte del formulario que cambia según el tipo de mercancía, con el total al instante
  function pintarRtTipo() {
    const caja = $('rtTipoCaja');
    if (!caja) return;
    const p = buscarProducto($('rtCod').value);
    if (rt.tipo === 'NORMAL') {
      caja.innerHTML = `<div class="dos mt8">
          <div><label class="lbl" for="rtCajas">Número de cajas</label>
            <input id="rtCajas" class="campo" type="number" inputmode="numeric" min="1"></div>
          <div><label class="lbl" for="rtUnd">Unidades por caja</label>
            <input id="rtUnd" class="campo" type="number" inputmode="numeric" min="1" value="${p ? p.undPorCaja : ''}"></div>
        </div>
        <span id="rtUndAviso" class="muted small"></span>`;
      ['rtCajas', 'rtUnd'].forEach(id => $(id).addEventListener('input', calcRotulo));
    } else {
      caja.innerHTML = `<div class="dos mt8">
          <div><label class="lbl" for="rtPC">Peso de cada cava o caja (kg)</label>
            <input id="rtPC" class="campo" type="number" inputmode="decimal" step="any" min="0" value="${esc(rt.pc)}"></div>
          <div><label class="lbl" for="rtNC">¿Cuántas cavas llegaron?</label>
            <input id="rtNC" class="campo" type="number" inputmode="numeric" min="1"></div>
        </div>
        <div class="dos">
          <div><label class="lbl" for="rtPE">Peso de la estiba (kg)</label>
            <input id="rtPE" class="campo" type="number" inputmode="decimal" step="any" min="0" value="${esc(rt.pe)}"></div>
          <div><label class="lbl" for="rtPB">Peso en báscula (kg)</label>
            <input id="rtPB" class="campo" type="number" inputmode="decimal" step="any" min="0"></div>
        </div>`;
      ['rtPC', 'rtNC', 'rtPE', 'rtPB'].forEach(id => $(id).addEventListener('input', calcRotulo));
    }
    calcRotulo();
  }

  // Muestra el total de la operación mientras escriben
  function calcRotulo() {
    const t = $('rtTotal');
    if (!t) return;
    const p = buscarProducto($('rtCod').value);
    if (rt.tipo === 'NORMAL') {
      const c = num($('rtCajas').value), u = num($('rtUnd').value);
      t.innerHTML = c > 0 && u > 0 ? `<span>Total</span><b>${c} cajas × ${u} = ${c * u} unidades</b>`
        : '<span class="muted small">Escribe las cajas y las unidades por caja: aquí sale el total.</span>';
      $('rtUndAviso').textContent = p && u > 0 && u !== p.undPorCaja
        ? `Antes eran ${p.undPorCaja} por caja. Al guardar quedan ${u} para la próxima vez.` : '';
      return;
    }
    const pc = num($('rtPC').value) || 0, nc = num($('rtNC').value), pe = num($('rtPE').value) || 0, pb = num($('rtPB').value);
    rt.pc = $('rtPC').value; rt.pe = $('rtPE').value;
    if (!(nc > 0) || !(pb > 0)) { t.innerHTML = '<span class="muted small">Escribe los pesos y las cavas: aquí sale el peso neto.</span>'; return; }
    const cavas = pc * nc, neto = pb - pe - cavas;
    t.innerHTML = `<span>Cavas: ${nc} × ${pc} kg = ${kg(cavas)}</span>
      <span>Neto: ${kg(pb)} báscula − ${kg(pe)} estiba − ${kg(cavas)} cavas</span>
      <b class="${neto > 0 ? '' : 'txt-rojo'}">Peso neto: ${kg(neto)}</b>`;
  }

  function enlazarRotulo() {
    const c = $('rtCod');
    if (!c) return;
    let ultimo = '';
    const actualizar = () => {
      const p = buscarProducto(c.value);
      const info = $('rtInfo');
      if (p) {
        info.hidden = false;
        info.innerHTML = `<span class="fuerte">${esc(p.nombre)}</span>
          <span class="muted small">Código AFS ${esc(p.id)} · Código Nutresa ${esc(p.codigoNutresa || '—')} · Embalaje ${p.undPorCaja} und x caja${p.unidadMedida ? ' · ' + esc(p.unidadMedida) : ''}</span>${eanMiniHtml(p.id, 'rotular')}`;
        if (p.id !== ultimo) {
          ultimo = p.id;
          // Producto por kilo: se sugiere peso variable
          const tipo = (p.unidadMedida || '').toUpperCase() === 'KG' ? 'PESO' : 'NORMAL';
          return tipo !== rt.tipo ? rtTipo(tipo) : pintarRtTipo();
        }
      } else {
        info.hidden = !c.value.trim();
        info.innerHTML = c.value.trim() ? '<span class="txt-rojo small">Producto no encontrado</span>' : '';
      }
      calcRotulo();
    };
    c.addEventListener('input', actualizar);
    c.addEventListener('change', actualizar);
    c.addEventListener('keydown', ev => { if (ev.key === 'Enter') { ev.preventDefault(); actualizar(); const s = $('rtCajas') || $('rtPC'); if (s) s.focus(); } });
    pintarRtTipo();
    enlazarRotulos();
    if (rotulos === null) cargarRotulos();
    if (piLista === null) cargarPorImprimir();
    enlazarPorImprimir();
  }

  /* ----- Tabla de rótulos ----- */
  const haceDias = n => { const d = new Date(); d.setDate(d.getDate() - n); return d.toISOString().slice(0, 10); };
  const rtF = { desde: haceDias(30), hasta: hoyISO(), estado: 'todos', q: '' };

  function estadoRotulo(e) {
    if (e.estado === 'ANULADA') return { cls: 'venc', txt: 'Anulado', det: '' };
    if (e.estado === 'SALIDA') return { cls: 'venc', txt: 'Ya salió', det: e.fechaSalida ? fCorta(String(e.fechaSalida).slice(0, 10)) : '' };
    if (e.estado === 'UBICADA') return { cls: 'ok', txt: 'Ubicado', det: e.ubicacion };
    return { cls: 'amar', txt: 'Falta ubicar', det: '' };
  }

  const fechaLocal = iso => { const d = new Date(iso); return isNaN(d) ? '' : new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10); };

  /* ----- Marcar varios en la tabla e imprimirlos de una vez (también para volver a imprimir) ----- */
  const rtSel = new Set();
  function rtMarcar(id, on) { on ? rtSel.add(id) : rtSel.delete(id); $('rtLista').innerHTML = listaRotulos(); }
  function rtMarcarTodos(on) { filtrarRotulos().filter(e => e.estado !== 'ANULADA').forEach(e => (on ? rtSel.add(e.id) : rtSel.delete(e.id))); $('rtLista').innerHTML = listaRotulos(); }
  function imprimirMarcados() {
    const l = (rotulos || []).filter(e => rtSel.has(e.id) && e.estado !== 'ANULADA')
      .sort((a, b) => quienHizo(a).localeCompare(quienHizo(b)) || String(a.creado).localeCompare(String(b.creado)));
    if (!l.length) return;
    const tam = $('rtSelTam') ? $('rtSelTam').value : (leerLS('rtTam') || 'carta');
    guardarLS('rtTam', tam);
    imprimirRotulo(l, 1, tam);
    rtSel.clear();
    if ($('rtLista')) $('rtLista').innerHTML = listaRotulos();
    toast(`${l.length} rótulo${l.length === 1 ? '' : 's'} enviado${l.length === 1 ? '' : 's'} a la impresora`, 'ok');
  }

  function filtrarRotulos() {
    const q = sinTilde(rtF.q.trim()), pal = q.split(/\s+/).filter(Boolean);
    return (rotulos || []).filter(e => {
      if (rtF.estado === 'falta' && e.estado !== 'PENDIENTE') return false;
      if (rtF.estado === 'ubicado' && e.estado !== 'UBICADA') return false;
      if (rtF.estado === 'salio' && e.estado !== 'SALIDA') return false;
      if (rtF.estado === 'anulado' && e.estado !== 'ANULADA') return false;
      if (rtF.estado === 'sinimp' && !noImpreso(e)) return false;
      if (rtF.estado === 'imphoy' && !(e.ultimaImpresion && String(fechaLocal(e.ultimaImpresion)) === hoyISO())) return false;
      if (!pal.length) return true;
      const t = sinTilde(`${e.id} ${e.codigo} ${e.codigoNutresa} ${e.producto} ${e.ubicacion} ${e.ubicacion ? cu(e.ubicacion) : ''} ${e.creadoPor} ${e.responsable}`);
      return pal.every(w => t.includes(w));
    });
  }

  function impresoHtml(e) {
    if (e.vecesImpreso === null || e.vecesImpreso === undefined) return '<span class="muted small">Sin registro</span>';
    if (!e.vecesImpreso) return '<span class="tag amar">No impreso</span>';
    return `<b>${e.vecesImpreso} ${e.vecesImpreso === 1 ? 'vez' : 'veces'}</b>`;
  }

  function listaRotulos() {
    if (rotulos === null) return '<div class="cargando">Cargando rótulos…</div>';
    const l = filtrarRotulos();
    const cant2 = e => e.tipo === 'PESO' ? `${kg(e.total)}<br><span class="muted small">${e.cajas} cavas</span>` : `${e.cajas} cj<br><span class="muted small">${e.total} und</span>`;
    const pg = paginar('rt', l, () => { if ($('rtLista')) $('rtLista').innerHTML = listaRotulos(); });
    const filas = pg.filas.map(e => {
      const st = estadoRotulo(e), i = rotulos.indexOf(e);
      const nunca = noImpreso(e);
      return `<tr class="${rtSel.has(e.id) ? 'us-marcado' : ''}">
        <td class="rt-chk">${e.estado === 'ANULADA' ? '' : `<input type="checkbox" class="us-chk" ${rtSel.has(e.id) ? 'checked' : ''} onchange="rtMarcar('${esc(e.id)}', this.checked)" aria-label="Marcar ${esc(e.id)}">`}</td>
        <td>${fechaHora(e.creado).replace(' · ', '<br><span class="muted small">') + '</span>'}</td>
        <td><b class="nowrap">${esc(e.id)}</b></td>
        <td class="nowrap"><span class="muted small">Atlantic</span> ${esc(e.codigo)}<br><span class="muted small">Nutresa</span> ${esc(e.codigoNutresa || '—')}</td>
        <td class="rt-prod">${esc(e.producto)}</td>
        <td class="nowrap">${cant2(e)}</td>
        <td class="nowrap">${fCorta(e.vencimiento)}</td>
        <td><span class="tag ${st.cls}">${st.txt}</span>${st.det ? `<br><span class="small nowrap">${esc(st.det)}</span>` : ''}</td>
        <td>${esc(e.sede || '—')}</td>
        <td>${impresoHtml(e)}</td>
        <td>${e.ultimoImpresor ? `${esc(e.ultimoImpresor)}<br><span class="muted small nowrap">${fechaHora(e.ultimaImpresion)}</span>` : '<span class="muted">—</span>'}</td>
        <td>${esc(e.creadoPor || '—')}${e.responsable && e.responsable !== e.creadoPor ? `<br><span class="muted small">Resp.: ${esc(e.responsable)}</span>` : ''}</td>
        <td class="rt-acc"><button class="btn btn-sec btn-mini" onclick="abrirOpcionesRotulo(${i})">Ver</button></td>
      </tr>`;
    }).join('');
    const sinImp2 = rotulos.filter(noImpreso).length;
    const falta = rotulos.filter(e => e.estado === 'PENDIENTE').length;
    [...rtSel].forEach(id => { if (!rotulos.some(e => e.id === id)) rtSel.delete(id); });
    const marcables = l.filter(e => e.estado !== 'ANULADA'), todos = marcables.length && marcables.every(e => rtSel.has(e.id));
    const tam = leerLS('rtTam') === '10x15' ? '10x15' : 'carta';
    const barra = rtSel.size ? `<div class="us-bulk mt8"><b>${rtSel.size} marcado${rtSel.size === 1 ? '' : 's'}</b>
        <select id="rtSelTam" class="campo" aria-label="Tamaño del papel" style="flex:0 1 180px"><option value="carta" ${tam === 'carta' ? 'selected' : ''}>Hoja carta</option><option value="10x15" ${tam === '10x15' ? 'selected' : ''}>Etiqueta 15×10</option></select>
        <button class="btn btn-pri" onclick="imprimirMarcados()">Imprimir ${rtSel.size}</button>
        <button class="link" onclick="rtSel.clear(); $('rtLista').innerHTML = listaRotulos()">Quitar selección</button></div>` : '';
    return `<div class="fila-sb wrap-f gap8"><span class="muted small">${l.length} de ${rotulos.length} rótulo${rotulos.length === 1 ? '' : 's'} · <b class="txt-naranja">${falta}</b> falta${falta === 1 ? '' : 'n'} por ubicar ·
        <button class="link" onclick="rtF.estado='sinimp'; $('rtfEst').value='sinimp'; pagInicio('rt'); $('rtLista').innerHTML = listaRotulos()"><b>${sinImp2}</b> sin imprimir</button></span>
        ${marcables.length ? `<label class="us-todos" style="display:flex"><input type="checkbox" class="us-chk" ${todos ? 'checked' : ''} onchange="rtMarcarTodos(this.checked)"> Marcar los ${marcables.length} del filtro</label>` : ''}
</div>${barra}
      <div class="tabla-wrap mt8"><table class="tabla rt-tabla">
        <thead><tr><th class="rt-chk"><input type="checkbox" class="us-chk" ${todos ? 'checked' : ''} onchange="rtMarcarTodos(this.checked)" aria-label="Marcar todos los del filtro"></th><th>Creado</th><th>Rótulo</th><th>Códigos</th><th>Producto</th><th>Cantidad</th><th>Vence</th>
          <th>Estado</th><th>Sede</th><th>Impreso</th><th>Último que imprimió</th><th>Registró</th><th class="rt-acc"></th></tr></thead>
        <tbody>${filas || '<tr><td colspan="13" class="muted">No hay rótulos con ese filtro.</td></tr>'}</tbody></table></div>${pg.barra}`;
  }

  // Detalle de un rótulo con lo que se puede hacer (imprimir, duplicar, editar, trasladar, anular)
  function abrirOpcionesRotulo(i) {
    const e = rotulos && rotulos[i];
    if (!e) return;
    const st = estadoRotulo(e), nunca = noImpreso(e), anulado = e.estado === 'ANULADA';
    const dato = (t, v) => `<div><span class="muted small">${t}</span><b>${v}</b></div>`;
    const acc = (cond, cls, txt, fn) => cond ? `<button class="btn ${cls}" onclick="cerrarModal(); ${fn}(${i})">${txt}</button>` : '';
    const r = puede('rotular');
    const botones = [
      acc(!anulado, nunca ? 'btn-pri' : 'btn-sec', nunca ? 'Imprimir' : 'Reimprimir', 'reimprimir'),
      acc(r && !anulado, 'btn-sec', 'Duplicar', 'duplicarRotulo'),
      acc(r && (e.estado === 'PENDIENTE' || e.estado === 'UBICADA'), 'btn-sec', 'Editar', 'editarRotulo'),
      acc(r && e.estado === 'PENDIENTE' && ini.sedes.length > 1, 'btn-sec', 'Trasladar a otra sede', 'trasladarRotulo'),
      acc(r && e.estado === 'PENDIENTE', 'btn-sec txt-rojo', 'Anular', 'anularRotulo')
    ].filter(Boolean);
    abrirModal(`<div class="fila-sb"><span class="h2">Rótulo ${esc(e.id)}</span>${btnCerrar()}</div>
      <span class="fila gap8 wrap-f mt8"><span class="tag ${st.cls}">${st.txt}</span>${st.det ? `<span class="small">${esc(st.det)}</span>` : ''}</span>
      <span class="nombre mt8">${esc(e.producto)}</span>
      <div class="ficha-datos mt8">
        ${dato('Código Atlantic', esc(e.codigo))}${dato('Código Nutresa', esc(e.codigoNutresa || '—'))}
        ${dato('Cantidad', e.tipo === 'PESO' ? `${kg(e.total)} · ${e.cajas} cavas` : `${e.cajas} cj · ${e.total} und`)}${dato('Vence', fCorta(e.vencimiento))}
        ${dato('Sede', esc(e.sede || '—'))}${dato('Creado', `${fechaHora(e.creado)}${e.creadoPor ? ' · ' + esc(e.creadoPor) : ''}`)}
        ${dato('Impreso', impresoHtml(e))}${dato('Último que imprimió', e.ultimoImpresor ? `${esc(e.ultimoImpresor)} · ${fechaHora(e.ultimaImpresion)}` : '—')}
      </div>
      ${botones.length ? `<span class="lbl mt16 fila gap8">¿Qué quieres hacer? ${ayudaHtml('Imprimir: saca el rótulo otra vez. Duplicar: otra estiba con la misma información y otro código. Editar: corrige producto, cantidad o fechas. Trasladar: lo pasa a otra sede (solo si no está ubicado). Anular: si se creó por error; ya no se podrá ubicar.')}</span>
        <div class="pt-acciones mt8">${botones.join('')}</div>` : '<span class="muted small mt16">Este rótulo está anulado: no tiene acciones.</span>'}`);
  }

  function cargarRotulos() {
    rtF.desde = $('rtfDesde') ? $('rtfDesde').value : rtF.desde;
    rtF.hasta = $('rtfHasta') ? $('rtfHasta').value : rtF.hasta;
    rotulos = null;
    if ($('rtLista')) $('rtLista').innerHTML = listaRotulos();
    // Los que faltan por imprimir siempre salen en la tabla, aunque sean de antes de la fecha elegida
    Promise.all([llamar('bdEtiquetasTabla', { desde: rtF.desde, hasta: rtF.hasta, sedeId: ses.sedeId }), llamar('bdSinImprimir', ses.sedeId).catch(() => [])])
      .then(([l, pend]) => {
        const ya = new Set(l.map(e => e.id));
        rotulos = l.concat(pend.filter(e => !ya.has(e.id)).map(e => Object.assign({ sede: '' }, e)));
        if ($('rtLista')) $('rtLista').innerHTML = listaRotulos();
      })
      .catch(e => { rotulos = []; if ($('rtLista')) $('rtLista').innerHTML = `<p class="error">${esc(e.message)}</p>`; });
  }

  function enlazarRotulos() {
    if (!$('rtfQ')) return;
    $('rtfQ').addEventListener('input', () => { rtF.q = $('rtfQ').value; pagInicio('rt'); $('rtLista').innerHTML = listaRotulos(); });
    $('rtfEst').addEventListener('change', () => { rtF.estado = $('rtfEst').value; pagInicio('rt'); $('rtLista').innerHTML = listaRotulos(); });
    ['rtfDesde', 'rtfHasta'].forEach(id => $(id).addEventListener('change', () => { if (textoAIso(isoATexto($(id).value))) cargarRotulos(); }));
  }

  function descargarRotulos() {
    const l = filtrarRotulos();
    if (!l.length) return toast('No hay rótulos para descargar', 'error');
    descargarExcel(`Rotulos ${rtF.desde} a ${rtF.hasta}.xlsx`, { Rotulos: l.map(e => {
      const st = estadoRotulo(e);
      return {
        'Creado': fechaHora(e.creado), 'Rótulo': e.id, 'Código Atlantic': e.codigo, 'Código Nutresa': e.codigoNutresa,
        'Producto': e.producto, 'Tipo': e.tipo === 'PESO' ? 'Peso variable' : 'Normal', 'Cajas': e.cajas,
        'Total': e.total, 'Unidad': e.tipo === 'PESO' ? 'kg' : 'und', 'Vencimiento': e.vencimiento, 'Recibo': e.recibo,
        'Estado': st.txt, 'Ubicación': e.estado === 'UBICADA' ? cu(e.ubicacion) : '', 'Sede': e.sede,
        'Veces impreso': e.vecesImpreso === null ? 'Sin registro' : e.vecesImpreso,
        'Último que imprimió': e.ultimoImpresor, 'Fecha última impresión': e.ultimaImpresion ? fechaHora(e.ultimaImpresion) : '',
        'Registró': e.creadoPor, 'Responsable': e.responsable, 'Lote viejo': e.loteOrigen
      };
    }) });
  }

  // Guarda un rótulo completo y deja el formulario listo para el siguiente
  function crearRotulo() {
    const p = buscarProducto($('rtCod').value);
    if (!p) return errForm('Producto no encontrado. Elígelo de la lista o escanéalo.');
    const datos = { codigo: p.id, tipo: rt.tipo, recibo: $('rtRec').value, vencimiento: $('rtVen').value, responsable: ses.nombre, usuario: ses.nombre };
    if (rt.tipo === 'NORMAL') {
      const cajas = num($('rtCajas').value), undx = num($('rtUnd').value);
      if (!(cajas > 0)) return errForm('Escribe el número de cajas.');
      if (!(undx > 0)) return errForm('Escribe las unidades por caja.');
      Object.assign(datos, { cajas, undXCaja: undx });
    } else {
      const pc = num($('rtPC').value) || 0, nc = num($('rtNC').value), pe = num($('rtPE').value) || 0, pb = num($('rtPB').value);
      if (!(nc > 0)) return errForm('Escribe cuántas cavas llegaron.');
      if (!(pb > 0)) return errForm('Escribe el peso de la báscula.');
      if (pb - pe - pc * nc <= 0) return errForm('El peso neto da 0 o menos. Revisa los pesos.');
      Object.assign(datos, { numCavas: nc, pesoCava: pc, pesoEstiba: pe, pesoBascula: pb });
    }
    if (!datos.recibo) return errForm('Escribe la fecha de recibo.');
    if (!datos.vencimiento) return errForm('Escribe la fecha de vencimiento.');
    if (!datos.responsable) return errForm('Elige el responsable.');
    guardarLS('ultResp', datos.responsable);
    recordarRecibo(datos.recibo);
    const n = Math.max(1, Math.min(50, Math.floor(Number($('rtN') ? $('rtN').value : 1)) || 1));
    const b = $('rtOk');
    b.disabled = true; b.textContent = n > 1 ? `Guardando 1 de ${n}…` : 'Guardando…';
    crearIguales(datos, n, b).then(creados => {
      const e = creados[creados.length - 1];
      if (rt.tipo === 'NORMAL') p.undPorCaja = Number(e.embalaje) || p.undPorCaja;
      pitido();
      toast(n > 1 ? `${n} rótulos guardados (${creados[0].id} a ${e.id}), cada uno con su código. Sigue con el siguiente.`
        : `Rótulo ${e.id} guardado. Sigue con el siguiente.`, 'ok');
      pintarApp();
      if (colaRot) return siguienteCola(e);
      if ($('rtCod')) $('rtCod').focus();
    }).catch(err => { errForm(err.message); b.disabled = false; b.textContent = 'Guardar rótulo'; });
  }

  // Crea n rótulos con la misma información; cada uno con su propio identificador (E000123, E000124…)
  async function crearIguales(datos, n, boton) {
    const creados = [];
    try {
      for (let k = 0; k < n; k++) {
        if (boton && n > 1) boton.textContent = `Guardando ${k + 1} de ${n}…`;
        const e = await llamar('bdCrearEtiqueta', Object.assign({ sedeId: ses.sedeId }, datos));
        creados.push(e);
        tanda.push(Object.assign({ imprimir: true }, e));
        if (rotulos) rotulos = [Object.assign({ sede: '' }, e)].concat(rotulos);
        if (piLista && !piLista.some(x => x.id === e.id)) piLista.push(Object.assign({ sede: '', vecesImpreso: 0, creado: new Date().toISOString() }, e));
      }
      pintarPorImprimir();
    } catch (err) {
      if (creados.length) { guardarTanda(); throw new Error(`Se guardaron ${creados.length} de ${n}. ${err.message}`); }
      throw err;
    }
    guardarTanda();
    return creados;
  }

  function rtNPaso(d) { const c = $('rtN'); c.value = Math.max(1, Math.min(50, (Number(c.value) || 1) + d)); rtNTexto(); }
  function rtNTexto() {
    const n = Math.max(1, Math.min(50, Math.floor(Number($('rtN').value)) || 1));
    if ($('rtOk') && !$('rtOk').disabled) $('rtOk').textContent = n > 1 ? `Guardar ${n} rótulos` : 'Guardar rótulo';
  }

  // Duplicar desde la tabla: más estibas con la misma información de un rótulo que ya existe
  function duplicarRotulo(i) {
    const e = rotulos[i];
    if (!e) return;
    abrirModal(`<div class="fila-sb"><span class="h2">Más estibas iguales</span>${btnCerrar()}</div>
      <div class="info mt12"><span class="fuerte">${esc(e.producto)}</span>
        <span class="muted small">Igual a ${esc(e.id)}: ${e.tipo === 'PESO' ? kg(e.total) + ' en ' + e.cajas + ' cavas' : e.cajas + ' cj × ' + e.embalaje + ' = ' + e.total + ' und'} · recibo ${fCorta(e.recibo)} · vence ${fCorta(e.vencimiento)}</span></div>
      <label class="lbl mt12" for="dupN">¿Cuántas estibas más?</label>
      <div class="paso-num"><button type="button" class="btn btn-sec" onclick="$('dupN').value=Math.max(1,(+$('dupN').value||1)-1)">−</button>
        <input id="dupN" class="campo" type="number" inputmode="numeric" min="1" max="50" value="1">
        <button type="button" class="btn btn-sec" onclick="$('dupN').value=Math.min(50,(+$('dupN').value||1)+1)">+</button></div>
      <span class="muted small">Cada una sale con su propio código de barras y queda en <b>Rótulos de esta tanda</b> para imprimir.</span>
      <p id="fErr" class="error" hidden></p>
      <button id="dupOk" class="btn btn-pri btn-xl mt16" onclick="confirmarDuplicar(${i})">Crear e imprimir</button>`);
  }

  function confirmarDuplicar(i) {
    const e = rotulos[i];
    const n = Math.max(1, Math.min(50, Math.floor(Number($('dupN').value)) || 1));
    const datos = { codigo: e.codigo, tipo: e.tipo, recibo: e.recibo, vencimiento: e.vencimiento, responsable: ses.nombre, usuario: ses.nombre };
    if (e.tipo === 'PESO') Object.assign(datos, { numCavas: e.numCavas || e.cajas, pesoCava: e.pesoCava || 0, pesoEstiba: e.pesoEstiba || 0,
      pesoBascula: e.pesoBascula || (Number(e.total) + (Number(e.pesoEstiba) || 0) + (Number(e.pesoCava) || 0) * (Number(e.numCavas || e.cajas) || 0)) });
    else Object.assign(datos, { cajas: e.cajas, undXCaja: e.embalaje });
    const b = $('dupOk'); b.disabled = true;
    crearIguales(datos, n, b).then(creados => {
      cerrarModal(); pitido();
      if ($('rtLista')) $('rtLista').innerHTML = listaRotulos();
      if ($('tandaCaja')) $('tandaCaja').innerHTML = tandaHtml();
      imprimirRotulo(creados, 1, leerLS('rtTam') || 'carta');
      toast(`${creados.length} rótulo${creados.length === 1 ? '' : 's'} nuevo${creados.length === 1 ? '' : 's'}: ${creados.map(x => x.id).join(', ')}`, 'ok');
    }).catch(err => { errForm(err.message); b.disabled = false; b.textContent = 'Crear e imprimir'; });
  }

  // Al terminar: se marcan los que se van a imprimir
  function elegirImpresion() {
    abrirModal(`<div class="fila-sb"><span class="h2">¿Cuáles imprimo?</span>${btnCerrar()}</div>
      <div class="fila gap8 mt12 wrap-f"><button class="btn btn-sec" onclick="marcarTodos(true)">Marcar todos</button>
        <button class="btn btn-sec" onclick="marcarTodos(false)">Ninguno</button></div>
      <div class="lista-bp mt12">${tanda.map((e, i) => `<label class="estiba" style="cursor:pointer">
        <input type="checkbox" class="impSel" data-i="${i}" ${e.imprimir ? 'checked' : ''}>
        <span class="col gap4 flex1" style="min-width:0"><b>${esc(e.id)} · ${esc(e.producto)}</b>
          <span class="muted small">${e.cajas} cj · ${e.tipo === 'PESO' ? kg(e.total) : e.total + ' und'} · vence ${fCorta(e.vencimiento)}</span></span></label>`).join('')}</div>
      <div class="dos mt12">
        <div><label class="lbl" for="rtCopias">Copias de cada uno <span class="muted small">(mismo código)</span></label><input id="rtCopias" class="campo" type="number" inputmode="numeric" min="1" max="20" value="1"></div>
        <div><label class="lbl" for="rtTam">Tamaño del papel</label>
          <select id="rtTam" class="campo">
            <option value="carta" ${leerLS('rtTam') !== '10x15' ? 'selected' : ''}>Hoja carta (horizontal)</option>
            <option value="10x15" ${leerLS('rtTam') === '10x15' ? 'selected' : ''}>Etiqueta 15 × 10 cm</option>
          </select></div>
      </div>
      <p id="fErr" class="error" hidden></p>
      <button class="btn btn-pri btn-xl mt16" onclick="imprimirTanda()">Imprimir los marcados</button>`);
  }

  function marcarTodos(v) { document.querySelectorAll('.impSel').forEach(c => (c.checked = v)); }

  function imprimirTanda() {
    document.querySelectorAll('.impSel').forEach(c => (tanda[Number(c.dataset.i)].imprimir = c.checked));
    guardarTanda();
    const lista = tanda.filter(e => e.imprimir);
    if (!lista.length) return errForm('Marca al menos un rótulo.');
    const copias = Math.max(1, Math.min(20, Number($('rtCopias').value) || 1));
    const tam = $('rtTam').value;
    guardarLS('rtTam', tam);
    cerrarModal();
    imprimirRotulo(lista, copias, tam);
    abrirModal(`<div class="fila-sb"><span class="h2">Impresión enviada</span>${btnCerrar()}</div>
      <span class="mt12">Se mandaron ${lista.length} rótulo${lista.length === 1 ? '' : 's'} a imprimir.</span>
      <div class="dos mt16"><button class="btn btn-sec btn-xl" onclick="cerrarModal()">Seguir con esta tanda</button>
        <button class="btn btn-pri btn-xl" onclick="cerrarModal(); limpiarTanda()">Empezar otra tanda</button></div>`);
  }

  function reimprimir(i) { imprimirRotulo([rotulos[i]], 1, leerLS('rtTam') || 'carta'); }

  /* ----- Corregir o anular un rótulo hecho por error ----- */
  function editarRotulo(i) {
    const e = rotulos[i];
    if (!e || sinPermiso('rotular')) return;
    const peso = e.tipo === 'PESO', ub = e.estado === 'UBICADA';
    abrirModal(`<div class="fila-sb"><span class="h2">Corregir rótulo ${esc(e.id)}</span>${btnCerrar()}</div>
      ${ub ? `<div class="alerta-fefo mt8">Está ubicado en <b>${esc(cu(e.ubicacion))}</b>: si cambias la cantidad o el vencimiento, también se corrige en el plano.
        El producto no se puede cambiar; si era otro, sácalo del plano y crea un rótulo nuevo.</div>` : ''}
      <label class="lbl mt12" for="erProd">Producto</label>
      ${ub ? `<div class="info"><span class="fuerte">${esc(e.producto)}</span><span class="muted small">Atlantic ${esc(e.codigo)} · Nutresa ${esc(e.codigoNutresa || '—')}</span></div>`
        : campoConCamara(`<input id="erProd" class="campo" list="dlProductos" autocomplete="off" spellcheck="false" value="${esc(e.codigo + ' · ' + e.producto)}">`, 'erProd')}
      ${peso ? `<div class="dos mt12"><div><label class="lbl" for="erTot">Peso total (kg)</label><input id="erTot" class="campo" type="number" inputmode="decimal" min="0" step="any" value="${e.total}"></div>
          <div><label class="lbl" for="erCajas">Cavas</label><input id="erCajas" class="campo" type="number" inputmode="numeric" min="0" step="1" value="${e.cajas}"></div></div>`
        : `<div class="dos mt12"><div><label class="lbl" for="erCajas">Cajas</label><input id="erCajas" class="campo" type="number" inputmode="numeric" min="0" step="1" value="${e.cajas}"></div>
          <div><label class="lbl" for="erEmb">Unidades por caja</label><input id="erEmb" class="campo" type="number" inputmode="numeric" min="1" step="1" value="${e.embalaje}"></div></div>
          <span id="erTotTxt" class="muted small">Total: ${e.total} und</span>`}
      <div class="dos mt12"><div><label class="lbl" for="erRec">Fecha de recibo</label><input id="erRec" class="campo" type="date" value="${esc(e.recibo || '')}"></div>
        <div><label class="lbl" for="erVen">Vencimiento</label><input id="erVen" class="campo" type="date" value="${esc(e.vencimiento || '')}"></div></div>
      <label class="lbl mt12" for="erMot">¿Por qué se corrige?</label>
      <input id="erMot" class="campo" placeholder="Ej. Eran 8 cajas, no 10" autocomplete="off">
      <p id="fErr" class="error" hidden></p>
      <div class="dos mt16"><button class="btn btn-sec btn-xl" onclick="cerrarModal()">Cancelar</button>
        <button id="erOk" class="btn btn-pri btn-xl" onclick="guardarRotuloEditado(${i})">Guardar corrección</button></div>
      <div id="erCambios" class="mt12"></div>`);
    if (!peso) { const t = () => { $('erTotTxt').textContent = `Total: ${(Number($('erCajas').value) || 0) * (Number($('erEmb').value) || 0)} und`; };
      $('erCajas').addEventListener('input', t); $('erEmb').addEventListener('input', t);
      // Si se cambia a otro producto, se ponen sus unidades por caja
      if ($('erProd')) $('erProd').addEventListener('change', () => {
        const p = buscarProducto($('erProd').value.split(' · ')[0]) || buscarProducto($('erProd').value);
        if (p && p.id !== e.codigo && p.undPorCaja) { $('erEmb').value = p.undPorCaja; t(); }
      }); }
    llamar('bdCambiosEtiqueta', e.id).then(l => {
      if (!l.length || !$('erCambios')) return;
      $('erCambios').innerHTML = `<span class="h3">Cambios anteriores</span>${l.map(c => `<div class="small mt4">${fechaHora(c.fecha)} · ${esc(c.usuario || '—')} · ${c.accion === 'ANULADO' ? 'Anulado' : c.accion === 'TRASLADO' ? `Trasladado de ${esc((c.antes || {}).sede || '')} a ${esc((c.despues || {}).sede || '')}` : 'Corregido'}${c.motivo ? ': ' + esc(c.motivo) : ''}</div>`).join('')}`;
    }).catch(() => {});
  }

  function guardarRotuloEditado(i) {
    const e = rotulos[i], peso = e.tipo === 'PESO', ub = e.estado === 'UBICADA';
    const d = { etiquetaId: e.id, usuario: ses.nombre, motivo: $('erMot').value.trim(), recibo: $('erRec').value || null, vencimiento: $('erVen').value || null };
    if (!ub) {
      const p = buscarProducto($('erProd').value.split(' · ')[0]) || buscarProducto($('erProd').value);
      if (!p) return errForm('Escribe o escanea el producto correcto.');
      d.codigo = p.id;
    }
    const cajas = Number($('erCajas').value);
    if (!(cajas > 0) || Math.round(cajas) !== cajas) return errForm(peso ? 'Escribe cuántas cavas son.' : 'Escribe cuántas cajas son (número entero).');
    d.cajas = cajas;
    if (peso) { d.total = Number(String($('erTot').value).replace(',', '.')); if (!(d.total > 0)) return errForm('Escribe el peso total.'); }
    else { d.undXCaja = Number($('erEmb').value); if (!(d.undXCaja > 0)) return errForm('Escribe las unidades por caja.'); }
    const igual = (d.codigo || e.codigo) === e.codigo && cajas === e.cajas && (peso ? d.total === e.total : d.undXCaja === e.embalaje)
      && (d.recibo || '') === (e.recibo || '') && (d.vencimiento || '') === (e.vencimiento || '');
    if (igual) return errForm('No cambiaste nada.');
    if (!d.motivo) { $('erMot').focus(); return errForm('Escribe por qué se corrige.'); }
    const b = $('erOk'); b.disabled = true; b.textContent = 'Guardando…';
    llamar('bdEditarEtiqueta', d).then(n => {
      rotulos[i] = Object.assign({}, e, n);
      if ($('rtLista')) $('rtLista').innerHTML = listaRotulos();
      if (ub) llamar('bdSede', ses.sedeId).then(setSede).catch(() => {});
      window.rtCorregido = rotulos[i];
      abrirModal(`<div class="fila-sb"><span class="h2">Rótulo corregido</span>${btnCerrar()}</div>
        <span class="mt12">${esc(n.id)} quedó con los datos nuevos${ub ? ' (también en el plano)' : ''}. Imprímelo y cámbialo en la estiba: quedó en <b>sin imprimir</b> hasta que lo imprimas.</span>
        <div class="dos mt16"><button class="btn btn-sec btn-xl" onclick="cerrarModal()">Después</button>
          <button class="btn btn-pri btn-xl" onclick="cerrarModal(); imprimirRotulo([rtCorregido], 1, leerLS('rtTam') || 'carta')">Imprimir ahora</button></div>`);
    }).catch(err => { errForm(err.message); b.disabled = false; b.textContent = 'Guardar corrección'; });
  }

  function anularRotulo(i) {
    const e = rotulos[i];
    if (!e || sinPermiso('rotular')) return;
    abrirModal(`<div class="fila-sb"><span class="h2">¿Anular el rótulo ${esc(e.id)}?</span>${btnCerrar()}</div>
      <div class="info mt12"><span class="fuerte">${esc(e.producto)}</span>
        <span class="muted small">${e.tipo === 'PESO' ? kg(e.total) + ' · ' + e.cajas + ' cavas' : e.cajas + ' cj · ' + e.total + ' und'} · vence ${fCorta(e.vencimiento)}</span></div>
      <span class="small mt12">Queda en la tabla como <b>Anulado</b> y ya no se puede ubicar. Si lo imprimiste, bota el papel.</span>
      <label class="lbl mt12" for="arMot">¿Por qué? (opcional)</label>
      <input id="arMot" class="campo" placeholder="Ej. Se creó dos veces" autocomplete="off">
      <p id="fErr" class="error" hidden></p>
      <div class="dos mt16"><button class="btn btn-sec btn-xl" onclick="cerrarModal()">No</button>
        <button id="arOk" class="btn btn-sal btn-xl" onclick="confirmarAnularRotulo(${i})">Sí, anular</button></div>`);
  }
  function confirmarAnularRotulo(i) {
    const e = rotulos[i], b = $('arOk'); b.disabled = true;
    llamar('bdAnularEtiqueta', { etiquetaId: e.id, motivo: $('arMot').value.trim(), usuario: ses.nombre }).then(n => {
      rotulos[i] = Object.assign({}, e, n);
      rtSel.delete(e.id);
      if ($('rtLista')) $('rtLista').innerHTML = listaRotulos();
      cerrarModal(); toast(`Rótulo ${e.id} anulado`, 'ok');
    }).catch(err => { errForm(err.message); b.disabled = false; });
  }

  // Pasar un rótulo (todavía sin ubicar) a otra sede: desde ese momento sale allá y no aquí
  function trasladarRotulo(i) {
    const e = rotulos[i];
    if (!e || sinPermiso('rotular')) return;
    const otras = ini.sedes.filter(s => s.id !== ses.sedeId);
    abrirModal(`<div class="fila-sb"><span class="h2">Trasladar el rótulo ${esc(e.id)}</span>${btnCerrar()}</div>
      <div class="info mt12"><span class="fuerte">${esc(e.producto)}</span>
        <span class="muted small">${e.tipo === 'PESO' ? kg(e.total) + ' · ' + e.cajas + ' cavas' : e.cajas + ' cj · ' + e.total + ' und'} · vence ${fCorta(e.vencimiento)}</span></div>
      <label class="lbl mt12" for="trSede">¿A qué sede va?</label>
      <select id="trSede" class="campo">${otras.map(s => `<option value="${esc(s.id)}">${esc(s.nombre)}</option>`).join('')}</select>
      <label class="lbl mt12" for="trMot">¿Por qué? (opcional)</label>
      <input id="trMot" class="campo" placeholder="Ej. La mercancía se fue para esa bodega" autocomplete="off">
      <span class="small muted mt8">Desde ahora el rótulo sale en esa sede y allá lo ubican. Aquí deja de salir.</span>
      <p id="fErr" class="error" hidden></p>
      <div class="dos mt16"><button class="btn btn-sec btn-xl" onclick="cerrarModal()">Cancelar</button>
        <button id="trOk" class="btn btn-pri btn-xl" onclick="confirmarTrasladoRotulo(${i})">Trasladar</button></div>`);
  }
  function confirmarTrasladoRotulo(i) {
    const e = rotulos[i], b = $('trOk'), destino = $('trSede').value; b.disabled = true;
    llamar('bdTrasladarEtiqueta', { etiquetaId: e.id, sedeId: destino, motivo: $('trMot').value.trim(), usuario: ses.nombre }).then(() => {
      rotulos.splice(i, 1);
      rtSel.delete(e.id);
      if ($('rtLista')) $('rtLista').innerHTML = listaRotulos();
      cerrarModal(); toast(`Rótulo ${e.id} trasladado a ${nombreSede(destino)}`, 'ok');
    }).catch(err => { errForm(err.message); b.disabled = false; });
  }

  // Rótulo (opción 1): arriba el código a todo lo ancho con su código de barras centrado; el vencimiento más grande que el recibo;
  // abajo, pequeños y a la misma altura, el código Nutresa y el responsable
  function rotuloHtml(e) {
    const peso = e.tipo === 'PESO';
    return `<div class="rotulo">
      <div class="rt2-cab"><span class="rt2-emp">${esc(ini.empresa || '')}</span>
        <div class="rt2-num">${esc(e.codigo)}</div><svg class="rt2-cb" data-cb="${esc(e.id)}"></svg></div>
      <div class="rt2-nombre">${esc(e.producto)}</div>
      <div class="rt2-fila rt2-3">
        <div class="rt2-celda"><span class="rt2-tit">CAJAS</span><span class="rt2-cant">${e.cajas}</span></div>
        <div class="rt2-celda"><span class="rt2-tit">EMBALAJE</span><span class="rt2-cant">${peso ? +Number(e.pesoCava || e.embalaje).toFixed(2) : e.embalaje}</span></div>
        <div class="rt2-celda"><span class="rt2-tit">TOTAL</span><span class="rt2-cant">${peso ? +Number(e.total).toFixed(2) : e.total}</span></div>
      </div>
      <div class="rt2-fila rt2-fechas">
        <div class="rt2-celda"><span class="rt2-tit rt2-tit-g">FECHA DE VENCIMIENTO</span><span class="rt2-venc">${fCorta(e.vencimiento)}</span></div>
        <div class="rt2-celda"><span class="rt2-tit">FECHA DE RECIBO</span><span class="rt2-rec">${fCorta(e.recibo)}</span></div>
      </div>
      <div class="rt2-fila rt2-pie">
        <div class="rt2-celda rt2-linea"><span class="rt2-tit">CÓDIGO NUTRESA</span><span class="rt2-peq">${esc(e.codigoNutresa || '')}</span></div>
        <div class="rt2-celda rt2-linea"><span class="rt2-tit">RESPONSABLE</span><span class="rt2-peq">${esc(e.responsable)}</span></div>
      </div>
    </div>`;
  }

  // Imprime uno o varios rótulos (cada uno con sus copias)
  function imprimirRotulo(lista, copias, tam) {
    lista = Array.isArray(lista) ? lista : [lista];
    const pr = $('print');
    pr.className = 'modo-rotulo ' + (tam === '10x15' ? 'rt-10x15' : 'rt-carta');
    pr.innerHTML = lista.map(e => Array.from({ length: copias }, () => rotuloHtml(e)).join('')).join('');
    let st = $('pagina');
    if (!st) { st = document.createElement('style'); st.id = 'pagina'; document.head.appendChild(st); }
    // Siempre horizontal: el rótulo llena la hoja
    st.textContent = tam === '10x15' ? '@page { size: 150mm 100mm; margin: 3mm; }' : '@page { size: letter landscape; margin: 8mm; }';
    if (window.JsBarcode) {
      pr.querySelectorAll('svg[data-cb]').forEach(el => {
        try { JsBarcode(el, el.dataset.cb, { format: 'CODE128', height: 44, width: 4, margin: 6, displayValue: true, font: 'Arial', fontOptions: 'bold', fontSize: 16, textMargin: 3, background: '#FFFFFF', lineColor: '#000000' }); } catch (x) {}
      });
    }
    setTimeout(() => window.print(), 150);
    registrarImpresion(lista);
  }

  // Suma una impresión a cada rótulo (cuántas veces, quién y cuándo)
  function registrarImpresion(lista) {
    const ids = [...new Set(lista.map(e => e && e.id).filter(Boolean))];
    if (!ids.length || !ses) return;
    llamar('bdRegistrarImpresion', { ids, usuario: ses.nombre }).then(() => {
      const ahora = new Date().toISOString();
      // Cada objeto una sola vez (la misma fila puede estar en varias listas)
      new Set([...(rotulos || []), ...(tanda || []), ...(sinImp || [])]).forEach(e => {
        if (ids.includes(e.id)) { e.vecesImpreso = (e.vecesImpreso || 0) + 1; e.ultimoImpresor = ses.nombre; e.ultimaImpresion = ahora; }
      });
      if ($('rtLista') && rotulos) $('rtLista').innerHTML = listaRotulos();
    }).catch(() => { /* sin señal: no se cuenta esta impresión */ });
  }

  // Al imprimir etiquetas de ubicaciones se vuelve al modo normal
  function modoEtiquetas() {
    $('print').className = '';
    const st = $('pagina');
    if (st) st.textContent = '';
  }

  /* ----- Mover de lugar (también entre sedes) ----- */
  let moviendo = null; // { origenId, productoId, lote, nombre, cantidad, unidad, undPorCaja, sedeOrigen }

  function abrirMover(i) {
    if (sinPermiso('mover')) return;
    const l = sede.lineas[i];
    const e = sede.espPorId[l.ubicacionId];
    const und = leerLS('unidad') || 'CAJA';
    abrirModal(`
      <div class="fila-sb"><span class="h2">Mover de lugar · ${esc(etiqueta(e))}</span>${btnCerrar()}</div>
      <div class="info"><span class="fuerte">${esc(l.nombre)}</span>
        <span class="muted small">Lote ${esc(l.lote || '—')} · Vence ${fFecha(l.vencimiento)} · Hay ${cant(l)}</span></div>
      <div class="dos">
        <div><label class="lbl" for="mvCant">Cantidad a mover</label>
          <input id="mvCant" class="campo" type="number" inputmode="decimal" min="0" step="any"
            value="${und === 'UND' ? l.unidades : +(l.unidades / l.undPorCaja).toFixed(2)}"></div>
        <div><label class="lbl" for="mvUnd">Unidad</label>
          <select id="mvUnd" class="campo">${[['CAJA', 'Cajas'], ['UND', 'Unidades']]
            .map(([v, t]) => `<option value="${v}" ${v === und ? 'selected' : ''}>${t}</option>`).join('')}</select></div>
      </div>
      <span class="muted small" style="margin-top:8px">Por defecto se mueve todo. Después escaneas o tocas la nueva posición y eliges el espacio.</span>
      <p id="fErr" class="error" hidden></p>
      <div class="dos mt16">
        <button class="btn btn-sec btn-xl" onclick="cerrarModal()">Cancelar</button>
        <button class="btn btn-pri btn-xl" onclick="empezarMover(${i})">Elegir destino</button>
      </div>`);
    $('mvUnd').addEventListener('change', () => {
      $('mvCant').value = $('mvUnd').value === 'UND' ? l.unidades : +(l.unidades / l.undPorCaja).toFixed(2);
    });
  }

  function empezarMover(i) {
    const l = sede.lineas[i];
    const cantidad = Number($('mvCant').value);
    const unidad = $('mvUnd').value;
    if (!(cantidad > 0)) return errForm('Escribe una cantidad mayor que 0.');
    if (cantidad * (unidad === 'CAJA' ? l.undPorCaja : 1) > l.unidades) return errForm(`Solo hay ${cant(l)}.`);
    moviendo = { origenId: l.ubicacionId, productoId: l.productoId, lote: l.lote, nombre: l.nombre,
      cantidad, unidad, sedeOrigen: ses.sedeId };
    ubicando = null;
    cerrarModal();
    // Se queda en la misma posición: el destino casi siempre está arriba, al lado o en la posición vecina
    espSel = null;
    vista = 'mapa';
    pintarApp();
    toast('Toca el espacio de destino aquí mismo, usa las flechas para ir a la posición del lado, o escanea otro lugar.', 'ok');
    setTimeout(() => { const f = document.querySelector('.frente') || document.querySelector('.pos-nav'); if (f) f.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, 60);
  }

  // Posición anterior / siguiente de la misma fila (para mover al lado sin salir de la vista)
  function posVecina(paso) {
    if (!posSel) return;
    const r = sede.rackPorId[posSel.rackId];
    let p = posSel.posicion + paso;
    while (p >= 1 && p <= r.posiciones && r.omitidas.includes(p)) p += paso;
    if (p < 1 || p > r.posiciones) return toast(paso < 0 ? 'Es la primera posición de la fila' : 'Es la última posición de la fila', 'error');
    abrirPos(r.id, p);
  }

  function avisoMoviendo() {
    if (!moviendo) return '';
    const m = moviendo;
    return `<div class="colocar-aviso" style="margin-top:0;margin-bottom:10px;flex-wrap:wrap">
      <span>Moviendo ${m.cantidad} ${m.unidad === 'CAJA' ? 'cj' : 'und'} de ${esc(m.nombre)} · desde ${esc(m.origenId)}<br>
      <small style="font-weight:400">Toca el espacio de destino aquí, usa ‹ › para la posición del lado, o escanea otro lugar.</small></span>
      <span class="fila gap8">
        ${ini.sedes.length > 1 ? `<label class="oculto" for="mvSede">Sede de destino</label>
          <select id="mvSede" class="campo" style="height:44px;width:auto" onchange="verSede(this.value)">${ini.sedes.map(s =>
          `<option value="${esc(s.id)}" ${s.id === ses.sedeId ? 'selected' : ''}>${esc(s.nombre)}</option>`).join('')}</select>` : ''}
        <button class="btn btn-sec" onclick="moviendo=null; pintarApp()">Cancelar</button>
      </span></div>`;
  }

  function moverAqui(boton) {
    const m = moviendo;
    const esp = sede.espPorId[espSel];
    if (espacioLleno(esp.id, m)) return;
    boton.disabled = true; boton.textContent = 'Moviendo…';
    llamar('bdMover', { sedeId: ses.sedeId, origenId: m.origenId, destinoId: esp.id, productoId: m.productoId,
      lote: m.lote, cantidad: m.cantidad, unidad: m.unidad, usuario: ses.nombre })
      .then(d => {
        setSede(d);
        moviendo = null;
        cerrarModal();
        pitido();
        toast(`Movido a ${cu(esp.id)}`, 'ok');
        abrirPos(esp.rackId, esp.posicion, esp.id);
      })
      .catch(err => { if (!$('modal').hidden && $('fErr')) errForm(err.message); else toast(err.message, 'error'); boton.disabled = false; boton.textContent = 'Intentar de nuevo'; });
  }

  /* ----- Ubicar un identificador escaneado ----- */
  function empezarUbicar(e) {
    if (sinPermiso('ubicar')) return;
    if (e.estado === 'ANULADA') return toast(`El rótulo ${e.id} fue anulado. No se puede ubicar.`, 'error');
    if (e.estado === 'SALIDA') return toast(`El rótulo ${e.id} ya salió de la bodega y no se puede volver a usar. Crea uno nuevo.`, 'error');
    if (e.estado === 'UBICADA') return toast(`${e.id} ya está ubicado en ${cu(e.ubicacion)}`, 'error');
    pitido();
    ubicando = e;
    moviendo = null;
    // Lugar primero, rótulo después: el espacio que estaba elegido es el destino
    if (vista === 'mapa' && posSel && espSel && sede.espPorId[espSel]) {
      if (!sinCupo(espSel, { productoId: e.codigo, lote: e.id })) { pintarApp(); return pedirConfirmUbicar(e, espSel); }
      toast(`${cu(espSel)} ya tiene ${maxEsp()} productos (el máximo). Escanea o toca otro lugar.`, 'error');
    }
    cerrarModal();
    vista = 'mapa';
    espSel = null;
    pintarApp();
    if (!posSel) toast('Ahora escanea o elige el lugar', 'ok');
    else toast('Ahora toca el nivel y el lado, o escanea el lugar', 'ok');
  }

  const rotuloNoUsable = e => e.estado === 'ANULADA' ? `El rótulo ${e.id} fue anulado. No se puede ubicar.`
    : e.estado === 'SALIDA' ? `El rótulo ${e.id} ya salió de la bodega y no se puede volver a usar. Crea uno nuevo.`
    : e.estado === 'UBICADA' ? `${e.id} ya está ubicado en ${cu(e.ubicacion)}` : '';

  // Ventana de confirmación: rótulo → lugar, con el botón grande a la vista
  function pedirConfirmUbicar(e, espId) {
    const esp = sede.espPorId[espId];
    if (!esp) return;
    const r = sede.rackPorId[esp.rackId];
    const lleno = sinCupo(espId, { productoId: e.codigo, lote: e.id });
    const yaHay = lineasDe(espId);
    abrirModal(`<div class="fila-sb"><span class="h2">Confirmar ubicación</span>${btnCerrar()}</div>
      <div class="conf-ub mt12">
        <div class="conf-q"><span class="muted small">Rótulo</span><b class="mono-c">${esc(e.id)}</b>
          <span class="fuerte">${esc(e.producto)}</span>
          <span class="muted small">${e.tipo === 'PESO' ? kg(e.total) + ' · ' + e.cajas + ' cavas' : e.cajas + ' cj · ' + e.total + ' und'} · vence ${fCorta(e.vencimiento)}</span></div>
        <div class="conf-flecha" aria-hidden="true">↓</div>
        <div class="conf-q"><span class="muted small">Lugar</span><b>${esc(etiqueta(esp))}</b>
          <span class="fuerte">${esc(r ? r.nombre : '')} · Posición ${esp.posicion}</span>
          <span class="muted small mono-c">${esc(esp.id)}</span></div>
      </div>
      ${lleno ? `<p class="error">Este espacio ya tiene ${yaHay.length} productos (${esc(yaHay.map(l => l.nombre).join(', '))}) y el máximo es ${maxEsp()}. Elige otro.</p>`
        : yaHay.length ? `<p class="muted small">En este espacio ya está: ${esc(yaHay.map(l => l.nombre).join(', '))}. Quedará junto (${yaHay.length + 1} de ${maxEsp()}).</p>` : ''}
      ${eanMiniHtml(e.codigo, 'plano')}
      <p id="fErr" class="error" hidden></p>
      <div class="dos mt16">
        <button class="btn btn-sec btn-xl" onclick="otroLugar()">Otro lugar</button>
        <button id="cuOk" class="btn btn-ent-solido btn-xl" onclick="confirmarUbicar('${esc(espId)}', this)" ${lleno ? 'disabled' : ''}>Confirmar</button>
      </div>`);
    verBoton('cuOk');
  }

  function otroLugar() {
    cerrarModal();
    espSel = null;
    pintarApp();
    toast('Escanea o toca el otro lugar', 'ok');
  }

  function confirmarUbicar(espId, boton) {
    const e = ubicando;
    const esp = sede.espPorId[espId];
    if (!e || !esp) return cerrarModal();
    boton.disabled = true; boton.textContent = 'Guardando…';
    llamar('bdUbicarEtiqueta', { sedeId: ses.sedeId, etiquetaId: e.id, ubicacionId: esp.id, usuario: ses.nombre })
      .then(d => {
        setSede(d);
        ubicando = null;
        if (rotulos) { const r = rotulos.find(x => x.id === e.id); if (r) { r.estado = 'UBICADA'; r.ubicacion = esp.id; } }
        cerrarModal();
        pitido();
        toast(`${e.tipo === 'PESO' ? kg(e.total) : e.cajas + ' cajas'} de ${e.producto} en ${etiqueta(esp)}`, 'ok');
        abrirPos(esp.rackId, esp.posicion, esp.id);
      })
      .catch(err => { errForm(err.message); boton.disabled = false; boton.textContent = 'Intentar de nuevo'; });
  }

  // Lo mismo para mover: lo que se mueve → a dónde
  function pedirConfirmMover(espId) {
    const m = moviendo, esp = sede.espPorId[espId];
    if (!m || !esp) return;
    const r = sede.rackPorId[esp.rackId];
    const lleno = sinCupo(espId, m);
    abrirModal(`<div class="fila-sb"><span class="h2">Confirmar traslado</span>${btnCerrar()}</div>
      <div class="conf-ub mt12">
        <div class="conf-q"><span class="muted small">Sale de</span><b class="mono-c">${esc(m.origenId)}</b>
          <span class="fuerte">${esc(m.nombre)}</span><span class="muted small">${m.cantidad} ${m.unidad === 'CAJA' ? 'cj' : 'und'} · lote ${esc(m.lote || '—')}</span></div>
        <div class="conf-flecha" aria-hidden="true">↓</div>
        <div class="conf-q"><span class="muted small">Va a</span><b>${esc(etiqueta(esp))}</b>
          <span class="fuerte">${esc(r ? r.nombre : '')} · Posición ${esp.posicion}</span><span class="muted small mono-c">${esc(esp.id)}</span></div>
      </div>
      ${lleno ? `<p class="error">Este espacio ya tiene ${maxEsp()} productos (el máximo). Elige otro.</p>` : ''}
      <p id="fErr" class="error" hidden></p>
      <div class="dos mt16">
        <button class="btn btn-sec btn-xl" onclick="otroLugar()">Otro lugar</button>
        <button id="cmOk" class="btn btn-pri btn-xl" onclick="espSel='${esc(espId)}'; moverAqui(this)" ${lleno ? 'disabled' : ''}>Confirmar</button>
      </div>`);
    verBoton('cmOk');
  }

  /* ----- Poner un rótulo en el espacio elegido (el producto entra solo con su rótulo) ----- */
  let prLista = null;

  function abrirPonerRotulo() {
    if (sinPermiso('ubicar')) return;
    const esp = sede.espPorId[espSel];
    if (!esp) return toast('Toca primero el espacio (por ejemplo 2A)', 'error');
    if (espacioLleno(esp.id)) return;
    prLista = null;
    abrirModal(`<div class="fila-sb"><span class="h2">Poner en ${esc(etiqueta(esp))}</span>${btnCerrar()}</div>
      <span class="muted small mono-c">${esc(esp.id)}</span>
      <label class="lbl mt12" for="prQ">Escanea el rótulo (o escribe su número o el producto)</label>
      ${campoConCamara('<input id="prQ" class="campo" autocomplete="off" spellcheck="false" autocapitalize="characters" placeholder="E000123 o código del producto">', 'prQ')}
      <p id="fErr" class="error" hidden></p>
      <span class="lbl mt12">Rótulos que todavía no están en ningún lugar</span>
      <div id="prLista" class="lista-bp"><div class="cargando">Cargando…</div></div>
      <div class="mt16"><button class="btn btn-sec btn-xl" style="width:100%" onclick="irARotular()">¿No tiene rótulo? Crear uno nuevo</button></div>`);
    const q = $('prQ');
    q.addEventListener('input', pintarPrLista);
    q.addEventListener('keydown', ev => { if (ev.key === 'Enter') { ev.preventDefault(); elegirPrTexto(q.value); } });
    if (!('ontouchstart' in window)) q.focus();
    llamar('bdEtiquetasPorUbicar', ses.sedeId).then(l => { prLista = l; pintarPrLista(); })
      .catch(e => { prLista = []; if ($('prLista')) $('prLista').innerHTML = `<p class="error">${esc(e.message)}</p>`; });
  }

  function filtroPr(texto) {
    const t = String(texto || '').trim();
    if (!t) return prLista;
    const p = buscarProducto(t);
    if (p) return prLista.filter(e => e.codigo === p.id);
    const T = sinTilde(t), pal = T.split(/\s+/).filter(Boolean);
    return prLista.filter(e => { const x = sinTilde(`${e.id} ${e.codigo} ${e.codigoNutresa} ${e.producto}`); return pal.every(w => x.includes(w)); });
  }

  function pintarPrLista() {
    const caja = $('prLista');
    if (!caja || prLista === null) return;
    const l = filtroPr($('prQ') ? $('prQ').value : '');
    caja.innerHTML = l.length ? l.slice(0, 60).map(e => `<button class="bp-item" onclick="elegirRotuloPr('${esc(e.id)}')">
        <span class="chip">${esc(e.id)}</span>
        <span class="col flex1 gap4" style="min-width:0"><span class="nombre">${esc(e.producto)}</span>
          <span class="muted small">${esc(e.codigo)} · ${e.tipo === 'PESO' ? kg(e.total) : e.cajas + ' cj'} · vence ${fCorta(e.vencimiento)}</span></span>
      </button>`).join('')
      : `<p class="muted">${prLista.length ? 'No hay rótulos sin ubicar de ese producto.' : 'No hay rótulos sin ubicar.'} Crea uno con el botón de abajo.</p>`;
  }

  function elegirRotuloPr(id) {
    const e = (prLista || []).find(x => x.id === id);
    if (!e) return;
    ubicando = e; moviendo = null;
    pedirConfirmUbicar(e, espSel);
  }

  // Lo escaneado o escrito: número de rótulo, o un producto con un solo rótulo sin ubicar
  function elegirPrTexto(txt) {
    const v = String(txt || '').trim().toUpperCase();
    if (!v) return;
    if (/^E\d{4,}$/.test(v)) {
      const e = (prLista || []).find(x => x.id === v);
      if (e) return elegirRotuloPr(e.id);
      return llamar('bdEtiqueta', v, ses.sedeId).then(x => {
        const m = rotuloNoUsable(x);
        if (m) return errForm(m);
        ubicando = x; moviendo = null; pedirConfirmUbicar(x, espSel);
      }).catch(err => errForm(err.message));
    }
    if (prLista === null) return errForm('Espera un momento, se están cargando los rótulos.');
    const l = filtroPr(v);
    if (l.length === 1) return elegirRotuloPr(l[0].id);
    pintarPrLista();
    if (!l.length) return errForm(buscarProducto(v) ? 'Ese producto no tiene rótulos sin ubicar. Crea uno nuevo.' : 'No se encontró ese rótulo ni producto.');
    $('fErr').hidden = true;
    toast(`Hay ${l.length} rótulos de ese producto. Toca el que vas a poner.`, 'ok');
  }

  /* ----- Cargar el aéreo con un Excel (para las regionales que no alcanzan a ubicar estiba por estiba) -----
     El Excel trae el código de la ubicación (ej. 2000-01-02-01), el producto y la cantidad. Cada fila queda como
     un rótulo ubicado. Se escoge si solo se llenan los espacios vacíos o si se reemplaza lo que hay en esos espacios,
     y se confirma dos veces. El picking (nivel 0) no se carga aquí: se cuenta en Ingresar. */
  const puedeCargarAereo = () => puede('cargar_aereo');
  let ca = null;   // { archivo, filas: [{ fila, ubic, espacioId, codigo, cantidad, undXCaja, vencimiento, lote, error }], modo, paso, sim }
  function abrirCargaAereo() {
    if (!puedeCargarAereo()) return toast('No tienes permiso para cargar el aéreo', 'error');
    if (!sede) return toast('Abre primero la sede', 'error');
    ca = { paso: 'archivo', modo: 'VACIOS' };
    abrirModal(`<div class="fila-sb"><span class="h2">Cargar aéreo con Excel</span>${btnCerrar()}</div>
      <span class="muted small mt8">Para registrar de una vez lo que hay en el aéreo de <b>${esc(nombreSede(ses.sedeId))}</b>. Llena la plantilla:
        una fila por estiba con el <b>código de la ubicación</b> (ej. 2000-01-02-01), el <b>código del producto</b> y la <b>cantidad</b>.
        Vencimiento, lote y unidades por caja son opcionales. El picking no va aquí: se cuenta en Ingresar.</span>
      <div class="fila gap8 wrap-f mt12"><button class="btn btn-sec" onclick="descargarPlantillaAereo()">Descargar plantilla</button>
        <label for="caArch" class="btn btn-pri" role="button" tabindex="0">Escoger Excel</label></div>
      <input id="caArch" type="file" accept=".xlsx,.xls,.csv" class="oculto">
      <div id="caCaja" class="mt12"></div>
      <p id="fErr" class="error" hidden></p>`, 'modal-ancho');
    $('caArch').addEventListener('change', ev => { const f = ev.target.files[0]; if (f) leerAereo(f); });
  }
  function descargarPlantillaAereo() {
    if (!window.XLSX) return toast('No se pudo abrir el lector de Excel (revisa la señal).', 'error');
    const wb = XLSX.utils.book_new();
    const h = XLSX.utils.aoa_to_sheet([['UBICACION', 'CODIGO PRODUCTO', 'CANTIDAD', 'UND POR CAJA', 'VENCIMIENTO', 'LOTE']]);
    h['!cols'] = [{ wch: 16 }, { wch: 18 }, { wch: 12 }, { wch: 14 }, { wch: 14 }, { wch: 14 }];
    XLSX.utils.book_append_sheet(wb, h, 'AEREO');
    const ins = XLSX.utils.aoa_to_sheet([
      ['Cómo llenar la hoja AEREO'],
      ['UBICACION', 'Obligatorio. El código de la ubicación del plano, como sale en el rótulo de la estantería (ej. 2000-01-02-01).'],
      ['CODIGO PRODUCTO', 'Obligatorio. El código Atlantic del producto (también sirve el código Nutresa o el EAN).'],
      ['CANTIDAD', 'Obligatorio. La cantidad total de la estiba: unidades, o kilos si el producto es de peso variable.'],
      ['UND POR CAJA', 'Opcional. Si no se llena, se usan las del producto.'],
      ['VENCIMIENTO', 'Opcional. Fecha de vencimiento (día/mes/año).'],
      ['LOTE', 'Opcional. El lote del producto.'],
      [''],
      ['Una fila por estiba. Si en un mismo espacio hay dos productos, van en dos filas con la misma ubicación.'],
      ['El picking (nivel 01 en el código nuevo) no se carga aquí: se cuenta en Ingresar.']]);
    ins['!cols'] = [{ wch: 18 }, { wch: 100 }];
    XLSX.utils.book_append_sheet(wb, ins, 'INSTRUCCIONES');
    XLSX.writeFile(wb, 'Plantilla cargar aereo.xlsx');
  }
  // Fecha del Excel → 'aaaa-mm-dd' (número de Excel, dd/mm/aaaa o aaaa-mm-dd)
  function fechaExcel(v) {
    if (v === '' || v === null || v === undefined) return '';
    if (typeof v === 'number' && v > 20000 && v < 80000) { const d = new Date(Math.round((v - 25569) * 86400000)); return d.toISOString().slice(0, 10); }
    const t = String(v).trim();
    let m = t.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
    if (m) return `${m[1]}-${pad2(m[2])}-${pad2(m[3])}`;
    m = t.match(/^(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{2,4})$/);
    if (m) return `${m[3].length === 2 ? '20' + m[3] : m[3]}-${pad2(m[2])}-${pad2(m[1])}`;
    return null;
  }
  function leerAereo(f) {
    $('caCaja').innerHTML = '<div class="cargando">Leyendo…</div>';
    const lec = new FileReader();
    lec.onload = () => {
      try {
        const wb = XLSX.read(new Uint8Array(lec.result), { type: 'array' });
        const hoja = wb.Sheets[wb.SheetNames.find(n => /AEREO/i.test(n)) || wb.SheetNames[0]];
        const filas = XLSX.utils.sheet_to_json(hoja, { header: 1, raw: true, defval: '' }).filter(x => x.some(c => String(c).trim() !== ''));
        const cab = Math.max(0, filas.findIndex(x => x.some(c => /UBICA/i.test(sinTilde(c)))));
        const tit = filas[cab].map(c => sinTilde(c));
        const col = re => tit.findIndex(t => re.test(t));
        const cU = col(/UBICA/), cP = col(/PRODUCTO|MATERIAL|COD.*AT/), cC = col(/CANTIDAD|TOTAL/), cX = col(/POR CAJA|UND.*CAJA/), cV = col(/VENC/), cL = col(/LOTE/);
        if (cU < 0 || cP < 0 || cC < 0) throw new Error('No encontré las columnas UBICACION, CODIGO PRODUCTO y CANTIDAD. Usa la plantilla.');
        // Código de ubicación → espacio de esta sede (sirve el código nuevo o el interno)
        const porCod = {};
        sede.espacios.forEach(e => { porCod[sinTilde(e.id)] = e; const c = cuNuevo(e.id); if (c) porCod[sinTilde(c)] = e; });
        const l = filas.slice(cab + 1).map((x, i) => {
          const r = { fila: cab + i + 2, ubic: String(x[cU] ?? '').trim(), codigo: String(x[cP] ?? '').trim().replace(/\.0+$/, ''), cantidad: numSap(x[cC]),
            undXCaja: cX >= 0 && String(x[cX]).trim() !== '' ? numSap(x[cX]) : null, vencimiento: cV >= 0 ? fechaExcel(x[cV]) : '', lote: cL >= 0 ? String(x[cL] ?? '').trim() : '' };
          const e = porCod[sinTilde(r.ubic)], p = buscarProducto(r.codigo);
          if (!r.ubic) r.error = 'Falta la ubicación';
          else if (!e) r.error = `La ubicación ${r.ubic} no existe en ${nombreSede(ses.sedeId)}`;
          else if (e.nivel === 0) r.error = 'Es picking: el picking se cuenta en Ingresar';
          else if (!p) r.error = `El producto ${r.codigo || '(vacío)'} no está en el catálogo`;
          else if (!(r.cantidad > 0)) r.error = 'Falta la cantidad';
          else if (r.vencimiento === null) r.error = 'La fecha de vencimiento no se entiende (usa día/mes/año)';
          if (e) r.espacioId = e.id;
          if (p) { r.codigo = p.id; r.nombre = p.nombre; }
          return r;
        });
        ca = Object.assign(ca, { archivo: f.name, filas: l, paso: 'revisar', sim: null });
        simularAereo();
      } catch (e) { $('caCaja').innerHTML = `<p class="error">${esc(e.message)}</p>`; }
    };
    lec.readAsArrayBuffer(f);
  }
  const caBuenas = () => ca.filas.filter(r => !r.error);
  const caEnviar = r => ({ fila: r.fila, espacioId: r.espacioId, codigo: r.codigo, cantidad: r.cantidad, undXCaja: r.undXCaja, vencimiento: r.vencimiento || '', lote: r.lote });
  // Lo que haría con cada forma (sin guardar nada)
  function simularAereo() {
    $('caCaja').innerHTML = '<div class="cargando">Revisando los espacios…</div>';
    const pedir = modo => llamar('bdCargarAereo', { token: ses.token, sedeId: ses.sedeId, modo, simular: true, usuario: ses.nombre, filas: caBuenas().map(caEnviar) });
    Promise.all([pedir('VACIOS'), pedir('REEMPLAZAR')])
      .then(([v, r]) => { ca.sim = { VACIOS: v, REEMPLAZAR: r }; pintarCargaAereo(); })
      .catch(e => { $('caCaja').innerHTML = `<p class="error">${esc(e.message)}</p>`; });
  }
  function pintarCargaAereo() {
    const malas = ca.filas.filter(r => r.error), sv = ca.sim.VACIOS, sr = ca.sim.REEMPLAZAR;
    const errSrv = sv.errores || [];
    const listaErr = malas.map(r => `Fila ${r.fila}: ${esc(r.error)}`).concat(errSrv.map(x => `Fila ${esc(x.fila)}: ${esc(x.error)}`));
    if (ca.paso === 'confirmar') {
      const s = ca.sim[ca.modo];
      $('caCaja').innerHTML = `<div class="alerta-fefo"><b>${ca.modo === 'REEMPLAZAR' ? '¿Seguro que quieres reemplazar?' : '¿Cargar el aéreo?'}</b>
          <ul class="mt8">
            <li>Se van a cargar <b>${s.validas}</b> estiba${s.validas === 1 ? '' : 's'} en ${esc(nombreSede(ses.sedeId))}.</li>
            ${ca.modo === 'REEMPLAZAR' ? `<li>En <b>${s.ocupados}</b> espacio${s.ocupados === 1 ? '' : 's'} que ya tienen producto se quita${s.reemplazar === 1 ? '' : 'n'} <b>${s.reemplazar}</b> estiba${s.reemplazar === 1 ? '' : 's'} y queda lo del Excel. Queda en el historial como ajuste.</li>`
              : sv.saltadas.length ? `<li>Las <b>${sv.saltadas.length}</b> fila${sv.saltadas.length === 1 ? '' : 's'} que caen en espacios que ya tienen producto no se cargan.</li>` : ''}
          </ul>
          <span class="small">Cada estiba queda como un rótulo ubicado (aparece en «Rótulos sin imprimir»).</span></div>
        <div class="dos mt12"><button class="btn btn-sec btn-xl" onclick="ca.paso='revisar'; pintarCargaAereo()">Volver</button>
          <button id="caOk" class="btn ${ca.modo === 'REEMPLAZAR' ? 'btn-sal' : 'btn-pri'} btn-xl" onclick="guardarCargaAereo(this)">${ca.modo === 'REEMPLAZAR' ? 'Sí, reemplazar y cargar' : 'Sí, cargar'}</button></div>`;
      return;
    }
    $('caCaja').innerHTML = `<span class="muted small">Archivo: <b>${esc(ca.archivo)}</b> · ${ca.filas.length} filas</span>
      <div class="inv-res mt8">
        <div><span class="muted small">Filas listas</span><b class="txt-verde">${sr.validas}</b></div>
        <div><span class="muted small">Caen en espacios vacíos</span><b>${sv.validas}</b></div>
        <div><span class="muted small">Caen en espacios con producto</span><b class="${sr.ocupados ? 'txt-naranja' : ''}">${sr.validas - sv.validas}</b></div>
        <div><span class="muted small">Con error</span><b class="${listaErr.length ? 'txt-rojo' : ''}">${listaErr.length}</b></div></div>
      ${listaErr.length ? `<details class="mt8" ${listaErr.length <= 8 ? 'open' : ''}><summary class="small">Filas con error (no se cargan)</summary><div class="alerta-fefo small mt8">${listaErr.slice(0, 60).join('<br>')}${listaErr.length > 60 ? '<br>…' : ''}</div></details>` : ''}
      ${sr.validas && !sr.ocupados ? `<button class="btn btn-pri btn-xl mt12" onclick="ca.modo='VACIOS'; ca.paso='confirmar'; pintarCargaAereo()">Continuar</button>` : sr.validas ? `<span class="lbl mt12">¿Qué hago con los espacios que ya tienen producto?</span>
      <label class="perm-fila"><span class="col gap4"><b>Solo llenar los espacios vacíos</b><span class="muted small">Lo que ya está en el plano no se toca. Las filas que caen en espacios con producto no se cargan.</span></span>
        <input type="radio" name="caModo" ${ca.modo === 'VACIOS' ? 'checked' : ''} onchange="ca.modo='VACIOS'"></label>
      <label class="perm-fila"><span class="col gap4"><b>Reemplazar lo que hay en esos espacios</b><span class="muted small">En los ${sr.ocupados} espacios del Excel que ya tienen producto se quita lo que hay (${sr.reemplazar} estiba${sr.reemplazar === 1 ? '' : 's'}) y queda lo del Excel.</span></span>
        <input type="radio" name="caModo" ${ca.modo === 'REEMPLAZAR' ? 'checked' : ''} onchange="ca.modo='REEMPLAZAR'"></label>
      <button class="btn btn-pri btn-xl mt12" onclick="ca.paso='confirmar'; pintarCargaAereo()">Continuar</button>` : '<p class="muted mt12">No hay filas para cargar.</p>'}`;
  }
  function guardarCargaAereo(b) {
    b.disabled = true; b.textContent = 'Cargando…';
    llamar('bdCargarAereo', { token: ses.token, sedeId: ses.sedeId, modo: ca.modo, simular: false, usuario: ses.nombre, filas: caBuenas().map(caEnviar) })
      .then(r => {
        const errs = (r.errores || []).concat(r.saltadas || []);
        $('caCaja').innerHTML = `<div class="inv-res"><div><span class="muted small">Cargadas</span><b class="txt-verde">${r.cargadas}</b></div>
            ${ca.modo === 'REEMPLAZAR' ? `<div><span class="muted small">Estibas reemplazadas</span><b>${r.reemplazados}</b></div>` : ''}
            <div><span class="muted small">No se cargaron</span><b class="${errs.length ? 'txt-rojo' : ''}">${errs.length}</b></div></div>
          ${errs.length ? `<div class="alerta-fefo small mt8">${errs.slice(0, 60).map(x => `Fila ${esc(x.fila)}: ${esc(x.error)}`).join('<br>')}</div>` : ''}
          <button class="btn btn-pri btn-xl mt12" onclick="cerrarModal()">Listo</button>`;
        toast(`Aéreo cargado: ${r.cargadas} estibas`, 'ok');
        invData = null;
        llamar('bdSede', ses.sedeId).then(d => { setSede(d); if ($('modal').hidden) pintarApp(); }).catch(() => {});
      })
      .catch(e => { errForm(e.message); b.disabled = false; b.textContent = ca.modo === 'REEMPLAZAR' ? 'Sí, reemplazar y cargar' : 'Sí, cargar'; });
  }

  /* ----- Cargar sin código de barras: mercancía que ya está en la bodega con rótulo viejo ----- */
  let cm = { tipo: 'NORMAL' };

  function abrirCargaManual() {
    if (sinPermiso('carga_manual')) return;
    const esp = sede.espPorId[espSel];
    if (!esp) return toast('Toca primero el espacio (por ejemplo 2A)', 'error');
    if (espacioLleno(esp.id)) return;
    const ultResp = leerLS('ultResp') || ses.nombre;
    abrirModal(`<div class="fila-sb"><span class="h2">Cargar en ${esc(etiqueta(esp))}</span>${btnCerrar()}</div>
      <span class="muted small"><b class="mono-c">${esc(cu(esp.id))}</b> · Sin código de barras: la app le crea su identificador y queda en <b>Pendientes por imprimir</b> para pegarle el rótulo después.</span>
      <label class="lbl" for="cmProd">Producto (código Atlantic, Nutresa, EAN o nombre)</label>
      <input id="cmProd" class="campo" autocomplete="off" spellcheck="false" placeholder="Escribe y elige de la lista">
      <div id="cmSug" class="ing-sug" role="listbox" aria-label="Productos" hidden></div>
      <div id="cmInfo" class="info" hidden></div>
      <span class="lbl">Tipo de mercancía</span>
      <div class="seg" role="group" aria-label="Tipo de mercancía">
        <button id="cmT1" class="${cm.tipo === 'NORMAL' ? 'on' : ''}" onclick="cmTipo('NORMAL')">Normal</button>
        <button id="cmT2" class="${cm.tipo === 'PESO' ? 'on' : ''}" onclick="cmTipo('PESO')">Peso variable</button>
      </div>
      <div id="cmCant"></div>
      <div id="cmTotal" class="total-op" aria-live="polite"></div>
      <div class="dos">
        <div><label class="lbl" for="cmVen">Fecha de vencimiento</label><input id="cmVen" class="campo" type="date"></div>
        <div><label class="lbl" for="cmRec">Fecha de recibo</label><input id="cmRec" class="campo" type="date" value="${esc(reciboDefecto())}"></div>
      </div>
      <div class="dos">
        <div><label class="lbl" for="cmLote">Lote</label><input id="cmLote" class="campo" autocomplete="off"></div>
        <div class="resp-fijo"><span class="lbl">Responsable</span><span class="resp-nom">${esc(ses.nombre)}</span></div>
      </div>
      <p id="fErr" class="error" hidden></p>
      <button id="cmOk" class="btn btn-ent-solido btn-xl mt12" onclick="guardarCargaManual()">Guardar y dejar en ${esc(etiqueta(esp))}</button>`);
    const c = $('cmProd');
    const act = () => {
      const p = buscarProducto(c.value);
      $('cmInfo').hidden = !c.value.trim();
      $('cmInfo').innerHTML = p ? `<span class="fuerte">${esc(p.nombre)}</span><span class="muted small">Atlantic ${esc(p.id)} · Nutresa ${esc(p.codigoNutresa || '—')} · ${p.undPorCaja} und x caja</span>${eanMiniHtml(p.id, 'plano')}`
        : '<span class="txt-rojo small">Producto no encontrado. Elígelo de la lista.</span>';
      if (p) {
        const t = (p.unidadMedida || '').toUpperCase() === 'KG' ? 'PESO' : 'NORMAL';
        if (t !== cm.tipo) return cmTipo(t);
        if ($('cmUnd') && !$('cmUnd').dataset.tocado) $('cmUnd').value = p.undPorCaja || '';
      }
      calcCm();
    };
    c.addEventListener('input', act); c.addEventListener('change', act);
    // Lista de productos propia (la del navegador se quedaba abierta después de escoger)
    enlazarSugProd(c, $('cmSug'), null, () => act());
    c.addEventListener('keydown', ev => { if (ev.key === 'Enter') { ev.preventDefault(); act(); const s = $('cmCajas') || $('cmKg'); if (s) s.focus(); } });
    pintarCmCant();
    if (!('ontouchstart' in window)) c.focus();
  }

  function cmTipo(t) {
    cm.tipo = t;
    $('cmT1').className = t === 'NORMAL' ? 'on' : '';
    $('cmT2').className = t === 'PESO' ? 'on' : '';
    pintarCmCant();
  }

  function pintarCmCant() {
    const p = buscarProducto($('cmProd').value);
    $('cmCant').innerHTML = cm.tipo === 'NORMAL'
      ? `<div class="dos mt8">
          <div><label class="lbl" for="cmUnd">Unidades por caja</label><input id="cmUnd" class="campo" type="number" inputmode="numeric" min="1" value="${p ? p.undPorCaja : ''}" oninput="this.dataset.tocado='1'"></div>
          <div><label class="lbl" for="cmCajas">Número de cajas</label><input id="cmCajas" class="campo" type="number" inputmode="numeric" min="1"></div></div>
        <div class="mt8"><span class="lbl"><label for="cmTot">Cantidad total en unidades</label> ${ayudaHtml('Si sabes cuántas cajas son, escríbelas y el total sale solo. Si no, escribe aquí la cantidad total.')}</span>
          <input id="cmTot" class="campo" type="number" inputmode="numeric" min="1"></div>`
      : `<div class="dos mt8">
          <div><label class="lbl" for="cmKg">Kilos en total</label><input id="cmKg" class="campo" type="number" inputmode="decimal" step="any" min="0"></div>
          <div><label class="lbl" for="cmCavas">Cajas o cavas</label><input id="cmCavas" class="campo" type="number" inputmode="numeric" min="1"></div></div>`;
    $('cmCant').querySelectorAll('input').forEach(i => i.addEventListener('input', calcCm));
    calcCm();
  }

  function calcCm() {
    const t = $('cmTotal');
    if (!t) return;
    if (cm.tipo === 'NORMAL') {
      const c = num($('cmCajas').value), u = num($('cmUnd').value), tot = $('cmTot');
      // Con cajas, el total sale solo; sin cajas, se escribe el total
      if (c > 0 && u > 0) { tot.value = c * u; tot.readOnly = true; tot.dataset.auto = '1'; }
      else if (tot.dataset.auto) { tot.value = ''; tot.readOnly = false; delete tot.dataset.auto; }
      const n = num(tot.value);
      t.innerHTML = c > 0 && u > 0 ? `<span>Total</span><b>${c} cajas × ${u} = ${c * u} unidades</b>`
        : n > 0 ? `<span>Total</span><b>${n} unidades</b>`
        : '<span class="muted small">Escribe las unidades por caja y el número de cajas (o la cantidad total).</span>';
    } else {
      const k = num($('cmKg').value), n = num($('cmCavas').value);
      t.innerHTML = k > 0 ? `<span>Total</span><b>${kg(k)}${n > 0 ? ` en ${n} caja${n === 1 ? '' : 's'}` : ''}</b>` : '<span class="muted small">Escribe los kilos.</span>';
    }
  }

  function guardarCargaManual() {
    const esp = sede.espPorId[espSel];
    const p = buscarProducto($('cmProd').value);
    if (!p) return errForm('Elige el producto de la lista.');
    const d = { codigo: p.id, tipo: cm.tipo, vencimiento: $('cmVen').value, recibo: $('cmRec').value, responsable: ses.nombre,
      loteOrigen: $('cmLote').value.trim(), ubicacionId: esp.id, sedeId: ses.sedeId, usuario: ses.nombre };
    // Vencimiento, recibo y lote: obligatorios para quien tiene el permiso «Pedir vencimiento, recibo y lote»
    if (puede('cm_obligatorio')) {
      if (!d.vencimiento) { $('cmVen').focus(); return errForm('Escribe la fecha de vencimiento.'); }
      if (!d.recibo) { $('cmRec').focus(); return errForm('Escribe la fecha de recibo.'); }
      if (!d.loteOrigen) { $('cmLote').focus(); return errForm('Escribe el lote.'); }
    }
    // Cantidad: unidades por caja y número de cajas (o la cantidad total)
    if (cm.tipo === 'NORMAL') {
      const c = num($('cmCajas').value), u = num($('cmUnd').value), tot = num($('cmTot').value);
      if (!(u > 0)) { $('cmUnd').focus(); return errForm('Escribe las unidades por caja.'); }
      if (!(c > 0) && !(tot > 0)) { $('cmCajas').focus(); return errForm('Escribe el número de cajas o la cantidad total.'); }
      Object.assign(d, c > 0 ? { cajas: c, undXCaja: u, total: c * u } : { undXCaja: u, total: tot });
    } else {
      const k = num($('cmKg').value), n = num($('cmCavas').value);
      if (!(k > 0)) { $('cmKg').focus(); return errForm('Escribe los kilos.'); }
      Object.assign(d, { numCavas: n > 0 ? n : 1, pesoCava: 0, pesoEstiba: 0, pesoBascula: k });
    }
    recordarRecibo(d.recibo);
    guardarLS('ultResp', d.responsable);
    const b = $('cmOk'); b.disabled = true; b.textContent = 'Guardando…';
    llamar('bdCargarManual', d).then(r => {
      setSede(r.sede);
      if (cm.tipo === 'NORMAL') p.undPorCaja = Number(r.etiqueta.embalaje) || p.undPorCaja;
      sinImp = null;
      cerrarModal(); pitido();
      if (!r._enCola) toast(`${r.etiqueta.id} cargado en ${etiqueta(esp)}. Queda pendiente imprimir su rótulo.`, 'ok');
      abrirPos(esp.rackId, esp.posicion, esp.id);
    }).catch(e => { errForm(e.message); b.disabled = false; b.textContent = `Guardar y dejar en ${etiqueta(esp)}`; });
  }

  function irARotular() {
    cerrarModal();
    vista = 'rotulo';
    pintarApp();
    window.scrollTo(0, 0);
    toast('Crea el rótulo. Después escanéalo y escanea el lugar para ubicarlo.', 'ok');
  }

  function avisoUbicando() {
    if (!ubicando) return '';
    const e = ubicando;
    return `<div class="colocar-aviso" style="margin-top:0;margin-bottom:10px">
      <span>Ubicando ${esc(e.id)} · ${esc(e.producto)} · ${e.cajas} cj · vence ${fCorta(e.vencimiento)}<br>
      <small style="font-weight:400">Escanea o toca la posición y luego toca el espacio donde lo vas a poner.</small></span>
      <button class="btn btn-sec" onclick="ubicando=null; pintarApp()">Cancelar</button></div>`;
  }

  function ponerAqui(boton) {
    const e = ubicando;
    const esp = sede.espPorId[espSel];
    if (espacioLleno(esp.id, { productoId: e.codigo, lote: e.id })) return;
    boton.disabled = true; boton.textContent = 'Guardando…';
    llamar('bdUbicarEtiqueta', { sedeId: ses.sedeId, etiquetaId: e.id, ubicacionId: esp.id, usuario: ses.nombre })
      .then(d => {
        setSede(d);
        ubicando = null;
        if (rotulos) { const r = rotulos.find(x => x.id === e.id); if (r) { r.estado = 'UBICADA'; r.ubicacion = esp.id; } }
        pitido();
        toast(`${e.tipo === 'PESO' ? kg(e.total) : e.cajas + ' cajas'} de ${e.producto} en ${etiqueta(esp)}`, 'ok');
        pintarApp();
      })
      .catch(err => { toast(err.message, 'error'); boton.disabled = false; boton.textContent = 'Poner aquí'; });
  }/* ================= Escanear con la cámara del celular (en vivo) =================
   * Abre la cámara en pantalla completa y lee el código apenas lo ve, sin tomar foto.
   * Usa el lector nativo del celular (BarcodeDetector) y, si no existe, ZXing.
   * Si el navegador no deja usar la cámara en vivo, ofrece tomar foto o escribir el código.
   */
  let camDestino = 'scan'; // 'scan' (barra principal) o el id de un campo de producto
  const ICONO_ESCANER = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 8V5a2 2 0 0 1 2-2h3M16 3h3a2 2 0 0 1 2 2v3M21 16v3a2 2 0 0 1-2 2h-3M8 21H5a2 2 0 0 1-2-2v-3"/><path d="M7 8v8M10 8v8M13 8v8M17 8v8"/></svg>';

  function botonCamara(destino, clase, texto) {
    return `<button type="button" class="${clase || 'btn-cam'}" onclick="abrirEscaner('${destino}')"
      aria-label="Escanear con la cámara">${ICONO_ESCANER}${texto ? `<span>${texto}</span>` : ''}</button>`;
  }

  const esc_ = { stream: null, timer: null, detector: null, zx: null, canvas: null, leyendo: false, torch: false, zoom: 1 };
  const FORMATOS_NATIVOS = ['code_128', 'code_39', 'code_93', 'codabar', 'ean_13', 'ean_8', 'upc_a', 'upc_e', 'itf', 'qr_code', 'data_matrix'];

  function titEscaner(d) {
    if (d === 'scanLugar' || d === 'lgCod' || d === 'flujoLugar') return 'Escanea el código del lugar';
    if (d === 'flujoOrigen') return 'Escanea el lugar de origen';
    if (d === 'scan') return 'Escanea un rótulo, lugar o producto';
    if (d === 'ean') return 'Escanea el código de barras de la caja (EAN)';
    if (d === 'rotuloAqui') return 'Escanea el código de barras del rótulo';
    return 'Escanea el código del producto';
  }

  async function abrirEscaner(destino) {
    camDestino = destino || 'scan';
    cerrarEscaner();
    const ov = document.createElement('div');
    ov.id = 'escaner';
    ov.className = 'esc-ov';
    ov.setAttribute('role', 'dialog');
    ov.setAttribute('aria-label', 'Escáner de código de barras');
    ov.innerHTML = `
      <video id="escVideo" playsinline muted autoplay></video>
      <div class="esc-sombra"></div>
      <div class="esc-top">
        <button type="button" class="esc-btn" onclick="cerrarEscaner()" aria-label="Cerrar">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></button>
        <div class="esc-titulo">${titEscaner(camDestino)}</div>
        <button type="button" class="esc-btn" id="escLuz" onclick="luzEscaner()" aria-label="Linterna" hidden>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 2h10v5l-3 4v11h-4V11L7 7z"/><path d="M12 14v2"/></svg></button>
      </div>
      <div class="esc-marco" id="escMarco">
        <i class="c1"></i><i class="c2"></i><i class="c3"></i><i class="c4"></i>
        <div class="esc-laser"></div>
        <div class="esc-leido" id="escLeido" hidden></div>
      </div>
      <div class="esc-pie" id="escPie">
        <div class="esc-estado" id="escEstado">Abriendo la cámara…</div>
        <div class="esc-acciones">
          <button type="button" class="esc-chip" id="escZoom" onclick="zoomEscaner()" hidden>Zoom 1x</button>
          <button type="button" class="esc-chip" onclick="escribirEnEscaner()">Escribir código</button>
          <label for="fotoCodigo" class="esc-chip" onclick="setTimeout(cerrarEscaner, 0)">Tomar foto</label>
        </div>
        <form class="esc-manual" id="escManual" hidden onsubmit="event.preventDefault(); manualEscaner()">
          <input id="escTxt" class="campo" autocomplete="off" autocapitalize="characters" placeholder="Escribe el código">
          <button class="btn btn-pri">OK</button>
        </form>
      </div>`;
    document.body.appendChild(ov);
    document.addEventListener('keydown', teclaEscaner, true);

    const video = $('escVideo');
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      return sinCamara('Este navegador no deja usar la cámara en vivo.');
    }
    try {
      esc_.stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } }   // más liviano: lee igual y no se pega en equipos sencillos
      });
    } catch (e) {
      return sinCamara(e && e.name === 'NotAllowedError'
        ? 'No diste permiso para usar la cámara. Actívalo en el candado de la barra de direcciones.'
        : 'No se pudo abrir la cámara.');
    }
    if (!$('escaner')) { pararCamara(); return; } // lo cerraron mientras abría
    video.srcObject = esc_.stream;
    try { await video.play(); } catch (e) {}

    // Enfoque continuo, linterna y zoom si el celular los tiene
    const track = esc_.stream.getVideoTracks()[0];
    const cap = track && track.getCapabilities ? track.getCapabilities() : {};
    try { if (cap.focusMode && cap.focusMode.includes('continuous')) await track.applyConstraints({ advanced: [{ focusMode: 'continuous' }] }); } catch (e) {}
    if (cap.torch) $('escLuz').hidden = false;
    if (cap.zoom && cap.zoom.max >= 2) $('escZoom').hidden = false;
    esc_.torch = false; esc_.zoom = 1;

    // Lector: nativo si está, si no ZXing
    esc_.detector = null; esc_.zx = null;
    if ('BarcodeDetector' in window) {
      try {
        const sop = await BarcodeDetector.getSupportedFormats();
        const f = FORMATOS_NATIVOS.filter(x => sop.includes(x));
        if (f.length) esc_.detector = new BarcodeDetector({ formats: f });
      } catch (e) {}
    }
    if (!esc_.detector && window.ZXing) {
      const Z = window.ZXing, hints = new Map();
      hints.set(Z.DecodeHintType.POSSIBLE_FORMATS, [Z.BarcodeFormat.CODE_128, Z.BarcodeFormat.CODE_39, Z.BarcodeFormat.CODE_93,
        Z.BarcodeFormat.EAN_13, Z.BarcodeFormat.EAN_8, Z.BarcodeFormat.UPC_A, Z.BarcodeFormat.UPC_E, Z.BarcodeFormat.ITF,
        Z.BarcodeFormat.CODABAR, Z.BarcodeFormat.QR_CODE, Z.BarcodeFormat.DATA_MATRIX]);
      hints.set(Z.DecodeHintType.TRY_HARDER, true);
      esc_.zx = new Z.MultiFormatReader();
      esc_.zx.setHints(hints);
    }
    if (!esc_.detector && !esc_.zx) return sinCamara('El lector no cargó. Revisa el internet.');
    esc_.canvas = document.createElement('canvas');
    $('escEstado').textContent = 'Pon el código dentro del recuadro';
    esc_.leyendo = true;
    cicloEscaner();
  }

  function sinCamara(msg) {
    const st = $('escEstado');
    if (!st) return;
    $('escaner').classList.add('esc-sin');
    st.textContent = msg + ' Puedes tomar una foto o escribir el código.';
  }

  // Recorta lo que está dentro del recuadro (más un margen) y lo lee
  function recorteEscaner() {
    const v = $('escVideo'), m = $('escMarco');
    if (!v || !m || !v.videoWidth) return null;
    const vr = v.getBoundingClientRect(), mr = m.getBoundingClientRect();
    const s = Math.max(vr.width / v.videoWidth, vr.height / v.videoHeight); // object-fit: cover
    const ox = (vr.width - v.videoWidth * s) / 2, oy = (vr.height - v.videoHeight * s) / 2;
    const extra = 0.15;
    let x = (mr.left - vr.left - ox - mr.width * extra) / s;
    let y = (mr.top - vr.top - oy - mr.height * extra) / s;
    let w = mr.width * (1 + 2 * extra) / s, h = mr.height * (1 + 2 * extra) / s;
    x = Math.max(0, x); y = Math.max(0, y);
    w = Math.min(v.videoWidth - x, w); h = Math.min(v.videoHeight - y, h);
    const escala = Math.min(1, 800 / w);
    const c = esc_.canvas;
    c.width = Math.round(w * escala); c.height = Math.round(h * escala);
    const ctx = c.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(v, x, y, w, h, 0, 0, c.width, c.height);
    return c;
  }

  async function cicloEscaner() {
    if (!esc_.leyendo || !$('escaner')) return;
    let texto = null;
    try {
      const c = recorteEscaner();
      if (c && c.width) {
        if (esc_.detector) {
          const r = await esc_.detector.detect(c);
          if (r && r.length) {
            // el más cercano al centro del recuadro
            const cx = c.width / 2, cy = c.height / 2;
            r.sort((a, b) => Math.hypot(a.boundingBox.x + a.boundingBox.width / 2 - cx, a.boundingBox.y + a.boundingBox.height / 2 - cy)
                           - Math.hypot(b.boundingBox.x + b.boundingBox.width / 2 - cx, b.boundingBox.y + b.boundingBox.height / 2 - cy));
            texto = r[0].rawValue;
          }
        } else if (esc_.zx) {
          const Z = window.ZXing;
          try {
            const bmp = new Z.BinaryBitmap(new Z.HybridBinarizer(new Z.HTMLCanvasElementLuminanceSource(c)));
            texto = esc_.zx.decodeWithState(bmp).getText();
          } catch (e) { /* no encontró código en este cuadro */ }
          finally { try { esc_.zx.reset(); } catch (e) {} }
        }
      }
    } catch (e) {}
    if (texto && String(texto).trim()) return exitoEscaner(String(texto).trim());
    esc_.timer = setTimeout(cicloEscaner, esc_.detector ? 80 : 140);
  }

  // Leyó: sigue solo de una vez. Si el equipo se queda pegado, abajo queda el botón grande para usar el código (o leer otro).
  function exitoEscaner(texto) {
    esc_.leyendo = false;
    clearTimeout(esc_.timer);
    esc_.leido = texto;
    try { if (navigator.vibrate) navigator.vibrate(80); } catch (e) {}
    const ov = $('escaner');
    if (ov) ov.classList.add('esc-ok');
    const l = $('escLeido');
    if (l) { l.textContent = texto; l.hidden = false; }
    const pie = $('escPie');
    if (pie) pie.innerHTML = `<div class="esc-estado">Código leído</div>
      <button type="button" class="btn btn-ent-solido btn-xl esc-usar" onclick="usarLeido()">✓ Usar ${esc(texto)}</button>
      <button type="button" class="esc-chip" onclick="leerOtraVez()">Leer otro</button>`;
    setTimeout(usarLeido, 150);
  }
  function usarLeido() {
    const t = esc_.leido;
    if (!t) return;
    esc_.leido = null;
    document.removeEventListener('keydown', teclaEscaner, true);
    const ov = $('escaner');
    if (ov) ov.remove();
    try { codigoLeido(t); } catch (e) { toast('Código leído: ' + t + '. No se pudo abrir: ' + (e.message || e), 'error'); }
    setTimeout(() => { try { pararCamara(); } catch (e) {} }, 0);   // la cámara se apaga después, para no frenar
  }
  function leerOtraVez() { esc_.leido = null; const d = camDestino; cerrarEscaner(); abrirEscaner(d); }

  function escribirEnEscaner() {
    const f = $('escManual');
    if (!f) return;
    f.hidden = false;
    $('escTxt').focus();
  }

  function manualEscaner() {
    const v = ($('escTxt').value || '').trim();
    if (!v) return;
    cerrarEscaner();
    codigoLeido(v);
  }

  async function luzEscaner() {
    const t = esc_.stream && esc_.stream.getVideoTracks()[0];
    if (!t) return;
    esc_.torch = !esc_.torch;
    try { await t.applyConstraints({ advanced: [{ torch: esc_.torch }] }); } catch (e) { esc_.torch = false; }
    $('escLuz').classList.toggle('activo', esc_.torch);
  }

  async function zoomEscaner() {
    const t = esc_.stream && esc_.stream.getVideoTracks()[0];
    if (!t) return;
    const cap = t.getCapabilities ? t.getCapabilities() : {};
    const max = cap.zoom ? Math.min(cap.zoom.max, 3) : 1;
    esc_.zoom = esc_.zoom >= max ? 1 : Math.min(max, esc_.zoom + 1);
    try { await t.applyConstraints({ advanced: [{ zoom: esc_.zoom }] }); } catch (e) {}
    $('escZoom').textContent = 'Zoom ' + esc_.zoom + 'x';
  }

  function teclaEscaner(ev) {
    if (!$('escaner')) return;
    if (ev.key === 'Escape') { ev.preventDefault(); cerrarEscaner(); return; }
    if (ev.target && ev.target.id === 'escTxt') return;
    // Mientras está la cámara, si disparan el lector de la radiofrecuencia (RT40S…), lo que lee se usa de una vez
    ev.stopPropagation();
    if (ev.key === 'Enter' || ev.key === 'Tab') { ev.preventDefault(); if (esc_.tec) { clearTimeout(esc_.tecT); const t = esc_.tec; esc_.tec = ''; exitoEscaner(t); } return; }
    if (ev.key && ev.key.length === 1) {
      ev.preventDefault();
      esc_.tec = (esc_.tec || '') + ev.key;
      clearTimeout(esc_.tecT);
      esc_.tecT = setTimeout(() => { const t = esc_.tec; esc_.tec = ''; if (t && t.trim().length >= 3) exitoEscaner(t.trim()); }, 150);
    }
  }

  function pararCamara() {
    clearTimeout(esc_.timer);
    esc_.leyendo = false;
    if (esc_.stream) { esc_.stream.getTracks().forEach(t => t.stop()); esc_.stream = null; }
  }

  function cerrarEscaner() {
    document.removeEventListener('keydown', teclaEscaner, true);
    const ov = $('escaner');
    if (ov) ov.remove();          // primero se quita la pantalla, así nunca se queda pegada en "Código leído"
    try { pararCamara(); } catch (e) {}
    esc_.tec = ''; clearTimeout(esc_.tecT); esc_.leido = null;
  }

  /* ----- Lista desplegable de productos en celulares y equipos táctiles -----
     La lista del navegador (datalist) no sale en muchos Android: en pantallas táctiles se usa esta. */
  const pantallaTactil = () => { try { return matchMedia('(pointer: coarse)').matches; } catch (e) { return 'ontouchstart' in window; } };
  const sug = { el: null, box: null };
  function sugCerrar() { if (sug.box) sug.box.remove(); sug.box = null; sug.el = null; }
  function sugPintar(el) {
    const dl = el.dataset.lista && document.getElementById(el.dataset.lista);
    const q = sinTilde(String(el.value || '').trim());
    if (!dl || q.length < 2) return sugCerrar();
    const pal = q.split(/\s+/).filter(Boolean), ops = [];
    for (const o of dl.options) {
      const v = o.value;
      if (pal.every(w => sinTilde(v).includes(w))) { ops.push(v); if (ops.length >= 8) break; }
    }
    if (!ops.length || (ops.length === 1 && ops[0] === el.value)) return sugCerrar();
    if (!sug.box) {
      sug.box = document.createElement('div');
      sug.box.className = 'sug-lista';
      sug.box.setAttribute('role', 'listbox');
      sug.box.addEventListener('mousedown', ev => ev.preventDefault());   // que el campo no pierda el foco
      sug.box.addEventListener('touchstart', () => { sug.tocando = true; }, { passive: true });
      sug.box.addEventListener('click', ev => { const b = ev.target.closest('[data-v]'); if (b) sugElegir(b.getAttribute('data-v')); });
      document.body.appendChild(sug.box);
    }
    sug.el = el;
    const r = el.getBoundingClientRect();
    sug.box.style.left = (r.left + window.pageXOffset) + 'px';
    sug.box.style.top = (r.bottom + window.pageYOffset + 4) + 'px';
    sug.box.style.width = r.width + 'px';
    sug.box.innerHTML = ops.map(v => `<button type="button" role="option" data-v="${esc(v)}">${esc(v)}</button>`).join('');
  }
  function sugElegir(v) {
    const el = sug.el;
    sugCerrar();
    if (!el) return;
    el.value = v;
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  }
  document.addEventListener('focusin', ev => {
    const el = ev.target;
    if (!el || el.tagName !== 'INPUT' || !pantallaTactil()) return;
    const l = el.getAttribute('list');
    if (l) { el.dataset.lista = l; el.removeAttribute('list'); }
  });
  document.addEventListener('input', ev => { const el = ev.target; if (el && el.dataset && el.dataset.lista && pantallaTactil()) sugPintar(el); });
  document.addEventListener('keydown', ev => { if (ev.key === 'Enter' && sug.el && ev.target === sug.el) sugCerrar(); }, true);
  document.addEventListener('focusout', ev => {
    if (!sug.el || ev.target !== sug.el) return;
    setTimeout(() => { if (sug.tocando) { sug.tocando = false; return; } if (document.activeElement !== sug.el) sugCerrar(); }, 200);
  });
  window.addEventListener('resize', () => { if (sug.el && document.body.contains(sug.el)) sugPintar(sug.el); else sugCerrar(); });

  /* ----- Radiofrecuencia / pistola (RT40S y similares): el lector escribe el código como si fuera un teclado -----
     1. Si no hay ningún campo seleccionado (en los equipos táctiles la barra no queda seleccionada sola),
        lo que lee se toma igual: va al campo de código de la pantalla (Ingresar, Consultar…) o a la barra de escanear.
     2. Si el lector no manda Enter al final, el código se toma solo cuando termina de escribir. */
  const lectorT = { buf: '', ult: 0, rap: 0, t: null, campo: null, n: 0 };
  const editable = el => el && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName));
  const CAMPOS_COD = ['eanTxt', 'eanMini', 'raTxt', 'ingCod', 'rcProd', 'rcPendQ', 'cfQ', 'cpQ', 'invProd', 'invLug', 'prQ', 'bpQ', 'rtCod', 'ptEdQ', 'rcnCod', 'scan'];
  function codigoSinCampo(t) {
    const id = CAMPOS_COD.find(k => $(k) && $(k).offsetParent !== null);
    if (!id) return toast('Código leído: ' + t + '. Abre la pantalla donde lo vas a usar.', 'error');
    camDestino = id;
    codigoLeido(t);
  }
  document.addEventListener('keydown', ev => {
    if ($('escaner') || !ses || pantalla !== 'app') return;
    const ahora = Date.now(), el = document.activeElement;
    if (!editable(el) || el === document.body) {
      // Nada seleccionado: se junta lo que va llegando muy rápido (un lector, no una persona)
      if (ev.key === 'Enter' || ev.key === 'Tab') {
        if (lectorT.buf.length >= 3 && lectorT.rap >= 2) { ev.preventDefault(); clearTimeout(lectorT.t); const t = lectorT.buf; lectorT.buf = ''; lectorT.rap = 0; codigoSinCampo(t); }
        return;
      }
      if (!ev.key || ev.key.length !== 1 || ev.ctrlKey || ev.metaKey || ev.altKey) return;
      if (ahora - lectorT.ult > 70) { lectorT.buf = ''; lectorT.rap = 0; } else lectorT.rap++;
      lectorT.ult = ahora; lectorT.buf += ev.key;
      clearTimeout(lectorT.t);
      lectorT.t = setTimeout(() => { const t = lectorT.buf; const r = lectorT.rap; lectorT.buf = ''; lectorT.rap = 0; if (t.length >= 3 && r >= 2) codigoSinCampo(t); }, 150);
      return;
    }
    if (ev.key === 'Enter') { clearTimeout(lectorT.t); lectorT.campo = null; }
  }, true);
  // En un campo de código: si llega rapidísimo (lector) y no llega el Enter, se da Enter solo
  document.addEventListener('input', ev => {
    const el = ev.target;
    if (!el || el.tagName !== 'INPUT' || !CAMPOS_COD.includes(el.id)) return;
    if (ev.inputType && !/^insert(Text|CompositionText|FromPaste|ReplacementText)?$/.test(ev.inputType)) return;
    const ahora = Date.now(), d = ev.data || '';
    if (lectorT.campo !== el || ahora - lectorT.ult > 70) { lectorT.campo = el; lectorT.n = 0; }
    lectorT.n += d.length > 1 || !d ? 4 : 1;   // si escribe todo de una vez, también es lector
    lectorT.ult = ahora;
    clearTimeout(lectorT.t);
    lectorT.t = setTimeout(() => {
      if (lectorT.campo !== el || lectorT.n < 4 || el.value.trim().length < 3 || document.activeElement !== el) return;
      lectorT.campo = null;
      const e2 = new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true, cancelable: true });
      el.dispatchEvent(e2);
    }, 180);
  }, true);
  document.addEventListener('visibilitychange', () => { if (document.hidden) cerrarEscaner(); });

  /* ----- Lector de los equipos con escáner arriba (PDA): en celulares y equipos táctiles hay un campo invisible
     siempre listo (sin teclado en pantalla) para que el lector escriba ahí aunque no se haya tocado ningún campo.
     Sirve tanto si el lector «escribe como teclado» como si «llena el campo» directamente.
     Si la persona toca un campo (cantidad, buscar…), el lector escribe en ese campo como siempre. ----- */
  const tactil = !!(window.matchMedia && matchMedia('(pointer: coarse)').matches && !matchMedia('(any-pointer: fine)').matches);   // celular, tableta o PDA (no PC)
  let lectorIn = null, lectorTm = null;
  function lectorUsar(t) {
    t = String(t || '').replace(/[\r\n\t]+/g, '').trim();
    if (t.length < 3) return;
    if ($('eanTxt')) camDestino = 'eanTxt';
    else if ($('eanMini') && $('eanMini').offsetParent) camDestino = 'eanMini';
    else if ($('raTxt')) camDestino = 'raTxt';
    else if (flujo && flujo.paso === 'lugar') camDestino = 'flujoLugar';
    else if (flujo && flujo.paso === 'origen') camDestino = 'flujoOrigen';
    else if ($('rcQ') && $('rcTabla')) camDestino = 'rcQ';   // reconteo: solo busca el producto para contarlo
    else {
      const id = CAMPOS_COD.find(k => $(k) && $(k).offsetParent !== null);
      if (!id || id === 'scan') { cerrarModal(); camDestino = 'scan'; }
      else camDestino = id;
    }
    codigoLeido(t);
  }
  function lectorTomar() {
    clearTimeout(lectorTm);
    if (!lectorIn) return;
    const t = lectorIn.value; lectorIn.value = '';
    lectorUsar(t);
  }
  function lectorListo() {
    if (!tactil || pantalla !== 'app' || !ses || $('escaner') || document.hidden) return;
    if (!lectorIn) {
      lectorIn = document.createElement('input');
      lectorIn.id = 'lectorPda'; lectorIn.type = 'text'; lectorIn.tabIndex = -1;
      lectorIn.setAttribute('inputmode', 'none'); lectorIn.setAttribute('autocomplete', 'off'); lectorIn.setAttribute('autocorrect', 'off');
      lectorIn.setAttribute('autocapitalize', 'off'); lectorIn.setAttribute('spellcheck', 'false'); lectorIn.setAttribute('aria-hidden', 'true');
      lectorIn.style.cssText = 'position:fixed;top:0;left:0;width:1px;height:1px;opacity:0;border:0;padding:0;margin:0;font-size:16px;pointer-events:none;z-index:-1';
      lectorIn.addEventListener('keydown', ev => {
        if (ev.key === 'Enter' || ev.key === 'Tab') { ev.preventDefault(); ev.stopPropagation(); lectorTomar(); }
      });
      // Si el lector no manda Enter, se toma cuando termina de escribir
      lectorIn.addEventListener('input', () => { clearTimeout(lectorTm); lectorTm = setTimeout(lectorTomar, 150); });
      document.body.appendChild(lectorIn);
    }
    const el = document.activeElement;
    if (el === lectorIn || (editable(el) && el !== document.body)) return;   // la persona está en un campo: el lector escribe ahí
    if (el && el.classList && el.classList.contains('btn-enter')) return;   // Enter la llevó al botón de guardar: otro Enter guarda
    lectorIn.focus({ preventScroll: true });
  }
  if (tactil) {
    setInterval(lectorListo, 400);
    document.addEventListener('focusout', () => setTimeout(lectorListo, 0));
  }

  function campoConCamara(inputHtml, destino) {
    return `<div class="fila gap8">${inputHtml.replace('class="campo"', 'class="campo" style="flex:1;min-width:0"')}${botonCamara(destino, 'btn btn-sec btn-cam2')}</div>`;
  }

  async function leerFoto(archivo) {
    if (!archivo) return;
    toast('Leyendo el código…');
    let texto = null;
    try {
      if ('BarcodeDetector' in window) {
        const img = await createImageBitmap(archivo);
        const r = await new BarcodeDetector().detect(img);
        if (r && r.length) texto = r[0].rawValue;
      }
    } catch (e) {}
    if (!texto && window.ZXing) {
      const url = URL.createObjectURL(archivo);
      try {
        const lector = new ZXing.BrowserMultiFormatReader();
        texto = (await lector.decodeFromImageUrl(url)).getText();
      } catch (e) {} finally { URL.revokeObjectURL(url); }
    }
    if (!texto) {
      toast('No se pudo leer el código. Toma la foto más cerca y con buena luz, o escribe el código.', 'error');
      return;
    }
    codigoLeido(texto);
  }

  function codigoLeido(texto) {
    pitido();
    const valor = String(texto).trim();
    if (camDestino === 'eanMini' && $('eanMini')) { $('eanMini').value = valor.replace(/\s+/g, ''); return guardarEanMini($('eanMini').dataset.pid); }
    if ((camDestino === 'ean' || camDestino === 'eanTxt') && $('eanTxt')) { $('eanTxt').value = valor.replace(/\s+/g, ''); return guardarEan(); }
    if (camDestino === 'rotuloAqui' || camDestino === 'raTxt') { if ($('raTxt')) $('raTxt').value = valor; return rotuloAquiTexto(valor); }
    if (camDestino === 'scan') return buscarCodigo(valor);
    if (camDestino === 'scanProd') return buscarProductoCod(valor);
    if (camDestino === 'flujoLugar') return flujoLugarCodigo(valor);
    if (camDestino === 'flujoOrigen') return flujoOrigenCodigo(valor);
    if (camDestino === 'scanLugar' || camDestino === 'lgCod') return buscarLugar(valor);
    if (camDestino === 'prodQ' && $('prodQ')) { const pr = buscarProducto(valor); if (pr) return abrirFicha(pr.id); $('prodQ').value = valor; $('prodQ').dispatchEvent(new Event('input')); return; }
    if (camDestino === 'invLug' && $('invLug')) { $('invLug').value = valor; return invLugarTexto(valor); }
    if (camDestino === 'invProd' && $('invProd')) { $('invProd').value = valor; return invProdTexto(valor, true); }
    if (camDestino === 'prQ' && $('prQ')) { $('prQ').value = valor; return elegirPrTexto(valor); }
    if (camDestino === 'bpQ' && $('bpQ')) { $('bpQ').value = valor; return buscarProductoCod(valor); }
    if (camDestino === 'ingCod' && $('ingCod')) { $('ingCod').value = valor; return ingProducto(valor, true); }
    if (camDestino === 'rcProd' && $('rcProd')) { $('rcProd').value = valor; return rcElegirProd(valor, true); }
    if (camDestino === 'rcPendQ' && $('rcPendQ')) { const pr = buscarProducto(valor); rcPendQ = pr ? pr.id : valor; $('rcPendQ').value = rcPendQ; return rcPintarPend(); }
    if (camDestino === 'rcQ' && $('rcQ')) { $('rcQ').value = valor; return rcEscaneado(valor); }
    if (camDestino === 'cfQ' && $('cfQ')) { const pr = buscarProducto(valor); $('cfQ').value = pr ? pr.id : valor; $('cfQ').dispatchEvent(new Event('input')); return; }
    if (camDestino === 'cpQ' && $('cpQ')) { const pr = buscarProducto(valor); $('cpQ').value = pr ? pr.id : valor; $('cpQ').dispatchEvent(new Event('input')); return; }
    const campo = $(camDestino);
    if (!campo) return;
    const p = buscarProducto(valor);
    campo.value = p ? (camDestino === 'rtCod' ? p.id : p.id + ' · ' + p.nombre) : valor;
    campo.dispatchEvent(new Event('input'));
    campo.dispatchEvent(new Event('change'));
    if (!p && camDestino !== 'npCb') toast('Código leído: ' + valor + ' (no está en la lista de productos)', 'error');
  }

  /* ================= Al escanear: una ventana abajo con lo que se puede hacer =================
     Producto o rótulo → Asignar en un lugar (solo el rótulo que falta ubicar) · Mover · Salida · Agregar EAN
     Lugar → Agregar un rótulo (se escanea el rótulo) · Cargar sin código de barras */
  let hojaCtx = null;     // { p, e } producto y rótulo (si se escaneó un rótulo)
  let ubicarAqui = null;  // espacio donde va el próximo rótulo que se escanee ("Agregar un rótulo")

  function hojaRotuloCod(cod) {
    return llamar('bdEtiqueta', cod, ses.sedeId).then(e => {
      // Venía de "Agregar un rótulo" en un lugar: va directo a confirmar en ese lugar
      if (ubicarAqui && sede.espPorId[ubicarAqui]) {
        const aqui = ubicarAqui, msg = rotuloNoUsable(e);
        if (msg) return toast(msg, 'error');
        if (sinPermiso('ubicar')) return;
        ubicarAqui = null; ubicando = e; moviendo = null; pitido();
        return pedirConfirmUbicar(e, aqui);
      }
      const p = prodDe(e.codigo) || { id: e.codigo, nombre: e.producto, codigoNutresa: e.codigoNutresa };
      pitido(); hojaProducto(p, e);
    }).catch(err => toast(err.message, 'error'));
  }

  function hojaProducto(p, e) {
    hojaCtx = { p, e: e || null };
    const ls = lineasProd(p.id), unds = ls.reduce((a, l) => a + l.unidades, 0);
    const lineaRot = e ? sede.lineas.find(l => l.lote === e.id) : null;
    const asignar = e && e.estado === 'PENDIENTE' && puede('ubicar');
    const sale = e ? lineaRot : ls.length;
    const est = e ? (e.estado === 'PENDIENTE' ? ['amar', 'Falta ubicar'] : e.estado === 'UBICADA' ? ['ok', 'Ubicado en ' + cu(e.ubicacion)]
      : e.estado === 'SALIDA' ? ['', 'Ya salió de la bodega'] : ['venc', 'Anulado']) : null;
    const b = [
      asignar ? '<button class="btn btn-ent-solido btn-xl" onclick="hojaAsignar()">Asignar en un lugar</button>' : '',
      sale && puede('mover') ? `<button class="btn btn-pri btn-xl" onclick="hojaAccion('MOVER')">Mover</button>` : '',
      sale && puede('salida') ? `<button class="btn btn-sal btn-xl" onclick="hojaAccion('SALIDA')">Salida</button>` : '',
      prodDe(p.id) && puedeEan('plano') ? `<button class="btn btn-sec btn-xl" onclick="hojaEan()">${p.codigoBarras ? 'Cambiar EAN' : 'Agregar EAN'}</button>` : ''
    ].filter(Boolean);
    abrirModal(`<div class="fila-sb"><span class="h2">${e ? 'Rótulo ' + esc(e.id) : 'Producto'}</span>${btnCerrar()}</div>
      ${est ? `<span class="mt8"><span class="tag ${est[0]}">${esc(est[1])}</span></span>` : ''}
      <span class="nombre mt8">${esc(p.nombre)}</span>
      <span class="hoja-cod">Código Atlantic <b>${esc(p.id)}</b></span>
      <span class="muted small">Nutresa ${esc(p.codigoNutresa || '—')} · ${p.codigoBarras ? 'EAN ' + esc(p.codigoBarras) : '<b class="txt-naranja">Sin EAN</b>'}</span>
      ${e ? `<span class="muted small">${e.tipo === 'PESO' ? kg(e.total) + ' · ' + e.cajas + ' cavas' : e.cajas + ' cj · ' + e.total + ' und'} · vence ${fCorta(e.vencimiento)}</span>`
        : `<span class="muted small">${ls.length ? `En ${ls.length} lugar${ls.length === 1 ? '' : 'es'} de esta sede · ${und(unds, p)}` : 'No está ubicado en esta sede'}</span>`}
      ${b.length ? `<div class="hoja-acc mt16">${b.join('')}</div>` : '<p class="muted small mt16">No hay acciones para esto.</p>'}
      ${e ? '' : `<span class="lbl mt16">Rótulos de este producto</span><div id="hojaRot"><div class="cargando">Buscando rótulos…</div></div>`}`);
    if (!e) cargarRotulosProducto(p);
  }
  // Rótulos del producto (por ubicar o ubicados): al tocar uno se abre con lo que se puede hacer. Si no tiene, se ofrece crearlo.
  function cargarRotulosProducto(p) {
    llamar('bdRotulosProducto', p.id, ses.sedeId).then(l => {
      if (!$('hojaRot') || !hojaCtx || hojaCtx.p.id !== p.id || hojaCtx.e) return;
      hojaCtx.rots = l;
      $('hojaRot').innerHTML = l.length ? `<div class="lista-bp mt8">${l.map((e, i) => `<button class="bp-item" onclick="hojaProducto(hojaCtx.p, hojaCtx.rots[${i}])">
          <span class="col flex1 gap4" style="min-width:0"><b class="mono-c">${esc(e.id)}</b>
            <span class="muted small">${e.tipo === 'PESO' ? kg(e.total) : e.cajas + ' cj · ' + e.total + ' und'} · vence ${fCorta(e.vencimiento)}</span></span>
          ${e.estado === 'UBICADA' ? `<span class="tag ok">${esc(cu(e.ubicacion))}</span>` : '<span class="tag amar">Falta ubicar</span>'}</button>`).join('')}</div>`
        : `<p class="small mt8">Este producto no tiene rótulos en esta sede.</p>
          ${puede('rotular') ? `<button class="btn btn-pri btn-xl mt8" onclick="crearRotuloDe('${esc(p.id)}')">Crear rótulo</button>` : ''}`;
    }).catch(err => { if ($('hojaRot')) $('hojaRot').innerHTML = `<p class="error small">${esc(err.message)}</p>`; });
  }
  function crearRotuloDe(pid) {
    cerrarModal(); vista = 'rotulo'; pintarApp();
    const c = $('rtCod');
    if (c) { c.value = pid; c.dispatchEvent(new Event('input')); c.dispatchEvent(new Event('change')); }
    window.scrollTo(0, 0);
  }
  function hojaAsignar() {
    const e = hojaCtx && hojaCtx.e;
    if (!e || sinPermiso('ubicar')) return;
    ubicando = e; moviendo = null; ubicarAqui = null;
    vista = 'mapa'; espSel = null; pintarApp();
    abrirModal(`<div class="fila-sb"><span class="h2">¿Dónde lo vas a poner?</span>${btnCerrar()}</div>
      <span class="muted small mt8">Rótulo <b>${esc(e.id)}</b> · ${esc(e.producto)}</span>
      <div class="hoja-acc mt16">
        ${botonCamara('scanLugar', 'btn btn-pri btn-xl btn-acceso', 'Escanear el lugar')}
        <button class="btn btn-sec btn-xl" onclick="abrirLugar()">Elegir el lugar</button>
        <button class="btn btn-sec btn-xl" onclick="ubicando=null; cerrarModal(); pintarApp()">Cancelar</button>
      </div>`);
  }
  function hojaAccion(a) {
    const c = hojaCtx;
    if (!c) return;
    cerrarModal();
    abrirFicha(c.p.id);
    if (!flujo) return;
    flujoAccion(a);
    const l = c.e ? sede.lineas.find(x => x.lote === c.e.id) : null;   // el rótulo escaneado: sale de su lugar
    if (l && flujo && flujo.paso === 'origen') flujoOrigen(idxLinea(l));
  }

  const hojaVolver = () => (hojaCtx && hojaCtx.volver ? hojaCtx.volver() : hojaProducto(hojaCtx.p, hojaCtx.e));
  // EAN: foto del código del fabricante (o la pistola / escribirlo) y se guarda en el producto
  function hojaEan() {
    const p = hojaCtx && hojaCtx.p;
    if (!p) return;
    if (!puedeEan('plano') && !puede('prod_editar')) return toast('No tienes permiso para agregar o cambiar el EAN. Pídeselo al administrador.', 'error');
    abrirModal(`<div class="fila-sb"><span class="h2">EAN de ${esc(p.nombre)}</span>${btnCerrar()}</div>
      <span class="muted small mt8">Escanea el código de barras que trae la caja del fabricante. Queda guardado en el código ${esc(p.id)} y desde ahí, al escanearlo, la app ya sabe qué producto es.</span>
      ${p.codigoBarras ? `<span class="small mt8">EAN actual: <b>${esc(p.codigoBarras)}</b></span>` : ''}
      <div class="mt12">${botonCamara('ean', 'btn btn-pri btn-xl btn-acceso', 'Escanear EAN con la cámara')}</div>
      <label class="lbl mt12" for="eanTxt">O escanéalo con la pistola o escríbelo</label>
      <input id="eanTxt" class="campo" inputmode="numeric" autocomplete="off" placeholder="Ej. 7702011012345" onkeydown="if (event.key === 'Enter') guardarEan()">
      <p id="fErr" class="error" hidden></p>
      <div class="dos mt16"><button class="btn btn-sec btn-xl" onclick="hojaVolver()">Volver</button>
        <button id="eanOk" class="btn btn-pri btn-xl" onclick="guardarEan()">Guardar EAN</button></div>`);
    if (!('ontouchstart' in window)) $('eanTxt').focus();
  }
  function guardarEan() {
    const p = hojaCtx && hojaCtx.p, b = $('eanOk');
    if (!p || !b || b.disabled) return;
    const ean = String($('eanTxt').value || '').replace(/\s+/g, '');
    if (!/^\d{8,14}$/.test(ean)) return errForm('El EAN debe tener entre 8 y 14 números. Escanéalo otra vez.');
    b.disabled = true; b.textContent = 'Guardando…';
    llamar('bdGuardarEan', { codigo: p.id, ean, usuario: ses.nombre }).then(r => {
      ini.productos = r.productos;
      $('dlProductos').innerHTML = r.productos.map(x => `<option value="${esc(x.id + ' · ' + x.nombre)}">`).join('');
      pitido(); toast(`EAN ${ean} guardado en ${p.id}`, 'ok');
      hojaCtx.p = prodDe(p.id) || p;
      if ($('prodLista') && typeof listaProdHtml === 'function') $('prodLista').innerHTML = listaProdHtml();
      hojaVolver();
    }).catch(e => { b.disabled = false; b.textContent = 'Guardar EAN'; errForm(e.message); });
  }

  // Lugar escaneado: una posición pide el nivel y el lado; un espacio muestra lo que se puede hacer ahí
  function hojaPos(rackId, p) {
    const esps = espaciosDe(rackId, p).sort((a, b) => b.nivel - a.nivel || a.lado.localeCompare(b.lado));
    const r = sede.rackPorId[rackId];
    if (!esps.length) return abrirPos(rackId, p);
    abrirModal(`<div class="fila-sb"><span class="h2">${esc(posCodigo(rackId, p))}</span>${btnCerrar()}</div>
      <span class="muted small mt8">${esc(r ? r.nombre : '')} · Posición ${p}. Toca el nivel y el lado.</span>
      <div class="hoja-niv mt12">${esps.map(e => `<button class="btn btn-sec" onclick="hojaLugar('${esc(e.id)}')"><b>${esc(etiqueta(e))}</b>
        <small class="muted">${lineasDe(e.id).length ? esc(lineasDe(e.id).map(l => l.nombre).join(', ')) : 'Vacío'}</small></button>`).join('')}</div>`);
  }
  function hojaLugar(espId) {
    const esp = sede.espPorId[espId];
    if (!esp) return;
    ubicarAqui = null;
    posSel = { rackId: esp.rackId, posicion: esp.posicion }; espSel = espId;
    const ls = lineasDe(espId), lleno = ls.length >= maxEsp();
    const b = [
      puede('ubicar') && !lleno ? `<button class="btn btn-ent-solido btn-xl" onclick="hojaAgregarRotulo('${esc(espId)}')">Agregar un rótulo</button>` : '',
      puede('carga_manual') && !lleno ? '<button class="btn btn-sec btn-xl" onclick="cerrarModal(); abrirCargaManual()">Cargar sin código de barras</button>' : '',
      `<button class="btn btn-sec btn-xl" onclick="cerrarModal(); abrirPos('${esc(esp.rackId)}', ${esp.posicion}, '${esc(espId)}')">Ver en el plano</button>`
    ].filter(Boolean);
    abrirModal(`<div class="fila-sb"><span class="h2">${esc(cu(espId))}</span>${btnCerrar()}</div>
      <span class="muted small mt8">${esc(lugarTxt(espId))}</span>
      ${ls.length ? `<div class="lista-bp mt8">${ls.map(l => `<div class="pt-salida"><span class="col gap4 flex1" style="min-width:0"><b>${esc(l.nombre)}</b>
        <span class="muted small">${cant(l)} · vence ${fFecha(l.vencimiento, true)}${l.lote ? ' · ' + esc(l.lote) : ''}</span></span></div>`).join('')}</div>`
        : '<span class="small mt8">Este lugar está vacío.</span>'}
      ${lleno ? `<p class="small txt-naranja mt8">Ya tiene ${ls.length} productos (el máximo es ${maxEsp()}).</p>` : ''}
      <div class="hoja-acc mt16">${b.join('')}</div>`);
  }
  function hojaAgregarRotulo(espId) {
    if (sinPermiso('ubicar')) return;
    ubicarAqui = espId; ubicando = null; moviendo = null;
    abrirModal(`<div class="fila-sb"><span class="h2">Agregar un rótulo</span>${btnCerrar()}</div>
      <span class="muted small mt8">Va en <b>${esc(cu(espId))}</b>. Escanea el código de barras del rótulo.</span>
      <div class="mt12">${botonCamara('rotuloAqui', 'btn btn-pri btn-xl btn-acceso', 'Escanear rótulo')}</div>
      <label class="lbl mt12" for="raTxt">O escanéalo con la pistola o escríbelo</label>
      <input id="raTxt" class="campo" autocomplete="off" autocapitalize="characters" placeholder="Ej. E000123" onkeydown="if (event.key === 'Enter') { event.preventDefault(); rotuloAquiTexto(this.value); }">
      <div class="dos mt16"><button class="btn btn-sec btn-xl" onclick="hojaLugar('${esc(espId)}')">Volver</button>
        <button class="btn btn-pri btn-xl" onclick="rotuloAquiTexto($('raTxt').value)">Buscar rótulo</button></div>`);
    if (!('ontouchstart' in window)) $('raTxt').focus();
  }
  // Pequeño "+ Agregar EAN" para el producto que todavía no tiene (al ubicar un rótulo, rotular o cargar sin código)
  function eanMiniHtml(pid, mod) {
    const p = prodDe(pid);
    if (!p || p.codigoBarras || !puedeEan(mod)) return '';
    return `<details class="ean-mini" id="eanMiniCaja"><summary>+ Agregar EAN de este producto</summary>
      <div class="fila gap8 mt8"><input id="eanMini" data-pid="${esc(pid)}" class="campo" style="flex:1;min-width:0" inputmode="numeric" autocomplete="off" placeholder="Escanea o escribe el EAN"
        onkeydown="if (event.key === 'Enter') { event.preventDefault(); guardarEanMini('${esc(pid)}'); }">
        ${botonCamara('eanMini', 'btn btn-sec btn-cam2')}
        <button type="button" class="btn btn-pri" onclick="guardarEanMini('${esc(pid)}')">Guardar</button></div></details>`;
  }
  function guardarEanMini(pid) {
    const inp = $('eanMini');
    if (!inp || inp.dataset.guardando) return;
    const ean = String(inp.value || '').replace(/\s+/g, '');
    if (!/^\d{8,14}$/.test(ean)) return toast('El EAN debe tener entre 8 y 14 números. Escanéalo otra vez.', 'error');
    inp.dataset.guardando = '1';
    llamar('bdGuardarEan', { codigo: pid, ean, usuario: ses.nombre }).then(r => {
      ini.productos = r.productos;
      $('dlProductos').innerHTML = r.productos.map(x => `<option value="${esc(x.id + ' · ' + x.nombre)}">`).join('');
      pitido(); toast(`EAN ${ean} guardado en ${pid}`, 'ok');
      if ($('prodLista')) $('prodLista').innerHTML = listaProdHtml();
      const caja = $('eanMiniCaja');
      if (caja) caja.outerHTML = `<span class="small txt-verde">✓ EAN ${esc(ean)} guardado</span>`;
    }).catch(e => { delete inp.dataset.guardando; toast(e.message, 'error'); });
  }
  // Código que no es de ningún producto: si parece un EAN se ofrece ponérselo a un producto o crear el producto
  const pareceEan = t => /^\d{8,14}$/.test(String(t || '').replace(/\s+/g, ''));
  function hojaEanNuevo(ean) {
    ean = String(ean).replace(/\s+/g, '');
    hojaCtx = { ean };
    abrirModal(`<div class="fila-sb"><span class="h2">EAN no registrado</span>${btnCerrar()}</div>
      <span class="hoja-cod mt8">EAN <b>${esc(ean)}</b></span>
      <span class="muted small">Este código de barras no está en ningún producto.</span>
      ${puedeEan('plano') || puede('productos') ? `<div class="hoja-acc mt16">
          ${puedeEan('plano') ? '<button class="btn btn-pri btn-xl" onclick="hojaEanAsignar()">Ponérselo a un producto</button>' : ''}
          ${puede('productos') ? `<button class="btn btn-sec btn-xl" onclick="formProducto(false, '${esc(ean)}')">Crear producto nuevo</button>` : ''}</div>`
        : '<p class="small mt16">Pídele a quien maneja los productos que lo agregue.</p>'}`);
  }
  // Desde Inventario (Ingresar o Contar): escanearon un EAN que no está → escoger de qué producto es, guardarlo y seguir contando
  function eanNuevoEn(ean, volverA) {
    if (!puedeEan(volverA === 'rcProd' ? 'recibidor' : 'inventario')) return toast(`El EAN ${ean} no está en ningún producto. Pídele a quien maneja los productos que lo agregue, o escanea el rótulo de la caja.`, 'error');
    if (!$('modal').hidden && hojaCtx && hojaCtx.ean === ean) return;   // ya está abierto
    hojaCtx = { ean, volverA };
    hojaEanAsignar();
  }
  function hojaEanAsignar() {
    const ean = hojaCtx && hojaCtx.ean, va = hojaCtx && hojaCtx.volverA;
    if (!ean) return;
    abrirModal(`<div class="fila-sb"><span class="h2">${va ? 'EAN nuevo: ¿de qué producto es?' : '¿De qué producto es?'}</span>${btnCerrar()}</div>
      <span class="muted small mt8">${va ? `El EAN <b>${esc(ean)}</b> todavía no está en ningún producto.` : `EAN <b>${esc(ean)}</b>.`} Busca el producto por código Atlantic, Nutresa o nombre y tócalo.</span>
      <input id="eaQ" class="campo mt12" autocomplete="off" placeholder="Código o nombre" oninput="eanListaPintar()">
      <div id="eaLista" class="lista-bp mt8" role="list"></div>
      ${va ? '<button class="btn btn-sec btn-xl mt12" onclick="cerrarModal()">Cancelar</button>' : `<button class="btn btn-sec btn-xl mt12" onclick="hojaEanNuevo('${esc(ean)}')">Volver</button>`}`);
    eanListaPintar();
    if (!('ontouchstart' in window)) $('eaQ').focus();
  }
  function eanListaPintar() {
    const pal = sinTilde($('eaQ').value.trim()).split(/\s+/).filter(Boolean);
    const l = ini.productos.filter(p => p.activo !== false && (!pal.length || pal.every(w => sinTilde(`${p.id} ${p.codigoNutresa} ${p.nombre}`).includes(w)))).slice(0, 30);
    $('eaLista').innerHTML = l.length ? l.map(p => `<button class="bp-item" onclick="eanConfirmar('${esc(p.id)}')"><span class="col flex1 gap4" style="min-width:0">
        <span class="nombre">${esc(p.nombre)}</span><span class="muted small">Atlantic <b>${esc(p.id)}</b> · Nutresa ${esc(p.codigoNutresa || '—')}${p.codigoBarras ? ' · ya tiene EAN ' + esc(p.codigoBarras) : ''}</span></span></button>`).join('')
      : '<p class="muted small">No hay productos con eso.</p>';
  }
  function eanConfirmar(pid) {
    const p = prodDe(pid), ean = hojaCtx && hojaCtx.ean;
    if (!p || !ean) return;
    abrirModal(`<div class="fila-sb"><span class="h2">Confirmar EAN</span>${btnCerrar()}</div>
      <span class="nombre mt8">${esc(p.nombre)}</span>
      <span class="hoja-cod">Código Atlantic <b>${esc(p.id)}</b></span>
      <span class="small mt8">Se le pone el EAN <b>${esc(ean)}</b>.${p.codigoBarras ? ` <b class="txt-naranja">Ya tenía el ${esc(p.codigoBarras)}: se reemplaza.</b>` : ''}</span>
      <p id="fErr" class="error" hidden></p>
      <div class="dos mt16"><button class="btn btn-sec btn-xl" onclick="hojaEanAsignar()">Otro producto</button>
        <button id="eaOk" class="btn btn-pri btn-xl" onclick="eanGuardarEn('${esc(pid)}')">Guardar</button></div>`);
  }
  function eanGuardarEn(pid) {
    const b = $('eaOk'), ean = hojaCtx && hojaCtx.ean, va = hojaCtx && hojaCtx.volverA;
    if (!b || b.disabled || !ean) return;
    b.disabled = true; b.textContent = 'Guardando…';
    llamar('bdGuardarEan', { codigo: pid, ean, usuario: ses.nombre }).then(r => {
      ini.productos = r.productos;
      $('dlProductos').innerHTML = r.productos.map(x => `<option value="${esc(x.id + ' · ' + x.nombre)}">`).join('');
      if ($('prodLista')) $('prodLista').innerHTML = listaProdHtml();
      pitido(); toast(`EAN ${ean} guardado en ${pid}`, 'ok');
      if (va === 'ing') { cerrarModal(); if ($('ingCod')) { $('ingCod').value = pid; ingProducto(pid, true); } return; }   // sigue contando ese producto
      if (va === 'rc') { cerrarModal(); if ($('rcQ')) rcEscaneado(pid); return; }
      if (va === 'rcProd') { cerrarModal(); if (rcAct) { rb = borradorNuevo(pid); guardarRb(); pintarRbForm(); } return; }
      hojaProducto(prodDe(pid));
    }).catch(e => { b.disabled = false; b.textContent = 'Guardar'; errForm(e.message); });
  }
  function rotuloAquiTexto(t) {
    const v = String(t || '').trim().toUpperCase();
    if (!/^E\d{4,}$/.test(v)) return toast('Escanea el código de barras del rótulo (empieza por E)', 'error');
    hojaRotuloCod(v);
  }

  /* ================= Escaneo y selección ================= */
  // Acepta una posición (S1-R01-P003) o un espacio exacto (S1-R01-P003-2A)
  function escanear(txt) { return buscarCodigo(txt); }

  // Rótulo (E000001) → ubicar · posición o espacio → abrirla · código AFS / Nutresa → dónde está
  function buscarCodigo(txt) {
    const cod = String(txt || '').trim().toUpperCase();
    if ($('scan')) $('scan').value = '';
    if (!cod) return toast('Escribe o escanea un código', 'error');
    if (/^E\d{4,}$/.test(cod)) return hojaRotuloCod(cod);
    const hoja = !ubicando && !moviendo;
    const e = espDeTexto(cod);
    if (e) { pitido(); return hoja ? hojaLugar(e.id) : abrirPos(e.rackId, e.posicion, e.id); }
    const pp = posDeTexto(cod);
    if (pp) { pitido(); return hoja ? hojaPos(pp.rackId, pp.posicion) : abrirPos(pp.rackId, pp.posicion); }
    const m = cod.match(/^(.+)-P(\d+)$/);
    if (m) {
      const r = sede.racks.find(x => x.id.toUpperCase() === m[1]);
      const p = Number(m[2]);
      if (r && p >= 1 && p <= r.posiciones && !r.omitidas.includes(p)) { pitido(); return abrirPos(r.id, p); }
    }
    const prod = buscarProducto(String(txt).trim());
    if (prod) { pitido(); return hojaProducto(prod); }
    if (pareceEan(txt)) return hojaEanNuevo(txt);
    toast(`No se encontró el código ${cod}`, 'error');
  }

  function abrirPos(rackId, p, espId) {
    posSel = { rackId, posicion: p };
    espSel = espId || null;
    vista = 'mapa';
    pintarApp();
    if (!esAncho()) window.scrollTo(0, 0);
    if (espId) proponerEnEspacio(espId);
    else if (ubicando || moviendo) toast('Ahora toca el nivel y el lado (por ejemplo 2A)', 'ok');
    refrescar();
  }

  // Producto y lugar ya están: se muestra la confirmación de una vez
  function proponerEnEspacio(id) {
    if ((ubicando || moviendo) && sede.bloqueos[id]) return toast(`${cu(id)} está bloqueado (${sede.bloqueos[id]}). Escoge otro espacio.`, 'error');
    if (ubicando) return pedirConfirmUbicar(ubicando, id);
    if (moviendo && id !== moviendo.origenId) return pedirConfirmMover(id);
  }

  function cerrarPos() { posSel = null; espSel = null; pintarApp(); }

  function selEsp(id) { espSel = (id && id !== espSel) ? id : null; pintarApp(); if (espSel) proponerEnEspacio(espSel); }/* ================= Por imprimir: la persona del PC imprime lo que llenan en planta ================= */
  let piLista = null;                 // rótulos que nadie ha impreso (de todos)
  const piF = { quien: '', q: '' };
  const quienHizo = e => e.creadoPor || e.responsable || 'Sin nombre';
  const haceRato = iso => {
    const m = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
    return !iso ? '' : m < 1 ? 'ahora' : m < 60 ? `hace ${m} min` : m < 1440 ? `hace ${Math.round(m / 60)} h` : fCorta(String(iso).slice(0, 10));
  };

  function cargarPorImprimir() {
    return llamar('bdPorImprimir', ses.sedeId).then(l => { piLista = l; pintarPorImprimir(); })
      .catch(() => { if (piLista === null) { piLista = []; pintarPorImprimir(); } });
  }

  // Filtrados y en orden: por persona y del más viejo al más nuevo (así se entregan por persona)
  function filtrarPorImprimir() {
    const pal = sinTilde(piF.q.trim()).split(/\s+/).filter(Boolean);
    return (piLista || []).filter(e => (!piF.quien || quienHizo(e) === piF.quien)
      && (!pal.length || pal.every(w => sinTilde(`${e.id} ${e.codigo} ${e.codigoNutresa} ${e.producto}`).includes(w))))
      .sort((a, b) => quienHizo(a).localeCompare(quienHizo(b)) || String(a.creado).localeCompare(String(b.creado)));
  }

  function panelPorImprimir() {
    const tam = leerLS('rtTam') === '10x15' ? '10x15' : 'carta';
    return `<section class="card col gap8 pi-card" aria-label="Por imprimir">
      <div class="fila-sb gap8"><span class="h3">Por imprimir <span class="pi-n" id="piN">${piLista ? piLista.length : '…'}</span></span>
        <span class="pi-vivo" id="piVivo" title="Se actualiza solo cuando alguien guarda un rótulo">${vivoOk ? '● En vivo' : ''}</span></div>
      <div class="pi-filtros">
        <select id="piQuien" class="campo" aria-label="Filtrar por persona">${opcionesQuien()}</select>
        <input id="piQ" class="campo" placeholder="Buscar producto o rótulo" value="${esc(piF.q)}" autocomplete="off" aria-label="Buscar en por imprimir">
      </div>
      <div id="piCaja">${listaPorImprimir()}</div>
      <div class="pi-pie">
        <select id="piTam" class="campo" aria-label="Tamaño del papel">
          <option value="carta" ${tam === 'carta' ? 'selected' : ''}>Hoja carta</option>
          <option value="10x15" ${tam === '10x15' ? 'selected' : ''}>Etiqueta 15×10</option></select>
        <span id="piBtnCaja">${botonPorImprimir()}</span>
      </div>
    </section>`;
  }

  function opcionesQuien() {
    const cuenta = {};
    (piLista || []).forEach(e => { const q = quienHizo(e); cuenta[q] = (cuenta[q] || 0) + 1; });
    if (piF.quien && !cuenta[piF.quien]) piF.quien = '';
    return `<option value="">Todas las personas</option>` + Object.keys(cuenta).sort().map(q =>
      `<option value="${esc(q)}" ${piF.quien === q ? 'selected' : ''}>${esc(q)} (${cuenta[q]})</option>`).join('');
  }

  function listaPorImprimir() {
    if (piLista === null) return '<div class="cargando">Cargando…</div>';
    const l = filtrarPorImprimir();
    if (!l.length) return `<p class="muted small pi-vacio">${piLista.length ? 'Nada con ese filtro.' : 'Todo está impreso. Lo que guarden en planta aparece aquí solo.'}</p>`;
    let grupo = '';
    return `<div class="pi-lista">${l.map(e => {
      const q = quienHizo(e), cab = q !== grupo ? `<div class="pi-grupo">${esc(q)}</div>` : '';
      grupo = q;
      return `${cab}<div class="pi-fila">
        <span class="col flex1" style="min-width:0"><b class="pi-prod">${esc(e.id)} · ${esc(e.producto)}</b>
          <span class="muted small">${e.tipo === 'PESO' ? kg(e.total) : e.cajas + ' cj · ' + e.total + ' und'} · vence ${fCorta(e.vencimiento)} · ${haceRato(e.creado)}</span></span>
        <button class="btn btn-sec btn-mini" onclick="imprimirUnoPendiente('${esc(e.id)}')" aria-label="Imprimir ${esc(e.id)}">Imprimir</button>
      </div>`;
    }).join('')}</div>`;
  }

  function botonPorImprimir() {
    const n = piLista ? filtrarPorImprimir().length : 0;
    return `<button class="btn btn-pri" ${n ? '' : 'disabled'} onclick="imprimirPendientes()">${n ? `Imprimir ${piF.quien || piF.q ? 'estos' : 'todo'} (${n})` : 'Imprimir todo'}</button>`;
  }

  function pintarPorImprimir() {
    if (!$('piCaja')) return;
    $('piCaja').innerHTML = listaPorImprimir();
    $('piBtnCaja').innerHTML = botonPorImprimir();
    $('piN').textContent = piLista ? piLista.length : '…';
    if (document.activeElement !== $('piQuien')) $('piQuien').innerHTML = opcionesQuien();
  }

  function enlazarPorImprimir() {
    if (!$('piQ')) return;
    $('piQ').addEventListener('input', () => { piF.q = $('piQ').value; pintarPorImprimir(); });
    $('piQuien').addEventListener('change', () => { piF.quien = $('piQuien').value; pintarPorImprimir(); });
    $('piTam').addEventListener('change', () => guardarLS('rtTam', $('piTam').value));
  }

  function imprimirPendientes() {
    const l = filtrarPorImprimir();
    if (l.length) imprimirDeCola(l);
  }
  function imprimirUnoPendiente(id) {
    const e = (piLista || []).find(x => x.id === id);
    if (e) imprimirDeCola([e]);
  }
  function imprimirDeCola(l) {
    const tam = $('piTam') ? $('piTam').value : (leerLS('rtTam') || 'carta');
    guardarLS('rtTam', tam);
    imprimirRotulo(l, 1, tam);   // registra quién y cuándo imprimió
    const ids = new Set(l.map(e => e.id));
    piLista = piLista.filter(e => !ids.has(e.id));
    pintarPorImprimir();
    toast(`${l.length} rótulo${l.length === 1 ? '' : 's'} enviado${l.length === 1 ? '' : 's'} a la impresora`, 'ok');
  }

  /* ================= En vivo: lo que hace otra persona aparece enseguida ================= */
  let vivoOk = false, vivoIniciado = false, vivoTimer = null, vivoPend = false;
  const vivoCambios = new Set();
  const TABLAS_SEDE = ['inventario', 'movimientos', 'espacios', 'sede_config', 'etiquetas', 'codigos_ubicacion'];

  function iniciarVivo() {
    if (vivoIniciado) return;
    vivoIniciado = true;
    const conectar = () => llamar('escucharCambios', (tabla, estado) => {
      if (tabla === '_estado') {
        const antes = vivoOk;
        vivoOk = estado === 'SUBSCRIBED';
        if ($('piVivo')) $('piVivo').textContent = vivoOk ? '● En vivo' : '';
        if (vivoOk && !antes) cambioVivo('*');            // al reconectar trae lo que pasó mientras tanto
        if (estado === 'CHANNEL_ERROR' || estado === 'TIMED_OUT') setTimeout(conectar, 10000);
        return;
      }
      cambioVivo(tabla);
    }).catch(() => setTimeout(conectar, 15000));
    conectar();
    // Respaldo: si el canal en vivo no está conectado, se revisa cada 20 segundos
    setInterval(() => { if (!vivoOk && !document.hidden) cambioVivo('*'); }, 20000);
    document.addEventListener('visibilitychange', () => { if (!document.hidden) cambioVivo('*'); });
    // Lo que quedó esperando (porque la persona estaba escribiendo) se pinta cuando termina
    document.addEventListener('focusout', () => setTimeout(() => { if (vivoPend) repintarVivo(); }, 300));
    setInterval(() => { if (vivoPend) repintarVivo(); }, 5000);
  }

  function cambioVivo(tabla) {
    vivoCambios.add(tabla);
    clearTimeout(vivoTimer);
    vivoTimer = setTimeout(aplicarVivo, 600);   // varios cambios seguidos se traen de una sola vez
  }

  // ¿La persona está llenando algo? Entonces no se le borra lo que escribió
  const ID_FILTROS = ['rcPendQ', 'ptEdQ', 'rcQ', 'scan', 'busca', 'prodQ', 'invQ', 'rtfQ', 'cqQ', 'usQ', 'piQ', 'pBus', 'cicQ', 'cnQ', 'cdEPas', 'cdEAlm', 'cdENiv', 'cpQ', 'cfQ'];
  function ocupado() {
    if (!$('modal').hidden || colocando || flujo) return true;
    const a = document.activeElement;
    if (a && /^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName) && !ID_FILTROS.includes(a.id)) return true;
    return [...document.querySelectorAll('#app main input, #app main textarea')].some(el =>
      !ID_FILTROS.includes(el.id) && !el.closest('.pi-card') &&
      ((el.type === 'checkbox' || el.type === 'radio') ? el.checked !== el.defaultChecked : el.type !== 'file' && el.value !== el.defaultValue));
  }

  async function aplicarVivo() {
    if (!ses || pantalla !== 'app') { vivoCambios.clear(); return; }
    const t = new Set(vivoCambios); vivoCambios.clear();
    const hay = (...xs) => t.has('*') || xs.some(x => t.has(x));
    const tareas = [];
    if (hay(...TABLAS_SEDE)) tareas.push(llamar('bdSede', ses.sedeId).then(setSede).catch(() => {}));
    if (hay('productos')) tareas.push(llamar('bdInicio').then(d => { ini.productos = d.productos; ini.operarios = d.operarios;
      $('dlProductos').innerHTML = d.productos.map(p => `<option value="${esc(p.id + ' · ' + p.nombre)}">`).join(''); }).catch(() => {}));
    if (vista === 'rotulo' && hay('etiquetas')) {
      tareas.push(cargarPorImprimir());
      if (rotulos) tareas.push(Promise.all([llamar('bdEtiquetasTabla', { desde: rtF.desde, hasta: rtF.hasta, sedeId: ses.sedeId }), llamar('bdSinImprimir', ses.sedeId).catch(() => [])])
        .then(([l, pend]) => { const ya = new Set(l.map(e => e.id)); rotulos = l.concat(pend.filter(e => !ya.has(e.id)).map(e => Object.assign({ sede: '' }, e))); })
        .catch(() => {}));
    }
    if (vista === 'recibidor' && hay('recepciones', 'recepcion_items', 'evidencias', 'etiquetas')) {
      if (rcTab === 'recibir') {
        if (rcLista) tareas.push(llamar('bdRecepciones', {}).then(l => { rcLista = l; }).catch(() => {}));
        if (rcAct && rcAct.id) tareas.push(llamar('bdRecepcion', rcAct.id).then(r => { if (rcAct && rcAct.id === r.id) rcAct = r; }).catch(() => {}));
      } else if (rcCal) tareas.push(llamar('bdCalidad', { desde: rcFiltro.desde, hasta: rcFiltro.hasta }).then(d => { rcCal = d; }).catch(() => {}));
    }
    if (vista === 'productos' && ctxCic() && cicLista && hay('ciclicos', 'inv_conteos', 'inv_validaciones', 'inventario', 'conteo_asignaciones')) {
      tareas.push(llamar('bdCiclicos', ses.sedeId).then(l => { cicLista = l; if (cicSel && !l.some(c => c.id === cicSel)) { cicSel = null; cicData = null; } }).catch(() => {}));
      if (cicSel) tareas.push(llamar('bdCiclico', cicSel).then(d => { if (cicSel === d.ciclico.id) cicData = d; }).catch(() => {}));
    }
    if (hay('ciclicos') && invLista && !invNuevo) invLista = null;   // otro creó un inventario
    if (vista === 'productos' && prodTab !== 'totales' && invData && hay('inv_conteos', 'inv_sap', 'inv_sap_cargas', 'inv_validaciones', 'conteo_asignaciones', 'ciclicos', ...TABLAS_SEDE))
      tareas.push(llamar('bdInventarioGeneral', ses.sedeId).then(d => { invData = d; }).catch(() => {}));
    // Le cambiaron los permisos a alguien (puede ser a esta persona): se traen los suyos de una vez, sin recargar
    if (hay('operarios')) revisarSesion();
    if (vista === 'usuarios' && usLista && !usEdit && !pfEdit && hay('operarios'))
      tareas.push(Promise.all([llamar('bdUsuarios', ses.token), pfFalta ? Promise.resolve(pfLista) : llamar('bdPerfiles', ses.token)])
        .then(([u, p]) => { usLista = u; pfLista = p; }).catch(() => {}));
    await Promise.all(tareas);
    vivoPend = true;
    repintarVivo();
  }

  // Pinta lo nuevo: solo la parte que cambió cuando hay formularios en la pantalla
  function repintarVivo() {
    if (!ses || pantalla !== 'app') return;
    if (vista === 'rotulo') {                                         // el formulario de arriba no se toca
      if (rtVista === 'conteo') { vivoPend = false; return; }
      pintarPorImprimir();
      if ($('rtLista') && rotulos) $('rtLista').innerHTML = listaRotulos();
      vivoPend = false; return;
    }
    if (vista === 'productos' && (prodTab === 'inventario' || ctxCic())) ingAvisoVivo();
    if (vista === 'productos' && prodTab === 'inventario' && invSub !== 'reconf') {
      if ($('invTabla') && invData) { if (Date.now() - invRcsHora > 30000) asegurarRcInv(true); pintarInvTabla(); }
      vivoPend = false; return;
    }
    if (vista === 'productos' && ctxCic()) {
      // Si cambió el cíclico abierto (cerrado, borrado) y no está escribiendo, se pinta todo; si no, solo las tablas
      if (!ocupado() && !cicNuevo) { const y = window.scrollY; pintarApp(); window.scrollTo(0, y); vivoPend = false; return; }
      if ($('cicLista')) $('cicLista').innerHTML = listaCiclicos();
      if ($('rcInvLista')) $('rcInvLista').innerHTML = listaRcInv();
      if ($('cicRcLista') && cicData) $('cicRcLista').innerHTML = listaRcCic();
      if ($('cicTabla') && cicData) $('cicTabla').innerHTML = tablaCiclico();
      if ($('cicAereo') && cicData) $('cicAereo').innerHTML = aereoCiclicoHtml();
      vivoPend = false; return;
    }
    if (vista === 'productos' && $('prodLista')) { $('prodLista').innerHTML = listaProdHtml(); vivoPend = false; return; }
    if (vista === 'recibidor' && rcTab !== 'recibir' && $('calCaja')) { if (rcCal) $('calCaja').innerHTML = tablaRc(); vivoPend = false; return; }
    if (vista === 'usuarios' && !usEdit && !pfEdit && usTab === 'usuarios' && $('usTabla')) { $('usTabla').innerHTML = filasUsuarios(); vivoPend = false; return; }
    if (vista === 'usuarios' && (usEdit || pfEdit)) { vivoPend = false; return; }
    if (ocupado()) return;                                            // se pinta cuando termine de escribir
    const y = window.scrollY;
    pintarApp();
    window.scrollTo(0, y);
    vivoPend = false;
  }

  // Trae lo último en segundo plano por si otra persona movió algo
  function refrescar() {
    llamar('bdSede', ses.sedeId).then(d => {
      setSede(d);
      const activo = document.activeElement;
      const escribiendo = activo && activo.tagName === 'INPUT' && activo.id !== 'scan';
      if (pantalla === 'app' && $('modal').hidden && !escribiendo && !colocando) pintarApp();
    }).catch(() => {});
  }

  setInterval(() => { if (pantalla === 'app' && vista === 'mapa') refrescar(); }, 60000);/* ================= Vista de frente de una posición ================= */
  // Cada espacio se nombra como siempre (1A, 2B, Picking A) y al lado, pequeño, su número del código (nivel-posición: 02-01)
  const nombreEsp = e => etiqueta(e);
  function numEsp(e) {
    const p = String(cuNuevo(e.id) || '').split('-');
    return p.length >= 4 ? p.slice(2).join('-') : '';
  }
  function vistaPosicion(conVolver) {
    if (!posSel) return panelZonas();
    const r = sede.rackPorId[posSel.rackId];
    const z = sede.zonaPorId[r.zonaId];
    const esps = espaciosDe(r.id, posSel.posicion);
    const niveles = [...new Set(esps.map(e => e.nivel))].sort((a, b) => b - a);
    const doble = r.fondo === 'D';

    let h = `<div class="card col gap12">`;
    if (conVolver) h += `<button class="btn btn-sec" onclick="cerrarPos()">← Volver al mapa</button>`;
    h += `<div class="fila-sb inicio">
        <div class="col gap4">
          <span class="muted small fila gap8"><span class="punto" style="background:${esc(z.color)}"></span>${esc(z.nombre)} · ${esc(r.nombre)}</span>
          <span class="h2">Posición ${posSel.posicion}</span>
          <span class="muted small mono-c">${esc(posCodigo(r.id, posSel.posicion))}${espSel ? " · " + esc(cu(espSel)) : ""}</span>
        </div>
        <div class="pos-nav" role="group" aria-label="Posiciones de al lado">
          <button class="btn btn-sec" onclick="posVecina(-1)" ${posSel.posicion <= 1 ? 'disabled' : ''} aria-label="Posición anterior">‹ ${posSel.posicion > 1 ? posSel.posicion - 1 : ''}</button>
          <button class="btn btn-sec" onclick="posVecina(1)" ${posSel.posicion >= r.posiciones ? 'disabled' : ''} aria-label="Posición siguiente">${posSel.posicion < r.posiciones ? posSel.posicion + 1 : ''} ›</button>
        </div>
      </div>`;

    if (!esps.length) {
      h += puede('estructura') ? formNiveles(r) : '<p class="muted">Esta posición todavía no tiene niveles. Pídele a quien maneja el plano que los cree.</p>';
    } else {
      h += `<div class="frente">
        ${niveles.map(n => `
          <div class="fr-fila">
            <span class="fr-n">${n === 0 ? 'Nivel 1 · Picking' : 'Nivel ' + n}</span>
            <div class="fr-nivel">
              ${(doble ? [['Fondo', ['C', 'D']], ['Frente', ['A', 'B']]] : [['', ['A', 'B']]]).map(([txt, letras]) => `
                <div class="fr-sub">${doble ? `<span>${txt}</span>` : ''}
                  <div class="fr-lados" style="flex:1">${letras.map(l => {
                    const e = esps.find(x => x.nivel === n && x.lado === l);
                    if (!e) return '<span class="fr-no">No existe</span>';
                    const nom = nombreEsp(e);
                    if (sede.bloqueos[e.id]) return `<button class="fr-esp fr-bloq ${espSel === e.id ? 'sel' : ''}" onclick="selEsp('${esc(e.id)}')"
                      aria-label="${esc(nom)}: bloqueado, ${esc(sede.bloqueos[e.id])}" title="No se puede poner producto aquí"><b>${esc(nom)}</b><span>⛔ ${esc(sede.bloqueos[e.id])}</span></button>`;
                    const ls = fefo(lineasDe(e.id));
                    const res = !ls.length ? 'Vacío' : ls.map(l => esc(l.productoId + ' ' + l.nombre)).join(' · ');
                    // Con producto: el código Atlantic y el nombre, en letra más pequeña
                    return `<button class="fr-esp t-${estadoDe(ls)} ${espSel === e.id ? 'sel' : ''}" onclick="selEsp('${esc(e.id)}')"
                      aria-label="${esc(nom)}: ${res}"><b>${esc(nom)}${numEsp(e) ? ` <small class="fr-num">${esc(numEsp(e))}</small>` : ''}${ls.length > 1 ? ` <small class="fr-cupo">${ls.length}/${maxEsp()}</small>` : ''}</b>${
                      ls.length ? ls.map(l => `<span class="fr-prod"><b class="fr-cod">${esc(l.productoId)}</b> ${esc(l.nombre)}</span>`).join('') : '<span>Vacío</span>'}</button>`;
                  }).join('')}</div>
                </div>`).join('')}
            </div>
          </div>`).join('')}
        <div class="fr-piso"></div>
      </div>`;
      h += listaProductos(esps);
    }
    const codPos = posCodigo(r.id, posSel.posicion);
    const eSel = espSel && sede.espPorId[espSel];
    const cbTxt = eSel ? cu(eSel.id) : codPos;
    h += `<div class="estructura col gap8">
      <span class="h3">Código de barras</span>
      <div class="cb-caja"><svg data-cb="${esc(cbTxt)}" role="img" aria-label="Código ${esc(cbTxt)}"></svg></div>

      <span class="muted small">${eSel ? 'Código de ' + esc(etiqueta(eSel)) + '. Toca el mismo espacio otra vez para ver el de la posición.' : 'Código de la posición. Toca un nivel para ver su código.'}</span>
      <div class="fila wrap-f gap8">
        <button class="btn btn-sec" onclick="imprimirEtiquetas(etiquetasPosicion('${esc(r.id)}', ${posSel.posicion}, false))">Imprimir etiqueta</button>
        ${esps.length ? `<button class="btn btn-sec" onclick="imprimirEtiquetas(etiquetasPosicion('${esc(r.id)}', ${posSel.posicion}, true))">Con niveles</button>` : ''}
      </div>
    </div>`;
    if (esps.length && puede('estructura')) h += estructuraHtml(r, esps, niveles, doble);
    return h + `</div>`;
  }

  // Panel lateral cuando no hay posición elegida: zonas con su ocupación y lo que vence pronto
  function panelZonas() {
    let h = `<div class="card col gap8">
      <span class="h3">Zonas</span>
      <span class="muted small">Toca una posición del plano o escanéala para verla de frente.</span>`;
    sede.zonas.forEach(z => {
      const esps = sede.espacios.filter(e => sede.rackPorId[e.rackId] && sede.rackPorId[e.rackId].zonaId === z.id);
      const ocup = esps.filter(e => lineasDe(e.id).length).length;
      const pct = esps.length && ocup ? Math.max(1, Math.round(ocup * 100 / esps.length)) : 0;
      h += `<div class="col gap4" style="border-top:1px solid var(--borde);padding-top:8px">
        <div class="fila-sb small"><span class="fila gap8"><span class="punto" style="background:${esc(z.color)}"></span><b>${esc(z.nombre)}</b></span>
          <span class="muted">${ocupacionZona(z)}</span></div>
        <div style="height:6px;border-radius:3px;background:var(--seg);display:flex"><div style="width:${pct}%;border-radius:3px;background:var(--pri)"></div></div>
      </div>`;
    });
    h += `</div>`;
    const prox = sede.lineas.map(l => ({ l, d: dias(l.vencimiento) }))
      .filter(x => x.d !== null && x.d <= DIAS_ALERTA).sort((a, b) => a.d - b.d).slice(0, 10);
    h += `<div class="card col gap4 mt12"><span class="h3">Próximos a vencer</span>`;
    h += prox.length ? prox.map(({ l, d }) => {
      const e = sede.espPorId[l.ubicacionId];
      if (!e) return '';
      return `<button class="alerta" onclick="abrirPos('${esc(e.rackId)}', ${e.posicion}, '${esc(e.id)}')">
        <span><span class="fuerte">${esc(l.nombre)}</span> · ${esc(sede.rackPorId[e.rackId].nombre)} P${e.posicion} · ${esc(etiqueta(e))}</span>
        <span class="${d < 0 ? 'txt-rojo' : 'txt-naranja'}">${d < 0 ? 'Vencido' : fFecha(l.vencimiento, true)}</span></button>`;
    }).join('') : `<span class="muted small">Nada por vencer en los próximos ${DIAS_ALERTA} días.</span>`;
    return h + `</div>`;
  }

  function listaProductos(esps) {
    const sel = espSel && esps.find(e => e.id === espSel);
    const lista = sel ? [sel] : [...esps].sort((a, b) => b.nivel - a.nivel || a.lado.localeCompare(b.lado));
    const items = [];
    lista.forEach(e => fefo(lineasDe(e.id)).forEach(l => items.push({ l, e })));
    let h = `<div class="fila-sb"><span class="h3">${sel ? 'En ' + esc(nombreEsp(sel)) : 'Productos en esta posición'}</span>
      ${sel ? `<button class="link" onclick="selEsp(null)">Ver todos</button>` : ''}</div>`;
    if (sel && sede.bloqueos[sel.id]) h += `<span class="txt-naranja fuerte">⛔ ${esc(etiqueta(sel))} está bloqueado (${esc(sede.bloqueos[sel.id])}): aquí no se puede poner producto.</span>`;
    else if (sel && moviendo) h += sel.id === moviendo.origenId
      ? `<span class="txt-naranja fuerte">Ese es el espacio de origen; elige otro.</span>`
      : `<button class="btn btn-pri btn-xl" onclick="moverAqui(this)">Mover aquí: ${moviendo.cantidad} ${moviendo.unidad === 'CAJA' ? 'cj' : 'und'} a ${esc(etiqueta(sel))}</button>`;
    else if (moviendo) h += `<span class="txt-naranja fuerte">Toca el espacio (por ejemplo 2A) a donde vas a mover ${esc(moviendo.nombre)}.</span>`;
    else if (sel && ubicando) h += `<button class="btn btn-ent-solido btn-xl" onclick="ponerAqui(this)">Poner aquí: ${ubicando.cajas} cj de ${esc(ubicando.producto)} en ${esc(etiqueta(sel))}</button>`;
    else if (sel && !sinCupo(sel.id) && (puede('ubicar') || puede('carga_manual'))) {
      const n = lineasDe(sel.id).length;
      if (n) h += `<span class="muted small">Aquí caben hasta ${maxEsp()} productos: van ${n}.</span>`;
      if (puede('ubicar')) h += `<button class="btn btn-ent-solido btn-xl" onclick="abrirPonerRotulo()">+ ${n ? 'Agregar otro rótulo' : 'Poner un rótulo'} en ${esc(etiqueta(sel))}</button>`;
      if (puede('carga_manual')) h += `<button class="btn btn-sec btn-xl mt8" onclick="abrirCargaManual()">Cargar sin código de barras</button>`;
    }
    else if (ubicando) h += `<span class="txt-naranja fuerte">Toca el espacio (por ejemplo 2A) donde vas a poner ${esc(ubicando.producto)}.</span>`;
    h += items.length
      ? items.map(({ l, e }) => tarjetaLinea(l, e)).join('')
      : `<span class="muted">${sel ? 'Este espacio está vacío.' : 'Toca un nivel (por ejemplo 2A) para agregarle productos.'}</span>`;
    return h;
  }

  function tarjetaLinea(l, e) {
    const i = sede.lineas.indexOf(l);
    return `<div class="linea">
      <div class="fila gap10 inicio">
        <span class="chip">${esc(nombreEsp(e))}</span>
        <div class="col flex1 gap4">
          <span class="nombre">${esc(l.nombre)}</span>
          <span class="small">Cód. Atlantic <b>${esc(l.productoId)}</b></span>
          <span class="muted small">Lote ${esc(l.lote || '—')} · Vence ${fFecha(l.vencimiento)}</span>
        </div>
        ${tagVence(dias(l.vencimiento), true)}
      </div>
      <div class="linea-cant">${cant(l)}</div>
      ${puede('salida') || puede('mover') ? `<div class="${puede('salida') && puede('mover') ? 'dos' : 'col'}">
        ${puede('salida') ? `<button class="btn btn-sal" onclick="confirmarSalida(${i})">− Salida</button>` : ''}
        ${puede('mover') ? `<button class="btn btn-mov" onclick="abrirMover(${i})">⇄ Mover</button>` : ''}
      </div>` : ''}
    </div>`;
  }

  /* ================= Estructura de la posición (jefe) ================= */
  function estructuraHtml(r, esps, niveles, doble) {
    const vacia = !esps.some(e => lineasDe(e.id).length);
    const normales = niveles.filter(n => n > 0).length;
    const texto = niveles.length
      ? `${normales} ${normales === 1 ? 'nivel' : 'niveles'}${niveles.includes(0) ? ' + picking' : ''} · ${doble ? 'doble fondo (A-B-C-D)' : 'sin doble fondo (A-B)'}`
      : 'Sin niveles';
    // Plegada: solo la ve quien tiene el permiso «Estructura de la posición», y se abre al tocarla
    return `<details class="estructura est-det"><summary><span class="h3">Estructura</span> <span class="muted small">${texto}</span></summary><div class="col gap8 mt8">
      <div class="fila wrap-f gap8">
        <button class="btn btn-sec" onclick="pedirNivel()">+ Agregar nivel</button>
        ${niveles.length ? `<button class="btn btn-sec" onclick="quitarNivel()">− Quitar nivel de arriba</button>` : ''}
        <button class="btn btn-sec" onclick="abrirRackModal('${esc(r.id)}')">Niveles de toda la fila</button>
        ${vacia ? `<button class="btn btn-sal" onclick="desactivarPos()">Quitar esta posición</button>` : ''}
      </div>
      ${bloqueoHtml(esps)}
    </div></details>`;
  }

  // Bloquear espacios que no se pueden usar (un aire acondicionado, una columna…): no deja poner producto ahí
  function bloqueoHtml(esps) {
    const e = espSel && sede.espPorId[espSel];
    const bloqs = esps.filter(x => sede.bloqueos[x.id]);
    return `<div class="col gap8 mt8"><span class="lbl">Espacios que no se pueden usar</span>
      ${e ? (sede.bloqueos[e.id]
        ? `<div class="fila gap8 wrap-f"><span class="small">⛔ <b>${esc(etiqueta(e))}</b> bloqueado: ${esc(sede.bloqueos[e.id])}</span>
            <button class="btn btn-sec btn-mini" onclick="bloquear(['${esc(e.id)}'], null)">Desbloquear</button></div>`
        : `<button class="btn btn-sec" onclick="pedirBloqueo(['${esc(e.id)}'], '${esc(etiqueta(e))}')">Bloquear ${esc(etiqueta(e))}</button>`)
        : '<span class="muted small">Toca un espacio arriba para bloquearlo, o bloquea toda la posición.</span>'}
      ${esps.length > bloqs.length ? `<button class="btn btn-sec" onclick="pedirBloqueo(${esc(JSON.stringify(esps.filter(x => !sede.bloqueos[x.id]).map(x => x.id)))}, 'toda la posición')">Bloquear toda la posición</button>` : ''}
      ${bloqs.length > 1 ? `<button class="btn btn-sec" onclick="bloquear(${esc(JSON.stringify(bloqs.map(x => x.id)))}, null)">Desbloquear toda la posición</button>` : ''}
    </div>`;
  }
  function pedirBloqueo(ids, que) {
    abrirModal(`<div class="fila-sb"><span class="h2">Bloquear ${esc(que)}</span>${btnCerrar()}</div>
      <span class="small mt8">Queda marcado en el plano y nadie puede poner producto ahí hasta que se desbloquee.</span>
      <label class="lbl mt12" for="blMot">¿Por qué no se puede usar?</label>
      <div class="fila gap8 wrap-f">${['Aire acondicionado', 'Columna', 'Tablero eléctrico', 'Daño en el rack'].map(t =>
        `<button type="button" class="chip-btn" onclick="$('blMot').value='${t}'">${t}</button>`).join('')}</div>
      <input id="blMot" class="campo mt8" placeholder="Escribe el motivo" autocomplete="off">
      <p id="fErr" class="error" hidden></p>
      <button class="btn btn-pri btn-xl mt16" onclick="if (!$('blMot').value.trim()) { $('blMot').focus(); return errForm('Escribe el motivo.'); } bloquear(${esc(JSON.stringify(ids))}, $('blMot').value.trim(), this)">Bloquear</button>`);
  }
  function bloquear(ids, motivo, boton) {
    accion('bdBloquearEspacios', { sedeId: ses.sedeId, ids, motivo }, motivo ? 'Bloqueado: ya no se puede poner producto ahí' : 'Desbloqueado', boton);
  }

  // Llama al servidor, actualiza la sede y vuelve a pintar
  function accion(fn, datos, mensaje, boton) {
    if (boton) { boton.disabled = true; boton.dataset.txt = boton.textContent; boton.textContent = 'Guardando…'; }
    return llamar(fn, datos)
      .then(d => { setSede(d); cerrarModal(); toast(mensaje, 'ok'); pintarApp(); })
      .catch(e => {
        if (boton) { boton.disabled = false; boton.textContent = boton.dataset.txt; }
        if (!$('modal').hidden && $('fErr')) errForm(e.message); else toast(e.message, 'error');
      });
  }

  function opcion(nombre, valor, titulo, detalle, marcado) {
    return `<label class="opcion"><input type="radio" name="${nombre}" value="${valor}" ${marcado ? 'checked' : ''}>
      <span>${titulo}${detalle ? `<small>${detalle}</small>` : ''}</span></label>`;
  }
  const valorRadio = n => { const x = document.querySelector(`input[name="${n}"]:checked`); return x ? x.value : null; };

  // Formulario dentro de la vista cuando la posición está en blanco
  function formNiveles(r) {
    return `<div class="col gap8">
      <span class="h3">Esta posición está en blanco</span>
      <span class="muted small">Primero crea sus niveles (de abajo hacia arriba) y luego agrega los productos en cada uno.</span>
      <label class="lbl" for="nNiv">¿Cuántos niveles tiene? (sin contar el picking)</label>
      <span class="muted small">El nivel 1 es el picking. Los demás se crean desde el nivel 2 hacia arriba.</span>
      <div class="fila gap8">
        <button class="btn btn-sec" style="min-width:56px;font-size:20px" onclick="pasoNiv(-1)" aria-label="Menos niveles">−</button>
        <input id="nNiv" class="campo centro" type="number" inputmode="numeric" min="0" max="20" value="${leerLS('ultNiv') ?? 4}" style="font-size:20px;font-weight:700">
        <button class="btn btn-sec" style="min-width:56px;font-size:20px" onclick="pasoNiv(1)" aria-label="Más niveles">+</button>
      </div>
      <span class="lbl">¿El primer nivel de abajo es picking?</span>
      <div class="opciones">${opcion('npk', 'si', 'Sí, tiene picking', 'El nivel 1 (piso), donde se dejan los pedidos', true)}${opcion('npk', 'no', 'No', 'Empieza en el nivel 2')}</div>
      <span class="muted small">Esta fila es ${r.fondo === 'D' ? '<b>doble fondo</b>: cada nivel tendrá A, B, C y D' : '<b>sin doble fondo</b>: cada nivel tendrá A y B'}.</span>
      <span class="lbl">¿Dónde crearlos?</span>
      <div class="opciones">
        ${opcion('nDonde', 'fila', 'Toda la fila', 'Todas las posiciones en blanco de ' + esc(r.nombre), leerLS('nDonde') !== 'pos')}
        ${opcion('nDonde', 'pos', 'Solo esta posición', 'Posición ' + posSel.posicion, leerLS('nDonde') === 'pos')}
      </div>
      <button class="btn btn-pri btn-xl" onclick="crearNivelesPos(this)">Crear niveles</button>
    </div>`;
  }

  function pasoNiv(d) {
    const i = $('nNiv');
    i.value = Math.max(0, Math.min(20, (Number(i.value) || 0) + d));
  }

  function crearNivelesPos(boton) {
    if (sinPermiso('estructura')) return;
    const niveles = Number($('nNiv').value);
    guardarLS('ultNiv', niveles);
    guardarLS('nDonde', valorRadio('nDonde'));
    accion('bdCrearNiveles', {
      sedeId: ses.sedeId, rackId: posSel.rackId, posicion: posSel.posicion,
      niveles, picking: valorRadio('npk') === 'si',
      todoRack: valorRadio('nDonde') !== 'pos'
    }, 'Niveles creados. Ahora toca un nivel para agregar productos.', boton);
  }

  function pedirNivel() {
    if (sinPermiso('estructura')) return;
    const esps = espaciosDe(posSel.rackId, posSel.posicion);
    const datos = { sedeId: ses.sedeId, rackId: posSel.rackId, posicion: posSel.posicion };
    if (esps.length) return accion('bdAgregarNivel', datos, 'Nivel agregado');

    // Primer nivel: sugerimos que sea el picking
    abrirModal(`
      <div class="fila-sb"><span class="h2">Primer nivel de la posición ${posSel.posicion}</span>${btnCerrar()}</div>
      <span class="lbl">¿Este primer nivel es el picking?</span>
      <span class="muted small" style="margin-bottom:8px">El picking es la parte de abajo, donde se dejan los pedidos listos para despachar.</span>
      <div class="opciones">
        ${opcion('pk', 'si', 'Sí, es picking', 'Sugerido', true)}
        ${opcion('pk', 'no', 'No, empieza en el nivel 2', '')}
      </div>
      <p id="fErr" class="error" hidden></p>
      <div class="dos mt16">
        <button class="btn btn-sec btn-xl" onclick="cerrarModal()">Cancelar</button>
        <button class="btn btn-pri btn-xl" onclick="confirmarPrimerNivel(this)">Agregar</button>
      </div>`);
  }

  function confirmarPrimerNivel(boton) {
    accion('bdAgregarNivel', {
      sedeId: ses.sedeId, rackId: posSel.rackId, posicion: posSel.posicion,
      picking: valorRadio('pk') === 'si'
    }, 'Nivel agregado', boton);
  }

  function quitarNivel() {
    if (sinPermiso('estructura')) return;
    if (!confirm('¿Quitar el nivel de más arriba de esta posición? Solo se puede si está vacío.')) return;
    accion('bdQuitarNivel', { sedeId: ses.sedeId, rackId: posSel.rackId, posicion: posSel.posicion }, 'Nivel quitado');
  }

  function desactivarPos() {
    if (sinPermiso('estructura')) return;
    if (!confirm('¿Quitar esta posición del rack? Úsalo donde no hay espacio real (una columna, una puerta).')) return;
    const d = { sedeId: ses.sedeId, rackId: posSel.rackId, posicion: posSel.posicion, activa: false };
    posSel = null; espSel = null;
    accion('bdPosicionActiva', d, 'Posición quitada');
  }

  // Niveles de toda la fila (o de una posición): queda exactamente con los niveles que se elijan
  let rn = null;   // { rackId, niv, pk, donde }
  function abrirRackModal(rackId) {
    if (sinPermiso('estructura')) return;
    const r = sede.rackPorId[rackId];
    // Lo más común hoy en la fila
    const cuenta = {};
    for (let p = 1; p <= r.posiciones; p++) {
      if (r.omitidas.includes(p)) continue;
      const ns = [...new Set(espaciosDe(r.id, p).map(e => e.nivel))];
      const k = `${ns.filter(n => n > 0).length}|${ns.includes(0) ? 1 : 0}`;
      cuenta[k] = (cuenta[k] || 0) + 1;
    }
    const comun = (Object.entries(cuenta).sort((a, b) => b[1] - a[1])[0] || ['4|1'])[0].split('|').map(Number);
    rn = { rackId, niv: comun[0] || 4, pk: comun[1] === 1 || !Object.keys(cuenta).length, donde: posSel && posSel.rackId === rackId ? 'fila' : 'fila', cuenta };
    pintarRackModal();
  }
  function rnCalculo() {
    const r = sede.rackPorId[rn.rackId];
    const lista = (rn.pk ? [0] : []).concat(Array.from({ length: rn.niv }, (_, i) => i + 2));
    const ps = [];
    for (let p = 1; p <= r.posiciones; p++) if (!r.omitidas.includes(p) && (rn.donde === 'fila' || (posSel && p === posSel.posicion))) ps.push(p);
    let agrega = 0; const quita = [], llenos = [];
    ps.forEach(p => {
      const esps = espaciosDe(r.id, p);
      lista.forEach(n => r.lados.forEach(l => { if (!esps.some(e => e.nivel === n && e.lado === l)) agrega++; }));
      esps.filter(e => !lista.includes(e.nivel) || !r.lados.includes(e.lado)).forEach(e => { quita.push(e); if (lineasDe(e.id).length) llenos.push(e); });
    });
    return { ps, agrega, quita, llenos };
  }
  function pintarRackModal() {
    const r = sede.rackPorId[rn.rackId], k = rnCalculo();
    const hoy = Object.entries(rn.cuenta).sort((a, b) => b[1] - a[1]).map(([x, n]) => { const [nv, pk] = x.split('|').map(Number);
      return `${n} ${n === 1 ? 'posición' : 'posiciones'} con ${nv ? nv + ' nivel' + (nv === 1 ? '' : 'es') : 'sin niveles'}${pk ? ' + picking' : ''}`; }).join(' · ') || 'Sin niveles';
    abrirModal(`<div class="fila-sb"><span class="h2">Niveles de ${esc(r.nombre)}</span>${btnCerrar()}</div>
      <span class="muted small mt8">Hoy: ${hoy}. ${r.fondo === 'D' ? 'Doble fondo (A-B-C-D).' : 'Sin doble fondo (A-B).'}</span>
      <span class="lbl mt12">¿Cuántos niveles? (sin contar el picking)</span>
      <div class="fila gap8">
        <button class="btn btn-sec" style="min-width:56px;font-size:20px" onclick="rn.niv=Math.max(0, rn.niv-1); pintarRackModal()" aria-label="Menos niveles">−</button>
        <input class="campo centro" type="number" min="0" max="20" value="${rn.niv}" style="font-size:20px;font-weight:700;max-width:110px" onchange="rn.niv=Math.max(0, Math.min(20, Math.floor(Number(this.value)) || 0)); pintarRackModal()" aria-label="Niveles">
        <button class="btn btn-sec" style="min-width:56px;font-size:20px" onclick="rn.niv=Math.min(20, rn.niv+1); pintarRackModal()" aria-label="Más niveles">+</button>
      </div>
      <span class="muted small">El picking es el nivel 1; los demás van del 2 hacia arriba${rn.niv ? ` (del 2 al ${rn.niv + 1})` : ''}.</span>
      <label class="fila gap8 mt8"><input type="checkbox" ${rn.pk ? 'checked' : ''} onchange="rn.pk=this.checked; pintarRackModal()"> Tiene picking abajo</label>
      ${posSel && posSel.rackId === rn.rackId ? `<span class="lbl mt12">¿Dónde?</span>
        <div class="seg seg-c"><button class="${rn.donde === 'fila' ? 'on' : ''}" onclick="rn.donde='fila'; pintarRackModal()">Toda la fila</button><button class="${rn.donde === 'pos' ? 'on' : ''}" onclick="rn.donde='pos'; pintarRackModal()">Solo la posición ${posSel.posicion}</button></div>` : ''}
      <div class="info mt12"><span class="small">${k.ps.length} ${k.ps.length === 1 ? 'posición' : 'posiciones'}: se agregan <b>${k.agrega}</b> espacios y se quitan <b>${k.quita.length}</b>.</span>
        ${k.llenos.length ? `<span class="small txt-rojo">No se puede quitar: ${k.llenos.slice(0, 5).map(e => esc(cu(e.id))).join(', ')}${k.llenos.length > 5 ? ` y ${k.llenos.length - 5} más` : ''} tiene${k.llenos.length === 1 ? '' : 'n'} producto. Sácalo primero o deja más niveles.</span>` : ''}</div>
      <p id="fErr" class="error" hidden></p>
      <div class="dos mt16">
        <button class="btn btn-sec btn-xl" onclick="cerrarModal()">Cancelar</button>
        <button class="btn btn-pri btn-xl" ${k.llenos.length || (!k.agrega && !k.quita.length) || (!rn.niv && !rn.pk) ? 'disabled' : ''} onclick="guardarRackNiveles(this)">${!k.agrega && !k.quita.length ? 'Ya está así' : 'Aplicar'}</button>
      </div>`);
  }
  function guardarRackNiveles(boton) {
    const r = sede.rackPorId[rn.rackId];
    accion('bdAjustarNiveles', {
      sedeId: ses.sedeId, rackId: r.id, niveles: rn.niv, picking: rn.pk,
      posiciones: rn.donde === 'pos' && posSel ? [posSel.posicion] : []
    }, rn.donde === 'pos' ? 'Niveles de la posición listos' : `Niveles de ${r.nombre} listos`, boton);
  }/* ================= Configuración (jefe) ================= */
  function vistaConfig() {
    const tabs = [['editor', 'Editor del plano'], ['lista', 'Zonas y filas'], ['codigos', 'Códigos y pasillos'], ['sedes', 'Sedes'], ['ajustes', 'Ajustes']];
    return `<div class="col gap12">
      <span class="h2">Configuración · ${esc(nombreSede(ses.sedeId))}</span>
      <div class="tabs">${tabs.map(([k, t]) => `<button class="tab ${cfgTab === k ? 'on' : ''}" onclick="cfgTab='${k}'; pintarApp()">${t}</button>`).join('')}</div>
      ${cfgTab === 'editor' ? vistaEditor() : cfgTab === 'sedes' ? vistaSedes() : cfgTab === 'ajustes' ? vistaAjustes() : cfgTab === 'codigos' ? vistaCodigos() : vistaConfigLista()}
    </div>`;
  }

  // Ajustes generales (aplican a todas las sedes)
  function vistaAjustes() {
    return `<div class="card col gap8" style="max-width:520px">
      <span class="h3">Productos por espacio</span>
      <span class="muted small">Cuántos productos distintos (o rótulos) se pueden poner en un mismo espacio, por ejemplo en 2A.
        Si bajas el número, los espacios que ya tienen más se quedan como están, pero no reciben más hasta que se desocupen.</span>
      <label class="lbl" for="ajMax">Máximo por espacio</label>
      <div class="fila gap8"><input id="ajMax" type="number" min="1" max="20" step="1" class="campo" style="max-width:120px" value="${maxEsp()}">
        <button class="btn btn-pri" onclick="guardarAjusteMax(this)">Guardar</button></div>
    </div>
    <div class="card col gap8 mt12" style="max-width:520px">
      <div class="fila-sb gap12"><label class="h3" for="ajPas">Usar el pasillo cargado</label>
        <span class="switch"><input type="checkbox" id="ajPas" role="switch" ${usarPasCargado() ? 'checked' : ''} onchange="guardarAjustePasillo(this)"><span></span></span></div>
      <span class="muted small"><b>Encendido:</b> el pasillo de cada producto es el que se cargó en Inventario con «Actualizar almacenes y pasillos» (si un producto no tiene, se usa el del plano).
        <b>Apagado:</b> siempre se usa el pasillo del plano. Aplica al filtro de pasillo de los reconteos, a «Pasillos» del inventario y a Productos totales.</span>
    </div>
    <div class="card col gap8 mt12" style="max-width:520px">
      <div class="fila-sb gap12"><label class="h3" for="ajSon">Sonido</label>
        <span class="switch"><input type="checkbox" id="ajSon" role="switch" ${conSonido() ? 'checked' : ''} onchange="guardarAjusteSonido(this)"><span></span></span></div>
      <span class="muted small">El pitido de la app al escanear, al guardar y en los avisos. Aplica en todos los equipos. ${ayudaHtml('Este interruptor apaga el sonido de la app. El pitido propio del lector del equipo (el escáner de arriba) se apaga en la configuración del escáner del mismo equipo.')}</span>
    </div>`;
  }
  function guardarAjusteSonido(el) {
    const v = el.checked;
    el.disabled = true;
    llamar('bdGuardarParametro', { clave: 'sonido', valor: v, usuario: ses.nombre })
      .then(p => { ini.parametros = p; el.disabled = false; toast(v ? 'Listo: sonido activado' : 'Listo: sonido desactivado', 'ok'); if (v) pitido(); })
      .catch(e => { el.checked = !v; el.disabled = false; toast(e.message, 'error'); });
  }
  function guardarAjustePasillo(el) {
    const v = el.checked;
    el.disabled = true;
    llamar('bdGuardarParametro', { clave: 'pasillo_cargado', valor: v, usuario: ses.nombre })
      .then(p => { ini.parametros = p; ptMemo = null; toast(v ? 'Listo: se usa el pasillo cargado' : 'Listo: se usa el pasillo del plano', 'ok'); pintarApp(); })
      .catch(e => { el.checked = !v; el.disabled = false; toast(e.message, 'error'); });
  }
  function guardarAjusteMax(boton) {
    const v = Number($('ajMax').value);
    if (!(v >= 1 && v <= 20) || Math.round(v) !== v) return toast('Escribe un número entero entre 1 y 20', 'error');
    boton.disabled = true;
    llamar('bdGuardarParametro', { clave: 'max_productos_espacio', valor: v, usuario: ses.nombre })
      .then(p => { ini.parametros = p; toast(`Listo: ahora caben hasta ${maxEsp()} productos por espacio`, 'ok'); pintarApp(); })
      .catch(e => { boton.disabled = false; toast(e.message, 'error'); });
  }

  /* ================= EDITOR DEL PLANO (en computador) ================= */
  let cfgTab = 'editor';      // editor | lista | codigos | sedes | ajustes
  let ed = null;              // borrador del plano mientras se dibuja
  const ED_PASO = 5;          // todo se acomoda de a 5 puntos
  const rej = v => Math.round(v / ED_PASO) * ED_PASO;
  const ED_COLORES = ['#1F9BA6', '#C2185B', '#E65100', '#4A90D9', '#2E7D32', '#6A1B9A', '#F9A825', '#5D4037'];
  const clon = o => JSON.parse(JSON.stringify(o));

  function edDesdeSede() {
    const zonas = sede.zonas.map(z => ({ id: z.id, nombre: z.nombre, color: z.color, x: z.x, y: z.y, ancho: z.ancho, alto: z.alto,
      etqX: z.etqX, etqY: z.etqY, areas: clon(z.areas || []) }));
    // Las zonas que no tenían lugar en el dibujo se ponen abajo, para acomodarlas
    let h = 0;
    zonas.forEach(z => { if (enPlano(z)) h = Math.max(h, z.y + z.alto); });
    let fx = 20;
    zonas.filter(z => !enPlano(z)).forEach(z => { Object.assign(z, { x: fx, y: h + 40, ancho: 300, alto: 220 }); fx += 330; });
    const racks = [];
    zonas.forEach(z => racksEnPlano(z).forEach(({ r, x, y, largo, o, tramos }) => racks.push({
      id: r.id, zonaId: r.zonaId, nombre: r.nombre, posiciones: r.posiciones, fondo: r.fondo, orientacion: o === 'H' ? 'H' : 'V',
      numeracion: r.invertida ? 'INVERTIDA' : 'NORMAL', x, y, largo, tramos: tramos ? clon(tramos) : null, nuevo: false })));
    return { sedeId: ses.sedeId, zonas, racks, muros: clon(sede.muros || []), pasillos: clon(sede.pasillos || []), fondo: sede.fondo ? clon(sede.fondo) : null,
      borrar: { zonas: [], racks: [] }, sel: null, herr: 'mover', zoom: null, cambios: false, sec: 1, fondoModo: false, fondoUrl: null };
  }

  function edIniciar() {
    const guardado = leerLS('planoBorrador:' + ses.sedeId);
    ed = guardado && guardado.sedeId === ses.sedeId ? Object.assign(guardado, { sel: null, herr: 'mover', fondoModo: false, fondoUrl: null, restaurado: true }) : edDesdeSede();
    if (!ed.pasillos) ed.pasillos = clon(sede.pasillos || []);   // borradores de antes no traían pasillos
    if (ed.fondo && ed.fondo.ruta) llamar('bdFondoUrl', ed.fondo.ruta).then(u => { if (ed) { ed.fondoUrl = u; edPintarLienzo(); } }).catch(() => {});
  }
  function edCambio() {
    ed.cambios = true;
    const { sel, herr, fondoModo, fondoUrl, arr, dibujo, areaDe, ...guardar } = ed;
    guardarLS('planoBorrador:' + ses.sedeId, guardar);
    if ($('edEstado')) $('edEstado').innerHTML = edEstadoHtml();
    document.querySelectorAll('.ed-barra .btn').forEach(b => { b.disabled = false; });
  }
  const edEstadoHtml = () => ed.cambios ? '<span class="ed-sin">● Cambios sin guardar</span>' : '<span class="muted small">Todo guardado</span>';

  function edMedidas() {
    let w = 1600, h = 900;
    ed.zonas.forEach(z => [z].concat(z.areas || []).forEach(a => { w = Math.max(w, a.x + a.ancho + 200); h = Math.max(h, a.y + a.alto + 150); }));
    ed.racks.forEach(r => (r.tramos || [r]).forEach(t => { w = Math.max(w, t.x + 300); h = Math.max(h, t.y + (t.largo || 0) + 150); }));
    ed.pasillos.forEach(p => { w = Math.max(w, p.x + p.ancho + 100); h = Math.max(h, p.y + p.alto + 100); });
    if (ed.fondo) { w = Math.max(w, ed.fondo.x + ed.fondo.ancho + 50); h = Math.max(h, ed.fondo.y + ed.fondo.alto + 50); }
    return { w, h };
  }

  function vistaEditor() {
    if (window.innerWidth < 1000) return `<div class="card col gap8"><span class="h3">El editor del plano se usa en un computador</span>
      <span class="muted">Ábrelo desde un PC para dibujar zonas y filas. Desde aquí puedes usar la pestaña «Zonas y filas».</span></div>`;
    if (!ed || ed.sedeId !== ses.sedeId) edIniciar();
    const herr = (k, t, ayuda) => `<button class="ed-herr ${ed.herr === k ? 'on' : ''}" onclick="edHerr('${k}')" title="${ayuda}">${t}</button>`;
    return `<div class="ed">
      <div class="ed-barra">
        <div class="fila gap4 wrap-f">${herr('mover', '✥ Mover y escoger', 'Toca algo para escogerlo y arrástralo para moverlo')}${herr('zona', '▭ + Zona', 'Arrastra en el dibujo para hacer el recuadro de la zona')}${herr('fila', '┃ + Fila', 'Traza la fila de punta a punta dentro de su zona')}${herr('muro', '╱ + Pared', 'Traza la pared o separación')}${herr('pasillo', '▤ + Pasillo', 'Arrastra en el dibujo para marcar el pasillo; después escoges sus filas')}</div>
        <button class="ed-herr ${ed.fondoModo ? 'on' : ''}" onclick="edFondo()" title="Imagen del plano para calcar encima">🖼 Imagen de fondo</button>
        <div class="zoom" role="group" aria-label="Zoom"><button onclick="edZoom(1 / 1.25)" aria-label="Alejar">−</button><button onclick="edZoom(0)">Ajustar</button><button onclick="edZoom(1.25)" aria-label="Acercar">+</button></div>
        <span class="flex1"></span>
        <span id="edEstado">${edEstadoHtml()}</span>
        <button id="edNo" class="btn btn-sec" onclick="edDescartar()" ${ed.cambios ? '' : 'disabled'}>Descartar</button>
        <button id="edOk" class="btn btn-pri" onclick="edGuardar()" ${ed.cambios ? '' : 'disabled'}>Guardar cambios</button>
      </div>
      ${ed.restaurado && ed.cambios ? `<div class="alerta-fefo">Tienes cambios de la vez pasada que no guardaste. Puedes seguir con ellos y guardarlos, o tocar «Descartar».</div>` : ''}
      <div class="ed-cuerpo">
        <div class="ed-wrap" id="edWrap"><div class="ed-sizer" id="edSizer"><div class="ed-lienzo" id="edLienzo"></div></div></div>
        <aside class="ed-panel card" id="edPanel">${edPanelHtml()}</aside>
      </div>
      <input id="edFondoArch" type="file" accept="image/*" class="oculto">
    </div>`;
  }

  function edLienzoHtml() {
    const { w, h } = edMedidas();
    const s = ed.sel || {};
    const esSel = (k, id) => s.k === k && s.id === id ? 'sel' : '';
    let out = '';
    if (ed.fondo && ed.fondoUrl) {
      const f = ed.fondo;
      out += `<img class="ed-fondo ${ed.fondoModo ? 'activo' : ''}" data-k="${ed.fondoModo ? 'fondo' : ''}" src="${esc(ed.fondoUrl)}" alt="" draggable="false"
        style="left:${f.x}px;top:${f.y}px;width:${f.ancho}px;height:${f.alto}px;opacity:${f.opacidad ?? 0.5}">
        ${ed.fondoModo ? `<span class="ed-h" data-k="fondo-tam" style="left:${f.x + f.ancho - 8}px;top:${f.y + f.alto - 8}px"></span>` : ''}`;
    }
    ed.zonas.forEach(z => {
      [{ x: z.x, y: z.y, ancho: z.ancho, alto: z.alto }].concat(z.areas || []).forEach((a, i) => {
        const k = i ? 'area' : 'zona', idA = i ? `${z.id}|${i - 1}` : z.id;
        out += `<div class="ez ${esSel('zona', z.id) || esSel('area', idA)} ${i ? 'parte' : ''}" data-k="${k}" data-id="${esc(idA)}" ${i ? `title="Parte de ${esc(z.nombre)}"` : ''}
          style="left:${a.x}px;top:${a.y}px;width:${a.ancho}px;height:${a.alto}px;border-color:${esc(z.color)};background:${hexA(z.color, .07)}"></div>`;
      });
      (z.areas || []).forEach((a, i) => { if (esSel('area', `${z.id}|${i}`)) out += `<span class="ed-h" data-k="area-tam" data-id="${esc(z.id)}|${i}" style="left:${a.x + a.ancho - 8}px;top:${a.y + a.alto - 8}px" title="Arrastra para cambiar el tamaño"></span>`; });
      if (esSel('zona', z.id)) out += `<span class="ed-h" data-k="zona-tam" data-id="${esc(z.id)}" style="left:${z.x + z.ancho - 8}px;top:${z.y + z.alto - 8}px" title="Arrastra para cambiar el tamaño"></span>`;
    });
    ed.pasillos.forEach(pa => {
      const zc = colorPasillo(pa.filas.map(id => { const r = ed.racks.find(x => x.id === id); return r && ed.zonas.find(z => z.id === r.zonaId); })
        .concat([zonaEn(pa.x + pa.ancho / 2, pa.y + pa.alto / 2)]));
      out += `<div class="ep ${esSel('pasillo', pa.id)}" data-k="pasillo" data-id="${esc(pa.id)}" title="Pasillo ${esc(pa.nombre)} · ${pa.filas.length} fila${pa.filas.length === 1 ? '' : 's'}"
        style="left:${pa.x}px;top:${pa.y}px;width:${pa.ancho}px;height:${pa.alto}px;border-color:${esc(zc)}"><span class="${pa.alto > pa.ancho ? 'vert' : ''}" style="color:${esc(zc)};border-color:${esc(zc)}">Pasillo ${esc(pa.nombre)}</span></div>`;
      if (esSel('pasillo', pa.id)) out += `<span class="ed-h" data-k="pasillo-tam" data-id="${esc(pa.id)}" style="left:${pa.x + pa.ancho - 8}px;top:${pa.y + pa.alto - 8}px" title="Arrastra para cambiar el tamaño"></span>`;
    });
    // Filas del pasillo escogido: se resaltan
    const delPas = new Set(s.k === 'pasillo' ? ((ed.pasillos.find(p => p.id === s.id) || {}).filas || []) : []);
    ed.racks.forEach(r => {
      const grueso = r.fondo === 'D' ? 44 : 20;
      (r.tramos || [{ x: r.x, y: r.y, largo: r.largo, pos: r.posiciones }]).forEach((t, i) => {
        const o = r.tramos ? 'V' : r.orientacion;
        const paso = Math.max(3, t.largo / Math.max(1, t.pos));
        const ancho = t.ancho || grueso;
        out += `<div class="er ${o} ${esSel('fila', r.id)} ${delPas.has(r.id) ? 'en-pas' : ''}" data-k="fila" data-id="${esc(r.id)}" title="${esc(r.nombre)} · ${r.posiciones} posiciones"
          style="left:${t.x}px;top:${t.y}px;${o === 'V' ? `width:${ancho}px;height:${t.largo}px` : `height:${ancho}px;width:${t.largo}px`};
          background:repeating-linear-gradient(${o === 'V' ? 'to bottom' : 'to right'}, var(--er) 0 ${paso - 1}px, var(--er-l) ${paso - 1}px ${paso}px)">
          ${i === 0 ? `<span class="er-n">${esc(r.nombre.replace(/^Fila\s*/i, 'F'))}</span>` : ''}</div>`;
      });
      if (esSel('fila', r.id) && !r.tramos) {
        const fx = r.orientacion === 'V' ? r.x + grueso / 2 - 7 : r.x + r.largo - 7, fy = r.orientacion === 'V' ? r.y + r.largo - 7 : r.y + grueso / 2 - 7;
        out += `<span class="ed-h" data-k="fila-largo" data-id="${esc(r.id)}" style="left:${fx}px;top:${fy}px" title="Arrastra para alargar o acortar"></span>`;
      }
    });
    ed.muros.forEach((m, i) => {
      const [x1, y1, x2, y2] = m, lar = Math.hypot(x2 - x1, y2 - y1), ang = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
      out += `<div class="em ${esSel('muro', i)}" data-k="muro" data-id="${i}" style="left:${x1}px;top:${y1 - 3}px;width:${lar}px;transform:rotate(${ang}deg)"></div>`;
      if (esSel('muro', i)) out += `<span class="ed-h" data-k="muro-a" data-id="${i}" style="left:${x1 - 7}px;top:${y1 - 7}px"></span><span class="ed-h" data-k="muro-b" data-id="${i}" style="left:${x2 - 7}px;top:${y2 - 7}px"></span>`;
    });
    ed.zonas.forEach(z => {
      out += `<div class="ez-lbl ${esSel('zona', z.id)}" data-k="etq" data-id="${esc(z.id)}" style="left:${z.etqX ?? z.x + 6}px;top:${z.etqY ?? z.y + 6}px" title="Arrastra el nombre a donde no tape nada">${esc(z.nombre)}</div>`;
    });
    const d = ed.dibujo;
    if (d) {
      if (d.tipo === 'zona' || d.tipo === 'pasillo' || d.tipo === 'area') out += `<div class="ed-prev" style="left:${Math.min(d.x1, d.x2)}px;top:${Math.min(d.y1, d.y2)}px;width:${Math.abs(d.x2 - d.x1)}px;height:${Math.abs(d.y2 - d.y1)}px"></div>`;
      else {
        const lar = Math.hypot(d.x2 - d.x1, d.y2 - d.y1), ang = Math.atan2(d.y2 - d.y1, d.x2 - d.x1) * 180 / Math.PI;
        out += `<div class="ed-prev linea" style="left:${d.x1}px;top:${d.y1 - 2}px;width:${lar}px;transform:rotate(${ang}deg)"></div>`;
      }
    }
    return { html: out, w, h };
  }

  function edPintarLienzo() {
    const l = $('edLienzo');
    if (!l) return;
    const { html, w, h } = edLienzoHtml();
    l.innerHTML = html;
    if (ed.arr || ed.dibujo) return;   // mientras arrastra, el tamaño y el zoom no cambian (si no, se descuadra)
    l.style.width = w + 'px'; l.style.height = h + 'px';
    l.classList.toggle('dibujando', ed.herr !== 'mover');
    edAjustar();
  }
  function edAjustar() {
    const wrap = $('edWrap'), l = $('edLienzo'), sz = $('edSizer');
    if (!wrap || !l) return;
    const w = parseFloat(l.style.width), h = parseFloat(l.style.height);
    const s = ed.zoom || Math.min(1, (wrap.clientWidth - 4) / w);
    ed.escala = s;
    l.style.transform = `scale(${s})`;
    sz.style.width = w * s + 'px'; sz.style.height = h * s + 'px';
  }
  function edZoom(f) { ed.zoom = f === 0 ? null : Math.min(3, Math.max(0.2, (ed.escala || 1) * f)); edAjustar(); }
  function edHerr(k) {
    ed.herr = k; ed.fondoModo = false;
    if (k !== 'mover') ed.sel = null;
    pintarApp();
    toast({ zona: 'Arrastra en el dibujo para hacer el recuadro de la zona', fila: 'Traza la fila de punta a punta, dentro de su zona', muro: 'Traza la pared de punta a punta', pasillo: 'Arrastra sobre el pasillo; las filas que estén al lado quedan escogidas' }[k] || 'Toca algo para escogerlo y arrástralo para moverlo');
  }

  // Punto del dibujo donde está el mouse
  function edPunto(ev) {
    const r = $('edLienzo').getBoundingClientRect(), s = ed.escala || 1;
    return { x: (ev.clientX - r.left) / s, y: (ev.clientY - r.top) / s };
  }
  const zonaEn = (x, y) => [...ed.zonas].reverse().find(z => [{ x: z.x, y: z.y, ancho: z.ancho, alto: z.alto }].concat(z.areas || [])
    .some(a => x >= a.x && x <= a.x + a.ancho && y >= a.y && y <= a.y + a.alto));

  function enlazarEditor() {
    const l = $('edLienzo');
    if (!l || !ed) return;
    edPintarLienzo();
    l.addEventListener('pointerdown', edAbajo);
    l.addEventListener('pointermove', edMueve);
    l.addEventListener('pointerup', edArriba);
    l.addEventListener('pointercancel', edArriba);
    $('edFondoArch').addEventListener('change', ev => { const f = ev.target.files[0]; ev.target.value = ''; if (f) edSubirFondo(f); });
    if (!enlazarEditor.teclas) {
      enlazarEditor.teclas = true;
      document.addEventListener('keydown', ev => {
        if (!ed || vista !== 'config' || cfgTab !== 'editor' || !$('edLienzo')) return;
        if (/^(INPUT|TEXTAREA|SELECT)$/.test((document.activeElement || {}).tagName || '') || !$('modal').hidden) return;
        if ((ev.key === 'Delete' || ev.key === 'Backspace') && ed.sel) { ev.preventDefault(); edBorrarSel(); }
        else if (ev.key === 'Escape') { ed.sel = null; ed.herr = 'mover'; ed.fondoModo = false; pintarApp(); }
        else if (ed.sel && /^Arrow/.test(ev.key)) {
          ev.preventDefault();
          const p = ev.shiftKey ? 20 : ED_PASO;
          const dx = ev.key === 'ArrowLeft' ? -p : ev.key === 'ArrowRight' ? p : 0, dy = ev.key === 'ArrowUp' ? -p : ev.key === 'ArrowDown' ? p : 0;
          edMoverSel(ed.sel, dx, dy); edCambio(); edPintarLienzo();
        }
      });
    }
  }

  function edAbajo(ev) {
    if (ev.button !== 0) return;
    const p = edPunto(ev), el = ev.target.closest('[data-k]');
    $('edLienzo').setPointerCapture(ev.pointerId);
    if (ed.herr !== 'mover') { ed.dibujo = { tipo: ed.herr, x1: rej(p.x), y1: rej(p.y), x2: rej(p.x), y2: rej(p.y) }; return; }
    if (!el || !el.dataset.k) { if (ed.sel) { ed.sel = null; edPintarLienzo(); $('edPanel').innerHTML = edPanelHtml(); } return; }
    const k = el.dataset.k, id = el.dataset.id;
    const tipo = { zona: 'zona', 'zona-tam': 'zona', etq: 'zona', fila: 'fila', 'fila-largo': 'fila', muro: 'muro', 'muro-a': 'muro', 'muro-b': 'muro', fondo: 'fondo', 'fondo-tam': 'fondo', pasillo: 'pasillo', 'pasillo-tam': 'pasillo', area: 'area', 'area-tam': 'area' }[k];
    const idSel = tipo === 'muro' ? Number(id) : id;
    const cambia = !ed.sel || ed.sel.k !== tipo || ed.sel.id !== idSel;
    if (tipo !== 'fondo') ed.sel = { k: tipo, id: idSel };
    ed.arr = { k, id: idSel, x0: p.x, y0: p.y, antes: clon({ zonas: ed.zonas, racks: ed.racks, muros: ed.muros, pasillos: ed.pasillos, fondo: ed.fondo }), movio: false };
    if (cambia) { edPintarLienzo(); $('edPanel').innerHTML = edPanelHtml(); }
  }

  function edMueve(ev) {
    if (!ed) return;
    const p = edPunto(ev);
    if (ed.dibujo) { ed.dibujo.x2 = rej(p.x); ed.dibujo.y2 = rej(p.y); edPintarLienzo(); return; }
    const a = ed.arr;
    if (!a) return;
    const dx = rej(p.x - a.x0), dy = rej(p.y - a.y0);
    if (!dx && !dy && !a.movio) return;
    a.movio = true;
    // Se parte siempre de cómo estaba al empezar a arrastrar
    ed.zonas = clon(a.antes.zonas); ed.racks = clon(a.antes.racks); ed.muros = clon(a.antes.muros); ed.pasillos = clon(a.antes.pasillos); ed.fondo = a.antes.fondo ? clon(a.antes.fondo) : null;
    const z = ed.zonas.find(x => x.id === a.id), r = ed.racks.find(x => x.id === a.id), m = ed.muros[a.id], pa = ed.pasillos.find(x => x.id === a.id);
    if (a.k === 'zona' || a.k === 'fila' || a.k === 'muro' || a.k === 'fondo' || a.k === 'pasillo') edMoverSel({ k: a.k, id: a.id }, dx, dy);
    else if (a.k === 'pasillo-tam' && pa) { pa.ancho = Math.max(15, pa.ancho + dx); pa.alto = Math.max(15, pa.alto + dy); }
    else if (a.k === 'area') edMoverSel({ k: 'area', id: a.id }, dx, dy);
    else if (a.k === 'area-tam') { const pt = edParte(a.id); if (pt) { pt.a.ancho = Math.max(20, pt.a.ancho + dx); pt.a.alto = Math.max(20, pt.a.alto + dy); } }
    else if (a.k === 'zona-tam' && z) { z.ancho = Math.max(40, z.ancho + dx); z.alto = Math.max(40, z.alto + dy); }
    else if (a.k === 'etq' && z) { z.etqX = (z.etqX ?? z.x + 6) + dx; z.etqY = (z.etqY ?? z.y + 6) + dy; }
    else if (a.k === 'fila-largo' && r) r.largo = Math.max(30, r.largo + (r.orientacion === 'V' ? dy : dx));
    else if (a.k === 'muro-a' && m) { m[0] += dx; m[1] += dy; }
    else if (a.k === 'muro-b' && m) { m[2] += dx; m[3] += dy; }
    else if (a.k === 'fondo-tam' && ed.fondo) { const k = ed.fondo.alto / ed.fondo.ancho; ed.fondo.ancho = Math.max(100, ed.fondo.ancho + dx); ed.fondo.alto = Math.round(ed.fondo.ancho * k); }
    edPintarLienzo();
  }

  function edMoverSel(s, dx, dy) {
    if (s.k === 'zona') {
      const z = ed.zonas.find(x => x.id === s.id);
      if (!z) return;
      z.x += dx; z.y += dy;
      if (z.etqX !== null && z.etqX !== undefined) z.etqX += dx;
      if (z.etqY !== null && z.etqY !== undefined) z.etqY += dy;
      (z.areas || []).forEach(a => { a.x += dx; a.y += dy; });
      ed.racks.filter(r => r.zonaId === z.id).forEach(r => edMoverRack(r, dx, dy));   // sus filas se mueven con ella
      // y los pasillos que están dentro de ella
      ed.pasillos.filter(p => { const cx = p.x + p.ancho / 2, cy = p.y + p.alto / 2; return cx >= z.x - dx && cx <= z.x - dx + z.ancho && cy >= z.y - dy && cy <= z.y - dy + z.alto; })
        .forEach(p => { p.x += dx; p.y += dy; });
    } else if (s.k === 'fila') {
      const r = ed.racks.find(x => x.id === s.id);
      if (r) edMoverRack(r, dx, dy);
    } else if (s.k === 'muro') {
      const m = ed.muros[s.id];
      if (m) { m[0] += dx; m[1] += dy; m[2] += dx; m[3] += dy; }
    } else if (s.k === 'pasillo') {
      const p = ed.pasillos.find(x => x.id === s.id);
      if (p) { p.x += dx; p.y += dy; }
    } else if (s.k === 'area') {
      const pt = edParte(s.id);   // solo se mueve el recuadro de esta parte (sus filas no)
      if (pt) { pt.a.x += dx; pt.a.y += dy; }
    } else if (s.k === 'fondo' && ed.fondo) { ed.fondo.x += dx; ed.fondo.y += dy; }
  }
  function edMoverRack(r, dx, dy) {
    r.x += dx; r.y += dy;
    (r.tramos || []).forEach(t => { t.x += dx; t.y += dy; });
  }

  function edArriba(ev) {
    if (!ed) return;
    try { $('edLienzo').releasePointerCapture(ev.pointerId); } catch (e) { /* nada */ }
    const d = ed.dibujo;
    if (d) { ed.dibujo = null; edCrear(d); return; }
    const a = ed.arr;
    ed.arr = null;
    if (!a || !a.movio) { edPintarLienzo(); return; }
    // Una fila que se suelta dentro de otra zona pasa a esa zona
    if (a.k === 'fila') {
      const r = ed.racks.find(x => x.id === a.id), t = r && (r.tramos ? r.tramos[0] : r);
      const z = t && zonaEn(t.x + 5, t.y + 5);
      if (z && z.id !== r.zonaId) { r.zonaId = z.id; toast(`${r.nombre} quedó en la zona ${z.nombre}`, 'ok'); }
    }
    edCambio();
    edPintarLienzo();
    $('edPanel').innerHTML = edPanelHtml();
  }

  function edCrear(d) {
    const dx = d.x2 - d.x1, dy = d.y2 - d.y1;
    if (d.tipo === 'zona') {
      if (Math.abs(dx) < 40 || Math.abs(dy) < 40) { edPintarLienzo(); return toast('Arrastra un recuadro más grande para la zona', 'error'); }
      const id = 'nueva-' + (ed.sec++);
      const n = ed.zonas.length;
      ed.zonas.push({ id, nombre: 'Zona ' + (n + 1), color: ED_COLORES[n % ED_COLORES.length], x: Math.min(d.x1, d.x2), y: Math.min(d.y1, d.y2),
        ancho: Math.abs(dx), alto: Math.abs(dy), etqX: null, etqY: null, areas: [] });
      ed.sel = { k: 'zona', id };
    } else if (d.tipo === 'fila') {
      const vertical = Math.abs(dy) >= Math.abs(dx), largo = Math.max(Math.abs(dx), Math.abs(dy));
      if (largo < 30) { edPintarLienzo(); return toast('Traza la fila más larga, de punta a punta', 'error'); }
      const x = vertical ? d.x1 : Math.min(d.x1, d.x2), y = vertical ? Math.min(d.y1, d.y2) : d.y1;
      const z = zonaEn(x + 2, y + 2);
      if (!z) { edPintarLienzo(); return toast('Traza la fila dentro de una zona. Si todavía no hay zona, créala primero con «+ Zona».', 'error'); }
      const id = 'nueva-' + (ed.sec++);
      const nFila = ed.racks.filter(r => r.zonaId === z.id).length + 1;
      ed.racks.push({ id, zonaId: z.id, nombre: 'Fila ' + nFila, posiciones: Math.max(1, Math.round(largo / 30)), fondo: 'S', orientacion: vertical ? 'V' : 'H',
        numeracion: 'NORMAL', x, y, largo, tramos: null, nuevo: true, niveles: 4, picking: true });
      ed.sel = { k: 'fila', id };
    } else if (d.tipo === 'area') {
      const z = ed.zonas.find(x => x.id === ed.areaDe);
      if (!z) { edPintarLienzo(); return; }
      if (Math.abs(dx) < 20 || Math.abs(dy) < 20) { edPintarLienzo(); return toast('Arrastra un recuadro más grande para la parte', 'error'); }
      z.areas = z.areas || [];
      z.areas.push({ x: Math.min(d.x1, d.x2), y: Math.min(d.y1, d.y2), ancho: Math.abs(dx), alto: Math.abs(dy) });
      ed.sel = { k: 'area', id: `${z.id}|${z.areas.length - 1}` };
      ed.areaDe = null;
      // Las filas que quedaron dentro de la parte pasan a esta zona
      ed.racks.forEach(r => { const t = r.tramos ? r.tramos[0] : r; if (r.zonaId !== z.id && zonaEn(t.x + 5, t.y + 5) === z) { r.zonaId = z.id; toast(`${r.nombre} quedó en la zona ${z.nombre}`, 'ok'); } });
    } else if (d.tipo === 'pasillo') {
      if (Math.abs(dx) < 15 || Math.abs(dy) < 15) { edPintarLienzo(); return toast('Arrastra un recuadro más grande para el pasillo', 'error'); }
      const caja = { x: Math.min(d.x1, d.x2), y: Math.min(d.y1, d.y2), ancho: Math.abs(dx), alto: Math.abs(dy) };
      const usadas = new Set(ed.pasillos.flatMap(p => p.filas));
      // Las filas que están junto al pasillo (o dentro) quedan escogidas; después se pueden cambiar
      const filas = ed.racks.filter(r => !usadas.has(r.id) && edFilaToca(r, caja, 25)).map(r => r.id);
      const id = 'nuevo-pa-' + (ed.sec++);
      ed.pasillos.push(Object.assign({ id, nombre: edSiguientePasillo(), filas }, caja));
      ed.sel = { k: 'pasillo', id };
    } else {
      if (Math.hypot(dx, dy) < 10) { edPintarLienzo(); return; }
      ed.muros.push([d.x1, d.y1, d.x2, d.y2]);
      ed.sel = { k: 'muro', id: ed.muros.length - 1 };
    }
    ed.herr = 'mover';
    edCambio();
    pintarApp();
  }

  const rackConProducto = id => sede.espacios.some(e => e.rackId === id && lineasDe(e.id).length);

  function edBorrarSel() {
    const s = ed.sel;
    if (!s) return;
    if (s.k === 'fila') {
      const r = ed.racks.find(x => x.id === s.id);
      if (!r.nuevo && rackConProducto(r.id)) return toast(`${r.nombre} tiene producto ubicado. Sácalo o muévelo antes de borrarla.`, 'error');
      if (!r.nuevo) ed.borrar.racks.push(r.id);
      ed.racks = ed.racks.filter(x => x !== r);
    } else if (s.k === 'zona') {
      const z = ed.zonas.find(x => x.id === s.id), suyas = ed.racks.filter(r => r.zonaId === z.id);
      if (suyas.some(r => !r.nuevo && rackConProducto(r.id))) return toast(`La zona ${z.nombre} tiene filas con producto. Sácalo antes de borrarla.`, 'error');
      suyas.forEach(r => { if (!r.nuevo) ed.borrar.racks.push(r.id); });
      ed.racks = ed.racks.filter(r => r.zonaId !== z.id);
      if (!String(z.id).startsWith('nueva-')) ed.borrar.zonas.push(z.id);
      ed.zonas = ed.zonas.filter(x => x !== z);
    } else if (s.k === 'muro') ed.muros.splice(s.id, 1);
    else if (s.k === 'pasillo') ed.pasillos = ed.pasillos.filter(p => p.id !== s.id);
    else if (s.k === 'area') { const pt = edParte(s.id); if (pt) pt.z.areas.splice(pt.i, 1); }
    // Las filas que ya no existen salen de su pasillo
    const quedan = new Set(ed.racks.map(r => r.id));
    ed.pasillos.forEach(p => { p.filas = p.filas.filter(id => quedan.has(id)); });
    ed.sel = null;
    edCambio();
    pintarApp();
  }

  // Panel de la derecha: guía o datos de lo escogido
  function edPanelHtml() {
    const s = ed.sel;
    if (ed.fondoModo && ed.fondo) {
      return `<span class="h3">Imagen de fondo</span>
        <span class="muted small">Arrastra la imagen para acomodarla y la esquina de abajo para cambiar su tamaño. Solo se ve aquí, en el editor: sirve de guía para calcar.</span>
        <label class="lbl" for="edOpa">Qué tan clara se ve</label>
        <input id="edOpa" type="range" min="0.1" max="1" step="0.05" value="${ed.fondo.opacidad ?? 0.5}" oninput="ed.fondo.opacidad = Number(this.value); edCambio(); edPintarLienzo()">
        <div class="fila gap8 wrap-f mt8"><button class="btn btn-sec" onclick="$('edFondoArch').click()">Cambiar imagen</button>
          <button class="btn btn-sal" onclick="ed.fondo = null; ed.fondoUrl = null; ed.fondoModo = false; edCambio(); pintarApp()">Quitar imagen</button></div>
        <button class="btn btn-pri mt12" onclick="ed.fondoModo = false; pintarApp()">Listo, seguir dibujando</button>`;
    }
    if (!s) {
      return `<span class="h3">Cómo armar el plano</span>
        <ol class="ed-guia">
          <li><b>Imagen de fondo</b> (si la tienes): súbela para calcar encima.</li>
          <li><b>+ Zona</b>: arrastra en el dibujo para hacer el recuadro de cada zona.</li>
          <li><b>+ Fila</b>: traza cada fila de punta a punta, dentro de su zona. Después le dices cuántas posiciones y niveles tiene.</li>
          <li><b>+ Pared</b>: traza las paredes o separaciones.</li>
          <li><b>+ Pasillo</b>: arrastra sobre el pasillo y escoge sus filas (una o dos). Así cada producto dice en qué pasillo está.</li>
          <li>Con <b>Mover y escoger</b> arrastras cualquier cosa, incluido el <b>nombre de la zona</b> para que no tape nada.</li>
          <li>Toca <b>Guardar cambios</b>. Mientras no guardes, los demás siguen viendo el plano de antes.</li>
        </ol>
        <span class="muted small">Si un espacio no se puede usar (por ejemplo, un aire acondicionado), después de guardar tócalo en el plano y bloquéalo.</span>
        <span class="muted small">Atajos: <b>Supr</b> borra lo escogido, las <b>flechas</b> lo mueven poquito, <b>Esc</b> suelta lo escogido.</span>`;
    }
    if (s.k === 'zona') {
      const z = ed.zonas.find(x => x.id === s.id);
      if (!z) return '';
      const n = ed.racks.filter(r => r.zonaId === z.id).length;
      return `<span class="h3">Zona</span>
        <label class="lbl" for="edZNom">Nombre</label>
        <input id="edZNom" class="campo" value="${esc(z.nombre)}" oninput="edZona('nombre', this.value)">
        <label class="lbl" for="edZCol">Color</label>
        <input id="edZCol" class="campo" type="color" value="${esc(z.color)}" oninput="edZona('color', this.value)">
        <span class="muted small mt8">Arrastra el recuadro para moverlo (sus ${n} fila${n === 1 ? '' : 's'} se mueven con él) y la esquina de abajo para cambiar el tamaño. El nombre se arrastra aparte, para ponerlo donde no tape nada.</span>
        <button class="btn btn-sec mt8" onclick="edZona('etqX', null); edZona('etqY', null)">Poner el nombre en la esquina</button>
        <span class="lbl mt12 fila gap8">Partes de la zona ${ayudaHtml('Si la zona no es un solo rectángulo (por ejemplo, unas filas que quedan entre otras zonas), agrégale otra parte: dibujas el recuadro y queda de esta misma zona, con su color. Las filas que queden dentro pasan a esta zona.')}</span>
        <span class="muted small">${(z.areas || []).length ? `Tiene ${z.areas.length + 1} partes.` : 'Tiene una sola parte.'}</span>
        <button class="btn btn-sec" onclick="edAgregarParte()">+ Agregar otra parte</button>
        <button class="btn btn-sal mt12" onclick="edBorrarSel()">Borrar zona</button>`;
    }
    if (s.k === 'fila') {
      const r = ed.racks.find(x => x.id === s.id);
      if (!r) return '';
      return `<span class="h3">${r.nuevo ? 'Fila nueva' : 'Fila'}</span>
        ${r.nuevo ? '' : `<span class="muted small">Código ${esc(r.id)} (no cambia)</span>`}
        <label class="lbl" for="edRNom">Nombre</label>
        <input id="edRNom" class="campo" value="${esc(r.nombre)}" oninput="edFila('nombre', this.value)">
        <label class="lbl" for="edRZona">Zona</label>
        <select id="edRZona" class="campo" onchange="edFila('zonaId', this.value)">${ed.zonas.map(z => `<option value="${esc(z.id)}" ${z.id === r.zonaId ? 'selected' : ''}>${esc(z.nombre)}</option>`).join('')}</select>
        <label class="lbl" for="edRPos">Posiciones (de punta a punta)</label>
        <input id="edRPos" class="campo" type="number" min="1" inputmode="numeric" value="${r.posiciones}" oninput="edFila('posiciones', Math.max(1, Math.floor(Number(this.value)) || 1))">
        <span class="lbl">Tipo de fila</span>
        <div class="seg"><button class="${r.fondo === 'S' ? 'on' : ''}" onclick="edFila('fondo', 'S', true)">A-B</button><button class="${r.fondo === 'D' ? 'on' : ''}" onclick="edFila('fondo', 'D', true)">Doble fondo A-B-C-D</button></div>
        ${r.tramos ? '' : `<span class="lbl">Dirección</span>
        <div class="seg"><button class="${r.orientacion === 'V' ? 'on' : ''}" onclick="edFila('orientacion', 'V', true)">Vertical</button><button class="${r.orientacion === 'H' ? 'on' : ''}" onclick="edFila('orientacion', 'H', true)">Horizontal</button></div>`}
        <span class="lbl">¿Dónde queda la posición 1?</span>
        <div class="seg"><button class="${r.numeracion !== 'INVERTIDA' ? 'on' : ''}" onclick="edFila('numeracion', 'NORMAL', true)">${r.orientacion === 'H' && !r.tramos ? 'Izquierda' : 'Abajo'}</button><button class="${r.numeracion === 'INVERTIDA' ? 'on' : ''}" onclick="edFila('numeracion', 'INVERTIDA', true)">${r.orientacion === 'H' && !r.tramos ? 'Derecha' : 'Arriba'}</button></div>
        ${r.nuevo ? `<span class="lbl">Niveles que se crean al guardar</span>
          <div class="fila gap8"><input class="campo" type="number" min="0" max="20" value="${r.niveles}" style="width:90px" oninput="edFila('niveles', Math.max(0, Math.floor(Number(this.value)) || 0))" aria-label="Niveles">
            <label class="fila gap8 small"><input type="checkbox" ${r.picking ? 'checked' : ''} onchange="edFila('picking', this.checked)"> con picking (nivel 1)</label></div>
          <span class="muted small">Se crean en todas las posiciones. Después cambias una posición puntual tocándola en el plano.</span>`
          : '<span class="muted small mt8">Los niveles de cada posición se cambian en el plano, tocando la posición.</span>'}
        <label class="lbl" for="edRPas">Pasillo</label>
        <select id="edRPas" class="campo" onchange="edFilaPasillo(this.value)">
          <option value="">Sin pasillo</option>
          ${ed.pasillos.map(p => `<option value="${esc(p.id)}" ${p.filas.includes(r.id) ? 'selected' : ''}>Pasillo ${esc(p.nombre)}</option>`).join('')}
        </select>
        ${ed.pasillos.length ? '' : '<span class="muted small">Para crear un pasillo usa «+ Pasillo» arriba.</span>'}
        <span class="muted small mt8">Arrástrala para moverla${r.tramos ? '' : ' y usa el punto de la punta para alargarla o acortarla'}.</span>
        <button class="btn btn-sal mt12" onclick="edBorrarSel()">Borrar fila</button>`;
    }
    if (s.k === 'area') {
      const pt = edParte(s.id);
      if (!pt) return '';
      return `<span class="h3">Parte de la zona ${esc(pt.z.nombre)}</span>
        <span class="muted small">Es de la misma zona y tiene su mismo color. Arrástrala para moverla y usa la esquina de abajo para cambiar el tamaño.</span>
        <button class="btn btn-sec mt8" onclick="ed.sel = { k: 'zona', id: '${esc(pt.z.id)}' }; edPintarLienzo(); $('edPanel').innerHTML = edPanelHtml()">Ver la zona</button>
        <button class="btn btn-sal mt12" onclick="edBorrarSel()">Borrar esta parte</button>`;
    }
    if (s.k === 'pasillo') {
      const pa = ed.pasillos.find(x => x.id === s.id);
      if (!pa) return '';
      const otro = id => ed.pasillos.find(x => x.id !== pa.id && x.filas.includes(id));
      const porZona = ed.zonas.map(z => ({ z, filas: ed.racks.filter(r => r.zonaId === z.id).sort((a, b) => a.nombre.localeCompare(b.nombre, 'es', { numeric: true })) }))
        .filter(g => g.filas.length);
      // Primero la zona donde está el pasillo y las de sus filas
      const zAqui = zonaEn(pa.x + pa.ancho / 2, pa.y + pa.alto / 2), zSuyas = new Set(pa.filas.map(id => (ed.racks.find(r => r.id === id) || {}).zonaId));
      const peso = g => (zAqui && g.z.id === zAqui.id ? 0 : zSuyas.has(g.z.id) ? 1 : 2);
      porZona.sort((a, b) => peso(a) - peso(b));
      return `<span class="h3">Pasillo</span>
        <label class="lbl" for="edPNom">Número o nombre</label>
        <input id="edPNom" class="campo" value="${esc(pa.nombre)}" maxlength="20" oninput="edPasillo('nombre', this.value.trim())">
        <span class="lbl fila gap8">Filas del pasillo ${ayudaHtml('Escoge las filas que dan a este pasillo (normalmente una o dos). Ese pasillo sale en la ubicación de cada producto, en Productos totales y al contar por pasillo. Una fila solo puede estar en un pasillo.')}</span>
        <span class="muted small">${pa.filas.length ? pa.filas.map(id => esc((ed.racks.find(r => r.id === id) || { nombre: id }).nombre)).join(', ') : 'Todavía no tiene filas'}</span>
        <div class="ed-pas-filas">${porZona.map(g => `<span class="muted small fuerte">${esc(g.z.nombre)}</span>
          ${g.filas.map(r => { const o = otro(r.id); return `<label class="fila gap8 small"><input type="checkbox" ${pa.filas.includes(r.id) ? 'checked' : ''} onchange="edPasilloFila('${esc(r.id)}', this.checked)">
            ${esc(r.nombre)}${o ? ` <span class="muted">(en Pasillo ${esc(o.nombre)})</span>` : ''}</label>`; }).join('')}`).join('')}</div>
        <span class="muted small mt8">Arrástralo para moverlo y usa la esquina de abajo para cambiar el tamaño.</span>
        <button class="btn btn-sal mt12" onclick="edBorrarSel()">Borrar pasillo</button>`;
    }
    if (s.k === 'muro') {
      return `<span class="h3">Pared</span>
        <span class="muted small">Arrástrala para moverla, o arrastra sus puntas para cambiarla.</span>
        <button class="btn btn-sal mt12" onclick="edBorrarSel()">Borrar pared</button>`;
    }
    return '';
  }
  function edZona(campo, v) {
    const z = ed.zonas.find(x => x.id === ed.sel.id);
    z[campo] = v;
    edCambio(); edPintarLienzo();
  }
  function edFila(campo, v, repintarPanel) {
    const r = ed.racks.find(x => x.id === ed.sel.id);
    r[campo] = v;
    edCambio(); edPintarLienzo();
    if (repintarPanel) $('edPanel').innerHTML = edPanelHtml();
  }

  // Parte de una zona por su id "zona|i"
  function edParte(id) {
    const [zid, i] = String(id).split('|'), z = ed.zonas.find(x => x.id === zid), a = z && (z.areas || [])[Number(i)];
    return a ? { z, a, i: Number(i) } : null;
  }
  // Dibujar otra parte de la zona escogida
  function edAgregarParte() {
    const z = ed.sel && ed.sel.k === 'zona' && ed.zonas.find(x => x.id === ed.sel.id);
    if (!z) return;
    ed.areaDe = z.id; ed.herr = 'area'; ed.sel = null;
    pintarApp();
    toast(`Arrastra en el dibujo el recuadro de la otra parte de ${z.nombre}`);
  }

  // ¿La fila queda dentro o junto al recuadro (a menos de "margen" puntos)?
  function edFilaToca(r, c, margen) {
    const grueso = r.fondo === 'D' ? 44 : 20;
    return (r.tramos || [{ x: r.x, y: r.y, largo: r.largo }]).some(t => {
      const o = r.tramos ? 'V' : r.orientacion, an = t.ancho || grueso;
      const w = o === 'V' ? an : t.largo, h = o === 'V' ? t.largo : an;
      return t.x < c.x + c.ancho + margen && t.x + w > c.x - margen && t.y < c.y + c.alto + margen && t.y + h > c.y - margen;
    });
  }
  // Siguiente número de pasillo libre
  function edSiguientePasillo() {
    const nums = ed.pasillos.map(p => Number(p.nombre)).filter(n => Number.isInteger(n));
    return String(nums.length ? Math.max(...nums) + 1 : 1);
  }
  function edPasillo(campo, v) {
    const pa = ed.pasillos.find(x => x.id === ed.sel.id);
    pa[campo] = v;
    edCambio(); edPintarLienzo();
  }
  // Meter o sacar una fila del pasillo escogido (una fila solo puede estar en un pasillo)
  function edPasilloFila(rackId, on) {
    const pa = ed.pasillos.find(x => x.id === ed.sel.id);
    if (!pa) return;
    ed.pasillos.forEach(p => { p.filas = p.filas.filter(id => id !== rackId); });
    if (on) pa.filas.push(rackId);
    edCambio(); edPintarLienzo();
    $('edPanel').innerHTML = edPanelHtml();
  }
  // Desde el panel de la fila: en qué pasillo queda
  function edFilaPasillo(paId) {
    const rackId = ed.sel.id;
    ed.pasillos.forEach(p => { p.filas = p.filas.filter(id => id !== rackId); });
    const pa = ed.pasillos.find(x => x.id === paId);
    if (pa) pa.filas.push(rackId);
    edCambio(); edPintarLienzo();
  }

  function edFondo() {
    ed.sel = null; ed.herr = 'mover';
    if (!ed.fondo) return $('edFondoArch').click();
    ed.fondoModo = !ed.fondoModo;
    pintarApp();
  }
  async function edSubirFondo(f) {
    toast('Subiendo la imagen…');
    try {
      const bmp = await createImageBitmap(f);
      const k = Math.min(1, 2400 / Math.max(bmp.width, bmp.height));
      const c = document.createElement('canvas');
      c.width = Math.round(bmp.width * k); c.height = Math.round(bmp.height * k);
      c.getContext('2d').drawImage(bmp, 0, 0, c.width, c.height);
      const blob = await new Promise(ok => c.toBlob(ok, 'image/jpeg', 0.85));
      const ruta = await llamar('bdSubirFondo', { sedeId: ses.sedeId, archivo: new File([blob], 'plano.jpg', { type: 'image/jpeg' }) });
      const { w } = edMedidas();
      const ancho = Math.min(w - 40, 1500);
      ed.fondo = { ruta, x: 20, y: 20, ancho, alto: Math.round(ancho * c.height / c.width), opacidad: 0.5 };
      ed.fondoUrl = await llamar('bdFondoUrl', ruta);
      ed.fondoModo = true;
      edCambio(); pintarApp();
      toast('Imagen lista. Acomódala y luego toca «Listo, seguir dibujando».', 'ok');
    } catch (e) { toast(e.message || 'No se pudo subir la imagen', 'error'); }
  }

  function edDescartar() {
    abrirModal(`<div class="fila-sb"><span class="h2">¿Descartar los cambios?</span>${btnCerrar()}</div>
      <span class="mt12">Se pierde lo que dibujaste desde la última vez que guardaste. El plano queda como está.</span>
      <div class="dos mt16"><button class="btn btn-sec btn-xl" onclick="cerrarModal()">No</button>
        <button class="btn btn-sal btn-xl" onclick="try { localStorage.removeItem('planoBorrador:' + ses.sedeId); } catch (e) {} ed = null; cerrarModal(); pintarApp()">Sí, descartar</button></div>`);
  }

  function edGuardar() {
    const sinNombre = ed.pasillos.find(p => !String(p.nombre || '').trim());
    if (sinNombre) { ed.sel = { k: 'pasillo', id: sinNombre.id }; pintarApp(); return toast('Ponle número o nombre al pasillo', 'error'); }
    const nombres = ed.pasillos.map(p => String(p.nombre).trim().toUpperCase());
    const rep = nombres.find((n, i) => nombres.indexOf(n) !== i);
    if (rep) return toast(`Hay dos pasillos con el nombre ${rep}. Cámbiale el nombre a uno.`, 'error');
    const b = $('edOk'); b.disabled = true; b.textContent = 'Guardando…';
    const niveles = {};
    ed.racks.filter(r => r.nuevo).forEach(r => { niveles[r.id] = { niveles: r.niveles, picking: r.picking }; });
    llamar('bdGuardarPlano', {
      sedeId: ses.sedeId,
      zonas: ed.zonas.map(({ id, nombre, color, x, y, ancho, alto, etqX, etqY, areas }) => ({ id, nombre, color, x, y, ancho, alto, etqX, etqY, areas })),
      racks: ed.racks.map(({ id, zonaId, nombre, posiciones, fondo, orientacion, numeracion, x, y, largo, tramos, nuevo }) => ({ id, zonaId, nombre, posiciones, fondo, orientacion, numeracion, x, y, largo, tramos, nuevo })),
      muros: ed.muros, fondo: ed.fondo, borrar: ed.borrar, niveles,
      pasillos: ed.pasillos.map(({ id, nombre, filas, x, y, ancho, alto }) => ({ id: String(id).startsWith('nuevo-pa-') ? null : id, nombre: String(nombre || '').trim(), filas, x, y, ancho, alto }))
    }).then(d => {
      setSede(d);
      try { localStorage.removeItem('planoBorrador:' + ses.sedeId); } catch (e) { /* nada */ }
      ed = null;
      pitido(); toast('Plano guardado. Ya lo ven todos.', 'ok');
      pintarApp();
    }).catch(e => { toast(e.message, 'error'); b.disabled = false; b.textContent = 'Guardar cambios'; });
  }

  /* ----- Sedes ----- */
  /* ----- Regionales (solo el superadministrador) ----- */
  let regCfg = null, regCargando = false;
  function cargarRegCfg() {
    if (regCargando) return;
    regCargando = true;
    llamar('bdRegionalesConfig', ses.token).then(l => { regCfg = l || []; }).catch(e => { regCfg = { error: e.message }; })
      .finally(() => { regCargando = false; if (vista === 'config' || vista === 'usuarios' || !ses.sedeId) pintarApp(); });
  }
  /* ----- Logo de la empresa (solo el superadministrador): uno para modo claro y otro para modo oscuro ----- */
  const logoNuevo = { claro: null, oscuro: null };   // null = sin cambios; '' = quitar
  function logoCardHtml() {
    if (!puede('superadmin')) return '';
    const caja = (t, nom) => {
      const ver = logoNuevo[t] !== null ? logoNuevo[t] : logoApp[t];
      return `<div class="col gap8 logo-modo">
        <span class="lbl" style="margin:0">${nom}</span>
        <div class="logo-prev-fila">
          <div class="logo-prev logo-prev-top-${t}" title="Así se ve en la barra de arriba">${ver ? `<img src="${esc(ver)}" alt="Logo ${nom} en la barra de arriba">` : '<span class="small" style="color:#C9D3DE">Sin logo</span>'}</div>
          <div class="logo-prev logo-prev-fondo-${t}" title="Así se ve en la entrada">${ver ? `<img src="${esc(ver)}" alt="Logo ${nom} en la entrada">` : '<span class="muted small">Sin logo</span>'}</div>
        </div>
        <div class="fila gap8 wrap-f">
          <label for="logoArch-${t}" class="btn btn-sec" role="button" tabindex="0">Escoger imagen</label>
          <input id="logoArch-${t}" type="file" accept="image/png,image/jpeg,image/webp" class="oculto" onchange="leerLogo('${t}', this.files[0]); this.value=''">
          ${logoNuevo[t] !== null ? `<button class="btn btn-pri" onclick="guardarLogo('${t}', this)">${logoNuevo[t] ? 'Guardar' : 'Sí, quitar'}</button><button class="btn btn-sec" onclick="logoNuevo['${t}']=null; pintarApp()">Cancelar</button>`
            : logoApp[t] ? `<button class="btn btn-sec txt-rojo" onclick="logoNuevo['${t}']=''; pintarApp()">Quitar</button>` : ''}
        </div></div>`;
    };
    return `<section class="card col gap12">
      <div class="col gap4"><span class="h3">Logo de la empresa ${ayudaHtml('Sale tal como lo subes (si es PNG con fondo transparente, sin fondo) arriba a la izquierda, en la pantalla de entrada y en la pestaña del navegador, para todas las regionales. Puedes subir uno para el modo claro y otro para el modo oscuro; si subes solo uno, sale en los dos. La barra de arriba es oscura en los dos modos.')}</span>
        <span class="muted small">Sube una imagen PNG (mejor con fondo transparente) o JPG. Se ajusta sola al tamaño. A la izquierda ves cómo queda en la barra de arriba y a la derecha en la pantalla de entrada.</span></div>
      <div class="logo-modos">${caja('claro', 'Modo claro')}${caja('oscuro', 'Modo oscuro')}</div>
      ${hayLogo() ? `<div class="fila gap8 wrap-f"><button class="btn btn-sec" onclick="descargarIconosApp(this)">Descargar íconos de la app</button>
        <span class="muted small">Para la app instalada: ponlos en la carpeta public (usa el logo del modo claro).</span></div>` : ''}
    </section>`;
  }
  // Achica la imagen (máximo 512 px). Un PNG queda PNG, con su fondo (o sin fondo) tal cual.
  function leerLogo(t, f) {
    if (!f) return;
    if (!/^image\/(png|jpe?g|webp)$/.test(f.type)) return toast('Escoge una imagen PNG o JPG', 'error');
    const r = new FileReader();
    r.onload = () => {
      const img = new Image();
      img.onload = () => {
        const max = 512, k = Math.min(1, max / Math.max(img.width, img.height));
        let url = r.result;
        if (k < 1 || url.length > 650000) {
          const c = document.createElement('canvas');
          c.width = Math.max(1, Math.round(img.width * k)); c.height = Math.max(1, Math.round(img.height * k));
          c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
          url = c.toDataURL(f.type === 'image/jpeg' ? 'image/jpeg' : 'image/png', 0.9);
          if (url.length > 650000) url = c.toDataURL('image/jpeg', 0.85);
        }
        logoNuevo[t] = url; pintarApp();
      };
      img.onerror = () => toast('No se pudo leer la imagen', 'error');
      img.src = r.result;
    };
    r.readAsDataURL(f);
  }
  function guardarLogo(t, b) {
    if (b) b.disabled = true;
    const nuevo = logoNuevo[t] || '';
    llamar('bdGuardarLogo', { token: ses.token, tema: t, logo: nuevo }).then(() => {
      logoApp = Object.assign({}, logoApp, { [t]: nuevo }); logoNuevo[t] = null; guardarLS('logoApp2', logoApp); ponerFavicon();
      toast(nuevo ? `Logo del modo ${t} guardado` : `Logo del modo ${t} quitado`, 'ok'); pintarApp();
    }).catch(e => { if (b) b.disabled = false; toast(e.message, 'error'); });
  }
  // Íconos para la app instalada (celular y computador): se ponen en la carpeta public del proyecto. Sin fondo.
  async function descargarIconosApp(b) {
    const u = logoApp.claro || logoApp.oscuro;
    if (!u) return;
    b.disabled = true;
    try {
      if (!window.JSZip) await cargarScript(JSZIP_URL);
      const img = await new Promise((ok, mal) => { const i = new Image(); i.onload = () => ok(i); i.onerror = mal; i.src = u; });
      const icono = (tam, margen) => {
        const c = document.createElement('canvas'); c.width = c.height = tam;
        const x = c.getContext('2d');
        const libre = tam * (1 - 2 * margen), k = Math.min(libre / img.width, libre / img.height);
        const w = img.width * k, h = img.height * k;
        x.drawImage(img, (tam - w) / 2, (tam - h) / 2, w, h);
        return c.toDataURL('image/png').split(',')[1];
      };
      const zip = new JSZip();
      zip.file('icono-192.png', icono(192, 0.04), { base64: true });
      zip.file('icono-512.png', icono(512, 0.04), { base64: true });
      zip.file('icono-mask.png', icono(512, 0.18), { base64: true });   // el celular lo recorta en círculo: va con más margen
      zip.file('apple-touch-icon.png', icono(180, 0.04), { base64: true });
      zip.file('LEEME.txt', 'Pon estos 4 archivos en la carpeta public del proyecto (reemplazan los que hay) y vuelve a publicar la app.\r\nEn los equipos donde ya está instalada, el ícono nuevo puede tardar en salir: si no cambia, desinstálala y vuélvela a instalar.');
      entregarArchivo(await zip.generateAsync({ type: 'blob' }), 'iconos-app.zip', 'Íconos de la app');
    } catch (e) { toast('No se pudieron armar los íconos: ' + e.message, 'error'); }
    b.disabled = false;
  }
  function vistaRegionales() {
    if (!puede('superadmin') || !hayRegionales()) return '';
    if (!regCfg) { cargarRegCfg(); return '<section class="card"><div class="cargando">Cargando regionales…</div></section>'; }
    if (regCfg.error) return `<section class="card col gap8"><span class="h3">Regionales</span><p class="error">${esc(regCfg.error)}</p></section>`;
    return `<section class="card col gap12">
      <div class="col gap4"><span class="h3">Regionales ${ayudaHtml('Solo tú (superadministrador) ves esto. Una regional nueva aparece en la lista de «Regional» al entrar. Para crearle sedes, sal y entra escogiendo esa regional. Solo se elimina una regional sin sedes ni personas.')}</span>
        <span class="muted small">Ciudades donde trabaja la empresa. Cada una tiene sus sedes, su gente y los productos que maneja. El código es el de la regional en SAP (ej. 1200).</span></div>
      ${regCfg.map(r => `<div class="fila gap8 wrap-f sede-fila">
        <input class="campo" id="rgN-${esc(r.id)}" value="${esc(r.nombre)}" aria-label="Nombre de la regional ${esc(r.nombre)}" style="flex:2 1 180px">
        <input class="campo" id="rgC-${esc(r.id)}" value="${esc(r.codigo || '')}" placeholder="Código" aria-label="Código SAP de ${esc(r.nombre)}" style="flex:0 1 110px" inputmode="numeric">
        <span class="muted small">${r.sedes} sede${r.sedes === 1 ? '' : 's'} · ${r.personas} persona${r.personas === 1 ? '' : 's'} · ${r.productos ? r.productos + (r.productos === 1 ? ' producto' : ' productos') : 'todos los productos'}</span>
        <button class="btn btn-sec" onclick="guardarRegional('${esc(r.id)}', this)">Guardar</button>
        <button class="btn btn-sec" onclick="abrirProdRegional('${esc(r.id)}')">Productos</button>
        ${r.id === regionalAct() ? '<span class="tag ok">Aquí estás</span>' : !r.sedes && !r.personas ? `<button class="btn btn-sec txt-rojo" onclick="borrarRegional('${esc(r.id)}')">Eliminar</button>` : ''}
      </div>`).join('')}
      <div class="fila gap8 wrap-f mt8"><input class="campo" id="rgNueva" placeholder="Nombre de la regional nueva (ej. Cali)" style="flex:1 1 220px">
        <input class="campo" id="rgNuevaC" placeholder="Código" aria-label="Código de la regional nueva (ej. 1500)" style="flex:0 1 140px" inputmode="numeric">
        <button class="btn btn-pri" onclick="guardarRegional(null, this)">+ Crear regional</button></div>
    </section>`;
  }
  function guardarRegional(id, b) {
    const nombre = (id ? $('rgN-' + id) : $('rgNueva')).value.trim();
    if (!nombre) return toast('Escribe el nombre de la regional', 'error');
    const r = id && (regCfg || []).find(x => x.id === id);
    const cod = (id ? $('rgC-' + id) : $('rgNuevaC')).value.trim();
    b.disabled = true;
    const pasos = !id || nombre !== r.nombre ? llamar('bdGuardarRegional', { token: ses.token, id, nombre }) : Promise.resolve(regCfg);
    pasos.then(l => {
      // La nueva: se busca por el nombre para ponerle el código
      const rid = id || ((l || []).find(x => sinTilde(x.nombre) === sinTilde(nombre)) || {}).id;
      const antes = id ? r.codigo || '' : '';
      return rid && cod !== antes ? llamar('bdCodigoRegional', { token: ses.token, id: rid, codigo: cod }) : l;
    }).then(l => {
      regCfg = l;
      llamar('bdInicio').then(d => { ini.regionales = d.regionales || ini.regionales; pintarApp(); }).catch(() => {});
      toast(id ? 'Regional guardada' : `Regional ${nombre} creada. Para crearle sedes, sal y entra escogiendo ${nombre}.`, 'ok');
      pintarApp();
    }).catch(e => { toast(e.message, 'error'); b.disabled = false; });
  }
  function borrarRegional(id, ok) {
    const r = (regCfg || []).find(x => x.id === id);
    if (!r) return;
    if (ok !== true) return abrirModal(`<div class="fila-sb"><span class="h2">¿Eliminar la regional ${esc(r.nombre)}?</span>${btnCerrar()}</div>
      <p class="mt12">No tiene sedes ni personas. Si la creaste por error, se elimina.</p>
      <div class="dos mt16"><button class="btn btn-sec btn-xl" onclick="cerrarModal()">Cancelar</button>
        <button class="btn btn-pri btn-xl" onclick="cerrarModal(); borrarRegional('${esc(id)}', true)">Sí, eliminar</button></div>`);
    llamar('bdBorrarRegional', { token: ses.token, id }).then(l => {
      regCfg = l;
      llamar('bdInicio').then(d => { ini.regionales = d.regionales || ini.regionales; }).catch(() => {});
      toast('Regional eliminada', 'ok'); pintarApp();
    }).catch(e => toast(e.message, 'error'));
  }

  /* ----- Productos que maneja cada regional -----
     Si una regional tiene su lista, en el inventario, en la búsqueda y en Ingresar solo salen esos productos
     (los que tengan SAP, conteo o estén en el plano salen igual). Sin lista, se ven todos. */
  function cargarProdRegional() {
    if (!hayRegionales()) { ini.prodReg = null; return Promise.resolve(); }
    return llamar('bdProductosRegional', regionalAct()).then(l => {
      ini.prodReg = l && l.length ? new Set(l) : null;
      diMemo = null;
      if ($('dlProductos')) $('dlProductos').innerHTML = ini.productos.filter(prodDeMiRegional).map(p => `<option value="${esc(p.id + ' · ' + p.nombre)}">`).join('');
    }).catch(() => {});
  }
  const prodDeMiRegional = p => !ini.prodReg || ini.prodReg.has(p.id);
  let prc = null;   // { regId, codigos, malos, archivo, filas, cab, colCod, colReg, confirmar }
  function vistaProdRegionalCard() {
    if (!hayRegionales() || puede('superadmin') || !puede('productos')) return '';
    const n = ini.prodReg ? ini.prodReg.size : 0;
    return `<section class="card col gap8">
      <div class="fila-sb wrap-f gap8"><span class="h3">Productos que maneja ${esc(nombreRegional())} ${ayudaHtml('Con la lista cargada, en el inventario, en la búsqueda y en Ingresar solo salen los productos de tu regional. Sin lista se ven todos.')}</span>
        <button class="btn btn-sec" onclick="abrirProdRegional('${esc(regionalAct())}')">Cargar lista</button></div>
      <span class="muted small">${n ? `${n} productos en la lista.` : 'Todavía no hay lista: se ven todos los productos.'}</span></section>`;
  }
  function abrirProdRegional(regId) {
    if (!window.XLSX) return toast('No se pudo abrir el lector de Excel (revisa la señal) e inténtalo otra vez.', 'error');
    const r = (ini.regionales || []).find(x => x.id === regId) || { id: regId, nombre: regId };
    prc = { regId, reg: r };
    abrirModal(`<div class="fila-sb"><span class="h2">Productos de ${esc(r.nombre)}</span>${btnCerrar()}</div>
      <span class="muted small mt8">Sube el Excel con los productos que maneja ${esc(r.nombre)}: una columna con el código Atlantic del producto.
        Si el Excel trae varias regionales, escoge también la columna del código de la regional${r.codigo ? ` (se toman solo las filas con <b>${esc(r.codigo)}</b>)` : ''}.</span>
      <label for="prcArch" class="btn btn-pri btn-xl mt12" role="button" tabindex="0">Escoger Excel</label>
      <input id="prcArch" type="file" accept=".xlsx,.xls,.csv" class="oculto">
      <div id="prcCaja" class="mt12"></div>
      <p id="fErr" class="error" hidden></p>`);
    $('prcArch').addEventListener('change', ev => {
      const f = ev.target.files[0];
      if (!f) return;
      const lec = new FileReader();
      lec.onload = () => {
        try {
          const wb = XLSX.read(new Uint8Array(lec.result), { type: 'array' });
          const filas = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1, raw: true, defval: '' }).filter(x => x.some(c => String(c).trim() !== ''));
          const cab = Math.max(0, filas.findIndex(x => x.filter(c => String(c).trim() && isNaN(Number(c))).length >= 1));
          const tit = filas[cab].map(c => sinTilde(String(c)));
          const busca = re => tit.findIndex(t => re.test(t));
          prc = Object.assign(prc, { archivo: f.name, filas, cab, colCod: [/COD.*ATL|ATLANTIC|^MATERIAL$/, /MATERIAL|^COD|CODIGO|SKU/].map(busca).find(i => i >= 0), colReg: busca(/CENTRO|REGIONAL|PLANTA|CEN\b/), confirmar: false });
          if (!(prc.colCod >= 0)) prc.colCod = 0;
          pintarProdRegional();
        } catch (e) { errForm('No se pudo leer el archivo: ' + e.message); }
      };
      lec.readAsArrayBuffer(f);
    });
  }
  function prcCodigos() {
    const { filas, cab, colCod, colReg, reg } = prc;
    const codReg = String(reg.codigo || '').trim();
    const cods = new Set(), malos = new Set();
    filas.slice(cab + 1).forEach(x => {
      if (colReg >= 0 && codReg && String(x[colReg] ?? '').trim().replace(/\.0+$/, '') !== codReg) return;
      const c = String(x[colCod] ?? '').trim().replace(/\.0+$/, '').replace(/^0+(?=\d)/, '');
      if (!c) return;
      const p = buscarProducto(c);
      if (p) cods.add(p.id); else malos.add(c);
    });
    return { cods: [...cods], malos: [...malos] };
  }
  function pintarProdRegional() {
    const { filas, cab, colCod, colReg, reg } = prc;
    const tit = filas[cab].map((c, i) => String(c).trim() || `Columna ${i + 1}`);
    const sel = (id, k, i, vacio) => `<select id="${id}" class="campo" onchange="prc.${k}=+this.value; prc.confirmar=false; pintarProdRegional()">${vacio ? '<option value="-1">— No viene —</option>' : ''}${tit.map((t, j) => `<option value="${j}" ${j === i ? 'selected' : ''}>${esc(t)}</option>`).join('')}</select>`;
    const { cods, malos } = prcCodigos();
    $('prcCaja').innerHTML = `<span class="muted small">Archivo: <b>${esc(prc.archivo)}</b> · ${filas.length - cab - 1} filas</span>
      <div class="dos mt8"><div><label class="lbl" for="prcCod">Código del producto</label>${sel('prcCod', 'colCod', colCod)}</div>
        <div><label class="lbl" for="prcReg">Código de la regional (opcional)</label>${sel('prcReg', 'colReg', colReg, true)}</div></div>
      ${colReg >= 0 && !reg.codigo ? '<p class="small txt-naranja mt8">Esta regional no tiene código: ponle el código en la lista de Regionales para tomar solo sus filas. Por ahora se toman todas.</p>' : ''}
      <div class="inv-res mt12"><div><span class="muted small">Productos encontrados</span><b class="txt-verde">${cods.length}</b></div>
        <div><span class="muted small">No están en el catálogo</span><b class="${malos.length ? 'txt-naranja' : ''}">${malos.length}</b></div></div>
      ${malos.length ? `<span class="muted small mt8">No están en el catálogo (no se guardan): ${esc(malos.slice(0, 15).join(', '))}${malos.length > 15 ? '…' : ''}</span>` : ''}
      ${prc.confirmar ? `<div class="alerta-fefo mt12"><b>¿Reemplazar la lista?</b> La lista de ${esc(reg.nombre)} quedará solo con estos ${cods.length} productos; los demás salen de la lista (no se borran del catálogo).
          <div class="fila gap8 mt8 wrap-f"><button class="btn btn-sec" onclick="prc.confirmar=false; pintarProdRegional()">No</button>
          <button class="btn btn-sal" onclick="guardarProdRegional('REEMPLAZAR', this)">Sí, reemplazar</button></div></div>`
        : `<div class="fila gap8 mt12 wrap-f"><button class="btn btn-pri" ${cods.length ? '' : 'disabled'} onclick="guardarProdRegional('AGREGAR', this)">Agregar a la lista</button>
          <button class="btn btn-sec" ${cods.length ? '' : 'disabled'} onclick="prc.confirmar=true; pintarProdRegional()">Reemplazar la lista</button></div>
          <span class="muted small">«Agregar» suma estos productos a los que ya tiene. «Reemplazar» deja solo estos.</span>`}`;
  }
  function guardarProdRegional(modo, b) {
    const { cods } = prcCodigos();
    b.disabled = true; b.textContent = 'Guardando…';
    llamar('bdCargarProductosRegional', { token: ses.token, regionalId: prc.regId, codigos: cods, modo }).then(r => {
      cerrarModal();
      toast(`Listo: ${r.total} productos en la lista de ${prc.reg.nombre}${r.quitados ? ` (${r.quitados} salieron)` : ''}`, 'ok');
      regCfg = null;
      const p = prc.regId === regionalAct() ? cargarProdRegional() : Promise.resolve();
      p.then(() => pintarApp());
    }).catch(e => { errForm(e.message); b.disabled = false; b.textContent = modo === 'REEMPLAZAR' ? 'Sí, reemplazar' : 'Agregar a la lista'; });
  }

  /* ----- Sedes ----- */
  // Una sede se puede eliminar si se creó por error y está vacía (lo revisa el servidor).
  // Las dos primeras sedes tienen el plano dibujado de las bodegas y no se eliminan.
  const sedeBorrable = s => hayRegionales() && s.id !== ses.sedeId && (ini.sedesTodas || ini.sedes).slice(0, 2).every(x => x.id !== s.id);
  function borrarSede(id, ok) {
    const s = ini.sedes.find(x => x.id === id);
    if (!s) return;
    if (ok !== true) return abrirModal(`<div class="fila-sb"><span class="h2">¿Eliminar la sede ${esc(s.nombre)}?</span>${btnCerrar()}</div>
      <p class="mt12">Solo se elimina si está <b>vacía</b>: sin rótulos, conteos, recibos, códigos de ubicación ni producto en su plano. Si tiene algo, la app no la deja y te dice qué tiene.</p>
      <div class="dos mt16"><button class="btn btn-sec btn-xl" onclick="cerrarModal()">Cancelar</button>
        <button class="btn btn-pri btn-xl" onclick="cerrarModal(); borrarSede('${esc(id)}', true)">Sí, eliminar</button></div>`);
    llamar('bdBorrarSede', { token: ses.token, id }).then(sedes => {
      ini.sedesTodas = sedes; aplicarRegional(); regCfg = null;
      toast(`Sede ${s.nombre} eliminada`, 'ok'); pintarApp();
    }).catch(e => toast(e.message, 'error'));
  }
  // Regional sin sedes todavía
  function vistaSinSedes() {
    const reg = esc(nombreRegional() || 'Esta regional');
    if (puede('config')) {
      cfgTab = 'sedes';
      return `<div class="col gap12"><div class="card col gap4"><span class="h2">${reg} todavía no tiene sedes</span>
        <span class="muted">Crea la primera sede aquí abajo. Después la abres y dibujas su plano en «Configuración».</span></div>${vistaSedes()}</div>`;
    }
    return `<div class="card col gap8"><span class="h2">${reg} todavía no tiene sedes</span>
      <span class="muted">Pídele al administrador que cree las sedes de esta regional en «Configuración → Sedes».</span></div>`;
  }

  function vistaSedes() {
    return `${vistaProdRegionalCard()}<section class="card col gap12">
      <div class="col gap4"><span class="h3">Sedes${nombreRegional() ? ' de ' + esc(nombreRegional()) : ''}</span>
        <span class="muted small">Cámbiale el nombre a una sede o crea una nueva. Para dibujar el plano de una sede, ábrela (arriba, en el nombre de la sede) y usa el «Editor del plano».</span></div>
      ${ini.sedes.map(s => `<div class="fila gap8 wrap-f sede-fila">
        <input class="campo" id="sdN-${esc(s.id)}" value="${esc(s.nombre)}" aria-label="Nombre de la sede ${esc(s.nombre)}" style="flex:1 1 220px">
        <button class="btn btn-sec" onclick="guardarSede('${esc(s.id)}', this)">Guardar nombre</button>
        ${s.id === ses.sedeId ? '<span class="tag ok">Abierta</span>' : `<button class="btn btn-sec" onclick="lg.sedeId='${esc(s.id)}'; guardarLS('sesion', { perfil: lg.perfil, nombre: lg.nombre, sedeId: lg.sedeId }); ed = null; verSede('${esc(s.id)}')">Abrir</button>`}
        ${sedeBorrable(s) ? `<button class="btn btn-sec txt-rojo" onclick="borrarSede('${esc(s.id)}')">Eliminar</button>` : ''}
      </div>`).join('')}
      ${hayRegionales() ? '<span class="muted small">Para eliminar la sede que tienes abierta, primero abre otra. Las sedes con datos no se eliminan.</span>' : ''}
      <div class="fila gap8 wrap-f mt8"><input class="campo" id="sdNueva" placeholder="Nombre de la sede nueva" style="flex:1 1 220px">
        <button class="btn btn-pri" onclick="guardarSede(null, this)">+ Crear sede</button></div>
    </section>`;
  }
  function guardarSede(id, b) {
    const nombre = (id ? $('sdN-' + id) : $('sdNueva')).value;
    b.disabled = true;
    llamar('bdGuardarSede', { id, nombre }).then(sedes => {
      ini.sedesTodas = sedes; aplicarRegional(); regCfg = null;
      if (!ses.sedeId && ini.sedes[0]) { lg.sedeId = ini.sedes[0].id; ses.sedeId = lg.sedeId; guardarLS('sesion', { perfil: lg.perfil, nombre: lg.nombre, sedeId: lg.sedeId }); return verSede(lg.sedeId); }
      toast(id ? 'Nombre guardado' : `Sede ${nombre.trim()} creada. Ábrela para dibujar su plano.`, 'ok');
      pintarApp();
    }).catch(e => { toast(e.message, 'error'); b.disabled = false; });
  }


  function vistaConfigLista() {
    return `<div class="col gap16">
      <div class="fila-sb wrap-f">
        <div class="col gap4"><span class="h3">Zonas y filas</span>
          <span class="muted small">Aquí cambias los datos con números. Para dibujar y acomodar con el mouse, usa el «Editor del plano». Los niveles de cada posición se agregan desde el plano, tocando la posición, o con «Niveles» para toda una fila.</span></div>
        <div class="fila wrap-f gap8">
          <button class="btn btn-pri" onclick="formZona()">+ Zona</button>
        </div>
      </div>
      ${sede.zonas.length ? sede.zonas.map(zonaConfig).join('') : '<span class="muted">Aún no hay zonas. Crea la primera con "+ Zona".</span>'}
      ${eliminadosHtml()}
    </div>`;
  }

  // Zonas, racks y posiciones eliminados, con botón para restaurar
  function eliminadosHtml() {
    const el = sede.eliminados || { zonas: [], racks: [] };
    const quitadas = [];
    sede.racks.forEach(r => r.omitidas.forEach(p => quitadas.push({ r, p })));
    if (!el.zonas.length && !el.racks.length && !quitadas.length) return '';
    let h = `<section class="card col gap8"><span class="h3">Eliminados</span>
      <span class="muted small">Si eliminaste algo por error, restáuralo aquí. Los niveles hay que volver a crearlos.</span>`;
    el.zonas.forEach(z => h += `<div class="fila-sb"><span>Zona <b>${esc(z.nombre)}</b></span>
      <button class="btn btn-sec" onclick="restaurar('zona', '${esc(z.id)}', this)">Restaurar</button></div>`);
    el.racks.forEach(r => h += `<div class="fila-sb"><span>Rack <b>${esc(r.nombre)}</b> <span class="muted small">${esc(r.zona)}</span></span>
      <button class="btn btn-sec" onclick="restaurar('rack', '${esc(r.id)}', this)">Restaurar</button></div>`);
    quitadas.forEach(({ r, p }) => h += `<div class="fila-sb"><span>Posición <b>${p}</b> de ${esc(r.nombre)} <span class="muted small">${esc(sede.zonaPorId[r.zonaId].nombre)}</span></span>
      <button class="btn btn-sec" onclick="restaurarPos('${esc(r.id)}', ${p}, this)">Restaurar</button></div>`);
    return h + '</section>';
  }

  function restaurar(tipo, id, boton) {
    accion('bdRestaurar', { sedeId: ses.sedeId, tipo, id }, tipo === 'zona' ? 'Zona restaurada' : 'Rack restaurado', boton);
  }

  function restaurarPos(rackId, p, boton) {
    if (!boton && !confirm(`¿Volver a poner la posición ${p}?`)) return;
    accion('bdPosicionActiva', { sedeId: ses.sedeId, rackId, posicion: p, activa: true }, 'Posición restaurada', boton);
  }

  function resumenNiveles(r) {
    let min = Infinity, max = 0, conPk = 0, sin = 0, total = 0;
    for (let p = 1; p <= r.posiciones; p++) {
      if (r.omitidas.includes(p)) continue;
      total++;
      const esps = espaciosDe(r.id, p);
      if (!esps.length) { sin++; continue; }
      const n = new Set(esps.filter(e => e.nivel > 0).map(e => e.nivel)).size;
      min = Math.min(min, n); max = Math.max(max, n);
      if (esps.some(e => e.nivel === 0)) conPk++;
    }
    if (sin === total) return '<span class="muted">Sin niveles</span>';
    let t = (min === max ? min : `${min} a ${max}`) + ' niveles';
    if (conPk) t += ' + picking';
    if (sin) t += ` <span class="muted small">(${sin} sin niveles)</span>`;
    return t;
  }

  function zonaConfig(z) {
    const racks = sede.racks.filter(r => r.zonaId === z.id);
    const pg = paginar('rk_' + z.id, racks, pintarApp);
    return `<section class="card col gap10" style="border-left:6px solid ${esc(z.color)}">
      <div class="fila-sb wrap-f">
        <span class="h3">${esc(z.nombre)}</span>
        <div class="fila gap8 wrap-f">
          <button class="btn btn-sec" onclick="formZona('${esc(z.id)}')">Editar</button>
          <button class="btn btn-sec" onclick="formRack(null, '${esc(z.id)}')">+ Rack</button>
          <button class="btn btn-sal" onclick="borrarZona('${esc(z.id)}')">Eliminar</button>
        </div>
      </div>
      ${racks.length ? `<div class="tabla"><table>
        <thead><tr><th>Rack</th><th>Código</th><th>Posiciones</th><th>Niveles</th><th></th></tr></thead>
        <tbody>${pg.filas.map(r => `<tr>
          <td class="fuerte">${esc(r.nombre)}</td>
          <td class="muted">${esc(r.id)}</td>
          <td>${r.posiciones - r.omitidas.length}${r.omitidas.length ? ` <span class="muted small">(${r.omitidas.length} quitadas)</span>` : ''}</td>
          <td>${resumenNiveles(r)}</td>
          <td><div class="fila gap8"><button class="btn btn-sec" onclick="formRack('${esc(r.id)}')">Editar</button>
            <button class="btn btn-sec" onclick="abrirRackModal('${esc(r.id)}')">Niveles</button>
            <button class="btn btn-sec" onclick="pedirEtiquetasRack('${esc(r.id)}')">Etiquetas</button></div></td>
        </tr>`).join('')}</tbody></table></div>${pg.barra}` : '<span class="muted small">Sin racks.</span>'}
    </section>`;
  }

  function formZona(zonaId) {
    const z = zonaId ? sede.zonaPorId[zonaId] : null;
    abrirModal(`
      <div class="fila-sb"><span class="h2">${z ? 'Editar zona' : 'Nueva zona'}</span>${btnCerrar()}</div>
      <label class="lbl" for="zNom">Nombre</label>
      <input id="zNom" class="campo" value="${esc(z ? z.nombre : '')}" placeholder="Ej. Seco, Congelados, Calidad">
      <label class="lbl" for="zCol">Color en el mapa</label>
      <input id="zCol" class="campo" type="color" value="${esc(z ? z.color : '#1F9BA6')}">
      <span class="lbl">Ubicación en el plano (opcional)</span>
      <span class="muted small">Déjalo vacío y la zona aparece debajo del plano. Medidas en puntos del plano. Si cambias X o Y, sus filas se mueven con ella.</span>
      <div class="dos">
        <div><label class="lbl" for="zX">Desde la izquierda (X)</label><input id="zX" class="campo" type="number" value="${z && z.x !== null ? z.x : ''}"></div>
        <div><label class="lbl" for="zY">Desde arriba (Y)</label><input id="zY" class="campo" type="number" value="${z && z.y !== null ? z.y : ''}"></div>
        <div><label class="lbl" for="zW">Ancho</label><input id="zW" class="campo" type="number" value="${z && z.ancho !== null ? z.ancho : ''}"></div>
        <div><label class="lbl" for="zH">Alto</label><input id="zH" class="campo" type="number" value="${z && z.alto !== null ? z.alto : ''}"></div>
      </div>
      <p id="fErr" class="error" hidden></p>
      <div class="dos mt16">
        <button class="btn btn-sec btn-xl" onclick="cerrarModal()">Cancelar</button>
        <button class="btn btn-pri btn-xl" onclick="accion('bdGuardarZona', { sedeId: ses.sedeId, zonaId: ${z ? `'${esc(z.id)}'` : 'null'}, nombre: $('zNom').value, color: $('zCol').value, x: $('zX').value, y: $('zY').value, ancho: $('zW').value, alto: $('zH').value }, 'Zona guardada', this)">Guardar</button>
      </div>
      ${z && (z.areas || []).length ? `<span class="lbl mt16">Partes aparte de esta zona en el plano</span>
        <span class="muted small">Recuadros que se dibujan aparte pero son de ${esc(z.nombre)}. Puedes volver uno una zona propia, con su nombre y color: sus filas pasan a la zona nueva y el producto ubicado no cambia.</span>
        ${z.areas.map((a, i) => { const fs = sede.racks.filter(r => r.zonaId === z.id && (() => { const t = r.tramos ? r.tramos[0] : r; return t.x >= a.x && t.x <= a.x + a.ancho && t.y >= a.y && t.y <= a.y + a.alto; })());
          return `<div class="ra-fila mt8"><span class="col flex1"><b>Parte ${i + 1}</b><span class="muted small">${fs.length ? 'Filas: ' + fs.map(r => esc(r.nombre)).join(', ') : 'Sin filas'}</span></span>
            <button class="btn btn-sec btn-mini" onclick="separarArea('${esc(z.id)}', ${i})">Volverla zona propia</button></div>`; }).join('')}` : ''}`);
    $('zNom').focus();
  }

  function separarArea(zonaId, i) {
    const z = sede.zonaPorId[zonaId];
    abrirModal(`<div class="fila-sb"><span class="h2">Zona nueva</span>${btnCerrar()}</div>
      <span class="muted small mt8">La parte ${i + 1} de ${esc(z.nombre)} queda como una zona propia. Sus filas pasan a esta zona; los códigos de las ubicaciones y el producto ubicado no cambian.</span>
      <label class="lbl mt12" for="saNom">Nombre</label>
      <input id="saNom" class="campo" placeholder="Ej. Seco 2, Promociones">
      <label class="lbl" for="saCol">Color en el mapa</label>
      <input id="saCol" class="campo" type="color" value="#E65100">
      <p id="fErr" class="error" hidden></p>
      <div class="dos mt16"><button class="btn btn-sec btn-xl" onclick="formZona('${esc(zonaId)}')">Volver</button>
        <button class="btn btn-pri btn-xl" onclick="accion('bdSepararArea', { sedeId: ses.sedeId, zonaId: '${esc(zonaId)}', indice: ${i}, nombre: $('saNom').value, color: $('saCol').value }, 'Zona creada', this)">Crear zona</button></div>`);
    $('saNom').focus();
  }

  function borrarZona(zonaId) {
    if (!confirm('¿Eliminar esta zona con sus racks? Solo se puede si no tiene producto.')) return;
    llamar('bdEliminarZona', ses.sedeId, zonaId)
      .then(d => { setSede(d); toast('Zona eliminada', 'ok'); pintarApp(); })
      .catch(e => toast(e.message, 'error'));
  }

  function formRack(rackId, zonaId) {
    const r = rackId ? sede.rackPorId[rackId] : null;
    form = { rackId: rackId || null };
    const zSel = r ? r.zonaId : zonaId;
    abrirModal(`
      <div class="fila-sb"><span class="h2">${r ? 'Editar rack' : 'Nuevo rack'}</span>${btnCerrar()}</div>
      <label class="lbl" for="rNom">Nombre</label>
      <input id="rNom" class="campo" value="${esc(r ? r.nombre : '')}" placeholder="Ej. Fila 1">
      <label class="lbl" for="rZona">Zona</label>
      <select id="rZona" class="campo">${sede.zonas.map(z =>
        `<option value="${esc(z.id)}" ${z.id === zSel ? 'selected' : ''}>${esc(z.nombre)}</option>`).join('')}</select>
      <label class="lbl" for="rPos">Posiciones (de punta a punta)</label>
      <input id="rPos" class="campo" type="number" inputmode="numeric" min="1" value="${r ? r.posiciones : 16}">
      <span class="lbl">Tipo de fila</span>
      <div class="opciones">
        ${opcion('rfondo', 'D', 'Doble fondo', 'A-B-C-D por nivel', !r || r.fondo === 'D')}
        ${opcion('rfondo', 'S', 'Sin doble fondo', 'A-B por nivel', r && r.fondo === 'S')}
      </div>
      <label class="lbl" for="rNum">¿Dónde queda la posición 1 en el plano?</label>
      <select id="rNum" class="campo">
        <option value="NORMAL" ${!r || !r.invertida ? 'selected' : ''}>Abajo (o a la izquierda si es horizontal)</option>
        <option value="INVERTIDA" ${r && r.invertida ? 'selected' : ''}>Arriba (o a la derecha si es horizontal)</option></select>
      <span class="muted small" style="margin-top:4px">Solo cambia cómo se ve el dibujo: los códigos, lo ubicado y el historial quedan igual. Para quitar una posición puntual (una columna, una puerta), tócala en el mapa y usa "Quitar esta posición".</span>
      <span class="lbl">Ubicación en el plano (opcional)</span>
      <span class="muted small">Toca "Elegir en el plano" y luego el punto donde empieza la fila (su parte de arriba). Si lo dejas vacío, se acomoda sola dentro de su zona.</span>
      <button class="btn btn-sec" style="margin-top:8px" onclick="elegirLugar()">Elegir en el plano</button>
      <div class="dos">
        <div><label class="lbl" for="rX">Desde la izquierda (X)</label><input id="rX" class="campo" type="number" value="${r && r.x !== null ? r.x : ''}"></div>
        <div><label class="lbl" for="rY">Desde arriba (Y)</label><input id="rY" class="campo" type="number" value="${r && r.y !== null ? r.y : ''}"></div>
        <div><label class="lbl" for="rL">Largo</label><input id="rL" class="campo" type="number" value="${r && r.largo !== null ? r.largo : ''}"></div>
        <div><label class="lbl" for="rO">Dirección</label><select id="rO" class="campo">
          <option value="V" ${!r || r.orientacion === 'V' ? 'selected' : ''}>Vertical</option>
          <option value="H" ${r && r.orientacion === 'H' ? 'selected' : ''}>Horizontal</option></select></div>
      </div>
      <p id="fErr" class="error" hidden></p>
      <div class="dos mt16">
        ${r ? `<button class="btn btn-sal btn-xl" onclick="borrarRack('${esc(r.id)}')">Eliminar</button>`
            : `<button class="btn btn-sec btn-xl" onclick="cerrarModal()">Cancelar</button>`}
        <button class="btn btn-pri btn-xl" onclick="accion('bdGuardarRack', { sedeId: ses.sedeId, rackId: ${r ? `'${esc(r.id)}'` : 'null'}, nombre: $('rNom').value, zonaId: $('rZona').value, posiciones: Number($('rPos').value), fondo: valorRadio('rfondo'), x: $('rX').value, y: $('rY').value, largo: $('rL').value, orientacion: $('rO').value, numeracion: $('rNum').value }, 'Fila guardada', this)">Guardar</button>
      </div>`);
    $('rNom').focus();
  }

  /* ----- Elegir el lugar de una fila tocando el plano ----- */
  let colocando = null; // datos del formulario mientras se elige el lugar

  function elegirLugar() {
    colocando = {
      rackId: form && form.rackId, nombre: $('rNom').value, zona: $('rZona').value, pos: $('rPos').value,
      fondo: valorRadio('rfondo'), largo: $('rL').value, o: $('rO').value
    };
    cerrarModal();
    vista = 'mapa'; posSel = null; espSel = null;
    pintarApp();
    if (!$('plano')) { toast('Esta sede no tiene plano', 'error'); return volverFormRack(); }
    const wrap = $('planoWrap');
    wrap.classList.add('colocando');
    wrap.insertAdjacentHTML('beforebegin', `<div class="colocar-aviso" id="avisoColocar"><span>Toca en el plano dónde empieza la fila (arriba)</span>
      <button class="btn btn-sec" onclick="volverFormRack()">Cancelar</button></div>`);
    wrap.addEventListener('click', tocarPlano, true);
    $('avisoColocar').scrollIntoView({ block: 'nearest' });
  }

  function tocarPlano(ev) {
    ev.preventDefault();
    ev.stopPropagation();
    const pl = $('plano');
    const rect = pl.getBoundingClientRect();
    const escala = rect.width / Number(pl.dataset.w);
    colocando.x = Math.round((ev.clientX - rect.left) / escala);
    colocando.y = Math.round((ev.clientY - rect.top) / escala);
    if (!colocando.largo) colocando.largo = 260;
    volverFormRack();
  }

  function volverFormRack() {
    const wrap = $('planoWrap');
    if (wrap) wrap.removeEventListener('click', tocarPlano, true);
    vista = 'config';
    const c = colocando;
    colocando = null;
    pintarApp();
    formRack(c.rackId || null, c.zona);
    $('rNom').value = c.nombre; $('rPos').value = c.pos; $('rO').value = c.o;
    const f = document.querySelector(`input[name="rfondo"][value="${c.fondo}"]`);
    if (f) f.checked = true;
    if (c.x !== undefined) { $('rX').value = c.x; $('rY').value = c.y; $('rL').value = c.largo; }
  }

  function borrarRack(rackId) {
    if (!confirm('¿Eliminar este rack con todas sus posiciones? Solo se puede si está vacío.')) return;
    if (posSel && posSel.rackId === rackId) { posSel = null; espSel = null; }
    llamar('bdEliminarRack', ses.sedeId, rackId)
      .then(d => { setSede(d); cerrarModal(); toast('Rack eliminado', 'ok'); pintarApp(); })
      .catch(e => errForm(e.message));
  }/* ================= Ventanas ================= */
  function btnCerrar() {
    return `<button class="icono icono-claro" aria-label="Cerrar" onclick="cerrarModal()">${ICONOS.cerrar}</button>`;
  }
  function abrirModal(html, clase) { $('caja').innerHTML = html; $('caja').classList.toggle('caja-ancha', clase === 'modal-ancho'); $('modal').hidden = false; }
  function cerrarModal() {
    $('modal').hidden = true;
    form = null; flujo = null; lugarCtx = null;
    if ($('scan') && !('ontouchstart' in window)) $('scan').focus({ preventScroll: true });
    if (vivoPend) setTimeout(repintarVivo, 50);
  }
  // El aviso va en la ventana abierta (si hay una); si no, en el formulario de la pantalla
  function errForm(t) { const p = (!$('modal').hidden && $('caja').querySelector('#fErr')) || $('fErr'); if (p) { p.textContent = t; p.hidden = false; } else toast(t, 'error'); }

  /* ================= Entradas y salidas ================= */
  function abrirForm(modo, i) {
    const l = i !== undefined ? sede.lineas[i] : null;
    const e = l ? sede.espacios.find(x => x.id === l.ubicacionId) : null;
    form = { modo, l, e };
    const und = leerLS('unidad') || 'CAJA';
    const titulo = modo === 'NUEVO' ? 'Agregar producto' : (modo === 'SALIDA' ? 'Salida' : 'Entrada') + ' · ' + etiqueta(e);

    let h = `<div class="fila-sb"><span class="h2">${esc(titulo)}</span>${btnCerrar()}</div>`;

    if (modo === 'NUEVO') {
      const esps = [...espaciosDe(posSel.rackId, posSel.posicion)]
        .sort((a, b) => b.nivel - a.nivel || a.lado.localeCompare(b.lado));
      // Solo se puede elegir un espacio con cupo
      const elegidoNuevo = espSel && esps.some(y => y.id === espSel) && !sinCupo(espSel)
        ? espSel : (esps.find(y => !lineasDe(y.id).length) || esps.find(y => !sinCupo(y.id)) || {}).id;
      if (!elegidoNuevo) { toast('Todos los espacios de esta posición están llenos', 'error'); return; }
      h += `<span class="muted small">${esc(sede.rackPorId[posSel.rackId].nombre)} · Posición ${posSel.posicion}</span>
        <label class="lbl" for="fEsp">Nivel y lado</label>
        <select id="fEsp" class="campo">${esps.map(x =>
          `<option value="${esc(x.id)}" ${sinCupo(x.id) ? 'disabled' : (x.id === elegidoNuevo ? 'selected' : '')}>${esc(etiqueta(x))}${sinCupo(x.id) ? ' (lleno)' : lineasDe(x.id).length ? ` (${cupoTxt(x.id)})` : ' (vacío)'}</option>`).join('')}
        </select>
        <label class="lbl" for="fProd">Producto (escanea o busca)</label>
        ${campoConCamara('<input id="fProd" class="campo" list="dlProductos" autocomplete="off">', 'fProd')}
        <button class="link" style="align-self:flex-start" onclick="formProducto(true)">¿No está en la lista? + Crear producto</button>
        <div class="dos">
          <div><label class="lbl" for="fLote">Lote</label><input id="fLote" class="campo"></div>
          <div><label class="lbl" for="fVenc">Vencimiento</label><input id="fVenc" type="date" class="campo"></div>
        </div>`;
    } else {
      h += `<div class="info"><span class="fuerte">${esc(l.nombre)}</span>
        <span class="muted small">Lote ${esc(l.lote || '—')} · Vence ${fFecha(l.vencimiento)} · Hay ${cant(l)}</span></div>`;
    }

    h += `<div class="dos">
        <div><label class="lbl" for="fCant">Cantidad</label>
          <input id="fCant" class="campo" type="number" inputmode="decimal" min="0" step="any"></div>
        <div><label class="lbl" for="fUnd">Unidad</label>
          <select id="fUnd" class="campo">${[['CAJA', 'Cajas'], ['UND', 'Unidades'], ['ESTIBA', 'Estibas']]
            .map(([v, t]) => `<option value="${v}" ${v === und ? 'selected' : ''}>${t}</option>`).join('')}</select></div>
      </div>
      <label class="lbl" for="fObs">Observación (opcional)</label>
      <input id="fObs" class="campo">
      <p id="fErr" class="error" hidden></p>
      <div class="dos mt16">
        <button class="btn btn-sec btn-xl" onclick="cerrarModal()">Cancelar</button>
        <button id="fOk" class="btn btn-xl ${modo === 'SALIDA' ? 'btn-sal-solido' : 'btn-ent-solido'}" onclick="guardarMov()">Guardar</button>
      </div>`;

    abrirModal(h);
    $('fCant').addEventListener('keydown', ev => { if (ev.key === 'Enter') { ev.preventDefault(); guardarMov(); } });
    (modo === 'NUEVO' ? $('fProd') : $('fCant')).focus();
  }

  // Crear producto. "desdeEntrada" = al terminar vuelve al formulario de entrada con el producto elegido
  function formProducto(desdeEntrada, ean) {
    if (sinPermiso('productos')) return;
    formProductoTras = ean ? (p => hojaProducto(p)) : null;
    const escrito = desdeEntrada && $('fProd') ? $('fProd').value.trim() : '';
    const guardado = desdeEntrada ? { esp: $('fEsp') && $('fEsp').value, lote: $('fLote').value, venc: $('fVenc').value } : null;
    abrirModal(`
      <div class="fila-sb"><span class="h2">Nuevo producto</span>${btnCerrar()}</div>
      <div class="dos">
        <div><label class="lbl" for="npCod">Código AFS</label><input id="npCod" class="campo" autocomplete="off" placeholder="Ej. 2680"></div>
        <div><label class="lbl" for="npNut">Código Nutresa</label><input id="npNut" class="campo" autocomplete="off" placeholder="Ej. 1049449"></div>
      </div>
      <label class="lbl" for="npNom">Nombre</label>
      <input id="npNom" class="campo" value="${esc(escrito)}">
      <label class="lbl" for="npCb">Código de barras (opcional, puedes escanearlo)</label>
      ${campoConCamara('<input id="npCb" class="campo" autocomplete="off">', 'npCb')}
      <div class="dos">
        <div><label class="lbl" for="npUM">Unidad de medida</label><input id="npUM" class="campo" placeholder="Ej. CJ"></div>
        <div><label class="lbl" for="npUnd">Und x caja (embalaje)</label><input id="npUnd" class="campo" type="number" inputmode="numeric" min="1" value="1"></div>
      </div>
      <p id="fErr" class="error" hidden></p>
      <div class="dos mt16">
        <button class="btn btn-sec btn-xl" onclick="${desdeEntrada ? 'abrirForm(\'NUEVO\')' : 'cerrarModal()'}">Cancelar</button>
        <button id="npOk" class="btn btn-pri btn-xl">Crear</button>
      </div>`);
    if (ean) $('npCb').value = ean;
    $('npNom').focus();
    formProductoOk = () => {
      const b = $('npOk');
      b.disabled = true; b.textContent = 'Guardando…';
      llamar('bdCrearProducto', { codigo: $('npCod').value, unidadMedida: $('npUM').value, codigoNutresa: $('npNut').value, nombre: $('npNom').value, codigoBarras: $('npCb').value,
        undPorCaja: $('npUnd').value })
        .then(r => {
          ini.productos = r.productos;
          $('dlProductos').innerHTML = r.productos.map(p => `<option value="${esc(p.id + ' · ' + p.nombre)}">`).join('');
          const p = r.productos.find(x => x.id === r.nuevo);
          toast('Producto creado', 'ok');
          if (desdeEntrada) {
            abrirForm('NUEVO');
            $('fProd').value = p.id + ' · ' + p.nombre;
            if (guardado.esp) $('fEsp').value = guardado.esp;
            $('fLote').value = guardado.lote; $('fVenc').value = guardado.venc;
            $('fLote').focus();
          } else {
            cerrarModal();
            pintarApp();
            if (formProductoTras) { const f = formProductoTras; formProductoTras = null; return f(p); }
            abrirFicha(p.id);
          }
        })
        .catch(e => { errForm(e.message); b.disabled = false; b.textContent = 'Crear'; });
    };
    $('npOk').onclick = formProductoOk;
  }
  let formProductoOk = null;
  let formProductoTras = null;   // qué hacer después de crear el producto (ej. mostrar su ventana al venir de un EAN nuevo)

  // Acepta: ID del producto, código de barras, o la opción elegida de la lista
  function buscarProducto(txt) {
    const t = (txt || '').trim(), T = t.toUpperCase();
    return ini.productos.find(p =>
      p.id.toUpperCase() === T ||
      (p.codigoBarras && p.codigoBarras === t) ||
      (p.ean2 && p.ean2 === t) || (p.ean14 && p.ean14 === t) ||   // segundo EAN 13 y el de la caja
      (p.codigoNutresa && p.codigoNutresa === t) ||
      (p.id + ' · ' + p.nombre).toUpperCase() === T);
  }

  // En un botón, "form" es el formulario HTML del botón; por eso se usa esta función
  // SALIDA desde la posición: sale todo lo de ese lote. Solo se confirma.
  function confirmarSalida(i, forzar) {
    if (sinPermiso('salida')) return;
    const l = sede.lineas[i];
    const e = sede.espPorId[l.ubicacionId];
    const antes = vencenAntes(l);
    let aviso = '';
    if (e && (e.lado === 'C' || e.lado === 'D')) {
      const frente = espaciosDe(e.rackId, e.posicion).find(x => x.nivel === e.nivel && x.lado === (e.lado === 'C' ? 'A' : 'B'));
      if (frente && lineasDe(frente.id).length) aviso += `<p class="aviso-n">${esc(etiqueta(frente))} está delante y tiene producto.</p>`;
    }
    if (antes.length && !forzar) {
      const a = antes[0], ea = sede.espPorId[a.ubicacionId];
      return abrirModal(`<div class="fila-sb"><span class="h2">Ojo con la rotación</span>${btnCerrar()}</div>
        <div class="alerta-fefo mt12"><b>No saques de aquí.</b> Este rótulo vence el <b>${fFecha(l.vencimiento)}</b> y hay otro que vence antes:
          <b>${esc(cu(a.ubicacionId))}</b> · rótulo ${esc(a.lote || '—')} · vence ${fFecha(a.vencimiento)}.</div>
        <button class="btn btn-ent btn-xl mt12" onclick="cerrarModal(); abrirPos('${esc(ea.rackId)}', ${ea.posicion}, '${esc(a.ubicacionId)}')">Ir al que vence antes</button>
        <button class="btn btn-sec btn-xl mt8" onclick="confirmarSalida(${i}, true)">Sacar de aquí de todos modos</button>
        <span class="muted small mt8">Si lo sacas de aquí, queda registrado como salida fuera de rotación.</span>`);
    }
    abrirModal(`<div class="fila-sb"><span class="h2">¿Seguro que sale?</span>${btnCerrar()}</div>
      <div class="resumen mt12"><div><span class="muted small">Sale todo de ${esc(etiqueta(e))}</span><b>${esc(l.nombre)}</b>
        <span class="muted small">${esc(textoUbic(e))} · Lote ${esc(l.lote || '—')} · Vence ${fFecha(l.vencimiento)}</span>
        <span class="fuerte">${cant(l)}</span></div></div>
      ${aviso}
      ${antes.length ? `<div class="alerta-fefo mt12"><b>Salida fuera de rotación.</b> ${esc(textoRotacion(antes))}.
        <label class="lbl mt8" for="slMotivo">Motivo</label>
        <select id="slMotivo" class="campo">${MOTIVOS.map(m => `<option>${m}</option>`).join('')}</select></div>` : ''}
      <span class="muted small mt8">El espacio queda libre y el rótulo ${esc(l.lote || '')} ya no se podrá volver a usar. Todo queda en el historial.</span>
      <p id="fErr" class="error" hidden></p>
      <div class="dos mt16"><button class="btn btn-sec btn-xl" onclick="cerrarModal()">No</button>
        <button id="slOk" class="btn btn-sal-solido btn-xl" onclick="hacerSalida(${i})">Sí, sacar todo</button></div>`);
  }

  function hacerSalida(i) {
    const l = sede.lineas[i];
    const antes = vencenAntes(l);
    const b = $('slOk'); b.disabled = true; b.textContent = 'Guardando…';
    llamar('bdMovimiento', { sedeId: ses.sedeId, tipo: 'SALIDA', ubicacionId: l.ubicacionId, productoId: l.productoId,
      cantidad: l.unidades, unidad: 'UND', lote: l.lote, vencimiento: l.vencimiento, usuario: ses.nombre,
      observacion: antes.length ? textoRotacion(antes) : 'Salida', fueraRotacion: antes.length > 0,
      motivo: antes.length && $('slMotivo') ? $('slMotivo').value : '' })
      .then(d => { setSede(d); cerrarModal(); pitido(); toast('Salida registrada. El espacio quedó libre.', 'ok'); pintarApp(); })
      .catch(err => { errForm(err.message); b.disabled = false; b.textContent = 'Sí, sacar todo'; });
  }

  function salidaDeTodosModos() { if (form) { form.fefoOk = true; guardarMov(); } }

  function guardarMov() {
    const cantidad = Number($('fCant').value);
    if (!(cantidad > 0)) return errForm('Escribe una cantidad mayor que 0.');
    const unidad = $('fUnd').value;
    guardarLS('unidad', unidad);

    const d = { sedeId: ses.sedeId, cantidad, unidad, observacion: $('fObs').value, usuario: ses.nombre };
    const { modo, l, e } = form;

    if (modo === 'NUEVO') {
      const p = buscarProducto($('fProd').value);
      if (!p) return errForm('Producto no encontrado. Elígelo de la lista o escanéalo.');
      Object.assign(d, { tipo: 'ENTRADA', ubicacionId: $('fEsp').value, productoId: p.id,
        lote: $('fLote').value.trim(), vencimiento: $('fVenc').value });
    } else {
      Object.assign(d, { tipo: modo, ubicacionId: l.ubicacionId, productoId: l.productoId,
        lote: l.lote, vencimiento: l.vencimiento });
      // Doble fondo: C está detrás de A y D detrás de B
      if (modo === 'SALIDA') {
        const antes = vencenAntes(l);
        if (antes.length && !form.fefoOk) {
          const a = antes[0], ea = sede.espPorId[a.ubicacionId];
          const p = $('fErr');
          p.className = 'alerta-fefo mt12';
          p.innerHTML = `<b>No saques de aquí.</b> Hay un rótulo que vence antes: <b>${esc(cu(a.ubicacionId))}</b> · rótulo ${esc(a.lote || '—')} · vence ${fFecha(a.vencimiento)}.
            <span class="fila gap8 wrap-f mt8">
              <button class="btn btn-ent" onclick="cerrarModal(); abrirPos('${esc(ea.rackId)}', ${ea.posicion}, '${esc(a.ubicacionId)}')">Ir al que vence antes</button>
              <button class="btn btn-sec" onclick="salidaDeTodosModos()">Sacar de aquí de todos modos</button></span>`;
          p.hidden = false;
          return;
        }
        if (antes.length) Object.assign(d, { fueraRotacion: true, motivo: d.observacion || '',
          observacion: textoRotacion(antes) + (d.observacion ? ' · ' + d.observacion : '') });
      }
      if (modo === 'SALIDA' && (e.lado === 'C' || e.lado === 'D')) {
        const delante = e.lado === 'C' ? 'A' : 'B';
        const frente = espaciosDe(e.rackId, e.posicion).find(x => x.nivel === e.nivel && x.lado === delante);
        if (frente && lineasDe(frente.id).length &&
            !confirm(`${etiqueta(frente)} está delante y tiene producto. ¿Registrar la salida de todos modos?`)) return;
      }
    }

    const b = $('fOk');
    b.disabled = true;
    b.textContent = 'Guardando…';
    llamar('bdMovimiento', d)
      .then(nueva => {
        setSede(nueva);
        cerrarModal();
        pitido();
        toast(`${d.tipo === 'ENTRADA' ? 'Entrada' : 'Salida'} registrada`, 'ok');
        pintarApp();
      })
      .catch(err => {
        errForm(err.message);
        b.disabled = false;
        b.textContent = 'Guardar';
      });
  }