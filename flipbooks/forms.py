from django import forms

from .models import (
    Frame
)

class FrameForm(forms.ModelForm):
    class Meta:
        model = Frame
        fields = ['note', 'frame_image',]
