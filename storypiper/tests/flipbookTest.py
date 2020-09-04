import json
import unittest
from django.test import TestCase
from graphene_django.utils.testing import GraphQLTestCase
from proj_cumulus.schema import schema
from .. import models

# I am using Django's TestCase to test GraphQL queries, but Graphene is equipped with GraphQLTestCase,
# which is designed for unittest. I could not get it work though, but may be worth looking into more:
# https://docs.graphene-python.org/projects/django/en/latest/testing/


class StorypiperQueryTestCase(GraphQLTestCase):

    # Here you need to inject your test case's schema
    GRAPHQL_SCHEMA = schema
    GRAPHQL_URL = "/grphi/"

    initial_data = []

    def setUp(self):
        super().setUp()

        # TODO: wonder if this can be of fixture data? (unfortunately can't do it in a way you'd do like in js)
        # TODO: change the name 'id' here. it's confusing. It's not used anywhere in the server side.
        self.initial_data = [
            {
                'id': '1',
                'title': "Test Flipbook One"
            },
            {
                'id': '2',
                'title': "Test Flipbook Two - CodeBlue"
            },
            {
                'id': '3',
                'title': "Test Flipbook Three - CodeBlue"
            },
        ]

        models.Flipbook.objects.create(title=self.initial_data[0]['title'])
        models.Flipbook.objects.create(title=self.initial_data[1]['title'])
        models.Flipbook.objects.create(title=self.initial_data[2]['title'])

    def test_query_objects(self):
        '''test that graphene server queries'''

        # NOTE: changes to the database that are made within one subtest
        #       will persist in any subsequent subtests until the end of the test

        with self.subTest("queries all Flipbooks"):
            response = self.query(
                '''
                query SearchFromEverything {
                    allFlipbooks(search: "Test") {
                        pk
                        id64
                        title
                        description
                        series {
                        isDemo
                        title
                        }
                    }
                }
                '''
            )

            # The operation name is a meaningful and explicit name for your operation.
            # It is only required in multi-operation documents, but its use is encouraged because
            # it is very helpful for debugging and server-side logging.
            # https://graphql.org/learn/queries/#operation-name

            # This validates the status code and if you get errors
            self.assertResponseNoErrors(response)

            content = json.loads(response.content)
            flipbooks = content['data']['allFlipbooks']
            self.assertEqual(len(flipbooks), 3, "Queried 3 flipbooks")

            for i, flipbook in enumerate(flipbooks):
                self.assertEqual(flipbook['pk'], str(i+1))
                self.assertEqual(flipbook['title'], self.initial_data[i]['title'])
                self.initial_data[i]['id64'] = flipbook['id64']

        with self.subTest("queries all Flipbooks with title filter"):
            response = self.query(
                '''
                query ByTitle($searchTitle: String!) {
                    allFlipbooksByTitle(title: $searchTitle) {
                    pk
                    id64
                    title
                    }
                }
                ''',
                variables={'searchTitle': "CodeBlue"}
            )

            content = json.loads(response.content)
            self.assertResponseNoErrors(response)

            filtered_flipbooks = content['data']['allFlipbooksByTitle']
            expected_flipbook_index = [1, 2]

            for i, expected_index in enumerate(expected_flipbook_index):
                self.assertEqual(
                    filtered_flipbooks[i]['pk'], self.initial_data[expected_index]['id'])
                self.assertEqual(
                    filtered_flipbooks[i]['title'], self.initial_data[expected_index]['title'])
                self.assertEqual(
                    filtered_flipbooks[i]['id64'], self.initial_data[expected_index]['id64'])


        with self.subTest("queries individual Flipbook using id64"):
            for i, flipbook_data in enumerate(self.initial_data):

                response = self.query(
                    '''
                    query ($targetId64: String!)  {
                    flipbook(id64: $targetId64){
                        pk
                        id64
                        title
                    }
                    }
                    ''',
                    variables={'targetId64': flipbook_data['id64']}
                )

                content = json.loads(response.content)
                self.assertResponseNoErrors(response)

                # check each props
                flipbook = content['data']['flipbook']
                self.assertEqual(flipbook['pk'], flipbook_data['id'])
                self.assertEqual(flipbook['pk'], str(i+1))
                self.assertEqual(flipbook['id64'], flipbook_data['id64'])
                self.assertEqual(flipbook['title'], flipbook_data['title'])
        
        with self.subTest("queries individual Flipbook using id/pk"):
            for i, flipbook_data in enumerate(self.initial_data):

                response = self.query(
                    '''
                    query ThatONEFlipbook($targetId: Int!)  {
                    flipbook(id: $targetId){
                        pk
                        id64
                        title
                    }
                    }
                    ''',
                    variables={'targetId': i+1}
                )

                content = json.loads(response.content)
                self.assertResponseNoErrors(response)

                # check each props
                flipbook = content['data']['flipbook']
                self.assertEqual(flipbook['pk'], str(i+1))
                self.assertEqual(flipbook['id64'], flipbook_data['id64'])
                self.assertEqual(flipbook['title'], flipbook_data['title'])

        with self.subTest("queries individual Flipbook using id64"):
            for i, flipbook_data in enumerate(self.initial_data):

                response = self.query(
                    '''
                    query ThatONEFlipbook($targetId64: String!)  {
                    flipbook(id64: $targetId64){
                        pk
                        id64
                        title
                    }
                    }
                    ''',
                    variables={'targetId64': self.initial_data[i]['id64']}
                )

                content = json.loads(response.content)
                self.assertResponseNoErrors(response)

                # check each props
                flipbook = content['data']['flipbook']
                self.assertEqual(flipbook['pk'], str(i+1))
                self.assertEqual(flipbook['id64'], flipbook_data['id64'])
                self.assertEqual(flipbook['title'], flipbook_data['title'])

        with self.subTest('queries multiple requests, one individual flipbook, and one all flipbooks'):
            target_individual_data_index = 1

            response = self.query(
                '''
                query FlipbooksRelevantToMyInterest($targetId: Int!){
                    IndividualStory: flipbook(id: $targetId) {
                        title
                    }
                    AllTestStories: allFlipbooksByTitle(title: "Test") {
                        title
                    }
                }
                ''',
                variables={'targetId': self.initial_data[target_individual_data_index]['id']}
            )

            content = json.loads(response.content)
            self.assertResponseNoErrors(response)

            individual_flipbook = content['data']['IndividualStory']
            all_of_flipbooks = content['data']['AllTestStories']

            self.assertEqual(
                individual_flipbook['title'], self.initial_data[target_individual_data_index]['title'])
            self.assertEqual(len(all_of_flipbooks), 3)
            for i, flipbook_data in enumerate(self.initial_data):
                self.assertEqual(
                    all_of_flipbooks[i]['title'], self.initial_data[i]['title'])

    def test_mutate_objects(self):
        '''test mutation(Create, Update, Delete) of object'''

        with self.subTest('auto generates id64 and sets series as None for newly mutated object'):
            test_input_data = {
                'title': 'Test Flipbook Four (graphQLed)',
                'description': 'best description',
                # 'seriesId': 1,
            }

            response = self.query(
                '''
                mutation TestCreateStorylet($input: CreateStoryletInput!) {
                    MyAwesomeNewStorylet: createFlipbook(
                        inputData: $input
                    ) {
                        success
                        flipbook {
                            pk
                            id64
                            title
                            description
                            series {
                                id
                                title
                            }
                        }
                    }
                }          
                ''',
                input_data=test_input_data
            )

            content = json.loads(response.content)
            self.assertResponseNoErrors(response)

            new_flipbook = content['data']['MyAwesomeNewStorylet']['flipbook']

            self.assertTrue(new_flipbook['pk'])
            self.assertTrue(new_flipbook['id64'])
            self.assertEqual(new_flipbook['title'], test_input_data['title'])
            self.assertEqual(
                new_flipbook['description'], test_input_data['description'])
            self.assertIsNone(new_flipbook['series'])

             # store info for next test
            self.initial_data.append({
                'id': new_flipbook['pk'],
                'id64': new_flipbook['id64'],
                'title': new_flipbook['title'],
                'description': new_flipbook['description']
            })

        # TODO: test mutation failure when the series does not exist

        with self.subTest('patch updates object with specified field in the input'):
            target_flipbook_pk = 4
            test_input_data = {
                'pk': target_flipbook_pk,
                'description': 'Updating description during unit test'
            }

            response = self.query(
                '''
                mutation TestUpdateStorylet($input: UpdateStoryletInput!) {
                    MyUpdatedStorylet: updateFlipbook(
                        inputData: $input
                    ) {
                        success
                        flipbook {
                            pk
                            id64
                            title
                            description
                            series{
                                pk
                            }
                        }
                    }
                }          
                ''',
                input_data=test_input_data
            )

            content = json.loads(response.content)
            self.assertResponseNoErrors(response)
            updated_flipbook = content['data']['MyUpdatedStorylet']['flipbook']

            self.assertEqual(
                updated_flipbook['description'], test_input_data['description'])

            # check that rest of the field are unchanged
            self.assertEqual(
                updated_flipbook['pk'], self.initial_data[target_flipbook_pk-1]['id'])
            self.assertEqual(
                updated_flipbook['id64'], self.initial_data[target_flipbook_pk-1]['id64'])
            self.assertEqual(
                updated_flipbook['title'], self.initial_data[target_flipbook_pk-1]['title'])
            self.assertEqual(updated_flipbook['series'], None)

        with self.subTest('deletes object and returns the storylet object with partial information'):
            target_flipbook_pk = 4
            response = self.query(
                '''
                mutation TestDeleteStorylet ($targetPk: Int!) {
                    DeletedStorylet: deleteFlipbook(pk: $targetPk) {
                        success
                        flipbook {
                            title
                        }
                    }
                }
                ''',
                variables={'targetPk': target_flipbook_pk}
            )

            content = json.loads(response.content)
            self.assertResponseNoErrors(response)
            self.assertTrue(content['data']['DeletedStorylet']['success'])
            deleted_storylet = content['data']['DeletedStorylet']['flipbook']

            self.assertEqual(deleted_storylet['title'], self.initial_data[-1]['title'])
        
        # with self.subTest('does not delete object if the object is not found'):
        #     target_flipbook_pk = 4
        #     response = self.query(
        #         '''
        #         mutation TestDeleteStorylet ($targetPk: Int!) {
        #             DeletedStorylet: deleteFlipbook(pk: $targetPk) {
        #                 success
        #                 flipbook {
        #                     title
        #                 }
        #             }
        #         }
        #         ''',
        #         variables={'targetPk': target_flipbook_pk}
        #     )

        #     content = json.loads(response.content)
        #     self.assertResponseHasErrors(response)




# # If you want to use python's TestCase, do it this way:
# # @unittest.skip("Example code for testing GraphQL using Django's TestCase")
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
