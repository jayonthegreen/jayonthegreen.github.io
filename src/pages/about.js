import React from 'react'
import Link from 'gatsby-link'

const AboutPage = ({ data }) => (
  <div>
    email: rururu0729@gmail.com <br/>
    It will be updated soon.....
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
