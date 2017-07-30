# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.shortcuts import render
from django.views import generic

#import your models
from .models import (
        Frame
    )

# Create your views here.
class FrameListView(generic.ListView):

    queryset = Frame.objects.all() 

    def get_context_data(self, *args, **kwargs):

        context = super(FrameListView, self).get_context_data(*args, **kwargs)
        # Default contexts
        # - object_list, is_paginated, paginator, page_obj
        
        context['test_context'] = "Hello World!" 
        return context
        