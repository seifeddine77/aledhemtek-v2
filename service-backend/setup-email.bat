@echo off
echo Configuration de l'email pour AledhemTek
echo.
echo IMPORTANT: Vous devez configurer un compte Gmail avec un mot de passe d'application
echo.
echo 1. Allez sur https://myaccount.google.com/security
echo 2. Activez la verification en 2 etapes
echo 3. Generez un mot de passe d'application pour "Mail"
echo 4. Utilisez ce mot de passe (pas votre mot de passe Gmail normal)
echo.

set /p EMAIL_USERNAME="Entrez votre adresse Gmail: "
set /p EMAIL_PASSWORD="Entrez votre mot de passe d'application Gmail: "

echo.
echo Configuration des variables d'environnement...
setx EMAIL_USERNAME "%EMAIL_USERNAME%"
setx EMAIL_PASSWORD "%EMAIL_PASSWORD%"

echo.
echo Variables configurees:
echo EMAIL_USERNAME=%EMAIL_USERNAME%
echo EMAIL_PASSWORD=[MASQUE]
echo.
echo IMPORTANT: Redemarrez votre terminal/IDE pour que les variables prennent effet.
echo Puis redemarrez le serveur backend.
echo.
pause
