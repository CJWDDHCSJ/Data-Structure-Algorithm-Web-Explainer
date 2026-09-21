$ErrorActionPreference = 'Stop'
$utf8 = New-Object System.Text.UTF8Encoding($false)
$ids = @('P1143','P1469','P1100','P1017','P1866','P2822','P2789','P3913','P2638','P1246','P2926','P3383','P1835','P1029','P1072','P1069','P1572','P4057','P1414','P2651','P2660','P3601','P1403','P1593')
$items = @()
$failed = @()
foreach ($id in $ids) {
  try {
    $html = (Invoke-WebRequest -Uri "https://www.luogu.com.cn/problem/$id" -UseBasicParsing -TimeoutSec 25).Content
    $match = [regex]::Match($html, '<script id="lentille-context" type="application/json">(.*?)</script>', 'Singleline')
    if (-not $match.Success) { throw 'Problem data was not found in the response.' }
    $data = ($match.Groups[1].Value | ConvertFrom-Json).data.problem
    if (-not $data.content.name -or -not $data.content.description) { throw 'Problem content is incomplete.' }
    $items += [PSCustomObject]@{ id = $id; title = $data.content.name; content = $data.content; samples = $data.samples; limits = $data.limits }
    Write-Output "$id OK"
  } catch { $failed += $id; Write-Warning "$id FAILED: $($_.Exception.Message)" }
}
if ($failed.Count -gt 0) { throw "Snapshot unchanged. Failed problems: $($failed -join ', ')" }
[IO.File]::WriteAllText((Join-Path $PSScriptRoot 'source-problems.json'), (ConvertTo-Json -InputObject $items -Depth 30), $utf8)
