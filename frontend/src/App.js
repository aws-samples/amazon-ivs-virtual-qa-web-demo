import React from 'react';
import './auth/AuthConfigure';
import IVSProvider from './providers/IVSProvider';
import UserProvider from './providers/UserProvider';
import QuestionProvider from './providers/QuestionProvider';
import PlayerMetadataProvider from './providers/PlayerMetadataProvider';
import VoteProvider from './providers/VoteProvider';
import WebSocketClient from './WebSocketClient'
import Player from './player/Player';
import QuestionList from './questionList/QuestionList';
import AddQuestionButton from './addQuestion/AddQuestionButton';
import SignInButton from './auth/SignInButton';
import './App.css';

function App() {
    return (
        <IVSProvider>
            <PlayerMetadataProvider>
                <VoteProvider>
                    <QuestionProvider>
                        <UserProvider>
                            <WebSocketClient/>
                            <header>
                                <h1>Interactive Live Q&A</h1>
                                <SignInButton/>
                            </header>
                            <section>
                                <Player/>
                                <QuestionList/>
                                <AddQuestionButton/>
                            </section>
                        </UserProvider>
                    </QuestionProvider>
                </VoteProvider>
            </PlayerMetadataProvider>
        </IVSProvider> 
    );
}



export default App;
