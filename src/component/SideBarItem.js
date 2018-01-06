import React from 'react'
import PropTypes from 'prop-types'
import NavLink from 'gatsby-link'
import styled from 'styled-components'
import { media } from '../utils/style'

const paddingSide = 50;
const Wrapper = styled(NavLink)`
    text-decoration: none;
    color: inherit;
    display: block;
    font-size: 0.8rem;
    padding: 1rem ${paddingSide}px;
    &.active{
      font-weight: bold;
    }
`

class SideBarItem extends React.Component {
  render() {
    return (
      <Wrapper exact to={this.props.to} onClick={this.props.onClick}>
          {this.props.text}
      </Wrapper>
    )
  }
}

export default SideBarItem
