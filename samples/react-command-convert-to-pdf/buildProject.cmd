@echo off
cls

REM Ensure we are in the correct directory
pushd %~dp0

REM Clean the previous build artifacts
echo Cleaning previous build artifacts...
call gulp clean

REM Build the project in production mode
echo Building the project...
call gulp build --ship

REM Bundle the project resources for production
echo Bundling the project resources...
call gulp bundle --ship

REM Package the solution for deployment
echo Packaging the solution...
call gulp package-solution --ship

REM Open the solution folder in File Explorer
echo Opening the solution folder...
start "" explorer ".\sharepoint\solution\"

REM Return to the original directory
popd