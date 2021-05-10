import React from 'react';
import CurrentQuestionModal from './CurrentQuestionModal';

function CurrentQuestionButton({ questionId }) {
    const [modalVisible, setModalVisibility] = React.useState(false);
    const showModal = () => setModalVisibility(true)
    const hideModal = () => setModalVisibility(false)
    const modal = modalVisible ? (
        <CurrentQuestionModal
            questionId={questionId}
            onHideModal={hideModal}
        />
    ) : null;
    
    return (
        <React.Fragment>
            {modal}
            <button
                onClick={showModal}
                className="btn btn--icon btn--confirm"
                title="Mark as current"
            >
                <svg className="icon icon--24" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M18.99 20.4998L19 9.49976C19 8.82976 18.67 8.22976 18.16 7.86976L12 3.49976L5.84 7.86976C5.33 8.22976 5 8.82976 5 9.49976L5.01 20.4998L12 15.6598L18.99 20.4998Z" /></svg>
            </button>
        </React.Fragment>
    )
}

export default CurrentQuestionButton;