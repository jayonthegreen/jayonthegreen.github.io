import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { media } from '../utils/style'

const StyledSearchInput = styled.input`
  background-color: transparent;
  border: none;
  margin: 20px auto;
  width: 300px;
  color: white;
  outline: none;
  text-align: center;
  font-size: 40px; 
  line-height: 60px;
  height: 60px;
  ${
  media.mobile`
  font-size: 30px;
  line-height: 50px;
  height: 50px;
  margin: 10px auto;
  `
  }
`

class SearchInput extends React.Component {
  onKeyDown = e => {
    if (e.keyCode === 13 && e.target.value) {
      e.preventDefault();
      this.props.onSubmit(e.target.value)
    }
  }

  render() {
    return (<StyledSearchInput
        autoFocus
        onKeyDown={this.onKeyDown}
        type="text"
        placeholder="type to search"
      />)
  }
}

SearchInput.ropTypes = {
  onSubmit: PropTypes.func.isRequired,
}

export default SearchInput
