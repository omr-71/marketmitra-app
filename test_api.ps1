$envFile = "c:\Users\omlab\Desktop\Projects\marketmitra-app\.env.local"
$apiKey = $env:AGMARKNET_API_KEY
if (-not $apiKey -and (Test-Path $envFile)) {
    Get-Content $envFile | ForEach-Object {
        if ($_ -match "^\s*AGMARKNET_API_KEY\s*=\s*(.*)\s*$") {
            $apiKey = $matches[1].Trim('"').Trim("'").Trim()
        }
    }
}

if (-not $apiKey) {
    Write-Output "API Key is missing."
    exit 1
}

$baseUrl = "https://api.data.gov.in/resource/35985678-0d79-46b4-9ed6-6f13308a1d24"
$params = @{
    "api-key" = $apiKey
    "format" = "json"
    "limit" = "5"
    "offset" = "0"
    "sort[Arrival_Date]" = "desc"
    "filters[Commodity]" = "Onion"
    "filters[State]" = "Maharashtra"
}

$queryString = ($params.GetEnumerator() | ForEach-Object { "$([System.Uri]::EscapeDataString($_.Key))=$([System.Uri]::EscapeDataString($_.Value))" }) -join "&"
$uri = "$baseUrl`?$queryString"

try {
    $resp = Invoke-WebRequest -Uri $uri -TimeoutSec 30 -UseBasicParsing
    Write-Output "HTTP Status: $($resp.StatusCode)"
    $r = $resp.Content | ConvertFrom-Json
    Write-Output "Total: $($r.total)"
    Write-Output "Count: $($r.count)"
    Write-Output "Fields: $(($r.field | ForEach-Object { $_.id }) -join ', ')"
    foreach ($rec in $r.records) {
        Write-Output "Record: $($rec.state) | $($rec.district) | $($rec.market) | $($rec.commodity) | Date:$($rec.arrival_date) | Min:$($rec.min_price) Max:$($rec.max_price) Modal:$($rec.modal_price)"
    }
} catch {
    Write-Output "ERROR: $($_.Exception.Message)"
}
