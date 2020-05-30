# md-maker

[md-maker](https://github.com/tomfa/md-maker) can convert content between formats.
It comes with parsers and templates for converting Wordpress XML to Markdown or HTML, but you can also specify your own.


## Installation
```
yarn add md-maker
```

## Usage
```
// Convert Wordpress xml to markdown
yarn run mdma export.xml

// Download images references to in text
yarn run mdma export.xml  --download-images

// Converts Wordpress xml to html
yarn run mdma export.xml --html

// Using your own output template
yarn run mdma export.xml --template=my-template.md

// ...or your own parser
yarn run mdma anything.xml --parser=my-soap-parser.js
```

Generated files, and accompanied images scraped from the post are found in the output folder (default: `output`s).

*Instructions for exporting your information from WordPress [can be found here](http://en.support.wordpress.com/export/).*

## Options
```
yarn convert <input-file> [args]

Options:

  --version              Show version number                           [boolean]
  
  -d, --download-images  Downloads images refernces to poot folder.
                                                                [default: false]
  
  -f, --folder-format    Format of individual post folder name.
                                                  [default: "yyyy-mm-dd-"slug""]
  
  -o, --output-dir       Folder in which to put posts        [default: "output"]
  
  -i, --filter-images    Regex filter for which linked images to download and
                         replace urls.                                 [default:
  "(?:src="(http[^"]*?)")|(?:href="(http[^"]*?(?:\.(?:apng|bmp|gif|cur|ico|jpg|j
                                          peg|jfif|pjpeg|pjp|png|svg|webp))))""]
  
  -p, --parser           Which parser to use for parsing input file.
                                            [default: "./parsers/wordpress-xml"]
  
  -s, --filter-slug      Specify post slug if wish to convert a single post
  
  -t, --template         Which template to use for generating files.
                                              [default: "./templates/gatsby.md"]
  
  -h, --help             Show help                                     [boolean]

Examples:
  yarn convert wordpress.xml  generates markdown files based on wordpress xml
                              export
```

### Images

All linked images in the original post are downloaded and put in the 
folder belonging to the related markdown file.

```
/2018-11-30-how-to-markdown/index.md
/2018-11-30-how-to-markdown/image-for-the-post.jpg
```

By default, we download all links from `img src=`, and all linked images 
`a href="path to image"` that resides within the same domain as the post.

This can be changed with `--filter-images=YOUR-REGEX`

These URLs are also changed in the `body` of the original data.

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

### Post output folder

Each post is put in an own individual folder.
```
/2018-11-30-how-to-markdown/index.md
``` 
Its folder name can be specified with `--folder-format=YOUR-FORMAT`

**Default: `yyyy-mm-dd-"slug"`** 

Note that quotes are required to surround text that should *not* be formatted as date.

Replaced values are:
- `author`: The author that created the post 
- `slug`: The url slug name of the post 

The rest is formatted as dates, using [dateformat](https://www.npmjs.com/package/dateformat). 

### Parsing other inputs

Parsers can be found in in the source code. These contain logic for parsing 
a file into a structured format. You can add override the parser
and specify your own with `--parser=YOUR-PARSER`.

If you create your own parser, it should default export a function that accepts
path of file, and returns a list of an objects. It must return an object, with at least the following keys:

- `body`: The main body of the post as HTML
- `date`: The post date
- `slug`: The url slug of the original post
- `title`: The title of the post

**Note: You can also add more keys. These will be passed on as is to be reused 
in the template.**

