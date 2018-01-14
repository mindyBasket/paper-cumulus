# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.contrib import messages

from easy_thumbnails.fields import ThumbnailerImageField
from easy_thumbnails.signals import saved_file
from easy_thumbnails.signal_handlers import generate_aliases_global


from django.db import models


# -- This was moved to the end to prevent import timing conflict --
#custom helper functions 
#from .helpermodule import helpers
# -----------------------------------------------------------------

# thumbnail signal handler
saved_file.connect(generate_aliases_global)


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
        
        # >>> gender= "male"
        # >>> print "At least, that's what %s told me." %("he" if gender == "male" else "she")
        # At least, that's what he told me.

    # def save(self, **kwargs):
        
    #     scene = self.scene
    #     _insert_at = int(self.order) #get order in string
        
    #     if self.children_li == '':
    #         print("WARNING. children_li on this strip is empty. Refreshing children_li.")
    #         new_children_li = helpers.refresh_children_li(self)
    #         if new_children_li:
    #             self.children_li = new_children_li
    #     super(Strip, self).save() # save Strip!

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
    children_li = models.TextField(max_length=500, blank=True, default="")
    
    description = models.TextField(max_length=100, blank=True, default="")
    
    scene = models.ForeignKey(Scene, on_delete=models.CASCADE)
    
    date_created = models.DateTimeField(auto_now_add=True)
    date_modified = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        # https://docs.python.org/2/library/stdtypes.html#str.format
        return "id #{} [in Sn_{}, order:{}]".format(self.id, self.scene.order, self.order)
    
    # def get_absolute_url(self):
    #     return reverse("chatter:detail", kwargs={"pk":self.pk})
    
    def save(self, **kwargs):
        
        scene = self.scene
        _insert_at = int(self.order) #get order in string
        
        if self.children_li == '':
            print("WARNING. children_li on this strip is empty. Refreshing children_li.")
            new_children_li = helpers.refresh_children_li(self)
            if new_children_li:
                self.children_li = new_children_li
        
        super(Strip, self).save() # save Strip!
        
        #update children_li of its scene (parent)
        scene.children_li = helpers.update_children_li(self.scene, self.id, _insert_at)
        scene.save() # save parent(Scene)!
    
    
    def delete(self, **kwargs):
        
        scene = self.scene

        # update children_li of its scene (parent), but it's removal
        scene.children_li = helpers.remove_child(self.scene, self.id)
        scene.save() # save parent(Scene)!
        super(Strip, self).delete() #delete Strip!
        
        
        
        
        
# -------------------------------------------------
# -------------------------------------------------
#                     Frame
# -------------------------------------------------
# -------------------------------------------------

def frame_upload_path(instance, filename):
    # file will be uploaded to MEDIA_ROOT/scene_<order>/strip_<order>-<order>.<ext>

    return 'frame_images/scene_{0}_{1}/strip_{2}-{3}.{4}'.format(
        instance.strip.scene.id, 
        instance.strip.scene.name,
        instance.strip.order,
        instance.order,
        filename.split(".")[-1]
        )
 
def frame_upload_path2(instance, filename):

    return 'frame_images2/scene_{0}/str{1}_{2}'.format(
            instance.strip.scene.id,
            instance.strip.id,
            filename
        )
        
  
        
        
#Frame: holds individual frames
class Frame(models.Model):
    
    order = models.IntegerField(default="-1") 

    note = models.CharField(
        max_length=100, blank=True, default="", help_text="This note will not be visible for viewers. It's just for the creator"
    )
    
    strip = models.ForeignKey(Strip, blank=True, null=True)
    
    #frame images
    frame_image = ThumbnailerImageField(
        upload_to = frame_upload_path,
        #resize_source=dict(size=(100, 100)),
        #thumbnail_storage='frame_images/thumbTest/thumbs/', #I don't know how to use this
        blank=True
    )
    
    #frame images, using Django native imagefield
    frame_image_native = models.ImageField(
        upload_to = frame_upload_path2,
        blank=False
        )
    
    
    date_created = models.DateTimeField(auto_now_add=True)
    date_modified = models.DateTimeField(auto_now=True)
    
    
    
    def __str__(self):
        return ("%d : %s" % (self.id, self.note))

    def save(self, **kwargs):
        
        super(Frame, self).save() # save Strip!
        
        #update children_li of its strip (parent)
        strip = self.strip
        _insert_at = int(self.order) #get order in string
        strip.children_li = helpers.update_children_li(self.strip, self.id, _insert_at)
        strip.save() # save parent(Strip)!
        
        
    def delete(self, **kwargs):
        
        # update children_li of its parent, but removal
        strip = self.strip
        strip.children_li = helpers.remove_child(self.strip, self.id)
        strip.save() # save parent(Scene)!
        
        super(Frame, self).delete() #delete Frame!
    

#custom helper functions 
from .helpermodule import helpers