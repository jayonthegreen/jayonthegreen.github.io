import React from 'react'
import Link from 'gatsby-link'
import Helmet from 'react-helmet'
import styled from 'styled-components';
import { media } from '../utils/style'


const Wrapper = styled.div`
  padding-top: 1rem;
`

const Header = styled.h1`
  margin: 0;
`
const Date = styled.div`
  margin-bottom: 0.5rem;
  text-align: right;
  color: #666666;
  font-size: 0.8rem;
`

const Content = styled.div`
  & iframe {
    margin: 0 auto;
    width: 544px;
    height: 306px;
    ${
      media.mobile`
        width: 100%;
        height: 100%;
      `
    }
  }
`

class PostTemplate extends React.Component {
  render() {
    const post = this.props.data.markdownRemark
    return (
      <Wrapper>
        <Helmet
        meta={[
          {name: 'title', content: post.frontmatter.title},
          {name: 'og:title', content: post.frontmatter.title},
          {name: 'description', content: post.frontmatter.description},
          {name: 'og:description', content: post.frontmatter.description},
          {name: 'keywords', content: post.frontmatter.keywords},
        ]}
        />
        <Header>{post.frontmatter.title}</Header>
        <Date>{post.frontmatter.date}</Date>
        <Content dangerouslySetInnerHTML={{ __html: post.html }} />
      </Wrapper>
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
        date(formatString: "YYYY-MM-DD")
        description
      }
    }
  }
`
