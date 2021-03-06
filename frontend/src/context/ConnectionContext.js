import React, {useContext, useEffect, useReducer, useState} from 'react';
import {HubConnectionBuilder} from "@microsoft/signalr";

const ConnectionContext = React.createContext()

export const useConnection = () => {
    return useContext(ConnectionContext)
}

const reducer = (state, action) => {
    switch (action.type) {
        case 'SET_CONNECTION':
            return {...state, connection: action.connection, connectionState: action.connectionState}
        default:
            return state
    }
}

export const ConnectionProvider = ({children}) => {

    const [state, dispatch] = useReducer(reducer, {connection: null, connectionState: null})
    const [error, setError] = useState()

    const setConnection = (connection) => dispatch({
        type: 'SET_CONNECTION',
        connection,
        connectionState: connection?.state
    })

    useEffect(() => {
        const conn = new HubConnectionBuilder()
            .withUrl(process.env.REACT_APP_HUB_IP)
            .withAutomaticReconnect()
            .build();

        setConnection(conn)
    }, [])

    useEffect(() => {
        if (!state.connection) return

        state.connection.start()
            .then(result => {
                console.log('Connected!');
                setConnection(state.connection)
            })
            .catch(e => console.log('Connection failed: ', e));

        state.connection.on('ReceiveError', message => {
            setError(message)
            console.log('[ERROR]: ', message)
        })

    }, [state.connection])

    return (
        <ConnectionContext.Provider value={{connection: state.connection, connectionState: state.connectionState, error}}>
            {children}
        </ConnectionContext.Provider>
    );
};
