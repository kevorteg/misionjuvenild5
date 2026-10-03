$ErrorActionPreference = "Stop"

# Retira el bloque de Botpress (chat temporal) de todas las paginas HTML.
# Es idempotente: si ya no esta, no hace nada.

$patron = '(?m)^[ \t]*<!-- Botpress[^\r\n]*-->\r?\n[ \t]*<script src="https://cdn\.botpress[^\r\n]*></script>\r?\n[ \t]*<script src="https://files\.bpcontent[^\r\n]*></script>\r?\n?'

$paginas = Get-ChildItem -Filter *.html
$tocadas = 0

foreach ($p in $paginas) {
    $texto = [System.IO.File]::ReadAllText($p.FullName)
    if ($texto -notmatch 'files\.bpcontent') {
        continue
    }
    $nuevo = [regex]::Replace($texto, $patron, '')
    if ($nuevo -ne $texto) {
        [System.IO.File]::WriteAllText($p.FullName, $nuevo, (New-Object System.Text.UTF8Encoding($false)))
        "  $($p.Name): Botpress retirado"
        $tocadas++
    } else {
        "  $($p.Name): patron no coincidio (revisar)"
    }
}

"`n  Paginas limpiadas: $tocadas"
