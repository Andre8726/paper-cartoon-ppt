param(
    [Parameter(Mandatory=$true)][string]$RuntimeNode,
    [Parameter(Mandatory=$true)][string]$RuntimeNodeModules,
    [Parameter(Mandatory=$true)][string]$RuntimePython,
    [Parameter(Mandatory=$true)][string]$PresentationsSkill,
    [string]$OutputDirectory,
    [switch]$SkipPowerPoint
)
$ErrorActionPreference='Stop'
if(-not $OutputDirectory){
    $OutputDirectory=Join-Path $PSScriptRoot ('..\paper-cartoon-output\mn3sn-'+(Get-Date -Format 'yyyyMMdd-HHmmss'))
}
$OutputDirectory=[IO.Path]::GetFullPath($OutputDirectory)
if(Test-Path -LiteralPath (Join-Path $OutputDirectory 'figure.pptx')){throw 'Choose a new output directory to preserve the existing result.'}
$env:ARTIFACT_TOOL_DIR=Join-Path $RuntimeNodeModules '@oai\artifact-tool'
$env:RUNTIME_NODE_MODULES=$RuntimeNodeModules
& $RuntimeNode (Join-Path $PSScriptRoot 'draw_mn3sn.mjs') $OutputDirectory
if($LASTEXITCODE -ne 0){throw 'Drawing failed.'}
& $RuntimePython (Join-Path $PSScriptRoot 'group_native.py') (Join-Path $OutputDirectory 'build\candidate.pptx') (Join-Path $OutputDirectory 'build\grouped.pptx')
if($LASTEXITCODE -ne 0){throw 'Grouping failed.'}
& $RuntimeNode (Join-Path $PSScriptRoot 'finalize.mjs') $OutputDirectory $PresentationsSkill $RuntimePython
if($LASTEXITCODE -ne 0){throw 'Final validation failed.'}
foreach($file in @('run_mn3sn.ps1','group_native.py','finalize.mjs','export_powerpoint.ps1','prepare_inputs.py')){
    Copy-Item -LiteralPath (Join-Path $PSScriptRoot $file) -Destination (Join-Path $OutputDirectory ('build\'+$file))
}
if(-not $SkipPowerPoint){
    & (Join-Path $PSScriptRoot 'export_powerpoint.ps1') -InputPptx (Join-Path $OutputDirectory 'figure.pptx') -OutputPng (Join-Path $OutputDirectory 'figure.png')
}
