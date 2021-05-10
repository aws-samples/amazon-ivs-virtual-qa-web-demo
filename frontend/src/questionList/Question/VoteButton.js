import React from 'react';
import QuestionContext from '../../providers/QuestionContext';
import IVSContext from '../../providers/IVSContext';
import VoteContext from '../../providers/VoteContext';
import UserContext from '../../providers/UserContext';
import {
    ADD_VOTE_ACTION,
    DELETE_VOTE_ACTION,
}  from '../../providers/VoteProvider';
import {
    CLIENT_DECREMENT_VOTE_ACTION,
    CLIENT_INCREMENT_VOTE_ACTION,
}  from '../../providers/QuestionProvider';
import { HTTP_API_ENDPOINT } from '../../config';

const ADD_VOTE_ENUM = 'ADD_VOTE';
const DELETE_VOTE_ENUM = 'DELETE_VOTE';
const NONE_ENUM = 'NONE';

const DELETE_VOTE_ENDPOINT = HTTP_API_ENDPOINT + '/deleteVote';
const ADD_VOTE_ENDPOINT = HTTP_API_ENDPOINT + '/addVote';

function VoteButton({
    votes,
    questionId,
    disabled,
}) {
    const [,questionDispatch] = React.useContext(QuestionContext);
    const [{ questionIdMap }, voteDispatch] = React.useContext(VoteContext);
    const { channelArn } = React.useContext(IVSContext);
    const [{ accessJWTToken }] = React.useContext(UserContext);
    const [postVoteType, setPostVoteType] = React.useState(NONE_ENUM);

    React.useEffect(() => {
        if (postVoteType !== NONE_ENUM) {
            const postVote = async () => {
                try {
                    questionDispatch({
                        type: postVoteType === DELETE_VOTE_ENUM  ? CLIENT_DECREMENT_VOTE_ACTION : CLIENT_INCREMENT_VOTE_ACTION,
                        id: questionId,
                    });
                    voteDispatch({
                        type: postVoteType === DELETE_VOTE_ENUM  ? DELETE_VOTE_ACTION : ADD_VOTE_ACTION,
                        questionId,
                    })

                    const url = postVoteType === DELETE_VOTE_ENUM ? DELETE_VOTE_ENDPOINT : ADD_VOTE_ENDPOINT;
                    const response = await fetch(url,{
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': accessJWTToken,
                        },
                        body: JSON.stringify({
                            channelArn,
                            questionId,
                        }),
                    });

                    if (response.status !== 200) {
                        throw new Error();
                    }
                } catch (e){
                    console.log('Failed to add/delete vote', e);
                    questionDispatch({
                        type: postVoteType === DELETE_VOTE_ENUM  ? CLIENT_INCREMENT_VOTE_ACTION : CLIENT_DECREMENT_VOTE_ACTION,
                        id: questionId,
                    });
                    voteDispatch({
                        type: postVoteType === DELETE_VOTE_ENUM  ? ADD_VOTE_ACTION : DELETE_VOTE_ACTION,
                        questionId,
                    })
                }
            };

            postVote();
        }
        // eslint-disable-next-line
    }, [postVoteType]);

    const votedState = !!questionIdMap[questionId];

    let className = ''
    if (votedState) {
        className = 'btn rounded upvote-btn has-voted';
    } else if (disabled) {
        className = 'btn rounded upvote-btn';
    } else {
        className = 'btn btn--primary rounded upvote-btn';
    }

    return (
        <button
            className={className}
            onClick={() => setPostVoteType(votedState ? DELETE_VOTE_ENUM : ADD_VOTE_ENUM)}
            disabled={disabled}
        >
            <svg className="upvote-btn__svg" width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3.66797 11L4.96047 12.2925L10.0846 7.1775V18.3333H11.918V7.1775L17.033 12.3017L18.3346 11L11.0013 3.66666L3.66797 11Z"/></svg>
            <span className="upvote-btn__count">{votes}</span>
        </button>
    )
}

export default VoteButton;
