!macro customInstall
  WriteRegStr SHCTX "SOFTWARE\RegisteredApplications" "Weaver" "Software\Clients\StartMenuInternet\Weaver\Capabilities"
  WriteRegStr SHCTX "SOFTWARE\Clients\StartMenuInternet\Weaver\Capabilities\StartMenu" "StartMenuInternet" "Weaver"
  WriteRegStr SHCTX "SOFTWARE\Clients\StartMenuInternet\Weaver" "" "Weaver"
  WriteRegStr SHCTX "SOFTWARE\Clients\StartMenuInternet\Weaver\Capabilities" "ApplicationDescription" "A privacy-focused, extensible and beautiful web browser"
  WriteRegStr SHCTX "SOFTWARE\Clients\StartMenuInternet\Weaver\Capabilities" "ApplicationName" "Weaver"
  WriteRegDWORD SHCTX "SOFTWARE\Clients\StartMenuInternet\Weaver\InstallInfo" "IconsVisible" 1
  WriteRegStr SHCTX "SOFTWARE\Clients\StartMenuInternet\Weaver\shell\open\command" "" "$0\Weaver.exe"
  WriteRegStr HKCU "SOFTWARE\Classes\BraveBetaHTML\shell\open\command" "" '"$0\Weaver.exe" -- "%1"'
  WriteRegStr SHCTX "SOFTWARE\Clients\StartMenuInternet\BraveBeta\Capabilities\URLAssociations" "http" "Weaver"
!macroend
!macro customUnInstall
  DeleteRegKey HKCU "SOFTWARE\Classes\Weaver"
  DeleteRegKey SHCTX "SOFTWARE\Clients\StartMenuInternet\Weaver"
  DeleteRegValue SHCTX "SOFTWARE\RegisteredApplications" "Weaver"
!macroend
