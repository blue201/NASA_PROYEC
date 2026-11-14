# ==============================================================================
# NASA ODYSSEY - Servidor Web Local Autónomo en PowerShell
# No requiere instalar Node, Python ni paquetes externos.
# ==============================================================================

param([int]$port = 8080, [switch]$NoBrowser)
$prefix = "http://localhost:$port/"
$baseDir = Split-Path -Parent $MyInvocation.MyCommand.Path
. (Join-Path $baseDir 'server-path.ps1')

$mimeMap = @{
    ".webm" = "video/webm"
    ".weba" = "audio/webm"
    ".ogg"  = "audio/ogg"
    ".mp3"  = "audio/mpeg"
    ".mp4"  = "video/mp4"
    ".wav"  = "audio/wav"
    ".html" = "text/html; charset=utf-8"
    ".htm"  = "text/html; charset=utf-8"
    ".css"  = "text/css; charset=utf-8"
    ".js"   = "application/javascript; charset=utf-8"
    ".json" = "application/json; charset=utf-8"
    ".png"  = "image/png"
    ".jpg"  = "image/jpeg"
    ".jpeg" = "image/jpeg"
    ".svg"  = "image/svg+xml"
    ".ico"  = "image/x-icon"
    ".glb"  = "model/gltf-binary"
    ".fbx"  = "application/octet-stream"
    ".tga"  = "application/octet-stream"
}

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add($prefix)

try {
    $listener.Start()
    Write-Host "==========================================================" -ForegroundColor Cyan
    Write-Host " [NASA ODYSSEY] Servidor web iniciado exitosamente" -ForegroundColor Green
    Write-Host " URL: $prefix" -ForegroundColor Yellow
    Write-Host " Presiona Ctrl + C en esta terminal para detener el servidor" -ForegroundColor Gray
    Write-Host "==========================================================" -ForegroundColor Cyan

    # Abrir navegador automáticamente
    if (-not $NoBrowser) { Start-Process $prefix }

    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response

        $filePath = Resolve-GameAssetPath -Root $baseDir -RawUrl $request.RawUrl
        if ($filePath -and (Test-Path -LiteralPath $filePath -PathType Leaf)) {
            $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
            $mime = if ($mimeMap.ContainsKey($ext)) { $mimeMap[$ext] } else { "application/octet-stream" }

            $bytes = [System.IO.File]::ReadAllBytes($filePath)
            $response.ContentType = $mime
            $response.ContentLength64 = $bytes.Length
            $response.AddHeader("X-Content-Type-Options", "nosniff")
            $response.AddHeader("Cache-Control", "no-cache")
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
            $response.StatusCode = 200
        } else {
            $response.StatusCode = 404
            $errBytes = [System.Text.Encoding]::UTF8.GetBytes("404 - Archivo no encontrado")
            $response.OutputStream.Write($errBytes, 0, $errBytes.Length)
        }
        $response.Close()
    }
} catch {
    Write-Host "Servidor detenido: $_" -ForegroundColor Red
} finally {
    if ($listener.IsListening) { $listener.Stop() }
    $listener.Close()
}
