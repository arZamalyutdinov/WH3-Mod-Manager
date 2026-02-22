param(
  [Parameter(Mandatory = $true)]
  [string]$DownloadUrl,

  [Parameter(Mandatory = $true)]
  [string]$ZipPath,

  [Parameter(Mandatory = $true)]
  [string]$StagingDir,

  [Parameter(Mandatory = $true)]
  [string]$InstallDir,

  [Parameter(Mandatory = $true)]
  [string]$AppExeName
)

$ErrorActionPreference = "Stop"
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

Invoke-WebRequest -Uri $DownloadUrl -OutFile $ZipPath -UseBasicParsing

if (Test-Path -LiteralPath $StagingDir) {
  Remove-Item -LiteralPath $StagingDir -Recurse -Force
}
New-Item -ItemType Directory -Path $StagingDir -Force | Out-Null
New-Item -ItemType Directory -Path $InstallDir -Force | Out-Null

Expand-Archive -LiteralPath $ZipPath -DestinationPath $StagingDir -Force

$items = Get-ChildItem -LiteralPath $StagingDir
$sourceDir = $StagingDir
if ($items.Count -eq 1 -and $items[0].PSIsContainer) {
  $sourceDir = $items[0].FullName
}

Copy-Item -Path (Join-Path $sourceDir "*") -Destination $InstallDir -Recurse -Force

$expectedExe = Join-Path $InstallDir $AppExeName
if (-not (Test-Path -LiteralPath $expectedExe)) {
  throw "Installed package is missing '$AppExeName' at '$InstallDir'."
}

Write-Output "Installer payload prepared successfully."
