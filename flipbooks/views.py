# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from datetime import datetime

from django.http import JsonResponse, HttpResponseNotFound
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from django.shortcuts import render, get_object_or_404, redirect
from django.urls import reverse_lazy
from django.template.loader import render_to_string

from django.views import generic
import django.forms as f # Not to be conflicted with forms.py

from django.contrib import messages
from django.contrib.messages.views import SuccessMessageMixin

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
#                    CONSTANTS
# .................................................. 
# .................................................. 

DEMO_LIFESPAN = 3 # days



# .................................................. 
# .................................................. 
#                  Book Views
# .................................................. 
# .................................................. 

class BookListView(generic.ListView):
    
    queryset = Book.objects.all()
    
    



# .................................................. 
# .................................................. 
#                  Chapter Views
# .................................................. 
# .................................................. 


# Previously "SceneListView"
class ChapterDetailView(generic.TemplateView):
    # NOTE: the reason this is using TemplateView instead of DetailView
    #       is because this not retrieving chapter by pk but instead
    #       by its 'number' property
    
    model = Chapter
    
    queryset = Chapter.objects.all()
    # template_name = "flipbooks/chapter_detail.html" # OLD
    template_name = "frontend/chapter_detail.html"
    
    def get_context_data(self, *args, **kwargs):


        # TODO: YOU ARE LOOKING AT OLD VIEW OBJECT.
        #       THIS PROJECT WENT THROUGH A CHANGE WHERE REACT IS USED FOR FRONTEND
        #       THIS OBJECT IS CURRENTLY NOT USED


        context = super(ChapterDetailView, self).get_context_data(*args, **kwargs)
        
        # Get book from URL
        book = Book.objects.get(pk=kwargs['book_pk'])
    
        # make context for the Chapter and its Scenes        
        # TODO: Chapter object also opted into using its own children_li. So 
        #       object_scene_list is useless.
        context['object'] = book.chapter_set.filter(number=kwargs['chapter_number'])[0]
        context['object_scene_list'] = context['object'].scene_set.order_by('order')
        
        # TODO: this looks like old code...confirm if this is used anywhere, ifnot
        #       remove!
        valid_children_li = []
        for obj in context['object_scene_list']:
            if obj.children_li == "":
                #has_valid_children_li.append(False if obj.children_li == "" else True)
                valid_children_li.append(False)
            else:
                valid_children_li.append(helpers.string2List(obj.children_li))

        context["valid_children_li"] = valid_children_li
        
        
        context["frame_create_form"] = forms.FrameCreateForm
        context['frame_create_url'] = reverse_lazy("flipbooks:frame-create", kwargs={'strip_pk':4})
        
        return context


class ChapterDetailView2(generic.TemplateView):
    # NOTE: the reason this is using TemplateView instead of DetailView
    #       is because this not retrieving chapter by pk but instead
    #       by its 'number' property
    
    model = Chapter
    
    queryset = Chapter.objects.all()
    template_name = "frontend/chapter_detail.html" # use frontend
    

    def get_context_data(self, *args, **kwargs):

        context = super(ChapterDetailView2, self).get_context_data(*args, **kwargs)
        
        # Get book from URL
        book = Book.objects.get(pk=kwargs['book_pk'])
    
        # make context for the Chapter and its Scenes
        context['object_chapter'] = book.chapter_set.filter(number=kwargs['chapter_number'])[0]
        context['object_scene_list'] = context['object_chapter'].scene_set.order_by('order')
    
        # print("*--------------Get scene set {}".format(context['object'].scene_set.all()))
        
        # valid_children_li = []
        # for obj in context['object_scene_list']:
        #     if obj.children_li == "":
        #         #has_valid_children_li.append(False if obj.children_li == "" else True)
        #         valid_children_li.append(False)
        #     else:
        #         valid_children_li.append(helpers.string2List(obj.children_li))

        #context["valid_children_li"] = valid_children_li
        
        return context


