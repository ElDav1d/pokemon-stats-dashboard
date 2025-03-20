<script>
	import { Separator } from "$shadcn/separator/index.js";
	import { cn } from "$lib/utils.js";

	let { ref = $bindable(null), class: className, ...restProps } = $props();
</script>

<Separator bind:ref class={cn("bg-muted -mx-1 my-1 h-px", className)} {...restProps} />
