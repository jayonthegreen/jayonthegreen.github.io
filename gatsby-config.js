module.exports = {
  siteMetadata: {
    title: `jay on the green`,
    image: `/img/og.jpeg`,
    siteUrl: `https://jayonthegreen.github.io`,
  },
  plugins: [
    `gatsby-plugin-decap-cms`,
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `src`,
        path: `${__dirname}/src/`,
      },
    },
    `gatsby-plugin-react-helmet`,
    `gatsby-transformer-remark`,
    `gatsby-plugin-styled-components`,
    {
      resolve: `gatsby-plugin-sitemap`,
      options: {
        query: `
        {
          site {
            siteMetadata {
              siteUrl
            }
          }
          allSitePage {
            nodes {
              path
              pageContext
            }
          }
        }
        `,
        serialize: ({ path, pageContext }) => {
          return {
            url: path,
            lastmod: pageContext?.lastMod,
          }
        },
      },
    },
    `gatsby-plugin-git-lastmod`,

    {
      resolve: `gatsby-plugin-gtag`,
      options: {
          trackingId: `G-P76W5VY5NZ`,
          head: true,
      },
    },
  ],
}
