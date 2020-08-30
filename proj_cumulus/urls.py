"""proj_cumulus URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/1.9/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  url(r'^$', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  url(r'^$', Home.as_view(), name='home')
Including another URLconf
    1. Add an import:  from blog import urls as blog_urls
    2. Import the include() function: from django.conf.urls import url, include
    3. Add a URL to urlpatterns:  url(r'^blog/', include(blog_urls))
"""
from django.urls import path, re_path, include
from django.contrib import admin
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic.base import RedirectView
from django.views.decorators.csrf import csrf_exempt

from graphene_django.views import GraphQLView
from proj_cumulus.schema import schema

from . import views


urlpatterns = [
    path('admin/', admin.site.urls),

    # standalone homepage
    # re_path(r'^$', views.home, name='home'),
    # Using demo page for now!
    re_path(r'^$', views.home_demo, name='home'),

    # This doesn't work!
    # url(r'^.*$', RedirectView.as_view(url='flipbooks/chapter/0/', permanent=False), name='index'),

    # Flipbooks include
    # TODO: This is old now. Prepare to delete.
    path('flipbooks/', include(('flipbooks.urls','flipbooks'), namespace='flipbooks')),

    # frontend handler
    path('see/', include(('frontend.urls','frontend'), namespace='frontend' )),

    #restful api
    #serializer
    re_path(r'^api/', include(('flipbooks.api.urls','flipbooks'), namespace='flipbooks-api')),

    # STORYPIPER SPACE BELOW
    # view
    path('piper/', include(('storypiper.urls', 'storypiper'), namespace='storypiper')),

    #graphql, will replace RESTful api
    path('grphi/', csrf_exempt(GraphQLView.as_view(graphiql=True))),
]

if settings.DEBUG == True:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
