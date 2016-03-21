getaroom.io
====

> Pretty nifty cross device and cross browser WebRTC audio/video conferencing demo of [SkylinkJS](http://github.com/Temasys/SkylinkJS) using [React](http://facebook.github.io/react/).
> Try it out at http://getaroom.io

For more other advanced features of SkylinkJS like the file transfers or the privileged key feature, [see the SkylinkJS demos list](https://github.com/Temasys/SkylinkJS/tree/master/demo). 

Browser support
----
Currently, the demo only support up to 10 peers. You may modify the demo to fit to your own limit. Note that in connection wise, how many peers it can connect with depends on network connection and computer's available memory.

See SkylinkJS support https://github.com/Temasys/SkylinkJS/#supported-browsers


Setup
----

You'll need node, npm and grunt installed. Clone the repo and run `npm install` to install dependencies.

- `grunt dev` will compile the JSX and Stylus files, start a web-server and open your browser to run it locally.
- `grunt stage` will create a _staging_ folder and create a compiled and minified version of the application
- `grunt publish` will move the contents of the _staging_ folder to a _publish_ folder.

Replace the API keys and hostnames in the `configs.jsx` file with your own. You can [sign up for your own API key here](https://developer.temasys.com.sg).

Note that it's important to reference the correct `socket.io-client` and `adapterjs` dependencies version based on the version of SkylinkJS you are using.

Files and Folders
----

You do not need to modify the `.js` files in `/js` folder nor modify from the `styles/app.css` file, since they are auto-generated everytime you do `grunt dev`. 

- `assets/`: Contains the logo.
- `img/`: Contains the icon images.
- `js/`: The output auto-generated javascript `.js` files after `grunt dev` is invoked.
- `jsx/`: The source files where you do modifications to the demo scripts (JS). Files are in JSX (React).
- `jsx/components/`: The folder that stores the UI components.
- `jsx/components/chat.jsx`: This file contains the chat layout.
- `jsx/components/controls.jsx`: This file contains the user controls layout.
- `jsx/components/userareas.jsx`: This file contains the user video view layout.
- `jsx/configs.jsx`: This file contains the configuration keys. It's advisable to use your own.
- `jsx/constants.jsx`: This file contains the constants configuration used by other `jsx` files.
- `jsx/loader.jsx`: This file contains the dependencies url to load.
- `jsx/main.jsx`: This file contains handling the SkylinkJS logic.
- `jsx/utils.jsx`: This file contains utility functions used by some other `jsx` files.
- `styles/`: The source files where you do modifications to the demo UI styling (CSS). Files are in Stylus.
- `styles/app.css`: The output auto-generated stylesheet `.css` file after `grunt dev` is invoked.
- `styles/app.styl`: This file contains the demo styling.
- `index.html`: This file is the main HTML template. Modify with your own Google Analytics if required.

Note that the `ca.crt`, `server.crt` and `server.key` are for your `localhost` domain. You might have to replace with your own certificates if you are hosting this demo on your page.


Need help or want something changed?
----

You can raise tickets on [our support portal](http://support.temasys.com.sg) or on [our Github Page](https://developer.temasys.com.sg/support).


License
----

[APACHE 2.0](http://www.apache.org/licenses/LICENSE-2.0.html)



