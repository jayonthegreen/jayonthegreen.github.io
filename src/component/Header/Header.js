import React from 'react'
import PropTypes from 'prop-types'
import Link from 'gatsby-link'
import styled from 'styled-components'

const HeaderWrapper = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  opacity: 0.9;
  display: flex;
  background: red;
  height: ${props => props.expand ? 200 : 50}px;
  transition: height 0.5s;
`

const HeaderTitle = styled(Link)`
  text-decoration: none;
  color: inherit;
`
const HeaderSearchIcon = styled.a`

`

class Header extends React.Component {

  state = {
    searchMode: true
  }

  onClickSearchIcon = () => {
    this.setState({searchMode: !this.state.searchMode})
  }

  render() {
    return (
      <HeaderWrapper expand={this.state.searchMode}>
        <HeaderTitle to="/">Holdonnn!!!!</HeaderTitle>
        <HeaderSearchIcon onClick={this.onClickSearchIcon}>Search</HeaderSearchIcon>
      </HeaderWrapper>
    )
  }
}

export default Header;