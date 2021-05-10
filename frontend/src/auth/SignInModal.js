import React from 'react';
import useOutsideClick from '../util/useOutsideClick';
import { Authenticator, SignIn, SignUp, ConfirmSignUp, Greetings } from 'aws-amplify-react';


function SignInModal({
    onHideModal
}) {
    const modalRef = React.useRef(null);
    useOutsideClick(modalRef, onHideModal);

    const handleAuthStateChange = (state) => {
        if (state === 'signedIn') {
            onHideModal();
        }
    }

    const MyTheme = {
        sectionHeaderContent: {
            fontSize: '2.4rem',
            fontWeight: 'bold',
        },
        sectionBody: {
            'width': '100%',
            'margin': '2rem 0',
            'display': 'flex',
            flexDirection: 'column',
            flexGrow: '1',
        },
        formField: {
            'margin': '0.5rem 0',
        },
        input: {
            'width': '100%',
        },
        a: {
            fontWeight: 'bold',
            'cursor': 'pointer',
            paddingLeft: '0.5rem',
        },
        sectionFooter: {
            'width': '100%',
        },
        sectionFooterPrimaryContent: {
            'display': 'flex',
        },
        button: {
            'display': 'flex',
            'width': '100%',
            alignItems: 'center',
            alignContent: 'center',
            justifyContent: 'center',
            fontWeight: 'bold',
            'color': 'var(--color-text-inverted)',
            'background': 'var(--color-bg-button-primary-default)',
        },
        selectInput: {
            'display': 'grid',
            gridTemplateColumns: 'auto 1fr',
            'gridGap': '1rem',
        },
        sectionFooterSecondaryContent: {
            'display': 'flex',
            'margin': '1rem 0 0 0',
        },
    }

    return (
        <div className="modal">
            <div className="modal__el modal__el--auth" ref={modalRef}>
                <Authenticator theme={MyTheme} hideDefault={true} onStateChange={handleAuthStateChange}>
                    <SignIn/>
                    <SignUp/>
                    <ConfirmSignUp/>
                    <Greetings/>
                </Authenticator>
            </div>
            <div className="modal__overlay"></div>
        </div>
    )
}

export default SignInModal;