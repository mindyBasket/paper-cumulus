# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.contrib import admin

from . import forms
from . import models

# def frame_order(obj):
#     return ("%d-%d" % (1, obj.id))

# note: I think FrameModelAdmin don't actually have to be here
#       You can have this in models.py and import it.
class FrameModelAdmin(admin.ModelAdmin):
    def frame_order(self, obj):
        return ("%d-%d" % (1, obj.id))
        
    list_display = ("frame_order", 'note', 'frame_image', 'date_created',)
    empty_value_display = 'unknown'
    
    #custom form
    form = forms.FrameForm
        
# Register your models here.
admin.site.register(models.Frame, FrameModelAdmin)
