import React from 'react'
import styled from 'styled-components'
import hoverCss from './hoverCss'

const Wrapper = styled.article`
  margin-bottom: 0.6rem;
  text-align: center;
  padding: 0.5rem;
  ${hoverCss}
`

const Meta = styled.div`
  font-size: 0.8rem;
  color: var(--subtitle-color);
`

const Title = styled.h2`
  font-size: 1.2rem;
  line-height: 1.1;
  margin: 0 0 2px;
  word-break: keep-all;
  color: var(--title-color);
`

const Description = styled.div`
  color: var(--subtitle-color);
  font-size: 0.8rem;
  word-break: keep-all;
`

const maxLength = 100

const PostListItem = ({ title, date, description }) => (
  <Wrapper>
    <Meta>{date}</Meta>
    <Title>{title}</Title>
    {description && (
      <Description>
        {description.slice(0, maxLength)}
        {description.length > maxLength && '...'}
      </Description>
    )}
  </Wrapper>
)

export default PostListItem
