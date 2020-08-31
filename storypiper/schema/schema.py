import graphene
from graphene_django import DjangoObjectType
from graphql import GraphQLError

from django.db.models import Q
from .. import models

# MAINTANENCE NOTE:
# if you add new object here, make sure you update the "entry point" in
# proj_cumulus/schema.py

# Interfaces Ref: https://docs.graphene-python.org/en/latest/types/interfaces/
class DefaultInterface(graphene.Interface):
    pk = graphene.ID(required=True)
    title = graphene.String(required=False)

# NOTE: Graphene will automatically map the Category model's fields onto the CategoryNode.
# This is configured in the CategoryNode's Meta class (as you can see below)

# More about DjangoObjectType meta fields and filtering: 
# https://docs.graphene-python.org/projects/django/en/latest/queries/
# https://docs.graphene-python.org/projects/django/en/latest/filtering/

class SeriesType(DjangoObjectType):
    class Meta:
        model = models.Series
        interfaces = (DefaultInterface,)

class FlipbookType(DjangoObjectType):
    class Meta:
        model = models.Flipbook
        fields = ('pk', 'id64', 'description', 'series',)
        interfaces = (DefaultInterface, )
    
    # pk = graphene.Int(source='pk') # extra custom field

    # NOTE: define a custom get_queryset method to control filtering on the ObjectType level
    #       instead of the Query object level.
    #       ref: https://docs.graphene-python.org/projects/django/en/latest/queries/#default-queryset

    # @classmethod
    # def get_queryset(cls, queryset, info):
    #     if info.context.user.is_anonymous:
    #         return queryset.filter(published=True)
    #     return queryset

# ref: https://docs.graphene-python.org/en/latest/types/objecttypes/#default-resolver
class DeletedFlipbookType(graphene.ObjectType):
    title = graphene.String()
    # last_name = String()

    @staticmethod
    def resolve_title(parent, info):
        # Arg to this resolve will be a DICT.
        # Dict is not an object in Python. Don't access values using dot operators
        return parent['title']


# Resolvers
class Query(graphene.ObjectType):
    all_flipbooks = graphene.List(
        FlipbookType,
        search=graphene.String(),
        first=graphene.Int(),
        skip=graphene.Int(),
    )

    all_flipbooks_by_title = graphene.List(
        FlipbookType,
        title=graphene.String(),
    )

    flipbook = graphene.Field(
        FlipbookType,
        id=graphene.Int(),
        id64=graphene.String(),
    )

    seriess = graphene.List(SeriesType)

    @staticmethod
    def resolve_all_flipbooks(parent, info, search=None, first=None, skip=None, **kwargs):
        flipbooks_queryset = models.Flipbook.objects.all()

        if search:
            filter = (
                Q(title__icontains=search) |
                Q(description__icontains=search) |
                Q(series__title__icontains=search)
            )
            
            return flipbooks_queryset.filter(filter)
        
        if skip:
            flipbooks_queryset = flipbooks_queryset[skip:]

        if first:
            flipbooks_queryset = flipbooks_queryset[:first]

        return flipbooks_queryset
    
    @staticmethod
    def resolve_all_flipbooks_by_title(parent, info, title):
        return models.Flipbook.objects.filter(title__icontains=title)
    
    @staticmethod
    def resolve_flipbook(parent, info, **kwargs):
        # individual query
        pk = kwargs.get('id')
        id64 = kwargs.get('id64')

        if pk is not None:
            return models.Flipbook.objects.get(pk=pk)

        if id64 is not None:
            return models.Flipbook.objects.get(id64=id64)
        
        return None

    @staticmethod
    def resolve_seriess(parent, info, **kwargs):
        return models.Series.objects.all()



class CreateFlipbook(graphene.Mutation):
    class Arguments:
        title = graphene.String()
        description = graphene.String() # there has to be a way to make this optional
        series_id = graphene.Int()

    def mutate(self, info, title, description="", series_id=None):
        series = None
        if series_id:
            series = models.Series.objects.filter(id=series_id).first()
            if not series:
                raise Exception('Cannot find series with id {}!'.format(series_id))

        new_flipbook = models.Flipbook(title=title, description=description, series=series)
        new_flipbook.save()

        return CreateFlipbook(
            success=True,
            flipbook=new_flipbook
        )
    
    # Outputs: match with mutate payload fields above
    success = graphene.Boolean()
    flipbook = graphene.Field(FlipbookType)

class UpdateFlipbook(graphene.Mutation):
    class Arguments:
        pk = graphene.Int(required=True)
        title = graphene.String()
        description = graphene.String()
        series_id = graphene.Int()

    @classmethod
    def mutate(cls, root, info, **input):
        pk = input.get('pk')
        updated_flipbook = models.Flipbook.objects.filter(pk=pk).first()

        if updated_flipbook:
            for key, value in input.items():
                if (key == 'title') and not value:
                    raise GraphQLError('A flipbook cannot have an empty title!')
                else:
                    setattr(updated_flipbook, key, value)
        else:
            raise GraphQLError('Could not find Flipbook to edit!')

        updated_flipbook.save()
        return cls(
            success=True,
            flipbook=updated_flipbook
        )

    # Outputs: match with mutate payload fields above
    success = graphene.Boolean()
    flipbook = graphene.Field(FlipbookType)

class DeleteFlipbook(graphene.Mutation):
    class Arguments:
        pk = graphene.Int(required=True)

    @classmethod
    def mutate(cls, root, info, **input):
        pk = input.get('pk')
        target_flipbook = models.Flipbook.objects.filter(pk=pk).first()

        if target_flipbook:
            object_deleted = {
                'title': target_flipbook.title
            }

            target_flipbook.delete()
            print("Object deleted!")
            return cls(
                success=True,
                flipbook=object_deleted
            )
        else:
            raise GraphQLError('Could not find Flipbook to delete!') # can also use Exception()
        

    success = graphene.Boolean()
    flipbook = graphene.Field(DeletedFlipbookType)

class Mutation(graphene.ObjectType):
    create_flipbook = CreateFlipbook.Field()
    update_flipbook = UpdateFlipbook.Field()
    delete_flipbook = DeleteFlipbook.Field()
