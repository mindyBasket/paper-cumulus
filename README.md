An experimental visual novel delivery tool that has "animation" more in mind. A story will be told as if it is a flipbook, where there smallest unit is a short, few-framed animation. This is not intended to be a full blown animation tool. It's somewhere between an animatic and a storyboard. 

This project started out experimental and explorative in order to help me learn Django. 


## Setup 
1. For dev, set environment variable
(Unix)
```
$ export DJANGO_SETTINGS_MODULE = proj_cumulus.settings.local
```

(Windows)
```
C:\> set DJANGO_SETTINGS_MODULE = proj_cumulus.settings.local
```

2. Make env.json with secret key. You can generate a secret key online.


## Running this project 

1. Make sure you have Python 3 and the latest pip
2. Clone this project and start a virtual environment
```
virtualenn env --no-site-packages
(unix)$ source env/bin/activate
(windows) C:\> .\env\Scripts/activate
```
3. Once the virtual environment is running, install dependencies
```
$ pip install -r requirements.txt
C:\> python -m pip install -r requirements.txt
```
4. Make sure you can migrate without a problem
```
(python/py) manage.py migrate
```
5. Run
```
(python/py) py manage.py runserver
```