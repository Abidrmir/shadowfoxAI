<script>
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { getImageData } from '$lib/imageStore';

	let result = $state(null);
	let isProcessing = $state(true);
	let error = $state(null);
	let generationTime = $state(null);
	let dots = $state('');

	// Floating bar state
	let updateInput = $state('');
	let isUpdating = $state(false);
	let history = $state([]);
	let barVisible = $state(true);
	let barHovered = $state(false);
	let barManuallyHidden = $state(false);
	let historyVisible = $state(false);

	let scrollTimeout;
	let dotInterval;

	onMount(() => {
		const cached = sessionStorage.getItem('generatedSite');
		const cachedTime = sessionStorage.getItem('generationTime');
		const cachedHistory = sessionStorage.getItem('editHistory');

		if (cached) {
			result = cached;
			generationTime = cachedTime;
			isProcessing = false;
			if (cachedHistory) history = JSON.parse(cachedHistory);
			return;
		}

		dotInterval = setInterval(() => {
			dots = dots.length >= 3 ? '' : dots + '.';
		}, 500);

		generate();

		return () => {
			clearInterval(dotInterval);
			clearTimeout(scrollTimeout);
		};
	});

	function handleScroll() {
		if (!barHovered && !barManuallyHidden) {
			barVisible = false;
			clearTimeout(scrollTimeout);
			scrollTimeout = setTimeout(() => {
				barVisible = true;
			}, 1500);
		}
	}

	function hideBar() {
		barManuallyHidden = true;
		barVisible = false;
	}

	function showBar() {
		barManuallyHidden = false;
		barVisible = true;
	}

	async function generate() {
		const startTime = performance.now();
		const stored = localStorage.getItem('formAnswers');

		if (!stored) {
			error = 'No form data found. Please fill out the questionnaire first.';
			isProcessing = false;
			return;
		}

		const answers = JSON.parse(stored);
		const image = getImageData();

		try {
			const response = await fetch('/api/process', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ answers, image })
			});

			const data = await response.json();

			if (data.success) {
				result = data.result;
				const endTime = performance.now();
				generationTime = ((endTime - startTime) / 1000).toFixed(2);
				sessionStorage.setItem('generatedSite', result);
				sessionStorage.setItem('generationTime', generationTime);
			} else {
				error = data.error || 'Something went wrong';
			}
		} catch (err) {
			error = 'Failed to generate. Please try again.';
			console.error(err);
		} finally {
			isProcessing = false;
			clearInterval(dotInterval);
		}
	}

	async function sendUpdate() {
		if (!updateInput.trim() || isUpdating) return;

		const instruction = updateInput.trim();
		updateInput = '';
		isUpdating = true;

		history = [...history, { role: 'user', content: instruction }];

		try {
			const response = await fetch('/api/update', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					currentHtml: result,
					instruction,
					history: history.slice(0, -1)
				})
			});

			const data = await response.json();

			if (data.success) {
				result = data.result;
				history = [
					...history,
					{ role: 'assistant', content: '✓ Updated successfully' }
				];
				sessionStorage.setItem('generatedSite', result);
				sessionStorage.setItem('editHistory', JSON.stringify(history));
			} else {
				history = [
					...history,
					{
						role: 'assistant',
						content: `✗ Error: ${data.error}`
					}
				];
			}
		} catch (err) {
			history = [...history, { role: 'assistant', content: '✗ Failed to update' }];
			console.error(err);
		} finally {
			isUpdating = false;
		}
	}

	function handleKeydown(e) {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			sendUpdate();
		}
	}

	function reset() {
		sessionStorage.removeItem('generatedSite');
		sessionStorage.removeItem('generationTime');
		sessionStorage.removeItem('editHistory');
		localStorage.removeItem('formAnswers');
		goto('/builder/1');
	}
</script>

<svelte:window onscroll={handleScroll} />

