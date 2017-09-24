"""
Flipbooks URLs
"""
from django.conf.urls import url
from django.contrib import admin
from django.conf import settings
from django.conf.urls.static import static

from . import views

urlpatterns = [
    #note: "/" = "{proj}/flipbooks"
    
    # Scene CRUD
    url(r'^$', views.SceneListView.as_view(), name="home"),
    url(r'^scenes/$', views.SceneListView.as_view(), name="scene-list"),
    url(r'^scene/(?P<pk>\d+)/flip/$', views.SceneDetailView.as_view(), name='scene-detail'),
    
    # url(r'^search/$', views.ChatterListView.as_view(), name='list'),
    # url(r'^create/$', views.ChatterCreateView.as_view(), name='create'),
    #url(r'^(?P<pk>\d+)/$', views.StripListView.as_view(), name='detail'),
    # url(r'^(?P<pk>\d+)/update/$', views.ChatterUpdateView.as_view(), name='update'),
    # url(r'^(?P<pk>\d+)/delete/$', views.ChatterDeleteView.as_view(), name='delete'),
    
    url(r'^scene/(?P<scene_pk>\d+)/flip_old/$', views.StripListView.as_view(), name='strip-list'),
    #url(r'^objects/page(?P<page>[0-9]+)/$', PaginatedView.as_view()),
    
    # Strip CRUD
    url(r'^strips/create/$', views.StripCreateView.as_view(), name='strip-create'),
    url(r'^strips/(?P<pk>\d+)/update/$', views.StripUpdateView.as_view(), name='strip-update'),

    
    #ajax calls
    url(r'^ajax/load_more_strips/$', views.load_more_strips, name='load_more_strips'),
    url(r'^ajax/retrieve_scene__strip/$', views.retrieve_scene__strip, name='retrieve_scene__strip'),
]

if settings.DEBUG == True:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
