import React from 'react'
import PropTypes from 'prop-types'
import Helmet from 'react-helmet'
import Header from '../component/Header'
import SideBar from '../component/SideBar'
import styled from 'styled-components'
import { media } from '../utils/style'


import './reset.css'
import './spoqa-han-sans.css'
import './index.css'


const Content = styled.div`
  position: relative; 
  margin-left: 300px;
  padding: 50px;
  height: 100vh;
  overflow-y: auto;
  ${media.mobile`
  margin-left: ${props => props.mobileSideNavVisible ? 300 : 0}px;
  padding: 20px;
  `}
  transition: all 0.3s ease;
`

const ContentBlock = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: black;
  opacity: 0.7;
`

class TemplateWrapper extends React.Component {

  state = {
    mobileSideNavVisible: false,
  }

  render() {
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
          <SideBar onChangeMobileVisible={mobileSideNavVisible => this.setState({ mobileSideNavVisible })} />
          <Content mobileSideNavVisible={this.state.mobileSideNavVisible}>
            {this.state.mobileSideNavVisible && <ContentBlock />}
            {this.props.children()}
          </Content>
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
