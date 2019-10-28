import React from 'react'
import styled from 'styled-components'
import hoverCss from './hoverCss'

const Wrapper = styled.div`
  margin: 0 auto;
  padding: 0.5rem;
  text-align: center;
  border-bottom: 1px solid #e9ecef;
  margin-bottom: 1.0rem;
  transition: 0.4s; /* Adds a transition effect when the padding is decreased */
  position: fixed;
  width: 100%;
  background-color: white;
`


const Title = styled.div`
  display: inline-block;
  font-weight: bold;
  font-size: 1.5rem;
  margin: 0.5rem 0;
  padding: 0.25rem 0.5rem;
  ${hoverCss}
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
          style={{ textDecoration: `none`, color: `inherit` }}>Jaehyun Baek
        </a>
      </Title>
      <Description>
      <OutLink href="mailto:jaehyunbaek.engineer@gmail.com">email</OutLink>
      ·
      <OutLink href="https://bit.ly/jaehyunbaek" target="_blank">linkedin</OutLink>
       ·
      <OutLink href="https://wiki.ordinarysimple.com" target="_blank">wiki</OutLink>
      ·
      <OutLink href="http://bit.ly/32TZJ6T" target="_blank">github</OutLink>
      </Description>    
  </Wrapper>
)

export default Profile;
