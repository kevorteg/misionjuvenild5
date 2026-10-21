// Generate muro card without innerHTML and without injecting visitor data into inline onclick
function createMuroCard(opts) {
    var newCard = document.createElement('div');
    newCard.className = 'feed-card bg-surface-container-lowest border-2 border-outline-variant shadow-[0_5px_0_#c6c7cf] p-5 flex flex-col justify-between';
    newCard.setAttribute('data-category', opts.category);

    var isTestimonio = opts.isTestimonio;
    var badgeColor = isTestimonio ? 'bg-tertiary-container/25 text-tertiary border border-tertiary-container' : 'bg-primary-container/20 text-primary border border-primary-container';
    var btnStyle = isTestimonio ? 'bg-tertiary-container/25 text-tertiary border-2 border-tertiary-container' : 'bg-secondary-container/20 text-secondary border-2 border-secondary-container';

    var topWrap = document.createElement('div');

    var headerRow = document.createElement('div');
    headerRow.className = 'flex items-center justify-between mb-3';
    var badge = document.createElement('span');
    badge.className = 'inline-flex items-center gap-1.5 px-3 py-1 ' + badgeColor + ' font-headline font-black text-[10px] uppercase';
    var badgeIconSpan = document.createElement('span');
    badgeIconSpan.className = 'material-symbols-outlined !text-[14px]';
    badgeIconSpan.textContent = opts.badgeIcon;
    var badgeLabelSpan = document.createElement('span');
    badgeLabelSpan.textContent = opts.badgeLabel;
    badge.appendChild(badgeIconSpan);
    badge.appendChild(badgeLabelSpan);
    var timeSpan = document.createElement('span');
    timeSpan.className = 'font-body font-bold text-[10px] text-on-surface-variant';
    timeSpan.textContent = 'Ahora mismo';
    headerRow.appendChild(badge);
    headerRow.appendChild(timeSpan);

    var authorRow = document.createElement('div');
    authorRow.className = 'flex items-center gap-2 mb-3';
    var authorIcon = document.createElement('span');
    authorIcon.className = 'material-symbols-outlined !text-[16px] text-primary';
    authorIcon.textContent = 'person_pin';
    var authorText = document.createElement('span');
    authorText.className = 'font-headline font-black text-xs text-on-surface uppercase';
    authorText.textContent = opts.authorSafe + ' (' + opts.locationSafe + ')';
    authorRow.appendChild(authorIcon);
    authorRow.appendChild(authorText);

    var bodyText = document.createElement('p');
    bodyText.className = 'font-body font-bold text-xs text-on-surface-variant mb-5 leading-relaxed';
    bodyText.textContent = '“' + opts.textSafe + '”';

    topWrap.appendChild(headerRow);
    topWrap.appendChild(authorRow);
    topWrap.appendChild(bodyText);

    if (opts.mediaHtmlData) {
        var mediaWrap = document.createElement('div');
        mediaWrap.className = 'mt-3 overflow-hidden border-2 border-outline-variant';
        if (opts.mediaHtmlData.type === 'video') {
            var vid = document.createElement('video');
            vid.src = opts.mediaHtmlData.url;
            vid.controls = true;
            vid.className = 'w-full h-36 object-cover bg-black';
            mediaWrap.appendChild(vid);
        } else {
            var img = document.createElement('img');
            img.src = opts.mediaHtmlData.url;
            img.className = 'w-full h-36 object-cover';
            img.alt = 'Adjunto';
            mediaWrap.appendChild(img);
        }
        topWrap.appendChild(mediaWrap);
    }

    var actionsRow = document.createElement('div');
    actionsRow.className = 'flex items-center justify-between pt-3 border-t-2 border-outline-variant';

    var prayBtn = document.createElement('button');
    prayBtn.className = 'prayer-btn flex items-center gap-2 px-3 py-1.5 ' + btnStyle + ' font-headline font-black text-[11px] uppercase tracking-wider transition-transform active:translate-y-[2px]';
    prayBtn.type = 'button';
    prayBtn.addEventListener('click', function () { if (typeof incrementPrayer === 'function') incrementPrayer(prayBtn); });
    var prayIcon = document.createElement('span');
    prayIcon.className = 'material-symbols-outlined !text-[18px]';
    prayIcon.textContent = opts.btnIcon;
    var prayLabelWrap = document.createElement('span');
    prayLabelWrap.textContent = opts.btnLabel + ' (';
    var prayCount = document.createElement('span');
    prayCount.className = 'count';
    prayCount.textContent = '1';
    prayLabelWrap.appendChild(prayCount);
    prayLabelWrap.appendChild(document.createTextNode(')'));
    prayBtn.appendChild(prayIcon);
    prayBtn.appendChild(prayLabelWrap);

    var encourageBtn = document.createElement('button');
    encourageBtn.className = 'flex items-center gap-1 text-primary font-headline font-black text-[11px] uppercase tracking-wider hover:underline';
    encourageBtn.type = 'button';
    var encourageAuthor = opts.authorInputRaw || opts.authorSafe;
    encourageBtn.addEventListener('click', function () { if (typeof openEncourageModal === 'function') openEncourageModal(encourageAuthor); });
    var encIcon = document.createElement('span');
    encIcon.className = 'material-symbols-outlined !text-[16px]';
    encIcon.textContent = 'add_comment';
    var encLabel = document.createElement('span');
    encLabel.textContent = isTestimonio ? 'Celebrar' : 'Palabra';
    encourageBtn.appendChild(encIcon);
    encourageBtn.appendChild(encLabel);

    actionsRow.appendChild(prayBtn);
    actionsRow.appendChild(encourageBtn);

    newCard.appendChild(topWrap);
    newCard.appendChild(actionsRow);
    return newCard;
}

