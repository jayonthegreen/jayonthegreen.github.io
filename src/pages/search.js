import React from 'react'
import Link from 'gatsby-link'
import styled from 'styled-components'
import { media } from '../utils/style'

import PostList from '../component/PostList'

const SearchKeyword = styled.h1`
  text-align: center;
  ${media.mobile`font-size: 1rem;`}
`


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

  getNodesWithSearchKeyword() {
    const { searchKeyword } = this.state;
    window.nodes = this.props.data.allMarkdownRemark.edges;
    return this.props.data.allMarkdownRemark.edges
    .map(({node}) => node)
    .filter(({fields, frontmatter, html}) => {
      return (
        fields.slug.includes(searchKeyword)  ||
        frontmatter.title.includes(searchKeyword) ||
        frontmatter.date.includes(searchKeyword) ||
        html.includes(searchKeyword)
      );
    })
  }

  render () {
    const resultNodes = this.getNodesWithSearchKeyword();
    return (
      <div>
        <SearchKeyword>
          { resultNodes.length > 0 && 
            `😀 ${resultNodes.length} results about '${this.state.searchKeyword}'`
          }
          { resultNodes.length === 0 && 
            `🙃 no results about '${this.state.searchKeyword}'`
          }
        </SearchKeyword>
        <Link to='/'> Go to Home</Link>
        { resultNodes.length > 0 && <PostList markdownNodes={resultNodes}/> }
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
