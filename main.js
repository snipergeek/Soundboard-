
const MAX_DURATION_FREE = 50;
const MAX_DURATION_PREMIUM = 120;
const CODES_VALIDES = ["PREMIUM123", "VIP456", "ULTRA789"];

let premium = localStorage.getItem("premium") === "true";
let currentBoard = "Default";
let soundboards = JSON.parse(localStorage.getItem("soundboards")) || { "Default": [] };

function estPremium() {
  return premium;
}

function activerPremium() {
  const code = document.getElementById("premium-code").value.trim();
  if (CODES_VALIDES.includes(code)) {
    premium = true;
    localStorage.setItem("premium", "true");
    alert("🎉 Premium activé avec succès !");
    afficherPremium();
  } else {
    alert("❌ Code invalide !");
  }
}

function afficherPremium() {
  if (premium) {
    document.getElementById("premium-section").style.display = "none";
    document.getElementById("premium-badge").style.display = "inline";
    document.getElementById("infos").innerText = "✅ Mode Premium activé — Ajoutez des sons jusqu'à 2 minutes.";
  } else {
    document.getElementById("infos").innerText = "🔒 Version gratuite : sons jusqu'à 50 secondes.";
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
  if (!name || soundboards[name]) return alert("Nom invalide ou déjà utilisé");
  soundboards[name] = [];
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
  (soundboards[currentBoard] || []).forEach((son, i) => {
    const div = document.createElement("div");
    div.className = "sound";

    const img = document.createElement("img");
    img.src = son.image || "https://via.placeholder.com/50";

    const btn = document.createElement("button");
    btn.textContent = son.nom;
    btn.onclick = () => {
      const audio = new Audio(son.audio);
      audio.play();
      if (!estPremium() && audio.duration > MAX_DURATION_FREE) {
        setTimeout(() => audio.pause(), MAX_DURATION_FREE * 1000);
      } else if (audio.duration > MAX_DURATION_PREMIUM) {
        setTimeout(() => audio.pause(), MAX_DURATION_PREMIUM * 1000);
      }
    };

    const del = document.createElement("button");
    del.textContent = "❌";
    del.onclick = () => {
      soundboards[currentBoard].splice(i, 1);
      enregistrer();
      afficherSoundboard();
    };

    div.appendChild(img);
    div.appendChild(btn);
    div.appendChild(del);
    container.appendChild(div);
  });
}

function addSound() {
  const name = document.getElementById("sound-name").value.trim();
  const file = document.getElementById("sound-file").files[0];
  const image = document.getElementById("sound-image").files[0];

  if (!name || !file) return alert("Nom ou fichier audio manquant.");

  const readerAudio = new FileReader();
  readerAudio.onload = () => {
    const audioURL = readerAudio.result;
    const audio = new Audio(audioURL);
    audio.onloadedmetadata = () => {
      const duration = audio.duration;
      if (!estPremium() && duration > MAX_DURATION_FREE) {
        alert("⛔ Le son dépasse 50 secondes. Activez Premium pour 2 minutes.");
        return;
      } else if (duration > MAX_DURATION_PREMIUM) {
        alert("⛔ Le son dépasse 2 minutes. Choisissez un fichier plus court.");
        return;
      }

      const readerImage = new FileReader();
      readerImage.onload = () => {
        const imageURL = image ? readerImage.result : "https://via.placeholder.com/50";
        soundboards[currentBoard].push({ nom: name, audio: audioURL, image: imageURL });
        enregistrer();
        afficherSoundboard();
      };

      if (image) readerImage.readAsDataURL(image);
      else readerImage.onload();
    };
  };
  readerAudio.readAsDataURL(file);
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
      alert("Erreur de lecture du fichier JSON");
    }
  };
  reader.readAsText(file);
}

window.onload = () => {
  premium = localStorage.getItem("premium") === "true";
  if (premium) {
    document.getElementById("premium-section").style.display = "none";
    document.getElementById("premium-badge").style.display = "inline";
  }
  afficherPremium();
  updateTabs();
  afficherSoundboard();
};
