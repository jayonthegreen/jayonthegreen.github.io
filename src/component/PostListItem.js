import React from 'react'
import styled from 'styled-components'

const Wrapper = styled.div`
  margin: 0 auto;
  padding: 1.5rem;
  text-align: center;
  max-width: 480px;
`

const Meta = styled.div`
  font-size: 0.75rem;
`

const Title = styled.div`
  font-weight: bold;
  font-size: 1.1rem;
  margin: 0.2rem 0;
`

const Description = styled.div`
  color: #333333;
  font-size: 0.8rem;
  line-height: 1.2rem;
`

const maxLength = 100;

const PostListItem = ({ title, category, date, description }) => (
  <Wrapper>
    <Meta>{date} &middot; {category}</Meta>
    <Title>{title}</Title>
    {
      description && 
      <Description>
        {description.slice(0, maxLength)}
        {description.length > maxLength && '...'}
      </Description>
    }
  </Wrapper>
)

const getEmoji = (key) => CATEGORY_EMOJI_MAP[key] || CATEGORY_EMOJI_MAP.default;

export default PostListItem
