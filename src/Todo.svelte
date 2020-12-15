<script>
  import { createEventDispatcher } from 'svelte';
  import { fade } from 'svelte/transition';

  const dispatch = createEventDispatcher();
  export let todo;
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
