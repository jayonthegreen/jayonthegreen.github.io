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
  font-size: 1.5rem;
  margin: 0.5rem 0;
  padding: 0.25rem 0.5rem;
  ${ hoverCss}
  box-shadow: inset 0 -6px 0 rgba(36,177,209,.2);
  /* animation-name: color_change;
	animation-duration: 1s;
	animation-iteration-count: infinite;
	animation-direction: alternate;
  @-webkit-keyframes color_change {
	from { box-shadow: inset 0 -6px 0 rgba(36,177,209,.2); }
	to { box-shadow: inset 0 -6px 0 rgba(184,107,255,.2); }
  }
@-moz-keyframes color_change {
	from { box-shadow: inset 0 -6px 0 rgba(36,177,209,.2); }
	to { box-shadow: inset 0 -6px 0 rgba(184,107,255,.2); }
}
@-ms-keyframes color_change {
	from { box-shadow: inset 0 -6px 0 rgba(36,177,209,.2); }
	to { box-shadow: inset 0 -6px 0 rgba(184,107,255,.2); }
}
@-o-keyframes color_change {
	from { box-shadow: inset 0 -6px 0 rgba(36,177,209,.2); }
	to { box-shadow: inset 0 -6px 0 rgba(184,107,255,.2); }
}
@keyframes color_change {
	from { box-shadow: inset 0 -6px 0 rgba(36,177,209,.2); }
	to { box-shadow: inset 0 -6px 0 rgba(184,107,255,.2); }
} */
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
