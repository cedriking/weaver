!macro customInstall
  WriteRegStr SHCTX "SOFTWARE\RegisteredApplications" "Arweave" "Software\Clients\StartMenuInternet\Arweave\Capabilities"
  WriteRegStr SHCTX "SOFTWARE\Clients\StartMenuInternet\Arweave\Capabilities\StartMenu" "StartMenuInternet" "Arweave"
  WriteRegStr SHCTX "SOFTWARE\Clients\StartMenuInternet\Arweave" "" "Arweave"
  WriteRegStr SHCTX "SOFTWARE\Clients\StartMenuInternet\Arweave\Capabilities" "ApplicationDescription" "A privacy-focused, extensible and beautiful web browser"
  WriteRegStr SHCTX "SOFTWARE\Clients\StartMenuInternet\Arweave\Capabilities" "ApplicationName" "Arweave"
  WriteRegDWORD SHCTX "SOFTWARE\Clients\StartMenuInternet\Arweave\InstallInfo" "IconsVisible" 1
  WriteRegStr SHCTX "SOFTWARE\Clients\StartMenuInternet\Arweave\shell\open\command" "" "$0\Arweave.exe"
  WriteRegStr HKCU "SOFTWARE\Classes\BraveBetaHTML\shell\open\command" "" '"$0\Arweave.exe" -- "%1"'
  WriteRegStr SHCTX "SOFTWARE\Clients\StartMenuInternet\BraveBeta\Capabilities\URLAssociations" "http" "Arweave"
!macroend
!macro customUnInstall
  DeleteRegKey HKCU "SOFTWARE\Classes\Arweave"
  DeleteRegKey SHCTX "SOFTWARE\Clients\StartMenuInternet\Arweave"
  DeleteRegValue SHCTX "SOFTWARE\RegisteredApplications" "Arweave"
!macroend
