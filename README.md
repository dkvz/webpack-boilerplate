# Webpack Boilerplate
See sections below for info about how to add specific elements to the project.

## Usage
After running `npm install` to install the dependencies, you can start a dev server like so:
```
npm run dev
```

To build and minify for prod. in the dist directory, use:
```
npm run prod
```

You can also have the dev server bind all the IP addresses on your machine by using:
```
npm run dev-bind-all
```

### Add more STUFF
Not a fan of having too much stuff.

#### Fixes and hacks
I ran into a bug with minification and Safari 10. If you want to support Safari 10, you might want to explicitely test your production build (made by `npm run prod`) because the Webpack minification causes a Safari ES6 bug to appear (might not happen if you use ES5 or babelify to ES5).

My advice would be to first test on Safari without the fix, and if you get the bug, you need to specify the minification options in the "optimization" part of the config, like so:
```
  optimization: {
    // Had to add the minimize stuff because of 
    // a bug in Safari that shows up only
    // on minified code.
    minimizer: [
      new UglifyJsPlugin({
        uglifyOptions: {
          mangle: {
            safari10: true
          }
        }
      })
    ],
  },
```
You can add the "optimization" section right after `output: {}` if you don't have it yet.

Also this won't work unless you have the require statement for UglifyJSPlugin at the top of your config file:
```
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
```

#### Babel
I wanted a very specific Babel setup that would produce an ES5 build, and also a non-transpiled build (which is assumed to be ES6 or whatever).

So the idea is to not use Babel for the normal build, but I could have two different Babel configurations: one transpiled to ES5, and the other as normal ES6 + other features like maybe the object spread operators. I still have to decide on that.

I'd like to keep a build with no Babel at all because I'm weird like that.

From there, I could either use two different configurations, or somehow find a way to pass an argument to webpack like the mode=production thing, but not with mode because it's only allowed 3 different values.

I ended up using my weird function-as-modules.export at the end of my config file to get a command line argument that I called `build`.

It just adds `babel-loader` when build=es5 is given as an argument to webpack.

##### Dependencies
I'm using these dependencies:
```
npm install -D @babel/cli @babel/core @babel/preset-env babel-loader
```

Now we need a .babelrc file. I first used the magic "env" setting:
```
{
  "presets": ["@babel/preset-env"]
}
```

##### Better presets
The base preset presented above will transpile to ES5 (for now it does), but it does not add any polyfill.

I should probably target a more specific browser. Which would not include IE 11.

But... If for some reason I wanted IE 11, there seem to be a way to have Babel add polyfills when needed.

I'm going to try and install the @babel/polyfill package to see how that works.

```
npm install -D @babel/polyfill
```

In the main script entry point we also have to import the polyfills:
```
import '@babel/polyfill';
```

However this always imports the polyfills, even with the regular, no-babel build. Which isn't great.

There is an "experimental" feature discussed here: https://babeljs.io/docs/en/babel-preset-env#usebuiltins-usage-experimental

Which should make it so that modules get injected with the required polyfills, and only the ones they actually need.

The non-experimental way to do this is to use `"useBuiltIns": "entry"` and have the import at the beginning of scripts that require the polyfills. Normally, a limited amount of polyfills should be loaded according to what is used in your script.

The result is that I get more polyfills than if I were to use "usage" instead of "entry", but I still get more than if I wasn't using any of them. So I guess I'll settile for "entry".

##### More than two builds
I have to test ES6 modules. What if I use import() somewhere in a script, does it rely on the browser (to return a Promise), or does Webpack transform this into a Promise?

Because if I use ES6 modules I might need Babel for my "normal" build as well. Actually, I also wanted to use string literals which would also benefit from Babel since I need to support at least the Chrome that the Google crawlers use (to check).

-> If I want to use more builds I need to get rid of .babelrc and have Webpack provide the Babel config as an option to babel-loader, which I think is possible.

#### General CSS

#### SASS
There's more than one way to use SASS with Wepback. I'm not sure I have the most efficient one nor the one with the best looking config file but at least it works.

Some older ways to do this were NOT working with Webpack 4.

As always, some extra packages to install (not sure if you need absolutely all of these):
```
npm install -D css-loader autoprefixer mini-css-extract-plugin node-sass postcss-loader precss sass-loader style-loader
```

The goal is to extract all CSS into one single file and put that in the head tag of our HTML template, which requires one of the "css-extract" plugins (this is to avoid FOUC but you could devise some weird plan to take advantage of CSS-in-JS and have some kind of loading screen). So let's require that at the top of our config file:
```
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
```

Now if you don't have an "optimization" section in your config file (you need one for the Safari 10 ES6 bug mentioned above) you will have to add one, right after "output" being a good place.

Inside that optimization section you need a few lines for some weird reason, don't ask me:
```
  optimization: {
    // We need all that stuff for SASS.
    // I already regret using it.
    splitChunks: {
      cacheGroups: {
        styles: {
          name: 'styles',
          test: /\.css$/,
          chunks: 'all',
          enforce: true
        }
      }
    }
  }
```
I added the "optimization" section to the snippet for illustration. Append the `splitChunks` object to your own optimization section if you have one already.

Now we need a rule for .scss files (in the rules section of modules) to assign it the right loaders:
```
{
  test: /\.scss$/,
  use: [
    { loader: MiniCssExtractPlugin.loader },
    { loader: "css-loader" },
    {
      // PostCSS stuff is required by Bootstrap SCSS.
      loader: 'postcss-loader',
      options: {
        plugins: function () {
          return [
            require('precss'),
            require('autoprefixer')
          ];
        }
      }
    },
    { loader: "sass-loader" }
  ]
},
```
We're basically chaining 4 loaders here. Yeah... Makes me sad too. Do note that "autoprefixer" is supposed to make it so that Webpack automatically adds the -webkit-whatever and -moz-whatever prefixes to CSS stuff that has existing prefixes.

