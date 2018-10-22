from .base import *

# SECURITY WARNING: keep the secret key used in production secret!
# SECRET_KEY = '$k3(_qgf48hzeddm(fw-8^aj1pk%u0l%w8sa2&kzpyr$ufjj8@'

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True


# Additional apps for local dev
# INSTALLED_APPS += []
#         'debug_toolbar',
# ]


# Database
# https://docs.djangoproject.com/en/1.9/ref/settings/#databases

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': os.path.join(BASE_DIR, 'db.sqlite3'),
    }
}



# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/1.9/howto/static-files/

STATIC_URL = '/static/'

# Storage and serves

# If /static/ above doesn't exist, it will look at the following paths.
# Wait...this IS served directly when I run this app.
# When production, static files are collected from here. 
STATICFILES_DIRS = [ 
    os.path.join(BASE_DIR, "static-storage"),
    #'/var/www/static/'
]

#Is served from (or collectStatic'd into)
STATIC_ROOT = os.path.join(BASE_DIR, "static-serve")


# Uploaded Media
# https://docs.djangoproject.com/en/1.11/howto/static-files/#serving-files-uploaded-by-a-user-during-development
MEDIA_URL = "/media/"
MEDIA_ROOT = os.path.join(BASE_DIR, "media")