// kit/i18n.js - the library's words. The code is written in ENGLISH and the English text is the key; each other
// language is a dictionary from that text to its own. A piece speaks the language of the nearest `lang` (a container's
// attribute, else the page's <html lang>), English when there is none or the language has no dictionary.
//   t(lang, 'Page {0} of {1}', 2, 9)   → «Página 2 de 9» in Spanish
//   'One item | {0} items'             → the first form when the first argument is 1
// An app with its own i18n (Storio) changes nothing: it already sets <html lang>, and a container (the public store,
// in the shop's language) can carry its own `lang`. A Custom also takes `lang` through its inputs.

export const LANGS = { es: {} };
const ES = LANGS.es;

/** Add words to a language (a part's own module can extend the dictionary the same way). */
export const words = (lang, table) => { LANGS[lang] = Object.assign(LANGS[lang] || {}, table); };

/** The language a node speaks: its nearest `lang`, else the page's; 'en' when unknown. */
export const langOf = (node) => {
  const from = (node && node.closest && node.closest('[lang]')) || document.documentElement;
  const code = String(from.getAttribute('lang') || 'en').toLowerCase().slice(0, 2);
  return LANGS[code] ? code : 'en';
};

/** The text in that language (the English key when it has no entry), with {0}, {1}… filled and «one | many» chosen. */
export const t = (lang, key, ...args) => {
  let text = (lang !== 'en' && LANGS[lang] && LANGS[lang][key]) || key;
  if (text.includes(' | ')) { const [one, many] = text.split(' | '); text = Number(args[0]) === 1 ? one : many; }
  return args.length ? text.replace(/\{(\d+)\}/g, (m, k) => (args[+k] ?? m)) : text;
};

/* What a part or a Custom MARKS is said in the language of its nearest `lang`. The marks are keyed by the English text:
   data-tr the element's text · data-trl its aria-label · data-trn its tooltip (data-name) · data-trp its placeholder ·
   data-trt its title · data-tra the values for {0}… split by «|». Only a text the piece wrote itself is replaced (it
   still reads as the English key, or as what was said last): a value the app passed is left alone. kit/core.js runs it
   on the whole page and again on every change; a Custom that renders on its own calls it on its root. */
const MARKS = [['tr', null], ['trl', 'aria-label'], ['trn', 'data-name'], ['trp', 'placeholder'], ['trt', 'title']];
const MARKED = '[data-tr],[data-trl],[data-trn],[data-trp],[data-trt]';
export const localize = (el) => {
  const lang = langOf(el), args = el.dataset.tra ? el.dataset.tra.split('|') : [];
  const said = el.__said || (el.__said = {});
  for (const [key, attr] of MARKS) {
    const k = el.dataset[key]; if (!k) continue;
    const now = attr ? el.getAttribute(attr) : el.textContent;
    if (now !== t('en', k, ...args) && now !== said[key] && now !== null && now !== '') continue;   // the app's own text
    const next = t(lang, k, ...args); said[key] = next;
    if (now === next) continue;
    if (attr) el.setAttribute(attr, next); else el.textContent = next;
  }
};
export const localizeTree = (root) => { if (!root || root.nodeType !== 1) return; if (root.matches(MARKED)) localize(root); root.querySelectorAll(MARKED).forEach(localize); };

// ── Spanish ──
// Kept in one table so a translator reads it top to bottom; grouped by the piece that says it.
Object.assign(ES, {
  // shared
  'Close': 'Cerrar', 'Cancel': 'Cancelar', 'Save': 'Guardar', 'Save changes': 'Guardar cambios', 'Saving…': 'Guardando…', 'Saved': 'Guardado',
  'Search': 'Buscar', 'Search…': 'Buscar…', 'Clear search': 'Limpiar búsqueda', 'Copy': 'Copiar', 'Copied': 'Copiado', 'Select it and copy': 'Selecciónalo y copia', 'Select it': 'Selecciónalo',
  'Loading': 'Cargando', 'Previous': 'Anterior', 'Next': 'Siguiente', 'More': 'Más', 'Back': 'Volver', 'Done': 'Listo', 'Send': 'Enviar', 'Stop': 'Detener',
  'Today': 'Hoy', 'Tomorrow': 'Mañana', 'Yesterday': 'Ayer', 'Menu': 'Menú', 'Show or hide the menu': 'Mostrar u ocultar el menú',
});

