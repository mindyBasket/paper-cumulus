# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models

# Create your models here.
class Frame(models.Model):
    
    date_created = models.DateTimeField(auto_now_add=True)
    date_modified = models.DateTimeField(auto_now=True)
    
    #note = models.CharField(max_length=255, blank=False, unique=True)
    note = models.TextField(max_length=100, blank=True, default="")
    
    def __str__(self):
        #How can I print its own id? self.id?
        return ("%d : %s" % (self.id, self.note))

