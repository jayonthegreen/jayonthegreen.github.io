import React from 'react'
import PropTypes from 'prop-types'
import Helmet from 'react-helmet'
import Header from '../component/Header'
import styled from 'styled-components'

import './spoqa-han-sans.css'
import './reset.css'
import './index.css'

const Wrapper = styled.div`
margin: 50px auto;
max-width: 720px;
padding: 0 1.0875rem 1.45rem;
`

const TemplateWrapper = ({children, data, location}) => (
  <div>
    <Helmet
      title={data.site.siteMetadata.title}
      meta={[
        {name: 'description', content: 'Simple Holdonn'},
        {name: 'keywords', content: 'blog'},
      ]}
    />
    <Wrapper>
      <Header />
      {children()}
    </Wrapper>
  </div>
)

TemplateWrapper.propTypes = {
  children: PropTypes.func,
}

export default TemplateWrapper

export const query = graphql`
  query LayoutQuery {
    site {
      siteMetadata {
        title
      }
    }
  }
`
