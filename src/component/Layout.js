import React from 'react'
import Helmet from 'react-helmet'
import styled from 'styled-components'
import { media } from '../utils/style'
import Profile from './Profile'

const Content = styled.div`
  padding: 120px 50px;
  transition: all 0.3s ease;
  ${media.mobile`padding: 120px 20px;`}
`

const siteMetadata = {
  title: `Ordinary simple`,
  image: `/img/og.jpeg`,
  siteUrl: `https://blog.ordinarysimple.com`,
}

class Layout extends React.Component {

  render() {;
    const { title, image } = siteMetadata;
    const imageUrl = 'https://blog.ordinarysimple.com' + image;
    return (
      <>
        <Helmet
          title={title}
          meta={[
            { name: 'description', content: 'Jaehyun Baek blog' },
            { name: 'og:description', content: 'Jaehyun Baek blog' },
            { name: 'keywords', content: 'blog,ordinarysimple,blog.ordinarysimple.com,백재현,jaehyunbaek,byjaehyun' },
            { name: 'image', content: imageUrl },
            { name: 'og:image', content: imageUrl },
          ]}
        />
        <Profile/> 
        <Content>
          {this.props.children}
        </Content> 
      </>
    )
  }
}

export default Layout