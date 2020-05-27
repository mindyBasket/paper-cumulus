import graphene
from graphene_django import DjangoObjectType

from .. import models


class FlipbookType(DjangoObjectType):
    class Meta:
        model = models.Flipbook


class Query(graphene.ObjectType):
    flipbooks = graphene.List(FlipbookType)

    def resolve_flipbooks(self, info, **kwargs):
        return models.Flipbook.objects.all()