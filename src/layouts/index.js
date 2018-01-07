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

const Body = styled.div``

const Content = styled.div`
  position: relative; 
  margin-left: 300px;
  padding: 50px;
  ${media.mobile`
  margin-left: ${props => props.mobileSideNavVisible ? 300 : 0}px;
  margin-top: 50px;
  padding: 20px;
  `}
  transition: all 0.3s ease;
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
    this.state.mobileSideNavVisible && this.setState({ mobileSideNavVisible: false })
  }



  render() {
    const { mobileSideNavVisible } = this.state;
    const { title, image } = this.props.data.site.siteMetadata;
    return (
      <div>
        <Helmet
          title={title}
          meta={[
            { name: 'description', content: 'holdonnn\'s blog' },
            { name: 'og:description', content: 'holdonnn\'s blog' },
            { name: 'keywords', content: 'blog' },
            { name: 'image', content: image },
            { name: 'og:image', content: image },
          ]}
        />
        <NavigationWrapper>
          <Navigation
            onClickMenu={this.toggleMobileSideNavVisible}
          />
        </NavigationWrapper>
        <Body>
          <SideBar
            onClickSideBarItem={this.onClickSideBarItem}
            mobileSideNavVisible={mobileSideNavVisible}
          />
          <Content mobileSideNavVisible={mobileSideNavVisible}>
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
