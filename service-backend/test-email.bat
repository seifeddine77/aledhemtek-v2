@echo off
echo Test de configuration email AledhemTek
echo.

echo Verification des variables d'environnement:
echo EMAIL_USERNAME=%EMAIL_USERNAME%
if "%EMAIL_USERNAME%"=="" (
    echo ERREUR: EMAIL_USERNAME n'est pas defini
    echo Executez setup-email.bat d'abord
    pause
    exit /b 1
)

if "%EMAIL_PASSWORD%"=="" (
    echo ERREUR: EMAIL_PASSWORD n'est pas defini
    echo Executez setup-email.bat d'abord
    pause
    exit /b 1
) else (
    echo EMAIL_PASSWORD=[DEFINI]
)

echo.
echo Variables configurees correctement !
echo.
echo Pour tester l'envoi d'email:
echo 1. Demarrez le serveur backend
echo 2. Completez une reservation dans l'interface
echo 3. Changez son statut a "COMPLETED"
echo 4. Verifiez les logs du serveur pour:
echo    - "Auto-generated invoice [NUMERO] for completed reservation [ID]"
echo    - "Invoice email sent successfully to: [EMAIL]"
echo.
echo Si l'email n'est pas recu:
echo - Verifiez les spams
echo - Verifiez que le mot de passe d'application est correct
echo - Verifiez les logs d'erreur du serveur
echo.
pause
