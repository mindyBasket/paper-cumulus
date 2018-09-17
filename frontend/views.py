from django.shortcuts import render

# REACT views
def index(request):
	context = {'welcome_msg': "This message is by context."}
    return render(request, 'frontend/index.html', context)