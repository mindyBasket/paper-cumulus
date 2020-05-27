import graphene
import storypiper.schema

class Query(storypiper.schema.Query, graphene.ObjectType):
    pass

schema = graphene.Schema(query=Query)
