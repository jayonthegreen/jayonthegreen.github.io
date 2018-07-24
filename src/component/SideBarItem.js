import React from 'react'
import NavLink from 'gatsby-link'
import styled from 'styled-components'

const Wrapper = styled.div`
    a{
      font-size: ${props => props.isSub ? '0.7' :'0.8'}rem;
      padding-left: ${props => props.isSub ? 60 : 50}px;
      margin-top: ${props => props.isSub ? 10 : 30}px;
    }
  
`

const Item = styled(NavLink)`
    text-decoration: none;
    display: block;
    font-size: ${props => props.isSub ? '0.7' :'0.8'}rem;
    padding-left: ${props => props.isSub ? 60 : 50}px;
    margin-top: ${props => props.isSub ? 10 : 30}px;
    color: inherit;
    text-decoration: none;
    &.active{font-weight: bold;}
  
`

class SideBarItem extends React.Component {
  
  render() {
    return (
      <Wrapper isSub={this.props.isSub}>
          <Item
            exact to={this.props.to}
            onClick={this.props.onClick}
            exact to={this.props.to}
            onClick={this.props.onClick}>{this.props.text}</Item></Wrapper>
    )
  }
}

export default SideBarItem
