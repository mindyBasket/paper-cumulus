from .base import *

DEBUG = False
IS_PRODUCTION = True
'''
Production Test Setting:
Static and Media files are served from S3, but database is 
still using local sqlite3 because PostGres is yet to setup.

'''


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

# Collect static from this:
STATICFILES_DIRS = [
    os.path.join(BASE_DIR, "static-storage"),
]

AWS_ACCESS_KEY_ID = 'AKIAI5KMEL743A54GC2Q'
AWS_SECRET_ACCESS_KEY = '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'
AWS_STORAGE_BUCKET_NAME = 'paper-cumulus-s3'
AWS_S3_CUSTOM_DOMAIN = '%s.s3.amazonaws.com' % AWS_STORAGE_BUCKET_NAME
AWS_S3_OBJECT_PARAMETERS = {
    'CacheControl': 'max-age=86400',
}

AWS_QUERYSTRING_AUTH = False
# UserWarning: The default behavior of S3Boto3Storage is insecure and will change in 
# django-storages 2.0. By default files and new buckets are saved with an ACL of 
# 'public-read' (globally publicly readable). Version 2.0 will default to using 
# the bucket's ACL. To opt into the new behavior set AWS_DEFAULT_ACL = None, 
# otherwise to silence this warning explicitly set AWS_DEFAULT_ACL.
AWS_DEFAULT_ACL = 'bucket-owner-full-control'

# AWS_LOCATION = 'static' # see below

# Static stuff
STATICFILES_LOCATION = 'static'
STATIC_URL = 'https://%s/%s/' % (AWS_S3_CUSTOM_DOMAIN, STATICFILES_LOCATION)
#STATICFILES_STORAGE = 'storages.backends.s3boto3.S3Boto3Storage'
STATICFILES_STORAGE = 'proj_cumulus.settings.media_backends.StaticStorage'

# Media stuff
MEDIAFILES_LOCATION = 'media'
MEDIA_URL = "https://%s/%s/" % (AWS_S3_CUSTOM_DOMAIN, MEDIAFILES_LOCATION)
DEFAULT_FILE_STORAGE = 'proj_cumulus.settings.media_backends.MediaStorage'
THUMBNAIL_DEFAULT_STORAGE = 'proj_cumulus.settings.media_backends.MediaStorage'
