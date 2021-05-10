import React from 'react';
import VoteContext from './VoteContext';

export const ADD_VOTE_ACTION = 'ADD_VOTE_ACTION';
export const DELETE_VOTE_ACTION = 'DELETE_VOTE_ACTION';
export const SET_VOTES_ACTION = 'SET_VOTES_ACTION';
export const CLEAR_VOTES_ACTION = 'CLEAR_VOTES_ACTION';

const reducer = (state, action) => {
    switch (action.type) {
        case ADD_VOTE_ACTION:
            return {
                ...state,
                questionIdMap: {
                    ...state.questionIdMap,
                    [action.questionId]: true,
                },
            }
        case DELETE_VOTE_ACTION:
            const newQuestionIdMap = state.questionIdMap;
            delete newQuestionIdMap[action.questionId];
            return {
                ...state,
                questionIdMap: { ...newQuestionIdMap }
            }
        case SET_VOTES_ACTION:
            return {
                ...state,
                questionIdMap: action.questionIdMap,
            }
        case CLEAR_VOTES_ACTION:
            return {
                ...state,
                questionIdMap: {},
            }
        default:
            throw new Error('unexpected action type');
    }
};

const initialState = { questionIdMap: {} }

const VoteProvider = ({ children }) => {
    const value = React.useReducer(reducer, initialState);
    return (
        <VoteContext.Provider value={value}>
            {children}
        </VoteContext.Provider>
    );
};

export default VoteProvider