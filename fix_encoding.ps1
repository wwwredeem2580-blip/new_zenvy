$f = 'e:\Client_Workspace\project_CAF\client\src\components\AdminPage.tsx'
$content = [System.IO.File]::ReadAllText($f, [System.Text.Encoding]::UTF8)
$fixed = $content -replace [char]0xe2 + [char]0x80 + [char]0xa2, [char]0x2022
[System.IO.File]::WriteAllText($f, $fixed, [System.Text.UTF8Encoding]::new($false))
Write-Host "Done"
