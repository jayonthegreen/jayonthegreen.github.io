import React from 'react'
import Link from 'gatsby-link'

import Post from '../component/Post/Post'

const IndexPage = ({ data }) => (
  <div>
    <h1>Hi! </h1>
    <h2>
      Wouldn't it be more consistent to change the direction  <br/>
      if I had a different perspective today than yesterday?</h2>
    {data.allMarkdownRemark.totalCount} Posts
    {data.allMarkdownRemark.edges.map(({ node }) =>(
      <Link
      key={node.id }
      to={node.fields.slug}
      style={{ textDecoration: `none`, color: `inherit` }}>
        <Post 
          title={node.frontmatter.title}
          date={node.frontmatter.date}        
        />
      </Link>
    ))}
  </div>
)

export default IndexPage

export const query = graphql`
query IndexQuery {
  allMarkdownRemark (sort: { order: DESC, fields: [frontmatter___date]}){
    totalCount
    edges {
      node {
        id
        frontmatter {
          title
          date(formatString: "YYYY-MM-DD")
        }
        fields {
          slug
        }
      }
    }
  }
}
`