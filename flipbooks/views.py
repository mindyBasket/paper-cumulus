# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.shortcuts import render
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
        
        context["extra"] = "Kiefer"

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


class StripListView(generic.ListView):
    
    queryset = Strip.objects.all()
    