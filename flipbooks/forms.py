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



def getOrderChoices(order_list = [], curr_order=0):
    order_choices = []
    last_order = 0
    for choice in order_list:
        #make tuple
        if choice == curr_order:
            #is current instance's order
            order_select = (int(choice), "{} - CURRENT".format(choice)) 
        else:
            order_select = (int(choice), "{} - taken".format(choice)) 
        order_choices.append(order_select)
        
        last_order = choice
        
    #add new order
    new_order_select = (last_order+1, "(+{} - new)".format(last_order+1)) 
    order_choices.append(new_order_select)
    
    #turn it into tuple
    return tuple(order_choices)
    

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
        
    #not part of ModelForm
    # def form_valid()


class StripUpdateForm(forms.ModelForm):
    
    # Originally integerfield. Now dynamically updated ChoiceField 
    order = forms.ChoiceField(choices=())
    
    def __init__(self, *args, **kwargs):
        strip_instance = kwargs['instance']
        strip_orders_list = []
        for strip in strip_instance.scene.strip_set.all():
            strip_orders_list.append(strip.order)
            
        super(StripUpdateForm, self).__init__(*args, **kwargs)
        
        self.fields['order'].choices = getOrderChoices(strip_orders_list, strip_instance.order)
        
        
    class Meta:
        model = Strip
        fields = ['scene', 'order', 'description'] 
        labels = {
            'scene': 'Under scene',
            'order': 'At order'
        }
        # widgets = {
        #     # below seem to get treated as...not even a field with a value
        #     #'scene': forms.Select(attrs={'disabled': 'disabled'}),
        #     'order': forms.Select,
        # }

    # This also exists in ModelForm? Originally I assumed it is only for Models
    # def save(self):
    #     #add better order if it is set 0
    #     if int(self.order) == 0:
    #         self.order = get_last_order(self)
        
    #     super(Strip, self).save()