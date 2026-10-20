param(
    [Parameter(Mandatory=$true)][string]$DrawingScript,
    [Parameter(Mandatory=$true)][string]$RuntimeNode,
    [Parameter(Mandatory=$true)][string]$RuntimeNodeModules,
    [Parameter(Mandatory=$true)][string]$RuntimePython,
    [Parameter(Mandatory=$true)][string]$PresentationsSkill,
    [string]$OutputDirectory,
    [switch]$SkipPowerPoint
)
$ErrorActionPreference='Stop'
$drawingPath=(Resolve-Path -LiteralPath $DrawingScript).Path
if(-not $OutputDirectory){
    $OutputDirectory=Join-Path $PSScriptRoot ('..\paper-cartoon-output\'+(Get-Date -Format 'yyyyMMdd-HHmmss'))
}
$OutputDirectory=[IO.Path]::GetFullPath($OutputDirectory)
if(Test-Path -LiteralPath (Join-Path $OutputDirectory 'figure.pptx')){throw 'Choose a new output directory to preserve the existing result.'}
$env:ARTIFACT_TOOL_DIR=Join-Path $RuntimeNodeModules '@oai\artifact-tool'
$env:RUNTIME_NODE_MODULES=$RuntimeNodeModules
& $RuntimeNode $drawingPath $OutputDirectory
if($LASTEXITCODE -ne 0){throw 'Drawing failed.'}
$configPath=Join-Path $OutputDirectory 'build\diagram-config.json'
if(-not(Test-Path -LiteralPath $configPath)){throw 'Drawing script must write build/diagram-config.json.'}
& $RuntimePython (Join-Path $PSScriptRoot 'group_native.py') (Join-Path $OutputDirectory 'build\candidate.pptx') (Join-Path $OutputDirectory 'build\grouped.pptx') --config $configPath
if($LASTEXITCODE -ne 0){throw 'Grouping failed.'}
& $RuntimeNode (Join-Path $PSScriptRoot 'finalize.mjs') $OutputDirectory $PresentationsSkill $RuntimePython $configPath
if($LASTEXITCODE -ne 0){throw 'Final validation failed.'}
$config=Get-Content -Raw -Encoding utf8 -LiteralPath $configPath | ConvertFrom-Json
foreach($file in @('run_diagram.ps1','group_native.py','finalize.mjs','export_powerpoint.ps1','prepare_inputs.py','diagram-kit.mjs')){
    $destination=Join-Path $OutputDirectory ('build\'+$file)
    if([IO.Path]::GetFullPath((Join-Path $PSScriptRoot $file)) -ne $destination){
        Copy-Item -LiteralPath (Join-Path $PSScriptRoot $file) -Destination $destination
    }
}
if(-not $SkipPowerPoint){
    if($config.slideCount -ne 1){throw 'Multi-slide deck built. Render every slide with an appropriate PPTX renderer.'}
    $previewWidth=2400
    $previewHeight=[int][Math]::Round($previewWidth*$config.height/$config.width)
    & (Join-Path $PSScriptRoot 'export_powerpoint.ps1') -InputPptx (Join-Path $OutputDirectory 'figure.pptx') -OutputPng (Join-Path $OutputDirectory 'figure.png') -Width $previewWidth -Height $previewHeight
}
