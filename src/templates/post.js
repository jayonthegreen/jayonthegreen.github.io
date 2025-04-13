import React from 'react'
import { graphql } from 'gatsby'
import Nav from '..//nav'

class PostTemplate extends React.Component {
  render() {
    return (
      <main>
        <Nav/>
        <h1>{this.props.data.markdownRemark.frontmatter.title}</h1>
        <div
          dangerouslySetInnerHTML={{ __html: this.props.data.markdownRemark.html }}
        />
      </main>
    )
  }

}

export default PostTemplate

export const query = graphql`
  query BlogPostQuery($slug: String!) {
    markdownRemark(fields: { slug: { eq: $slug } }) {
      html
      fields {
        slug
      }
      frontmatter {
        title
        date(formatString: "YYYY.MM.DD")
        description
        keywords
        image
      }
    }
  }
`
