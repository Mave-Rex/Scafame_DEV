Set-StrictMode -Version Latest

$RemoteUser = 'administrador'
$RemoteHost = '192.168.11.5'
$RemotePort = 22
$RemoteAppDir = '/home/administrador/Documents/SCAFAME'

$CodeRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$RepoRoot = Split-Path -Parent $CodeRoot
Set-Location $RepoRoot

function Get-GitCodeChanges {
    param ([string]$Scope)

    $lines = @(git status --porcelain --untracked-files=all -- $Scope 2>$null)
    $paths = @()

    foreach ($line in $lines) {
        if ([string]::IsNullOrWhiteSpace($line)) { continue }

        $status = $line.Substring(0, 2)
        if ($status.Contains('D')) { continue }

        $path = $line.Substring(3).Trim()
        if ($path -match ' -> ') {
            $path = ($path -split ' -> ')[-1].Trim()
        }

        if ($path) {
            $paths += ($path -replace '\\', '/')
        }
    }

    return @($paths | Select-Object -Unique)
}

function Is-SensitivePath {
    param ([string]$Path)

    $p = $Path.ToLowerInvariant()

    if ($p -match '(^|/)\.env($|\.)') { return $true }
    if ($p -match 'docker-compose(\.[a-z0-9_-]+)?\.ya?ml$') { return $true }
    if ($p -match '(^|/)dockerfile$') { return $true }
    if ($p -match '(^|/)nginx/') { return $true }
    if ($p -match '(^|/)deploy frontend/(dockerfile|000-default\.conf)$') { return $true }

    return $false
}

$allChanges = Get-GitCodeChanges -Scope 'CODE'

$backendCodeChanges = @($allChanges | Where-Object {
    $_ -like 'CODE/scafame_backend/src/*' -and -not (Is-SensitivePath $_)
})

$frontendCodeChanges = @($allChanges | Where-Object {
    $_ -like 'CODE/scafame_frontend/src/*' -and -not (Is-SensitivePath $_)
})

if ($backendCodeChanges.Count -eq 0 -and $frontendCodeChanges.Count -eq 0) {
    Write-Host 'No hay cambios de codigo (frontend/backend src) para desplegar.'
    exit 0
}

Write-Host "Cambios de codigo detectados -> Backend: $($backendCodeChanges.Count), Frontend: $($frontendCodeChanges.Count)"

$createdTarFiles = @()

