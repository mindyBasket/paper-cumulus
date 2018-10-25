from rest_framework import serializers
import easy_thumbnails.files as easy_th_files
from django.conf import settings


from ..models import (
    Book,
    Chapter,
    Scene,
    Strip,
    Frame
)


# .................................................. 
# .................................................. 
#                   api/book/{#}
# .................................................. 
# .................................................. 


# http://patorjk.com/software/taag/#p=display&f=Cyberlarge&t=Frame
# .................................................. 
# _______  ______ _______ _______ _______
# |______ |_____/ |_____| |  |  | |______
# |       |    \_ |     | |  |  | |______
# ..................................................                                   
# Custom field for retrieving thumbnail paths 



class ThumbnailField(serializers.Field):

    # By default field values are treated as mapping to an attribute on the object. 
    # If you need to customize how the field value is accessed and set you need to override 
    # using get_attribute()
    def get_attribute(self, instance):
        # print("============ get_attribute =============")
        # We pass the object instance onto `to_representation`,
        # not just the field attribute.
        return instance
        

    #  convert the initial datatype into a primitive, serializable datatype.
    def to_representation(self, value):
        """
        Serialize Frame's thumbnail.
        """
        # print("============ thumbnail repr =============")
        thumbnailer = easy_th_files.get_thumbnailer(value.frame_image)
        aliases = settings.THUMBNAIL_ALIASES['']
        thumb_dict = {}

        for alias, val in aliases.items():
            # if 'ALIAS' in val:
            #     del val['ALIAS']
            # Problem, the 'size' tuple is converted into an array when passed through DRF.
            if 'size' in val:
                val['size'] = tuple(val['size']) # it's pointing, so no need to replace/append
            
            thumb = thumbnailer.get_existing_thumbnail(val)
            if thumb != None:
                thumb_dict[alias] = thumb.url

        if not thumb_dict:
            # if no thumb is found, it may be using old options for each alias
            print("Using old alias look up for: {}".format(thumbnailer))
            aliases_old = {
                'cell': {'size': (100, 100), 'autocrop': True},
                'thumb': {'size': (300, 300), 'autocrop': True}
            }       
            for alias, val in aliases_old.items():
                thumb = thumbnailer.get_existing_thumbnail(val)
                if thumb != None:
                    thumb_dict[alias] = thumb.url

        return thumb_dict

    # restore a primitive datatype into its internal python representation. 
    # This method should raise a serializers.ValidationError if the data is invalid.
    def to_internal_value(self, data):
        # data = data.strip('rgb(').rstrip(')')
        # red, green, blue = [int(col) for col in data.split(',')]
        
        # if not re.match(r'^rgb\([0-9]+,[0-9]+,[0-9]+\)$', data):
        # raise ValidationError('Incorrect format. Expected `rgb(#,#,#)`.')

        # return Color(red, green, blue)
        print("============ to_internal_value =============")
        return "to_internal_value not implemented."


class FrameModelSerializer(serializers.ModelSerializer):
    
    # strip = serializers.PrimaryKeyRelatedField(source='strip', read_only=True, required=True)
    frame_image_thumbs = ThumbnailField(required=False)

    class Meta:
        model = Frame
        fields = [
            'id',
            'ignored',
            'note',
            'strip',
            'dimension',
            'frame_image',
            "frame_image_thumbs",
            ]
        #read_only_fields = ('frame_image',)







# ..................................................  
# _______ _______  ______ _____  _____ 
# |______    |    |_____/   |   |_____]
# ______|    |    |    \_ __|__ |      
# ..................................................                                        


class StripModelSerializer(serializers.ModelSerializer):

    frames = FrameModelSerializer(many=True, read_only=True, source='frame_set')

    class Meta:
        model = Strip
        fields = [
            'id',
            'scene',
            'order',
            'dimension',
            'description',
            'children_li',
            # 'frame_set' # only returns IDs
            'frames'
            ]





# ..................................................  
# _______ _______ _______ __   _ _______
# |______ |       |______ | \  | |______
# ______| |_____  |______ |  \_| |______
# ..................................................  

            
class SceneModelSerializer(serializers.ModelSerializer):
    
    # strips = serializers.PrimaryKeyRelatedField(many=True, read_only=True)
    # strips = serializers.StringRelatedField(many=True, read_only=True) -> output str
    strips = StripModelSerializer(many=True, read_only=True, source='strip_set')
    
    class Meta:
        model = Scene
        fields = [
            'id',
            'chapter',
            'children_li',
            'name',
            'strips',
        ]
        
        


# ..................................................  
# _______ _     _ _______  _____  _______ _______  ______
# |       |_____| |_____| |_____]    |    |______ |_____/
# |_____  |     | |     | |          |    |______ |    \_
# ..................................................                                                          

class ChapterModelSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = Chapter
        fields = [
            'id',
            'number',
            'title',

        ]



# ..................................................  
# _______ _     _ _______  _____  _______ _______  ______
# |       |_____| |_____| |_____]    |    |______ |_____/
# |_____  |     | |     | |          |    |______ |    \_
# ..................................................                                                          

class BookModelSerializer(serializers.ModelSerializer):
    
    chapters = ChapterModelSerializer(many=True, read_only=True, source='chapter_set')

    class Meta:
        model = Book
        fields = [
            'id',
            'title',
            'slug',
            'chapters'

        ]