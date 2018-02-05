import os
from rest_framework import generics
from rest_framework.parsers import FormParser,MultiPartParser,FileUploadParser

from .serializers import (
    SceneModelSerializer,
    StripModelSerializer,
    FrameModelSerializer,
)

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


# -------------------------------------------------
# -------------------------------------------------
#                     Frame
# -------------------------------------------------
# -------------------------------------------------

class FrameCreateAPIView(generics.CreateAPIView):
    serializer_class = FrameModelSerializer
    parser_classes = (MultiPartParser,FormParser,FileUploadParser,)
    
    # def post(self, request, format=None, *args, **kwargs):
    #     serializer = FrameModelSerializer(data=request.data)
    #     print("--------------post ------------------")
    #     print(request.data)
    #     print("-------------------------------------")
    #     if serializer.is_valid():
    #         serializer.save()
    #         return Response(serializer.data, status=status.HTTP_201_CREATED)
    #     return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        
    def create(self, request, *args, **kwargs):
        print("------------- create --------------")
        print(request.FILES)
        print(request.data)
        #test = self.request.FILES['frame_image']
        #print("image?: {}".format(test))
        print("-----------------------------------")
        
        return super(FrameCreateAPIView, self).create(request, *args, **kwargs)
    
    
    def perform_create(self, serializer):
        
        #print(self.request.data)
     
        if self.request.data.get('frame_image') is not None:
            frame_image = self.request.data.get('frame_image')
            serializer.save(frame_image=frame_image)
        else:
            serializer.save()

class FrameDetailAPIView(generics.RetrieveAPIView):
    
    # queryset = Frame.objects.all()
    serializer_class = FrameModelSerializer
    
    def get_queryset(self):
        return Frame.objects.all()
    
    # def get(self, request, format=None):
    #     """
    #     Return a list of all users.
    #     """
    #     usernames = [user.username for user in User.objects.all()]
    #     return Response(usernames)

class FrameUpdateAPIView(generics.UpdateAPIView):
    serializer_class = FrameModelSerializer
    parser_classes = (MultiPartParser,FormParser, FileUploadParser)
    
    def get_queryset(self):
        return Frame.objects.all()
    
    #Hoping to achieve PATCH edit
    # def put(self, request, *args, **kwargs):
    #      
        
    ''' Old image and thumbnails are deleted upon DELETE request.
        Check the signal receivers in models.py '''
    def partial_update(self, request, *args, **kwargs):
        print("------------- partial update [PATCH] --------------")
        print("for frame id#{}".format(kwargs['pk']) )
        
        if 'frame_image' in request.data:
            print("patching frame_image: {}".format(request.data['frame_image']))
            if request.data['frame_image'] is not None and request.data['frame_image'] != '':
                
                frame = Frame.objects.filter(pk=kwargs['pk'])[0]
                
                # old image paths
                # image_paths = []
                # if frame.frame_image: 
                #     image_paths.append(frame.frame_image.path) 
                # for thumbnail in frame.frame_image.get_thumbnails():
                #     image_paths.append(thumbnail.path)
                # frame._old_image_paths = image_paths
 
                # Remove old images
                if frame.frame_image: 
                    frame.frame_image.delete_thumbnails() 
                    image_path = frame.frame_image.path
                    if image_path and os.path.isfile(image_path):
                        os.remove(image_path)
             
        return super(FrameUpdateAPIView, self).partial_update(request, *args, **kwargs)
     