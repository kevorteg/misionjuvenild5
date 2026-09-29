/* Navegación desktop activa dinámica
 * Determina la página actual y marca el enlace del nav (sin tocar el header).
 * También limpia el estado "Inicio" activo por defecto que viene estático. */
(function () {
    var nav = document.querySelector('header nav');
    if (!nav) return;
    var page = (window.location.pathname.split('/').pop() || 'index.html');
    var links = Array.prototype.slice.call(nav.querySelectorAll(':scope > a[href]'));
    if (!links.length) return;
    links.forEach(function (a) {
        a.classList.remove('text-primary', 'border-primary', 'border-b-2', 'border-b');
    });
    var target = links.filter(function (a) {
        return a.getAttribute('href') === page;
    })[0];
    if (target) target.classList.add('text-primary', 'border-b-2', 'border-primary');
})();