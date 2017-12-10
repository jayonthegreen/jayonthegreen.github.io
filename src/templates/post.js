import React from 'react'
import Link from 'gatsby-link'
import styled from 'styled-components';

const Header = styled.h1`
  margin: 1rem 0;
`

class PostTemplate extends React.Component {
  render() {
    const post = this.props.data.markdownRemark
    return (
      <div>
        <Link to="/">go to home</Link>
        <Header>{post.frontmatter.title}</Header>
        <div dangerouslySetInnerHTML={{ __html: post.html }} />
      </div>
    )
  }
}

export default PostTemplate

export const query = graphql`
  query BlogPostQuery($slug: String!) {
    markdownRemark(fields: { slug: { eq: $slug } }) {
      html
      frontmatter {
        title
      }
    }
  }
`
