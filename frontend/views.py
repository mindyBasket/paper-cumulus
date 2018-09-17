from django.shortcuts import render
from django.http import HttpResponse

# REACT views
def index(request):
	context = {'welcome_msg': "You are looking at the frontend."}
	
	return render(request, "frontend/index.html", context)

