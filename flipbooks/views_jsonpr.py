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


# Decided to not use. 
# But keeping it as reference.
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