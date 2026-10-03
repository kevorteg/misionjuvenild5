$ErrorActionPreference = "Stop"

# Inserta los scripts de Botpress (chatbot temporal) en todas las paginas HTML
# salvo fuego-d5.html, que es nuestro propio chat.
# Es idempotente: si el widget ya esta, no lo duplica.

$marca = '20250508053644-M1VHWMG8.js'
$bloque = @'
<!-- Botpress (chatbot temporal mientras termina Fuego D5 IA) -->
<script src="https://cdn.botpress.cloud/webchat/v3.7/inject.js"></script>
<script src="https://files.bpcontent.cloud/2025/05/08/05/20250508053644-M1VHWMG8.js" defer></script>
'@

$paginas = Get-ChildItem -Filter *.html | Where-Object { $_.Name -ne 'fuego-d5.html' }

foreach ($p in $paginas) {
    $texto = [System.IO.File]::ReadAllText($p.FullName)

    if ($texto.Contains($marca)) {
        "  $($p.Name): ya estaba"
        continue
    }

    $i = $texto.LastIndexOf('</body>')
    if ($i -lt 0) { throw "No se encontro </body> en $($p.Name)" }

    $texto = $texto.Insert($i, "$bloque`r`n")
    [System.IO.File]::WriteAllText($p.FullName, $texto, (New-Object System.Text.UTF8Encoding($false)))
    "  $($p.Name): antes de </body>"
}

"`n  Paginas procesadas: $($paginas.Count)"