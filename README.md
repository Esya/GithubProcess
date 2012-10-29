GithubProcess
=============

A small Usermonkey/Tampermonkey script to link Github to Targetprocess in your pullrequests.

## Features
GithubProcess adds some useful informations directly into your pullrequests, taken from TargetProcess's API.
![Screenshot](https://raw.github.com/Esya/GithubProcess/master/screenshot.png)

It searchs for UserStories and Bugs IDs and then replace them in the body.

Upcoming features might be : 

* Handling 'Requests' on TargetProcess
* Handling 'Tasks' on TargetProcess
* Warn the user if he's not logged on TP.
* A version for dotjs would be nice

## Installation
* Edit BASE_URL and ID_PREFIX
* Just add the script to your TamperMonkey / GreaseMonkey scripts. 
