import React from 'react'
import PropTypes from 'prop-types'
import NavLink, { navigateTo } from 'gatsby-link'
import styled from 'styled-components'
import { media } from '../utils/style'
import SideBarItem from './SideBarItem'
import hamburgerSvg from './hamburger.svg'

const MobileNav =styled.div`
    display: none;
    ${media.mobile`
    display:flex;
    height: 50px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.08);
    align-items: center;
    `}
`

const MobileNavIcon = styled.img`
    margin: 0 20px;
`

const Wrapper = styled.div`
  transition: all 0.3s ease;
  position: fixed;
  left: 0;
  right: 0;
  width: 300px;
  height: ${props => props.mobileVisible ? 'calc(100vh - 50px)': '100vh'};
  display: flex;
  flex-direction: column;
  border-right: 1px solid rgba(0, 0, 0, 0.08);
  ${media.mobile`
  left: ${props => props.mobileVisible ? 0 : -300}px;`
  } 
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
  state = {
    mobileVisible: false,
  }

  componentDidMount() {
    window.addEventListener('click', this.hide)
  }
  componentWillUnmound() {
    window.removeEventListner('click', this.hide)
  }

  hide = e => {
    const mobileVisible = false;
    this.setState({ mobileVisible })
    this.props.onChangeMobileVisible(mobileVisible)
  }

  toggle = e => {
    e.stopPropagation();
    const mobileVisible = !this.state.mobileVisible;
    this.setState({ mobileVisible })
    this.props.onChangeMobileVisible(mobileVisible)
  }

  render() {
    return (<div>
        <MobileNav>
            <MobileNavIcon src={hamburgerSvg} alt="menu" onClick={this.toggle} />
        </MobileNav>
        <Wrapper mobileVisible={this.state.mobileVisible} onClick={e => this.state.mobileVisible && e.stopPropagation()}>
          <Top>
              <TopTitle>Jaehyun Baek</TopTitle>  
              <TopSubtitle>Software Engineer</TopSubtitle>
              <TopDescription>
              Wouldn't it be more consistent to change the direction  <br/>
              if I had a different perspective today than yesterday?
              </TopDescription>
          </Top>
          <List>
              <SideBarItem to="/" text="home" onClick={(e) => this.state.mobileVisible && this.hide(e)}/>
              <SideBarItem to="/about" text="about" onClick={(e) => this.state.mobileVisible && this.hide(e)}/>
          </List>
      </Wrapper>
      </div>
      );
  }
}

SideBar.propTypes = {
    onChangeMobileVisible: PropTypes.func.isRequired,
}

export default SideBar
