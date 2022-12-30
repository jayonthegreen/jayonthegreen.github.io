module.exports = {
  siteMetadata: {
    title: `byjay`,
    image: `/img/og.jpeg`,
    siteUrl: `https://byjay.github.io`,
  },
  plugins: [
    'gatsby-plugin-netlify-cms',
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
    `gatsby-plugin-sitemap`,
    {
      resolve: `gatsby-plugin-gtag`,
      options: {
          trackingId: `G-P76W5VY5NZ`,
          head: true,
      },
    },
  ],
}
