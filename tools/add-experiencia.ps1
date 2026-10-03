$ErrorActionPreference = "Stop"

# Inserta el widget "Experiencia D5" (mascota Chispa + tour + tips + sonido)
# en todas las paginas HTML salvo fuego-d5.html (nuestro propio chat).
# Es idempotente: si el script ya esta, no lo duplica.

$marca = 'assets/js/experiencia-d5.js'
$bloque = '<script src="assets/js/experiencia-d5.js" defer></script>'

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
    "  $($p.Name): inyectado"
}

"`n  Paginas procesadas: $($paginas.Count)"
