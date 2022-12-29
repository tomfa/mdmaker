# md-export

[md-export](https://github.com/tomfa/md-maker) can convert content between formats.
It comes with parsers and template for converting Wordpress XML to Markdown but you can easily specify your own.

## Installation

```bash
yarn global add md-export
```

## Usage

```bash
# Convert Wordpress xml to markdown
mdex export.xml

# Download images references in text
mdex export.xml --download-images

# Using your own output template
mdex export.xml --template=my-template.md

# ...or your own parser
mdex anything.json --parser=my-json-parser.js
```

Generated files, and accompanied images scraped from the post are found in the output folder (default: `output`).

_Instructions for exporting your information from WordPress [can be found here](http://en.support.wordpress.com/export/)._

## Options

```bash
mdex <input-file> [args]

Options:
  --version              Show version number                           [boolean]

  -d, --download-images  Downloads images references to post folder.
                                                      [boolean] [default: false]

  --debug                Log for debug purposes       [boolean] [default: false]

  -f, --folder-format    Format of individual post folder name.
                                                  [default: "yyyy-mm-dd-"slug""]
  -o, --output-dir       Folder in which to put posts        [default: "output"]

  -i, --filter-images    Regex filter for which linked images to download and
                         replace urls.
  [default: "(?:src="(http[^"]*?)")|(?:href="(http[^"]*?(?:\.(?:apng|bmp|gif|cur
                                |ico|jpg|jpeg|jfif|pjpeg|pjp|png|svg|webp))))""]

  -p, --parser           Which parser to use for parsing input file.
                                            [default: "./parsers/wordpress-xml"]

  -s, --filter-slug      Specify post slug if wish to convert a single post

  -t, --template         Which template to use for generating files.
                                              [default: "./templates/gatsby.md"]

  -h, --help             Show help                                     [boolean]

Examples:
  mdex wordpress.xml     Generates markdown files based on wordpress xml export
  mdex wordpress.xml -d  Downloads linked images (hosted on same domain)
```

### Post output folder

Each post is put in an own individual folder.

```
/2018-11-30-how-to-markdown/index.md
```

Its folder name can be specified with `--folder-format=YOUR-FORMAT`

**Default: `yyyy-mm-dd-"slug"`**

Note that quotes are required to surround text that should _not_ be formatted as date.

Replaced values are:

- `author`: The author that created the post
- `slug`: The url slug name of the post

The rest is formatted as dates, using [dateformat](https://www.npmjs.com/package/dateformat).

### Images

All linked images in the original post from the same domain are downloaded
and put in the folder belonging to the related markdown file, when `-d` is used

```
/2018-11-30-how-to-markdown/index.md
/2018-11-30-how-to-markdown/image-for-the-post.jpg
/2018-11-30-how-to-markdown/another-image.jpg
```

You can download all images to a shared folder by specifying `-g=./public/images`.

```
/2018-11-30-how-to-markdown/index.md
/public/images/image-for-the-post.jpg
/public/images/another-image.jpg
```

By default, we download all links from `img src=`, and all linked images
`a href="path to image"` that resides within the same domain as the post.

This can be changed with `--filter-images=YOUR-REGEX`

These URLs are also changed in the content of the original data.

### Templates

By default, we use a template of this format

```
---
title: "{{ title }}"
date: {{ date }}
image: {{ image }}
tags: {{ tags }}
author: {{ author }}
status: {{ status }}
---

{{ content }}
```

Placeholders, e.g. `{{ title }}`, are replaced with the data parsed
from the input file.

The template used can be changed with `--template=my-file.md`

Available variables are:

- `author`: The author of the post
- `content`: The markdown generated body of the post
- `html`: The body of the post, in HTML.
- `date`: The post date formatted as `yyyy-mm-dd`
- `slug`: The url slug of the original post
- `title`: The title of the post
- `image`: The featured image of the article

### Parsing other inputs

Parsers can be found in in the source code. These contain logic for parsing
a file into a structured format. You can add override the parser
and specify your own with `--parser=YOUR-PARSER`.

If you create your own parser, it should default export a function that accepts
path of file, and returns a list of an objects. It must return an array of items,
where each item should have the following keys:

- `slug`: A slug of the item
- `date`: date (optional)
- `content`: Content as HTML (optional)

**Note: You can also add more keys. These will be passed on as is to be reused
in the template.**
