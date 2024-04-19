document.querySelectorAll(".like-btn").forEach((button) => {
  button.addEventListener("click", async function () {
    const imageId = this.dataset.imageId;
    try {
      const response = await fetch(`/like/${imageId}`, { method: "POST" });
      if (response.ok) {
        const result = await response.json();
        this.classList.toggle("liked", result.liked); // Toggle based on actual response
        const likeCountSpan = this.previousElementSibling; // Assuming the like count is right before the button
        likeCountSpan.textContent = `${result.like_count} likes`;
      } else {
        console.error(`Failed to update like status: ${response.status}`);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  });
});
