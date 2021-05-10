import React from 'react';
import useOutsideClick from '../util/useOutsideClick';
import IVSContext from '../providers/IVSContext';
import QuestionContext from '../providers/QuestionContext';
import UserContext from '../providers/UserContext';
import VoteContext from '../providers/VoteContext';
import {
    CLIENT_ADD_QUESTION_ACTION,
    CLIENT_INCREMENT_VOTE_ACTION,
} from '../providers/QuestionProvider'
import { ADD_VOTE_ACTION } from '../providers/VoteProvider';
import { HTTP_API_ENDPOINT } from '../config';

const ADD_QUESTION_ENDPOINT = HTTP_API_ENDPOINT + '/addQuestion';
const ADD_VOTE_ENDPOINT = HTTP_API_ENDPOINT + '/addVote';

function AddQuestionModal({
    onHideModal
}) {
    const [,questionDispatch] = React.useContext(QuestionContext);
    const [,voteDispatch] = React.useContext(VoteContext);
    const { channelArn } = React.useContext(IVSContext);
    const [{ accessJWTToken }] = React.useContext(UserContext);
    const [isPosting, setIsPosting] = React.useState(false);
    const [textInput, setTextInput] = React.useState('');
    const modalRef = React.useRef(null);
    useOutsideClick(modalRef, onHideModal);

    React.useEffect(() => {
        if (isPosting) {
            const postAddQuestion = async () => {
                try {
                    const questionResponse = await fetch(ADD_QUESTION_ENDPOINT, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': accessJWTToken,
                        },
                        body: JSON.stringify({
                            channelArn,
                            question: textInput,
                        }),
                    });
                    if (questionResponse.status === 200) {
                        const { id } = await questionResponse.json();
                        questionDispatch({
                            type: CLIENT_ADD_QUESTION_ACTION,
                            id,
                            content: textInput,
                        });

                        const voteResponse = await fetch(ADD_VOTE_ENDPOINT, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': accessJWTToken,
                            },
                            body: JSON.stringify({
                                channelArn,
                                questionId: id,
                            }),
                        });

                        if (voteResponse.status === 200) {
                            questionDispatch({
                                type: CLIENT_INCREMENT_VOTE_ACTION,
                                id,
                            });
                            voteDispatch({
                                type: ADD_VOTE_ACTION,
                                questionId: id,
                            });
                        }
                    } else {
                        throw new Error();
                    }
                } catch (e){
                    console.log('Failure in adding and voting new question', e);
                }
                onHideModal();
            };

            postAddQuestion();
        }
        // eslint-disable-next-line
    }, [isPosting]);

    return (
        <div className="modal">
            <div className="modal__el" ref={modalRef}>
                <h2 className="mg-b-1">Submit a question</h2>
                <form>
                <fieldset>
                    <textarea
                        rows={'8'}
                        placeholder={'Type here...'}
                        onChange={e => setTextInput(e.target.value)}
                        disabled={isPosting}
                        value={textInput}
                    />
                    <p><em>Submissions are anonymous</em></p>
                    <button
                        type={'submit'}
                        className="btn btn--primary mg-t-1"
                        onClick={e => {
                            e.preventDefault();
                            setIsPosting(true)
                        }}
                    >
                        Submit
                    </button>
                </fieldset>
                </form>
            </div>
            <div className="modal__overlay"></div>
        </div>
    )
}

export default AddQuestionModal;
