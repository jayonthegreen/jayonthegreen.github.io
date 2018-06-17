import React from 'react'
import NavLink from 'gatsby-link'
import styled from 'styled-components'

const Wrapper = styled(NavLink)`
    text-decoration: none;
    display: block;
    color: inherit;
    font-size: ${props => props.isSubType ? '0.7' :'0.8'}rem;
    padding-left: ${props => props.isSubType ? 60 : 50}px;
    margin-top: ${props => props.isSubType ? 10 : 30}px;
    &.active{
      font-weight: bold;
    }
`

class SideBarItem extends React.Component {
  isActive = (match, location) => {
    if (match) {
      return true;
    }
    const { pathname, search } = location;
    return pathname + search === this.props.to
  }
  
  render() {
    return (
      <Wrapper 
          isActive={this.isActive}
          exact to={this.props.to}
          onClick={this.props.onClick}>
          {this.props.text}
      </Wrapper>
    )
  }
}

export default SideBarItem
