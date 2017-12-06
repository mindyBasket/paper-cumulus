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


class StripModelSerializer(serializers.ModelSerializer):

    class Meta:
        model = Strip
        fields = [
            'id',
            'scene',
            'order',
            'description',
            'frame_set'
            ]
            
class SceneModelSerializer(serializers.ModelSerializer):
    
    # strips = serializers.PrimaryKeyRelatedField(many=True, read_only=True)
    # strips = serializers.StringRelatedField(many=True, read_only=True) -> output str
    strips = StripModelSerializer(many=True, read_only=True, source='strip_set')
    
    class Meta:
        model = Scene
        fields = [
            'id',
            'children_orders',
            'name',
            'strips',
        ]
        

            
class FrameModelSerializer(serializers.ModelSerializer):

    class Meta:
        model = Frame
        fields = [
            'id',
            'strip',
            'frame_image',
            'frame_image_native'
            ]
        #read_only_fields = ('frame_image',)