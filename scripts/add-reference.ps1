$files = Get-ChildItem -Path "src" -Recurse -Filter "*.module.css"
foreach ($f in $files) {
    $content = Get-Content $f.FullName -Raw
    if ($content -notmatch '@reference') {
        if ($f.FullName -match '\\components\\') {
            $ref = '@reference "../app/globals.css";'
        } elseif ($f.FullName -match '\\app\\ciclos\\' -or $f.FullName -match '\\app\\pedidos\\' -or $f.FullName -match '\\app\\subconsultores\\') {
            $ref = '@reference "../globals.css";'
        } else {
            $ref = '@reference "./globals.css";'
        }
        Set-Content $f.FullName ("$ref`n`n" + $content)
        Write-Host "Fixed: $($f.Name)"
    } else {
        Write-Host "OK: $($f.Name)"
    }
}
Write-Host "Done!"
