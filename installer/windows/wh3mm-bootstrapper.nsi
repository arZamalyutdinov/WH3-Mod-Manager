Unicode True

!include "MUI2.nsh"
!include "LogicLib.nsh"

!ifndef APP_NAME
!define APP_NAME "WH3 Mod Manager"
!endif

!ifndef APP_EXE_NAME
!define APP_EXE_NAME "wh3mm.exe"
!endif

!ifndef APP_ID
!define APP_ID "WH3MM"
!endif

!ifndef APP_PUBLISHER
!define APP_PUBLISHER "WH3 Mod Manager"
!endif

!ifndef APP_VERSION
!error "APP_VERSION is required. Example: /DAPP_VERSION=2.17.8"
!endif

!ifndef RELEASE_TAG
!error "RELEASE_TAG is required. Example: /DRELEASE_TAG=v2.17.8"
!endif

!ifndef RELEASE_REPOSITORY
!error "RELEASE_REPOSITORY is required. Example: /DRELEASE_REPOSITORY=owner/repo"
!endif

!ifndef RELEASE_ZIP_ASSET
!error "RELEASE_ZIP_ASSET is required. Example: /DRELEASE_ZIP_ASSET=wh3mm-win32-x64-2.17.8.zip"
!endif

!ifndef OUT_FILE
!define OUT_FILE "out/installer/WH3MM-Installer-${RELEASE_TAG}.exe"
!endif

!define MUI_ICON "..\..\src\assets\modmanager.ico"
!define MUI_UNICON "..\..\src\assets\modmanager.ico"

Name "${APP_NAME} ${APP_VERSION}"
OutFile "${OUT_FILE}"
InstallDir "$LOCALAPPDATA\Programs\${APP_NAME}"
InstallDirRegKey HKCU "Software\${APP_ID}" "InstallDir"
RequestExecutionLevel user
ShowInstDetails show
ShowUninstDetails show
BrandingText "${APP_NAME}"

Var TempDir
Var ZipPath
Var StagingDir
Var DownloadUrl

!define MUI_ABORTWARNING

!insertmacro MUI_PAGE_WELCOME
!insertmacro MUI_PAGE_COMPONENTS
!insertmacro MUI_PAGE_DIRECTORY
!insertmacro MUI_PAGE_INSTFILES
!insertmacro MUI_PAGE_FINISH

!insertmacro MUI_UNPAGE_CONFIRM
!insertmacro MUI_UNPAGE_INSTFILES
!insertmacro MUI_UNPAGE_FINISH

!insertmacro MUI_LANGUAGE "English"

