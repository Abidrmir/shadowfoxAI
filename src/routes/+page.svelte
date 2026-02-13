<script>
	import Navbar from "../components/navbar.svelte";

</script>

<div class="text-center flex flex-col space-y-7">
    <Navbar/>
	<h1 class="font-serif text-8xl mt-20">
		<span class="mb-3 block">Build a <span class="rounded-sm bg-yellow-300 px-2">Website</span> for your</span
		>
		<span class="block"
			><span class="underline decoration-red-600">Business</span> in
			<span class="text-green-700 italic">Minutes</span></span
		>
	</h1>
	<div class="flex flex-col items-center space-y-1
    ">
		<a
			href="/builder/1"
			class="rounded-lg border-b-4 border-l-4 border-blue-900 bg-blue-500 hover:border-b-2 hover:border-l-2 active:border-0 px-3 py-2 text-xl text-white transition"
			>Get Started for Free</a
		>

		<p class="text-xs italic">No credit card or signup required!</p>
	</div>
</div>
