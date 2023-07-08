import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'

import PostListItem from './PostListItem'

const Wrapper = styled.div`
  margin: 0 auto;
  text-align: center;
  max-width: 480px;
  `

class PostList extends React.Component {
  render() {
    return (
      <Wrapper>
        {this.props.posts.map(post => (
          <a
            key={post.id}
            href={post.href}
            style={{ textDecoration: `none`, color: `inherit` }}
          >
            <PostListItem
              title={post.title}
            />
          </a>
        ))}
      </Wrapper>
    )
  }
}

export default PostList
