import * as React from "react"
import { graphql, type HeadFC, type PageProps } from "gatsby"
import Nav from "../Nav"
import { useSiteMetadata } from "../useSiteMetadata"


const IndexPage: React.FC<PageProps> = ({
  data: {
    allMarkdownRemark: { edges },
  },
}) => {
  return (
    <main>
      <Nav/>
      <ul 
        style={{padding: 0, margin: 0, listStyle: 'none'}}
      >
        {edges.map(({ node }) => (
          <li key={node.fields.slug} style={{listStyle: 'none', margin: '0.5rem 0'}}>
            <a href={node.fields.slug} style={{textDecoration: 'none'}}>
              {node.frontmatter.title}
              {" "}
              <p style={{fontSize: 'small', margin: 0,
                 whiteSpace: 'nowrap',
                 textOverflow: 'ellipsis',
                 overflow: 'hidden',
                 }}>
                <span style={{marginRight: '0.3rem'}}>
                    { node.frontmatter.created_at && node.frontmatter.created_at.split('.')[0]}·{node.frontmatter.created_at.split('.')[1]}
                </span>
              {node.frontmatter.description}
              </p>
            </a>
          </li>
        ))}
      </ul>
    </main>
  )
}


export default IndexPage

export function Head() {
  const sitemeta = useSiteMetadata()
  return (
    <>
      <title>{sitemeta.title}</title>
      <link rel="canonical" href={sitemeta.siteUrl} />
      <meta name="description" content={sitemeta.description} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={sitemeta.siteUrl} />
      <meta property="og:title" content={sitemeta.title} />
      <meta property="og:description" content={sitemeta.description} />
      <meta property="og:image" content={`${sitemeta.siteUrl}${sitemeta.image}`} />
      <meta name="twitter:card" content="summary" />
    </>
  )
}

export const query = graphql`
  query {
    allMarkdownRemark (
        sort: { frontmatter: { created_at: DESC } }
        filter: { fileAbsolutePath: { regex: "/pages/post/" } }
    ){
      edges {
        node {
          frontmatter {
            title
            created_at(formatString: "YYYY.MM")
            description
          }
          fields {
            slug
          }
        }
      }
    }
  }
`