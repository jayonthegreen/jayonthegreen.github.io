import React from 'react'
import PostList from '../component/PostList'

class IndexPage extends React.Component {
  render() {
    return (
        <PostList
          markdownNodes={this.props.data.allMarkdownRemark.edges.map(
            ({ node }) => node
          )}
        />
    )
  }
}

export default IndexPage

export const query = graphql`
  query IndexQuery {
    allMarkdownRemark(
      sort: { order: DESC, fields: [frontmatter___date] }
      filter:{
        id:{
          regex:"/posts/"
        }
      }
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
