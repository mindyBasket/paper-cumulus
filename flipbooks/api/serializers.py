from rest_framework import serializers

from ..models import (
    Scene,
    Strip,
    Frame
)

class SceneModelSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = Scene
        fields = [
            'id',
            'children_orders',
            'name'
        ]