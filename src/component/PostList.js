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
        {this.props.markdownNodes.map(node => (
          <a
            key={node.id}
            href={node.fields.slug}
            style={{ textDecoration: `none`, color: `inherit` }}
          >
            <PostListItem
              title={node.frontmatter.title}
              date={node.frontmatter.date}
              description={node.frontmatter.description}
            />
          </a>
        ))}
      </Wrapper>
    )
  }
}

PostList.propTypes = {
  markdownNodes: PropTypes.array,
}

export default PostList
