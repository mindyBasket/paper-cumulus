from django.shortcuts import render
from django.views import generic

# from django.conf import settings
from django.http import JsonResponse, HttpResponseNotFound
# from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
# from django.shortcuts import render, get_object_or_404, redirect
# from django.urls import reverse_lazys
# from django.template.loader import render_to_string


from storypiper import models as m

# Create your views here.
def test(request):
    context = {'welcome_msg': "If you see this, your view worked!"}
    return render(request, "storypiper/foo.html", context)

class ViewAllFlipbooks(generic.TemplateView):
    """
        Test view that lists ALL flipbooks in the database using GraphQL.

        Uses TemplateView instead of DetailView in order to override requirement of pk
        for retrieving object.
    """

    model = m.Flipbook
    queryset = m.Flipbook.objects.all()
    template_name = "storypiper/flipbook_show_and_list.html"

    def get_context_data(self, *args, **kwargs):

        context = super(ViewAllFlipbooks, self).get_context_data(*args, **kwargs)
        
        # override object using id64
        if 'id64' in kwargs:
            # retrieve chapter by base64 identifier
            try:
                flipbook = m.Flipbook.objects.get(id64=kwargs['id64']) # should I use filter?
            except:
                 # For testing purpose, choose the first flipbook in db
                flipbook = m.Flipbook.objects.get(pk=1)
        else:
            # For testing purpose, choose the first flipbook in db
            flipbook = m.Flipbook.objects.get(pk=1)
            
        if not flipbook:
            return HttpResponseNotFound("Cannot find flipbook.")
        else:
            context['object'] = flipbook
            # because this template does not use pk, so extract it
            pk = flipbook.pk
            # otherwise, you'd access it from param, like this: self.kwargs['pk']
        
        return context
