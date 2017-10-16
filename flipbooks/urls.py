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
    
    # Flipbooks homepage
    # I don't have anything planned for flipbooks app's homepage. So it is set to
    # project homepage for now
    # url(r'^$', home, name='home'),
    
    # Book Urls
    url(r'^books/$', views.BookListView.as_view(), name='book-list'),
    
    # Chapter Urls
    url(r'^(?P<book_pk>\d+)/chapter/(?P<chapter_number>\d+)/$', views.ChapterDetailView.as_view(), name='chapter-detail'),
    
    # Scene Urls
    # url(r'^scenes/$', views.SceneListView.as_view(), name="scene-list"),
    url(r'^scene/(?P<pk>\d+)/flip/$', views.SceneDetailView.as_view(), name='scene-detail'),
    
    # url(r'^objects/page(?P<page>[0-9]+)/$', PaginatedView.as_view()),
    
    # Strip Urls
    url(r'^scene/(?P<scene_pk>\d+)/strip/create/$', views.StripCreateView.as_view(), name='strip-create'),
    url(r'^strips/(?P<pk>\d+)/update/$', views.StripUpdateView.as_view(), name='strip-update'),

    #ajax calls
    url(r'^ajax/load_more_strips/$', views.load_more_strips, name='load_more_strips'),
    url(r'^ajax/retrieve_scene__strip/$', views.retrieve_scene__strip, name='retrieve_scene__strip'),
]

if settings.DEBUG == True:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
