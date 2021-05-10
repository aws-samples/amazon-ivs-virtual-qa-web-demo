import React from 'react';
import PlayerMetadataContext from './PlayerMetadataContext';

export const SET_CURRENT_QUESTION_ACTION = 'SET_CURRENT_QUESTION_ACTION';

const reducer = (state, action) => {
    switch (action.type) {
        case SET_CURRENT_QUESTION_ACTION:
            return {
                ...state,
                currentQuestion: action.question,
            }
        default:
            throw new Error('unexpected action type');
    }
};

const initialState = { currentQuestion: null }

const PlayerMetadataProvider = ({ children }) => {
    const value = React.useReducer(reducer, initialState);
    return (
        <PlayerMetadataContext.Provider value={value}>
            {children}
        </PlayerMetadataContext.Provider>
    );
};

export default PlayerMetadataProvider