// parts (.muten): their default words and fixed labels
Object.assign(ES, {
  'Search or jump to…': 'Busca o salta a…', 'Nothing matches.': 'Nada coincide.', 'Breadcrumb': 'Migas', 'More pages': 'Más páginas', 'Book': 'Reservar',
  'Menu for this area': 'Menú de esta zona', 'Messages': 'Mensajes', 'Less': 'Menos', 'Contents': 'Contenido', 'Pages': 'Páginas', 'Photo': 'Foto',
  'Progress': 'Progreso', 'results': 'resultados', 'Date': 'Fecha', 'Time': 'Hora', 'person': 'persona', 'people': 'personas', 'Invite': 'Invitar',
  'Recommended': 'Recomendado', 'row': 'fila', 'rows': 'filas', 'Upload a file': 'Sube un archivo', 'Tap, drag or paste here': 'Toca, arrastra o pega aquí',
  'New appointment': 'Nueva cita', 'Files': 'Archivos', 'Order': 'Orden', 'Continue': 'Continuar', 'Password': 'Contraseña', 'Colors': 'Colores',
  'Tools': 'Herramientas', 'More options': 'Más opciones', 'Connect a folder': 'Conectar carpeta', 'Price': 'Precio', 'Upload the photo': 'Sube la foto',
  'Properties': 'Propiedades', 'Main': 'Principal', 'Permission': 'Permiso', 'Conversation': 'Conversación', 'Phone': 'Teléfono', 'Sections': 'Secciones',
  'Actions': 'Acciones', 'Share': 'Compartir', 'Footer': 'Pie de página', 'Tags': 'Etiquetas', 'List': 'Lista', 'Status': 'Estado',
  'Sending': 'Enviando', 'Sent': 'Enviado', 'Delivered': 'Entregado', 'Read': 'Leído', 'Online': 'En línea', 'Resize': 'Cambiar el tamaño',
  'Move {0}': 'Mover {0}', 'Back to 100 %': 'Volver a 100 %', 'Zoom {0} %, back to 100': 'Zoom {0} %, volver a 100',
  "%owner's card": 'Cartilla de %owner', '%n of %total · %left more for %reward': '%n de %total · faltan %left para %reward', 'Complete! Earned %reward.': '¡Completa! Ganó %reward.',
  '%n of %total stamps': '%n de %total sellos', 'Redeem reward': 'Canjear premio', 'Stamp a visit': 'Sellar visita',
});

// dates (calendar, date pickers)
Object.assign(ES, {
  'You picked {0}, {1}': 'Elegiste el {0} {1}', 'From {0} to {1} · {2} days': 'Del {0} al {1} · {2} días', 'From {0}: pick the last day': 'Desde el {0}: elige el último día',
  'Last 7 days': 'Últimos 7 días', 'This month': 'Este mes', 'Last month': 'Mes pasado',
});

// small Customs (code, file input, sortable, number field, kit widgets)
Object.assign(ES, {
  'Remove {0}': 'Quitar {0}', '{0} is not a type of file that can be uploaded here.': '{0} no es de un tipo que se pueda subir aquí.', '{0} is over {1} MB.': '{0} pesa más de {1} MB.',
  'Drag to reorder': 'Arrastra para ordenar', '{0}: position {1} of {2}': '{0}: posición {1} de {2}', 'Number': 'Número', 'Assistant': 'Asistente',
});

// values: money, phone, verification code, sliders
Object.assign(ES, {
  'maximum': 'máximo', 'minimum': 'mínimo', 'Currency': 'Moneda', 'Country': 'País', '{0} (it has no minor unit)': '{0} (no tiene unidad menor)', 'cents of {0}': 'centavos de {0}',
  'Saved as: {0} {1}': 'Se guarda: {0} {1}', 'Type a price': 'Escribe un precio', 'Search currency': 'Buscar moneda', 'Search country': 'Buscar país',
  'Saved as +{0}': 'Se guarda como +{0}', '{0} digits short for a number from {1}': 'Faltan {0} dígitos para un número de {1}', '{0} digits, without the {1}': '{0} dígitos, sin el {1}',
  '{0}-digit code': 'Código de {0} dígitos', 'Checking…': 'Verificando…', 'Resend in 0:{0}': 'Reenviar en 0:{0}', 'Resend code': 'Reenviar código',
  'We sent you a new code': 'Te enviamos un código nuevo', 'Done, it is verified': 'Listo, quedó verificado', 'That is not the code': 'Ese código no es',
});

