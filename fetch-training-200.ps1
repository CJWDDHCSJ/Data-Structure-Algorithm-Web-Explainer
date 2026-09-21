$ErrorActionPreference = 'Stop'
$utf8 = New-Object System.Text.UTF8Encoding($false)
function Read-LuoguData([string]$url) {
    $html = (Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 30).Content
    $match = [regex]::Match($html, '<script id="lentille-context" type="application/json">(.*?)</script>', 'Singleline')
    if (-not $match.Success) { throw "Missing page data: $url" }
    return ($match.Groups[1].Value | ConvertFrom-Json).data
}
$training = (Read-LuoguData 'https://www.luogu.com.cn/training/200').training
if (-not $training.problems -or $training.problems.Count -ne $training.problemCount) { throw 'Incomplete training list' }
$items = @()
foreach ($entry in $training.problems) {
    $problem = (Read-LuoguData "https://www.luogu.com.cn/problem/$($entry.pid)").problem
    if (-not $problem.content.name -or -not $problem.content.description) { throw "Incomplete problem: $($entry.pid). Snapshot unchanged." }
    $items += [PSCustomObject]@{ id=$entry.pid; title=$problem.content.name; difficulty=$entry.difficulty; content=$problem.content; samples=$problem.samples; limits=$problem.limits }
    Write-Output "$($entry.pid) OK"
}
$snapshot = [PSCustomObject]@{ trainingId=200; name=$training.name; fetchedAt=(Get-Date -Format 'yyyy-MM-dd'); source='https://www.luogu.com.cn/training/200'; description=$training.description; problems=$items }
[IO.File]::WriteAllText((Join-Path $PSScriptRoot 'source-training-200.json'), (ConvertTo-Json -InputObject $snapshot -Depth 30), $utf8)
