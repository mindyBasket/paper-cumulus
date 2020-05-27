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

# ---------------------------------------------
# This is moved to the end to
# prevent import timing conflict
# ---------------------------------------------
# custom helper functions
#from .helpermodule import helpers
# ---------------------------------------------

# Signals
from django.db.models.signals import pre_save, post_save, post_delete
from django.dispatch import receiver

import django.dispatch

# TODO: move this helper somewhere
def get_rand_base64(length):
    chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
    result_code = ''
    for i in range(length):
        result_code += chars[random.randrange(0, len(chars))]

    return result_code


class Oldseries(models.Model):
    """
    Model binding multiple Episodes

    A series should be unique, and is identified with a slug.
    Note: this is going to be replaced by "Series" in Storypiper app
    """
    title = models.CharField(max_length=50, blank=True, default="Untitled")
    slug = models.SlugField(blank=True, default='')

    # For demo
    is_demo = models.BooleanField(blank=True, default=False)

    date_created = models.DateTimeField(auto_now_add=True)
    date_modified = models.DateTimeField(auto_now=True)

    def __str__(self):
        # https://docs.python.org/2/library/stdtypes.html#str.format
        return "Oldseries {} : {} : {}".format(self.pk, self.title, self.slug)
