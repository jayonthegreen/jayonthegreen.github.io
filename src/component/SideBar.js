import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { media } from '../utils/style'
import SideBarItem from './SideBarItem'


const Wrapper = styled.div`
  background-color: white;
  transition: all 0.3s ease;
  position: fixed;
  left: 0;
  right: 0;
  width: 300px;
  height: 100vh;
  display: flex;
  flex-direction: column;
  border-right: 1px solid rgba(0, 0, 0, 0.08);
  ${media.mobile`
  left: ${props => props.mobileVisible ? 0 : -300}px;
  top: 50px;
  height: calc(100vh - 50px);
  z-index: 4;
  `}
`

const Top = styled.div`
    border-bottom: 1px solid rgba(0, 0, 0, 0.08);
    padding: 50px;
`
const TopTitle = styled.h1`
    font-size: 1.0rem;
    font-weight: 500;
    color: #333;
    margin-bottom: 0.2rem;
`

const TopDescription = styled.div`
    font-size: 0.7rem;
    color: #666;
    line-height: 1.5;
`

const List = styled.div`
    overflow-y: auto;
`


class SideBar extends React.Component {

    render() {
        return (
            <Wrapper mobileVisible={this.props.mobileSideNavVisible}>
                <Top>
                    <TopTitle>Jaehyun Baek</TopTitle>
                    <TopDescription>
                        Wouldn't it be more consistent to change the direction  <br />
                        if I had a different perspective today than yesterday?
              </TopDescription>
                </Top>
                <List>
                    <SideBarItem to="/" text="All Posts" onClick={this.props.onClickSideBarItem} />
                    <SideBarItem to="/category/book" text="book" onClick={this.props.onClickSideBarItem} isSub/>
                    <SideBarItem to="/category/programming" text="programming" onClick={this.props.onClickSideBarItem} isSub/>
                    <SideBarItem to="/category/movie" text="movie" onClick={this.props.onClickSideBarItem} isSub/>
                    <SideBarItem to="/about" text="About" onClick={this.props.onClickSideBarItem} />
                </List>
            </Wrapper>
        );
    }
}

SideBar.propTypes = {
    onClickSideBarItem: PropTypes.func.isRequired,
    mobileSideNavVisible: PropTypes.bool.isRequired,
}

export default SideBar
