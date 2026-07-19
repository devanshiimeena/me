// Draggable work cards — pointer-based, bounded within the board section
(function () {
  const board = document.getElementById("dragBoard");
  if (!board) return;

  let topZ = 10;

  const cards = Array.from(board.querySelectorAll(".drag-card"));

  cards.forEach((card) => {
    let startX = 0;
    let startY = 0;
    let origLeft = 0;
    let origTop = 0;
    let dragging = false;

    card.addEventListener("pointerdown", (e) => {
      dragging = true;
      card.setPointerCapture(e.pointerId);
      card.classList.add("dragging");
      topZ += 1;
      card.style.zIndex = topZ;

      const rect = card.getBoundingClientRect();
      const boardRect = board.getBoundingClientRect();
      origLeft = rect.left - boardRect.left;
      origTop = rect.top - boardRect.top;
      startX = e.clientX;
      startY = e.clientY;
    });

    card.addEventListener("pointermove", (e) => {
      if (!dragging) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;

      const boardRect = board.getBoundingClientRect();
      const cardRect = card.getBoundingClientRect();

      let newLeft = origLeft + dx;
      let newTop = origTop + dy;

      // keep the card within the board's bounds
      const maxLeft = boardRect.width - cardRect.width;
      const maxTop = boardRect.height - cardRect.height;
      newLeft = Math.max(0, Math.min(newLeft, maxLeft));
      newTop = Math.max(0, Math.min(newTop, maxTop));

      card.style.left = newLeft + "px";
      card.style.top = newTop + "px";
      card.style.right = "auto";
      card.style.transform = "none";
    });

    const endDrag = (e) => {
      if (!dragging) return;
      dragging = false;
      card.classList.remove("dragging");
      try {
        card.releasePointerCapture(e.pointerId);
      } catch (err) {
        /* no-op */
      }
    };

    card.addEventListener("pointerup", endDrag);
    card.addEventListener("pointercancel", endDrag);
  });
})();
