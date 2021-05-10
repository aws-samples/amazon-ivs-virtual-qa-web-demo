import React from 'react';
import IVSContext from './providers/IVSContext';
import QuestionsContext from './providers/QuestionContext';
import { 
    SERVER_SET_QUESTIONS_ACTION,
    SERVER_UPDATE_QUESTIONS_ACTION,
} from './providers/QuestionProvider'
import { WEBSOCKET_API_ENDPOINT } from './config';

class WebSocketClient extends React.Component {
    static contextType = QuestionsContext; 
    
    constructor() {
        super();
        this.channelArn = '';
    }

    setupWebSocket(channelArn){
        if (this.channelArn === channelArn) {
            return;
        }
        this.channelArn = channelArn;
        const webSocketUrl = WEBSOCKET_API_ENDPOINT + `?channelarn=` + channelArn;

        this.ws = new WebSocket(webSocketUrl);

        this.ws.onmessage = msg => {
            const [, dispatch] = this.context;
            const message = JSON.parse(msg.data)
            switch(message.type) {
                case 'INITIAL_STATE':
                    console.debug('INIT STATE', message.questions)
                    dispatch({
                        type: SERVER_SET_QUESTIONS_ACTION,
                        questions: message.questions,
                    })
                    break;
                case 'UPDATES':
                    console.debug('UPDATE', message.updates)
                    dispatch({
                        type: SERVER_UPDATE_QUESTIONS_ACTION,
                        updates: message.updates,
                    })
                    break;
                default:
                    return;
            }
        }
    }

    render(){
        return(
            <IVSContext.Consumer>
                {({ channelArn }) => this.setupWebSocket(channelArn)}
            </IVSContext.Consumer> 
        )
    }
}

export default WebSocketClient