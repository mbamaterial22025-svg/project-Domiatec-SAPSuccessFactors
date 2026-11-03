@echo off
chcp 65001 > nul
echo ===================================================
echo  رفع المشروع إلى Google Firebase Hosting
echo ===================================================
echo.
echo 1. بناء واجهة الموقع...
call npm --prefix frontend run build
echo.
echo 2. تسجيل الدخول إلى حساب جوجل (سيفتح المتصفح لتسجيل الدخول)...
call npx --yes firebase-tools login
echo.
echo 3. جاري الرفع إلى استضافة Firebase السحابية...
call npx --yes firebase-tools deploy --only hosting
echo.
echo ===================================================
echo  تم الرفع بنجاح! مبروك موقعك الآن متاح على خوادم جوجل.
echo ===================================================
pause
