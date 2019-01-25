import React from 'react'
import PropTypes from 'prop-types'
import Helmet from 'react-helmet'
import styled from 'styled-components'
import { media } from '../utils/style'
import Profile from '../component/Profile';
import './reset.css'
import './spoqa-han-sans.css'
import './index.css'

const Content = styled.div`
  padding: 20px 50px;
  transition: all 0.3s ease;
  ${media.mobile`padding: 20px;`}
`

class TemplateWrapper extends React.Component {

  render() {;
    const { title, image } = this.props.data.site.siteMetadata;
    const imageUrl = 'https://blog.ordinarysimple.com' + image;
    return (
      <React.Fragment>
        <Helmet
          title={title}
          meta={[
            { name: 'description', content: 'ordinary, simple.' },
            { name: 'og:description', content: 'jaehyun baek blog' },
            { name: 'keywords', content: 'blog,ordinarysimple,blog.ordinarysimple.com,백재현,jaehyunbaek,holdonnnn' },
            { name: 'image', content: imageUrl },
            { name: 'og:image', content: imageUrl },
          ]}
        />
        <Profile/>
        <Content>
          {this.props.children()}
        </Content> 
      </React.Fragment>
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
