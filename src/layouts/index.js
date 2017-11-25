import React from 'react'
import PropTypes from 'prop-types'
import Helmet from 'react-helmet'
import Header from '../component/Header/Header'

import './index.css'

const TemplateWrapper = ({ children, data }) => (
  <div>
    <Helmet
      title={data.site.siteMetadata.title}
      meta={[
        { name: 'description', content: 'Simple Holdonn' },
        { name: 'keywords', content: 'blog' },
      ]}
    />
    <Header />
    <div
      style={{
        margin: '100px auto',
        maxWidth: 1000,
        padding: '0px 1.0875rem 1.45rem',
        paddingTop: 0,
      }}
    >
      {children()}
    </div>
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