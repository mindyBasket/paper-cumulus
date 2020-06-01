import json
import graphene
from graphene import relay, ObjectType
from graphene_django import DjangoObjectType
from graphene_django.filter import DjangoFilterConnectionField
from graphql import GraphQLError

from django.db.models import Q
from .. import models

# Note: if you add new object here, make sure you update the "entry point" in
#       proj_cumulus/schema.py

# Interfaces
# TODO: learn about Interfaces here: https://docs.graphene-python.org/en/latest/types/interfaces/
# This a reminder for you add interface later for sake of practice

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
    # Similar to "Argument", but you can pass a whole object into Input.
    # Note that "Argument" is depreciated in Graphene 2.0
    class Input:
        title = graphene.String()
        description = graphene.String() # there has to be a way to make this optional
        series_id = graphene.Int()

    @classmethod
    def mutate_and_get_payload(cls, root, info, **input):
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
    
    # output type
    flipbook = graphene.Field(FlipbookNode) 

class UpdateFlipbook(graphene.relay.ClientIDMutation):
    class Input:
        pk = graphene.Int(required=True)

        title = graphene.String()
        description = graphene.String()

    @classmethod
    def mutate_and_get_payload(cls, root, info, **input):
        # grab the flipbook?
        pk = input.get('pk')
        updated_flipbook = models.Flipbook.objects.filter(pk=pk).first()

        if updated_flipbook:
            for key, value in input.items():
                if (key == 'title') and not value:
                    raise Exception('A flipbook cannot have an empty title!')
                else:
                    setattr(updated_flipbook, key, value)
        else:
            raise Exception('Could not find Flipbook to edit!')

        updated_flipbook.save()
        return UpdateFlipbook(flipbook=updated_flipbook)

    # output type
    flipbook = graphene.Field(FlipbookNode)

# TODO: eventually I would like to add an "archive" behavior, so that you can
#       'undo' deletion.

# Learn more about json dumps: https://docs.python.org/3/library/json.html
class DeleteFlipbook(graphene.relay.ClientIDMutation):
    # output type
    response = graphene.String()

    class Input:
        gid = graphene.ID(required=True)

    @classmethod
    def mutate_and_get_payload(cls, root, info, **input):
        # pk = relay.Node.from_global_id(input.get('id'))[1]
        # target_flipbook = models.Flipbook.objects.get(pk=pk)
        target_flipbook = relay.Node.get_node_from_global_id(
            info,
            input.get('gid'),
            only_type=FlipbookNode
        )

        if target_flipbook:

            object_deleted = {
                'id64': target_flipbook.id64,
                'title': target_flipbook.title
            }
            if target_flipbook.series:
                object_deleted['series__title'] = target_flipbook.series.title

            response_json = {
                'success': True,
                'object_deleted': object_deleted
            }

            target_flipbook.delete()
            return cls(response=json.dumps(response_json))

        else:
            raise Exception('Could not find Flipbook to delete!')

class Mutation(graphene.ObjectType):
    create_flipbook = CreateFlipbook.Field()
    update_flipbook = UpdateFlipbook.Field()
    delete_flipbook = DeleteFlipbook.Field()
