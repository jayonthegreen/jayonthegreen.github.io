import React from 'react'
import styled from 'styled-components'

const Wrapper = styled.div`
  margin: 0 auto;
  padding: 1.0rem;
  text-align: center;
`


const Title = styled.div`
  font-weight: bold;
  font-size: 1.0rem;
  margin: 0.5rem 0;
`

const Description = styled.div`
  color: #333333;
  font-size: 0.8rem;
  line-height: 1.2rem;
`

const OutLink = styled.a`
  text-decoration: none;
  color: inherit;
`

import Link from 'gatsby-link'
const Profile = () => (
  <Wrapper>
      <Title>
        <Link
          to='/'
         style={{ textDecoration: `none`, color: `inherit` }}>jaehyun baek</Link>
      </Title>
      <Description>
      <OutLink href="http://bit.ly/2NEu9Gb" target="_blank">github</OutLink>
       · 
      <OutLink href="https://bit.ly/jaehyunbaek" target="_blank">linkedin</OutLink>
       ·
      <OutLink href="mailto:jaehyunbaek.engineer@gmail.com">email</OutLink>
      </Description>   
  </Wrapper>
)

export default Profile;
