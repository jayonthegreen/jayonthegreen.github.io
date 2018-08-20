import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import hamburgerSvg from './hamburger.svg'
import { media } from '../utils/style'

const Wrapper = styled.div`
    display: none;
    ${media.mobile`
        display: flex;
    `}
    position: fixed;
    left: 0;
    right: 0;
    top: 0;
    background-color: white;
    height: 50px;
    z-index: 2;
    border-bottom: 1px solid rgba(0, 0, 0, 0.08);
`

const NavItem = styled.div`
    cursor: pointer; 
`

const NavItemImg = styled.img`
    margin: 10px 20px;
    cursor: pointer;
`

class Navigation extends React.Component {

    render() {
        return (
            <Wrapper>
                <NavItem onClick={this.props.onClickMenu}>
                    <NavItemImg 
                    src={hamburgerSvg} alt="menu" />
                </NavItem>
            </Wrapper>
        )
    }
}

Navigation.propTypes = {
    onClickMenu: PropTypes.func.isRequired,
}

export default Navigation
