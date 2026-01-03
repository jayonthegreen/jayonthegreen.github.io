import type { GatsbyConfig } from "gatsby";

const config: GatsbyConfig = {
  siteMetadata: {
    title: `jay`,
    description: `things about thinking`,
    siteUrl: `https://jayonthegreen.github.io`,
    image: `/img/default.jpeg`,
  },
  // More easily incorporate content into your pages through automatic TypeScript type generation and better GraphQL IntelliSense.
  // If you use VSCode you can also use the GraphQL plugin
  // Learn more at: https://gatsby.dev/graphql-typegen
  graphqlTypegen: false,
  plugins: ["gatsby-plugin-postcss",  "gatsby-plugin-image",
    {
      resolve: "gatsby-plugin-sitemap",
      options: {
        excludes: ["/report/*", "/report/**"],
      },
    },
    {
      resolve: `gatsby-plugin-feed`,
      options: {
        query: `
          {
            site {
              siteMetadata {
                title
                description
                siteUrl
                site_url: siteUrl
              }
            }
          }
        `,
        feeds: [
          {
            serialize: ({ query: { site, allMarkdownRemark } }: any) => {
              return allMarkdownRemark.nodes.map((node: any) => {
                // Clean HTML content to remove invalid XML characters
                const cleanHtml = node.html
                  .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // Remove control characters
                  .replace(/&(?!(?:apos|quot|[gl]t|amp);|#)/g, '&amp;'); // Escape unescaped ampersands

                return Object.assign({}, node.frontmatter, {
                  description: node.frontmatter.description || node.excerpt,
                  date: node.frontmatter.date,
                  url: site.siteMetadata.siteUrl + node.fields.slug,
                  guid: site.siteMetadata.siteUrl + node.fields.slug,
                  custom_elements: [{ "content:encoded": cleanHtml }],
                })
              })
            },
            query: `
              {
                allMarkdownRemark(
                  filter: { fileAbsolutePath: { regex: "/pages/post/" } }
                  sort: { frontmatter: { date: DESC } }
                ) {
                  nodes {
                    excerpt
                    html
                    fields {
                      slug
                    }
                    frontmatter {
                      title
                      date
                      description
                    }
                  }
                }
              }
            `,
            output: "/rss.xml",
            title: "Jay's Blog RSS Feed",
            description: "things about thinking",
          },
        ],
      },
    },
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: `Jay`,
        short_name: `Jay`,
        start_url: `/`,
        background_color: `#ffffff`,
        theme_color: `#ffffff`,
        display: `standalone`,
        icon: `static/favicon.png`, // This path is relative to the root of the site.
      },
  },
  {
    resolve: 'gatsby-plugin-google-gtag',
    options: {
      "trackingIds": [
        "G-P76W5VY5NZ"
      ]
    }
  },
  "gatsby-plugin-sharp", "gatsby-transformer-sharp", {
    resolve: 'gatsby-source-filesystem',
    options: {
      "name": "pages",
      "path": "./src/pages/"
    },
    __key: "pages"
  },
  `gatsby-transformer-remark`
]
};

export default config;
