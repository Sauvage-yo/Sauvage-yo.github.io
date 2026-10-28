// Small interactions for the portfolio. No frameworks required.
document.addEventListener("DOMContentLoaded", () => {
  const welcomeScreen = document.getElementById("welcomeScreen");
  const enterButton = document.getElementById("enterButton");
  const menuToggle = document.getElementById("menuToggle");
  const navLinks = document.getElementById("navLinks");

  // Welcome screen fades away when the visitor enters the site.
  enterButton.addEventListener("click", () => {
    welcomeScreen.classList.add("is-hidden");
    document.body.classList.remove("welcome-active");
  });

  // Accessible mobile navigation.
  menuToggle.addEventListener("click", () => {
    const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!isOpen));
    navLinks.classList.toggle("open", !isOpen);
  });
  navLinks.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("open");
      menuToggle.setAttribute("aria-expanded", "false");
    });
  });

  // Reveal cards and sections as they enter the viewport.
  const revealItems = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealItems.forEach(item => revealObserver.observe(item));
  } else {
    revealItems.forEach(item => item.classList.add("is-visible"));
  }

  // Update the current navigation item while scrolling.
  const sections = document.querySelectorAll("main section[id]");
  const navItems = document.querySelectorAll(".nav-link");
  if ("IntersectionObserver" in window) {
    const sectionObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          navItems.forEach(link => link.classList.toggle("active", link.getAttribute("href") === `#${entry.target.id}`));
        }
      });
    }, { rootMargin: "-35% 0px -55% 0px" });
    sections.forEach(section => sectionObserver.observe(section));
  }
  document.getElementById("year").textContent = new Date().getFullYear();

  // Contact form demo: prepares an email using the visitor's default mail app.
  const contactForm = document.getElementById("contactForm");
  contactForm.addEventListener("submit", event => {
    event.preventDefault();
    const formData = new FormData(contactForm);
    const recipient = "marvinochotorena.edu@gmail.com"; // TODO: replace with your email
    const subject = encodeURIComponent(formData.get("subject") || `Portfolio message from ${formData.get("name")}`);
    const body = encodeURIComponent(
      `Name: ${formData.get("name")}\nEmail: ${formData.get("email")}\n\n${formData.get("message")}`
    );
    document.getElementById("formNote").textContent = "Opening your email app with a prepared message. Add your real email address in script.js before publishing.";
    window.location.href = `mailto:${recipient}?subject=${subject}&body=${body}`;
  });

  // MUSIC MEMORY CHALLENGE — four synthesized notes made with the Web Audio API.
  const noteButtons = [...document.querySelectorAll(".note-button")];
  const startButton = document.getElementById("startChallenge");
  const replayButton = document.getElementById("replaySequence");
  const roundNumber = document.getElementById("roundNumber");
  const bestRound = document.getElementById("bestRound");
  const challengeStatus = document.getElementById("challengeStatus");
  const instruction = document.getElementById("challengeInstruction");
  const feedback = document.getElementById("challengeFeedback");
  const frequencies = [261.63, 293.66, 329.63, 392.00]; // C, D, E, G
  let audioContext = null;
  let sequence = [];
  let playerIndex = 0;
  let acceptingInput = false;
  let best = 0;
  let round = 0;

  function getAudioContext() {
    // Browsers require audio to start after a user gesture.
    if (!audioContext) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) audioContext = new AudioContextClass();
    }
    if (audioContext && audioContext.state === "suspended") audioContext.resume();
    return audioContext;
  }

  function playTone(noteIndex, duration = 0.32) {
    const context = getAudioContext();
    if (!context) {
      feedback.textContent = "Your browser does not support Web Audio. Try a recent version of Chrome, Edge, or Firefox.";
      return;
    }
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = "sine";
    oscillator.frequency.value = frequencies[noteIndex];
    gain.gain.setValueAtTime(0.0001, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.22, context.currentTime + 0.025);
    gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + duration);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + duration + 0.03);
  }

  function lightNote(index) {
    const button = noteButtons[index];
    button.classList.add("is-lit");
    window.setTimeout(() => button.classList.remove("is-lit"), 230);
    playTone(index);
  }

  function wait(ms) { return new Promise(resolve => window.setTimeout(resolve, ms)); }

  async function playSequence() {
    acceptingInput = false;
    noteButtons.forEach(button => button.disabled = true);
    replayButton.disabled = true;
    challengeStatus.textContent = "LISTEN";
    instruction.textContent = "Listen closely to the notes...";
    await wait(350);
    for (const note of sequence) {
      lightNote(note);
      await wait(520);
    }
    noteButtons.forEach(button => button.disabled = false);
    replayButton.disabled = false;
    acceptingInput = true;
    playerIndex = 0;
    challengeStatus.textContent = "YOUR TURN";
    instruction.textContent = "Now repeat the sequence using the note buttons.";
    feedback.textContent = `${sequence.length} note${sequence.length === 1 ? "" : "s"} to remember. You’ve got this!`;
  }

  function beginRound() {
    getAudioContext();
    sequence.push(Math.floor(Math.random() * frequencies.length));
    round = sequence.length;
    roundNumber.textContent = String(round).padStart(2, "0");
    startButton.textContent = "New game ↻";
    startButton.disabled = true;
    playSequence().then(() => { startButton.disabled = false; });
  }

  startButton.addEventListener("click", () => {
    sequence = [];
    round = 0;
    playerIndex = 0;
    feedback.textContent = "Game started — listen to the notes.";
    beginRound();
  });

  replayButton.addEventListener("click", () => {
    if (sequence.length && !acceptingInput) return;
    if (sequence.length) playSequence();
  });

  noteButtons.forEach((button, index) => {
    button.addEventListener("click", () => {
      if (!acceptingInput) return;
      lightNote(index);
      if (sequence[playerIndex] !== index) {
        acceptingInput = false;
        noteButtons.forEach(noteButton => noteButton.disabled = true);
        challengeStatus.textContent = "TRY AGAIN";
        instruction.textContent = "Almost! Start a new game and see if you can beat your best.";
        feedback.textContent = `You reached round ${String(round).padStart(2, "0")}. Keep listening and try again!`;
        best = Math.max(best, round - 1);
        bestRound.textContent = String(best).padStart(2, "0");
        startButton.disabled = false;
        startButton.innerHTML = 'Try again <span>↻</span>';
        replayButton.disabled = true;
        return;
      }
      playerIndex += 1;
      if (playerIndex === sequence.length) {
        acceptingInput = false;
        best = Math.max(best, round);
        bestRound.textContent = String(best).padStart(2, "0");
        challengeStatus.textContent = "NICE WORK";
        instruction.textContent = "Correct! The next round adds one more note.";
        feedback.textContent = "Sequence remembered. Ready for the next level?";
        noteButtons.forEach(noteButton => noteButton.disabled = true);
        startButton.disabled = true;
        window.setTimeout(() => {
          beginRound();
        }, 900);
      }
    });
  });
});


// Profile details button: click/tap toggles the About Me and social links panel.
const profileDetailsButton = document.getElementById("profileDetailsButton");
if (profileDetailsButton) {
  const profileWrap = profileDetailsButton.closest(".profile-interactive-wrap");
  profileDetailsButton.addEventListener("click", () => {
    const isOpen = profileDetailsButton.getAttribute("aria-expanded") === "true";
    profileDetailsButton.setAttribute("aria-expanded", String(!isOpen));
    profileWrap.classList.toggle("panel-open", !isOpen);
  });
}
