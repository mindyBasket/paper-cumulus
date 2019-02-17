# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.http import JsonResponse
from django.urls import reverse_lazy
from django.template.loader import render_to_string
from django.shortcuts import render, get_object_or_404

import easy_thumbnails.files as easy_th_files

#import your models
from .models import (
        Book,
        Chapter,
        Scene,
        Strip,
        Frame
    )
    
from . import forms



def return_strip_container_tmplt(request, *args, **kwargs):
    
    stripObj = get_object_or_404(Strip, pk=kwargs['pk'])
    strip_pk = kwargs['pk']
    
    context = {
        'strip': stripObj,
        'index': stripObj.scene.strip_set.count()
    }
    
    html_template = render_to_string('flipbooks/partials/strip_container.html',
        context,
        request=request,
    )
    
    return JsonResponse({'html_template': html_template})
    

def return_frame_edit_form(request, *args, **kwargs):
    
    frame_instance = get_object_or_404(Frame, pk=kwargs['pk'])
    frame_pk = kwargs['pk']
    
    # reference:
    # form = frame_create_form 
    # action_url = frame_create_url 
    # form_id="frame_create_form"

    frame_edit_form = forms.FrameEditForm()

    context = {
        "form": frame_edit_form,
        "frame_instance": frame_instance,
        "action_url": '',
        "form_id": 'frame_update_form'
    }
    
    html_template = render_to_string(
        'flipbooks/partials/frame_edit_partial.html',
        context, 
        request=request
    )
    
    return JsonResponse({'html_template': html_template})
    



def return_thumbnail_partial(request, *args, **kwargs):
    
    frame_instance = get_object_or_404(Frame, pk=kwargs['pk'])

    context = {
        "frame": frame_instance
    }
    
    html_template = render_to_string(
        'flipbooks/partials/thumbnail_partial.html',
        context, 
        request=request
    )
    
    return JsonResponse({'html_template': html_template})
    
    
def return_empty_thumbnail_partial(request, *args, **kwargs):
    
    html_template = render_to_string(
        'flipbooks/partials/thumbnail_partial.html',
    )
    
    return JsonResponse({'html_template': html_template})






# Help React take advantage of Django magic

def get_url_by_name(request, *args, **kwargs):
    print("kwargs: {}".format(kwargs))
    print("args: {}".format(args))

    url_name_data = kwargs['url_name']
    url_name = ":".join(url_name_data.split("--colon--"))
    pk = kwargs['pk']
    print("-------------------------------------------")
    print ("Ready to respond? {} : {} ".format(url_name, pk))

    # TODO: very confusing variable names switching between pk to id64
    return JsonResponse({'url': reverse_lazy(url_name, kwargs={'id64': pk})  })  



def test_thumbnail(requets, *args, **kwargs):
    print("------------ THUMBNAIL TEST ------------")
    print("----------- for frame id: {} ------------".format(kwargs['frame_pk']))

    frame = get_object_or_404(Frame, pk=kwargs['frame_pk'])

    #get ThumbnailER isntance
    thumbnailer = easy_th_files.get_thumbnailer(frame.frame_image)
    print("Thumbnailer instance: {}".format(thumbnailer))
    # get_thumbnailER will return instance, get_thumbnAIL will return thumbnail


    # let's try generating it
    thumbnail_options = {'crop': True}  
    thumbnail_options.update({'size': (500, 0)})
    # for size in (50, 100, 250):
    #     thumbnail_options.update({'size': (size, size)})
    #     thumbnailer.get_thumbnail(thumbnail_options) #GENERATES NEW THUMBNAIL

    thumb = thumbnailer.get_thumbnail(thumbnail_options) #GENERATES NEW THUMBNAIL
    # thumb is a ThumbnailFILE instance: 
    # https://easy-thumbnails.readthedocs.io/en/latest/ref/files/#easy_thumbnails.files.ThumbnailFile
    
    
    print("Thumb generated? : {}".format(thumb))
    #print(dir(thumb))

    return JsonResponse({
        'hello': "world",
        'thumb': thumb.url,
        # 'names': thumbnailer.get_thumbnail_name({'size': (500,0)}) #this generatesb name. doesn't return name of actual existing thumb
    })