// menus and collections: combobox, row menu, store QR, tags, pagination, virtual list, carousel
Object.assign(ES, {
  'Use “{0}”': 'Usar «{0}»', 'Type to search': 'Escribe para buscar', 'QR code of {0}': 'Código QR de {0}', 'Copy link': 'Copiar enlace',
  'You reached the limit of {0}': 'Llegaste al tope de {0}', 'Add and press Enter': 'Agrega y presiona Enter',
  'Previous page': 'Página anterior', 'Next page': 'Página siguiente', 'Page {0}': 'Página {0}', 'Page {0} of {1}': 'Página {0} de {1}', '{0}–{1} of {2} {3}': '{0}–{1} de {2} {3}',
  'Go to {0}': 'Ir al {0}', '{0}–{1} of {2} · {3} rows in the DOM': '{0}–{1} de {2} · {3} filas en el DOM',
  'Pause': 'Pausar', 'Play': 'Reproducir', 'Slides': 'Diapositivas', 'Go to {0} of {1}': 'Ir a {0} de {1}', 'Thumbnails': 'Miniaturas', 'Photo {0}': 'Foto {0}',
});

// table
Object.assign(ES, {
  'Next 7 days': 'Próximos 7 días', 'Later': 'Más adelante', 'Clear selection': 'Quitar selección', 'Filters': 'Filtros', 'Select all': 'Seleccionar todas', 'Clear': 'Limpiar',
  'No limit': 'Sin tope', 'From': 'Desde', 'To': 'Hasta', 'Remove filter': 'Quitar filtro', 'Search in {0}': 'Buscar en {0}', 'Any date': 'Cualquier fecha', 'See {0} {1}': 'Ver {0} {1}',
  'They apply as you pick.': 'Se aplican mientras eliges.', 'Remove': 'Quitar', 'Select {0}': 'Seleccionar {0}', 'Clear filters': 'Limpiar filtros',
  'Nothing matches the filters': 'Nada coincide con los filtros', 'Remove one or clear them all.': 'Quita alguno o límpialos todos.',
});

// date and time fields, image upload
Object.assign(ES, {
  'Pick the date': 'Elige la fecha', 'Drag each wheel, tap a value or use the arrows.': 'Arrastra cada rueda, toca un valor o usa las flechas.', 'That date has passed': 'Esa fecha ya pasó',
  'Day': 'Día', 'Month': 'Mes', 'Year': 'Año', 'morning': 'mañana', 'afternoon': 'tarde', 'Pick the time': 'Elige la hora', 'Hours: {0} to {1}. Drag or tap.': 'Horario: {0} a {1}. Arrastra o toca.',
  'Hour': 'Hora', 'Minutes': 'Minutos', 'JPG, PNG or WebP · up to {0} MB': 'JPG, PNG o WebP · hasta {0} MB', 'Use a sample': 'Usar una de ejemplo', 'Uploading… {0} %': 'Subiendo… {0} %',
  '“{0}” is not an image. Use JPG, PNG or WebP.': '«{0}» no es una imagen. Usa JPG, PNG o WebP.', 'It weighs {0} MB; the limit is {1} MB.': 'Pesa {0} MB; el tope es {1} MB.',
  'Preparing the image…': 'Preparando la imagen…', 'We could not read that image. Try another.': 'No pudimos leer esa imagen. Prueba con otra.', 'Ready · {0} × {1} px, {2} KB': 'Lista · {0} × {1} px, {2} KB',
  'It could not be uploaded. Try again.': 'No se pudo subir. Inténtalo otra vez.', 'It could not be uploaded. Check your connection.': 'No se pudo subir. Revisa tu conexión.',
});

