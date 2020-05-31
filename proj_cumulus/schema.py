import graphene
import storypiper.schema

class Query(storypiper.schema.Query, graphene.ObjectType):
    pass

class Mutation(storypiper.schema.Mutation, graphene.ObjectType):
    pass

schema = graphene.Schema(query=Query, mutation=Mutation)