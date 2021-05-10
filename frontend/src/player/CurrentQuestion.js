import React from 'react';
import QuestionContext from '../providers/QuestionContext';
import PlayerMetadataContext from '../providers/PlayerMetadataContext';

function CurrentQuestion() {
    const [{ questionStates }] = React.useContext(QuestionContext);
    const [{ currentQuestion: playerCurrentQuestion }] = React.useContext(PlayerMetadataContext);

    let showCurrentQuestion = true;
    let content
    let votes
    if (playerCurrentQuestion === null) {
        const index = questionStates.findIndex(({question}) => question.Current);
        if (index === -1) {
            showCurrentQuestion = false;
        } else {
            content = questionStates[index].question.Content;
            votes = questionStates[index].question.Votes;
        }
    } else {
        content = playerCurrentQuestion.Content;
        votes = playerCurrentQuestion.Votes
    }

    return (
        showCurrentQuestion ? (
            <div className="current-question">
                <div className="c-item">
                    <div className="c-item__card">
                        <div className="c-item__votes">
                            <svg className="upvote-btn__svg" width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3.66797 11L4.96047 12.2925L10.0846 7.1775V18.3333H11.918V7.1775L17.033 12.3017L18.3346 11L11.0013 3.66666L3.66797 11Z"/></svg>
                            <span className="upvote-btn__count">{votes}</span>
                        </div>
                        <div className="c-item__content">
                            <strong>Current question</strong>
                            <p>{content}</p>
                        </div>
                    </div>
                </div>
            </div>
        ) : null
    )
}

export default CurrentQuestion;
