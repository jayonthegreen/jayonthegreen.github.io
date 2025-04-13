import React from "react";

export default function Nav() {

    return(
        <nav>
            <a href="/">Jay</a>
            <span style={{fontSize: "small", marginLeft: "10px"}}>
                {' '}
                <a href="mailto:jayonthegreen@gmail.com">jayonthegreen@gmail.com</a>
            </span>
        </nav>
    )
}