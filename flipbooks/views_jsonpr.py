# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.http import JsonResponse
from django.core.urlresolvers import reverse_lazy
from django.template.loader import render_to_string
from django.shortcuts import render, get_object_or_404

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
    
    html_template = render_to_string('flipbooks/includes/tmplt_stripContainer.html',
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
        "frame_instance": frame_instance
    }
    
    html_template = render_to_string(
        'flipbooks/partials/frame_edit_partial.html',
        context, 
        request=request
    )
    
    return JsonResponse({'html_template': html_template})
    
    