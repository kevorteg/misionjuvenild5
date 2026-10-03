$ErrorActionPreference = "Stop"

# Inserta <script src="assets/js/fuego-bubble.js" defer></script> en todas las
# paginas HTML salvo fuego-d5.html (que ya lo carga por su cuenta).
# Es idempotente: si el tag ya existe, no lo duplica.

$tag = '<script src="assets/js/fuego-bubble.js" defer></script>'

$paginas = Get-ChildItem -Filter *.html | Where-Object { $_.Name -ne 'fuego-d5.html' }

foreach ($p in $paginas) {
    $texto = [System.IO.File]::ReadAllText($p.FullName)

    if ($texto.Contains($tag)) {
        "  $($p.Name): ya estaba"
        continue
    }

    # Se inserta justo antes del primer <script ... defer> de assets/js que exista
    # en el pie; si no hay, antes de </body>.
    $m = [regex]::Match($texto, '(?m)^[\t ]*<script src="assets/js/[^"]+" defer></script>')
    if ($m.Success) {
        $texto = $texto.Insert($m.Index, "$tag`r`n")
        $donde = 'antes de ' + $m.Value.Trim()
    } else {
        $i = $texto.LastIndexOf('</body>')
        if ($i -lt 0) { throw "No se encontro </body> en $($p.Name)" }
        $texto = $texto.Insert($i, "    $tag`r`n")
        $donde = 'antes de </body>'
    }

    [System.IO.File]::WriteAllText($p.FullName, $texto, (New-Object System.Text.UTF8Encoding($false)))
    "  $($p.Name): $donde"
}

"`n  Paginas actualizadas: $($paginas.Count)"