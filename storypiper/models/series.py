# -*- coding: utf-8 -*-
from __future__ import unicode_literals
import os, random

from django.conf import settings
from django.contrib import messages
from django.utils import text
from django.db import models

# TODO: move this helper somewhere
def get_rand_base64(length):
    chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
    result_code = ''
    for i in range(length):
        result_code += chars[random.randrange(0, len(chars))]

    return result_code


class Series(models.Model):
    """
    Model binding multiple Flipbooks
    """
    title = models.CharField(max_length=50, blank=True, default="Untitled Series")
    slug = models.SlugField(blank=True, default='')

    # For demo
    is_demo = models.BooleanField(blank=True, default=False)

    date_created = models.DateTimeField(auto_now_add=True)
    date_modified = models.DateTimeField(auto_now=True)

    def __str__(self):
        # https://docs.python.org/2/library/stdtypes.html#str.format
        return "Series {} : {} : {}".format(self.pk, self.title, self.slug)
