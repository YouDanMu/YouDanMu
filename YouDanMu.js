/* This is the content script of the extension. It runs inside a sandboxed environment "isolated
world" (see https://developer.chrome.com/extensions/content_scripts#execution-environment for more
information.) In this "isolated world" environment, this script cannot directly access the page
defined variables and functions. But we can only modify the DOM contents. Therefore, to interact
with the page JS, we need to inject our code directly into the page through a <script/> tag DOM. */

(function () {
  'use strict';

  /* I18n by replacing __MSG_(\w+)__ tags */
  function i18n(str) {
    return str.replace(/__MSG_(\w+)__/g, function (match, key) {
      return key ? chrome.i18n.getMessage(key) : '';
    });
  }

  /* Stringify a function and inject it to the document body.
  The function will be executed on the target page immediately after injection. */
  function inject(func) {
    var p = document.body || document.head || document.documentElement;
    if (!p) {
      setTimeout(inject.bind(this, func), 0);
      return;
    }
    var script = document.createElement('script');
    script.setAttribute('type', 'text/javascript');
    if (typeof func === 'string') {
      func = 'function(){' + func + '}';
    }
    script.appendChild(document.createTextNode(i18n('(' + func + ')();')));
    p.appendChild(script);
    p.removeChild(script);
  }

  /* Since all the page codes are injected as string, we have to wrap them in an enormous function,
  then convert it into a function string. So the whole plugin and all of its dependencies are
  included inside this function. */
  function main() {
    /* If the injection succeeded, this line should print to the console. */
    console.log('__MSG_YDM_welcome_log__');
    
    /* Here we are going to hijack the private class `e9` by hacking Function's prototype.
    Since `e9` is a Function instance, and there's a property defined by `e9.create = ...`
    and this property is eventually exposed to the global context. We can exploit it as an
    entry point to hijack the private `e9` class. We do this by making every functions
    inherits an infected prototype, that having an evil `create` proxy property already
    defined. Therefore, when the statement `e9.create = ...` is executed, it will actually
    pass the right side operand to our evil setter, invoking with `e9` as `this` context.
    In this case, we can just bind the `this` value onto the operand value. Then when the
    `e9.create` is exposed to the global context, we will be able to get the private `e9`
    by `GLOBAL_EXPOSED_CREATE._this`. */
    Object.defineProperty(Function.prototype, 'create', {
        __proto__: null,
        enumerable: true,
        configurable: false,
        get: function _getter() {
            return this._create;
        },
        set: function _setter(value) {
            if (typeof value === 'function') {
                value._this = this;
            }
            this._create = value;
        }
    });

    /* A helper function to resolve deep object path without throwing "undefined" exceptions.
    If at a certain level a property on the path is undefined, just returns undefined. */
    function objGet(obj, propPath) {
      if (typeof obj === 'undefined') return undefined;
      else if (propPath.length === 0) return obj;
      else return objGet(obj[propPath[0]], propPath.slice(1));
    }

    /* The helper function to hijack a property on an object. */
    function hijack(obj, propPath, onHijack, onInvoke, onReturn) {
      /* We are hijacking a property on an object, thus the property path is required. */
      if (propPath && propPath.length < 1) {
        throw new Error('[Hijack]: No path list');
      }
      /* In case this script is loaded before the hijacking target, we have to busy-wait
      for the target to appear.*/
      if (typeof objGet(obj, propPath) === 'undefined') {
        setTimeout(hijack.bind(this, obj, propPath, onHijack, onInvoke, onReturn), 0);
        return;
      }
      var origin = objGet(obj, propPath);
      var originName = propPath.pop();
      var parent = objGet(obj, propPath);
      parent[originName] = function () {
        onInvoke.apply(this, arguments);
        var instance = origin.apply(this, arguments);
        onReturn(instance);
        return instance;
      };
      parent[originName].name = originName;
      onHijack(origin);
    }
    
    /* Given a player instance, we hijack the interface and hook up the listeners to
    do the main-in-the-middle attack. */
    function hooker(player) {
      player.hijacked = true;
      player.Y.subscribe("onStateChange", function(state) {
        window.postMessage({ type: 'FROM_PAGE', state: state }, '*');
        console.log("[YDM] onStateChange:", state)
      });
    }

    /* Let's hijack the victim now. */
    hijack(
      window,
      ['yt', 'player', 'Application', 'create'],
      function onHijack(origin) {
        /* Now we can steal the private `e9` PlayerApp class like this. */
        window._App = origin._this;
        /* In case the target apperas publicly after it's invoked privately,
        we may not be able to intercept in the middle. However, the `e9` class saves all
        the created instances on `e9.o`. Thus we can get all of the already initialized
        instances and hijack them. We also need to hiject the `create` method to hook up
        the future instances. */
        var playerKeys = Object.keys(window._App.o);
        for (var i = 0; i < playerKeys.length; i++) {
          hooker(window._App.o[playerKeys[i]]);
        }
        console.log('[YouDanMu]: yt.player.Application.create is hijacked.');
      },
      function onInvoke() {
        console.log('[YouDanMu]: yt.player.Application.create is called with:');
        console.log(arguments);
      },
      function onReturn(player) {
        /* We hijack and hook up every future created instances. */
        hooker(player);
        console.log('[YouDanMu]: yt.player.Application.create returns with:');
        console.log(player);
      }
    );
  }
  
  window.addEventListener('message', function(event) {
    if (event.source != window) return;
    if (event.data.type && (event.data.type == 'FROM_PAGE')) {
      console.log('[Master]:', event.data);
    }
  });

  inject(main);
})();
