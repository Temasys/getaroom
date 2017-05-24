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

Setup / Development
----

Skip relevant steps when required.

1. Install required dependencies via `npm install`.

   - Install node.js [here](https://nodejs.org/en/download/) as it should also include with npm.

2. Make modifications in `source/` folder.

   Contents:
   
   - `configs.jsx`: Defines the App Keys based on the different environment. Modify `local` only.
    
   - `index.html`: Defines the HTML file for getaroom app. This contains the Google Analytics settings in which you can modify for your custom getaroom app.

   - `jsx/`: The React JSX files for the Javascript end.
      
      - `constants.jsx`: Defines the getaroom constants used across the getaroom app.
      
      - `loader.jsx`: Defines the dependencies and libraries versions.
      
      - `main.jsx`: Handles the Temasys Web SDK connection.
      
      - `utils.jsx`: Handles the utilities functionalities used across the getaroom app.
      
      - `components/controls.jsx`: Handles the getaroom app controls.
      
      - `components/userareas.jsx`: Handles the user video element.
      
   - `js/`: The generated output Javascript files from the React JSX files. Do not modify changes on here.
     
      - `libs/`: Stores the custom dependencies Javascript files if needed.
      
   - `img/`: Stores the `jsx/components/controls.jsx` icons.
   
   - `assets/`: Stores the getaroom logo.
   
   - `styles/`: The Stylus files for the CSS end. Dont not modify the `.css` files in there as they are auto-generated.
   
      - `mixins/`: The mixin files.
      
      - `app.styl`: The getaroom app styling.
      
      - `fonts.styl`: The getaroom font styling if needed.
      
   - `ca.crt`: The CA cert file for localhost webserver `https:`. This is self-signed. Replace for your own app when required.
   
   - `server.crt`: The server cert file for localhost webserver `https:`. This is self-signed. Replace for your own app when required.
   
   - `server.key`: The certificate private key for localhost webserver `https:`. This is self-signed. Replace for your own app when required.
   

3. To start testing the modification, run `grunt dev` to compile the React JSX (js) and Stylus (css) files, which starts a localhost webserver in your browser in `https://localhost:8085`.
   
4. Once ready for production, run `grunt stage` to create a `staging/` folder which contains the compiled and minified version of the application, and then run `grunt publish` to move the `staging/` contents to `publish/` folder. Use files from the `publish/` folder to host on your own webserver.


License
----

[APACHE 2.0](http://www.apache.org/licenses/LICENSE-2.0.html)



