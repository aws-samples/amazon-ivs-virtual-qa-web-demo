import React from 'react';
import AddQuestionModal from './AddQuestionModal';
import UserContext from '../providers/UserContext';

function AddQuestionButton() {
    const [modalVisible, setModalVisibility] = React.useState(false);
    const [{ isSignedIn }] = React.useContext(UserContext);
    const showModal = () => setModalVisibility(true)
    const hideModal = () => setModalVisibility(false)
    
    return (
        <React.Fragment>
            {modalVisible ? (
                <AddQuestionModal
                    onHideModal={hideModal}
                />
            ) : null}
            {isSignedIn ? (
                <button
                    onClick={showModal}
                    className="btn btn--floating btn--fixed"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                        <path d="M0 0h24v24H0z" fill="none"></path>
                        <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"></path>
                    </svg>
                </button>
            ): null}
        </React.Fragment>
    )
}

export default AddQuestionButton;