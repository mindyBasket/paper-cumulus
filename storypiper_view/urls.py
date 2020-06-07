from django.urls import path, re_path, include
from django.contrib import admin
from django.conf import settings
from django.conf.urls.static import static

from . import views as v

urlpatterns = [
    #note: "/" = "{proj}/piper"
    re_path(r'^$', v.playground.test, name='playground-test'),
]

if settings.DEBUG == True:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
