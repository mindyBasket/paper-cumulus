"""
API URLs
"""
from django.conf.urls import url

from . import views

urlpatterns = [
    #note: "/" = "{base url}/api/"
    
    url(r'^$', views.FlipbookAPIListView.as_view(), name="list"), 
    
    #url(r'^api/book/(?P<pk>\d+)/', include('flipbooks.api.urls', namespace='api-get-book'))
    url(r'^book/all/$', views.FlipbookAPIListView.as_view(), name="list-book"),
    
    # Seems to use "pk" as default argument
    url(r'^scene/(?P<pk>\d+)/$', views.SceneAPIDetailView.as_view(), name="detail-scene"),
    url(r'^scene/(?P<pk>\d+)/strip/create/$', views.StripCreateAPIView.as_view(), name="create-strip-under-scene"),
    
    url(r'^strip/(?P<pk>\d+)/frame/create/$', views.FrameCreateAPIView.as_view(), name="create-frame-under-strip"),
    
    url(r'^frame/(?P<pk>\d+)/$', views.FrameDetailAPIView.as_view(), name="detail-frame"),
    url(r'^frame/(?P<pk>\d+)/update/$', views.FrameUpdateAPIView.as_view(), name="update-frame")
]
