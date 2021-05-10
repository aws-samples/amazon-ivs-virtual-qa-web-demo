import json
import boto3
import os
from concurrent.futures import ThreadPoolExecutor, as_completed
from boto3.dynamodb.types import TypeDeserializer

dynamodb = boto3.resource('dynamodb')
questionTable = dynamodb.Table(os.environ['QUESTION_TABLE'])
deserializer = TypeDeserializer()

def lambdaHandler(event, context):
    print("Received event: " + json.dumps(event, indent=2))
    
    # process records into:
    # {
    #     questionId: {
    #         voteDelta: -1,
    #         channelArn: 'arn'
    #     }...
    # }
    questionVoteDeltaMap = processRecords(event['Records'])
    updateQuestionVoteCounts(questionVoteDeltaMap)

def processRecords(records):
    questionVoteDeltaMap = {}
    for r in records:
        eventName = r['eventName']
        imageToDeserialize = r['dynamodb']['OldImage'] if eventName == 'REMOVE' else r['dynamodb']['NewImage']
        deserializedImage = {k: deserializer.deserialize(v) for k,v in imageToDeserialize.items()}
        questionId = deserializedImage['QuestionId']
        channelArn = deserializedImage['ChannelArn']
        
        if questionId in questionVoteDeltaMap:
            if eventName == 'REMOVE':
                questionVoteDeltaMap[questionId]['voteDelta'] -= 1
            elif eventName == 'INSERT':
                questionVoteDeltaMap[questionId]['voteDelta'] += 1
        else:
            if eventName == 'REMOVE':
                questionVoteDeltaMap[questionId] = {'voteDelta': -1, 'channelArn': channelArn}
            elif eventName == 'INSERT':
                questionVoteDeltaMap[questionId] = {'voteDelta': 1, 'channelArn': channelArn}
        
    return questionVoteDeltaMap

def updateQuestionVoteCounts(questionVoteDeltaMap):
    with ThreadPoolExecutor(max_workers=50) as executor:
        allUpdateFutures = []
        for questionId, cv in questionVoteDeltaMap.items():
            print('cv', cv)
            allUpdateFutures.append(
                executor.submit(
                    updateQuestionVoteCount, 
                    questionId, 
                    cv['channelArn'],
                    cv['voteDelta']
                )
            )
                
        for future in as_completed(allUpdateFutures):
            try :
                # To surface any exceptions
                future.result()
            except Exception as e:
                print(e)

def updateQuestionVoteCount(questionId, channelArn, voteDelta):
    response = questionTable.update_item(
        Key={
            'Id': questionId,
            'ChannelArn': channelArn,
        },
        UpdateExpression="Add Votes :delta",
        ExpressionAttributeValues={':delta': voteDelta},
        ConditionExpression="attribute_exists(Id)"
    )
    print(response)