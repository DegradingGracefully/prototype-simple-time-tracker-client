:warning: This is just a temporary repo that I had to publish in order to share some code ;) Indeed, even though I plan to open source some of these works eventually, please don't use these sources as they currently stand, since they currently don't have enough features (plus source code needs some refactoring and cleaning).

This repository contains the client project of a simple time tracker prototype programmed in Node, Express, Svelte, Bulma CSS and MongoDB.

The server part is @ [https://github.com/DegradingGracefully/prototype-simple-time-tracker-server](https://github.com/DegradingGracefully/prototype-simple-time-tracker-server) .

What this app is about:
* we create a task and start recording its length:
<img alt="Task 1" src="https://github.com/DegradingGracefully/DegradingGracefully/blob/main/task1.gif">

* then we switch to some other task:
<img alt="Task 2" src="https://github.com/DegradingGracefully/DegradingGracefully/blob/main/task2.gif">

 :construction: TODOs
* code the history / reporting feature (Svelte datatable ?), which obviously is a central feature for a task tracking app. Working on this feature will provide an opportunity to introduce TDD in this project + typescript possibly.
* migrate to SQLite ?

~~<br />
Thanks Mark Volkmann which Todo List code I used to bootstrap this project 
https://github.com/mvolkmann/svelte-and-sapper-in-action/tree/master/svelte-todo
From book [Svelte and Sapper in Action](https://www.goodreads.com/book/show/52568144-svelte-and-sapper-in-action) .
