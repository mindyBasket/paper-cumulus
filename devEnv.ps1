Write-Host "-------------------------------------------------------"
Write-Host "--------- Running Django server in virtualenv ---------"
# Set-Variable -Name "desc" -Value "A description"
.\env\Scripts\activate.ps1
py manage.py runserver
