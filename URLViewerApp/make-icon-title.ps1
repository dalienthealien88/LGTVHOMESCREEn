param(
  [Parameter(Mandatory = $true)][string]$SourcePath,
  [Parameter(Mandatory = $true)][string]$OutputPath
)

Add-Type -AssemblyName System.Drawing
$bitmap = [System.Drawing.Bitmap]::FromFile($SourcePath)
$graphics = [System.Drawing.Graphics]::FromImage($bitmap)
$graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$graphics.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
$font = New-Object System.Drawing.Font('Georgia', 27, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
$path = New-Object System.Drawing.Drawing2D.GraphicsPath
$path.AddString('FlixTor', $font.FontFamily, [int]$font.Style, $font.Size, [System.Drawing.PointF]::new(0, 0), [System.Drawing.StringFormat]::GenericDefault)
$bounds = $path.GetBounds()
$matrix = New-Object System.Drawing.Drawing2D.Matrix
$matrix.Translate([single]((128 - $bounds.Width) / 2 - $bounds.X), [single]((128 - $bounds.Height) / 2 - $bounds.Y))
$path.Transform($matrix)
$outline = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(255, 0, 0, 0), 3)
$fill = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 244, 230, 196))
$graphics.DrawPath($outline, $path)
$graphics.FillPath($fill, $path)
$bitmap.Save($OutputPath, [System.Drawing.Imaging.ImageFormat]::Png)
$fill.Dispose()
$outline.Dispose()
$matrix.Dispose()
$path.Dispose()
$font.Dispose()
$graphics.Dispose()
$bitmap.Dispose()
