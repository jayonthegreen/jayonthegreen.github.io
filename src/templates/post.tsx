import React from 'react'
import { graphql, PageProps, HeadProps } from 'gatsby'
import Nav from '../Nav'
import { useSiteMetadata } from '../useSiteMetadata'

type Frontmatter = {
  title: string
  date: string
  description?: string
  tags?: string[]
  image?: string
}

type MarkdownRemark = {
  html: string
  fields: {
    slug: string
  }
  frontmatter: Frontmatter
}

type BlogPostQueryData = {
  markdownRemark: MarkdownRemark
}

class PostTemplate extends React.Component<PageProps<BlogPostQueryData>> {
  render() {
    const { data } = this.props
    const { title, date, description } = data.markdownRemark.frontmatter

    return (
      <>
        <main>
          <Nav />
          <h1>{title}</h1>
          <div
            style={{
              fontSize: 'medium',
              textAlign: 'right',
              marginBottom: '1em',
              maxWidth: '60%',
              marginLeft: 'auto',
            }}
          >
            {date}
            <br />
            {description}
          </div>
          <div
            dangerouslySetInnerHTML={{
              __html: data.markdownRemark.html,
            }}
          />
        </main>
      </>
    )
  }
}

export function Head({ data }: HeadProps<BlogPostQueryData>) {
  const sitemeta = useSiteMetadata()
  const front = data.markdownRemark.frontmatter

  const title = front.title || sitemeta.title
  const description = front.description || sitemeta.description
  const keywords = (front.tags || []).join(', ').replace(/#/g, '')
  const image = `${sitemeta.siteUrl}${front.image || sitemeta.image}`

  return (
    <>
      <title>{title}</title>
      <meta property="og:title" content={title} />
      <meta name="description" content={description} />
      <meta property="og:description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta property="og:image" content={image} />
    </>
  )
}

export default PostTemplate

export const query = graphql`
  query BlogPostQuery($slug: String!) {
    markdownRemark(fields: { slug: { eq: $slug } }) {
      html
      fields {
        slug
      }
      frontmatter {
        title
        date(formatString: "YYYY.MM.DD")
        description
        tags
        image
      }
    }
  }
`