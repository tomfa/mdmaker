# mdmaker

This script is created with the intention of migrating from Wordpress
to Gatsby. It should be generic enough to work easily from most 
structured files to `.md` files.
 
Instructions for exporting your information from WordPress [can be found here](http://en.support.wordpress.com/export/).

```
# Install dependencies
yarn

# Convert your .xml file
yarn convert export.xml
```

Generated markdown files are found in the `output` folder.

### Editing output folder name
Each post is put in an own individual folder.
```
/2018-11-30-how-to-markdown/index.md
``` 
Its folder name can be specified with `--folder-format=YOUR-FORMAT`

**Default: `yyyy-mm-dd-"slug"`** 

Note that quotes are used to surround text that should *not* be formatted as date.

Replaced values are:

- `yyyy`: The year the post was created 
- `mm`: The month the post was created 
- `dd`: The day the post was created 
- `author`: The author that created the post 
- `slug`: The url slug name of the post 

### Images
All linked images in the original file are downloaded and put in the 
folder belonging to the related markdown file.

```
/2018-11-30-how-to-markdown/index.md
/2018-11-30-how-to-markdown/image-for-the-post.jpg
```

We only download images with urls starting with `http`, and by default
require them to end with `png` or `jpg`. 

This can be changed with `--filter-images=YOUR-REGEX`

**Default: `^http.*\.(png|jpg)$`**

This can be used to e.g. filter out only images that were on your 
existing domain:

```
--filter-images="^https://mydomain\.com.*\.(png|jpg)
```

The URLs are also changed in the `body` of the original data.

### Parsing other inputs

Parsers can be found in `parsers` and contain logic for parsing 
a file into a structured format. If you wish to parse a different 
structure that wordpress XML, you can add your owner parser
and specify it with `--parser=YOUR-PARSER`

**Default: `wordpress-xml`**

If you create your own parser, it should default export a function that accepts
path of file, and returns a list of an objects with the following keys:

- `author`: The author of the post
- `body`: The main body of the post as HTML
- `date`: The post date
- `excerpt`: The excerpt of the post
- `slug`: The url slug of the original post
- `title`: The title of the post

### Generated markdown templates

The output `.md` files are based on files in the `templates` folder.
Placeholders, e.g. `{{ title }}`, are replaced with the data parsed
from the input file. 

The template used can be changed with `--template=my-file.md`

**Default: `gatsby.md`** 

Available variables are:
- `author`: The author of the post
- `content`: The markdown generated body of the post
- `date`: The post date formatted as `yyyy-mm-dd`
- `excerpt`: The excerpt of the post
- `slug`: The url slug of the original post
- `title`: The title of the post
- `image`: The featured image of the article