class ChapterDetailView_REACT(generic.TemplateView):

    model = Chapter
    
    queryset = Chapter.objects.all()
    template_name = "frontend/chapter_detail.html" # use frontend

    def get(self, request, *args, **kwargs):

        if 'id64' in kwargs:
            # retrieve chapter by base64 identifier
            # https://docs.djangoproject.com/en/2.1/topics/http/shortcuts/#id2
            chapter = get_object_or_404(Chapter, id64=kwargs['id64'])
        else:
            return HttpResponseNotFound("Chapter id not provided in the request")

        # DEMOONLY
        # Check if demo expired
        if chapter.is_demo == True:
            print("-------------CHECK IF DEMO EXPIRED--------------")
            print(chapter.date_created)
            print(datetime.now())
            chdate = chapter.date_created
            nwdate = datetime.now().date()
            chdate_f = int("{0}{1:0>2}{2:0>2}".format(chdate.year, chdate.month, chdate.day))
            nwdate_f = int("{0}{1:0>2}{2:0>2}".format(nwdate.year, nwdate.month, nwdate.day))

            if nwdate_f - chdate_f > DEMO_LIFESPAN:
                # Past 3 days. Expired
                print ("EXPIRED by comparing dates. {}-{}={} units".format(nwdate_f,chdate_f,nwdate_f-chdate_f))
                chapter.delete()
                return redirect('/flipbooks/')
                
            elif nwdate_f - chdate_f == DEMO_LIFESPAN:
                # MIGHT be expired. Check down to seconds
                chdate_f = int("1{0:0>2}{1:0>2}{2:0>2}".format(chdate.hour, chdate.minute, chdate.second))
                nwdate = datetime.now()
                nwdate_f = int("1{0:0>2}{1:0>2}{2:0>2}".format(nwdate.hour, nwdate.minute, nwdate.second))
 
                if nwdate_f - chdate_f >= 0: 
                    # definitely expired
                    print("EXPIRED by comparing down to seconds. {}-{}={} units".format(nwdate_f, chdate_f, nwdate_f-chdate_f))
                    chapter.delete()
                    return redirect('/flipbooks/')



        return super(ChapterDetailView_REACT, self).get(request, *args, **kwargs)


    
    def get_context_data(self, *args, **kwargs):

        context = super(ChapterDetailView_REACT, self).get_context_data(*args, **kwargs)
        
        # Note: this function is used for two different URL pattern 
        #       re_path(r'^(?P<book_pk>\d+)/(?P<chapter_number>\d+)/$'
        #       path('<slug:book_slug>/chapter-<chapter_hex>/'

        # Get book from URL
        if 'id64' in kwargs:
            # retrieve chapter by base64 identifier
            chapter = Chapter.objects.filter(id64=kwargs['id64'])[0]
        else:
            book = Book.objects.get(pk=kwargs['book_pk'])
            chapter = book.chapter_set.filter(number=kwargs['chapter_number'])[0]

    

        # make context for the Chapter and its Scenes
        context['object_chapter'] = chapter

        # it may be an empty chapter
        is_empty_chapter = True

        query_scenes = chapter.scene_set.all()
        if query_scenes and len(query_scenes) > 0:
            first_scene = query_scenes[0]
            query_strips = first_scene.strip_set.all()
            if query_strips and len(query_strips) > 0:
                first_strip = query_strips[0]
                query_frames = first_strip.frame_set.all()
                if query_frames and len(query_frames) > 0:
                    is_empty_chapter = False

        context['is_empty_chapter'] = is_empty_chapter

        # context['object_scene_list'] = context['object_chapter'].scene_set.order_by('order')

        # prepare invisible form. Make sure you put it into context!
        scene_create_form = forms.SceneCreateForm(initial={"chapter_number": chapter.number})
        context["scene_create_form"] = scene_create_form

        
        return context














# http://patorjk.com/software/taag/#p=display&f=Modular&t=Type%20Something%20

