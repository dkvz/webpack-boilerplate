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
