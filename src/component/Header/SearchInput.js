import React, { Component } from 'react'
import styled from 'styled-components'

const StyledSearchInput = styled.input`
    background-color: transparent;
    border: none;
    margin: 20px auto;
    width: 300px;
    color: white;
    font-size: 40px;
    outline: none;
`

export default class SearchInput extends Component {
   
    onKeyDown = (e) => {
        if( e.keyCode === 13){
            console.log('enter!')
        }
    }

  render() {
    return (
        <StyledSearchInput
            autoFocus
            onKeyDown={this.onKeyDown}
            type="text"
            placeholder='Type to search'/>
    )
  }
}