import React from 'react';
import QuestionContext from '../providers/QuestionContext';
import PlayerMetadataContext from  '../providers/PlayerMetadataContext';
import Question from './Question/Question';

function shouldShowQuestion(questionState, playerCurrentQuestion) {
    if (questionState.removed || questionState.question.Answered) {
        return false;
    }
    if (questionState.question.Current) {
        if (playerCurrentQuestion === null || (playerCurrentQuestion.Id === questionState.question.Id)) {
            return false;
        }
    }

    return true;
}

function QuestionList() {
    const [{ questionStates }] = React.useContext(QuestionContext);
    const [{ currentQuestion: playerCurrentQuestion }] = React.useContext(PlayerMetadataContext);
    let questionComponents = []
    questionStates.forEach(s => {
        if (shouldShowQuestion(s, playerCurrentQuestion)) {
            questionComponents.push(
                <Question
                    key={`${s.question.Id}`} 
                    content={s.question.Content}
                    votes={s.question.Votes}
                    id={s.question.Id}
                />
            );
        }
    })
    return <div className="questions">{questionComponents}</div>
}

export default QuestionList;