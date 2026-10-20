param(
    [Parameter(Mandatory=$true)][string]$InputPptx,
    [Parameter(Mandatory=$true)][string]$OutputPng,
    [int]$Width=2400,
    [int]$Height=1500
)
$ErrorActionPreference='Stop'
$deckPath=(Resolve-Path -LiteralPath $InputPptx).Path
$pngPath=[IO.Path]::GetFullPath($OutputPng)
$app=$null
$deck=$null
try {
    $app=New-Object -ComObject PowerPoint.Application
    # Open the deck read-only with no presentation window.
    $deck=$app.Presentations.Open($deckPath,-1,0,0)
    $deck.Slides.Item(1).Export($pngPath,'PNG',$Width,$Height)
    if(-not (Test-Path -LiteralPath $pngPath)){throw 'PowerPoint did not produce the preview.'}
    Write-Output $pngPath
} finally {
    if($null -ne $deck){$deck.Close();[void][Runtime.InteropServices.Marshal]::ReleaseComObject($deck)}
    # Do not quit the shared PowerPoint application: the user may have other decks open.
    if($null -ne $app){[void][Runtime.InteropServices.Marshal]::ReleaseComObject($app)}
}
