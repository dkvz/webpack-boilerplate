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

## TODO
I need to merge the docs from all the branches with master.