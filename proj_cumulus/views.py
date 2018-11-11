from __future__ import unicode_literals

from django.shortcuts import render, get_object_or_404
from django.http import HttpResponse
from django.urls import reverse_lazy
from django.shortcuts import redirect

from django.views import generic
import django.forms as f # Not to be conflicted with forms.py



def home(request):
    context = {'welcome_msg': "This message is by context."}
    return render(request, "standalone/home.html", context) 

def home_demo(request):
    response = redirect('/flipbooks/')
    return response






