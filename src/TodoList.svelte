<script>
  import { onMount, tick } from "svelte";
  import Todo from "./Todo.svelte";

  const URL_GET_ALL_TASKS = "http://localhost:4000/task";
  const URL_GET_CURRENT_TASK_TRACKING =
    "http://localhost:4000/currentTaskTracking";
  const URL_UPDATE_CURRENT_TASK_TRACKING =
    "http://localhost:4000/currentTaskTracking";

  const ID_NO_TASK_TRACKING = 0; // represents the fact that we're not tracking any task currently

  const NO_TASK_TRACKING = {
    isTracking: false,
    taskId: ID_NO_TASK_TRACKING,
    duration: 0,
    timeBeginTracking: null
  };

  const TEXT_TASK_TO_BEGIN = "TODO";

  let todos = [];
  let currentTaskTracking;

  let interval;

  onMount(async () => {
    // must intialize currentTaskTracking to unselected here
    currentTaskTracking = { ...NO_TASK_TRACKING };

    console.log("onMount: fetching data from server...");

    // get all tasks
    let res = await fetch(URL_GET_ALL_TASKS);
    todos = await res.json();
    console.log("Got tall tasks:\n" + JSON.stringify(todos));

    // add durationToDisplay field
    /*todos = todosFromServer.map(todo => {
      durationToDisplay = todoText.duration
      Object.assign(todo, { durationToDisplay: });
    });*/
    todos.forEach((todo) => {
      updateDurationToDisplay(todo);
    });

    // get currentTaskTracking
    res = await fetch(URL_GET_CURRENT_TASK_TRACKING);
    currentTaskTracking = await res.json();
    console.log(
      "Got currentTaskTracking:\n" + JSON.stringify(currentTaskTracking)
    );

    currentTaskTracking.timeBeginTracking = new Date(currentTaskTracking.timeBeginTracking); // hack to be able to perform javascript operations on mongo dates.... ?
    // check https://docs.mongodb.com/manual/reference/method/Date/

    updateCurrentTaskTrackingDuration();

    // launch the "eternal" timer that updates the display of the duration
    interval = setInterval(() => {
      updateCurrentTaskTrackingDuration();
    }, 500);
    // setTimeout(updateCurrentTaskTrackingDuration, 1000);
  });

  // async function updateCurrentTaskTrackingDuration() { // TODO: ADDED "async" just to be able to use "await" (in await tick()).. is that ok ???
  function updateCurrentTaskTrackingDuration() {
    if (currentTaskTracking.isTracking) {
      // only update if there's a task selected
      
      // calculates the "new" duration
      console.log("updateCurrentTaskTrackingDuration=>" + currentTaskTracking.timeBeginTracking);
      console.log("Date.now() - currentTaskTracking.timeBeginTracking=>" + (Date.now() - currentTaskTracking.timeBeginTracking));

      let durationMillis = Date.now() - currentTaskTracking.timeBeginTracking;
      let durationSeconds = Math.floor(durationMillis / 1000);
console.log("updateCurrentTaskTrackingDuration=>" + durationSeconds);
      // updates the task duration
      let currentTodo = todos.find(
        (t) => t._id === currentTaskTracking.taskId
      );
      // currentTodo.duration += durationSeconds;
      // currentTodo.durationToDisplay = time_convert(currentTodo.duration + durationSeconds);
      updateDurationToDisplay(currentTodo, durationSeconds);
      todos = todos;
      // todos = todos.map(todo => todo); // hack to update the array of todos in child Task.svelte, in order to update this currentTodo display
      // todosToDisplay = todos.filter((t) => !hideCompleted || !t.done);

      console.log("updated currentTaskTracking: " + JSON.stringify(currentTodo));
    }

    // await tick();

    // setTimeout(updateCurrentTaskTrackingDuration, 1000); // replan the "eternal" timer
  }

  let lastId = 500;
  const createTodo = (title, done = false, duration = 0) => {
    let newTodo = {
      id: lastId++,
      title: title,
      done: done,
      duration: duration,
    };
    updateDurationToDisplay(newTodo);

    return newTodo;
  };

  let todoText = "";
  let hideCompleted = true;

  $: uncompletedCount = todos.filter((t) => !t.done).length;
  $: status = `${uncompletedCount} of ${todos.length} remaining`;
  // $: todosToDisplay = todos.filter((t) => !hideCompleted || !t.done);

  function filterCompleted(t) {
    return !hideCompleted || !t.done;
  }

  // function updateDurationToDisplayTemporay(todo, newDuration) {
  function updateDurationToDisplay(todo, newDuration = 0) {
    console.log("updateDurationToDisplay=>" + todo.duration);
    if (newDuration != 0) {
      todo.durationToDisplay = time_convert(todo.duration + newDuration);
    } else if (todo.duration == 0) {
      todo.durationToDisplay = TEXT_TASK_TO_BEGIN;
    } else {
      todo.durationToDisplay = time_convert(todo.duration);
    }
  }

  function time_convert(seconds) {
    console.log("time_convert=>" + seconds);
    var hours = Math.floor(seconds / 3600);
    var minutes = Math.floor((seconds % 3600) / 60);
    var seconds = seconds % 60;

    if (hours < 10) {
      hours = "0" + hours;
    }
    if (minutes < 10) {
      minutes = "0" + minutes;
    }
    if (seconds < 10) {
      seconds = "0" + seconds;
    }

    return hours + ":" + minutes + ":" + seconds;
  }

  function getCurrentTimeString() {
    let date = new Date();
    let options = { hour: "2-digit", minute: "2-digit" };

    return date.toLocaleTimeString("en-us", options);
  }

  /*  switchTracking determines which task to begin / stop tracking / switch to other task
      and calculates the duration of the current task (if any) up to now
  */
  function switchTracking(todoId) {
    clearInterval(interval);
    var previousTodo;

    // if we were tracking a task ...
    if (currentTaskTracking.isTracking) {
      // ... calculates the "new" duration
      let durationMillis = Date.now() - currentTaskTracking.timeBeginTracking;
      let durationSeconds = Math.floor(durationMillis / 1000);

      // updates the task duration
      previousTodo = todos.find((t) => t._id === currentTaskTracking.taskId);
      previousTodo.duration += durationSeconds;
      updateDurationToDisplay(previousTodo);
      sendUpdateCurrentTaskTracking();
      todos = todos; // hack to update the array of todos in child Task.svelte, in order to update this previousTodo display
      console.log(previousTodo);
    }

    let currentTaskTitle = todos.find((t) => t._id === todoId).title;

    // if we were tracking the selected task of id todoId => just stop tracking
    if (currentTaskTracking.taskId == todoId) {
      currentTaskTracking = { ...NO_TASK_TRACKING };
      console.log(
        getCurrentTimeString() + ': stopped task "' + currentTaskTitle + '"'
      );
    } else {
      // else switch to selected task
      currentTaskTracking.isTracking = true;
      currentTaskTracking.taskId = todoId;
      currentTaskTracking.timeBeginTracking = Date.now() - 1000;
    }

    updateCurrentTaskTrackingDuration();
    sendUpdateCurrentTaskTracking();
    console.log(
      getCurrentTimeString() + ': switching to task "' + currentTaskTitle + '"'
    );

    interval = setInterval(() => {
      updateCurrentTaskTrackingDuration();
    }, 500);
  }

  async function sendUpdateCurrentTaskTracking() {
    const body = JSON.stringify(currentTaskTracking);
    const headers = {
      "Content-Length": body.length,
      "Content-Type": "application/json",
    };
    const res = await fetch(URL_UPDATE_CURRENT_TASK_TRACKING, {
      method: "PUT",
      headers,
      body,
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  }

  function addTodo() {
    todos = todos.concat(createTodo(todoText));
    todoText = "";
  }
  function deleteTodo(todoId) {
    todos = todos.filter((t) => t.id !== todoId);
  }
  function toggleDone(todo) {
    const { id } = todo;
    todos = todos.map((t) => (t.id === id ? { ...t, done: !t.done } : t));
  }
</script>

<style>
  button {
    margin-left: 10px;
  }
  ul.unstyled {
    list-style: none;
    margin-left: 0;
    padding-left: 0;
  }
</style>

<div>
  <h2>To Do List</h2>
  <div>
    {status}
    <div>
      Hide completed:
      <input
        type="checkbox"
        checked={hideCompleted}
        on:change={() => (hideCompleted = !hideCompleted)} />
    </div>
  </div>
  <br />
  <form on:submit|preventDefault>
    <input
      data-testid="todo-input"
      type="text"
      size="30"
      placeholder="enter new todo here"
      bind:value={todoText} />
    <button disabled={!todoText} on:click={addTodo}>Add</button>
  </form>
  <ul class="unstyled">
    {#each todos.filter(filterCompleted) as todo}
      <Todo
        {todo}
        on:switchTracking={() => switchTracking(todo._id)}
        on:delete={() => deleteTodo(todo._id)}
        on:toggleDone={() => toggleDone(todo)} />
    {/each}
  </ul>
</div>
