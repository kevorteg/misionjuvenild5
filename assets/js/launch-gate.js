(function () {
    const launchDate = new Date('2026-09-17T00:00:00-05:00').getTime();
    const previewAccess = sessionStorage.getItem('mjd5-site-preview-access') === 'granted';
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';

    if (Date.now() < launchDate && !previewAccess && currentPage !== 'lanzamiento.html') {
        window.location.replace('lanzamiento.html');
    }
})();
