<script>
  import { createEventDispatcher } from "svelte";
  import { fade } from "svelte/transition";
  const dispatch = createEventDispatcher();
  export let todo;

  // $: todo.durationToDisplay =
  // todo.duration == 0 ? "TODO" : time_convert(todo.duration);

// ssetInterval(() => console.log("CHLD " + todo.durationToDisplay));

  function time_convert(seconds) {
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
</script>

<style>
  .done-true {
    color: gray;
    text-decoration: line-through;
  }
  li {
    margin-top: 5px;
  }
</style>

<li transition:fade>
  <div>
    <input
      type="checkbox"
      checked={todo.done}
      on:change={() => dispatch('toggleDone')} />
    <span
      class={'done-' + todo.done}
      on:click={() => dispatch('switchTracking')}>{todo.title}</span>
    <span>{todo.durationToDisplay}</span>
  </div>
  <button on:click={() => dispatch('delete')}>Delete</button>
</li>
