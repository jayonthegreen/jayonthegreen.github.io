import React from 'react'
import { graphql } from 'gatsby'

const AboutPage = ({ data }) => (
  <div>
    mail: <a href="mailto:jaehyunbaek.engineer@gmail.com">jaehyunbaek.engineer@gmail.com</a><br/>
    profile: <a href="https://bit.ly/jaehyunbaek">https://bit.ly/jaehyunbaek</a>
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
