from __future__ import unicode_literals
import datetime, time

from django.shortcuts import render, get_object_or_404
from django.http import HttpResponse, JsonResponse
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
from .helpermodule import thumbnailer_helpers


def home_demo(request):
    context = {'welcome_msg': "Start Demo?"}

    demo_book = Book.objects.filter(slug="2-demo-book")[0]
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




def copy_demo_chapter(request, *args, **kwargs):
    
    resp = {}
    resp['success'] = True
    if request.method == "POST":
        # get demo model
        ch_original = Chapter.objects.get(pk=2)
        new_demo_chapter = Chapter.objects.get(pk=2)

        new_demo_chapter.pk = None
        new_demo_chapter.title = "New Demo Chapter"
        new_demo_chapter.id64=''
        new_demo_chapter.save()

        new_pk = new_demo_chapter.pk
        print("====== new Pk for cloned demo: {}".format(new_pk))

        # copy children
        
        for sc in ch_original.scene_set.all():
            sc_original = Scene.objects.get(pk=sc.pk) # for retireving children
            sc.pk = None # will have no children
            sc.name = "Demo " + sc_original.name
            sc.chapter = new_demo_chapter
            sc.save()
            print("[SCENE] - new pk = {}".format(sc.pk))
            for st in sc_original.strip_set.all():
                st_original = Strip.objects.get(pk=st.pk) # for retireving children
                st.pk = None # will have no children
                st.scene = sc
                st.save()
                print("[STRIP] --- new pk = {}".format(st.pk))
                for fr in st_original.frame_set.all():
                    fr.pk = None
                    fr.strip = st
                    fr.save()
                    print("[FRAME] ------ new pk = {}".format(fr.pk))
                    thumbnailer_helpers.regenerate_frame_images(fr)


        resp['url'] = "/flipbooks/chapter/%s/" % new_demo_chapter.id64
        resp['demoChapterId'] = new_demo_chapter.id64;
        resp['timestamp'] =  time.time();

        return JsonResponse(resp)

    else:
        return JsonResponse(None)










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
