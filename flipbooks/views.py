# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.http import JsonResponse
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from django.shortcuts import render, get_object_or_404
from django.core.urlresolvers import reverse_lazy
from django.views import generic

from django.contrib import messages
from django.contrib.messages.views import SuccessMessageMixin

from django.contrib import messages


from easy_thumbnails.files import get_thumbnailer

#import your models
from .models import (
        Book,
        Chapter,
        Scene,
        Strip,
        Frame
    )
    
from . import forms

#custom helper functions 
from .helpermodule import helpers





    



# .................................................. 
# .................................................. 
#                  Chapter Views
# .................................................. 
# .................................................. 

# Previously "SceneListView"
class ChapterDetailView(generic.TemplateView):
    # NOTE: the reason this is using TemplateView instead of DetailView
    #       is because this not retrieving chapter by pk but instead
    #       by its number property
    
    model = Chapter
    
    queryset = Chapter.objects.all()
    template_name = "flipbooks/chapter_detail.html"
    
    def get_context_data(self, *args, **kwargs):

        context = super(ChapterDetailView, self).get_context_data(*args, **kwargs)
        
        # TODO: should also take its Book number into account.
        #       Chapter number is not unique!
        context['object'] = Chapter.objects.filter(number=kwargs['number'])[0]
    
        print("*--------------Get scene set {}".format(context['object'].scene_set.all()))
        
        
        
        return context

# .................................................. 
# .................................................. 
#                   Scene Views
# .................................................. 
# .................................................. 
        
class SceneListView(generic.ListView):
    
    queryset = Scene.objects.order_by('order')
    
    def get_context_data(self, *args, **kwargs):

        context = super(SceneListView, self).get_context_data(*args, **kwargs)
        # Default contexts
        # - object_list, is_paginated, paginator, page_obj

        # Check what's in context like this
        # print("------------{}".format(context))
        
        # Convert children_orders to iterable list, or mark it with "False"
        valid_children_orders = []
        for obj in context['object_list']:
            if obj.children_orders == "":
                #has_valid_children_orders.append(False if obj.children_orders == "" else True)
                valid_children_orders.append(False)
            else:
                valid_children_orders.append(helpers.string2List(obj.children_orders))

        context["valid_children_orders"] = valid_children_orders

        return context
        

# This one "plays" the frames.

# It loads all the strip under a scene here, but when this view first loads
# only a few strips will be loaded. Rest will be loaded using ajax calls.
class SceneDetailView(generic.DetailView):
    
    #detail view's model
    model = Scene 
    
    queryset = Scene.objects.all()
    template_name = "flipbooks/scene_play.html"
    queryset_scene = ""
    strip_json = {}
    #context_object_name = "strip_list"  # default is 'object_list' if you don't like that

    def get_context_data(self, **kwargs):
        context = super(SceneDetailView, self).get_context_data(**kwargs)
        context['scene'] = context['object']
        
        # Convert children_orders to iterable list, or mark it with "False"
        stringy_children_orders = context['object'].children_orders
        valid_children_orders = False if stringy_children_orders =="" else helpers.string2List(stringy_children_orders) 
            
        context["valid_children_orders"] = valid_children_orders
        
        #might benefit just putting reordered strip into context
        ordered_strip_set = []
        if valid_children_orders:
            ordered_strip_set = helpers.order_by_id_ref(context['scene'].strip_set.all(), valid_children_orders)
        
        context['ordered_strip_set'] = ordered_strip_set
        
        return context
    


# .................................................. 
# .................................................. 
#                   Strip Views
# .................................................. 
# .................................................. 

class StripCreateView(SuccessMessageMixin, generic.CreateView):
    
    template_name = "flipbooks/strip_create.html"
    form_class = forms.StripCreateForm
    #login_url = '/admin/'
    # success_url = "/flipbooks/"
    
    success_url = reverse_lazy('flipbooks:scene-list')
    success_message = "Strip was created successfully"
  
    def form_valid(self, form):
        # Validate order:
        #   Currently, saving with order=0 will automatically become adjusted
        #   when save() [check models.py]
        
        #   Should also check if the order is duplicate.
        messages.error(self.request, self.success_message)
        return super(StripCreateView, self).form_valid(form)

    def get_success_message(self, cleaned_data):
        print("------------ sending success message: {}, {}".format(self.success_message,cleaned_data))
        # return self.success_message % dict(
        #     cleaned_data,
        #     calculated_field=self.object.calculated_field,
        # )
        return self.success_message
        

class StripUpdateView(SuccessMessageMixin, generic.UpdateView):
    queryset = Strip.objects.all()
    
    template_name = "flipbooks/strip_update.html"
    form_class = forms.StripUpdateForm
    success_url = reverse_lazy('flipbooks:scene-list')
    
    success_message = "Strip was updated successfully"
    
    # There is no instance information here
    # def __init__(self, *args, **kwargs):
    #     print("-----------is there kwargs?: {}".format(kwargs))
    
    # See StripUpdateForm in forms.py for dynamic field information
    
    def form_valid(self, form):
        messages.success(self.request, self.success_message)
        return super(StripUpdateView, self).form_valid(form)
        
  
  
  


# .................................................. 
# .................................................. 
#              AJAX calls (for Strip)
# .................................................. 
# .................................................. 

# ---------------------------
# Called to load more strips under a scene. This 
# assumes the scene is loading its strips piece by piece.

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


# ---------------------------
# With known scene.id, provide preview of the strips 
# under it. It will not retrieve all frames, just first
# frames of each strips.
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
        else:
            # no frames under this strip. Add placeholder
            strip_set_frame_li+=["placeholder"]

    data = {
        #'is_taken': User.objects.filter(username__iexact=username).exists()
        'strip_ids':strip_set_str_li,
        "strip_frames": strip_set_frame_li,
    }
    return JsonResponse(data)
    
    




# .................................................. 
# .................................................. 
#                     Frames
# .................................................. 
# .................................................. 

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