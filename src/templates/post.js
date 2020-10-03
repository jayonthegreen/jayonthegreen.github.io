import React from 'react'
import Helmet from 'react-helmet'
import styled from 'styled-components'
import { media } from '../utils/style'
import { BuyMe } from '../component/BuyMe';
import { graphql } from 'gatsby'
import Layout from '../component/Layout';


const Wrapper = styled.div`
    max-width: 600px;
    margin: auto;  
`

const Time = styled.div`
  font-weight: 300;
  font-size: 0.6rem;
  text-align: right;
`

const Title = styled.h1`
  font-weight: bold;
  font-size: 2rem;
  line-height: 1.5rem;
  text-align: center; 
  margin: 0.5rem 0;
  word-break: keep-all;
`

const Description = styled.div`
  color: #333333;
  font-size: 0.9rem;
  word-break: keep-all;
  text-align: center;
  margin: 0.5rem 0;
`

const Content = styled.div`
  & iframe {
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
      keywords = [],
      image = this.props.data.site.siteMetadata.image || '/img/og.jpeg',
      date,
    } = post.frontmatter;
    const imageUrl = 'https://byjay.github.io' + image;
    const meta = [
      {name: 'title', content: title},
      {name: 'description', content: description},
      {name: 'keywords', content: [keywords || title].join(',')},
      {name: 'image', content: imageUrl},
      {property: 'og:description', content: description},
      {property: 'og:title', content: title},
      {property: 'og:image', content: imageUrl},
    ]

    return (
      <Layout>
      <Wrapper>
        <Helmet meta={meta}>
          <title>{title}</title>
        </Helmet>
        <Title>{post.frontmatter.title}</Title>
        <Description>{post.frontmatter.description}</Description>
        <Time>{date}</Time>
        <Content dangerouslySetInnerHTML={{ __html: post.html }} />
        <BuyMe/>
      </Wrapper>
      </Layout>
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
      }
    }
    site {
      siteMetadata {
        image
      }
    }
  }
`
