# extract_gaokao.ps1
# Extracts all gaokao zip/dir files to ASCII-named xlsx files in gaokao_raw/
# Run from: backend/data/

param(
    [string]$DataDir = "F:\code\data\gaokao\gaokao_2016-2020",
    [string]$OutDir  = "$PSScriptRoot\gaokao_raw"
)

New-Item -ItemType Directory -Force $OutDir | Out-Null
$manifest = @()

$entries = Get-ChildItem $DataDir | Where-Object { $_.Name -notmatch '^(README|demo)' }

foreach ($entry in $entries) {
    $rawName = $entry.Name

    # Determine province and subject from the entry name
    # Strip .xlsx.zip / .xlsx / .zip suffixes
    $stem = $rawName
    if ($stem -like '*.xlsx.zip') { $stem = $stem.Substring(0, $stem.Length - 9) }
    elseif ($stem -like '*.zip')  { $stem = $stem.Substring(0, $stem.Length - 4) }
    elseif ($stem -like '*.xlsx') { $stem = $stem.Substring(0, $stem.Length - 5) }

    # Split on last '-'
    $dashIdx = $stem.LastIndexOf('-')
    if ($dashIdx -lt 0) { continue }
    $province    = $stem.Substring(0, $dashIdx)
    $subjectType = $stem.Substring($dashIdx + 1)
    if ($subjectType -notin '文科','理科') { continue }

    # Build safe ASCII output filename
    $safeProvince = $province -replace '[^一-鿿\w]', ''
    # Use PinYin-like mapping for known provinces to get ASCII key
    # Fallback: just use index
    $outName = "${province}_${subjectType}.xlsx"
    $outPath = Join-Path $OutDir $outName

    Write-Host "Processing: $rawName  ->  $outName"

    try {
        if ($entry.Extension -eq '.zip') {
            # Extract zip to temp, find xlsx inside
            $tmpDir = Join-Path $env:TEMP "gaokao_extract_$([System.IO.Path]::GetRandomFileName())"
            New-Item -ItemType Directory -Force $tmpDir | Out-Null
            Expand-Archive -Path $entry.FullName -DestinationPath $tmpDir -Force
            $innerXlsx = Get-ChildItem $tmpDir -Recurse | Where-Object { $_.Extension -eq '.xlsx' } | Select-Object -First 1
            if ($innerXlsx) {
                Copy-Item $innerXlsx.FullName $outPath -Force
                Write-Host "  OK (from zip, $([math]::Round($innerXlsx.Length/1024))KB)"
            } else {
                Write-Host "  SKIP: no xlsx found in zip"
            }
            Remove-Item $tmpDir -Recurse -Force
        }
        elseif ($entry.PSIsContainer) {
            # Directory containing inner xlsx
            $innerXlsx = Get-ChildItem $entry.FullName | Where-Object { $_.Extension -eq '.xlsx' } | Select-Object -First 1
            if ($innerXlsx) {
                Copy-Item $innerXlsx.FullName $outPath -Force
                Write-Host "  OK (from dir, $([math]::Round($innerXlsx.Length/1024))KB)"
            } else {
                Write-Host "  SKIP: no xlsx in directory"
            }
        }
        else {
            Write-Host "  SKIP: unknown entry type"
            continue
        }

        $manifest += [PSCustomObject]@{
            file         = $outName
            province     = $province
            subject_type = $subjectType
        }
    }
    catch {
        Write-Host "  ERROR: $_"
    }
}

# Write manifest JSON
$manifestPath = Join-Path $OutDir "manifest.json"
$manifest | ConvertTo-Json | Set-Content -Path $manifestPath -Encoding UTF8
Write-Host ""
Write-Host "Done. $($manifest.Count) files written to $OutDir"
Write-Host "Manifest: $manifestPath"
