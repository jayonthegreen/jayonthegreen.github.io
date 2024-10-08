import React from 'react'
import {graphql} from 'gatsby'
import Layout from '../component/Layout'
import PostList from '../component/PostList'
import Helmet from "react-helmet";

class IndexPage extends React.Component {
    render() {
        return (
            <Layout>
                <Helmet>
                    <link rel="canonical" href="https://jayonthegreen.github.io"/>
                </Helmet>
                <PostList
                    markdownNodes={this.props.data.allMarkdownRemark.edges.map(
                        ({node}) => node
                    )}
                />
            </Layout>
        )
    }
}

export default IndexPage

export const query = graphql`
query IndexQuery {
  allMarkdownRemark(sort: {frontmatter: {date: DESC}}) {
    totalCount
    edges {
      node {
        id
        frontmatter {
          title
          date(formatString: "YYYY.MM.DD")
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
