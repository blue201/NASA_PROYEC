function Resolve-GameAssetPath {
    param([string]$Root, [string]$RawUrl)
    try {
        $decoded = [Uri]::UnescapeDataString($RawUrl.Split('?')[0])
        if ($decoded -eq '/') { $decoded = '/index.html' }
        if ($decoded.Contains('\') -or $decoded.Contains(':') -or $decoded.Contains([char]0)) { return $null }
        $relative = $decoded.TrimStart('/')
        $parts = $relative.Split('/')
        if ($parts -contains '..' -or $parts -contains '.' -or $parts -contains '') { return $null }
        $rootFiles = @('index.html', 'nasa.html', 'favicon.ico')
        $publicDirs = @('js', 'css', 'assets')
        if ($relative -notin $rootFiles -and $parts[0] -notin $publicDirs) { return $null }
        $base = [IO.Path]::GetFullPath($Root).TrimEnd('\') + '\'
        $candidate = [IO.Path]::GetFullPath((Join-Path $base $relative))
        if (-not $candidate.StartsWith($base, [StringComparison]::OrdinalIgnoreCase)) { return $null }
        if ([IO.Path]::GetExtension($candidate).ToLowerInvariant() -notin @('.html','.css','.js','.png','.jpg','.jpeg','.svg','.ico','.webp','.json','.glb','.mp3','.ogg','.wav','.webm','.weba','.mp4')) { return $null }
        $current = $base
        foreach ($part in $parts) {
            $current = Join-Path $current $part
            if (Test-Path -LiteralPath $current) {
                if ((Get-Item -LiteralPath $current).Attributes -band [IO.FileAttributes]::ReparsePoint) { return $null }
            }
        }
        return $candidate
    } catch { return $null }
}
