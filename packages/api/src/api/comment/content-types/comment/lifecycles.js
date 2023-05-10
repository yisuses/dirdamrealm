const slugify = require('slugify')

function seoName(str) {
  return slugify(str, {
    strict: true,
    lower: true,
  })
}

function generateNewCommentEmail(author, url) {
  return `
<!DOCTYPE html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <title>Nuevo comentario de ${author} en Emoción Blanca</title>
    <style>
      @media only screen and (max-width: 620px) {
        table.body h1 {
          font-size: 28px;
          margin-bottom: 10px;
        }

        table.body p,
        table.body ul,
        table.body ol,
        table.body td,
        table.body span,
        table.body a {
          font-size: 16px;
        }

        table.body .wrapper,
        table.body .article {
          padding: 10px;
        }

        table.body .content {
          padding: 0;
        }

        table.body .container {
          padding: 0;
          width: 100%;
        }

        table.body .main {
          border-left-width: 0;
          border-radius: 0;
          border-right-width: 0;
        }

        table.body .btn table {
          width: 100%;
        }

        table.body .btn a {
          width: 100%;
        }

        table.body .img-responsive {
          height: auto;
          max-width: 100%;
          width: auto;
        }
      }
      @media all {
        .ExternalClass {
          width: 100%;
        }

        .ExternalClass,
        .ExternalClass p,
        .ExternalClass span,
        .ExternalClass font,
        .ExternalClass td,
        .ExternalClass div {
          line-height: 100%;
        }

        .apple-link a {
          color: inherit;
          font-family: inherit;
          font-size: inherit;
          font-weight: inherit;
          line-height: inherit;
          text-decoration: none;
        }

        #MessageViewBody a {
          color: inherit;
          text-decoration: none;
          font-size: inherit;
          font-family: inherit;
          font-weight: inherit;
          line-height: inherit;
        }

        .btn-primary table td:hover {
          background-color: #34495e;
        }

        .btn-primary a:hover {
          background-color: #34495e;
          border-color: #34495e;
        }
      }
    </style>
  </head>
  <body
    style="
      background-color: #f6f6f6;
      font-family: sans-serif;
      -webkit-font-smoothing: antialiased;
      font-size: 14px;
      line-height: 1.4;
      margin: 0;
      padding: 0;
      -ms-text-size-adjust: 100%;
      -webkit-text-size-adjust: 100%;
    "
  >
    <span
      class="preheader"
      style="
        color: transparent;
        display: none;
        height: 0;
        max-height: 0;
        max-width: 0;
        opacity: 0;
        overflow: hidden;
        mso-hide: all;
        visibility: hidden;
        width: 0;
      "
      >Nuevo comentario en post de Emoción Blanca</span
    >
    <table
      role="presentation"
      border="0"
      cellpadding="0"
      cellspacing="0"
      class="body"
      style="
        border-collapse: separate;
        mso-table-lspace: 0pt;
        mso-table-rspace: 0pt;
        background-color: #f6f6f6;
        width: 100%;
      "
      width="100%"
      bgcolor="#f6f6f6"
    >
      <tr>
        <td style="font-family: sans-serif; font-size: 14px; vertical-align: top" valign="top">&nbsp;</td>
        <td
          class="container"
          style="
            font-family: sans-serif;
            font-size: 14px;
            vertical-align: top;
            display: block;
            max-width: 580px;
            padding: 10px;
            width: 580px;
            margin: 0 auto;
          "
          width="580"
          valign="top"
        >
          <div
            class="content"
            style="box-sizing: border-box; display: block; margin: 0 auto; max-width: 580px; padding: 10px"
          >
            <!-- START CENTERED WHITE CONTAINER -->
            <table
              role="presentation"
              class="main"
              style="
                border-collapse: separate;
                mso-table-lspace: 0pt;
                mso-table-rspace: 0pt;
                background: #ffffff;
                border-radius: 3px;
                width: 100%;
              "
              width="100%"
            >
              <!-- START MAIN CONTENT AREA -->
              <tr>
                <td
                  class="wrapper"
                  style="
                    font-family: sans-serif;
                    font-size: 14px;
                    vertical-align: top;
                    box-sizing: border-box;
                    padding: 20px;
                  "
                  valign="top"
                >
                  <table
                    role="presentation"
                    border="0"
                    cellpadding="0"
                    cellspacing="0"
                    style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: 100%"
                    width="100%"
                  >
                    <tr>
                      <td style="font-family: sans-serif; font-size: 14px; vertical-align: top" valign="top">
                        <p
                          style="
                            font-family: sans-serif;
                            font-size: 14px;
                            font-weight: normal;
                            margin: 0;
                            margin-bottom: 15px;
                          "
                        >
                          Hola,
                        </p>
                        <p
                          style="
                            font-family: sans-serif;
                            font-size: 14px;
                            font-weight: normal;
                            margin: 0;
                            margin-bottom: 15px;
                          "
                        >
                          Has recibido un nuevo comentario en Emoción Blanca de parte de <i>${author}</i>. Para verlo, pulsa el siguiente botón.
                        </p>
                        <table
                          role="presentation"
                          border="0"
                          cellpadding="0"
                          cellspacing="0"
                          class="btn btn-primary"
                          style="
                            border-collapse: separate;
                            mso-table-lspace: 0pt;
                            mso-table-rspace: 0pt;
                            box-sizing: border-box;
                            width: 100%;
                          "
                          width="100%"
                        >
                          <tbody>
                            <tr>
                              <td
                                align="left"
                                style="
                                  font-family: sans-serif;
                                  font-size: 14px;
                                  vertical-align: top;
                                  padding-bottom: 15px;
                                "
                                valign="top"
                              >
                                <table
                                  role="presentation"
                                  border="0"
                                  cellpadding="0"
                                  cellspacing="0"
                                  style="
                                    border-collapse: separate;
                                    mso-table-lspace: 0pt;
                                    mso-table-rspace: 0pt;
                                    width: auto;
                                  "
                                >
                                  <tbody>
                                    <tr>
                                      <td
                                        style="
                                          font-family: sans-serif;
                                          font-size: 14px;
                                          vertical-align: top;
                                          border-radius: 5px;
                                          text-align: center;
                                          background-color: #3498db;
                                        "
                                        valign="top"
                                        align="center"
                                        bgcolor="#3498db"
                                      >
                                        <a
                                          href="${url}"
                                          target="_blank"
                                          style="
                                            border: solid 1px #3498db;
                                            border-radius: 5px;
                                            box-sizing: border-box;
                                            cursor: pointer;
                                            display: inline-block;
                                            font-size: 14px;
                                            font-weight: bold;
                                            margin: 0;
                                            padding: 12px 25px;
                                            text-decoration: none;
                                            text-transform: capitalize;
                                            background-color: #3498db;
                                            border-color: #3498db;
                                            color: #ffffff;
                                          "
                                          >Ver comentario</a
                                        >
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- END MAIN CONTENT AREA -->
            </table>
            <!-- END CENTERED WHITE CONTAINER -->

            <!-- START FOOTER -->
            <div class="footer" style="clear: both; margin-top: 10px; text-align: center; width: 100%">
              <table
                role="presentation"
                border="0"
                cellpadding="0"
                cellspacing="0"
                style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: 100%"
                width="100%"
              >
                <tr>
                  <td
                    class="content-block powered-by"
                    style="
                      font-family: sans-serif;
                      vertical-align: top;
                      padding-bottom: 10px;
                      padding-top: 10px;
                      color: #999999;
                      font-size: 12px;
                      text-align: center;
                    "
                    valign="top"
                    align="center"
                  >
                    Powered by Emoción Blanca.
                  </td>
                </tr>
              </table>
            </div>
            <!-- END FOOTER -->
          </div>
        </td>
        <td style="font-family: sans-serif; font-size: 14px; vertical-align: top" valign="top">&nbsp;</td>
      </tr>
    </table>
  </body>
</html>
`
}

module.exports = {
  async afterCreate(event) {
    const { result, params } = event

    let postUrl = ''
    let postTitle = ''
    try {
      const { title, locale } = await strapi.db.query('api::post.post').findOne({
        select: ['title', 'locale'],
        where: { id: params.data.post },
        populate: ['locale'],
      })
      postTitle = title
      postUrl = `https://whemotion.com/${locale === 'en' ? 'en/' : ''}post/${params.data.post}/${seoName(
        postTitle,
      )}#comment-${result.id}`
    } catch (err) {
      postUrl = `https://whemotion.com/post/${params.data.post}`
    }

    try {
      await strapi.plugins['email'].services.email.send({
        to: process.env.EMAIL_USER,
        subject: `Emoción Blanca: Nuevo comentario de ${result.author} en "${postTitle}"`,
        html: generateNewCommentEmail(result.author, postUrl),
      })
    } catch (err) {
      console.error(err)
    }
  },
}
