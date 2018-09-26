from django.urls import path, re_path, include
from django.conf.urls.static import static

from . import views
from flipbooks import views as fl_views

urlpatterns = [
    path('', views.index ),

    re_path(r'^(?P<book_pk>\d+)/(?P<chapter_number>\d+)/$', fl_views.ChapterDetailView2.as_view(), name='chapter-detail2'),
]
