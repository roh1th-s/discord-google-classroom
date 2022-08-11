@echo off

if %1.==. goto NoArg
if not %1 == railway (
	if not %1 == heroku (
		echo Invalid platform
		exit /b
	)
)

mkdir deploy

xcopy src deploy\src\ /e /q /y > nul
xcopy data deploy\data\ /e /q /y > nul

copy deploy.config.json deploy\config.json > nul
copy token.json deploy\token.json > nul

copy package.json deploy\package.json > nul
copy package-lock.json deploy\package-lock.json > nul
copy tsconfig.json deploy\tsconfig.json > nul

echo Created deploy folder. Starting deploy now, do not delete it.

cd deploy

if %1% == railway (
:: link to railway project
railway link ac242619-76c7-4a4e-b0d8-f114d557af6d

:: deploy to railway
railway up 

) else (
	if %1% == heroku (
		heroku login
		
		git init
		heroku git:remote -a google-classroom-bot-1
		
		git add .
		git commit -am "make it better"
		git push heroku master	 
	)
)

:end
	cd ..
	:: delete deploy folder
	rm -r deploy
	exit /b

:NoArg
	echo Please mention the hosting platform.
	exit /b
	

