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
    
    url(r'^$', views.SceneListView.as_view(), name="list"),
    
    # url(r'^search/$', views.ChatterListView.as_view(), name='list'),
    # url(r'^create/$', views.ChatterCreateView.as_view(), name='create'),
    url(r'^(?P<pk>\d+)/$', views.FrameDetailView.as_view(), name='detail'),
    # url(r'^(?P<pk>\d+)/update/$', views.ChatterUpdateView.as_view(), name='update'),
    # url(r'^(?P<pk>\d+)/delete/$', views.ChatterDeleteView.as_view(), name='delete'),
]

if settings.DEBUG == True:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