#  _______  _______  _______  __    _  _______  
# |       ||       ||       ||  |  | ||       | 
# |  _____||       ||    ___||   |_| ||    ___| 
# | |_____ |       ||   |___ |       ||   |___  
# |_____  ||      _||    ___||  _    ||    ___| 
#  _____| ||     |_ |   |___ | | |   ||   |___  
# |_______||_______||_______||_|  |__||_______| 

# .................................................. 
# .................................................. 
#                   Scene Views
# .................................................. 
# .................................................. 

# class SceneListView(generic.ListView):
    
#     queryset = Scene.objects.order_by('order')
    
#     def get_context_data(self, *args, **kwargs):

#         context = super(SceneListView, self).get_context_data(*args, **kwargs)
#         # Default contexts
#         # - object_list, is_paginated, paginator, page_obj

#         # Check what's in context like this
#         # print("------------{}".format(context))
        
#         # Convert children_li to iterable list, or mark it with "False"
#         valid_children_li = []
#         for obj in context['object_list']:
#             if obj.children_li == "":
#                 #has_valid_children_li.append(False if obj.children_li == "" else True)
#                 valid_children_li.append(False)
#             else:
#                 valid_children_li.append(helpers.string2List(obj.children_li))

#         context["valid_children_li"] = valid_children_li

#         return context
        
class SceneDetailView(generic.DetailView):
    model = Scene
    queryset = Scene.objects.all()

    def get_context_data(self, *args, **kwargs):

        context = super(SceneDetailView, self).get_context_data(*args, **kwargs)
        
        # ...
        # The large commented code below is my noobish attempt to map Scene's strip_set 
        # to its children_li. I made a template tag for it, so no longer need to do this.
        # Delete once you feel confident this works well for other scenes.
        
        # # Order strips by id ref'd by children_li:
        # # Convert children_li to iterable list, or mark it with "False"
        # stringy_children_li = context['object'].children_li
        # valid_children_li = False if stringy_children_li =="" else helpers.string2List(stringy_children_li) 
        # context["valid_children_li"] = valid_children_li

        # # Reorder strip based on valid_children_li
        # _scene = context['object']
        # ordered_strip_set = []
        # if valid_children_li:
        #     ordered_strip_set = helpers.order_by_id_ref(_scene.strip_set.all(), valid_children_li)
        # else:
        #     # children_li not valid. Retrieve strip by its natural order (id)
        #     # No way to store things in variables in template language. So it is done here.
        #     ordered_strip_set = _scene.strip_set.all()
        # context['ordered_strip_set'] = ordered_strip_set
        
        
        # ...
        # Strips also have children_li, which can be used to make ordered_frame_set,
        # but this is done in the template using a custom template tag called 'map_queryset'
        
        
        
        # For AJAX submits
        strip_create_form = forms.StripCreateForm(initial={'scene': self.kwargs['pk']})
        strip_create_form.fields['scene'].widget.attrs['invisible'] = True #hiding by css
        strip_create_form.fields['scene'].label = ''
        strip_create_form.fields['description'].widget.attrs['invisible'] = True #hiding by css
        strip_create_form.fields['description'].label = ''
        context["strip_create_form"] = strip_create_form
        context['strip_create_url'] = reverse_lazy("flipbooks:strip-create", kwargs={'scene_pk':self.kwargs['pk'] })

        frame_create_form = forms.FrameCreateForm({"scene_pk": self.kwargs['pk']})
        frame_create_form.fields['strip'].widget.attrs['invisible'] = True #hiding by css
        # frame_create_form.fields['frame_image'].widget = f.HiddenInput()
        context['frame_create_form'] = frame_create_form
        # context['frame_create_url'] = reverse_lazy("flipbooks:frame-create", kwargs={'strip_pk': 1 })
        # This doesn't do anything since form submit is intercepted by an API call
        
        
        return context


