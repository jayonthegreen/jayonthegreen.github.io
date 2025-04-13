import React from 'react'
import { graphql } from 'gatsby'
import Nav from '../Nav'

class PostTemplate extends React.Component {
  render() {
    return (
      <main>
        <Nav/>
        <h1>{this.props.data.markdownRemark.frontmatter.title} </h1>
        <div style={{'fontSize': 'medium', textAlign: 'right', marginBottom: '1em'}}>
          {this.props.data.markdownRemark.frontmatter.date}
          {' '}
          {this.props.data.markdownRemark.frontmatter.description} 
        </div>
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
