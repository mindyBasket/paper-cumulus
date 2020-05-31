# -*- coding: utf-8 -*-
from __future__ import unicode_literals
import random

# from django.conf import settings
# from django.contrib import messages
# from django.utils import text
from django.db import models

from .series import Series

# TODO: move this somewhere?
ID_LENGTH = 8

def get_rand_base64(length):
    chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
    result_code = ''
    for i in range(length):
        result_code += chars[random.randrange(0, len(chars))]

    return result_code

def get_id64():
    return get_rand_base64(ID_LENGTH)

class Flipbook(models.Model):

    id64 = models.CharField(max_length=8, blank=True, default='')
    title = models.CharField(max_length=50, blank=True, default="")

    description = models.TextField(max_length=100, blank=True, default="")

    # TODO: make this NOT CASCADE. Kinda dangerous
    series = models.ForeignKey(Series, on_delete=models.CASCADE, blank=True, null=True)

    date_created = models.DateTimeField(auto_now_add=True)
    date_modified = models.DateTimeField(auto_now=True)

    def __str__(self):
        # https://docs.python.org/2/library/stdtypes.html#str.format
        return "Flipbook (#{}) [title: {}, series: #{}]".format(self.id64, self.title, self.series.id)

    def save(self, *args, **kwargs):  
        # check if this has base64 id
        if self._state.adding or self.id64 == '' or self.id64.length != ID_LENGTH:
            self.id64 = get_id64()

        # 2. Save self!
        super(Flipbook, self).save(*args, **kwargs)

    # def delete(self, **kwargs):

    #     #delete self
    #     super(Flipbook, self).delete() 
