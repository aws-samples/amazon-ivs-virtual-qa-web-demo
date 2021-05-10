import backendStackOutput from './backendStackOutput.json';

// Backend stack output in the format of:
// [[{
//     OutputKey: xxx, 
//     OutputValue: xxx
// }...]]

function getValueFromStackOutput(key) {
    const index = backendStackOutput[0].findIndex(o => o.OutputKey === key);
    return backendStackOutput[0][index].OutputValue; 
}

export const HTTP_API_ENDPOINT = getValueFromStackOutput('HttpApiEndpoint');
export const WEBSOCKET_API_ENDPOINT = getValueFromStackOutput('WebsocketApiEndpoint');
export const COGNITO_USER_POOL_ID = getValueFromStackOutput('CognitoUserPoolId');
export const COGNITO_USER_POOL_CLIENT_ID = getValueFromStackOutput('CognitoClientId');
export const REGION = getValueFromStackOutput('Region');
