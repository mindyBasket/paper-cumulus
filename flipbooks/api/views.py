from rest_framework import generics
from .serializers import (
    SceneModelSerializer,
    StripModelSerializer
)

from ..models import (
    Scene,
    Strip,
    Frame
)

#class StripCreateAPIView(generics.CreateAPIView):
    

class FlipbookAPIListView(generics.ListAPIView):
    queryset = Scene.objects.all()
    serializer_class = SceneModelSerializer
    
    def get_queryset(self):
        return Scene.objects.all()
        

class SceneAPIDetailView(generics.RetrieveAPIView):
    
    queryset = Scene.objects.all()
    serializer_class = SceneModelSerializer
    
    def get_queryset(self):
        return Scene.objects.all()
    
    # def get(self, request, format=None):
    #     """
    #     Return a list of all users.
    #     """
    #     usernames = [user.username for user in User.objects.all()]
    #     return Response(usernames)
    
    
class StripCreateAPIView(generics.CreateAPIView):
    serializer_class = StripModelSerializer