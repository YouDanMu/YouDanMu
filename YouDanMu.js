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
      setTimeout(bind(this, inject, func), 0);
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

    /* Let's hijack the victim now. */
    hijack(
      window,
      ['yt', 'player', 'Application', 'create'],
      function onHijack(origin) {
        console.log('[YouDanMu]: yt.player.Application.create is hijacked.');
      },
      function onInvoke() {
        console.log('[YouDanMu]: yt.player.Application.create is called with:');
        console.log(arguments);
      },
      function onReturn(instance) {
        console.log('[YouDanMu]: yt.player.Application.create returns with:');
        console.log(instance);
      }
    );
  }

  inject(main);
})();
