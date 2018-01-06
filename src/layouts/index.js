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
  overflow-y: ${props => props.mobileSideNavVisible ? 'hidden': 'scroll'};
  ${media.mobile`
  margin-left: ${props => props.mobileSideNavVisible ? 300 : 0}px;
  padding: 20px;
  height: calc(100vh - 50px);
  `}
  transition: all 0.3s ease;
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
