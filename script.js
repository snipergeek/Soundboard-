const MAX_SONS_NON_PREMIUM = 10;
const MAX_DURATION_PREMIUM = 120;
const MAX_DURATION_FREE = 50;
const CODES_VALIDES = ["PREMIUM123", "VIP456", "ULTRA789"];

let currentBoard = "Default";
let soundboards = JSON.parse(localStorage.getItem("soundboards")) || { "Default": [] };
let premium = localStorage.getItem("premium") === "true";

function estPremium() {
  return premium;
}

function activerPremium() {
  const code = document.getElementById("premium-code").value.trim();
  if (CODES_VALIDES.includes(code)) {
    premium = true;
    localStorage.setItem("premium", "true");
    document.getElementById("premium-section").style.display = "none";
    document.getElementById("premium-badge").style.display = "inline";
    afficherPremium();
  } else {
    alert("❌ Code invalide !");
  }
}

function afficherPremium() {
  if (estPremium()) {
    document.getElementById("infos").innerText = "✅ Premium activé : max 2 minutes par son.";
  } else {
    document.getElementById("infos").innerText = "🔒 Gratuit : 10 sons max / 50 secondes max.";
  }
}

function updateTabs() {
  const tabs = document.getElementById("soundboards-tabs");
  tabs.innerHTML = "";
  Object.keys(soundboards).forEach(name => {
    const btn = document.createElement("button");
    btn.textContent = name;
    btn.onclick = () => {
      currentBoard = name;
      afficherSoundboard();
    };
    if (name === currentBoard) btn.style.fontWeight = "bold";
    tabs.appendChild(btn);
  });
}

function createNewBoard() {
  const name = document.getElementById("new-board-name").value.trim();
  const visibility = document.querySelector('input[name="visibility"]:checked').value;
  const password = document.getElementById("board-password").value.trim();

  if (!name || soundboards[name]) {
    alert("❌ Nom invalide ou déjà utilisé");
    return;
  }

  soundboards[name] = { sons: [], visibility, password };
  currentBoard = name;
  enregistrer();
  updateTabs();
  afficherSoundboard();
}

function enregistrer() {
  localStorage.setItem("soundboards", JSON.stringify(soundboards));
}

function afficherSoundboard() {
  const container = document.getElementById("soundboards-container");
  container.innerHTML = "";

  const board = soundboards[currentBoard];
  if (!board) return;

  board.sons.forEach((son, i) => {
    const div = document.createElement("div");
    div.className = "sound";

    const img = document.createElement("img");
    img.src = son.image || "https://via.placeholder.com/50";

    const btn = document.createElement("button");
    btn.textContent = son.nom;
    btn.onclick = () => {
      const audio = new Audio(son.audio);
      audio.play();
    };

    const del = document.createElement("button");
    del.textContent = "❌";
    del.onclick = () => {
      board.sons.splice(i, 1);
      enregistrer();
      afficherSoundboard();
    };

    div.appendChild(img);
    div.appendChild(btn);
    div.appendChild(del);
    container.appendChild(div);
  });

  const suppr = document.createElement("button");
  suppr.textContent = `🗑️ Supprimer la liste « ${currentBoard} »`;
  suppr.onclick = () => {
    delete soundboards[currentBoard];
    currentBoard = Object.keys(soundboards)[0] || "Default";
    enregistrer();
    updateTabs();
    afficherSoundboard();
  };
  container.appendChild(suppr);
}

function addSound() {
  const name = document.getElementById("sound-name").value.trim();
  const file = document.getElementById("sound-file").files[0];
  const image = document.getElementById("sound-image").files[0];

  if (!name || !file) return alert("❌ Nom ou fichier audio manquant.");
  const maxDur = estPremium() ? MAX_DURATION_PREMIUM : MAX_DURATION_FREE;

  const reader = new FileReader();
  reader.onload = () => {
    const audioURL = reader.result;
    const audio = new Audio(audioURL);
    audio.onloadedmetadata = () => {
      const duration = audio.duration;
      if (duration > maxDur) {
        alert(`⏱️ Le son dure ${Math.round(duration)}s. Max autorisé : ${maxDur}s. Veuillez prendre un fichier plus court.`);
        return;
      }

      const imageReader = new FileReader();
      imageReader.onload = () => {
        const imgURL = image ? imageReader.result : "https://via.placeholder.com/50";
        soundboards[currentBoard].sons.push({ nom: name, audio: audioURL, image: imgURL });
        enregistrer();
        afficherSoundboard();
      };

      if (image) imageReader.readAsDataURL(image);
      else imageReader.onload();
    };
  };
  reader.readAsDataURL(file);
}

function exportJSON() {
  const blob = new Blob([JSON.stringify(soundboards)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "soundboards.json";
  a.click();
}

function importJSON(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      soundboards = JSON.parse(reader.result);
      currentBoard = Object.keys(soundboards)[0] || "Default";
      enregistrer();
      updateTabs();
      afficherSoundboard();
    } catch (e) {
      alert("❌ Erreur de lecture du fichier JSON");
    }
  };
  reader.readAsText(file);
}

// Init
if (premium) {
  document.getElementById("premium-section").style.display = "none";
  document.getElementById("premium-badge").style.display = "inline";
}
afficherPremium();
updateTabs();
afficherSoundboard();
