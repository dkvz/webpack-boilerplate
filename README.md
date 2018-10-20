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

#### General CSS

#### SASS

#### Babel

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
