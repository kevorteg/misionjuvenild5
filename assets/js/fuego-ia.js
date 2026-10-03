(function () {
  'use strict';

  var FUEGO_CONFIG = {
    workerUrl: 'https://fuego-d5.D5-USUARIO.workers.dev',
    sessionKey: 'fuegoD5:v1'
  };

  var CANALES = {
    podcast: {
      titulo: 'Fuego D5 · Podcast',
      subtitulo: 'Episodios, temas y dónde escucharlos',
      icono: 'podcasts',
      sugerencias: [
        '¿De qué trata el podcast?',
        '¿Cuál es el último episodio?',
        '¿Cómo escucho el podcast?',
        '¿Qué es Desafíos en la Academia?'
      ]
    },
    campus: {
      titulo: 'Fuego D5 · Campus',
      subtitulo: 'Colegios, universidades y Healthy Kids',
      icono: 'school',
      sugerencias: [
        '¿Qué ofrecen en los colegios?',
        '¿Qué ofrecen en las universidades?',
        '¿Qué actividades tienen?',
        '¿Cómo llego al campus?'
      ]
    },
    recursos: {
      titulo: 'Fuego D5 · Recursos',
      subtitulo: 'Muro espiritual, devocionales y recursos de la web',
      icono: 'menu_book',
      sugerencias: [
        '¿Qué es el Muro Espiritual?',
        '¿Qué es la revista Desenrúdate?',
        '¿Qué materiales puedo descargar?',
        '¿Qué hay en A un Click?'
      ]
    },
   unirme: {
      titulo: 'Fuego D5 · Unirme',
      subtitulo: 'Cómo participar y menemukanos',
      icono: 'volunteer_activism',
      sugerencias: [
        '¿Cómo me uno a D5?',
        '¿Cómo los contacto?',
        '¿Quiénes son?',
        '¿Qué impacto hacen?'
      ]
    }
  };

  var MENSAJE_BIENVENIDA =
    'Hola, soy Fuego D5 IA. Dime qué necesitas encontrar en la web de Misión Juvenil D5 ' +
    'y te paso el enlace o los pasos exactos.';

  var RESPUESTAS_LOCALES = [
    {
      claves: ['escuela de la vida', 'healthy kids', 'd5 day', 'escuela de vida'],
      texto: 'No encontré esos nombres en el contenido de la web de D5, así que no te los puedo confirmar.\n' +
        'Lo que sí existe son estos espacios: el Muro Espiritual, la revista Desenrúdate, el catálogo de ' +
        'materiales descargables y la sección A un Click.',
      fuentes: [
        { titulo: 'Muro Espiritual', url: 'muro-espiritual.html' },
        { titulo: 'A un Click', url: 'digital.html' }
      ]
    },
    {
      claves: ['muro espiritual', 'muro'],
      texto: 'El Muro Espiritual es el espacio de la web donde D5 publica lo que va aprendiendo de Dios ' +
        'con su gente: devocionales, oraciones y palabras para el día a día.\n' +
        'Se entra desde recursos.html o directo desde el menú.',
      fuentes: [
        { titulo: 'Muro Espiritual', url: 'muro-espiritual.html' },
        { titulo: 'Recursos', url: 'recursos.html' }
      ]
    },
    {
      claves: ['desenrúdate', 'desenrùdate', 'desenruudate', 'revista'],
      texto: 'Desenrúdate es la revista digital de Misión Juvenil D5. El Vol. 1 se titula ' +
        '"Voces reales de jóvenes en acción" y recoge lo que jóvenes de D5 están viviendo.\n' +
        'Está dentro de recursos.html, junto al catálogo de materiales descargables.',
      fuentes: [{ titulo: 'Recursos', url: 'recursos.html' }]
    },
    {
      claves: ['descarg', 'materiales', 'catálogo', 'catalogo'],
      texto: 'En recursos.html está el catálogo de materiales descargables de D5. Es la sección donde ' +
        'el equipo deja los recursos listos para que los descargues y los uses.',
      fuentes: [{ titulo: 'Recursos', url: 'recursos.html' }]
    },
    {
      claves: ['un click', 'a un click', 'digital', 'instagram', 'redes', 'youtube'],
      texto: 'A un Click es la sección de los canales digitales de D5: Instagram, los podcasts que encienden ' +
        'propósito, contenido breve para el día a día y el equipo de redes.\n' +
        'El canal de YouTube oficial es youtube.com/@MisionJuvenil-ey7ql.',
      fuentes: [
        { titulo: 'A un Click', url: 'digital.html' },
        { titulo: 'Contacto', url: 'contacto.html' }
      ]
    },
    {
      claves: ['último episodio', 'ultimo episodio', 'episodio 8', 'ep 8', 'ep. 08'],
      texto: 'El episodio más reciente es el Ep. 08, "El Poder del Propósito".\n' +
        'Antes van el Ep. 06 "Silenciar el Ruido Interior", el Ep. 05 "Liderazgo que Enciende" ' +
        'y el Ep. 03 "Bienvenido a la U".',
      fuentes: [{ titulo: 'Podcast D5 Fuego', url: 'podcast.html' }]
    },
    {
      claves: ['desafíos en la academia', 'desafios en la academia', 'academia', 'fe, sexualidad', 'presión social', 'presion social'],
      texto: 'Esos son los temas que el podcast trabaja: por ejemplo "Desafíos en la Academia" y ' +
        'el bloque "¿Tienes dudas de fe, sexualidad o presión social?".\n' +
        'Todo el audio está en podcast.html.',
      fuentes: [{ titulo: 'Podcast D5 Fuego', url: 'podcast.html' }]
    },
    {
      claves: ['podcast', 'episodio', 'escuchar', 'audio', 'd5 fuego'],
      texto: 'El podcast oficial es "Podcast D5 Fuego" y publica un episodio nuevo cada semana.\n' +
        'Todos los episodios están en podcast.html, y también hay botones para escucharlo directo ' +
        'desde la página de inicio.',
      fuentes: [{ titulo: 'Podcast D5 Fuego', url: 'podcast.html' }]
    },
    {
      claves: ['colegio', 'colegios', 'universidad', 'universidades', 'campus', 'actividad', 'calendario'],
      texto: 'D5 trabaja con colegios y universidades, y hay un calendario de actividades para ver ' +
        'las fechas de los próximos encuentros.\n' +
        'Colegios, universidades y calendario están en páginas separadas: colegios.html, ' +
        'universidades.html y calendario.html.',
      fuentes: [
        { titulo: 'Colegios', url: 'colegios.html' },
        { titulo: 'Universidades', url: 'universidades.html' },
        { titulo: 'Calendario', url: 'calendario.html' }
      ]
    },
    {
      claves: ['contacto', 'contactar', 'escribir', 'correo', 'email', 'whatsapp', 'teléfono', 'telefono'],
      texto: 'El correo oficial es info@misionjuvenild5.com y esa es la vía más segura para escribir al equipo.\n' +
        'El canal de YouTube es youtube.com/@MisionJuvenil-ey7ql.\n' +
        'Todo está en contacto.html.',
      fuentes: [{ titulo: 'Contacto', url: 'contacto.html' }]
    },
    {
      claves: ['quiénes son', 'quienes son', 'quién es', 'historia', 'equipo', 'misión', 'mision'],
      texto: 'Misión Juvenil D5 es una historia escrita por Dios en los campus del Distrito 5.\n' +
        'La página Quiénes Somos cuenta la historia, trae anécdotas del camino, vidas transformadas ' +
        'y el equipo que sostiene el movimiento.',
      fuentes: [
        { titulo: 'Quiénes Somos', url: 'quienes-somos.html' },
        { titulo: 'Impacto', url: 'impacto.html' }
      ]
    },
    {
      claves: ['unirme', 'unirme', 'participar', 'sumarte', 'impacto', 'voluntario', 'ser parte'],
      texto: 'Para sumarte a D5 lo más directo es escribir a info@misionjuvenild5.com contando ' +
        'en qué colegio o universidad estás.\n' +
        'La página de Impacto muestra dónde deja huella el movimiento y por qué vale la pena sumarte.',
      fuentes: [
        { titulo: 'Impacto', url: 'impacto.html' },
        { titulo: 'Contacto', url: 'contacto.html' }
      ]
    },
    {
      claves: ['salud mental', 'depresión', 'ansiedad', 'ansiedad', 'crisis', 'suicid', 'solo', 'acompañamiento'],
      texto: 'Misión Juvenil D5 no da atención clínica, pero sí acompañamiento: son una familia que ' +
        'camina contigo y ofrecen una primera cita gratis.\n' +
        'Si necesitas hablar con alguien hoy, entra a salud-mental.html y escríbele al equipo.',
      crisis: true,
      fuentes: [{ titulo: 'Salud Mental', url: 'salud-mental.html' }]
    },
    {
      claves: ['duda', 'pregunta frecuente', 'faq'],
      texto: 'Hay una sección de preguntas frecuentes con las dudas que más se repiten.\n' +
        'Está en preguntas-frecuentes.html.',
      fuentes: [{ titulo: 'Preguntas Frecuentes', url: 'preguntas-frecuentes.html' }]
    }
  ];

  function normalizar(texto) {
    return String(texto || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  function buscarRespuestaLocal(pregunta) {
    var texto = normalizar(pregunta);
    for (var i = 0; i < RESPUESTAS_LOCALES.length; i++) {
      var reglas = RESPUESTAS_LOCALES[i];
      for (var j = 0; j < reglas.claves.length; j++) {
        if (texto.indexOf(normalizar(reglas.claves[j])) !== -1) return reglas;
      }
    }
    return null;
  }

  function respuestaDeEscape() {
    return {
      texto: 'No encontré eso en la web de Misión Juvenil D5. Estos son los puntos de entrada:\n' +
        '· Podcast D5 Fuego → podcast.html\n' +
        '· Colegios y universidades → colegios.html / universidades.html\n' +
        '· Recursos, Desenrúdate y Muro Espiritual → recursos.html\n' +
        '· Para unirte → contacto.html\n' +
        'Prueba con otras palabras y te oriento.',
      fuentes: [
        { titulo: 'Podcast', url: 'podcast.html' },
        { titulo: 'Recursos', url: 'recursos.html' },
        { titulo: 'Contacto', url: 'contacto.html' }
      ]
    };
  }

  var $ = function (id) { return document.getElementById(id); };

  var el = {
    sidebar: $('fuegoSidebar'),
    toggleSidebar: $('fuegoToggleSidebar'),
    openSidebar: $('fuegoOpenSidebar'),
    content: $('fuegoContent'),
    header: $('fuegoHeader'),
    headerLead: $('fuegoHeaderLead'),
    nueva: $('fuegoNueva'),
    buscar: $('fuegoBuscar'),
    historial: $('fuegoHistorial'),
    titulo: $('fuegoTitulo'),
    limpiar: $('fuegoLimpiar'),
    canales: $('fuegoCanales'),
    mensajes: $('fuegoMensajes'),
    vacio: $('fuegoVacio'),
    sugerenciasBox: $('fuegoSugerenciasBox'),
    sugerencias: $('fuegoSugerencias'),
    input: $('fuegoInput'),
    contador: $('fuegoContador'),
    enviar: $('fuegoEnviar')
  };

  var estado = {
    canal: 'podcast',
    colapsado: false,
    cargando: false,
    sesiones: [],
    sesionActual: null,
    mensajes: []
  };

  function guardar() {
    try {
      sessionStorage.setItem(FUEGO_CONFIG.sessionKey, JSON.stringify({
        sesiones: estado.sesiones.slice(0, 12),
        actual: estado.sesionActual,
        mensajes: estado.mensajes.slice(-40),
        canal: estado.canal
      }));
    } catch (e) { }
  }

  function recuperar() {
    try {
      var raw = sessionStorage.getItem(FUEGO_CONFIG.sessionKey);
      if (!raw) return;
      var data = JSON.parse(raw);
      estado.sesiones = Array.isArray(data.sesiones) ? data.sesiones : [];
      estado.sesionActual = data.actual || null;
      estado.mensajes = Array.isArray(data.mensajes) ? data.mensajes : [];
      estado.canal = CANALES[data.canal] ? data.canal : 'podcast';
    } catch (e) {
      estado.sesiones = [];
      estado.mensajes = [];
    }
  }

  function crearId() {
    return 's' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  }

  function escapar(texto) {
    return String(texto == null ? '' : texto)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function scrollAbajo() {
    window.requestAnimationFrame(function () {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    });
  }

  function pillIcon(nombre, relleno) {
    return '<span class="material-symbols-outlined text-[16px] text-primary"' +
      (relleno ? ' style="font-variation-settings:\'FILL\' 1;"' : '') + '>' + nombre + '</span>';
  }

  function burbujaIA(mensaje) {
    var html = '';
    html += '<div class="chat-fade-in flex items-start gap-2 w-full">';
    html += '<div class="w-7 h-7 shrink-0 rounded-lg bg-primary-container flex items-center justify-center">';
    html += '<span class="material-symbols-outlined text-[17px] text-white" style="font-variation-settings:\'FILL\' 1;">local_fire_department</span>';
    html += '</div>';
    html += '<div class="flex flex-col gap-1 max-w-[85%] min-w-0">';
    html += '<div class="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">' + escapar(mensaje.autor) + '</div>';
    html += '<div class="bg-surface-container px-3 py-2 rounded-2xl rounded-tl-sm text-on-surface text-[13px] leading-relaxed whitespace-pre-line">' + escapar(mensaje.texto) + '</div>';

    if (mensaje.crisis) {
      html += '<a href="salud-mental.html" class="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-error-container text-on-error-container text-[11px] font-black uppercase tracking-wide shadow-[0_2px_0_0_#93000a]">';
      html += pillIcon('volunteer_activism');
      html += '<span>Hablar con Línea de Apoyo</span></a>';
    }

    if (mensaje.fuentes && mensaje.fuentes.length) {
      html += '<div class="flex flex-wrap gap-1">';
      mensaje.fuentes.forEach(function (f) {
        var etiqueta = f.titulo || f.pagina || 'Fuente';
        html += '<a href="' + escapar(f.url || '#') + '" class="sugerencia !py-1 !px-2 !text-[10px]">';
        html += pillIcon('article', false);
        html += '<span>' + escapar(etiqueta) + '</span></a>';
      });
      html += '</div>';
    }

    if (mensaje.aviso) {
      html += '<div class="flex items-center gap-1 text-[10px] font-bold text-on-surface-variant px-1">';
      html += pillIcon('info', false);
      html += '<span>' + escapar(mensaje.aviso) + '</span></div>';
    }

    html += '</div></div>';
    return html;
  }

  function burbujaUsuario(mensaje) {
    return '<div class="chat-fade-in flex justify-end w-full">' +
      '<div class="flex flex-col items-end gap-1 max-w-[85%] min-w-0">' +
      '<div class="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Tú</div>' +
      '<div class="bg-primary-container px-3 py-2 rounded-2xl rounded-tr-sm text-on-primary-container text-[13px] font-semibold leading-relaxed whitespace-pre-line">' +
      escapar(mensaje.texto) + '</div></div></div>';
  }

  function pintarMensajes() {
    var previas = el.mensajes.querySelectorAll('[data-fuego-msg]');
    for (var i = 0; i < previas.length; i++) previas[i].remove();
    el.vacio.style.display = estado.mensajes.length ? 'none' : '';
    el.mensajes.insertAdjacentHTML('beforeend', estado.mensajes.map(function (m) {
      var html = m.rol === 'user' ? burbujaUsuario(m) : burbujaIA(m);
      return html.replace('<div class="chat-fade-in', '<div data-fuego-msg class="chat-fade-in');
    }).join(''));
  }

  function pintarIndicador(visible) {
    var viejo = $('fuegoTyping');
    if (viejo) viejo.remove();
    if (!visible) return;
    var html = '<div id="fuegoTyping" class="chat-fade-in flex items-start gap-2 w-full">';
    html += '<div class="w-7 h-7 shrink-0 rounded-lg bg-primary-container flex items-center justify-center">';
    html += '<span class="material-symbols-outlined text-[17px] text-white" style="font-variation-settings:\'FILL\' 1;">local_fire_department</span></div>';
    html += '<div class="bg-surface-container px-3 py-2.5 rounded-2xl rounded-tl-sm flex items-center gap-1">';
    ['a', 'b', 'c'].forEach(function (p) {
      html += '<span class="fuego-punto w-1.5 h-1.5 rounded-full bg-on-surface-variant" style="animation-delay:' +
        ({ a: '0s', b: '0.15s', c: '0.3s' })[p] + '"></span>';
    });
    html += '</div></div>';
    el.mensajes.insertAdjacentHTML('beforeend', html);
    scrollAbajo();
  }

  function pintarSugerencias() {
    var lista = CANALES[estado.canal].sugerencias;
    el.sugerencias.innerHTML = lista.map(function (t) {
      return '<button type="button" class="sugerencia" data-pregunta="' + escapar(t) + '">' +
        pillIcon('arrow_outward', false) + '<span>' + escapar(t) + '</span></button>';
    }).join('');
  }

  function pintarHistorial(filtro) {
    var texto = (filtro || '').toLowerCase().trim();
    var items = estado.sesiones.filter(function (s) {
      return !texto || (s.titulo || '').toLowerCase().indexOf(texto) !== -1;
    });

    if (!items.length) {
      el.historial.innerHTML = '<p class="text-[11px] font-bold text-on-surface-variant leading-snug px-1">' +
        (texto ? 'Sin resultados.' : 'Aquí aparecerá lo que preguntes.') + '</p>';
      return;
    }

    el.historial.innerHTML = items.map(function (s) {
      var activa = s.id === estado.sesionActual;
      return '<button type="button" data-sesion="' + s.id + '" class="w-full text-left px-2 py-1.5 rounded-lg text-[11px] font-bold transition-colors ' +
        (activa ? 'bg-surface-container-high text-on-surface' : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface') + '">' +
        escapar(s.titulo) + '</button>';
    }).join('');
  }

  function pintarCanal() {
    var cfg = CANALES[estado.canal];
    el.titulo.textContent = cfg.titulo;
    el.titulo.nextElementSibling.textContent = cfg.subtitulo;
    el.canales.querySelectorAll('.canal-pill').forEach(function (btn) {
      btn.setAttribute('aria-pressed', btn.dataset.canal === estado.canal ? 'true' : 'false');
    });
    pintarSugerencias();
    guardar();
  }

  function aplicarColapso(colapsado) {
    estado.colapsado = colapsado;
    el.sidebar.classList.toggle('-translate-x-full', colapsado);
    el.content.classList.toggle('pl-64', !colapsado);
    el.content.classList.toggle('pl-0', colapsado);
    [el.header, $('fuegoConsole')].forEach(function (nodo) {
      if (!nodo) return;
      nodo.classList.toggle('left-64', !colapsado);
      nodo.classList.toggle('left-0', colapsado);
    });
    el.headerLead.classList.toggle('pl-12', colapsado);
    el.headerLead.classList.toggle('pl-3', !colapsado);
    el.openSidebar.classList.toggle('hidden', !colapsado);
    el.openSidebar.classList.toggle('flex', colapsado);
  }

  function nuevaConsulta() {
    estado.sesionActual = null;
    estado.mensajes = [];
    guardar();
    pintarMensajes();
    pintarHistorial(el.buscar.value);
    el.input.focus();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function registrarSesion(primeraPregunta) {
    if (!estado.sesionActual) {
      estado.sesionActual = crearId();
      estado.sesiones.unshift({
        id: estado.sesionActual,
        titulo: primeraPregunta.slice(0, 38) + (primeraPregunta.length > 38 ? '…' : ''),
        fecha: new Date().toISOString(),
        mensajes: []
      });
      estado.sesiones = estado.sesiones.slice(0, 12);
      guardar();
      pintarHistorial(el.buscar.value);
    }
  }

  function historialConversacion() {
    return estado.mensajes.slice(-10).map(function (m) {
      return { rol: m.rol === 'user' ? 'user' : 'assistant', contenido: m.texto };
    });
  }

  function agregarMensaje(mensaje) {
    estado.mensajes.push(mensaje);
    var actual = estado.sesiones.filter(function (s) { return s.id === estado.sesionActual; })[0];
    if (actual) {
      actual.mensajes = estado.mensajes.slice(-40);
      actual.fecha = new Date().toISOString();
    }
    guardar();
    pintarMensajes();
    scrollAbajo();
  }

  async function enviar() {
    if (estado.cargando) return;

    var pregunta = el.input.value.trim();
    if (!pregunta) {
      el.input.focus();
      return;
    }

    estado.cargando = true;
    el.enviar.disabled = true;
    el.input.value = '';
    actualizarContador();
    registrarSesion(pregunta);
    agregarMensaje({ rol: 'user', texto: pregunta });
    pintarIndicador(true);

    var historial = historialConversacion();
    historial.pop();

    try {
      var respuesta = await fetch(FUEGO_CONFIG.workerUrl + '/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: pregunta,
          history: historial,
          channel: estado.canal,
          pagina: 'fuego-d5.html'
        })
      });

      if (!respuesta.ok) throw new Error('HTTP ' + respuesta.status);

      var datos = await respuesta.json();
      pintarIndicador(false);
      agregarMensaje({
        rol: 'ia',
        autor: 'Fuego D5 IA',
        texto: datos.answer || 'No encontré esa información en la web de D5. Prueba con otras palabras.',
        crisis: !!datos.crisis,
        fuentes: Array.isArray(datos.sources) ? datos.sources.slice(0, 4) : [],
        aviso: datos.notFound ? 'Sin coincidencias en el contenido indexado.' : null
      });
    } catch (error) {
      pintarIndicador(false);
      var local = buscarRespuestaLocal(pregunta);
      var respuesta = local || respuestaDeEscape();
      agregarMensaje({
        rol: 'ia',
        autor: 'Fuego D5 IA',
        texto: respuesta.texto,
        crisis: !!respuesta.crisis,
        fuentes: respuesta.fuentes || [],
        aviso: 'Respuesta con el mapa de la web. El buscador del sitio todavía no está conectado.'
      });
    } finally {
      estado.cargando = false;
      el.enviar.disabled = false;
      el.input.focus();
    }
  }

  function actualizarContador() {
    el.contador.textContent = String(el.input.value.length);
  }

  if (el.toggleSidebar) {
    el.toggleSidebar.addEventListener('click', function () { aplicarColapso(true); });
  }
  if (el.openSidebar) {
    el.openSidebar.addEventListener('click', function () { aplicarColapso(false); });
  }
  if (el.nueva) {
    el.nueva.addEventListener('click', nuevaConsulta);
  }
  if (el.limpiar) {
    el.limpiar.addEventListener('click', nuevaConsulta);
  }
  if (el.buscar) {
    el.buscar.addEventListener('input', function () { pintarHistorial(el.buscar.value); });
  }
  if (el.enviar) {
    el.enviar.addEventListener('click', enviar);
  }
  if (el.input) {
    el.input.addEventListener('input', actualizarContador);
    el.input.addEventListener('keydown', function (evento) {
      if (evento.key === 'Enter' && !evento.shiftKey) {
        evento.preventDefault();
        enviar();
      }
    });
  }
  if (el.canales) {
    el.canales.addEventListener('click', function (evento) {
      var pill = evento.target.closest('.canal-pill');
      if (!pill) return;
      estado.canal = pill.dataset.canal;
      pintarCanal();
    });
  }
  if (el.sugerencias) {
    el.sugerencias.addEventListener('click', function (evento) {
      var chip = evento.target.closest('[data-pregunta]');
      if (!chip) return;
      el.input.value = chip.dataset.pregunta;
      actualizarContador();
      enviar();
    });
  }
  if (el.historial) {
    el.historial.addEventListener('click', function (evento) {
      var boton = evento.target.closest('[data-sesion]');
      if (!boton) return;
      var sesion = estado.sesiones.filter(function (s) { return s.id === boton.dataset.sesion; })[0];
      if (!sesion) return;
      estado.sesionActual = sesion.id;
      estado.mensajes = Array.isArray(sesion.mensajes) ? sesion.mensajes.slice() : [];
      guardar();
      pintarMensajes();
      pintarHistorial(el.buscar.value);
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
      el.input.focus();
    });
  }

  recuperar();
  if (estado.mensajes.length) {
    if (!estado.mensajes.some(function (m) { return m.rol === 'ia'; })) {
      estado.mensajes.unshift({
        rol: 'ia', autor: 'Fuego D5 IA', texto: MENSAJE_BIENVENIDA, crisis: false, fuentes: []
      });
    }
    pintarMensajes();
  }
  pintarCanal();
  pintarHistorial('');
  actualizarContador();

  if (window.innerWidth < 1024) aplicarColapso(true);
})();