getaroom.io
====

> Pretty nifty cross device and cross browser WebRTC audio/video conferencing demo of [SkylinkJS](http://github.com/Temasys/SkylinkJS) using [React](http://facebook.github.io/react/).
> Try it out at http://getaroom.io


Setup
----

You'll need node, npm and grunt installed. Clone the repo and run `npm install` to install dependencies.

- `grunt dev` will compile the JSX and Stylus files, start a web-server and open your browser to run it locally.
- `grunt stage` will create a _staging_ folder and create a compiled and minified version of the application
- `grunt publish` will move the contents of the _staging_ folder to a _publish_ folder.

Replace the API keys and hostnames in the `configs.jsx` file with your own. You can [sign up for your own API key here](https://developer.temasys.com.sg).


License
----

[APACHE 2.0](http://www.apache.org/licenses/LICENSE-2.0.html)



