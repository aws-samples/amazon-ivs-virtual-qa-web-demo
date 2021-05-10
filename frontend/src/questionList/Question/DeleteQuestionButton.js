import React from 'react';
import DeleteQuestionModal from './DeleteQuestionModal';

function DeleteQuestionButton({ questionId }) {
    const [modalVisible, setModalVisibility] = React.useState(false);
    const showModal = () => setModalVisibility(true)
    const hideModal = () => setModalVisibility(false)
    const modal = modalVisible ? (
        <DeleteQuestionModal
            questionId={questionId}
            onHideModal={hideModal}
        />
    ) : null;
    
    return (
        <React.Fragment>
            {modal}
            <button
                onClick={showModal}
                className="btn btn--icon btn--destruct"
                title="Delete"
            >
                <svg className="icon icon--24 icon--inverted" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 19C6 20.1 6.9 21 8 21H16C17.1 21 18 20.1 18 19V7H6V19ZM19 4H15.5L14.5 3H9.5L8.5 4H5V6H19V4Z" /></svg>
            </button>
        </React.Fragment>
    )
}

export default DeleteQuestionButton;