import React from 'react'
import Helmet from 'react-helmet'
import styled from 'styled-components'
import { media } from '../utils/style'
import { BuyMe } from '../component/BuyMe';
import ManageScrollBar from "../component/ManageScrollBar";


const Wrapper = styled.div`
    max-width: 600px;
    margin: auto;  
`

const Title = styled.h1`
  font-weight: bold;
  font-size: 1.6rem;
  text-align: center;
  margin-bottom:0.5rem;
`

const Description = styled.div`
  font-size: 1.0rem;
  font-weight: bold;
  text-align: center;
  margin: 5px 0;
  margin-bottom:0.5rem;
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
  h3 {
    line-height: 1.4;
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
      image = this.props.data.site.siteMetadata.image || '/img/og.jpeg',
    } = post.frontmatter;
    const imageUrl = 'https://blog.ordinarysimple.com' + image;
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
        <ManageScrollBar/>
        <Title>{post.frontmatter.title}</Title>
        <Description>{post.frontmatter.description}</Description>
        <Content dangerouslySetInnerHTML={{ __html: post.html }} />
        <BuyMe/> 
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
