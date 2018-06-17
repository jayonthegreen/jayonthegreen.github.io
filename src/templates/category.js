import React from 'react'
import PostList from '../component/PostList'

class CategoryPage extends React.Component {
  render() {
    return (
      <div>
        <PostList
          markdownNodes={this.props.data.allMarkdownRemark.edges.map(
            ({ node }) => node
          )}
        />
      </div>
    )
  }
}

export default CategoryPage

export const query = graphql`
  query CategoryQuery($category: String!) {
    allMarkdownRemark(
      sort: { order: DESC, fields: [frontmatter___date] }
      filter:{frontmatter:{category:{eq: [$category]}}}
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
