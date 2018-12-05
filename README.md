## About

This app makes shareable instances of "flipbook". It is somewhere between a movie and a storyboard. An instance of flipbook contain units of very short animations, but linked together they generate a story. It is an experimenal way to tell a story scenamatically but at low-cost.

This project started out experimental and explorative in order to help me learn Django and React. 


## Setup 

### Setup Python and Django
1. Make sure you have at least Python 3.2 and the latest pip
2. Clone this project and cd into repo folder
3. Make env.json with secret key for Django. You can generate a Django secret key online.
Example: 
    ```
    {
        "SECRET_KEY" : "{really long secret key}"
    }
    ```
4. Start a virtual environment
    ```
    (mac) $ source env/bin/activate
    (windows) C:\> .\env\Scripts\activate
    ```
5. Once the virtual environment is running, install dependencies
    ```
    $ pip install -r requirements.txt
    C:\> python -m pip install -r requirements.txt
    ```
6. Make sure you can migrate without a problem
    ```
    (python/py) manage.py migrate
    ```


### Setup NPM
This project does not run on node but npm is used to take advantage of npm packages as well as to compile scripts

1. Install latest [Node.js](https://nodejs.org/). Latest npm will come with it.
2. If you already installed it, update npm to latest: `npm install -g npm`
3. If you made any change to the scripts, compile 


### Setup Sass
This project compiles a single master .css (called `output.css`) using sass. Sass continuously watches a target folder and compiles output when changes are detected.

1. Setup Sass at section "Install Anywhere (Standalone)" at their [install page](https://sass-lang.com/install). Make sure you add Sass to your PATH variable.
2. cd into `static_storage/css_static/`.
3. Run sass: `sass --watch input.scss output.css`

## Running this project 

1. For dev, set environment variable
    ```
    (Max) $ export DJANGO_SETTINGS_MODULE = proj_cumulus.settings.local
    (Windows) C:\> set DJANGO_SETTINGS_MODULE = proj_cumulus.settings.local
    ```
2. Start virtural environment, if you have not started or exited: 
    ```
    (mac) $ source env/bin/activate
    (windows) C:\> .\env\Scripts\activate
    ```
3. Run django server!
    ```
    (python/py) manage.py runserver
    ```