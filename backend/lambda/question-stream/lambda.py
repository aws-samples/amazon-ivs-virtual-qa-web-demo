import json
import boto3
import decimal
import os
from concurrent.futures import ThreadPoolExecutor, as_completed
from boto3.dynamodb.conditions import Key
from boto3.dynamodb.types import TypeDeserializer

apiClient = boto3.client('apigatewaymanagementapi', endpoint_url=os.environ['WEBSOCKET_CONNECTION_ENDPOINT'])
dynamodb = boto3.resource('dynamodb')
connectionTable = dynamodb.Table(os.environ['CONNECTION_TABLE'])
deserializer = TypeDeserializer()

def lambdaHandler(event, context):
    print("Received event: " + json.dumps(event, indent=2))
    
    processedRecords = processRecords(event['Records'])
    uniqueChannels = list(set([r['question']['ChannelArn'] for r in processedRecords]))

    connectionsPerChannel = fetchChannelConnections(uniqueChannels)

    recordsPerChannel = {
        c: [r for r in processedRecords if r['question']['ChannelArn'] == c] for c in uniqueChannels
    }
    
    sendRecordsToConnections(recordsPerChannel, connectionsPerChannel)

# process records into
# {   
#     change: 'INSERT',
#     timeStamp: 'some timestamp',
#     question: { channelArn: 'aChannelArn', ... }
# }
def processRecords(records):
    processedRecords = []
    for r in records:
        imageToDeserialize = r['dynamodb']['OldImage'] if r['eventName'] == 'REMOVE' else r['dynamodb']['NewImage']
        processedRecords.append({
            'change': r['eventName'],
            'timeStamp': r['dynamodb']['ApproximateCreationDateTime'],
            'question': {k: deserializer.deserialize(v) for k,v in imageToDeserialize.items()},
        })
        
    return processedRecords

def fetchChannelConnections(channels):
    connectionResults = []
    
    with ThreadPoolExecutor(max_workers=4) as executor:
        connectionResults = executor.map(fetchConnections, channels)
        connectionResults = list(connectionResults)
    
    channelConnections = {}
    for c, conns in zip(channels, connectionResults):
        channelConnections[c] = conns
    
    return channelConnections

def fetchConnections(channelArn):
    response = connectionTable.query(
        IndexName='ChannelArn-index',
        KeyConditionExpression=Key('ChannelArn').eq(channelArn),
        ProjectionExpression='Id'
    )
    print(response)
    return [i['Id'] for i in response['Items']]

def sendRecordsToConnections(recordsPerChannel, connectionsPerChannel):
    with ThreadPoolExecutor(max_workers=50) as executor:
        allPostsFutures = []
        for channel, connectionIds in connectionsPerChannel.items():
            for connectionId in connectionIds:
                allPostsFutures.append(
                    executor.submit(
                        postRecords, 
                        connectionId, 
                        recordsPerChannel[channel]
                    )
                )
                
        for future in as_completed(allPostsFutures):
            try :
                # To surface any exceptions
                future.result()
            except Exception as e:
                print(e)

def postRecords(connectionId, records):
    data = {
        'type': 'UPDATES', 
        'updates': records,
    }
    jsonData = json.dumps(data, default=decimal_default).encode('utf-8')
    response = apiClient.post_to_connection(ConnectionId = connectionId, Data = jsonData)
    print(response)

def decimal_default(obj):
    if isinstance(obj, decimal.Decimal):
        return int(obj)
    raise TypeError