/* Navegación desktop activa dinámica
 * Determina la página actual y marca el enlace del nav con un "cuadrito"
 * (borde azul + fondo suave) en lugar de subrayado. Sin tocar el header. */
(function () {
    var nav = document.querySelector('header nav');
    if (!nav) return;
    var page = (window.location.pathname.split('/').pop() || 'index.html');
    var links = Array.prototype.slice.call(nav.querySelectorAll(':scope > a[href]'));
    if (!links.length) return;
    // Limpiar estados previos (subrayado antiguo o cuadrito)
    links.forEach(function (a) {
        a.classList.remove('text-primary', 'border-primary', 'border-b-2', 'border-b', 'border-transparent', 'bg-blue-50', 'px-2.5', 'py-0.5', 'py-2');
        a.classList.add('px-2.5', 'py-0.5', 'border-2', 'border-transparent');
    });
    var target = links.filter(function (a) {
        return a.getAttribute('href') === page;
    })[0];
    if (target) {
        target.classList.remove('border-transparent');
        target.classList.add('text-primary', 'border-primary', 'bg-blue-50');
    }
})();
