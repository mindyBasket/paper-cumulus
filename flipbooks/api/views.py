import os, shutil
from rest_framework import generics
from rest_framework.parsers import FormParser,MultiPartParser,FileUploadParser

from .serializers import (
    BookModelSerializer,
    ChapterModelSerializer,
    SceneModelSerializer,
    StripModelSerializer,
    FrameModelSerializer,
)

from ..models import (
    Book,
    Chapter,
    Scene,
    Strip,
    Frame
)

# ---------------------------------------------
# This is moved to the end to 
# prevent import timing conflict
# ---------------------------------------------
#custom helper functions 
#from .helpermodule import helpers
# ---------------------------------------------


class FlipbookAPIListView(generics.ListAPIView):
    queryset = Scene.objects.all()
    serializer_class = SceneModelSerializer
    
    def get_queryset(self):
        return Scene.objects.all()




class FlipbookAPIDetailView(generics.RetrieveAPIView):
    
    queryset = Book.objects.all()
    serializer_class = BookModelSerializer
    
    def get_queryset(self):
        return Book.objects.all()
    

    

class ChapterAPIDetailView(generics.RetrieveAPIView):
    
    queryset = Chapter.objects.all()
    serializer_class = ChapterModelSerializer
    
    def get_queryset(self):
        return Chapter.objects.all()




# http://patorjk.com/software/taag/#p=display&f=Cyberlarge&t=Scene
# _______ _______ _______ __   _ _______
# |______ |       |______ | \  | |______
# ______| |_____  |______ |  \_| |______
                                       



class SceneAPIListView(generics.ListAPIView):
    # Similar to above, but only lists scene under a book

    # queryset = Scene.objects.all() # see get_queryset() below
    serializer_class = SceneModelSerializer
    
    def get_queryset(self):
        _chapter_pk = self.kwargs['pk'] if ('pk' in self.kwargs) else '1'
        return Scene.objects.filter(chapter__id=_chapter_pk)



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
    

    
class SceneCreateAPIView(generics.CreateAPIView):
    serializer_class = SceneModelSerializer





 # _______ _______  ______ _____  _____ 
 # |______    |    |_____/   |   |_____]
 # ______|    |    |    \_ __|__ |      
                                      

class StripCreateAPIView(generics.CreateAPIView):
    serializer_class = StripModelSerializer

class StripDeleteAPIview(generics.DestroyAPIView):
    serializer_class = StripModelSerializer
    queryset = Strip.objects.all()

    #lookup_field




 # _______  ______ _______ _______ _______
 # |______ |_____/ |_____| |  |  | |______
 # |       |    \_ |     | |  |  | |______
                                        


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
        print("------------- [API Frame] Create --------------")
        print("Files: {}".format(request.FILES))
        print("Data: {}".format(request.data))
        #test = self.request.FILES['frame_image']
        #print("image?: {}".format(test))
        print("-----------------------------------------------")
        
        return super(FrameCreateAPIView, self).create(request, *args, **kwargs)
    
    
    def perform_create(self, serializer):
        
        #print(self.request.data)
        print("--------------------------- performing create...")
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
                # Old image and thumbnails are deleted upon DELETE request.
                # Check the signal receivers in models.py 
                print("")
                print("======= PATCH: removing old images =========")
                thumbnailer_helpers.delete_frame_images(frame)
                print("=============================================")
                print("")


                # intercept!!
                resp = super(FrameUpdateAPIView, self).partial_update(request, *args, **kwargs)
                
                print("")
                print("========= PATCH response ==========")

                frame = Frame.objects.filter(pk=kwargs['pk'])[0] # re-retrieve
                
                # build list of thumbnails generated to send it off 
                frame_thumbnails = {}
                for thumbnail in frame.frame_image.get_thumbnails():
                    # print("url: {}".format(thumbnail.url))
                    # print("dimension: {}".format(thumbnail._get_image_dimensions()))

                    # can't get alias?
                    # have to sort them into alias before using it
                    matched_alias = thumbnailer_helpers.get_alias_dict(
                        thumbnail.url, 
                        thumbnail._get_image_dimensions()
                        )
                    if matched_alias:
                        frame_thumbnails.update(matched_alias)
                        
                    
                # inject frame_thumbnails into the response
                print("frame_thumbnails: {}".format(frame_thumbnails))
                resp.data["frame_thumbnails"] = frame_thumbnails
                
                print("===================================")
                print("")
                
                return resp
            
            else:
                # the frame_image in request object is not valid
                pass
                
        
        else:
            # PATCH request that does not include frame_image
            print("This PATCH request contains no thumbnail request")
            return super(FrameUpdateAPIView, self).partial_update(request, *args, **kwargs)



class FrameDeleteAPIview(generics.DestroyAPIView):
    serializer_class = FrameModelSerializer
    queryset = Frame.objects.all()

    #lookup_field


# custom helper functions 
from ..helpermodule import thumbnailer_helpers