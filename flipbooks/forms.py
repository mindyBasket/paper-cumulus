from django import forms

from .models import (
    Frame,
    Strip
)

class FrameForm(forms.ModelForm):
    class Meta:
        model = Frame
        fields = ['note', 'order', 'frame_image', 'strip']

class StripCreateForm(forms.ModelForm):
    class Meta:
        model = Strip
        fields = ["order", 'description', 'scene']