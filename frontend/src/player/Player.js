import React from 'react';
import IVSContext from '../providers/IVSContext';
import PlayerMetadataContext from '../providers/PlayerMetadataContext';
import CurrentQuestion from './CurrentQuestion';
import { SET_CURRENT_QUESTION_ACTION } from '../providers/PlayerMetadataProvider';

function Player() {
    const { playbackUrl } = React.useContext(IVSContext);
    const [, dispatch] = React.useContext(PlayerMetadataContext);

    React.useEffect(() => {
        // eslint-disable-next-line no-undef
        const videojs = window.videojs,
              registerIVSTech = window.registerIVSTech,
              registerIVSQualityPlugin = window.registerIVSQualityPlugin;

        // Set up IVS playback tech and quality plugin
        const IVSPlugin = videojs.getPlugin("getIVSPlayer");

        // If the plugins haven't been loaded, load them.
        if (!IVSPlugin) {
          registerIVSTech(videojs);
          registerIVSQualityPlugin(videojs);
        }

        const videoJsOptions = {
          techOrder: ["AmazonIVS"],
          autoplay: true,
          muted: true,
        };

        // instantiate video.js
        const player = videojs("amazon-ivs-videojs", videoJsOptions);
        const ivsPlayer = player.getIVSPlayer();
        const PlayerEventType = player.getIVSEvents().PlayerEventType;

        ivsPlayer.addEventListener(PlayerEventType.TEXT_METADATA_CUE, (cue) => {
            const metadataText = cue.text;
            console.log('Timed metadata: ', metadataText);
            dispatch({
                type: SET_CURRENT_QUESTION_ACTION,
                question: JSON.parse(metadataText),
            });
        });

        player.ready(() => {
          player.enableIVSQualityPlugin();
          player.src(playbackUrl);
          player.play();
        });

        return () => {
            player.dispose();
        };
        // eslint-disable-next-line
    }, []);

    return (
        <div className="player-wrapper">
            <CurrentQuestion />
            <div data-vjs-player>
                <video id="amazon-ivs-videojs" className="video-js vjs-fluid" playsInline />
            </div>
        </div>
    );
  }

export default Player;
