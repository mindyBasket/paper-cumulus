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
            'order',
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
    

  