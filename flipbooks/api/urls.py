"""
API URLs
"""
from django.conf.urls import url

from . import views

urlpatterns = [
    #note: "/" = "{base url}/api/"

    url(r'^$', views.FlipbookAPIListView.as_view(), name="list"), 
    
    #url(r'^api/book/(?P<pk>\d+)/', include('flipbooks.api.urls', namespace='api-get-book'))
    url(r'^book/all', views.FlipbookAPIListView.as_view(), name="list-book")

]
