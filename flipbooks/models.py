# -*- coding: utf-8 -*-
from __future__ import unicode_literals
import os, random

from django.conf import settings
from django.contrib import messages

import easy_thumbnails.files as easy_th_files
from easy_thumbnails.fields import ThumbnailerImageField
from easy_thumbnails.signals import saved_file
from easy_thumbnails.signal_handlers import generate_aliases_global

from django.db import models

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


    




# http://patorjk.com/software/taag/#p=display&f=ANSI%20Shadow&t=Strip 

#  ██████╗██╗  ██╗ █████╗ ██████╗ ████████╗███████╗██████╗ 
# ██╔════╝██║  ██║██╔══██╗██╔══██╗╚══██╔══╝██╔════╝██╔══██╗
# ██║     ███████║███████║██████╔╝   ██║   █████╗  ██████╔╝
# ██║     ██╔══██║██╔══██║██╔═══╝    ██║   ██╔══╝  ██╔══██╗
# ╚██████╗██║  ██║██║  ██║██║        ██║   ███████╗██║  ██║
#  ╚═════╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝        ╚═╝   ╚══════╝╚═╝  ╚═╝
                                                         
# -------------------------------------------------
# -------------------------------------------------
#               Chapter and Book
# -------------------------------------------------
# -------------------------------------------------

class Book(models.Model):
    
    title = models.CharField(max_length=50, blank=True, default="Untitled Book")
    
    date_created = models.DateTimeField(auto_now_add=True)
    date_modified = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        # https://docs.python.org/2/library/stdtypes.html#str.format
        return "Book: {}".format(self.title)
    
    
class Chapter(models.Model):
    
    number = models.IntegerField(default="0") 
    title = models.CharField(max_length=50, blank=True, default="Untitled")
    
    # relationship
    book = models.ForeignKey(Book, on_delete=models.CASCADE)
    
    date_created = models.DateTimeField(auto_now_add=True)
    date_modified = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        # https://docs.python.org/2/library/stdtypes.html#str.format
        return "Chapter {}: {}".format(self.number, self.title)









# ███████╗ ██████╗███████╗███╗   ██╗███████╗
# ██╔════╝██╔════╝██╔════╝████╗  ██║██╔════╝
# ███████╗██║     █████╗  ██╔██╗ ██║█████╗  
# ╚════██║██║     ██╔══╝  ██║╚██╗██║██╔══╝  
# ███████║╚██████╗███████╗██║ ╚████║███████╗
# ╚══════╝ ╚═════╝╚══════╝╚═╝  ╚═══╝╚══════╝
                                          

# -------------------------------------------------
# -------------------------------------------------
#                     Scene
# -------------------------------------------------
# -------------------------------------------------

# Scene: holds multiple strips. In convensional web-comic sense, this is like a "page"
class Scene(models.Model):
    
    order = models.IntegerField(default="0") 
    children_li = models.TextField(max_length=200, blank=True, default="")
    
    name = models.CharField(max_length=50, blank=True, default="")
    description = models.TextField(max_length=100, blank=True, default="")
    
    # TODO: make this NOT CASCADE. Kinda dangerous
    chapter = models.ForeignKey(Chapter, on_delete=models.CASCADE, default=0)
    
    date_created = models.DateTimeField(auto_now_add=True)
    date_modified = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        # https://docs.python.org/2/library/stdtypes.html#str.format
        return "Scene #{} [order: {}, name: {} ]".format(self.pk, self.order, self.name)
        
    def save(self, *args, **kwargs):
    
        # 1. Check if valid children_li exists:
        if self.children_li == '' or "".join(self.children_li.split(","))== '':
            print("WARNING. children_li on this Scene is empty. Refreshing children_li.")
            new_children_li = helpers.refresh_children_li(self)
            if new_children_li:
                self.children_li = new_children_li
        else:
            # Children_li exists. Clean up just in case
            # You are in strip right now, so query it RIGHT
            cleaned_children_li = helpers.cleanup_children_li(self)
            if cleaned_children_li:
                self.children_li = cleaned_children_li



        super(Scene, self).save(*args, **kwargs)
        
        
    # Custom functions
    def ordered_strip_set(self):
        strips = Strip.objects.filter(scene=self)
        children_li = self.children_li
        
        return helpers.order_by_id_ref(strips, children_li)
      

        


# ███████╗████████╗██████╗ ██╗██████╗ 
# ██╔════╝╚══██╔══╝██╔══██╗██║██╔══██╗
# ███████╗   ██║   ██████╔╝██║██████╔╝
# ╚════██║   ██║   ██╔══██╗██║██╔═══╝ 
# ███████║   ██║   ██║  ██║██║██║     
# ╚══════╝   ╚═╝   ╚═╝  ╚═╝╚═╝╚═╝     

# -------------------------------------------------
# -------------------------------------------------
#                     Strip
# -------------------------------------------------
# -------------------------------------------------

#helper 

