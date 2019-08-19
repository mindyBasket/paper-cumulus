from .base import *
import psycopg2 # connect to PostGres
import dj_database_url # parse PostGres

DEBUG = False
USE_S3 = True

# Ignore CONFIGS, which is based on local file
print("[HEROKU DEV] Will ignore CONFIG file")

# Connect to Database
DATABASE_URL = os.environ['DATABASE_URL'] # dev postgres
conn = psycopg2.connect(DATABASE_URL, sslmode='require')

# Parse Database
DATABASES = {
    'default': dj_database_url.config(conn_max_age=600, ssl_require=True)
}


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/1.9/howto/static-files/

# Collect static from this:
STATICFILES_DIRS = [
    os.path.join(BASE_DIR, "static-storage"),
]

# ACCESS_KEY_ID = ''
# SECRET_ACCESS_KEY = ''
AWS_STORAGE_BUCKET_NAME = 'paper-cumulus-dev-s3'
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


# Map static
# ref: https://stackoverflow.com/questions/30624104/django-on-amazon-web-service-aws
# STATIC_ROOT = os.path.join(BASE_DIR, '..','static')
