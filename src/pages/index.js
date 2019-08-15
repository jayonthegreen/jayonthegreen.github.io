import React from 'react'
import { graphql } from 'gatsby'
import Layout from '../component/Layout'
import PostList from '../component/PostList'

class IndexPage extends React.Component {
  render() {
    return (
      <Layout>  
        <PostList
          markdownNodes={this.props.data.allMarkdownRemark.edges.map(
            ({ node }) => node
          )}
        />
      </Layout>
    )
  }
}

export default IndexPage

export const query = graphql`
  query IndexQuery {
    allMarkdownRemark(
      sort: { order: DESC, fields: [frontmatter___date] }
    )
    {
      totalCount
      edges {
        node {
          id
          frontmatter {
            title
            category
            date(formatString: "YYYY-MM-DD")
            description
          }
          fields {
            slug
          }
        }
      }
    }
  }
`
