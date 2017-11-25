import React from 'react'
import Link from 'gatsby-link'

import Post from '../component/Post/Post'

const IndexPage = ({ data }) => (
  <div>
    <h1>Hi! </h1>
    {data.allMarkdownRemark.totalCount} Posts
    {data.allMarkdownRemark.edges.map(({ node }) =>(
      <Post 
        key={node.id }
        title={node.frontmatter.title}
        date={node.frontmatter.date}
      />
    ))}
  </div>
)

export default IndexPage

export const query = graphql`
query IndexQuery {
  allMarkdownRemark (sort: { order: DESC, fields: [frontmatter___date]}){
    edges {
      node {
        id
        frontmatter {
          title
          date(formatString: "YYYY-DD-MM")
        }
      }
    }
  }
}
`