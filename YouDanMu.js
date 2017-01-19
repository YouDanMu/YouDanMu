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
    script.id = 'ydm-content-script';
    script.setAttribute('type', 'text/javascript');
    script.appendChild(document.createTextNode(i18n('(function(){' + func + '})();')));
    p.appendChild(script);
  }

  window.addEventListener('message', function (event) {
    if (event.source != window) return;
    if (event.data.type && (event.data.type == 'FROM_PAGE')) {
      console.log('[Master]:', event.data);
    }
  });

  var req = new XMLHttpRequest();
  req.open('get', chrome.extension.getURL('content-script.js'), true);
  req.onload = function () {
    inject(this.responseText);
  };
  req.send();
})();
