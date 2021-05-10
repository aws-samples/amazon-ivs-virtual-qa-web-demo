import boto3
import decimal
import json
import uuid
import os
from boto3.dynamodb.conditions import Key
from boto3.dynamodb.conditions import Attr
from botocore.exceptions import ClientError

dynamodb = boto3.resource('dynamodb')
questionTable = dynamodb.Table(os.environ['QUESTION_TABLE'])
ivs = boto3.client(service_name='ivs')

MODERATOR_ONLY_ROUTES = [
    '/deleteQuestion',
    '/deleteChannelQuestions',
    '/setCurrentQuestion',
]

def isForbiddenRoute(event):
    claims = event['requestContext']['authorizer']['claims']
    isModerator = 'cognito:groups' in claims and claims['cognito:groups'] == '[moderator]'
    return event['requestContext']['resourcePath'] in MODERATOR_ONLY_ROUTES and not isModerator

def lambdaHandler(event, context):
    print('Received event: ' + json.dumps(event, indent=2))
    
    if isForbiddenRoute(event):
        return {'statusCode': '403'}
    
    if event['requestContext']['resourcePath'] == '/addQuestion':
        try:
            body = json.loads(event['body'])
            questionId = uuid.uuid1().hex
            response = questionTable.put_item(
                Item={
                    'Id': questionId,
                    'ChannelArn': body['channelArn'],
                    'Content': body['question'],
                    'Votes': 0,
                    'Current': False,
                    'Answered': False,
                }
            )
            print(response)
            return {
                'statusCode': '200',
                'body': json.dumps({'id': questionId}),
                'headers': {
                    'Content-Type': 'application/json',
                },
            } 
        except Exception as e:
            print(e)
            return {'statusCode': '500'}
    elif event['requestContext']['resourcePath'] == '/deleteQuestion':
        try: 
            body = json.loads(event['body'])
            response = questionTable.delete_item(
                Key={
                    'Id': body['id'],
                    'ChannelArn': body['channelArn'],
                }
            )
            print(response)
            return {'statusCode': '200'} 
        except Exception as e:
            print(e)
            return {'statusCode': '500'}
        
    elif event['requestContext']['resourcePath'] == '/deleteChannelQuestions':
        try: 
            body = json.loads(event['body'])
            questionKeys = fetchQuestionKeys(body['channelArn'])
            with questionTable.batch_writer() as batch:
                for key in questionKeys:
                    batch.delete_item(Key=key)
            return {'statusCode': '200'} 
        except Exception as e:
            print(e)
            return {'statusCode': '500'}
    
    elif event['requestContext']['resourcePath'] == '/setCurrentQuestion':
        try: 
            body = json.loads(event['body'])
            response = questionTable.get_item(
                Key={
                    'Id': body['id'],
                    'ChannelArn': body['channelArn'],
                },
                ProjectionExpression='Id, Content, Votes'
            )
            print(response)
            
            if 'Item' not in response:
                return {'statusCode': 400}
            
            response = ivs.put_metadata(
                metadata=json.dumps(response['Item'], default=decimal_default),
                channelArn=body['channelArn']
            )
            print(response)
            
            response = questionTable.query(
                KeyConditionExpression=Key('ChannelArn').eq(body['channelArn']),
                ProjectionExpression='Id, ChannelArn',
                FilterExpression=Attr('Current').eq(True)
            )
            print(response)
            
            if len(response['Items']) > 0:
                for question in response['Items']:
                    updateQuestionCurrentAnswered(
                         answered=True,
                         current=False,
                         id=question['Id'],
                         channelArn=question['ChannelArn']
                    )
    
            updateQuestionCurrentAnswered(
                 answered=False,
                 current=True,
                 id=body['id'],
                 channelArn=body['channelArn']
            )
            
            return {'statusCode': '200'} 
        except ClientError as e:
            print(e)
            if e.response['Error']['Code'] == 'ChannelNotBroadcasting':
                return {'statusCode': '400'}
            else:
                return {'statusCode': '500'}
        except Exception as e:
            print(e)
            return {'statusCode': '500'}

def fetchQuestionKeys(channelArn):
    response = questionTable.query(
        KeyConditionExpression=Key('ChannelArn').eq(channelArn),
        ProjectionExpression='Id, ChannelArn'
    )
    print(response)
    return response['Items']


def updateQuestionCurrentAnswered(answered, current, id, channelArn):
    response = questionTable.update_item(
        Key={
            'Id': id,
            'ChannelArn': channelArn,
        },
        UpdateExpression="SET #currentAttr=:current, #answeredAttr=:answered",
        ExpressionAttributeValues={
            ':current': current,
            ':answered': answered,
        },
        ExpressionAttributeNames={
            '#currentAttr': 'Current',
            '#answeredAttr': 'Answered',
        },
        ConditionExpression="attribute_exists(Id)"
    )
    print(response)
    
    return response

def decimal_default(obj):
    if isinstance(obj, decimal.Decimal):
        return int(obj)
    raise TypeError