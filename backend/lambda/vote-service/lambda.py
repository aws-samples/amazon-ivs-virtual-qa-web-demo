import boto3
import json
import os
from boto3.dynamodb.conditions import Key, Attr

dynamodb = boto3.resource('dynamodb')
questionTable = dynamodb.Table(os.environ['QUESTION_TABLE'])
voteTable = dynamodb.Table(os.environ['VOTE_TABLE'])

def checkIfQuestionExists(channelArn, questionId):
    response = questionTable.get_item(Key={ 
        'ChannelArn': channelArn, 
        'Id': questionId,
    })
    
    return 'Item' in response

def lambdaHandler(event, context):
    print('Received event: ' + json.dumps(event, indent=2))
    
    userId = event['requestContext']['authorizer']['claims']['sub']
    try:
        body = json.loads(event['body'])
        if event['requestContext']['resourcePath'] == '/addVote':
            if not checkIfQuestionExists(body['channelArn'], body['questionId']):
                return {'statusCode': '400'}
                
            voteTable.put_item(Item={
                'UserId': userId,
                'QuestionId': body['questionId'],
                'ChannelArn': body['channelArn'],
            })
        elif event['requestContext']['resourcePath'] == '/deleteVote':
            if not checkIfQuestionExists(body['channelArn'], body['questionId']):
                return {'statusCode': '400'}
                
            voteTable.delete_item(Key={
                'UserId': userId,
                'QuestionId': body['questionId'],
            })
        elif event['requestContext']['resourcePath'] == '/getVotes':
            response = voteTable.query(
                KeyConditionExpression=Key('UserId').eq(userId),
                ProjectionExpression='QuestionId',
                FilterExpression=Attr('ChannelArn').eq(body['channelArn']),
            )
            print(response)
            return {
                'statusCode': '200',
                'body': json.dumps(response['Items']),
            }
        else:
            return {'statusCode': '400'}
    except Exception as e:
        print(e)
        return {'statusCode': '500'}
    else:
        return {'statusCode': '200'} 