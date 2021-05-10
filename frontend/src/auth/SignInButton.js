import React from 'react';
import SignInModal from './SignInModal';
import UserContext from '../providers/UserContext';
import IVSContext from '../providers/IVSContext';
import VoteContext from '../providers/VoteContext';
import {
    SET_SIGNED_IN_USER_ACTION,
    SET_SIGNED_OUT_USER_ACTION,
} from '../providers/UserProvider';
import {
    SET_VOTES_ACTION,
    CLEAR_VOTES_ACTION,
} from '../providers/VoteProvider';
import { Hub, Auth } from 'aws-amplify'
import { HTTP_API_ENDPOINT } from '../config';

const GET_VOTES_ENDPOINT = HTTP_API_ENDPOINT + '/getVotes';

async function fetchSetUserInfoVotes(userDispatch, voteDispatch, signInUserSession, channelArn) {
    userDispatch({
        type: SET_SIGNED_IN_USER_ACTION,
        isModerator: getModeratorStatusFromSession(signInUserSession),
        accessJWTToken: signInUserSession.accessToken.jwtToken,
    })

    const votesResponse = await fetch(GET_VOTES_ENDPOINT, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': signInUserSession.accessToken.jwtToken,
        },
        body: JSON.stringify({ channelArn }),
    });

    if (votesResponse.status === 200) {
        const votes = await votesResponse.json()
        const questionIdMap = votes.reduce((map, v) => {
            map[v.QuestionId] = true;
            return map;
        }, {})
        voteDispatch({
            type: SET_VOTES_ACTION,
            questionIdMap,
        })
    }
}

function getModeratorStatusFromSession(session) {
    const userGroups = session.idToken.payload['cognito:groups'];
    if (userGroups !== undefined && userGroups.indexOf('moderator') !== -1) {
        return true;
    } else {
        return false;
    }
}

function SignInButton() {
    const [modalVisible, setModalVisibility] = React.useState(false);
    const [{ isSignedIn }, userDispatch] = React.useContext(UserContext);
    const { channelArn } = React.useContext(IVSContext);
    const [, voteDispatch] = React.useContext(VoteContext)
    const showModal = () => setModalVisibility(true)
    const hideModal = () => setModalVisibility(false)
    const handleClick = () => {
        if (isSignedIn) {
            Auth.signOut()
        } else {
            showModal()
        }
    }

    React.useEffect(() => {
        async function setAuthListeners() {
            Hub.listen('auth', ({ payload }) => {
                switch (payload.event) {
                    case 'signIn':
                        fetchSetUserInfoVotes(userDispatch, voteDispatch, payload.data.signInUserSession, channelArn);
                    break;
                    default: // case: 'signOut'
                        userDispatch({ type: SET_SIGNED_OUT_USER_ACTION });
                        voteDispatch({ type: CLEAR_VOTES_ACTION });
                    break;
                }
            });
            try {
                const user = await Auth.currentAuthenticatedUser();
                fetchSetUserInfoVotes(userDispatch, voteDispatch, user.signInUserSession, channelArn);
            } catch(e) {
                userDispatch({ type: SET_SIGNED_OUT_USER_ACTION });
                voteDispatch({ type: CLEAR_VOTES_ACTION });
            }
        }
        setAuthListeners();
        // eslint-disable-next-line
    }, [])

    return (
        <React.Fragment>
            { modalVisible && <SignInModal onHideModal={hideModal}/> }
            <button
                className={isSignedIn ? 'btn' : 'btn btn--primary'}
                onClick={handleClick}
            >
                {isSignedIn ? 'Sign out' : 'Sign in'}
            </button>
        </React.Fragment>
    )
}

export default SignInButton;
