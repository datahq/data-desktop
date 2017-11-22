const sanitizeHtml = require('sanitize-html')
const removeMd = require('remove-markdown')


/**
* Markdown processor with our custom settings
*/
const hljs = require('highlight.js')
module.exports.md = require('markdown-it')({
  html: true,
  linkify: true,
  typographer: true,
  highlight: function (str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return '<pre class="hljs"><code>' +
               hljs.highlight(lang, str, true).value +
               '</code></pre>';
      } catch (__) {}
    }

    return '<pre class="hljs"><code>' + module.exports.md.utils.escapeHtml(str) + '</code></pre>';
  }
})
  .use(require('markdown-it-anchor'), {
    permalink: true,
    permalinkSymbol: '<i class="fa fa-link" aria-hidden="true"></i>'
  })
  .use(require('markdown-it-table-of-contents'), {
    includeLevel: [1, 2, 3, 4, 5, 6]
  })
  .use(require('markdown-it-container'), 'info')
  .use(require('markdown-it-container'), 'cli-output', {
    marker: '`'
  })


/**
* This method takes a readme and data package descriptor as arguments. If
* there is dp variables in readme, it returns readme with datapackage json
* embed into it. Dp variables must be wrapped in double curly braces and can
* be one of: datapackage.json, datapackage, dp.json, dp.
*/
module.exports.dpInReadme = (readme, dp) => {
  const regex = /({{ ?)(datapackage(\.json)?|dp(\.json)?)( ?}})/
  const dpClone = Object.assign({}, dp)

  const markdowned = '\n```json\n' + JSON.stringify(dpClone, null, 2) + '\n```\n'
  const readmeWithDp = readme.replace(regex, markdowned)
  return readmeWithDp
}


/**
*  This method takes any text and sanitizes it from unsafe html tags.
* Then it converts any markdown syntax into html and returns the result.
*/
module.exports.textToMarkdown = text => {
  const allowedTags = [
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'h7', 'h8', 'br', 'b', 'i', 'span',
    'strong', 'em', 'a', 'pre', 'code', 'img', 'tt', 'div', 'ins', 'del',
    'sup', 'sub', 'p', 'ol', 'ul', 'table', 'thead', 'tbody', 'tfoot',
    'blockquote', 'dl', 'dt', 'dd', 'kbd', 'q', 'samp', 'var', 'hr', 'ruby', 'rt',
    'rp', 'li', 'tr', 'td', 'th', 's', 'strike', 'summary', 'details', 'input'
  ]
  const allowedAttributes = {
    '*': [
      'abbr', 'accept', 'accept-charset', 'accesskey', 'action',
      'align', 'alt', 'axis', 'border', 'cellpadding', 'cellspacing',
      'char', 'charoff', 'charset', 'checked', 'clear', 'cols',
      'colspan', 'color', 'compact', 'coords', 'datetime', 'dir',
      'disabled', 'enctype', 'for', 'frame', 'headers', 'height',
      'hreflang', 'hspace', 'ismap', 'label', 'lang', 'maxlength',
      'media', 'method', 'multiple', 'name', 'nohref', 'noshade',
      'nowrap', 'open', 'prompt', 'readonly', 'rel', 'rev', 'rows',
      'rowspan', 'rules', 'scope', 'selected', 'shape', 'size',
      'span', 'start', 'summary', 'tabindex', 'target', 'title',
      'type', 'usemap', 'valign', 'value', 'vspace', 'width',
      'itemprop', 'class', 'checkbox'
    ],
    a: ['href'],
    img: ['src', 'longdesc'],
    div: ['itemscope', 'itemtype'],
    blockquote: ['cite'],
    del: ['cite'],
    ins: ['cite'],
    q: ['cite']
  }
  const markdownToHtml = module.exports.md.render(text)
  const sanitizedHtml = sanitizeHtml(markdownToHtml, {
    allowedTags,
    allowedAttributes
  })

  return sanitizedHtml
}


/**
* This method takes html text and returns first 200 chars of it's plain text
*/
module.exports.makeSmallReadme = readme => {
  if (!readme) {
    return null
  }
  const plainText = removeMd(readme)
  if (plainText.leng <= 300) {
    return plainText
  }
  const wordList = plainText.substring(0, 300).split(' ')
  wordList.pop()
  return wordList.join(' ')
}
