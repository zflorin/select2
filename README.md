SELECT 2
========

This branch represents work-in-progress for the next (5.x) version of Select2.

Major features of this branch:

ADA support
-----------
ADA support has been lacking in previous versions of Select2 which made it difficult in incorporate into applications 
where ADA is a requirement. In order to support ADA Select2 had to be redesigned from scratch.

Written in React
----------------
This version of Select2 is written in React. The reason behind this decision is that a vast majority of bugs came from
state updates being inconsistently applied to the DOM resulting in a lot of bugs. By using React we are able to render
the full widget and allow React to reconcile the DOM changes for us.

jQuery Bridge / Usage Outside React
-----------------------------------
The fact that the core component is written in React does not preclude the usage of Select2 outside of React apps. To
this end `select2-jquery-bridge.js` is provided and allows usage of the widget via jQuery. 

TODO
----
* So far this branch contains a prototype implementation of the Multi-Select widget. This branch will act as a proof of
concept. Once ADA compliance has been validated by the community the rest of the features as well as the 
Single-Select mode will follow.

* The visual design / initial theme is still incomplete

* Mobile design and testing

Building
--------
`npm run dist`

Developing
----------
`npm run dev` and open `http://localhost:8080`.
Sources for dev playground are in `./dev/src/`

Reporting Bugs
--------------
Please tag GitHub issues and other threads using the `5.x` label

Copyright and License
---------------------
The license is available within the repository in the LICENSE file.




