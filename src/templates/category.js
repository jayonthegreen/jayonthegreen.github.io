import React from 'react'
import PostList from '../component/PostList'
import Layout from '../component/Layout'
import { graphql } from 'gatsby'

class CategoryPage extends React.Component {
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

export default CategoryPage

export const query = graphql`
  query IndexQuery1($category: String!) {
    allMarkdownRemark(
      sort: { order: DESC, fields: [frontmatter___date] }
      filter:{frontmatter:{category:{eq: $category}}}
    ) {
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
