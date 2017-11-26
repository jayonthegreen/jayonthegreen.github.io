import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'

const StyledSearchInput = styled.input`
    background-color: transparent;
    border: none;
    margin: 20px auto;
    width: 300px;
    color: white;
    font-size: 40px;
    outline: none;
    line-height: 60px;
    height: 60px;
`

class SearchInput extends React.Component {
    onKeyDown = (e) => {
        if (e.keyCode === 13 && e.target.value) {
            this.props.onSubmit(e.target.value)
        }
    }

    render() {
        return (
            <StyledSearchInput
                autoFocus
                onKeyDown={this.onKeyDown}
                type="text"
                placeholder='Type to search' />
        )
    }
}

SearchInput.ropTypes = {
    onSubmit: PropTypes.func.isRequired,
}

export default SearchInput
