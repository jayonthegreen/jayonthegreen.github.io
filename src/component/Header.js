import React from 'react'
import PropTypes from 'prop-types'
import Link, { navigateTo } from 'gatsby-link'
import styled from 'styled-components'

import SearchInput from './SearchInput'

const HeaderWrapper = styled.div`
  position: fixed;
  top: ${props => (props.searchMode ? 0 : -150)}px;
  height: 200px;
  left: 0;
  right: 0;
  opacity: 0.9;
  display: flex;
  background: ${props => (props.searchMode ? 'black' : 'white')};
  color: ${props => (props.searchMode ? 'white' : 'black')};
  transition: all 0.5s;
  flex-direction: column;
`
const HeaderBottom = styled.div`
  margin-top: auto;
  display: flex;
  text-align: center;
  padding: 0.5rem 1rem;
`

const HeaderTitle = styled(Link)`
  text-decoration: none;
  color: inherit;
  margin-right: auto;
`
const HeaderSearchIcon = styled.a`
  cursor: pointer;
  margin-left: auto;
`

class Header extends React.Component {
  state = {
    searchMode: false,
  }

  onClickSearchIcon = () => {
    this.setState({ searchMode: !this.state.searchMode })
  }

  onSubmitSearch = searchKeyword => {
    window.location = `/search/?q=${searchKeyword}`
  }

  render() {
    return (
      <HeaderWrapper searchMode={this.state.searchMode}>
        {this.state.searchMode && (
          <SearchInput onSubmit={this.onSubmitSearch} />
        )}
        <HeaderBottom>
          <HeaderTitle to="/">Holdonnn</HeaderTitle>
          <HeaderSearchIcon onClick={this.onClickSearchIcon}>
            Search
          </HeaderSearchIcon>
        </HeaderBottom>
      </HeaderWrapper>
    )
  }
}

export default Header
