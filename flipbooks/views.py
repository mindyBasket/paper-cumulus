# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from django.shortcuts import render, get_object_or_404
from django.views import generic

#import your models
from .models import (
        Scene,
        Strip,
        Frame
    )

# Create your views here.


class FrameDetailView(generic.DetailView):
    
    #I don't need this for detail view, do I?
    #queryset = Frame.objects.all()
    
    def get_object(self):
        #print("-------------output: ", self.kwargs)
        pk = self.kwargs.get("pk") # primary key
        return Frame.objects.get(id=pk)
        #return get_object_or_404(Chatter, id=pk)
    
    # NOT THE SAME AS ListView's get_context_data()
    def get_context_data(self, **kwargs):

        context = super(FrameDetailView, self).get_context_data(**kwargs)
        # Default contexts
        # - object, context_object_name
        
        return context
        
    
class FrameListView(generic.ListView):

    queryset = Frame.objects.all() 

    def get_context_data(self, *args, **kwargs):

        context = super(FrameListView, self).get_context_data(*args, **kwargs)
        # Default contexts
        # - object_list, is_paginated, paginator, page_obj
        
        #context['frame_image'] = self.frame_image #doesn't work like that
        # here, "self" = FrameListView, not the Frame object
        # think of this context like the stuff for the WHOLE view, not the individual model.
        return context
        

class SceneListView(generic.ListView):
    
    queryset = Scene.objects.all()
    

# This one "plays" the frames
class StripListView(generic.ListView):
    
    queryset = Strip.objects.all()
    queryset_scene = ""
    strip_json = {}
    #context_object_name = "strip_list"    # default is 'object_list' if you don't like that
    
    #Pagination for class-based view.
   #paginate_by = 1  # only need 1 strip per "page"
    

    def get_queryset(self):
        self.scene = get_object_or_404(Scene, pk=self.kwargs['scene_pk'])
        
        #if you need it to be more specific, use .filter(scene__order=1)
        
        self.queryset_scene = Strip.objects.filter(scene=self.scene)
        return self.queryset_scene
        
    # def get_context_data(self, *args, **kwargs):
    #     context = super(StripListView, self).get_context_data(*args, **kwargs)
    #     return context
        

# this might have to be separate function
def load_next_strip(request):
    
    # page = request.GET.get('page')
    # try:
    #     contacts = paginator.page(page)
    # except PageNotAnInteger:
    #     # If page is not an integer, deliver first page.
    #     contacts = paginator.page(1)
    # except EmptyPage:
    #     # If page is out of range (e.g. 9999), deliver last page of results.
    #    contacts = paginator.page(paginator.num_pages)
    pass
        