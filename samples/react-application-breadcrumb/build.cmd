call cls

call gulp clean

call gulp build

call gulp bundle --ship

call gulp package-solution --ship

call explorer .\sharepoint\solution