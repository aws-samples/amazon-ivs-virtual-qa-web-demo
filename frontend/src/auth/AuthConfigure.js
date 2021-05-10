import Amplify from 'aws-amplify';
import { 
    REGION,
    COGNITO_USER_POOL_ID,
    COGNITO_USER_POOL_CLIENT_ID,
} from '../config';

Amplify.configure({
    Auth: {
        region: REGION,
        userPoolId: COGNITO_USER_POOL_ID,
        userPoolWebClientId: COGNITO_USER_POOL_CLIENT_ID,
        authenticationFlowType: 'USER_PASSWORD_AUTH',
    }
});