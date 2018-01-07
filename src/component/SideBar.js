import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { media } from '../utils/style'
import SideBarItem from './SideBarItem'


const Wrapper = styled.div`
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
const TopSubtitle = styled.h2`
    font-size: 0.8rem;
    color: #666;
    font-weight: 500;
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
                    <TopSubtitle>Software Engineer</TopSubtitle>
                    <TopDescription>
                        Wouldn't it be more consistent to change the direction  <br />
                        if I had a different perspective today than yesterday?
              </TopDescription>
                </Top>
                <List>
                    <SideBarItem to="/" text="home" onClick={this.props.onClickSideBarItem} />
                    <SideBarItem to="/about" text="about" onClick={this.props.onClickSideBarItem} />
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
