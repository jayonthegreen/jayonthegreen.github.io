import React from 'react'
import NavLink from 'gatsby-link'
import styled from 'styled-components'

const Wrapper = styled.div`
    text-decoration: none;
    display: block;
    font-size: ${props => props.isSub ? '0.7' :'0.8'}rem;
    padding-left: ${props => props.isSub ? 60 : 50}px;
    margin-top: ${props => props.isSub ? 10 : 30}px;
    
    a {
      color: inherit;
      text-decoration: none;
      &.active{
      font-weight: bold;
    }
    }
`

class SideBarItem extends React.Component {
  
  render() {
    return (
      <Wrapper
          exact to={this.props.to}
          onClick={this.props.onClick}
          isSub={this.props.isSub}
      >
          <NavLink
            style={{color: 'inherit'}}
            exact to={this.props.to}
            onClick={this.props.onClick}>{this.props.text}</NavLink>
      </Wrapper>
    )
  }
}

export default SideBarItem
