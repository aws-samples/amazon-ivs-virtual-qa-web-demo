import boto3
import json
import os
from boto3.dynamodb.conditions import Key

dynamodb = boto3.resource('dynamodb')
connectionTable = dynamodb.Table(os.environ['CONNECTION_TABLE'])

def lambdaHandler(event, context):
    print("Received event: " + json.dumps(event, indent=2))
    try:
        response = {}
        if event['requestContext']['eventType'] == 'CONNECT':
            connectionId = event['requestContext']['connectionId']
            channelArn = event['queryStringParameters']['channelarn']
            response=connectionTable.put_item(
                Item={
                    'Id': connectionId,
                    'ChannelArn': channelArn,
                }
            )
        elif event['requestContext']['eventType'] == 'DISCONNECT': 
            response = connectionTable.delete_item(
                Key={'Id': event['requestContext']['connectionId']}
            )
        print(response)
    except Exception as e:
        print(e)
        return { 'statusCode': '500' }
        
    return { 'statusCode': '200' } 