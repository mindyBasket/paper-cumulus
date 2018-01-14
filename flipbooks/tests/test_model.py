# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.test import TestCase

from ..models import (
    Book,
    Chapter,
    Scene,
    Strip,
    Frame
    )
    
# Create your tests here.

# Run using 
# python manage.py test flipbooks.tests.AnimalTestCase

class ModelTestCase(TestCase):
    
    def setUp(self):
        """Define the test client and other test variables."""
        self.scene = Scene(order=1, description="Test scene")
        
        self.strip = Strip(order=2, description="First strip")
        self.frame1 = Frame()
        self.frame2 = Frame()
        self.frame3 = Frame()
        
        #test if it can incrementally add order number later
    
    #note: all test case must start with "test_"
    def test_model_can_create_model_chain(self):
        """Test the Scene-Strip-Frame model link creation."""
        old_count = Scene.objects.count()
        self.scene.save()
        new_count = Scene.objects.count()
        
        self.assertNotEqual(old_count, new_count)
        
        #...
        
        self.strip.scene=self.scene
        
        old_count = Strip.objects.count()
        self.strip.save()
        new_count = Strip.objects.count()
        
        self.assertNotEqual(old_count, new_count)
        
        #...
        
        self.frame1.strip=self.strip
        self.frame2.strip=self.strip
        self.frame3.strip=self.strip
        
        old_count = Frame.objects.count()
        self.frame1.save()
        self.frame2.save()
        self.frame3.save()
        new_count = Frame.objects.count()
        
        self.assertEqual(old_count, new_count-3)
        
        
        
    # def mytest(self):
    #     self.assertRaises(FooException, Thing, name='1234')
    
    
    
    
class StripModelTestCase(TestCase):
    
    def setUp(self):
        """Define the test client and other test variables."""
        self.book = Book(title="Test Book")
        self.book.save()
        self.chapter = Chapter(number=1, book=self.book)
        self.chapter.save()
        self.scene = Scene(description="Test scene", chapter=self.chapter) #order should automatically generate
        self.scene.save()
        
        self.strip1 = Strip(scene=self.scene)
        self.strip2 = Strip(scene=self.scene)
        self.strip3 = Strip(scene=self.scene)
        self.strip4 = Strip(scene=self.scene)
        
        self.stripList = [self.strip1, self.strip2, self.strip3, self.strip4]


    #note: all test case must start with "test_"
    def test_children_order_on_update(self):

        for stripObject in self.stripList:
            stripObject.save()
        
        """ Test if the children_li generate properly """
        self.assertEqual(self.scene.children_li, '1,2,3,4')
        
        # Note: order = "position", starts from 1. 
        #       Do not use it like an index, which starts from 0.
        
        """ Test order swaps """
        self.strip4.order = 2
        self.strip4.save()
        self.assertEqual(self.scene.children_li, '1,4,2,3')
    
        self.strip2.order = 10
        self.strip2.save()
        self.assertEqual(self.scene.children_li, '1,4,3,2')
        
        ''' Test if children list refresh when list is empty '''
        self.scene.children_li = ''
        self.scene.save()
        self.strip1.order = 0
        self.strip1.save() # The refresh currently only happens by Strip.save()
        self.assertEqual(self.scene.children_li, '1,2,3,4')
        
        
    def test_children_order_valid_on_delete(self):

        for stripObject in self.stripList:
            stripObject.save()
            
        sc = self.scene
        
        """ Test if removing a strip also removes ref from children_li """
        self.strip3.delete()
        self.assertEqual(self.scene.children_li, '1,2,4')
        self.strip1.delete()
        self.assertEqual(self.scene.children_li, '2,4')
        
        
    def test_children_order_valid_on_create(self):

        for stripObject in self.stripList:
            stripObject.save()
            
        sc = self.scene
        
        """ Testing creation of frame at a specific order. """
        self.strip5 = Strip(scene=self.scene, order=3)
        self.strip5.save()
        
        self.assertEqual(sc.children_li, '1,2,5,3,4')
       
        

# The same as above, but for Frames
class FrameModelTestCase(TestCase):
    
    def setUp(self):
        """Define the test client and other test variables."""
        self.book = Book(title="Test Book")
        self.book.save()
        self.chapter = Chapter(number=1, book=self.book)
        self.chapter.save()
        self.scene = Scene(description="Test scene", chapter=self.chapter)
        self.scene.save()
        self.strip = Strip(description="Test strip", scene=self.scene)
        self.strip.save()
        
        self.frame1 = Frame(strip=self.strip)
        self.frame2 = Frame(strip=self.strip)
        self.frame3 = Frame(strip=self.strip)
        self.frame4 = Frame(strip=self.strip)
        
        self.frameList = [self.frame1, self.frame2, self.frame3, self.frame4]
        
        print(">> SETUP ENDED <<")


    #note: all test case must start with "test_"
    def test_frames_on_update(self):
        
        for frObject in self.frameList:
            frObject.save()
        
        """ Test if the children_li generate properly """
        self.assertEqual(self.strip.children_li, '1,2,3,4')
        
        """ Test order swaps """
        self.frame4.order = 1
        self.frame4.save()
        self.assertEqual(self.strip.children_li, '4,1,2,3')
    
        self.frame1.order = 10
        self.frame1.save()
        self.assertEqual(self.strip.children_li, '4,2,3,1')
        
        ''' Test if children list refresh when parent list is empty '''
        self.strip.children_li = ''
        self.strip.save()
        self.assertEqual(self.strip.children_li, '1,2,3,4')
        
        
    def test_frames_on_delete(self):

        for frObject in self.frameList:
            frObject.save()
            
        """ Test if removing a strip also removes ref from children_li """
        self.frame3.delete()
        self.assertEqual(self.strip.children_li, '1,2,4')
        self.frame1.delete()
        self.assertEqual(self.strip.children_li, '2,4')
        
        
    def test_children_order_valid_on_create(self):

        for frObject in self.frameList:
            frObject.save()
            

        """ Testing creation of frame at a specific order. """
        self.frame5 = Frame(strip=self.strip, order=3)
        self.frame5.save()
        
        self.assertEqual(self.strip.children_li, '1,2,5,3,4')
    