// structure: phone shell, share, app shell, booking, new-appointment wizard
Object.assign(ES, {
  'Link copied. Paste it in your bio or in an Instagram story.': 'Enlace copiado. Pégalo en tu bio o en una historia de Instagram.', 'Link copied. Paste it in your TikTok bio.': 'Enlace copiado. Pégalo en tu bio de TikTok.',
  '{0} at {1}': '{0} en {1}', 'Book at {0}': 'Reserva en {0}', 'Share product': 'Compartir producto', 'Share link': 'Compartir enlace', 'Select the link and copy it.': 'Selecciona el enlace y cópialo.',
  'Share on': 'Compartir en', 'QR code': 'Código QR', 'Share in another app': 'Compartir en otra app', 'Link copied.': 'Enlace copiado.',
  'Nothing here yet.': 'Todavía no hay nada aquí.', 'Detail': 'Detalle', 'History': 'Historial', 'Nothing with “{0}”': 'Nada con «{0}»', 'move': 'moverte', 'open': 'abrir', 'close': 'cerrar',
  'Previous week': 'Semana anterior', 'Next week': 'Semana siguiente', 'Pick a day and a time': 'Elige un día y una hora', 'pick a time': 'elige una hora', 'today': 'hoy', 'closed': 'cerrado',
  '{0} times': '{0} horarios', 'no times': 'sin horarios', 'No times left this day.': 'No quedan horarios este día.', 'See {0} {1}': 'Ver {0} {1}', 'Morning': 'Mañana', 'Afternoon': 'Tarde',
  'Client': 'Cliente', 'Service': 'Servicio', 'Day and time': 'Día y hora', 'Confirm': 'Confirmar', 'Nobody with “{0}”': 'Nadie con «{0}»', 'Search or pick': 'Busca o elige', 'Name or phone': 'Nombre o teléfono',
  'Create appointment': 'Crear cita',
});

// order board
Object.assign(ES, {
  'Review receipt': 'Revisar comprobante', 'See Stripe receipt': 'Ver recibo de Stripe', 'See delivery': 'Ver entrega', 'See map': 'Ver mapa', 'Client note': 'Nota del cliente',
  "{0}'s note: {1}": 'Nota de {0}: {1}', "{0}'s note": 'Nota de {0}', 'Pending': 'Pendientes', 'Contact {0} on {1}, as they asked': 'Contactar a {0} por {1}, como lo pidió', 'Prefers {0}': 'Prefiere {0}',
  'a call': 'una llamada', 'Drop an order here': 'Suelta aquí un pedido', 'No message from the client.': 'Sin mensaje del cliente.', 'Also to solve': 'También por resolver',
  'Copy note': 'Copiar nota', 'Payment receipt': 'Recibo de pago', '{0} · order {1}': '{0} · pedido {1}', 'Paid': 'Pagado', 'Method': 'Medio', 'Processed by': 'Procesado por',
  'Oct 8, 2026': '8 oct 2026', 'Payment ID': 'ID del pago', 'Fee': 'Comisión', 'You get': 'Recibes', 'Open in Stripe': 'Abrir en Stripe', 'Arrives in': 'Llega en', 'Open in Maps': 'Abrir en Maps',
  'Canceled': 'Cancelado', 'Refunded {0}': 'Devuelto {0}', 'Prepare': 'Preparar', 'Payment proof': 'Comprobante de pago', 'Screenshot of the transfer': 'Captura de la transferencia',
  'Transfer successful': 'Transferencia exitosa', 'Reference': 'Referencia', 'Order amount': 'Monto del pedido', 'Matches': 'Coincide', 'Reject': 'Rechazar', 'Approve payment': 'Aprobar pago',
  'Complaint': 'Queja', 'Your answer': 'Tu respuesta', 'It reaches them on WhatsApp.': 'Le llega por WhatsApp.', 'Send answer': 'Enviar respuesta', 'Rejected': 'Rechazado',
  'Complaint answered': 'Queja respondida', 'now': 'ahora', 'Refund': 'Reembolsar', 'Answer {0}': 'Responder a {0}', 'Complaint about order {0}': 'Queja del pedido {0}',
});