Last thing is to add the MiniCssExtractPlugin to the plugins array:
```
plugins: [
  new MiniCssExtractPlugin({
    filename: "[name][contenthash:5].css",
  }),
  // ... Rest of your plugins.
]
```
The plugin is also where you determine the output path of your final CSS file. It's automatically injected by HtmlWebpackPlugin so it should not really matter. Normally. Maybe. I don't know.

You still need to import the .scss file(s) in your JavaScript entry point using a regular 'import' statement followed by the path the the file.

#### i18n
I'm going to use i18n for this, with the translation keys in a JSON file inline by Webpack.

We should have a way to split the translations into multiple files for lazy loading. But that shouldn't be necessary unless there's a lot of text.

The library is i18n, it should be compatible with IE 11 and probably some easlier versions as well.

Let's install it through npm:
```
npm install -D i18next i18next-browser-languagedetector
```
The language detector thingy is something we're going to need later on.

In the main script, add the imports:
```
import i18next from 'i18next';
import LngDetector from 'i18next-browser-languagedetector';
```

Still in the main script, you need to initialize the library. It calls a callback when the initialization is complete:
```
i18next.init({
  lng: 'en',
  debug: false,
  resources: {
    en: {
      translation: {
        "hWorld": "hello world"
      }
    },
    de: {
      translation: {
        "hWorld": "hello welt"
      }
    }
  }
}, (err, t) => {
  // initialized and ready to go!
  document.getElementById('result').textContent = i18next.t('hWorld');
});
```

There is also a provided way to load the translations from a json file using a XHR: https://jsfiddle.net/jamuhl/ferfywyf/#tabs=js,result,html

Now, the language should be initialized to the current browser language, with a fallback to default.

Here's how we should be able to implement that using the example above as basis:
```
i18next
  .use(lngDetector)
  .init({
  fallbackLng: 'en',
  debug: false,
  resources: {
    en: {
      translation: {
        "hWorld": "hello world"
      }
    },
    de: {
      translation: {
        "hWorld": "hello welt"
      }
    }
  }
}, (err, t) => {
  // initialized and ready to go!
  document.getElementById('result').textContent = i18next.t('hWorld');
});
```
Where lngDetector is the name we gave to the import of the optional browser language detection thingy.

In the callback or as the callback we want to call some kind of method that initializes all the text. We could still flash the page but load the text slightly after. OR, we Promise.all multiple things on the page and release a spinner once it's done.

My plan is to use the attribute "data-t" on nodes that require translation, so that we can easily translate everything using querySelectorAll. See the working example below.

##### Changing the language
Looks like this should work:
```
i18next.changeLanguage(lng);
```

And then you can also register events to i18next:
```
i18next.on('languageChanged', () => {
  updateContent();
});
```

##### Can we push translations dynamically?

##### Working example
I made a working example that is copied hereunder.

HTML:
```
<div data-t="changeLanguage"></div>
<select id="lgSelect">
  <option value="en">EN</option>
  <option value="fr">FR</option>
</select>
<button id="btnSelect" data-t="validate"></button>
```

JS:
```
import i18next from 'i18next';
import LngDetector from 'i18next-browser-languagedetector';

const lgSelect = document.getElementById('lgSelect');

const initTranslations = _ => {
  const nodes = document.querySelectorAll('[data-t]');
  nodes.forEach(n => {
    n.textContent = i18next.t(n.getAttribute('data-t'));
  });
};

i18next
  .use(LngDetector)
  .init({
  fallbackLng: 'en',
  debug: false,
  resources: {
    en: {
      translation: {
        "changeLanguage": "Change language",
        "validate": "Validate"
      }
    },
    fr: {
      translation: {
        "changeLanguage": "Changer la langue",
        "validate": "Valider"
      }
    }
  }
}, (err, t) => {
  initTranslations();
  document.getElementById('btnSelect').addEventListener('click', _ => {
    i18next.changeLanguage(lgSelect.value);
  });
});

i18next.on('languageChanged', _ => {
  initTranslations();
});
```

##### Loading from the inlined JSON file
Create a JSON file with the object that is inside the "resources" key provided to i18next.

You need to put all the keys and values between double quotes to adapt to the JSON format.

You have to use "require" instead of "import" or webpack will think you want a dynamic import (which returns a promise).

The i18n init from above then looks something like this:
```
i18next
  .use(LngDetector)
  .init({
  fallbackLng: 'en',
  debug: false,
  resources: require('./locales.json')
}, (err, t) => {
  initTranslations();
  document.getElementById('btnSelect').addEventListener('click', _ => {
    i18next.changeLanguage(lgSelect.value);
  });
});
```

##### The evil doing-it-myself plan
I noticed i18n adds 41k of minified JS. That's more than I thought it would be.

I'm thinking maybe I can write my own i18n. I don't even need a "loaded" callback if I inline most of my translations first.

I just need to write something to detect languages.

Then I can use the format of locales.json that I used on my Polymer projects.

One of the advantages of i18next is that it's got a lot of options to help you compose translations with parameters, among other things.

#### Server-side rendering
I thought of using Express to render all the URLs in the app (that have to be listed somewhere) by using its own fetching of remote data and parsing of templates.

The task is thus linked to templating.

In practice the server-side rendering doesn't have to be made in JS. It's just easier to parse the app data this way.

#### Testing
I've been wanting to find a way to test my apps in a while now. I know how to use Jest but I think I need more than that.

My apps need to be able to manipulate a DOM. I might need Selenium to do this fully, or use Puppet on the dev server. Not sure yet.
