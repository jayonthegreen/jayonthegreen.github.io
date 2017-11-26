import React from "react"
import Link from 'gatsby-link'

class PostTemplate extends React.Component {
  render() {
    const post = this.props.data.markdownRemark
    return (
      <div>
        <Link to='/'> Go to Home</Link>
        <h1>
          {post.frontmatter.title}
        </h1>
        <div dangerouslySetInnerHTML={{ __html: post.html }} />
      </div>
    );
  }
}

export default PostTemplate

export const query = graphql`
query BlogPostQuery($slug: String!) {
  markdownRemark(fields: { slug: { eq: $slug } }) {
    html
    frontmatter {
      title
    }
  }
}
`