class SceneDetailView_REACT(generic.TemplateView):
    # Note: uses TemplateView instead of DetailView in order to override requirement of pk
    #       for retrieving object

    model = Scene
    queryset = Scene.objects.all()
    template_name = "frontend/scene_detail.html"

    def get_context_data(self, *args, **kwargs):

        context = super(SceneDetailView_REACT, self).get_context_data(*args, **kwargs)
        
        # override object using id64
        if 'id64' in kwargs:
            # retrieve chapter by base64 identifier
            scene = Scene.objects.filter(id64=kwargs['id64'])[0]
            context['object'] = scene
        else:
            return HttpResponseNotFound("Cannot find scene.")  

        # because this template does not use pk, so extract it
        pk = scene.pk
        # otherwise, you can access it like this: self.kwargs['pk']


        # For AJAX submits
        strip_create_form = forms.StripCreateForm(initial={'scene': pk})
        strip_create_form.fields['scene'].widget.attrs['invisible'] = True #hiding by css
        strip_create_form.fields['scene'].label = ''
        strip_create_form.fields['description'].widget.attrs['invisible'] = True #hiding by css
        strip_create_form.fields['description'].label = ''
        context["strip_create_form"] = strip_create_form
        context['strip_create_url'] = reverse_lazy("flipbooks:strip-create", kwargs={'scene_pk':pk })

        frame_create_form = forms.FrameCreateForm({"scene_pk": pk})
        frame_create_form.fields['strip'].widget.attrs['invisible'] = True #hiding by css
        # frame_create_form.fields['frame_image'].widget = f.HiddenInput()
        context['frame_create_form'] = frame_create_form
        # context['frame_create_url'] = reverse_lazy("flipbooks:frame-create", kwargs={'strip_pk': 1 })
        # This doesn't do anything since form submit is intercepted by an API call
        
        
        return context


# This one "plays" the frames.

# It loads all the strip under a scene here, but when this view first loads
# only a few strips will be loaded. Rest will be loaded using ajax calls.
class ScenePlayView(generic.DetailView):
    
    #detail view's model
    model = Scene 
    
    queryset = Scene.objects.all()
    template_name = "flipbooks/scene_play.html"
    queryset_scene = ""
    strip_json = {}
    #context_object_name = "strip_list"  # default is 'object_list' if you don't like that

    def get_context_data(self, **kwargs):
        context = super(ScenePlayView, self).get_context_data(**kwargs)
        context['scene'] = context['object']
        
        # Removed codes for re-ordering the element based on children_li,
        # because recommended to keep views and template as clean as possible
    
        return context
    

class ScenePlayView_REACT(generic.DetailView):
    
    #detail view's model
    model = Scene 
    
    queryset = Scene.objects.all()
    template_name = "flipbook/flipbook_play.html" # not "flipbooks". It's singular!
    queryset_scene = "" # what is this?
    strip_json = {} # what's this for? 
    #context_object_name = "strip_list"  # default is 'object_list' if you don't like that

    def get_context_data(self, **kwargs):
        context = super(ScenePlayView_REACT, self).get_context_data(**kwargs)
        context['scene'] = context['object']
        
        # Removed codes for re-ordering the element based on children_li,
        # because recommended to keep views and template as clean as possible
    
        return context











#  _______  _______  ______    ___   _______    
# |       ||       ||    _ |  |   | |       |   
# |  _____||_     _||   | ||  |   | |    _  |   
# | |_____   |   |  |   |_||_ |   | |   |_| |   
# |_____  |  |   |  |    __  ||   | |    ___|   
#  _____| |  |   |  |   |  | ||   | |   |       
# |_______|  |___|  |___|  |_||___| |___|       

# .................................................. 
# .................................................. 
#                   Strip Views
# .................................................. 
# .................................................. 

