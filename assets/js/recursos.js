/**
 * RECURSOS JS - Misión Juvenil D5
 * Lógica Consolidada: Héroe + Búsqueda + 3 Columnas + Fix Descargas.
 */

document.addEventListener('DOMContentLoaded', () => {
    initRecursos();
});

let currentCategory = 'Todos';

function initRecursos() {
    renderResources();
    setupCategories();
    setupSearch();
    updateCartCount();
}

/**
 * Render consolidated hero with intro text and featured spotlight
 */
// Obsolete Hero logic removed for premium background approach

function renderResources(searchTerm = '') {
    const container = document.getElementById('resources-grid');
    if (!container) return;

    const filteredData = resourcesData.filter(item => {
        const matchesCategory = currentCategory === 'Todos' || item.category === currentCategory;
        const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.description.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    gsap.to(container, {
        opacity: 0,
        y: 10,
        duration: 0.3,
        onComplete: () => {
            container.innerHTML = '';
            if (filteredData.length === 0) {
                container.innerHTML = `
                    <div class="col-span-full py-20 text-center">
                        <span class="material-symbols-outlined !text-6xl text-brand/20 mb-4">search_off</span>
                        <p class="text-slate-500 font-sans italic">Sin resultados para esta búsqueda...</p>
                    </div>
                `;
            } else {
                filteredData.forEach((res) => {
                    const cardHtml = createResourceCard(res);
                    container.insertAdjacentHTML('beforeend', cardHtml);
                });
            }
            gsap.to(container, { opacity: 1, y: 0, duration: 0.5, delay: 0.1 });
            gsap.set(".resource-card", { opacity: 0, y: 30 });
            gsap.to(".resource-card", {
                opacity: 1,
                y: 0,
                duration: 0.8,
                stagger: 0.05,
                ease: "power2.out",
                overwrite: true
            });
        }
    });
}

function createResourceCard(resource) {
    return `
        <article class="resource-card opacity-0 scale-95" data-category="${resource.category}">
            <div class="resource-thumb-container">
                <img src="${resource.thumbnail}" alt="${resource.title}" loading="lazy">
                ${resource.isNew ? '<span class="absolute top-4 left-4 bg-brand text-black font-black text-[9px] px-3 py-1 rounded-full uppercase tracking-widest z-20">Nuevo</span>' : ''}
            </div>
            
            <div class="resource-content">
                <div>
                    <div class="resource-date-badge">${resource.date || 'MJ 2026'}</div>
                    <h3 class="resource-title">${resource.title}</h3>
                    <p class="resource-desc">${resource.description}</p>
                </div>
                
                <div class="resource-footer">
                    <button onclick="handleDownload('${resource.url}', '${resource.title}')" 
                            class="download-link-btn group/btn">
                        <span>Bajar ${resource.type || 'Recurso'}</span>
                        <span class="material-symbols-outlined !text-lg">east</span>
                    </button>
                    <span class="text-[10px] font-bold text-white/20 uppercase">${resource.category}</span>
                </div>
            </div>
        </article>
    `;
}

function setupFilters() {
    const filterButtons = document.querySelectorAll('.resource-category-btn');
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentCategory = btn.getAttribute('data-category');
            renderResources(document.getElementById('resource-search').value);
        });
    });
}

function setupSearch() {
    const searchInput = document.getElementById('resource-search');
    if (searchInput) searchInput.addEventListener('input', (e) => renderResources(e.target.value));
}

/**
 * ROBUST DOWNLOAD FUNCTION - site-wide standard
 */
async function handleDownload(url, filename) {
    if (!url || url === '#' || url === 'undefined') {
        console.warn('Invalid download URL');
        return;
    }

    // Determine extension from original URL
    const extension = url.split('.').pop().split(/[?#]/)[0] || 'pdf';
    let cleanName = filename.replace(/[/\\?%*:|"<>]/g, '-').trim();
    if (!cleanName.toLowerCase().endsWith('.' + extension.toLowerCase())) {
        cleanName += '.' + extension;
    }

    console.log("Preparing robust fetch download for:", url);

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Network response was not ok');
        const blob = await response.blob();

        const blobUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = blobUrl;
        a.download = cleanName;

        document.body.appendChild(a);
        a.click();

        // Cleanup
        setTimeout(() => {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(blobUrl);
        }, 300);

        console.log("Download forced successfully via blob:", cleanName);
    } catch (error) {
        console.error("Fetch download failed, falling back to basic download:", error);

        // Fallback to basic anchor download if fetch fails
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = cleanName;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => document.body.removeChild(a), 100);
    }
}
