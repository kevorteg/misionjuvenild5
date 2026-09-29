# Sube la media pesada (mp3/mp4) a Cloudflare R2 y genera el mapa de URLs públicas.
# Uso:
#   $env:R2_ACCOUNT_ID = "..."; $env:R2_ACCESS_KEY = "..."; $env:R2_SECRET_KEY = "..."
#   $env:R2_BUCKET     = "mision-juvenil-media"   (default)
#   powershell -ExecutionPolicy Bypass -File subir-r2.ps1
#
# Requisito: rclone instalado y un bucket R2 público habilitado en r2.dev.
$ErrorActionPreference = 'Stop'

$acct = $env:R2_ACCOUNT_ID
$ak   = $env:R2_ACCESS_KEY
$sk   = $env:R2_SECRET_KEY
$bucket = if ($env:R2_BUCKET) { $env:R2_BUCKET } else { 'mision-juvenil-media' }

if (-not $acct -or -not $ak -or -not $sk) {
    Write-Error "Faltan credenciales. Define R2_ACCOUNT_ID, R2_ACCESS_KEY y R2_SECRET_KEY."
}

$root = $PSScriptRoot
$remote = 'r2mjd5'
if (Get-Command rclone -ErrorAction SilentlyContinue) { $rclone = 'rclone' }
else {
    $pkg = Get-ChildItem "$env:LOCALAPPDATA\Microsoft\WinGet\Packages" -Recurse -Filter 'rclone.exe' -ErrorAction SilentlyContinue | Select-Object -First 1
    if (-not $pkg) { Write-Error 'rclone no encontrado. Instala con: winget install Rclone.Rclone' }
    $rclone = $pkg.FullName
}

& $rclone config create $remote s3 provider Cloudflare env_auth false `
    access_key_id $ak secret_access_key $sk `
    endpoint ("https://{0}.r2.cloudflarestorage.com" -f $acct) `
    --non-interactive 2>&1 | Out-Null

Write-Host '== Subiendo audio (mp3) =='
& $rclone copy (Join-Path $root 'media/audio/podcasts') "$remote`:$bucket/media/audio/podcasts" --include '*.mp3' --progress 2>&1 | Select-Object -Last 3

Write-Host '== Subiendo video podcast (mp4) =='
& $rclone copy (Join-Path $root 'media/video/podcasts') "$remote`:$bucket/media/video/podcasts" --include '*.mp4' --progress 2>&1 | Select-Object -Last 3

Write-Host '== Subiendo video documental =='
& $rclone copy (Join-Path $root 'media/video/documentales') "$remote`:$bucket/media/video/documentales" --include '*.mp4' --progress 2>&1 | Select-Object -Last 3

Write-Host ''
Write-Host '== URLs públicas (r2.dev) =='
Write-Host '  En la consola R2 del bucket: Settings > Public access > r2.dev subdomain.'
Write-Host '  El archivo quedara como:  https://<dominio>.r2.dev/media/audio/... y /media/video/...'
Write-Host '  Luego edita los JS y pon:  MJ_MEDIA_BASE = "https://<dominio>.r2.dev/";'