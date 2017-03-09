(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";
///<reference path="../node_modules/@types/jasmine/index.d.ts"/>
var YDM_1 = require("../src/ts/content-script/YDM");
describe("test test", function () {
    var ydm = new YDM_1.YDM();
    it("should return", function () {
        expect(ydm.onVideoScreenCreated()).toBe("Hello World");
    });
});

},{"../src/ts/content-script/YDM":2}],2:[function(require,module,exports){
"use strict";
///<reference path="../index.d.ts"/>
var YDM = (function () {
    function YDM() {
    }
    YDM.prototype.onVideoScreenCreated = function () {
        return ('Hello World');
    };
    return YDM;
}());
exports.YDM = YDM;

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcGVjL3lkbS50cyIsInNyYy90cy9jb250ZW50LXNjcmlwdC9ZRE0udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7O0FDQUEsZ0VBQWdFO0FBQ2hFLG9EQUFtRDtBQUVuRCxRQUFRLENBQUMsV0FBVyxFQUFFO0lBRWxCLElBQUksR0FBRyxHQUFHLElBQUksU0FBRyxFQUFFLENBQUM7SUFFcEIsRUFBRSxDQUFDLGVBQWUsRUFBRTtRQUNoQixNQUFNLENBQUMsR0FBRyxDQUFDLG9CQUFvQixFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUM7SUFDM0QsQ0FBQyxDQUFDLENBQUM7QUFFUCxDQUFDLENBQUMsQ0FBQTs7OztBQ1hGLG9DQUFvQztBQUNwQztJQUNJO0lBRUEsQ0FBQztJQUVELGtDQUFvQixHQUFwQjtRQUNJLE1BQU0sQ0FBQyxDQUFDLGFBQWEsQ0FBQyxDQUFDO0lBQzNCLENBQUM7SUFJSixVQUFDO0FBQUQsQ0FYRCxBQVdFLElBQUE7QUFYVyxrQkFBRyIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvLy88cmVmZXJlbmNlIHBhdGg9XCIuLi9ub2RlX21vZHVsZXMvQHR5cGVzL2phc21pbmUvaW5kZXguZC50c1wiLz5cbmltcG9ydCB7IFlETSB9IGZyb20gJy4uL3NyYy90cy9jb250ZW50LXNjcmlwdC9ZRE0nO1xuXG5kZXNjcmliZShcInRlc3QgdGVzdFwiLCAoKSA9PiB7XG5cbiAgICBsZXQgeWRtID0gbmV3IFlETSgpO1xuXG4gICAgaXQoXCJzaG91bGQgcmV0dXJuXCIsICgpID0+IHtcbiAgICAgICAgZXhwZWN0KHlkbS5vblZpZGVvU2NyZWVuQ3JlYXRlZCgpKS50b0JlKFwiSGVsbG8gV29ybGRcIik7XG4gICAgfSk7XG4gICAgXG59KVxuIiwiLy8vPHJlZmVyZW5jZSBwYXRoPVwiLi4vaW5kZXguZC50c1wiLz5cbmV4cG9ydCBjbGFzcyBZRE0ge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuXG4gICAgfVxuXG4gICAgb25WaWRlb1NjcmVlbkNyZWF0ZWQoKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuICgnSGVsbG8gV29ybGQnKTtcbiAgICB9XG4gICAgXG4gICAgXG4gICAgXG4gfVxuIl19
