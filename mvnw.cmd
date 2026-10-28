@echo off
setlocal
set "MAVEN_VERSION=3.9.11"
set "MAVEN_HOME=%USERPROFILE%\.m2\jobtracker-maven\apache-maven-%MAVEN_VERSION%"
set "MAVEN_ZIP=%USERPROFILE%\.m2\jobtracker-maven\apache-maven-%MAVEN_VERSION%-bin.zip"
if exist "%MAVEN_HOME%\bin\mvn.cmd" goto runmaven
if not exist "%USERPROFILE%\.m2\jobtracker-maven" mkdir "%USERPROFILE%\.m2\jobtracker-maven"
echo First run: downloading Apache Maven %MAVEN_VERSION% (internet required)...
powershell -NoProfile -ExecutionPolicy Bypass -Command "$ProgressPreference='SilentlyContinue'; Invoke-WebRequest -Uri 'https://repo.maven.apache.org/maven2/org/apache/maven/apache-maven/%MAVEN_VERSION%/apache-maven-%MAVEN_VERSION%-bin.zip' -OutFile '%MAVEN_ZIP%'; Expand-Archive -LiteralPath '%MAVEN_ZIP%' -DestinationPath '%USERPROFILE%\.m2\jobtracker-maven' -Force"
if errorlevel 1 (
  echo Maven download failed. Check your internet connection and try again.
  exit /b 1
)
:runmaven
call "%MAVEN_HOME%\bin\mvn.cmd" %*
exit /b %ERRORLEVEL%
