import React from 'react'
import Link from 'gatsby-link'
import Helmet from 'react-helmet'
import styled from 'styled-components'
import { media } from '../utils/style'


const Wrapper = styled.div`
  ${media.mobile`
    padding: 0;
  `}
`

const Header = styled.h1`
  margin: 0.4rem 0;
  line-height: 1.4;
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
  img{
    display:block;
  margin: 0 auto;
  }
`

class PostTemplate extends React.Component {

  componentDidMount() {
    console.log('componentDidMount')
    this.facebookCommentInstall();
  }

  facebookCommentInstall() {
    (function(d, s, id) {
      console.log(d,s,id);
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
        <Header>{post.frontmatter.title}</Header>
        <Date>{post.frontmatter.date}&middot;{post.frontmatter.category}</Date>
        <Content dangerouslySetInnerHTML={{ __html: post.html }} />
        {/* <div className="fb-comments" data-numposts="5"/> */}
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
