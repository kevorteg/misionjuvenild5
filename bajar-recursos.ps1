# SCRIPT DE DESCARGA AUTOMÁTICA - Misión Juvenil D5
# Este script crea las carpetas y descarga los recursos desde la biblioteca oficial de IPUC.

$baseDir = Get-Location
$recursosDir = Join-Path $baseDir "media\recursos"

# 1. Crear directorios
$folders = @("devocionales", "academico", "liderazgo", "musica", "multimedia")
foreach ($f in $folders) {
    $path = Join-Path $recursosDir $f
    if (!(Test-Path $path)) {
        New-Item -ItemType Directory -Path $path -Force | Out-Null
        Write-Host "Carpeta creada: $f" -ForegroundColor Cyan
    }
}

# 2. Función de descarga desde Google Drive

function Download-GDrive($id, $outputPath) {
    $url = "https://drive.google.com/uc?export=download&id=$id"
    Write-Host "Iniciando descarga: $(Split-Path $outputPath -Leaf)..." -NoNewline
    try {
        Invoke-WebRequest -Uri $url -OutFile $outputPath
        Write-Host " [OK]" -ForegroundColor Green
    }
    catch {
        Write-Host " [ERROR]" -ForegroundColor Red
    }
}

# 3. Lista de Archivos (ID de Google Drive y Ruta Destino)
$files = @(
    # Devocionales
    @{ id = "1Lv8QiHwUe3hO1RwgqOoK1cWoIQyMZzcy"; path = "devocionales\la-ansiedad.pdf" },
    @{ id = "1_pcqdFRvc_Ys_-n0D6t4zK4SV0dEu7c9"; path = "devocionales\la-depresion.pdf" },
    @{ id = "1EVzIGYofFufGdvTi9Pay3eFt9GFOYA4U"; path = "devocionales\el-estres.pdf" },
    @{ id = "1vN1-TjqRn3dNKp6e_Q7i2wXTKXZ6BHPA"; path = "devocionales\refam-juvenil-doctrinal.pdf" },
    
    # Académico
    @{ id = "1FWfPpzo728rtUhHQtN9rbtpFQiSDsYaJ"; path = "academico\efees-superior.pdf" },
    @{ id = "1elswmVJXumngj36acGkwHVUQPe1W3e8T"; path = "academico\pensum-colegios.pdf" },
    @{ id = "1MTIfPRVN819k5PlAu67vQg7v-dzegDs9"; path = "academico\fe-campus.pdf" },
    
    # Liderazgo
    @{ id = "1CQa8jPfuu_uSxqJE3J9VuJ7WpmVsNZjg"; path = "liderazgo\presentacion-mj.pdf" },
    @{ id = "1BuREJjSpA_9V6CuBl1UwUV-dc0Zk3UIZ"; path = "liderazgo\manual-servidores.pdf" },
    @{ id = "1aktVK0l7z80aitFcb6PT_Shyz16AtHtX"; path = "liderazgo\estructura-institucional.pdf" },
    
    # Multimedia
    @{ id = "1XUafF6NVaFBGQvFt_xLnk691Y0ML67Ce"; path = "multimedia\revista-desenredate-1.pdf" },
    @{ id = "1Ic0J-LaOVuX_9V8URA_8AxiElXlb0ib_"; path = "multimedia\revista-desenredate-2.pdf" }
)

# 4. Ejecutar descargas
Write-Host "`n--- Iniciando Biblioteca Misión Juvenil ---`n" -ForegroundColor Yellow
foreach ($file in $files) {
    $fullPath = Join-Path $recursosDir $file.path
    Download-GDrive $file.id $fullPath
}

Write-Host "`n¡Todo listo! Los recursos están en: $recursosDir" -ForegroundColor Green
