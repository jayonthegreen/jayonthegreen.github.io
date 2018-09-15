import React from 'react'
import Helmet from 'react-helmet'
import styled from 'styled-components'
import { media } from '../utils/style'


const Wrapper = styled.div`
    max-width: 600px;
    margin: auto;  
`

const Title = styled.h1`
  font-weight: bold;
  font-size: 1.1rem;
  font-weight: bold;
  text-align: center;
  margin-bottom:0;
`
const Date = styled.div`
  font-size: 0.75rem;
  margin-top: 0.5rem;
  text-align: right;
`

const Content = styled.div`
  margin: 1rem 0;
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
  img{
    display:block;
    margin: 0 auto;
  }
`

class PostTemplate extends React.Component {

  componentDidMount() {
    this.facebookCommentInstall();
  }

  facebookCommentInstall() {
    (function(d, s, id) {
      var js, fjs = d.getElementsByTagName(s)[0];
      if (d.getElementById(id)) return;
      js = d.createElement(s); js.id = id;
      js.src = 'https://connect.facebook.net/ko_KR/sdk.js#xfbml=1&version=v3.1&appId=2072231716426066&autoLogAppEvents=1';
      fjs.parentNode.insertBefore(js, fjs);
    }(document, 'script', 'facebook-jssdk'));
  }

  render() {
    const post = this.props.data.markdownRemark
    const { 
      title,
      description,
      category,
      keywords = [],
      image = this.props.data.site.siteMetadata.image,
    } = post.frontmatter;
    const imageUrl = 'https://holdonnn.me' + image;
    const meta = [
      {name: 'title', content: title},
      {name: 'description', content: description},
      {name: 'keywords', content: [keywords || title, category].join(',')},
      {name: 'image', content: imageUrl},
      {property: 'og:description', content: description},
      {property: 'og:title', content: title},
      {property: 'og:image', content: imageUrl},
    ]

    return (
      <Wrapper>
        <Helmet meta={meta}>
          <title>{title}</title>
        </Helmet>
        <Title>{post.frontmatter.title}</Title>
        <Date>{post.frontmatter.date}&middot;{post.frontmatter.category}</Date>
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
        keywords
        image
        category
      }
    }
    site {
      siteMetadata {
        image
      }
    }
  }
`
