import React from 'react'
import { graphql, PageProps, HeadProps } from 'gatsby'
import Nav from '../Nav'
import { useSiteMetadata } from '../useSiteMetadata'

type Frontmatter = {
  title: string
  created_at: string
  description?: string
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

const MarkdownTemplate: React.FC<PageProps<BlogPostQueryData>> = ({ data }) => {
  const { title, created_at, description } = data.markdownRemark.frontmatter

  return (
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
        {created_at}
        <br />
        {description}
      </div>
      <div
        dangerouslySetInnerHTML={{
          __html: data.markdownRemark.html,
        }}
      />
      <hr/>
      <div>
        <iframe
          title="Substack Newsletter Signup"
          src="https://jay1298545.substack.com/embed"
          width="100%"
          height="150"
          style={{border: 'none', overflow: 'hidden'}}
        />
      </div>
    </main>
  )
}

export function Head({ data }: HeadProps<BlogPostQueryData>) {
  const sitemeta = useSiteMetadata()
  const front = data.markdownRemark.frontmatter
  const slug = data.markdownRemark.fields.slug

  const title = front.title || sitemeta.title
  const description = front.description || sitemeta.description
  const image = `${sitemeta.siteUrl}${sitemeta.image}`

  // Exclude /report/ pages from search engines
  const isReport = slug.startsWith('/report/')

  return (
    <>
      <title>{title}</title>
      {isReport && <meta name="robots" content="noindex, nofollow" />}
      <meta property="og:title" content={title} />
      <meta name="description" content={description} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
    </>
  )
}

export default MarkdownTemplate

export const query = graphql`
  query BlogPostQuery($slug: String!) {
    markdownRemark(fields: { slug: { eq: $slug } }) {
      html
      fields {
        slug
      }
      frontmatter {
        title
        created_at(formatString: "YYYY.MM.DD")
        description
      }
    }
  }
`
