import React from 'react';
import useOutsideClick from '../../util/useOutsideClick';
import IVSContext from '../../providers/IVSContext';
import UserContext from '../../providers/UserContext';
import { HTTP_API_ENDPOINT } from '../../config';

const CURRENT_QUESTION_ENDPOINT = HTTP_API_ENDPOINT + '/setCurrentQuestion';

function CurrentQuestionModal({
    questionId,
    onHideModal,
}) {
    const { channelArn } = React.useContext(IVSContext);
    const [{ accessJWTToken }] = React.useContext(UserContext);
    const [isPosting, setIsPosting] = React.useState(false);
    const modalRef = React.useRef(null);
    useOutsideClick(modalRef, onHideModal);

    React.useEffect(() => {
        if (isPosting) {
            const postCurrentQuestion = async () => {
                try {
                    const questionResponse = await fetch(CURRENT_QUESTION_ENDPOINT, {
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
                    if (questionResponse.status !== 200) {
                        throw new Error();
                    }
                } catch (e){
                    console.log('Failure in setting current question', e);
                }
                onHideModal();
            };

            postCurrentQuestion();
        }
        // eslint-disable-next-line
    }, [isPosting]);

    return (
        <div className="modal">
            <div className="modal__el" ref={modalRef}>
                <h2 className="mg-b-1">Mark this question as current?</h2>
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
                        className="btn btn--confirm mg-t-1"
                        onClick={() => setIsPosting(true)}
                    >
                        Mark as current
                    </button>
                </div>
            </div>
            <div className="modal__overlay"></div>
        </div>
    )
}

export default CurrentQuestionModal;
