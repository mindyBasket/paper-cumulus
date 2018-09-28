from rest_framework import serializers

from ..models import (
    Scene,
    Strip,
    Frame
)


# .................................................. 
# .................................................. 
#                   api/book/{#}
# .................................................. 
# .................................................. 

class FrameModelSerializer(serializers.ModelSerializer):
    
    # strip = serializers.PrimaryKeyRelatedField(source='strip', read_only=True, required=True)
    
    class Meta:
        model = Frame
        fields = [
            'id',
            'note',
            'strip',
            'frame_image'
            ]
        #read_only_fields = ('frame_image',)

class StripModelSerializer(serializers.ModelSerializer):

    frames = FrameModelSerializer(many=True, read_only=True, source='frame_set')

    class Meta:
        model = Strip
        fields = [
            'id',
            'scene',
            'order',
            'description',
            'children_li',
            # 'frame_set' # only returns IDs
            'frames'
            ]
            
class SceneModelSerializer(serializers.ModelSerializer):
    
    # strips = serializers.PrimaryKeyRelatedField(many=True, read_only=True)
    # strips = serializers.StringRelatedField(many=True, read_only=True) -> output str
    strips = StripModelSerializer(many=True, read_only=True, source='strip_set')
    
    class Meta:
        model = Scene
        fields = [
            'id',
            'children_li',
            'name',
            'strips',
        ]
        
        