Section "Application Files (Required)" SecCore
  SectionIn RO
  SetShellVarContext current

  StrCpy $DownloadUrl "https://github.com/${RELEASE_REPOSITORY}/releases/download/${RELEASE_TAG}/${RELEASE_ZIP_ASSET}"
  StrCpy $TempDir "$TEMP\wh3mm-installer-${APP_VERSION}"
  StrCpy $ZipPath "$TempDir\wh3mm.zip"
  StrCpy $StagingDir "$TempDir\staging"

  RMDir /r "$TempDir"
  CreateDirectory "$TempDir"
  CreateDirectory "$StagingDir"
  CreateDirectory "$INSTDIR"

  DetailPrint "Downloading package archive..."
  DetailPrint "$DownloadUrl"
  nsExec::ExecToStack '"$SYSDIR\WindowsPowerShell\v1.0\powershell.exe" -NoProfile -ExecutionPolicy Bypass -Command "& { $$ErrorActionPreference = ''Stop''; [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; $$url = ''$DownloadUrl''; $$dest = ''$ZipPath''; Invoke-WebRequest -Uri $$url -OutFile $$dest -UseBasicParsing }"'
  Pop $0
  Pop $1
  ${If} $0 != 0
    MessageBox MB_ICONSTOP|MB_OK "Failed to download release archive.$\r$\n$\r$\n$1"
    Abort
  ${EndIf}

  DetailPrint "Extracting package archive..."
  nsExec::ExecToStack '"$SYSDIR\WindowsPowerShell\v1.0\powershell.exe" -NoProfile -ExecutionPolicy Bypass -Command "& { $$ErrorActionPreference = ''Stop''; $$zip = ''$ZipPath''; $$staging = ''$StagingDir''; $$dest = ''$INSTDIR''; if (Test-Path -LiteralPath $$staging) { Remove-Item -LiteralPath $$staging -Recurse -Force }; New-Item -ItemType Directory -Path $$staging -Force | Out-Null; Expand-Archive -LiteralPath $$zip -DestinationPath $$staging -Force; $$items = Get-ChildItem -LiteralPath $$staging; if ($$items.Count -eq 1 -and $$items[0].PSIsContainer) { $$source = $$items[0].FullName } else { $$source = $$staging }; New-Item -ItemType Directory -Path $$dest -Force | Out-Null; Copy-Item -Path (Join-Path $$source ''*'') -Destination $$dest -Recurse -Force }"'
  Pop $0
  Pop $1
  ${If} $0 != 0
    MessageBox MB_ICONSTOP|MB_OK "Failed to extract release archive.$\r$\n$\r$\n$1"
    Abort
  ${EndIf}

  IfFileExists "$INSTDIR\${APP_EXE_NAME}" +3 0
  MessageBox MB_ICONSTOP|MB_OK "Installed package is missing ${APP_EXE_NAME}. Installation cannot continue."
  Abort

  WriteUninstaller "$INSTDIR\Uninstall ${APP_NAME}.exe"

  WriteRegStr HKCU "Software\${APP_ID}" "InstallDir" "$INSTDIR"
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APP_ID}" "DisplayName" "${APP_NAME}"
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APP_ID}" "DisplayVersion" "${APP_VERSION}"
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APP_ID}" "Publisher" "${APP_PUBLISHER}"
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APP_ID}" "InstallLocation" "$INSTDIR"
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APP_ID}" "DisplayIcon" "$INSTDIR\${APP_EXE_NAME}"
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APP_ID}" "UninstallString" '"$INSTDIR\Uninstall ${APP_NAME}.exe"'
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APP_ID}" "QuietUninstallString" '"$INSTDIR\Uninstall ${APP_NAME}.exe" /S'
  WriteRegDWORD HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APP_ID}" "NoModify" 1
  WriteRegDWORD HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APP_ID}" "NoRepair" 1

  RMDir /r "$TempDir"
SectionEnd

Section "Desktop Shortcut" SecDesktopShortcut
  SetShellVarContext current
  CreateShortCut "$DESKTOP\${APP_NAME}.lnk" "$INSTDIR\${APP_EXE_NAME}" "" "$INSTDIR\${APP_EXE_NAME}" 0
SectionEnd

Section "Start Menu Shortcuts" SecStartMenuShortcut
  SetShellVarContext current
  CreateDirectory "$SMPROGRAMS\${APP_NAME}"
  CreateShortCut "$SMPROGRAMS\${APP_NAME}\${APP_NAME}.lnk" "$INSTDIR\${APP_EXE_NAME}" "" "$INSTDIR\${APP_EXE_NAME}" 0
  CreateShortCut "$SMPROGRAMS\${APP_NAME}\Uninstall ${APP_NAME}.lnk" "$INSTDIR\Uninstall ${APP_NAME}.exe"
SectionEnd

!insertmacro MUI_FUNCTION_DESCRIPTION_BEGIN
  !insertmacro MUI_DESCRIPTION_TEXT ${SecCore} "Downloads and installs the selected release version."
  !insertmacro MUI_DESCRIPTION_TEXT ${SecDesktopShortcut} "Create a desktop shortcut for quick launch."
  !insertmacro MUI_DESCRIPTION_TEXT ${SecStartMenuShortcut} "Add Start menu entries for launch and uninstallation."
!insertmacro MUI_FUNCTION_DESCRIPTION_END

Section "Uninstall"
  SetShellVarContext current

  Delete "$DESKTOP\${APP_NAME}.lnk"
  Delete "$SMPROGRAMS\${APP_NAME}\${APP_NAME}.lnk"
  Delete "$SMPROGRAMS\${APP_NAME}\Uninstall ${APP_NAME}.lnk"
  RMDir "$SMPROGRAMS\${APP_NAME}"

  Delete "$INSTDIR\Uninstall ${APP_NAME}.exe"
  RMDir /r "$INSTDIR"

  DeleteRegKey HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APP_ID}"
  DeleteRegKey HKCU "Software\${APP_ID}"
SectionEnd