class GetStripSuccessUrlMixin(object):
    
    def get_success_url(self, **kwargs):
        # flipbooks:chapter-detail url look like this: flipbooks/{book_pk}/chapter/{chapter_pk}/
        # flipbooks:scene-detail url look like this: flipbooks/scene/{scene_pk}/
        
        return reverse_lazy(
            'flipbooks:scene-detail', 
            kwargs = {
                'pk': self.object.scene.id
            })
            
        # I can't remember what I planend before, but you set the kwargs like this:
        # kwargs = {
        #         'book_pk': self.object.scene.chapter.book.id,
        #         'chapter_number': self.object.scene.chapter.number
        #     }


class StripCreateView(SuccessMessageMixin, GetStripSuccessUrlMixin, generic.CreateView):
    
    model = Strip
    template_name = "flipbooks/strip_create.html"
    form_class = forms.StripCreateForm
    # login_url = '/admin/'
    # success_url = *see GetStripSuccessUrlMixin*
    
    success_message = "Strip was created successfully"
    
    # filled after request
    # _scene_pk = ''
    
    # def get(self, request, *args, **kwargs):
    #     # print("-----uh...request?: {}".format(dir(request)))
    #     # print("-----{}".format([request.body, request.path, request.get_raw_uri()]))
    #     self._scene_pk = self.kwargs['scene_pk'] if 'scene_pk' in self.kwargs else '1'
    #     return super(StripCreateView, self).get(self, *args, **kwargs)

    def get_context_data(self, **kwargs):
        context = super(StripCreateView, self).get_context_data(**kwargs)
        _scene_pk = self.kwargs['scene_pk'] if 'scene_pk' in self.kwargs else '1'
        context['scene_obj'] = Scene.objects.filter(id = _scene_pk)[0]
        
        return context
        
        
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
        



class StripUpdateView(SuccessMessageMixin, GetStripSuccessUrlMixin, generic.UpdateView):
    queryset = Strip.objects.all()
    
    template_name = "flipbooks/strip_update.html"
    form_class = forms.StripUpdateForm
    # success_url = *see GetStripSuccessUrlMixin*

    success_message = "Strip was updated successfully"
    
    # There is no instance information here
    #def __init__(self, *args, **kwargs):
    #     print("-----------is there kwargs?: {}".format(kwargs))
    
    
    # See StripUpdateForm in forms.py for dynamic field information
    # See Strip(Model) to see what happens upon save()
    
    def form_valid(self, form):
        messages.success(self.request, self.success_message)
        return super(StripUpdateView, self).form_valid(form)

  
# This is FunctionBased view for Strip-delete.
# Two different behaviors depending on request:
# GET: responds with confirm form
# POST: actually deletes upon confirm 
def strip_delete(request, pk):
    
    strip = get_object_or_404(Strip, pk=pk)
    data = dict()
    
    if request.method == 'POST':
        
        strip.delete() # Unfortunately no easy way to check if this is successful
        data['deleted'] = True
        
    elif request.method == 'GET': 

        #Render into delete-confirm template
        context = {'strip': strip }
        data['html_form'] = render_to_string('flipbooks/forms/delete_strip_confirm.html',
            context,
            request=request,
        )
    else:
        return False
        
    return JsonResponse(data)
  


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
    
    strip_set_str_li = []
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
    
    

def sort_children(request, *args, **kwargs):

    frame_ids = request.GET.get('frame_ids', None)
    
    if frame_ids and isinstance(frame_ids, str):
        frame_ids.replace("[","") # just in case
        frame_ids.replace("]","")
        
    # Can you retrieve Strip object
    strip = Strip.objects.get(id=kwargs['pk']) 
    strip.children_li = frame_ids #Basically a 'refresh' of children_li
    strip.save()

    # Response
    return JsonResponse({'frame_ids': request.GET.get('frame_ids', None)})


def scene_sort_children(request, *args, **kwargs):

    strip_ids = request.GET.get('strip_ids', None)
    
    if strip_ids and isinstance(strip_ids, str):
        strip_ids.replace("[","") # just in case
        strip_ids.replace("]","")
        
    # Can you retrieve Scene object
    scene = Scene.objects.get(id=kwargs['pk']) 
    scene.children_li = strip_ids #Basically a 'refresh' of children_li
    scene.save()

    # Response
    return JsonResponse({'strip_ids': scene.children_li})















