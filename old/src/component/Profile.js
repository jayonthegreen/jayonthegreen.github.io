import React from 'react'
import styled from 'styled-components'
import hoverCss from './hoverCss'

const Wrapper = styled.nav`
  margin: 0 auto;
  padding: 0.5rem;
  text-align: left;
  border-bottom: 1px solid var(--border-color);
  transition: 0.4s; /* Adds a transition effect when the padding is decreased */
  position: fixed;
  width: 100%;
  background-color: var(--bg-color);
`

const Title = styled.div`
  display: inline-block;
  font-weight: bold;
  font-size: 1.2rem;
  margin: 0;
  padding: 0.25rem 0.5rem;
  color: var(--title-color);
  ${hoverCss};
`

const NavList = styled.ul`
  color: var(--subtitle-color);
  line-height: 1rem;
  margin: 0;
  li {
    display: inline;
  }
`

const OutLink = styled.a`
  text-decoration: none;
  color: var(--subtitle-color);
  padding: 0.25rem;
  margin: 0.25rem;
  ${hoverCss}
`
const Profile = () => (
  <Wrapper>
    <Title>
      <a href="/" style={{ textDecoration: `none`, color: `inherit` }}>
        J
      </a>
    </Title>
    <NavList>
      <li>
        <OutLink href="/">home</OutLink>
      </li>
      ·
      <li>
        <OutLink href="/search">search</OutLink>
      </li>
      ·
      <li>
        <OutLink href="mailto:jayonthegreen@gmail.com">mail</OutLink>
      </li>
    </NavList>
  </Wrapper>
)

export default Profile
