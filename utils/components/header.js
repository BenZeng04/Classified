import {auth} from "../firebase/firebase";
import React from "react";

export function HeaderDivider() {
    return <div className={'divider-vertical'}/>;
}

export function GlobalHeader(props) {
    const authInfo = props.authInfo;
    if (authInfo.authUser == null) return (<div className={'header'}>
        <a className={'item'} href={'/'}>Home</a>
        <HeaderDivider/>
        <a className={'item'} href={'/join'}>Join</a>
        <p className={'item'}>or</p>
        <a className={'item'} href={'/create'}>Create</a>
        <a className={'item right'} href={'/login'}>Login</a>
        <p className={'item'}>or</p>
        <a className={'item'} href={'/signup'}>Sign Up</a>
    </div>);

    return (<div className={'header'}>
        <a className={'item'} href={'/'}>Home</a>
        <HeaderDivider/>
        {authInfo.currentMatchID == null ? <></> : <a className={'item'} href={'/lobby'}>Continue Match</a>}
        {authInfo.currentMatchID == null ? <></> : <HeaderDivider/>}
        <a className={'item'} href={'/join'}>Join</a>
        <p className={'item'}>or</p>
        <a className={'item left'} href={'/create'}>Create</a>
        <div className={'profile'}>
            <a className={'item'} href={'/user'}>{`${authInfo.userData.username}'s Profile`}</a>
            <a className={'dropdown-item'} href={'/logout'} onClick={(evt) => {
                auth.signOut();
                return true;
            }}>Log Out</a>
        </div>
    </div>);
}


export default GlobalHeader;