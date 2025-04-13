import React from 'react'
import Helmet from 'react-helmet'
import styled from 'styled-components'
import { media } from '../utils/style'
import Profile from './Profile'

const Content = styled.div`
  padding: 120px 50px;
  transition: all 0.3s ease;
  ${media.mobile`padding: 100px 20px;`}
  background-color: var(--bg-color);
`

const siteMetadata = {
  title: `byjay`,
  image: `/img/og.jpeg`,
  siteUrl: `https://jayonthegreen.github.io`,
}

class Layout extends React.Component {
  render() {
    const { title, image } = siteMetadata
    const imageUrl = 'https://jayonthegreen.github.io' + image
    return (
      <>
        <Helmet
          title={title}
          meta={[
            { name: 'description', content: 'j blog' },
            { name: 'image', content: imageUrl },
            { name: 'og:image', content: imageUrl },
          ]}
        />
        <Profile />
        <Content>{this.props.children}</Content>
      </>
    )
  }
}

export default Layout
