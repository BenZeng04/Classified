import React from "react";

export function Title(props) {
    return <h1 className={'title'}>{props.name}</h1>
}

export function Divider() {
    return <hr className={'divider'}/>;
}

export function Error(props) {
    return (<div className={'error'}>
        {props.error}
    </div>)
}