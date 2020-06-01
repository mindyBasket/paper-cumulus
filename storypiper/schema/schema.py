import graphene
from graphene import relay, ObjectType
from graphene_django import DjangoObjectType
from graphene_django.filter import DjangoFilterConnectionField
from graphql import GraphQLError

from django.db.models import Q

from .. import models


# Note: if you add new object here, make sure you update the "entry point" in
#       proj_cumulus/schema.py

# Graphene will automatically map the Category model's fields onto the CategoryNode.
# This is configured in the CategoryNode's Meta class (as you can see below)

# More about ObjectType meta fields: https://docs.graphene-python.org/projects/django/en/latest/queries/
class SeriesNode(DjangoObjectType):
    class Meta:
        model = models.Series
        filter_fields = ['title']
        interfaces = (relay.Node, )
    
    pk = graphene.Int(source='pk')



class FlipbookNode(DjangoObjectType):
    class Meta:
        model = models.Flipbook
        # Allow for some more advanced filtering here
        filter_fields = {
            'id64': ['exact'],
            'title': ['exact', 'icontains', 'istartswith'],
            'description': ['exact', 'icontains'],
            'series__title': ['exact', 'icontains'],
        }
        interfaces = (relay.Node,)

    pk = graphene.Int(source='pk')

# Resolvers
class Query(graphene.ObjectType):
    flipbook = relay.Node.Field(FlipbookNode)
    all_flipbooks = DjangoFilterConnectionField(FlipbookNode)

    series = relay.Node.Field(SeriesNode)
    all_seriess = DjangoFilterConnectionField(SeriesNode)

class CreateFlipbook(graphene.relay.ClientIDMutation):    
    flipbook = graphene.Field(FlipbookNode)

    # Similar to "Argument", but you can pass a whole object into Input
    class Input:
        title = graphene.String()
        description = graphene.String() # there has to be a way to make this optional
        series_id = graphene.Int()

    def mutate_and_get_payload(root, info, **input):
        # user = info.context.user or None
        series = None
        series_id = input.get('series_id')
        if series_id:
            series = models.Series.objects.filter(id=series_id).first()
            if not series:
                raise Exception('Cannot find series with id {}!'.format(series_id))

        flipbook = models.Flipbook(
            title=input.get('title'),
            description=input.get('description'),
            series=series
        )
        flipbook.save()

        return CreateFlipbook(flipbook=flipbook)

class Mutation(graphene.ObjectType):
    create_flipbook = CreateFlipbook.Field()
