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
        
        """ Test if the children_orders generate properly """
        self.assertEqual(self.scene.children_orders, '1,2,3,4')
        
        """ Test order swaps """
        self.strip4.order = 1
        self.strip4.save()
        self.assertEqual(self.scene.children_orders, '1,4,2,3')
    
        self.strip2.order = 10
        self.strip2.save()
        self.assertEqual(self.scene.children_orders, '1,4,3,2')
        
        
    def test_children_order_valid_on_delete(self):

        for stripObject in self.stripList:
            stripObject.save()
            
        sc = self.scene
        
        """ Test if removing a strip also removes ref from children_orders """
        self.strip3.delete()
        self.assertEqual(self.scene.children_orders, '1,2,4')
        self.strip1.delete()
        self.assertEqual(self.scene.children_orders, '2,4')
        
        
    def test_children_order_valid_on_create(self):

        for stripObject in self.stripList:
            stripObject.save()
            
        sc = self.scene
        
        """ Testing creation of frame at a specific order. """
        self.strip5 = Strip(scene=self.scene, order=2)
        self.strip5.save()
        
        print('CHILDREN ORDER OUTPUT: {}'.format(sc.children_orders))
        self.assertEqual(sc.children_orders, '1,2,5,3,4')
       
        
        
    