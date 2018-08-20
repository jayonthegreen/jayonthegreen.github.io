import React from 'react'
import PropTypes from 'prop-types'
import Helmet from 'react-helmet'
import SideBar from '../component/SideBar'
import Navigation from '../component/Navigation'
import styled from 'styled-components'
import { media } from '../utils/style'
import './reset.css'
import './spoqa-han-sans.css'
import './index.css'

const NavigationWrapper = styled.div`
  display: none;
  ${media.mobile`
  display: block;
  `}
`

const Body = styled.div`
  position: fixed;
  top:0;
  left:0;
  right:0;
  bottom:0;
  max-height: ${props => props.mobileSideNavVisible ? '100vh' : 'auto'};
  overflow-y: ${props => props.mobileSideNavVisible ? 'hidden' : 'auto'};
  -webkit-overflow-scrolling: touch;
`

const ContentBlock = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: black;
  z-index: 2;
  opacity: 0.7;
  display: ${props => props.mobileSideNavVisible ? 'block' : 'none'};
  cursor: pointer;
`


const Content = styled.div`
  position: relative; 
  margin-left: 300px;
  padding-top: 50px;
  padding-left:50px;
  padding-right:50px;
  z-index: 0;
  transition: all 0.3s ease;
  ${media.mobile`
  margin-left: 0;
  min-height: calc( 100vh - 50px );
  padding-left:20px;
  padding-right:20px;
  `}
`

class TemplateWrapper extends React.Component {

  state = {
    mobileSideNavVisible: false,
  }

  toggleMobileSideNavVisible = (e) => {
    e.stopPropagation();
    const { mobileSideNavVisible  } = this.state;
    this.setState({mobileSideNavVisible : !mobileSideNavVisible})
  }

  onClickSideBarItem = (e) => {
    e.stopPropagation();
    this.hideWhenMobileSideNav();
  }

  componentDidMount() {
    window.addEventListener('click', this.hideWhenMobileSideNav )
  }
  componentWillUnmound() {
    window.removeEventListner('click', this.hideWhenMobileSideNav )
  }

  hideWhenMobileSideNav = () => {
    if (this.state.mobileSideNavVisible ) {
      this.setState({ mobileSideNavVisible: false })
    }
  }

  render() {
    const { mobileSideNavVisible } = this.state;
    const { title, image } = this.props.data.site.siteMetadata;
    const imageUrl = 'http://holdonnn.me' + image;
    return (
      <div>
        <Helmet
          title={title}
          meta={[
            { name: 'description', content: 'holdonnn\'s blog' },
            { name: 'og:description', content: 'holdonnn\'s blog' },
            { name: 'keywords', content: 'blog' },
            { name: 'image', content: imageUrl },
            { name: 'og:image', content: imageUrl },
          ]}
        />
        <NavigationWrapper>
          <Navigation
            onClickMenu={this.toggleMobileSideNavVisible}
          />
        </NavigationWrapper>
        <Body 
        id="body"
        mobileSideNavVisible={mobileSideNavVisible}>
          <SideBar
            onClickSideBarItem={this.onClickSideBarItem}
            mobileSideNavVisible={mobileSideNavVisible}
          />
          <Content>
            <ContentBlock mobileSideNavVisible={mobileSideNavVisible} />
            {this.props.children()}
          </Content>
        </Body>
      </div>
    )
  }
}

TemplateWrapper.propTypes = {
  children: PropTypes.func,
}

export default TemplateWrapper

export const query = graphql`
  query LayoutQuery {
    site {
      siteMetadata {
        title
        image
      }
    }
  }
`
