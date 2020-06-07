from django.shortcuts import render

# Create your views here.
def test(request):
    context = {'welcome_msg': "If you see this, your view worked!"}
    return render(request, "storypiper/foo.html", context) 