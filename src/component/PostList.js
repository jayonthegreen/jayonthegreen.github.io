import React from 'react'
import PropTypes from 'prop-types'
import Link from 'gatsby-link'
import PostListItem from './PostListItem'

class PostList extends React.Component {
  render() {
    return (
      <div>
        {this.props.markdownNodes.map(node => (
          <Link
            key={node.id}
            to={node.fields.slug}
            style={{ textDecoration: `none`, color: `inherit` }}
          >
            <PostListItem
              title={node.frontmatter.title}
              date={node.frontmatter.date}
            />
          </Link>
        ))}
      </div>
    )
  }
}

PostList.propTypes = {
  markdownNodes: PropTypes.array,
}

export default PostList
