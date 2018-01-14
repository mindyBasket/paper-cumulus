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

    
"""Note [01/13/2017]: below is a duplicate. I decided to keep this file just
                      as a reminder to myself that I can separate tests in 
                      separate files. """


class DuplicateTestCase(TestCase):
    
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
        
        
        
       
        
        
    