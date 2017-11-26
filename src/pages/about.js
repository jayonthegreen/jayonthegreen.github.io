import React from 'react'
import Link from 'gatsby-link'

const AboutPage = ({ data }) => (
  <div>
    <h1>About</h1>
    - email: rururu0729@gmail.com <br/>
  </div>
)

export default AboutPage

export const query = graphql`
  query AboutQuery {
    site {
      siteMetadata {
        title
      }
    }
  }
`
