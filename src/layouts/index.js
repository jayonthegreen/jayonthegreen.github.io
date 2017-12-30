import React from 'react'
import PropTypes from 'prop-types'
import Helmet from 'react-helmet'
import Header from '../component/Header'
import styled from 'styled-components'

import './reset.css'
import './spoqa-han-sans.css'
import './index.css'

const Wrapper = styled.div`
margin: 50px auto;
max-width: 720px;
padding: 0 1.0875rem 1.45rem;
`

class TemplateWrapper extends React.Component {
  render() {
    const { title, image } = this.props.data.site.siteMetadata;
    return (
      <div>
      <Helmet
        title={title}
        meta={[
          {name: 'description', content: 'holdonnn\'s blog'},
          {name: 'og:description', content: 'holdonnn\'s blog'},
          {name: 'keywords', content: 'blog'},
          {name: 'image', content: image },
          {name: 'og:image', content: image },
        ]}
      />
      <Wrapper>
        <Header />
        {this.props.children()}
      </Wrapper>
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
