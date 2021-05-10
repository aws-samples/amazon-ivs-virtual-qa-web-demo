import React from 'react';
import UserContext from './UserContext';

export const SET_SIGNED_IN_USER_ACTION = 'SET_SIGNED_IN_USER_ACTION';
export const SET_SIGNED_OUT_USER_ACTION = 'SET_SIGNED_OUT_USER_ACTION';

const reducer = (state, action) => {
    switch (action.type) {
        case SET_SIGNED_IN_USER_ACTION:
            return {
                ...state,
                isSignedIn: true,
                isModerator: action.isModerator,
                accessJWTToken: action.accessJWTToken,
            };
        case SET_SIGNED_OUT_USER_ACTION:
            return { ...initialState };
        default:
            throw new Error('unexpected action type');
    }
};

const initialState = {
    isSignedIn: false,
    isModerator: false,
    accessToken: '',
}

const UserProvider = ({ children }) => {
    const value = React.useReducer(reducer, initialState);
    return (
        <UserContext.Provider value={value}>
            {children}
        </UserContext.Provider>
    );
};

export default UserProvider