# Note: I wrote this before I began using stringy list to record order.
#        Quite possible I no longer have use for this.
# def get_last_order(strip_instance):
#     scene = strip_instance.scene
#     return len(scene.strip_set.all())+1


# Strip: holds multiple frames. Used for viewing frames.
class Strip(models.Model):
    
    order = models.IntegerField(default="-1")
    children_li = models.TextField(max_length=500, null=True, blank=True, default="")
    children_index = models.TextField(max_length=500, null=True, blank=True, default="")
    
    description = models.TextField(max_length=100, blank=True, default="")
    
    scene = models.ForeignKey(Scene, on_delete=models.CASCADE)
    
    date_created = models.DateTimeField(auto_now_add=True)
    date_modified = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        # https://docs.python.org/2/library/stdtypes.html#str.format
        return "id #{} [in Sn_{}, order:{}]".format(self.id, self.scene.order, self.order)
    
    # def get_absolute_url(self):
    #     return reverse("chatter:detail", kwargs={"pk":self.pk})
    
    def save(self, *args, **kwargs):
        
        _insert_at = int(self.order) 
        self.order = 0 # reset to "do not change position unless specified"
        

        # 1. Check if valid children_li exists:
        if self.children_li == '' or "".join(self.children_li.split(","))== '':
            print("WARNING. children_li on this strip is empty. Refreshing children_li.")
            new_children_li = helpers.refresh_children_li(self)
            if new_children_li:
                self.children_li = new_children_li
        else:
            # Children_li exists. Clean up just in case
            # You are in strip right now, so query it RIGHT
            cleaned_children_li = helpers.cleanup_children_li(self)
            if cleaned_children_li:
                self.children_li = cleaned_children_li
        
        # 2. Save strip!
        super(Strip, self).save(*args, **kwargs) 

        # 3. Position update on children_li of its parent (scene)
        self.scene.children_li = helpers.update_children_li(self.scene, self.id, _insert_at)
        self.scene.save() # save parent!
        

    def delete(self, **kwargs):
        
        # position removal on children_li of its parent (scene)
        scene = self.scene
        scene.children_li = helpers.remove_child(self.scene, self.id)
        scene.save() # save parent!
        
        #delete Strip!
        super(Strip, self).delete() 
        
        
        
        



# ███████╗██████╗  █████╗ ███╗   ███╗███████╗
# ██╔════╝██╔══██╗██╔══██╗████╗ ████║██╔════╝
# █████╗  ██████╔╝███████║██╔████╔██║█████╗  
# ██╔══╝  ██╔══██╗██╔══██║██║╚██╔╝██║██╔══╝  
# ██║     ██║  ██║██║  ██║██║ ╚═╝ ██║███████╗
# ╚═╝     ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝     ╚═╝╚══════╝

# -------------------------------------------------
# -------------------------------------------------
#                     Frame
# -------------------------------------------------
# -------------------------------------------------

# Issue: slightly unreliable since this function tries to "guess"
#        instance's id before it is newly created in db
def frame_upload_path(instance, filename):
    # file will be uploaded to MEDIA_ROOT/frame_images/s{id}/f{id}/f{id}__{hexcode}.{extension}
    
    max_frame_id = Frame.objects.all().order_by("-id")[0].id
    frame_id = (int(max_frame_id)+1) if instance.id is None else instance.id
    hexcode = '%010x' % random.randrange(16**9, 16**10)
    return 'frame_images/s{0}/f{1}__{2}/f{1}__{2}.{3}'.format(
        instance.strip.scene.id, 
        frame_id,
        hexcode,
        filename.split(".")[-1]
        )
 
def frame_upload_path2(instance, filename):
    # file will be uploaded to MEDIA_ROOT/frame_images/s{id}/f{id}.{extension}
    return 'frame_images/s{0}/f{1}.{2}'.format(
        instance.strip.scene.id, 
        instance.id,
        filename.split(".")[-1]
        )
        
