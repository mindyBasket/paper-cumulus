# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.test import TestCase

from .models import (
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