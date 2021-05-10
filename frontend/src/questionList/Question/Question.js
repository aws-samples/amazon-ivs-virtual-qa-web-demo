import React from 'react';
import VoteButton from './VoteButton';
import DeleteButton from './DeleteQuestionButton';
import CurrentQuestionButton from './CurrentQuestionButton';
import UserContext from '../../providers/UserContext';

function Question({
    content, 
    id,
    votes, 
}) {
    const [{ isSignedIn, isModerator }] = React.useContext(UserContext);
    return (
        <div className="q-item">
            <div className="q-item__card">
                <VoteButton 
                    votes={votes}
                    questionId={id}
                    disabled={!isSignedIn}
                />
                <p className="q-item__content">{content}</p>
            </div>
                {   
                    isModerator &&
                    <div className="q-item__moderation">
                        <CurrentQuestionButton questionId={id} />
                        <DeleteButton questionId={id} />
                    </div>
                }
        </div>
    )
}

export default Question;