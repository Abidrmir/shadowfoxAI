<script>
  import { page } from "$app/stores";
  import { goto } from "$app/navigation";
  import { browser } from "$app/environment";
  import Navbar from "../../../components/navbar.svelte";
  import { setImageData } from '$lib/imagestore.js';

  let currentStep = $derived(Number($page.params.step));

  const questions = [
    { id: 1, text: "What is the name of your business?", type: "text" },
    { id: 2, text: "What type of business are you?", type: "text" },
    {
      id: 3,
      text: "Describe the vibe you would like your website to have",
      type: "text",
    },
    {
      id: 4,
      text: "What is the address of your establishment?",
      type: "text",
    },
    { id: 5, text: "What products are you selling?", type: "text" },
    {
      id: 6,
      text: "Upload an image for your website (logo, hero photo, etc.)",
      type: "image",
    },
  ];

  let answers = $state(
    browser && localStorage.getItem("formAnswers")
      ? JSON.parse(localStorage.getItem("formAnswers"))
      : {},
  );

  let imagePreview = $state(null);

  $effect(() => {
    if (browser) {
      const answersToSave = { ...answers };
      delete answersToSave[6]; // Don't save image to localStorage
      localStorage.setItem("formAnswers", JSON.stringify(answersToSave));
    }
  });

  let currentQuestion = $derived(questions.find((q) => q.id === currentStep));
  let isLastQuestion = $derived(currentStep === questions.length);

  function handleImageUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target.result;
      answers[currentStep] = base64;
      imagePreview = base64;
      setImageData(base64);
    };
    reader.readAsDataURL(file);
  }

  function next() {
    if (currentStep < questions.length) {
      goto(`/builder/${currentStep + 1}`);
    } else {
      // Navigate to result page — it handles the API call
      goto("/builder/result");
    }
  }

  function prev() {
    if (currentStep > 1) {
      goto(`/builder/${currentStep - 1}`);
    }
  }
</script>

<Navbar />

<div class="flex w-full flex-col items-center text-center">
  {#if currentQuestion}
    <div class="space-y-2">
      <h1>Step {currentStep} of {questions.length}</h1>
      <p class="font-serif text-4xl">{currentQuestion.text}</p>
    </div>

    {#if currentQuestion.type === "image"}
      <input
        type="file"
        accept="image/*"
        onchange={handleImageUpload}
        class="mt-3"
      />
      {#if imagePreview}
        <img
          src={imagePreview}
          alt="Preview"
          class="mt-2 h-32 rounded object-contain"
        />
      {/if}
    {:else}
      <input
        type={currentQuestion.type}
        bind:value={answers[currentStep]}
        placeholder="Your answer"
        class="mt-3 w-1/2 rounded-lg bg-gray-200 py-2 pl-2 text-center outline-none"
      />
    {/if}

    <div class="mt-3 flex justify-between space-x-3">
      {#if currentStep > 1}
        <button
          onclick={prev}
          class="rounded-lg bg-red-500 px-3 py-2 text-white hover:bg-red-400"
        >
          Previous
        </button>
      {/if}
      <button
        onclick={next}
        class="rounded-lg bg-blue-600 px-3 py-2 text-white hover:bg-blue-500"
      >
        {#if isLastQuestion}
          Submit
        {:else}
          Next
        {/if}
      </button>
    </div>
  {:else}
    <p>Step not found. <a href="/builder/1">Start from beginning</a></p>
  {/if}
</div>