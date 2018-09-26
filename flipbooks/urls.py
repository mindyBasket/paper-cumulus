"""
Flipbooks URLs
"""
# from django.conf.urls import url # depreciated
from django.urls import path, re_path, include
from django.contrib import admin
from django.conf import settings
from django.conf.urls.static import static

from . import views
from . import views_jsonpr

urlpatterns = [
    #note: "/" = "{proj}/flipbooks"
    
    # Flipbooks homepage
    # I don't have anything planned for flipbooks app's homepage. So it is set to
    # project homepage for now
    # url(r'^$', home, name='home'),

    # React frontend 
    path('', include(('frontend.urls','frontend'), namespace='frontend' )),


    # Book Urls
    path('books/', views.BookListView.as_view(), name='book-list'),
    
    # Chapter Urls
    re_path(r'^(?P<book_pk>\d+)/chapter/(?P<chapter_number>\d+)/$', views.ChapterDetailView.as_view(), name='chapter-detail'),
    

    # Scene Urls
    # url(r'^scenes/$', views.SceneListView.as_view(), name="scene-list"),
    re_path(r'^scene/(?P<pk>\d+)/flip/$', views.ScenePlayView.as_view(), name='scene-play'), #play!
    re_path(r'^scene/(?P<pk>\d+)/$', views.SceneDetailView.as_view(), name='scene-detail'),
    
    # Strip Urls
    re_path(r'^scene/(?P<scene_pk>\d+)/strip/create/$', views.StripCreateView.as_view(), name='strip-create'),
    re_path(r'^strip/(?P<pk>\d+)/update/$', views.StripUpdateView.as_view(), name='strip-update'),
    re_path(r'^strip/(?P<pk>\d+)/delete/$', views.strip_delete, name='strip-delete'), #function view
    
    # Frame Urls
    re_path(r'^strip/(?P<strip_pk>\d+)/frame/create/$', views.FrameCreateView.as_view(), name='frame-create'),
    re_path(r'^frame/(?P<pk>\d+)/update/$', views.FrameUpdateView.as_view(), name='frame-update'),
    re_path(r'^frame/(?P<pk>\d+)/delete/$', views.frame_delete, name='frame-delete'), #function view

    #ajax calls
    re_path(r'^ajax/spawn/create_scene/(?P<scene_pk>\d+)/$', views.spawn_create_scene, name='spawn__create_scene'), 
    re_path(r'^ajax/load_more_strips/$', views.load_more_strips, name='load_more_strips'),
    re_path(r'^ajax/retrieve_scene__strip/$', views.retrieve_scene__strip, name='retrieve_scene__strip'),
    re_path(r'^ajax/strips/(?P<pk>\d+)/sort-children/$', views.sort_children, name='strip-sort-children'),
    
    # returns json objects
    re_path(r'^json_partials/strip_container/(?P<pk>\d+)/$', views_jsonpr.return_strip_container_tmplt, name='json_partial__strip_container'), 
    re_path(r'^json_partials/frame_edit_form/(?P<pk>\d+)/$', views_jsonpr.return_frame_edit_form, name='json_partial__frame_edit_form'), 
    re_path(r'^json_partials/frame_container/empty/$',       views_jsonpr.return_empty_thumbnail_partial, name='json_partial__empty_thumb_container'), 
    re_path(r'^json_partials/frame_container/(?P<pk>\d+)/$', views_jsonpr.return_thumbnail_partial, name='json_partial__frame_thumb_container'), 
]

if settings.DEBUG == True:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
