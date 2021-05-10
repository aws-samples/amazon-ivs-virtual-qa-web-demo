import React from 'react';
import IVSContext from './IVSContext';

function getQueryStringValue (key) {
    return decodeURIComponent(window.location.search.replace(new RegExp("^(?:.*[&\\?]" + encodeURIComponent(key).replace(/[.+*]/g, "\\$&") + "(?:\\=([^&]*))?)?.*$", "i"), "$1"));
}

const IVSProvider = ({ children }) => {
    const value = {
        channelArn: window.atob(getQueryStringValue('channel')),
        playbackUrl: window.atob(getQueryStringValue('playback')),
    };

    return (
        <IVSContext.Provider value={value}>
            {children}
        </IVSContext.Provider>
    );
};

export default IVSProvider
