import React from 'react'
import styled from 'styled-components'

import PostList from '../component/PostList'

const SearchKeyword = styled.div`
  text-align: center;
`

class SearchPage extends React.Component {
  state = {
    searchKeyword: null,
  }

  componentDidMount() {
    const { search } = window.location
    const searchKeyword = search
      .replace('?', '')
      .split('&')
      .reduce((_, params) => {
        const [key, value] = params.split('=')
        return (key === 'q' && decodeURIComponent(value)) || ''
      }, '')
    this.setState({ searchKeyword })
  }

  getNodesWithSearchKeyword(searchKeyword) {
    if (!searchKeyword) return []
    return this.props.data.allMarkdownRemark.edges
      .map(({ node }) => node)
      .filter(({ fields, frontmatter, html }) => {
        return (
          fields.slug.includes(searchKeyword) ||
          frontmatter.title.includes(searchKeyword) ||
          frontmatter.date.includes(searchKeyword) ||
          (frontmatter.keywords|| []).includes(searchKeyword) ||
          html.includes(searchKeyword)
        )
      })
  }

  render() {
    const resultNodes = this.getNodesWithSearchKeyword(this.state.searchKeyword);
    if (!this.state.searchKeyword){
      return null;
    }
    return (
      <React.Fragment>
        <SearchKeyword>
            {`${resultNodes.length } posts about "${this.state.searchKeyword}"`}
        </SearchKeyword>
        <PostList markdownNodes={resultNodes} />
      </React.Fragment>
    )
  }
}

export default SearchPage

export const query = graphql`
query SearchPageQuery {
  allMarkdownRemark(sort: { order: DESC, fields: [frontmatter___date] }) {
    totalCount
    edges {
      node {
        id
        frontmatter {
          title
          date(formatString: "YYYY-MM-DD")
          description
          category
          keywords
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
