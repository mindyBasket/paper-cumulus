# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.http import JsonResponse
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from django.shortcuts import render, get_object_or_404
from django.views import generic

from easy_thumbnails.files import get_thumbnailer

#import your models
from .models import (
        Scene,
        Strip,
        Frame
    )
    
from . import forms





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
    
    queryset = Scene.objects.order_by('order')


# .................................................. 
# .................................................. 
#                   Strip Views
# .................................................. 
# .................................................. 

class StripCreateView(generic.CreateView):
    
    template_name = "flipbooks/strip_create.html"
    form_class = forms.StripCreateForm
    #login_url = '/admin/'
    success_url = "/flipbooks/"
    

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
        


def load_more_strips(request):
    #username = request.GET.get('username', None)
    scene_order = request.GET.get('scene_order', None)
    strip_set_of_scene = Strip.objects.filter(scene__order=scene_order)
    
    #now...how to find the "next set" of strips to be loaded? 
    #Currently, I've loaded 3 strips arbitrarily, I can load another 3 set. 
    
    #do you know how many sets has been loaded? hard coded for now
    num_stripset_loaded = int(request.GET.get('num_stripset_loaded', None))
    
    #extract information
    num_stripset_limit = num_stripset_loaded + 3
    
    strip_set_to_load = strip_set_of_scene[num_stripset_loaded:num_stripset_limit]
    #note: https://docs.python.org/2/tutorial/introduction.html#strings
    #      degenerate slice indices are handled nice and safe.
    
    strip_set_str_li = [];
    for strip in strip_set_to_load:
        for frame in strip.frame_set.all():
            strip_set_str_li+=[frame.frame_image.url]
            
    data = {
        #'is_taken': User.objects.filter(username__iexact=username).exists()
        'response_test_val':strip_set_str_li
    }
    return JsonResponse(data)


def retrieve_scene__strip(request):
    
    # extract incoming param from request
    scene_id = request.GET.get('scene_id', None)
    strip_set_of_scene = Strip.objects.filter(scene__id=scene_id)
    
    #send responses as Json
    strip_set_str_li = [];
    strip_set_frame_li = [];
    for strip in strip_set_of_scene:
        strip_set_str_li+=[strip.id]
        
        # Get first frame of each strip. 
        # Extract thumbnail instead of default frame_image.url
        # strip_set_frame_li+=[strip.frame_set.all()[0].frame_image.cell.url]
        if strip.frame_set.all():
            strip_set_frame_li+=[strip.frame_set.all()[0].frame_image['cell'].url]

    data = {
        #'is_taken': User.objects.filter(username__iexact=username).exists()
        'strip_ids':strip_set_str_li,
        "strip_frames": strip_set_frame_li
    }
    return JsonResponse(data)
    
    
    