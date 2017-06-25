/* eslint-env browser */
/* global chrome */
"use strict";
var $ = (s) => document.querySelector(s);
var value = $("meta[name='theme-color']") ? $("meta[name='theme-color']").getAttribute("content") : false;
value;
