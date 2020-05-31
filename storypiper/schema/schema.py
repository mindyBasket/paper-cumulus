import graphene
from graphene_django import DjangoObjectType
from graphql import GraphQLError

from django.db.models import Q

from .. import models


# Note: if you add new object here, make sure you update the "entry point" in
#       proj_cumulus/schema.py

class FlipbookType(DjangoObjectType):
    class Meta:
        model = models.Flipbook

class SeriesType(DjangoObjectType):
    class Meta:
        model = models.Series

class Query(graphene.ObjectType):
    flipbooks = graphene.List(FlipbookType, search=graphene.String())
    seriess = graphene.List(SeriesType)

    def resolve_flipbooks(self, info, search=None, **kwargs):
        # TODO: would be nice to be able to search series name also!
        if search:
            filter = (
                Q(title__icontains=search) |
                Q(description__icontains=search) |
                Q(series__title__icontains=search)
            )
            
            return models.Flipbook.objects.filter(filter)

        return models.Flipbook.objects.all()

    def resolve_seriess(self, info, **kwargs):
        return models.Series.objects.all()


class CreateFlipbook(graphene.Mutation):
    # This must match what you return below
    id64 = graphene.String()
    title = graphene.String()
    description = graphene.String()
    series = graphene.Field(SeriesType)

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

        flipbook = models.Flipbook(title=title, description=description, series=series)
        flipbook.save()

        # respond with the newly created object
        return CreateFlipbook(
            id64=flipbook.id64,
            title=flipbook.title,
            description=flipbook.description,
            series=flipbook.series,
        )

class Mutation(graphene.ObjectType):
    create_flipbook = CreateFlipbook.Field()

