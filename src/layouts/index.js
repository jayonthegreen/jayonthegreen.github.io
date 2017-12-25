import React from 'react'
import PropTypes from 'prop-types'
import Helmet from 'react-helmet'
import Header from '../component/Header'

import './reset.css'
import './index.css'
import './spoqa-han-sans.css'

class TemplateWrapper extends React.Component {
  render() {
    return (
      <div>
      <Helmet
        title={this.props.data.site.siteMetadata.title}
        meta={[
          {name: 'description', content: 'holdonnn\'s blog'},
          {name: 'keywords', content: 'blog'},
        ]}
      />
      <div className="Wrapper">
        <Header />
        {this.props.children()}
      </div>
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
      }
    }
  }
`