// kit core: stepper, messaging, chat, chart, dirty bar, plans, card, team, stamp card, bell, waitlist, password
Object.assign(ES, {
  'Step {0} of {1}: {2}': 'Paso {0} de {1}: {2}', 'Suggestions': 'Sugerencias', 'Play {0} s of audio': 'Reproducir audio de {0} s', 'Audio': 'Audio', 'Typing': 'Escribiendo', 'Options': 'Opciones',
  'Write a message': 'Escribe un mensaje', 'Write a message…': 'Escribe un mensaje…', 'Templates': 'Plantillas', 'Emoji': 'Emoji', 'Enter sends · Shift+Enter adds a line break': 'Enter envía · Shift+Enter hace un salto de línea',
  'Nothing archived': 'Nada archivado', 'Nothing here': 'Nada por aquí', 'Try another name.': 'Prueba con otro nombre.', 'What you archive stays here.': 'Lo que archives queda aquí.',
  'When they write to you, it shows up here.': 'Cuando te escriban, aparece aquí.', '{0} goes to {1} on {2}.': 'Se le envía {0} a {1} por {2}.', 'Quick actions': 'Acciones rápidas',
  'Pick a conversation': 'Elige una conversación', 'Back to the inbox': 'Volver a la bandeja', 'See client': 'Ver cliente', 'Unarchive': 'Sacar del archivo', 'Archive': 'Archivar', 'Delete': 'Eliminar',
  'Now': 'Ahora', 'Delete the conversation?': '¿Eliminar la conversación?', 'The chat with {0} is deleted from your inbox. Their appointments and orders stay the same.': 'Se borra el chat con {0} de tu bandeja. Sus citas y pedidos siguen igual.',
  'Connect a channel': 'Conectar un canal', 'Connect': 'Conectar', 'Picked: {0}': 'Elegida: {0}', 'none': 'ninguna', ' (typed by you)': ' (escrita por ti)', 'Hi {0}, I am so sorry. We are sending you a new one today at no cost.': 'Hola {0}, lo siento mucho. Te enviamos una nueva hoy sin costo.', 'The messages of every channel arrive in this same inbox.': 'Los mensajes de cada canal llegan a esta misma bandeja.', 'Conversation archived': 'Conversación archivada',
  'Back in the inbox': 'De vuelta en la bandeja', 'You': 'Tú', 'Search conversation': 'Buscar conversación', 'Filter': 'Filtrar', 'Conversation solved': 'Conversación resuelta', 'Conversation deleted': 'Conversación eliminada',
  'Connected': 'Conectado', 'Assistant · answers at once': 'Asistente · responde al instante', 'Thinking': 'Pensando', 'Stopped': 'Detenido', 'Copy answer': 'Copiar respuesta', 'It helped': 'Me sirvió', 'It did not help': 'No me sirvió',
  'Period': 'Periodo', 'Remove range': 'Quitar tramo', 'Add range': 'Agregar tramo', 'Copy to all': 'Copiar a todos', 'Unsaved changes': 'Cambios sin guardar', 'You have unsaved changes': 'Tienes cambios sin guardar', 'Discard': 'Descartar',
  'Billing': 'Facturación', 'Monthly': 'Mensual', 'Yearly': 'Anual', 'Your plan': 'Tu plan', '/ month': '/ mes', '/ year': '/ año', 'Your current plan': 'Tu plan actual', 'Move up to {0}': 'Pasar a {0}', 'Move down to {0}': 'Bajar a {0}',
  'Card number': 'Número de la tarjeta', 'Expires': 'Vence', 'Code': 'Código', 'Secure payment with Stripe. We do not keep the number.': 'Pago seguro con Stripe. No guardamos el número.', 'Save card': 'Guardar tarjeta',
  'Check the card number.': 'Revisa el número de la tarjeta.', 'The expiry date is not valid.': 'La fecha de vencimiento no es válida.', 'The 3 or 4 digit code is missing.': 'Falta el código de 3 o 4 dígitos.',
  '{0} card ending in {1} saved.': 'Tarjeta {0} terminada en {1} guardada.', 'Invitation sent': 'Invitación enviada', 'Role of {0}': 'Rol de {0}', 'Email': 'Correo', 'name@email.com': 'nombre@correo.com', 'Role': 'Rol',
  'Send invitation': 'Enviar invitación', 'Notices': 'Avisos', 'The system bell: tap to see the notices.': 'La campana del sistema: toca para ver los avisos.', 'Notices, {0} unread': 'Avisos, {0} sin leer',
  'Mark all as read': 'Marcar todo como leído', 'Unread': 'Sin leer', 'All caught up': 'Todo al día', '{0} waiting': '{0} esperando', 'Offered {0} · {1}': 'Ofrecido {0} · {1}', '{0} · waiting since {1}': '{0} · espera desde {1}',
  'Offer a time': 'Ofrecer horario', 'today 16:30': 'hoy 16:30', '8 characters or more': '8 caracteres o más', 'A number': 'Un número', 'A capital letter': 'Una mayúscula', 'A symbol': 'Un símbolo',
  'Very weak': 'Muy débil', 'Weak': 'Débil', 'Fair': 'Regular', 'Good': 'Buena', 'Strong': 'Fuerte', 'Strength': 'Fuerza', 'Type a password': 'Escribe una contraseña', 'Show password': 'Mostrar contraseña', 'Hide password': 'Ocultar contraseña', 'Show': 'Mostrar',
});

// folder picker, field behavior
Object.assign(ES, { 'This browser cannot pick folders: use Chrome or Edge.': 'Este navegador no deja elegir carpetas: usa Chrome o Edge.', 'Check the email.': 'Revisa el correo.' });
