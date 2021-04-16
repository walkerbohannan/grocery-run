import './StatusMessage.css';
import React from 'react';

export default function StatusMessage(props) {
    if (props.statusMessage !== '') {
        return (
            <div className={"StatusMessage"}>
                {props.statusMessage}
            </div>
        )
    } else {
        return null;
    }
}