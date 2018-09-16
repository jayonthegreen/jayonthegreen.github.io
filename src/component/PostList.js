import React from 'react'
import PropTypes from 'prop-types'
import Link from 'gatsby-link'
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
          <Link
            key={node.id}
            to={node.fields.slug}
            style={{ textDecoration: `none`, color: `inherit` }}
          >
            <PostListItem
              title={node.frontmatter.title}
              date={node.frontmatter.date}
              category={node.frontmatter.category}
              description={node.frontmatter.description}
            />
          </Link>
        ))}
      </Wrapper>
    )
  }
}

PostList.propTypes = {
  markdownNodes: PropTypes.array,
}

export default PostList
