"""
Root schema file:
Currently there is only 1 app that is using GraphQL and that is 'storypiper'.
There will be others, like storypiper-view, and storypiper-editor. 
When you do, make sure to add the query here for the Query.
"""
import graphene
import storypiper.schema

class Query(
    storypiper.schema.Query,
    graphene.ObjectType
):
    pass

class Mutation(
    storypiper.schema.Mutation,
    graphene.ObjectType
):
    pass

schema = graphene.Schema(query=Query, mutation=Mutation)
