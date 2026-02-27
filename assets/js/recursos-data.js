/**
 * RECURSOS DATA - Misión Juvenil D5
 * Contenido extraído de IPUC Misiones Nacionales.
 * Inspiración visual: MasImpulsoGlobal + Dark Premium.
 */

const resourcesData = [
    // --- DESTACADO (Primer elemento suele ser el primero en renderizarse en el Hero) ---
    {
        id: 'dev-ansiedad',
        title: 'Cátedra: La Ansiedad',
        description: 'Herramientas bíblicas y prácticas para manejar la ansiedad en la juventud. Un recurso vital para los tiempos que vivimos.',
        category: 'Devocionales',
        type: 'PDF',
        url: 'media/recursos/devocionales/la-ansiedad.pdf',
        icon: 'psychology',
        thumbnail: 'assets/img/recursos/thumb_devocionales_neutral.png',
        badgeText: 'DESCARGA GRATIS',
        date: '26/02/2026',
        isNew: true,
        isFeatured: true // Nuevo flag para el Hero
    },

    // --- DEVOCIONALES ---
    {
        id: 'dev-depresion',
        title: 'Cátedra: La Depresión',
        description: 'Cómo enfrentar la depresión desde una perspectiva de fe y esperanza.',
        category: 'Devocionales',
        type: 'PDF',
        url: 'media/recursos/devocionales/la-depresion.pdf',
        icon: 'mood_bad',
        thumbnail: 'assets/img/recursos/thumb_devocionales_neutral.png',
        badgeText: 'ARTÍCULO',
        date: '21/02/2026',
        isNew: false
    },
    {
        id: 'dev-estres',
        title: 'Cátedra: El Estrés',
        description: 'Principios para una vida equilibrada frente a las presiones actuales.',
        category: 'Devocionales',
        type: 'PDF',
        url: 'media/recursos/devocionales/el-estres.pdf',
        icon: 'bolt',
        thumbnail: 'assets/img/recursos/thumb_devocionales_neutral.png',
        badgeText: 'DESCARGA GRATIS',
        date: '20/02/2026',
        isNew: false
    },
    {
        id: 'dev-refam-doctrinal',
        title: 'REFAM Juvenil Doctrinal',
        description: 'Estudios bíblicos doctrinales enfocados en la población juvenil.',
        category: 'Devocionales',
        type: 'PDF',
        url: 'media/recursos/devocionales/refam-juvenil-doctrinal.pdf',
        icon: 'menu_book',
        thumbnail: 'assets/img/recursos/thumb_devocionales_neutral.png',
        badgeText: 'ESTUDIO BÍBLICO',
        date: '15/02/2026',
        isNew: true
    },

    // --- ACADÉMICO ---
    {
        id: 'aca-efees-superior',
        title: 'EFEES Educación Superior',
        description: 'Cartilla informativa para estudiantes de universidades e institutos.',
        category: 'Académico',
        type: 'PDF',
        url: 'media/recursos/academico/efees-superior.pdf',
        icon: 'school',
        thumbnail: 'assets/img/recursos/thumb_academico_neutral.png',
        badgeText: 'DESCARGA GRATIS',
        date: '24/02/2026',
        isNew: true
    },
    {
        id: 'aca-pensum-colegios',
        title: 'Pénsum Colegios',
        description: 'Contenido de estudio estructurado para el entorno escolar.',
        category: 'Académico',
        type: 'PDF',
        url: 'media/recursos/academico/pensum-colegios.pdf',
        icon: 'assignment',
        thumbnail: 'assets/img/recursos/thumb_academico_neutral.png',
        badgeText: 'RECURSO EDUCATIVO',
        date: '18/02/2026',
        isNew: false
    },
    {
        id: 'aca-fe-universitaria',
        title: 'Fe en el Campus',
        description: 'Cátedra sobre cómo vivir tu fe en el entorno universitario.',
        category: 'Académico',
        type: 'PDF',
        url: 'media/recursos/academico/fe-campus.pdf',
        icon: 'location_city',
        thumbnail: 'assets/img/recursos/thumb_academico_neutral.png',
        badgeText: 'GUÍA JUVENIL',
        date: '10/02/2026',
        isNew: false
    },

    // --- LIDERAZGO ---
    {
        id: 'lid-presentacion-mj',
        title: 'Presentación Misión Juvenil',
        description: 'Documento oficial con la visión y estructura del programa MJ.',
        category: 'Liderazgo',
        type: 'PDF',
        url: 'media/recursos/liderazgo/presentacion-mj.pdf',
        icon: 'present_to_all',
        thumbnail: 'assets/img/recursos/thumb_liderazgo_neutral.png',
        badgeText: 'DOCUMENTO MJ',
        date: '25/02/2026',
        isNew: false
    },
    {
        id: 'lid-manual-servidores',
        title: 'Manual de Servidores',
        description: 'Principios fundamentales para el servicio y liderazgo juvenil.',
        category: 'Liderazgo',
        type: 'PDF',
        url: 'media/recursos/liderazgo/manual-servidores.pdf',
        icon: 'groups',
        thumbnail: 'assets/img/recursos/thumb_liderazgo_neutral.png',
        badgeText: 'DESCARGA GRATIS',
        date: '20/02/2026',
        isNew: false
    },
    {
        id: 'lid-estructura',
        title: 'Estructura Institucional',
        description: 'Guía sobre la organización interna y jerarquía del programa.',
        category: 'Liderazgo',
        type: 'PDF',
        url: 'media/recursos/liderazgo/estructura-institucional.pdf',
        icon: 'account_tree',
        thumbnail: 'assets/img/recursos/thumb_liderazgo_neutral.png',
        badgeText: 'OPERATIVO',
        date: '12/02/2026',
        isNew: true
    },

    // --- MULTIMEDIA (Revistas / Posters) ---
    {
        id: 'mul-desenredate-1',
        title: 'Revista DesenREDate Ed.1',
        description: 'Edición especial de la revista juvenil FECP con temas de actualidad.',
        category: 'Multimedia',
        type: 'PDF',
        url: 'media/recursos/multimedia/revista-desenredate-1.pdf',
        icon: 'auto_stories',
        thumbnail: 'assets/img/recursos/thumb_multimedia_neutral.png',
        badgeText: 'REVISTA',
        date: '05/02/2026',
        isNew: false
    },
    {
        id: 'mul-desenredate-2',
        title: 'Revista DesenREDate Ed.2',
        description: 'Segunda edición con reportajes y testimonios impactantes.',
        category: 'Multimedia',
        type: 'PDF',
        url: 'media/recursos/multimedia/revista-desenredate-2.pdf',
        icon: 'auto_stories',
        thumbnail: 'assets/img/recursos/thumb_multimedia_neutral.png',
        badgeText: 'REVISTA',
        date: '01/02/2026',
        isNew: true
    }
];
