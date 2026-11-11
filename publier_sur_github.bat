@echo off
chcp 65001 >nul
title Publication Portfolio vers GitHub — Baptiste Laffond
color 0F

echo ==============================================================================
echo    PORTFOLIO BAPTISTE LAFFOND — ENVOI AUTOMATIQUE VERS GITHUB
echo ==============================================================================
echo.

cd /d "%~dp0"

echo [1/4] Configuration du depot GitHub cible...
git remote get-url origin >nul 2>&1
if %ERRORLEVEL% equ 0 (
    git remote set-url origin https://github.com/Baptiste-archerDev/Portfolio.git
) else (
    git remote add origin https://github.com/Baptiste-archerDev/Portfolio.git
)
git branch -M main >nul 2>&1
echo     Depot configure : https://github.com/Baptiste-archerDev/Portfolio.git
echo.

echo [2/4] Indexation des fichiers du portfolio...
git add .
git commit -m "Mise a jour Portfolio Baptiste Laffond" >nul 2>&1
echo     Fichiers du portfolio prets.
echo.

echo [3/4] Synchronisation avec le depot distant...
git fetch origin main >nul 2>&1
if %ERRORLEVEL% equ 0 (
    git merge -s ours --allow-unrelated-histories --no-edit origin/main >nul 2>&1
)
echo     Historique synchronise.
echo.

echo [4/4] Envoi des fichiers en cours vers GitHub...
echo     (Si une fenetre de navigateur s'ouvre, cliquez sur "Authorize" ou "Sign in")
echo.

git push -u origin main

if %ERRORLEVEL% equ 0 (
    echo.
    echo ==============================================================================
    echo    SUCCES ! Votre portfolio est maintenant en ligne sur GitHub !
    echo ==============================================================================
    echo.
    echo Votre depot : https://github.com/Baptiste-archerDev/Portfolio
    echo.
    echo Pour activer l'hebergement public gratuit GitHub Pages :
    echo   1. Rendez-vous sur : https://github.com/Baptiste-archerDev/Portfolio/settings/pages
    echo   2. Dans 'Source', selectionnez la branche 'main' et dossier '/(root)', puis cliquez sur 'Save'
    echo.
    echo Votre site sera en ligne a l'adresse :
    echo   https://baptiste-archerdev.github.io/Portfolio/
    echo.
) else (
    echo.
    echo ==============================================================================
    echo    ATTENTION : L'envoi n'a pas pu aboutir.
    echo ==============================================================================
    echo.
    echo Verifications :
    echo   1. Le depot https://github.com/Baptiste-archerDev/Portfolio
    echo      doit bien exister sur votre compte GitHub.
    echo   2. Si GitHub demande une autorisation de connexion dans votre navigateur,
    echo      cliquez sur 'Authorize'.
    echo.
)

pause