#  _______  ______    _______  __   __  _______ 
# |       ||    _ |  |   _   ||  |_|  ||       |
# |    ___||   | ||  |  |_|  ||       ||    ___|
# |   |___ |   |_||_ |       ||       ||   |___ 
# |    ___||    __  ||       ||       ||    ___|
# |   |    |   |  | ||   _   || ||_|| ||   |___ 
# |___|    |___|  |_||__| |__||_|   |_||_______|

# .................................................. 
# .................................................. 
#                     Frames
# .................................................. 
# .................................................. 

# ---------------
# Frame Detail 
# ---------------
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
        

# ---------------
# Frame Create 
# ---------------
class FrameCreateView(generic.CreateView):
    
    model = Frame
    template_name = "flipbooks/includes/form_new_frame.html"
    form_class = forms.FrameCreateForm

    # Will be replaced by ajax submit.
    success_url = reverse_lazy('flipbooks:book-list')

    def get_context_data(self, **kwargs):
        context = super(FrameCreateView, self).get_context_data(**kwargs)
        _strip_pk = self.kwargs['strip_pk'] if 'strip_pk' in self.kwargs else '1'
        context['strip_obj'] = Strip.objects.filter(id = _strip_pk)[0]
        
        return context
        

    def form_valid(self, form):
        return super(FrameCreateView, self).form_valid(form)
    
    # def form_invalid(self, form):
    #     # can you make it fail better? redirect??
    #     return JsonResponse(form.errors, status=400)
 

# ---------------
# Frame Update 
# ---------------
class FrameUpdateView(generic.UpdateView):
    # This is done through Rest API to take advantage of
    # partial update. 
    # see api/views.py
    pass


# ---------------
# Frame Delete 
# ---------------
# This is FunctionBased view for Frame-delete. Decided not to go with ClassBased.
# Two different behaviors depending on request:
# GET: responds with confirm form
# POST: actually deletes upon confirm 
def frame_delete(request, pk):
    
    frame = get_object_or_404(Frame, pk=pk)
    data = dict()
    
    if request.method == 'POST':
        
        frame.delete() # Unfortunately no easy way to check if this is successful
        data['deleted'] = True
        
    else: #most likely request.method == "GET"

        #Render into delete-confirm template
        context = {'frame': frame }
        data['html_form'] = render_to_string('flipbooks/forms/delete_frame_confirm.html',
            context,
            request=request,
        )
    
    return JsonResponse(data)
    
    
# .................................................. 
# .................................................. 
#              AJAX calls (for RESTFul api)
# .................................................. 
# .................................................. 

# Currently not being used
# Most likely going to be replaced by AJAX-submit on an rendered form
def spawn_create_scene(request, **kwargs):
    # Create response:

    
    # # extract incoming param from request
    # scene_id = request.GET.get('scene_id', None)
    # strip_set_of_scene = Strip.objects.filter(scene__id=scene_id)
    
    # #send responses as Json
    # strip_set_str_li = [];
    # strip_set_frame_li = [];
    # for strip in strip_set_of_scene:
    #     strip_set_str_li+=[strip.id]
        
    #     # Get first frame of each strip. 
    #     # Extract thumbnail instead of default frame_image.url
    #     # strip_set_frame_li+=[strip.frame_set.all()[0].frame_image.cell.url]
    #     if strip.frame_set.all():
    #         strip_set_frame_li+=[strip.frame_set.all()[0].frame_image['cell'].url]
    #     else:
    #         # no frames under this strip. Add placeholder
    #         strip_set_frame_li+=["placeholder"]

    # data = {
    #     #'is_taken': User.objects.filter(username__iexact=username).exists()
    #     'strip_ids':strip_set_str_li,
    #     "strip_frames": strip_set_frame_li,
    # }
    
    data = {}
    return JsonResponse(data)