<div class="flex w-full flex-col items-center text-center">
	{#if isProcessing}
		<div class="mt-20 flex flex-col items-center space-y-4">
			<h1 class="font-serif text-4xl">Building your website{dots}</h1>
			<p class="text-gray-500">This may take a minute. Please don't close this page.</p>
			<div
				class="h-10 w-10 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"
			></div>
		</div>
	{:else if error}
		<div class="mt-20 flex flex-col items-center space-y-4">
			<h1 class="font-serif text-4xl">Something went wrong</h1>
			<p class="text-red-500">{error}</p>
			<button
				onclick={reset}
				class="rounded-lg bg-blue-600 px-3 py-2 text-white hover:bg-blue-500"
			>
				Start Over
			</button>
		</div>
	{:else if result}
		<!-- Full-screen preview -->
		<div class="h-screen w-full">
			<iframe
				class="h-full w-full border-8 transition-colors duration-500
					{isUpdating ? 'animate-border-pulse' : 'border-red-500'}"
				srcdoc={result}
				title="Generated Website"
			></iframe>
		</div>

		<!-- Invisible hover zone at the bottom (always present) -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
			class="fixed bottom-0 left-0 z-40 h-24 w-full"
			onmouseenter={() => {
				barHovered = true;
				if (barManuallyHidden) return;
				barVisible = true;
			}}
			onmouseleave={() => {
				barHovered = false;
			}}
		></div>

		<!-- Small "Edit" button visible when bar is hidden -->
		{#if !barVisible || barManuallyHidden}
			<button
				onclick={showBar}
				class="fixed mb-7 bottom-4 left-1/2 z-50 -translate-x-1/2 rounded-full bg-blue-600 px-4 py-2 text-sm text-white shadow-lg transition-all hover:bg-blue-500 hover:shadow-xl"
			>
				Edit Page
			</button>
		{/if}

		<!-- Floating edit bar -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
			class="fixed bottom-0 left-0 z-50 w-full transition-all duration-300 ease-in-out"
			class:translate-y-0={barVisible && !barManuallyHidden}
			class:translate-y-full={!barVisible || barManuallyHidden}
			onmouseenter={() => {
				barHovered = true;
				if (barManuallyHidden) return;
				barVisible = true;
			}}
			onmouseleave={() => {
				barHovered = false;
			}}
		>
			<!-- Hide bar button + Show History toggle -->
			<div class="flex justify-center gap-2 pb-1">
				<button
					onclick={hideBar}
					class="rounded-full bg-white/90 px-3 py-1 text-xs text-gray-500 shadow backdrop-blur-sm transition-colors hover:text-gray-800"
				>
					Hide ✕
				</button>
				{#if history.length > 0}
					<button
						onclick={() => (historyVisible = !historyVisible)}
						class="rounded-full bg-white/90 px-3 py-1 text-xs text-gray-500 shadow backdrop-blur-sm transition-colors hover:text-gray-800"
					>
						{historyVisible ? 'Hide History ▾' : 'Show History ▴'}
					</button>
				{/if}
			</div>

			<!-- History pills (conditionally visible) -->
			{#if historyVisible && history.length > 0}
				<div class="mx-auto flex max-w-3xl flex-col gap-1 px-4 pb-2">
					{#each history.slice(-4) as msg}
						<div
							class={msg.role === 'user'
								? 'self-end rounded-full bg-blue-600 px-3 py-1 text-xs text-white shadow'
								: 'self-start rounded-full bg-white/90 px-3 py-1 text-xs text-gray-700 shadow'}
						>
							{msg.content}
						</div>
					{/each}
				</div>
			{/if}

			<!-- Input bar -->
			<div class="mb-10">
				<div class="mx-auto flex max-w-3xl items-center gap-2 px-4 py-3">
					<button
						onclick={reset}
						class="shrink-0 rounded-lg bg-red-500 px-3 py-2 text-sm text-white hover:bg-red-400"
						title="Start Over"
					>
						✕
					</button>
					<input
						type="text"
						bind:value={updateInput}
						onkeydown={handleKeydown}
						placeholder="Describe a change... e.g. Make the header blue"
						disabled={isUpdating}
						class="flex-1 rounded-xl bg-gray-100 px-4 py-2.5 text-sm ring-1 ring-gray-200 transition-all outline-none focus:ring-2 focus:ring-blue-400"
					/>
					<button
						onclick={sendUpdate}
						disabled={isUpdating || !updateInput.trim()}
						class="shrink-0 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-500 disabled:opacity-50"
					>
						{#if isUpdating}
							<span class="animate-pulse">...</span>
						{:else}
							Send
						{/if}
					</button>
				</div>
				{#if generationTime}
					<p class="pb-2 text-center text-xs text-gray-400">
						Generated in {(generationTime / 60).toFixed(2)}m
					</p>
				{/if}
			</div>
		</div>
	{/if}
</div>

<style>
	@keyframes border-pulse {
		0% {
			border-color: #3b82f6;
		}
		25% {
			border-color: #8b5cf6;
		}
		50% {
			border-color: #ec4899;
		}
		75% {
			border-color: #f59e0b;
		}
		100% {
			border-color: #3b82f6;
		}
	}

	:global(.animate-border-pulse) {
		animation: border-pulse 2s ease-in-out infinite;
	}
</style>