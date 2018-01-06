import React from 'react'
import PropTypes from 'prop-types'
import Link, { navigateTo } from 'gatsby-link'
import styled from 'styled-components'
import { media } from '../utils/style'

import SearchInput from './SearchInput'

const headerNormalHeight = 50;
const SearchModeHeight = 150;
const MobileSearchModeHeight = 120;
const HeaderWrapper = styled.div`
  position: fixed;
  height: ${SearchModeHeight}px;
  top: ${props => (props.searchMode ? 0 : -(SearchModeHeight - headerNormalHeight))}px;
  left: 0;
  right: 0;
  opacity: 0.9;
  display: flex;
  background: ${props => (props.searchMode ? 'black' : 'white')};
  color: ${props => (props.searchMode ? 'white' : 'black')};
  transition: all 0.5s;
  flex-direction: column;
  ${media.mobile`
  height: ${MobileSearchModeHeight}px;
  top: ${props => (props.searchMode ? 0 : -(MobileSearchModeHeight - headerNormalHeight))}px;
  `}
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

  componentDidMount() {
    window.addEventListener('click', this.hideSearchModeHeader)
  }
  componentWillUnmound() {
    window.removeEventListner('click', this.hideSearchModeHeader)
  }

  hideSearchModeHeader = e => {
    this.setState({ searchMode: false })
  }

  onClickSearchIcon = (e) => {
    e.stopPropagation();
    this.setState({ searchMode: !this.state.searchMode })
  }

  onSubmitSearch = searchKeyword => {
    window.location = `/search/?q=${searchKeyword}`
  }

  render() {
    return (
      <HeaderWrapper searchMode={this.state.searchMode} onClick={e => this.state.searchMode && e.stopPropagation()}>
        <SearchInput style={{display: this.state.searchMode ? 'block': 'none'}} onSubmit={this.onSubmitSearch} />
        <HeaderBottom>
          <HeaderTitle to="/">holdonnn</HeaderTitle>
          <HeaderSearchIcon onClick={this.onClickSearchIcon}>
            🔎
          </HeaderSearchIcon>
        </HeaderBottom>
      </HeaderWrapper>
    )
  }
}

export default Header