#Frame: holds individual frames
class Frame(models.Model):
    
    order = models.IntegerField(default="-1") 

    note = models.CharField(
        max_length=100, blank=True, default="", help_text="This note will not be visible for viewers. It's just for the creator"
    )
    
    strip = models.ForeignKey(Strip, blank=True, null=True, on_delete=models.CASCADE)
    
    #frame images
    frame_image = ThumbnailerImageField(
        upload_to = frame_upload_path,
        #resize_source=dict(size=(100, 100)),
        #thumbnail_storage='frame_images/thumbTest/thumbs/', #I don't know how to use this
        blank=False
    )

    date_created = models.DateTimeField(auto_now_add=True)
    date_modified = models.DateTimeField(auto_now=True)
    
    # Temporary attributes used for signals
    # Tried using this to manipulate behaviors in signals.
    # Didn't quite work out but could come in handy later.
    _is_image_update = False
    
    
    def __str__(self):
        if self.id is not None:
            return ("%d : %s" % (self.id, self.note))
        else:
            return("<id not assigned> : %s" % (self.note))

    def save(self, *args, **kwargs):
        
        _insert_at = int(self.order) 
        self.order = 0 # reset to "do not change position unless specified"
        
        print("---------- FRAME SAVE ---------")
        # print(self.frame_image) # incoming image
        # print(self.frame_image.name) #upload name, not actual file path
        # print(self.frame_image.url) #/media/whiteTrip00.png
        # print(self.frame_image.path) #/home/ubuntu/workspace/media/whiteTrip00.png ?
        # store old thumbnail information for deletion later

        # Check if this is a new frame 
        # ref: https://docs.djangoproject.com/en/2.1/ref/models/instances/#customizing-model-loading
        is_new = True if self._state.adding else False
        
        print("--------- IS THIS A NEW FRAME? : %s" % is_new)
        
        # 1. Save instance
        super(Frame, self).save(*args, **kwargs) # save Frame!
        
        # 2. position update on children_li of its parent (strip)
        self.strip.children_li = helpers.update_children_li(self.strip, self.id, _insert_at)
        # self.strip.children_index = helpers.update_children_index(self.strip, self.id, _insert_at, is_new)
        self.strip.save() # save parent!
        
        
    def delete(self, **kwargs):
        
        # position removal on children_li of its parent (strip)
        strip = self.strip
        strip.children_li = helpers.remove_child(self.strip, self.id)
        strip.save() # save parent!
        
        # Remove thumbnails
        # Check post_save receiver!
        
        #delete Frame!
        super(Frame, self).delete() 
        




# ███████╗██╗ ██████╗ ███╗   ██╗ █████╗ ██╗     ███████╗
# ██╔════╝██║██╔════╝ ████╗  ██║██╔══██╗██║     ██╔════╝
# ███████╗██║██║  ███╗██╔██╗ ██║███████║██║     ███████╗
# ╚════██║██║██║   ██║██║╚██╗██║██╔══██║██║     ╚════██║
# ███████║██║╚██████╔╝██║ ╚████║██║  ██║███████╗███████║
# ╚══════╝╚═╝ ╚═════╝ ╚═╝  ╚═══╝╚═╝  ╚═╝╚══════╝╚══════╝
                                                      

''' Deletes images and thumbnails after frame is deleted '''
@receiver(post_delete, sender=Frame)
def frame_post_delete(sender, **kwargs):
    
    frame = None
    if 'instance' in kwargs:
        frame = kwargs['instance']
    else:
        return 
    
    # remove uploaded images and associated thumbnails
    thumbnailer_helpers.delete_frame_images(frame)
  
    return True




''' == CURRENTLY DEACTIVATED == '''
''' Generates thumbnails for Frame after it has been saved.
    It uses get_thumbnailer(); it should just return existing
    thumbnail if it already exists
    As for the fate of old image and thumbnails, they are 
    deleted upon PATCH request. Check api/views.py '''

# @receiver(post_save, sender=Frame)
def frame_post_save(sender, **kwargs):
    print("")
    print("========= post_save: Generate Thumbnails ==========")
    frame = None
    if 'instance' in kwargs:
        frame = kwargs['instance']
    else:
        return 
    
    aliases_dict = settings.THUMBNAIL_ALIASES['']
    for alias in aliases_dict:
        thumbnail_options = aliases_dict[alias]
        
        #get Thumbnailer object
        thumbnailer = easy_th_files.get_thumbnailer(frame.frame_image) 
        th = thumbnailer.get_thumbnail(
            thumbnail_options, 
            save=True, 
            generate=True, 
            silent_template_exception=False
            )
    
    # This method doesn't actually store them as aliases onto the object. 
    # easy_th_files.generate_all_aliases(frame.frame_image, True)
    
    print("Thumbnail generated:")
    frame = Frame.objects.filter(pk=frame.id)[0] # re-grab
    # Wondering if the fact taht I am using get_thumbnails "connects"
    # the thumbnail to the object?
    for thumbnail in frame.frame_image.get_thumbnails():
        print(thumbnail.path)
    
    print("==================================================")
    print("")

# thumbnail signal handler
saved_file.connect(generate_aliases_global)







# ██╗███╗   ███╗██████╗  ██████╗ ██████╗ ████████╗███████╗
# ██║████╗ ████║██╔══██╗██╔═══██╗██╔══██╗╚══██╔══╝██╔════╝
# ██║██╔████╔██║██████╔╝██║   ██║██████╔╝   ██║   ███████╗
# ██║██║╚██╔╝██║██╔═══╝ ██║   ██║██╔══██╗   ██║   ╚════██║
# ██║██║ ╚═╝ ██║██║     ╚██████╔╝██║  ██║   ██║   ███████║
# ╚═╝╚═╝     ╚═╝╚═╝      ╚═════╝ ╚═╝  ╚═╝   ╚═╝   ╚══════╝
                                                        
#custom helper functions 
from .helpermodule import helpers
from .helpermodule import thumbnailer_helpers