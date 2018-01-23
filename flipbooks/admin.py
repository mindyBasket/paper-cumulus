# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.contrib import admin

from . import forms
from . import models

# def frame_order(obj):
#     return ("%d-%d" % (1, obj.id))

# note: I think FrameModelAdmin don't actually have to be here
#       You can have this in models.py and import it.

class SceneModelAdmin(admin.ModelAdmin):

    list_display = ("id", "__str__", "name", "children_li")

    
    
class StripModelAdmin(admin.ModelAdmin):

    list_display = ("id", "__str__", "scene", "children_li", "description")
    empty_value_display = 'unknown'
    

class FrameModelAdmin(admin.ModelAdmin):
    def frame_order(self, obj):
        if obj.strip is None:
            return ("%s-%d" % ("<Stray>", obj.order))
        else:
            return ("%d-%d" % (obj.strip.order, obj.order))
        
    list_display = ("id", "frame_order", 'note', 'frame_image', 'date_created',)
    empty_value_display = 'unknown'
    
    #testing custom form
    #form = forms.FrameForm


# Register your models here.
admin.site.register(models.Book)
admin.site.register(models.Chapter)
admin.site.register(models.Scene, SceneModelAdmin)
admin.site.register(models.Strip, StripModelAdmin)
admin.site.register(models.Frame, FrameModelAdmin)


