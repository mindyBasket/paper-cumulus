from __future__ import unicode_literals

from django.shortcuts import render, get_object_or_404
from django.http import HttpResponse
from django.urls import reverse_lazy

from django.views import generic
import django.forms as f # Not to be conflicted with forms.py


#import your models
from .models import (
        Book,
        Chapter,
        Scene,
        Strip,
        Frame
    )
    
from . import forms

#custom helper functions 
from .helpermodule import helpers



def home_demo(request):
    context = {'welcome_msg': "Start Demo?"}

    demo_book = Book.objects.filter(slug="2-demo-book-model")[0]
    if not demo_book:
        raise Exception("Cannot find the demo book")

    print("-------- demo chapter pk: {}".format(demo_book.pk))

    # Get form listing only ONE BOOK as possible choice!
    # it is possible to pass both positionl and kwarded args
    demo_chapter_create_form = forms.ChapterCreateForm(
        #{"default_book_pk": demo_book.pk},
        initial={'book': demo_book.pk}
        ) 

    context['demo_chapter_create_form'] = demo_chapter_create_form
    return render(request, "standalone/start_demo.html", context) 




class DemoIntroView(generic.TemplateView):

    model = Chapter
    
    queryset = Chapter.objects.all()
    template_name = "frontend/chapter_detail.html" # use frontend
    
    def get_context_data(self, *args, **kwargs):

        context = super(ChapterDetailView_REACT, self).get_context_data(*args, **kwargs)
        
        # Get book from URL
        book = Book.objects.get(pk=kwargs['book_pk'])

        # make context for the Chapter and its Scenes        
        chapter = book.chapter_set.filter(number=kwargs['chapter_number'])[0]
        context['object_chapter'] = chapter
        context['object_scene_list'] = context['object_chapter'].scene_set.order_by('order')

        # prepare invisible form. Make sure you put it into context!
        scene_create_form = forms.SceneCreateForm(initial={"chapter_number": chapter.number})
        context["scene_create_form"] = scene_create_form

        
        return context


class SceneDetailView_REACT(generic.DetailView):

    model = Scene
    queryset = Scene.objects.all()
    template_name = "frontend/scene_detail.html"

    def get_context_data(self, *args, **kwargs):

        context = super(SceneDetailView_REACT, self).get_context_data(*args, **kwargs)
        
        # For AJAX submits
        strip_create_form = forms.StripCreateForm(initial={'scene': self.kwargs['pk']})
        strip_create_form.fields['scene'].widget.attrs['invisible'] = True #hiding by css
        strip_create_form.fields['scene'].label = ''
        strip_create_form.fields['description'].widget.attrs['invisible'] = True #hiding by css
        strip_create_form.fields['description'].label = ''
        context["strip_create_form"] = strip_create_form
        context['strip_create_url'] = reverse_lazy("flipbooks:strip-create", kwargs={'scene_pk':self.kwargs['pk'] })

        frame_create_form = forms.FrameCreateForm({"scene_pk": self.kwargs['pk']})
        frame_create_form.fields['strip'].widget.attrs['invisible'] = True #hiding by css
        # frame_create_form.fields['frame_image'].widget = f.HiddenInput()
        context['frame_create_form'] = frame_create_form
        # context['frame_create_url'] = reverse_lazy("flipbooks:frame-create", kwargs={'strip_pk': 1 })
        # This doesn't do anything since form submit is intercepted by an API call
        
        
        return context