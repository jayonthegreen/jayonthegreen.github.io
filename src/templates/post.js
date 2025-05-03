import React from 'react'
import { graphql } from 'gatsby'
import Nav from '../Nav'

class PostTemplate extends React.Component {
  render() {
    return (
      <>
        <title>{this.props.data.markdownRemark.frontmatter.title}</title>
        <meta name="description" content={this.props.data.markdownRemark.frontmatter.description} />
        <meta name="keywords" content={this.props.data.markdownRemark.frontmatter.keywords} />
        <meta property="og:title" content={this.props.data.markdownRemark.frontmatter.title} />
        <meta property="og:description" content={this.props.data.markdownRemark.frontmatter.description} />
        <meta property="og:image" content={this.props.data.markdownRemark.frontmatter.image} />
        <meta property="og:url" content={`https://example.com${this.props.data.markdownRemark.fields.slug}`} />
        <meta property="og:type" content="article" />
        <meta property="og:site_name" content="Jay" />
        <main>
          <Nav/>
          <h1>{this.props.data.markdownRemark.frontmatter.title} </h1>
          <div style={{'fontSize': 'medium', textAlign: 'right', marginBottom: '1em', 
            maxWidth: '60%', marginLeft: 'auto'}}>
            {this.props.data.markdownRemark.frontmatter.date}
            <br/>
            {this.props.data.markdownRemark.frontmatter.description} 
          </div>
          <div
            dangerouslySetInnerHTML={{ __html: this.props.data.markdownRemark.html }}
          />
        </main>
      </>
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
