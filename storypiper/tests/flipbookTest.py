import json
import unittest

from django.test import TestCase
# from graphene.test import Client
from graphene_django.utils.testing import GraphQLTestCase
from proj_cumulus.schema import schema
from .. import models

# I am using Django's TestCase to test GraphQL queries, but Graphene is equipped with GraphQLTestCase,
# which is designed for unittest. I could not get it work though, but may be worth looking into more:
# https://docs.graphene-python.org/projects/django/en/latest/testing/

class MyFancyQLTestCase(GraphQLTestCase):

    # Here you need to inject your test case's schema
    GRAPHQL_SCHEMA = schema
    GRAPHQL_URL = "/grphi/"

    initial_data = []

    def setUp(self):
        super().setUp()
        # TODO: wonder if this can be of fixture data? (unfortunately can't do it in a way you'd do like in js)
        self.initial_data = [
            {   
                'id': '',
                'title': "Test Flipbook One"
            },
            {   
                'id': '',
                'title': "Test Flipbook Two"
            },
            {
                'id': '',
                'title': "Test Flipbook Three"
            },
        ]

        models.Flipbook.objects.create(title=self.initial_data[0]['title'])
        models.Flipbook.objects.create(title=self.initial_data[1]['title'])
        models.Flipbook.objects.create(title=self.initial_data[2]['title'])

    def test_query_objects(self):
        '''test that graphene server queries'''

        # Note: changes to the database that are made within one subtest 
        #       will persist in any subsequent subtests until the end of the test

        with self.subTest("queries all Flipbooks"):
            response = self.query(
                '''
                query {
                    allFlipbooks {
                        edges {
                            node {
                                id
                                pk
                                id64
                                series {
                                    id
                                }
                            }
                        }
                    }
                }
                ''',
                # op_name='allFlipbooks'
            )

            # The operation name is a meaningful and explicit name for your operation. 
            # It is only required in multi-operation documents, but its use is encouraged because it is very helpful for debugging and server-side logging. 
            # https://graphql.org/learn/queries/#operation-name

            # This validates the status code and if you get errors
            self.assertResponseNoErrors(response)

            content = json.loads(response.content)
            flipbooks = content['data']['allFlipbooks']['edges']
            self.assertEqual(len(flipbooks), 3, "Queried 3 flipbooks")

            # save GIds for next subTest

            for i, flipbook_node in enumerate(flipbooks):
                flipbook = flipbook_node['node']
                self.assertTrue(flipbook['id'])
                self.initial_data[i]['id'] = flipbook['id']
                self.initial_data[i]['id64'] = flipbook['id64']
        
        with self.subTest("queries all Flipbooks with filter"):
            response = self.query(
                '''
                query filterFlipbooks($searchTitle: String!) {
                    allFlipbooks(title_Icontains: $searchTitle){
                        edges{
                            node{
                                id
                                id64
                                title
                            }
                        }
                    }
                }
                ''',
                variables={'searchTitle': "Two"}
            )

            content = json.loads(response.content)
            self.assertResponseNoErrors(response)

            filtered_flipbooks = content['data']['allFlipbooks']['edges']
            first_flipbook_node = filtered_flipbooks[0]['node']
            self.assertEqual(first_flipbook_node['id'], self.initial_data[1]['id'])
            self.assertEqual(first_flipbook_node['title'], self.initial_data[1]['title'])

        with self.subTest("queries individual Flipbook using global id, with all requested properties"):
            for i, flipbook_data in enumerate(self.initial_data):

                response = self.query(
                    '''
                    query GetIndividualFlipbook($id: ID!){
                        flipbook(id: $id) {
                            id
                            pk
                            id64
                            title
                        }
                    }
                    ''',
                    # op_name='myModel',
                    variables={'id': flipbook_data['id']}
                )

                content = json.loads(response.content)
                self.assertResponseNoErrors(response)

                # check each props
                flipbook = content['data']['flipbook']
                self.assertEqual(flipbook['id'], flipbook_data['id'])
                self.assertEqual(flipbook['pk'], i+1)
                self.assertTrue(flipbook['id64'])
                self.assertEqual(flipbook['title'], flipbook_data['title'])
            
        with self.subTest('queries multiple requests, one individual flipbook, and one all flipbooks'):
            response = self.query(
                '''
                query GetJustOneFlipbook($id: ID!) {
                    thatOneFlipbook: flipbook(id: $id){
                        id
                        id64
                        title
                    }
                    allOfFlipbooks: allFlipbooks(title_Icontains:"Test"){
                        edges{
                            node{
                                id
                                id64
                                title
                            }
                        }
                    }
                }
                ''',
                variables={'id': self.initial_data[0]['id']}
            )

            content = json.loads(response.content)
            self.assertResponseNoErrors(response)

            individual_flipbook = content['data']['thatOneFlipbook']
            all_of_flipbooks = content['data']['allOfFlipbooks']['edges']

            self.assertEqual(individual_flipbook['id'], self.initial_data[0]['id'])
            self.assertEqual(individual_flipbook['title'], self.initial_data[0]['title'])
            self.assertEqual(len(all_of_flipbooks), 3)

    def test_mutate_objects(self):
        '''test mutation(Create, Update, Delete) of object'''

        with self.subTest('auto generates id64 for newly mutated object'):
            test_input_data = {
                'title': 'Test Flipbook Four (graphqled)',
                'description': 'best description',
            }

            response = self.query(
                '''
                mutation TestCreateMutation($input: CreateFlipbookInput!){
                    createFlipbook(input: $input) {
                        myNewAwesomeFlipbook: flipbook {
                            id
                            id64
                            title
                            description
                            series {
                                id
                            }
                        }
                    }
                }
                ''',
                input_data=test_input_data
            )

            content = json.loads(response.content)
            self.assertResponseNoErrors(response)
            new_flipbook = content['data']['createFlipbook']['myNewAwesomeFlipbook']
            
            # check each props
            self.assertTrue(new_flipbook['id'])
            self.assertTrue(new_flipbook['id64'])
            self.assertEqual(new_flipbook['title'], test_input_data['title'])
            self.assertEqual(new_flipbook['description'], test_input_data['description'])

             # store info for next test
            self.initial_data.append({
                'id': new_flipbook['id'],
                'id64': new_flipbook['id64'],
                'title': new_flipbook['title'],
            })

        with self.subTest('sets series id as None(Null) if not set in input'):
            response = self.query(
                '''
                query GetNewlyCreatedFlipbook($id: ID!){
                    flipbook(id: $id){
                        id
                        series {
                            id
                        }
                    }
                }
                ''',
                variables={'id': self.initial_data[-1]['id']}
            )

            content = json.loads(response.content)
            self.assertResponseNoErrors(response)

            new_flipbook = content['data']['flipbook']
            self.assertEqual(new_flipbook['series'], None)

        with self.subTest('patch updates object with specified field in the input'):
            new_flipbook_pk = 4
            test_input_data = {
                'pk': new_flipbook_pk,
                'description': 'Updating description during unit test'
            }

            response = self.query(
                '''
                mutation TestUpdateFlipbook($input: UpdateFlipbookInput!){
                    updateFlipbook(input: $input) {
                        myPatchUpdatedFlipbook: flipbook {
                            id
                            id64
                            title
                            description
                            series {
                                id
                            }
                        }
                    }
                }
                ''',
                input_data=test_input_data
            )

            content = json.loads(response.content)
            self.assertResponseNoErrors(response)
            updated_flipbook = content['data']['updateFlipbook']['myPatchUpdatedFlipbook']

            self.assertEqual(updated_flipbook['description'], test_input_data['description'])

            # check that rest of the field are unchanged
            self.assertEqual(updated_flipbook['id'], self.initial_data[new_flipbook_pk-1]['id'])
            self.assertEqual(updated_flipbook['id64'], self.initial_data[new_flipbook_pk-1]['id64'])
            self.assertEqual(updated_flipbook['title'], self.initial_data[new_flipbook_pk-1]['title'])
            self.assertEqual(updated_flipbook['series'], None)

        with self.subTest('deletes object and returns some information about the deleted data'):
            test_input_data = {
                'gid': self.initial_data[-1]['id'],
            }

            response = self.query(
                '''
                mutation TestDeleteFlipbook ($input: DeleteFlipbookInput!) {
                    deleteFlipbook(input: $input) {
                        response
                    }
                }
                ''',
                input_data=test_input_data
            )

            content = json.loads(response.content)
            self.assertResponseNoErrors(response)
            deletion_response = content['data']['deleteFlipbook']['response']
            deletion_content = json.loads(deletion_response)
            self.assertTrue(deletion_content['success'])

            deleted_flipbook = deletion_content['object_deleted']
            self.assertEqual(deleted_flipbook['id64'], self.initial_data[-1]['id64'])
            self.assertEqual(deleted_flipbook['title'], self.initial_data[-1]['title'])




# If you want to use python's TestCase, do it this way:
# @unittest.skip("Example code for testing GraphQL using Django's TestCase")
class MyFancyTestCase(TestCase):

    def setUp(self):
        models.Flipbook.objects.create(title="Test Flipbook One")
        super().setUp(
        )
    def test_some_query(self):
        self.query = """
            query {
                allFlipbooks {
                    edges {
                        node {
                            id
                            pk
                            id64
                            title
                            description
                            series {
                                id
                            }
                        }
                    }
                }
            }
            """
        result = schema.execute(self.query)
