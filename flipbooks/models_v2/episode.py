# -*- coding: utf-8 -*-
from __future__ import unicode_literals
import os, random

from django.conf import settings
from django.contrib import messages
from django.utils import text
from django.db import models

import easy_thumbnails.files as easy_th_files
from easy_thumbnails.fields import ThumbnailerImageField
from easy_thumbnails.signals import saved_file
from easy_thumbnails.signal_handlers import generate_aliases_global

from .oldseries import Oldseries

# ---------------------------------------------
# This is moved to the end to
# prevent import timing conflict
# ---------------------------------------------
#custom helper functions
#from .helpermodule import helpers
# ---------------------------------------------

# Signals
from django.db.models.signals import pre_save, post_save, post_delete
from django.dispatch import receiver

import django.dispatch

ID_LENGTH = 8

def get_rand_base64(length):
    chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
    result_code = ''
    for i in range(length):
        result_code += chars[random.randrange(0, len(chars))]

    return result_code

def get_id64():
    return get_rand_base64(ID_LENGTH)


class Episode(models.Model):
    
    id64 = models.CharField(max_length=8, blank=True, default='')
    title = models.CharField(max_length=50, blank=True, default="")

    order = models.IntegerField(default="0")
    description = models.TextField(max_length=100, blank=True, default="")

    # movie_url = models.CharField(max_length=60, blank=True, default="") # lambda
    # movie = models.FileField(upload_to='', blank=True) # direct upload
    # playback = models.TextField(blank=True, default="")
    
    # TODO: make this NOT CASCADE. Kinda dangerous
    oldseries = models.ForeignKey(Oldseries, on_delete=models.CASCADE, default=0)
    
    date_created = models.DateTimeField(auto_now_add=True)
    date_modified = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        # https://docs.python.org/2/library/stdtypes.html#str.format
        return "Episode #{} [order: {}, title: {} ]".format(self.pk, self.order, self.title)

    def save(self, *args, **kwargs):  
        # check if this has base64 id
        if self._state.adding or self.id64 == '' or self.id64.length != ID_LENGTH:
            self.id64 = get_id64()

        # 1. Check if valid children_li exists:
        # self.children_li = helpers.refresh_or_cleanup_children_li(self)

        # 2. Save self!
        super(Episode, self).save(*args, **kwargs)

        # 3. Position update on children_li of its parent (chapter)
        # _insert_at = 0
        # self.chapter.children_li = helpers.update_children_li(self.chapter, self.id, _insert_at)
        # self.book.save() # save parent!

    # Custom functions
    # def ordered_strip_set(self):

    #     strips = Strip.objects.filter(scene=self)
    #     children_li = self.children_li
        
    #     return helpers.order_by_id_ref(strips, children_li)

    def delete(self, **kwargs):
        
        target_id = self.id
        
        #delete self
        super(Episode, self).delete() 

        # position removal on children_li of its parent (book)
        # chapter = self.chapter
        # chapter.children_li = helpers.remove_child(self.chapter, target_id)
        # chapter.save() # save parent!
      

    