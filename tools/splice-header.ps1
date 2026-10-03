param(
    [string]$Source = "index.html",
    [string]$Target = "fuego-d5.html"
)

# Empalma en $Target los bloques reales de $Source.
# Los marcadores se reemplazan por el contenido literal del origen, asi que el
# header, el footer, la topbar, el tailwind.config y el <style> quedan
# identicos a index.html sin copiar y pegar a mano.

$ErrorActionPreference = "Stop"

function Get-Lines([string]$path) {
    return [System.IO.File]::ReadAllLines((Resolve-Path -LiteralPath $path))
}

function Get-Range([string[]]$lines, [int]$from, [int]$to) {
    # $from/$to son indicesbase 1, inclusivos
    return ($lines[($from - 1)..($to - 1)] -join "`n")
}

$src = Get-Lines $Source

# Localizar marcadores de inicio/fin en el origen por patron
function Find-Lines([string[]]$lines, [string]$pattern, [int]$skip = 0) {
    $hits = @()
    for ($i = 0; $i -lt $lines.Count; $i++) {
        if ($lines[$i] -match $pattern) { $hits += ($i + 1) }
    }
    if ($hits.Count -le $skip) { throw "No se encontro '$pattern' (skip $skip) en $Source" }
    return $hits[$skip]
}

# --- TOPBAR: <div class="w-full bg-primary-container ... > hasta su cierre ---
$topStart = Find-Lines $src 'bg-primary-container text-white'
$topEnd   = Find-Lines $src '^\s*</div>\s*$' 0 | Out-Null
# el cierre real de la topbar es la ultima linea "    </div>" antes del comentario MAIN NAVBAR
$navComment = Find-Lines $src 'MAIN NAVBAR'
$topEnd = $navComment - 2
$topbar = Get-Range $src $topStart $topEnd

# --- HEADER: primera etiqueta <header ...> hasta su </header> ---
$hdrStart = Find-Lines $src '^\s*<header\b'
$hdrEnd   = Find-Lines $src '^\s*</header>'
$header = Get-Range $src $hdrStart $hdrEnd

# --- FOOTER: primera etiqueta <footer ...> hasta su </footer> ---
$ftrStart = Find-Lines $src '^\s*<footer\b'
$ftrEnd   = Find-Lines $src '^\s*</footer>'
$footer = Get-Range $src $ftrStart $ftrEnd

# --- tailwind.config: el bloque <script> que contiene "tailwind.config =" ---
$cfgStart = Find-Lines $src '^\s*<script>\s*$'
$cfgEnd   = Find-Lines $src '^\s*</script>\s*$'
# localizar el <script> correcto: el que contiene tailwind.config
$cfgScript = -1
for ($i = 0; $i -lt $src.Count; $i++) {
    if ($src[$i] -match 'tailwind\.config') { $cfgScript = $i; break }
}
if ($cfgScript -lt 0) { throw "No se encontro tailwind.config en $Source" }
# el <script> abre en la linea anterior al comment/uso mas cercano hacia arriba
$cfgOpen = $cfgScript
while ($cfgOpen -gt 0 -and $src[$cfgOpen] -notmatch '^\s*<script>\s*$') { $cfgOpen-- }
$cfgClose = $cfgOpen
while ($cfgClose -lt $src.Count -and $src[$cfgClose] -notmatch '^\s*</script>\s*$') { $cfgClose++ }
$config = Get-Range $src ($cfgOpen + 1) ($cfgClose - 1)

# --- <style> ... </style> (todo el bloque, incluye la regla border-radius:0) ---
$styleStart = Find-Lines $src '^\s*<style>\s*$'
$styleEnd   = Find-Lines $src '^\s*</style>'
$indexStyle = Get-Range $src ($styleStart + 1) ($styleEnd - 1)

# --- Reemplazar marcadores en el destino ---
$dst = [System.IO.File]::ReadAllText((Resolve-Path -LiteralPath $Target))

$map = [ordered]@{
    '<!--__TOPBAR__-->'      = $topbar
    '<!--__HEADER__-->'      = $header
    '<!--__FOOTER__-->'      = $footer
    '/*__TWCFG__*/'          = $config
    '/*__INDEXSTYLE__*/'     = $indexStyle
}

foreach ($k in $map.Keys) {
    if (-not $dst.Contains($k)) { throw "Marcador no encontrado en ${Target}: $k" }
    $dst = $dst.Replace($k, $map[$k])
}

[System.IO.File]::WriteAllText((Resolve-Path -LiteralPath $Target), $dst, (New-Object System.Text.UTF8Encoding($false)))

"  topbar   : $($topbar.Length) chars (lineas $topStart..$topEnd)"
"  header   : $($header.Length) chars (lineas $hdrStart..$hdrEnd)"
"  footer   : $($footer.Length) chars (lineas $ftrStart..$ftrEnd)"
"  config   : $($config.Length) chars"
"  style    : $($indexStyle.Length) chars (lineas $($styleStart+1)..$($styleEnd-1))"
"  escrito  : $((Get-Item -LiteralPath $Target).Length) bytes"