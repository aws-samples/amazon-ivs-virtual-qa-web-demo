import json
import boto3
import decimal
import os
from concurrent.futures import ThreadPoolExecutor, as_completed
from boto3.dynamodb.conditions import Key

apiClient = boto3.client('apigatewaymanagementapi', endpoint_url=os.environ['WEBSOCKET_CONNECTION_ENDPOINT'])
dynamodb = boto3.resource('dynamodb')
questionTable = dynamodb.Table(os.environ['QUESTION_TABLE'])

def lambdaHandler(event, context):
    print("Received event: " + json.dumps(event, indent=2))
    
    insertRecords = [r for r in event['Records'] if r['eventName'] == 'INSERT']
    if len(insertRecords) == 0:
        return
    
    connectionIds = [r['dynamodb']['NewImage']['Id']['S'] for r in insertRecords]
    channels = [r['dynamodb']['NewImage']['ChannelArn']['S'] for r in insertRecords]
    uniqueChannels = list(set(channels))

    channelQuestions = fetchChannelQuestions(uniqueChannels)
    sendQuestionsToConnections(zip(connectionIds, channels), channelQuestions)

def fetchChannelQuestions(channels):
    questionResults = []
    
    with ThreadPoolExecutor(max_workers=4) as executor:
        questionResults = executor.map(fetchQuestions, channels)
        questionResults = list(questionResults)
    
    channelQuestions = {}
    for c, qs in zip(channels, questionResults):
        channelQuestions[c] = qs
    
    return channelQuestions

def fetchQuestions(channelArn):
    response = questionTable.query(
        KeyConditionExpression=Key('ChannelArn').eq(channelArn)
    )
    
    print(response)
    return response['Items']

def sendQuestionsToConnections(connectionChannels, channelQuestions):
    with ThreadPoolExecutor(max_workers=10) as executor:
        allPostsFutures = []
        for connectionId, channel in connectionChannels:
            allPostsFutures.append(
                executor.submit(
                    postQuestions, 
                    connectionId, 
                    channelQuestions[channel]
                )
            )
        for future in as_completed(allPostsFutures):
            try :
                # To surface any exceptions
                future.result()
            except Exception as e:
                print(e)

def postQuestions(connectionId, questions):
    data = {
        'type': 'INITIAL_STATE', 
        'questions': questions,
    }
    jsonData = json.dumps(data, default=decimal_default).encode('utf-8')
    response = apiClient.post_to_connection(ConnectionId = connectionId, Data = jsonData)
    print(response)

def decimal_default(obj):
    if isinstance(obj, decimal.Decimal):
        return int(obj)
    raise TypeError