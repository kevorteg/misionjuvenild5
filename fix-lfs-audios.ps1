# SCRIPT DE LIMPIEZA GIT LFS - Misión Juvenil D5
# Este script ayuda a que los archivos audio funcionen en GitHub Pages.

Write-Host "--- Iniciando Limpieza de Git LFS para Audios ---" -ForegroundColor Cyan

# 1. Quitar los mp3 y wav del rastreo de LFS
git lfs untrack "*.mp3"
git lfs untrack "*.wav"
Write-Host "[OK] Archivos .mp3 y .wav ya no son rastreados por LFS." -ForegroundColor Green

# 2. Forzar a Git a tratarlos como archivos normales
Add-Content .gitattributes "*.mp3 text"
Add-Content .gitattributes "*.wav text"
Write-Host "[OK] .gitattributes actualizado." -ForegroundColor Green

# 3. Mover los archivos fuera del 'index' de git para re-subirlos
Write-Host "Limpiando el cache de git (Esto no borra tus archivos)..." -ForegroundColor Yellow
git rm --cached media/audio/podcasts/*.mp3
git rm --cached media/audio/podcasts/*.wav

# 4. Volver a agregarlos (ahora como archivos normales)
git add media/audio/podcasts/*.mp3
git add media/audio/podcasts/*.wav
git add .gitattributes

Write-Host "--- PROCESO TERMINADO ---" -ForegroundColor Cyan
Write-Host "Ahora debes hacer commit y push:" -ForegroundColor White
Write-Host "git commit -m 'Fix: Quitar LFS de audios para GitHub Pages'" -ForegroundColor Yellow
Write-Host "git push" -ForegroundColor Yellow
