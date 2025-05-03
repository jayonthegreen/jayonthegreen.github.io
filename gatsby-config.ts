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
  plugins: ["gatsby-plugin-postcss",  "gatsby-plugin-image", "gatsby-plugin-sitemap", 
    
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
  {
    resolve: `gatsby-source-filesystem`,
    options: {
      name: `content`,
      path: `${__dirname}/src/content`,
    },
  },  
  `gatsby-transformer-remark`
]
};

export default config;
