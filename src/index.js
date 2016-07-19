'use strict';

/**
 *
 * information
 *
 *      user action
 *
 *      system response
 */

let ActionCapturer = require('./actionCapturer');

let recordState = require('./recordState');

let RecordStore = require('./recordStore');

let {
    genId
} = require('./util');

module.exports = ({
    winId,
    rootId,
    refreshId,
    passData,
    memory,
    playedTime
}) => {
    const pageInfoKey = `${rootId}-pageInfo`;

    refreshId = refreshId || genId();

    let record = ({
        addAction,
        updateState
    }, actionConfig) => {
        let {
            capture
        } = ActionCapturer(actionConfig);

        let accept = (action) => {
            // at this moment, the event handlers still not triggered, but UI may changed (like scroll, user input)

            updateState(record.getPageState(), 'beforeRecordAction');
            // add action
            addAction(action);
        };

        capture(accept);

        recordState.start(50, (state) => {
            updateState(state);
        }, 'regular');
    };

    let getStore = () => RecordStore(memory, pageInfoKey, {
        winId,
        playedTime,
        refreshId
    });

    let getRecordData = () => {
        // get history
        return getStore().then((store) => {
            return store.getRecordData();
        });
    };

    let start = () => getStore().then((store) => record(store, passData.config.action));

    return {
        start,
        getRecordData
    };
};
