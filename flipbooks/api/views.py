from rest_framework import generics
from .serializers import SceneModelSerializer

from ..models import (
    Scene,
    Strip,
    Frame
)

class FlipbookAPIListView(generics.ListAPIView):
    queryset = Scene.objects.all()
    serializer_class = SceneModelSerializer
    
    def get_queryset(self):
        return Scene.objects.all()
        
        