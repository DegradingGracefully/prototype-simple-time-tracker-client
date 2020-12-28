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

.task-duration,
.task-more-info {
    text-align: right;
}
</style>
<!-------------------------------------------------------------------------------->
<!---------------                 LAYOUT OF A TASK                ---------------->
<!-------------------------------------------------------------------------------->
<div transition:fade class="box">
    <div class="content columns is-multiline is-mobile">
        <div class="{'done-' + todo.done} column task-title is-5 py-0" on:click={()=> dispatch('switchTracking')}>
            {todo.title}
        </div>
        <div class="column task-more-info is-2 py-0 modal-button" data-target="my-modal">
            <span class="icon has-text-info">
                <i class="fas fa-info-circle"></i>
            </span>
        </div>
        <div class="column task-duration is-5 py-0">
            <small><span>{todo.durationToDisplay}</span></small>
        </div>
        <div class="column task-title is-5  py-0">
        </div>
        <div class="column task-more-info is-2 py-0">
        </div>
        <div class="column task-duration is-5 py-0">
            <!-- is-narrow ??? -->
            <!-- <i class="fas fa-plus-circle is-size-7 has-background-danger"></i> -->
            <i class="fas fa-plus-circle is-size-7 has-text-danger"></i>
            <i class="fas fa-minus-circle is-size-7 has-text-danger"></i>
        </div>
    </div>
</div>