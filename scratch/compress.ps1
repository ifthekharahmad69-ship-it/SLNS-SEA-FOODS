Add-Type -AssemblyName System.Drawing

$files = Get-ChildItem -Path "public/images" -Recurse -Include *.png, *.jpg, *.jpeg

foreach ($file in $files) {
    try {
        $img = [System.Drawing.Image]::FromFile($file.FullName)
        $w = $img.Width
        $h = $img.Height
        if ($w -gt 800) {
            $h = [int]($h * (800 / $w))
            $w = 800
        }
        $bmp = New-Object System.Drawing.Bitmap($w, $h)
        $g = [System.Drawing.Graphics]::FromImage($bmp)
        $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $g.DrawImage($img, 0, 0, $w, $h)
        $img.Dispose()
        
        $tempPath = $file.FullName + ".tmp.jpg"
        $bmp.Save($tempPath, [System.Drawing.Imaging.ImageFormat]::Jpeg)
        $bmp.Dispose()

        Remove-Item $file.FullName -Force
        Move-Item $tempPath $file.FullName -Force
        Write-Host "Compressed: $($file.Name)"
    } catch {
        Write-Host "Error processing $($file.Name): $_"
    }
}
