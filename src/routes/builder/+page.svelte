<script>
	import Navbar from "../../components/navbar.svelte";

</script>
<Navbar/>

<div class="flex flex-col mt-20 space-y-10 items-center">
	<h2 class="text-center font-serif text-5xl">What type of Business <br /> are you?</h2>

	<div class="flex flex-col text-center space-y-3 text-2xl">
        <span>
            <button class="border-2 border-blue-700 rounded-2xl px-3 hover:bg-blue-200 active:bg-blue-200">Resturant</button>
            <button class="border-2 border-red-500 rounded-2xl px-3  hover:bg-red-200 active:bg-red-200">Cafe</button>
            <button class="border-2 border-yellow-500 rounded-2xl px-3  hover:bg-yellow-200 active:bg-yellow-200">Store</button>
        </span>
        <span>
            <button class="border-2 border-green-500 rounded-2xl px-3  hover:bg-green-200 active:bg-green-200">Decor</button>
            <button class="border-2 border-blue-700 rounded-2xl px-3  hover:bg-blue-200 active:bg-blue-200">Merch</button>
        </span>
        <a href="/builder/1" class="text-sm text-gray-500">Next</a>
	</div>
</div>
