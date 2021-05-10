import React from 'react';
import QuestionContext from './QuestionContext';

export const CLIENT_ADD_QUESTION_ACTION = 'CLIENT_ADD_QUESTION_ACTION';
export const CLIENT_DELETE_QUESTION_ACTION = 'CLIENT_DELETE_QUESTION_ACTION';
export const CLIENT_INCREMENT_VOTE_ACTION = 'CLIENT_INCREMENT_VOTE_ACTION';
export const CLIENT_DECREMENT_VOTE_ACTION = 'CLIENT_DECREMENT_VOTE_ACTION';

export const SERVER_UPDATE_QUESTIONS_ACTION = 'SERVER_UPDATE_QUESTIONS_ACTION';
export const SERVER_SET_QUESTIONS_ACTION = 'SERVER_SET_QUESTIONS_ACTION';

export const SET_VOTES_ACTION = 'SET_VOTES_ACTION';

// questionStates: [{
//     question: {
//         Id: String,
//         Content: String,
//         Votes: Number,
//         Answered: Boolean,
//         Current: Boolean
//     }
//     timeStamp: Number,
//     removed: Boolean,
// }...]

function pickQuestionProperties ({
    Id, Content, Votes, Answered, Current
}) {
    return {
        Id, Content, Votes, Answered, Current
    }
}

function sortByVote(questionState1, questionState2) {
    return questionState2.question.Votes - questionState1.question.Votes;
}

const reducer = (state, action) => {
    switch (action.type) {
        case CLIENT_ADD_QUESTION_ACTION:
            const newQuestionState = { 
                question: {
                    Id: action.id,
                    Content: action.content,
                    Votes: 0,
                    Answered: false,
                    Current: false,
                },
                timeStamp: 0,
                removed: false,
            };

            return {
                ...state,
                questionStates: state.questionStates.concat([newQuestionState]).sort(sortByVote)
            };
        case CLIENT_DELETE_QUESTION_ACTION:
            return {
                ...state,
                questionStates: state.questionStates.map(s => {
                    if (s.question.Id === action.id) {
                        s.removed = true
                    }
                    return s;
                }).sort(sortByVote)
            };
        case CLIENT_INCREMENT_VOTE_ACTION:
            return {
                ...state,
                questionStates: state.questionStates.map(s => {
                    if (s.question.Id === action.id) {
                        s.question.Votes = s.question.Votes + 1;
                    }
                    return s;
                }).sort(sortByVote)
            }
        case CLIENT_DECREMENT_VOTE_ACTION:
            return {
                ...state,
                questionStates: state.questionStates.map(s => {
                    if (s.question.Id === action.id) {
                        s.question.Votes = s.question.Votes - 1;
                    }
                    return s;
                }).sort(sortByVote)
            }
        case SERVER_UPDATE_QUESTIONS_ACTION:
            action.updates.forEach(update => {
                const i = state.questionStates.findIndex(s => update.question.Id === s.question.Id)
                // Don't process if change older than client's change
                if (i !== -1 && update.timeStamp < state.questionStates[i].timeStamp) {
                    return
                }
                switch (update.change) {
                    case 'INSERT':
                        if (i === -1) {
                            state.questionStates = state.questionStates.concat([{
                                question: pickQuestionProperties(update.question),
                                timeStamp: update.timeStamp,
                                removed: false,
                            }]);
                        } else {
                            state.questionStates[i].timeStamp = update.timeStamp;
                        }
                        break;
                    case 'MODIFY':
                        if (i === -1) {
                            state.questionStates = state.questionStates.concat([{
                                question: pickQuestionProperties(update.question),
                                timeStamp: update.timeStamp,
                                removed: false,
                            }]);
                        } else {
                            state.questionStates[i].timeStamp = update.timeStamp;
                            state.questionStates[i].question = pickQuestionProperties(update.question)
                        }
                        break;
                    case 'REMOVE':
                        if (i === -1) {
                            state.questionStates = state.questionStates.concat([{
                                question: pickQuestionProperties(update.question),
                                timeStamp: update.timeStamp,
                                removed: true,
                            }]);
                        } else {
                            state.questionStates[i].timeStamp = update.timeStamp;
                            state.questionStates[i].removed = true;
                        }
                        break;
                    default:
                        return;
                }
            })

            return {
                ...state,
                questionStates: state.questionStates.sort(sortByVote),
            };
        case SERVER_SET_QUESTIONS_ACTION:
            return {
                ...state,
                questionStates: action.questions.map(q => ({
                    question: pickQuestionProperties(q),
                    timeStamp: 0,
                    removed: false,
                })).sort(sortByVote),
            };
        default:
            throw new Error('unexpected action type');
    }
};

const initialState = { questionStates: [] }

const QuestionProvider = ({ children }) => {
    const value = React.useReducer(reducer, initialState);
    return (
        <QuestionContext.Provider value={value}>
            {children}
        </QuestionContext.Provider>
    );
};

export default QuestionProvider