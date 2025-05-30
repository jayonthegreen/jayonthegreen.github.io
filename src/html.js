import React from 'react'

export default class HTML extends React.Component {
  render() {
    return (
      <html lang="ko">
        <head>
          <meta charSet="utf-8" />
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
          />
          <meta
            name="google-site-verification"
            content="JA_ocNhbTh2OZYc6XdvGU86Tu-KrppkZddT3_sfwTDU"
          />
          {this.props.headComponents}
          <link rel="icon" type="image/x-icon" href="/favicon.ico"/>
        </head>
        <body>
          <div
            id="___gatsby"
            dangerouslySetInnerHTML={{ __html: this.props.body }}
          />
          {this.props.postBodyComponents}
        </body>
      </html>
    )
  }
}