try {
    if ($backendCodeChanges.Count -gt 0) {
        Write-Host 'Empaquetando cambios de backend...'

        $backendPayload = "$env:TEMP/scafame_backend_code_payload.tgz"
        $backendList = "$env:TEMP/scafame_backend_code_files.txt"

        if (Test-Path $backendPayload) { Remove-Item $backendPayload -Force }

        $backendRelative = @($backendCodeChanges | ForEach-Object { $_.Substring(5) })
        Set-Content -Path $backendList -Value ($backendRelative -join "`n") -Encoding ascii

        & tar -czf $backendPayload -C "$CodeRoot" -T $backendList
        if ($LASTEXITCODE -ne 0 -or -not (Test-Path $backendPayload)) {
            throw 'No se pudo crear el paquete de backend.'
        }

        Remove-Item $backendList -Force
        $createdTarFiles += $backendPayload

        Write-Host 'Subiendo backend a VM...'
        scp -P $RemotePort "$backendPayload" "${RemoteUser}@${RemoteHost}:/tmp/scafame_backend_code_payload.tgz"
        if ($LASTEXITCODE -ne 0) {
            throw 'Fallo al subir el paquete de backend.'
        }

        Write-Host 'Aplicando backend en VM...'
        $backendCmd = "set -e; cd '$RemoteAppDir'; tar -xzf /tmp/scafame_backend_code_payload.tgz -C '$RemoteAppDir'; rm -f /tmp/scafame_backend_code_payload.tgz; docker compose build backend; docker compose up -d --force-recreate backend; docker compose ps"
        ssh -p $RemotePort "${RemoteUser}@${RemoteHost}" $backendCmd
        if ($LASTEXITCODE -ne 0) {
            throw 'Fallo al desplegar backend en la VM.'
        }
    }

    if ($frontendCodeChanges.Count -gt 0) {
        Write-Host 'Compilando frontend local...'
        Push-Location "$CodeRoot/scafame_frontend"
        npm run build -- --no-progress
        Pop-Location

        $sourceBrowser = "$CodeRoot/scafame_frontend/dist/scafame_frontend/browser"
        if (-not (Test-Path $sourceBrowser)) {
            throw "No se encontro build de frontend en: $sourceBrowser"
        }

        $frontendPayload = "$env:TEMP/scafame_frontend_code_payload.tgz"
        if (Test-Path $frontendPayload) { Remove-Item $frontendPayload -Force }

        Write-Host 'Empaquetando frontend compilado...'
        & tar -czf $frontendPayload -C "$sourceBrowser" .
        if ($LASTEXITCODE -ne 0 -or -not (Test-Path $frontendPayload)) {
            throw 'No se pudo crear el paquete de frontend.'
        }

        $createdTarFiles += $frontendPayload

        Write-Host 'Subiendo frontend a VM...'
        scp -P $RemotePort "$frontendPayload" "${RemoteUser}@${RemoteHost}:/tmp/scafame_frontend_code_payload.tgz"
        if ($LASTEXITCODE -ne 0) {
            throw 'Fallo al subir el paquete de frontend.'
        }

        Write-Host 'Aplicando frontend en VM...'
                $frontendCmd = @"
set -e
cd '$RemoteAppDir'

FRONT_FOLDER=''
if [ -f './deploy frontend/Dockerfile' ]; then
    if grep -q 'dist/scafame_frontend/browser' './deploy frontend/Dockerfile'; then
        FRONT_FOLDER='scafame_frontend'
    elif grep -q 'dist/sigfame_frontend/browser' './deploy frontend/Dockerfile'; then
        FRONT_FOLDER='sigfame_frontend'
    fi
fi

if [ -z "`$FRONT_FOLDER" ]; then
    if [ -d './deploy frontend/dist/scafame_frontend' ]; then
        FRONT_FOLDER='scafame_frontend'
    else
        FRONT_FOLDER='sigfame_frontend'
    fi
fi

TARGET_BROWSER="./deploy frontend/dist/`$FRONT_FOLDER/browser"
mkdir -p "`$TARGET_BROWSER"
find "`$TARGET_BROWSER" -mindepth 1 -delete
tar -xzf /tmp/scafame_frontend_code_payload.tgz -C "`$TARGET_BROWSER"
rm -f /tmp/scafame_frontend_code_payload.tgz

FRONT_SERVICE=''
if docker compose config --services | tr -d '\r' | grep -qx 'frontend'; then
    FRONT_SERVICE='frontend'
elif docker compose config --services | tr -d '\r' | grep -qx 'scafame-frontend'; then
    FRONT_SERVICE='scafame-frontend'
elif docker compose config --services | tr -d '\r' | grep -qx 'nginx'; then
    FRONT_SERVICE='nginx'
fi

if [ -n "`$FRONT_SERVICE" ]; then
    docker compose build "`$FRONT_SERVICE"
    docker compose up -d --force-recreate "`$FRONT_SERVICE"
else
    docker compose build
    docker compose up -d --force-recreate
fi
"@ -replace "`r", ""

                $frontendCmd | ssh -p $RemotePort "${RemoteUser}@${RemoteHost}" "bash -s"
        if ($LASTEXITCODE -ne 0) {
            throw 'Fallo al desplegar frontend en la VM.'
        }
    }

    Write-Host 'Despliegue completado: solo codigo de backend/frontend (sin env, docker-compose, nginx ni Dockerfiles).'
}
finally {
    foreach ($file in $createdTarFiles) {
        if (Test-Path $file) { Remove-Item $file -Force }
    }
}
