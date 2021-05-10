import React from 'react';
import useOutsideClick from '../../util/useOutsideClick';
import IVSContext from '../../providers/IVSContext';
import QuestionContext from '../../providers/QuestionContext';
import UserContext from '../../providers/UserContext';
import {
    CLIENT_DELETE_QUESTION_ACTION,
} from '../../providers/QuestionProvider'
import { HTTP_API_ENDPOINT } from '../../config';

const DELETE_QUESTION_ENDPOINT = HTTP_API_ENDPOINT + '/deleteQuestion';

function DeleteQuestionModal({
    questionId,
    onHideModal,
}) {
    const [,dispatch] = React.useContext(QuestionContext);
    const { channelArn } = React.useContext(IVSContext);
    const [{ accessJWTToken }] = React.useContext(UserContext);
    const [isPosting, setIsPosting] = React.useState(false);
    const modalRef = React.useRef(null);
    useOutsideClick(modalRef, onHideModal);

    React.useEffect(() => {
        if (isPosting) {
            const postDeleteQuestion = async () => {
                try {
                    const questionResponse = await fetch(DELETE_QUESTION_ENDPOINT, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': accessJWTToken,
                        },
                        body: JSON.stringify({
                            channelArn,
                            id: questionId,
                        }),
                    });
                    if (questionResponse.status === 200) {
                        dispatch({
                            type: CLIENT_DELETE_QUESTION_ACTION,
                            id: questionId,
                        });
                    } else {
                        throw new Error();
                    }
                } catch (e){
                    console.log('Failure in deleting question', e);
                }
                onHideModal();
            };

            postDeleteQuestion();
        }
        // eslint-disable-next-line
    }, [isPosting]);

    return (
        <div className="modal">
            <div className="modal__el" ref={modalRef}>
                <h2 className="mg-b-1">Are you sure you want to delete this question?</h2>
                <div className="grid grid--responsive grid--2">
                    <button
                        type={'button'}
                        className="btn btn--secondary mg-t-1"
                        onClick={onHideModal}
                    >
                        Cancel
                    </button>
                    <button
                        type={'button'}
                        className="btn btn--destruct mg-t-1"
                        onClick={() => setIsPosting(true)}
                    >
                        Delete
                    </button>
                </div>
            </div>
            <div className="modal__overlay"></div>
        </div>
    )
}

export default DeleteQuestionModal;
