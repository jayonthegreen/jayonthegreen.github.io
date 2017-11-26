import React from 'react'
import Link from 'gatsby-link'

import PostList from '../component/PostList'

class SearchPage extends React.Component {

  componentWillMount () {
    const { search } = window.location
    const searchKeyword = search
      .replace('?', '')
      .split('&')
      .reduce((acc, params) => {
        const [key, value] = params.split('=')
        return key === 'q' && decodeURIComponent(value) || ''
      }, '')
    this.setState({searchKeyword})
  }

  componentDidMount () {
    console.log(this.props.data.allMarkdownRemark.edges.map(({node}) => node))
  }

  render () {
    return (
      <div>
        {this.state.searchKeyword}
        <Link to='/'> Go to Home</Link>
        <PostList
            markdownNodes={this.props.data.allMarkdownRemark.edges.map(({node}) => node)}
        />
      </div>
    )
  }
}

export default SearchPage

export const query = graphql`
query SearchPageQuery {
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
            html
          }
        }
      }

}
`
