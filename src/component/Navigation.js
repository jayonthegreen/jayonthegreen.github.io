import React from 'react'
import PropTypes from 'prop-types'
import NavLink, { navigateTo } from 'gatsby-link'
import styled from 'styled-components'
import { media } from '../utils/style'
import hamburgerSvg from './hamburger.svg'

const Wrapper = styled.div`
    position: fixed;
    display:flex;
    left: 0;
    right: 0;
    top: 0;
    background-color: white;
    height: 50px;
    z-index: 2;
    border-bottom: 1px solid rgba(0, 0, 0, 0.08);
    align-items: center;
`

const NavItem = styled.div`
    cursor: pointer;
    display:flex;
    align-items: center;
`

const NavItemImg = styled.img`
    margin: 0 20px;
`

class Navigation extends React.Component {

    render() {
        return (
            <Wrapper>
                <NavItem onClick={this.props.onClickMenu}><NavItemImg src={hamburgerSvg} alt="menu" /></NavItem>
            </Wrapper>
        )
    }
}

Navigation.propTypes = {
    onClickMenu: PropTypes.func.isRequired,
}

export default Navigation
