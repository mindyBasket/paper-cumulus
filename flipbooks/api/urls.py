"""
API URLs
"""
from django.conf.urls import url

from . import views

urlpatterns = [
    #note: "/" = "{proj}/flipbooks/api"

    url(r'^$', views.FlipbookAPIListView.as_view(), name="list"), 

]
