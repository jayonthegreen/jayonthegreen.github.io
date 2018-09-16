import React from 'react'
import styled from 'styled-components'
import hoverCss from './hoverCss'

const Wrapper = styled.div`
  margin: 0 auto;
  padding: 1.0rem;
  text-align: center;
`


const Title = styled.div`
  display: inline-block;
  font-weight: bold;
  font-size: 1.0rem;
  margin: 0.5rem 0;
  padding: 0.25rem 0.5rem;
  ${ hoverCss}
`

const Description = styled.div`
  color: #333333;
  font-size: 0.8rem;
  line-height: 1.2rem;
`

const OutLink = styled.a`
  text-decoration: none;
  color: inherit;
  padding: 0.25rem;
  ${ hoverCss}
`
const Profile = () => (
  <Wrapper>
      <Title>
        <a
          href='/'
          style={{ textDecoration: `none`, color: `inherit` }}>jaehyun baek
        </a>
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
