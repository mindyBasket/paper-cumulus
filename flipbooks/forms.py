from django.contrib import messages
from django import forms

from .models import (
    Frame,
    Strip,
    Scene
)

class FrameForm(forms.ModelForm):
    class Meta:
        model = Frame
        fields = ['note', 'order', 'frame_image', 'strip']

def getOrderChoices():
    order_choices = (
        ('1',1),('2',2),('3',3)
        )
    return order_choices
    

class StripCreateForm(forms.ModelForm):
    
    
    def __init__(self, *args, **kwargs):
        super(StripCreateForm, self).__init__(*args, **kwargs)
        
        #order Scene by its 'order' attribute
        self.fields['scene'].queryset = Scene.objects.order_by("order")
        # self.fields['scene'] = forms.ModelChoiceField(
        #     queryset=Scene.objects.order_by("order")
        # )

    class Meta:
        model = Strip
        fields = ['scene', 'description'] #removed 'order'. No need to select them.
        # https://docs.djangoproject.com/en/1.10/topics/forms/modelforms/#overriding-the-default-fields
        labels = {
            'scene': 'Under scene'
        }
            
        widgets = {
            'order': forms.Select(choices=getOrderChoices()),
        }
        
        #so I would like to add class to these fields. To do it, investigate crispy forms.
        
    def form_valid(self, form):
        # Validate order:
        #   Currently, saving with order=0 will automatically become adjusted
        #   when save() [check models.py
        
        #   Should also check if the order is duplicate.

        messages.success(self.request, self.form_valid_message)
        print("----------- form valid!")
        return super(StripCreateForm, self).form_valid(form)
        
    # def form_invalid(self,form):
    #     pass
        