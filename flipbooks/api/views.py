import os, shutil
import json
from django.http import JsonResponse
from rest_framework import generics
from rest_framework.parsers import FormParser,MultiPartParser,FileUploadParser

from pathlib import Path, PurePath #new in Python 3.4+
from django.conf import settings

from django.core.files.base import ContentFile
from django.core.files.storage import default_storage as storage


from .serializers import (
    BookModelSerializer,
    ChapterModelSerializer,
    SceneModelSerializer,
    SceneModelPlayBackSerializer,
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






# http://patorjk.com/software/taag/#p=display&f=Cyberlarge&t=Mixins
# _______ _____ _     _ _____ __   _ _______
# |  |  |   |    \___/    |   | \  | |______
# |  |  | __|__ _/   \_ __|__ |  \_| ______|
                                           
class createManyMixin:
    # this is a method is GenericViewAPI
    def get_serializer(self, *args, **kwargs):
        print("[get_serializer OVERRIDE]")
        print(kwargs)
        print(kwargs.get('data', {}).get("frame_image"))
        if isinstance(kwargs.get('data', {}).get("frame_image"), list):
            # pass many=True is all it takes to do bulk create
            print("[CREATE MANY MIXIN] bulk create triggered!")
            #print("Creating {} objects".format(kwargs.get()))
            print(kwargs)
            kwargs['many'] = True

        return super().get_serializer(*args, **kwargs)


        



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


class Chapter64_APIDetailView(generics.RetrieveAPIView):
    
    queryset = Chapter.objects.all()
    serializer_class = ChapterModelSerializer
    lookup_field = 'id64'

    def get_queryset(self):
        return Chapter.objects.all()


# http://patorjk.com/software/taag/#p=display&f=Cyberlarge&t=Scene
# _______ _______ _______ __   _ _______
# |______ |       |______ | \  | |______
# ______| |_____  |______ |  \_| |______
                                       

class SceneAPIListView(generics.ListAPIView):
    # Similar to above, but only lists scene under a chapter

    # queryset = Scene.objects.all() # see get_queryset() below
    serializer_class = SceneModelSerializer
    
    def get_queryset(self):
        # TODO: any reason you set this to default to "1"?
        _chapter_pk = self.kwargs['pk'] if ('pk' in self.kwargs) else '-1'

        if _chapter_pk > 0:
            return Scene.objects.filter(chapter__id=_chapter_pk)
        else:
            return None


class SceneAPIPlaybackListView(generics.ListAPIView):
    # Similar to above, but only lists scene with Playback info

    serializer_class = SceneModelPlayBackSerializer
    
    def get_queryset(self):
        _chapter_pk = self.kwargs['pk'] if ('pk' in self.kwargs) else '-1'

        if _chapter_pk > 0:
            return Scene.objects.filter(chapter__id=_chapter_pk)
        else:
            return None



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
    

# Just for playback!
class SceneAPIPlaybackDetailView(generics.RetrieveAPIView):
    
    queryset = Scene.objects.all()
    serializer_class = SceneModelPlayBackSerializer
    


class SceneCreateAPIView(generics.CreateAPIView):
    serializer_class = SceneModelSerializer

class SceneUpdateAPIView(generics.UpdateAPIView):
    serializer_class = SceneModelSerializer

    def get_queryset(self):
        return Scene.objects.all()
    
    def partial_update(self, request, *args, **kwargs):
        # TODO: Currently PATCH request for Scene assumes only ONE FIELD changes at a time
        #       Investigate if this is desirable or not

        changes = {}

        if 'movie_url' in request.data:
            # This updates only the url of the movie. Update is currently done by Lambda, not the user.
            new_url = request.data['movie_url']

            # TODO: verify this is actually in s3!

            scene = Scene.objects.filter(pk=kwargs['pk'])[0]
            old_url = scene.movie_url
            scene.movie_url = new_url
            scene.save() # this may seem redundant, but if I don't do this, it reverts when playback updates

            changes['movie_url'] = {
                'new_url': scene.movie_url,
                'old_url': old_url
            }

        if 'playback' in request.data:
            # This APPENDS playback into with the new one. It does not replace. 
      
            new_playback = request.data['playback']
            
            # Don't use below. For some reason, python thinks the data is string, even though it's json
            print(new_playback)

            try:
                new_playback = json.loads(new_playback)
            except:
                print("Failed to load the new_playback. It's not stringy enough")
                new_playback = {}
           
            scene = Scene.objects.filter(pk=kwargs['pk'])[0]
            STACK_LIMIT = 3
        
            # get the original
            playback_data = {}
            try:
                playback_data = json.loads(scene.playback)
            except:
                print("Existing playback data is not valid. Starting playback stack from scratch.")
                playback_data = {}
        
            # update movie information just in case
            playback_data['movie_filename'] = scene.movie_url

            if len(playback_data.keys()) == 0 or 'playback_stack' not in playback_data:
                playback_data['playback_stack'] = []
            
            # add to the stack
            playback_stack = playback_data['playback_stack']

            while len(playback_stack) >= STACK_LIMIT:
                playback_stack.pop(-1) # Make space 

            # Validate new playback
            print("Playback validation -------------------------------")
            print(json.dumps(new_playback))
            playback_status = 0
            if (
                'strips' in new_playback and len(new_playback['strips']) > 0 and 
                'frame_count' in new_playback['strips'][0] and new_playback['strips'][0]['frame_count'] > 0
                ):
                # Valid. At least one frame can be played
                print("Playback added.")

                playback_stack.append(new_playback)
                playback_status = 1
            else:
                # Not valid. Do not push.
                pass
                
            # You updated reference to the playback stack, so it should be updated?
            scene.playback = json.dumps(playback_data)
            
            changes['playback'] = {
                'playback_status': playback_status,
                'scene_playback_data': playback_data,
            }

        # SAVE!
        if changes:
            scene.save()

        # More generic response just for the movie field
        return JsonResponse({
            'scene_id': scene.id, 
            'changes' : changes
        })





 # _______ _______  ______ _____  _____ 
 # |______    |    |_____/   |   |_____]
 # ______|    |    |    \_ __|__ |      
                                      

class StripCreateAPIView(generics.CreateAPIView):
    serializer_class = StripModelSerializer


class StripUpdateAPIView(generics.UpdateAPIView):
    serializer_class = StripModelSerializer

    def get_queryset(self):
        return Strip.objects.all()
    
    def partial_update(self, request, *args, **kwargs):

        return super(StripUpdateAPIView, self).partial_update(request, *args, **kwargs)


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
 
                # Remove old images.
                # DON'T remove if the frame's resource is mirrored
                if not frame.is_mirroring:
                    print("")
                    print("======= PATCH: removing old images =========")
                    thumbnailer_helpers.delete_frame_images(frame)
                    print("=============================================")
                    print("")
                else:
                    print("======= Frame is mirrored: image not deleted =========")


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