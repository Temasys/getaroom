getaroom.io
====

> Pretty nifty cross device and cross browser WebRTC audio/video conferencing demo of [SkylinkJS](http://github.com/Temasys/SkylinkJS) using [React](http://facebook.github.io/react/).
> Try it out at http://getaroom.io

#### Demo Query Parameters

| Parameter | Description |
| --------- | ----------- |
| `mcu` | Set to `1` or `true` to enable MCU connections |
| `forceTurn` | Set to `1` or `true` to force TURN connections |
| `forcePlugin` | Set to `1` or `true` to force Temasys WebRTC Plugin in Safari 11 |
| `media` | Set to `av` to fetch audio and video media, `v` to fetch only video media, `a` to fetch only audio media and `none` to no media. |
| `signalingNode` | Configure custom Temasys Signaling server URL (e.g. `https://signaling.temasys.io:3443`) |
| `turnNode` | Configure custom Temasys TURN server URL (e.g. `turn:turn.temasys.io:3478`) |
| `appkeyId` | Configure custom App key ID for testing purposes on `getaroom.io`. |
| `appkeySecret` | Configure custom App key secret for the configured `appkeyId` for testing purposes on `getaroom.io`. |

Setup / Development
----

Skip relevant steps when required.

#### 1. Install required dependencies

Do `npm install`, and `npm install grunt grunt-cli --save-dev` if required.

Install node.js [here](https://nodejs.org/en/download/) as it should also include with npm.

#### 2. Make modifications in `source/` folder.

In the contents of the `source/` folder:

- `configs.jsx`: Defines the App Keys based on the different environment. Modify `local` only. You can [sign up for your own App key here](https://console.temasys.io).
    
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
   

#### 3. Start testing modifications

Run `grunt dev` to compile the React JSX (js) and Stylus (css) files.

This opens `https://localhost:8085` in your browser as it runs localhost webserver on your device.
   
#### 4. Make it production ready

Once ready for production, run `grunt stage` to create a `staging/` folder which contains the compiled and minified version of the application.

Then run `grunt publish` to move the `staging/` contents to `publish/` folder. Use files from the `publish/` folder to host on your own webserver.


License
----

[APACHE 2.0](http://www.apache.org/licenses/LICENSE-2.0.html)