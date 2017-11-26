import React from 'react'
import Link from 'gatsby-link'
import PostList from '../component/PostList'


class IndexPage  extends React.Component {
  render() {
    return(
      <div>
        <h1 className='IndexPage__title'>Hi!</h1>
        <h2 className='IndexPage__subtitle'>Wouldn't it be more consistent to change the direction <br/> if I had a different perspective today than yesterday?</h2>
        <PostList markdownNodes={this.props.data.allMarkdownRemark.edges.map(({node}) => node)} />
      </div>
    )
  }
}

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
