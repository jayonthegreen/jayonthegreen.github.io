import React from 'react'
import { graphql } from 'gatsby'
import Nav from '../Nav'
import { useSiteMetadata } from '../useSiteMetadata'



class PostTemplate extends React.Component {
  
  render() {

    return (
      <>
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

export function Head({ data}) {
  const sitemeta = useSiteMetadata();
  const tilte = data.markdownRemark.frontmatter.title || sitemeta.title
  const description = data.markdownRemark.frontmatter.description || sitemeta.description
  const keywords = (data.markdownRemark.frontmatter.tags || []).join(', ').replace(/#/g, '')
  const image = `${sitemeta.siteUrl}${data.markdownRemark.frontmatter.image || sitemeta.image}`
  return (
    <>
      <title>{tilte}</title>
      <meta property="og:title" content={tilte} />

      <meta name="description" content={description} />
      <meta property="og:description" content={description} />

      <meta name="keywords" content={keywords} />
      <meta property="og:image" content={image} />
    </>
  )
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
        tags
        image
      }
    }
  }
`
