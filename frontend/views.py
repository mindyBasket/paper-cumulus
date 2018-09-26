from django.shortcuts import render
from django.http import HttpResponse

# REACT views
def index(request):
	context = {'msg': "This is frontend's index. Nothing to see here though."}
	
	return render(request, "standalone/generic_msg.html", context)

