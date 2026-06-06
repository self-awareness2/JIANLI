@echo off
setlocal
set "ROOT=%~dp0"
set "SERVER_DIR=%ROOT%server"
set "CLIENT_DIR=%ROOT%client"

echo === Initializing Database ===
pushd "%SERVER_DIR%"
call npx prisma generate
call npx prisma db push
popd

echo === Starting Server ===
start "Jiangxin-Jianli-Server" /D "%SERVER_DIR%" cmd /k "node --watch src/index.js"

echo === Starting Client ===
start "Jiangxin-Jianli-Client" /D "%CLIENT_DIR%" cmd /k "npx vite"

echo === Done! Open http://localhost:5173 ===
pause
