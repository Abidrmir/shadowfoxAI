<script>
	import Navbar from '../../components/navbar.svelte';
</script>

<Navbar />

<div class="mx-8 mt-10 flex flex-col sm:flex-row justify-center space-x-7 font-serif">
	<div class="rounded-lg">
		<p class="text-lg">
			<span class="text-6xl">Hey! My name is <span class="rounded-sm bg-yellow-300 px-2">Abid Mir</span></span><br />
			<span class="block mt-4">I made ShadowFox to help buisnesses make awsome websites, <span class="text-green-700 italic"> fast.</span></span>
			Whether you need help, have a question, spot a bug, or have a cool idea - Please reach out.
			<span class="underline decoration-red-500">I want to help!</span>
		</p>
		<p class="mt-3 text-sm text-gray-500 italic">
			PS: I read and reply to every message, as well as answer all calls, myself. <br /> No bots or AI
			auto-replies. Just me, a real human (I hope!). -Abid
		</p>
	</div>

	<div class="h-fit space-y-8 rounded-lg bg-gray-200 px-5 py-5 sm:w-fit">
		<div class="">
			<p class="text-sm">Email me directly at:</p>
			<p class="text-xl underline decoration-yellow-500">
				<a href="mailto:abidrmir@gmail.com">abidrmir@gmail.com</a>
			</p>
		</div>

		<div class="">
			<p class="text-sm">Call or text* me at:</p>
			<p class="font-sans text-xl underline decoration-blue-400">
				<a href="tel:+16696493019">(669) 649-3019</a>
			</p>
            <p class="text-xs italic text-gray-400">*dw it'll be blue bubbles</p>
		</div>

		<div class="">
			<p class="text-sm">You can also call/message me on whatsapp:</p>
			<p class="font-sans text-xl underline decoration-green-600">
				<a href="https://wa.me/16696493019" target="_blank" rel="noopener">+1 (669) 649-3019</a>
			</p>
		</div>
	</div>
</div>
